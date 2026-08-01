/**
 * 📱 Site Entegrasyon Örneği
 * 
 * Bu dosya, menü sitenizde WhatsApp'tan gelen kullanıcının
 * telefon numarasını nasıl alacağınızı gösterir.
 * 
 * Akış:
 * 1. Kullanıcı WhatsApp'tan mesaj atar
 * 2. Bot, şifreli telefon numarası içeren özel link gönderir
 * 3. Kullanıcı linke tıklar: menu.com?t=abc123xyz
 * 4. Siteniz token'ı çözer ve telefon numarasını alır
 * 5. Session'a kaydeder, formları otomatik doldurur
 */

// ============================================
// YÖNTEM 1: Backend API ile doğrulama
// (Önerilen - En güvenli)
// ============================================

/**
 * Frontend JavaScript - Token'ı backend'e gönder
 */
const frontendExample = `
// Sayfa yüklendiğinde çalışır
document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('t');
  
  if (token) {
    try {
      // Backend API'ye token'ı gönder
      const response = await fetch('/api/verify-whatsapp-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ WhatsApp kullanıcısı doğrulandı');
        console.log('📱 Telefon:', data.phone);
        
        // Telefon numarasını forma otomatik doldur
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
          phoneInput.value = data.phone;
          phoneInput.readOnly = true; // Değiştiremesin
        }
        
        // Güvenlik rozeti göster
        showVerifiedBadge();
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
    }
  }
});

function showVerifiedBadge() {
  const badge = document.createElement('div');
  badge.innerHTML = '✅ WhatsApp ile doğrulandı';
  badge.style.cssText = 'background:#25D366;color:white;padding:8px 16px;border-radius:20px;display:inline-block;margin:10px 0;';
  document.querySelector('.order-form')?.prepend(badge);
}
`;

/**
 * Backend (Node.js/Express) - Token doğrulama endpoint'i
 */
const backendExample = `
const crypto = require('crypto');

// Bot ile aynı şifreleme anahtarı olmalı!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'pilavci-temel-reis-secret-key32';

// Token çözme fonksiyonu
function decryptToken(token) {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const combined = Buffer.from(base64, 'base64');
    
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    const data = JSON.parse(decrypted);
    
    return {
      phone: data.phone,
      valid: data.expiry > Date.now(),
      expiry: new Date(data.expiry)
    };
  } catch (error) {
    return null;
  }
}

// Express route
app.post('/api/verify-whatsapp-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token gerekli' });
  }
  
  const result = decryptToken(token);
  
  if (!result || !result.valid) {
    return res.status(400).json({ success: false, error: 'Geçersiz token' });
  }
  
  // Session'a telefon numarasını kaydet
  req.session.whatsappPhone = result.phone;
  req.session.whatsappVerified = true;
  
  res.json({
    success: true,
    phone: result.phone,
    verified: true
  });
});
`;

// ============================================
// YÖNTEM 2: PHP ile doğrulama
// ============================================

