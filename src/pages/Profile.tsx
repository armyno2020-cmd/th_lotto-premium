import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const banks = [
  { code: 'KBANK', name: 'KBank', color: '#138036' },
  { code: 'SCB', name: 'SCB', color: '#4e2e7f' },
  { code: 'BBL', name: 'BBL', color: '#1e4598' },
  { code: 'KTB', name: 'KTB', color: '#00a1e0' },
  { code: 'BAY', name: 'BAY', color: '#fec43b' },
  { code: 'TTB', name: 'TTB', color: '#003087' },
  { code: 'CIMB', name: 'CIMB', color: '#003D7A' },
]

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showEditPin, setShowEditPin] = useState(false)
  const [showEditBank, setShowEditBank] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [newBank, setNewBank] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleUpdatePin = async () => {
    if (!user) return

    if (newPin.length !== 4) {
      toast.error('รหัส PIN ต้อง 4 หลัก')
      return
    }

    if (newPin !== confirmPin) {
      toast.error('รหัส PIN ไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pin_hash: newPin })
        .eq('id', user.id)

      if (error) throw error

      toast.success('เปลี่ยนรหัส PIN สำเร็จ')
      setShowEditPin(false)
      setNewPin('')
      setConfirmPin('')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBank = async () => {
    if (!user) return

    if (!newBank || !newAccountNumber) {
      toast.error('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_name: newBank,
          account_number: newAccountNumber
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('อัปเดตข้อมูลธนาคารสำเร็จ')
      setShowEditBank(false)
      await refreshUser()
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const getVipColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'text-purple-500'
      case 'Platinum': return 'text-gray-400'
      case 'Gold': return 'text-amber-500'
      case 'Silver': return 'text-slate-400'
      default: return 'text-amber-700'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6">โปรไฟล์</h1>

      <div className="bg-gradient-to-br from-primary to-green-600 rounded-2xl p-6 text-white shadow-premium mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <h2 className="font-bold text-xl">{user.full_name || 'ผู้ใช้งาน'}</h2>
            <p className="text-white/70 text-sm">{user.phone}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${getVipColor(String(user.vip_level || 0))}`}>
              {user.vip_level === 4 ? 'diamond' :
               user.vip_level === 3 ? 'workspace_premium' :
               user.vip_level === 2 ? 'emoji_events' :
               user.vip_level === 1 ? 'stars' : 'military_tech'}
            </span>
            <span className="font-bold">{user.vip_level === 4 ? 'Diamond' :
               user.vip_level === 3 ? 'Platinum' :
               user.vip_level === 2 ? 'Gold' :
               user.vip_level === 1 ? 'Silver' : 'Bronze'}</span>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">ยอดเงิน</p>
            <p className="font-black text-2xl">฿{Number(user.balance || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">ข้อมูลบัญชี</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">phone</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">เบอร์โทรศัพท์</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{user.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">account_balance</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">ธนาคาร</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{user.bank_name || 'ยังไม่ได้ตั้งค่า'}</p>
                  <p className="text-xs text-slate-500">{user.account_number}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditBank(true)}
                className="text-primary text-sm font-semibold"
              >
                แก้ไข
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">lock</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">รหัส PIN</p>
                  <p className="font-semibold text-slate-900 dark:text-white">••••</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditPin(true)}
                className="text-primary text-sm font-semibold"
              >
                เปลี่ยน
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">สถิติ</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{Number(user.turnover || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400">ยอดเทิร์นโอเวอร์</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-500">฿{Number(user.affiliate_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400">รายได้แนะนำ</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          ออกจากระบบ
        </button>
      </div>

      {showEditPin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowEditPin(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">เปลี่ยนรหัส PIN</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">รหัส PIN ใหม่</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-[0.5em]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ยืนยันรหัส PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-[0.5em]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditPin(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdatePin}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditBank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowEditBank(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">แก้ไขข้อมูลธนาคาร</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">เลือกธนาคาร</label>
                <div className="grid grid-cols-3 gap-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => setNewBank(bank.code)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newBank === bank.code
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-100'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded mx-auto mb-1 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.name.slice(0, 3)}
                      </div>
                      <span className="text-[10px] text-slate-600">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเลขบัญชี</label>
                <input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder="xxx-x-xxxxx-x"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditBank(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdateBank}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
