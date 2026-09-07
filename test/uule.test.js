const assert = require('assert');
const { encodeUULE, decodeUULE } = require('../utils/uule-generator.js');

console.log('Running UULE Test Suite...');

// 1. Standard ASCII locations
const asciiTests = [
  'New York, New York, United States',
  'London, England, United Kingdom',
  'Tokyo, Tokyo, Japan',
  'Sydney, New South Wales, Australia'
];

asciiTests.forEach(loc => {
  const encoded = encodeUULE(loc);
  assert(encoded.startsWith('w+CAIQIC'), `Encoded string should start with w+CAIQIC: ${encoded}`);
  const decoded = decodeUULE(encoded);
  assert.strictEqual(decoded, loc, `Roundtrip failed for ASCII: ${loc}`);
});
console.log('✔ ASCII roundtrips passed');

// 2. Non-ASCII international locations (Urdu, Arabic, German, Spanish)
const intlTests = [
  'لاہور, پنجاب, پاکستان',
  'دبي, دبي, الإمارات العربية المتحدة',
  'München, Bayern, Germany',
  'São Paulo, São Paulo, Brazil',
  '北京市, 北京市, 中国'
];

intlTests.forEach(loc => {
  const encoded = encodeUULE(loc);
  const decoded = decodeUULE(encoded);
  assert.strictEqual(decoded, loc, `Roundtrip failed for International: ${loc}`);
});
console.log('✔ Non-ASCII international roundtrips passed');

// 3. Boundary & Long strings (> 64 characters)
const longLoc = 'A very detailed canonical location string that easily surpasses the historical 64-character boundary to test protobuf varints safely';
const encLong = encodeUULE(longLoc);
const decLong = decodeUULE(encLong);
assert.strictEqual(decLong, longLoc, 'Roundtrip failed for long location string');
console.log('✔ Long string (>64 chars) roundtrip passed');

// 4. Corrupt UULE rejection (UUL-04)
const corruptUule = 'w+CAIQICIlTmV3IFlvcmssIE5ldyBZb3JrLCBVbml0ZWQgU3RhdGVz'; // Corrupt declared length 37 vs 33
const corruptResult = decodeUULE(corruptUule);
assert.strictEqual(corruptResult, null, 'Corrupt UULE should return null upon decode validation');
console.log('✔ Corrupted UULE rejection validation passed');

// 5. Empty / Invalid inputs
assert.strictEqual(encodeUULE(''), '');
assert.strictEqual(encodeUULE(null), '');
assert.strictEqual(decodeUULE(''), null);
assert.strictEqual(decodeUULE('invalid_random_string'), null);
console.log('✔ Edge cases and invalid inputs passed');

console.log('\nALL UULE UNIT TESTS PASSED SUCCESSFULLY! (5/5)');
