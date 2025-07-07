// Paint Products Fallback
// This module provides fallback paint products data when Bitrix integration fails

(function() {
  'use strict';
  
  // Default paint products from the server's paintProducts.json
  const defaultPaintProducts = [
    {
      id: 1,
      brand: "Sherwin-Williams",
      paint: "Super Paint",
      interior: true,
      exterior: true,
      finishes: "Flat, Satin, Gloss, High Gloss",
      primer: true,
      primerNote: "marketed as paint & primer in one",
      residentialPrice: 0.95,
      commercialPrice: 0.85,
      coverage: 300
    },
    {
      id: 2,
      brand: "Sherwin-Williams",
      paint: "Self-Cleaning",
      interior: false,
      exterior: true,
      finishes: "Flat, Satin",
      primer: true,
      primerNote: "self-priming on masonry",
      residentialPrice: 1.15,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 3,
      brand: "Sherwin-Williams",
      paint: "Latitude",
      interior: false,
      exterior: true,
      finishes: "Flat, Satin, Gloss",
      primer: false,
      primerNote: "not specifically marketed as paint & primer",
      residentialPrice: 1.1,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 4,
      brand: "Sherwin-Williams",
      paint: "Emerald",
      interior: true,
      exterior: true,
      finishes: "Flat, Satin, Gloss",
      primer: true,
      primerNote: "paint & primer in one",
      residentialPrice: 1.5,
      commercialPrice: 1.3,
      coverage: 300
    },
    {
      id: 5,
      brand: "Benjamin Moore",
      paint: "Ultra Spec",
      interior: true,
      exterior: true,
      finishes: "Flat, Low Lustre, Satin, Gloss",
      primer: false,
      primerNote: "standard acrylic; typically needs primer",
      residentialPrice: 1,
      commercialPrice: 0.95,
      coverage: 250
    },
    {
      id: 6,
      brand: "Benjamin Moore",
      paint: "Crylicote",
      interior: false,
      exterior: true,
      finishes: "Flat, Satin, Semi-Gloss",
      primer: true,
      primerNote: "self-priming on most surfaces",
      residentialPrice: 1.15,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 7,
      brand: "Benjamin Moore",
      paint: "Regal",
      interior: true,
      exterior: true,
      finishes: "Flat, Low Lustre, Soft Gloss",
      primer: true,
      primerNote: "self-priming for repaints",
      residentialPrice: 1.3,
      commercialPrice: 1.25,
      coverage: 250
    },
    {
      id: 8,
      brand: "Benjamin Moore",
      paint: "Aura",
      interior: true,
      exterior: true,
      finishes: "Flat, Low Lustre, Satin, Soft Gloss",
      primer: true,
      primerNote: "marketed as paint & primer in one",
      residentialPrice: 2.1,
      commercialPrice: 1.85,
      coverage: 250
    },
    {
      id: 9,
      brand: "UCI",
      paint: "50-100",
      interior: false,
      exterior: true,
      finishes: "Satin",
      primer: false,
      primerNote: "use separate primer where needed",
      residentialPrice: 0.95,
      commercialPrice: 0.85,
      coverage: 300
    },
    {
      id: 10,
      brand: "UCI",
      paint: "Ultra",
      interior: false,
      exterior: true,
      finishes: "Satin, Gloss",
      primer: false,
      primerNote: "use separate primer on bare surfaces",
      residentialPrice: 1.1,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 11,
      brand: "UCI",
      paint: "Storm Proof",
      interior: false,
      exterior: true,
      finishes: "Flat, Low Sheen",
      primer: false,
      primerNote: "not sold as paint & primer in one",
      residentialPrice: 1.2,
      commercialPrice: 1.1,
      coverage: 300
    }
  ];

  // Convert standard products to Bitrix format for compatibility
  function convertToBitrixFormat(products) {
    return products.map(product => {
      // Parse finishes
      const finishes = product.finishes.split(',').map(f => f.trim());
      
      return {
        id: product.id,
        brand: product.brand,
        paint: product.paint,
        interior: product.interior,
        exterior: product.exterior,
        finishes: finishes,
        primer: product.primer,
        primerNote: product.primerNote,
        residentialPrice: {
          default: product.residentialPrice
        },
        commercialPrice: {
          default: product.commercialPrice
        },
        coverage: product.coverage,
        // Bitrix-style properties for compatibility
        PROPERTY_BRAND_VALUE: product.brand,
        PROPERTY_PAINT_VALUE: product.paint,
        PROPERTY_FINISH_VALUE: finishes.join(', '),
        NAME: `${product.brand} ${product.paint}`
      };
    });
  }

  // Load products from API with fallback
  async function loadPaintProducts() {
    try {
      const response = await fetch('/api/paint-products');
      if (response.ok) {
        const products = await response.json();
        return convertToBitrixFormat(products);
      }
    } catch (error) {
      console.warn('Failed to load paint products from API, using defaults:', error);
    }
    
    // Return default products if API fails
    return convertToBitrixFormat(defaultPaintProducts);
  }

  // Override BitrixService if it exists but has no products
  if (window.BitrixService) {
    const originalGetAllServices = window.BitrixService.getAllServices;
    
    window.BitrixService.getAllServices = async function() {
      const result = await originalGetAllServices.call(this);
      
      // If no paint products from Bitrix, use our fallback
      if (!result.paint || result.paint.length === 0) {
        console.log('No Bitrix paint products found, loading fallback data...');
        result.paint = await loadPaintProducts();
      }
      
      return result;
    };
  }

  // Ensure bitrixProducts is globally available
  window.bitrixProducts = window.bitrixProducts || [];
  
  // Immediately load products if BitrixService is available and has no products
  if (window.BitrixService) {
    // Check if we need to load products immediately
    (async function() {
      try {
        const services = await window.BitrixService.getAllServices();
        if (!services.paint || services.paint.length === 0) {
          console.log('No paint products found, loading fallback immediately...');
          window.bitrixProducts = await loadPaintProducts();
          console.log('Loaded', window.bitrixProducts.length, 'fallback products');
        }
      } catch (error) {
        console.error('Error checking services:', error);
      }
    })();
  }
  
  // Preload products on page load
  document.addEventListener('DOMContentLoaded', async function() {
    if (window.bitrixProducts.length === 0) {
      console.log('Preloading paint products...');
      try {
        window.bitrixProducts = await loadPaintProducts();
        console.log('Loaded', window.bitrixProducts.length, 'paint products');
        console.log('Available brands:', [...new Set(window.bitrixProducts.map(p => p.brand))]);
        
        // If the paint selection has already initialized, re-render it
        if (typeof renderPaintSelectionsEnhanced === 'function') {
          console.log('Re-rendering paint selections with loaded products...');
          renderPaintSelectionsEnhanced();
        }
      } catch (error) {
        console.error('Failed to preload paint products:', error);
        window.bitrixProducts = convertToBitrixFormat(defaultPaintProducts);
      }
    }
  });

  // Also expose as a global for direct access
  window.PaintProductsFallback = {
    getProducts: loadPaintProducts,
    defaultProducts: convertToBitrixFormat(defaultPaintProducts)
  };

})();