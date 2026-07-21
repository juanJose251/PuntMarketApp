import { useState } from 'react'
import { useProducts } from '../../store/useProducts'
import DataTable from '../../components/DataTable'
import { formatPrice } from '../../utils/format'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'

const emptyProduct = { name: '', price: '', stock: '', category: '' }

function AdminProducts() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyProduct)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    })
    setShowModal(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price || !form.stock || !form.category.trim()) {
      toast.error('Todos los campos son obligatorios')
      return
    }
    const price = parseFloat(form.price)
    const stock = parseInt(form.stock, 10)
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0')
      return
    }
    if (isNaN(stock) || stock < 0) {
      toast.error('El stock debe ser un número válido')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await updateProduct({ ...editing, name: form.name.trim(), price, stock, category: form.category.trim() })
      } else {
        await addProduct({ name: form.name.trim(), price, stock, category: form.category.trim() })
      }
      setShowModal(false)
      setForm(emptyProduct)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Productos</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-primary hover:bg-blue-hover text-white rounded-lg font-medium transition"
        >
          <Plus size={18} />
          Agregar Producto
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-primary" size={32} />
        </div>
      ) : (
        <DataTable
          headers={['Nombre', 'Categoría', 'Precio', 'Stock', 'Acciones']}
          data={products}
          emptyMessage="No hay productos registrados."
          renderRow={(product) => (
            <tr key={product.id} className="border-b border-white/10 last:border-0 hover:bg-dark-row-hover transition-colors">
              <td className="py-3 px-4 font-medium">{product.name}</td>
              <td className="py-3 px-4 text-gray-300">{product.category}</td>
              <td className="py-3 px-4">{formatPrice(product.price)}</td>
              <td className="py-3 px-4">{product.stock}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 text-blue-primary hover:bg-blue-primary/10 rounded-lg transition"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-dark-card rounded-2xl p-6 shadow-xl w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                  className="w-full px-4 py-2 rounded-lg bg-dark-navy border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ej: Ropa, Calzado, Accesorios"
                  className="w-full px-4 py-2 rounded-lg bg-dark-navy border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min={0.01}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-dark-navy border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min={0}
                    className="w-full px-4 py-2 rounded-lg bg-dark-navy border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-primary hover:bg-blue-hover text-white rounded-lg font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editing ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
