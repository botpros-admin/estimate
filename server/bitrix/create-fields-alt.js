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
async function tryMethod1() {
  console.log('Method 1: Using userfieldconfig.add...\n');
  
  try {
    const result = await callMethod('userfieldconfig.add', {
      'moduleId': 'crm',
      'field': {
        'entityId': `CRM_${smartProcessId}`,
        'fieldName': 'UF_CRM_BRAND',
        'userTypeId': 'string',
        'xmlId': 'UF_CRM_BRAND',
        'multiple': 'N',
        'mandatory': 'Y',
        'showFilter': 'Y',
        'showInList': 'Y',
        'editInList': 'Y',
        'isSearchable': 'Y',
        'editFormLabel': {
          'en': 'Brand'
        },
        'listColumnLabel': {
          'en': 'Brand'
        },
        'filterLabel': {
          'en': 'Brand'
        }
      }
    });
    
    console.log('✅ Success with userfieldconfig.add!');
    return true;
  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
    return false;
  }
}

async function tryMethod2() {
  console.log('\nMethod 2: Using entity.item.property.add...\n');
  
  try {
    const result = await callMethod('entity.item.property.add', {
      'ENTITY': `CRM_${smartProcessId}`,
      'PROPERTY': 'string',
      'NAME': 'Brand',
      'CODE': 'UF_CRM_BRAND'
    });    
    console.log('✅ Success with entity.item.property.add!');
    return true;
  } catch (error) {
    console.log('❌ Method 2 failed:', error.message);
    return false;
  }
}

async function tryMethod3() {
  console.log('\nMethod 3: Using crm.type.fields.edit...\n');
  
  try {
    // First get current fields
    const currentFields = await callMethod('crm.item.fields', {
      'entityTypeId': smartProcessId
    });
    
    // Try to add new field via type fields edit
    const result = await callMethod('crm.type.fields.edit', {
      'entityTypeId': smartProcessId,
      'fields': {
        'UF_CRM_BRAND': {
          'type': 'string',
          'isRequired': true,
          'title': 'Brand'
        }
      }
    });
    
    console.log('✅ Success with crm.type.fields.edit!');
    return true;
  } catch (error) {
    console.log('❌ Method 3 failed:', error.message);
    return false;
  }
}

async function tryMethod4() {
  console.log('\nMethod 4: Using batch operation...\n');
  
  try {
    const batch = {
      'halt': 0,
      'cmd': {
        'field1': `userfieldtype.add?ENTITY_ID=CRM_${smartProcessId}&FIELD_NAME=UF_CRM_BRAND&USER_TYPE_ID=string&XML_ID=UF_CRM_BRAND&MANDATORY=Y`
      }
    };    
    const result = await callMethod('batch', batch);
    console.log('✅ Success with batch operation!');
    return true;
  } catch (error) {
    console.log('❌ Method 4 failed:', error.message);
    return false;
  }
}

async function tryMethod5() {
  console.log('\nMethod 5: Using REST entity configuration...\n');
  
  try {
    // Try different entity ID format
    const result = await callMethod('entity.add', {
      'ENTITY': `CRM_TYPE_${smartProcessId}`,
      'NAME': 'Brand',
      'ACCESS': {
        'U1': 'W'  // Write access for user 1
      },
      'PROPERTY_STRING': {
        'UF_CRM_BRAND': 'Brand'
      }
    });
    
    console.log('✅ Success with entity.add!');
    return true;
  } catch (error) {
    console.log('❌ Method 5 failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('===========================================');
  console.log('Testing Different Field Creation Methods');
  console.log('===========================================\n');
  
  // Try each method
  const methods = [
    tryMethod1,
    tryMethod2,
    tryMethod3,
    tryMethod4,
    tryMethod5
  ];
  
  for (const method of methods) {
    const success = await method();
    if (success) {
      console.log('\n🎉 Found working method! Now creating all fields...');
      // If we find a working method, we'd use it to create all fields
      break;
    }
  }
}

main().catch(console.error);