// Bitrix API Debug Script
// This script tests the Bitrix API to see what paint products are actually available

(async function() {
  'use strict';
  
  const BACKEND_URL = 'http://localhost:3000/api/bitrix/';
  
  console.log('=== Bitrix API Debug ===');
  console.log('Testing Bitrix Service Catalog...\n');
  
  // Test 1: Get ALL items without any filter
  try {
    console.log('Test 1: Fetching ALL items (no filter)...');
    const response = await fetch(BACKEND_URL + 'crm.item.list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entityTypeId: 1058, // SERVICE_CATALOG_SPA_ID
        select: ['id', 'title', 'ufCrm7Brand', 'ufCrm7ServiceType'],
        limit: 100
      })
    });
    
    const data = await response.json();
    if (data.result && data.result.items) {
      console.log(`Found ${data.result.items.length} total items`);
      
      // Group by brand
      const byBrand = {};
      data.result.items.forEach(item => {
        const brand = item.ufCrm7Brand || 'Unknown';
        if (!byBrand[brand]) byBrand[brand] = [];
        byBrand[brand].push(item);
      });
      
      console.log('\nItems by brand:');
      Object.keys(byBrand).forEach(brand => {
        console.log(`  ${brand}: ${byBrand[brand].length} items`);
      });
      
      // Check service types
      const serviceTypes = new Set();
      data.result.items.forEach(item => {
        if (item.ufCrm7ServiceType) {
          serviceTypes.add(item.ufCrm7ServiceType);
        }
      });
      
      console.log('\nUnique service type IDs found:', Array.from(serviceTypes));
      
      // Show first few items from each brand
      console.log('\nSample items:');
      Object.keys(byBrand).slice(0, 3).forEach(brand => {
        console.log(`\n${brand}:`);
        byBrand[brand].slice(0, 2).forEach(item => {
          console.log(`  - ${item.title} (ID: ${item.id}, ServiceType: ${item.ufCrm7ServiceType})`);
        });
      });
    }
  } catch (error) {
    console.error('Test 1 failed:', error);
  }
  
  // Test 2: Get items WITH the service type filter
  try {
    console.log('\n\nTest 2: Fetching items WITH ServiceType filter (2089)...');
    const response = await fetch(BACKEND_URL + 'crm.item.list', {
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
    if (data.result && data.result.items) {
      console.log(`Found ${data.result.items.length} items with ServiceType=2089`);
      
      // Group by brand
      const byBrand = {};
      data.result.items.forEach(item => {
        const brand = item.ufCrm7Brand || 'Unknown';
        if (!byBrand[brand]) byBrand[brand] = [];
        byBrand[brand].push(item);
      });
      
      console.log('\nFiltered items by brand:');
      Object.keys(byBrand).forEach(brand => {
        console.log(`  ${brand}: ${byBrand[brand].length} items`);
      });
    }
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
  
  console.log('\n=== Debug Complete ===');
})();