// Unified Accordion Fix - Resolves conflicts and ensures accordion functionality works
(function() {
    'use strict';
    
    const DEBUG = true;
    
    function log(...args) {
        if (DEBUG) console.log('[AccordionUnified]', ...args);
    }
    
    // Global flag to prevent multiple initializations
    if (window.accordionFixActive) {
        log('Accordion fix already active, skipping...');
        return;
    }
    window.accordionFixActive = true;
    
    // Enhanced accordion toggle function
    function unifiedAccordionToggle(clickedHeader, clickedContent, clickedChevron) {
        log('Toggling accordion section:', clickedHeader.querySelector('h3')?.textContent?.trim());
        
        const isCurrentlyCollapsed = clickedContent.style.display === 'none' || 
                                   getComputedStyle(clickedContent).display === 'none';
        
        // Find all accordion sections
        const allServiceContents = document.querySelectorAll('.service-content');
        const allHeaders = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg[data-accordion-fixed="true"]');
        
        // Collapse all sections first
        allServiceContents.forEach(content => {
            content.style.display = 'none';
            content.setAttribute('aria-hidden', 'true');
        });
        
        // Reset all chevron icons to collapsed state
        allHeaders.forEach(header => {
            const chevron = header.querySelector('.chevron-icon');
            if (chevron) {
                chevron.style.transform = 'rotate(-90deg)';
                chevron.style.transition = 'transform 0.2s ease';
            }
            header.setAttribute('aria-expanded', 'false');
        });
        
        // If the clicked section was collapsed, expand it
        if (isCurrentlyCollapsed) {
            clickedContent.style.display = 'block';
            clickedContent.setAttribute('aria-hidden', 'false');
            clickedHeader.setAttribute('aria-expanded', 'true');
            
            if (clickedChevron) {
                clickedChevron.style.transform = 'rotate(0deg)';
            }
            
            // Auto-scroll to the expanded section
            setTimeout(() => {
                const cardContainer = clickedHeader.closest('.paint-card') || 
                                    clickedHeader.closest('[data-service-id]') || 
                                    clickedHeader.parentElement;
                
                if (cardContainer) {
                    const headerHeight = document.querySelector('.app-header')?.offsetHeight || 0;
                    const progressHeight = document.querySelector('.progress-container')?.offsetHeight || 0;
                    const offset = headerHeight + progressHeight + 20;
                    
                    const cardTop = cardContainer.getBoundingClientRect().top + window.pageYOffset;
                    const scrollToPosition = Math.max(0, cardTop - offset);
                    
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth'
                    });
                }
            }, 150);
        }
    }
    
    // Function to setup accordion headers
    function setupAccordionHeaders() {
        log('Setting up accordion headers...');
        
        // Find all potential accordion headers
        const headers = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg');
        log(`Found ${headers.length} potential accordion headers`);
        
        headers.forEach((header, index) => {
            // Skip if already processed
            if (header.dataset.accordionFixed === 'true') {
                log(`Header ${index} already processed, skipping`);
                return;
            }
            
            // Find the associated content
            const content = header.nextElementSibling;
            if (!content || !content.classList.contains('service-content')) {
                log(`No service content found for header ${index}`);
                return;
            }
            
            // Mark as processed
            header.dataset.accordionFixed = 'true';
            
            // Ensure header is properly styled for interaction
            header.style.cursor = 'pointer';
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            
            // Setup ARIA attributes
            const isExpanded = content.style.display !== 'none' && 
                             getComputedStyle(content).display !== 'none';
            header.setAttribute('aria-expanded', isExpanded.toString());
            
            // Generate unique IDs if they don't exist
            if (!header.id) {
                const headerText = header.querySelector('h3')?.textContent?.trim() || 'section';
                const uniqueId = `accordion-header-${headerText.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
                header.id = uniqueId;
                content.setAttribute('aria-labelledby', uniqueId);
            }
            
            if (!content.id) {
                content.id = header.id.replace('header', 'content');
                header.setAttribute('aria-controls', content.id);
            }
            
            // Get the chevron icon
            const chevron = header.querySelector('.chevron-icon');
            
            // Remove any existing event listeners by cloning and replacing
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Re-get references after cloning
            const newContent = newHeader.nextElementSibling;
            const newChevron = newHeader.querySelector('.chevron-icon');
            
            // Ensure chevron reflects current state
            if (newChevron) {
                newChevron.style.transition = 'transform 0.2s ease';
                if (newContent.style.display === 'none') {
                    newChevron.style.transform = 'rotate(-90deg)';
                } else {
                    newChevron.style.transform = 'rotate(0deg)';
                }
            }
            
            // Add click event listener
            newHeader.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                log(`Accordion header clicked: ${newHeader.querySelector('h3')?.textContent?.trim()}`);
                
                // Check if this is part of a long press operation
                if (newHeader.classList.contains('long-press-active')) {
                    log('Ignoring click during long press');
                    return;
                }
                
                unifiedAccordionToggle(newHeader, newContent, newChevron);
            });
            
            // Add keyboard support
            newHeader.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    newHeader.click();
                }
            });
            
            log(`Accordion header ${index} setup complete`);
        });
    }
    
    // Initialize function
    function initializeAccordion() {
        log('Initializing unified accordion system...');
        
        // Clear any existing global handlers
        if (window.handleAccordionToggle) {
            window.handleAccordionToggle = unifiedAccordionToggle;
        }
        
        // Setup headers
        setupAccordionHeaders();
        
        // Setup mutation observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList?.contains('paint-card') ||
                                node.querySelector?.('.paint-card') ||
                                node.classList?.contains('mb-4') ||
                                node.querySelector?.('.mb-4.p-3.bg-gray-50.rounded-lg') ||
                                node.dataset?.serviceId) {
                                shouldUpdate = true;
                                break;
                            }
                        }
                    }
                }
                if (shouldUpdate) break;
            }
            
            if (shouldUpdate) {
                log('New accordion content detected, updating...');
                setTimeout(setupAccordionHeaders, 100);
            }
        });
        
        // Start observing
        const containers = [
            document.getElementById('paint-selections-container'),
            document.getElementById('services-container'),
            document.body
        ].filter(Boolean);
        
        containers.forEach(container => {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        });
        
        log('Accordion system initialized successfully');
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccordion);
    } else {
        // DOM already loaded
        setTimeout(initializeAccordion, 100);
    }
    
    // Also initialize on window load
    window.addEventListener('load', () => {
        setTimeout(setupAccordionHeaders, 500);
    });
    
    // Expose functions globally for debugging
    window.AccordionUnified = {
        setup: setupAccordionHeaders,
        toggle: unifiedAccordionToggle,
        init: initializeAccordion
    };
    
    log('Unified accordion fix loaded');
})();
