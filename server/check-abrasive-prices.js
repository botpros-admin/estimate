// Script to fetch abrasive services from Bitrix and display their prices
const https = require('https');

const WEBHOOK_URL = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const ABRASIVE_CATALOG_SPA_ID = 1068;

async function makeRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL + method);
    const postData = JSON.stringify(params);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
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

async function fetchAbrasiveServices() {
  try {
    console.log('Fetching abrasive services from Bitrix...\n');
    
    const response = await makeRequest('crm.item.list', {
      entityTypeId: ABRASIVE_CATALOG_SPA_ID,
      select: [
        'id', 'title', 'ufCrm10ServiceType',
        'ufCrm10ResProceMin', 'ufCrm10ResPriceMax', 'ufCrm10ResPriceDef',
        'ufCrm10ComPriceMin', 'ufCrm10ComPriceMax', 'ufCrm10CcomPriceDef'
      ],
      start: 0,
      limit: 50
    });
    
    if (response.result && response.result.items) {
      console.log(`Found ${response.result.items.length} abrasive services:\n`);
      
      response.result.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title || 'Unnamed Service'}`);
        console.log(`   Service Type: ${item.ufCrm10ServiceType || 'Not specified'}`);
        console.log(`   ID: ${item.id}`);
        
        // Parse prices
        const parsePrice = (priceStr) => {
          if (!priceStr || !priceStr.includes('|')) return 'Not set';
          return '$' + parseFloat(priceStr.split('|')[0]).toFixed(2);
        };
        
        console.log(`   Residential Pricing:`);
        console.log(`     - Min: ${parsePrice(item.ufCrm10ResProceMin)}`);
        console.log(`     - Max: ${parsePrice(item.ufCrm10ResPriceMax)}`);
        console.log(`     - Default: ${parsePrice(item.ufCrm10ResPriceDef)}`);
        
        console.log(`   Commercial Pricing:`);
        console.log(`     - Min: ${parsePrice(item.ufCrm10ComPriceMin)}`);
        console.log(`     - Max: ${parsePrice(item.ufCrm10ComPriceMax)}`);
        console.log(`     - Default: ${parsePrice(item.ufCrm10CcomPriceDef)}`);
        console.log('');
      });
    } else {
      console.log('No abrasive services found or error in response.');
    }
  } catch (error) {
    console.error('Error fetching abrasive services:', error.message);
  }
}

fetchAbrasiveServices();
