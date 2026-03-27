import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = [1000, 5000, 10000, 20000]

export default function Withdraw() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amount, setAmount] = useState(1000)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบ')
      navigate('/login')
      return
    }

    if (amount < 100) {
      toast.error('ขั้นต่ำ 100 บาท')
      return
    }

    if (amount > (user.balance || 0)) {
      toast.error('ยอดเงินไม่เพียงพอ')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending'
        })

      if (error) throw error

      toast.success('ส่งคำขอถอนเงินสำเร็จ รอตรวจสอบ 1-24 ชม.')
      navigate('/wallet')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const fee = amount * 0.01
  const netAmount = amount - fee
  const balance = user?.balance || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">arrow_back_ios_new</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">ถอนเงิน</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">ยอดเงินที่ถอนได้</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">฿</span>
              <h2 className="text-5xl font-extrabold">{balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-center text-lg font-bold text-slate-900 mb-4">
              ระบุจำนวนเงินที่ต้องการถอน
            </label>
            
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-300">฿</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-14 pr-4 py-4 text-4xl font-extrabold text-slate-900 text-center border-b-2 border-slate-100 focus:border-green-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(Math.min(q, balance))}
                  className={`py-2 rounded-lg font-bold text-sm ${
                    amount === q
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {q.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAmount(balance)}
              className="w-full py-2 bg-green-50 text-green-600 font-bold rounded-lg"
            >
              ถอนทั้งหมด
            </button>

            <p className="text-center text-slate-400 text-sm mt-4">ขั้นต่ำ 100 บาท</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">จำนวนที่ถอน</span>
              <span className="font-bold text-slate-900">฿{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ค่าธรรมเนียม (1%)</span>
              <span className="font-bold text-red-400">-฿{fee.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">ยอดที่ได้รับ</span>
              <span className="font-bold text-xl text-green-600">฿{netAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || amount < 100 || amount > balance}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการถอนเงิน'}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-xs">
            <span className="material-symbols-outlined text-base">lock</span>
            ระบบปลอดภัย 256-bit Encryption
          </div>
        </div>
      </div>
    </div>
  )
}
