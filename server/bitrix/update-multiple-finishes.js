const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

// Map products to their complete finish arrays based on original data
const productFinishes = [
  { 
    id: 11, 
    name: "Sherwin-Williams - Super Paint", 
    finishes: ["2094", "2096", "2098", "2099"] // Flat, Satin, Gloss, High Gloss
  },
  { 
    id: 12, 
    name: "Sherwin-Williams - Self-Cleaning", 
    finishes: ["2094", "2096"] // Flat, Satin
  },
  { 
    id: 13, 
    name: "Sherwin-Williams - Latitude", 
    finishes: ["2094", "2096", "2098"] // Flat, Satin, Gloss
  },
  { 
    id: 14, 
    name: "Sherwin-Williams - Emerald", 
    finishes: ["2094", "2096", "2098"] // Flat, Satin, Gloss (Rain Refresh is just a variant)
  },
  { 
    id: 15, 
    name: "Benjamin Moore - Ultra Spec", 
    finishes: ["2094", "2095", "2096", "2098"] // Flat, Low Lustre, Satin, Gloss
  },
  { 
    id: 16, 
    name: "Benjamin Moore - Crylicote", 
    finishes: ["2094", "2096", "2097"] // Flat, Satin, Semi-Gloss
  },
  { 
    id: 17, 
    name: "Benjamin Moore - Regal", 
    finishes: ["2094", "2095", "2098"] // Flat, Low Lustre, Soft Gloss (mapped to Gloss)
  },
  { 
    id: 18, 
    name: "Benjamin Moore - Aura", 
    finishes: ["2094", "2095", "2096", "2098"] // Flat, Low Lustre, Satin, Soft Gloss
  },  { 
    id: 19, 
    name: "UCI - 50-100", 
    finishes: ["2096"] // Satin only
  },
  { 
    id: 20, 
    name: "UCI - Ultra", 
    finishes: ["2096", "2098"] // Satin, Gloss
  },
  { 
    id: 21, 
    name: "UCI - Storm Proof", 
    finishes: ["2094", "2095"] // Flat/Matte, Low Sheen (elastomeric)
  }
];

// Finish labels for display
const finishLabels = {
  "2094": "Flat/Matte",
  "2095": "Low Sheen/Lustre",
  "2096": "Satin",
  "2097": "Semi-Gloss",
  "2098": "Gloss",
  "2099": "High Gloss"
};

function callMethod(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(params);
    
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
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
          if (result.error) {            reject(new Error(`${result.error}: ${result.error_description}`));
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

async function updateProductFinishes(product) {
  // Build params with multiple finish values
  const params = {
    'entityTypeId': smartProcessId,
    'id': product.id
  };
  
  // Add each finish as a separate parameter
  product.finishes.forEach((finishId, index) => {
    params[`fields[ufCrm7Finishes][${index}]`] = finishId;
  });
  
  try {
    const result = await callMethod('crm.item.update', params);
    const finishNames = product.finishes.map(id => finishLabels[id]).join(', ');
    console.log(`✓ Updated: ${product.name}`);
    console.log(`  Finishes: ${finishNames}`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to update ${product.name}:`, error.message);
    throw error;
  }
}

async function updateAllFinishes() {
  console.log('====================================');
  console.log('Updating Paint Products with Multiple Finishes');
  console.log('====================================\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of productFinishes) {
    try {
      await updateProductFinishes(product);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failureCount++;
    }
  }
  
  console.log('\n====================================');
  console.log('Summary');
  console.log('====================================');
  console.log(`✓ Successfully updated: ${successCount} products`);
  console.log(`✗ Failed: ${failureCount} products`);
  
  if (successCount === productFinishes.length) {
    console.log('\n🎉 All products updated with their complete finish options!');
  }
}

updateAllFinishes().catch(console.error);