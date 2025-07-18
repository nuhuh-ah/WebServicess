const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exec, spawn } = require('child_process');

const app = express();
const port = 3000;
const serversDir = path.join(__dirname, 'servers');
const runningServers = {};

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/servers', express.static('servers'));

if (!fs.existsSync(serversDir)) fs.mkdirSync(serversDir);

// Tạo server
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

// Start server (giả lập chạy file run.sh hoặc run.bat)
app.post('/startserver', (req, res) => {
  const { name } = req.body;
  const serverPath = path.join(serversDir, name);
  const jarPath = path.join(serverPath, 'server.jar');

  if (!fs.existsSync(serverPath)) {
    return res.status(404).json({ error: 'Server not found' });
  }

  if (runningServers[name]) {
    return res.status(400).json({ error: 'Server already running' });
  }

  const process = spawn('java', ['-jar', 'server.jar', 'nogui'], {
    cwd: serverPath
  });

  runningServers[name] = process;

  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data}`);
  });

  process.on('exit', (code) => {
    console.log(`[${name}] Server exited with code ${code}`);
    delete runningServers[name];
  });

  res.json({ status: 'started' });
});

// Stop server
app.post('/stopserver', (req, res) => {
  const { name } = req.body;
  const proc = runningServers[name];

  if (!proc) return res.status(400).json({ error: 'Server is not running' });

  proc.stdin.write('stop\n');
  res.json({ status: 'stopping' });
});

// Xem console logs
app.get('/serverconsole/:name', (req, res) => {
  const name = req.params.name;
  const proc = runningServers[name];
  if (!proc) return res.status(400).json({ error: 'Server not running' });
  res.json({ status: 'running' });
});

// Gửi file HTML
app.get('/:servername/server.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'server.html'));
});

app.get('/:servername/server.html/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'files.html'));
});

app.get('/:servername/server.html/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
