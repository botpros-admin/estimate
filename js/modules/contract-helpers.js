// Contract Helpers Module - Consolidated Production Version
// Handles contract initialization, redundancy removal, and UI fixes
// Consolidated from: contract-init-fix.js, contract-redundancy-fix.js,
// contract-materials-clean.js, contract-scope-clean.js, valid-until-default.js,
// dropdown-responsive-fix.js

(function() {
  'use strict';
  
  // 1. Ensure formState is loaded from localStorage
  function ensureFormStateLoaded() {
    if (!window.formState) {
      window.formState = {
        data: {},
        loadState: function() {
          try {
            const savedState = localStorage.getItem('paintEstimatorState');
            if (savedState) {
              const parsed = JSON.parse(savedState);
              this.data = parsed.data || parsed;
            } else {
              this.data = {};
            }
          } catch (error) {
            this.data = {};
          }
        },
        saveState: function() {
          try {
            localStorage.setItem('paintEstimatorState', JSON.stringify({ data: this.data }));
          } catch (error) {
            // Silent fail
          }
        }
      };
    }
    
    // Load the state
    if (window.formState.loadState) {
      window.formState.loadState();
    }
    
    // Make sure all expected properties exist
    window.formState.data = window.formState.data || {};
    window.formState.data.surfaces = window.formState.data.surfaces || [];
    window.formState.data.paintSelections = window.formState.data.paintSelections || [];
  }
  
  // 2. Clean up surfaces summary to show only selected services
  function cleanupSurfacesSummary() {
    const surfacesSummary = document.getElementById('surfaces-summary');
    if (!surfacesSummary || !window.formState || !window.formState.data) {
      return false;
    }
    
    const formData = window.formState.data;
    surfacesSummary.innerHTML = '';
    
    const surfaces = formData.surfaces || [];
    const paintSelections = formData.paintSelections || [];
    const serviceTypes = formData.serviceTypes || [];
    
    // Track which services to show
    const servicesNeeded = new Set();
    
    // Check surfaces for selected services
    surfaces.forEach(surface => {
      if (surface.includePaintingService) servicesNeeded.add('painting');
      if (surface.includeConcreteCoating) servicesNeeded.add('concrete');
      if (surface.includeWoodCoating) servicesNeeded.add('wood');
      if (surface.includeAbrasive) servicesNeeded.add('abrasive');
    });
    
    // Create summaries only for needed services
    if (servicesNeeded.has('painting')) {
      const paintingSection = createServiceSection('Painting Services', surfaces, paintSelections, 'painting');
      if (paintingSection) surfacesSummary.appendChild(paintingSection);
    }
    
    if (servicesNeeded.has('concrete')) {
      const concreteSection = createServiceSection('Concrete Coating Services', surfaces, null, 'concrete');
      if (concreteSection) surfacesSummary.appendChild(concreteSection);
    }
    
    if (servicesNeeded.has('wood')) {
      const woodSection = createServiceSection('Wood Coating Services', surfaces, null, 'wood');
      if (woodSection) surfacesSummary.appendChild(woodSection);
    }
    
    if (servicesNeeded.has('abrasive')) {
      const abrasiveSection = createServiceSection('Abrasive Method Services', surfaces, null, 'abrasive');
      if (abrasiveSection) surfacesSummary.appendChild(abrasiveSection);
    }    
    return true;
  }
  
  // 3. Create service section for contract summary
  function createServiceSection(title, surfaces, paintSelections, serviceType) {
    const section = document.createElement('div');
    section.className = 'mb-4';
    
    const header = document.createElement('h4');
    header.className = 'font-bold text-lg mb-2';
    header.textContent = title;
    section.appendChild(header);
    
    const relevantSurfaces = surfaces.filter(surface => {
      switch (serviceType) {
        case 'painting': return surface.includePaintingService;
        case 'concrete': return surface.includeConcreteCoating;
        case 'wood': return surface.includeWoodCoating;
        case 'abrasive': return surface.includeAbrasive;
        default: return false;
      }
    });
    
    if (relevantSurfaces.length === 0) return null;
    
    const list = document.createElement('ul');
    list.className = 'list-disc ml-5';
    
    relevantSurfaces.forEach(surface => {
      const li = document.createElement('li');
      li.textContent = `${surface.name}: ${surface.totalArea || 0} sq ft`;
      
      // Add paint selection info if painting service
      if (serviceType === 'painting' && paintSelections) {
        const paint = paintSelections.find(p => p.surfaceId === surface.id);
        if (paint && paint.selectedProduct) {
          li.textContent += ` - ${paint.selectedProduct.name}`;
        }
      }
      
      list.appendChild(li);
    });
    
    section.appendChild(list);
    return section;
  }
  
  // 4. Set default valid until date (30 days from today)
  function setValidUntilDefault() {
    const validUntilInput = document.getElementById('valid-until');
    if (!validUntilInput) return;
    
    // Check if already has a value
    if (validUntilInput.value) return;
    
    // Set to 30 days from today
    const today = new Date();
    const validUntil = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    // Format as YYYY-MM-DD
    const year = validUntil.getFullYear();
    const month = String(validUntil.getMonth() + 1).padStart(2, '0');
    const day = String(validUntil.getDate()).padStart(2, '0');
    
    validUntilInput.value = `${year}-${month}-${day}`;
  }
  
  // 5. Fix dropdown responsiveness
  function fixDropdownResponsiveness() {
    const dropdowns = document.querySelectorAll('select');
    
    dropdowns.forEach(select => {
      // Add responsive classes if missing
      if (!select.classList.contains('w-full')) {
        select.classList.add('w-full');
      }
      
      // Ensure proper touch handling for mobile
      select.style.webkitAppearance = 'none';
      select.style.appearance = 'none';
      
      // Add arrow indicator if missing
      if (!select.parentElement.querySelector('.dropdown-arrow')) {
        const arrow = document.createElement('span');
        arrow.className = 'dropdown-arrow absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none';
        arrow.innerHTML = '▼';
        select.parentElement.style.position = 'relative';
        select.parentElement.appendChild(arrow);
      }
    });
  }
  
  // 6. Initialize contract page
  function initializeContractPage() {
    // Ensure formState is loaded
    ensureFormStateLoaded();
    
    // Clean up redundant service displays
    cleanupSurfacesSummary();
    
    // Set default valid until date
    setValidUntilDefault();
    
    // Fix dropdown responsiveness
    fixDropdownResponsiveness();
    
    // Clean up materials section
    cleanupMaterialsSection();
    
    // Clean up scope section
    cleanupScopeSection();
  }
  
  // 7. Clean materials section (from contract-materials-clean.js)
  function cleanupMaterialsSection() {
    const formData = window.formState?.data || {};
    const paintSelections = formData.paintSelections || [];
    const selectedProducts = new Map();
    
    // Group products by unique product name
    paintSelections.forEach(selection => {
      if (selection.selectedProduct) {
        const key = selection.selectedProduct.name;
        if (!selectedProducts.has(key)) {
          selectedProducts.set(key, {
            product: selection.selectedProduct,
            surfaces: []
          });
        }
        selectedProducts.get(key).surfaces.push(selection.surfaceName || 'Surface');
      }
    });
    
    // Update materials display
    const materialsContainer = document.getElementById('selected-materials');
    if (materialsContainer && selectedProducts.size > 0) {
      materialsContainer.innerHTML = '';
      
      selectedProducts.forEach((data, productName) => {
        const materialDiv = document.createElement('div');
        materialDiv.className = 'mb-2';
        materialDiv.innerHTML = `<strong>${productName}</strong> - ${data.surfaces.join(', ')}`;
        materialsContainer.appendChild(materialDiv);
      });
    }
  }
  
  // 8. Clean scope section (from contract-scope-clean.js)
  function cleanupScopeSection() {
    const scopeSection = document.getElementById('scope-section');
    if (!scopeSection) return;
    
    const formData = window.formState?.data || {};
    const surfaces = formData.surfaces || [];
    
    // Only show surfaces with selected services
    const activeSurfaces = surfaces.filter(surface => 
      surface.includePaintingService || 
      surface.includeConcreteCoating || 
      surface.includeWoodCoating || 
      surface.includeAbrasive
    );
    
    if (activeSurfaces.length === 0) {
      scopeSection.innerHTML = '<p>No services selected.</p>';
      return;
    }
    
    // Build clean scope display
    const scopeContent = document.createElement('div');
    activeSurfaces.forEach(surface => {
      const surfaceDiv = document.createElement('div');
      surfaceDiv.className = 'mb-3';
      
      const services = [];
      if (surface.includePaintingService) services.push('Painting');
      if (surface.includeConcreteCoating) services.push('Concrete Coating');
      if (surface.includeWoodCoating) services.push('Wood Coating');
      if (surface.includeAbrasive) services.push('Abrasive Method');
      
      surfaceDiv.innerHTML = `
        <strong>${surface.name}</strong> (${surface.totalArea || 0} sq ft)<br>
        Services: ${services.join(', ')}
      `;
      
      scopeContent.appendChild(surfaceDiv);
    });
    
    scopeSection.innerHTML = '';
    scopeSection.appendChild(scopeContent);
  }
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContractPage);
  } else {
    setTimeout(initializeContractPage, 100);
  }
  
  // Export functions for external use
  window.contractHelpers = {
    ensureFormStateLoaded,
    cleanupSurfacesSummary,
    setValidUntilDefault,
    fixDropdownResponsiveness,
    cleanupMaterialsSection,
    cleanupScopeSection,
    initializeContractPage
  };
  
})();