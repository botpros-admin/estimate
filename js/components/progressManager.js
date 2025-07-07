// Progress Bar Manager
// Dynamically updates progress bars based on formState

const ProgressManager = {
  // Step mapping for pages
  pageStepMap: {
    'pages/project-info.html': 1,
    'pages/surfaces.html': 2,
    'pages/contract.html': 3,
    'pages/contract-preview.html': 4
  },

  // Initialize progress bar
  init() {
    // Get current page name from URL
    const currentPage = window.location.pathname.split('/').pop();
    const currentStep = this.pageStepMap[currentPage] || 1;

    // Update formState with current step
    if (typeof formState !== 'undefined') {
      formState.currentStep = currentStep;
      formState.saveState();
    }

    // Update progress display
    this.updateProgress();
  },

  // Update progress bar display
  updateProgress() {
    if (typeof formState === 'undefined') return;

    const step = formState.currentStep;
    const totalSteps = formState.totalSteps;
    const percentage = Math.round((step / totalSteps) * 100);

    // Update text
    const stepElement = document.getElementById('progress-step');
    const percentElement = document.getElementById('progress-percentage');
    const fillElement = document.getElementById('progress-fill');

    if (stepElement) {
      stepElement.textContent = `Step ${step} of ${totalSteps}`;
    }

    if (percentElement) {
      percentElement.textContent = `${percentage}% Complete`;
    }

    if (fillElement) {
      fillElement.style.width = `${percentage}%`;
    }
  },

  // Add new page to the workflow
  addPage(filename, stepNumber) {
    this.pageStepMap[filename] = stepNumber;
    
    // Update total steps if needed
    const maxStep = Math.max(...Object.values(this.pageStepMap));
    if (typeof formState !== 'undefined' && formState.totalSteps < maxStep) {
      formState.totalSteps = maxStep;
      formState.saveState();
    }
  },

  // Get step descriptions for navigation
  getStepDescriptions() {
    return {
      1: 'Project Details',
      2: 'Surfaces',
      3: 'Estimate',
      4: 'Contract'
    };
  },

  // Navigate to specific step
  navigateToStep(stepNumber) {
    const pageMap = Object.entries(this.pageStepMap).reduce((acc, [page, step]) => {
      acc[step] = page;
      return acc;
    }, {});

    const targetPage = pageMap[stepNumber];
    if (targetPage) {
      window.location.href = targetPage;
    }
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  ProgressManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressManager;
}