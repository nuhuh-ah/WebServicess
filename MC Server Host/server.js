<!DOCTYPE html>
<html>
<head>
  <title>Server</title>
</head>
<body>
  <h2 id="serverName"></h2>

  <select id="version">
    <option>1.8</option>
    <option>1.12</option>
    <option>1.16</option>
    <option>1.18</option>
    <option selected>1.20</option>
    <option>1.21</option>
  </select>

  <select id="type">
    <option>vanilla</option>
    <option>forge</option>
    <option>fabric</option>
    <option>addon</option>
  </select>

  <button onclick="apply()">Apply</button>
  <button onclick="location.href=window.location.pathname + '/files'">Files</button>
  <button onclick="location.href=window.location.pathname + '/settings'">Settings</button>

  <hr>

  <button onclick="startServer()">Start Server</button>
  <button onclick="stopServer()">Stop Server</button>
  <button onclick="checkConsole()">Check Console</button>

  <pre id="consoleOutput" style="background:#000;color:#0f0;padding:10px;"></pre>

  <script>
    const name = location.pathname.split("/")[1].replace(".hoatreehub.com", "");
    document.getElementById("serverName").innerText = "Server: " + name;

    async function apply() {
      const version = document.getElementById("version").value;
      const type = document.getElementById("type").value;
      await fetch(`/api/update/${name}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, type })
      });
      alert("Updated!");
    }

    async function startServer() {
      const res = await fetch('/startserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name + '.hoatreehub.com' })
      });
      const data = await res.json();
      alert(data.status || data.error);
    }

    async function stopServer() {
      const res = await fetch('/stopserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name + '.hoatreehub.com' })
      });
      const data = await res.json();
      alert(data.status || data.error);
    }

    async function checkConsole() {
      const res = await fetch('/serverconsole/' + name + '.hoatreehub.com');
      const data = await res.json();
      document.getElementById('consoleOutput').innerText = JSON.stringify(data, null, 2);
    }
  </script>
</body>
</html>
