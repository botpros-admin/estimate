// Paint Products Service
// This module provides access to paint products data throughout the application

const PaintProductsService = (function() {
  'use strict';
  
  // API Base URL
  const API_BASE = window.location.origin + '/api';
  
  // Cache for paint products
  let cachedProducts = null;
  let cacheTimestamp = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Default products (fallback)
  const defaultProducts = [
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
      residentialPrice: 1.10,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 4,
      brand: "Sherwin-Williams",
      paint: "Emerald",
      interior: true,
      exterior: true,
      finishes: "Flat, Satin, Gloss (plus \"Rain Refresh\" variant)",
      primer: true,
      primerNote: "paint & primer in one",
      residentialPrice: 1.50,
      commercialPrice: 1.30,
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
      residentialPrice: 1.00,
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
      finishes: "Flat, Low Lustre, Soft Gloss (sometimes sold as \"High Build\")",
      primer: true,
      primerNote: "self-priming for repaints",
      residentialPrice: 1.30,
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
      residentialPrice: 2.10,
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
      finishes: "Typically Satin or Gloss (e.g., #57-100 is gloss)",
      primer: false,
      primerNote: "use separate primer on bare surfaces",
      residentialPrice: 1.10,
      commercialPrice: 1.05,
      coverage: 250
    },
    {
      id: 11,
      brand: "UCI",
      paint: "Storm Proof",
      interior: false,
      exterior: true,
      finishes: "Usually Flat/Matte or Low Sheen (elastomeric coating)",
      primer: false,
      primerNote: "not sold as paint & primer in one",
      residentialPrice: 1.20,
      commercialPrice: 1.10,
      coverage: 300
    }
  ];
  
  // Check if cache is valid
  function isCacheValid() {
    return cachedProducts && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION);
  }
  
  // Load products from API
  async function loadFromAPI() {
    try {
      const response = await fetch(`${API_BASE}/paint-products`);
      if (!response.ok) throw new Error('Failed to load products');
      
      const products = await response.json();
      
      // Update cache
      cachedProducts = products;
      cacheTimestamp = Date.now();
      
      return products;
    } catch (error) {
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          category: window.ErrorCategory.NETWORK,
          context: { api: '/server/paintProducts.json' }
        });
      }
      throw error;
    }
  }
  
  // Load products from localStorage
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('paintProducts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, {
            category: window.ErrorCategory.STORAGE,
            level: window.LogLevel.WARN,
            silent: true
          });
        }
        return null;
      }
    }
    return null;
  }
  
  // Save products to localStorage
  function saveToLocalStorage(products) {
    try {
      localStorage.setItem('paintProducts', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  // Public API
  return {
    // Get all paint products
    async getProducts() {
      // Check cache first
      if (isCacheValid()) {
        return cachedProducts;
      }
      
      try {
        // Try to load from API
        const products = await loadFromAPI();
        saveToLocalStorage(products); // Update localStorage
        return products;
      } catch (error) {
        // Fallback to localStorage
        const localProducts = loadFromLocalStorage();
        if (localProducts) {
          cachedProducts = localProducts;
          cacheTimestamp = Date.now();
          return localProducts;
        }
        
        // Final fallback to default products
        cachedProducts = defaultProducts;
        cacheTimestamp = Date.now();
        saveToLocalStorage(defaultProducts);
        return defaultProducts;
      }
    },
    
    // Get products by type (interior/exterior)
    async getProductsByType(type) {
      const products = await this.getProducts();
      return products.filter(p => p[type] === true);
    },
    
    // Get products by brand
    async getProductsByBrand(brand) {
      const products = await this.getProducts();
      return products.filter(p => p.brand === brand);
    },
    
    // Get unique brands
    async getBrands() {
      const products = await this.getProducts();
      const brands = [...new Set(products.map(p => p.brand))];
      return brands.sort();
    },
    
    // Get product by ID
    async getProductById(id) {
      const products = await this.getProducts();
      return products.find(p => p.id === id);
    },
    
    // Get products suitable for project type
    async getProductsForProjectType(projectType) {
      const products = await this.getProducts();
      
      // For commercial projects, return all products
      if (projectType === 'commercial' || projectType === 'public-sector') {
        return products;
      }
      
      // For residential projects, you might want to filter out some products
      // For now, return all products
      return products;
    },
    
    // Calculate paint cost
    calculatePaintCost(product, squareFeet, projectType = 'residential') {
      const pricePerSqFt = projectType === 'commercial' || projectType === 'public-sector' 
        ? product.commercialPrice 
        : product.residentialPrice;
      
      const totalCost = squareFeet * pricePerSqFt;
      const gallonsNeeded = Math.ceil(squareFeet / product.coverage);
      
      return {
        totalCost,
        gallonsNeeded,
        pricePerSqFt,
        coverage: product.coverage
      };
    },
    
    // Parse finishes string to array
    parseFinishes(finishesString) {
      if (!finishesString) return [];
      
      // Split by comma and clean up
      return finishesString
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
    },
    
    // Clear cache
    clearCache() {
      cachedProducts = null;
      cacheTimestamp = null;
    },
    
    // Force refresh from API
    async refresh() {
      this.clearCache();
      return await this.getProducts();
    }
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaintProductsService;
} else {
  window.PaintProductsService = PaintProductsService;
}
