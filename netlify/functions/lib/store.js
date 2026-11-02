import { getStore, connectLambda } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';

const STORE_NAME = 'webnasir';
const LOCAL_STORE_DIR = path.resolve(process.cwd(), '.netlify-blobs-data');
const LOCAL_STORE_FILE = path.join(LOCAL_STORE_DIR, 'webnasir.json');
const TMP_STORE_DIR = '/tmp/.netlify-blobs-data';
const TMP_STORE_FILE = path.join(TMP_STORE_DIR, 'webnasir.json');

// In-memory cache synchronized with disk / Netlify Blobs
let localData = null;
let lambdaConnected = false;

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
  return [TMP_STORE_FILE, LOCAL_STORE_FILE];
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
  saveLocalData();
  return localData;
}

function saveLocalData() {
  if (!localData) return;
  localData._updated_at = Date.now();
  const serialized = JSON.stringify(localData, null, 2);

  // Attempt primary project directory first (writable in dev / Node server)
  try {
    if (!fs.existsSync(LOCAL_STORE_DIR)) {
      fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_FILE, serialized, 'utf8');
  } catch (err) {
    // In serverless /var/task is read-only; /tmp is always writable
  }

  // Always mirror to /tmp for serverless container persistence across warm invocations
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
    const hasNetlifyEnv = !!(
      lambdaConnected ||
      process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
    );

    if (!hasNetlifyEnv) return null;

    if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
      return getStore({
        name: STORE_NAME,
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
      });
    }

    return getStore(STORE_NAME);
  } catch (err) {
    return null;
  }
}

/**
 * Get JSON data for a key
 */
export async function getBlob(key) {
  const local = loadLocalData();
  const store = getNativeStore();
  if (store) {
    try {
      const data = await store.get(key, { type: 'json' });
      if (data !== null && data !== undefined) {
        local[key] = data;
        return JSON.parse(JSON.stringify(data));
      }
    } catch (err) {
      console.warn(`Netlify Blobs read fallback for "${key}":`, err.message);
    }
  }

  return local[key] !== undefined ? JSON.parse(JSON.stringify(local[key])) : null;
}

/**
 * Set JSON data for a key
 */
export async function setBlob(key, value) {
  const cloned = value !== undefined ? JSON.parse(JSON.stringify(value)) : null;

  // Always update local/tmp file store first and stamp timestamp
  const local = loadLocalData();
  local[key] = cloned;
  if (!local._key_ts || typeof local._key_ts !== 'object') {
    local._key_ts = {};
  }
  local._key_ts[key] = Date.now();
  saveLocalData();

  const store = getNativeStore();
  if (store) {
    try {
      await store.setJSON(key, cloned);
    } catch (err) {
      console.error(`Error saving blob "${key}" to Netlify Blobs:`, err.message);
    }
  }

  return true;
}

/**
 * Delete a key
 */
export async function deleteBlob(key) {
  const local = loadLocalData();
  delete local[key];
  if (local._key_ts && typeof local._key_ts === 'object') {
    delete local._key_ts[key];
  }
  saveLocalData();

  const store = getNativeStore();
  if (store) {
    try {
      await store.delete(key);
    } catch (err) {
      console.error(`Error deleting blob "${key}" from Netlify Blobs:`, err.message);
    }
  }

  return true;
}

/**
 * List all keys or keys with prefix
 */
export async function listBlobs(options = {}) {
  const local = loadLocalData();
  const keySet = new Set(Object.keys(local));

  const store = getNativeStore();
  if (store) {
    try {
      const res = await store.list(options);
      if (res && Array.isArray(res.blobs)) {
        res.blobs.forEach((b) => keySet.add(b.key));
      }
    } catch (err) {
      console.warn('Error listing blobs from Netlify Blobs:', err.message);
    }
  }

  let keys = Array.from(keySet);
  if (options.prefix) {
    keys = keys.filter((k) => k.startsWith(options.prefix));
  }
  return keys;
}
