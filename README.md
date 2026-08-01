# 🍚 Pilavcı Temel Reis - WhatsApp Otomatik Mesaj Botu

WhatsApp'ta gelen her mesaja otomatik olarak restoran menü bilgilerini gönderen bot.

## ✨ Özellikler

- 📱 Gelen her mesaja otomatik yanıt
- 🔗 Menü linki ile kolay sipariş
- ⏱️ Spam önleme (aynı kişiye belirli süre içinde tekrar mesaj göndermez)
- 👥 Grup mesajlarına yanıt verme seçeneği
- 🔐 Oturum bilgilerini kaydetme (her seferinde QR kod taramaya gerek yok)

## 📋 Gereksinimler

- Node.js 18 veya üzeri
- npm veya yarn
- Google Chrome veya Chromium tarayıcı

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

Gerekirse `.env` dosyasındaki ayarları düzenleyin:

```env
RESTAURANT_NAME=Pilavcı Temel Reis
MENU_URL=https://uygunye.com/r/pilavci-temel-reis
KVKK_URL=https://uygunye.com/kvkk
COOLDOWN_MS=3600000
REPLY_TO_GROUPS=false
```

### 3. Botu Başlatın

```bash
npm start
```

### 4. QR Kodu Tarayın

Bot başlatıldığında terminalde bir QR kod görünecek. WhatsApp uygulamanızdan:

1. **Ayarlar** > **Bağlı Cihazlar** > **Cihaz Bağla**
2. QR kodu tarayın
3. Bot aktif olacak!

## 📱 Gönderilen Mesaj Örneği

Bot, gelen her mesaja şu şekilde yanıt verir:

```
Merhaba 👋
*Pilavcı Temel Reis* online sipariş menümüze hoş geldiniz!

🍽️ *Menüyü görüntüle ve sipariş ver:*
👉 https://uygunye.com/r/pilavci-temel-reis

Siparişinizi bu linkteki menü üzerinden kolayca iletebilirsiniz. 
Ödeme kapıda nakit veya kart ile yapılır.

📋 KVKK Aydınlatma Metni:
https://uygunye.com/kvkk

İyi günler dileriz 🙏

━━━━━━━━━━━━━━━━━━━━
🔗 *MENÜYE GİT:* https://uygunye.com/r/pilavci-temel-reis
━━━━━━━━━━━━━━━━━━━━
```

## ⚙️ Ayarlar

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `RESTAURANT_NAME` | Restoran adı | Pilavcı Temel Reis |
| `MENU_URL` | Menü linki | https://uygunye.com/r/pilavci-temel-reis |
| `KVKK_URL` | KVKK metni linki | https://uygunye.com/kvkk |
| `COOLDOWN_MS` | Aynı kişiye tekrar mesaj göndermeden önce bekleme süresi (ms) | 3600000 (1 saat) |
| `REPLY_TO_GROUPS` | Gruplara yanıt verilsin mi | false |

## 🔧 Geliştirme Modu

Değişiklikleri otomatik algılayan geliştirme modunda çalıştırmak için:

```bash
npm run dev
```

## 📁 Proje Yapısı

```
├── src/
│   ├── index.js      # Ana bot dosyası
│   └── config.js     # Yapılandırma ayarları
├── .env.example      # Ortam değişkenleri şablonu
├── .env              # Ortam değişkenleri (oluşturmanız gerekir)
├── package.json      # Proje bağımlılıkları
└── README.md         # Bu dosya
```

## 🐳 Docker ile Çalıştırma (Opsiyonel)

Docker ile çalıştırmak için `Dockerfile` oluşturun:

```dockerfile
FROM node:18-slim

# Chrome bağımlılıkları
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["npm", "start"]
```

Çalıştırın:

```bash
docker build -t pilavci-whatsapp-bot .
docker run -it pilavci-whatsapp-bot
```

## ⚠️ Önemli Notlar

1. **WhatsApp Hesabınızı Kullanın**: Bu bot, kişisel veya işletme WhatsApp hesabınızı kullanır.

2. **7/24 Çalışması İçin**: Botu sürekli çalışır halde tutmak için bir sunucu (VPS) veya bilgisayarınızın açık kalması gerekir.

3. **Spam Politikası**: WhatsApp'ın kullanım politikalarına dikkat edin. Çok fazla otomatik mesaj göndermek hesabınızın askıya alınmasına neden olabilir.

4. **Cooldown Süresi**: Varsayılan olarak aynı kişiye 1 saat içinde tekrar otomatik mesaj gönderilmez. Bu süreyi `.env` dosyasından ayarlayabilirsiniz.

## 🆘 Sorun Giderme

### QR Kod Görünmüyor
- Node.js sürümünüzün 18 veya üzeri olduğundan emin olun
- `node_modules` klasörünü silip `npm install` tekrar çalıştırın

### "No usable sandbox" Hatası
Puppeteer sandbox hatası alıyorsanız, Chrome/Chromium'un yüklü olduğundan emin olun.

### Bağlantı Kesilmesi
Oturum süresiz bağlantı kesintisi yaşıyorsanız:
1. `.wwebjs_auth` klasörünü silin
2. Botu yeniden başlatın
3. QR kodu tekrar tarayın

## 📞 Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

## 📄 Lisans

MIT
