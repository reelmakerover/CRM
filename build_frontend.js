const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const clientDir = path.join(root, 'client');
const clientBuild = path.join(clientDir, 'build');
const publicDir = path.join(root, 'public');
const staticDir = path.join(root, 'static');

console.log('🚀 Starting React production build with optimizations...');

try {
  execSync('npx react-scripts build', {
    cwd: clientDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GENERATE_SOURCEMAP: 'false',
      CI: 'false'
    }
  });

  console.log('✅ React build successful!');

  // Sync into root public and static
  if (fs.existsSync(clientBuild)) {
    console.log('📦 Syncing client/build to public/ and static/ ...');
    
    function copyRecursive(src, dest) {
      if (!fs.existsSync(src)) return;
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(item => {
          copyRecursive(path.join(src, item), path.join(dest, item));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }

    copyRecursive(clientBuild, publicDir);
    if (fs.existsSync(path.join(clientBuild, 'static'))) {
      copyRecursive(path.join(clientBuild, 'static'), staticDir);
    }
    if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
      fs.copyFileSync(path.join(clientBuild, 'index.html'), path.join(root, 'index.html'));
    }
    console.log('🎉 Production frontend synchronized successfully!');
  }
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
}
