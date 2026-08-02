/**
 * 🍚 Pilavcı Temel Reis - WhatsApp Otomatik Mesaj Botu
 * 
 * ✅ Meta API doğrulaması YOK
 * ✅ Tamamen ÜCRETSİZ
 * ✅ Kendi WhatsApp numaranızı kullanın
 * ✅ QR kod ile bağlanın
 * ✅ Telefon numarası şifreleme
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

// Express sunucusu (QR kod web arayüzü için)
const app = express();
app.use(express.json());

// Yapılandırma
const config = {
  // Restoran Bilgileri
  restaurantName: process.env.RESTAURANT_NAME || 'Pilavcı Temel Reis',
  menuUrl: process.env.MENU_URL || 'https://uygunye.com/r/pilavci-temel-reis',
  kvkkUrl: process.env.KVKK_URL || 'https://uygunye.com/kvkk',
  
  // Şifreleme
  encryptionKey: process.env.ENCRYPTION_KEY || 'pilavci-temel-reis-secret-key32',
  tokenExpiryHours: parseInt(process.env.TOKEN_EXPIRY_HOURS) || 24,
  
  // Ayarlar
  port: process.env.PORT || 3000,
  cooldownMs: parseInt(process.env.COOLDOWN_MS) || 3600000, // 1 saat
  replyToGroups: process.env.REPLY_TO_GROUPS === 'true',
};

// Global değişkenler
let currentQR = null;
let isReady = false;
let clientInfo = null;
const lastReplyTime = new Map();

// ============================================
// ŞİFRELEME FONKSİYONLARI
// ============================================

function generateSecureToken(phoneNumber) {
  try {
    const tokenData = {
      phone: phoneNumber,
      created: Date.now(),
      expiry: Date.now() + (config.tokenExpiryHours * 60 * 60 * 1000)
    };
    
    const jsonData = JSON.stringify(tokenData);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
      
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    return null;
  }
}

function decryptToken(token) {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const combined = Buffer.from(base64, 'base64');
    
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);
    
    const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    const tokenData = JSON.parse(decrypted);
    
    return {
      phone: tokenData.phone,
      created: new Date(tokenData.created),
      expiry: new Date(tokenData.expiry),
      valid: tokenData.expiry > Date.now()
    };
    
  } catch (error) {
    return null;
  }
}

function generatePersonalizedMenuUrl(phoneNumber) {
  const token = generateSecureToken(phoneNumber);
  if (!token) return config.menuUrl;
  
  const separator = config.menuUrl.includes('?') ? '&' : '?';
  return `${config.menuUrl}${separator}t=${token}`;
}

// ============================================
// MESAJ OLUŞTURMA
// ============================================

function getWelcomeMessage(phoneNumber) {
  const personalizedUrl = generatePersonalizedMenuUrl(phoneNumber);
  
  return `Merhaba! 👋 Sizlere en hızlı şekilde destek olmak için buradayız.

Görüşmemiz kapsamında, kişisel verileriniz Aydınlatma Metni ve Gizlilik Politikası'nda (${config.kvkkUrl}) belirtilen usul ve esaslara göre işlenmektedir.

Menümüzü görüntüleyip, sipariş oluşturmak için aşağıdaki *linke tıklayın* 👇

━━━━━━━━━━━━━━━━━━━━
🍽️ *MENÜYE GİT*
${personalizedUrl}
━━━━━━━━━━━━━━━━━━━━

İyi günler dileriz 🙏`;
}

// ============================================
// SPAM KONTROLÜ
// ============================================

function shouldReply(phoneNumber) {
  const now = Date.now();
  const lastTime = lastReplyTime.get(phoneNumber);
  
  if (!lastTime || (now - lastTime) > config.cooldownMs) {
    lastReplyTime.set(phoneNumber, now);
    return true;
  }
  return false;
}

// Eski kayıtları temizle
setInterval(() => {
  const now = Date.now();
  for (const [phone, time] of lastReplyTime.entries()) {
    if ((now - time) > config.cooldownMs * 2) {
      lastReplyTime.delete(phone);
    }
  }
}, 3600000);

// ============================================
// WHATSAPP CLIENT
// ============================================

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
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

// QR Kod oluşturulduğunda
client.on('qr', async (qr) => {
  currentQR = qr;
  isReady = false;
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📱 QR KODU TARAYIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n');
  
  // Terminalde QR kod göster
  qrcode.generate(qr, { small: true });
  
  console.log('\n');
  console.log('📌 WhatsApp > Ayarlar > Bağlı Cihazlar > Cihaz Bağla');
  console.log(`🌐 Veya tarayıcıda açın: http://localhost:${config.port}`);
  console.log('\n');
});

// Kimlik doğrulama başarılı
client.on('authenticated', () => {
  console.log('🔐 Kimlik doğrulama başarılı!');
  currentQR = null;
});

// Bağlantı hazır
client.on('ready', async () => {
  isReady = true;
  clientInfo = client.info;
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ BOT AKTİF!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📱 Numara: ${clientInfo.wid.user}`);
  console.log(`  🏪 ${config.restaurantName}`);
  console.log(`  🔗 Menü: ${config.menuUrl}`);
  console.log(`  ⏱️  Cooldown: ${config.cooldownMs / 1000 / 60} dakika`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  🎉 Gelen mesajlar otomatik yanıtlanacak!\n');
});

// Bağlantı kesildi
client.on('disconnected', (reason) => {
  isReady = false;
  console.log('⚠️  Bağlantı kesildi:', reason);
});

// Mesaj geldiğinde
client.on('message', async (message) => {
  try {
    // Kendi mesajlarımızı atla
    if (message.fromMe) return;
    
    // Chat bilgisini al
    const chat = await message.getChat();
    
    // Grup mesajlarını atla (ayara göre)
    if (chat.isGroup && !config.replyToGroups) {
      return;
    }
    
    // Telefon numarasını al
    const phoneNumber = message.from.replace('@c.us', '');
    
    // Spam kontrolü
    if (!shouldReply(phoneNumber)) {
      console.log(`⏳ Cooldown aktif: ${phoneNumber}`);
      return;
    }
    
    // Kişi bilgisini al
    const contact = await message.getContact();
    const contactName = contact.pushname || contact.name || phoneNumber;
    
    console.log(`📩 Mesaj alındı: ${contactName} (${phoneNumber})`);
    console.log(`   "${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}"`);
    
    // Otomatik yanıt gönder
    const welcomeMessage = getWelcomeMessage(phoneNumber);
    await chat.sendMessage(welcomeMessage);
    
    console.log(`✅ Otomatik yanıt gönderildi: ${contactName}`);
    console.log(`🔗 Özel link oluşturuldu\n`);
    
  } catch (error) {
    console.error('❌ Mesaj işleme hatası:', error.message);
  }
});

// ============================================
// EXPRESS ROUTES
// ============================================

// Ana sayfa - QR kod ve durum
app.get('/', async (req, res) => {
  let qrImageData = null;
  
  if (currentQR && !isReady) {
    try {
      qrImageData = await QRCode.toDataURL(currentQR);
    } catch (err) {
      console.error('QR oluşturma hatası:', err);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="5">
      <title>${config.restaurantName} - WhatsApp Bot</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 500px; 
          margin: 0 auto; 
          padding: 20px;
          background: linear-gradient(135deg, #128C7E 0%, #075E54 100%);
          min-height: 100vh;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          text-align: center;
        }
        h1 { 
          color: #128C7E; 
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .status { 
          display: inline-block;
          padding: 8px 20px; 
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin: 15px 0;
        }
        .status.online {
          background: #25D366; 
          color: white;
        }
        .status.offline {
          background: #ff9800; 
          color: white;
        }
        .qr-container {
          margin: 20px 0;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 12px;
        }
        .qr-container img {
          max-width: 250px;
          width: 100%;
        }
        .instructions {
          background: #e8f5e9;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          text-align: left;
          font-size: 14px;
        }
        .instructions ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .instructions li {
          margin: 8px 0;
        }
        .info {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
        }
        .phone {
          font-size: 18px;
          font-weight: 600;
          color: #128C7E;
        }
        a { color: #128C7E; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🍚 ${config.restaurantName}</h1>
        <p>WhatsApp Otomatik Mesaj Botu</p>
        
        ${isReady ? `
          <div class="status online">✓ Bot Aktif</div>
          <p class="phone">📱 ${clientInfo?.wid?.user || 'Bağlı'}</p>
          <div class="info">
            <p>🔗 <a href="${config.menuUrl}" target="_blank">Menüyü Görüntüle</a></p>
            <p>⏱️ Cooldown: ${config.cooldownMs / 1000 / 60} dakika</p>
            <p>🔐 Telefon şifreleme: Aktif</p>
          </div>
        ` : currentQR ? `
          <div class="status offline">📱 QR Kod Bekleniyor</div>
          <div class="qr-container">
            <img src="${qrImageData}" alt="QR Kod">
          </div>
          <div class="instructions">
            <strong>📌 QR Kodu Taramak İçin:</strong>
            <ol>
              <li>Telefonunuzda <strong>WhatsApp</strong>'ı açın</li>
              <li><strong>⋮ Menü</strong> veya <strong>Ayarlar</strong>'a gidin</li>
              <li><strong>Bağlı Cihazlar</strong>'a tıklayın</li>
              <li><strong>Cihaz Bağla</strong>'ya tıklayın</li>
              <li>Yukarıdaki QR kodu tarayın</li>
            </ol>
          </div>
        ` : `
          <div class="status offline">⏳ Başlatılıyor...</div>
          <p>Lütfen bekleyin...</p>
        `}
      </div>
    </body>
    </html>
  `);
});

// API: Bot durumu
app.get('/api/status', (req, res) => {
  res.json({
    ready: isReady,
    phone: clientInfo?.wid?.user || null,
    restaurant: config.restaurantName,
    menuUrl: config.menuUrl,
    cooldownMinutes: config.cooldownMs / 1000 / 60
  });
});

// API: Token doğrulama
app.get('/api/verify-token', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token gerekli' });
  }
  
  const result = decryptToken(token);
  
  if (!result) {
    return res.status(400).json({ success: false, error: 'Geçersiz token' });
  }
  
  if (!result.valid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token süresi dolmuş',
      expiredAt: result.expiry
    });
  }
  
  res.json({
    success: true,
    phone: result.phone,
    created: result.created,
    expiry: result.expiry
  });
});

// API: Token oluşturma (test)
app.get('/api/generate-token', (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Telefon numarası gerekli' });
  }
  
  const token = generateSecureToken(phone);
  const personalizedUrl = generatePersonalizedMenuUrl(phone);
  
  res.json({
    success: true,
    phone: phone,
    token: token,
    url: personalizedUrl,
    expiresIn: `${config.tokenExpiryHours} saat`
  });
});

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ready: isReady });
});

// ============================================
// BAŞLAT
// ============================================

console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  🍚 ${config.restaurantName}`);
console.log('  WhatsApp Otomatik Mesaj Botu v3.0');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ✅ Meta API Yok - Tamamen Ücretsiz!');
console.log('  ✅ QR Kod ile Bağlan');
console.log('  ✅ Telefon Numarası Şifreleme');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Express sunucusunu başlat
app.listen(config.port, () => {
  console.log(`🌐 Web arayüzü: http://localhost:${config.port}`);
  console.log('⏳ WhatsApp bağlantısı başlatılıyor...\n');
});

// WhatsApp client'ı başlat
client.initialize();

// Graceful shutdown
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
