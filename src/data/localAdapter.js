import { buildSeed } from './seed'

const KEY = 'pos_demo_db'

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`
}

// Adapter del modo "local" (demo publica): todo vive en localStorage.
// Recibe el storage para poder probarlo con uno falso.
export function createLocalAdapter(storage = globalThis.localStorage) {
  function write(db) {
    storage.setItem(KEY, JSON.stringify(db))
  }

  function read() {
    try {
      const raw = storage.getItem(KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // datos corruptos: se vuelve a sembrar
    }
    const seeded = buildSeed()
    write(seeded)
    return seeded
  }

  return {
    mode: 'local',

    products: {
      async list() {
        return read().products
      },

      async create(product) {
        const db = read()
        const now = new Date().toISOString()
        const created = { ...product, id: newId('prod'), created_at: now, updated_at: now }
        db.products = [created, ...db.products]
        write(db)
        return created
      },

      async update(product) {
        const db = read()
        const current = db.products.find((p) => p.id === product.id)
        if (!current) throw new Error('Producto no encontrado')
        const updated = {
          ...current,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          updated_at: new Date().toISOString(),
        }
        db.products = db.products.map((p) => (p.id === updated.id ? updated : p))
        write(db)
        return updated
      },

      async remove(id) {
        const db = read()
        db.products = db.products.filter((p) => p.id !== id)
        write(db)
      },
    },

    sales: {
      async list() {
        return read().sales
      },

      // Replica create_sale: valida stock, descuenta y guarda venta + items.
      // Todo se calcula en memoria y se escribe una sola vez, asi no queda a medias.
      async create(sale) {
        const db = read()
        const products = db.products.map((p) => ({ ...p }))

        for (const item of sale.items) {
          const product = products.find((p) => p.id === item.productId)
          if (!product) throw new Error(`Producto no encontrado: ${item.name}`)
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente de "${product.name}"`)
          }
          product.stock -= item.quantity
          product.updated_at = new Date().toISOString()
        }

        const saleId = newId('sale')
        db.products = products
        db.sales = [
          {
            id: saleId,
            total: sale.total,
            payment_method: sale.paymentMethod,
            seller_name: sale.sellerName,
            created_at: new Date().toISOString(),
            sale_items: sale.items.map((item) => ({
              id: newId('item'),
              sale_id: saleId,
              product_id: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
          ...db.sales,
        ]
        write(db)
        return saleId
      },

      async clear() {
        const db = read()
        db.sales = []
        write(db)
      },
    },

    async reset() {
      write(buildSeed())
    },
  }
}
