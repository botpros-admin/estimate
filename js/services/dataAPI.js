// Data Persistence API Service
// Client-side implementation using localStorage with backend-ready structure
(function() {
  'use strict';
  
  // Generate UUID for unique IDs
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // API Configuration
  const API_CONFIG = {
    baseURL: '/api', // Can be replaced with actual backend URL
    version: '1.0',
    storage: {
      estimates: 'paintEstimator_estimates',
      contracts: 'paintEstimator_contracts',
      settings: 'paintEstimator_settings'
    }
  };
  
  // Data Persistence API
  const DataAPI = {
    // Initialize API (check localStorage availability)
    init: function() {
      if (typeof Storage === 'undefined') {
        if (window.ErrorHandler) {
          window.ErrorHandler.error('LocalStorage not supported. Data persistence unavailable.', {
            category: window.ErrorCategory.STORAGE
          });
        }
        return false;
      }
      
      // Initialize storage if empty
      if (!localStorage.getItem(API_CONFIG.storage.estimates)) {
        localStorage.setItem(API_CONFIG.storage.estimates, JSON.stringify([]));
      }
      if (!localStorage.getItem(API_CONFIG.storage.contracts)) {
        localStorage.setItem(API_CONFIG.storage.contracts, JSON.stringify([]));
      }
      
      return true;
    },
    
    // Estimate Operations
    estimates: {
      // Create new estimate
      create: function(estimateData) {
        return new Promise((resolve, reject) => {