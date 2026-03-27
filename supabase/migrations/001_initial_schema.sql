-- =====================================================
-- TH-LOTTO Premium V7.5.0 - Database Schema
-- =====================================================

-- 1. Profiles: User accounts and balances
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  phone text unique not null,
  full_name text not null default '',
  bank_name text not null default '',
  account_number text not null default '',
  account_name text,
  balance numeric(15,2) default 0.00,
  affiliate_balance numeric(15,2) default 0.00,
  referrer_id uuid references profiles(id),
  pin_hash text,
  role text default 'user' check (role in ('user', 'admin', 'super_admin')),
  vip_level text default 'Bronze' check (vip_level in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  status text default 'active' check (status in ('active', 'suspended', 'banned')),
  youtube_link text,
  turnover numeric(15,2) default 0.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Lottery Configs: All lottery types with schedules and rates
create table if not exists lottery_configs (
  code text primary key,
  display_name text not null,
  category text not null check (category in ('GOV', 'LAO', 'HANOI', 'MALAY', 'STOCK', 'SET')),
  description text,
  schedule jsonb not null default '{"open": "06:00", "close": "18:00", "days": [0,1,2,3,4,5,6]}',
  rates jsonb not null default '{"4top": 6000, "3top": 900, "3tod": 150, "2top": 95, "2under": 95, "run_top": 3.2, "run_under": 4.2}',
  status text default 'opening' check (status in ('opening', 'closed', 'settling', 'result')),
  is_popular boolean default false,
  is_active boolean default true,
  image_url text,
  youtube_live_url text,
  min_bet numeric(10,2) default 1.00,
  max_bet numeric(10,2) default 100000.00,
  draw_times text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Bets: All betting records
create table if not exists bets (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  lottery_code text references lottery_configs(code),
  draw_date date not null,
  bet_type text not null check (bet_type in ('4top', '3top', '3tod', '2top', '2under', 'run_top', 'run_under')),
  number text not null,
  amount numeric(10,2) not null check (amount > 0),
  payout_rate numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'won', 'lost', 'cancelled', 'refunded')),
  win_amount numeric(15,2) default 0.00,
  settled_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 4. Lottery Results: All drawn results
create table if not exists lottery_results (
  id bigint generated always as identity primary key,
  lottery_code text references lottery_configs(code),
  draw_date date not null,
  draw_time time,
  raw_result text,
  u2_result text,
  f3_result text,
  b3_result text,
  stock_close text,
  stock_open text,
  stock_value text,
  stock_change text,
  youtube_url text,
  is_settled boolean default false,
  is_live boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(lottery_code, draw_date)
);

-- 5. Transactions: All financial transactions
create table if not exists transactions (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdraw', 'bet', 'win', 'refund', 'bonus', 'affiliate', 'adjustment', 'wheel_prize')),
  amount numeric(15,2) not null,
  balance_before numeric(15,2) not null,
  balance_after numeric(15,2) not null,
  reference_id text,
  reference_type text,
  status text default 'completed' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  note text,
  created_at timestamp with time zone default now()
);

-- 6. Deposits: Deposit requests
create table if not exists deposits (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(15,2) not null check (amount > 0),
  bonus_amount numeric(15,2) default 0.00,
  promo_code text,
  slip_image_url text,
  transaction_ref text,
  countdown_expires_at timestamp with time zone,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  admin_id uuid references profiles(id),
  admin_note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 7. Withdrawals: Withdrawal requests
create table if not exists withdrawals (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(15,2) not null check (amount > 0),
  fee numeric(15,2) default 0.00,
  net_amount numeric(15,2) not null,
  status text default 'pending' check (status in ('pending', 'processing', 'approved', 'rejected', 'cancelled')),
  admin_id uuid references profiles(id),
  admin_note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 8. Promotions: Active promotions
create table if not exists promotions (
  id bigint generated always as identity primary key,
  code text unique not null,
  title text not null,
  description text,
  type text not null check (type in ('deposit_bonus', 'cashback', 'affiliate', 'special')),
  bonus_percentage numeric(5,2) not null,
  bonus_max_amount numeric(15,2),
  min_deposit numeric(15,2) default 0,
  turnover_requirement numeric(5,2) default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 9. Announcements: System announcements
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text not null,
  content text,
  type text default 'info' check (type in ('info', 'warning', 'maintenance', 'promotion')),
  priority integer default 0,
  is_active boolean default true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 10. Wheel Prizes: Lucky wheel prizes
create table if not exists wheel_prizes (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  prize_type text not null check (prize_type in ('balance', 'bonus', 'credit', 'none')),
  prize_value numeric(15,2) default 0,
  weight integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 11. Wheel Spins: User wheel spin history
create table if not exists wheel_spins (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  prize_id bigint references wheel_prizes(id),
  prize_name text,
  prize_value numeric(15,2) default 0,
  created_at timestamp with time zone default now()
);

-- 12. System Settings: Global settings
create table if not exists system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to add balance to user
create or replace function add_balance(
  user_uuid uuid,
  amount numeric,
  transaction_type text,
  reference_id text default null,
  note_text text default null
) returns numeric as $$
declare
  current_balance numeric;
  new_balance numeric;
begin
  -- Get current balance
  select balance into current_balance from profiles where id = user_uuid;
  
  if current_balance is null then
    raise exception 'User not found';
  end if;
  
  -- Calculate new balance
  new_balance := current_balance + amount;
  
  -- Update profile balance
  update profiles set balance = new_balance, updated_at = now() where id = user_uuid;
  
  -- Create transaction record
  insert into transactions (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, note)
  values (user_uuid, transaction_type, amount, current_balance, new_balance, reference_id, transaction_type, note_text);
  
  return new_balance;
end;
$$ language plpgsql security definer;

-- Function to deduct balance from user
create or replace function deduct_balance(
  user_uuid uuid,
  amount numeric,
  transaction_type text,
  reference_id text default null,
  note_text text default null
) returns numeric as $$
declare
  current_balance numeric;
  new_balance numeric;
begin
  -- Get current balance
  select balance into current_balance from profiles where id = user_uuid;
  
  if current_balance is null then
    raise exception 'User not found';
  end if;
  
  if current_balance < amount then
    raise exception 'Insufficient balance';
  end if;
  
  -- Calculate new balance
  new_balance := current_balance - amount;
  
  -- Update profile balance
  update profiles set balance = new_balance, updated_at = now() where id = user_uuid;
  
  -- Create transaction record
  insert into transactions (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, note)
  values (user_uuid, transaction_type, -amount, current_balance, new_balance, reference_id, transaction_type, note_text);
  
  return new_balance;
end;
$$ language plpgsql security definer;

-- Function to update VIP level based on turnover
create or replace function update_vip_level(user_uuid uuid) returns text as $$
declare
  user_turnover numeric;
  new_level text;
begin
  select turnover into user_turnover from profiles where id = user_uuid;
  
  if user_turnover >= 1000000 then
    new_level := 'Diamond';
  elsif user_turnover >= 500000 then
    new_level := 'Platinum';
  elsif user_turnover >= 100000 then
    new_level := 'Gold';
  elsif user_turnover >= 50000 then
    new_level := 'Silver';
  else
    new_level := 'Bronze';
  end if;
  
  update profiles set vip_level = new_level where id = user_uuid;
  
  return new_level;
end;
$$ language plpgsql security definer;

-- Function to process affiliate commission
create or replace function process_affiliate_commission(
  referrer_uuid uuid,
  bet_amount numeric
) returns void as $$
declare
  commission_rate numeric := 0.05; -- 5% commission
  commission_amount numeric;
begin
  commission_amount := bet_amount * commission_rate;
  
  if commission_amount > 0 then
    update profiles 
    set affiliate_balance = affiliate_balance + commission_amount 
    where id = referrer_uuid;
    
    insert into transactions (user_id, type, amount, balance_before, balance_after, reference_type, note)
    select 
      referrer_uuid, 
      'affiliate', 
      commission_amount,
      affiliate_balance - commission_amount,
      affiliate_balance,
      'bet',
      'Commission from bet'
    from profiles where id = referrer_uuid;
  end if;
end;
$$ language plpgsql security definer;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_lottery_configs_updated_at
  before update on lottery_configs
  for each row execute function update_updated_at_column();

create trigger update_lottery_results_updated_at
  before update on lottery_results
  for each row execute function update_updated_at_column();

create trigger update_deposits_updated_at
  before update on deposits
  for each row execute function update_updated_at_column();

create trigger update_withdrawals_updated_at
  before update on withdrawals
  for each row execute function update_updated_at_column();

create trigger update_system_settings_updated_at
  before update on system_settings
  for each row execute function update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_bets_user_id on bets(user_id);
create index if not exists idx_bets_lottery_code on bets(lottery_code);
create index if not exists idx_bets_draw_date on bets(draw_date);
create index if not exists idx_bets_status on bets(status);
create index if not exists idx_bets_user_date on bets(user_id, draw_date);

create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_type on transactions(type);
create index if not exists idx_transactions_created_at on transactions(created_at desc);

create index if not exists idx_lottery_results_code on lottery_results(lottery_code);
create index if not exists idx_lottery_results_date on lottery_results(draw_date desc);
create index if not exists idx_lottery_results_settled on lottery_results(is_settled);

create index if not exists idx_deposits_user_id on deposits(user_id);
create index if not exists idx_deposits_status on deposits(status);

create index if not exists idx_withdrawals_user_id on withdrawals(user_id);
create index if not exists idx_withdrawals_status on withdrawals(status);

create index if not exists idx_profiles_referrer on profiles(referrer_id);
create index if not exists idx_profiles_phone on profiles(phone);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table profiles enable row level security;
alter table bets enable row level security;
alter table transactions enable row level security;
alter table deposits enable row level security;
alter table withdrawals enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Bets policies
create policy "Users can view own bets"
  on bets for select
  using (auth.uid() = user_id);

create policy "Users can create own bets"
  on bets for insert
  with check (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

-- Deposits policies
create policy "Users can view own deposits"
  on deposits for select
  using (auth.uid() = user_id);

create policy "Users can create deposits"
  on deposits for insert
  with check (auth.uid() = user_id);

-- Withdrawals policies
create policy "Users can view own withdrawals"
  on withdrawals for select
  using (auth.uid() = user_id);

create policy "Users can create withdrawals"
  on withdrawals for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- INITIAL DATA: Default Settings
-- =====================================================

insert into system_settings (key, value) values
  ('app_name', '{"th": "TH-LOTTO Premium", "en": "TH-LOTTO Premium"}'),
  ('maintenance_mode', '{"enabled": false, "message": ""}'),
  ('referral_commission_rate', '{"rate": 5, "min_turnover": 1000}'),
  ('withdrawal_fee', '{"percentage": 1, "min_fee": 20, "max_fee": 100}')
on conflict (key) do nothing;
