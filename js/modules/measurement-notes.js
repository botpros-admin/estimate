/**
 * Measurement Notes Module
 * Handles notes popup for individual measurement areas
 * Created: 2025-01-17
 */

(function() {
    'use strict';
    
    if (window.ErrorHandler) {
        window.ErrorHandler.debug('📝 Measurement Notes Module loading...');
    }
    
    // Module configuration
    const config = {
        modalId: 'measurement-notes-modal',
        noteIconClass: 'measurement-note-icon',
        measurementBlockSelector: '.measurement-block'
    };
    
    // State management
    const state = {
        currentMeasurementId: null,
        notesData: {}
    };
    
    /**
     * Create note icon button
     */
    function createNoteIcon(measurementId) {
        const noteIcon = document.createElement('button');
        noteIcon.className = config.noteIconClass;
        noteIcon.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            margin-left: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
        `;
        noteIcon.innerHTML = `<img src="../img/add-note.svg" width="20" height="20" alt="Add Note" style="display: block; width: 20px; height: 20px; object-fit: contain;">`;
        noteIcon.title = 'Add Note';
        noteIcon.dataset.measurementId = measurementId;
        
        noteIcon.addEventListener('mouseenter', () => {
            noteIcon.style.opacity = '0.7';
        });
        
        noteIcon.addEventListener('mouseleave', () => {
            noteIcon.style.opacity = '1';
        });
        
        noteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            openNotesModal(measurementId);
        });
        
        return noteIcon;
    }
    
    /**
     * Open notes modal
     */
    function openNotesModal(measurementId) {
        console.log('🔵 openNotesModal called with measurementId:', measurementId);
        
        state.currentMeasurementId = measurementId;
        
        // Remove existing modal if any
        const existingModal = document.getElementById(config.modalId);
        if (existingModal) {
            console.log('Removing existing modal');
            existingModal.remove();
        }
        
        // Save current body state and prevent scroll
        state.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        state.savedBodyOverflow = document.body.style.overflow || '';
        state.savedBodyPaddingRight = document.body.style.paddingRight || '';
        state.savedHtmlOverflow = document.documentElement.style.overflow || '';
        
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
        }
        
        // Get measurement block - check both in main page and in modal
        let measurementBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
        
        // If it's a modal measurement ID, extract the original ID
        let originalMeasurementId = measurementId;
        if (measurementId.startsWith('modal-')) {
            // For modal IDs like "modal-meas-1751824727736-54m33-1751826668180"
            // We want to extract "meas-1751824727736-54m33"
            const match = measurementId.match(/modal-(meas-\d+-\w+)/);
            if (match) {
                originalMeasurementId = match[1];
            }
        }
        
        if (!measurementBlock) {
            // If no measurement block found, still allow opening with default description
            const modalHTML = createModalHTML(originalMeasurementId, 'Notes');
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            initializeModal(originalMeasurementId);
            return;
        }
        
        // Get measurement description
        const descriptionInput = measurementBlock.querySelector('.measurement-description-input');
        const description = descriptionInput?.value || 'Measurement Area';
        
        // Create modal HTML
        const modalHTML = createModalHTML(originalMeasurementId, description);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize modal
        initializeModal(originalMeasurementId);
    }
    
    /**
     * Create modal HTML
     */
    function createModalHTML(measurementId, description) {
        const existingNote = state.notesData[measurementId]?.note || '';
        const existingAccessLevel = state.notesData[measurementId]?.accessLevel || 0;
        
        return `
            <div class="modal fade show" id="${config.modalId}" tabindex="-1" 
                 role="dialog" aria-labelledby="notesModalLabel" 
                 aria-hidden="false" style="display: block; background: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 500px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="notesModalLabel">
                                Notes for ${description}
                            </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="measurement-note-text" class="font-semibold mb-2">Notes</label>
                                <textarea 
                                    id="measurement-note-text"
                                    class="form-control w-full min-h-32 border border-gray-300 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Add notes for this measurement area..."
                                    rows="5">${existingNote}</textarea>
                            </div>
                            
                            <div class="mt-4">
                                <h6 class="font-semibold mb-1">Who can see this note?</h6>
                                <p class="text-sm text-gray-600 mb-3">(If none selected, note will be internal only)</p>
                                <div class="flex justify-center gap-4">
                                    <!-- Subcontractor toggle -->
                                    <div class="access-item flex flex-col items-center px-3 py-2 border-2 ${existingAccessLevel & 1 ? 'border-blue-500 bg-blue-50' : 'border-transparent'} rounded-lg cursor-pointer transition-all duration-150 min-w-24" data-value="1">
                                        <img src="../img/painter-with-roller-and-paint-bucket-subcontractor.svg" alt="Subcontractor" class="w-6 h-6 mb-1">
                                        <span class="text-xs text-center font-medium">Subcontractor</span>
                                    </div>
                                    
                                    <!-- Client toggle -->
                                    <div class="access-item flex flex-col items-center px-3 py-2 border-2 ${existingAccessLevel & 2 ? 'border-blue-500 bg-blue-50' : 'border-transparent'} rounded-lg cursor-pointer transition-all duration-150 min-w-24" data-value="2">
                                        <img src="../img/customer.svg" alt="Client" class="w-6 h-6 mb-1">
                                        <span class="text-xs text-center font-medium">Client</span>
                                    </div>
                                </div>
                                <input type="hidden" id="note-access-level" value="${existingAccessLevel}">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-note">Save Note</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize modal functionality
     */
    function initializeModal(measurementId) {
        const modal = document.getElementById(config.modalId);
        if (!modal) return;
        
        const noteTextarea = modal.querySelector('#measurement-note-text');
        const accessLevelInput = modal.querySelector('#note-access-level');
        const accessItems = modal.querySelectorAll('.access-item');
        const saveBtn = modal.querySelector('#save-note');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.modal-footer [data-dismiss="modal"]');
        
        // Access level toggle functionality
        accessItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = parseInt(item.dataset.value);
                
                // Toggle selection
                item.classList.toggle('border-blue-500');
                item.classList.toggle('bg-blue-50');
                
                // Calculate bitmask
                let mask = 0;
                accessItems.forEach(i => {
                    if (i.classList.contains('border-blue-500')) {
                        mask |= parseInt(i.dataset.value);
                    }
                });
                accessLevelInput.value = mask.toString();
            });
        });
        
        // Save functionality
        saveBtn.addEventListener('click', () => {
            const note = noteTextarea.value.trim();
            const accessLevel = parseInt(accessLevelInput.value);
            
            // Save to state using the original measurement ID
            state.notesData[measurementId] = {
                note: note,
                accessLevel: accessLevel
            };
            
            // Update note icon appearance
            if (window.updateMeasurementIcons) {
                window.updateMeasurementIcons(measurementId);
            }
            
            // Save to formState if available
            if (window.formState?.data) {
                if (!window.formState.data.measurementNotes) {
                    window.formState.data.measurementNotes = {};
                }
                window.formState.data.measurementNotes[measurementId] = {
                    note: note,
                    accessLevel: accessLevel
                };
                window.formState.saveState();
            }
            
            closeModal();
        });
        
        // Close functionality
        if (closeBtn) {
            console.log('✅ Close button found, adding listener');
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        }
        
        if (cancelBtn) {
            console.log('✅ Cancel button found, adding listener');
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔴 Cancel button clicked');
                closeModal();
            });
        } else {
            console.log('❌ Cancel button NOT found!');
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', escapeHandler);
    }
    
    function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
    
    function closeModal() {
        console.log('🔵 closeModal called');
        const modal = document.getElementById(config.modalId);
        if (modal) {
            console.log('✅ Modal found, removing...');
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
            
            // Restore body state
            document.body.style.overflow = state.savedBodyOverflow || '';
            document.body.style.paddingRight = state.savedBodyPaddingRight || '';
            document.documentElement.style.overflow = state.savedHtmlOverflow || '';
            
            // Restore scroll position if needed
            if (state.savedScrollPosition !== undefined) {
                window.scrollTo(0, state.savedScrollPosition);
            }
            console.log('✅ Modal closed successfully');
        } else {
            console.log('❌ Modal not found in closeModal');
        }
    }
    
    /**
     * Update note icon appearance based on whether a note exists
     */
    function updateNoteIconAppearance(measurementId, note) {
        // This function is kept for future use but currently does nothing
        // since note icons are only shown in the modal, not on the main page
        return;
        
        const noteIcon = document.querySelector(`[data-measurement-id="${measurementId}"] .${config.noteIconClass}`);
        if (noteIcon) {
            if (note && note.length > 0) {
                noteIcon.style.filter = 'hue-rotate(240deg) saturate(2)'; // Make it blue when note exists
                noteIcon.title = 'Edit Note';
            } else {
                noteIcon.style.filter = 'none';
                noteIcon.title = 'Add Note';
            }
        }
    }
    
    /**
     * Add note icons to existing measurement blocks
     */
    function addNoteIcons() {
        // DISABLED - Notes are handled in the area settings modal
        return;
        
        const measurementBlocks = document.querySelectorAll(config.measurementBlockSelector);
        
        measurementBlocks.forEach(block => {
            const measurementId = block.dataset.measurementId;
            if (!measurementId) return;
            
            // Skip if this measurement block is inside a modal
            if (block.closest('.modal')) return;
            
            // Check if note icon already exists
            if (block.querySelector(`.${config.noteIconClass}`)) return;
            
            // Find the waffle icon container
            const subtotalContainer = block.querySelector('.measurement-subtotal')?.parentElement;
            if (subtotalContainer) {
                const waffleIcon = subtotalContainer.querySelector('.area-settings-icon');
                if (waffleIcon) {
                    // Insert note icon after waffle icon
                    const noteIcon = createNoteIcon(measurementId);
                    waffleIcon.insertAdjacentElement('afterend', noteIcon);
                    
                    // Load existing note data from formState
                    if (window.formState?.data?.measurementNotes?.[measurementId]) {
                        const noteData = window.formState.data.measurementNotes[measurementId];
                        state.notesData[measurementId] = noteData;
                        updateNoteIconAppearance(measurementId, noteData.note);
                    }
                }
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Add initial delay to ensure other modules have loaded
            setTimeout(addNoteIcons, 500);
        });
    } else {
        // Add initial delay to ensure other modules have loaded
        setTimeout(addNoteIcons, 500);
    }
    
    // Observe for new measurement blocks
    const observer = new MutationObserver(() => {
        addNoteIcons();
    });
    
    // Start observing after a delay
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 1000);
    
    // Export to global scope
    window.MeasurementNotes = {
        open: openNotesModal,
        addIcons: addNoteIcons
    };
    
    console.log('✅ MeasurementNotes module loaded and exposed to window');
    
    if (window.ErrorHandler) {
        window.ErrorHandler.debug('✅ Measurement Notes Module loaded successfully');
    }
    
})();