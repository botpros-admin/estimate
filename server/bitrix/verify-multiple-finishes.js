const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

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
    req.write(postData);    req.end();
  });
}

async function verifyFinishes() {
  console.log('Verifying multiple finishes in Bitrix...\n');
  
  const result = await callMethod('crm.item.list', {
    'entityTypeId': smartProcessId
  });
  
  if (result.items && result.items.length > 0) {
    console.log('Paint Products and Their Finishes:');
    console.log('==================================\n');
    
    result.items.forEach(item => {
      console.log(`${item.title}:`);
      if (item.ufCrm7Finishes) {
        if (Array.isArray(item.ufCrm7Finishes)) {
          const finishNames = item.ufCrm7Finishes.map(id => 
            finishLabels[id] || `Unknown (${id})`
          ).join(', ');
          console.log(`  Finishes: ${finishNames}`);
          console.log(`  IDs: [${item.ufCrm7Finishes.join(', ')}]`);
        } else {
          const finishName = finishLabels[item.ufCrm7Finishes] || `Unknown (${item.ufCrm7Finishes})`;
          console.log(`  Finish: ${finishName} (ID: ${item.ufCrm7Finishes})`);
        }
      } else {
        console.log('  Finishes: (none)');
      }
      console.log('');
    });
  }
}

verifyFinishes().catch(console.error);