// Datos de ejemplo para la demo (modo local). Deterministas: mismo resultado en cada reset.
const PRODUCTS = [
  ['Arroz 1 lb', 0.75, 120, 'Abarrotes'],
  ['Frijoles rojos 1 lb', 1.1, 90, 'Abarrotes'],
  ['Aceite vegetal 900 ml', 3.25, 40, 'Abarrotes'],
  ['Azúcar 2 lb', 1.6, 70, 'Abarrotes'],
  ['Sal 1 lb', 0.5, 80, 'Abarrotes'],
  ['Leche entera 1 L', 1.35, 60, 'Lácteos'],
  ['Queso fresco 1 lb', 3.5, 25, 'Lácteos'],
  ['Crema 200 g', 1.2, 30, 'Lácteos'],
  ['Huevos (docena)', 3.0, 45, 'Lácteos'],
  ['Pan francés (6 u)', 1.0, 50, 'Panadería'],
  ['Pan dulce', 0.35, 100, 'Panadería'],
  ['Coca-Cola 600 ml', 1.0, 80, 'Bebidas'],
  ['Agua 1 L', 0.8, 100, 'Bebidas'],
  ['Jugo de naranja 1 L', 1.9, 35, 'Bebidas'],
  ['Cerveza lata', 1.25, 60, 'Bebidas'],
  ['Detergente 1 kg', 3.75, 28, 'Limpieza'],
  ['Jabón de baño', 0.9, 75, 'Limpieza'],
  ['Papel higiénico (4 u)', 2.4, 55, 'Limpieza'],
  ['Papas fritas 100 g', 1.1, 65, 'Snacks'],
  ['Galletas de chocolate', 0.95, 70, 'Snacks'],
]

const PAYMENTS = ['cash', 'card', 'transfer']
const SELLERS = ['Ana', 'Carlos']

// Generador pseudoaleatorio simple (LCG) para que el seed sea reproducible.
function makeRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const round2 = (n) => Math.round(n * 100) / 100

export function buildSeed(now = new Date()) {
  const rand = makeRandom(42)
  const createdAt = now.toISOString()

  const products = PRODUCTS.map(([name, price, stock, category], i) => ({
    id: `prod-${i + 1}`,
    name,
    price,
    stock,
    category,
    created_at: createdAt,
    updated_at: createdAt,
  }))

  const sales = []
  for (let n = 0; n < 30; n++) {
    const daysAgo = Math.floor(rand() * 7)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(8 + Math.floor(rand() * 11), Math.floor(rand() * 60), 0, 0)

    const itemCount = 1 + Math.floor(rand() * 4)
    const items = []
    const used = new Set()
    for (let k = 0; k < itemCount; k++) {
      const p = products[Math.floor(rand() * products.length)]
      if (used.has(p.id)) continue
      used.add(p.id)
      const quantity = 1 + Math.floor(rand() * 3)
      items.push({
        id: `item-${n + 1}-${k + 1}`,
        sale_id: `sale-${n + 1}`,
        product_id: p.id,
        name: p.name,
        price: p.price,
        quantity,
        subtotal: round2(p.price * quantity),
      })
    }

    sales.push({
      id: `sale-${n + 1}`,
      total: round2(items.reduce((sum, i) => sum + i.subtotal, 0)),
      payment_method: PAYMENTS[Math.floor(rand() * PAYMENTS.length)],
      seller_name: SELLERS[Math.floor(rand() * SELLERS.length)],
      created_at: date.toISOString(),
      sale_items: items,
    })
  }
  sales.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return { products, sales }
}
