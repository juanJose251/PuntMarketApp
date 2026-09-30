import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProductsContext } from './ProductsContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: supaError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Error cargando productos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addProduct = useCallback(async (product) => {
    try {
      const { data, error: supaError } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (supaError) throw supaError
      const newProduct = data[0]
      setProducts((prev) => [newProduct, ...prev])
      toast.success('Producto agregado')
      return newProduct
    } catch (err) {
      toast.error('Error agregando producto')
      throw err
    }
  }, [])

  const updateProduct = useCallback(async (product) => {
    try {
      const { data, error: supaError } = await supabase
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

      if (supaError) throw supaError
      const updated = data[0]
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      toast.success('Producto actualizado')
      return updated
    } catch (err) {
      toast.error('Error actualizando producto')
      throw err
    }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    try {
      const { error: supaError } = await supabase.from('products').delete().eq('id', id)

      if (supaError) throw supaError
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Producto eliminado')
    } catch (err) {
      toast.error('Error eliminando producto')
      throw err
    }
  }, [])

  const getProduct = useCallback(
    (id) => {
      return products.find((p) => p.id === id)
    },
    [products]
  )

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      refreshProducts: fetchProducts,
    }),
    [
      products,
      isLoading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      fetchProducts,
    ]
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
