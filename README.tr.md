# Urban Community — Yönetim Paneli

[![CI](https://github.com/berkanserbes/urban-community-management-web/actions/workflows/ci.yml/badge.svg)](https://github.com/berkanserbes/urban-community-management-web/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | **Türkçe**

Kentsel sorunların bildirilmesi ve çözülmesi için yapay zekâ destekli bir platform olan Urban
Community'nin web paneli. Adminler tüm platformu yönetir; yetkililer kendi yetki alanında kendi
birimlerine yönlendirilen raporlarla ilgilenir.

## Repolar

| Repo | Açıklama |
| --- | --- |
| [urban-community-backend](https://github.com/berkanserbes/urban-community-backend) | ASP.NET Core API, RabbitMQ consumer'ları, PostgreSQL/PostGIS |
| [urban-community-ai-service](https://github.com/berkanserbes/urban-community-ai-service) | Kategorilendirme, önceliklendirme ve benzer rapor tespiti için FastAPI servisi |
| **[urban-community-management-web](https://github.com/berkanserbes/urban-community-management-web)** | React admin ve yetkili paneli (bu repo) |
| [urban-community-mobile](https://github.com/berkanserbes/urban-community-mobile) | Expo / React Native vatandaş uygulaması |

Genel mimari için [backend README](https://github.com/berkanserbes/urban-community-backend/blob/main/README.tr.md)
dosyasına bakın.

## Özellikler

### Admin

- Rapor, öneri ve kullanıcı istatistikleri ile grafiklerin yer aldığı dashboard
- Arama, durum, öncelik ve atama filtreleriyle rapor yönetimi; raporu elle birime atama
- Yetkili hesapları: geçici şifreyle yetkili oluşturma, birim ve yetki alanı belirleme
- Kurumlar, birimler, rapor kategorileri, iller, ilçeler ve mahalleler
- Duyurular, öneriler (durum değişikliği ve yetkili yanıtı) ve bildirimler

### Yetkili

- Kendi birimine atanan raporlar için dashboard
- Rapor akışı: raporu onaylama, işleme alma, çözme veya reddetme ve önceliğini değiştirme
- Öneriler: inceleme sürecinde ilerletme ve yetkili yanıtıyla kapatma
- Raporlara ve önerilere yorum
- Kendi yetki alanı için duyurular

### Ortak

- Otomatik token yenilemeli JWT girişi; geçici şifreyle girenler için zorunlu şifre değişikliği
- Admin ve yetkili alanları arasında rol bazlı yönlendirme
- Tüm listelerde sunucu tarafı sayfalama ve filtreleme; arama olan listelerde gecikmeli (debounce) arama
- Açık ve koyu tema

## Teknolojiler

| Alan | Teknolojiler |
| --- | --- |
| Çatı | React 19, TypeScript, Vite |
| Veri çekme | TanStack Query, Axios |
| Tablolar | TanStack Table |
| Durum yönetimi | Zustand |
| Formlar | React Hook Form, Zod |
| Arayüz | Tailwind CSS 4, Radix UI bileşenleri, Lucide ikonları, Sonner |
| Grafikler | Recharts |
| Yönlendirme | React Router |

## Proje yapısı

```text
urban-community-admin/src/
├── app/          # Router, layout'lar ve dashboard sayfaları
├── components/   # Ortak bileşenler ve arayüz temel bileşenleri
├── features/     # Her alan için bir klasör: api/, hooks/, components/, pages/
├── hooks/        # Ortak hook'lar
├── lib/          # Axios istemcisi, API sonuç yardımcıları, araçlar
├── stores/       # Zustand store'ları (kimlik doğrulama)
└── types/        # Özellikler arasında paylaşılan API tipleri
```

## Başlangıç

### Gereksinimler

- Node.js 20.19+ veya 22.12+ ve [pnpm](https://pnpm.io/)
- Çalışan bir backend API (bkz. [backend README](https://github.com/berkanserbes/urban-community-backend/blob/main/README.tr.md#başlangıç))

### Çalıştırma

```bash
cd urban-community-admin
pnpm install
cp .env.example .env.development   # API http://localhost:5000 dışındaysa VITE_API_BASE_URL'i ayarlayın
pnpm dev
```

Bir admin hesabıyla giriş yapın. Geliştirme ortamında backend, `DEV_ADMIN_*` ayarlarından bir admin
hesabı oluşturabilir.

### Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | Geliştirme sunucusunu başlatır |
| `pnpm build` | Tip kontrolü yapar ve production için derler |
| `pnpm lint` | ESLint'i çalıştırır |
| `pnpm preview` | Production derlemesini önizler |

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
