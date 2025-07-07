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

async function verifyFields() {
  console.log('🔍 Verifying Paint Products fields...\n');
  
  try {
    const fields = await callMethod('crm.item.fields', {
      'entityTypeId': smartProcessId
    });    
    const requiredFields = [
      'ufCrm7Brand',
      'ufCrm7PaintName',
      'ufCrm7Interior',
      'ufCrm7Exterior',
      'ufCrm7Finishes',
      'ufCrm7Primer',
      'ufCrm7PrimerNote',
      'ufCrm7ResPrice',
      'ufCrm7ComPrice',
      'ufCrm7Coverage',
      'ufCrm7ExternalId',
      'ufCrm7SyncDate'
    ];
    
    console.log('Checking for required fields:');
    console.log('=============================\n');
    
    let foundCount = 0;
    let missingCount = 0;
    
    requiredFields.forEach(fieldName => {
      if (fields.fields[fieldName]) {
        console.log(`✅ ${fieldName} - Found`);
        foundCount++;
      } else {
        console.log(`❌ ${fieldName} - Missing`);
        missingCount++;
      }
    });
    
    console.log('\n=============================');
    console.log(`Summary: ${foundCount} found, ${missingCount} missing`);
    
    if (missingCount === 0) {
      console.log('\n🎉 All fields are configured! You can now start syncing.');
    } else {
      console.log('\n⚠️  Please create the missing fields in Bitrix UI.');
      console.log('See MANUAL_FIELD_SETUP.md for instructions.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyFields();