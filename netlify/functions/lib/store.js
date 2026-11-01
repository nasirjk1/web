import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';

const STORE_NAME = 'webnasir';
const LOCAL_STORE_DIR = path.resolve(process.cwd(), '.netlify-blobs-data');
const LOCAL_STORE_FILE = path.join(LOCAL_STORE_DIR, 'webnasir.json');

// In-memory / file fallback for local development or non-Netlify preview
let localData = null;

function loadLocalData() {
  if (localData) return localData;
  try {
    if (!fs.existsSync(LOCAL_STORE_DIR)) {
      fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const content = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
      localData = JSON.parse(content);
    } else {
      localData = {};
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(localData, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('Local blob file read error, using in-memory store:', err.message);
    localData = {};
  }
  return localData;
}

function saveLocalData() {
  if (!localData) return;
  try {
    if (!fs.existsSync(LOCAL_STORE_DIR)) {
      fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(localData, null, 2), 'utf8');
  } catch (err) {
    console.warn('Local blob file write error:', err.message);
  }
}

let blobStoreInstance = null;
let useNetlifyNative = null;

function getNativeStore() {
  if (useNetlifyNative === false) return null;
  if (blobStoreInstance) return blobStoreInstance;

  try {
    // Only attempt Netlify Blobs if Netlify environment variables exist
    const hasNetlifyEnv = !!(
      process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
    );

    if (hasNetlifyEnv) {
      blobStoreInstance = getStore(STORE_NAME);
      useNetlifyNative = true;
      return blobStoreInstance;
    } else {
      useNetlifyNative = false;
      return null;
    }
  } catch (err) {
    console.warn('Netlify Blobs not available in current runtime, using persistent file fallback:', err.message);
    useNetlifyNative = false;
    return null;
  }
}

/**
 * Get JSON data for a key
 */
export async function getBlob(key) {
  const store = getNativeStore();
  if (store) {
    try {
      const data = await store.get(key, { type: 'json' });
      return data ?? null;
    } catch (err) {
      console.error(`Error reading blob "${key}" from Netlify Blobs:`, err);
      // Fallback to local
    }
  }

  const local = loadLocalData();
  return local[key] !== undefined ? JSON.parse(JSON.stringify(local[key])) : null;
}

/**
 * Set JSON data for a key
 */
export async function setBlob(key, value) {
  const store = getNativeStore();
  if (store) {
    try {
      await store.setJSON(key, value);
    } catch (err) {
      console.error(`Error saving blob "${key}" to Netlify Blobs:`, err);
    }
  }

  const local = loadLocalData();
  local[key] = JSON.parse(JSON.stringify(value));
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
      console.error(`Error deleting blob "${key}" from Netlify Blobs:`, err);
    }
  }

  const local = loadLocalData();
  delete local[key];
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
      return res.blobs ? res.blobs.map((b) => b.key) : [];
    } catch (err) {
      console.error('Error listing blobs from Netlify Blobs:', err);
    }
  }

  const local = loadLocalData();
  let keys = Object.keys(local);
  if (options.prefix) {
    keys = keys.filter((k) => k.startsWith(options.prefix));
  }
  return keys;
}
