const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const serversDir = path.join(__dirname, "servers");
if (!fs.existsSync(serversDir)) fs.mkdirSync(serversDir);

// === API: Create Server ===
app.post("/createserver", (req, res) => {
  const serverName = req.body.name;
  if (!serverName || !serverName.endsWith(".hoatreehub.com")) {
    return res.status(400).send("Invalid server name.");
  }

  const serverPath = path.join(serversDir, serverName);
  if (fs.existsSync(serverPath)) return res.status(400).send("Server already exists.");

  fs.mkdirSync(serverPath);
  fs.mkdirSync(path.join(serverPath, "plugins"));
  fs.writeFileSync(path.join(serverPath, "server-info.txt"), `Server: ${serverName}\nCreated: ${new Date().toISOString()}`);
  fs.writeFileSync(path.join(serverPath, "settings.json"), JSON.stringify({
    version: "1.20.1",
    type: "vanilla",
    crack: true
  }, null, 2));

  res.redirect(`/server/${serverName}`);
});

// === UI Pages ===
app.get("/server/:name", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "server.html"));
});

app.get("/:name/files", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "files.html"));
});

app.get("/:name/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "settings.html"));
});

// === Upload Plugin ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(serversDir, req.params.name, "plugins");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.post("/:name/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded.");
});

// === List Plugins ===
app.get("/:name/list-files", (req, res) => {
  const pluginPath = path.join(serversDir, req.params.name, "plugins");
  if (!fs.existsSync(pluginPath)) return res.json([]);
  const files = fs.readdirSync(pluginPath);
  res.json(files);
});

// === Delete Plugin ===
app.delete("/:name/delete/:filename", (req, res) => {
  const filePath = path.join(serversDir, req.params.name, "plugins", req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send("Deleted.");
  } else {
    res.status(404).send("File not found.");
  }
});

// === Update Settings ===
app.post("/:name/settings", (req, res) => {
  const filePath = path.join(serversDir, req.params.name, "settings.json");
  const data = req.body;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.send("Settings updated.");
});

// === Get Settings ===
app.get("/:name/settings-data", (req, res) => {
  const filePath = path.join(serversDir, req.params.name, "settings.json");
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

// === Start Server ===
app.post("/:name/start", (req, res) => {
  const serverPath = path.join(serversDir, req.params.name);
  const settingsPath = path.join(serverPath, "settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath));
  // Simulate running server file
  res.send(`Started server ${req.params.name} with ${settings.version} (${settings.type})`);
});

// === Stop Server ===
app.post("/:name/stop", (req, res) => {
  res.send(`Stopped server ${req.params.name}`);
});

// === Start Listening ===
app.listen(port, () => {
  console.log(`Server manager running at http://localhost:${port}`);
});
