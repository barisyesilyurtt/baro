# 🍚 Pilavcı Temel Reis - WhatsApp Otomatik Mesaj Botu

WhatsApp Business API kullanarak gelen her mesaja otomatik yanıt veren, **"Menüyü Görüntüle"** butonu gösteren ve **telefon numarası güvenliği** sağlayan bot.

## ✨ Özellikler

- 📱 **Otomatik Yanıt**: Gelen her mesaja anında yanıt
- 🔘 **Tıklanabilir Buton**: "Menüyü Görüntüle" butonu
- 🔐 **Telefon Numarası Güvenliği**: Her kullanıcıya özel şifreli link
- ⏱️ **Spam Önleme**: Aynı kişiye belirli süre içinde tekrar mesaj göndermez
- 🆓 **Ücretsiz**: Meta'nın ücretsiz katmanı ile ayda 1000 konuşma

## 🔐 Telefon Numarası Güvenliği Nasıl Çalışır?

```
1. Müşteri WhatsApp'tan mesaj atar
          ↓
2. Bot, telefon numarasını alır
          ↓
3. AES-256 şifreleme ile token oluşturur
          ↓
4. Kişiye özel link gönderir:
   menu.com?t=abc123xyz...
          ↓
5. Müşteri linke tıklar
          ↓
6. Site, token'ı çözer → Telefon numarasını alır
          ↓
7. Session'a kaydeder, formu otomatik doldurur
```

### Faydaları

- ✅ **Sahte sipariş önleme**: Telefon doğrulanmış
- ✅ **Otomatik form doldurma**: Müşteri numara girmek zorunda değil
- ✅ **Güvenli iletişim**: Şifreli token, manipüle edilemez
- ✅ **Zaman sınırlı**: Token 24 saat sonra geçersiz olur

## 🚀 Kurulum

### Adım 1: Meta Business API Kurulumu

1. https://developers.facebook.com adresine gidin
2. Yeni uygulama oluşturun → "Business" seçin
3. WhatsApp ürününü ekleyin
4. **Phone Number ID** ve **Access Token** alın

### Adım 2: Proje Kurulumu

```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
cp .env.example .env
```

### Adım 3: .env Dosyasını Düzenleyin

```env
# WhatsApp API
WA_PHONE_NUMBER_ID=123456789012345
WA_ACCESS_TOKEN=EAAxxxxxxxxxx...

# 🔐 ÖNEMLİ: Güçlü bir şifreleme anahtarı belirleyin
ENCRYPTION_KEY=guclu-rastgele-32-karakterlik-key

# Restoran
RESTAURANT_NAME=Pilavcı Temel Reis
MENU_URL=https://uygunye.com/r/pilavci-temel-reis
```

### Adım 4: Sunucuyu Başlatın

```bash
npm start
```

### Adım 5: Webhook Yapılandırın

Meta Developer Portal'da:
1. WhatsApp > Configuration
2. Webhook URL: `https://YOUR_DOMAIN/webhook`
3. Verify Token: `pilavci_temel_reis_verify`
4. "messages" alanına abone olun

## 📱 Gönderilen Mesaj

Bot her mesaja şöyle yanıt verir:

```
Merhaba! Sizlere en hızlı şekilde destek olmak için buradayız.

Görüşmemiz kapsamında, kişisel verileriniz Aydınlatma Metni ve 
Gizlilik Politikası'nda belirtilen usul ve esaslara göre işlenmektedir.

Menümüzü görüntüleyip, sipariş oluşturmak için aşağıdaki 
butona tıklayın 👇

[↗ Menüyü Görüntüle]  ← Bu link kişiye özel!
```

**Link örneği**: `https://uygunye.com/r/pilavci-temel-reis?t=a1b2c3d4e5...`

## 🔗 Site Entegrasyonu

Sitenizde token'ı çözmek için:

### JavaScript (Frontend)

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const token = new URLSearchParams(window.location.search).get('t');
  
  if (token) {
    const response = await fetch('/api/verify-token?token=' + token);
    const data = await response.json();
    
    if (data.success) {
      // Telefon numarasını forma yaz
      document.getElementById('phone').value = data.phone;
      document.getElementById('phone').readOnly = true;
      
      // "WhatsApp ile doğrulandı" rozeti göster
      showVerifiedBadge();
    }
  }
});
```

### PHP

```php
<?php
$token = $_GET['t'] ?? null;

if ($token) {
  // Bot API'sine doğrulama isteği
  $result = file_get_contents(
    'https://your-bot.com/api/verify-token?token=' . urlencode($token)
  );
  $data = json_decode($result, true);
  
  if ($data['success']) {
    $_SESSION['phone'] = $data['phone'];
    $_SESSION['verified'] = true;
  }
}
?>
```

Daha fazla örnek için: `src/site-integration-example.js`

## 🔌 API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `GET /webhook` | Meta webhook doğrulama |
| `POST /webhook` | Gelen WhatsApp mesajları |
| `GET /api/verify-token?token=xxx` | Token doğrulama |
| `GET /api/generate-token?phone=xxx` | Test için token oluşturma |
| `GET /health` | Sağlık kontrolü |

### Token Doğrulama Yanıtı

```json
{
  "success": true,
  "phone": "905551234567",
  "created": "2024-01-15T10:30:00.000Z",
  "expiry": "2024-01-16T10:30:00.000Z"
}
```

## ⚙️ Yapılandırma

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `WA_PHONE_NUMBER_ID` | WhatsApp telefon ID | - |
| `WA_ACCESS_TOKEN` | Meta API token | - |
| `ENCRYPTION_KEY` | Şifreleme anahtarı (32 kar.) | - |
| `TOKEN_EXPIRY_HOURS` | Token geçerlilik süresi | 24 |
| `MENU_URL` | Menü linki | - |
| `COOLDOWN_MS` | Spam önleme süresi | 3600000 |

## 🔐 Güvenlik Notları

1. **ENCRYPTION_KEY gizli tutulmalı**
   - .env dosyasında saklayın
   - Git'e commit etmeyin
   - Site ve bot'ta AYNI anahtar kullanın

2. **HTTPS zorunlu**
   - Token URL'de gittiği için HTTPS şart

3. **Token süresi**
   - Varsayılan 24 saat
   - Hassas işlemler için kısaltın

## 🌐 Dağıtım

### Railway.app (Önerilen)

```bash
# Railway CLI ile
railway login
railway init
railway up
```

### Render.com

1. GitHub reposunu bağlayın
2. Environment variables ekleyin
3. Deploy!

## 📁 Proje Yapısı

```
├── src/
│   ├── index.js                  # Ana sunucu + şifreleme
│   └── site-integration-example.js # Site entegrasyon örnekleri
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 💰 Maliyet

| Kategori | Ücretsiz | Sonrası |
|----------|----------|---------|
| Servis Konuşmaları | Ayda 1000 | ~$0.005/konuşma |

## 📄 Lisans

MIT
