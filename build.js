const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy all files from client to public
const clientDir = path.join(__dirname, 'client');
const files = fs.readdirSync(clientDir);

files.forEach(file => {
  const srcPath = path.join(clientDir, file);
  const destPath = path.join(publicDir, file);
  
  const stat = fs.statSync(srcPath);
  if (stat.isFile()) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

console.log('Build complete!');

