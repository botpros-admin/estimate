// Debug script for note icon functionality
(function() {
    'use strict';
    
    console.log('🔍 Note Icon Debug Script Loading...');
    
    // Check when MeasurementNotes module loads
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        
        if (window.MeasurementNotes) {
            console.log('✅ MeasurementNotes module loaded successfully!');
            console.log('Available methods:', window.MeasurementNotes);
            clearInterval(checkInterval);
            
            // Monitor for note icons being added
            monitorNoteIcons();
        } else if (checkCount > 20) {
            console.error('❌ MeasurementNotes module failed to load after 10 seconds');
            clearInterval(checkInterval);
        }
    }, 500);
    
    function monitorNoteIcons() {
        console.log('👀 Monitoring for note icons...');
        
        // Check existing note icons
        setTimeout(() => {
            const noteIcons = document.querySelectorAll('.note-icon');
            console.log(`Found ${noteIcons.length} note icons on the page`);
            
            noteIcons.forEach((icon, index) => {
                console.log(`Note icon ${index + 1}:`, {
                    class: icon.className,
                    id: icon.id,
                    parent: icon.parentElement?.className,
                    hasClickListeners: icon.onclick !== null || icon._listeners !== undefined
                });
                
                // Add a test click handler to verify clicks are working
                icon.addEventListener('click', function(e) {
                    console.log('🖱️ Note icon clicked!', {
                        target: e.target,
                        currentTarget: e.currentTarget,
                        measurementId: this.closest('.measurement-block')?.dataset?.measurementId
                    });
                });
            });
        }, 2000);
        
        // Monitor for new note icons in modals
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Check if it's a modal
                        if (node.id === 'area-settings-modal' || node.classList?.contains('modal')) {
                            console.log('📋 Modal opened, checking for note icons...');
                            
                            setTimeout(() => {
                                const modalNoteIcons = node.querySelectorAll('.note-icon');
                                console.log(`Found ${modalNoteIcons.length} note icons in modal`);
                                
                                modalNoteIcons.forEach((icon, index) => {
                                    console.log(`Modal note icon ${index + 1}:`, {
                                        innerHTML: icon.innerHTML.substring(0, 100),
                                        hasImage: icon.querySelector('img[src*="add-note"]') !== null
                                    });
                                });
                            }, 500);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Also log when clicking on any element with add-note.svg
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.src && target.src.includes('add-note.svg')) {
            console.log('🎯 Clicked on add-note.svg image!', {
                element: target,
                parent: target.parentElement,
                grandparent: target.parentElement?.parentElement
            });
        }
    }, true);
    
})();