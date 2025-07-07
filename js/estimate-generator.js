/**
 * Estimate Generator Module
 * Generates detailed, professional estimates for painting projects
 */

const EstimateGenerator = (function() {
  'use strict';
  
  /**
   * Generate complete estimate data structure
   */
  function generateEstimate() {
    const projectData = formState.getState();
    const pricing = PricingEngine.calculatePricing();
    
    return {
      estimateNumber: generateEstimateNumber(),
      date: new Date().toLocaleDateString(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      
      // Company info
      company: {
        name: 'Hartzell Painting',
        address: '123 Main Street',
        city: 'Your City, ST 12345',
        phone: '(555) 123-4567',
        email: 'info@hartzellpainting.com',
        license: 'License #123456'
      },
      
      // Customer info
      customer: {
        name: projectData.step1?.clientName || '',
        address: projectData.step1?.clientAddress || '',
        phone: projectData.step1?.clientPhone || '',
        email: projectData.step1?.clientEmail || ''
      },
      
      // Project details
      project: {
        type: projectData.step1?.projectType || '',
        address: projectData.step1?.projectAddress || '',
        startDate: projectData.step1?.startDate || '',
        duration: projectData.step1?.estimatedDuration || '',
        squareFootage: projectData.step1?.squareFootage || 0
      },      
      // Services and line items
      services: generateServiceLineItems(projectData, pricing),
      
      // Materials breakdown
      materials: generateMaterialsBreakdown(projectData, pricing),
      
      // Labor breakdown
      labor: generateLaborBreakdown(projectData, pricing),
      
      // Pricing summary
      pricing: pricing,
      
      // Terms and conditions
      terms: generateTermsAndConditions(),
      
      // Notes
      notes: projectData.contractData?.notes || ''
    };
  }
  
  /**
   * Generate unique estimate number
   */
  function generateEstimateNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EST-${year}${month}${day}-${random}`;
  }
  
  /**
   * Generate service line items
   */
  function generateServiceLineItems(projectData, pricing) {
    const items = [];
    
    // Surface preparation
    if (pricing.laborCost.preparation > 0) {
      items.push({
        description: 'Surface Preparation',
        details: 'Clean, sand, prime surfaces as needed',
        quantity: 1,
        unit: 'job',
        rate: pricing.laborCost.preparation,
        amount: pricing.laborCost.preparation
      });
    }    
    // Painting services by room
    Object.entries(pricing.materialCost.byRoom).forEach(([room, cost]) => {
      if (cost > 0) {
        const roomData = projectData.surfaces?.[room];
        if (roomData) {
          items.push({
            description: `${formatRoomName(room)} Painting`,
            details: generateRoomDetails(roomData),
            quantity: calculateRoomArea(roomData),
            unit: 'sq ft',
            rate: cost / calculateRoomArea(roomData),
            amount: cost
          });
        }
      }
    });
    
    // Cleanup
    if (pricing.laborCost.cleanup > 0) {
      items.push({
        description: 'Final Cleanup',
        details: 'Remove materials, clean work areas',
        quantity: 1,
        unit: 'job',
        rate: pricing.laborCost.cleanup,
        amount: pricing.laborCost.cleanup
      });
    }
    
    return items;
  }
  
  /**
   * Generate materials breakdown
   */
  function generateMaterialsBreakdown(projectData, pricing) {
    const materials = [];
    const products = projectData.products || {};
    
    // Paint products
    Object.entries(products).forEach(([productKey, productData]) => {
      if (productData && productData.product) {
        const quantity = Math.ceil(productData.quantity || 1);
        const unitPrice = productData.price || 0;
        
        materials.push({
          description: productData.product,
          type: productData.finish || 'Standard',
          quantity: quantity,
          unit: 'gallons',
          unitPrice: unitPrice,
          amount: quantity * unitPrice
        });
      }
    });    
    // Add supplies if included
    if (pricing.materialCost.supplies > 0) {
      materials.push({
        description: 'Painting Supplies',
        type: 'Brushes, rollers, tape, plastic, etc.',
        quantity: 1,
        unit: 'lot',
        unitPrice: pricing.materialCost.supplies,
        amount: pricing.materialCost.supplies
      });
    }
    
    return materials;
  }
  
  /**
   * Generate labor breakdown
   */
  function generateLaborBreakdown(projectData, pricing) {
    const breakdown = [];
    const totalHours = pricing.laborCost.totalHours || 0;
    const hourlyRate = pricing.laborCost.hourlyRate || 0;
    
    breakdown.push({
      description: 'Professional Painting Labor',
      hours: totalHours,
      rate: hourlyRate,
      amount: pricing.laborCost.painting || 0
    });
    
    if (pricing.laborCost.preparation > 0) {
      const prepHours = pricing.laborCost.preparation / hourlyRate;
      breakdown.push({
        description: 'Surface Preparation',
        hours: prepHours.toFixed(1),
        rate: hourlyRate,
        amount: pricing.laborCost.preparation
      });
    }
    
    return breakdown;
  }  
  /**
   * Generate terms and conditions
   */
  function generateTermsAndConditions() {
    return [
      'This estimate is valid for 30 days from the date above.',
      'A 50% deposit is required to schedule work.',
      'Final payment is due upon completion of work.',
      'Any changes to the scope of work may result in additional charges.',
      'All work is guaranteed for one year from completion date.',
      'Customer must remove or protect valuable items before work begins.',
      'Estimate includes all labor, materials, and equipment unless otherwise noted.',
      'Sales tax is included in the total price where applicable.'
    ];
  }
  
  /**
   * Format room name for display
   */
  function formatRoomName(room) {
    return room.charAt(0).toUpperCase() + room.slice(1).replace(/([A-Z])/g, ' $1');
  }
  
  /**
   * Generate room details string
   */
  function generateRoomDetails(roomData) {
    const details = [];
    if (roomData.walls) details.push('Walls');
    if (roomData.ceiling) details.push('Ceiling');
    if (roomData.trim) details.push('Trim/Baseboards');
    if (roomData.doors) details.push(`${roomData.doors} Door${roomData.doors > 1 ? 's' : ''}`);
    if (roomData.windows) details.push(`${roomData.windows} Window${roomData.windows > 1 ? 's' : ''}`);
    return details.join(', ');
  }
  
  /**
   * Calculate room area
   */
  function calculateRoomArea(roomData) {
    let area = 0;
    if (roomData.length && roomData.width && roomData.height) {
      // Wall area
      if (roomData.walls) {
        area += 2 * (roomData.length + roomData.width) * roomData.height;
      }
      // Ceiling area
      if (roomData.ceiling) {
        area += roomData.length * roomData.width;
      }
    }
    return Math.round(area);
  }  
  /**
   * Generate HTML for estimate display
   */
  function generateEstimateHTML() {
    const estimate = generateEstimate();
    
    return `
      <!-- Header Section -->
      <div class="estimate-section">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">${estimate.company.name}</h1>
            <p class="text-gray-600">${estimate.company.address}</p>
            <p class="text-gray-600">${estimate.company.city}</p>
            <p class="text-gray-600">${estimate.company.phone} | ${estimate.company.email}</p>
            <p class="text-gray-600">${estimate.company.license}</p>
          </div>
          <div class="text-right">
            <h2 class="text-2xl font-bold text-gray-800">ESTIMATE</h2>
            <p class="text-gray-600">Estimate #: ${estimate.estimateNumber}</p>
            <p class="text-gray-600">Date: ${estimate.date}</p>
            <p class="text-gray-600">Valid Until: ${estimate.expirationDate}</p>
          </div>
        </div>
        
        <div class="border-t pt-4 mt-4">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">Bill To:</h3>
              <p class="text-gray-700">${estimate.customer.name}</p>
              <p class="text-gray-600">${estimate.customer.address}</p>
              <p class="text-gray-600">${estimate.customer.phone}</p>
              <p class="text-gray-600">${estimate.customer.email}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">Project Location:</h3>
              <p class="text-gray-700">${estimate.project.address}</p>
              <p class="text-gray-600">Type: ${estimate.project.type}</p>
              <p class="text-gray-600">Square Footage: ${estimate.project.squareFootage} sq ft</p>
              <p class="text-gray-600">Start Date: ${estimate.project.startDate}</p>
              <p class="text-gray-600">Duration: ${estimate.project.duration}</p>
            </div>
          </div>
        </div>
      </div>`;    }
      
      <!-- Services Section -->
      <div class="estimate-section">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Services</h3>
        <table class="estimate-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${estimate.services.map(item => `
              <tr>
                <td>
                  <div class="font-medium">${item.description}</div>
                  <div class="text-sm text-gray-600">${item.details}</div>
                </td>
                <td>${item.quantity} ${item.unit}</td>
                <td>$${item.rate.toFixed(2)}</td>
                <td>$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Materials Section -->
      <div class="estimate-section">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Materials</h3>
        <table class="estimate-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${estimate.materials.map(item => `
              <tr>
                <td>
                  <div class="font-medium">${item.description}</div>
                  <div class="text-sm text-gray-600">${item.type}</div>
                </td>                <td>${item.quantity} ${item.unit}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Pricing Summary -->
      <div class="estimate-section">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Pricing Summary</h3>
        <div class="estimate-totals">
          <div class="total-line">
            <span>Materials Total:</span>
            <span>$${estimate.pricing.materialCost.total.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Labor Total:</span>
            <span>$${estimate.pricing.laborCost.total.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Subtotal:</span>
            <span>$${estimate.pricing.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Overhead (${(estimate.pricing.overheadPercentage * 100).toFixed(0)}%):</span>
            <span>$${estimate.pricing.overhead.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Profit (${(estimate.pricing.profitMargin * 100).toFixed(0)}%):</span>
            <span>$${estimate.pricing.profit.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax (${(estimate.pricing.taxRate * 100).toFixed(1)}%):</span>
            <span>$${estimate.pricing.tax.toFixed(2)}</span>
          </div>
          <div class="total-line total-line-final">
            <span>Total:</span>
            <span>$${estimate.pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <!-- Terms and Conditions -->
      <div class="estimate-section">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Terms and Conditions</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          ${estimate.terms.map(term => `<li>${term}</li>`).join('')}
        </ul>
      </div>`;      
      ${estimate.notes ? `
      <div class="estimate-section">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Additional Notes</h3>
        <p class="text-gray-700">${estimate.notes}</p>
      </div>
      ` : ''}
      
      <!-- Signature Section -->
      <div class="estimate-section">
        <div class="grid grid-cols-2 gap-8 mt-8">
          <div>
            <div class="border-t border-gray-400 pt-2">
              <p class="text-gray-600">Customer Signature</p>
            </div>
          </div>
          <div>
            <div class="border-t border-gray-400 pt-2">
              <p class="text-gray-600">Date</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Public API
  return {
    generateEstimate: generateEstimate,
    generateEstimateHTML: generateEstimateHTML
  };
})();