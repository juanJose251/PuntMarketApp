import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../store/useAuth'

vi.mock('../store/useAuth', () => ({ useAuth: vi.fn() }))

function renderAt(user, role) {
  useAuth.mockReturnValue({ user })
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/seller" element={<p>seller home</p>} />
        <Route path="/admin" element={<p>admin home</p>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute role={role}>
              <p>secret content</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('sin sesión redirige al login', () => {
    renderAt(null, 'admin')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('con el rol correcto muestra el contenido', () => {
    renderAt({ name: 'A', role: 'admin' }, 'admin')
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('con otro rol redirige a su inicio', () => {
    renderAt({ name: 'V', role: 'seller' }, 'admin')
    expect(screen.getByText('seller home')).toBeInTheDocument()
  })
})
