const fs = require('fs');
const path = require('path');

// Define the icon sizes
const sizes = [192, 384, 512];

// Function to create a simple SVG icon with text
function createSVGIcon(size, text) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#000000"/>
    <text x="50%" y="50%" font-family="Arial" font-size="${size / 8}px" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
}

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
  const svg = createSVGIcon(size, `PWA ${size}x${size}`);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created icon: ${filePath}`);
});

console.log('Icon generation complete!');
console.log('Note: For production, replace these placeholder SVGs with proper PNG icons.'); 