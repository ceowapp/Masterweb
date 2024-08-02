const fs = require('fs');
const path = require('path');

const imageDir = './QR/images/barcode/3x3'; // Relative path to the image directory
const prefix = 'barcode '; // Prefix for the keys in the object, including space

const barcodeImg = {};

fs.readdirSync(imageDir)
  .filter(file => path.extname(file).toLowerCase() === '.png') // Filter only PNG files
  .map(file => ({
    name: file,
    number: parseInt(file.replace(/[^0-9]/g, ''), 10) // Extract numeric part
  }))
  .sort((a, b) => a.number - b.number)
  .forEach(({ name, number }) => {
    const key = `${prefix}${number}`;
    barcodeImg[key] = `${imageDir.replace(/\\/g, '/')}/${name}`;
  });

console.log('const barcodeImg =', JSON.stringify(barcodeImg, null, 2), ';');