const phpExample = `
<?php
// verify-token.php

// Bot ile aynı şifreleme anahtarı
$ENCRYPTION_KEY = getenv('ENCRYPTION_KEY') ?: 'pilavci-temel-reis-secret-key32';

function decryptToken($token, $key) {
    // URL-safe Base64 decode
    $base64 = str_replace(['-', '_'], ['+', '/'], $token);
    $combined = base64_decode($base64);
    
    if (strlen($combined) < 32) {
        return null;
    }
    
    $iv = substr($combined, 0, 16);
    $authTag = substr($combined, 16, 32);
    $encrypted = substr($combined, 32);
    
    // Anahtar türet
    $derivedKey = hash_pbkdf2('sha256', $key, 'salt', 100000, 32, true);
    
    // AES-256-GCM şifre çözme
    $decrypted = openssl_decrypt(
        $encrypted,
        'aes-256-gcm',
        $derivedKey,
        OPENSSL_RAW_DATA,
        $iv,
        $authTag
    );
    
    if ($decrypted === false) {
        return null;
    }
    
    $data = json_decode($decrypted, true);
    
    if (!$data || $data['expiry'] < time() * 1000) {
        return null;
    }
    
    return [
        'phone' => $data['phone'],
        'valid' => true
    ];
}

// Token'ı URL'den al
$token = $_GET['t'] ?? null;

if ($token) {
    $result = decryptToken($token, $ENCRYPTION_KEY);
    
    if ($result && $result['valid']) {
        // Session'a kaydet
        session_start();
        $_SESSION['whatsapp_phone'] = $result['phone'];
        $_SESSION['whatsapp_verified'] = true;
        
        // Formu telefon numarası ile doldur
        $phone = $result['phone'];
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Menü - Pilavcı Temel Reis</title>
</head>
<body>
    <?php if (isset($phone)): ?>
        <div class="verified-badge">
            ✅ WhatsApp ile doğrulandı: <?php echo htmlspecialchars($phone); ?>
        </div>
    <?php endif; ?>
    
    <form action="order.php" method="POST">
        <input type="tel" name="phone" id="phone" 
               value="<?php echo htmlspecialchars($phone ?? ''); ?>"
               <?php echo isset($phone) ? 'readonly' : ''; ?>
               placeholder="Telefon numaranız">
        
        <!-- Diğer form alanları -->
        <button type="submit">Sipariş Ver</button>
    </form>
</body>
</html>
`;

// ============================================
// YÖNTEM 3: Doğrudan Bot API'sine istek
// (Ayrı sunuculardaysanız)
// ============================================

const remoteApiExample = `
// Siteniz ve bot farklı sunuculardaysa,
// Bot API'sine uzaktan istek atabilirsiniz

async function verifyTokenRemote(token) {
  const BOT_API_URL = 'https://your-bot-server.com';
  
  try {
    const response = await fetch(
      BOT_API_URL + '/api/verify-token?token=' + encodeURIComponent(token)
    );
    
    const data = await response.json();
    
    if (data.success) {
      return {
        phone: data.phone,
        verified: true
      };
    }
  } catch (error) {
    console.error('Doğrulama hatası:', error);
  }
  
  return null;
}

// Kullanım
document.addEventListener('DOMContentLoaded', async () => {
  const token = new URLSearchParams(window.location.search).get('t');
  
  if (token) {
    const result = await verifyTokenRemote(token);
    
    if (result) {
      // Telefon numarasını kullan
      document.getElementById('phone').value = result.phone;
    }
  }
});
`;

// ============================================
// GÜVENLİK ÖNERİLERİ
// ============================================

const securityTips = `
🔐 GÜVENLİK ÖNERİLERİ
━━━━━━━━━━━━━━━━━━━━━━

1. ENCRYPTION_KEY'i güvenli tutun
   - .env dosyasında saklayın
   - Git'e commit etmeyin
   - Güçlü, rastgele bir anahtar kullanın

2. Token süresini kısa tutun
   - Varsayılan: 24 saat
   - Hassas işlemler için: 1-2 saat

3. HTTPS kullanın
   - Token URL'de gideceği için HTTPS şart

4. Rate limiting ekleyin
   - Token doğrulama endpoint'ine
   - Brute-force saldırılarına karşı

5. Logları tutun
   - Şüpheli aktiviteleri izleyin
   - Başarısız doğrulamaları kaydedin

6. Token'ı tek kullanımlık yapın (opsiyonel)
   - Kullanılan token'ları veritabanına kaydedin
   - Aynı token tekrar kullanılmasın
`;

console.log('📱 Site Entegrasyon Örnekleri');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n1. Frontend JavaScript örneği');
console.log('\n2. Backend Node.js/Express örneği');
console.log('\n3. PHP örneği');
console.log('\n4. Uzak API örneği');
console.log('\n' + securityTips);

module.exports = {
  frontendExample,
  backendExample,
  phpExample,
  remoteApiExample,
  securityTips
};
