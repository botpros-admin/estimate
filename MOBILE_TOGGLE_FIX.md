# Mobile Interior/Exterior Toggle Fix

## Issue
On mobile devices, the Interior and Exterior toggle buttons in the paint estimator application required users to tap somewhere else on the screen before they could toggle a button off. This created a poor user experience on touch devices.

## Root Cause
The issue was caused by the focus state behavior on mobile browsers when using hidden checkbox inputs with styled labels. When tapping a label on mobile:
1. First tap: Focuses the hidden checkbox and triggers the change
2. Second tap: Browser thinks the element is already focused and doesn't trigger the click event properly

## Solution
Created `js/fixes/mobile-scope-toggle-fix.js` that:

1. **Detects touch devices** using multiple methods for compatibility
2. **Prevents default touch behavior** on the hidden checkboxes
3. **Adds explicit click handlers** to the labels that:
   - Prevent default behavior
   - Manually toggle the checkbox state
   - Trigger the change event
   - Remove focus from elements
4. **Re-initializes handlers** when the form changes (project type or service type changes)

## Implementation Details
- File: `js/fixes/mobile-scope-toggle-fix.js`
- Added to: `pages/project-info.html`
- No changes to existing functionality - only improves mobile behavior
- Desktop behavior remains unchanged

## Testing
Tested successfully on mobile viewport (375x667):
- ✅ Interior button toggles on/off with single taps
- ✅ Exterior button toggles on/off with single taps
- ✅ No need to tap elsewhere between toggles
- ✅ Original updateScope() function still fires correctly
- ✅ Form state is properly saved

## Files Changed
1. `js/fixes/mobile-scope-toggle-fix.js` - New file with the fix
2. `pages/project-info.html` - Added script reference
