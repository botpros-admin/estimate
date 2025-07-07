// Header Click Area Fix - Ensure full header is clickable
document.addEventListener('DOMContentLoaded', function() {
    // Wait for all cards to be rendered
    setTimeout(function() {
        // Find all collapsible headers
        const headers = document.querySelectorAll('.mb-4.p-3.bg-gray-50.rounded-lg[style*="cursor: pointer"]');
        
        headers.forEach(header => {
            // Remove any existing click handlers to prevent conflicts
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Get the associated service content
            const serviceContent = newHeader.nextElementSibling;
            if (serviceContent && serviceContent.classList.contains('service-content')) {
                // Add new click handler
                newHeader.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const chevron = newHeader.querySelector('.chevron-icon');
                    
                    // Check if this is the abrasive method card with long press
                    const methodCard = newHeader.closest('[data-service-id]');
                    if (methodCard && methodCard.dataset.serviceId.includes('abrasive')) {
                        // For abrasive cards, we need to handle both click and long press
                        // The original handlers should still work, just ensure click works too
                    }
                    
                    // Call the accordion toggle function
                    if (typeof handleAccordionToggle === 'function') {
                        handleAccordionToggle(newHeader, serviceContent, chevron);
                    }
                });
                
                // Ensure the header is fully interactive
                newHeader.style.cursor = 'pointer';
                newHeader.setAttribute('role', 'button');
                newHeader.setAttribute('aria-expanded', serviceContent.style.display !== 'none');
                newHeader.setAttribute('tabindex', '0');
                
                // Add keyboard support
                newHeader.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        newHeader.click();
                    }
                });
            }
        });
    }, 500); // Wait for dynamic content to load
});
