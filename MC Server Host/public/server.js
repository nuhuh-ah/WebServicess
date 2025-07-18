<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Server Details</title>
</head>
<body>
  <h1 id="serverTitle">Loading...</h1>
  <pre id="serverInfo">Loading server info...</pre>
  <a href="/">⬅ Back to Home</a>

  <script>
    const parts = window.location.pathname.split("/");
    const serverName = parts[parts.length - 1];

    fetch(`/api/server-info/${serverName}`)
      .then(res => {
        if (!res.ok) throw new Error("Server not found.");
        return res.json();
      })
      .then(data => {
        document.getElementById("serverTitle").textContent = "Server: " + serverName;
        document.getElementById("serverInfo").textContent = data.info;
      })
      .catch(err => {
        document.getElementById("serverTitle").textContent = "Error";
        document.getElementById("serverInfo").textContent = err.message;
      });
  </script>
</body>
</html>
