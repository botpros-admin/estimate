// Bitrix Smart Process Automation Script Examples
// Use these in your automation rules

// Example 1: Calculate markup percentage
// Trigger: When Residential or Commercial price changes
function calculateMarkup() {
    var resPrice = parseFloat({{UF_CRM_RES_PRICE}});
    var comPrice = parseFloat({{UF_CRM_COM_PRICE}});
    
    if (comPrice > 0) {
        var markup = ((resPrice - comPrice) / comPrice) * 100;
        return markup.toFixed(2) + '%';
    }
    return 'N/A';
}

// Example 2: Generate product SKU
// Trigger: On product creation
function generateSKU() {
    var brand = '{{UF_CRM_BRAND}}';
    var paint = '{{UF_CRM_PAINT_NAME}}';
    var id = '{{UF_CRM_EXTERNAL_ID}}';
    
    // Create SKU format: BRAND-PAINT-ID
    var brandCode = brand.substring(0, 3).toUpperCase();
    var paintCode = paint.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    
    return brandCode + '-' + paintCode + '-' + id;
}

// Example 3: Price validation
// Trigger: Before save
function validatePrices() {
    var resPrice = parseFloat({{UF_CRM_RES_PRICE}});
    var comPrice = parseFloat({{UF_CRM_COM_PRICE}});
    
    if (resPrice < comPrice) {
        // Residential price should not be less than commercial
        return {
            error: true,
            message: 'Residential price cannot be less than commercial price'
        };
    }
    
    if (resPrice > comPrice * 2) {
        // Warning if markup is more than 100%
        return {
            warning: true,
            message: 'Markup is more than 100%. Please verify prices.'
        };
    }
    
    return { success: true };
}

// Example 4: Coverage category assignment
// Trigger: When coverage value changes
function categorizeCoverage() {
    var coverage = parseInt({{UF_CRM_COVERAGE}});
    
    if (coverage >= 350) {
        return 'High Coverage';
    } else if (coverage >= 275) {
        return 'Standard Coverage';
    } else {
        return 'Low Coverage';
    }
}

// Example 5: Product notification builder
// Trigger: On new product or significant update
function buildNotification() {
    var brand = '{{UF_CRM_BRAND}}';
    var paint = '{{UF_CRM_PAINT_NAME}}';
    var interior = '{{UF_CRM_INTERIOR}}' === 'Y' ? 'Interior' : '';
    var exterior = '{{UF_CRM_EXTERIOR}}' === 'Y' ? 'Exterior' : '';
    var type = [interior, exterior].filter(Boolean).join('/');
    
    var message = 'New Paint Product Added:\n';
    message += brand + ' ' + paint + '\n';
    message += 'Type: ' + type + '\n';
    message += 'Residential: ${{UF_CRM_RES_PRICE}}/sq ft\n';
    message += 'Commercial: ${{UF_CRM_COM_PRICE}}/sq ft\n';
    message += 'Coverage: {{UF_CRM_COVERAGE}} sq ft/gal';
    
    return message;
}

// Example 6: Sync status checker
// Use in scheduled automation to verify sync
function checkSyncStatus() {
    var syncDate = new Date('{{UF_CRM_SYNC_DATE}}');
    var now = new Date();
    var hoursSinceSync = (now - syncDate) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 24) {
        return {
            status: 'warning',
            message: 'Product not synced in over 24 hours'
        };
    }
    
    return {
        status: 'ok',
        message: 'Sync is up to date'
    };
}