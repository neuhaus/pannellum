const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8443;

const options = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = https.createServer(options, (req, res) => {
  // Normalize and resolve filepath
  var urlPath = req.url.split('?')[0];
  var decodedUrlPath = decodeURIComponent(urlPath);
  var filePath = path.join(__dirname, decodedUrlPath);
  
  if (decodedUrlPath === '/' || decodedUrlPath === '') {
    filePath = path.join(__dirname, 'examples', 'vr-test.htm');
  } else if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`[404] Not Found: ${req.url} (Tried: ${filePath})`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        console.error(`[500] Internal Error: ${req.url} (${err.code})`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(` Pannellum VR Test Server Running (HTTPS)`);
  console.log(`======================================================`);
  console.log(`Local url:  https://localhost:${PORT}/`);
  
  // Print LAN URLs
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`LAN url:    https://${net.address}:${PORT}/`);
      }
    }
  }
  console.log(`======================================================`);
  console.log(`NOTE: Since this uses a self-signed certificate over LAN,`);
  console.log(`your browser will show a security warning. You must click`);
  console.log(`"Advanced" -> "Proceed to ... (unsafe)" to open it.`);
  console.log(`======================================================\n`);
});
