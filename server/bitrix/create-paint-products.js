const https = require('https');
const querystring = require('querystring');

// Your webhook URL
const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';

/**
 * Execute Bitrix REST API call
 */
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

async function createSmartProcess() {
  console.log('=================================');
  console.log('Creating Paint Products Smart Process');
  console.log('=================================\n');  
  let smartProcessId = null;
  
  try {
    // First, check if it already exists
    console.log('Checking for existing Smart Process...');
    const types = await callMethod('crm.type.list');
    const existing = types.types.find(t => t.name === 'PAINT_PRODUCTS' || t.title === 'Paint Products');
    
    if (existing) {
      smartProcessId = existing.entityTypeId;
      console.log(`✓ Found existing Smart Process with ID: ${smartProcessId}`);
    } else {
      // Create new Smart Process
      console.log('Creating new Smart Process...');
      const result = await callMethod('crm.type.add', {
        'fields[title]': 'Paint Products',
        'fields[name]': 'PAINT_PRODUCTS',
        'fields[isUseInUserfieldEnabled]': 'Y',
        'fields[isLinkTrackingEnabled]': 'Y',
        'fields[isRecyclebinEnabled]': 'Y',
        'fields[isAutomationEnabled]': 'Y',
        'fields[isBizProcEnabled]': 'Y',
        'fields[isSetOpenPermissions]': 'Y',
        'fields[isPaymentsEnabled]': 'N',
        'fields[isCountersEnabled]': 'Y'
      });
      
      smartProcessId = result.type.entityTypeId;
      console.log(`✓ Smart Process created with ID: ${smartProcessId}`);
    }
    
    // Now create custom fields
    console.log('\nCreating custom fields...\n');
    
    const fields = [
      { name: 'UF_CRM_BRAND', label: 'Brand', type: 'string', required: 'Y' },
      { name: 'UF_CRM_PAINT_NAME', label: 'Paint Name', type: 'string', required: 'Y' },
      { name: 'UF_CRM_INTERIOR', label: 'Interior', type: 'boolean', required: 'N' },
      { name: 'UF_CRM_EXTERIOR', label: 'Exterior', type: 'boolean', required: 'N' },
      { name: 'UF_CRM_FINISHES', label: 'Available Finishes', type: 'text', required: 'Y' },
      { name: 'UF_CRM_PRIMER', label: 'Paint & Primer', type: 'boolean', required: 'N' },
      { name: 'UF_CRM_PRIMER_NOTE', label: 'Primer Note', type: 'string', required: 'N' },
      { name: 'UF_CRM_RES_PRICE', label: 'Residential Price', type: 'money', required: 'Y' },
      { name: 'UF_CRM_COM_PRICE', label: 'Commercial Price', type: 'money', required: 'Y' },
      { name: 'UF_CRM_COVERAGE', label: 'Coverage (sq ft/gal)', type: 'integer', required: 'Y' },
      { name: 'UF_CRM_EXTERNAL_ID', label: 'External ID', type: 'string', required: 'Y' },
      { name: 'UF_CRM_SYNC_DATE', label: 'Last Sync Date', type: 'datetime', required: 'N' }
    ];    
    for (const field of fields) {
      try {
        console.log(`Creating field: ${field.name}...`);
        
        await callMethod('crm.userfield.add', {
          'entityId': `CRM_${smartProcessId}`,
          'label': field.label,
          'field': field.name,
          'userTypeId': field.type,
          'xmlId': field.name,
          'mandatory': field.required,
          'show_in_list': 'Y',
          'edit_in_list': field.type !== 'text' ? 'Y' : 'N',
          'is_searchable': field.name.includes('ID') || field.name.includes('NAME') ? 'Y' : 'N'
        });
        
        console.log(`  ✓ ${field.name} created`);
      } catch (error) {
        if (error.message.includes('ERROR_FIELD_ALREADY_EXISTS')) {
          console.log(`  ⚠ ${field.name} already exists`);
        } else {
          console.error(`  ✗ ${field.name} failed:`, error.message);
        }
      }
    }
    
    // Update config.js
    console.log('\n=================================');
    console.log('✅ Setup Complete!');
    console.log('=================================');
    console.log(`\nSmart Process ID: ${smartProcessId}`);
    console.log('\nUpdate your config.js with:');
    console.log(`smartProcessId: ${smartProcessId}`);
    
    // Save to a file for reference
    const fs = require('fs').promises;
    const configUpdate = `
// Add this to your config.js:
smartProcessId: ${smartProcessId}
`;
    await fs.writeFile('smart-process-id.txt', configUpdate);
    console.log('\nSmart Process ID saved to: smart-process-id.txt');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Run the setup
createSmartProcess();