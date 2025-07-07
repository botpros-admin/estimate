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
  console.log('🔧 Creating all Paint Product fields...\n');
  
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

  // Build batch commands
  const batchCmd = {};
  fields.forEach((field, index) => {
    const params = [
      `ENTITY_ID=CRM_${smartProcessId}`,
      `FIELD_NAME=${field.name}`,
      `USER_TYPE_ID=${field.type}`,
      `XML_ID=${field.name}`,
      `MANDATORY=${field.required}`,
      `EDIT_FORM_LABEL=${encodeURIComponent(field.label)}`,
      `LIST_COLUMN_LABEL=${encodeURIComponent(field.label)}`,
      `LIST_FILTER_LABEL=${encodeURIComponent(field.label)}`,
      `SHOW_IN_LIST=Y`,
      `EDIT_IN_LIST=${field.type === 'string' || field.type === 'boolean' ? 'Y' : 'N'}`,
      `IS_SEARCHABLE=${field.name.includes('NAME') || field.name.includes('ID') ? 'Y' : 'N'}`
    ].join('&');
    
    batchCmd[`field_${index}`] = `userfieldtype.add?${params}`;
  });

  try {
    console.log(`Creating ${fields.length} fields in batch operation...\n`);
    
    const batch = {
      'halt': 0,
      'cmd': batchCmd
    };

    const result = await callMethod('batch', batch);    
    // Process results
    let successCount = 0;
    let errorCount = 0;
    
    console.log('Results:');
    console.log('========\n');
    
    Object.keys(result.result).forEach(key => {
      const fieldIndex = parseInt(key.replace('field_', ''));
      const field = fields[fieldIndex];
      const fieldResult = result.result[key];
      
      if (fieldResult && !fieldResult.error) {
        console.log(`✅ ${field.name} - Created successfully`);
        successCount++;
      } else if (fieldResult && fieldResult.error) {
        if (fieldResult.error.includes('ERROR_FIELD_ALREADY_EXISTS')) {
          console.log(`⚠️  ${field.name} - Already exists`);
        } else {
          console.log(`❌ ${field.name} - Error: ${fieldResult.error_description || fieldResult.error}`);
          errorCount++;
        }
      }
    });
    
    console.log('\n=============================');
    console.log(`Summary: ${successCount} created, ${errorCount} errors`);
    
    if (successCount > 0) {
      console.log('\n🎉 Fields created successfully!');
      console.log('\nNext steps:');
      console.log('1. Run: node verify-fields.js');
      console.log('2. Start server: start-with-bitrix.bat');
    }
    
  } catch (error) {
    console.error('\n❌ Batch operation failed:', error.message);
    console.error('\nNote: You may need to create fields manually in Bitrix UI.');
  }
}

// Run the field creation
createAllFields().catch(console.error);