import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Slider {
  id: string
  title: string
  image_url: string
  link_url: string
}

interface LotteryType {
  id: string
  full_name: string
  short_name: string
  image_url: string
  is_popular: boolean
  video_url: string
}

interface Trending {
  id: string
  title: string
  image_url: string
  link_url: string
}

interface LotteryResult {
  lottery_type: string
  draw_date: string
  main: string
  two_top: string
  two_bottom: string
  three_top: string
}

interface Promotion {
  id: string
  name: string
  description: string
  min_deposit: number
  max_bonus: number
  bonus_percentage: number
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [lotteryTypes, setLotteryTypes] = useState<LotteryType[]>([])
  const [trending, setTrending] = useState<Trending[]>([])
  const [latestResult, setLatestResult] = useState<LotteryResult | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % sliders.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [sliders.length])

  const fetchData = async () => {
    try {
      const [slidersRes, typesRes, trendingRes, resultRes, promoRes] = await Promise.all([
        supabase.from('sliders').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('lottery_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('trending').select('*').eq('is_active', true),
        supabase.from('lottery_results').select('*').eq('status', 'published').order('draw_date', { ascending: false }).limit(1),
        supabase.from('promotions').select('*').eq('is_active', true)
      ])

      if (slidersRes.data) setSliders(slidersRes.data)
      if (typesRes.data) setLotteryTypes(typesRes.data)
      if (trendingRes.data) setTrending(trendingRes.data)
      if (resultRes.data && resultRes.data.length > 0) setLatestResult(resultRes.data[0])
      if (promoRes.data) setPromotions(promoRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const popularLotteries = lotteryTypes.filter(l => l.is_popular)

  const getCategory = (type: string): string => {
    if (type.includes('TH_') || type === 'GOV') return 'GOV'
    if (type.includes('LAO')) return 'LAO'
    if (type.includes('HANOI')) return 'HANOI'
    if (type.includes('MALAY')) return 'MALAY'
    if (type.includes('STOCK') || type.includes('NIKKEI') || type.includes('CHINA') || type.includes('HANGSENG')) return 'STOCK'
    return 'GOV'
  }

  const getLotteryName = (type: string): string => {
    const lottery = lotteryTypes.find(l => l.id === type)
    return lottery?.full_name || type
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderDigits = (result: string | null | undefined, size: 'sm' | 'lg' = 'sm') => {
    if (!result) return <span className="text-slate-400">---</span>
    const digits = result.replace(/\s/g, '').split('')
    const sizeClass = size === 'lg' ? 'w-8 h-8 text-lg' : 'w-6 h-6 text-xs'
    return digits.map((digit, i) => (
      <div key={i} className={`${sizeClass} bg-gradient-to-br from-green-500 to-green-700 rounded flex items-center justify-center text-white font-bold shadow`}>
        {digit}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {sliders.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sliders.map((slider) => (
              <div
                key={slider.id}
                className="min-w-full h-48 relative"
                onClick={() => slider.link_url && window.open(slider.link_url, '_blank')}
              >
                <img src={slider.image_url} alt={slider.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg">{slider.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sliders.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-4 space-y-6">
        {user && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">ยินดีต้อนรับ</p>
                <p className="font-bold text-lg">{user.full_name || user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-xs">ยอดเงินคงเหลือ</p>
                <p className="font-black text-2xl">฿{Number(user.balance || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate('/deposit')}
                className="flex-1 bg-white text-green-600 py-2.5 rounded-xl font-bold text-sm"
              >
                ฝากเงิน
              </button>
              <button
                onClick={() => navigate('/withdraw')}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                ถอนเงิน
              </button>
            </div>
          </div>
        )}

        {latestResult && (
          <Link
            to="/results"
            className="block bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-30"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">emoji_events</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{getLotteryName(latestResult.lottery_type)}</h3>
                  <p className="text-green-100 text-xs">{formatDate(latestResult.draw_date)}</p>
                </div>
              </div>
              <div className="text-center mb-3">
                <p className="text-green-100 text-[10px] mb-2">ผลรางวัล</p>
                <div className="flex justify-center gap-1">
                  {renderDigits(latestResult.main)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/20">
                <div>
                  <p className="text-green-100 text-[10px]">3 ตัว</p>
                  <p className="font-bold">{latestResult.three_top || '---'}</p>
                </div>
                <div>
                  <p className="text-green-100 text-[10px]">2 ตัวบน</p>
                  <p className="font-bold">{latestResult.two_top || '--'}</p>
                </div>
                <div>
                  <p className="text-green-100 text-[10px]">2 ตัวล่าง</p>
                  <p className="font-bold">{latestResult.two_bottom || '--'}</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {trending.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">local_fire_department</span>
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs">🔥 มาแรง</p>
                <h3 className="text-white font-bold">{trending[0].title}</h3>
              </div>
              <a 
                href={trending[0].link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-purple-600 rounded-full text-sm font-bold"
              >
                เล่นเลย
              </a>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">หวยยอดนิยม</h2>
            <Link to="/results" className="text-green-600 text-sm font-semibold">ดูทั้งหมด</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {popularLotteries.map((lottery) => (
              <div
                key={lottery.id}
                onClick={() => navigate(`/bet?type=${lottery.id}`)}
                className="min-w-[120px] bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex flex-col items-center border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-3 overflow-hidden">
                  {lottery.image_url ? (
                    <img src={lottery.image_url} alt={lottery.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-slate-400">casino</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-center text-slate-900 dark:text-white mb-2">{lottery.short_name}</h3>
                <button className="w-full bg-green-600 text-white py-2 rounded-full text-xs font-bold">
                  แทงเลย
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">ประเภทหวยทั้งหมด</h2>
          <div className="grid grid-cols-3 gap-3">
            {lotteryTypes.slice(0, 12).map((lottery) => (
              <div
                key={lottery.id}
                onClick={() => navigate(`/bet?type=${lottery.id}`)}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm flex flex-col items-center border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-2 overflow-hidden">
                  {lottery.image_url ? (
                    <img src={lottery.image_url} alt={lottery.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-xl text-slate-400">casino</span>
                  )}
                </div>
                <p className="font-semibold text-xs text-center text-slate-900 dark:text-white">{lottery.short_name}</p>
              </div>
            ))}
          </div>
        </section>

        {promotions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">โปรโมชั่นพิเศษ</h2>
            <div className="space-y-3">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{promo.name}</h3>
                      <p className="text-green-100 text-sm mt-1">{promo.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300 font-black text-2xl">{promo.bonus_percentage}%</p>
                      <p className="text-green-100 text-xs">สูงสุด ฿{promo.max_bonus?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl py-5 shadow-lg">
          <h2 className="text-white font-bold text-lg px-4 mb-4">อัตราจ่ายพิเศษ</h2>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2">
            {[
              { type: '4 ตัวตรง', rate: 6000 },
              { type: '3 ตัวบน', rate: 900 },
              { type: '3 ตัวโต๊ด', rate: 150 },
              { type: '2 ตัวบน', rate: 95 },
              { type: '2 ตัวล่าง', rate: 95 },
            ].map((item, i) => (
              <div key={i} className="min-w-[100px] bg-white rounded-xl p-3 text-center shadow-sm flex flex-col">
                <p className="text-slate-400 text-[10px] font-medium mb-1">{item.type}</p>
                <p className="text-red-500 font-bold text-xl leading-none">{item.rate}</p>
                <p className="text-slate-400 text-[10px]">บาทละ</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/deposit')}
            className="bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">add_card</span>
            </div>
            <div className="text-left">
              <p className="font-bold">ฝากเงิน</p>
              <p className="text-xs text-white/80">เติมเงินเข้าบัญชี</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="bg-blue-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div className="text-left">
              <p className="font-bold">ถอนเงิน</p>
              <p className="text-xs text-white/80">รับเงินออก</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
