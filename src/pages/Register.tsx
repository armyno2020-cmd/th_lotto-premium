import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const banks = [
  { code: 'KBANK', name: 'KBank', color: '#138036' },
  { code: 'SCB', name: 'SCB', color: '#4e2e7f' },
  { code: 'BBL', name: 'BBL', color: '#1e4598' },
  { code: 'KTB', name: 'KTB', color: '#00a1e0' },
  { code: 'BAY', name: 'BAY', color: '#fec43b' },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    phone: '',
    pin: '',
    confirmPin: '',
    full_name: '',
    referrer_code: '',
    bank_code: '',
    account_number: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleNextStep = () => {
    if (!formData.phone || !formData.pin || !formData.confirmPin || !formData.full_name) {
      toast.error('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (formData.pin.length !== 4) {
      toast.error('รหัส PIN ต้อง 4 หลัก')
      return
    }
    if (formData.pin !== formData.confirmPin) {
      toast.error('รหัส PIN ไม่ตรงกัน')
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!formData.bank_code || !formData.account_number) {
      toast.error('กรุณาเลือกธนาคารและกรอกเลขบัญชี')
      return
    }

    setLoading(true)
    const result = await register({
      phone: formData.phone,
      pin: formData.pin,
      name: formData.full_name,
      bankName: formData.bank_code,
      accountName: formData.full_name,
      accountNumber: formData.account_number,
      referralCode: formData.referrer_code || undefined,
    })
    setLoading(false)

    if (result.success) {
      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
      navigate('/login')
    } else {
      toast.error(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => step > 1 ? setStep(1) : navigate('/login')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600">arrow_back_ios_new</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900">TH-LOTTO Premium</h1>
            <span className="text-primary text-[10px] font-extrabold tracking-[0.2em]">การลงทะเบียน</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <p className="text-lg font-extrabold text-slate-900">
              {step === 1 ? 'ข้อมูลส่วนตัว' : 'ข้อมูลธนาคาร'}
            </p>
            <p className="text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-full">
              {step === 1 ? 'เสร็จสิ้น 50%' : 'เสร็จสิ้น 100%'}
            </p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">หมายเลขโทรศัพท์</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="สมชาย มุ่งมั่น"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ตั้งรหัส PIN</label>
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                    placeholder="****"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-[0.5em] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ยืนยันรหัส PIN</label>
                  <input
                    type="password"
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                    placeholder="****"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-[0.5em] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-slate-700">รหัสแนะนำ</label>
                  <span className="text-slate-400 text-xs italic">ไม่บังคับ</span>
                </div>
                <input
                  type="text"
                  value={formData.referrer_code}
                  onChange={(e) => setFormData({ ...formData, referrer_code: e.target.value })}
                  placeholder="เช่น: PREMIUM100"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-gradient-to-r from-primary to-green-500 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6"
              >
                <span>ถัดไป: ข้อมูลธนาคาร</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">เลือกธนาคารของคุณ</label>
                <div className="grid grid-cols-3 gap-3">
                  {banks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => setFormData({ ...formData, bank_code: bank.code })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.bank_code === bank.code
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.name.slice(0, 3)}
                      </div>
                      <span className="text-[10px] font-medium text-slate-700 block text-center">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">หมายเลขบัญชีธนาคาร</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="xxx-x-xxxxx-x"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  โปรดตรวจสอบให้แน่ใจว่าชื่อบัญชีตรงกับชื่อที่ลงทะเบียนไว้เพื่อป้องกันความล่าช้าในการจ่ายเงิน
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-green-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ยืนยันและสมัครสมาชิก</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-primary font-bold">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
