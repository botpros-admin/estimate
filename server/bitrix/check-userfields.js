const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

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

async function checkFields() {
  console.log('Checking fields using user.userfield.list...\n');
  
  try {
    const fields = await callMethod('user.userfield.list', {
      'filter[ENTITY_ID]': `CRM_${smartProcessId}`
    });    
    console.log(`Found ${fields.length} fields for Smart Process ${smartProcessId}:\n`);
    
    fields.forEach(field => {
      console.log(`✅ ${field.FIELD_NAME} - ${field.LABEL || field.EDIT_FORM_LABEL || 'No label'}`);
    });
    
    // Also try with alternative filter
    console.log('\n\nChecking with alternative method...');
    const fields2 = await callMethod('user.userfield.list', {
      'ENTITY_ID': `CRM_${smartProcessId}`
    });
    
    console.log(`Alternative method found ${fields2.length} fields`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFields();