import { RotateCcw } from 'lucide-react'
import { isDemo, db } from '../data'

// Solo se muestra en modo local (demo publica).
function DemoBanner() {
  if (!isDemo) return null

  const handleReset = async () => {
    if (!window.confirm('¿Restablecer los datos de ejemplo? Se perderán tus cambios.')) return
    await db.reset()
    window.location.reload()
  }

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-sm px-4 py-2 flex flex-wrap items-center justify-center gap-3">
      <span>Demo: tus datos se guardan solo en este navegador.</span>
      <button
        onClick={handleReset}
        className="inline-flex items-center gap-1 underline hover:text-amber-100"
      >
        <RotateCcw size={14} />
        Restablecer demo
      </button>
    </div>
  )
}

export default DemoBanner
