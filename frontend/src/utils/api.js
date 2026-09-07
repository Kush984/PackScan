/**
 * Resilient API Fetch Helper for PackScan
 * - Calls the standard relative URL (e.g. /api/scan/multi-evidence)
 * - Automatically falls back to http://localhost:5001 if Vite dev server proxy returns 500/502/504 or encounters EPERM/connection errors
 * - Prevents cryptic "Scan processing failed (Status: 500)" errors for users
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(endpoint, options = {}) {
  const url = BASE_URL ? `${BASE_URL.replace(/\/$/, '')}${endpoint}` : endpoint;
  const isRelative = endpoint.startsWith('/') && !BASE_URL;
  let res;
  let usedFallback = false;

  try {
    res = await fetch(url, options);
  } catch (err) {
    if (isRelative) {
      try {
        usedFallback = true;
        res = await fetch(`http://localhost:5001${endpoint}`, options);
      } catch (fallbackErr) {
        throw new Error(`Unable to connect to PackScan server: ${err.message}`);
      }
    } else {
      throw err;
    }
  }

  // If relative path returned 500, 502, or 504, check if it was a Vite dev proxy error (e.g. EPERM / ECONNREFUSED)
  if (isRelative && !usedFallback && res && (res.status === 500 || res.status === 502 || res.status === 504)) {
    try {
      const cloned = res.clone();
      const bodyText = await cloned.text();
      // Detect proxy connection failures
      if (
        bodyText.includes('connect EPERM') ||
        bodyText.includes('ECONNREFUSED') ||
        bodyText.includes('proxy error') ||
        bodyText.includes('Internal Server Error') ||
        !bodyText.trim()
      ) {
        const directRes = await fetch(`http://localhost:5001${endpoint}`, options);
        if (directRes.ok || directRes.status < 500) {
          return directRes;
        }
      }
    } catch (_) {}
  }

  return res;
}
