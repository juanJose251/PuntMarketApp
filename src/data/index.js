import { createLocalAdapter } from './localAdapter'
import { supabaseAdapter } from './supabaseAdapter'

// VITE_DATA_MODE=local     -> demo publica, datos en el navegador (sin servidor)
// VITE_DATA_MODE=supabase  -> version del cliente (Supabase)
export const DATA_MODE = import.meta.env.VITE_DATA_MODE === 'supabase' ? 'supabase' : 'local'

export const isDemo = DATA_MODE === 'local'

export const db = DATA_MODE === 'supabase' ? supabaseAdapter : createLocalAdapter()
