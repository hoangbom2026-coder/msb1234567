const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
      // Exclude env definition file to keep triple-slash references
      if (!filePath.endsWith('vite-env.d.ts')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove block comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single line comments (but NOT triple-slash references)
  // This regex looks for // that are not followed by /
  content = content.replace(/^(?!\s*\/\/\/)\s*\/\/.*$/gm, '');
  
  // Also remove trailing comments on code lines
  // content = content.replace(/(\s+)\/\/.*$/gm, '$1'); // Careful with this, might break strings
  
  // Remove multiple newlines
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(file, content, 'utf8');
});

console.log(`Successfully cleaned ${files.length} files.`);
