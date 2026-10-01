const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

const STRIPS_DIR = path.join(__dirname, 'strips');
const upload = multer({ dest: STRIPS_DIR });

app.use(express.static(__dirname));
app.use(express.json());

app.post('/api/upload-strip', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const ext = path.extname(req.file.originalname) || '.png';
  const fileName = uuidv4() + ext;
  const finalPath = path.join(STRIPS_DIR, fileName);
  const fs = require('fs');
  fs.renameSync(req.file.path, finalPath);
  const host = req.get('host');
  const scheme = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const url = scheme + '://' + host + '/strips/' + fileName;
  res.json({ url, fileName });
});

app.get('/strips/:fileName', (req, res) => {
  res.sendFile(path.join(STRIPS_DIR, req.params.fileName));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Photo booth server running on http://0.0.0.0:' + PORT);
  console.log('Open http://localhost:' + PORT + ' in your browser');
});
