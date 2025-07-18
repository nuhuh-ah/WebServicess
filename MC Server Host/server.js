const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

const serversDir = path.join(__dirname, "servers");

if (!fs.existsSync(serversDir)) fs.mkdirSync(serversDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const serverName = req.params.server;
    const uploadDir = path.join(serversDir, serverName, "files");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// API: Create server
app.post("/api/create", (req, res) => {
  const name = req.body.name;
  if (!name.endsWith(".hoatreehub.com")) return res.status(400).json({ error: "Server name must end with .hoatreehub.com" });

  const folderName = name.replace(".hoatreehub.com", "");
  const serverPath = path.join(serversDir, folderName);
  if (fs.existsSync(serverPath)) return res.status(400).json({ error: "Server already exists" });

  fs.mkdirSync(serverPath);
  fs.writeFileSync(path.join(serverPath, "info.json"), JSON.stringify({
    name,
    version: "1.20",
    type: "vanilla",
    crack: true
  }, null, 2));
  fs.mkdirSync(path.join(serverPath, "files"));

  res.json({ message: "Server created", server: folderName });
});

// API: Get server info
app.get("/api/info/:server", (req, res) => {
  const infoPath = path.join(serversDir, req.params.server, "info.json");
  if (!fs.existsSync(infoPath)) return res.status(404).send("Not found");
  res.sendFile(infoPath);
});

// API: Update server version/type
app.post("/api/update/:server", (req, res) => {
  const infoPath = path.join(serversDir, req.params.server, "info.json");
  if (!fs.existsSync(infoPath)) return res.status(404).send("Not found");

  const info = JSON.parse(fs.readFileSync(infoPath));
  info.version = req.body.version || info.version;
  info.type = req.body.type || info.type;
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  res.json({ message: "Updated" });
});

// API: Upload file
app.post("/api/upload/:server", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded" });
});

// API: List files
app.get("/api/files/:server", (req, res) => {
  const folder = path.join(serversDir, req.params.server, "files");
  if (!fs.existsSync(folder)) return res.json([]);
  const files = fs.readdirSync(folder);
  res.json(files);
});

// API: Delete file
app.delete("/api/files/:server/:filename", (req, res) => {
  const filePath = path.join(serversDir, req.params.server, "files", req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: "Deleted" });
  }
  res.status(404).json({ error: "File not found" });
});

// API: Change crack
app.post("/api/crack/:server", (req, res) => {
  const infoPath = path.join(serversDir, req.params.server, "info.json");
  if (!fs.existsSync(infoPath)) return res.status(404).send("Not found");

  const info = JSON.parse(fs.readFileSync(infoPath));
  info.crack = !!req.body.crack;
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  res.json({ message: "Crack setting updated" });
});

// Routes
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/:server.hoatreehub.com", (req, res) => res.sendFile(path.join(__dirname, "public", "server.html")));
app.get("/:server.hoatreehub.com/files", (req, res) => res.sendFile(path.join(__dirname, "public", "files.html")));
app.get("/:server.hoatreehub.com/settings", (req, res) => res.sendFile(path.join(__dirname, "public", "settings.html")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
