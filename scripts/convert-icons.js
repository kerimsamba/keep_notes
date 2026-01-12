const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if ImageMagick is installed
try {
  execSync('which convert', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: ImageMagick is not installed. Please install it to convert SVG to PNG.');
  console.error('You can install it with: brew install imagemagick');
  process.exit(1);
}

// Define the icon sizes
const sizes = [192, 384, 512];

// Path to icons directory
const iconsDir = path.join(__dirname, '../public/icons');

// Convert SVG to PNG for each size
sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  if (fs.existsSync(svgPath)) {
    try {
      execSync(`convert ${svgPath} ${pngPath}`, { stdio: 'inherit' });
      console.log(`Converted: ${svgPath} -> ${pngPath}`);
    } catch (error) {
      console.error(`Error converting ${svgPath} to PNG:`, error.message);
    }
  } else {
    console.error(`SVG file not found: ${svgPath}`);
  }
});

console.log('Icon conversion complete!'); 