import { useMemo, useState } from 'react'
import { useProducts } from '../../store/useProducts'
import { useSales } from '../../store/useSales'
import { formatPrice } from '../../utils/format'
import { exportSalesToExcel } from '../../utils/exportToExcel'
import { toDateKey } from '../../utils/date'
import DataTable from '../../components/DataTable'
import { Calendar, DollarSign, Download, Loader2, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

function Dashboard() {
  const { products, isLoading: productsLoading } = useProducts()
  const { sales, isLoading: salesLoading } = useSales()

  const isLoading = productsLoading || salesLoading

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))

  const handleExport = () => {
    const success = exportSalesToExcel(sales, selectedDate)
    if (!success) {
      toast.error(`No hay ventas registradas para el ${selectedDate}`)
    } else {
      toast.success(`Exportación completada: ventas-${selectedDate}.xlsx`)
    }
  }

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)

    const today = toDateKey(new Date())
    const todaySales = sales.filter((s) => toDateKey(s.created_at) === today)
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

    return { totalProducts, totalSales, totalRevenue, todayRevenue, todaySales: todaySales.length }
  }, [products, sales])

  const recentSales = useMemo(() => {
    return sales.slice(0, 10)
  }, [sales])

  const topProducts = useMemo(() => {
    const count = {}
    sales.forEach((sale) => {
      sale.sale_items.forEach((item) => {
        count[item.name] = (count[item.name] || 0) + item.quantity
      })
    })
    return Object.entries(count)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }))
  }, [sales])

  const statCards = [
    { label: 'Productos', value: stats.totalProducts, icon: Package, color: 'bg-blue-primary' },
    { label: 'Ventas totales', value: stats.totalSales, icon: ShoppingCart, color: 'bg-emerald-primary' },
    { label: 'Ingresos totales', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-violet-600' },
    { label: 'Ventas hoy', value: `$${stats.todayRevenue.toFixed(2)} (${stats.todaySales})`, icon: TrendingUp, color: 'bg-amber-600' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-dark-card rounded-xl p-6 shadow flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-300">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <section className="bg-dark-card rounded-xl p-6 shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} className="text-blue-primary" />
              Exportar ventas
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Descarga un archivo Excel con el detalle de las ventas del día seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-primary"
            />
            <button
              onClick={handleExport}
              disabled={sales.length === 0}
              className="bg-blue-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-dark-card rounded-xl p-6 shadow space-y-4">
          <h2 className="text-xl font-bold">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-300">No hay ventas registradas.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-6">#{i + 1}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-300">{item.quantity} vendidos</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-dark-card rounded-xl p-6 shadow space-y-4">
          <h2 className="text-xl font-bold">Ventas Recientes</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-300">No hay ventas registradas.</p>
          ) : (
            <DataTable
              headers={['Productos', 'Total', 'Vendedor', 'Método']}
              data={recentSales}
              renderRow={(sale) => (
                <tr key={sale.id} className="border-b border-white/10 last:border-0">
                  <td className="py-2 px-3 text-sm">{sale.sale_items.length} productos</td>
                  <td className="py-2 px-3 text-sm font-medium">{formatPrice(sale.total)}</td>
                  <td className="py-2 px-3 text-sm text-gray-300">{sale.seller_name}</td>
                  <td className="py-2 px-3 text-sm capitalize">{sale.payment_method}</td>
                </tr>
              )}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
