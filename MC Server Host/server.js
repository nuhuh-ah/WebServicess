const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVERS_DIR = path.join(__dirname, 'servers');
const running = {};

app.use(express.json());
app.use(express.static('public'));
app.use('/servers', express.static(SERVERS_DIR));
if (!fs.existsSync(SERVERS_DIR)) fs.mkdirSync(SERVERS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(SERVERS_DIR, req.params.name, 'files');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Create server
app.post('/api/create', (req, res) => {
  const { name } = req.body;
  if (!name?.endsWith('.hoatreehub.com')) return res.status(400).json({ error: 'Name must end with .hoatreehub.com' });
  const dir = path.join(SERVERS_DIR, name);
  if (fs.existsSync(dir)) return res.status(400).json({ error: 'Exists' });

  fs.mkdirSync(dir);
  fs.mkdirSync(path.join(dir, 'files'));
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({
    version: '1.20',
    type: 'vanilla',
    crack: true
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'console.log'), `[${new Date().toISOString()}] Console Initialized\n`);
  return res.json({ success: true });
});

// Update config
app.post('/api/update/:name', (req, res) => {
  const dir = path.join(SERVERS_DIR, req.params.name);
  if (!fs.existsSync(dir)) return res.status(404).send('Not found');
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'config.json')));
  cfg.version = req.body.version;
  cfg.type = req.body.type;
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(cfg, null, 2));
  res.send('Updated');
});

// Upload mods
app.post('/api/upload/:name', upload.single('file'), (req, res) => {
  res.json({ message: 'Uploaded' });
});

// Start server
app.post('/api/start/:name', (req, res) => {
  const dir = path.join(SERVERS_DIR, req.params.name);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Not exist' });
  if (running[req.params.name]) return res.status(400).json({ error: 'Running' });

  const proc = spawn('java', ['-jar', 'server.jar', 'nogui'], { cwd: dir });
  proc.stdout.on('data', d=> fs.appendFileSync(path.join(dir, 'console.log'), d));
  proc.stderr.on('data', d=> fs.appendFileSync(path.join(dir, 'console.log'), d));
  running[req.params.name] = { proc, lastPing: Date.now() };
  res.json({ message: 'Started' });

  // Auto-stop after 1h idle
  const check = setInterval(()=>{
    if (Date.now() - running[req.params.name].lastPing > 3600000) {
      running[req.params.name].proc.kill();
      clearInterval(check);
      delete running[req.params.name];
    }
  }, 60000);
});

// Stop server
app.post('/api/stop/:name', (req, res) => {
  if (!running[req.params.name]) return res.status(400).json({ error: 'Not running' });
  running[req.params.name].proc.stdin.write('stop\n');
  res.json({ message: 'Stopping' });
});

// Keepalive ping to reset idle timer
app.post('/api/ping/:name', (req, res) => {
  if (running[req.params.name]) running[req.params.name].lastPing = Date.now();
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Run at http://localhost:${PORT}`));
