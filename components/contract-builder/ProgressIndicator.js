// components/contract-builder/ProgressIndicator.js
// Mobile-optimized progress indicator with dots and step counter

/**
 * ProgressIndicator Component
 * Shows progress through contract builder steps
 * Mobile-first design with minimal footprint
 * Supports dots, counter, and progress bar variants
 */

function ProgressIndicator({ 
  currentStep = 1, 
  totalSteps = 6, 
  variant = 'dots', // 'dots' | 'counter' | 'bar'
  labels = [] // Optional step labels
}) {
  // Generate progress percentage
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  // Create container element
  const container = document.createElement('div');
  container.className = 'progress-indicator';
  container.setAttribute('role', 'progressbar');
  container.setAttribute('aria-valuenow', currentStep);
  container.setAttribute('aria-valuemin', '1');
  container.setAttribute('aria-valuemax', totalSteps);
  container.setAttribute('aria-label', `Step ${currentStep} of ${totalSteps}`);
  
  // Render based on variant
  switch (variant) {
    case 'dots':
      renderDots(container, currentStep, totalSteps);
      break;
      
    case 'counter':
      renderCounter(container, currentStep, totalSteps, percentage);
      break;
      
    case 'bar':
      renderBar(container, currentStep, totalSteps, percentage);
      break;
      
    default:
      renderDots(container, currentStep, totalSteps);
  }
  
  // Add CSS classes for styling
  container.classList.add(`progress-indicator--${variant}`);
  
  return container;
}

// Render dots variant
function renderDots(container, currentStep, totalSteps) {
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'progress-dots';
  
  for (let i = 1; i <= totalSteps; i++) {
    const dot = document.createElement('span');
    dot.className = 'progress-dot';
    dot.setAttribute('aria-label', `Step ${i}`);
    
    if (i < currentStep) {
      dot.classList.add('progress-dot--completed');
    } else if (i === currentStep) {
      dot.classList.add('progress-dot--current');
    } else {
      dot.classList.add('progress-dot--upcoming');
    }
    
    // Add click handler for navigation (if allowed)
    dot.addEventListener('click', () => {
      if (i < currentStep) {
        // Allow going back to completed steps
        const event = new CustomEvent('progressNavigate', { 
          detail: { targetStep: i } 
        });
        container.dispatchEvent(event);
      }
    });
    
    dotsContainer.appendChild(dot);
  }
  
  container.appendChild(dotsContainer);
}

// Render counter variant
function renderCounter(container, currentStep, totalSteps, percentage) {
  const counterContainer = document.createElement('div');
  counterContainer.className = 'progress-counter';
  
  const stepText = document.createElement('span');
  stepText.className = 'progress-counter__step';
  stepText.textContent = `Step ${currentStep} of ${totalSteps}`;
  
  const percentageText = document.createElement('span');
  percentageText.className = 'progress-counter__percentage';
  percentageText.textContent = `${percentage}%`;
  
  counterContainer.appendChild(stepText);
  counterContainer.appendChild(percentageText);
  container.appendChild(counterContainer);
}

// Render bar variant
function renderBar(container, currentStep, totalSteps, percentage) {
  const barContainer = document.createElement('div');
  barContainer.className = 'progress-bar-container';
  
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  
  const fill = document.createElement('div');
  fill.className = 'progress-bar__fill';
  fill.style.width = `${percentage}%`;
  
  const label = document.createElement('span');
  label.className = 'progress-bar__label';
  label.textContent = `${currentStep}/${totalSteps}`;
  
  bar.appendChild(fill);
  barContainer.appendChild(bar);
  barContainer.appendChild(label);
  container.appendChild(barContainer);
}

// Factory function to create and mount component
ProgressIndicator.create = function(targetElement, props = {}) {
  const component = ProgressIndicator(props);
  
  if (typeof targetElement === 'string') {
    targetElement = document.querySelector(targetElement);
  }
  
  if (targetElement) {
    targetElement.appendChild(component);
  }
  
  return component;
};

// Update existing progress indicator
ProgressIndicator.update = function(element, newStep) {
  const container = element.closest('.progress-indicator');
  if (!container) return;
  
  const totalSteps = parseInt(container.getAttribute('aria-valuemax'));
  const variant = container.className.match(/progress-indicator--(\w+)/)?.[1] || 'dots';
  
  // Clear and re-render
  container.innerHTML = '';
  container.setAttribute('aria-valuenow', newStep);
  container.setAttribute('aria-label', `Step ${newStep} of ${totalSteps}`);
  
  const percentage = Math.round((newStep / totalSteps) * 100);
  
  switch (variant) {
    case 'dots':
      renderDots(container, newStep, totalSteps);
      break;
    case 'counter':
      renderCounter(container, newStep, totalSteps, percentage);
      break;
    case 'bar':
      renderBar(container, newStep, totalSteps, percentage);
      break;
  }
};

// Add default styles
const styles = `
.progress-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  user-select: none;
}

/* Dots variant */
.progress-dots {
  display: flex;
  gap: 0.75rem;
}

.progress-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.progress-dot--completed {
  background-color: var(--color-primary, #3b82f6);
  transform: scale(1);
}

.progress-dot--current {
  background-color: var(--color-primary, #3b82f6);
  transform: scale(1.5);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.progress-dot--upcoming {
  background-color: var(--color-gray-300, #d1d5db);
  transform: scale(0.8);
}

/* Counter variant */
.progress-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.progress-counter__step {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700, #374151);
}

.progress-counter__percentage {
  font-size: 0.75rem;
  color: var(--color-gray-500, #6b7280);
}

/* Bar variant */
.progress-bar-container {
  width: 100%;
  max-width: 20rem;
}

.progress-bar {
  height: 0.5rem;
  background-color: var(--color-gray-200, #e5e7eb);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background-color: var(--color-primary, #3b82f6);
  transition: width 0.3s ease;
}

.progress-bar__label {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-gray-600, #4b5563);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .progress-indicator {
    padding: 0.75rem;
  }
  
  .progress-dots {
    gap: 0.5rem;
  }
  
  .progress-dot {
    width: 0.625rem;
    height: 0.625rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .progress-dot--upcoming {
    background-color: var(--color-gray-600, #4b5563);
  }
  
  .progress-counter__step {
    color: var(--color-gray-200, #e5e7eb);
  }
  
  .progress-counter__percentage {
    color: var(--color-gray-400, #9ca3af);
  }
  
  .progress-bar {
    background-color: var(--color-gray-700, #374151);
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('progress-indicator-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'progress-indicator-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Export for use
if (typeof window !== 'undefined') {
  window.ProgressIndicator = ProgressIndicator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressIndicator;
}