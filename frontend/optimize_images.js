const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directories = ['frontend/public', 'admin/public'];

async function processImages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processImages(fullPath);
    } else if (file.match(/\.(png|jpg|jpeg)$/i)) {
      const tempPath = fullPath + '.tmp';
      try {
        if (file.match(/\.(png)$/i)) {
          await sharp(fullPath).png({ quality: 75, compressionLevel: 9 }).toFile(tempPath);
        } else {
          await sharp(fullPath).jpeg({ quality: 75 }).toFile(tempPath);
        }
        
        const oldSize = stat.size;
        const newSize = fs.statSync(tempPath).size;
        
        if (newSize < oldSize) {
          fs.renameSync(tempPath, fullPath);
          console.log(`Optimized ${fullPath}: ${Math.round(oldSize/1024)}KB -> ${Math.round(newSize/1024)}KB`);
        } else {
          fs.unlinkSync(tempPath);
          console.log(`Skipped ${fullPath} (No reduction)`);
        }
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }
  }
}

async function run() {
  for (const dir of directories) {
    console.log(`Processing directory: ${dir}`);
    await processImages(dir);
  }
}

run();
