/**
 * Universal Modern Header Component
 * Creates a clean, minimal header that's consistent across all pages
 */

// Logo configuration
const LOGO_URL = 'https://hartzell.app/docs/pub/70653d03c0d8d33f93fa834846d53f0c/showFile/?&token=xffln5loaw1q';

// Add persistent header styles only once
if (typeof document !== 'undefined' && !window.__headerStylesApplied) {
  const style = document.createElement('style');
  style.id = 'header-persistent-styles';
  style.textContent = `
    /* Persistent header styles */
    #app-header, .app-header {
      height: 60px !important;
      min-height: 60px !important;
      max-height: 60px !important;
      background: #ffffff !important;
      border-bottom: 1px solid #e5e5e5 !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 50 !important;
      overflow: visible !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    #header-content, .header-content {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      height: 60px !important;
      max-width: 1200px !important;
      margin: 0 auto !important;
      padding: 0 20px !important;
      overflow: visible !important;
    }
    
    /* Logo container with fixed dimensions */
    .header-logo {
      position: relative !important;
      width: 100px !important;
      height: 60px !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transform: translateZ(0) !important;
      -webkit-transform: translateZ(0) !important;
      overflow: hidden !important;
    }
    
    /* Logo container with background image */
    .header-logo-container {
      width: 80px !important;
      height: 40px !important;
      min-width: 80px !important;
      min-height: 40px !important;
      max-width: 80px !important;  
      max-height: 40px !important;
      position: relative !important;
      margin: 0 !important;
      transform: none !important;
      -webkit-transform: none !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center center !important;
      background-image: url('${LOGO_URL}') !important;
      background-color: transparent !important;
      border: none !important;
      border-radius: 4px !important;
      overflow: hidden !important;
      image-rendering: -webkit-optimize-contrast !important;
      image-rendering: crisp-edges !important;
      will-change: auto !important;
      contain: layout style paint !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      perspective: 1000px !important;
      -webkit-perspective: 1000px !important;
      flex-shrink: 0 !important;
      flex-grow: 0 !important;
      z-index: 1001 !important;
      display: block !important;
      align-self: center !important;
    }
    
    /* Remove old logo image styles */
    .header-logo-img {
      display: none !important;
    }
    
    /* Prevent any animations or transitions on header elements */
    .header-logo,
    .header-logo-container,
    .header-logo * {
      animation: none !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition: none !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      transform-origin: center !important;
    }
    
    /* Title styles */
    .header-title {
      flex-grow: 1 !important;
      text-align: center !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 60px !important;
    }
    
    .header-project-name {
      font-family: system-ui, -apple-system, Arial, sans-serif !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #333333 !important;
      line-height: 1.2 !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 100% !important;
      transition: all 0.3s ease !important;
    }
    
    .header-project-name.multi-word {
      flex-direction: column !important;
    }
    
    .header-project-name span {
      display: block !important;
      font-size: 16px !important;
      line-height: 1.1 !important;
    }
    
    /* Navigation styles */
    .header-nav {
      width: 100px !important;
      display: flex !important;
      justify-content: flex-end !important;
    }
    
    .header-home-link {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 40px !important;
      height: 40px !important;
      background-color: #f3f4f6 !important;
      color: #6b7280 !important;
      border-radius: 8px !important;
      text-decoration: none !important;
      transition: all 0.2s ease !important;
    }
    
    .header-home-link:hover {
      background-color: #e5e7eb !important;
      color: #4b5563 !important;
    }
    
    .header-home-link svg {
      width: 18px !important;
      height: 18px !important;
      display: block !important;
    }
    
    /* Mobile adjustments */
    @media (max-width: 640px) {
      .header-logo-container {
        width: 70px !important;
        height: 35px !important;
        min-width: 70px !important;
        min-height: 35px !important;
        max-width: 70px !important;
        max-height: 35px !important;
      }
      
      .header-logo {
        width: 80px !important;
      }
      
      .header-nav {
        width: 80px !important;
      }
      
      .header-project-name.multi-word span {
        font-size: 14px !important;
      }
    }
  `;
  document.head.appendChild(style);
  window.__headerStylesApplied = true;
}

// Preload the logo to ensure browser caches it
if (typeof document !== 'undefined') {
  // Check if preload link already exists
  const existingPreload = document.querySelector(`link[href="${LOGO_URL}"]`);
  if (!existingPreload) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = LOGO_URL;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }
}

