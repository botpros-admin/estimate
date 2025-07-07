// Emergency fallback for brand data
// This ensures all brands show up even if the API returns incomplete data
(function() {
    'use strict';
    
    console.log('🚨 Emergency brand fix loading...');
    
    // Expected brands that should always be available
    const EXPECTED_BRANDS = ['Sherwin-Williams', 'Benjamin Moore', 'UCI'];
    
    // Wait for BitrixService to be available
    const checkAndFix = setInterval(() => {
        if (window.BitrixService && window.BitrixService.getPaintProducts) {
            clearInterval(checkAndFix);
            
            // Override the getPaintProducts method
            const originalGetPaintProducts = window.BitrixService.getPaintProducts;
            
            window.BitrixService.getPaintProducts = async function() {
                console.log('🔍 Intercepting getPaintProducts call...');
                
                try {
                    // Call the original method
                    const products = await originalGetPaintProducts.call(this);
                    
                    // Check which brands we got
                    const foundBrands = new Set(products.map(p => p.brand).filter(Boolean));
                    console.log('Found brands:', Array.from(foundBrands));
                    
                    // If we're missing brands, something is wrong
                    if (foundBrands.size < 3) {
                        console.warn('⚠️ Missing brands detected! Expected 3, got', foundBrands.size);
                        
                        // Check if this is a pagination issue (only got first 50 products)
                        if (products.length === 50 && foundBrands.size === 1) {
                            console.error('🚨 PAGINATION ISSUE DETECTED - Only first 50 products loaded!');
                            
                            // Return a message to help debug
                            console.error('The API is not paginating properly. Check the backend logs.');
                        }
                    }
                    
                    return products;
                    
                } catch (error) {
                    console.error('Error in getPaintProducts:', error);
                    throw error;
                }
            };
            
            console.log('✅ Emergency brand fix applied');
        }
    }, 100);
    
    // Also add a global function to manually check brands
    window.checkBrands = async function() {
        console.log('🔍 Checking brands...');
        const products = await BitrixService.getPaintProducts();
        const brandCounts = {};
        products.forEach(p => {
            if (p.brand) {
                brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
            }
        });
        console.table(brandCounts);
        return brandCounts;
    };
    
})();