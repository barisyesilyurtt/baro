/**
 * Pilavcı Temel Reis - WhatsApp Business API Bot
 * 
 * Özellikler:
 * - Otomatik yanıt
 * - Kullanıcıya özel link (telefon numarası şifreli)
 * - Menü butonu
 */

const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Yapılandırma
const config = {
  // WhatsApp Business API
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
  accessToken: process.env.WA_ACCESS_TOKEN,
  verifyToken: process.env.WA_VERIFY_TOKEN || 'pilavci_temel_reis_verify',
  
  // Şifreleme anahtarı (32 karakter olmalı)
  encryptionKey: process.env.ENCRYPTION_KEY || 'pilavci-temel-reis-secret-key32',
  
  // Restoran Bilgileri
  restaurantName: process.env.RESTAURANT_NAME || 'Pilavcı Temel Reis',
  menuUrl: process.env.MENU_URL || 'https://uygunye.com/r/pilavci-temel-reis',
  kvkkUrl: process.env.KVKK_URL || 'https://uygunye.com/kvkk',
  
  // Ayarlar
  port: process.env.PORT || 3000,
  cooldownMs: parseInt(process.env.COOLDOWN_MS) || 3600000,
  tokenExpiryHours: parseInt(process.env.TOKEN_EXPIRY_HOURS) || 24, // Token geçerlilik süresi
};

// Son yanıt zamanları (spam önleme)
const lastReplyTime = new Map();

// ============================================
// ŞİFRELEME FONKSİYONLARI
// ============================================

/**
 * Telefon numarasını şifreli token'a çevirir
 * @param {string} phoneNumber - Telefon numarası
 * @returns {string} - Base64 encoded şifreli token
 */
function generateSecureToken(phoneNumber) {
  try {
    // Token verisi: telefon + oluşturulma zamanı
    const tokenData = {
      phone: phoneNumber,
      created: Date.now(),
      expiry: Date.now() + (config.tokenExpiryHours * 60 * 60 * 1000)
    };
    
    const jsonData = JSON.stringify(tokenData);
    
    // AES-256-GCM şifreleme
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    // IV + AuthTag + Encrypted data birleştir
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    // URL-safe Base64 encode
    return combined.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
      
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    return null;
  }
}

/**
 * Şifreli token'ı çözer ve telefon numarasını döndürür
 * @param {string} token - Şifreli token
 * @returns {object|null} - { phone, created, expiry, valid } veya null
 */
function decryptToken(token) {
  try {
    // URL-safe Base64 decode
    const base64 = token
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const combined = Buffer.from(base64, 'base64');
    
    // IV, AuthTag ve encrypted data ayır
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);
    
    // AES-256-GCM şifre çözme
    const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    const tokenData = JSON.parse(decrypted);
    
    // Token geçerlilik kontrolü
    const isValid = tokenData.expiry > Date.now();
    
    return {
      phone: tokenData.phone,
      created: new Date(tokenData.created),
      expiry: new Date(tokenData.expiry),
      valid: isValid
    };
    
  } catch (error) {
    console.error('Token çözme hatası:', error);
    return null;
  }
}

/**
 * Kullanıcıya özel menü linki oluşturur
 * @param {string} phoneNumber - Telefon numarası
 * @returns {string} - Özel link
 */
