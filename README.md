# 💰 budget-tracker

![Budget Tracker](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Cebimden+Budget+Tracker)

## 🎯 Proje Özeti

Next.js, Drizzle ORM ve Clerk Auth kullanılarak geliştirilmiş modern bir bütçe takip uygulaması. Gelir ve giderlerinizi takip edin, harcama trendlerinizi analiz edin.

**Temel Özellikler:**

- 🔐 Güvenli kullanıcı kimlik doğrulama
- 💳 Kategori bazlı bütçe yönetimi
- 📊 İnteraktif grafikler ve analiz
- 📱 Responsive tasarım

## 🛠️ Teknoloji Stack

### Frontend

- **Next.js 15** - React framework (App Router)
- **Tailwind CSS** - Modern CSS framework
- **shadcn/ui** - UI komponent kütüphanesi
- **Recharts** - Grafik görselleştirme

### Backend & Database

- **Drizzle ORM** - Type-safe SQL ORM
- **PostgreSQL** - Veritabanı (Neon serverless)
- **Clerk** - Kimlik doğrulama

## 🚀 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/[kullanıcı-adınız]/budget-tracker.git

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
DATABASE_URL=your_database_url

# Veritabanını ayarlayın
npm run db:push

# Projeyi çalıştırın
npm run dev
```

## 📁 Proje Yapısı

```
budget-tracker/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Kimlik doğrulama
│   ├── (routes)/dashboard/ # Ana uygulama
│   └── _components/       # Paylaşılan bileşenler
├── components/ui/         # UI bileşenleri
├── utils/                 # Database config
└── middleware.ts          # Auth middleware
```

## 🌐 Demo

**Canlı Demo:** [Vercel'de görüntüle](#)  
**Kaynak Kod:** [GitHub'da görüntüle](#)

---

### 📧 İletişim

**E-posta:** [oguzkoc98@gmail.com]  
**LinkedIn:** [LinkedIn Profiliniz]  
**GitHub:** [GitHub Profiliniz]
