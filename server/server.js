const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 8080;
const BASE_DIR = path.join(__dirname, '..');

const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const getContentType = (filePath) => {
  const extname = path.extname(filePath);
  return contentTypes[extname] || 'text/plain';
};

const serveFile = async (res, filePath) => {
  try {
    const data = await fs.readFile(filePath);
    const contentType = getContentType(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error);
    res.writeHead(404);
    res.end('File not found');
  }
};

const server = http.createServer(async (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse URL
  let parsedUrl = req.url;
  
  // Remove query string
  if (parsedUrl.includes('?')) {
    parsedUrl = parsedUrl.split('?')[0];
  }
  
  // Route to index.html for root path
  if (parsedUrl === '/' || parsedUrl === '') {
    parsedUrl = '/index.html';
  }
  
  // Construct full file path
  const filePath = path.join(BASE_DIR, parsedUrl);
  
  // Security check: ensure the path is within BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  await serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${BASE_DIR}`);
  console.log('\nPress Ctrl+C to stop the server');
});
