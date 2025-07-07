// Enhanced Bitrix API Debug Script
// This script tests the complete flow from Bitrix to the UI

(async function() {
  'use strict';
  
  console.log('=== Enhanced Bitrix Debug ===\n');
  
  // First, let's see what BitrixService returns
  if (window.BitrixService) {
    console.log('1. Testing BitrixService.getAllServices()...');
    try {
      const services = await window.BitrixService.getAllServices();
      console.log('Results from BitrixService:');
      console.log(`  - Paint products: ${services.paint ? services.paint.length : 0}`);
      console.log(`  - Abrasive services: ${services.abrasive ? services.abrasive.length : 0}`);
      
      if (services.paint && services.paint.length > 0) {
        // Group by brand
        const brands = {};
        services.paint.forEach(product => {
          const brand = product.brand || 'Unknown';
          if (!brands[brand]) brands[brand] = 0;
          brands[brand]++;
        });
        
        console.log('\nPaint products by brand:');
        Object.keys(brands).forEach(brand => {
          console.log(`  ${brand}: ${brands[brand]} products`);
        });
        
        // Show sample products
        console.log('\nFirst 3 products:');
        services.paint.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.brand} - ${product.name || product.title}`);
          console.log(`     Interior: ${product.interior}, Exterior: ${product.exterior}`);
        });
      }
    } catch (error) {
      console.error('BitrixService error:', error);
    }
  }
  
  // Check window.bitrixProducts
  console.log('\n2. Checking window.bitrixProducts...');
  if (window.bitrixProducts) {
    console.log(`Found ${window.bitrixProducts.length} products in window.bitrixProducts`);
    
    if (window.bitrixProducts.length > 0) {
      const brands = {};
      window.bitrixProducts.forEach(product => {
        const brand = product.brand || 'Unknown';
        if (!brands[brand]) brands[brand] = 0;
        brands[brand]++;
      });
      
      console.log('By brand:');
      Object.keys(brands).forEach(brand => {
        console.log(`  ${brand}: ${brands[brand]} products`);
      });
    }
  } else {
    console.log('window.bitrixProducts is undefined');
  }
  
  // Check localStorage cache
  console.log('\n3. Checking localStorage cache...');
  const cached = localStorage.getItem('paintProducts_fallback');
  if (cached) {
    try {
      const data = JSON.parse(cached);
      console.log(`Cache contains ${data.products ? data.products.length : 0} products`);
      console.log(`Cache timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    } catch (e) {
      console.log('Cache is corrupted');
    }
  } else {
    console.log('No cache found');
  }
  
  // Check if fallback is being used
  console.log('\n4. Checking if fallback is active...');
  if (window.PaintProductsFallback) {
    console.log('PaintProductsFallback is loaded');
    const fallbackProducts = await window.PaintProductsFallback.getProducts();
    console.log(`Fallback would provide ${fallbackProducts.length} products`);
  } else {
    console.log('PaintProductsFallback not loaded');
  }
  
  console.log('\n=== Debug Complete ===');
})();