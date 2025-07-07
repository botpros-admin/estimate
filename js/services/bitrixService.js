// Bitrix24 Service - Direct connection to Bitrix webhook
const BitrixService = (function() {
  'use strict';
  
  // Bitrix webhook URL
  const WEBHOOK_URL = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
  const SERVICE_CATALOG_SPA_ID = 1058; // Service Catalog entity type ID
  const ABRASIVE_CATALOG_SPA_ID = 1068; // Abrasive Catalog entity type ID
  
  // Cache for products
  let cachedPaintProducts = null;
  let cachedAbrasiveServices = null;
  let paintCacheTimestamp = null;
  let abrasiveCacheTimestamp = null;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  // Finish type mapping (from Bitrix IDs to names)
  const FINISH_TYPES = {
    '2119': 'Flat/Matte',
    '2120': 'Low Sheen',
    '2121': 'Satin',
    '2122': 'Semi-Gloss',
    '2123': 'Gloss',
    '2124': 'High Gloss'
  };
  
  // Make direct API request to Bitrix
  async function makeRequest(method, params = {}) {
    try {
      // Ensure webhook URL ends with slash
      const baseUrl = WEBHOOK_URL.endsWith('/') ? WEBHOOK_URL : WEBHOOK_URL + '/';
      const url = `${baseUrl}${method}`;
      
      // For GET requests, add parameters to URL
      const requestUrl = new URL(url);
      if (method === 'GET') {
        Object.entries(params).forEach(([key, value]) => {
          requestUrl.searchParams.append(key, value);
        });
      }
      
      const response = await fetch(requestUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || data.error);
      }
      
      return data;
    } catch (error) {
      // Check if it's a CORS error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to Bitrix catalog');
      }
      // Log errors using error handler
      if (!error.message.includes('404') && !error.message.includes('Cannot connect')) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, {
            category: window.ErrorCategory.BITRIX,
            context: { method, params }
          });
        }
      }
      throw error;
    }
  }
  
  // Convert Bitrix paint item to our format
  function convertBitrixPaintItem(item) {
    // Parse finish types
    const finishList = item.ufCrm7FinishList || [];
    const finishes = finishList.map(id => FINISH_TYPES[id] || `Unknown(${id})`).filter(Boolean);
    
    // Parse prices (format: "0.85|USD")
    function parsePrice(priceStr) {
      if (!priceStr || !priceStr.includes('|')) return 0;
      return parseFloat(priceStr.split('|')[0]);
    }
    
    return {
      id: item.id,
      type: 'paint',
      title: item.title || `${item.ufCrm7Brand} - ${item.ufCrm7PaintName}`,
      name: item.ufCrm7PaintName || 'Unnamed Product',
      brand: item.ufCrm7Brand || 'Unknown Brand',
      coverage: item.ufCrm7Coverage || 250,
      interior: item.ufCrm7Interior === 'Y',
      exterior: item.ufCrm7Exterior === 'Y',
      primer: item.ufCrm7Primer === 'Y',
      primerNote: item.ufCrm7PrimerNote || '',
      finishes: finishes,
      finishIds: finishList,
      // Residential pricing
      residentialPrice: {
        min: parsePrice(item.ufCrm7ResPrice),
        max: parsePrice(item.ufCrm7ResPriceMax),
        default: parsePrice(item.ufCrm7ResPriceDef)
      },
      // Commercial pricing
      commercialPrice: {
        min: parsePrice(item.ufCrm7ComPrice),
        max: parsePrice(item.ufCrm7ComPriceMax),
        default: parsePrice(item.ufCrm7ComPriceDef)
      }
    };
  }
  
  // Convert Bitrix abrasive service item to our format
  function convertBitrixAbrasiveItem(item) {
    // Parse prices (format: "0.85|USD")
    function parsePrice(priceStr) {
      if (!priceStr || !priceStr.includes('|')) return 0;
      return parseFloat(priceStr.split('|')[0]);
    }
    
    return {
      id: item.id,
      type: 'abrasive',
      title: item.title || item.ufCrm10ServiceType || 'Unnamed Service',
      name: item.ufCrm10ServiceType || 'Unnamed Service',
      serviceName: item.ufCrm10ServiceType || 'Unnamed Service',
      // Note: Based on API response, only ServiceType and pricing fields are available
      // Additional fields would need to be added to your Bitrix SPA if needed
      // Residential pricing (note the typo in field name "ResProceMin")
      residentialPrice: {
        min: parsePrice(item.ufCrm10ResProceMin),
        max: parsePrice(item.ufCrm10ResPriceMax),
        default: parsePrice(item.ufCrm10ResPriceDef)
      },
      // Commercial pricing (note the typo in field name "CcomPriceDef")
      commercialPrice: {
        min: parsePrice(item.ufCrm10ComPriceMin),
        max: parsePrice(item.ufCrm10ComPriceMax),
        default: parsePrice(item.ufCrm10CcomPriceDef)
      }
    };
  }
  
  // Fetch all paint products from Bitrix
  async function fetchAllPaintProducts() {
    const allItems = [];
    let start = 0;
    const limit = 50;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await makeRequest('crm.item.list', {
          entityTypeId: SERVICE_CATALOG_SPA_ID,
          select: [
            'id', 'title', 'ufCrm7Brand', 'ufCrm7PaintName',
            'ufCrm7Coverage', 'ufCrm7Interior', 'ufCrm7Exterior',
            'ufCrm7Primer', 'ufCrm7PrimerNote', 'ufCrm7FinishList',
            'ufCrm7ResPrice', 'ufCrm7ResPriceMax', 'ufCrm7ResPriceDef',
            'ufCrm7ComPrice', 'ufCrm7ComPriceMax', 'ufCrm7ComPriceDef',
            'ufCrm7ServiceType'
          ],
          filter: {
            'ufCrm7ServiceType': 2089 // Only get "Painting" service type items
          },
          start: start,
          limit: limit
        });
        
        if (response.result && response.result.items) {
          allItems.push(...response.result.items);
          
          // Check if there are more items
          if (response.result.items.length < limit) {
            hasMore = false;
          } else {
            start += limit;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        // If connection fails, return empty array
        hasMore = false;
      }
    }
    
    return allItems;
  }
  
  // Fetch all abrasive services from Bitrix
  async function fetchAllAbrasiveServices() {
    // Check if Abrasive Catalog SPA ID is set
    if (!ABRASIVE_CATALOG_SPA_ID) {
      if (window.ErrorHandler) {
        window.ErrorHandler.warn('Abrasive Catalog SPA ID not set - skipping abrasive services');
      }
      return [];
    }
    
    const allItems = [];
    let start = 0;
    const limit = 50;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await makeRequest('crm.item.list', {
          entityTypeId: ABRASIVE_CATALOG_SPA_ID,
          select: [
            'id', 'title', 'ufCrm10ServiceType',
            'ufCrm10ResProceMin', 'ufCrm10ResPriceMax', 'ufCrm10ResPriceDef',
            'ufCrm10ComPriceMin', 'ufCrm10ComPriceMax', 'ufCrm10CcomPriceDef'
          ],
          start: start,
          limit: limit
        });
        
        if (response.result && response.result.items) {
          allItems.push(...response.result.items);
          
          // Check if there are more items
          if (response.result.items.length < limit) {
            hasMore = false;
          } else {
            start += limit;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        // If connection fails, return empty array
        hasMore = false;
      }
    }
    
    return allItems;
  }
  
  // Public API
  return {
    // Get all paint products (legacy method)
    async getProducts() {
      return this.getPaintProducts();
    },
    
    // Get paint products specifically
    async getPaintProducts() {
      // Check sessionStorage first (from preloading)
      try {
        const sessionCache = sessionStorage.getItem('cachedPaintServices');
        const sessionTimestamp = sessionStorage.getItem('paintCacheTimestamp');
        
        if (sessionCache && sessionTimestamp && (Date.now() - parseInt(sessionTimestamp) < CACHE_DURATION)) {
          const bitrixItems = JSON.parse(sessionCache);
          const products = bitrixItems.map(convertBitrixPaintItem);
          
          // Update in-memory cache for performance
          cachedPaintProducts = products;
          paintCacheTimestamp = parseInt(sessionTimestamp);
          
          return products;
        }
      } catch (e) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(e, {
            category: window.ErrorCategory.STORAGE,
            level: window.LogLevel.WARN,
            silent: true
          });
        }
      }
      
      // Check in-memory cache
      if (cachedPaintProducts && paintCacheTimestamp && (Date.now() - paintCacheTimestamp < CACHE_DURATION)) {
        return cachedPaintProducts;
      }
      
      try {
        const bitrixItems = await fetchAllPaintProducts();
        
        // Convert to our format
        const products = bitrixItems.map(convertBitrixPaintItem);
        
        // Remove duplicates
        const uniqueProducts = products.filter((product, index, self) =>
          index === self.findIndex(p => 
            p.name === product.name && 
            p.brand === product.brand
          )
        );
        
        // Update cache
        cachedPaintProducts = uniqueProducts;
        paintCacheTimestamp = Date.now();
        
        return uniqueProducts;
      } catch (error) {
        // Return empty array if API fails
        return [];
      }
    },
    
    // Get abrasive services
    async getAbrasiveServices() {
      // Check sessionStorage first (from preloading)
      try {
        const sessionCache = sessionStorage.getItem('cachedAbrasiveServices');
        const sessionTimestamp = sessionStorage.getItem('abrasiveCacheTimestamp');
        
        if (sessionCache && sessionTimestamp && (Date.now() - parseInt(sessionTimestamp) < CACHE_DURATION)) {
          const bitrixItems = JSON.parse(sessionCache);
          const services = bitrixItems.map(convertBitrixAbrasiveItem);
          
          // Update in-memory cache for performance
          cachedAbrasiveServices = services;
          abrasiveCacheTimestamp = parseInt(sessionTimestamp);
          
          return services;
        }
      } catch (e) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(e, {
            category: window.ErrorCategory.STORAGE,
            level: window.LogLevel.WARN,
            silent: true
          });
        }
      }
      
      // Check in-memory cache
      if (cachedAbrasiveServices && abrasiveCacheTimestamp && (Date.now() - abrasiveCacheTimestamp < CACHE_DURATION)) {
        return cachedAbrasiveServices;
      }
      
      try {
        const bitrixItems = await fetchAllAbrasiveServices();
        
        // Convert to our format
        const services = bitrixItems.map(convertBitrixAbrasiveItem);
        
        // Update cache
        cachedAbrasiveServices = services;
        abrasiveCacheTimestamp = Date.now();
        
        return services;
      } catch (error) {
        // Return empty array if API fails
        return [];
      }
    },
    
    // Get all services (paint + abrasive)
    async getAllServices() {
      const [paintProducts, abrasiveServices] = await Promise.all([
        this.getPaintProducts(),
        this.getAbrasiveServices()
      ]);
      
      return {
        paint: paintProducts,
        abrasive: abrasiveServices,
        all: [...paintProducts, ...abrasiveServices]
      };
    },
    
    // Clear cache
    clearCache() {
      cachedPaintProducts = null;
      cachedAbrasiveServices = null;
      paintCacheTimestamp = null;
      abrasiveCacheTimestamp = null;
    }
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BitrixService;
}

// Also expose to global window for browser use
window.BitrixService = BitrixService;
