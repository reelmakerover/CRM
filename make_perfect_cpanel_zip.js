const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const serverDir = path.join(root, 'server');
const tempDir = path.join(root, 'temp_cpanel_deploy');

// 1. Create clean temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// 2. Copy all files/folders from server into temp_cpanel_deploy
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      // Exclude node_modules to keep zip lightweight
      if (childItemName === 'node_modules') return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying server files to temp deployment folder...');
copyRecursiveSync(serverDir, tempDir);

const zipName = 'FINAL_CPANEL_DEPLOY.zip';
const targetZip = path.join(root, zipName);
const desktopZip = path.join(process.env.USERPROFILE || 'C:\\Users\\PC', 'Desktop', zipName);

// Remove old zips
if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);
if (fs.existsSync(desktopZip)) fs.unlinkSync(desktopZip);

// 3. Compress temp_cpanel_deploy/* into FINAL_CPANEL_DEPLOY.zip
console.log('Zipping files into FINAL_CPANEL_DEPLOY.zip...');
execSync(`powershell -Command "Compress-Archive -Path 'temp_cpanel_deploy\\*' -DestinationPath '${zipName}' -Force"`, { cwd: root });

// 4. Copy zip to Desktop
if (fs.existsSync(targetZip)) {
  fs.copyFileSync(targetZip, desktopZip);
  const sizeMB = (fs.statSync(targetZip).size / (1024 * 1024)).toFixed(2);
  console.log(`SUCCESS! Created ${zipName} (${sizeMB} MB)`);
  console.log(`Copied to Desktop: ${desktopZip}`);
}

// 5. Clean up temp folder
fs.rmSync(tempDir, { recursive: true, force: true });
