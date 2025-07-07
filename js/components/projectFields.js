function renderProjectSpecificFields() {
  const container = document.getElementById('project-specific-fields');
  if (!container) return;

  if (!formState.data.project_type) {
    container.classList.add('hidden');
    return;
  } else {
    container.classList.remove('hidden');
  }

  // Clear the container
  container.innerHTML = '';

  // Create header
  const header = document.createElement('div');
  header.className = 'bg-gray-50 px-4 py-3 border-b border-gray-200';
  header.innerHTML = '<h3 class="text-base font-semibold text-gray-700">Project Details</h3>';
  container.appendChild(header);

  // Create content container
  const content = document.createElement('div');
  content.className = 'p-4';

  // Add fields based on project type
  let fieldsHTML = '';

  switch(formState.data.project_type) {
    case 'Residential':
      fieldsHTML = `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Community Name
          </label>
          <input type="text"
                id="community-name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="e.g. Las Verdes, Sunny Apartments"
                value="${formState.data.communityName || ''}">
        </div>
      `;
      break;

    case 'Commercial':
      fieldsHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input type="text"
                  id="location-name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. Coral Square, Broward Mall"
                  value="${formState.data.locationName || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input type="text"
                  id="company-name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. JC Penney's, XYZ Corp"
                  value="${formState.data.companyName || ''}">
          </div>
        </div>
      `;
      break;

    case 'Community':
      fieldsHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Community Name
            </label>
            <input type="text"
                  id="community-name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. Las Verdes, Sunny Apartments"
                  value="${formState.data.communityName || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input type="text"
                  id="company-name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. Delwood HOA, FirstService Residential"
                  value="${formState.data.companyName || ''}">
          </div>
        </div>
      `;
      break;

    case 'Public Sector':
      fieldsHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Government Jurisdiction
            </label>
            <input type="text"
                  id="government-jurisdiction"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. City of Miami, Broward County"
                  value="${formState.data.governmentJurisdiction || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Government Agency
            </label>
            <input type="text"
                  id="government-agency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="e.g. Fire Station #26, Parks & Rec"
                  value="${formState.data.governmentAgency || ''}">
          </div>
        </div>
      `;
      break;
  }

  content.innerHTML = fieldsHTML;
  container.appendChild(content);

  // Add event listeners for specific fields
  if (formState.data.project_type === 'Residential' || formState.data.project_type === 'Community') {
    const communityNameInput = document.getElementById('community-name');
    if (communityNameInput) {
      // Remove any existing listeners to prevent duplicates
      communityNameInput.removeEventListener('input', communityNameInput.inputHandler);
      // Store the handler so we can remove it later
      communityNameInput.inputHandler = function() {
        formState.updateField('communityName', this.value);
      };
      communityNameInput.addEventListener('input', communityNameInput.inputHandler);
    }
  }

  if (formState.data.project_type === 'Commercial' || formState.data.project_type === 'Community') {
    const companyNameInput = document.getElementById('company-name');
    if (companyNameInput) {
      // Remove any existing listeners to prevent duplicates
      companyNameInput.removeEventListener('input', companyNameInput.inputHandler);
      // Store the handler so we can remove it later
      companyNameInput.inputHandler = function() {
        formState.updateField('companyName', this.value);
      };
      companyNameInput.addEventListener('input', companyNameInput.inputHandler);
    }

    if (formState.data.project_type === 'Commercial') {
      const locationNameInput = document.getElementById('location-name');
      if (locationNameInput) {
        // Remove any existing listeners to prevent duplicates
        locationNameInput.removeEventListener('input', locationNameInput.inputHandler);
        // Store the handler so we can remove it later
        locationNameInput.inputHandler = function() {
          formState.updateField('locationName', this.value);
        };
        locationNameInput.addEventListener('input', locationNameInput.inputHandler);
      }
    }
  }

  if (formState.data.project_type === 'Public Sector') {
    const governmentJurisdictionInput = document.getElementById('government-jurisdiction');
    if (governmentJurisdictionInput) {
      // Remove any existing listeners to prevent duplicates
      governmentJurisdictionInput.removeEventListener('input', governmentJurisdictionInput.inputHandler);
      // Store the handler so we can remove it later
      governmentJurisdictionInput.inputHandler = function() {
        formState.updateField('governmentJurisdiction', this.value);
      };
      governmentJurisdictionInput.addEventListener('input', governmentJurisdictionInput.inputHandler);
    }

    const governmentAgencyInput = document.getElementById('government-agency');
    if (governmentAgencyInput) {
      // Remove any existing listeners to prevent duplicates
      governmentAgencyInput.removeEventListener('input', governmentAgencyInput.inputHandler);
      // Store the handler so we can remove it later
      governmentAgencyInput.inputHandler = function() {
        formState.updateField('governmentAgency', this.value);
      };
      governmentAgencyInput.addEventListener('input', governmentAgencyInput.inputHandler);
    }
  }
}