function renderHeader(pageTitle = null) {
  // Prevent duplicate headers
  const existingHeader = document.querySelector('#header-content');
  if (existingHeader) {
    // If header exists but we have a new title, just update the title
    if (pageTitle) {
      const titleElement = existingHeader.querySelector('.header-project-name');
      if (titleElement) {
        // List of titles that should stay on one line
        const singleLineTitles = ['Measurements & Selection', 'Measurements and Selection', 'Paint Selection'];
        
        if (singleLineTitles.includes(pageTitle)) {
          // Keep on single line
          titleElement.textContent = pageTitle;
          titleElement.className = 'header-project-name';
        } else {
          // Original multi-word logic
          const words = pageTitle.split(' ').filter(word => word.trim() !== '');
          if (words.length > 1) {
            const displayWords = words.length > 2 ? words.slice(0, 2) : words;
            const processedTitle = displayWords.map(word => `<span style="display: block;">${word}</span>`).join('');
            titleElement.innerHTML = processedTitle;
            titleElement.className = 'header-project-name multi-word';
            // Add ellipsis if we truncated
            if (words.length > 2) {
              titleElement.innerHTML += '<span style="display: block; font-size: 12px;">...</span>';
            }
          } else {
            titleElement.textContent = pageTitle;
            titleElement.className = 'header-project-name';
          }
        }
      }
    }
    return;
  }
  
  // Find the header element - prefer the one with ID
  let header = document.getElementById('app-header');
  if (!header) {
    header = document.querySelector('header.app-header');
  }
  if (!header) return;
  
  // Detect if we're on the surfaces page which has Tailwind CSS conflicts
  const isSurfacesPage = window.location.pathname.includes('surfaces.html');
  
  // Get page title from various sources
  let displayTitle = 'New Project';
  
  // First priority: explicitly passed pageTitle
  if (pageTitle) {
    displayTitle = pageTitle;
  } 
  // Second priority: check for form-title element on the page
  else {
    const formTitle = document.querySelector('.form-title');
    if (formTitle && formTitle.textContent) {
      displayTitle = formTitle.textContent.trim();
    }
    // Third priority: derive from filename
    else {
      const path = window.location.pathname;
      if (path.includes('project-info')) {
        displayTitle = 'Project Details';
      } else if (path.includes('surfaces')) {
        displayTitle = 'Surfaces';
      } else if (path.includes('paint-selection')) {
        displayTitle = 'Paint Selection';
      } else if (path.includes('surfaces')) {
        displayTitle = 'Measurements & Selection';
      } else if (path.includes('estimate')) {
        displayTitle = 'Estimate';
      } else if (path.includes('review')) {
        displayTitle = 'Review';
      } else if (path.includes('contract-preview')) {
        displayTitle = 'Contract Preview';
      } else {
        displayTitle = 'Paint Pro Estimator';
      }
    }
  }
  
  // Determine if we're on the index page or a subpage
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname.endsWith('\\');
  const homeUrl = isIndexPage ? 'index.html' : '../index.html';

  // Process the title - keep certain titles on one line
  let processedTitle = displayTitle;
  let titleClass = 'header-project-name';
  
  // List of titles that should stay on one line
  const singleLineTitles = ['Measurements & Selection', 'Measurements and Selection', 'Paint Selection'];
  
  // Check if this title should be kept on one line
  if (singleLineTitles.includes(displayTitle)) {
    // Keep on single line
    processedTitle = displayTitle;
  } else {
    // Original multi-word stacking logic for other titles
    const words = displayTitle.split(' ').filter(word => word.trim() !== '');
    
    if (words.length > 1) {
      titleClass += ' multi-word';
      // For very long titles, limit to first 2 words on separate lines
      const displayWords = words.length > 2 ? words.slice(0, 2) : words;
      processedTitle = displayWords.map(word => `<span style="display: block;">${word}</span>`).join('');
      
      // Add ellipsis if we truncated
      if (words.length > 2) {
        processedTitle += '<span style="display: block; font-size: 12px;">...</span>';
      }
    }
  }

  // Clear and set header HTML with exact styling
  header.innerHTML = `
    <div id="header-content" class="header-content">
      <div class="header-logo">
        <div class="header-logo-container"></div>
      </div>
      <div class="header-title">
        <h1 class="${titleClass}" title="${displayTitle}">${processedTitle}</h1>
      </div>
      <div class="header-nav">
        <a href="${homeUrl}" class="header-home-link" title="Home">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
        </a>
      </div>
    </div>
  `;
}

/**
 * Apply exact styles to header elements to ensure consistency across pages
 * DEPRECATED - Now handled by persistent CSS styles
 */
function applyExactHeaderStyles() {
  // All styles are now handled by persistent CSS
  // This function is kept for backward compatibility but does nothing
  return;
}

// Export for ES modules compatibility
if (typeof exports !== 'undefined') {
  exports.renderHeader = renderHeader;
}

// Make sure to render header on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Remove any duplicate headers that might exist
  const headers = document.querySelectorAll('header.app-header');
  if (headers.length > 1) {
    // Keep only the first header
    for (let i = 1; i < headers.length; i++) {
      headers[i].remove();
    }
  }
  
  // Render the header only if it doesn't exist
  if (!document.querySelector('#header-content')) {
    renderHeader();
  }
});