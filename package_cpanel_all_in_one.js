const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const clientBuild = path.join(root, 'client', 'build');
const serverDir = path.join(root, 'server');
const serverPublic = path.join(serverDir, 'public');
const tempDeployDir = path.join(root, 'cpanel_standalone_deploy');

console.log('1. Copying client/build to server/public...');
if (fs.existsSync(serverPublic)) {
  fs.rmSync(serverPublic, { recursive: true, force: true });
}
fs.mkdirSync(serverPublic, { recursive: true });

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      if (childItemName === 'node_modules') return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(clientBuild, serverPublic);
console.log('✅ Client build copied into server/public');

// 2. Prepare temp deploy folder
if (fs.existsSync(tempDeployDir)) {
  fs.rmSync(tempDeployDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDeployDir, { recursive: true });

copyRecursiveSync(serverDir, tempDeployDir);

// 3. Create .htaccess in temp deploy directory for cPanel/Apache fallback
const htaccessContent = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # Pass API & uploads to Node or let Express handle everything
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
fs.writeFileSync(path.join(tempDeployDir, '.htaccess'), htaccessContent.trim());

// 4. Create ZIP
const zipName = 'CRM_CPANEL_ALL_IN_ONE.zip';
const targetZip = path.join(root, zipName);
const desktopZip = path.join(process.env.USERPROFILE || 'C:\\Users\\PC', 'Desktop', zipName);

if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);
if (fs.existsSync(desktopZip)) fs.unlinkSync(desktopZip);

console.log(`Zipping ${tempDeployDir} to ${zipName}...`);
execSync(`powershell -Command "Compress-Archive -Path 'cpanel_standalone_deploy\\*' -DestinationPath '${zipName}' -Force"`, { cwd: root });

if (fs.existsSync(targetZip)) {
  fs.copyFileSync(targetZip, desktopZip);
  const sizeMB = (fs.statSync(targetZip).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! Created ${zipName} (${sizeMB} MB)`);
  console.log(`📁 File is ready on your Desktop: ${desktopZip}`);
}

// Clean up temp deploy folder
fs.rmSync(tempDeployDir, { recursive: true, force: true });
