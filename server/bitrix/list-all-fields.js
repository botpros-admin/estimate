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

async function listAllFields() {
  console.log('📋 Listing all fields in Smart Process...\n');
  
  try {
    // Method 1: Get fields from crm.item.fields
    console.log('Method 1: crm.item.fields');
    const itemFields = await callMethod('crm.item.fields', {      'entityTypeId': smartProcessId
    });
    
    console.log('Available fields:');
    Object.keys(itemFields.fields).forEach(field => {
      if (field.startsWith('UF_')) {
        console.log(`- ${field}`);
      }
    });
    
    // Method 2: List userfields
    console.log('\n\nMethod 2: user.userfield.list');
    const userFields = await callMethod('user.userfield.list', {
      'filter[ENTITY_ID]': `CRM_${smartProcessId}`
    });
    
    console.log('User fields:');
    userFields.forEach(field => {
      console.log(`- ${field.FIELD_NAME}: ${field.EDIT_FORM_LABEL?.en || field.FIELD_NAME}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllFields();