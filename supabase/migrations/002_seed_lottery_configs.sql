-- =====================================================
-- TH-LOTTO Premium V7.5.0 - Lottery Configurations Seeder
-- All 20+ lottery types with schedules and rates
-- =====================================================

insert into lottery_configs (code, display_name, category, description, schedule, rates, is_popular, is_active, image_url, min_bet, max_bet) values

-- ============ GOVERNMENT LOTTERIES ============
(
  'TH_GOV',
  'หวยรัฐบาลไทย',
  'GOV',
  'หวยรัฐบาลไทย ออกวันที่ 1 และ 16 ของเดือน',
  '{"open": "06:00", "close": "15:30", "days": [1, 16], "timezone": "Asia/Bangkok"}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/th_gov.png', 1.00, 100000.00
),

-- ============ LAO LOTTERIES ============
(
  'LAO_DEV',
  'หวยลาวพัฒนา',
  'LAO',
  'หวยลาวพัฒนา ออกวันจันทร์ พุธ ศุกร์',
  '{"market_hours": [{"open": "06:00", "close": "19:30", "day_offset": 0}], "days": [1, 3, 5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/lao_dev.png', 1.00, 100000.00
),
(
  'LAO_SPECIAL',
  'หวยลาวสตาร์',
  'LAO',
  'หวยลาวสตาร์ ออกทุกวัน',
  '{"market_hours": [{"open": "06:00", "close": "19:30", "day_offset": 0}], "days": [0,1,2,3,4,5,6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/lao_star.png', 1.00, 100000.00
),
(
  'LAO_VIP',
  'หวยลาว VIP',
  'LAO',
  'หวยลาว VIP',
  '{"market_hours": [{"open": "06:00", "close": "19:30", "day_offset": 0}], "days": [0,1,2,3,4,5,6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/lao_vip.png', 1.00, 100000.00
),

-- ============ HANOI LOTTERIES ============
(
  'HANOI_SPECIAL',
  'ฮานอยพิเศษ',
  'HANOI',
  'หวยฮานอยพิเศษ ออกทุกวัน 18:30 และ 21:30',
  '{"market_hours": [{"open": "06:00", "close": "17:30", "day_offset": 0}, {"open": "06:00", "close": "20:30", "day_offset": 0}], "days": [0,1,2,3,4,5,6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/hanoi_special.png', 1.00, 100000.00
),
(
  'HANOI_VIP',
  'ฮานอย VIP',
  'HANOI',
  'หวยฮานอย VIP ออกทุกวัน',
  '{"market_hours": [{"open": "06:00", "close": "17:00", "day_offset": 0}], "days": [0,1,2,3,4,5,6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/hanoi_vip.png', 1.00, 100000.00
),
(
  'HANOI',
  'ฮานอย',
  'HANOI',
  'หวยฮานอยปกติ ออกทุกวัน',
  '{"market_hours": [{"open": "06:00", "close": "16:30", "day_offset": 0}], "days": [0,1,2,3,4,5,6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/hanoi.png', 1.00, 100000.00
),

-- ============ MALAYSIAN LOTTERIES ============
(
  'MALAY_FRIDAY',
  'มาเลย์เสาร์',
  'MALAY',
  'หวยมาเลย์ ออกวันเสาร์',
  '{"market_hours": [{"open": "06:00", "close": "17:00", "day_offset": 5}], "days": [6]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/malay.png', 1.00, 100000.00
),
(
  'MALAY_WEDNESDAY',
  'มาเลย์วันพุธ',
  'MALAY',
  'หวยมาเลย์ ออกวันพุธ',
  '{"market_hours": [{"open": "06:00", "close": "17:00", "day_offset": 2}], "days": [3]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/malay.png', 1.00, 100000.00
),
(
  'MALAY_SUNDAY',
  'มาเลย์วันอาทิตย์',
  'MALAY',
  'หวยมาเลย์ ออกวันอาทิตย์',
  '{"market_hours": [{"open": "06:00", "close": "17:00", "day_offset": 0}], "days": [0]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/malay.png', 1.00, 100000.00
),

