import * as XLSX from 'xlsx'

export function exportSalesToExcel(sales, dateStr) {
  const filteredSales = sales.filter((sale) => sale.created_at.startsWith(dateStr))

  if (filteredSales.length === 0) {
    return false
  }

  const rows = filteredSales.flatMap((sale) => {
    const saleDate = new Date(sale.created_at).toLocaleString('es-ES')
    return sale.sale_items.map((item) => ({
      Fecha: saleDate,
      Vendedor: sale.seller_name,
      Producto: item.name,
      Cantidad: Number(item.quantity),
      'Precio Unit.': Number(item.price),
      Subtotal: Number(item.subtotal),
      'Total Venta': Number(sale.total),
      'Método Pago': sale.payment_method,
    }))
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 30 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas del día')

  XLSX.writeFile(wb, `ventas-${dateStr}.xlsx`)
  return true
}
