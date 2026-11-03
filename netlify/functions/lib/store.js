import { getStore, connectLambda } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';

const STORE_NAME = 'webnasir';

/**
 * Resolve optional LOCAL_STORAGE_DIR (only used in local dev / self-hosted VPS / Docker).
 * Defaults to `.netlify-blobs-data` where `webnasir.json` is stored.
 * On Netlify Functions, this variable is NOT needed and can be omitted/removed.
 */
function resolveLocalStoreDir() {
  const configuredDir = (process.env.LOCAL_STORAGE_DIR || '.netlify-blobs-data').trim();
  return path.isAbsolute(configuredDir)
    ? configuredDir
    : path.resolve(process.cwd(), configuredDir);
}

const LOCAL_STORE_DIR = resolveLocalStoreDir();
const LOCAL_STORE_FILE = path.join(LOCAL_STORE_DIR, 'webnasir.json');
const TMP_STORE_DIR = '/tmp/.netlify-blobs-data';
const TMP_STORE_FILE = path.join(TMP_STORE_DIR, 'webnasir.json');

// In-memory cache for local/VPS mode and warm Lambda fallback
let localData = null;
let lambdaConnected = false;

/**
 * Detect whether we are running inside a serverless / read-only filesystem environment
 * (Netlify Functions / AWS Lambda).
 */
function isServerlessRuntime() {
  return !!(
    lambdaConnected ||
    process.env.NETLIFY ||
    process.env.NETLIFY_BLOBS_CONTEXT ||
    globalThis.netlifyBlobsContext ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );
}

/**
 * Connect Netlify Lambda event to @netlify/blobs context on each invocation.
 * Without this call, Netlify Functions v1 (exports.handler) throws MissingBlobsEnvironmentError!
 */
export function initBlobEnvironment(event) {
  if (!event) return;
  try {
    if (event.blobs) {
      connectLambda(event);
      lambdaConnected = true;
    }
  } catch (err) {
    console.warn('connectLambda notice:', err.message);
  }
}

function getWritableFilePaths() {
  if (isServerlessRuntime()) {
    return [TMP_STORE_FILE];
  }
  return [LOCAL_STORE_FILE, TMP_STORE_FILE];
}

function loadLocalData() {
  let newestData = localData;
  let newestTs = Number(localData?._updated_at || 0);

  for (const filePath of getWritableFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content && content.trim().length > 2) {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            let fileTs = Number(parsed._updated_at || 0);
            if (!fileTs) {
              try {
                fileTs = Number(fs.statSync(filePath).mtimeMs || 0);
              } catch (_) {
                fileTs = 1;
              }
            }
            if (!newestData || fileTs > newestTs) {
              newestData = parsed;
              newestTs = fileTs;
            }
          }
        }
      }
    } catch (err) {
      // Try next path
    }
  }

  if (newestData) {
    localData = newestData;
    return localData;
  }

  localData = { _updated_at: Date.now(), _key_ts: {} };
  if (!isServerlessRuntime()) {
    saveLocalData();
  }
  return localData;
}

function saveLocalData() {
  if (!localData) return;
  localData._updated_at = Date.now();
  const serialized = JSON.stringify(localData, null, 2);

  // Only write to project directory when NOT in a read-only serverless runtime
  if (!isServerlessRuntime()) {
    try {
      if (!fs.existsSync(LOCAL_STORE_DIR)) {
        fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
      }
      fs.writeFileSync(LOCAL_STORE_FILE, serialized, 'utf8');
    } catch (err) {
      // Fallback to /tmp if project directory is not writable
    }
  }

  // Mirror to /tmp for warm container caching
  try {
    if (!fs.existsSync(TMP_STORE_DIR)) {
      fs.mkdirSync(TMP_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(TMP_STORE_FILE, serialized, 'utf8');
  } catch (err) {
    // Ignore if /tmp not available
  }
}

function getNativeStore() {
  try {
    if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
      return getStore({
        name: STORE_NAME,
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
        consistency: 'strong',
      });
    }

    const hasNetlifyEnv = !!(
      lambdaConnected ||
      process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      globalThis.netlifyBlobsContext
    );

    if (!hasNetlifyEnv) return null;

    return getStore({
      name: STORE_NAME,
      consistency: 'strong',
    });
  } catch (err) {
    return null;
  }
}

/**
 * Get JSON data for a key.
 * - On Netlify Functions (or when Netlify Blobs is configured), reads directly from
 *   Netlify Blobs with strong consistency as the authoritative persistent store.
 * - On self-hosted VPS / Docker / local dev, reads from `.netlify-blobs-data/webnasir.json`.
 */
export async function getBlob(key) {
  const store = getNativeStore();
  if (store) {
    try {
      const data = await store.get(key, { type: 'json', consistency: 'strong' });
      if (data !== null && data !== undefined) {
        const local = loadLocalData();
        local[key] = data;
        return JSON.parse(JSON.stringify(data));
      }
      // Key genuinely does not exist in authoritative Netlify Blobs store
      return null;
    } catch (err) {
      console.warn(`Netlify Blobs read fallback for "${key}":`, err.message);
    }
  }

  const local = loadLocalData();
  return local[key] !== undefined ? JSON.parse(JSON.stringify(local[key])) : null;
}

/**
 * Set JSON data for a key.
 * - Persists directly to Netlify Blobs when available (production Netlify Functions).
 * - Persists to `.netlify-blobs-data/webnasir.json` in local / VPS / Docker mode.
 */
export async function setBlob(key, value) {
  const cloned = value !== undefined ? JSON.parse(JSON.stringify(value)) : null;

  const store = getNativeStore();
  if (store) {
    try {
      await store.setJSON(key, cloned);
    } catch (err) {
      console.error(`Error saving blob "${key}" to Netlify Blobs:`, err.message);
    }
  }

  const local = loadLocalData();
  local[key] = cloned;
  if (!local._key_ts || typeof local._key_ts !== 'object') {
    local._key_ts = {};
  }
  local._key_ts[key] = Date.now();
  saveLocalData();

  return true;
}

/**
 * Delete a key
 */
export async function deleteBlob(key) {
  const store = getNativeStore();
  if (store) {
    try {
      await store.delete(key);
    } catch (err) {
      console.error(`Error deleting blob "${key}" from Netlify Blobs:`, err.message);
    }
  }

  const local = loadLocalData();
  delete local[key];
  if (local._key_ts && typeof local._key_ts === 'object') {
    delete local._key_ts[key];
  }
  saveLocalData();

  return true;
}

/**
 * List all keys or keys with prefix
 */
export async function listBlobs(options = {}) {
  const store = getNativeStore();
  if (store) {
    try {
      const res = await store.list(options);
      if (res && Array.isArray(res.blobs)) {
        return res.blobs.map((b) => b.key);
      }
    } catch (err) {
      console.warn('Error listing blobs from Netlify Blobs:', err.message);
    }
  }

  const local = loadLocalData();
  let keys = Object.keys(local);
  if (options.prefix) {
    keys = keys.filter((k) => k.startsWith(options.prefix));
  }
  return keys;
}
