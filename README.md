# 🍚 Pilavcı Temel Reis - WhatsApp Otomatik Mesaj Botu

**Meta API Yok • Tamamen Ücretsiz • QR Kod ile Bağlan**

Gelen her WhatsApp mesajına otomatik olarak menü linki gönderen bot.

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🆓 **Tamamen Ücretsiz** | Meta API yok, mesaj limiti yok |
| 📱 **Kolay Kurulum** | QR kod tarayın, hemen çalışsın |
| 🔐 **Telefon Güvenliği** | Her müşteriye özel şifreli link |
| ⏱️ **Spam Önleme** | Aynı kişiye tekrar mesaj göndermez |
| 🌐 **Web Arayüzü** | QR kodu tarayıcıdan görüntüleyin |

## 📱 Gönderilen Mesaj

Bot her mesaja şöyle yanıt verir:

```
Merhaba! 👋 Sizlere en hızlı şekilde destek olmak için buradayız.

Görüşmemiz kapsamında, kişisel verileriniz Aydınlatma Metni ve 
Gizlilik Politikası'nda belirtilen usul ve esaslara göre işlenmektedir.

Menümüzü görüntüleyip, sipariş oluşturmak için aşağıdaki linke tıklayın 👇

━━━━━━━━━━━━━━━━━━━━
🍽️ MENÜYE GİT
https://uygunye.com/r/pilavci-temel-reis?t=abc123...
━━━━━━━━━━━━━━━━━━━━

İyi günler dileriz 🙏
```

> 🔐 Her müşterinin linki farklı! Telefon numarası şifreli olarak linkte saklanır.

---

## 🚀 Kurulum (5 Dakika)

### Gereksinimler

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Google Chrome veya Chromium
- WhatsApp yüklü telefon

### Adım 1: Projeyi İndirin

```bash
git clone https://github.com/barisyesilyurtt/baro.git
cd baro
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Ayarları Yapın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
RESTAURANT_NAME=Pilavcı Temel Reis
MENU_URL=https://uygunye.com/r/pilavci-temel-reis
KVKK_URL=https://uygunye.com/kvkk
ENCRYPTION_KEY=kendi-gizli-anahtariniz-32karakter
COOLDOWN_MS=3600000
```

### Adım 4: Botu Başlatın

```bash
npm start
```

### Adım 5: QR Kodu Tarayın

1. Terminalde veya `http://localhost:3000` adresinde QR kod görünecek
2. Telefonunuzda **WhatsApp** açın
3. **Ayarlar** > **Bağlı Cihazlar** > **Cihaz Bağla**
4. QR kodu tarayın
5. ✅ Bot aktif!

---

## 🖥️ Ekran Görüntüleri

### Terminal Çıktısı

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🍚 Pilavcı Temel Reis
  WhatsApp Otomatik Mesaj Botu v3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Meta API Yok - Tamamen Ücretsiz!
  ✅ QR Kod ile Bağlan
  ✅ Telefon Numarası Şifreleme
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Web arayüzü: http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ BOT AKTİF!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📱 Numara: 905551234567
  🏪 Pilavcı Temel Reis
  🔗 Menü: https://uygunye.com/r/pilavci-temel-reis
  ⏱️  Cooldown: 60 dakika
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📩 Mesaj alındı: Ahmet (905559876543)
   "Merhaba, menünüz var mı?"
✅ Otomatik yanıt gönderildi: Ahmet
🔗 Özel link oluşturuldu
```

---

## 🔐 Telefon Numarası Güvenliği

Her müşteriye özel link nasıl çalışır:

```
1. Müşteri mesaj atar
         ↓
2. Bot telefon numarasını alır: 905551234567
         ↓
3. AES-256 ile şifreler: abc123xyz...
         ↓
4. Özel link oluşturur:
   menu.com?t=abc123xyz...
         ↓
5. Siteniz token'ı çözer → Telefon numarasını alır
```

### Sitenizde Token'ı Çözmek

```javascript
// Sayfa yüklendiğinde
const token = new URLSearchParams(window.location.search).get('t');

