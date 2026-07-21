import { useMemo, useState } from 'react'
import { useSales } from '../../store/useSales'
import DataTable from '../../components/DataTable'
import { formatPrice, formatDate } from '../../utils/format'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function AdminSales() {
  const { sales, isLoading, clearSales } = useSales()
  const [clearing, setClearing] = useState(false)

  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.total, 0)
  }, [sales])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Historial de Ventas</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-primary" size={32} />
        </div>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Historial de Ventas</h1>
        <p className="text-gray-300">No hay ventas registradas.</p>
      </div>
    )
  }

  const handleClear = async () => {
    if (!window.confirm('¿Limpiar todo el historial de ventas?')) return
    setClearing(true)
    try {
      await clearSales()
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Historial de Ventas</h1>
          <p className="text-gray-300 mt-1">{sales.length} ventas · {formatPrice(totalRevenue)} en total</p>
        </div>
          <button
          onClick={handleClear}
          disabled={clearing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
        >
          {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Limpiar historial
        </button>
      </div>

      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="bg-dark-card rounded-xl p-6 shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">
                  Venta #{sale.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-400">{formatDate(sale.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">por {sale.sellerName}</span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-primary/20 text-blue-300 capitalize">
                  {sale.paymentMethod}
                </span>
              </div>
            </div>

            <DataTable
              headers={['Producto', 'Precio', 'Cantidad', 'Subtotal']}
              data={sale.sale_items}
              renderRow={(item) => (
                <tr key={item.productId} className="border-b border-white/10 last:border-0">
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="py-2 px-3">{formatPrice(item.price)}</td>
                  <td className="py-2 px-3">{item.quantity}</td>
                  <td className="py-2 px-3 font-medium">{formatPrice(item.subtotal)}</td>
                </tr>
              )}
            />

            <div className="flex justify-end pt-2">
              <div className="text-lg font-bold">
                Total: {formatPrice(sale.total)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminSales
