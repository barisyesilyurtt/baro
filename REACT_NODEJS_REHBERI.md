# 🚀 React & Node.js Hızlı Öğrenme Rehberi

## 📌 Temel Kavramlar

### Node.js Nedir?
- **JavaScript'i tarayıcı dışında çalıştıran** bir runtime environment
- Sunucu tarafı (backend) uygulamalar yazmanızı sağlar
- npm (Node Package Manager) ile paket yönetimi yapar

### React Nedir?
- Facebook tarafından geliştirilen **UI kütüphanesi**
- Component (bileşen) tabanlı yapı
- Virtual DOM ile hızlı render

---

## 🔧 1. Node.js Proje Yapısı

```
my-project/
├── package.json      # Proje ayarları ve bağımlılıklar
├── package-lock.json # Bağımlılık versiyonları (kilitli)
├── node_modules/     # İndirilen paketler (GIT'e eklenmez!)
├── src/              # Kaynak kodlar
└── .gitignore        # Git'in yoksayacağı dosyalar
```

### package.json Açıklaması:
```json
{
  "name": "proje-adi",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",    // npm start komutu
    "dev": "nodemon index.js",   // npm run dev komutu
    "build": "webpack --mode production"
  },
  "dependencies": {
    "express": "^4.18.2"   // Üretimde gerekli paketler
  },
  "devDependencies": {
    "nodemon": "^3.0.0"    // Sadece geliştirmede gerekli
  }
}
```

---

## 🎯 2. Temel npm Komutları

| Komut | Açıklama |
|-------|----------|
| `npm init -y` | Yeni proje başlat |
| `npm install paket` | Paket yükle |
| `npm install -D paket` | Dev dependency olarak yükle |
| `npm install` | package.json'daki tüm paketleri yükle |
| `npm run script-adi` | Script çalıştır |
| `npm uninstall paket` | Paket kaldır |

---

## ⚛️ 3. React Proje Oluşturma Yöntemleri

### Yöntem 1: Create React App (CRA) - Eski Yöntem
```bash
npx create-react-app my-app
cd my-app
npm start
```

### Yöntem 2: Vite (Modern & Hızlı) - ÖNERİLEN
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

### Yöntem 3: Next.js (Full-Stack React)
```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

---

## 📁 4. React Proje Yapısı (Vite ile)

```
my-react-app/
├── node_modules/        # Paketler
├── public/              # Statik dosyalar
├── src/
│   ├── App.jsx          # Ana component
│   ├── App.css          # Stiller
│   ├── main.jsx         # Giriş noktası
│   └── components/      # Bileşenler
├── index.html           # HTML şablonu
├── package.json         # Proje ayarları
└── vite.config.js       # Vite ayarları
```

---

## 🧩 5. React Component Mantığı

### Basit Bir Component:
```jsx
// Button.jsx
function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
```

### Component Kullanımı:
```jsx
// App.jsx
import Button from './components/Button';

function App() {
  const handleClick = () => {
    alert('Tıklandı!');
  };

  return (
    <div>
      <h1>Merhaba React!</h1>
      <Button text="Tıkla" onClick={handleClick} />
    </div>
  );
}

export default App;
```

---

## 🔄 6. State ve Props

### State (Bileşen içi durum):
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Sayaç: {count}</p>
      <button onClick={() => setCount(count + 1)}>Artır</button>
    </div>
  );
}
```

### Props (Bileşenler arası veri aktarımı):
```jsx
// Parent -> Child veri akışı
<UserCard name="Ali" age={25} />

// Child component'te kullanım
function UserCard({ name, age }) {
  return <div>{name} - {age} yaş</div>;
}
```

---

## 🌐 7. Backend (Node.js + Express)

### Basit API Sunucusu:
```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

// GET endpoint
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Ali' },
    { id: 2, name: 'Veli' }
  ]);
});

// POST endpoint
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  res.json({ message: `${name} eklendi!` });
});

app.listen(3001, () => {
  console.log('Sunucu 3001 portunda çalışıyor');
});
```

---

## 🔗 8. Frontend-Backend Bağlantısı

### React'tan API Çağırma:
```jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // Boş array = component mount olduğunda çalış

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## 📦 9. Build & Deploy (Derleme & Yayınlama)

### React Build:
```bash
npm run build    # dist/ veya build/ klasörü oluşturur
```

Build sonucu:
- JavaScript dosyaları minify (küçültülür)
- CSS optimize edilir
- Statik dosyalar hash'lenir (cache yönetimi)

### Sunucuda Çalıştırma:
```bash
# Node.js backend
node server.js

# veya PM2 ile (production)
npm install -g pm2
pm2 start server.js
```

---

## 🎓 10. Öğrenme Sırası Önerisi

1. **HTML/CSS/JavaScript temelleri** ✅
2. **Node.js & npm temelleri** ⬇️
3. **React temelleri** (components, props, state)
4. **React Hooks** (useState, useEffect)
5. **React Router** (sayfa yönlendirme)
6. **State Management** (Context API veya Redux)
7. **Backend** (Express.js)
8. **Veritabanı** (MongoDB veya PostgreSQL)
9. **Full-Stack** (Next.js)

---

## 💡 Hızlı İpuçları

1. **node_modules asla git'e eklenmez** - .gitignore'a ekle
2. **package-lock.json'u sil + npm install** - bağımlılık sorunlarını çözer
3. **npx** = paketi yüklemeden çalıştır
4. **^** = minor versiyon güncellemelerine izin ver
5. **~** = sadece patch güncellemelerine izin ver

---

## 🛠️ Faydalı Araçlar

- **Vite**: Hızlı geliştirme sunucusu
- **ESLint**: Kod kalitesi kontrolü
- **Prettier**: Kod formatlama
- **Nodemon**: Değişikliklerde otomatik yeniden başlatma
- **Postman**: API test aracı
