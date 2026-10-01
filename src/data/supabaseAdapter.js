import { getSupabase } from '../lib/supabase'

// Adapter para el modo "supabase" (version del cliente).
// Misma interfaz que localAdapter: ver src/data/index.js.
function check({ data, error }) {
  if (error) throw error
  return data
}

export const supabaseAdapter = {
  mode: 'supabase',

  products: {
    async list() {
      const res = await getSupabase()
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      return check(res) || []
    },

    async create(product) {
      const res = await getSupabase().from('products').insert([product]).select()
      return check(res)[0]
    },

    async update(product) {
      const res = await getSupabase()
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
        .select()
      return check(res)[0]
    },

    async remove(id) {
      check(await getSupabase().from('products').delete().eq('id', id))
    },
  },

  sales: {
    async list() {
      const res = await getSupabase()
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false })
      return check(res) || []
    },

    // create_sale (SQL) inserta la venta y descuenta stock en una transaccion.
    async create(sale) {
      const res = await getSupabase().rpc('create_sale', {
        p_total: sale.total,
        p_payment_method: sale.paymentMethod,
        p_seller_name: sale.sellerName,
        p_items: sale.items,
      })
      return check(res)
    },

    async clear() {
      check(await getSupabase().rpc('clear_sales'))
    },
  },

  // Sin accion en supabase: los datos reales no se "restablecen".
  async reset() {},
}
