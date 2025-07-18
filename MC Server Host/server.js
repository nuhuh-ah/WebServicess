const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const SERVERS_DIR = path.join(__dirname, 'servers');

// Ensure servers directory exists
if (!fs.existsSync(SERVERS_DIR)) fs.mkdirSync(SERVERS_DIR);

// GET server list
app.get('/servers', (req, res) => {
  const servers = fs.readdirSync(SERVERS_DIR).filter(name => fs.statSync(path.join(SERVERS_DIR, name)).isDirectory());
  res.json(servers);
});

// POST create new server
app.post('/createserver', (req, res) => {
  const { name, version, type, crack } = req.body;
  const serverPath = path.join(SERVERS_DIR, `${name}.hoatreehub.com`);
  if (fs.existsSync(serverPath)) return res.status(400).json({ error: 'Server already exists' });

  fs.mkdirSync(serverPath);
  fs.writeFileSync(path.join(serverPath, 'info.json'), JSON.stringify({ name, version, type, crack }, null, 2));
  fs.writeFileSync(path.join(serverPath, 'console.log'), '[Console Initialized]\n');
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
