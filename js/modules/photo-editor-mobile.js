// Photo Editor Module - Mobile-Optimized Professional Design
(function() {
  'use strict';
  
  window.PhotoEditor = {
    currentPhoto: null,
    currentMeasurement: null,
    
    // Canvas layers for performance
    backgroundCanvas: null,
    drawingCanvas: null,
    tempCanvas: null,
    
    // Contexts
    bgCtx: null,
    drawCtx: null,
    tempCtx: null,
    
    // Touch/Drawing state
    isDrawing: false,
    currentTool: 'rectangle',
    currentColor: '#FF0000',
    currentLineWidth: 3,
    
    // Annotations
    textElements: [],
    shapes: [],
    currentPath: [],
    
    // Gesture handling
    pinchStartDistance: 0,
    currentScale: 1,
    currentTranslateX: 0,
    currentTranslateY: 0,
    
    // Touch handling
    lastTouchPoint: null,
    isTouchDevice: false,
    
    // Initialize the photo editor
    init() {
      this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.createModal();
      this.setupEventListeners();
      this.initializeToolPresets();
    },
    
    // Initialize tool presets
    initializeToolPresets() {
      this.toolPresets = {
        rectangle: { lineWidth: 3, lineDash: [] },
        circle: { lineWidth: 3, lineDash: [] },
        arrow: { lineWidth: 3, lineDash: [] },
        freehand: { lineWidth: 2, lineDash: [] },
        highlight: { lineWidth: 20, opacity: 0.3 },
        text: { fontSize: 16, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }
      };
    },    
    // Create the modal structure with mobile-optimized design
    createModal() {
      const modal = document.createElement('div');
      modal.id = 'photo-editor-modal';
      modal.className = 'photo-editor-modal';
      modal.style.display = 'none';
      
      const isMobile = window.innerWidth <= 768;
      
      modal.innerHTML = `
        <div class="photo-editor-container ${isMobile ? 'mobile' : 'desktop'}">
          <!-- Header for desktop, simplified for mobile -->
          <div class="photo-editor-header">
            <input type="text" class="photo-name-input" placeholder="Photo name">
            <button class="header-btn save-btn" title="Save changes">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
            </button>
            <button class="header-btn close-btn" title="Close editor">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Canvas container with gesture support -->
          <div class="photo-editor-canvas-container" id="canvas-container">
            <canvas id="photo-background-canvas"></canvas>
            <canvas id="photo-drawing-canvas"></canvas>
            <canvas id="photo-temp-canvas"></canvas>
            <div class="text-overlay-container"></div>
          </div>          
          <!-- Mobile-optimized bottom toolbar -->
          <div class="photo-editor-toolbar ${isMobile ? 'bottom' : 'side'}">
            <!-- Primary tools -->
            <div class="toolbar-section primary-tools">
              <button class="tool-btn active" data-tool="rectangle" title="Rectangle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="4" width="16" height="16"/>
                </svg>
              </button>
              <button class="tool-btn" data-tool="circle" title="Circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="8"/>
                </svg>
              </button>
              <button class="tool-btn" data-tool="arrow" title="Arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 19L19 5M19 5h-8M19 5v8"/>
                </svg>
              </button>
              <button class="tool-btn" data-tool="freehand" title="Freehand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="tool-btn" data-tool="text" title="Text">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4v3h14V4H5zm0 10h14v-3H5v3zm0 7h14v-3H5v3z"/>
                </svg>
              </button>
            </div>            
            <!-- Color picker section -->
            <div class="toolbar-section color-section">
              <button class="color-trigger" id="color-trigger">
                <span class="current-color-preview"></span>
              </button>
              <div class="quick-colors">
                <button class="color-quick" data-color="#FF0000" style="background: #FF0000"></button>
                <button class="color-quick" data-color="#00FF00" style="background: #00FF00"></button>
                <button class="color-quick" data-color="#0000FF" style="background: #0000FF"></button>
                <button class="color-quick" data-color="#FFFF00" style="background: #FFFF00"></button>
                <button class="color-quick" data-color="#000000" style="background: #000000"></button>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="toolbar-section action-tools">
              <button class="tool-btn" data-action="undo" title="Undo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </svg>
              </button>
              <button class="tool-btn" data-action="clear" title="Clear all">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
              <button class="tool-btn" data-action="delete" title="Delete photo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>          
          <!-- Advanced color picker (hidden by default) -->
          <div class="color-picker-panel" id="color-picker-panel">
            <div class="color-picker-header">
              <span>Choose Color</span>
              <button class="color-picker-close">&times;</button>
            </div>
            <div class="color-picker-content">
              <div class="color-presets">
                ${this.generateColorPresets()}
              </div>
              <div class="color-controls">
                <input type="color" class="color-input" id="custom-color" value="#FF0000">
                <input type="range" class="brush-size-slider" id="brush-size" min="1" max="50" value="3">
                <span class="brush-size-label">3px</span>
              </div>
            </div>
          </div>
          
          <!-- Loading indicator -->
          <div class="photo-editor-loading" id="loading-indicator">
            <div class="spinner"></div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    },
    
    // Generate color presets HTML
    generateColorPresets() {
      const colors = [
        '#FF0000', '#FF6B6B', '#4ECDC4', '#45B7D1',
        '#96CEB4', '#FECA57', '#FF9FF3', '#A29BFE',
        '#FD79A8', '#00B894', '#6C5CE7', '#0984E3',
        '#000000', '#2D3436', '#636E72', '#B2BEC3',
        '#DFE6E9', '#FFFFFF'
      ];
      
      return colors.map(color => 
        `<button class="color-preset" data-color="${color}" style="background: ${color}"></button>`
      ).join('');
    },    
    // Set up all event listeners
    setupEventListeners() {
      const modal = document.getElementById('photo-editor-modal');
      
      // Basic modal controls
      this.setupModalControls(modal);
      
      // Tool selection
      this.setupToolSelection(modal);
      
      // Color picker
      this.setupColorPicker(modal);
      
      // Canvas events (unified touch/mouse)
      this.setupCanvasEvents();
      
      // Gesture support
      this.setupGestureSupport();
      
      // Orientation change handling
      window.addEventListener('orientationchange', () => {
        this.handleOrientationChange();
      });
      
      // Keyboard shortcuts
      if (!this.isTouchDevice) {
        this.setupKeyboardShortcuts();
      }
    },
    
    // Setup modal controls
    setupModalControls(modal) {
      // Close button
      modal.querySelector('.close-btn').addEventListener('click', () => {
        this.close();
      });
      
      // Save button
      modal.querySelector('.save-btn').addEventListener('click', () => {
        this.savePhoto();
      });
      
      // Click outside to close
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    },    
    // Setup tool selection
    setupToolSelection(modal) {
      const toolButtons = modal.querySelectorAll('.tool-btn');
      
      toolButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          const tool = btn.dataset.tool;
          const action = btn.dataset.action;
          
          if (tool) {
            this.selectTool(tool);
            // Update active state
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          } else if (action) {
            this.handleAction(action);
          }
        });
      });
    },
    
    // Setup color picker
    setupColorPicker(modal) {
      const colorTrigger = modal.querySelector('#color-trigger');
      const colorPanel = modal.querySelector('#color-picker-panel');
      const colorPreview = modal.querySelector('.current-color-preview');
      
      // Set initial color
      colorPreview.style.background = this.currentColor;
      
      // Quick colors
      modal.querySelectorAll('.color-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.selectColor(btn.dataset.color);
        });
      });
      
      // Color trigger opens panel
      colorTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        colorPanel.classList.add('show');
      });
      
      // Close color panel
      modal.querySelector('.color-picker-close').addEventListener('click', () => {
        colorPanel.classList.remove('show');
      });
    },    
    // Unified event point extraction
    getEventPoint(e, element) {
      const rect = element.getBoundingClientRect();
      let clientX, clientY;
      
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Apply canvas transformation
      const x = (clientX - rect.left - this.currentTranslateX) / this.currentScale;
      const y = (clientY - rect.top - this.currentTranslateY) / this.currentScale;
      
      return { x, y, clientX, clientY };
    },
    
    // Setup unified canvas events
    setupCanvasEvents() {
      const drawingCanvas = document.getElementById('photo-drawing-canvas');
      const container = document.getElementById('canvas-container');
      
      // Prevent default touch behaviors
      drawingCanvas.style.touchAction = 'none';
      container.style.touchAction = 'none';      
      // Start drawing
      const handleStart = (e) => {
        e.preventDefault();
        
        if (this.currentTool === 'text') {
          this.addText(e);
          return;
        }
        
        const point = this.getEventPoint(e, drawingCanvas);
        this.startDrawing(point.x, point.y);
      };
      
      // Continue drawing
      const handleMove = (e) => {
        e.preventDefault();
        
        if (!this.isDrawing) return;
        
        const point = this.getEventPoint(e, drawingCanvas);
        this.continueDrawing(point.x, point.y);
      };
      
      // End drawing
      const handleEnd = (e) => {
        e.preventDefault();
        
        if (!this.isDrawing) return;
        
        const point = this.getEventPoint(e, drawingCanvas);
        this.endDrawing(point.x, point.y);
      };      
      // Mouse events
      drawingCanvas.addEventListener('mousedown', handleStart);
      drawingCanvas.addEventListener('mousemove', handleMove);
      drawingCanvas.addEventListener('mouseup', handleEnd);
      drawingCanvas.addEventListener('mouseleave', handleEnd);
      
      // Touch events with passive: false for prevention
      drawingCanvas.addEventListener('touchstart', handleStart, { passive: false });
      drawingCanvas.addEventListener('touchmove', handleMove, { passive: false });
      drawingCanvas.addEventListener('touchend', handleEnd, { passive: false });
      drawingCanvas.addEventListener('touchcancel', handleEnd, { passive: false });
    },
    
    // Setup gesture support (pinch zoom, pan)
    setupGestureSupport() {
      const container = document.getElementById('canvas-container');
      let isPinching = false;
      let lastDistance = 0;
      
      container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          isPinching = true;
          lastDistance = this.getDistance(e.touches[0], e.touches[1]);
          e.preventDefault();
        }
      }, { passive: false });
      
      container.addEventListener('touchmove', (e) => {
        if (isPinching && e.touches.length === 2) {
          const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / lastDistance;
          
          this.currentScale = Math.max(0.5, Math.min(3, this.currentScale * scale));
          this.updateCanvasTransform();
          
          lastDistance = currentDistance;
          e.preventDefault();
        }
      }, { passive: false });
    },    
    // Calculate distance between two touch points
    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Update canvas transform
    updateCanvasTransform() {
      const canvases = [
        document.getElementById('photo-background-canvas'),
        document.getElementById('photo-drawing-canvas'),
        document.getElementById('photo-temp-canvas')
      ];
      
      canvases.forEach(canvas => {
        canvas.style.transform = `scale(${this.currentScale}) translate(${this.currentTranslateX}px, ${this.currentTranslateY}px)`;
      });
    },
    
    // Start drawing
    startDrawing(x, y) {
      this.isDrawing = true;
      this.currentPath = [{ x, y }];
      
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      this.tempCtx.strokeStyle = this.currentColor;
      this.tempCtx.lineWidth = this.currentLineWidth;
      
      if (this.currentTool === 'freehand') {
        this.tempCtx.beginPath();
        this.tempCtx.moveTo(x, y);
      }
      
      this.lastPoint = { x, y };
    },    
    // Continue drawing
    continueDrawing(x, y) {
      if (!this.isDrawing) return;
      
      this.currentPath.push({ x, y });
      
      // Clear temp canvas
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      
      switch (this.currentTool) {
        case 'rectangle':
          const width = x - this.currentPath[0].x;
          const height = y - this.currentPath[0].y;
          this.tempCtx.strokeRect(this.currentPath[0].x, this.currentPath[0].y, width, height);
          break;
          
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(x - this.currentPath[0].x, 2) + 
            Math.pow(y - this.currentPath[0].y, 2)
          );
          this.tempCtx.beginPath();
          this.tempCtx.arc(this.currentPath[0].x, this.currentPath[0].y, radius, 0, 2 * Math.PI);
          this.tempCtx.stroke();
          break;
          
        case 'arrow':
          this.drawArrow(this.tempCtx, this.currentPath[0].x, this.currentPath[0].y, x, y);
          break;
          
        case 'freehand':
          // Use quadratic curves for smooth lines
          this.tempCtx.quadraticCurveTo(
            this.lastPoint.x, 
            this.lastPoint.y,
            (x + this.lastPoint.x) / 2,
            (y + this.lastPoint.y) / 2
          );
          this.tempCtx.stroke();
          this.lastPoint = { x, y };
          break;
      }
    },    
    // End drawing
    endDrawing(x, y) {
      if (!this.isDrawing) return;
      
      this.isDrawing = false;
      
      // Transfer from temp canvas to drawing canvas
      this.drawCtx.drawImage(this.tempCanvas, 0, 0);
      
      // Clear temp canvas
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      
      // Save shape for undo functionality
      this.shapes.push({
        tool: this.currentTool,
        path: [...this.currentPath],
        color: this.currentColor,
        lineWidth: this.currentLineWidth
      });
      
      // Reset
      this.currentPath = [];
      this.lastPoint = null;
    },
    
    // Draw arrow helper
    drawArrow(ctx, fromX, fromY, toX, toY) {
      const headLength = 15;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      
      // Draw arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    },    
    // Select tool
    selectTool(tool) {
      this.currentTool = tool;
      
      // Apply tool presets
      if (this.toolPresets[tool]) {
        const preset = this.toolPresets[tool];
        if (preset.lineWidth) this.currentLineWidth = preset.lineWidth;
      }
      
      // Update cursor
      const drawingCanvas = document.getElementById('photo-drawing-canvas');
      if (tool === 'text') {
        drawingCanvas.style.cursor = 'text';
      } else {
        drawingCanvas.style.cursor = 'crosshair';
      }
    },
    
    // Select color
    selectColor(color) {
      this.currentColor = color;
      
      // Update UI
      const preview = document.querySelector('.current-color-preview');
      if (preview) preview.style.background = color;
      
      // Update custom color input
      const customInput = document.querySelector('#custom-color');
      if (customInput) customInput.value = color;
      
      // Update active quick color
      document.querySelectorAll('.color-quick').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
      });
    },    
    // Handle action buttons
    handleAction(action) {
      switch (action) {
        case 'undo':
          this.undo();
          break;
        case 'clear':
          this.clearAnnotations();
          break;
        case 'delete':
          this.deletePhoto();
          break;
      }
    },
    
    // Undo last action
    undo() {
      if (this.shapes.length > 0) {
        this.shapes.pop();
        this.redrawCanvas();
      }
    },
    
    // Add text annotation
    addText(e) {
      const point = this.getEventPoint(e, document.getElementById('photo-drawing-canvas'));
      const textContainer = document.querySelector('.text-overlay-container');
      
      const textElement = document.createElement('div');
      textElement.className = 'photo-text-annotation';
      textElement.contentEditable = true;
      textElement.style.position = 'absolute';
      textElement.style.left = point.x + 'px';
      textElement.style.top = point.y + 'px';
      textElement.style.color = this.currentColor;
      textElement.textContent = 'Text';
      
      // Mobile-friendly text editing
      if (this.isTouchDevice) {
        textElement.style.fontSize = '18px';
        textElement.style.padding = '8px 12px';
      }      
      // Make draggable
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      
      const handleDragStart = (e) => {
        const target = e.target;
        if (target === textElement && !target.isContentEditable) {
          isDragging = true;
          const point = this.getEventPoint(e, textContainer);
          dragOffset.x = point.clientX - textElement.offsetLeft;
          dragOffset.y = point.clientY - textElement.offsetTop;
          e.preventDefault();
        }
      };
      
      const handleDragMove = (e) => {
        if (isDragging) {
          const point = this.getEventPoint(e, textContainer);
          textElement.style.left = (point.clientX - dragOffset.x) + 'px';
          textElement.style.top = (point.clientY - dragOffset.y) + 'px';
          e.preventDefault();
        }
      };
      
      const handleDragEnd = () => {
        isDragging = false;
      };
      
      // Unified drag events
      textElement.addEventListener('mousedown', handleDragStart);
      textElement.addEventListener('touchstart', handleDragStart, { passive: false });
      
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
      
      // Add to container and focus
      textContainer.appendChild(textElement);
      textElement.focus();
      
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textElement);
      selection.removeAllRanges();
      selection.addRange(range);      
      // Remove if empty when blurred
      textElement.addEventListener('blur', () => {
        if (textElement.textContent.trim() === '') {
          textElement.remove();
        } else {
          // Save text element
          this.textElements.push({
            element: textElement,
            x: parseInt(textElement.style.left),
            y: parseInt(textElement.style.top),
            text: textElement.textContent,
            color: this.currentColor
          });
        }
      });
    },
    
    // Open the photo editor
    open(photo, measurement) {
      this.currentPhoto = photo;
      this.currentMeasurement = measurement;
      
      const modal = document.getElementById('photo-editor-modal');
      const nameInput = modal.querySelector('.photo-name-input');
      const container = document.getElementById('canvas-container');
      
      // Set photo name
      nameInput.value = photo.name || '';
      
      // Show loading
      document.getElementById('loading-indicator').style.display = 'flex';
      
      // Load image
      const img = new Image();
      img.onload = () => {
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const padding = 20;
        const maxWidth = containerRect.width - padding * 2;
        const maxHeight = containerRect.height - padding * 2;        
        // Calculate scale to fit
        const scale = Math.min(
          maxWidth / img.width,
          maxHeight / img.height,
          1 // Don't scale up
        );
        
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        // Initialize canvases
        this.backgroundCanvas = document.getElementById('photo-background-canvas');
        this.drawingCanvas = document.getElementById('photo-drawing-canvas');
        this.tempCanvas = document.getElementById('photo-temp-canvas');
        
        // Set dimensions
        [this.backgroundCanvas, this.drawingCanvas, this.tempCanvas].forEach(canvas => {
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.style.width = canvasWidth + 'px';
          canvas.style.height = canvasHeight + 'px';
        });
        
        // Get contexts
        this.bgCtx = this.backgroundCanvas.getContext('2d');
        this.drawCtx = this.drawingCanvas.getContext('2d');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        // Draw background image
        this.bgCtx.drawImage(img, 0, 0);
        
        // Load existing annotations
        if (photo.annotations) {
          this.loadAnnotations(photo.annotations);
        }
        
        // Hide loading
        document.getElementById('loading-indicator').style.display = 'none';
        
        // Update UI for mobile
        this.updateUIForDevice();
      };
      
      img.src = photo.dataUrl;      
      // Show modal
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Reset transform
      this.currentScale = 1;
      this.currentTranslateX = 0;
      this.currentTranslateY = 0;
      
      // Set initial color
      this.selectColor(this.currentColor);
    },
    
    // Update UI for device type
    updateUIForDevice() {
      const container = document.querySelector('.photo-editor-container');
      const toolbar = document.querySelector('.photo-editor-toolbar');
      const isMobile = window.innerWidth <= 768;
      
      container.classList.toggle('mobile', isMobile);
      container.classList.toggle('desktop', !isMobile);
      
      toolbar.classList.toggle('bottom', isMobile);
      toolbar.classList.toggle('side', !isMobile);
    },
    
    // Handle orientation change
    handleOrientationChange() {
      setTimeout(() => {
        this.updateUIForDevice();
        
        // Recalculate canvas positions
        if (this.backgroundCanvas) {
          const container = document.getElementById('canvas-container');
          const containerRect = container.getBoundingClientRect();
          
          // Center canvases after orientation change
          const canvasRect = this.backgroundCanvas.getBoundingClientRect();
          this.currentTranslateX = (containerRect.width - canvasRect.width) / 2;
          this.currentTranslateY = (containerRect.height - canvasRect.height) / 2;
          this.updateCanvasTransform();
        }
      }, 100);
    },    
    // Clear all annotations
    clearAnnotations() {
      if (confirm('Clear all annotations? This cannot be undone.')) {
        this.shapes = [];
        this.textElements.forEach(item => item.element.remove());
        this.textElements = [];
        
        // Clear drawing canvas
        this.drawCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
      }
    },
    
    // Redraw canvas
    redrawCanvas() {
      // Clear drawing canvas
      this.drawCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
      
      // Redraw all shapes
      this.shapes.forEach(shape => {
        this.drawCtx.strokeStyle = shape.color;
        this.drawCtx.lineWidth = shape.lineWidth;
        
        switch (shape.tool) {
          case 'rectangle':
            const p1 = shape.path[0];
            const p2 = shape.path[shape.path.length - 1];
            this.drawCtx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            break;
            
          case 'circle':
            const center = shape.path[0];
            const edge = shape.path[shape.path.length - 1];
            const radius = Math.sqrt(
              Math.pow(edge.x - center.x, 2) + 
              Math.pow(edge.y - center.y, 2)
            );
            this.drawCtx.beginPath();
            this.drawCtx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            this.drawCtx.stroke();
            break;
            
          case 'arrow':
            const start = shape.path[0];
            const end = shape.path[shape.path.length - 1];
            this.drawArrow(this.drawCtx, start.x, start.y, end.x, end.y);
            break;            
          case 'freehand':
            this.drawCtx.beginPath();
            shape.path.forEach((point, index) => {
              if (index === 0) {
                this.drawCtx.moveTo(point.x, point.y);
              } else {
                this.drawCtx.lineTo(point.x, point.y);
              }
            });
            this.drawCtx.stroke();
            break;
        }
      });
    },
    
    // Save the edited photo
    savePhoto() {
      // Update photo name
      const nameInput = document.querySelector('.photo-name-input');
      this.currentPhoto.name = nameInput.value || 'Untitled Photo';
      
      // Create final canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = this.backgroundCanvas.width;
      finalCanvas.height = this.backgroundCanvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      
      // Draw background
      finalCtx.drawImage(this.backgroundCanvas, 0, 0);
      
      // Draw annotations
      finalCtx.drawImage(this.drawingCanvas, 0, 0);
      
      // Draw text annotations
      this.textElements.forEach(item => {
        finalCtx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        finalCtx.fillStyle = item.color;
        finalCtx.fillText(item.text, item.x, item.y + 16);
      });
      
      // Save edited image
      this.currentPhoto.dataUrl = finalCanvas.toDataURL('image/png');      
      // Save annotations data
      this.currentPhoto.annotations = {
        shapes: this.shapes,
        texts: this.textElements.map(item => ({
          x: item.x,
          y: item.y,
          text: item.text,
          color: item.color
        }))
      };
      
      // Update thumbnail
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
    
    // Delete photo
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
        
        // Update and save
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
        this.redrawCanvas();
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
      
      // Clear canvases
      if (this.drawCtx) {
        this.drawCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
      }
      if (this.tempCtx) {
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      }
      
      // Clear text overlay
      const textContainer = document.querySelector('.text-overlay-container');
      if (textContainer) {
        textContainer.innerHTML = '';
      }
      
      // Reset transform
      this.currentScale = 1;
      this.currentTranslateX = 0;
      this.currentTranslateY = 0;
    },    
    // Show toast notification
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
    },
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (!document.getElementById('photo-editor-modal').style.display || 
            document.getElementById('photo-editor-modal').style.display === 'none') {
          return;
        }
        
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          this.undo();
        }
        
        // Escape to close
        if (e.key === 'Escape') {
          this.close();
        }
        
        // Number keys for tools
        const toolMap = {
          '1': 'rectangle',
          '2': 'circle',
          '3': 'arrow',
          '4': 'freehand',
          '5': 'text'
        };
        
        if (toolMap[e.key]) {
          this.selectTool(toolMap[e.key]);
          document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolMap[e.key]);
          });
        }
      });
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