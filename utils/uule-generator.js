/**
 * Google UULE Generator & Decoder
 * Standardized canonical location encoding used by Google Search for Local SEO.
 * Format: "w+CAIQICI" + [Length Key Character] + [Base64 Encoded Canonical String]
 */

const UULE_LOOKUP_TABLE = 
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const UULE_PREFIX = 'w+CAIQICI';

/**
 * Encodes a canonical location name into Google's UULE parameter.
 * Example: "New York, New York, United States" -> "w+CAIQICIlTmV3IFlvcmssIE5ldyBZb3JrLCBVbml0ZWQgU3RhdGVz"
 * @param {string} canonicalName - City, State, Country or Canonical Name
 * @returns {string} The full UULE parameter value (e.g., "w+CAIQICI...")
 */
function encodeUULE(canonicalName) {
  if (!canonicalName || typeof canonicalName !== 'string') return '';
  const trimmed = canonicalName.trim();
  if (!trimmed) return '';

  const length = trimmed.length;
  if (length >= UULE_LOOKUP_TABLE.length) {
    console.warn(`Location string length (${length}) is large for single-byte UULE key.`);
  }

  const lengthChar = UULE_LOOKUP_TABLE[length] || 'a';
  const base64Str = typeof btoa === 'function' 
    ? btoa(unescape(encodeURIComponent(trimmed))) 
    : Buffer.from(trimmed, 'utf8').toString('base64');

  return `${UULE_PREFIX}${lengthChar}${base64Str}`;
}

/**
 * Decodes a Google UULE parameter back to readable canonical location text.
 * @param {string} uuleString - Full UULE parameter (e.g. "w+CAIQICI...")
 * @returns {string|null} Decoded text or null if invalid
 */
function decodeUULE(uuleString) {
  if (!uuleString || typeof uuleString !== 'string') return null;
  const trimmed = uuleString.trim();
  
  if (!trimmed.startsWith(UULE_PREFIX)) {
    return null;
  }

  const payload = trimmed.slice(UULE_PREFIX.length + 1); // skip prefix + 1 length char
  try {
    const decoded = typeof atob === 'function'
      ? decodeURIComponent(escape(atob(payload)))
      : Buffer.from(payload, 'base64').toString('utf8');
    return decoded;
  } catch (err) {
    console.error('Failed to decode UULE parameter:', err);
    return null;
  }
}

// Export for ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { encodeUULE, decodeUULE, UULE_LOOKUP_TABLE, UULE_PREFIX };
}
