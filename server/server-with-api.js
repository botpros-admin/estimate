const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 8080;
const BASE_DIR = path.join(__dirname, '..');
const DATA_FILE = path.join(__dirname, 'paintProducts.json');

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

// Default paint products data
const defaultProducts = [
  {
    id: 1,
    brand: "Sherwin-Williams",
    paint: "Super Paint",
    interior: true,
    exterior: true,
    finishes: "Flat, Satin, Gloss, High Gloss",
    primer: true,
    primerNote: "marketed as paint & primer in one",
    residentialPrice: 0.95,
    commercialPrice: 0.85,
    coverage: 300
  },
  {
    id: 2,
    brand: "Sherwin-Williams",
    paint: "Self-Cleaning",
    interior: false,
    exterior: true,
    finishes: "Flat, Satin",
    primer: true,
    primerNote: "self-priming on masonry",
    residentialPrice: 1.15,
    commercialPrice: 1.05,
    coverage: 250
  },
  {
    id: 3,
    brand: "Sherwin-Williams",
    paint: "Latitude",
    interior: false,
    exterior: true,
    finishes: "Flat, Satin, Gloss",
    primer: false,
    primerNote: "not specifically marketed as paint & primer",
    residentialPrice: 1.10,
    commercialPrice: 1.05,
    coverage: 250
  },
  {
    id: 4,
    brand: "Sherwin-Williams",
    paint: "Emerald",
    interior: true,
    exterior: true,
    finishes: "Flat, Satin, Gloss (plus \"Rain Refresh\" variant)",
    primer: true,
    primerNote: "paint & primer in one",
    residentialPrice: 1.50,
    commercialPrice: 1.30,
    coverage: 300
  },
  {
    id: 5,
    brand: "Benjamin Moore",
    paint: "Ultra Spec",
    interior: true,
    exterior: true,
    finishes: "Flat, Low Lustre, Satin, Gloss",
    primer: false,
    primerNote: "standard acrylic; typically needs primer",
    residentialPrice: 1.00,
    commercialPrice: 0.95,
    coverage: 250
  },
  {
    id: 6,
    brand: "Benjamin Moore",
    paint: "Crylicote",
    interior: false,
    exterior: true,
    finishes: "Flat, Satin, Semi-Gloss",
    primer: true,
    primerNote: "self-priming on most surfaces",
    residentialPrice: 1.15,
    commercialPrice: 1.05,
    coverage: 250
  },
  {
    id: 7,
    brand: "Benjamin Moore",
    paint: "Regal",
    interior: true,
    exterior: true,
    finishes: "Flat, Low Lustre, Soft Gloss (sometimes sold as \"High Build\")",
    primer: true,
    primerNote: "self-priming for repaints",
    residentialPrice: 1.30,
    commercialPrice: 1.25,
    coverage: 250
  },
  {
    id: 8,
    brand: "Benjamin Moore",
    paint: "Aura",
    interior: true,
    exterior: true,
    finishes: "Flat, Low Lustre, Satin, Soft Gloss",
    primer: true,
    primerNote: "marketed as paint & primer in one",
    residentialPrice: 2.10,
    commercialPrice: 1.85,
    coverage: 250
  },
  {
    id: 9,
    brand: "UCI",
    paint: "50-100",
    interior: false,
    exterior: true,
    finishes: "Satin",
    primer: false,
    primerNote: "use separate primer where needed",
    residentialPrice: 0.95,
    commercialPrice: 0.85,
    coverage: 300
  },
  {
    id: 10,
    brand: "UCI",
    paint: "Ultra",
    interior: false,
    exterior: true,
    finishes: "Typically Satin or Gloss (e.g., #57-100 is gloss)",
    primer: false,
    primerNote: "use separate primer on bare surfaces",
    residentialPrice: 1.10,
    commercialPrice: 1.05,
    coverage: 250
  },
  {
    id: 11,
    brand: "UCI",
    paint: "Storm Proof",
    interior: false,
    exterior: true,
    finishes: "Usually Flat/Matte or Low Sheen (elastomeric coating)",
    primer: false,
    primerNote: "not sold as paint & primer in one",
    residentialPrice: 1.20,
    commercialPrice: 1.10,
    coverage: 300
  }
];

// Load paint products from file or create default
async function loadPaintProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, create it with default data
    await savePaintProducts(defaultProducts);
    return defaultProducts;
  }
}

// Save paint products to file
async function savePaintProducts(products) {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

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

// Parse JSON body from request
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// API endpoint handlers
async function handleApiRequest(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  
  // GET /api/paint-products
  if (req.method === 'GET' && pathname === '/api/paint-products') {
    const products = await loadPaintProducts();
    res.writeHead(200);
    res.end(JSON.stringify(products));
    return;
  }
  
  // POST /api/paint-products
  if (req.method === 'POST' && pathname === '/api/paint-products') {
    try {
      const newProduct = await parseBody(req);
      const products = await loadPaintProducts();
      
      // Generate new ID
      newProduct.id = Date.now();
      
      products.push(newProduct);
      await savePaintProducts(products);
      
      res.writeHead(201);
      res.end(JSON.stringify(newProduct));
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
    return;
  }
  
  // PUT /api/paint-products/:id
  const putMatch = pathname.match(/^\/api\/paint-products\/(\d+)$/);
  if (req.method === 'PUT' && putMatch) {
    try {
      const id = parseInt(putMatch[1]);
      const updatedProduct = await parseBody(req);
      const products = await loadPaintProducts();
      
      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Product not found' }));
        return;
      }
      
      products[index] = { ...products[index], ...updatedProduct, id };
      await savePaintProducts(products);
      
      res.writeHead(200);
      res.end(JSON.stringify(products[index]));
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
    return;
  }
  
  // DELETE /api/paint-products/:id
  const deleteMatch = pathname.match(/^\/api\/paint-products\/(\d+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const id = parseInt(deleteMatch[1]);
    const products = await loadPaintProducts();
    
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length === products.length) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Product not found' }));
      return;
    }
    
    await savePaintProducts(filteredProducts);
    
    res.writeHead(204);
    res.end();
    return;
  }
  
  // If no API endpoint matched
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

const server = http.createServer(async (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse URL
  let pathname = req.url;
  
  // Remove query string
  if (pathname.includes('?')) {
    pathname = pathname.split('?')[0];
  }
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, pathname);
    return;
  }
  
  // Route to index.html for root path
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  
  // Construct full file path
  const filePath = path.join(BASE_DIR, pathname);
  
  // Security check
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
  console.log(`API endpoints available:`);
  console.log(`  GET    /api/paint-products`);
  console.log(`  POST   /api/paint-products`);
  console.log(`  PUT    /api/paint-products/:id`);
  console.log(`  DELETE /api/paint-products/:id`);
  console.log('\nPress Ctrl+C to stop the server');
});
