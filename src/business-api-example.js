/**
 * WhatsApp Business Cloud API Örneği
 * 
 * Bu dosya, WhatsApp Business API kullanarak gerçek butonlu mesaj 
 * göndermek için bir örnek içerir. Bu API'yi kullanmak için:
 * 
 * 1. Meta Business hesabı oluşturun
 * 2. WhatsApp Business API'ye kaydolun
 * 3. Bir telefon numarası doğrulayın
 * 4. Access Token alın
 * 
 * Daha fazla bilgi: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const https = require('https');
require('dotenv').config();

// WhatsApp Business API ayarları
const config = {
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID, // WhatsApp telefon numarası ID'si
  accessToken: process.env.WA_ACCESS_TOKEN,       // Meta Business Access Token
  apiVersion: 'v18.0'
};

/**
 * WhatsApp Business API üzerinden mesaj gönder
 */
async function sendMessage(to, message) {
  const data = JSON.stringify({
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: message }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/${config.apiVersion}/${config.phoneNumberId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Butonlu interaktif mesaj gönder
 * Bu özellik WhatsApp Business API ile çalışır
 */
async function sendInteractiveMessage(to) {
  const data = JSON.stringify({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'text',
        text: '🍚 Pilavcı Temel Reis'
      },
      body: {
        text: 'Merhaba 👋\n\nOnline sipariş menümüze hoş geldiniz!\n\nSiparişinizi menü üzerinden kolayca iletebilirsiniz. Ödeme kapıda nakit veya kart ile yapılır.\n\nİyi günler dileriz 🙏'
      },
      footer: {
        text: 'KVKK: uygunye.com/kvkk'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'menu_button',
              title: '🍽️ Menüye Git'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'help_button',
              title: '❓ Yardım'
            }
          }
        ]
      }
    }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/${config.apiVersion}/${config.phoneNumberId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Link butonlu mesaj gönder (Call-to-Action)
 * Direkt olarak URL'ye yönlendiren buton
 */
async function sendCTAMessage(to) {
  const data = JSON.stringify({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      header: {
        type: 'text',
        text: '🍚 Pilavcı Temel Reis'
      },
      body: {
        text: 'Merhaba 👋\n\nOnline sipariş menümüze hoş geldiniz!\n\nSiparişinizi menü üzerinden kolayca iletebilirsiniz. Ödeme kapıda nakit veya kart ile yapılır.\n\n📋 KVKK: uygunye.com/kvkk\n\nİyi günler dileriz 🙏'
      },
      footer: {
        text: 'Pilavcı Temel Reis'
      },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: '🍽️ MENÜYE GİT',
          url: 'https://uygunye.com/r/pilavci-temel-reis'
        }
      }
    }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/${config.apiVersion}/${config.phoneNumberId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Örnek kullanım
if (require.main === module) {
  const testPhone = process.argv[2];
  
  if (!testPhone) {
    console.log('Kullanım: node business-api-example.js <telefon_numarasi>');
    console.log('Örnek: node business-api-example.js 905551234567');
    process.exit(1);
  }
  
  if (!config.phoneNumberId || !config.accessToken) {
    console.log('Hata: WA_PHONE_NUMBER_ID ve WA_ACCESS_TOKEN ortam değişkenleri gerekli');
    console.log('.env dosyasına aşağıdakileri ekleyin:');
    console.log('WA_PHONE_NUMBER_ID=your_phone_number_id');
    console.log('WA_ACCESS_TOKEN=your_access_token');
    process.exit(1);
  }
  
  console.log(`📤 ${testPhone} numarasına butonlu mesaj gönderiliyor...`);
  
  sendCTAMessage(testPhone)
    .then((result) => {
      console.log('✅ Mesaj gönderildi:', result);
    })
    .catch((error) => {
      console.error('❌ Hata:', error);
    });
}

module.exports = {
  sendMessage,
  sendInteractiveMessage,
  sendCTAMessage
};
