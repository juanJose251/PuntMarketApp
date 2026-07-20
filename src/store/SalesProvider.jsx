import { useState, useCallback, useMemo } from 'react'
import { SalesContext } from './SalesContext'

const STORAGE_KEY = 'pos_sales'

function loadSales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSales(sales) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales))
}

export function SalesProvider({ children }) {
  const [sales, setSales] = useState(loadSales)

  const addSale = useCallback((sale) => {
    const newSale = {
      ...sale,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: new Date().toISOString(),
    }
    setSales((prev) => {
      const updated = [newSale, ...prev]
      saveSales(updated)
      return updated
    })
    return newSale
  }, [])

  const clearSales = useCallback(() => {
    setSales([])
    saveSales([])
  }, [])

  const getSalesByDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0]
    return sales.filter((s) => s.date.startsWith(dateStr))
  }, [sales])

  const getSalesToday = useCallback(() => {
    return getSalesByDate(new Date())
  }, [getSalesByDate])

  const value = useMemo(() => ({
    sales,
    addSale,
    clearSales,
    getSalesByDate,
    getSalesToday,
  }), [sales, addSale, clearSales, getSalesByDate, getSalesToday])

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  )
}
