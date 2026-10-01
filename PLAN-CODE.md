# PLAN para Claude Code — PuntMarketApp (v2, reemplaza el anterior)

## Contexto
- Hay DOS cosas: **versión del cliente** (supermercado, pagada, Supabase real) y **demo pública** (puntomarket.netlify.app, para CV).
- Supabase gratis se pausa tras 1 semana sin uso → la demo NO puede depender de él.
- Hoy los datos pasan por solo 2 archivos: `src/store/ProductsProvider.jsx` y `src/store/SalesProvider.jsx` (llaman a `supabase.from(...)` y `supabase.rpc('create_sale'|'clear_sales')`). Eso facilita una capa de datos intercambiable.

## Decisión (Opción A)
- **Demo:** modo "local": todo se guarda en el navegador (IndexedDB/localStorage), con datos de ejemplo la primera vez. Sin servidor, sin costo, no expira. Botón "Restablecer demo".
- **Cliente:** modo "supabase" (el actual) + Auth + RLS, en plan de pago o con keep-alive.
- Mismo código; cambia `VITE_DATA_MODE=local|supabase`.

## Antes de empezar (Juan)
- Respaldo de la BD del cliente. Confirmar si la demo hoy usa la MISMA Supabase que el cliente (si sí: apuntar la demo a modo local ya y dejar de exponer `clear_sales`).
- Commit limpio de la rama actual.

## Fase 1 — Capa de datos (adapter)
1. Crear `src/data/` con una interfaz única: `products.list/create/update/remove`, `sales.list/create/clear`.
2. `src/data/supabaseAdapter.js`: mueve ahí las llamadas actuales (sin cambiar comportamiento).
3. `src/data/localAdapter.js`: IndexedDB (o localStorage si es simple). `create` de venta debe replicar `create_sale`: valida stock, descuenta stock, guarda sale + items de forma atómica, devuelve id.
4. `src/data/index.js` elige adapter según `VITE_DATA_MODE`.
5. Providers usan el adapter, no `supabase` directo. `src/lib/supabase.js` solo se carga en modo supabase (sin `throw` si falta en modo local).
6. `src/data/seed.js`: ~20 productos realistas, categorías y ~30 ventas de la última semana. Se carga si el almacén está vacío o al "Restablecer demo".

## Fase 2 — Modo demo (UX)
- Banner "Demo: tus datos se guardan solo en este navegador".
- Botón "Restablecer demo" (re-seed).
- Login demo: botones "Entrar como Admin / Vendedor" (sin contraseña, solo en modo local).
- Netlify (sitio demo): `VITE_DATA_MODE=local`. Sitio cliente: `VITE_DATA_MODE=supabase` + variables Supabase en Netlify. Agregar `.env.example`.

## Fase 3 — Cliente: Auth + RLS (solo modo supabase)
- Supabase Auth (email+contraseña), tabla `profiles(id,name,role)`.
- RLS en `products`, `sales`, `sale_items`; escritura de productos solo admin; `create_sale` valida rol y stock; `clear_sales` solo admin; `revoke execute ... from anon`.
- Keep-alive (GitHub Action cada 2–3 días) mientras no esté en plan de pago + respaldo semanal.
- Migración sin romper al cliente: probar primero en un proyecto Supabase de pruebas.

## Fase 4 — Calidad
- `xlsx` → versión sin avisos de seguridad (o `exceljs`).
- Vitest + RTL, 8–10 tests: ambos adapters (misma suite contra la interfaz), carrito/total, `ProtectedRoute`, utils de fecha/formato.
- GitHub Actions: build + tests.
- README: demo, capturas, arquitectura (adapter), cómo configurar `.env`, aclarar que la demo es local y el cliente usa Supabase.

## Commits sugeridos
1 refactor: capa de datos + supabaseAdapter · 2 feat: localAdapter + seed · 3 feat: modo demo (banner, reset, login demo) · 4 test: vitest + CI · 5 feat(auth): Auth + RLS cliente · 6 docs: README

## Reglas
- Nunca imprimir ni commitear llaves; no tocar la BD del cliente sin respaldo.
- Fases 1–2 y 4: Sonnet. Fase 3 (Auth/RLS): Opus.
- Al terminar: actualizar `Estado-actual` y avisar a Juan el nº de tests para el CV.
