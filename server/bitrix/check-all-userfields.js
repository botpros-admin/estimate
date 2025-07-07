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

async function checkAllUserFields() {
  console.log('🔍 Checking ALL user fields...\n');
  
  try {
    // Get ALL userfields
    const allFields = await callMethod('user.userfield.list', {});    
    console.log(`Total fields found: ${allFields.length}\n`);
    
    // Filter for our Smart Process
    const ourFields = allFields.filter(f => f.ENTITY_ID === `CRM_${smartProcessId}`);
    
    console.log(`Fields for Smart Process ${smartProcessId}:`);
    console.log('=====================================\n');
    
    ourFields.forEach((field, index) => {
      console.log(`Field ${index + 1}:`);
      console.log(`  Name: ${field.FIELD_NAME}`);
      console.log(`  Type: ${field.USER_TYPE_ID}`);
      console.log(`  Label: ${field.EDIT_FORM_LABEL?.en || 'N/A'}`);
      console.log(`  Required: ${field.MANDATORY}`);
      console.log(`  XML_ID: ${field.XML_ID}`);
      console.log('');
    });
    
    // Create proper field mapping based on XML_ID or order
    const fieldMapping = {
      'UF_CRM_BRAND': ourFields.find(f => f.XML_ID === 'UF_CRM_BRAND')?.FIELD_NAME,
      'UF_CRM_PAINT_NAME': ourFields.find(f => f.XML_ID === 'UF_CRM_PAINT_NAME')?.FIELD_NAME,
      'UF_CRM_INTERIOR': ourFields.find(f => f.XML_ID === 'UF_CRM_INTERIOR')?.FIELD_NAME,
      'UF_CRM_EXTERIOR': ourFields.find(f => f.XML_ID === 'UF_CRM_EXTERIOR')?.FIELD_NAME,
      'UF_CRM_FINISHES': ourFields.find(f => f.XML_ID === 'UF_CRM_FINISHES')?.FIELD_NAME,
      'UF_CRM_PRIMER': ourFields.find(f => f.XML_ID === 'UF_CRM_PRIMER')?.FIELD_NAME,
      'UF_CRM_PRIMER_NOTE': ourFields.find(f => f.XML_ID === 'UF_CRM_PRIMER_NOTE')?.FIELD_NAME,
      'UF_CRM_RES_PRICE': ourFields.find(f => f.XML_ID === 'UF_CRM_RES_PRICE')?.FIELD_NAME,
      'UF_CRM_COM_PRICE': ourFields.find(f => f.XML_ID === 'UF_CRM_COM_PRICE')?.FIELD_NAME,
      'UF_CRM_COVERAGE': ourFields.find(f => f.XML_ID === 'UF_CRM_COVERAGE')?.FIELD_NAME,
      'UF_CRM_EXTERNAL_ID': ourFields.find(f => f.XML_ID === 'UF_CRM_EXTERNAL_ID')?.FIELD_NAME,
      'UF_CRM_SYNC_DATE': ourFields.find(f => f.XML_ID === 'UF_CRM_SYNC_DATE')?.FIELD_NAME
    };
    
    console.log('\nField Mapping:');
    console.log('==============');
    Object.entries(fieldMapping).forEach(([intended, actual]) => {
      console.log(`${intended} => ${actual || 'NOT FOUND'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllUserFields();