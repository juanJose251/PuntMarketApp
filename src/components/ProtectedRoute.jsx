import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    const redirect = user.role === 'admin' ? '/admin' : '/seller'
    return <Navigate to={redirect} replace />
  }

  return children
}

export default ProtectedRoute
