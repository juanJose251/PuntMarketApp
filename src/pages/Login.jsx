import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { Store, User, ShieldCheck, ShoppingBag } from 'lucide-react'

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [role, setRole] = useState('seller')
  const [error, setError] = useState('')

  if (user) {
    const redirect = user.role === 'admin' ? '/admin' : '/seller'
    navigate(redirect, { replace: true })
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Ingresa tu nombre para continuar')
      return
    }
    login(name.trim(), role)
    navigate(role === 'admin' ? '/admin' : '/seller', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-navy px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Store size={48} className="mx-auto text-blue-primary mb-4" />
          <h1 className="text-3xl font-bold text-white">POS App</h1>
          <p className="text-gray-300 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-card rounded-2xl p-8 shadow-lg space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 rounded-lg bg-dark-navy border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Rol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  role === 'seller'
                    ? 'border-emerald-primary bg-emerald-primary/10 text-emerald-primary'
                    : 'border-white/20 bg-dark-navy text-gray-300 hover:border-emerald-primary/50'
                }`}
              >
                <ShoppingBag size={28} />
                <span className="text-sm font-medium">Vendedor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  role === 'admin'
                    ? 'border-blue-primary bg-blue-primary/10 text-blue-primary'
                    : 'border-white/20 bg-dark-navy text-gray-300 hover:border-blue-primary/50'
                }`}
              >
                <ShieldCheck size={28} />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-primary hover:bg-blue-hover text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <User size={18} />
            Entrar
          </button>

          <p className="text-xs text-gray-500 text-center">
            Demo: selecciona un rol y tu nombre para comenzar
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
