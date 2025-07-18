const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));      // Serve static files
app.use(express.json());                // Parse JSON from requests

// Route tạo server mới
app.post('/createserver', (req, res) => {
  const serverName = req.body.name;

  // Kiểm tra định dạng tên
  if (!serverName || !serverName.endsWith('.hoatreehub.com')) {
    return res.status(400).json({ error: 'Invalid server name format' });
  }

  const folderPath = path.join(__dirname, 'public', serverName);

  // Kiểm tra nếu đã tồn tại
  if (fs.existsSync(folderPath)) {
    return res.status(400).json({ error: 'Server already exists' });
  }

  // Tạo thư mục cho server
  try {
    fs.mkdirSync(folderPath, { recursive: true });

    // Danh sách các file cần copy
    const templateFiles = ['server.html', 'files.html', 'settings.html'];
    templateFiles.forEach(file => {
      const src = path.join(__dirname, 'public', file);
      const dest = path.join(folderPath, file);
      fs.copyFileSync(src, dest);
    });

    return res.json({ name: serverName });
  } catch (error) {
    console.error("Failed to create server:", error);
    return res.status(500).json({ error: 'Failed to create server' });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
