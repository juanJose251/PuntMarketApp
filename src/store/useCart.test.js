import { describe, it, expect } from 'vitest'
import { cartReducer, initialCart } from './useCart'

const apple = { id: 'a', name: 'Manzana', price: 2, stock: 3 }

describe('cartReducer', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const s = cartReducer(initialCart, { type: 'add', product: apple })
    expect(s.items).toEqual([
      { productId: 'a', name: 'Manzana', price: 2, quantity: 1, subtotal: 2 },
    ])
  })

  it('suma cantidad al agregar el mismo producto', () => {
    let s = cartReducer(initialCart, { type: 'add', product: apple })
    s = cartReducer(s, { type: 'add', product: apple })
    expect(s.items[0].quantity).toBe(2)
    expect(s.items[0].subtotal).toBe(4)
  })

  it('no pasa del stock disponible y devuelve un error', () => {
    let s = initialCart
    for (let i = 0; i < 3; i++) s = cartReducer(s, { type: 'add', product: apple })
    s = cartReducer(s, { type: 'add', product: apple })
    expect(s.items[0].quantity).toBe(3)
    expect(s.error.message).toMatch(/Stock insuficiente/)
  })

  it('changeQuantity baja, sube y elimina al llegar a 0', () => {
    let s = cartReducer(initialCart, { type: 'add', product: apple })
    s = cartReducer(s, { type: 'changeQuantity', productId: 'a', delta: 1, stock: 3 })
    expect(s.items[0].quantity).toBe(2)
    s = cartReducer(s, { type: 'changeQuantity', productId: 'a', delta: -2, stock: 3 })
    expect(s.items).toHaveLength(0)
  })

  it('changeQuantity respeta el stock', () => {
    let s = cartReducer(initialCart, { type: 'add', product: apple })
    s = cartReducer(s, { type: 'changeQuantity', productId: 'a', delta: 5, stock: 3 })
    expect(s.items[0].quantity).toBe(1)
    expect(s.error).not.toBeNull()
  })

  it('remove y clear vacían el carrito', () => {
    const s = cartReducer(initialCart, { type: 'add', product: apple })
    expect(cartReducer(s, { type: 'remove', productId: 'a' }).items).toHaveLength(0)
    expect(cartReducer(s, { type: 'clear' }).items).toHaveLength(0)
  })
})
