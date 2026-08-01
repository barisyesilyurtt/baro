# 🍚 Pilavcı Temel Reis - WhatsApp Otomatik Mesaj Botu

WhatsApp Business API kullanarak gelen her mesaja otomatik yanıt veren ve **"Menüyü Görüntüle"** butonu gösteren bot.

![WhatsApp Mesaj Örneği](https://i.imgur.com/example.png)

## ✨ Özellikler

- 📱 **Otomatik Yanıt**: Gelen her mesaja anında yanıt
- 🔘 **Tıklanabilir Buton**: "Menüyü Görüntüle" butonu ile direkt menüye yönlendirme
- ⏱️ **Spam Önleme**: Aynı kişiye belirli süre içinde tekrar mesaj göndermez
- 🆓 **Ücretsiz**: Meta'nın ücretsiz katmanı ile ayda 1000 konuşma ücretsiz

## 📋 Gereksinimler

1. **Meta Business Hesabı** (ücretsiz)
2. **WhatsApp Business API Erişimi** (ücretsiz)
3. **Node.js 18+**
4. **Sunucu** (webhook için - ngrok ile test edebilirsiniz)

## 🚀 Kurulum

### Adım 1: Meta Business API Kurulumu

1. **Meta Business Suite'e gidin**: https://business.facebook.com

2. **Developer hesabı oluşturun**: https://developers.facebook.com

3. **Yeni uygulama oluşturun**:
   - "Create App" tıklayın
   - "Business" seçin
   - Uygulama adı girin

4. **WhatsApp'ı ekleyin**:
   - Dashboard'da "Add Products" bölümünden "WhatsApp" seçin
   - "Set up" tıklayın

5. **Test numarası alın**:
   - WhatsApp > Getting Started
   - Test numaranızı not edin
   - **Phone Number ID**'yi kopyalayın

6. **Access Token alın**:
   - WhatsApp > API Setup
   - "Generate Access Token" tıklayın
   - Token'ı kopyalayın

### Adım 2: Proje Kurulumu

```bash
# Depoyu klonlayın
git clone https://github.com/barisyesilyurtt/baro.git
cd baro

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
cp .env.example .env
```

### Adım 3: .env Dosyasını Düzenleyin

```env
WA_PHONE_NUMBER_ID=123456789012345
WA_ACCESS_TOKEN=EAAxxxxxxxxxx...
WA_VERIFY_TOKEN=pilavci_temel_reis_verify
RESTAURANT_NAME=Pilavcı Temel Reis
MENU_URL=https://uygunye.com/r/pilavci-temel-reis
KVKK_URL=https://uygunye.com/kvkk
```

### Adım 4: Sunucuyu Başlatın

```bash
# Geliştirme için (ngrok ile)
npm start

# Başka bir terminalde ngrok başlatın
ngrok http 3000
```

### Adım 5: Webhook'u Yapılandırın

1. Meta Developer Portal'a gidin
2. WhatsApp > Configuration
3. Webhook URL'i girin: `https://YOUR_NGROK_URL/webhook`
4. Verify Token: `pilavci_temel_reis_verify`
5. "Verify and Save" tıklayın
6. "messages" alanını abone yapın (subscribe)

## 📱 Gönderilen Mesaj

Bot, gelen her mesaja şu şekilde yanıt verir:

```
Merhaba! Sizlere en hızlı şekilde destek olmak için buradayız.

Görüşmemiz kapsamında, kişisel verileriniz Aydınlatma Metni ve 
Gizlilik Politikası'nda (https://uygunye.com/kvkk) belirtilen 
usul ve esaslara göre işlenmektedir.

Menümüzü görüntüleyip, sipariş oluşturmak için aşağıdaki 
butona tıklayın 👇

[Menüyü Görüntüle] <- Tıklanabilir buton
```

## ⚙️ Ayarlar

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `WA_PHONE_NUMBER_ID` | WhatsApp telefon numarası ID'si | - |
| `WA_ACCESS_TOKEN` | Meta API erişim token'ı | - |
| `WA_VERIFY_TOKEN` | Webhook doğrulama token'ı | pilavci_temel_reis_verify |
| `RESTAURANT_NAME` | Restoran adı | Pilavcı Temel Reis |
| `MENU_URL` | Menü linki | https://uygunye.com/r/pilavci-temel-reis |
| `KVKK_URL` | KVKK metni linki | https://uygunye.com/kvkk |
| `PORT` | Sunucu portu | 3000 |
| `COOLDOWN_MS` | Tekrar mesaj bekleme süresi | 3600000 (1 saat) |

## 🌐 Üretim Ortamına Dağıtım

### Railway.app (Önerilen - Ücretsiz)

1. [Railway.app](https://railway.app)'e gidin
2. GitHub ile giriş yapın
3. "New Project" > "Deploy from GitHub repo"
4. Bu repoyu seçin
5. Environment variables ekleyin
6. Deploy!

### Render.com (Ücretsiz)

1. [Render.com](https://render.com)'a gidin
2. "New Web Service" oluşturun
3. GitHub reposunu bağlayın
4. Environment variables ekleyin
5. Deploy!

### Heroku

```bash
heroku create pilavci-whatsapp-bot
heroku config:set WA_PHONE_NUMBER_ID=xxx WA_ACCESS_TOKEN=xxx
git push heroku main
```

## 💰 Maliyet

Meta'nın WhatsApp Business API fiyatlandırması:

| Kategori | Ücretsiz | Sonrası |
|----------|----------|---------|
| Servis Konuşmaları | Ayda 1000 | ~$0.005/konuşma |
| Marketing | - | ~$0.05/konuşma |

**Not**: Otomatik yanıtlar "servis konuşması" kategorisindedir ve ayda 1000 adet ücretsizdir.

## 📁 Proje Yapısı

```
├── src/
│   ├── index.js              # Ana sunucu ve webhook işleyici
│   ├── config.js             # Yapılandırma (opsiyonel)
│   └── business-api-example.js # API test örneği
├── .env.example              # Ortam değişkenleri şablonu
├── .gitignore               # Git ignore kuralları
├── package.json             # Proje bağımlılıkları
└── README.md                # Bu dosya
```

## 🔧 Test Etme

### Yerel Test (ngrok)

```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000
```

ngrok'un verdiği URL'yi Meta Developer Portal'daki webhook ayarlarına girin.

### Mesaj Gönderme Testi

WhatsApp'tan test numaranıza mesaj gönderin. Bot otomatik olarak menü butonu ile yanıt verecektir.

## ❓ Sık Sorulan Sorular

### Neden buton görünmüyor?
- WhatsApp Business API doğru yapılandırılmamış olabilir
- Access Token süresi dolmuş olabilir
- Webhook URL'i erişilebilir değil

### Mesajlar gelmiyor?
- Webhook'un "messages" alanına abone olduğunuzdan emin olun
- Sunucunun çalıştığını kontrol edin
- Meta Developer Portal'daki logları kontrol edin

### Ücret ödememek için ne yapmalıyım?
- Ayda 1000'den fazla mesaj almamaya dikkat edin
- Sadece gelen mesajlara yanıt verin (marketing mesajı göndermeyin)

## 📞 Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

## 📄 Lisans

MIT
