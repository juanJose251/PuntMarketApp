import { describe, it, expect } from 'vitest'
import { toDateKey } from './date'
import { formatPrice } from './format'
import { buildSalesRows } from './exportToExcel'

describe('toDateKey', () => {
  it('usa la fecha local y rellena con ceros', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })

  it('no salta de día por la zona horaria (tarde en la noche)', () => {
    expect(toDateKey(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30')
  })
})

describe('formatPrice', () => {
  it('formatea con signo y dos decimales', () => {
    expect(formatPrice(3)).toBe('$3.00')
    expect(formatPrice('1.5')).toBe('$1.50')
  })
})

describe('buildSalesRows', () => {
  const sale = (id, date) => ({
    id,
    total: 5,
    payment_method: 'cash',
    seller_name: 'Ana',
    created_at: date.toISOString(),
    sale_items: [
      { name: 'A', quantity: 1, price: 2, subtotal: 2 },
      { name: 'B', quantity: 1, price: 3, subtotal: 3 },
    ],
  })

  it('devuelve una fila por item y solo del día pedido', () => {
    const rows = buildSalesRows(
      [sale('1', new Date(2026, 5, 10, 10)), sale('2', new Date(2026, 5, 11, 10))],
      '2026-06-10',
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ Vendedor: 'Ana', Producto: 'A', Subtotal: 2 })
  })

  it('devuelve vacío si no hay ventas ese día', () => {
    expect(buildSalesRows([sale('1', new Date(2026, 5, 10))], '2026-01-01')).toEqual([])
  })
})
