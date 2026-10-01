import { useState, useMemo, useEffect } from 'react'
import { useProducts } from '../../store/useProducts'
import { useSales } from '../../store/useSales'
import { useAuth } from '../../store/useAuth'
import { useCart } from '../../store/useCart'
import { formatPrice } from '../../utils/format'
import { toast } from 'sonner'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, CreditCard, Banknote, Wallet, Loader2 } from 'lucide-react'

const paymentMethods = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
  { value: 'transfer', label: 'Transferencia', icon: Wallet },
]

function POS() {
  const { products, isLoading, refreshProducts } = useProducts()
  const { addSale } = useSales()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const { items: cart, error: cartError, total: cartTotal, addItem, changeQuantity, removeItem, clear } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products
    const term = search.toLowerCase()
    return products.filter((p) =>
      p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    )
  }, [products, search])

  const inStockProducts = useMemo(() => {
    return filteredProducts.filter((p) => p.stock > 0)
  }, [filteredProducts])

  useEffect(() => {
    if (cartError) toast.error(cartError.message)
  }, [cartError])

  const updateQuantity = (productId, delta) =>
    changeQuantity(productId, delta, products.find((p) => p.id === productId)?.stock)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Agrega productos al carrito')
      return
    }

    setProcessing(true)
    try {
      await addSale({
        items: cart,
        total: cartTotal,
        paymentMethod,
        sellerName: user?.name || 'Vendedor',
      })
      await refreshProducts()
      toast.success('Venta registrada exitosamente', {
        description: `Total: ${formatPrice(cartTotal)} - ${paymentMethods.find((p) => p.value === paymentMethod)?.label}`,
      })
      clear()
    } finally {
      setProcessing(false)
    }
  }

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('¿Vaciar el carrito?')) {
      clear()
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-card border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-300">
              <Loader2 className="animate-spin text-blue-primary" size={32} />
            </div>
          ) : inStockProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-300">
              {search ? 'No se encontraron productos.' : 'No hay productos disponibles.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {inStockProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="bg-dark-card rounded-xl p-4 text-left hover:bg-dark-row-hover transition border border-white/10 hover:border-blue-primary/50 space-y-1"
                >
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-400 truncate">{product.category}</p>
                  <p className="text-lg font-bold text-blue-primary">{formatPrice(product.price)}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4 min-h-0">
        <div className="bg-dark-card rounded-xl p-4 shadow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-primary" />
            <h2 className="font-bold">Carrito</h2>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition">
              Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
              <ShoppingCart size={48} className="text-gray-500" />
              <p className="text-sm">Carrito vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="bg-dark-card rounded-xl p-3 shadow space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-red-400 hover:bg-red-400/10 rounded transition"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-dark-navy rounded-lg px-2 py-1 border border-white/20">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-0.5 hover:bg-white/10 rounded transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-0.5 hover:bg-white/10 rounded transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-semibold text-sm">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-dark-card rounded-xl p-4 shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition ${
                      paymentMethod === method.value
                        ? 'border-emerald-primary bg-emerald-primary/10 text-emerald-primary'
                        : 'border-white/20 text-gray-300 hover:border-emerald-primary/50'
                    }`}
                  >
                    <Icon size={16} />
                    {method.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-primary">{formatPrice(cartTotal)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3 bg-emerald-primary hover:bg-emerald-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
            {processing ? 'Procesando...' : 'Cobrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default POS
