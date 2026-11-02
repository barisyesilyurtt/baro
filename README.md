# ÇAKBOT

Saçma bir hurda-robot oyunu. Dört komut diziyorsun, robot yürüyor, hedefe **ÇAK**.

Tarayıcıda aç:

```bash
python3 -m http.server 4173
```

Sonra `http://localhost:4173`.

## Nasıl oynanır

Bloklardan program kur: **İleri / Sol / Sağ / Çak**. Çalıştır. Hedefin tam önündeyken ve ona bakarken `ÇAK` basılmış olsun.

Klavye: `1 2 3 4` komut, `Enter` çalıştır, `Backspace` sil.

## Kendin büyüt

Bütün seviye ve hareketler `game.js` içinde.

- Yeni oda: `LEVELS` dizisine `robot`, `target`, `walls` ekle.
- Yeni hareket: `COMMANDS` içine bir fonksiyon yaz. Palette kendisi gelir.
- Izgara boyu: dosyanın başındaki `COLS` / `ROWS`.
