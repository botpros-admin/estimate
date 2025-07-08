// Contract Builder JavaScript Module
(function() {
  'use strict';
  
  let currentStep = 0;
  const totalSteps = 6;
  const steps = [
    'step-basic-info',
    'step-scope-work', 
    'step-materials',
    'step-terms',
    'step-inclusions',
    'step-review'
  ];
  
  // Initialize contract data in formState
  function initializeContractData() {
    if (!formState.data.contract) {
      formState.data.contract = {
        number: generateContractNumber(),
        date: new Date().toISOString().split('T')[0],
        startDate: '',
        completionDate: '',
        contractorRep: '',
        scopeNotes: '',
        materialSupply: 'contractor',
        materialNotes: '',
        paymentSchedule: 'net30',
        warrantyPeriod: '1',
        changeOrderPolicy: 'Any changes to the scope of work must be approved in writing before implementation. Additional charges may apply.',
        inclusions: getDefaultInclusions(),
        exclusions: getDefaultExclusions()
      };
      formState.saveState();
    }
  }
  
  // Generate contract number
  window.generateContractNumber = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HTZ-${year}${month}-${random}`;
  };
  
  // Get default inclusions
  function getDefaultInclusions() {
    return [
      'All labor and supervision',
      'Surface preparation as specified',
      'Prime and finish coats as specified',
      'Protection of surrounding areas',
      'Daily cleanup and debris removal',
      'Touch-up paint (1 quart per color)'
    ];
  }
  
  // Get default exclusions  
  function getDefaultExclusions() {
    return [
      'Repairs to damaged substrate',
      'Lead paint testing or remediation',
      'Asbestos testing or remediation',
      'Structural repairs',
      'Electrical or plumbing work',
      'Landscaping repairs'
    ];
  }
  
  // Navigation functions
  window.nextStep = function() {
    if (currentStep < totalSteps - 1) {
      if (validateCurrentStep()) {
        saveStepData();
        currentStep++;
        showStep(currentStep);
        updateStepIndicator();
      }
    }
  };
  
  window.previousStep = function() {
    if (currentStep > 0) {
      saveStepData();
      currentStep--;
      showStep(currentStep);
      updateStepIndicator();
    }
  };
  
  // Show specific step
  function showStep(stepIndex) {
    // Hide all steps
    document.querySelectorAll('.contract-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(steps[stepIndex]).classList.add('active');
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-button');
    const nextBtn = document.getElementById('next-button');
    
    prevBtn.style.display = stepIndex === 0 ? 'none' : 'block';
    nextBtn.textContent = stepIndex === totalSteps - 1 ? 'Finish' : 'Next';
    
    // Load step-specific data
    loadStepData(stepIndex);
  }
  
  // Update step indicator
  function updateStepIndicator() {
    const indicators = document.querySelectorAll('.step-item');
    indicators.forEach((indicator, index) => {
      indicator.classList.remove('active', 'completed');
      if (index === currentStep) {
        indicator.classList.add('active');
      } else if (index < currentStep) {
        indicator.classList.add('completed');
      }
    });
  }
  
  // Validate current step
  function validateCurrentStep() {
    switch (currentStep) {
      case 0: // Basic Info
        const startDate = document.getElementById('start-date').value;
        const completionDate = document.getElementById('completion-date').value;
        const contractorRep = document.getElementById('contractor-rep').value;
        
        if (!startDate || !completionDate || !contractorRep) {
          alert('Please fill in all required fields');
          return false;
        }
        break;
    }
    return true;
  }
  
  // Save step data
  function saveStepData() {
    const contract = formState.data.contract;
    
    switch (currentStep) {
      case 0: // Basic Info
        contract.number = document.getElementById('contract-number').value;
        contract.date = document.getElementById('contract-date').value;
        contract.startDate = document.getElementById('start-date').value;
        contract.completionDate = document.getElementById('completion-date').value;
        contract.contractorRep = document.getElementById('contractor-rep').value;
        break;
        
      case 1: // Scope of Work
        contract.scopeNotes = document.getElementById('scope-notes').value;
        break;
        
      case 2: // Materials
        contract.materialSupply = document.getElementById('material-supply').value;
        contract.materialNotes = document.getElementById('material-notes').value;
        break;
        
      case 3: // Terms
        contract.paymentSchedule = document.getElementById('payment-schedule').value;
        contract.warrantyPeriod = document.getElementById('warranty-period').value;
        contract.changeOrderPolicy = document.getElementById('change-order-policy').value;
        break;
    }
    
    formState.saveState();
  }
  
  // Load step data
  function loadStepData(stepIndex) {
    const contract = formState.data.contract;
    
    switch (stepIndex) {
      case 0: // Basic Info
        document.getElementById('contract-number').value = contract.number || generateContractNumber();
        document.getElementById('contract-date').value = contract.date || new Date().toISOString().split('T')[0];
        document.getElementById('start-date').value = contract.startDate || '';
        document.getElementById('completion-date').value = contract.completionDate || '';
        document.getElementById('contractor-rep').value = contract.contractorRep || '';
        break;
        
      case 1: // Scope of Work
        loadScopePreview();
        document.getElementById('scope-notes').value = contract.scopeNotes || '';
        break;
        
      case 2: // Materials
        loadMaterialsList();
        document.getElementById('material-supply').value = contract.materialSupply || 'contractor';
        document.getElementById('material-notes').value = contract.materialNotes || '';
        updateMaterialNotesVisibility();
        break;
        
      case 3: // Terms
        document.getElementById('payment-schedule').value = contract.paymentSchedule || 'net30';
        document.getElementById('warranty-period').value = contract.warrantyPeriod || '1';
        document.getElementById('change-order-policy').value = contract.changeOrderPolicy || '';
        updatePaymentDetails();
        break;
        
      case 4: // Inclusions
        loadInclusionsExclusions();
        break;
        
      case 5: // Review
        loadContractSummary();
        calculateContractTotal();
        break;
    }
  }
  
  // Load scope preview based on project selections
  function loadScopePreview() {
    const scopePreview = document.getElementById('scope-preview');
    scopePreview.innerHTML = '';
    
    // Get service types
    const serviceTypes = formState.data.serviceTypes || [];
    
    // Add painting scope if selected
    if (serviceTypes.includes('painting')) {
      const paintSelections = formState.data.paintSelections || [];
      paintSelections.forEach(selection => {
        if (selection.type === 'interior' || selection.type === 'exterior') {
          const scopeItem = document.createElement('div');
          scopeItem.className = 'bg-gray-50 p-3 rounded';
          scopeItem.innerHTML = `
            <h4 class="font-medium">${selection.type === 'interior' ? 'Interior' : 'Exterior'} Painting</h4>
            <p class="text-sm text-gray-600 mt-1">
              ${selection.brand || 'TBD'} ${selection.productName || 'paint'} 
              ${selection.finish ? `- ${selection.finish} finish` : ''}
            </p>
            <p class="text-sm text-gray-600">
              Total Area: ${formatForDisplay(selection.totalSurfaceArea || 0)} sq ft
            </p>
          `;
          scopePreview.appendChild(scopeItem);
        }
      });
    }
    
    // Add cleaning scope if selected
    if (serviceTypes.includes('abrasive')) {
      const abrasiveMethods = formState.data.abrasiveMethods || [];
      abrasiveMethods.forEach(method => {
        const scopeItem = document.createElement('div');
        scopeItem.className = 'bg-gray-50 p-3 rounded';
        let methodName = method === 'sandblasting' ? 'Sandblasting' :
                        method === 'pressure' ? 'Pressure Cleaning' :
                        method === 'chemical' ? 'Chemical Treatment' : method;
        scopeItem.innerHTML = `
          <h4 class="font-medium">${methodName}</h4>
          <p class="text-sm text-gray-600 mt-1">
            Surface preparation using ${methodName.toLowerCase()} method
          </p>
        `;
        scopePreview.appendChild(scopeItem);
      });
    }
  }
  
  // Load materials list
  function loadMaterialsList() {
    const materialsList = document.getElementById('materials-list');
    materialsList.innerHTML = '';
    
    const paintSelections = formState.data.paintSelections || [];
    paintSelections.forEach(selection => {
      if (selection.brand && selection.productName) {
        const materialItem = document.createElement('div');
        materialItem.className = 'bg-gray-50 p-3 rounded';
        materialItem.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium">${selection.brand} ${selection.productName}</h4>
              <p class="text-sm text-gray-600">${selection.finish || 'Standard'} finish</p>
              <p class="text-sm text-gray-600">Coverage: ${selection.coverage || 350} sq ft/gal</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">Estimated Quantity</p>
              <p class="text-lg">${calculatePaintGallons(selection)} gal</p>
            </div>
          </div>
        `;
        materialsList.appendChild(materialItem);
      }
    });
  }
  
  // Calculate paint gallons needed
  function calculatePaintGallons(selection) {
    const area = selection.totalSurfaceArea || 0;
    const coverage = selection.coverage || 350;
    const coats = 2; // Assume 2 coats
    return Math.ceil((area * coats) / coverage);
  }
  
  // Material supply visibility
  function updateMaterialNotesVisibility() {
    const supply = document.getElementById('material-supply').value;
    const notesContainer = document.getElementById('material-notes-container');
    notesContainer.style.display = supply === 'mixed' ? 'block' : 'none';
  }
  
  // Payment details update
  function updatePaymentDetails() {
    const schedule = document.getElementById('payment-schedule').value;
    const detailsDiv = document.getElementById('payment-details');
    detailsDiv.innerHTML = '';
    
    if (schedule === 'milestone') {
      detailsDiv.innerHTML = `
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Upon Contract Signing:</span>
            <span>25%</span>
          </div>
          <div class="flex justify-between">
            <span>Upon Material Delivery:</span>
            <span>25%</span>
          </div>
          <div class="flex justify-between">
            <span>Mid-Project:</span>
            <span>25%</span>
          </div>
          <div class="flex justify-between">
            <span>Upon Completion:</span>
            <span>25%</span>
          </div>
        </div>
      `;
    }
  }
  
  // Inclusions/Exclusions management
  function loadInclusionsExclusions() {
    const inclusionsList = document.getElementById('inclusions-list');
    const exclusionsList = document.getElementById('exclusions-list');
    
    inclusionsList.innerHTML = '';
    exclusionsList.innerHTML = '';
    
    // Load inclusions
    (formState.data.contract.inclusions || []).forEach((item, index) => {
      const itemDiv = createInclusionExclusionItem(item, 'inclusion', index);
      inclusionsList.appendChild(itemDiv);
    });
    
    // Load exclusions
    (formState.data.contract.exclusions || []).forEach((item, index) => {
      const itemDiv = createInclusionExclusionItem(item, 'exclusion', index);
      exclusionsList.appendChild(itemDiv);
    });
  }
  
  function createInclusionExclusionItem(text, type, index) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2';
    div.innerHTML = `
      <input type="text" value="${text}" class="flex-1 px-2 py-1 border rounded text-sm" 
             onchange="updateInclusionExclusion('${type}', ${index}, this.value)">
      <button class="text-red-500 hover:text-red-700" 
              onclick="removeInclusionExclusion('${type}', ${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    return div;
  }
  
  // Add/remove/update inclusions and exclusions
  window.addInclusion = function() {
    formState.data.contract.inclusions.push('');
    formState.saveState();
    loadInclusionsExclusions();
  };
  
  window.addExclusion = function() {
    formState.data.contract.exclusions.push('');
    formState.saveState();
    loadInclusionsExclusions();
  };
  
  window.updateInclusionExclusion = function(type, index, value) {
    if (type === 'inclusion') {
      formState.data.contract.inclusions[index] = value;
    } else {
      formState.data.contract.exclusions[index] = value;
    }
    formState.saveState();
  };
  
  window.removeInclusionExclusion = function(type, index) {
    if (type === 'inclusion') {
      formState.data.contract.inclusions.splice(index, 1);
    } else {
      formState.data.contract.exclusions.splice(index, 1);
    }
    formState.saveState();
    loadInclusionsExclusions();
  };
  
  // Contract summary
  function loadContractSummary() {
    const summary = document.getElementById('contract-summary');
    const contract = formState.data.contract;
    
    summary.innerHTML = `
      <p><strong>Contract #:</strong> ${contract.number}</p>
      <p><strong>Date:</strong> ${formatDate(contract.date)}</p>
      <p><strong>Client:</strong> ${formState.data.contacts[0]?.name || 'TBD'}</p>
      <p><strong>Property:</strong> ${formState.data.siteAddress?.street || 'TBD'}</p>
      <p><strong>Start Date:</strong> ${formatDate(contract.startDate)}</p>
      <p><strong>Completion Date:</strong> ${formatDate(contract.completionDate)}</p>
      <p><strong>Payment Terms:</strong> ${getPaymentTermsText(contract.paymentSchedule)}</p>
      <p><strong>Warranty:</strong> ${contract.warrantyPeriod} Year(s)</p>
    `;
  }
  
  // Calculate contract total
  function calculateContractTotal() {
    if (typeof PricingEngine !== 'undefined') {
      const pricing = PricingEngine.calculateProjectTotal();
      const totalDiv = document.getElementById('contract-total');
      totalDiv.textContent = PricingEngine.formatCurrency(pricing.total);
      
      // Update contract summary with pricing breakdown
      const summary = document.getElementById('contract-summary');
      if (summary) {
        // Append pricing info to existing summary
        const pricingInfo = `
          <hr class="my-2">
          <p><strong>Materials Cost:</strong> ${PricingEngine.formatCurrency(pricing.materialsCost)}</p>
          <p><strong>Labor Cost:</strong> ${PricingEngine.formatCurrency(pricing.laborCost)}</p>
          <p><strong>Subtotal:</strong> ${PricingEngine.formatCurrency(pricing.subtotal)}</p>
        `;
        summary.innerHTML += pricingInfo;
      }
    } else {
      if (window.ErrorHandler) {
        window.ErrorHandler.error('PricingEngine not loaded', {
          category: window.ErrorCategory.SYSTEM
        });
      }
      document.getElementById('contract-total').textContent = '$0.00';
    }
  }
  
  // Generate PDF
  window.generatePDFContract = function() {
    // Gather all contract data
    const contractData = {
      ...formState.data,
      contractNumber: document.getElementById('contract-number')?.value || 'CONT-' + Date.now(),
      contractDate: document.getElementById('contract-date')?.value || new Date().toISOString().split('T')[0],
      startDate: document.getElementById('start-date')?.value,
      completionDate: document.getElementById('completion-date')?.value,
      contractorRep: document.getElementById('contractor-rep')?.value,
      paymentSchedule: document.getElementById('payment-schedule')?.value,
      warrantyPeriod: document.getElementById('warranty-period')?.value,
      changeOrderPolicy: document.getElementById('change-order-policy')?.value,
      materialSupply: document.getElementById('material-supply')?.value,
      materialNotes: document.getElementById('material-notes')?.value,
      scopeNotes: document.getElementById('scope-notes')?.value,
      totalAmount: PricingEngine.calculateTotals().total || 0
    };
    
    // Generate PDF
    const doc = PDFExporter.generateContractPDF(contractData);
    
    // Save PDF with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Contract_${contractData.siteAddress?.street?.replace(/\s+/g, '_') || 'Project'}_${timestamp}.pdf`;
    
    PDFExporter.savePDF(doc, filename);
  };
  
  // Save contract draft
  window.saveContract = function() {
    saveStepData();
    formState.saveState();
    alert('Contract draft saved successfully!');
  };
  
  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  function getPaymentTermsText(schedule) {
    const terms = {
      'net30': 'Net 30 Days',
      '50-50': '50% Deposit, 50% on Completion',
      'milestone': 'Milestone Based',
      'custom': 'Custom Schedule'
    };
    return terms[schedule] || schedule;
  }
  
  function formatForDisplay(value) {
    if (!value && value !== 0) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    const parts = num.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedInteger + '.' + decimalPart;
  }
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize formState if needed
    if (typeof formState !== 'undefined' && formState.loadState) {
      formState.loadState();
    }
    
    // Initialize contract data
    initializeContractData();
    
    // Setup event listeners
    document.getElementById('material-supply').addEventListener('change', updateMaterialNotesVisibility);
    document.getElementById('payment-schedule').addEventListener('change', updatePaymentDetails);
    
    // Initialize step indicators
    document.querySelectorAll('.step-item').forEach((item, index) => {
      item.addEventListener('click', function() {
        if (index <= currentStep) {
          saveStepData();
          currentStep = index;
          showStep(currentStep);
          updateStepIndicator();
        }
      });
    });
    
    // Show initial step
    showStep(0);
    updateStepIndicator();
  });
})();