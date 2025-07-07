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

async function createAllFields() {
  console.log('🔧 Creating Paint Product fields with proper permissions...\n');
  
  const fields = [
    { name: 'UF_CRM_BRAND', label: 'Brand', type: 'string', required: 'Y' },    { name: 'UF_CRM_PAINT_NAME', label: 'Paint Name', type: 'string', required: 'Y' },
    { name: 'UF_CRM_INTERIOR', label: 'Interior', type: 'boolean', required: 'N' },
    { name: 'UF_CRM_EXTERIOR', label: 'Exterior', type: 'boolean', required: 'N' },
    { name: 'UF_CRM_FINISHES', label: 'Available Finishes', type: 'string', required: 'Y' },
    { name: 'UF_CRM_PRIMER', label: 'Paint & Primer', type: 'boolean', required: 'N' },
    { name: 'UF_CRM_PRIMER_NOTE', label: 'Primer Note', type: 'string', required: 'N' },
    { name: 'UF_CRM_RES_PRICE', label: 'Residential Price', type: 'double', required: 'Y' },
    { name: 'UF_CRM_COM_PRICE', label: 'Commercial Price', type: 'double', required: 'Y' },
    { name: 'UF_CRM_COVERAGE', label: 'Coverage (sq ft/gal)', type: 'integer', required: 'Y' },
    { name: 'UF_CRM_EXTERNAL_ID', label: 'External ID', type: 'string', required: 'Y' },
    { name: 'UF_CRM_SYNC_DATE', label: 'Last Sync Date', type: 'datetime', required: 'N' }
  ];

  let successCount = 0;
  let errorCount = 0;
  
  for (const field of fields) {
    try {
      console.log(`Creating ${field.name}...`);
      
      // Using user.userfield.add method with correct parameters
      const result = await callMethod('user.userfield.add', {
        'ENTITY_ID': `CRM_${smartProcessId}`,
        'FIELD_NAME': field.name,
        'USER_TYPE_ID': field.type,
        'MANDATORY': field.required,
        'SHOW_IN_LIST': 'Y',
        'EDIT_IN_LIST': 'Y',
        'LABEL': field.label
      });
      
      console.log(`  ✅ ${field.name} created successfully`);
      successCount++;
      
    } catch (error) {
      if (error.message.includes('ERROR_FIELD_ALREADY_EXISTS')) {
        console.log(`  ⚠️  ${field.name} already exists`);
      } else {
        console.log(`  ❌ ${field.name} failed: ${error.message}`);
        errorCount++;
      }
    }
  }
  
  console.log('\n=============================');
  console.log(`Summary: ${successCount} created, ${errorCount} errors`);
  
  if (successCount > 0 || errorCount === 0) {
    console.log('\n🎉 Fields setup complete!');
    console.log('Run verify-fields.js to confirm all fields are ready.');
  }
}

createAllFields().catch(console.error);