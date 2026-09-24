/**
 * GS Location Changer - Production Build & Packaging Script
 * 
 * Prepares clean production build folder (`build/`) and generates
 * Chrome Web Store compliant package (`dist/GS-Location-Changer-vX.X.X.zip`).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const MANIFEST_PATH = path.join(ROOT_DIR, 'manifest.json');

// Verify manifest exists and parse version
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Error: manifest.json not found in root directory.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const version = manifest.version;

if (!version) {
  console.error('❌ Error: No version field found in manifest.json.');
  process.exit(1);
}

console.log(`🚀 Building GS Location Changer v${version}...`);

// Clean previous build directory
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Items to include in production build
const PRODUCTION_ITEMS = [
  'manifest.json',
  'background',
  'content',
  'data',
  'icons',
  'popup',
  'utils',
  'CHANGELOG.md',
  'LICENSE',
  'PRIVACY_POLICY.md',
  'README.md'
];

// Helper to copy files and directories recursively
function copyItem(sourceRelative) {
  const src = path.join(ROOT_DIR, sourceRelative);
  const dest = path.join(BUILD_DIR, sourceRelative);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Warning: Expected item "${sourceRelative}" not found, skipping.`);
    return;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all production items to build/
for (const item of PRODUCTION_ITEMS) {
  copyItem(item);
}

console.log(`✅ Clean production folder created at: ${BUILD_DIR}`);

// Target zip file path
const zipFileName = `GS-Location-Changer-v${version}.zip`;
const zipFilePath = path.join(DIST_DIR, zipFileName);

// Remove existing zip if present
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

console.log(`📦 Packaging production files into: ${zipFilePath}...`);

try {
  // Use PowerShell Compress-Archive to ensure valid zip structure with root manifest
  const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${BUILD_DIR}\\*' -DestinationPath '${zipFilePath}' -Force"`;
  execSync(psCommand, { stdio: 'inherit' });
  console.log(`✅ ZIP package created successfully: ${zipFileName}`);
} catch (err) {
  console.error('❌ Failed to create zip via PowerShell, trying fallback...', err.message);
  try {
    // Fallback: tar -a -c -f output.zip -C build .
    execSync(`tar -a -c -f "${zipFilePath}" -C "${BUILD_DIR}" .`, { stdio: 'inherit' });
    console.log(`✅ ZIP package created successfully via tar fallback: ${zipFileName}`);
  } catch (tarErr) {
    console.error('❌ Error creating zip file:', tarErr.message);
    process.exit(1);
  }
}

// Verify zip file contents
try {
  const inspectOutput = execSync(`tar -tf "${zipFilePath}"`, { encoding: 'utf8' });
  const hasManifest = inspectOutput.includes('manifest.json');
  if (hasManifest) {
    console.log('✅ Archive verification passed: manifest.json is present at root.');
  } else {
    console.error('❌ Archive verification failed: manifest.json is NOT at root.');
    process.exit(1);
  }
} catch (e) {
  console.warn('⚠️ Note: Could not verify archive contents automatically, please check zip manually.');
}

console.log(`\n🎉 Production build ready!`);
console.log(`📁 Unpacked Build Folder: ${BUILD_DIR}`);
console.log(`📦 Chrome Web Store Zip: ${zipFilePath}\n`);