if (token) {
  fetch('https://YOUR_BOT_SERVER/api/verify-token?token=' + token)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('Telefon:', data.phone); // 905551234567
        // Forma otomatik doldur, session'a kaydet, vs.
      }
    });
}
```

---

## 🔌 API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `GET /` | Web arayüzü (QR kod gösterimi) |
| `GET /api/status` | Bot durumu |
| `GET /api/verify-token?token=xxx` | Token doğrulama |
| `GET /api/generate-token?phone=xxx` | Test için token oluşturma |
| `GET /health` | Sağlık kontrolü |

### Örnek: Token Doğrulama Yanıtı

```json
{
  "success": true,
  "phone": "905551234567",
  "created": "2024-01-15T10:30:00.000Z",
  "expiry": "2024-01-16T10:30:00.000Z"
}
```

---

## ⚙️ Ayarlar

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `RESTAURANT_NAME` | Restoran adı | Pilavcı Temel Reis |
| `MENU_URL` | Menü linki | - |
| `KVKK_URL` | KVKK metni linki | - |
| `ENCRYPTION_KEY` | Şifreleme anahtarı (32 kar.) | - |
| `TOKEN_EXPIRY_HOURS` | Token geçerlilik süresi | 24 |
| `COOLDOWN_MS` | Aynı kişiye tekrar mesaj süresi | 3600000 (1 saat) |
| `REPLY_TO_GROUPS` | Gruplara yanıt ver | false |
| `PORT` | Web arayüzü portu | 3000 |

---

## 🌐 7/24 Çalıştırma

Bot'un sürekli çalışması için birkaç seçenek:

### Seçenek 1: PM2 (Linux/Mac)

```bash
# PM2 yükle
npm install -g pm2

# Botu başlat
pm2 start src/index.js --name "whatsapp-bot"

# Bilgisayar yeniden başladığında otomatik çalışsın
pm2 startup
pm2 save
```

### Seçenek 2: VPS/Sunucu

DigitalOcean, Hetzner, Contabo gibi ucuz VPS'lerde çalıştırabilirsiniz.

```bash
# Sunucuya bağlan
ssh user@sunucu-ip

# Projeyi kur
git clone https://github.com/barisyesilyurtt/baro.git
cd baro
npm install
cp .env.example .env
nano .env  # Ayarları düzenle

# PM2 ile başlat
pm2 start src/index.js --name "whatsapp-bot"
```

### Seçenek 3: Kendi Bilgisayarınız

Bilgisayarınız açık kaldığı sürece bot çalışır.

---

## ❓ Sık Sorulan Sorular

### QR kod sürekli yenileniyor?
Normal davranış. 60 saniye içinde taramazsanız yenilenir.

### "session-xxxxx" klasörü ne?
WhatsApp oturum bilgileri. Silmeyin, yoksa tekrar QR taramanız gerekir.

### Telefon internetsiz kalırsa?
Bot çalışmaya devam eder. WhatsApp Web gibi çalışır.

### Birden fazla numara kullanabilir miyim?
Her numara için ayrı bot çalıştırmanız gerekir (farklı portlarda).

### Grup mesajlarına yanıt vermek istiyorum?
`.env` dosyasında `REPLY_TO_GROUPS=true` yapın.

---

## 🆚 Meta API vs Bu Çözüm

| Özellik | Meta API | Bu Çözüm |
|---------|----------|----------|
| Maliyet | 1000 sonrası ücretli | ✅ Tamamen ücretsiz |
| Kurulum | Karmaşık, doğrulama gerekli | ✅ 5 dakika, QR tara |
| Buton | ✅ Gerçek buton | Link (tıklanabilir) |
| Güvenilirlik | ✅ Resmi API | Gayri resmi |
| Hesap riski | Yok | Düşük* |

> *Normal kullanımda risk yok. Spam yaparsanız hesap askıya alınabilir.

---

## 📁 Proje Yapısı

```
├── src/
│   ├── index.js                  # Ana bot dosyası
│   └── site-integration-example.js # Site entegrasyon örnekleri
├── .wwebjs_auth/                 # WhatsApp oturum verileri (otomatik)
├── .env.example                  # Ortam değişkenleri şablonu
├── .env                          # Ayarlarınız (oluşturmanız gerekir)
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 Lisans

MIT

---

## 🆘 Destek

Sorun mu yaşıyorsunuz? GitHub Issues açın!
