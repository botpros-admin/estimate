const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';

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
    req.write(postData);
    req.end();
  });
}

async function checkAvailableMethods() {
  console.log('Checking available methods and permissions...\n');
  
  try {
    // Check scope
    console.log('Checking webhook scope...');
    const scope = await callMethod('scope');