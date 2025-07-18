const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// Routes for HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/server", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "server.html"));
});

app.get("/files", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "files.html"));
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "settings.html"));
});

// API: Create Minecraft server
app.post("/api/create-server", (req, res) => {
  const { name, version, type, cracked } = req.body;

  if (!name || !name.endsWith(".hoatreehub.com")) {
    return res.status(400).json({ error: "Invalid server name." });
  }

  const serverPath = path.join(__dirname, "servers", name);
  if (fs.existsSync(serverPath)) {
    return res.status(400).json({ error: "Server already exists." });
  }

  try {
    fs.mkdirSync(serverPath, { recursive: true });

    // Create server settings file
    fs.writeFileSync(
      path.join(serverPath, "settings.json"),
      JSON.stringify({ name, version, type, cracked }, null, 2)
    );

    // Simulate auto crack setup (placeholder)
    if (cracked === true) {
      fs.writeFileSync(path.join(serverPath, "crack.txt"), "crack enabled");
    }

    res.json({ success: true, message: "Server created successfully." });
  } catch (error) {
    console.error("Failed to create server:", error);
    res.status(500).json({ error: "Failed to create server." });
  }
});

// File upload using multer
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  res.json({ success: true, filename: req.file.filename });
});

// API: Toggle crack (simulate)
app.post("/api/toggle-crack", (req, res) => {
  const { name, crack } = req.body;
  const settingsPath = path.join(__dirname, "servers", name, "settings.json");

  if (!fs.existsSync(settingsPath)) {
    return res.status(404).json({ error: "Server not found." });
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath));
  settings.cracked = crack;

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  res.json({ success: true, message: "Crack setting updated." });
});

// API: List servers
app.get("/api/servers", (req, res) => {
  const serversDir = path.join(__dirname, "servers");
  if (!fs.existsSync(serversDir)) {
    return res.json([]);
  }

  const serverList = fs.readdirSync(serversDir).filter((name) => {
    const stat = fs.statSync(path.join(serversDir, name));
    return stat.isDirectory();
  });

  res.json(serverList);
});

// Start server
app.listen(port, () => {
  console.log(`🌐 Server is running at http://localhost:${port}`);
});
