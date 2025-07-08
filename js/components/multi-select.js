// Multi-Select Component
class MultiSelect {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      fieldName: options.fieldName || element.dataset.name,
      isMulti: options.isMulti !== false,
      placeholder: options.placeholder || 'Select...',
      items: options.items || [],
      value: options.value || [],
      onChange: options.onChange || (() => {}),
      noSearch: options.noSearch || element.dataset.noSearch === 'true',
      ...options
    };
    
    this.selectedItems = [];
    this.filteredItems = [];
    this.highlightedIndex = -1;
    
    this.init();
  }
  
  init() {
    // Parse initial data from element
    if (this.element.dataset.items) {
      try {
        this.options.items = JSON.parse(this.element.dataset.items);
      } catch (e) {
        if (window.ErrorHandler) {
          window.ErrorHandler.error('Failed to parse items', {
            category: window.ErrorCategory.VALIDATION,
            context: { error: e.message, dataset: this.element.dataset }
          });
        }
      }
    }
    
    if (this.element.dataset.value) {
      try {
        const values = JSON.parse(this.element.dataset.value);
        this.selectedItems = Array.isArray(values) ? values : [];
      } catch (e) {
        if (window.ErrorHandler) {
          window.ErrorHandler.error('Failed to parse values', {
            category: window.ErrorCategory.VALIDATION,
            context: { error: e.message, dataset: this.element.dataset }
          });
        }
      }
    }
    
    // If value was passed in options, use that instead
    if (this.options.value && Array.isArray(this.options.value) && this.options.value.length > 0) {
      this.selectedItems = this.options.value;
    }
    
    this.render();
    this.attachEvents();
  }
  
  render() {
    // Create container structure
    this.container = document.createElement('div');
    this.container.className = 'main-ui-control main-ui-multi-select';
    
    // Create tags container
    this.tagsContainer = document.createElement('span');
    this.tagsContainer.className = 'main-ui-square-container';
    
    // Render selected items
    this.renderSelectedItems();
    
    // Create search input
    const searchSpan = document.createElement('span');
    searchSpan.className = 'main-ui-square-search';
    
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'main-ui-square-search-item';
    this.searchInput.placeholder = this.selectedItems.length === 0 ? this.options.placeholder : '';
    if (this.options.noSearch) {
      this.searchInput.readOnly = true;
      this.searchInput.style.caretColor = 'transparent';
      this.searchInput.addEventListener('keydown', (e) => e.preventDefault());
    }
    
    searchSpan.appendChild(this.searchInput);
    
    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'main-ui-select-dropdown';
    
    // Assemble container
    this.container.appendChild(this.tagsContainer);
    this.container.appendChild(searchSpan);
    this.container.appendChild(this.dropdown);
    
    // Replace original element
    this.element.style.display = 'none';
    this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
    
    // Create hidden inputs for form submission
    this.updateHiddenInputs();
  }
  
  renderSelectedItems() {
    // Clear existing tags
    this.tagsContainer.innerHTML = '';
    
    // Render each selected item
    this.selectedItems.forEach(item => {
      const tag = document.createElement('span');
      tag.className = 'main-ui-square';
      tag.dataset.item = JSON.stringify(item);
      
      const text = document.createElement('span');
      text.className = 'main-ui-square-item';
      text.textContent = item.NAME || item.name || item;
      
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'main-ui-item-icon main-ui-square-delete';
      
      tag.appendChild(text);
      tag.appendChild(deleteBtn);
      
      this.tagsContainer.appendChild(tag);
    });
    
    // Update placeholder
    if (this.searchInput) {
      this.searchInput.placeholder = this.selectedItems.length === 0 ? this.options.placeholder : '';
    }
  }
  
  renderDropdown(filter = '') {
    const lowerFilter = filter.toLowerCase();
    
    // Filter items
    this.filteredItems = this.options.items.filter(item => {
      const name = (item.NAME || item.name || item.toString()).toLowerCase();
      const isSelected = this.selectedItems.some(selected => 
        (selected.VALUE || selected.value || selected) === (item.VALUE || item.value || item)
      );
      
      return !isSelected && name.includes(lowerFilter);
    });
    
    // Clear dropdown
    this.dropdown.innerHTML = '';
    
    if (this.filteredItems.length === 0) {
      this.dropdown.classList.remove('active');
      this.dropdown.classList.remove('dropdown-above');
      return;
    }
    
    // Render filtered items
    this.filteredItems.forEach((item, index) => {
      const option = document.createElement('div');
      option.className = 'main-ui-select-option';
      if (index === this.highlightedIndex) {
        option.classList.add('highlighted');
      }
      
      option.textContent = item.NAME || item.name || item;
      option.dataset.value = item.VALUE || item.value || item;
      option.dataset.item = JSON.stringify(item);
      
      this.dropdown.appendChild(option);
    });
    
    // Show dropdown temporarily to measure height
    this.dropdown.classList.add('active');
    this.dropdown.classList.remove('dropdown-above');
    
    // Calculate positioning
    this.positionDropdown();
  }
  
  positionDropdown() {
    const containerRect = this.container.getBoundingClientRect();
    const dropdownHeight = this.dropdown.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate available space below and above
    const spaceBelow = viewportHeight - (containerRect.bottom - scrollTop);
    const spaceAbove = containerRect.top - scrollTop;
    
    // Special handling for Service Type and Abrasive Method fields - always position above since they're at bottom of form
    const isServiceTypeField = this.element.id === 'service-type-multiselect' || 
                               this.container.closest('#service-type-container');
    const isAbrasiveMethodField = this.element.id === 'abrasive-method-multiselect' || 
                                  this.container.closest('#abrasive-method-container');
    const isSurfaceCoatingMethodField = this.element.id === 'surface-coating-method-multiselect' || 
                                        this.container.closest('#surface-coating-method-container');
    const isConcreteCoatingField = this.element.id === 'concrete-coating-multiselect' || 
                                   this.container.closest('#concrete-coating-container');
    const isWoodCoatingField = this.element.id === 'wood-coating-multiselect' || 
                               this.container.closest('#wood-coating-container');
    
    if (isServiceTypeField || isAbrasiveMethodField || isSurfaceCoatingMethodField || 
        isConcreteCoatingField || isWoodCoatingField) {
      // Force these dropdowns to always appear above
      this.dropdown.classList.add('dropdown-above');
    } else {
      // Use smart positioning for other dropdowns
      if (spaceBelow < dropdownHeight + 20 && spaceAbove > dropdownHeight + 20) {
        this.dropdown.classList.add('dropdown-above');
      } else {
        this.dropdown.classList.remove('dropdown-above');
      }
    }
  }
  
  attachEvents() {
    // Container click - focus search
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container || e.target.classList.contains('main-ui-square-container')) {
        this.searchInput.focus();
      }
    });
    
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      this.renderDropdown(e.target.value);
      this.highlightedIndex = 0;
      this.updateHighlight();
    });
    
    this.searchInput.addEventListener('focus', () => {
      this.renderDropdown(this.searchInput.value);
    });
    
    // Reposition dropdown on window resize or scroll
    window.addEventListener('resize', () => {
      if (this.dropdown.classList.contains('active')) {
        this.positionDropdown();
      }
    });
    
    window.addEventListener('scroll', () => {
      if (this.dropdown.classList.contains('active')) {
        this.positionDropdown();
      }
    });
    
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
    
    // Tag delete buttons
    this.tagsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('main-ui-square-delete')) {
        const tag = e.target.closest('.main-ui-square');
        if (tag) {
          const item = JSON.parse(tag.dataset.item);
          this.removeItem(item);
        }
      }
    });
    
    // Dropdown item clicks
    this.dropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('main-ui-select-option')) {
        const item = JSON.parse(e.target.dataset.item);
        this.addItem(item);
        this.searchInput.value = '';
        this.renderDropdown('');
        this.searchInput.focus();
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.dropdown.classList.remove('active');
        this.dropdown.classList.remove('dropdown-above');
      }
    });
  }
  
  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredItems.length - 1);
        this.updateHighlight();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        this.updateHighlight();
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredItems.length) {
          this.addItem(this.filteredItems[this.highlightedIndex]);
          this.searchInput.value = '';
          this.renderDropdown('');
        }
        break;
        
      case 'Escape':
        this.dropdown.classList.remove('active');
        this.dropdown.classList.remove('dropdown-above');
        this.searchInput.blur();
        break;
        
      case 'Backspace':
        if (this.searchInput.value === '' && this.selectedItems.length > 0) {
          this.removeItem(this.selectedItems[this.selectedItems.length - 1]);
        }
        break;
    }
  }
  
  updateHighlight() {
    const options = this.dropdown.querySelectorAll('.main-ui-select-option');
    options.forEach((option, index) => {
      if (index === this.highlightedIndex) {
        option.classList.add('highlighted');
        option.scrollIntoView({ block: 'nearest' });
      } else {
        option.classList.remove('highlighted');
      }
    });
  }
  
  addItem(item) {
    if (!this.options.isMulti) {
      this.selectedItems = [item];
    } else {
      this.selectedItems.push(item);
    }
    
    this.renderSelectedItems();
    this.updateHiddenInputs();
    this.options.onChange(this.getValue());
  }
  
  removeItem(item) {
    const value = item.VALUE || item.value || item;
    this.selectedItems = this.selectedItems.filter(selected => 
      (selected.VALUE || selected.value || selected) !== value
    );
    
    this.renderSelectedItems();
    this.updateHiddenInputs();
    this.options.onChange(this.getValue());
  }
  
  updateHiddenInputs() {
    // Remove existing hidden inputs
    const existingInputs = this.element.parentNode.querySelectorAll(`input[name="${this.options.fieldName}"]`);
    existingInputs.forEach(input => input.remove());
    
    // Create new hidden inputs
    if (this.selectedItems.length === 0) {
      // Create empty value input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.options.fieldName;
      input.value = '';
      this.element.parentNode.appendChild(input);
    } else {
      // Create input for each selected value
      this.selectedItems.forEach(item => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = this.options.fieldName;
        input.value = item.VALUE || item.value || item;
        this.element.parentNode.appendChild(input);
      });
    }
  }
  
  getValue() {
    return this.selectedItems.map(item => item.VALUE || item.value || item);
  }
  
  setValue(values) {
    // Clear current selection
    this.selectedItems = [];
    
    // Find and select items by value
    const valueArray = Array.isArray(values) ? values : [values];
    valueArray.forEach(value => {
      const item = this.options.items.find(i => 
        (i.VALUE || i.value || i) === value
      );
      if (item) {
        this.selectedItems.push(item);
      }
    });
    
    this.renderSelectedItems();
    this.updateHiddenInputs();
  }
}

// Initialize function
function initializeMultiSelects() {
  const elements = document.querySelectorAll('[data-multi-select]');
  elements.forEach(element => {
    new MultiSelect(element);
  });
}

// Export for use
window.MultiSelect = MultiSelect;
window.initializeMultiSelects = initializeMultiSelects;
