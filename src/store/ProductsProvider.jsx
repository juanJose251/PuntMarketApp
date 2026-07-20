import { useReducer, useCallback, useMemo } from 'react'
import { ProductsContext } from './ProductsContext'

const STORAGE_KEY = 'pos_products'

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Camisa', price: 15.00, stock: 50, category: 'Ropa' },
  { id: 'p2', name: 'Pantalón', price: 25.00, stock: 30, category: 'Ropa' },
  { id: 'p3', name: 'Zapatos', price: 45.00, stock: 20, category: 'Calzado' },
  { id: 'p4', name: 'Gorra', price: 10.00, stock: 40, category: 'Accesorios' },
  { id: 'p5', name: 'Bolso', price: 20.00, stock: 15, category: 'Accesorios' },
  { id: 'p6', name: 'Reloj', price: 35.00, stock: 10, category: 'Accesorios' },
  { id: 'p7', name: 'Chaqueta', price: 55.00, stock: 12, category: 'Ropa' },
  { id: 'p8', name: 'Jeans', price: 30.00, stock: 25, category: 'Ropa' },
]

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS))
    return DEFAULT_PRODUCTS
  } catch {
    return DEFAULT_PRODUCTS
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

function productsReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return [...state, action.payload]
    case 'UPDATE_PRODUCT':
      return state.map((p) => (p.id === action.payload.id ? action.payload : p))
    case 'DELETE_PRODUCT':
      return state.filter((p) => p.id !== action.payload)
    case 'DECREMENT_STOCK':
      return state.map((p) => {
        const item = action.payload.find((i) => i.id === p.id)
        return item ? { ...p, stock: p.stock - item.quantity } : p
      })
    case 'RESET':
      return action.payload
    default:
      return state
  }
}

export function ProductsProvider({ children }) {
  const [products, dispatch] = useReducer(productsReducer, null, loadProducts)

  const addProduct = useCallback((product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product })
    const updated = [...JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'), product]
    saveProducts(updated)
  }, [])

  const updateProduct = useCallback((product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product })
    const updated = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map((p) =>
      p.id === product.id ? product : p,
    )
    saveProducts(updated)
  }, [])

  const deleteProduct = useCallback((id) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
    const updated = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').filter((p) => p.id !== id)
    saveProducts(updated)
  }, [])

  const decrementStock = useCallback((items) => {
    dispatch({ type: 'DECREMENT_STOCK', payload: items })
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const updated = current.map((p) => {
      const item = items.find((i) => i.id === p.id)
      return item ? { ...p, stock: p.stock - item.quantity } : p
    })
    saveProducts(updated)
  }, [])

  const getProduct = useCallback((id) => {
    return products.find((p) => p.id === id)
  }, [products])

  const value = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    decrementStock,
    getProduct,
  }), [products, addProduct, updateProduct, deleteProduct, decrementStock, getProduct])

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}
