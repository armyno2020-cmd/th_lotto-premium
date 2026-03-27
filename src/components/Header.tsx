import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="italic pr-0.5">TH</span>
          </div>
          <div>
            <h1 className="font-bold text-[15px] leading-tight text-slate-900 dark:text-white">TH-LOTTO</h1>
            <p className="text-green-600 text-[13px] font-medium leading-tight">Premium</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/wallet" className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">ยอดคงเหลือ</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-500 material-icons text-sm">monetization_on</span>
              <span className="font-bold text-[15px] text-slate-900 dark:text-white">
                ฿{(user.balance || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Link>
          
          <button onClick={handleLogout} className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-slate-600">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
