const express = require('express');
const path = require('path');
const multer = require('multer'); // For handling file uploads
const fs = require('fs'); // For file operations

const app = express();
const upload = multer(); // No temporary destination; files are kept in memory

// Serve static files (like your HTML/JS) from the 'public' folder
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  const uploadedFile = req.file;
  const originalFileName = uploadedFile.originalname;
  const tempFolderPath = path.join(__dirname, 'temp'); // Path to the 'temp' folder within your project

  const newFilePath = path.join(tempFolderPath, originalFileName);

  // Move the file from memory to the temp folder
  fs.writeFile(newFilePath, uploadedFile.buffer, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error moving file');
    } else {
      res.send('File uploaded and moved to temp folder');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
