// Form State Management for Multi-page Setup

// Error handler is optional - skip if not available
const PaintEstimatorError = window.PaintEstimatorError || Error;

// Initialize the form state from localStorage or with default values
const formState = {
  // Storage key
  storageKey: 'paintEstimatorState',
  
  // Initialize flag
  initialized: false,
  
  // Load data from localStorage or use defaults
  loadState() {
    try {
      // Try to use localStorageUtil if available, otherwise fallback to direct localStorage
      const storage = typeof localStorageUtil !== 'undefined' ? localStorageUtil : {
        getItem: (key, def) => {
          try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : def;
          } catch (e) {
            if (window.ErrorHandler) {
              window.ErrorHandler.warn('Error reading from localStorage', {
                category: window.ErrorCategory.STORAGE,
                context: { key, error: e.message }
              });
            }
            return def;
          }
        }
      };

      const savedState = storage.getItem(this.storageKey, null);
    
    if (savedState && savedState.data) {
      this.data = savedState.data || this.getDefaultData();
      this.currentStep = savedState.currentStep || 1;
      this.totalSteps = this.getTotalSteps(); // Always calculate based on service type
      
      // Ensure backward compatibility and proper initialization
      if (!this.data.serviceTypes && this.data.serviceType) {
        this.data.serviceTypes = [this.data.serviceType];
      } else if (!this.data.serviceTypes) {
        this.data.serviceTypes = ['surface_coating']; // Default to surface coating
      }
      
      if (!this.data.abrasiveMethods && this.data.abrasiveMethod) {
        this.data.abrasiveMethods = [this.data.abrasiveMethod];
      } else if (!this.data.abrasiveMethods) {
        this.data.abrasiveMethods = [];
      }
      
      // Ensure serviceType exists for backward compatibility
      if (!this.data.serviceType && this.data.serviceTypes.length > 0) {
        this.data.serviceType = this.data.serviceTypes[0];
      }
    } else {
      this.data = this.getDefaultData();
      this.currentStep = 1;
      this.totalSteps = this.getTotalSteps(); // Calculate initial total steps
    }
    
    return this;
    } catch (error) {
      // Use error handler if available
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          category: window.ErrorCategory.STORAGE,
          level: window.LogLevel.WARN,
          context: { storageKey: this.storageKey },
          silent: true
        });
      }
      this.data = this.getDefaultData();
      this.currentStep = 1;
      this.totalSteps = this.getTotalSteps();
      return this;
    }
  },
  
  // Initialize on script load
  init() {
    if (!this.initialized) {
      this.loadState();
      this.initialized = true;
      // console.log('formState initialized:', this.currentStep, this.data.serviceType); // Suppress
    }
    return this;
  },
  
  // Save current state to localStorage
  saveState() {
    // Try to use localStorageUtil if available, otherwise fallback to direct localStorage
    const storage = typeof localStorageUtil !== 'undefined' ? localStorageUtil : {
      setItem: (key, value) => {
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
          return true;
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            if (window.ErrorHandler) {
              window.ErrorHandler.warn('localStorage quota exceeded', {
                category: window.ErrorCategory.STORAGE
              });
            }
          } else if (window.ErrorHandler) {
            window.ErrorHandler.handleError(error, {
              category: window.ErrorCategory.STORAGE,
              level: window.LogLevel.WARN,
              silent: true
            });
          }
          return false;
        }
      }
    };

    const stateToSave = {
      data: this.data,
      currentStep: this.currentStep,
      totalSteps: this.getTotalSteps() // Use dynamic total steps
    };

    const success = storage.setItem(this.storageKey, stateToSave);
    if (!success && window.ErrorHandler) {
      window.ErrorHandler.info('State save unsuccessful', {
        category: window.ErrorCategory.STORAGE
      });
    }
    
    return this;
  },
  
  // Default data structure
  getDefaultData() {
    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + 30);

    return {
      // Existing fields
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      projectName: '',
      projectType: '', // Options: residential, commercial, community, public-sector
      selectedSurfaces: [],
      contacts: [{ name: '', email: '', phone: '', role: 'Primary' }],
      companyData: { name: '', phone: '', email: '' }, // Company information
      siteAddress: { street: '', city: '', state: '', zip: '', isPrimaryBilling: true },
      billingAddress: { street: '', city: '', state: '', zip: '' },
      surfaceDetails: {}, // E.g. { 'Living Room Walls': { area: 200, coats: 2, pricePerSqFt: 1.5, itemPrice: 300 }}
      additionalServices: [], // E.g. [{ name: 'Drywall Repair', price: 150, type: 'fixed' }]
      customItems: [], // E.g. [{ description: 'Custom Bookshelf Painting', price: 250 }]
      discount: { type: 'percentage', value: 0, amount: 0 },
      taxRate: 0, // Example: 0.07 for 7%
      notes: '',
      currentStep: 1,
      totalSteps: 4, // 4 steps: Project Details, Surfaces, Estimate, Contract
      estimateId: `est_${new Date().getTime()}`,
      estimateDate: new Date().toISOString().split('T')[0],
      totalArea: 0,
      totalPaintGallons: 0,
      totalPrimerGallons: 0,
      totalLaborHours: 0,
      totalMaterialCost: 0,
      totalLaborCost: 0,
      subtotal: 0,
      grandTotal: 0,
      // New Omega Contract Fields
      projectSummary: '',
      docId: `prop_${new Date().getTime()}`,
      proposalValidUntil: validUntilDate.toISOString().split('T')[0],
      contractorInfo: {
        name: 'Hartzell Painting',
        address: '3195 N Powerline Rd Suite 101, Pompano Beach, FL 33069',
        phone: '(954) 755-3171',
        email: 'contact@hartzellpainting.com',
        rep: 'Tony Diblasi/Edward Holman',
        license: 'FP-12345'
      },
      customInclusions: [], // Array of strings
      customExclusions: [], // Array of strings
      materialsUsed: [{ name: 'Paint', brand: 'Sherwin-Williams', type: 'Duration Exterior Acrylic Latex', details: 'Sherwin-Williams Duration Exterior Acrylic Latex - Client Selected Color' }], // Default example
      estimatedStartDate: '',
      estimatedDuration: '',
      acceptedOptions: [], // Array of objects e.g. [{description: 'Upgrade to Emerald Paint', price: '500.00'}]
      paymentTermsSummary: '50% deposit due upon contract execution to schedule work. Balance due upon Final Completion.',
      workmanshipWarrantyDuration: 'one (1) year',
      acceptedUpsells: [],
      // Fields for calculations that might feed into contract
      calculatedBasePrice: '0.00',
      calculatedOptionsPrice: '',
      calculatedGrandTotal: '0.00',
      // Fields for specific sections if not covered above
      scopeSteps: {
        prep: 'Standard surface preparation including cleaning, scraping, and priming as necessary.',
        app: 'Application of specified coatings according to manufacturer specifications.',
        comp: 'Cleanup of work area and removal of project-related debris.'
      },
      colorSelectionInfo: 'Colors to be selected by Client from Sherwin-Williams palette prior to commencement.',
      permitResponsibility: 'Client is responsible for obtaining any necessary permits unless otherwise specified in writing.',
      latePaymentGrace: 'ten (10)',
      contractorInfoRepTitle: 'Senior Project Manager', // Added for signature block
      paintSelections: [], // Array of paint selections for different surfaces
      // Service type fields
      serviceType: 'surface_coating', // Default to surface coating for backward compatibility
      serviceTypes: ['surface_coating'], // Default to surface coating selected
      abrasiveMethod: '',
      abrasiveMethods: [],
      surfaceCoatingMethods: [], // Surface coating methods
      concreteCoatingTypes: [], // Concrete coating types
      woodCoatingTypes: [], // Wood coating types
      // Project scope
      projectScope: {
        interior: false,
        exterior: false
      }
    };
  },
  
  // Current navigation state
  currentStep: 1,
  totalSteps: 3, // Default to 3 steps: Project Details, Measurements/Paint Selection, Contract
  
  // Get dynamic total steps based on service type
  getTotalSteps() {
    // Since estimate.html redirects to contract-generator.html, 
    // all service types have 3 steps: Project Details, Measurements/Paint Selection, Contract
    return 3;
  },
  
  // Update total steps based on current service type
  updateTotalSteps() {
    this.totalSteps = this.getTotalSteps();
  },
  
  // Progress tracking
  getProgressPercentage() {
    return Math.round((this.currentStep / this.getTotalSteps()) * 100);
  },
  
  // Get all form values in a flat structure for easier access
  getValues() {
    const values = { ...this.data }; // Simpler way to get all data

    // Flatten the nested structure for easy access if needed by other parts,
    // but direct access to this.data.siteAddress etc. is also fine.
    if (this.data.siteAddress) {
      values.siteAddress1 = this.data.siteAddress.street || '';
      values.siteAddressCity = this.data.siteAddress.city || '';
      values.siteAddressState = this.data.siteAddress.state || '';
      values.siteAddressZip = this.data.siteAddress.zip || '';
    }
    // Include contacts and company data if needed in a flat structure
    // For now, components access them via formState.data.contacts, etc.
    return values;
  },
  
  // Contact Management
  addContact() {
    this.data.contacts.push({ name: '', phone: '', email: '' });
    this.saveState();
    // The component calling this should re-render
  },

  removeContact(index) {
    if (this.data.contacts.length > 1) { // Prevent removing the last contact
      this.data.contacts.splice(index, 1);
      this.saveState();
      // The component calling this should re-render
    } else {
      // Optionally, clear the fields of the last contact instead of removing it
      this.data.contacts[0] = { name: '', phone: '', email: '' };
      this.saveState();
    }
  },

  updateContact(index, field, value) {
    if (this.data.contacts[index]) {
      this.data.contacts[index][field] = value;
      this.saveState();
    }
  },

  // Validation utilities
  validateEmail(email) {
    if (!email) return false; // Basic check
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  validatePhoneNumber(phone) {
    if (!phone) return false; // Basic check
    // Assumes phone is stored in XXX-XXX-XXXX format as per contacts.js formatting
    const simplePhoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return simplePhoneRegex.test(String(phone));
  },

  // Validate the current step based on step number
  validateCurrentStep() {
    // For now, always return true to allow navigation
    // You can add specific validation logic based on step
    if (this.currentStep === 1) {
      // Step 1 validation logic
      return true;
    } else if (this.currentStep === 2) { 
      // Project details validation
      return true;
    } else if (this.currentStep === 3) {
      // Surfaces validation
      return true;
    }
    return true;
  }
};

// Initialize the form state immediately when this script loads
formState.init();

// Make formState globally accessible
window.formState = formState;

// Also ensure it's loaded on DOMContentLoaded as a backup
document.addEventListener('DOMContentLoaded', function() {
  formState.init();
});
