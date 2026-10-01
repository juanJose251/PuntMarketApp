import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Receipt, LogOut, Store } from 'lucide-react'
import DemoBanner from './DemoBanner'
import { useAuth } from '../store/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/sales', label: 'Ventas', icon: Receipt },
]

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-navy text-white font-sans">
      <DemoBanner />
      <header className="bg-dark-card shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2 text-xl font-bold text-white hover:text-blue-primary transition">
            <Store size={24} className="text-blue-primary" />
            POS App - Admin
          </Link>

          <div className="flex items-center gap-4">
            <ul className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-blue-primary text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <Icon size={16} />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <span className="text-sm text-gray-300">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-dark-card py-4 text-center text-gray-400 text-sm">
        POS App — Administración
      </footer>
    </div>
  )
}

export default AdminLayout
