const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// Store last reply time for each user to prevent spam
const lastReplyTime = new Map();

// Initialize WhatsApp client with local authentication
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.sessionPath
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// Generate welcome message
function getWelcomeMessage() {
  return `Merhaba 👋
*${config.restaurantName}* online sipariş menümüze hoş geldiniz!

🍽️ Menüyü görüntüle ve sipariş ver:
${config.menuUrl}

Siparişinizi bu linkteki menü üzerinden kolayca iletebilirsiniz. Ödeme kapıda nakit veya kart ile yapılır.

📋 KVKK Aydınlatma Metni (uygunye):
${config.kvkkUrl}

İyi günler dileriz 🙏`;
}

// Generate message with button (for WhatsApp Business API compatibility)
function getMessageWithButton() {
  return `Merhaba 👋
*${config.restaurantName}* online sipariş menümüze hoş geldiniz!

🍽️ *Menüyü görüntüle ve sipariş ver:*
👉 ${config.menuUrl}

Siparişinizi bu linkteki menü üzerinden kolayca iletebilirsiniz. Ödeme kapıda nakit veya kart ile yapılır.

📋 KVKK Aydınlatma Metni:
${config.kvkkUrl}

İyi günler dileriz 🙏

━━━━━━━━━━━━━━━━━━━━
🔗 *MENÜYE GİT:* ${config.menuUrl}
━━━━━━━━━━━━━━━━━━━━`;
}

// Check if we should send auto-reply to this user
function shouldReply(userId) {
  const now = Date.now();
  const lastTime = lastReplyTime.get(userId);
  
  if (!lastTime || (now - lastTime) > config.cooldownMs) {
    lastReplyTime.set(userId, now);
    return true;
  }
  
  return false;
}

// Clean up old entries from the map periodically
function cleanupOldEntries() {
  const now = Date.now();
  for (const [userId, time] of lastReplyTime.entries()) {
    if ((now - time) > config.cooldownMs * 2) {
      lastReplyTime.delete(userId);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldEntries, 3600000);

// QR Code event - Display QR code for authentication
client.on('qr', (qr) => {
  console.log('\n📱 WhatsApp QR Kodu - Telefonunuzla tarayın:\n');
  qrcode.generate(qr, { small: true });
  console.log('\nWhatsApp > Ayarlar > Bağlı Cihazlar > Cihaz Bağla\n');
});

// Ready event - Bot is connected
client.on('ready', () => {
  console.log('✅ WhatsApp Bot hazır!');
  console.log(`📍 Restoran: ${config.restaurantName}`);
  console.log(`🔗 Menü URL: ${config.menuUrl}`);
  console.log(`⏱️  Cooldown: ${config.cooldownMs / 1000 / 60} dakika`);
  console.log(`👥 Gruplara yanıt: ${config.replyToGroups ? 'Evet' : 'Hayır'}`);
  console.log('\n🎉 Bot aktif! Gelen mesajlar otomatik olarak yanıtlanacak.\n');
});

// Authentication success
client.on('authenticated', () => {
  console.log('🔐 Kimlik doğrulama başarılı!');
});

// Authentication failure
client.on('auth_failure', (msg) => {
  console.error('❌ Kimlik doğrulama hatası:', msg);
});

// Disconnected event
client.on('disconnected', (reason) => {
  console.log('⚠️  Bağlantı kesildi:', reason);
  console.log('🔄 Yeniden bağlanmayı deneyin...');
});

// Message event - Handle incoming messages
client.on('message', async (message) => {
  try {
    // Skip if message is from self
    if (message.fromMe) return;
    
    // Get chat info
    const chat = await message.getChat();
    
    // Skip group messages if not configured to reply
    if (chat.isGroup && !config.replyToGroups) {
      return;
    }
    
    // Get sender ID for cooldown tracking
    const senderId = message.from;
    
    // Check cooldown
    if (!shouldReply(senderId)) {
      console.log(`⏳ Cooldown aktif: ${senderId}`);
      return;
    }
    
    // Log incoming message
    const contact = await message.getContact();
    const contactName = contact.pushname || contact.name || senderId;
    console.log(`📩 Mesaj alındı: ${contactName}`);
    console.log(`   İçerik: ${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}`);
    
    // Send auto-reply with button-style formatting
    const replyMessage = getMessageWithButton();
    
    await chat.sendMessage(replyMessage);
    
    console.log(`✅ Otomatik yanıt gönderildi: ${contactName}\n`);
    
  } catch (error) {
    console.error('❌ Mesaj işleme hatası:', error);
  }
});

// Message create event (for sent messages tracking)
client.on('message_create', async (message) => {
  if (message.fromMe) {
    // Optional: Log outgoing messages
    // console.log('📤 Mesaj gönderildi');
  }
});

// Start the client
console.log('\n🚀 WhatsApp Bot başlatılıyor...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ${config.restaurantName} - WhatsApp Bot`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

client.initialize();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Bot kapatılıyor...');
  await client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Bot kapatılıyor...');
  await client.destroy();
  process.exit(0);
});
