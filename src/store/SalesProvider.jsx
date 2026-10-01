import { useState, useEffect, useCallback, useMemo } from 'react'
import { SalesContext } from './SalesContext'
import { db } from '../data'
import { toast } from 'sonner'

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSales = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setSales(await db.sales.list())
    } catch (err) {
      setError(err.message)
      toast.error('Error cargando ventas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const addSale = useCallback(
    async (sale) => {
      try {
        const saleId = await db.sales.create(sale)
        await fetchSales()
        toast.success('Venta registrada exitosamente')
        return saleId
      } catch (err) {
        toast.error('Error registrando venta')
        throw err
      }
    },
    [fetchSales]
  )

  const clearSales = useCallback(async () => {
    try {
      await db.sales.clear()
      setSales([])
      toast.success('Historial limpiado')
    } catch (err) {
      toast.error('Error limpiando historial')
      throw err
    }
  }, [])

  const value = useMemo(
    () => ({
      sales,
      isLoading,
      error,
      addSale,
      clearSales,
      refreshSales: fetchSales,
    }),
    [sales, isLoading, error, addSale, clearSales, fetchSales]
  )

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
}
