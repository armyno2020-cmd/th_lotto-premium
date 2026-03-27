import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function Layout() {
  const location = useLocation()
  const hideNavPaths = ['/login', '/register']
  const showNav = !hideNavPaths.includes(location.pathname)

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="pb-24 pt-16">
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
