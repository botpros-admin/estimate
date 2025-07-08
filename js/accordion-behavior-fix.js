// Accordion Behavior Fix - Ensures consistent accordion behavior across all cards
(function() {
    'use strict';
    
    // Debug flag
    const DEBUG = true;
    
    function log(...args) {
        if (DEBUG) console.log('[AccordionFix]', ...args);
    }
    
    // Function to ensure accordion behavior works correctly
    function fixAccordionBehavior() {
        log('Fixing accordion behavior...');
        
        // Find all collapsible headers
        const headers = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg');
        log(`Found ${headers.length} accordion headers`);
        
        headers.forEach((header, index) => {
            // Skip if already fixed
            if (header.dataset.accordionFixed === 'true') {
                return;
            }
            
            // Get the associated content
            const content = header.nextElementSibling;
            if (!content || !content.classList.contains('service-content')) {
                log(`Warning: No service content found for header ${index}`);
                return;
            }
            
            // Get the chevron icon
            const chevron = header.querySelector('.chevron-icon');
            
            // Remove any existing click handlers by cloning
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Re-get the content reference
            const newContent = newHeader.nextElementSibling;
            const newChevron = newHeader.querySelector('.chevron-icon');
            
            // Mark as fixed
            newHeader.dataset.accordionFixed = 'true';
            
            // Ensure header is clickable
            newHeader.style.cursor = 'pointer';
            newHeader.setAttribute('role', 'button');
            newHeader.setAttribute('tabindex', '0');
            
            // Set initial ARIA state
            const isExpanded = newContent && newContent.style.display !== 'none';
            newHeader.setAttribute('aria-expanded', isExpanded.toString());
            
            // Add click handler
            newHeader.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                log(`Header clicked: ${newHeader.querySelector('h3')?.textContent?.trim()}`);
                
                // Check for long press on abrasive methods
                const methodCard = newHeader.closest('[data-service-id]');
                if (methodCard && methodCard.dataset.serviceId?.includes('abrasive')) {
                    // Check if this is a long press in progress
                    if (newHeader.classList.contains('long-press-active')) {
                        log('Ignoring click during long press');
                        return;
                    }
                }
                
                // Call the global accordion toggle function if it exists
                if (typeof handleAccordionToggle === 'function') {
                    log('Using global handleAccordionToggle');
                    handleAccordionToggle(newHeader, newContent, newChevron);
                } else {
                    log('Using local accordion logic');
                    // Fallback accordion logic
                    toggleAccordion(newHeader, newContent, newChevron);
                }
                
                // Update ARIA state
                const nowExpanded = newContent.style.display !== 'none';
                newHeader.setAttribute('aria-expanded', nowExpanded.toString());
            });
            
            // Add keyboard support
            newHeader.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    newHeader.click();
                }
            });
            
            // Ensure chevron rotation matches content state
            if (newChevron) {
                if (newContent.style.display === 'none') {
                    newChevron.style.transform = 'rotate(-90deg)';
                } else {
                    newChevron.style.transform = '';
                }
            }
        });
    }
    
    // Fallback accordion toggle function
    function toggleAccordion(clickedHeader, clickedContent, clickedChevron) {
        const isCurrentlyCollapsed = clickedContent.style.display === 'none';
        
        // Find all collapsible sections
        const allContents = document.querySelectorAll('.service-content');
        const allHeaders = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg');
        
        // Collapse all sections
        allContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Reset all chevrons
        allHeaders.forEach(header => {
            const chevron = header.querySelector('.chevron-icon');
            if (chevron) {
                chevron.style.transform = 'rotate(-90deg)';
            }
        });
        
        // If the clicked section was collapsed, expand it
        if (isCurrentlyCollapsed) {
            clickedContent.style.display = 'block';
            if (clickedChevron) {
                clickedChevron.style.transform = '';
            }
            
            // Auto-scroll to the expanded card
            setTimeout(() => {
                const cardContainer = clickedHeader.closest('.paint-card') || clickedHeader.parentElement;
                
                if (cardContainer) {
                    const headerHeight = document.querySelector('.app-header')?.offsetHeight || 0;
                    const progressHeight = document.querySelector('.progress-container')?.offsetHeight || 0;
                    const offset = headerHeight + progressHeight + 20;
                    
                    const cardTop = cardContainer.getBoundingClientRect().top + window.pageYOffset;
                    const scrollToPosition = cardTop - offset;
                    
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        log('Initializing accordion fix...');
        
        // Initial fix
        setTimeout(fixAccordionBehavior, 500);
        
        // Watch for dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList?.contains('paint-card') ||
                                node.querySelector?.('.paint-card') ||
                                node.classList?.contains('mb-4') ||
                                node.querySelector?.('.mb-4.p-3.bg-gray-50.rounded-lg')) {
                                shouldFix = true;
                                break;
                            }
                        }
                    }
                }
                
                if (shouldFix) break;
            }
            
            if (shouldFix) {
                log('New accordion content detected, applying fixes...');
                setTimeout(fixAccordionBehavior, 100);
            }
        });
        
        // Start observing
        const container = document.getElementById('paint-selections-container');
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
            log('Monitoring for dynamic accordion content');
        }
        
        // Also fix on window load
        window.addEventListener('load', () => {
            setTimeout(fixAccordionBehavior, 1000);
        });
    }
    
    // Expose functions globally for debugging
    window.AccordionFix = {
        fix: fixAccordionBehavior,
        toggle: toggleAccordion
    };
})();
