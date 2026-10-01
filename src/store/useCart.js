import { useReducer, useMemo, useCallback } from 'react'

// Reducer puro: facil de probar sin montar componentes.
// El stock se valida aqui con el campo `stock` que viaja en la accion.
// `error` es un objeto nuevo en cada rechazo para que la UI avise aunque el mensaje se repita.
export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product } = action
      const existing = state.items.find((i) => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          return { ...state, error: { message: `Stock insuficiente de "${product.name}"` } }
        }
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
              : i,
          ),
          error: null,
        }
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
          },
        ],
        error: null,
      }
    }

    case 'changeQuantity': {
      const { productId, delta, stock } = action
      const item = state.items.find((i) => i.productId === productId)
      if (!item) return state
      const quantity = item.quantity + delta
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.productId !== productId), error: null }
      }
      if (stock !== undefined && quantity > stock) {
        return { ...state, error: { message: `Stock insuficiente de "${item.name}"` } }
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price } : i,
        ),
        error: null,
      }
    }

    case 'remove':
      return { items: state.items.filter((i) => i.productId !== action.productId), error: null }

    case 'clear':
      return { items: [], error: null }

    default:
      return state
  }
}

export const initialCart = { items: [], error: null }

export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, initialCart)

  const total = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items],
  )

  const addItem = useCallback((product) => dispatch({ type: 'add', product }), [])
  const changeQuantity = useCallback(
    (productId, delta, stock) => dispatch({ type: 'changeQuantity', productId, delta, stock }),
    [],
  )
  const removeItem = useCallback((productId) => dispatch({ type: 'remove', productId }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  return { items: state.items, error: state.error, total, addItem, changeQuantity, removeItem, clear }
}
