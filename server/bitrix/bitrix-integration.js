const https = require('https');
const querystring = require('querystring');

class BitrixIntegration {
  constructor(config) {
    this.webhookUrl = config.webhookUrl; // Your Bitrix inbound webhook URL
    this.userId = config.userId || 1; // Bitrix user ID
    this.smartProcessId = config.smartProcessId; // Smart Process ID for Paint Products
  }

  /**
   * Create or update a paint product in Bitrix Smart Process
   * @param {Object} product - Paint product data
   * @param {boolean} isUpdate - Whether this is an update operation
   */
  async syncProduct(product, isUpdate = false) {
    try {
      // Create detailed description with all product data
      const description = `
Brand: ${product.brand}
Paint: ${product.paint}
Interior: ${product.interior ? 'Yes' : 'No'}
Exterior: ${product.exterior ? 'Yes' : 'No'}
Finishes: ${product.finishes}
Paint & Primer: ${product.primer ? 'Yes' : 'No'}
Primer Note: ${product.primerNote || 'N/A'}
Residential Price: $${product.residentialPrice}/sq ft
Commercial Price: $${product.commercialPrice}/sq ft
Coverage: ${product.coverage} sq ft/gal
External ID: ${product.id}
Last Sync: ${new Date().toISOString()}
      `.trim();

      // Map product data to Bitrix fields using actual field names
      const bitrixFields = {
        // Standard fields
        'title': `${product.brand} - ${product.paint}`,
        'opened': 'Y',
        
        // Custom fields with actual Bitrix field names
        'ufCrm7Brand': product.brand,
        'ufCrm7PaintName': product.paint,
        'ufCrm7Interior': product.interior ? 'Y' : 'N',
        'ufCrm7Exterior': product.exterior ? 'Y' : 'N',
        'ufCrm7Finishes': product.finishes,
        'ufCrm7Primer': product.primer ? 'Y' : 'N',
        'ufCrm7PrimerNote': product.primerNote || '',
        'ufCrm7ResPrice': product.residentialPrice,
        'ufCrm7ComPrice': product.commercialPrice,
        'ufCrm7Coverage': product.coverage,
        'ufCrm7ExternalId': product.id.toString(),
        'ufCrm7SyncDate': new Date().toISOString()
      };

      let method;
      let params = {};

      if (isUpdate && product.bitrixId) {
        // Update existing item
        method = `crm.item.update`;
        params.entityTypeId = this.smartProcessId;
        params.id = product.bitrixId;
        
        // Format fields for update
        Object.keys(bitrixFields).forEach(key => {
          params[`fields[${key}]`] = bitrixFields[key];
        });
      } else {
        // Create new item or update by external ID
        method = `crm.item.add`;
        params.entityTypeId = this.smartProcessId;
        
        // Format fields for create
        Object.keys(bitrixFields).forEach(key => {
          params[`fields[${key}]`] = bitrixFields[key];
        });
      }

      const result = await this.callBitrixMethod(method, params);
      
      // If we created a new item, we might want to check if one already exists with this external ID
      if (!isUpdate && result.item) {
        // Search for existing item with same external ID
        const existingItem = await this.findProductByExternalId(product.id);
        if (existingItem) {
          // Update the existing item instead
          const updateParams = {
            'entityTypeId': this.smartProcessId,
            'id': existingItem.id
          };
          
          // Copy fields without stage ID
          Object.keys(bitrixFields).forEach(key => {
            if (key !== 'STAGE_ID') {
              updateParams[`fields[${key}]`] = bitrixFields[key];
            }
          });
          
          return await this.callBitrixMethod('crm.item.update', updateParams);
        }
      }

      return result;
    } catch (error) {
      console.error('Error syncing product to Bitrix:', error);
      throw error;
    }
  }

  /**
   * Find a product in Bitrix by external ID
   */
  async findProductByExternalId(externalId) {
    try {
      const params = {
        'entityTypeId': this.smartProcessId,
        'filter[ufCrm7ExternalId]': externalId.toString()
      };

      const result = await this.callBitrixMethod('crm.item.list', params);
      
      if (result.items && result.items.length > 0) {
        return result.items[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product in Bitrix:', error);
      return null;
    }
  }

  /**
   * Delete a product from Bitrix
   */
  async deleteProduct(productId) {
    try {
      const bitrixItem = await this.findProductByExternalId(productId);
      if (bitrixItem) {
        const params = {
          entityTypeId: this.smartProcessId,
          id: bitrixItem.id
        };
        return await this.callBitrixMethod('crm.item.delete', params);
      }
      return { success: true, message: 'Product not found in Bitrix' };
    } catch (error) {
      console.error('Error deleting product from Bitrix:', error);
      throw error;
    }
  }

  /**
   * Batch sync all products
   */
  async batchSync(products) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const product of products) {
      try {
        await this.syncProduct(product);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: product.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Call Bitrix REST API method
   */
  async callBitrixMethod(method, params = {}) {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify(params);

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

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.error) {
              reject(new Error(result.error_description || result.error));
            } else {
              resolve(result.result);
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Get webhook handler for receiving updates from Bitrix
   */
  getWebhookHandler() {
    return async (req, res) => {
      try {
        // Parse incoming webhook data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          const data = JSON.parse(body);
          
          // Handle different event types
          switch(data.event) {
            case 'ONCRMITEMUPDATE':
              // Handle update from Bitrix
              console.log('Product updated in Bitrix:', data);
              // You can implement reverse sync here if needed
              break;
            
            case 'ONCRMITEMDELETE':
              // Handle deletion from Bitrix
              console.log('Product deleted in Bitrix:', data);
              break;
            
            default:
              console.log('Unknown Bitrix event:', data.event);
          }

          res.writeHead(200);
          res.end('OK');
        });
      } catch (error) {
        console.error('Webhook handler error:', error);
        res.writeHead(500);
        res.end('Error');
      }
    };
  }
}

module.exports = BitrixIntegration;