import React, { forwardRef, useState, useRef, useEffect } from 'react';
import styles from '../../../styles/contract-builder/TouchInput.module.css';
import { useMobileDetection } from '../../../hooks/useMobileDetection';

const TouchInput = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  required = false,
  error,
  helperText,
  icon,
  prefix,
  suffix,
  multiline = false,
  rows = 3,
  autoComplete,
  inputMode,
  pattern,
  disabled = false,
  readOnly = false,
  className = '',
  ...otherProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef(null);
  const { isMobile, hapticFeedback } = useMobileDetection();
  
  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // Update hasValue when value changes
  useEffect(() => {
    setHasValue(!!value);
  }, [value]);
  const handleFocus = (e) => {
    setIsFocused(true);
    if (isMobile) {
      hapticFeedback('light');
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    if (onChange) onChange(e);
  };

  const inputProps = {
    ref: inputRef,
    value,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    inputMode,
    pattern,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': helperText || error ? `${otherProps.id || 'input'}-helper` : undefined,
    className: styles.input,
    ...otherProps
  };

  const InputElement = multiline ? 'textarea' : 'input';
  
  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={`
          ${styles.inputWrapper} 
          ${isFocused ? styles.focused : ''} 
          ${error ? styles.error : ''} 
          ${disabled ? styles.disabled : ''}
          ${hasValue || isFocused ? styles.hasValue : ''}
        `}
      >        {icon && <span className={styles.icon}>{icon}</span>}
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        
        <div className={styles.inputContainer}>
          {label && (
            <label 
              className={`${styles.label} ${(hasValue || isFocused) ? styles.floating : ''}`}
              htmlFor={otherProps.id}
            >
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
          )}
          
          <InputElement
            {...inputProps}
            type={!multiline ? type : undefined}
            rows={multiline ? rows : undefined}
          />
        </div>
        
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      
      {(helperText || error) && (
        <div 
          id={`${otherProps.id || 'input'}-helper`}
          className={`${styles.helperText} ${error ? styles.errorText : ''}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

TouchInput.displayName = 'TouchInput';

export default TouchInput;