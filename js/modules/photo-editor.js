// Photo Editor Module - Modern Professional Design
// This module has been replaced with the mobile-optimized version
// Please use photo-editor-mobile.js instead
console.warn('photo-editor.js is deprecated. Please use photo-editor-mobile.js');

// Import the mobile-optimized version
if (typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'js/modules/photo-editor-mobile.js';
  document.head.appendChild(script);
}
    
    // Initialize the photo editor
    init() {
      this.createModal();
      this.setupEventListeners();
    },
    
    // Create the modal structure with modern design
    createModal() {
      const modal = document.createElement('div');
      modal.id = 'photo-editor-modal';
      modal.className = 'photo-editor-modal';
      modal.style.display = 'none';
      
      modal.innerHTML = `
        <div class="photo-editor-container">
          <div class="photo-editor-header">
            <input type="text" class="photo-name-input" placeholder="Photo name">
            
            <!-- Tools button -->
            <button class="header-btn tools-btn" title="Drawing tools">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              <div class="tools-dropdown">
                <button class="tool-item active" data-tool="rectangle">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="16" height="16"/>
                  </svg>
                  <span>Rectangle</span>
                </button>
                <button class="tool-item" data-tool="circle">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="10" cy="10" r="8"/>
                  </svg>
                  <span>Circle</span>
                </button>
                <button class="tool-item" data-tool="text">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <text x="10" y="14" text-anchor="middle" font-size="16">T</text>
                  </svg>
                  <span>Text</span>
                </button>
                <button class="tool-item" data-tool="clear">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3l14 14M17 3L3 17"/>
                  </svg>
                  <span>Clear All</span>
                </button>
              </div>
            </button>
            
            <!-- Color picker button -->
            <button class="header-btn color-btn" title="Color picker">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" class="color-indicator"/>
              </svg>
              <div class="color-dropdown">
                <div class="color-grid">
                  <div class="color-swatch active" data-color="#FF0000" style="background: #FF0000"></div>
                  <div class="color-swatch" data-color="#FF6B6B" style="background: #FF6B6B"></div>
                  <div class="color-swatch" data-color="#4ECDC4" style="background: #4ECDC4"></div>
                  <div class="color-swatch" data-color="#45B7D1" style="background: #45B7D1"></div>
                  <div class="color-swatch" data-color="#96CEB4" style="background: #96CEB4"></div>
                  <div class="color-swatch" data-color="#FECA57" style="background: #FECA57"></div>
                  <div class="color-swatch" data-color="#FF9FF3" style="background: #FF9FF3"></div>
                  <div class="color-swatch" data-color="#A29BFE" style="background: #A29BFE"></div>
                  <div class="color-swatch" data-color="#FD79A8" style="background: #FD79A8"></div>
                  <div class="color-swatch" data-color="#00B894" style="background: #00B894"></div>
                  <div class="color-swatch" data-color="#6C5CE7" style="background: #6C5CE7"></div>
                  <div class="color-swatch" data-color="#0984E3" style="background: #0984E3"></div>
                  <div class="color-swatch" data-color="#000000" style="background: #000000"></div>
                  <div class="color-swatch" data-color="#2D3436" style="background: #2D3436"></div>
                  <div class="color-swatch" data-color="#636E72" style="background: #636E72"></div>
                  <div class="color-swatch" data-color="#B2BEC3" style="background: #B2BEC3"></div>
                  <div class="color-swatch" data-color="#DFE6E9" style="background: #DFE6E9"></div>
                  <div class="color-swatch" data-color="#FFFFFF" style="background: #FFFFFF; border: 1px solid #ddd"></div>
                </div>
                <input type="color" class="custom-color-input" value="#FF0000">
              </div>
            </button>
            
            <!-- Save button -->
            <button class="header-btn save-btn" title="Save changes">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
            </button>
            
            <!-- Delete button -->
            <button class="header-btn photo-delete-btn" title="Delete photo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
            
            <!-- Close button -->
            <button class="header-btn close-btn" title="Close editor">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="photo-editor-canvas-container">
            <canvas id="photo-editor-canvas"></canvas>
            <div class="text-overlay-container"></div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    },
    
    // Set up event listeners
    setupEventListeners() {
      const modal = document.getElementById('photo-editor-modal');
      
      // Close button
      modal.querySelector('.close-btn').addEventListener('click', () => {
        this.close();
      });
      
      // Delete button
      modal.querySelector('.photo-delete-btn').addEventListener('click', () => {
        this.deletePhoto();
      });
      
      // Save button
      modal.querySelector('.save-btn').addEventListener('click', () => {
        this.savePhoto();
      });
      
      // Tools dropdown
      const toolsBtn = modal.querySelector('.tools-btn');
      const toolsDropdown = modal.querySelector('.tools-dropdown');
      
      toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toolsDropdown.classList.toggle('show');
        // Close color dropdown
        modal.querySelector('.color-dropdown').classList.remove('show');
      });
      
      // Tool selection
      modal.querySelectorAll('.tool-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          
          if (btn.dataset.tool === 'clear') {
            this.clearAnnotations();
          } else {
            this.selectTool(btn.dataset.tool);
          }
          
          toolsDropdown.classList.remove('show');
        });
      });
      
      // Color dropdown
      const colorBtn = modal.querySelector('.color-btn');
      const colorDropdown = modal.querySelector('.color-dropdown');
      
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        colorDropdown.classList.toggle('show');
        // Close tools dropdown
        toolsDropdown.classList.remove('show');
      });
      
      // Color selection
      modal.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectColor(swatch.dataset.color);
        });
      });
      
      // Custom color picker
      const customColorInput = modal.querySelector('.custom-color-input');
      customColorInput.addEventListener('change', (e) => {
        this.selectColor(e.target.value);
      });
      
      // Click outside dropdowns to close
      document.addEventListener('click', () => {
        toolsDropdown.classList.remove('show');
        colorDropdown.classList.remove('show');
      });
      
      // Click outside modal to close
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    },
    
    // Select a color
    selectColor(color) {
      this.currentColor = color;
      
      // Update color indicator
      const colorIndicator = document.querySelector('.color-indicator');
      colorIndicator.style.fill = color;
      
      // Update active swatch
      document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('active');
        if (swatch.dataset.color === color) {
          swatch.classList.add('active');
        }
      });
      
      // Update custom color input
      document.querySelector('.custom-color-input').value = color;
    },
    
    // Open the photo editor
    open(photo, measurement) {
      this.currentPhoto = photo;
      this.currentMeasurement = measurement;
      
      const modal = document.getElementById('photo-editor-modal');
      const nameInput = modal.querySelector('.photo-name-input');
      const canvas = document.getElementById('photo-editor-canvas');
      const canvasContainer = modal.querySelector('.photo-editor-canvas-container');
      
      // Set photo name
      nameInput.value = photo.name || '';
      
      // Load image onto canvas
      const img = new Image();
      img.onload = () => {
        // Get container dimensions
        const containerRect = canvasContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Calculate scale to fit image in container
        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height,
          1 // Don't scale up
        );
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Draw the image
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Set up canvas events
        this.setupCanvasEvents();
        
        // Load existing annotations if any
        if (photo.annotations) {
          this.loadAnnotations(photo.annotations);
        }
      };
      img.src = photo.dataUrl;
      
      // Show modal
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Set initial color
      this.selectColor(this.currentColor);
    },    
    // Set up canvas drawing events
    setupCanvasEvents() {
      let startX, startY;
      let currentShape = null;
      
      this.canvas.addEventListener('mousedown', (e) => {
        if (this.currentTool === 'text') {
          this.addText(e);
          return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        this.isDrawing = true;
        
        currentShape = {
          type: this.currentTool,
          startX: startX,
          startY: startY,
          endX: startX,
          endY: startY,
          color: this.currentColor
        };
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.isDrawing || !currentShape) return;
        
        const rect = this.canvas.getBoundingClientRect();
        currentShape.endX = e.clientX - rect.left;
        currentShape.endY = e.clientY - rect.top;
        
        this.redrawCanvas();
        this.drawShape(currentShape);
      });
      
      this.canvas.addEventListener('mouseup', () => {
        if (this.isDrawing && currentShape) {
          this.shapes.push(currentShape);
          this.isDrawing = false;
          currentShape = null;
        }
      });
      
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
      });
      
      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
      });
      
      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.canvas.dispatchEvent(mouseEvent);
      });
    },
    
    // Draw a shape on the canvas
    drawShape(shape) {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = 3;
      
      if (shape.type === 'rectangle') {
        const width = shape.endX - shape.startX;
        const height = shape.endY - shape.startY;
        this.ctx.strokeRect(shape.startX, shape.startY, width, height);
      } else if (shape.type === 'circle') {
        const radius = Math.sqrt(
          Math.pow(shape.endX - shape.startX, 2) + 
          Math.pow(shape.endY - shape.startY, 2)
        );
        this.ctx.beginPath();
        this.ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
    },
    
    // Redraw the canvas with all shapes
    redrawCanvas() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Redraw the original image
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all shapes
        this.shapes.forEach(shape => {
          this.drawShape(shape);
        });
      };
      img.src = this.currentPhoto.dataUrl;
    },
    
    // Add text at clicked position
    addText(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const textContainer = document.querySelector('.text-overlay-container');
      
      const textElement = document.createElement('div');
      textElement.className = 'photo-text-annotation';
      textElement.contentEditable = true;
      textElement.style.position = 'absolute';
      textElement.style.left = x + 'px';
      textElement.style.top = y + 'px';
      textElement.style.color = this.currentColor;
      textElement.style.outline = `2px solid ${this.currentColor}`;
      textElement.textContent = 'Text';
      
      // Make draggable
      let isDragging = false;
      let dragOffsetX, dragOffsetY;
      
      textElement.addEventListener('mousedown', (e) => {
        if (e.target === textElement && !textElement.isContentEditable) {
          isDragging = true;
          dragOffsetX = e.clientX - textElement.offsetLeft;
          dragOffsetY = e.clientY - textElement.offsetTop;
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          textElement.style.left = (e.clientX - dragOffsetX) + 'px';
          textElement.style.top = (e.clientY - dragOffsetY) + 'px';
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      // Focus and select text
      textContainer.appendChild(textElement);
      textElement.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textElement);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Remove if empty when blurred
      textElement.addEventListener('blur', () => {
        if (textElement.textContent.trim() === '') {
          textElement.remove();
        }
      });
      
      this.textElements.push({
        element: textElement,
        x: x,
        y: y,
        text: textElement.textContent,
        color: this.currentColor
      });
    },
    
    // Select a tool
    selectTool(tool) {
      this.currentTool = tool;
      
      // Update active state
      document.querySelectorAll('.tool-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === tool) {
          btn.classList.add('active');
        }
      });
      
      // Update cursor
      if (tool === 'text') {
        this.canvas.style.cursor = 'text';
      } else {
        this.canvas.style.cursor = 'crosshair';
      }
    },
    
    // Clear all annotations
    clearAnnotations() {
      if (confirm('Clear all annotations? This cannot be undone.')) {
        this.shapes = [];
        this.textElements.forEach(item => item.element.remove());
        this.textElements = [];
        this.redrawCanvas();
      }
    },
    
    // Save the edited photo
    savePhoto() {
      // Update photo name
      const nameInput = document.querySelector('.photo-name-input');
      this.currentPhoto.name = nameInput.value || 'Untitled Photo';
      
      // Render text annotations onto canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Copy current canvas
      tempCtx.drawImage(this.canvas, 0, 0);
      
      // Draw text annotations
      this.textElements.forEach(item => {
        if (item.element.textContent.trim()) {
          tempCtx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
          tempCtx.fillStyle = item.element.style.color;
          tempCtx.fillText(
            item.element.textContent,
            parseInt(item.element.style.left),
            parseInt(item.element.style.top) + 16
          );
        }
      });
      
      // Save edited image
      this.currentPhoto.dataUrl = tempCanvas.toDataURL('image/png');
      
      // Save annotations data
      this.currentPhoto.annotations = {
        shapes: this.shapes,
        texts: this.textElements.map(item => ({
          x: parseInt(item.element.style.left),
          y: parseInt(item.element.style.top),
          text: item.element.textContent,
          color: item.element.style.color
        }))
      };
      
      // Update the thumbnail
      const thumbnails = document.querySelectorAll('.photo-thumbnail img');
      thumbnails.forEach(img => {
        if (img.alt === this.currentPhoto.name) {
          img.src = this.currentPhoto.dataUrl;
        }
      });
      
      // Save to formState
      if (window.formState) {
        window.formState.saveState();
      }
      
      // Close editor
      this.close();
      
      // Show success message
      this.showToast('Photo saved successfully');
    },
    
    // Delete the photo
    deletePhoto() {
      const photoName = this.currentPhoto.name || 'this photo';
      
      if (confirm(`Delete "${photoName}"?`)) {
        // Remove from measurement
        this.currentMeasurement.photos = this.currentMeasurement.photos.filter(
          p => p.id !== this.currentPhoto.id
        );
        
        // Remove thumbnail
        const thumbnails = document.querySelectorAll('.photo-thumbnail');
        thumbnails.forEach(thumb => {
          const img = thumb.querySelector('img');
          if (img && img.src === this.currentPhoto.dataUrl) {
            thumb.remove();
          }
        });
        
        // Update icons and save
        if (window.updateMeasurementIcons) {
          window.updateMeasurementIcons(this.currentMeasurement.id);
        }
        
        if (window.formState) {
          window.formState.saveState();
        }
        
        // Close editor
        this.close();
        
        this.showToast('Photo deleted');
      }
    },
    
    // Load existing annotations
    loadAnnotations(annotations) {
      if (annotations.shapes) {
        this.shapes = annotations.shapes;
        this.shapes.forEach(shape => this.drawShape(shape));
      }
      
      if (annotations.texts) {
        const textContainer = document.querySelector('.text-overlay-container');
        annotations.texts.forEach(textData => {
          const textElement = document.createElement('div');
          textElement.className = 'photo-text-annotation';
          textElement.style.position = 'absolute';
          textElement.style.left = textData.x + 'px';
          textElement.style.top = textData.y + 'px';
          textElement.style.color = textData.color;
          textElement.textContent = textData.text;
          
          textContainer.appendChild(textElement);
          this.textElements.push({
            element: textElement,
            x: textData.x,
            y: textData.y,
            text: textData.text,
            color: textData.color
          });
        });
      }
    },
    
    // Close the editor
    close() {
      const modal = document.getElementById('photo-editor-modal');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Clear state
      this.shapes = [];
      this.textElements.forEach(item => item.element.remove());
      this.textElements = [];
      this.currentPhoto = null;
      this.currentMeasurement = null;
      
      // Clear text overlay container
      const textContainer = document.querySelector('.text-overlay-container');
      if (textContainer) {
        textContainer.innerHTML = '';
      }
      
      // Close any open dropdowns
      document.querySelectorAll('.tools-dropdown, .color-dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    },
    
    // Show a toast message
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'photo-editor-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.PhotoEditor.init();
    });
  } else {
    window.PhotoEditor.init();
  }
})();