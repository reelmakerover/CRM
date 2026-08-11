const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const zipFileName = 'DS_EDUCATION_CPANEL_READY.zip';
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\PC', 'Desktop', zipFileName);
const rootZipPath = path.join(root, zipFileName);

const zipTempDir = path.join(root, 'FINAL_SYNCED_DEPLOY');
if (fs.existsSync(zipTempDir)) fs.rmSync(zipTempDir, { recursive: true, force: true });
fs.mkdirSync(zipTempDir, { recursive: true });

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      if (item === 'node_modules' || item === '.git' || item.endsWith('.zip')) return;
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Sync client/build into root public and static
const clientBuild = path.join(root, 'client', 'build');
if (fs.existsSync(clientBuild)) {
  console.log('Syncing latest client build to public/ and static/ ...');
  copyRecursive(clientBuild, path.join(root, 'public'));
  if (fs.existsSync(path.join(clientBuild, 'static'))) {
    copyRecursive(path.join(clientBuild, 'static'), path.join(root, 'static'));
  }
  if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
    fs.copyFileSync(path.join(clientBuild, 'index.html'), path.join(root, 'index.html'));
  }
}

const items = [
  'public', 'static', 'config', 'controllers', 'middleware', 'models', 'routes', 'uploads', 'utils',
  'index.js', 'index.html', 'package.json', '.htaccess', '.env', 'database.sqlite', 'seed.js', 'seed_lectures.js', 'seed_teacher_portal.js', 'seed_chapter_tests.js'
];

items.forEach(item => {
  const srcPath = path.join(root, item);
  const destPath = path.join(zipTempDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
  }
});

if (fs.existsSync(desktopPath)) fs.unlinkSync(desktopPath);
if (fs.existsSync(rootZipPath)) fs.unlinkSync(rootZipPath);

console.log(`Compressing ${zipFileName}...`);
execSync(`powershell -Command "Compress-Archive -Path 'FINAL_SYNCED_DEPLOY\\*' -DestinationPath '${rootZipPath}' -Force"`, { cwd: root });

if (fs.existsSync(rootZipPath)) {
  fs.copyFileSync(rootZipPath, desktopPath);
  const sizeMB = (fs.statSync(rootZipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! Created ${zipFileName} (${sizeMB} MB)`);
  console.log(`📁 File is ready on your Desktop: ${desktopPath}`);
}

fs.rmSync(zipTempDir, { recursive: true, force: true });
