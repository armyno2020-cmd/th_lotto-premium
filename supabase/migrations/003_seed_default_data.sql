-- =====================================================
-- 003_seed_default_data.sql
-- Sliders, LotteryTypes, Trending, Articles, Banks
-- =====================================================

-- SLIDERS (แบนเนอร์โปรโมชั่น)
CREATE TABLE IF NOT EXISTS sliders (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'slider_' || gen_random_uuid()::text,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sliders (id, title, image_url, link_url, sort_order, is_active) VALUES
('IDMIBO1Q6F847', 'ฝากเเรก', 'https://i.postimg.cc/pdhZ7jfv/Gemini-Generated-Image-pcscyjpcscyjpcsc.png', '', 1, true),
('IDMIBO1Q6F848', 'สมาชิกใหม่', 'https://i.postimg.cc/wMcF2dhm/Gemini-Generated-Image-b7q0pnb7q0pnb7q0.png', '', 2, true),
('IDMIBO1Q6F849', 'ฝากครบ500', 'https://i.postimg.cc/pL9zXHpJ/Gemini-Generated-Image-1xj81c1xj81c1xj8.png', '', 3, true),
('IDMIE6XU1Z857', 'ฝากต่อเนื่องครบ500', 'https://i.postimg.cc/8PpbG9Rw/Gemini-Generated-Image-f0vjasf0vjasf0vj.png', '', 4, true),
('IDMIE707S9579', 'ฝากรับ500', 'https://i.postimg.cc/kGnWnRbt/Gemini-Generated-Image-z6rfwdz6rfwdz6rf.png', '', 5, true);

-- LOTTERY TYPES (ประเภทหวย)
CREATE TABLE IF NOT EXISTS lottery_types (
    id VARCHAR(50) PRIMARY KEY,
    full_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    video_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lottery_types (id, full_name, short_name, image_url, is_popular, video_url) VALUES
('GOVT', 'หวยรัฐบาล', 'รัฐบาล', 'https://play-lh.googleusercontent.com/4pg4yiOE00PNQGeovUPxL_svNuhBej5poDY9Ts6V9Qd_BSaWwcDLv8kFbsGAq_9isuI=w240-h480-rw', true, 'https://www.youtube.com/live/b3BJhvy_IkA?si=uG1b8p8Zu7UU_HCh'),
('LAO_PAT', 'หวยลาวพัฒนา', 'ลาวพัฒนา', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/fqW29ieijwwJQMBAwWoC.png', true, 'https://www.youtube.com/watch?v=3ZWcOVO1XhQ&list=PLZ96C9biZ2ycBOLhQng3AGN5NBMhpwkfi'),
('HANOI_VIP', 'ฮานอย VIP', 'ฮานอย VIP', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/M5P6d7nXU8TwpnWCVsrw.png', true, 'https://youtu.be/MUrrdpyuIhg?si=6q-4Dmv7MDq6EwzF'),
('HANOI_NORMAL', 'ฮานอยปกติ', 'ฮานอยปกติ', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/jwEPDlOqTYJOQgbLd9F1.png', true, ''),
('HANOI_SPECIAL', 'ฮานอยพิเศษ', 'ฮานอยพิเศษ', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/NLH3aQjOcgah91nGgQIO.png', true, ''),
('MALAY', 'หวยมาเลย์', 'มาเลย์', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/fI9BcjFZ8EVJ9ZEcmf9e.png', false, 'https://youtu.be/64GNwPG1CHE?si=1G5HF28yeSH2ZRqW'),
('STOCK_DJ', 'หุ้นดาวน์โจนส์', 'ดาวโจนส์', 'https://mootelu.com/img/Thai.png', false, ''),
('STOCK_RUSSIA', 'หุ้นรัสเซีย', 'รัสเซีย', 'https://mootelu.com/img/Russia.png', false, ''),
('STOCK_UK', 'หุ้นอังกฤษ', 'อังกฤษ', 'https://mootelu.com/img/Hong-Kong.png', false, ''),
('STOCK_DE', 'หุ้นเยอรมัน', 'เยอรมัน', 'https://mootelu.com/img/En.png', false, ''),
('STOCK_KR', 'หุ้นเกาหลี', 'เกาหลี', 'https://mootelu.com/img/South-Korea.png', false, ''),
('STOCK_TW', 'หุ้นไต้หวัน', 'ไต้หวัน', 'https://mootelu.com/img/Taiwan.png', false, ''),
('STOCK_SG', 'หุ้นสิงคโปร์', 'สิงคโปร์', 'https://mootelu.com/img/Singapore.png', false, ''),
('STOCK_IN', 'หุ้นอินเดีย', 'อินเดีย', 'https://mootelu.com/img/India.png', false, ''),
('STOCK_EG', 'หุ้นอียิปต์', 'อียิปต์', 'https://mootelu.com/img/Egypt2.png', false, ''),
('STOCK_NIKKEI_AM', 'หุ้นนิเคอิเช้า', 'นิเคอิเช้า', 'https://mootelu.com/img/Japan.png', false, ''),
('STOCK_NIKKEI_PM', 'หุ้นนิเคอิบ่าย', 'นิเคอิบ่าย', 'https://mootelu.com/img/Hong-Kong.png', false, ''),
('STOCK_CHINA_AM', 'หุ้นจีนเช้า', 'จีนเช้า', 'https://mootelu.com/img/China.png', false, ''),
('STOCK_CHINA_PM', 'หุ้นจีนบ่าย', 'จีนบ่าย', 'https://mootelu.com/img/China.png', false, ''),
('STOCK_HANS_AM', 'หุ้นฮั่งเส็งเช้า', 'ฮั่งเส็งเช้า', 'https://mootelu.com/img/Japan.png', false, ''),
('STOCK_HANS_PM', 'หุ้นฮั่งเส็งบ่าย', 'ฮั่งเส็งบ่าย', 'https://mootelu.com/img/Germany.png', false, '');

-- TRENDING (มาแรง)
CREATE TABLE IF NOT EXISTS trending (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO trending (id, title, image_url, link_url, is_active) VALUES
('IDMIE4Q5UO908', 'หวยไทย 1 นาที', 'https://img5.pic.in.th/file/secure-sv1/-1-Violet-and-Yellow-Casino-Night-Party-Neon-Instagram-Post.png', 'https://effulgent-panda-9d3e0f.netlify.app/', true);

-- ARTICLES (บทความ ข่าวสาร)
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO articles (id, title, content, image_url, is_active, created_at) VALUES
('IDMIE5DU23651', '💰Kaybettim Diye Üzülme Efsane Dönüşler Zibilyonbet''de', '💰Kaybettim Diye Üzülme Efsane Dönüşler Zibilyonbet''de Yaşanır..\n\n🚀Zibilyonbe İle Kazanmak Hiç Bu Kadar Keyifli Olmamıştı!', 'https://i.pinimg.com/1200x/3c/05/25/3c0525428797d6fe5ced49d6884b21e9.jpg', true, '2026-02-17T14:41:09+07:00'),
('IDMIE5GL9G515', '💰Hemen yatırımınızı yapın ve %50 çevrimsiz Freebet', '🤩 %50 Çevrimsiz #Freebet Bonusu ❗️\n\n🏆#ProffBet ayrıcalığıyla spor bahislerinizde daha fazla kazanç!\n\n💰Hemen yatırımınızı yapın ve %50 çevrimsiz Freebet bonusunuzun tadını çıkarın 🎊', 'https://i.pinimg.com/736x/1a/9c/ac/1a9cac40743ca358820342a25bf313d0.jpg', true, '2026-02-17T14:40:56+07:00'),
('IDMIE5J4PX027', 'WetteCO Slot Casino Banner', 'WetteCO Slot Casino Banner - WetteCo Grafik Ajansı', 'https://i.pinimg.com/736x/53/ba/17/53ba17dcd28fd35f37dd2f0ae7da00aa.jpg', true, '2026-02-17T14:40:38+07:00'),
('IDMIE5DU23654', '💰Kaybettim Diye Üzülme Efsane Dönüşler', '💰Kaybettim Diye Üzülme Efsane Dönüşler Zibilyonbet''de Yaşanır..\n\n🚀Zibilyonbe İle Kazanmak Hiç Bu Kadar Keyifli Olmamıştı!', 'https://i.pinimg.com/1200x/3c/05/25/3c0525428797d6fe5ced49d6884b21e9.jpg', true, '2025-12-20T14:42:37+07:00');

-- BANKS (ธนาคาร)
CREATE TABLE IF NOT EXISTS banks (
    code VARCHAR(20) PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO banks (code, name, image_url) VALUES
('KBANK', 'ธนาคารกสิกรไทย', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/gtF5IDygx1zHFrvTDBiu.png'),
('SCB', 'ธนาคารไทยพาณิชย์', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/dGQJLcLaQtPtYTgIgJdd.png'),
('BBL', 'ธนาคารกรุงเทพ', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/c3T2psxLLJtZwwDseqKG.png'),
('KTB', 'ธนาคารกรุงไทย', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/4movMnyEyWRBPCaETXn4.png'),
('BAY', 'ธนาคารกรุงศรีอยุธยา', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/maEffC5eZbdRU2P3Gdrx.png'),
('TTB', 'ธนาคารทหารไทยธนชาต', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/WCWm131YEuE6DP34eQ4v.png'),
('UOB', 'ธนาคารยูโอบี จำกัด (มหาชน)', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/wwEp4Vv5gC7z4GguQ3Cy.png'),
('LH_BANK', 'ธนาคารแลนด์ แอนด์ เฮาส์', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/zZQWJJw2WXtgxunLF0el.png'),
('CIMB', 'ธนาคารซีไอเอ็มบี ไทย', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/cEWEtvTGrWoGv0OvSBWa.png'),
('TISCO', 'ธนาคารทิสโก้', 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_tisco@2x.png'),
('BAAC', 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/nwz3ja6Sr68cSIeNfMgf.png'),
('GSB', 'ธนาคารออมสิน', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/gFsfJZ3I3iPOU2N1S4Kb.png'),
('CITI', 'ธนาคารซิตี้แบงก์', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/HXSK7fWSB6c8CmXz6oDh.png'),
('UOB_TMRW', 'UOB TMRW Thailand', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/yaPxU7sAG5PnSFwWD8s8.png'),
('THAICREDIT', 'Thai Credit Bank', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/fIcX46U3BZWeQ0Vd06ZY.png'),
('GHB', 'ธนาคารอาคารสงเคราะห์', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/y9T8zU40jwXzk1YxZhSc.png'),
('IBANK', 'ธนาคารอิสลามแห่งประเทศไทย', 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/BIBiBkYsPoqUOnxy5hR5.png');
