const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'client', 'build');
const dest = path.join(__dirname, 'server', 'public');

function copyRecursiveSync(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.readdirSync(srcDir).forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyRecursiveSync(src, dest);
console.log('✅ Synchronized client/build into server/public successfully!');
