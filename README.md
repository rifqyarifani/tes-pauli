# TésPauli.id — Website Siap Publish

Paket ini berisi website statis siap upload untuk latihan Tes Pauli online.

## Isi utama
- Homepage SEO-ready
- Halaman latihan interaktif dengan 3 mode
- Halaman hasil dengan skor, akurasi, kecepatan, dan riwayat lokal
- Halaman panduan, tips, FAQ, blog, tentang, dan kontak
- `robots.txt`, `sitemap.xml`, schema JSON-LD, Open Graph, manifest
- Konfigurasi dasar untuk Netlify dan Vercel

## Cara publish cepat
### Netlify
1. Login Netlify.
2. Drag & drop folder ini atau upload ZIP.
3. Pastikan publish directory adalah root folder.
4. Ubah domain ke `tespauli.id` atau domain kamu.

### Vercel
1. Import folder/repo ini ke Vercel.
2. Framework preset: Other.
3. Output directory: `.`.
4. Deploy.

### cPanel / shared hosting
1. Upload semua isi folder ke `public_html`.
2. Pastikan `index.html`, `robots.txt`, dan `sitemap.xml` berada di root domain.

## Setelah publish
- Ganti `https://tespauli.id` di file HTML dan `sitemap.xml` jika domain berbeda.
- Submit sitemap ke Google Search Console.
- Hubungkan Google Analytics atau Microsoft Clarity jika diperlukan.
- Untuk form kontak di hosting selain Netlify, ubah endpoint form di `/kontak/index.html`.

## Catatan teknis
Website ini tidak membutuhkan build step, database, atau backend. Riwayat latihan disimpan di localStorage perangkat pengguna.
# tes-pauli
