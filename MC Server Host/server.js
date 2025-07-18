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

  // Create servers directory if not exists
  if (!fs.existsSync(serversDir)) {
    fs.mkdirSync(serversDir);
  }

  // Check if server already exists
  if (fs.existsSync(serverPath)) {
    return res.status(400).send("Server already exists.");
  }

  // Create new server folder
  fs.mkdirSync(serverPath);
  fs.writeFileSync(path.join(serverPath, "server-info.txt"), `Server: ${serverName}\nCreated at: ${new Date().toISOString()}`);

  res.send(`Server '${serverName}' created successfully.`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
