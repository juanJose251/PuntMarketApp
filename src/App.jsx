import { Toaster } from 'sonner'
import AppRouter from './router'
import { AuthProvider } from './store/AuthProvider'
import { ProductsProvider } from './store/ProductsProvider'
import { SalesProvider } from './store/SalesProvider'

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <SalesProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </SalesProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App
