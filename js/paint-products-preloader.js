// Paint Products Preloader
// This script ensures paint products are loaded and cached early in the user flow
// Should be included on project-info.html or earlier pages

(function() {
  'use strict';
  
  // Only run if we haven't already preloaded
  if (window.paintProductsPreloaded) return;
  
  console.log('Preloading paint products...');
  
  // Function to preload paint products
  async function preloadPaintProducts() {
    try {
      // Check if we already have cached products
      const CACHE_KEY = 'paintProducts_fallback';
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        try {
          const data = JSON.parse(cached);
          // Check if cache is still valid (24 hours)
          if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            console.log('Paint products already cached, skipping preload');
            return;
          }
        } catch (e) {
          // Invalid cache, continue with preload
        }
      }
      
      // Try to load from API
      let products = null;
      try {
        const response = await fetch('/api/paint-products');
        if (response.ok) {
          products = await response.json();
          console.log('Preloaded', products.length, 'products from API');
        }
      } catch (error) {
        console.warn('API preload failed:', error);
      }
      
      // If API failed, ensure we have the default products ready
      if (!products || products.length === 0) {
        // We'll let the main fallback script handle loading defaults
        console.log('API unavailable, fallback will load defaults when needed');
      } else {
        // Cache the products for later use
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          products: products,
          timestamp: Date.now()
        }));
        console.log('Paint products preloaded and cached');
      }
      
    } catch (error) {
      console.error('Error in paint products preloader:', error);
    }
  }
  
  // Mark as preloaded
  window.paintProductsPreloaded = true;
  
  // Start preloading
  preloadPaintProducts();
  
})();