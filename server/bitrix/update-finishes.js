const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

// Map product IDs to their finishes
const productFinishes = [
  { id: 11, name: "Sherwin-Williams - Super Paint", finishes: ["FLAT", "SATIN", "GLOSS", "HIGH_GLOSS"] },
  { id: 12, name: "Sherwin-Williams - Self-Cleaning", finishes: ["FLAT", "SATIN"] },
  { id: 13, name: "Sherwin-Williams - Latitude", finishes: ["FLAT", "SATIN", "GLOSS"] },
  { id: 14, name: "Sherwin-Williams - Emerald", finishes: ["FLAT", "SATIN", "GLOSS"] },
  { id: 15, name: "Benjamin Moore - Ultra Spec", finishes: ["FLAT", "LOW_LUSTRE", "SATIN", "GLOSS"] },
  { id: 16, name: "Benjamin Moore - Crylicote", finishes: ["FLAT", "SATIN", "SEMI_GLOSS"] },
  { id: 17, name: "Benjamin Moore - Regal", finishes: ["FLAT", "LOW_LUSTRE", "SOFT_GLOSS"] },
  { id: 18, name: "Benjamin Moore - Aura", finishes: ["FLAT", "LOW_LUSTRE", "SATIN", "SOFT_GLOSS"] },
  { id: 19, name: "UCI - 50-100", finishes: ["SATIN"] },
  { id: 20, name: "UCI - Ultra", finishes: ["SATIN", "GLOSS"] },
  { id: 21, name: "UCI - Storm Proof", finishes: ["FLAT", "MATTE", "LOW_SHEEN"] }
];

// Function to call Bitrix API
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
          if (result.error) {
            reject(new Error(`${result.error}: ${result.error_description}`));
          } else {            resolve(result.result);
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

// Function to update finishes for a product
async function updateProductFinishes(product) {
  const params = {
    'entityTypeId': smartProcessId,
    'id': product.id,
    'fields[ufCrm7Finishes]': product.finishes
  };
  
  try {
    const result = await callMethod('crm.item.update', params);
    console.log(`✓ Updated: ${product.name}`);
    console.log(`  Finishes: ${product.finishes.join(', ')}`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to update ${product.name}:`, error.message);
    throw error;
  }
}

// Main function to update all products
async function updateAllFinishes() {
  console.log('====================================');
  console.log('Updating Paint Product Finishes');
  console.log('====================================\n');
  
  console.log('Note: Make sure you have created these finish options in Bitrix:');
  console.log('FLAT, MATTE, LOW_SHEEN, LOW_LUSTRE, SATIN, SEMI_GLOSS, SOFT_GLOSS, GLOSS, HIGH_GLOSS\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of productFinishes) {
    try {
      await updateProductFinishes(product);
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
  console.log(`✓ Successfully updated: ${successCount} products`);
  console.log(`✗ Failed: ${failureCount} products`);
  console.log(`Total: ${productFinishes.length} products`);
  
  if (successCount === productFinishes.length) {
    console.log('\n🎉 All products updated successfully!');
  } else if (failureCount > 0) {
    console.log('\n⚠️  Some products failed to update. Check the errors above.');
  }
}

// Execute the script
updateAllFinishes().catch(console.error);