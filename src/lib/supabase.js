import { createClient } from '@supabase/supabase-js'

let client = null

// El cliente se crea la primera vez que se usa, no al importar el modulo.
// Asi el modo "local" (demo) funciona sin variables de Supabase.
export function getSupabase() {
  if (client) return client

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    )
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
