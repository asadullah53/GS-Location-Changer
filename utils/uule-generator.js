/**
 * Google Canonical UULE Generator & Validator
 * Google encodes canonical location strings into a Base64-encoded Protobuf wire format.
 * Protobuf structure:
 *  - Field 1 (varint): 0x08, 0x02 (role: canonical)
 *  - Field 2 (varint): 0x10, 0x20 (producer: 32)
 *  - Field 4 (string): 0x22, [varint UTF-8 byte length], [UTF-8 payload bytes]
 *  - Prefixed with "w+" and standard Base64 encoded.
 */

/**
 * Encodes a canonical location name into Google's official canonical UULE parameter.
 * Handles standard ASCII, international non-ASCII (Urdu, Arabic, German, Spanish, etc.),
 * and handles any string length cleanly with protobuf varints.
 * @param {string} canonicalName - e.g. "New York, New York, United States" or "لاہور, پنجاب, پاکستان"
 * @returns {string} Google UULE string (e.g., "w+CAIQICI...")
 */
function encodeUULE(canonicalName) {
  if (!canonicalName || typeof canonicalName !== 'string') return '';
  const trimmed = canonicalName.trim();
  if (!trimmed) return '';

  const utf8Bytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(trimmed)
    : Buffer.from(trimmed, 'utf8');

  const length = utf8Bytes.length;

  // Encode length as protobuf varint
  const varintBytes = [];
  let tempLen = length;
  while (tempLen >= 0x80) {
    varintBytes.push((tempLen & 0x7F) | 0x80);
    tempLen >>>= 7;
  }
  varintBytes.push(tempLen & 0x7F);

  // Wire format: header + varint length + utf8 bytes
  const header = [0x08, 0x02, 0x10, 0x20, 0x22];
  const fullBytes = new Uint8Array(header.length + varintBytes.length + utf8Bytes.length);
  fullBytes.set(header, 0);
  fullBytes.set(varintBytes, header.length);
  fullBytes.set(utf8Bytes, header.length + varintBytes.length);

  // Convert to Base64
  let base64 = '';
  if (typeof btoa === 'function') {
    let binary = '';
    const len = fullBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(fullBytes[i]);
    }
    base64 = btoa(binary);
  } else {
    base64 = Buffer.from(fullBytes).toString('base64');
  }

  return 'w+' + base64;
}

/**
 * Decodes and strictly validates a Google UULE parameter back to readable canonical location text.
 * Returns null if the header, length byte, or payload is corrupt or invalid.
 * @param {string} uuleString - Full UULE parameter (e.g. "w+CAIQICI...")
 * @returns {string|null} Decoded canonical location text, or null if invalid/corrupt
 */
function decodeUULE(uuleString) {
  if (!uuleString || typeof uuleString !== 'string') return null;
  const trimmed = uuleString.trim();
  if (!trimmed.startsWith('w+')) return null;

  try {
    const rawB64 = trimmed.slice(2);
    let bytes;
    if (typeof atob === 'function') {
      const binary = atob(rawB64);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      bytes = Buffer.from(rawB64, 'base64');
    }

    // Verify protobuf header [0x08, 0x02, 0x10, 0x20, 0x22]
    if (bytes.length < 6 ||
        bytes[0] !== 0x08 || bytes[1] !== 0x02 ||
        bytes[2] !== 0x10 || bytes[3] !== 0x20 ||
        bytes[4] !== 0x22) {
      return null;
    }

    // Read varint length
    let idx = 5;
    let declaredLength = 0;
    let shift = 0;
    while (idx < bytes.length) {
      const b = bytes[idx++];
      declaredLength |= (b & 0x7F) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }

    const payloadBytes = bytes.subarray(idx, idx + declaredLength);
    // Strict length validation (UUL-04: reject corrupt or truncated UULE)
    if (payloadBytes.length !== declaredLength) {
      return null;
    }

    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(payloadBytes);
    } else {
      return Buffer.from(payloadBytes).toString('utf8');
    }
  } catch (err) {
    return null;
  }
}

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { encodeUULE, decodeUULE };
}
