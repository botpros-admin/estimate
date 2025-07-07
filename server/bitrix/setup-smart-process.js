const https = require('https');
const querystring = require('querystring');

class BitrixSetup {
  constructor(webhookUrl, userId = 1) {
    this.webhookUrl = webhookUrl;
    this.userId = userId;
    this.smartProcessId = null;
  }

  /**
   * Execute Bitrix REST API call
   */
  async callMethod(method, params = {}) {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        ...params,
        auth: this.userId
      });

      const url = new URL(this.webhookUrl);
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

      req.on('error', reject);      req.write(postData);
      req.end();
    });
  }

  /**
   * Create Smart Process (Dynamic CRM Type)
   */
  async createSmartProcess() {
    console.log('Creating Smart Process...');
    
    try {
      const result = await this.callMethod('crm.type.add', {
        fields: {
          title: 'Paint Products',
          name: 'PAINT_PRODUCTS',
          isUseInUserfieldEnabled: 'Y',
          isLinkTrackingEnabled: 'Y',
          isRecyclebinEnabled: 'Y',
          isAutomationEnabled: 'Y',
          isBizProcEnabled: 'Y',
          isSetOpenPermissions: 'Y',
          isPaymentsEnabled: 'N',
          isCountersEnabled: 'Y'
        }
      });

      this.smartProcessId = result.type.entityTypeId;
      console.log(`✓ Smart Process created with ID: ${this.smartProcessId}`);
      return this.smartProcessId;
    } catch (error) {
      // Check if already exists
      if (error.message.includes('DUPLICATE_ENTITY_TYPE')) {
        console.log('Smart Process already exists, fetching ID...');
        return await this.findExistingSmartProcess();
      }
      throw error;
    }
  }

  /**
   * Find existing Smart Process by name
   */
  async findExistingSmartProcess() {
    const types = await this.callMethod('crm.type.list');
    const paintProcess = types.types.find(t => t.name === 'PAINT_PRODUCTS');
    
    if (paintProcess) {
      this.smartProcessId = paintProcess.entityTypeId;
      console.log(`✓ Found existing Smart Process with ID: ${this.smartProcessId}`);
      return this.smartProcessId;    }
    throw new Error('Paint Products Smart Process not found');
  }

  /**
   * Create custom fields for the Smart Process
   */
  async createCustomFields() {
    if (!this.smartProcessId) {
      throw new Error('Smart Process ID not set. Create process first.');
    }

    console.log('\nCreating custom fields...');
    
    const fields = [
      {
        name: 'UF_CRM_BRAND',
        editFormLabel: 'Brand',
        listColumnLabel: 'Brand',
        type: 'string',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'Y',
        isSearchable: 'Y'
      },
      {
        name: 'UF_CRM_PAINT_NAME',
        editFormLabel: 'Paint Name',
        listColumnLabel: 'Paint Name',
        type: 'string',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'Y',
        isSearchable: 'Y'
      },
      {
        name: 'UF_CRM_INTERIOR',
        editFormLabel: 'Interior',
        listColumnLabel: 'Interior',
        type: 'boolean',
        isRequired: 'N',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_EXTERIOR',
        editFormLabel: 'Exterior',
        listColumnLabel: 'Exterior',
        type: 'boolean',
        isRequired: 'N',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_FINISHES',
        editFormLabel: 'Available Finishes',
        listColumnLabel: 'Finishes',
        type: 'text',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'N'
      },
      {
        name: 'UF_CRM_PRIMER',
        editFormLabel: 'Paint & Primer',
        listColumnLabel: 'Primer',
        type: 'boolean',
        isRequired: 'N',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_PRIMER_NOTE',
        editFormLabel: 'Primer Note',
        listColumnLabel: 'Primer Note',
        type: 'string',
        isRequired: 'N',
        showInList: 'N',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_RES_PRICE',
        editFormLabel: 'Residential Price',
        listColumnLabel: 'Res. Price',
        type: 'money',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_COM_PRICE',
        editFormLabel: 'Commercial Price',
        listColumnLabel: 'Com. Price',
        type: 'money',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_COVERAGE',
        editFormLabel: 'Coverage (sq ft/gal)',
        listColumnLabel: 'Coverage',
        type: 'integer',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'Y'
      },
      {
        name: 'UF_CRM_EXTERNAL_ID',
        editFormLabel: 'External ID',
        listColumnLabel: 'Ext. ID',
        type: 'string',
        isRequired: 'Y',
        showInList: 'Y',
        editInList: 'N',
        isSearchable: 'Y'
      },
      {
        name: 'UF_CRM_SYNC_DATE',
        editFormLabel: 'Last Sync Date',
        listColumnLabel: 'Sync Date',
        type: 'datetime',
        isRequired: 'N',
        showInList: 'Y',
        editInList: 'N'
      }
    ];

    const results = [];
    
    for (const field of fields) {
      try {
        console.log(`  Creating field: ${field.name}...`);
        
        const result = await this.callMethod('crm.userfield.add', {
          entityId: `CRM_${this.smartProcessId}`,
          label: field.editFormLabel,
          field: field.name,
          userTypeId: field.type,
          xmlId: field.name,
          mandatory: field.isRequired,
          show_in_list: field.showInList,
          edit_in_list: field.editInList,
          is_searchable: field.isSearchable || 'N'
        });        
        results.push({ field: field.name, success: true, id: result });
        console.log(`    ✓ ${field.name} created`);
      } catch (error) {
        if (error.message.includes('ERROR_FIELD_ALREADY_EXISTS')) {
          console.log(`    ⚠ ${field.name} already exists`);
          results.push({ field: field.name, success: true, exists: true });
        } else {
          console.error(`    ✗ ${field.name} failed: ${error.message}`);
          results.push({ field: field.name, success: false, error: error.message });
        }
      }
    }
    
    return results;
  }

  /**
   * Setup stages for the Smart Process
   */
  async setupStages() {
    if (!this.smartProcessId) {
      throw new Error('Smart Process ID not set');
    }

    console.log('\nSetting up stages...');
    
    const stages = [
      { name: 'NEW', title: 'New', sort: 10, color: '#00C4FB' },
      { name: 'ACTIVE', title: 'Active', sort: 20, color: '#47E4C2' },
      { name: 'DISCONTINUED', title: 'Discontinued', sort: 30, color: '#FFA900' },
      { name: 'ARCHIVED', title: 'Archived', sort: 40, color: '#7A7A7A' }
    ];

    // Note: Bitrix may not allow custom stages via API for all plans
    // This is a placeholder for when/if the API supports it
    console.log('  ⚠ Stage setup may require manual configuration in Bitrix UI');
    return stages;
  }

  /**
   * Run complete setup
   */
  async runSetup() {
    console.log('=================================');
    console.log('Bitrix Smart Process Setup');
    console.log('=================================\n');
    
    try {      // Step 1: Create or find Smart Process
      await this.createSmartProcess();
      
      // Step 2: Create custom fields
      const fieldResults = await this.createCustomFields();
      
      // Step 3: Setup stages (if supported)
      await this.setupStages();
      
      // Summary
      console.log('\n=================================');
      console.log('Setup Complete!');
      console.log('=================================');
      console.log(`Smart Process ID: ${this.smartProcessId}`);
      console.log(`Fields created: ${fieldResults.filter(f => f.success && !f.exists).length}`);
      console.log(`Fields existing: ${fieldResults.filter(f => f.exists).length}`);
      console.log(`Fields failed: ${fieldResults.filter(f => !f.success).length}`);
      
      // Update config
      console.log('\nUpdate your config.js with:');
      console.log(`smartProcessId: ${this.smartProcessId}`);
      
      return {
        smartProcessId: this.smartProcessId,
        fields: fieldResults
      };
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      throw error;
    }
  }
}

// Command line execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node setup-smart-process.js <webhook_url> [user_id]');
    console.log('Example: node setup-smart-process.js https://mycompany.bitrix24.com/rest/1/abc123xyz/');
    process.exit(1);
  }
  
  const webhookUrl = args[0];
  const userId = args[1] || 1;
  
  const setup = new BitrixSetup(webhookUrl, userId);
  setup.runSetup().catch(console.error);
}

module.exports = BitrixSetup;