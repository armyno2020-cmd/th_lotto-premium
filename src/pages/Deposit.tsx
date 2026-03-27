import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCountdown } from '../hooks/useLottery'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000]

interface Bank {
  code: string
  name: string
  image_url: string
}

interface Promotion {
  id: string
  name: string
  description: string
  min_deposit: number
  max_bonus: number
  bonus_percentage: number
}

export default function Deposit() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState(500)
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(location.state?.promo || null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  const countdown = useCountdown(expiresAt)

  useEffect(() => {
    fetchBanks()
  }, [])

  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        if (new Date() >= expiresAt) {
          toast.error('หมดเวลาชำระเงิน กรุณาเริ่มใหม่')
          setStep(1)
          setExpiresAt(null)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [expiresAt])

  const fetchBanks = async () => {
    try {
      const { data } = await supabase.from('banks').select('*').eq('is_active', true)
      if (data) setBanks(data)
    } catch (err) {
      console.error('Error fetching banks:', err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์ใหญ่เกิน 5MB')
        return
      }
      setSlipFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSlipPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบ')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      let slipUrl = null

      if (slipFile) {
        const fileName = `${user.id}/${Date.now()}_${slipFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('slips')
          .upload(fileName, slipFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('slips')
          .getPublicUrl(fileName)
        
        slipUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount,
          bonus_amount: selectedPromo ? (amount * selectedPromo.bonus_percentage / 100) : 0,
          promo_code: selectedPromo?.id,
          slip_image_url: slipUrl,
          countdown_expires_at: expiresAt?.toISOString(),
          status: 'pending'
        })

      if (insertError) throw insertError

      toast.success('ส่งคำขอฝากเงินสำเร็จ รอตรวจสอบจากระบบ')
      navigate('/wallet')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const goToQRStep = () => {
    if (!selectedBank) {
      toast.error('กรุณาเลือกธนาคาร')
      return
    }
    setExpiresAt(new Date(Date.now() + 15 * 60 * 1000))
    setStep(2)
  }

  const bonusAmount = selectedPromo ? Math.min(
    (amount * selectedPromo.bonus_percentage) / 100,
    selectedPromo.max_bonus || Infinity
  ) : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">arrow_back_ios_new</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">ฝากเงิน</h1>
            <div className="w-10"></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-slate-400">ขั้นตอนที่ {step}</span>
              <span className="text-sm font-bold text-green-600">{step} / 3</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">เลือกธนาคาร</h2>
              <div className="grid grid-cols-4 gap-3">
                {banks.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedBank?.code === bank.code
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-1">
                      {bank.image_url ? (
                        <img src={bank.image_url} alt={bank.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded"></div>
                      )}
                    </div>
                    <p className="text-[10px] text-center text-slate-600 font-medium truncate">{bank.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">ระบุจำนวนเงิน</h2>
              
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-600/40">฿</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-4 text-center text-4xl font-extrabold text-slate-900 border-b-2 border-slate-100 focus:border-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(q)}
                    className={`py-3 rounded-xl font-bold text-sm ${
                      amount === q
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    +{q.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="text-center text-slate-400 text-sm">
                <span className="material-symbols-outlined text-base align-middle mr-1">info</span>
                ขั้นต่ำ 100 บาท
              </div>
            </div>

            {selectedPromo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">stars</span>
                  <div>
                    <p className="font-bold text-amber-700">{selectedPromo.name}</p>
                    <p className="text-xs text-amber-600">
                      รับโบนัส {selectedPromo.bonus_percentage}% 
                      {selectedPromo.max_bonus && ` สูงสุด ${selectedPromo.max_bonus.toLocaleString()} บาท`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={goToQRStep}
              disabled={amount < 100 || !selectedBank}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}

        {step === 2 && expiresAt && (
          <div className="p-4 space-y-4">
            <div className="text-center mb-4">
              <p className="text-slate-500 text-sm mb-1">ยอดชำระทั้งหมด</p>
              <h2 className="text-5xl font-extrabold text-slate-900">฿{amount.toLocaleString()}</h2>
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-slate-100" cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="8"/>
                  <circle 
                    className="text-green-600" 
                    cx="56" cy="56" r="50" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8"
                    strokeDasharray={`${Math.max(0, (countdown.total / (15 * 60 * 1000)) * 314)} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">หมดเวลาใน</p>
                    <p className="text-2xl font-black text-slate-900">
                      {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {selectedBank && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  {selectedBank.image_url && (
                    <img src={selectedBank.image_url} alt={selectedBank.name} className="w-10 h-10 object-contain" />
                  )}
                  <div>
                    <p className="text-xs text-slate-500">โอนไปยัง</p>
                    <p className="font-bold text-slate-900">{selectedBank.name}</p>
                  </div>
                </div>
              )}
              
              <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <div className="text-center text-slate-400">
                  <span className="material-symbols-outlined text-6xl mb-2">qr_code</span>
                  <p className="text-sm">QR Code</p>
                  <p className="text-xs mt-2">PromptPay</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">ชื่อบัญชี</p>
                  <p className="font-bold text-slate-900">TH-LOTTO</p>
                </div>
                <button className="ml-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-green-600">
                  คัดลอก
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-lg"
              >
                โอนแล้ว อัปโหลดสลิป
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">แนบสลิปโอนเงิน</h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-green-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-green-50 transition-colors mb-4"
              >
                {slipPreview ? (
                  <div className="relative">
                    <img src={slipPreview} alt="Slip preview" className="max-h-48 mx-auto rounded-lg" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSlipFile(null)
                        setSlipPreview(null)
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2">add_a_photo</span>
                    <p className="font-semibold text-green-600">แตะเพื่ออัปโหลดสลิป</p>
                    <p className="text-xs mt-1">รองรับ JPG, PNG, PDF (สูงสุด 5MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">จำนวนเงิน</span>
                  <span className="font-bold text-slate-900">฿{amount.toLocaleString()}</span>
                </div>
                {bonusAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">โบนัส</span>
                    <span className="font-bold text-green-600">+฿{bonusAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-slate-500">รวม</span>
                  <span className="font-bold text-green-600">฿{(amount + bonusAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-amber-500">info</span>
                <p className="text-sm text-amber-700">
                  โปรดตรวจสอบความถูกต้องของสลิปก่อนกดยืนยัน
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                {loading ? 'กำลังส่ง...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
