import { useState, useEffect, useCallback, useMemo } from 'react'
import { SalesContext } from './SalesContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export function SalesProvider({ children }) {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSales = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: supaError } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setSales(data || [])
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
        const { data: saleId, error: supaError } = await supabase.rpc('create_sale', {
          p_total: sale.total,
          p_payment_method: sale.paymentMethod,
          p_seller_name: sale.sellerName,
          p_items: sale.items,
        })

        if (supaError) throw supaError

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
      const { error: supaError } = await supabase.rpc('clear_sales')
      if (supaError) throw supaError
      setSales([])
      toast.success('Historial limpiado')
    } catch (err) {
      toast.error('Error limpiando historial')
      throw err
    }
  }, [])

  const getSalesByDate = useCallback(
    (date) => {
      const dateStr = date.toISOString().split('T')[0]
      return sales.filter((s) => s.created_at.startsWith(dateStr))
    },
    [sales]
  )

  const getSalesToday = useCallback(() => {
    return getSalesByDate(new Date())
  }, [getSalesByDate])

  const value = useMemo(
    () => ({
      sales,
      isLoading,
      error,
      addSale,
      clearSales,
      getSalesByDate,
      getSalesToday,
      refreshSales: fetchSales,
    }),
    [sales, isLoading, error, addSale, clearSales, getSalesByDate, getSalesToday, fetchSales]
  )

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
}
