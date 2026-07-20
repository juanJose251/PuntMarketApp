import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import AdminLayout from '../components/AdminLayout'
import SellerLayout from '../components/SellerLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import Dashboard from '../pages/admin/Dashboard'
import AdminProducts from '../pages/admin/Products'
import AdminSales from '../pages/admin/Sales'
import POS from '../pages/seller/POS'
import SellerProducts from '../pages/seller/Products'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'sales', element: <AdminSales /> },
    ],
  },
  {
    path: '/seller',
    element: (
      <ProtectedRoute role="seller">
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <POS /> },
      { path: 'products', element: <SellerProducts /> },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
