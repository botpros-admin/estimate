const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

// Map products to their most common finish
const productFinishes = [
  { id: 11, name: "Sherwin-Williams - Super Paint", finishId: "2096" }, // Satin (most popular)
  { id: 12, name: "Sherwin-Williams - Self-Cleaning", finishId: "2094" }, // Flat/Matte
  { id: 13, name: "Sherwin-Williams - Latitude", finishId: "2096" }, // Satin
  { id: 14, name: "Sherwin-Williams - Emerald", finishId: "2096" }, // Satin (most popular)
  { id: 15, name: "Benjamin Moore - Ultra Spec", finishId: "2096" }, // Satin
  { id: 16, name: "Benjamin Moore - Crylicote", finishId: "2096" }, // Satin
  { id: 17, name: "Benjamin Moore - Regal", finishId: "2095" }, // Low Sheen/Lustre
  { id: 18, name: "Benjamin Moore - Aura", finishId: "2096" }, // Satin (most versatile)
  { id: 19, name: "UCI - 50-100", finishId: "2096" }, // Satin (only option)
  { id: 20, name: "UCI - Ultra", finishId: "2098" }, // Gloss
  { id: 21, name: "UCI - Storm Proof", finishId: "2094" } // Flat/Matte
];

// Finish ID mapping reference
const finishOptions = {
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
      res.on('data', (chunk) => data += chunk);      res.on('end', () => {
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

async function updateProductFinish(product) {
  const params = {
    'entityTypeId': smartProcessId,
    'id': product.id,
    'fields[ufCrm7Finishes]': product.finishId
  };
  
  try {
    const result = await callMethod('crm.item.update', params);
    console.log(`✓ Updated: ${product.name}`);
    console.log(`  Finish: ${finishOptions[product.finishId]} (ID: ${product.finishId})`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to update ${product.name}:`, error.message);
    throw error;
  }
}

async function updateAllFinishes() {
  console.log('====================================');
  console.log('Updating Paint Product Finishes');
  console.log('====================================\n');
  
  console.log('Note: Since Finishes is a single-select field,');
  console.log('each product will be set to its most common finish.\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of productFinishes) {
    try {
      await updateProductFinish(product);
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
    console.log('\n🎉 All products updated successfully!');
    console.log('\nTo support multiple finishes per product, the field');
    console.log('would need to be changed to a multiple selection list in Bitrix.');
  }
}

updateAllFinishes().catch(console.error);