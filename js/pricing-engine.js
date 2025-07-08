// Pricing Engine for Paint Estimator
(function() {
  'use strict';
  
  // Default pricing configuration
  const DEFAULT_CONFIG = {
    labor: {
      baseHourlyRate: 45,
      crewSize: 2,
      productionRates: {
        interior: 200, // sq ft per hour
        exterior: 150, // sq ft per hour
        sandblasting: 100,
        pressure: 300,
        chemical: 200
      },
      setupHours: 2,
      cleanupHours: 2,
      minimumHours: 8
    },
    materials: {
      paintMarkup: 1.25, // 25% markup on paint
      suppliesCostPerSqFt: 0.15,
      primerCostPerGallon: 25,
      defaultPaintCostPerSqFt: 0.85 // Default paint cost per square foot
    },
    overhead: {
      percentage: 0.20 // 20% overhead
    },
    profit: {
      percentage: 0.15 // 15% profit margin
    },
    tax: {
      rate: 0.0825 // 8.25% tax
    }
  };
  
  // Initialize pricing configuration in formState
  function initializePricingConfig() {
    if (!formState.data.pricingConfig) {
      formState.data.pricingConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      formState.saveState();
    }
  }
  
  // Calculate paint quantity needed
  function calculatePaintQuantity(surfaceArea, coverage, coats = 2) {
    if (!surfaceArea || !coverage) return 0;
    return Math.ceil((surfaceArea * coats) / coverage);
  }
  
  // Calculate labor hours for a specific service
  function calculateLaborHours(serviceType, surfaceArea) {
    const config = formState.data.pricingConfig || DEFAULT_CONFIG;
    const productionRate = config.labor.productionRates[serviceType] || 200;
    
    const productionHours = surfaceArea / productionRate;
    const totalHours = productionHours + config.labor.setupHours + config.labor.cleanupHours;
    
    return Math.max(totalHours, config.labor.minimumHours);
  }
  
  // Calculate material costs for paint
  function calculatePaintMaterialCost(paintSelection) {
    const config = formState.data.pricingConfig || DEFAULT_CONFIG;
    let totalCost = 0;
    
    if (!paintSelection.totalSurfaceArea) return 0;
    
    // Calculate paint cost
    const coverage = paintSelection.coverage || 350;
    const paintGallons = calculatePaintQuantity(paintSelection.totalSurfaceArea, coverage);
    
    // Get paint cost from Bitrix product or use default
    let pricePerSqFt = config.materials.defaultPaintCostPerSqFt;
    if (paintSelection.productId && typeof BitrixService !== 'undefined') {
      const product = bitrixProducts.find(p => p.id === paintSelection.productId);
      if (product && product.residentialPrice.default) {
        pricePerSqFt = product.residentialPrice.default;
      }
    }
    
    // Calculate total cost: surface area * price per sq ft * markup
    totalCost = paintSelection.totalSurfaceArea * pricePerSqFt * config.materials.paintMarkup;
    
    // Add primer cost if needed
    if (paintSelection.includesPrimer) {
      const primerGallons = calculatePaintQuantity(paintSelection.totalSurfaceArea, 400, 1);
      totalCost += primerGallons * config.materials.primerCostPerGallon;
    }
    
    // Add supplies cost
    totalCost += paintSelection.totalSurfaceArea * config.materials.suppliesCostPerSqFt;
    
    return totalCost;
  }
  
  // Calculate labor cost for a service
  function calculateLaborCost(serviceType, surfaceArea) {
    const config = formState.data.pricingConfig || DEFAULT_CONFIG;
    const hours = calculateLaborHours(serviceType, surfaceArea);
    
    return hours * config.labor.baseHourlyRate * config.labor.crewSize;
  }
  
  // Calculate total project pricing
  function calculateProjectTotal() {
    const config = formState.data.pricingConfig || DEFAULT_CONFIG;
    let materialsCost = 0;
    let laborCost = 0;
    let breakdown = [];
    
    // Calculate paint costs and labor
    const paintSelections = formState.data.paintSelections || [];
    paintSelections.forEach(selection => {
      if (selection.type === 'interior' || selection.type === 'exterior') {
        const selectionMaterialCost = calculatePaintMaterialCost(selection);
        const selectionLaborCost = calculateLaborCost(selection.type, selection.totalSurfaceArea || 0);
        
        materialsCost += selectionMaterialCost;
        laborCost += selectionLaborCost;
        
        breakdown.push({
          type: 'paint',
          description: `${selection.type === 'interior' ? 'Interior' : 'Exterior'} Painting`,
          area: selection.totalSurfaceArea || 0,
          materialCost: selectionMaterialCost,
          laborCost: selectionLaborCost,
          subtotal: selectionMaterialCost + selectionLaborCost
        });
      } else if (['sandblasting', 'pressure', 'chemical'].includes(selection.type)) {
        // Cleaning services (labor only)
        const cleaningArea = calculateTotalProjectArea() / 2; // Assume half the area
        const selectionLaborCost = calculateLaborCost(selection.type, cleaningArea);
        
        laborCost += selectionLaborCost;
        
        breakdown.push({
          type: 'cleaning',
          description: selection.type === 'sandblasting' ? 'Sandblasting' :
                      selection.type === 'pressure' ? 'Pressure Cleaning' : 'Chemical Treatment',
          area: cleaningArea,
          materialCost: 0,
          laborCost: selectionLaborCost,
          subtotal: selectionLaborCost
        });
      }
    });
    
    // Calculate totals
    const subtotal = materialsCost + laborCost;
    const overhead = subtotal * config.overhead.percentage;
    const subtotalWithOverhead = subtotal + overhead;
    const profit = subtotalWithOverhead * config.profit.percentage;
    const subtotalWithProfit = subtotalWithOverhead + profit;
    const tax = subtotalWithProfit * config.tax.rate;
    const total = subtotalWithProfit + tax;
    
    return {
      breakdown,
      materialsCost,
      laborCost,
      subtotal,
      overhead,
      profit,
      tax,
      total,
      laborHours: breakdown.reduce((sum, item) => {
        if (item.type === 'paint') {
          return sum + calculateLaborHours(item.area > 0 ? 'interior' : 'exterior', item.area);
        }
        return sum;
      }, 0)
    };
  }
  
  // Calculate total project area
  function calculateTotalProjectArea() {
    let totalArea = 0;
    const paintSelections = formState.data.paintSelections || [];
    
    paintSelections.forEach(selection => {
      if (selection.totalSurfaceArea) {
        totalArea += selection.totalSurfaceArea;
      }
    });
    
    return totalArea;
  }
  
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Update pricing display in contract builder
  function updateContractPricing() {
    const pricing = calculateProjectTotal();
    const totalElement = document.getElementById('contract-total');
    
    if (totalElement) {
      totalElement.textContent = formatCurrency(pricing.total);
    }
    
    // Store pricing in formState
    formState.data.pricing = pricing;
    formState.saveState();
  }
  
  // Generate detailed estimate HTML
  function generateEstimateHTML() {
    const pricing = calculateProjectTotal();
    const config = formState.data.pricingConfig || DEFAULT_CONFIG;
    
    let html = `
      <div class="estimate-container">
        <h2>Detailed Estimate Breakdown</h2>
        
        <div class="estimate-section">
          <h3>Services</h3>
          <table class="estimate-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Area (sq ft)</th>
                <th>Materials</th>
                <th>Labor</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    pricing.breakdown.forEach(item => {
      html += `
        <tr>
          <td>${item.description}</td>
          <td>${item.area.toFixed(0)}</td>
          <td>${formatCurrency(item.materialCost)}</td>
          <td>${formatCurrency(item.laborCost)}</td>
          <td>${formatCurrency(item.subtotal)}</td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
        
        <div class="estimate-totals">
          <div class="total-line">
            <span>Materials Total:</span>
            <span>${formatCurrency(pricing.materialsCost)}</span>
          </div>
          <div class="total-line">
            <span>Labor Total (${pricing.laborHours.toFixed(1)} hours):</span>
            <span>${formatCurrency(pricing.laborCost)}</span>
          </div>
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(pricing.subtotal)}</span>
          </div>
          <div class="total-line">
            <span>Overhead (${(config.overhead.percentage * 100).toFixed(0)}%):</span>
            <span>${formatCurrency(pricing.overhead)}</span>
          </div>
          <div class="total-line">
            <span>Profit (${(config.profit.percentage * 100).toFixed(0)}%):</span>
            <span>${formatCurrency(pricing.profit)}</span>
          </div>
          <div class="total-line">
            <span>Tax (${(config.tax.rate * 100).toFixed(2)}%):</span>
            <span>${formatCurrency(pricing.tax)}</span>
          </div>
          <div class="total-line total-line-final">
            <span>Total:</span>
            <span>${formatCurrency(pricing.total)}</span>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  // Export pricing engine API
  window.PricingEngine = {
    initialize: initializePricingConfig,
    calculatePaintQuantity,
    calculateLaborHours,
    calculateMaterialCost: calculatePaintMaterialCost,
    calculateLaborCost,
    calculateProjectTotal,
    updateContractPricing,
    generateEstimateHTML,
    formatCurrency,
    config: DEFAULT_CONFIG
  };
  
  // Initialize on load
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof formState !== 'undefined') {
      initializePricingConfig();
    }
  });
})();