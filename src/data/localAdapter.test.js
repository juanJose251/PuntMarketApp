import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalAdapter } from './localAdapter'

function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  }
}

describe('localAdapter', () => {
  let db

  beforeEach(() => {
    db = createLocalAdapter(fakeStorage())
  })

  it('siembra productos y ventas la primera vez', async () => {
    expect((await db.products.list()).length).toBe(20)
    expect((await db.sales.list()).length).toBe(30)
  })

  it('crea, actualiza y elimina productos', async () => {
    const created = await db.products.create({ name: 'Té', price: 2, stock: 5, category: 'Bebidas' })
    expect(created.id).toBeTruthy()
    expect((await db.products.list())[0].name).toBe('Té')

    const updated = await db.products.update({ ...created, price: 3, stock: 9 })
    expect(updated.price).toBe(3)
    expect(updated.stock).toBe(9)

    await db.products.remove(created.id)
    expect((await db.products.list()).find((p) => p.id === created.id)).toBeUndefined()
  })

  it('una venta descuenta stock y guarda sus items', async () => {
    const [product] = await db.products.list()
    const before = product.stock
    const saleId = await db.sales.create({
      total: product.price * 2,
      paymentMethod: 'cash',
      sellerName: 'Test',
      items: [
        { productId: product.id, name: product.name, price: product.price, quantity: 2, subtotal: product.price * 2 },
      ],
    })

    const after = (await db.products.list()).find((p) => p.id === product.id)
    expect(after.stock).toBe(before - 2)

    const sale = (await db.sales.list()).find((s) => s.id === saleId)
    expect(sale.sale_items).toHaveLength(1)
    expect(sale.seller_name).toBe('Test')
  })

  it('rechaza una venta sin stock y no cambia nada (atomicidad)', async () => {
    const [a, b] = await db.products.list()
    const salesBefore = (await db.sales.list()).length

    await expect(
      db.sales.create({
        total: 1,
        paymentMethod: 'cash',
        sellerName: 'Test',
        items: [
          { productId: a.id, name: a.name, price: a.price, quantity: 1, subtotal: a.price },
          { productId: b.id, name: b.name, price: b.price, quantity: b.stock + 1, subtotal: 0 },
        ],
      }),
    ).rejects.toThrow(/Stock insuficiente/)

    const after = await db.products.list()
    expect(after.find((p) => p.id === a.id).stock).toBe(a.stock)
    expect((await db.sales.list()).length).toBe(salesBefore)
  })

  it('clear vacía las ventas y reset restaura el seed', async () => {
    await db.sales.clear()
    expect(await db.sales.list()).toHaveLength(0)
    await db.reset()
    expect((await db.sales.list()).length).toBe(30)
  })
})
