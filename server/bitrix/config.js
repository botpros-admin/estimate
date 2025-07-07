// Bitrix Integration Configuration
// Replace these values with your actual Bitrix settings

module.exports = {
  // Your Bitrix inbound webhook URL
  // Format: https://YOUR_DOMAIN.bitrix24.com/rest/USER_ID/WEBHOOK_CODE/
  webhookUrl: 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/',
  
  // Bitrix user ID (usually 1 for admin)
  userId: 1,
  
  // Smart Process ID for Paint Products
  // You'll get this after creating the Smart Process in Bitrix
  smartProcessId: 1058, // Your Paint Products Smart Process ID
  
  // Enable/disable automatic sync
  autoSync: true,
  
  // Sync interval in milliseconds (5 minutes)
  syncInterval: 5 * 60 * 1000,
  
  // Enable webhook listener for bi-directional sync
  enableWebhookListener: true,
  
  // Port for webhook listener (if enabled)
  webhookListenerPort: 3001
};