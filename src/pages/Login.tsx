import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone || !pin) {
      toast.error('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    if (pin.length !== 4) {
      toast.error('รหัส PIN ต้อง 4 หลัก')
      return
    }

    setLoading(true)
    const result = await login(phone, pin)
    setLoading(false)

    if (result.success) {
      toast.success('เข้าสู่ระบบสำเร็จ')
      navigate('/')
    } else {
      toast.error(result.error || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-4 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-5xl">confirmation_number</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            TH-LOTTO <span className="text-primary">Premium</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">สัมผัสประสบการณ์ความโชคดีระดับพรีเมียม</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-premium border border-primary/10">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">ยินดีต้อนรับกลับมา</h2>
          <p className="text-slate-500 text-sm mb-6">เข้าสู่ระบบบัญชีพรีเมียมของคุณ</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                หมายเลขโทรศัพท์
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined">phone_iphone</span>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">รหัส PIN 4 หลัก</label>
                <Link to="#" className="text-xs font-bold text-primary hover:underline">ลืมรหัส PIN?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined">lock</span>
                </span>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all tracking-[0.5em] text-center font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-green-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>เข้าสู่ระบบอย่างปลอดภัย</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">ยังไม่มีบัญชีพรีเมียมใช่ไหม?</p>
          <Link
            to="/register"
            className="mt-2 text-primary font-bold flex items-center justify-center gap-1 mx-auto hover:text-green-600 transition-colors"
          >
            สมัครสมาชิกใหม่
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
