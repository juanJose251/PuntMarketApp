import { toDateKey } from './date'

// Filas planas (una por item vendido) de las ventas de un dia. Separado de la
// escritura del archivo para poder probarlo sin navegador.
export function buildSalesRows(sales, dateStr) {
  return sales
    .filter((sale) => toDateKey(sale.created_at) === dateStr)
    .flatMap((sale) => {
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
}

const COLUMN_WIDTHS = [20, 18, 30, 10, 14, 14, 14, 14]

// exceljs se carga bajo demanda: pesa bastante y solo se usa al exportar.
export async function exportSalesToExcel(sales, dateStr) {
  const rows = buildSalesRows(sales, dateStr)
  if (rows.length === 0) return false

  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Ventas del día')

  const headers = Object.keys(rows[0])
  ws.columns = headers.map((header, i) => ({ header, key: header, width: COLUMN_WIDTHS[i] }))
  ws.addRows(rows)
  ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `ventas-${dateStr}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
  return true
}
