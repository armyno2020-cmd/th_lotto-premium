# TH-LOTTO Premium V7.5.0

ระบบแทงหวยออนไลน์ระดับพรีเมียม พัฒนาด้วย React + Vite + Supabase

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้างไฟล์ .env

สร้างไฟล์ `.env` ใน root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. รัน Supabase Migrations

รันไฟล์ SQL ใน `supabase/migrations/001_initial_schema.sql` ใน Supabase Dashboard

### 4. Deploy Edge Functions

```bash
supabase functions deploy market-manager
supabase functions deploy scraper
supabase functions deploy settlement-engine
```

### 5. ตั้ง Cron Jobs

ตั้งค่าใน Supabase Dashboard → Database → Extensions → pg_cron:

```sql
-- อัปเดตสถานะตลาดทุก 1 นาที
SELECT cron.schedule('market-manager', '* * * * *', 
  'SELECT net.http_post(url:=current_setting(''app.settings.api_url'') || ''/functions/v1/market-manager'')');

-- ตรวจสอบผลรางวัลทุก 5 นาที
SELECT cron.schedule('scraper', '*/5 * * * *', 
  'SELECT net.http_post(url:=current_setting(''app.settings.api_url'') || ''/functions/v1/scraper'')');

-- ตั้งค่า Settlement ทุก 1 นาที
SELECT cron.schedule('settlement', '* * * * *', 
  'SELECT net.http_post(url:=current_setting(''app.settings.api_url'') || ''/functions/v1/settlement-engine'')');
```

### 6. รันโปรเจกต์

```bash
npm run dev
```

## 📁 โครงสร้างโปรเจกต์

```
th-lotto-premium/
├── src/
│   ├── components/       # React Components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── YouTubeEmbed.tsx
│   ├── pages/           # Page Components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Home.tsx
│   │   ├── Betting.tsx
│   │   ├── Results.tsx
│   │   ├── BetHistory.tsx
│   │   ├── Wallet.tsx
│   │   ├── Deposit.tsx
│   │   ├── Withdraw.tsx
│   │   └── Profile.tsx
│   ├── hooks/           # Custom Hooks
│   │   └── useLottery.ts
│   ├── context/         # React Context
│   │   └── AuthContext.tsx
│   ├── lib/            # Utilities
│   │   └── supabase.ts
│   ├── types/           # TypeScript Types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── migrations/      # Database Migrations
│   │   └── 001_initial_schema.sql
│   └── functions/        # Edge Functions
│       ├── market-manager/
│       ├── scraper/
│       └── settlement-engine/
└── public/
```

## 🎯 Features

### ระบบหวยที่รองรับ
- **หวยรัฐบาลไทย** - ออกวันที่ 1 และ 16
- **หวยลาวพัฒนา** - ออกวันจันทร์, พุธ, ศุกร์
- **ฮานอย** (VIP, ปกติ, พิเศษ) - ออกทุกวัน
- **หวยมาเลย์** - ออกวันพุธ, เสาร์, อาทิตย์
- **หวยหุ้น 20+ รายการ** - นิเคอิ, จีน, ฮั่งเส็ง, เกาหลี, ไต้หวัน, อินเดีย, อียิปต์, เยอรมัน, อังกฤษ, ดาวน์โจนส์

### ประเภทการแทง
- **4 ตัวตรง** (บาทละ 6,000)
- **3 ตัวบน** (บาทละ 900)
- **3 ตัวโต๊ด** (บาทละ 150)
- **2 ตัวบน** (บาทละ 95)
- **2 ตัวล่าง** (บาทละ 95)
- **วิ่งบน/ล่าง** (บาทละ 3.2-4.2)

### ฟีเจอร์หลัก
- ✅ ระบบลงทะเบียน/เข้าสู่ระบบ (เบอร์โทร + PIN)
- ✅ ระบบแทงหวย Real-time
- ✅ Keypad อัจฉริยะ (เปลี่ยนจำนวนหลักตามประเภท)
- ✅ เสียงแจ้งเตือนเมื่อกดครบหลัก
- ✅ ระบบฝาก-ถอนอัตโนมัติ
- ✅ Countdown Timer (15 นาทีสำหรับชำระเงิน)
- ✅ ประกาศผลอัตโนมัติ
- ✅ Settlement อัตโนมัติ (จ่ายเงินทันที)
- ✅ ระบบแนะนำเพื่อน (Affiliate)
- ✅ YouTube Live Embed
- ✅ Dark Mode Support
- ✅ Responsive Design

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols Outlined
- **Backend**: Supabase
  - PostgreSQL
  - Edge Functions
  - Realtime
  - Storage
- **Animation**: CSS Animations + Framer Motion

## 📝 License

Copyright © 2024 TH-LOTTO Premium. All rights reserved.
