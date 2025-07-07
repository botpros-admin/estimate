/**
 * Template Integration for Bitrix24
 * Handles saving template data to CRM deals
 */

const { TEMPLATE_FIELD_MAPPING } = require('./field-config');

/**
 * Format template data for Bitrix24 deal creation/update
 * @param {Object} templateData - Template data from formState
 * @returns {Object} Formatted fields for Bitrix24
 */
function formatTemplateFieldsForBitrix(templateData) {
  const fields = {};
  
  // Template selection data
  if (templateData.template?.selectedTemplate) {
    fields[TEMPLATE_FIELD_MAPPING.contract_template] = templateData.template.selectedTemplate;
  }
  
  if (templateData.template?.templateVersion) {
    fields[TEMPLATE_FIELD_MAPPING.template_version] = templateData.template.templateVersion;
  }
  
  if (templateData.template?.workOrderMode !== undefined) {
    fields[TEMPLATE_FIELD_MAPPING.work_order_mode] = templateData.template.workOrderMode ? 1 : 0;
  }
  
  // Derived template data
  if (templateData.derived?.depositPercentage !== null) {
    fields[TEMPLATE_FIELD_MAPPING.deposit_percent] = templateData.derived.depositPercentage;
  }
  
  if (templateData.derived?.depositAmount !== null) {
    fields[TEMPLATE_FIELD_MAPPING.deposit_amount] = templateData.derived.depositAmount;
  }
  
  // Template suggestion data
  if (templateData.template?.templateSuggestions?.length > 0) {
    const latestSuggestion = templateData.template.templateSuggestions[0];
    if (latestSuggestion.reason) {
      fields[TEMPLATE_FIELD_MAPPING.template_reason] = latestSuggestion.reason;
    }
    if (latestSuggestion.score !== undefined) {
      fields[TEMPLATE_FIELD_MAPPING.template_score] = latestSuggestion.score;
    }
  }
  
  // Contract generation timestamp
  fields[TEMPLATE_FIELD_MAPPING.contract_generated] = new Date().toISOString();
  
  // Initial status
  if (!fields[TEMPLATE_FIELD_MAPPING.contract_status]) {
    fields[TEMPLATE_FIELD_MAPPING.contract_status] = 'generated';
  }
  
  return fields;
}

/**
 * Update contract status in Bitrix24
 * @param {number} dealId - Bitrix24 deal ID
 * @param {string} status - New status value
 * @param {Function} callMethod - Bitrix24 API method caller
 */
async function updateContractStatus(dealId, status, callMethod) {
  const validStatuses = ['draft', 'generated', 'sent', 'viewed', 'signed', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid values: ${validStatuses.join(', ')}`);
  }
  
  const params = {
    entityTypeId: 1058,
    id: dealId,
    fields: {
      [TEMPLATE_FIELD_MAPPING.contract_status]: status
    }
  };
  
  return await callMethod('crm.item.update', params);
}

/**
 * Get template fields from a Bitrix24 deal
 * @param {Object} deal - Bitrix24 deal object
 * @returns {Object} Template-related fields
 */
function extractTemplateFieldsFromDeal(deal) {
  const templateData = {
    contractTemplate: deal[TEMPLATE_FIELD_MAPPING.contract_template] || null,
    templateVersion: deal[TEMPLATE_FIELD_MAPPING.template_version] || null,
    workOrderMode: deal[TEMPLATE_FIELD_MAPPING.work_order_mode] === 1,
    contractStatus: deal[TEMPLATE_FIELD_MAPPING.contract_status] || null,
    depositPercent: deal[TEMPLATE_FIELD_MAPPING.deposit_percent] || null,
    depositAmount: deal[TEMPLATE_FIELD_MAPPING.deposit_amount] || null,
    templateReason: deal[TEMPLATE_FIELD_MAPPING.template_reason] || null,
    templateScore: deal[TEMPLATE_FIELD_MAPPING.template_score] || null,
    contractGenerated: deal[TEMPLATE_FIELD_MAPPING.contract_generated] || null
  };
  
  return templateData;
}

/**
 * Example usage in deal creation
 */
async function createDealWithTemplate(formData, callMethod) {
  // Get template data from formState
  const templateContractData = formData.getTemplateContractData();
  
  // Format template fields
  const templateFields = formatTemplateFieldsForBitrix(templateContractData);
  
  // Combine with other deal fields
  const dealFields = {
    title: formData.projectName || 'New Contract',
    opportunity: formData.grandTotal || 0,
    // ... other standard fields ...
    
    // Add template fields
    ...templateFields
  };
  
  // Create deal
  const params = {
    entityTypeId: 1058,
    fields: dealFields
  };
  
  const result = await callMethod('crm.item.add', params);
  
  console.log('Deal created with template data:', result);
  return result;
}

/**
 * Track contract lifecycle events
 */
async function trackContractEvent(dealId, event, callMethod) {
  const eventStatusMap = {
    'sent_to_client': 'sent',
    'opened_by_client': 'viewed',
    'signed_by_client': 'signed',
    'project_completed': 'completed',
    'contract_cancelled': 'cancelled'
  };
  
  const newStatus = eventStatusMap[event];
  if (newStatus) {
    await updateContractStatus(dealId, newStatus, callMethod);
    console.log(`Contract ${dealId} status updated to: ${newStatus}`);
  }
}

module.exports = {
  formatTemplateFieldsForBitrix,
  updateContractStatus,
  extractTemplateFieldsFromDeal,
  createDealWithTemplate,
  trackContractEvent
};