function generatePersonalizedMenuUrl(phoneNumber) {
  const token = generateSecureToken(phoneNumber);
  
  if (!token) {
    return config.menuUrl; // Hata durumunda normal link
  }
  
  // URL'e token parametresi ekle
  const separator = config.menuUrl.includes('?') ? '&' : '?';
  return `${config.menuUrl}${separator}t=${token}`;
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

// ============================================
// WHATSAPP API
// ============================================

/**
 * Kişiye özel butonlu mesaj gönder
 */
async function sendPersonalizedMenuMessage(to) {
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
  // Kullanıcıya özel link oluştur
  const personalizedUrl = generatePersonalizedMenuUrl(to);
  
  console.log(`🔗 Özel link oluşturuldu: ${to}`);
  
  const messageData = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      body: {
        text: `Merhaba! Sizlere en hızlı şekilde destek olmak için buradayız.\n\nGörüşmemiz kapsamında, kişisel verileriniz Aydınlatma Metni ve Gizlilik Politikası'nda (${config.kvkkUrl}) belirtilen usul ve esaslara göre işlenmektedir.\n\nMenümüzü görüntüleyip, sipariş oluşturmak için aşağıdaki *butona tıklayın* 👇`
      },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: 'Menüyü Görüntüle',
          url: personalizedUrl  // Kişiye özel link!
        }
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Mesaj gönderildi: ${to}`);
      return result;
    } else {
      console.error(`❌ Mesaj gönderilemedi:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ API Hatası:`, error.message);
    return null;
  }
}

// ============================================
// WEBHOOK ROUTES
// ============================================

/**
 * Webhook doğrulama (GET)
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === config.verifyToken) {
      console.log('✅ Webhook doğrulandı');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * Webhook mesaj alımı (POST)
 */
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;
            
            for (const message of value.messages || []) {
              const from = message.from;
              
              console.log(`📩 Mesaj alındı: ${from}`);
              
              if (!shouldReply(from)) {
                console.log(`⏳ Cooldown aktif: ${from}`);
                continue;
              }
              
              // Kişiye özel link ile mesaj gönder
              await sendPersonalizedMenuMessage(from);
            }
          }
        }
      }
    }

    res.sendStatus(200);
    
  } catch (error) {
    console.error('❌ Webhook hatası:', error);
    res.sendStatus(500);
  }
});

// ============================================
// TOKEN DOĞRULAMA API (Site tarafı için)
// ============================================

/**
 * Token doğrulama endpoint'i
 * Site bu endpoint'i çağırarak token'ı doğrulayabilir
 * 
 * GET /api/verify-token?token=xxx
 */
app.get('/api/verify-token', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token gerekli'
    });
  }
  
  const result = decryptToken(token);
  
  if (!result) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz token'
    });
  }
  
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      error: 'Token süresi dolmuş',
      expiredAt: result.expiry
    });
  }
  
  // Başarılı doğrulama
  res.json({
    success: true,
    phone: result.phone,
    created: result.created,
    expiry: result.expiry
  });
});

/**
 * Token oluşturma endpoint'i (test için)
 * 
 * GET /api/generate-token?phone=905551234567
 */
app.get('/api/generate-token', (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'Telefon numarası gerekli'
    });
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

// ============================================
// DİĞER ROUTES
// ============================================

/**
 * Sağlık kontrolü
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: config.restaurantName,
    menuUrl: config.menuUrl
  });
});

/**
 * Ana sayfa
 */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.restaurantName} - WhatsApp Bot</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 700px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f2f5;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        h1 { color: #128C7E; margin-bottom: 10px; }
        h2 { color: #333; font-size: 18px; margin-top: 0; }
        .status { 
          display: inline-block;
          background: #25D366; 
          color: white; 
          padding: 5px 15px; 
          border-radius: 20px;
          font-size: 14px;
        }
        .info { margin-top: 20px; color: #666; }
        a { color: #128C7E; }
        code {
          background: #f5f5f5;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
        }
        .endpoint {
          background: #e8f5e9;
          padding: 10px 15px;
          border-radius: 8px;
          margin: 10px 0;
          border-left: 4px solid #25D366;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🍚 ${config.restaurantName}</h1>
        <span class="status">✓ Bot Aktif</span>
        <div class="info">
          <p>📱 WhatsApp otomatik yanıt sistemi çalışıyor</p>
          <p>🔐 Telefon numarası şifreleme: Aktif</p>
          <p>⏱️ Token geçerlilik: ${config.tokenExpiryHours} saat</p>
        </div>
      </div>
      
      <div class="card">
        <h2>🔗 API Endpoints</h2>
        
        <div class="endpoint">
          <strong>Token Doğrulama:</strong><br>
          <code>GET /api/verify-token?token=xxx</code>
        </div>
        
        <div class="endpoint">
          <strong>Token Oluşturma (Test):</strong><br>
          <code>GET /api/generate-token?phone=905551234567</code>
        </div>
        
        <div class="endpoint">
          <strong>Webhook:</strong><br>
          <code>POST /webhook</code>
        </div>
      </div>
      
      <div class="card">
        <h2>📖 Site Entegrasyonu</h2>
        <p>Sitenizde token'ı doğrulamak için:</p>
        <pre>
// JavaScript örneği
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('t');

if (token) {
  fetch('/api/verify-token?token=' + token)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('Telefon:', data.phone);
        // Session'a kaydet
      }
    });
}</pre>
      </div>
    </body>
    </html>
  `);
});

// Sunucuyu başlat
app.listen(config.port, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🍚 ${config.restaurantName}`);
  console.log('  WhatsApp Business API Bot');
  console.log('  🔐 Telefon Numarası Şifreleme: Aktif');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Sunucu: http://localhost:${config.port}`);
  console.log(`📍 Webhook: http://YOUR_DOMAIN/webhook`);
  console.log(`🔗 Menü: ${config.menuUrl}`);
  console.log(`⏱️ Token süresi: ${config.tokenExpiryHours} saat\n`);
  
  if (!config.accessToken || !config.phoneNumberId) {
    console.log('⚠️  UYARI: WA_ACCESS_TOKEN ve WA_PHONE_NUMBER_ID ayarlanmamış!\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Sunucu kapatılıyor...');
  process.exit(0);
});
