import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', icon: 'home', label: 'หน้าแรก' },
  { path: '/bet', icon: 'confirmation_number', label: 'แทงหวย' },
  { path: '/results', icon: 'emoji_events', label: 'ผลรางวัล' },
  { path: '/wallet', icon: 'account_balance_wallet', label: 'กระเป๋า' },
  { path: '/profile', icon: 'person', label: 'โปรไฟล์' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 pb-6 pt-3">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-2xl">
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
