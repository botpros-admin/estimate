// Multi-page document handler for Hartzell contracts
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only run on Hartzell contract pages
        if (!window.location.pathname.includes('contract-preview-hartzell')) {
            return;
        }
        
        // Give time for content to load
        setTimeout(createMultiPageLayout, 100);
    });
    
    function createMultiPageLayout() {
        const pageContainer = document.querySelector('.page-container');
        if (!pageContainer) return;
        
        // Get all content sections that should be paginated
        const pageContent = pageContainer.querySelector('.page-content');
        if (!pageContent) return;
        
        // Check if content overflows
        const contentHeight = pageContent.scrollHeight;
        const availableHeight = pageContent.clientHeight;
        
        if (contentHeight > availableHeight) {
            // Content overflows, need to create additional pages
            paginateContent(pageContainer);
        }
    }
    
    function paginateContent(firstPage) {
        // For now, ensure the first page has proper structure
        // In a full implementation, this would split content across pages
        
        // Ensure watermark is properly positioned
        const watermark = firstPage.querySelector('.watermark-container');
        if (watermark && watermark.parentElement === firstPage) {
            // Watermark is correctly positioned
        }
        
        // Ensure footer stays at bottom
        const footer = firstPage.querySelector('.footer-section');
        if (footer) {
            footer.classList.add('first-page-only');
        }
    }
})();