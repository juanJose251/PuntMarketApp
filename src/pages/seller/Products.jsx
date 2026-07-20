import { useState, useMemo } from 'react'
import { useProducts } from '../../store/useProducts'
import DataTable from '../../components/DataTable'
import { formatPrice } from '../../utils/format'
import { Search, Package } from 'lucide-react'

function SellerProducts() {
  const { products } = useProducts()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(term))
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }
    return result
  }, [products, search, categoryFilter])

  const lowStock = filteredProducts.filter((p) => p.stock > 0 && p.stock <= 5)
  const outOfStock = filteredProducts.filter((p) => p.stock === 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventario</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-card border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-dark-card border border-white/20 text-white focus:outline-none focus:border-blue-primary transition capitalize"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-card rounded-xl p-4 shadow flex items-center gap-3">
          <div className="bg-blue-primary p-2 rounded-lg">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-300">Total productos</p>
            <p className="text-xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-dark-card rounded-xl p-4 shadow flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-300">Stock bajo</p>
            <p className="text-xl font-bold text-amber-400">{lowStock.length}</p>
          </div>
        </div>
        <div className="bg-dark-card rounded-xl p-4 shadow flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-300">Agotados</p>
            <p className="text-xl font-bold text-red-400">{outOfStock.length}</p>
          </div>
        </div>
      </div>

      <DataTable
        headers={['Nombre', 'Categoría', 'Precio', 'Stock', 'Estado']}
        data={filteredProducts}
        emptyMessage="No se encontraron productos."
        renderRow={(product) => {
          const stockClass = product.stock === 0
            ? 'text-red-400'
            : product.stock <= 5
              ? 'text-amber-400'
              : 'text-emerald-400'
          const estado = product.stock === 0
            ? 'Agotado'
            : product.stock <= 5
              ? 'Stock bajo'
              : 'Disponible'
          return (
            <tr key={product.id} className="border-b border-white/10 last:border-0 hover:bg-dark-row-hover transition-colors">
              <td className="py-3 px-4 font-medium">{product.name}</td>
              <td className="py-3 px-4 text-gray-300">{product.category}</td>
              <td className="py-3 px-4">{formatPrice(product.price)}</td>
              <td className="py-3 px-4">{product.stock}</td>
              <td className={`py-3 px-4 font-medium ${stockClass}`}>{estado}</td>
            </tr>
          )
        }}
      />
    </div>
  )
}

export default SellerProducts
