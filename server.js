const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

const STRIPS_DIR = path.join(__dirname, 'strips');
if (!fs.existsSync(STRIPS_DIR)) { fs.mkdirSync(STRIPS_DIR, { recursive: true }); }

const upload = multer({ dest: STRIPS_DIR });

app.use(express.static(__dirname));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/upload-strip', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const ext = path.extname(req.file.originalname) || '.png';
  const fileName = uuidv4() + ext;
  const finalPath = path.join(STRIPS_DIR, fileName);
  fs.renameSync(req.file.path, finalPath);
  const host = req.get('host');
  const scheme = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const url = scheme + '://' + host + '/strips/' + fileName;
  res.json({ url, fileName });
});

app.get('/strips/:fileName', (req, res) => {
  const filePath = path.join(STRIPS_DIR, req.params.fileName);
  if (!fs.existsSync(filePath)) { return res.status(404).send('Not found'); }
  res.sendFile(filePath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Photo booth server running on http://0.0.0.0:' + PORT);
  console.log('Open http://localhost:' + PORT + ' in your browser');
});
