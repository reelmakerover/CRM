const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const zipFileName = 'DS_EDUCATION_CPANEL_FULL_PACKAGE.zip';
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\PC', 'Desktop', zipFileName);
const rootZipPath = path.join(root, zipFileName);

const zipTempDir = path.join(root, 'FINAL_SYNCED_DEPLOY');
if (fs.existsSync(zipTempDir)) fs.rmSync(zipTempDir, { recursive: true, force: true });
fs.mkdirSync(zipTempDir, { recursive: true });

function copyRecursive(src, dest, includeNodeModules = true) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      if (item === '.git' || item.endsWith('.zip')) return;
      if (!includeNodeModules && item === 'node_modules') return;
      copyRecursive(path.join(src, item), path.join(dest, item), includeNodeModules);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Sync client/build into root public and static
const clientBuild = path.join(root, 'client', 'build');
if (fs.existsSync(clientBuild)) {
  console.log('Syncing latest client build to public/ and static/ ...');
  copyRecursive(clientBuild, path.join(root, 'public'), false);
  if (fs.existsSync(path.join(clientBuild, 'static'))) {
    copyRecursive(path.join(clientBuild, 'static'), path.join(root, 'static'), false);
  }
  if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
    fs.copyFileSync(path.join(clientBuild, 'index.html'), path.join(root, 'index.html'));
  }
}

const items = [
  'public', 'static', 'config', 'controllers', 'middleware', 'models', 'routes', 'uploads', 'utils', 'node_modules',
  'index.js', 'index.html', 'package.json', '.htaccess', '.env', 'database.sqlite', 'seed.js', 'seed_lectures.js', 'seed_teacher_portal.js', 'seed_chapter_tests.js'
];

console.log('Copying production files & node_modules into package bundle...');
items.forEach(item => {
  const srcPath = path.join(root, item);
  const destPath = path.join(zipTempDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath, true);
  }
});

if (fs.existsSync(desktopPath)) fs.unlinkSync(desktopPath);
if (fs.existsSync(rootZipPath)) fs.unlinkSync(rootZipPath);

console.log(`Compressing ${zipFileName}... (Includes pre-installed node_modules - No cPanel npm install required!)`);
execSync(`powershell -Command "Compress-Archive -Path 'FINAL_SYNCED_DEPLOY\\*' -DestinationPath '${rootZipPath}' -Force"`, { cwd: root });

if (fs.existsSync(rootZipPath)) {
  fs.copyFileSync(rootZipPath, desktopPath);
  const sizeMB = (fs.statSync(rootZipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! Created ${zipFileName} (${sizeMB} MB)`);
  console.log(`📁 Ready on your Desktop: ${desktopPath}`);
}

fs.rmSync(zipTempDir, { recursive: true, force: true });
