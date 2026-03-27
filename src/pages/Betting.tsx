import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCountdown } from '../hooks/useLottery'
import type { BetSlip, BetType } from '../types'
import toast from 'react-hot-toast'

const BET_TYPES = [
  { key: '4top', label: '4 ตัวตรง', payout: 6000, digits: 4 },
  { key: '3top', label: '3 ตัวบน', payout: 900, digits: 3 },
  { key: '3tod', label: '3 ตัวโต๊ด', payout: 150, digits: 3 },
  { key: '2top', label: '2 ตัวบน', payout: 95, digits: 2 },
  { key: '2under', label: '2 ตัวล่าง', payout: 95, digits: 2 },
  { key: 'run_top', label: 'วิ่งบน', payout: 3.2, digits: 1 },
  { key: 'run_under', label: 'วิ่งล่าง', payout: 4.2, digits: 1 },
]

interface LotteryType {
  id: string
  full_name: string
  short_name: string
  image_url: string
}

export default function Betting() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [lotteryTypes, setLotteryTypes] = useState<LotteryType[]>([])
  const [selectedType, setSelectedType] = useState<LotteryType | null>(null)
  const [selectedBetType, setSelectedBetType] = useState<BetType>('3top')
  const [inputNumber, setInputNumber] = useState('')
  const [betAmount, setBetAmount] = useState(100)
  const [slips, setSlips] = useState<BetSlip[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    fetchLotteryTypes()
  }, [])

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam && lotteryTypes.length > 0) {
      const found = lotteryTypes.find(t => t.id === typeParam)
      if (found) setSelectedType(found)
    }
  }, [searchParams, lotteryTypes])

  const fetchLotteryTypes = async () => {
    try {
      const { data } = await supabase
        .from('lottery_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (data) setLotteryTypes(data)
    } catch (err) {
      console.error('Error fetching lottery types:', err)
    }
  }

  const getNextDrawTime = useCallback(() => {
    if (!selectedType) return null
    const now = new Date()
    now.setHours(18, 0, 0, 0)
    if (now <= new Date()) {
      now.setDate(now.getDate() + 1)
    }
    return now
  }, [selectedType])

  const countdown = useCountdown(getNextDrawTime())

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  const getDigitsRequired = (type: BetType): number => {
    const bet = BET_TYPES.find(b => b.key === type)
    return bet?.digits || 3
  }

  const handleNumberInput = (num: string) => {
    const requiredDigits = getDigitsRequired(selectedBetType)
    if (inputNumber.length < requiredDigits) {
      const newNumber = inputNumber + num
      setInputNumber(newNumber)
      if (newNumber.length === requiredDigits) {
        playSuccessSound()
        setTimeout(() => addToSlip(newNumber), 200)
      }
    }
  }

  const handleBackspace = () => {
    setInputNumber(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setInputNumber('')
  }

  const addToSlip = (number: string) => {
    if (!selectedType) return
    const betType = BET_TYPES.find(b => b.key === selectedBetType)
    if (!betType) return

    const today = new Date().toISOString().split('T')[0]

    setSlips(prev => {
      const existing = prev.find(
        s => s.number === number && s.bet_type === selectedBetType && s.lottery_code === selectedType.id
      )

      if (existing) {
        return prev.map(s =>
          s === existing ? { ...s, amount: s.amount + betAmount } : s
        )
      }

      return [...prev, {
        lottery_code: selectedType.id,
        lottery_name: selectedType.full_name,
        draw_date: today,
        bet_type: selectedBetType,
        number,
        amount: betAmount,
        payout_rate: betType.payout
      }]
    })

    setInputNumber('')
    toast.success(`เพิ่ม ${number} เข้าโพยแล้ว`)
  }

  const removeSlip = (index: number) => {
    setSlips(prev => prev.filter((_, i) => i !== index))
  }

  const getTotalAmount = () => {
    return slips.reduce((sum, slip) => sum + slip.amount, 0)
  }

  const handlePlaceBet = async () => {
    if (slips.length === 0) {
      toast.error('กรุณาเลือกหมายเลขที่ต้องการแทง')
      return
    }

    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบ')
      navigate('/login')
      return
    }

    if (user.balance < getTotalAmount()) {
      toast.error('ยอดเงินไม่เพียงพอ')
      return
    }

    setLoading(true)

    try {
      for (const slip of slips) {
        const { error } = await supabase
          .from('bets')
          .insert({
            user_id: user.id,
            lottery_type: slip.lottery_code,
            draw_date: slip.draw_date,
            bet_type: slip.bet_type,
            number: slip.number,
            amount: slip.amount,
            payout_rate: slip.payout_rate,
            status: 'pending'
          })

        if (error) throw error
      }

      const newBalance = user.balance - getTotalAmount()
      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id)

      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'bet',
          amount: -getTotalAmount(),
          balance_before: user.balance,
          balance_after: newBalance,
          note: `แทงหวย ${slips.length} รายการ`
        })

      toast.success(`ส่งโพยสำเร็จ ${slips.length} รายการ`)
      setSlips([])
      setShowConfirmModal(false)
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const requiredDigits = getDigitsRequired(selectedBetType)
  const selectedBetTypeInfo = BET_TYPES.find(b => b.key === selectedBetType)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">arrow_back_ios_new</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">แทงหวย</h1>
            <div className="w-10"></div>
          </div>

          <select
            value={selectedType?.id || ''}
            onChange={(e) => {
              const found = lotteryTypes.find(t => t.id === e.target.value)
              setSelectedType(found || null)
              setSlips([])
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-green-500 outline-none"
          >
            <option value="">เลือกหวย</option>
            {lotteryTypes.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>

          {selectedType && (
            <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl p-3">
              <div className="flex items-center gap-3">
                {selectedType.image_url && (
                  <img src={selectedType.image_url} alt={selectedType.full_name} className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-bold text-slate-900">{selectedType.full_name}</p>
                  <p className="text-xs text-slate-500">ปิดรับแทง: 18:00 น.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col items-center bg-white rounded-lg px-2 py-1 shadow-sm">
                  <span className="text-lg font-black text-slate-900">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400">ชม.</span>
                </div>
                <span className="text-lg font-black text-slate-300">:</span>
                <div className="flex flex-col items-center bg-white rounded-lg px-2 py-1 shadow-sm">
                  <span className="text-lg font-black text-slate-900">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400">นาที</span>
                </div>
                <span className="text-lg font-black text-slate-300">:</span>
                <div className="flex flex-col items-center bg-white rounded-lg px-2 py-1 shadow-sm">
                  <span className="text-lg font-black text-red-500">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400">วิ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedType && (
          <div className="p-4 bg-white border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3">เลือกประเภทการแทง</h3>
            <div className="grid grid-cols-4 gap-2">
              {BET_TYPES.map(bt => (
                <button
                  key={bt.key}
                  onClick={() => {
                    setSelectedBetType(bt.key as BetType)
                    setInputNumber('')
                  }}
                  className={`p-2 rounded-xl text-center transition-all ${
                    selectedBetType === bt.key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{bt.label}</span>
                  <span className={`text-[9px] ${selectedBetType === bt.key ? 'text-white/80' : 'text-slate-400'}`}>
                    {bt.payout}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedType && (
          <div className="p-4">
            <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-3xl p-6">
              <p className="text-center text-xs font-bold text-green-600 mb-4">
                {selectedBetTypeInfo?.label} ({requiredDigits} หลัก)
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {Array.from({ length: requiredDigits }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black transition-all ${
                      inputNumber[i]
                        ? 'bg-white border-2 border-green-500 shadow-lg'
                        : 'bg-slate-100 border-2 border-slate-200 animate-pulse'
                    }`}
                  >
                    {inputNumber[i] || '_'}
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-3">
                กดครบ {requiredDigits} หลักแล้วจะบันทึกอัตโนมัติ
              </p>
            </div>
          </div>
        )}

        {selectedType && (
          <div className="px-4 mb-4">
            <div className="flex gap-2 flex-wrap">
              {[10, 50, 100, 500, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    betAmount === amount
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ฿{amount}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-center font-bold"
                min={1}
              />
              <button
                onClick={() => setBetAmount(prev => prev + 100)}
                className="px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-bold"
              >
                +100
              </button>
            </div>
          </div>
        )}

        {selectedType && (
          <div className="px-4 pb-32">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(String(num))}
                  className="h-16 bg-white rounded-2xl text-2xl font-black border border-slate-100 shadow-sm active:scale-95 transition-transform"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-16 bg-red-50 text-red-500 rounded-2xl font-bold border border-red-100 active:scale-95 transition-transform text-xs"
              >
                ล้าง
              </button>
              <button
                onClick={() => handleNumberInput('0')}
                className="h-16 bg-white rounded-2xl text-2xl font-black border border-slate-100 shadow-sm active:scale-95 transition-transform"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 bg-slate-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">backspace</span>
              </button>
            </div>
          </div>
        )}

        {slips.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                <h3 className="text-xs font-bold text-slate-800">
                  รายการที่เลือก ({slips.length})
                </h3>
              </div>
              <button onClick={() => setSlips([])} className="text-[11px] font-bold text-red-500">
                ล้างทั้งหมด
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">ยอดรวม</span>
                <p className="text-2xl font-black text-amber-500">฿{getTotalAmount().toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="py-4 px-8 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-2"
              >
                <span className="material-symbols-outlined">send</span>
                ส่งโพย
              </button>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowConfirmModal(false)}>
            <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">ยืนยันการส่งโพย</h3>
                <button onClick={() => setShowConfirmModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {slips.map((slip, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="font-black text-green-600">{slip.number}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">{BET_TYPES.find(b => b.key === slip.bet_type)?.label}</span>
                        <p className="font-bold text-slate-900">฿{slip.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => removeSlip(i)} className="text-red-400">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">รวมทั้งหมด</span>
                  <span className="text-xl font-bold text-green-600">฿{getTotalAmount().toLocaleString()}</span>
                </div>
                {user && (
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-500">ยอดเงินคงเหลือ</span>
                    <span className={`font-bold ${user.balance >= getTotalAmount() ? 'text-green-500' : 'text-red-500'}`}>
                      ฿{(user.balance - getTotalAmount()).toLocaleString()}
                    </span>
                  </div>
                )}
                <button
                  onClick={handlePlaceBet}
                  disabled={loading || !!(user && user.balance < getTotalAmount())}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {loading ? 'กำลังส่งโพย...' : 'ยืนยันส่งโพย'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
