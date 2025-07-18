const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// POST /createserver
app.post("/createserver", (req, res) => {
  const serverName = req.body.name;

  if (!serverName) {
    return res.status(400).send("Missing server name.");
  }

  const serversDir = path.join(__dirname, "servers");
  const serverPath = path.join(serversDir, serverName);

  if (!fs.existsSync(serversDir)) {
    fs.mkdirSync(serversDir);
  }

  if (fs.existsSync(serverPath)) {
    return res.status(400).send("Server already exists.");
  }

  fs.mkdirSync(serverPath);
  fs.writeFileSync(
    path.join(serverPath, "server-info.txt"),
    `Server: ${serverName}\nCreated at: ${new Date().toISOString()}`
  );

  res.json({ message: `Server '${serverName}' created successfully.`, name: serverName });
});

// GET /api/server-info/:name
app.get("/api/server-info/:name", (req, res) => {
  const serverName = req.params.name;
  const serverInfoPath = path.join(__dirname, "servers", serverName, "server-info.txt");

  if (!fs.existsSync(serverInfoPath)) {
    return res.status(404).json({ error: "Server not found." });
  }

  const info = fs.readFileSync(serverInfoPath, "utf-8");
  res.json({ info });
});

// GET /api/server-list
app.get("/api/server-list", (req, res) => {
  const serversDir = path.join(__dirname, "servers");

  if (!fs.existsSync(serversDir)) {
    return res.json({ servers: [] });
  }

  const serverFolders = fs.readdirSync(serversDir).filter(folder => {
    return fs.statSync(path.join(serversDir, folder)).isDirectory();
  });

  res.json({ servers: serverFolders });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
