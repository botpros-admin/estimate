// Contract Preview Module - Consolidated Production Version
// Handles contract preview generation with selected services only
// Consolidated from: contract-preview-complete-fix.js, contract-preview-force-fix.js,
// contract-preview-nuclear.js, contract-preview-redundancy-fix.js

(function() {
  'use strict';
  
  // Configuration
  const config = {
    maxRetries: 20,
    retryInterval: 500,
    debugMode: false
  };
  
  let retryCount = 0;
  let rebuildTimeout = null;
  
  // Main function to rebuild contract with only selected services
  function rebuildContract() {
    // Clear any existing timeout
    if (rebuildTimeout) {
      clearTimeout(rebuildTimeout);
      rebuildTimeout = null;
    }
    
    if (!window.contractData) {
      retryCount++;
      if (retryCount > config.maxRetries) {
        if (window.ErrorHandler) {
          window.ErrorHandler.error('[Contract Preview] Max retries reached. Contract data not available.', {
            category: window.ErrorCategory.SYSTEM,
            context: { retryCount, maxRetries: config.maxRetries }
          });
        }
        return;
      }
      rebuildTimeout = setTimeout(rebuildContract, config.retryInterval);
      return;
    }
    
    // Reset retry count on success
    retryCount = 0;
    
    const data = window.contractData;
    if (config.debugMode && window.ErrorHandler) {
      window.ErrorHandler.debug('[Contract Preview] Contract data loaded', { data });
    }
    
    // Override contract generation if needed
    overrideContractGeneration();
    
    // Generate the contract
    generateCleanContract(data);
  }
  
  // Override contract generation functions
  function overrideContractGeneration() {
    // Save original function if exists
    const originalGenerate = window.generateContractPages;
    
    window.generateContractPages = function() {
      if (config.debugMode && window.ErrorHandler) {
        window.ErrorHandler.debug('[Contract Preview] Intercepting contract generation...');
      }
      
      // If original exists, call it first
      if (originalGenerate) {
        originalGenerate.apply(this, arguments);
      }
      
      // Then apply our fixes
      setTimeout(() => {
        cleanupRedundantServices();
        fixServiceDisplay();
      }, 100);
    };
  }
  
  // Generate clean contract with only selected services
  function generateCleanContract(data) {
    const container = document.getElementById('print-preview-container');
    if (!container) {
      setTimeout(() => generateCleanContract(data), config.retryInterval);
      return;
    }
    
    // Get contract content element
    let contractContent = document.getElementById('contract-content');
    if (!contractContent) {
      contractContent = document.createElement('div');
      contractContent.id = 'contract-content';
      container.appendChild(contractContent);
    }
    
    // Clear existing content
    contractContent.innerHTML = '';
    
    // Generate contract sections
    contractContent.appendChild(generateHeader(data));
    contractContent.appendChild(generateProjectInfo(data));
    contractContent.appendChild(generateScopeOfWork(data));
    contractContent.appendChild(generateMaterials(data));
    contractContent.appendChild(generateTerms(data));
    contractContent.appendChild(generateSignature(data));
  }
  
  // Generate contract header
  function generateHeader(data) {
    const header = document.createElement('div');
    header.className = 'contract-header mb-8';
    header.innerHTML = `
      <h1 class="text-3xl font-bold text-center mb-4">SERVICE CONTRACT</h1>
      <div class="text-center text-gray-600">
        <p>Hartzell Painting Co., Inc.</p>
        <p>${data.companyPhone || '(734) 662-2858'}</p>
        <p>${data.companyEmail || 'info@hartzellpainting.com'}</p>
      </div>
    `;
    return header;
  }
  
  // Generate project info section
  function generateProjectInfo(data) {
    const section = document.createElement('div');
    section.className = 'contract-section mb-6';
    section.innerHTML = `
      <h2 class="text-xl font-bold mb-3">Project Information</h2>
      <div class="grid grid-cols-2 gap-4">
        <div><strong>Client:</strong> ${data.clientName || ''}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Project:</strong> ${data.projectName || ''}</div>
        <div><strong>Valid Until:</strong> ${data.validUntil || ''}</div>
      </div>
    `;
    return section;
  }
  
  // Generate scope of work section with only selected services
  function generateScopeOfWork(data) {
    const section = document.createElement('div');
    section.className = 'contract-section mb-6';
    
    const surfaces = data.surfaces || [];
    const paintSelections = data.paintSelections || [];
    
    // Filter surfaces with selected services only
    const activeSurfaces = surfaces.filter(surface => 
      surface.includePaintingService || 
      surface.includeConcreteCoating || 
      surface.includeWoodCoating || 
      surface.includeAbrasive
    );
    
    if (activeSurfaces.length === 0) {
      section.innerHTML = '<h2 class="text-xl font-bold mb-3">Scope of Work</h2><p>No services selected.</p>';
      return section;
    }
    
    let scopeHTML = '<h2 class="text-xl font-bold mb-3">Scope of Work</h2>';
    
    // Group surfaces by service type
    const serviceGroups = {
      painting: activeSurfaces.filter(s => s.includePaintingService),
      concrete: activeSurfaces.filter(s => s.includeConcreteCoating),
      wood: activeSurfaces.filter(s => s.includeWoodCoating),
      abrasive: activeSurfaces.filter(s => s.includeAbrasive)
    };
    
    // Generate sections for each service type
    if (serviceGroups.painting.length > 0) {
      scopeHTML += generateServiceSection('Painting Services', serviceGroups.painting, paintSelections);
    }
    if (serviceGroups.concrete.length > 0) {
      scopeHTML += generateServiceSection('Concrete Coating Services', serviceGroups.concrete);
    }
    if (serviceGroups.wood.length > 0) {
      scopeHTML += generateServiceSection('Wood Coating Services', serviceGroups.wood);
    }
    if (serviceGroups.abrasive.length > 0) {
      scopeHTML += generateServiceSection('Abrasive Method Services', serviceGroups.abrasive);
    }
    
    section.innerHTML = scopeHTML;
    return section;
  }
  
  // Generate service section HTML
  function generateServiceSection(title, surfaces, paintSelections) {
    let html = `<div class="mb-4"><h3 class="font-bold text-lg mb-2">${title}</h3><ul class="list-disc ml-5">`;
    
    surfaces.forEach(surface => {
      html += `<li>${surface.name}: ${surface.totalArea || 0} sq ft`;
      
      // Add paint info if painting service
      if (title === 'Painting Services' && paintSelections) {
        const paint = paintSelections.find(p => p.surfaceId === surface.id);
        if (paint && paint.selectedProduct) {
          html += ` - ${paint.selectedProduct.name}`;
        }
      }
      
      html += '</li>';
    });
    
    html += '</ul></div>';
    return html;
  }
  
  // Generate materials section
  function generateMaterials(data) {
    const section = document.createElement('div');
    section.className = 'contract-section mb-6';
    
    const paintSelections = data.paintSelections || [];
    const selectedProducts = new Map();
    
    // Group by unique products
    paintSelections.forEach(selection => {
      if (selection.selectedProduct) {
        const key = selection.selectedProduct.name;
        if (!selectedProducts.has(key)) {
          selectedProducts.set(key, []);
        }
        selectedProducts.get(key).push(selection.surfaceName || 'Surface');
      }
    });
    
    let materialsHTML = '<h2 class="text-xl font-bold mb-3">Materials</h2>';
    
    if (selectedProducts.size === 0) {
      materialsHTML += '<p>No materials specified.</p>';
    } else {
      materialsHTML += '<ul class="list-disc ml-5">';
      selectedProducts.forEach((surfaces, product) => {
        materialsHTML += `<li><strong>${product}</strong> - ${surfaces.join(', ')}</li>`;
      });
      materialsHTML += '</ul>';
    }
    
    section.innerHTML = materialsHTML;
    return section;
  }
  
  // Generate terms section
  function generateTerms(data) {
    const section = document.createElement('div');
    section.className = 'contract-section mb-6';
    section.innerHTML = `
      <h2 class="text-xl font-bold mb-3">Terms & Conditions</h2>
      <div class="space-y-2">
        <p><strong>Payment Terms:</strong> ${data.paymentTerms || 'Net 30 days'}</p>
        <p><strong>Warranty:</strong> ${data.warranty || '2 years on workmanship'}</p>
        <p><strong>Insurance:</strong> Fully licensed and insured</p>
      </div>
    `;
    return section;
  }
  
  // Generate signature section
  function generateSignature(data) {
    const section = document.createElement('div');
    section.className = 'contract-section signature-section mt-12';
    section.innerHTML = `
      <div class="grid grid-cols-2 gap-8">
        <div>
          <div class="border-b border-black mb-2" style="height: 40px;"></div>
          <p>Client Signature</p>
          <p class="text-sm text-gray-600">Date: _______________</p>
        </div>
        <div>
          <div class="border-b border-black mb-2" style="height: 40px;"></div>
          <p>Hartzell Painting Co., Inc.</p>
          <p class="text-sm text-gray-600">Date: _______________</p>
        </div>
      </div>
    `;
    return section;
  }
  
  // Clean up redundant services
  function cleanupRedundantServices() {
    // Remove duplicate service entries
    const serviceElements = document.querySelectorAll('.service-entry');
    const seen = new Set();
    
    serviceElements.forEach(element => {
      const key = element.textContent.trim();
      if (seen.has(key)) {
        element.remove();
      } else {
        seen.add(key);
      }
    });
  }
  
  // Fix service display issues
  function fixServiceDisplay() {
    // Ensure proper formatting and visibility
    const serviceSections = document.querySelectorAll('.service-section');
    serviceSections.forEach(section => {
      // Remove empty sections
      const content = section.textContent.trim();
      if (!content || content === 'No services selected.') {
        section.remove();
      }
    });
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rebuildContract);
  } else {
    setTimeout(rebuildContract, 100);
  }
  
  // Export for external use
  window.contractPreview = {
    rebuildContract,
    generateCleanContract,
    cleanupRedundantServices,
    fixServiceDisplay
  };
  
})();