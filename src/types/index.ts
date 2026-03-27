export interface User {
  id: string
  phone: string
  pin: string
  name: string
  full_name?: string
  role: string
  status: string
  balance: number
  vip_level?: number
  bank_name?: string
  account_number?: string
  turnover?: number
  affiliate_balance?: number
  referrer_id: string | null
  referral_code: string | null
  created_at: string
  updated_at?: string
}

export interface LotteryType {
  id: string
  full_name: string
  short_name: string
  image_url: string
  is_popular: boolean
  video_url: string
  is_active: boolean
  sort_order: number
}

export interface Bet {
  id: number
  user_id: string
  lottery_type: string
  lottery_name?: string
  lottery_code?: string
  draw_date: string
  bet_type: BetType
  number: string
  amount: number
  payout_rate: number
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded'
  win_amount: number
  settled_at: string | null
  created_at: string
}

export type BetType = '4top' | '3top' | '3tod' | '2top' | '2under' | 'run_top' | 'run_under'

export interface BetSlip {
  lottery_code: string
  lottery_name: string
  draw_date: string
  bet_type: BetType
  number: string
  amount: number
  payout_rate: number
}

export interface LotteryResult {
  id?: number
  lottery_type: string
  draw_date: string
  main: string
  two_top: string
  two_bottom: string
  three_top: string
  three_front1?: string
  three_front2?: string
  three_back1?: string
  three_back2?: string
  four_digit?: string
  status: 'pending' | 'published'
  published_at: string | null
  created_at?: string
}

export interface Transaction {
  id: number
  user_id: string
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'refund' | 'bonus' | 'affiliate' | 'adjustment'
  amount: number
  balance_before: number
  balance_after: number
  note: string | null
  status: string
  created_at: string
}

export interface Deposit {
  id: number
  user_id: string
  amount: number
  bonus_amount: number
  promo_code: string | null
  slip_image_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled'
  created_at: string
}

export interface Withdrawal {
  id: number
  user_id: string
  amount: number
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
}

export interface Promotion {
  id: string
  name: string
  description: string
  min_deposit: number
  max_bonus: number
  bonus_percentage: number
  turnover_requirement?: number
  is_active: boolean
}

export interface Bank {
  code: string
  name: string
  image_url: string
  is_active: boolean
}

export interface Slider {
  id: string
  title: string
  image_url: string
  link_url: string
  sort_order: number
  is_active: boolean
}

export interface Trending {
  id: string
  title: string
  image_url: string
  link_url: string
  is_active: boolean
}

export interface Article {
  id: string
  title: string
  content: string
  image_url: string
  is_active: boolean
}
