require('dotenv').config();

module.exports = {
  // Restaurant Information
  restaurantName: process.env.RESTAURANT_NAME || 'Pilavcı Temel Reis',
  
  // Menu URL
  menuUrl: process.env.MENU_URL || 'https://uygunye.com/r/pilavci-temel-reis',
  
  // KVKK URL
  kvkkUrl: process.env.KVKK_URL || 'https://uygunye.com/kvkk',
  
  // Auto-reply cooldown in milliseconds (to prevent spam)
  // Default: 1 hour (3600000 ms) - same user won't receive auto-reply again within this period
  cooldownMs: parseInt(process.env.COOLDOWN_MS) || 3600000,
  
  // Whether to reply to group messages
  replyToGroups: process.env.REPLY_TO_GROUPS === 'true' || false,
  
  // Session data path
  sessionPath: process.env.SESSION_PATH || './.wwebjs_auth',
};
