// Enhanced Independent Modal System with Title Field Fix
(function() {
  'use strict';
  
  // Store scroll position and body state
  let savedScrollPosition = 0;
  let savedBodyPaddingRight = '';
  let savedHtmlOverflow = '';
  let savedBodyOverflow = '';
  
  /**
   * Add note and camera icons to a measurement block
   */
  function addMeasurementIcons(measurementBlock, originalMeasurementId) {
    const subtotalContainer = measurementBlock.querySelector('.measurement-subtotal')?.parentElement;
    if (!subtotalContainer) return;
    
    // Ensure the container has proper flex alignment
    subtotalContainer.style.display = 'flex';
    subtotalContainer.style.alignItems = 'center';
    subtotalContainer.style.justifyContent = 'space-between';
    subtotalContainer.style.gap = '0';
    
    // Create a container for the icons
    const iconsContainer = document.createElement('div');
    iconsContainer.style.cssText = 'display: flex; align-items: center; gap: 4px; margin-top: 2px;';
    
    // Create note icon button
    const noteIcon = document.createElement('button');
    noteIcon.className = 'note-icon';
    noteIcon.title = 'Add Note';
    noteIcon.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0; margin: 0; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; pointer-events: auto; position: relative; z-index: 10;';
    noteIcon.innerHTML = `
      <img src="../img/add-note.svg" width="29" height="29" alt="Add Note" style="display: block; width: 29px; height: 29px; object-fit: contain; pointer-events: none;">
    `;
    
    // Add note icon to icons container
    iconsContainer.appendChild(noteIcon);
    
    // Check if there's an existing note for this measurement
    if (originalMeasurementId && window.formState?.data?.measurementNotes?.[originalMeasurementId]) {
      const noteData = window.formState.data.measurementNotes[originalMeasurementId];
      if (noteData.note && noteData.note.length > 0) {
        noteIcon.style.filter = 'hue-rotate(240deg) saturate(2)'; // Make it blue when note exists
        noteIcon.title = 'Edit Note';
      }
    }
    
    // Ensure the measurement subtotal has proper vertical alignment
    const measurementSubtotal = subtotalContainer.querySelector('.measurement-subtotal');
    if (measurementSubtotal) {
      measurementSubtotal.style.lineHeight = '34px';
      measurementSubtotal.style.marginTop = '-3px';
      measurementSubtotal.style.display = 'inline-block';
      measurementSubtotal.style.verticalAlign = 'middle';
    }
    
    // Create camera icon button for photos
    const cameraIcon = document.createElement('button');
    cameraIcon.className = 'camera-icon';
    cameraIcon.title = 'Add Photos';
    cameraIcon.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0; margin: 0; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; pointer-events: auto; position: relative; z-index: 10;';
    cameraIcon.innerHTML = `
      <img src="../img/camera.svg" width="29" height="29" alt="Add Photos" style="display: block; width: 29px; height: 29px; object-fit: contain; pointer-events: none;">
    `;
    
    // Add camera icon to icons container
    iconsContainer.appendChild(cameraIcon);
    
    // Insert icons container at the beginning of subtotal container
    subtotalContainer.insertBefore(iconsContainer, subtotalContainer.firstChild);
    
    // Add click handler for camera icon
    cameraIcon.addEventListener('click', (e) => {
      e.preventDefault();
      const fileInput = measurementBlock.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      }
    });
    
    // Add hover effect for camera icon
    cameraIcon.addEventListener('mouseenter', () => {
      cameraIcon.style.opacity = '0.7';
    });
    
    cameraIcon.addEventListener('mouseleave', () => {
      cameraIcon.style.opacity = '1';
    });
    
    // Add click handler for note icon
    noteIcon.addEventListener('click', handleNoteClick);
    
    // Also add handler to the image inside the button
    const noteImage = noteIcon.querySelector('img');
    if (noteImage) {
      noteImage.addEventListener('click', handleNoteClick);
    }
    
    function handleNoteClick(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Note icon clicked!', measurementBlock.dataset.measurementId);
      
      // Open the measurement-specific notes popup
      const measurementId = measurementBlock.dataset.measurementId;
      if (window.MeasurementNotes && window.MeasurementNotes.open) {
        window.MeasurementNotes.open(measurementId);
        
        // Add a listener for when the modal closes to update the icon
        const checkInterval = setInterval(() => {
          if (!document.getElementById('measurement-notes-modal')) {
            clearInterval(checkInterval);
            // Update note icon appearance based on saved data
            if (originalMeasurementId && window.formState?.data?.measurementNotes?.[originalMeasurementId]) {
              const noteData = window.formState.data.measurementNotes[originalMeasurementId];
              if (noteData.note && noteData.note.length > 0) {
                noteIcon.style.filter = 'hue-rotate(240deg) saturate(2)';
                noteIcon.title = 'Edit Note';
              } else {
                noteIcon.style.filter = 'none';
                noteIcon.title = 'Add Note';
              }
            }
          }
        }, 100);
      } else {
        console.error('MeasurementNotes module not loaded!');
      }
    }
    
    // Add hover effect
    noteIcon.addEventListener('mouseenter', () => {
      noteIcon.style.opacity = '0.7';
    });
    
    noteIcon.addEventListener('mouseleave', () => {
      noteIcon.style.opacity = '1';
    });
    
    // Hide original photo upload elements
    const originalPhotoButton = measurementBlock.querySelector('.photo-upload-btn, .add-photo-btn, [class*="upload"], label.add-photo-btn');
    if (originalPhotoButton) {
      originalPhotoButton.style.display = 'none';
    }
    
    const photoUploadContainer = measurementBlock.querySelector('.photo-upload-container');
    if (photoUploadContainer) {
      const uploadButton = photoUploadContainer.querySelector('button, label');
      if (uploadButton) {
        uploadButton.style.display = 'none';
      }
    }
    
    const photosContainer = measurementBlock.querySelector('.photos-container');
    if (photosContainer) {
      const addPhotoBtn = photosContainer.querySelector('.add-photo-btn, label[for*="photo"], [class*="upload"]');
      if (addPhotoBtn) {
        addPhotoBtn.style.display = 'none';
      }
    }
    
    // Use MutationObserver to catch dynamically added photo upload elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const textContent = node.textContent || '';
            if (textContent.includes('Add Photo') || node.classList?.contains('add-photo-btn')) {
              node.style.display = 'none';
            }
            
            if (node.querySelectorAll) {
              const addPhotoElements = node.querySelectorAll('*');
              addPhotoElements.forEach(el => {
                if (el.textContent && el.textContent.trim() === 'Add Photos' ||
                    (el.textContent && el.textContent.includes('Add Photo') && el.classList && el.classList.contains('btn'))) {
                  el.style.display = 'none';
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(measurementBlock, {
      childList: true,
      subtree: true
    });
    
    // Additional delayed checks to ensure all photo buttons are hidden
    setTimeout(() => {
      const allPhotoButtons = measurementBlock.querySelectorAll('button, label');
      allPhotoButtons.forEach(btn => {
        if (btn.textContent && (btn.textContent.includes('Add Photo') || btn.textContent.includes('Add Photos'))) {
          btn.style.display = 'none';
        }
      });
    }, 100);
  }
  
  window.openAreaSettingsModal = function(measurementId, surfaceId, serviceType, enhancedMeasurement) {
    // More robust scroll prevention
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    savedBodyPaddingRight = document.body.style.paddingRight;
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock scrolling on both html and body for maximum compatibility
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth + 'px';
    
    // For iOS devices, we need additional measures
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    // Remove any existing modal
    const existingModal = document.getElementById('area-settings-modal');
    if (existingModal) existingModal.remove();
    
    // Get the original measurement block
    const originalBlock = document.querySelector(`[data-measurement-id="${measurementId}"]`);
    if (!originalBlock) {
      return;
    }
    
    // Clone the entire measurement block structure
    const clonedBlock = originalBlock.cloneNode(true);
    
    // Create a unique ID for modal elements
    const modalId = 'modal-' + Date.now();
    
    // Update the measurement ID to make it unique
    clonedBlock.dataset.measurementId = modalId;
    
    // Update all IDs to prevent conflicts
    clonedBlock.querySelectorAll('[id]').forEach(el => {
      el.id = modalId + '-' + el.id.split('-').pop();
    });
    
    // Update all for attributes
    clonedBlock.querySelectorAll('[for]').forEach(el => {
      el.setAttribute('for', modalId + '-' + el.getAttribute('for').split('-').pop());
    });
    
    // Remove all existing icons from the cloned block (they're from the main page)
    const waffleIcon = clonedBlock.querySelector('.area-settings-icon');
    if (waffleIcon) {
      waffleIcon.remove();
    }
    
    // Remove the entire icons grid from the cloned block
    const existingIconsGrid = clonedBlock.querySelector('div[style*="grid-template-columns"]');
    if (existingIconsGrid) {
      existingIconsGrid.remove();
    }
    
    // Remove any existing note or camera icons
    const existingNoteIcon = clonedBlock.querySelector('.note-icon');
    if (existingNoteIcon) {
      existingNoteIcon.remove();
    }
    
    const existingCameraIcon = clonedBlock.querySelector('.camera-icon');
    if (existingCameraIcon) {
      existingCameraIcon.remove();
    }
    
    // Add note and camera icons to the cloned block in modal style (flex layout)
    addMeasurementIcons(clonedBlock, originalBlock.dataset.measurementId);
    
    // Show the color input container (it's hidden on the main page)
    const colorContainer = clonedBlock.querySelector('.measurement-color-input-container');
    if (colorContainer) {
      colorContainer.style.display = 'block';
      
      // Remove any existing title container since we're using the description field
      const existingTitle = colorContainer.querySelector('.measurement-title-container');
      if (existingTitle) {
        existingTitle.remove();
        }
    }
    
    // Modify the description input to use "Detail" instead of "Area Description"
    const descriptionInput = clonedBlock.querySelector('.measurement-description-input');
    if (descriptionInput) {
      descriptionInput.placeholder = 'Detail (e.g., Main Wall)';
      
      // Remove the cloned event listener that would update the main measurement object
      // by replacing the input element with a clean copy
      const newDescriptionInput = descriptionInput.cloneNode(false);
      newDescriptionInput.value = descriptionInput.value;
      newDescriptionInput.placeholder = 'Detail (e.g., Main Wall)';
      newDescriptionInput.className = descriptionInput.className;
      
      // Add an event listener to save modal-specific data without affecting the main input
      newDescriptionInput.addEventListener('input', function() {
        // Store the modal description in a data attribute for later retrieval
        clonedBlock.setAttribute('data-modal-description', newDescriptionInput.value);
      });
      
      // Check if there's already a saved modal description and restore it
      const savedModalDescription = originalBlock.getAttribute('data-modal-description');
      if (savedModalDescription) {
        newDescriptionInput.value = savedModalDescription;
        clonedBlock.setAttribute('data-modal-description', savedModalDescription);
      }
      
      descriptionInput.parentNode.replaceChild(newDescriptionInput, descriptionInput);
    }
    
    // Remove any standalone description inputs that might be duplicated
    const extraDescriptionInputs = clonedBlock.querySelectorAll('.measurement-description-input:not(:first-of-type)');
    extraDescriptionInputs.forEach(input => {
      const container = input.closest('.measurement-description-container, .description-container');
      if (container) {
        container.remove();
      } else {
        input.remove();
      }
    });
    
    // Remove any labels that might be for description fields
    clonedBlock.querySelectorAll('label').forEach(label => {
      const text = label.textContent.toLowerCase();
      if (text.includes('description') || text.includes('area name') || text.includes('name')) {
        label.remove();
      }
    });    
    // Ensure photo thumbnails container exists
    const photoUploadSection = clonedBlock.querySelector('.photo-upload-container');
    if (photoUploadSection && !photoUploadSection.querySelector('.photo-thumbnails')) {
      const thumbnailsDiv = document.createElement('div');
      thumbnailsDiv.className = 'photo-thumbnails';
      photoUploadSection.appendChild(thumbnailsDiv);
    }
    
    // Ensure total area input exists within total-input-container
    let totalInputContainer = clonedBlock.querySelector('.total-input-container');
    // If total-input-container doesn't exist at all, create it
    if (!totalInputContainer) {
      const toggleContainer = clonedBlock.querySelector('.measurement-input-type-selector');
      if (toggleContainer && toggleContainer.parentElement) {
        totalInputContainer = document.createElement('div');
        totalInputContainer.className = 'total-input-container';
        totalInputContainer.style.display = 'none'; // Initially hidden
        
        // Insert after toggle or in appropriate location
        const lxhContainer = clonedBlock.querySelector('.lxh-inputs-container');
        if (lxhContainer && lxhContainer.parentElement) {
          lxhContainer.parentElement.appendChild(totalInputContainer);
        } else {
          toggleContainer.parentElement.appendChild(totalInputContainer);
        }
      }
    }    
    if (totalInputContainer && !totalInputContainer.querySelector('.total-area-input')) {
      // Create the total area input field
      const totalAreaInput = document.createElement('input');
      totalAreaInput.type = 'number';
      totalAreaInput.className = 'total-area-input measurement-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500';
      totalAreaInput.placeholder = 'Enter total square feet';
      totalAreaInput.step = '0.01';
      totalAreaInput.autocomplete = 'off';
      
      // Get existing value from original block if available
      const originalTotalInput = originalBlock.querySelector('.total-area-input');
      if (originalTotalInput) {
        totalAreaInput.value = originalTotalInput.value;
      }
      
      // Add label above input
      const label = document.createElement('label');
      label.className = 'block text-sm font-medium text-gray-700 mb-1';
      label.textContent = 'Total Area (Sq Ft)';
      
      // Clear container and add label and input
      totalInputContainer.innerHTML = '';
      totalInputContainer.appendChild(label);
      totalInputContainer.appendChild(totalAreaInput);
      
      } else if (totalInputContainer) {      }
    
    // Get surface info
    const surfaceCard = originalBlock.closest('.surface-card');
    const surfaceName = surfaceCard?.querySelector('.surface-title-input')?.value || 'Surface';
    
    // Get measurement description (area name) from the ORIGINAL block only
    const areaName = originalBlock.querySelector('.measurement-description-input')?.value || 'Unnamed Area';
    
    // Create modal wrapper
    const modal = document.createElement('div');
    modal.id = 'area-settings-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4';
    
    // Add responsive styles with touch-action to prevent scrolling on touch devices
    const style = document.createElement('style');
    style.setAttribute('data-modal-styles', 'area-settings');
    style.textContent = `
      /* Prevent all scrolling when modal is open */
      body.modal-open {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
      }
      
      html.modal-open {
        overflow: hidden !important;
      }      
      #area-settings-modal {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: none;
      }
      
      #area-settings-modal .bg-white {
        touch-action: auto;
      }
      
      #area-settings-modal .measurement-title-container {
        margin-bottom: 1rem;
      }
      
      #area-settings-modal .measurement-title-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }
      
      #area-settings-modal .measurement-title-input:focus {
        outline: none;
        ring: 1px;
        ring-color: #3b82f6;
        border-color: #3b82f6;
      }      
      /* Maintain consistent height when toggling */
      #area-settings-modal .measurement-inputs-wrapper {
        position: relative;
        min-height: 80px;
      }
      
      #area-settings-modal .lxh-inputs-container,
      #area-settings-modal .total-input-container {
        transition: opacity 0.3s ease, visibility 0.3s ease;
        width: 100%;
      }
      
      #area-settings-modal .total-input-container {
        padding: 0.5rem 0;
      }
      
      #area-settings-modal .total-input-container label {
        display: block;
        margin-bottom: 0.25rem;
      }
      
      #area-settings-modal .lxh-inputs-container[style*="visibility: hidden"],
      #area-settings-modal .total-input-container[style*="visibility: hidden"] {
        pointer-events: none;
      }
      
      #area-settings-modal .total-area-input {
        width: 100%;
        padding: 0.5rem 0.75rem;        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }
      
      #area-settings-modal .total-area-input:focus {
        outline: none;
        ring: 1px;
        ring-color: #3b82f6;
        border-color: #3b82f6;
      }
      
      /* Photo upload styles */
      #area-settings-modal .photo-upload-container {
        margin-top: 1rem;
      }
      
      #area-settings-modal .photo-thumbnails {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      
      #area-settings-modal .photo-thumbnail {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 0.375rem;
        overflow: hidden;      }
      
      #area-settings-modal .photo-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      #area-settings-modal .photo-remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }
      
      #area-settings-modal .photo-remove-btn:hover {
        background: rgba(220, 38, 38, 1);
      }
      
      /* Hide any Add Photos buttons in the modal */
      #area-settings-modal .add-photo-btn,
      #area-settings-modal .btn:has(.fa-plus),
      #area-settings-modal label:has(.fa-plus),
      #area-settings-modal button:contains("Add Photo"),
      #area-settings-modal label:contains("Add Photo") {
        display: none !important;
      }
      
      /* More specific hiding for any element with Add Photo text */
      #area-settings-modal *:not(.photo-thumbnail) {
        *:contains("Add Photo") {
          display: none !important;
        }
      }
      
      /* Hide specific classes that might be used for photo buttons */
      #area-settings-modal .btn.add-photo-btn,
      #area-settings-modal label.btn,
      #area-settings-modal .photo-upload-btn {
        display: none !important;
      }
      
      /* Measurement remove button styling for proper X display */
      #area-settings-modal .measurement-remove-btn {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        width: 28px !important;
        height: 28px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      
      #area-settings-modal .measurement-remove-btn img {
        width: 16px !important;
        height: 16px !important;
        display: block !important;
      }
      
      #area-settings-modal .measurement-remove-btn:hover {
        background: #fee2e2 !important;
      }
      
      #area-settings-modal .photo-remove-btn {
        border: none;
        border-radius: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }
      
      #area-settings-modal .photo-remove-btn:hover {
        background: rgba(220, 38, 38, 1);
      }
      
      @media (max-width: 640px) {
        #area-settings-modal .bg-white {          max-width: 100%;
          margin: 0.5rem;
          max-height: calc(100vh - 1rem);
        }
        
        #area-settings-modal .measurement-block {
          padding: 0.75rem;
          font-size: 0.875rem;
        }
        
        #area-settings-modal .measurement-input,
        #area-settings-modal .measurement-title-input,
        #area-settings-modal .total-area-input {
          font-size: 0.875rem;
          padding: 0.375rem 0.5rem;
        }
        
        #area-settings-modal .lxh-input {
          min-width: 40px;
          font-size: 0.875rem;
        }
        
        #area-settings-modal .btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
        
        #area-settings-modal .modal-body {
          max-height: calc(100vh - 10rem);
          overflow-y: auto;        }
      }
    `;
    document.head.appendChild(style);
    
    // Add modal-open classes
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 sm:mx-auto">
        <!-- Header -->
        <div class="modal-header bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 rounded-t-lg flex justify-between items-start">
          <div class="flex-1 pr-2">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-800">${surfaceName}</h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">${areaName}</p>
          </div>
          <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors mt-0.5 sm:mt-1 flex-shrink-0">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="modal-body px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto" style="flex: 1;">
          <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Surface Details</h3>
          
          <!-- Cloned measurement block will go here -->
          <div class="modal-measurement-container"></div>
          
          <!-- Add Measurement Area Button -->
          <div class="mt-4 mb-4">
            <button class="btn add-measurement-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2">
              <i class="fas fa-plus"></i>
              Add Measurement Area
            </button>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="modal-footer bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 rounded-b-lg flex justify-end gap-2 sm:gap-3">
          <button class="modal-cancel px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm sm:text-base">Cancel</button>
          <button class="modal-save px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm sm:text-base">Save Settings</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Insert the cloned block into the modal
    modal.querySelector('.modal-measurement-container').appendChild(clonedBlock);
    
    // Initialize note and access level data from original block or formState
    const currentMeasurementId = originalBlock.dataset.measurementId || originalBlock.id;
    // Note: Surface notes and access controls have been removed from modal
    // const noteTextarea = modal.querySelector('#surfaceNoteText');
    // const accessLevelInput = modal.querySelector('#surfaceAccessLevel');
    
    if (currentMeasurementId) {
      // Note: Surface notes and access controls have been removed
      // let noteText = originalBlock.dataset.surfaceNote || '';
      // let accessLevel = originalBlock.dataset.surfaceAccessLevel || '0';
      
      // Load from formState if available
      if (window.formState?.data?.surfacePhotos && window.formState.data.surfacePhotos[currentMeasurementId]) {
        const savedData = window.formState.data.surfacePhotos[currentMeasurementId];
        // Note: Surface notes and access controls have been removed
        // noteText = savedData.note || noteText;
        // accessLevel = savedData.accessLevel ? savedData.accessLevel.toString() : accessLevel;
        
        // Load saved photos
        if (savedData.photos && savedData.photos.length > 0) {
          const modalPhotosContainer = clonedBlock.querySelector('.photo-thumbnails');
          if (!modalPhotosContainer) {
            // Create photo container if it doesn't exist
            const photoSection = clonedBlock.querySelector('.photo-upload-container');
            if (photoSection) {
              const newContainer = document.createElement('div');
              newContainer.className = 'photo-thumbnails';
              photoSection.appendChild(newContainer);
            }
          }
          
          const photosContainer = clonedBlock.querySelector('.photo-thumbnails');
          if (photosContainer) {
            // Clear existing photos
            photosContainer.innerHTML = '';
            
            // Add saved photos
            savedData.photos.forEach(photo => {
              const thumbnail = document.createElement('div');
              thumbnail.className = 'photo-thumbnail';
              thumbnail.style.cursor = 'pointer';
              thumbnail.innerHTML = `
                <img src="${photo.src}" alt="${photo.alt}">
              `;
              
              // Click to open editor
              thumbnail.addEventListener('click', () => {
                if (window.PhotoEditor) {
                  // Need to pass the original measurement
                  const measurementId = originalBlock.dataset.measurementId;
                  const measurement = window.formState?.data?.surfaces?.flatMap(s => s.measurements)
                    .find(m => m.id === measurementId);
                  if (measurement) {
                    window.PhotoEditor.open(photo, measurement);
                  }
                }
              });
              
              photosContainer.appendChild(thumbnail);
            });
            
            }
        }
      }
      
      // Populate the fields
      // Note: Surface notes and access controls have been removed
      // if (noteTextarea) {
      //   noteTextarea.value = noteText;
      // }
      // if (accessLevelInput) {
      //   accessLevelInput.value = accessLevel;
      // }
      
      // Load photos from original block if not already loaded from formState
      const modalPhotosContainer = clonedBlock.querySelector('.photo-thumbnails');
      const originalPhotosContainer = originalBlock.querySelector('.photo-thumbnails');
      
      if (originalPhotosContainer && originalPhotosContainer.children.length > 0 && 
          (!modalPhotosContainer || modalPhotosContainer.children.length === 0)) {
        
        // Ensure modal has a photos container
        if (!modalPhotosContainer) {
          const photoSection = clonedBlock.querySelector('.photo-upload-container');
          if (photoSection) {
            const newContainer = document.createElement('div');
            newContainer.className = 'photo-thumbnails';
            photoSection.appendChild(newContainer);
          }
        }
        
        const photosContainer = clonedBlock.querySelector('.photo-thumbnails');
        if (photosContainer) {
          // Clone photos from original block
          Array.from(originalPhotosContainer.children).forEach(originalThumbnail => {
            const clonedThumbnail = originalThumbnail.cloneNode(true);
            
            // Re-attach event listeners
            const removeBtn = clonedThumbnail.querySelector('.photo-remove-btn');
            if (removeBtn) {
              removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clonedThumbnail.remove();
              });
            }
            
            photosContainer.appendChild(clonedThumbnail);
          });
          
          }
      }
      
      // Set the visual state of access toggles - REMOVED
      // const accessItems = modal.querySelectorAll('.access-item');
      // const accessMask = parseInt(accessLevel);
      // accessItems.forEach((item) => {
      //   const bitValue = parseInt(item.dataset.bit);
      //   if (accessMask & bitValue) {
      //     item.classList.add('active');
      //     item.style.borderColor = '#3b82f6';
      //     item.style.backgroundColor = 'rgba(59, 130, 246, 0.07)';
      //     const icon = item.querySelector('img');
      //     if (icon) icon.style.opacity = '1';
      //   }
      // });
      
      }
    
    // Prevent touchmove on modal background for iOS
    modal.addEventListener('touchmove', function(e) {
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });
        
    // Reattach event listeners to the cloned elements
    setupModalEventListeners(modal, clonedBlock, originalBlock, measurementId);
    
    // Set up color input functionality
    setupColorInput(clonedBlock);
    
    // Calculate initial area
    calculateModalArea(clonedBlock);
    
    // Ensure toggle state is properly initialized after a small delay
    setTimeout(() => {
      const toggleCheck = clonedBlock.querySelector('.toggle-switch input[type="checkbox"]');
      const totalCont = clonedBlock.querySelector('.total-input-container');
      
      if (toggleCheck && toggleCheck.checked && totalCont) {
        // Make sure total area is visible
        totalCont.style.visibility = 'visible';
        totalCont.style.position = 'relative';
        totalCont.style.opacity = '1';
        totalCont.style.display = 'block';
      }
    }, 100);
  }; // End of openAreaSettingsModal function
  
  // Debug: Confirm function is properly exposed
  function setupModalEventListeners(modal, clonedBlock, originalBlock, originalMeasurementId) {
    // Define close modal function with proper scroll restoration
    const closeModal = () => {      modal.remove();
      
      // Remove modal-open classes
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      
      // Restore all body styles
      document.documentElement.style.overflow = savedHtmlOverflow;
      document.body.style.overflow = savedBodyOverflow;
      document.body.style.paddingRight = savedBodyPaddingRight;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      
      // Restore scroll position
      window.scrollTo(0, savedScrollPosition);
      
      // Clean up the style tag
      const styleTag = document.querySelector('style[data-modal-styles="area-settings"]');
      if (styleTag) styleTag.remove();
    };
    
    // Toggle functionality
    const toggle = clonedBlock.querySelector('.toggle-switch input[type="checkbox"]');
    const lxhContainer = clonedBlock.querySelector('.lxh-inputs-container');
    // Re-query for totalContainer after potentially creating it
    const totalContainer = clonedBlock.querySelector('.total-input-container');
    const leftLabel = clonedBlock.querySelector('.toggle-label-left');
    const rightLabel = clonedBlock.querySelector('.toggle-label-right');    
    // Create wrapper for toggle containers if they don't have one
    if (lxhContainer && totalContainer && !lxhContainer.parentElement.classList.contains('measurement-inputs-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'measurement-inputs-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.minHeight = '80px';
      
      // Move both containers into the wrapper
      const parent = lxhContainer.parentElement;
      parent.insertBefore(wrapper, lxhContainer);
      wrapper.appendChild(lxhContainer);
      wrapper.appendChild(totalContainer);
    }
    
    if (toggle) {
      toggle.addEventListener('change', function() {
        if (this.checked) {
          // Show total area, hide dimensions - use visibility to maintain layout
          lxhContainer.style.visibility = 'hidden';
          lxhContainer.style.position = 'absolute';
          lxhContainer.style.opacity = '0';
          totalContainer.style.visibility = 'visible';
          totalContainer.style.position = 'relative';
          totalContainer.style.opacity = '1';
          totalContainer.style.display = 'block';
          leftLabel.classList.remove('active');
          rightLabel.classList.add('active');
        } else {
          // Show dimensions, hide total area
          lxhContainer.style.visibility = 'visible';
          lxhContainer.style.position = 'relative';
          lxhContainer.style.opacity = '1';
          lxhContainer.style.display = 'block';
          totalContainer.style.visibility = 'hidden';
          totalContainer.style.position = 'absolute';
          totalContainer.style.opacity = '0';
          totalContainer.style.display = 'none';
          leftLabel.classList.add('active');
          rightLabel.classList.remove('active');
        }
        calculateModalArea(clonedBlock);
      });
      
      // Set initial state based on current toggle value
      if (toggle.checked) {
        lxhContainer.style.visibility = 'hidden';
        lxhContainer.style.position = 'absolute';
        lxhContainer.style.opacity = '0';
        totalContainer.style.visibility = 'visible';
        totalContainer.style.position = 'relative';
        totalContainer.style.opacity = '1';
        totalContainer.style.display = 'block';
      } else {
        lxhContainer.style.visibility = 'visible';
        lxhContainer.style.position = 'relative';
        lxhContainer.style.opacity = '1';
        lxhContainer.style.display = 'block';
        totalContainer.style.visibility = 'hidden';
        totalContainer.style.position = 'absolute';
        totalContainer.style.opacity = '0';
        totalContainer.style.display = 'none';
      }
    }
    
    // Add L x H pair functionality
    const addLxhBtn = clonedBlock.querySelector('.add-lxh-btn');
    if (addLxhBtn) {
      addLxhBtn.addEventListener('click', function() {
        addLxhPair(clonedBlock);
      });
    }
    
    // Remove L x H pair functionality
    clonedBlock.addEventListener('click', function(e) {
      if (e.target.closest('.remove-lxh-btn')) {
        const pair = e.target.closest('.lxh-pair');
        if (pair) {
          pair.remove();
          updateRemoveButtons(clonedBlock);
          calculateModalArea(clonedBlock);
        }
      }
    });
    
    // Calculate area on input
    clonedBlock.addEventListener('input', function(e) {
      if (e.target.matches('.lxh-input, .total-area-input')) {
        calculateModalArea(clonedBlock);
      }
    });    
    // Photo upload functionality
    const photoInput = clonedBlock.querySelector('input[type="file"]');
    if (photoInput) {
      // Remove any existing listeners and add new one
      const newPhotoInput = photoInput.cloneNode(true);
      photoInput.parentNode.replaceChild(newPhotoInput, photoInput);
      
      newPhotoInput.addEventListener('change', function(e) {
        handlePhotoUpload(e, clonedBlock);
      });
      
      // Also check for upload button that might trigger the file input
      const uploadBtn = clonedBlock.querySelector('.photo-upload-btn, .add-photo-btn, [class*="upload"]');
      if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
          e.preventDefault();
          newPhotoInput.click();
        });
      }
    } else {
      }
    
    // Add Measurement Area button handler
    const addMeasurementBtn = modal.querySelector('.add-measurement-btn');
    if (addMeasurementBtn) {
      addMeasurementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addNewMeasurementArea(modal, originalBlock);
      });
    }
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Save handler
    modal.querySelector('.modal-save').addEventListener('click', () => {
      // Debug: Check current values in modal
      // const noteText = modal.querySelector('#surfaceNoteText')?.value || '';
      // const accessLevel = modal.querySelector('#surfaceAccessLevel')?.value || '0';
      const photoCount = modal.querySelectorAll('.photo-thumbnail').length;
      
      saveModalSettings(modal, originalBlock, originalMeasurementId);
      closeModal();
    });
    
    // Access toggle functionality - REMOVED
    // const accessItems = modal.querySelectorAll('.access-item');
    // const accessLevelInput = modal.querySelector('#surfaceAccessLevel');
    
    // function updateAccessMask() {
    //   let mask = 0;
    //   accessItems.forEach((item) => {
    //     if (item.classList.contains('active')) {
    //       mask |= Number(item.dataset.bit);
    //     }
    //   });
    //   if (accessLevelInput) {
    //     accessLevelInput.value = mask;
    //   }
    // }
    
    // function toggleAccessItem(item) {
    // //   item.classList.toggle('active');
    //   const icon = item.querySelector('img');
    //   const label = item.querySelector('span:last-child');
    //   
    //   if (item.classList.contains('active')) {
    //     // Active state
    //     item.style.borderColor = '#3b82f6';
    //     item.style.backgroundColor = 'rgba(59, 130, 246, 0.07)';
    //     if (icon) icon.style.opacity = '1';
    //   } else {
    //     // Inactive state
    //     item.style.borderColor = 'transparent';
    //     item.style.backgroundColor = 'transparent';
    //     if (icon) icon.style.opacity = '0.5';
    //   }
    //   
    //   updateAccessMask();
    // }
    
    // // Attach click handlers to access items
    // accessItems.forEach((item) => {
    //   item.addEventListener('click', () => toggleAccessItem(item));
    // });
    
    // // Initialize access mask
    // updateAccessMask();
  }
  
  function addLxhPair(container) {
    const lxhContainer = container.querySelector('.lxh-inputs-container');
    const addBtn = container.querySelector('.add-lxh-btn');
    
    const newPair = document.createElement('div');
    newPair.className = 'lxh-pair';
    newPair.dataset.dimensionId = 'dim-' + Date.now();
    newPair.innerHTML = `
      <input type="number" class="lxh-input" placeholder="L" step="0.01">
      <span>x</span>      <input type="number" class="lxh-input" placeholder="H" step="0.01">
      <button class="remove-lxh-btn" title="Remove this dimension">
        <img src="../img/trash-alt.svg" alt="Remove" style="width: 14px; height: 14px;">
      </button>
    `;
    
    lxhContainer.insertBefore(newPair, addBtn);
    updateRemoveButtons(container);
  }
  
  function updateRemoveButtons(container) {
    const pairs = container.querySelectorAll('.lxh-pair');
    pairs.forEach(pair => {
      const removeBtn = pair.querySelector('.remove-lxh-btn');
      if (removeBtn) {
        removeBtn.style.visibility = pairs.length > 1 ? 'visible' : 'hidden';
      }
    });
  }
  
  function calculateModalArea(container) {
    const toggle = container.querySelector('.toggle-switch input[type="checkbox"]');
    const subtotalSpan = container.querySelector('.measurement-subtotal span');
    if (!subtotalSpan) return;
    
    let totalArea = 0;
    
    if (toggle && toggle.checked) {
      // Total area mode
      const totalInput = container.querySelector('.total-area-input');      totalArea = parseFloat(totalInput?.value) || 0;
    } else {
      // Dimensions mode
      const pairs = container.querySelectorAll('.lxh-pair');
      pairs.forEach(pair => {
        const inputs = pair.querySelectorAll('.lxh-input');
        const length = parseFloat(inputs[0]?.value) || 0;
        const height = parseFloat(inputs[1]?.value) || 0;
        totalArea += length * height;
      });
    }
    
    subtotalSpan.textContent = totalArea.toFixed(2);
  }
  
  function handlePhotoUpload(event, container) {
    const files = event.target.files;
    let thumbnailsContainer = container.querySelector('.photo-thumbnails');
    
    // If thumbnails container doesn't exist, create it
    if (!thumbnailsContainer) {
      const photoSection = container.querySelector('.photo-upload-container');
      if (photoSection) {
        thumbnailsContainer = document.createElement('div');
        thumbnailsContainer.className = 'photo-thumbnails';
        photoSection.appendChild(thumbnailsContainer);
      } else {
        return;
      }    }
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'photo-thumbnail';
          thumbnail.style.cursor = 'pointer';
          thumbnail.innerHTML = `
            <img src="${e.target.result}" alt="Photo">
          `;
          
          // Store the data for click handler
          const photoData = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
            name: file.name || 'Photo',
            dataUrl: e.target.result
          };
          
          // Click to open editor
          thumbnail.addEventListener('click', () => {
            if (window.PhotoEditor) {
              const modalBlock = container.closest('.measurement-block');
              const measurementId = modalBlock?.dataset?.measurementId;
              const measurement = window.formState?.data?.surfaces?.flatMap(s => s.measurements)
                .find(m => m.id === measurementId);
              if (measurement) {
                window.PhotoEditor.open(photoData, measurement);
              }
            }
          });
          
          thumbnailsContainer.appendChild(thumbnail);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  }
    function saveModalSettings(modal, originalBlock, originalMeasurementId) {
    // Get all measurement blocks in the modal
    const modalMeasurementBlocks = modal.querySelectorAll('.measurement-block');
    
    if (modalMeasurementBlocks.length === 0) {
      return;
    }
    
    // Save the first measurement block to the original block (existing behavior)
    const firstModalBlock = modalMeasurementBlocks[0];
    saveIndividualMeasurementSettings(firstModalBlock, originalBlock);
    
    // If there are additional measurement blocks, we need to add them to the main page
    if (modalMeasurementBlocks.length > 1) {
      const originalSurfaceCard = originalBlock.closest('.surface-card');
      if (originalSurfaceCard) {
        const measurementContainer = originalSurfaceCard.querySelector('.measurement-container');
        if (measurementContainer) {
          for (let i = 1; i < modalMeasurementBlocks.length; i++) {
            const modalBlock = modalMeasurementBlocks[i];
            createNewMeasurementOnMainPage(modalBlock, originalSurfaceCard, measurementContainer);
          }
        }
      }
    }
    
    // Save to formState
    if (window.formState?.saveState) {
      window.formState.saveState();
      } else {
      }
    
    }
  
  function saveIndividualMeasurementSettings(modalBlock, originalBlock) {
    // Get values from modal block
    const modalDescription = modalBlock.querySelector('.measurement-description-input')?.value || '';
    const modalColor = modalBlock.querySelector('.measurement-color-input')?.value || '';
    const modalToggle = modalBlock.querySelector('.toggle-switch input[type="checkbox"]')?.checked || false;
    const modalLxhPairs = Array.from(modalBlock.querySelectorAll('.lxh-pair')).map(pair => {
      const inputs = pair.querySelectorAll('.lxh-input');
      return {
        length: inputs[0]?.value || '',
        height: inputs[1]?.value || ''
      };
    });
    
    // Get note and access level from the modal
    const modal = modalBlock.closest('.modal');
    // const noteText = modal?.querySelector('#surfaceNoteText')?.value || '';
    // const accessLevel = modal?.querySelector('#surfaceAccessLevel')?.value || '0';
    const modalTotalArea = modalBlock.querySelector('.total-area-input')?.value || '';
    
    // Get photos from the modal
    const modalPhotos = [];
    const photoThumbnails = modalBlock.querySelectorAll('.photo-thumbnail');
    photoThumbnails.forEach(thumbnail => {
      const img = thumbnail.querySelector('img');
      if (img && img.src) {
        modalPhotos.push({
          src: img.src,
          alt: img.alt || 'Photo'
        });
      }
    });
    
    // Note: Description field synchronization removed to prevent unwanted updates
    // to the main area description when modal detail field changes
    // Instead, save the modal description to a data attribute for persistence
    const savedModalDescription = modalBlock.getAttribute('data-modal-description') || modalDescription;
    if (savedModalDescription) {
      originalBlock.setAttribute('data-modal-description', savedModalDescription);
    }
    
    // Update color (even though it's hidden)
    const mainColorInput = originalBlock.querySelector('.measurement-color-input');
    if (mainColorInput) {
      mainColorInput.value = modalColor;
    }
    
    // Update toggle
    const mainToggle = originalBlock.querySelector('.toggle-switch input[type="checkbox"]');
    if (mainToggle && mainToggle.checked !== modalToggle) {
      mainToggle.checked = modalToggle;
      mainToggle.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Update dimensions if not in total mode
    if (!modalToggle) {
      // Clear existing pairs
      const mainLxhContainer = originalBlock.querySelector('.lxh-inputs-container');
      const existingPairs = mainLxhContainer.querySelectorAll('.lxh-pair');
      existingPairs.forEach(pair => pair.remove());
      
      // Add new pairs
      modalLxhPairs.forEach((pairData, index) => {
        // Click add button to create new pair
        const addBtn = mainLxhContainer.querySelector('.add-lxh-btn');
        if (index > 0 && addBtn) {
          addBtn.click();
        }
        
        // Set values
        setTimeout(() => {
          const pairs = mainLxhContainer.querySelectorAll('.lxh-pair');
          const pair = pairs[index];
          if (pair) {
            const inputs = pair.querySelectorAll('.lxh-input');
            if (inputs[0]) inputs[0].value = pairData.length;
            if (inputs[1]) inputs[1].value = pairData.height;
            
            // Trigger input events
            inputs.forEach(input => {
              input.dispatchEvent(new Event('input', { bubbles: true }));
            });
          }
        }, 50 * index);
      });
    } else {
      // Update total area
      const mainTotalInput = originalBlock.querySelector('.total-area-input');
      if (mainTotalInput) {
        mainTotalInput.value = modalTotalArea;
        mainTotalInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    // Save note, access level, and photos data
    const savedMeasurementId = originalBlock.dataset.measurementId || originalBlock.id;
    if (savedMeasurementId) {
      // Note: Surface notes and access controls have been removed
      // originalBlock.dataset.surfaceNote = noteText;
      // originalBlock.dataset.surfaceAccessLevel = accessLevel;
      
      // Store photos in the original block
      const originalPhotosContainer = originalBlock.querySelector('.photo-thumbnails');
      if (originalPhotosContainer) {
        // Clear existing photos
        originalPhotosContainer.innerHTML = '';
        
        // Ensure the container is visible if there are photos
        if (modalPhotos.length > 0) {
          originalPhotosContainer.style.display = 'grid';
        }
        
        // Add saved photos
        modalPhotos.forEach(photo => {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'photo-thumbnail';
          thumbnail.style.cursor = 'pointer';
          thumbnail.innerHTML = `
            <img src="${photo.src}" alt="${photo.alt}">
          `;
          
          // Click to open editor
          thumbnail.addEventListener('click', () => {
            if (window.PhotoEditor) {
              window.PhotoEditor.open(photo, window.formState?.data?.surfaces?.flatMap(s => s.measurements)
                .find(m => m.id === savedMeasurementId));
            }
          });
          
          originalPhotosContainer.appendChild(thumbnail);
        });
      }
      
      // Also store in formState if available
      if (window.formState?.data) {
        // Note: Surface notes and access controls have been removed
        // if (!window.formState.data.surfaceNotes) {
        //   window.formState.data.surfaceNotes = {};
        // }
        // window.formState.data.surfaceNotes[savedMeasurementId] = {
        //   note: noteText,
        //   accessLevel: parseInt(accessLevel),
        //   photos: modalPhotos
        // };
        
        // Store only photos if needed
        if (!window.formState.data.surfacePhotos) {
          window.formState.data.surfacePhotos = {};
        }
        window.formState.data.surfacePhotos[savedMeasurementId] = {
          photos: modalPhotos
        };
      }
      
      }
  }
  
  function createNewMeasurementOnMainPage(modalBlock, surfaceCard, measurementContainer) {
    // Find the "Add Measurement Area" button on the main page
    const addMeasurementBtn = surfaceCard.querySelector('.add-measurement-btn');
    if (addMeasurementBtn) {
      // Click the button to create a new measurement area
      addMeasurementBtn.click();
      
      // Wait a moment for the new measurement to be created, then update it
      setTimeout(() => {
        const allMeasurements = measurementContainer.querySelectorAll('.measurement-block');
        const newMeasurement = allMeasurements[allMeasurements.length - 1]; // Get the last (newest) measurement
        
        if (newMeasurement) {
          // Update the new measurement with values from the modal
          saveIndividualMeasurementSettings(modalBlock, newMeasurement);
          }
      }, 100);
    }
  }
  
  function setupColorInput(container) {
    const colorInput = container.querySelector('.measurement-color-input');
    const dropdown = container.querySelector('.color-suggestions-dropdown');    
    if (!colorInput || !dropdown) return;
    
    // Show/hide dropdown on focus/blur
    colorInput.addEventListener('focus', () => {
      dropdown.style.display = 'block';
    });
    
    colorInput.addEventListener('blur', (e) => {
      // Delay to allow clicking on dropdown items
      setTimeout(() => {
        if (!dropdown.contains(document.activeElement)) {
          dropdown.style.display = 'none';
        }
      }, 200);
    });
    
    // If there are color suggestions available, populate them
    if (window.colorSuggestions && window.colorSuggestions.length > 0) {
      dropdown.innerHTML = window.colorSuggestions.map(color => `
        <div class="color-suggestion-item" style="padding: 0.5rem 0.75rem; cursor: pointer; hover:background-color: #f3f4f6;">
          ${color}
        </div>
      `).join('');
      
      // Add click handlers to suggestions
      dropdown.querySelectorAll('.color-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          colorInput.value = item.textContent.trim();
          dropdown.style.display = 'none';          colorInput.focus();
        });
      });
    }
  }
  
  function addNewMeasurementArea(modal, originalBlock) {
    const measurementContainer = modal.querySelector('.modal-measurement-container');
    if (!measurementContainer) {
      return;
    }
    
    // Clone the original measurement block
    const newBlock = originalBlock.cloneNode(true);
    
    // Generate unique ID for the new block
    const newId = 'modal-area-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    newBlock.dataset.measurementId = newId;
    
    // Update all IDs to prevent conflicts
    newBlock.querySelectorAll('[id]').forEach(el => {
      el.id = newId + '-' + el.id.split('-').pop();
    });
    
    // Update all for attributes
    newBlock.querySelectorAll('[for]').forEach(el => {
      el.setAttribute('for', newId + '-' + el.getAttribute('for').split('-').pop());
    });
    
    // Clear input values
    newBlock.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
      input.value = '';
    });
    
    // Update description input placeholder to "Detail"
    const descriptionInput = newBlock.querySelector('.measurement-description-input');
    if (descriptionInput) {
      descriptionInput.placeholder = 'Detail (e.g., Main Wall)';
      
      // Remove any cloned event listeners by replacing with a clean input
      const newDescriptionInput = descriptionInput.cloneNode(false);
      newDescriptionInput.placeholder = 'Detail (e.g., Main Wall)';
      newDescriptionInput.className = descriptionInput.className;
      newDescriptionInput.value = '';
      
      // Add event listener to save modal-specific data
      newDescriptionInput.addEventListener('input', function() {
        newBlock.setAttribute('data-modal-description', newDescriptionInput.value);
      });
      
      descriptionInput.parentNode.replaceChild(newDescriptionInput, descriptionInput);
    }
    
    // Reset toggle to dimensions mode
    const toggle = newBlock.querySelector('.toggle-switch input[type="checkbox"]');
    if (toggle) {
      toggle.checked = false;
    }
    
    // Clear photos
    const photoThumbnails = newBlock.querySelector('.photo-thumbnails');
    if (photoThumbnails) {
      photoThumbnails.innerHTML = '';
    }
    
    // Remove the waffle icon from the new block
    const waffleIcon = newBlock.querySelector('.area-settings-icon');
    if (waffleIcon) {
      waffleIcon.remove();
    }
    
    // Show the color input container
    const colorContainer = newBlock.querySelector('.measurement-color-input-container');
    if (colorContainer) {
      colorContainer.style.display = 'block';
      
      // Remove any existing title container since we're using the description field
      const existingTitle = colorContainer.querySelector('.measurement-title-container');
      if (existingTitle) {
        existingTitle.remove();
      }
    }
    
    // Ensure total area input exists
    let totalInputContainer = newBlock.querySelector('.total-input-container');
    if (!totalInputContainer) {
      const measurementDetails = newBlock.querySelector('.measurement-details');
      if (measurementDetails) {
        totalInputContainer = document.createElement('div');
        totalInputContainer.className = 'total-input-container';
        totalInputContainer.style.display = 'none';
        
        const totalAreaInput = document.createElement('input');
        totalAreaInput.type = 'number';
        totalAreaInput.className = 'total-area-input measurement-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500';
        totalAreaInput.placeholder = 'Enter total square feet';
        totalAreaInput.step = '0.01';
        totalAreaInput.autocomplete = 'off';
        
        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700 mb-1';
        label.textContent = 'Total Area (Sq Ft)';
        
        totalInputContainer.appendChild(label);
        totalInputContainer.appendChild(totalAreaInput);
        measurementDetails.appendChild(totalInputContainer);
      }
    }
    
    // Add remove button for the new measurement area
    const measurementHeader = newBlock.querySelector('.measurement-header');
    if (measurementHeader) {
      // Check if there's already a remove button
      let removeBtn = measurementHeader.querySelector('.measurement-remove-btn');
      
      if (!removeBtn) {
        // Create new remove button if none exists
        removeBtn = document.createElement('button');
        removeBtn.className = 'measurement-remove-btn';
        removeBtn.innerHTML = '<img src="../img/trash-alt.svg" alt="Remove">';
        removeBtn.title = 'Remove this measurement area';
        measurementHeader.appendChild(removeBtn);
      }
      
      // Ensure the remove button has the correct click handler
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        newBlock.remove();
        updateRemoveButtonsVisibility(modal);
      });
    }
    
    // Add the new block to the container
    measurementContainer.appendChild(newBlock);
    
    // Add note and camera icons to the new measurement block
    addMeasurementIcons(newBlock, null); // null since it's a new measurement with no original
    
    // Set up event listeners for the new block
    setupMeasurementBlockEventListeners(newBlock, modal);
    
    // Update remove button visibility
    updateRemoveButtonsVisibility(modal);
    
    }
  
  function setupMeasurementBlockEventListeners(block, modal) {
    // Toggle functionality
    const toggle = block.querySelector('.toggle-switch input[type="checkbox"]');
    const lxhContainer = block.querySelector('.lxh-inputs-container');
    const totalContainer = block.querySelector('.total-input-container');
    const leftLabel = block.querySelector('.toggle-label-left');
    const rightLabel = block.querySelector('.toggle-label-right');
    
    if (toggle) {
      toggle.addEventListener('change', function() {
        if (this.checked) {
          lxhContainer.style.display = 'none';
          lxhContainer.style.visibility = 'hidden';
          lxhContainer.style.position = 'absolute';
          lxhContainer.style.opacity = '0';
          totalContainer.style.display = 'block';
          totalContainer.style.visibility = 'visible';
          totalContainer.style.position = 'relative';
          totalContainer.style.opacity = '1';
          leftLabel.classList.remove('active');
          rightLabel.classList.add('active');
        } else {
          lxhContainer.style.display = 'block';
          lxhContainer.style.visibility = 'visible';
          lxhContainer.style.position = 'relative';
          lxhContainer.style.opacity = '1';
          totalContainer.style.display = 'none';
          totalContainer.style.visibility = 'hidden';
          totalContainer.style.position = 'absolute';
          totalContainer.style.opacity = '0';
          leftLabel.classList.add('active');
          rightLabel.classList.remove('active');
        }
        calculateModalArea(block);
      });
    }
    
    // Add L x H pair functionality
    const addLxhBtn = block.querySelector('.add-lxh-btn');
    if (addLxhBtn) {
      addLxhBtn.addEventListener('click', function() {
        addLxhPair(block);
      });
    }
    
    // Remove L x H pair functionality
    block.addEventListener('click', function(e) {
      if (e.target.closest('.remove-lxh-btn')) {
        const pair = e.target.closest('.lxh-pair');
        if (pair) {
          pair.remove();
          updateRemoveButtons(block);
          calculateModalArea(block);
        }
      }
    });
    
    // Calculate area on input
    block.addEventListener('input', function(e) {
      if (e.target.matches('.lxh-input, .total-area-input')) {
        calculateModalArea(block);
      }
    });
    
    // Photo upload functionality
    const photoInput = block.querySelector('input[type="file"]');
    if (photoInput) {
      photoInput.addEventListener('change', function(e) {
        handlePhotoUpload(e, block);
      });
    }
    
    // Color input functionality
    setupColorInput(block);
  }
  
  function updateRemoveButtonsVisibility(modal) {
    const measurementBlocks = modal.querySelectorAll('.measurement-block');
    measurementBlocks.forEach(block => {
      const removeBtn = block.querySelector('.measurement-remove-btn');
      if (removeBtn) {
        removeBtn.style.display = measurementBlocks.length > 1 ? 'inline-block' : 'none';
      }
    });
  }
  
  // Test function exposure
  if (typeof window.openAreaSettingsModal === 'function') {
    } else {
    }
  
  // Ensure formState is loaded
  if (typeof window.formState !== 'undefined' && window.formState.loadState) {
    } else {
    }
})();