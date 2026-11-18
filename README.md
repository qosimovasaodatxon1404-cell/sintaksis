# SintaksisLand — Ona tili: Sintaksis o‘quv platformasi

**SintaksisLand** — 8–11-sinf o‘quvchilari hamda Bilim va malakalarni baholash agentligi (BBA) imtihonlariga tayyorlanuvchilar uchun yaratilgan interaktiv, o‘yinlashtirilgan o‘quv veb-sayti.

## Asosiy imkoniyatlar

- **12 ta tizimli modul**: So‘z birikmasidan boshlab qo‘shma gaplar, ko‘chirma gap va tinish belgilari qoidalarigacha. Har bir modul **«Kirish → Qoida → Rangli misollar → Xatolar → Xotira kaliti → 2 ta o‘yin → 10 savolli mini-test → 3 qismli uy vazifasi → Chop etiladigan xulosa»** zanjiri asosida qurilgan.
- **Yagona «Rang kaliti»**: Ega (ko‘k), kesim (qizil), to‘ldiruvchi (yashil), aniqlovchi (sariq), hol (binafsha) va yordamchi bo‘laklar (firuza) butun platformada bir xil rang hamda chiziq belgilari bilan ajratiladi.
- **9 ta sintaktik o‘yin + 3 ta maxsus vosita**:
  - *Gap quruvchi*, *Bo‘lak ovchisi*, *Tinish belgilari ustaxonasi*, *Juftini top*, *Xatoni top*, *Blits-bellashuv*, *Ergash gap detektivi*, *Ko‘chirma → O‘zlashtirma*, *Sintaksis qal’asi*;
  - *Bellashuv rejimi (2 o‘yinchi)*, *Gap me’mori* konstruktori va *Interaktiv gap tahlilchisi*.
- **BBA imtihon markazi**: 6 ta to‘liq variant (jami 180 ta test savoli), 45 daqiqalik imtihon taymeri, xatolar ustida ishlash va **Aqlli takrorlash** (1 kun → 3 kun oralig‘i) tizimi.
- **To‘liq avtonom ishlash**: Hech qanday server, ma’lumotlar bazasi yoki tashqi API kaliti talab qilinmaydi. Barcha natijalar, XP, darajalar, kunlik seriya va yutuqlar brauzerning `localStorage` xotirasida saqlanadi hamda JSON fayl sifatida yuklab olinishi mumkin.

---

## Kompyuterda ishga tushirish

Talab qilinadigan dastur: **Node.js** (18-versiya yoki undan yuqori).

```bash
# 1. Kutubxonalarni o‘rnatish
npm install

# 2. Dasturlash rejimida ishga tushirish
npm run dev

# 3. Tayyor loyihani yig‘ish (dist papkasiga chiqadi)
npm run build
```

---

## Loyihani GitHub’ga yuklash bosqichlari

1. GitHub’da yangi repozitoriy (masalan, `sintaksisland`) yarating.
2. Loyiha papkasida terminalni ochib, quyidagi buyruqlarni ketma-ket bajaring:

```bash
git init
git add .
git commit -m "SintaksisLand o‘quv platformasi"
git branch -M main
git remote add origin https://github.com/<FOYDALANUVCHI_NOMI>/sintaksisland.git
git push -u origin main
```

---

## Vercel’da joylashtirish (Deploy)

Sayt `HashRouter` asosida tuzilgani sababli Vercel’da sahifa yangilanganda **404 xatosi chiqmaydi** va qo‘shimcha server sozlamasi talab etilmaydi.

1. [vercel.com](https://vercel.com) saytiga GitHub hisobingiz orqali kiring.
2. **«Add New... → Project»** tugmasini bosing va `sintaksisland` repozitoriysini tanlang (**Import**).
3. Loyiha sozlamalarini tekshiring:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: bo‘sh qoldiring (hech qanday kalit talab qilinmaydi).
4. **«Deploy»** tugmasini bosing. 1 daqiqa ichida saytingiz tayyor havolaga ega bo‘ladi!
