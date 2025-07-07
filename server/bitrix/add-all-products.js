const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

// Paint products data
const paintProducts = [
  {
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
    brand: "Sherwin-Williams",
    paint: "Emerald",
    interior: true,
    exterior: true,
    finishes: "Flat, Satin, Gloss (plus \"Rain Refresh\" variant)",    primer: true,
    primerNote: "paint & primer in one",
    residentialPrice: 1.50,
    commercialPrice: 1.30,
    coverage: 300
  },
  {
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
    brand: "Benjamin Moore",
    paint: "Aura",
    interior: true,
    exterior: true,
    finishes: "Flat, Low Lustre, Satin, Soft Gloss",
    primer: true,
    primerNote: "marketed as paint & primer in one",    residentialPrice: 2.10,
    commercialPrice: 1.85,
    coverage: 250
  },
  {
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

// Function to call Bitrix API
function callMethod(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(params);
    
    const url = new URL(webhookUrl);
    const options = {      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${method}.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`${result.error}: ${result.error_description}`));
          } else {
            resolve(result.result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Function to add a product to Bitrix
async function addProduct(product, index) {
  const timestamp = Date.now() + index; // Ensure unique external IDs
  
  // Calculate price ranges (±10% from base price)
  const resPriceMin = (product.residentialPrice * 0.9).toFixed(2);
  const resPriceMax = (product.residentialPrice * 1.1).toFixed(2);
  const comPriceMin = (product.commercialPrice * 0.9).toFixed(2);
  const comPriceMax = (product.commercialPrice * 1.1).toFixed(2);
  
  const fields = {
    'title': `${product.brand} - ${product.paint}`,
    'opened': 'Y',
    'ufCrm7Brand': product.brand,
    'ufCrm7PaintName': product.paint,
    'ufCrm7Interior': product.interior ? 'Y' : 'N',    'ufCrm7Exterior': product.exterior ? 'Y' : 'N',
    'ufCrm7Finishes': product.finishes,
    'ufCrm7Primer': product.primer ? 'Y' : 'N',
    'ufCrm7PrimerNote': product.primerNote,
    'ufCrm7ResPrice': resPriceMin,
    'ufCrm7ResPriceMax': resPriceMax,
    'ufCrm7ResPriceDef': product.residentialPrice.toFixed(2),
    'ufCrm7ComPrice': comPriceMin,
    'ufCrm7ComPriceMax': comPriceMax,
    'ufCrm7ComPriceDef': product.commercialPrice.toFixed(2),
    'ufCrm7Coverage': product.coverage,
    'ufCrm7ExternalId': timestamp.toString(),
    'ufCrm7SyncDate': new Date().toISOString(),
    'ufCrm7ServiceType': 'Paint' // Default to Paint service type
  };
  
  // Build params for API call
  const params = {
    'entityTypeId': smartProcessId
  };
  
  // Add fields as params
  Object.keys(fields).forEach(key => {
    params[`fields[${key}]`] = fields[key];
  });
  
  try {
    const result = await callMethod('crm.item.add', params);
    console.log(`✓ Added: ${product.brand} - ${product.paint} (ID: ${result.item.id})`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to add ${product.brand} - ${product.paint}:`, error.message);
    throw error;
  }
}

// Main function to add all products
async function addAllProducts() {
  console.log('====================================');
  console.log('Adding Paint Products to Bitrix');
  console.log('====================================\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < paintProducts.length; i++) {
    try {
      await addProduct(paintProducts[i], i);
      successCount++;      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failureCount++;
    }
  }
  
  console.log('\n====================================');
  console.log('Summary');
  console.log('====================================');
  console.log(`✓ Successfully added: ${successCount} products`);
  console.log(`✗ Failed: ${failureCount} products`);
  console.log(`Total: ${paintProducts.length} products`);
  
  if (successCount === paintProducts.length) {
    console.log('\n🎉 All products added successfully!');
  } else if (failureCount > 0) {
    console.log('\n⚠️  Some products failed to add. Check the errors above.');
  }
}

// Execute the script
addAllProducts().catch(console.error);