/**
 * Pilavcı Temel Reis - WhatsApp Business API Bot
 * 
 * Bu bot, WhatsApp Business Cloud API kullanarak
 * gelen mesajlara otomatik yanıt verir ve menü butonu gösterir.
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
  appSecret: process.env.WA_APP_SECRET,
  
  // Restoran Bilgileri
  restaurantName: process.env.RESTAURANT_NAME || 'Pilavcı Temel Reis',
  menuUrl: process.env.MENU_URL || 'https://uygunye.com/r/pilavci-temel-reis',
  kvkkUrl: process.env.KVKK_URL || 'https://uygunye.com/kvkk',
  
  // Ayarlar
  port: process.env.PORT || 3000,
  cooldownMs: parseInt(process.env.COOLDOWN_MS) || 3600000, // 1 saat
};

// Son yanıt zamanlarını tutan Map (spam önleme)
const lastReplyTime = new Map();

/**
 * Spam kontrolü - Aynı numaraya belirli süre içinde tekrar mesaj gönderme
 */
function shouldReply(phoneNumber) {
  const now = Date.now();
  const lastTime = lastReplyTime.get(phoneNumber);
  
  if (!lastTime || (now - lastTime) > config.cooldownMs) {
    lastReplyTime.set(phoneNumber, now);
    return true;
  }
  return false;
}

/**
 * WhatsApp Business API üzerinden butonlu mesaj gönder
 */
async function sendMenuMessage(to) {
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
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
          url: config.menuUrl
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

/**
 * Webhook doğrulama (GET)
 * Meta'nın webhook'u doğrulaması için gerekli
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
      console.log('❌ Webhook doğrulama başarısız');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * Webhook mesaj alımı (POST)
 * Gelen WhatsApp mesajlarını işler
 */
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // WhatsApp Business Account mesajı mı kontrol et
    if (body.object === 'whatsapp_business_account') {
      
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          
          if (change.field === 'messages') {
            const value = change.value;
            
            // Gelen mesajları işle
            for (const message of value.messages || []) {
              const from = message.from; // Gönderen telefon numarası
              const messageType = message.type;
              
              console.log(`📩 Mesaj alındı: ${from} (${messageType})`);
              
              // Spam kontrolü
              if (!shouldReply(from)) {
                console.log(`⏳ Cooldown aktif: ${from}`);
                continue;
              }
              
              // Otomatik yanıt gönder
              await sendMenuMessage(from);
            }
          }
        }
      }
    }

    // Meta her zaman 200 bekler
    res.sendStatus(200);
    
  } catch (error) {
    console.error('❌ Webhook hatası:', error);
    res.sendStatus(500);
  }
});

/**
 * Sağlık kontrolü endpoint'i
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
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f2f5;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #128C7E; margin-bottom: 10px; }
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
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🍚 ${config.restaurantName}</h1>
        <span class="status">✓ Bot Aktif</span>
        <div class="info">
          <p>📱 WhatsApp otomatik yanıt sistemi çalışıyor</p>
          <p>🔗 <a href="${config.menuUrl}" target="_blank">Menüyü Görüntüle</a></p>
        </div>
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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Sunucu çalışıyor: http://localhost:${config.port}`);
  console.log(`📍 Webhook URL: http://YOUR_DOMAIN/webhook`);
  console.log(`🔗 Menü: ${config.menuUrl}`);
  console.log(`⏱️  Cooldown: ${config.cooldownMs / 1000 / 60} dakika\n`);
  
  if (!config.accessToken || !config.phoneNumberId) {
    console.log('⚠️  UYARI: WA_ACCESS_TOKEN ve WA_PHONE_NUMBER_ID ayarlanmamış!');
    console.log('   .env dosyasını kontrol edin.\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Sunucu kapatılıyor...');
  process.exit(0);
});
