// Test Production Backend Script
// This script tests what the production backend returns

(async function() {
  'use strict';
  
  console.log('=== Testing Production Backend ===');
  
  const PROD_URL = 'https://hartzell-paint-api.onrender.com/api/bitrix/';
  const LOCAL_URL = 'http://localhost:3000/api/bitrix/';
  
  // Test function
  async function testBackend(url, name) {
    console.log(`\nTesting ${name} (${url})...`);
    
    try {
      const response = await fetch(url + 'crm.item.list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entityTypeId: 1058,
          select: ['id', 'title', 'ufCrm7Brand', 'ufCrm7ServiceType'],
          filter: {
            'ufCrm7ServiceType': 2089
          },
          limit: 100
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`${name} error:`, data.error_description || data.error);
        return;
      }
      
      if (data.result && data.result.items) {
        console.log(`${name} returned ${data.result.items.length} items`);
        
        // Group by brand
        const brands = {};
        data.result.items.forEach(item => {
          const brand = item.ufCrm7Brand || 'Unknown';
          if (!brands[brand]) brands[brand] = 0;
          brands[brand]++;
        });
        
        console.log(`Brands found:`);
        Object.keys(brands).forEach(brand => {
          console.log(`  ${brand}: ${brands[brand]} items`);
        });
      } else {
        console.log(`${name} returned no items`);
      }
    } catch (error) {
      console.error(`${name} connection error:`, error.message);
    }
  }
  
  // Test both backends
  await testBackend(LOCAL_URL, 'LOCAL Backend');
  await testBackend(PROD_URL, 'PRODUCTION Backend');
  
  console.log('\n=== Test Complete ===');
})();