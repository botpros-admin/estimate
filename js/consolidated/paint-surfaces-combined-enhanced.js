// Enhanced Paint Selection and Surfaces Functionality with Dynamic Service Types
// This file extends paint-surfaces-combined.js with new features:
// 1. Auto-populate service configurations from Page 1
// 2. Dynamic service type dropdowns with location restrictions

(function() {
  'use strict';
  
  // Service configuration with location restrictions
  const serviceConfig = {
    painting: {
      name: 'Painting',
      allowsInterior: true,
      allowsExterior: true,
      defaultLocation: 'both'
    },
    abrasive: {
      name: 'Cleaning',
      allowsInterior: false,
      allowsExterior: true,
      defaultLocation: 'exterior',
      locked: true // Cannot change location
    }
  };

  // Enhanced initialization to handle service configurations
  function initializeServicesFromPage1() {
    // Get service types selected on Page 1
    const selectedServices = formState.data.serviceTypes || [];
    const projectScope = formState.data.projectScope || { interior: false, exterior: false };
    
    // Process each selected service
    const serviceConfigurations = [];
    
    selectedServices.forEach(serviceType => {
      const config = serviceConfig[serviceType];
      if (!config) return;
      
      const serviceConf = {
        type: serviceType,
        name: config.name,
        locations: []
      };
      
      // For locked services (like abrasive), always use default location
      if (config.locked) {
        serviceConf.locations = [config.defaultLocation];
      } else {
        // For painting, use the scope selected on Page 1
        if (serviceType === 'painting') {
          if (projectScope.interior) serviceConf.locations.push('interior');
          if (projectScope.exterior) serviceConf.locations.push('exterior');
        }
      }
      
      serviceConfigurations.push(serviceConf);
    });
    
    return serviceConfigurations;
  }

  // Create service-specific paint cards with location info
  function createServiceBasedPaintCards() {
    const container = document.getElementById('paint-selections-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Get service configurations
    const serviceConfigurations = initializeServicesFromPage1();
    
    // Create header showing selected services
    const servicesHeader = document.createElement('div');
    servicesHeader.className = 'services-summary mb-6 p-4 bg-blue-50 rounded-lg';
    servicesHeader.innerHTML = `
      <h3 class="text-lg font-semibold text-blue-900 mb-2">Selected Services from Page 1</h3>
      <div class="services-list">
        ${serviceConfigurations.map(service => {
          const locationText = service.locations.join(' & ');
          const lockedIcon = serviceConfig[service.type].locked ? 
            '<i class="fas fa-lock text-gray-500 ml-1" title="Location cannot be changed"></i>' : '';
          return `
            <div class="service-item mb-1">
              <span class="font-medium">${service.name}</span>: 
              <span class="text-blue-700">${locationText}</span>
              ${lockedIcon}
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(servicesHeader);
    
    // Create paint cards for each location needed
    const locationsNeeded = new Set();
    serviceConfigurations.forEach(service => {
      service.locations.forEach(loc => locationsNeeded.add(loc));
    });
    
    // Generate paint cards for each unique location
    Array.from(locationsNeeded).forEach((location, index) => {
      // Find which services apply to this location
      const servicesForLocation = serviceConfigurations.filter(service => 
        service.locations.includes(location)
      );
      
      // Create paint card with service info
      const paintCard = createEnhancedPaintCard(location, servicesForLocation, index);
      container.appendChild(paintCard);
    });
  }

  // Enhanced paint card creation with service context
  function createEnhancedPaintCard(location, services, index) {
    const paintId = `paint-${location}-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'paint-card enhanced-service-card';
    card.dataset.paintId = paintId;
    card.dataset.location = location;
    
    // Card header with services info
    const header = document.createElement('div');
    header.className = 'mb-4 p-3 bg-gray-50 rounded-lg';
    
    const servicesText = services.map(s => s.name).join(' & ');
    const locationTitle = location.charAt(0).toUpperCase() + location.slice(1);
    
    header.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <img src="../img/${location}_icon.svg" alt="${location} icon" class="w-5 h-5">
        ${locationTitle} - ${servicesText}
      </h3>
      <div class="text-sm text-gray-600 mt-1">
        ${services.map(s => {
          if (s.type === 'abrasive' && serviceConfig[s.type].locked) {
            return `<span class="inline-flex items-center">
              <i class="fas fa-info-circle text-blue-500 mr-1"></i>
              Cleaning is exterior only
            </span>`;
          }
          return '';
        }).filter(Boolean).join(' ')}
      </div>
    `;
    card.appendChild(header);
    
    // Rest of the paint card content (paint selection, surfaces, etc.)
    // This reuses the existing functionality from paint-surfaces-combined.js
    const paintContent = createPaintSelectionContent(paintId, location);
    card.appendChild(paintContent);
    
    // Add surfaces section
    const surfacesSection = renderSurfacesInPaintCard(paintId, location);
    card.appendChild(surfacesSection);
    
    return card;
  }

  // Create paint selection content (reusable)
  function createPaintSelectionContent(paintId, location) {
    const content = document.createElement('div');
    content.className = 'paint-selection-content';
    
    // Initialize paint selection in formState
    if (!formState.data.paintSelections) {
      formState.data.paintSelections = [];
    }
    
    const paintSelection = {
      id: paintId,
      projectType: location,
      brand: '',
      finish: '',
      products: [],
      surfaces: []
    };
    
    // Check for existing selection
    const existingSelection = formState.data.paintSelections.find(p => p.projectType === location);
    if (existingSelection) {
      paintSelection.brand = existingSelection.brand || '';
      paintSelection.finish = existingSelection.finish || '';
      paintSelection.products = existingSelection.products || [];
      paintSelection.selectedProduct = existingSelection.selectedProduct;
      formState.data.paintSelections = formState.data.paintSelections.filter(p => p.projectType !== location);
    }
    
    formState.data.paintSelections.push(paintSelection);
    formState.saveState();
    
    // Paint finish selection
    content.innerHTML = `
      <div class="paint-finish-section mb-4">
        <h4 class="text-md font-semibold mb-2">Paint Finish</h4>
        <div class="select-container">
          <select class="paint-finish-select" id="finish-select-${paintId}">
            <option value="">Select a finish...</option>
            <option value="Flat">Flat</option>
            <option value="Low Sheen">Low Sheen</option>
            <option value="Satin">Satin</option>
            <option value="Semi-Gloss">Semi-Gloss</option>
            <option value="Gloss">Gloss</option>
          </select>
        </div>
      </div>
      
      <div class="paint-brand-section mb-4">
        <h4 class="text-md font-semibold mb-2">Paint Brand</h4>
        <div class="select-container">
          <select class="paint-brand-select" id="brand-select-${paintId}" disabled>
            <option value="">Select a finish first...</option>
          </select>
        </div>
      </div>
      
      <div id="paint-products-${paintId}" class="paint-products-section"></div>
    `;
    
    // Set saved values
    const finishSelect = content.querySelector(`#finish-select-${paintId}`);
    const brandSelect = content.querySelector(`#brand-select-${paintId}`);
    
    if (paintSelection.finish) {
      finishSelect.value = paintSelection.finish;
      updatePaintBrands(paintId, paintSelection.finish);
      
      if (paintSelection.brand) {
        setTimeout(() => {
          brandSelect.value = paintSelection.brand;
          updatePaintProducts(paintId, paintSelection.brand, paintSelection.finish);
        }, 100);
      }
    }
    
    // Add event listeners
    finishSelect.addEventListener('change', (e) => {
      updatePaintFinish(paintId, e.target.value);
    });
    
    brandSelect.addEventListener('change', (e) => {
      updatePaintBrand(paintId, e.target.value);
    });
    
    return content;
  }

  // Update functions for paint selection
  function updatePaintFinish(paintId, finish) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    paintSelection.finish = finish;
    paintSelection.brand = '';
    paintSelection.products = [];
    paintSelection.selectedProduct = null;
    formState.saveState();
    
    // Update brand dropdown
    updatePaintBrands(paintId, finish);
    
    // Clear products
    const productsContainer = document.getElementById(`paint-products-${paintId}`);
    if (productsContainer) {
      productsContainer.innerHTML = '';
    }
  }

  function updatePaintBrands(paintId, finish) {
    const brandSelect = document.querySelector(`#brand-select-${paintId}`);
    if (!brandSelect) return;
    
    if (!finish) {
      brandSelect.disabled = true;
      brandSelect.innerHTML = '<option value="">Select a finish first...</option>';
      return;
    }
    
    // Get unique brands for the selected finish
    const brandsForFinish = [...new Set(
      bitrixProducts
        .filter(p => p.PROPERTY_FINISH_VALUE === finish)
        .map(p => p.PROPERTY_BRAND_VALUE)
        .filter(Boolean)
    )].sort();
    
    brandSelect.disabled = false;
    brandSelect.innerHTML = `
      <option value="">Select a brand...</option>
      ${brandsForFinish.map(brand => 
        `<option value="${brand}">${brand}</option>`
      ).join('')}
    `;
  }

  function updatePaintBrand(paintId, brand) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    paintSelection.brand = brand;
    formState.saveState();
    
    if (brand && paintSelection.finish) {
      updatePaintProducts(paintId, brand, paintSelection.finish);
    }
  }

  function updatePaintProducts(paintId, brand, finish) {
    const productsContainer = document.getElementById(`paint-products-${paintId}`);
    if (!productsContainer) return;
    
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    // Filter products
    const filteredProducts = bitrixProducts.filter(p => 
      p.PROPERTY_BRAND_VALUE === brand && 
      p.PROPERTY_FINISH_VALUE === finish
    );
    
    paintSelection.products = filteredProducts;
    formState.saveState();
    
    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = '<p class="text-gray-500">No products found for this combination.</p>';
      return;
    }
    
    // Create product grid
    productsContainer.innerHTML = `
      <h4 class="text-md font-semibold mb-2">Select Product</h4>
      <div class="paint-products-grid">
        ${filteredProducts.map(product => `
          <div class="paint-product-card ${paintSelection.selectedProduct?.ID === product.ID ? 'selected' : ''}"
               data-product-id="${product.ID}"
               onclick="selectPaintProduct('${paintId}', '${product.ID}')">
            <h5 class="font-medium">${product.NAME}</h5>
            <p class="text-sm text-gray-600 mt-1">${product.DETAIL_TEXT || ''}</p>
            <p class="text-sm font-semibold mt-2">$${product.PRICE || '0'}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Global function to select paint product
  window.selectPaintProduct = function(paintId, productId) {
    const paintSelection = formState.data.paintSelections.find(p => p.id === paintId);
    if (!paintSelection) return;
    
    const product = paintSelection.products.find(p => p.ID === productId);
    if (!product) return;
    
    paintSelection.selectedProduct = product;
    formState.saveState();
    
    // Update UI
    const cards = document.querySelectorAll(`#paint-products-${paintId} .paint-product-card`);
    cards.forEach(card => {
      card.classList.toggle('selected', card.dataset.productId === productId);
    });
  };

  // Enhanced surfaces functionality with auto-calculated areas
  window.renderSurfacesInPaintCard = function(paintCardId, surfaceType) {
    // First ensure surfaces are initialized
    if (!formState.data.surfaces) {
      formState.data.surfaces = getDefaultSurfaces();
      formState.saveState();
    }
    
    // Create surfaces container
    const surfacesContainer = document.createElement('div');
    surfacesContainer.id = `surfaces-container-${paintCardId}`;
    surfacesContainer.className = 'surfaces-container mt-4 p-4 bg-gray-50 rounded-lg';
    
    // Add heading with info
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-semibold mb-3 flex items-center justify-between';
    heading.innerHTML = `
      <span>Section Areas & Measurements</span>
      <span class="text-sm font-normal text-gray-600">
        <i class="fas fa-info-circle"></i> 
        Data synced from measurements
      </span>
    `;
    surfacesContainer.appendChild(heading);
    
    // Filter surfaces by type
    const relevantSurfaces = formState.data.surfaces.filter(s => s.type === surfaceType);
    
    relevantSurfaces.forEach(surface => {
      const surfaceCard = createSurfaceCard(surface);
      surfacesContainer.appendChild(surfaceCard);
    });
    
    // Add new surface button
    const addSurfaceBtn = document.createElement('button');
    addSurfaceBtn.className = 'btn btn-primary w-full mt-4';
    addSurfaceBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Section';
    addSurfaceBtn.addEventListener('click', () => {
      const newSurface = {
        id: `surface-${Date.now()}`,
        type: surfaceType,
        name: `New ${surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)} Section`,
        unit: 'Sq Ft',
        measurements: [{
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: 'Main Area',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: []
        }]
      };
      
      formState.data.surfaces.push(newSurface);
      calculateAndUpdateStateAreas(newSurface.id);
      formState.saveState();
      
      // Re-render
      const newContainer = renderSurfacesInPaintCard(paintCardId, surfaceType);
      surfacesContainer.replaceWith(newContainer);
    });
    
    surfacesContainer.appendChild(addSurfaceBtn);
    return surfacesContainer;
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the paint-surfaces page
    if (!document.getElementById('paint-selections-container')) return;
    
    // Load Bitrix products first
    initializePaintSelection().then(() => {
      // Create service-based paint cards
      createServiceBasedPaintCards();
    });
  });

  // Export functions for use in other scripts
  window.PaintSurfacesEnhanced = {
    initializeServicesFromPage1,
    createServiceBasedPaintCards,
    serviceConfig
  };

})();
