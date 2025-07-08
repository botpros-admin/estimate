# Square/Linear Toggle Alignment Fix

## Issue
The new Square/Linear toggle had incorrect styling that caused:
- Center alignment instead of left alignment
- Width of 554px instead of matching the original 209.58px
- Different visual appearance from the Dimensions/Total Area toggle

## Root Cause
The `.measurement-calculation-type-selector` CSS had different properties than `.measurement-input-type-selector`:

**Problematic styles:**
- `justify-content: center` - caused centering
- `padding: 8px 12px` - added extra width
- `background-color: #f8f9fa` - different background
- `border: 1px solid #e5e7eb` - added border
- Different color values and dimensions

## Solution
Updated `css/square-linear-toggle.css` to exactly match the original toggle styling:

### Key Changes
1. **Layout**: Removed center justification, padding, background, and borders
2. **Colors**: Changed active state from `#3b82f6` to `#1f2937` 
3. **Typography**: Used `0.875rem` font size to match original
4. **Toggle Dimensions**: Matched exact slider dimensions (18px x 18px circle, 3px positioning)
5. **Background**: Used `#ccc` instead of `#d1d5db` for slider background

### Final CSS Structure
```css
.measurement-calculation-type-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;           /* Same as original */
  margin-bottom: 0.75rem; /* Same as original */
  margin-top: 0.25rem;    /* Small spacing between toggles */
}
```

## Result
- Both toggles now have identical dimensions (~209px width)
- Perfect left alignment
- Consistent visual appearance
- Proper spacing between the two toggles

## Files Modified
- `css/square-linear-toggle.css` - Complete rewrite to match original styling
- No changes needed in JavaScript files
