/**
 * Create Template Fields for Bitrix24
 * Adds custom fields to track template information in CRM
 */

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

// Template-specific fields to create
const TEMPLATE_FIELDS = [
  {
    field: 'UF_CONTRACT_TEMPLATE',
    type: 'string',
    editFormLabel: 'Contract Template',
    listColumnLabel: 'Template',
    isRequired: 'N',
    multiple: 'N',
    sort: 500,
    showInList: 'Y',
    editInList: 'Y',
    isSearchable: 'Y',
    settings: {
      SIZE: 50,
      ROWS: 1,
      REGEXP: '',
      MIN_LENGTH: 0,
      MAX_LENGTH: 50,
      DEFAULT_VALUE: ''
    }
  },
  {
    field: 'UF_TEMPLATE_VERSION',
    type: 'string',
    editFormLabel: 'Template Version',
    listColumnLabel: 'Version',
    isRequired: 'N',
    multiple: 'N',
    sort: 510,
    showInList: 'N',
    editInList: 'N',
    isSearchable: 'N',
    settings: {
      SIZE: 10,
      ROWS: 1,
      REGEXP: '',
      MIN_LENGTH: 0,
      MAX_LENGTH: 10,
      DEFAULT_VALUE: '1.0'
    }
  },
  {
    field: 'UF_WORK_ORDER_MODE',
    type: 'boolean',
    editFormLabel: 'Work Order',
    listColumnLabel: 'Work Order',
    isRequired: 'N',
    multiple: 'N',
    sort: 520,
    showInList: 'Y',
    editInList: 'Y',
    isSearchable: 'Y',
    settings: {
      DEFAULT_VALUE: 0,
      DISPLAY: 'CHECKBOX',
      LABEL: ['No', 'Yes']
    }
  },
  {
    field: 'UF_CONTRACT_STATUS',
    type: 'enumeration',
    editFormLabel: 'Contract Status',
    listColumnLabel: 'Status',
    isRequired: 'N',
    multiple: 'N',
    sort: 530,
    showInList: 'Y',
    editInList: 'Y',
    isSearchable: 'Y',
    items: [
      { VALUE: 'draft', DEF: 'Y' },
      { VALUE: 'generated' },
      { VALUE: 'sent' },
      { VALUE: 'viewed' },
      { VALUE: 'signed' },
      { VALUE: 'completed' },
      { VALUE: 'cancelled' }
    ]
  },
  {
    field: 'UF_DEPOSIT_PERCENT',
    type: 'double',
    editFormLabel: 'Deposit Percentage',
    listColumnLabel: 'Deposit %',
    isRequired: 'N',
    multiple: 'N',
    sort: 540,
    showInList: 'Y',
    editInList: 'Y',
    isSearchable: 'N',
    settings: {
      PRECISION: 2,
      MIN_VALUE: 0,
      MAX_VALUE: 100,
      DEFAULT_VALUE: ''
    }
  },
  {
    field: 'UF_DEPOSIT_AMOUNT',
    type: 'money',
    editFormLabel: 'Deposit Amount',
    listColumnLabel: 'Deposit',
    isRequired: 'N',
    multiple: 'N',
    sort: 550,
    showInList: 'Y',
    editInList: 'Y',
    isSearchable: 'N',
    settings: {
      DEFAULT_VALUE: ''
    }
  },
  {
    field: 'UF_TEMPLATE_REASON',
    type: 'text',
    editFormLabel: 'Template Selection Reason',
    listColumnLabel: 'Selection Reason',
    isRequired: 'N',
    multiple: 'N',
    sort: 560,
    showInList: 'N',
    editInList: 'Y',
    isSearchable: 'N',
    settings: {
      ROWS: 3,
      DEFAULT_VALUE: ''
    }
  },
  {
    field: 'UF_TEMPLATE_SCORE',
    type: 'double',
    editFormLabel: 'Template Match Score',
    listColumnLabel: 'Match Score',
    isRequired: 'N',
    multiple: 'N',
    sort: 570,
    showInList: 'N',
    editInList: 'N',
    isSearchable: 'N',
    settings: {
      PRECISION: 2,
      MIN_VALUE: 0,
      MAX_VALUE: 1,
      DEFAULT_VALUE: ''
    }
  },
  {
    field: 'UF_CONTRACT_GENERATED',
    type: 'datetime',
    editFormLabel: 'Contract Generated Date',
    listColumnLabel: 'Generated',
    isRequired: 'N',
    multiple: 'N',
    sort: 580,
    showInList: 'Y',
    editInList: 'N',
    isSearchable: 'Y',
    settings: {
      DEFAULT_VALUE: {
        TYPE: 'NONE',
        VALUE: ''
      },
      USE_SECOND: 'Y',
      USE_TIMEZONE: 'Y'
    }
  }
];

async function createTemplateFields() {
  console.log('Creating Template Fields for Bitrix24...\n');
  console.log(`Smart Process ID: ${smartProcessId}`);
  console.log(`Total fields to create: ${TEMPLATE_FIELDS.length}\n`);

  const results = {
    success: [],
    failed: []
  };

  for (const fieldConfig of TEMPLATE_FIELDS) {
    try {
      console.log(`Creating field: ${fieldConfig.field} (${fieldConfig.editFormLabel})...`);
      
      const params = {
        entityId: `CRM_${smartProcessId}`,
        field: {
          field: fieldConfig.field,
          type: fieldConfig.type,
          editFormLabel: fieldConfig.editFormLabel,
          listColumnLabel: fieldConfig.listColumnLabel,
          isRequired: fieldConfig.isRequired,
          multiple: fieldConfig.multiple,
          sort: fieldConfig.sort,
          showInList: fieldConfig.showInList,
          editInList: fieldConfig.editInList,
          isSearchable: fieldConfig.isSearchable
        }
      };

      // Add type-specific settings
      if (fieldConfig.settings) {
        params.field.settings = fieldConfig.settings;
      }

      // Add enumeration items if applicable
      if (fieldConfig.type === 'enumeration' && fieldConfig.items) {
        params.field.items = fieldConfig.items;
      }

      const result = await callMethod('crm.item.fields.add', params);
      
      console.log(`✓ Created successfully: ${fieldConfig.field}`);
      results.success.push({
        field: fieldConfig.field,
        label: fieldConfig.editFormLabel,
        result
      });
      
    } catch (error) {
      console.error(`✗ Failed to create field ${fieldConfig.field}:`, error.message);
      results.failed.push({
        field: fieldConfig.field,
        label: fieldConfig.editFormLabel,
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Successfully created: ${results.success.length} fields`);
  console.log(`Failed: ${results.failed.length} fields`);

  if (results.success.length > 0) {
    console.log('\nCreated fields:');
    results.success.forEach(field => {
      console.log(`  ✓ ${field.field} - ${field.label}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\nFailed fields:');
    results.failed.forEach(field => {
      console.log(`  ✗ ${field.field} - ${field.label}: ${field.error}`);
    });
  }

  // Export field mapping for use in integration
  console.log('\n========== FIELD MAPPING ==========');
  console.log('// Add to field-config.js:');
  console.log('const TEMPLATE_FIELD_MAPPING = {');
  TEMPLATE_FIELDS.forEach(field => {
    const key = field.field.replace('UF_', '').toLowerCase();
    console.log(`  ${key}: '${field.field}',`);
  });
  console.log('};');

  return results;
}

// Run if executed directly
if (require.main === module) {
  createTemplateFields()
    .then(results => {
      console.log('\nTemplate field creation completed.');
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createTemplateFields, TEMPLATE_FIELDS };