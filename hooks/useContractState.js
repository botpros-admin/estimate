// hooks/useContractState.js
// Central state management for contract builder data with localStorage persistence

/**
 * Contract state hook for managing all contract builder data
 * Extends existing formState pattern with contract-specific fields
 * Provides auto-save to localStorage and state validation
 */

// Initialize contract state structure
const defaultContractState = {
  // Document info
  documentType: 'proposal',
  estimateNumber: '',
  validUntil: '',
  
  // Client info
  clientName: '',
  companyName: '',
  billingSameAsSite: true,
  billingAddress: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  
  // Scope details
  surfaces: [],
  preparationSteps: [
    'pressure-wash',
    'scrape-sand', 
    'fill-patch',
    'caulk',
    'prime'
  ],
  applicationMethod: 'brush-roller',
  applicationNotes: '',
  
  // Materials
  materials: [{
    type: 'primer',
    name: 'Sherwin-Williams ProBlock',
    finish: ''
  }],
  colorStatus: 'tbd',
  colorNotes: '',
  colorDeadline: 'One week prior to start date',
  caulkingType: 'Sherwin-Williams SherMax Elastomeric',
  patchingType: 'Crawford\'s Vinyl Spackling',
  
  // Terms & Payment
  startDate: 'Within 2-3 weeks of deposit',
  duration: '5-7 working days',
  workHours: 'Monday-Friday, 8:00 AM - 5:00 PM',
  weatherPolicy: 'standard',
  paymentSchedule: '50-50',
  customPaymentTerms: [],
  acceptedPaymentMethods: ['check', 'cash', 'credit', 'ach'],
  latePaymentTerms: '1.5% per month after 10 days',
  warrantyPeriod: '1',
  includeWarrantyExclusions: true,
  
  // Inclusions/Exclusions
  customInclusions: [],
  customExclusions: [],
  clientResponsibilities: [
    'access',
    'remove-items',
    'utilities',
    'pets-children',
    'sprinklers'
  ],
  
  // Pricing
  pricing: {
    basePrice: 0,
    optionsTotal: 0,
    discount: 0,
    discountReason: '',
    total: 0
  },
  optionalServices: [],
  
  // Metadata
  lastModified: null,
  currentStep: 1,
  completedSteps: []
};

function useContractState() {
  const STORAGE_KEY = 'paintEstimatorContractState';
  
  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return { ...defaultContractState, ...parsed };
      }
    } catch (error) {
      console.error('Error loading contract state:', error);
    }
    return defaultContractState;
  };
  
  // Save state to localStorage
  const saveState = (state) => {
    try {
      const toSave = {
        ...state,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return true;
    } catch (error) {
      console.error('Error saving contract state:', error);
      return false;
    }
  };
  
  // Initialize state
  let state = loadState();
  const listeners = new Set();
  
  // Subscribe to state changes
  const subscribe = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };
  
  // Notify all listeners of state change
  const notify = () => {
    listeners.forEach(callback => callback(state));
  };
  
  // Update state and persist
  const setState = (updates) => {
    if (typeof updates === 'function') {
      state = { ...state, ...updates(state) };
    } else {
      state = { ...state, ...updates };
    }
    saveState(state);
    notify();
  };
  
  // Get current state
  const getState = () => state;
  
  // Mark step as completed
  const completeStep = (stepNumber) => {
    setState(prev => ({
      completedSteps: [...new Set([...prev.completedSteps, stepNumber])],
      currentStep: Math.max(prev.currentStep, stepNumber + 1)
    }));
  };
  
  // Calculate pricing
  const calculatePricing = () => {
    const basePrice = state.pricing.basePrice || 0;
    const optionsTotal = state.optionalServices
      .filter(service => service.selected)
      .reduce((sum, service) => sum + (service.price || 0), 0);
    
    let total = basePrice + optionsTotal;
    
    // Apply discount
    if (state.pricing.discount) {
      const discountStr = String(state.pricing.discount);
      if (discountStr.includes('%')) {
        const percentage = parseFloat(discountStr) / 100;
        total = total * (1 - percentage);
      } else {
        total = total - parseFloat(discountStr || 0);
      }
    }
    
    setState({
      pricing: {
        ...state.pricing,
        optionsTotal,
        total
      }
    });
  };
  
  // Integrate with existing formState
  const syncWithFormState = () => {
    if (typeof formState !== 'undefined' && formState.data) {
      // Pull data from paint estimator
      const contact = formState.data.contacts?.[0] || {};
      const siteAddress = formState.data.siteAddress || {};
      
      setState({
        clientName: contact.name || '',
        companyName: formState.data.companyName || '',
        surfaces: formState.data.surfaces || [],
        pricing: {
          ...state.pricing,
          basePrice: parseFloat(formState.data.subtotal || 0)
        }
      });
      
      // Generate estimate number if not set
      if (!state.estimateNumber) {
        const today = new Date();
        const estimateNumber = `EST-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        setState({ estimateNumber });
      }
      
      // Set valid until date if not set
      if (!state.validUntil) {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        setState({ validUntil: validUntil.toISOString().split('T')[0] });
      }
    }
  };
  
  // Reset state to defaults
  const resetState = () => {
    state = defaultContractState;
    saveState(state);
    notify();
  };
  
  // Export contract data for generation
  const exportForContract = () => {
    // Ensure data is synced
    syncWithFormState();
    
    // Return formatted data for contract generator
    return {
      ...state,
      formStateData: typeof formState !== 'undefined' ? formState.data : null
    };
  };
  
  return {
    state: getState(),
    setState,
    subscribe,
    completeStep,
    calculatePricing,
    syncWithFormState,
    resetState,
    exportForContract
  };
}

// Make hook available globally
if (typeof window !== 'undefined') {
  window.useContractState = useContractState;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = useContractState;
}