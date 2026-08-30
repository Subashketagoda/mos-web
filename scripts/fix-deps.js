const fs = require('fs');
const path = require('path');

const nmDir = path.join(__dirname, '..', 'node_modules');

function syncRecursive(currentDir) {
  if (!fs.existsSync(currentDir)) return;
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) {
        // e.g. .fs.walk-I32itSto -> fs.walk
        const match = entry.name.match(/^\.([a-zA-Z0-9_\-\.@]+?)-[a-zA-Z0-9]{8}$/);
        if (match) {
          const realName = match[1];
          const targetDir = path.join(currentDir, realName);

          try {
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            const innerItems = fs.readdirSync(fullPath);
            for (const item of innerItems) {
              const srcItemPath = path.join(fullPath, item);
              const tgtItemPath = path.join(targetDir, item);
              fs.cpSync(srcItemPath, tgtItemPath, { recursive: true, force: true });
            }
            console.log(`Copied ${entry.name} -> ${realName} in ${path.relative(nmDir, currentDir)}`);
          } catch (e) {
            console.error(`Error copying ${entry.name}:`, e.message);
          }
        }
      } else {
        syncRecursive(fullPath);
      }
    }
  }
}

syncRecursive(nmDir);
console.log('Deep sync finished.');
