import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/contract-builder/SelectSheet.module.css';
import { useMobileDetection } from '../../hooks/useMobileDetection';

const SelectSheet = ({
  isOpen,
  onClose,
  options = [],
  value,
  onChange,
  title,
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  maxHeight = '70vh',
  children,
  renderOption,
  renderSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value;
  });
  const [isClosing, setIsClosing] = useState(false);
  
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const searchInputRef = useRef(null);
  const { isMobile, hapticFeedback, preventBodyScroll } = useMobileDetection();
  
  // Touch gesture states
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => {
        const label = typeof option === 'string' ? option : option.label || option.name;
        return label.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : options;
  // Close animation handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    if (isMobile) hapticFeedback('light');
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setSearchQuery('');
      setDragOffset(0);
    }, 300);
  }, [onClose, isMobile, hapticFeedback, isClosing]);
  
  // Handle option selection
  const handleSelect = useCallback((option) => {
    if (multiple) {
      const value = typeof option === 'string' ? option : option.value;
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      onChange(option);
      handleClose();
    }
    if (isMobile) hapticFeedback('selection');
  }, [multiple, selectedValues, onChange, handleClose, isMobile, hapticFeedback]);
  
  // Touch handlers for swipe to dismiss
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
    setIsDragging(false);
  };
  
  const handleTouchMove = (e) => {
    if (!sheetRef.current) return;
    
    const currentTouch = e.targetTouches[0].clientY;
    const diff = currentTouch - touchStart;
    
    if (diff > 10) {
      setIsDragging(true);
      setDragOffset(Math.max(0, diff));
      e.preventDefault();
    }
  };
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 100) {
      handleClose();
    } else {
      setDragOffset(0);
    }
    setIsDragging(false);
  };
  
  // Effects
  useEffect(() => {
    if (isOpen) {
      preventBodyScroll(true);
      // Focus search input if searchable
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 300);
      }
    } else {
      preventBodyScroll(false);
    }
    
    return () => preventBodyScroll(false);
  }, [isOpen, searchable, preventBodyScroll]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);
  
  // Don't render if not open
  if (!isOpen && !isClosing) return null;
  
  // Render option helper
  const renderOptionContent = (option) => {
    if (renderOption) {
      return renderOption(option);
    }
    
    if (typeof option === 'string') {
      return option;
    }
    
    return option.label || option.name || option.value;
  };
  // Check if option is selected
  const isSelected = (option) => {
    const value = typeof option === 'string' ? option : option.value;
    if (multiple) {
      return selectedValues.includes(value);
    }
    return value === selectedValues;
  };
  
  return createPortal(
    <div className={`${styles.container} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}>
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className={styles.backdrop}
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={styles.sheet}
        style={{ 
          maxHeight,
          transform: `translateY(${dragOffset}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        {/* Drag handle */}
        <div className={styles.dragHandle}>
          <span className={styles.dragBar} />
        </div>
        
        {/* Header */}
        {title && (
          <div className={styles.header}>
            <h3 id="sheet-title" className={styles.title}>{title}</h3>
            {multiple && (
              <button 
                className={styles.doneButton}
                onClick={handleClose}
              >
                Done
              </button>
            )}
          </div>
        )}        
        {/* Search */}
        {searchable && (
          <div className={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder={`Search ${title || 'options'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        
        {/* Options */}
        <div className={styles.optionsList} role="listbox">
          {children || (
            filteredOptions.length === 0 ? (
              <div className={styles.emptyState}>
                {searchQuery ? 'No matching options' : placeholder}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const isOptionSelected = isSelected(option);
                
                return (
                  <button
                    key={optionValue || index}
                    className={`${styles.option} ${isOptionSelected ? styles.selected : ''}`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={isOptionSelected}
                  >
                    <span className={styles.optionContent}>
                      {renderOptionContent(option)}
                    </span>
                    {isOptionSelected && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                );
              })
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SelectSheet;