-- ============ STOCK LOTTERIES ============
(
  'STOCK_NIKKEI_MORNING',
  'นิเคอิเช้า',
  'STOCK',
  'หวยหุ้นนิเคอิ รอบเช้า (10:00-12:30)',
  '{"market_hours": [{"open": "09:00", "close": "11:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/stock_nikkei.png', 1.00, 50000.00
),
(
  'STOCK_NIKKEI_AFTERNOON',
  'นิเคอิบ่าย',
  'STOCK',
  'หวยหุ้นนิเคอิ รอบบ่าย (13:00-15:00)',
  '{"market_hours": [{"open": "12:00", "close": "14:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_nikkei.png', 1.00, 50000.00
),
(
  'STOCK_CHINA_MORNING',
  'จีนเช้า',
  'STOCK',
  'หวยหุ้นจีน รอบเช้า',
  '{"market_hours": [{"open": "08:30", "close": "10:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_china.png', 1.00, 50000.00
),
(
  'STOCK_CHINA_AFTERNOON',
  'จีนบ่าย',
  'STOCK',
  'หวยหุ้นจีน รอบบ่าย',
  '{"market_hours": [{"open": "12:30", "close": "14:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_china.png', 1.00, 50000.00
),
(
  'STOCK_HANGSENG',
  'ฮั่งเส็ง',
  'STOCK',
  'หวยหุ้นฮั่งเส็ง',
  '{"market_hours": [{"open": "09:30", "close": "12:00", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  true, true, 'https://i.imgur.com/stock_hangseng.png', 1.00, 50000.00
),
(
  'STOCK_KOREA',
  'เกาหลี',
  'STOCK',
  'หวยหุ้นเกาหลี',
  '{"market_hours": [{"open": "08:00", "close": "10:00", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_korea.png', 1.00, 50000.00
),
(
  'STOCK_TAIWAN',
  'ไต้หวัน',
  'STOCK',
  'หวยหุ้นไต้หวัน',
  '{"market_hours": [{"open": "08:00", "close": "10:00", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_taiwan.png', 1.00, 50000.00
),
(
  'STOCK_SINGAPORE',
  'สิงคโปร์',
  'STOCK',
  'หวยหุ้นสิงคโปร์',
  '{"market_hours": [{"open": "09:00", "close": "11:00", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_singapore.png', 1.00, 50000.00
),
(
  'STOCK_INDIA',
  'อินเดีย',
  'STOCK',
  'หวยหุ้นอินเดีย',
  '{"market_hours": [{"open": "09:00", "close": "12:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_india.png', 1.00, 50000.00
),
(
  'STOCK_EGYPT',
  'อียิปต์',
  'STOCK',
  'หวยหุ้นอียิปต์',
  '{"market_hours": [{"open": "09:00", "close": "11:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_egypt.png', 1.00, 50000.00
),
(
  'STOCK_RUSSIA',
  'รัสเซีย',
  'STOCK',
  'หวยหุ้นรัสเซีย',
  '{"market_hours": [{"open": "09:00", "close": "11:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_russia.png', 1.00, 50000.00
),
(
  'STOCK_GERMANY',
  'เยอรมัน',
  'STOCK',
  'หวยหุ้นเยอรมัน',
  '{"market_hours": [{"open": "09:00", "close": "11:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_germany.png', 1.00, 50000.00
),
(
  'STOCK_ENGLAND',
  'อังกฤษ',
  'STOCK',
  'หวยหุ้นอังกฤษ',
  '{"market_hours": [{"open": "09:00", "close": "11:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_england.png', 1.00, 50000.00
),
(
  'STOCK_DJIA',
  'ดาวโจนส์',
  'STOCK',
  'หวยหุ้นดาวโจนส์',
  '{"market_hours": [{"open": "20:00", "close": "23:59", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/stock_djia.png', 1.00, 50000.00
),

-- ============ SET SPECIAL ============
(
  'SET_INDEX',
  'SET Index',
  'SET',
  'ดัชนีตลาดหุ้นไทย',
  '{"market_hours": [{"open": "09:30", "close": "12:30", "day_offset": 0}], "days": [1,2,3,4,5]}',
  '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  false, true, 'https://i.imgur.com/set_index.png', 1.00, 50000.00
)

on conflict (code) do update set
  display_name = excluded.display_name,
  category = excluded.category,
  description = excluded.description,
  schedule = excluded.schedule,
  rates = excluded.rates,
  is_popular = excluded.is_popular,
  is_active = excluded.is_active,
  min_bet = excluded.min_bet,
  max_bet = excluded.max_bet;
