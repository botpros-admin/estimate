  // Create surface coating method card (for concrete and wood treatments)
  function createSurfaceCoatingMethodCard(methodType, displayName, selectedServices) {
    // Create a fragment to hold all service cards
    const fragment = document.createDocumentFragment();
    
    // Map service values to display names and icons
    const serviceData = {
      // Concrete coating services
      'epoxy_floors': { name: 'Epoxy Floors', icon: 'Concrete_Icon.png' },
      'sealing': { name: 'Sealing', icon: 'Concrete_Icon.png' },
      'decorative_overlays': { name: 'Decorative Overlays', icon: 'Concrete_Icon.png' },
      'dye_colorants': { name: 'Dye & Colorants', icon: 'Concrete_Icon.png' },
      'polishing': { name: 'Polishing', icon: 'Concrete_Icon.png' },
      // Wood treatment services
      'stains': { name: 'Stains', icon: 'Wood_Icon.png' },
      'sealers': { name: 'Sealers', icon: 'Wood_Icon.png' },
      'protective_clearcoat': { name: 'Protective Clearcoat', icon: 'Wood_Icon.png' }
    };
    
    // Create a card for each selected service
    selectedServices.forEach((serviceValue, index) => {
      try {
        const serviceId = `${methodType}-${serviceValue}-${Date.now()}-${index}`;
        const service = serviceData[serviceValue] || { name: serviceValue, icon: methodType === 'concrete' ? 'Concrete_Icon.png' : 'Wood_Icon.png' };
        
        // Ensure this service has a default surface if none exists
        if (!formState.data.surfaces) {
          formState.data.surfaces = [];
        }
        
        // Check if surfaces exist for this service type
        const existingSurfaces = formState.data.surfaces.filter(s => s.type === serviceValue);
        if (existingSurfaces.length === 0) {
          // Create default surface for this service
          const defaultSurface = {
            id: `surface-${Date.now()}-${serviceValue}`,
            type: serviceValue,
            name: `${service.name} Area`,
            unit: FIXED_UNIT,
            measurements: [{
              id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              description: 'Main Area',
              entryType: 'lxh',
              isDeduction: false,
              dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
              totalValue: '',
              photos: [],
              color: ''
            }]
          };
          
          formState.data.surfaces.push(defaultSurface);
          formState.saveState();
        }
        
        const serviceCard = document.createElement('div');
        serviceCard.className = 'paint-card';
        serviceCard.dataset.serviceId = serviceId;
        
        // Service header
        const serviceHeader = document.createElement('div');
        serviceHeader.className = 'mb-4 p-3 bg-gray-50 rounded-lg';
        serviceHeader.style.cursor = 'pointer';
        serviceHeader.innerHTML = `
          <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <img src="../img/${service.icon}" alt="${service.name} icon" class="w-5 h-5">
            ${service.name}
            <svg class="chevron-icon ml-auto transform transition-transform" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </h3>
        `;
        
        // Collapsible content
        const serviceContent = document.createElement('div');
        serviceContent.className = 'service-content';
        serviceContent.style.display = 'block';
        
        // Header click to toggle
        serviceHeader.addEventListener('click', () => {
          const isHidden = serviceContent.style.display === 'none';
          serviceContent.style.display = isHidden ? 'block' : 'none';
          const chevron = serviceHeader.querySelector('.chevron-icon');
          chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
        
        serviceCard.appendChild(serviceHeader);
        serviceCard.appendChild(serviceContent);
        
        // Add surfaces for this service
        const serviceSurfaces = renderSurfacesForServiceType(serviceValue);
        serviceContent.appendChild(serviceSurfaces);
        
        fragment.appendChild(serviceCard);
      } catch (error) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, {
            category: window.ErrorCategory.UI,
            context: { serviceValue },
            silent: true
          });
        }
      }
    });
    
    return fragment;
  }
  
  // Render surfaces for a specific service type
  function renderSurfacesForServiceType(serviceType) {
    const fragment = document.createDocumentFragment();
    
    // Get surfaces for this service type
    const surfaces = formState.data.surfaces.filter(s => s.type === serviceType);
    
    surfaces.forEach(surface => {
      const surfaceCard = createSurfaceCard(surface);
      fragment.appendChild(surfaceCard);
    });
    
    // Add surface button
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-secondary w-full';
    addButton.innerHTML = `<i class="fas fa-plus mr-2"></i>Add Section`;
    addButton.addEventListener('click', () => {
      const newSurface = {
        id: `surface-${Date.now()}`,
        type: serviceType,
        name: 'New Section',
        unit: FIXED_UNIT,
        measurements: [{
          id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description: '',
          entryType: 'lxh',
          isDeduction: false,
          dimensions: [{ id: `dim-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, l: '', h: '' }],
          totalValue: '',
          photos: [],
          color: ''
        }]
      };
      
      formState.data.surfaces.push(newSurface);
      formState.saveState();
      
      // Re-render
      const container = document.getElementById('paint-selections-container');
      if (container) {
        renderPaintSelectionsEnhanced();
      }
    });
    
    fragment.appendChild(addButton);
    return fragment;
  }
