// server.js (Full updated with routes for files.html and settings.html)

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;
const serversDir = path.join(__dirname, 'servers');

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/servers', express.static('servers'));

if (!fs.existsSync(serversDir)) fs.mkdirSync(serversDir);

app.post('/createserver', (req, res) => {
  const { name } = req.body;
  if (!name || !name.endsWith('.hoatreehub.com')) {
    return res.status(400).json({ error: 'Invalid server name' });
  }
  const safeName = name.replace(/[^a-zA-Z0-9.-]/g, '');
  const serverPath = path.join(serversDir, safeName);

  if (fs.existsSync(serverPath)) {
    return res.status(400).json({ error: 'Server already exists' });
  }

  fs.mkdirSync(serverPath);
  fs.mkdirSync(path.join(serverPath, 'files'));
  fs.writeFileSync(path.join(serverPath, 'config.json'), JSON.stringify({
    version: '1.20',
    type: 'vanilla',
    crack: true
  }, null, 2));

  res.json({ name: safeName });
});

app.get('/:servername/server.html', (req, res) => {
  const servername = req.params.servername;
  res.sendFile(path.join(__dirname, 'public', 'server.html'));
});

app.get('/:servername/server.html/files', (req, res) => {
  const servername = req.params.servername;
  res.sendFile(path.join(__dirname, 'public', 'files.html'));
});

app.get('/:servername/server.html/settings', (req, res) => {
  const servername = req.params.servername;
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
