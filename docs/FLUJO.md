# Flujo de PuntMarketApp (guía de estudio)

## Idea general

```
Login → ruta protegida → pantalla → Provider (estado) → adapter (data/) → almacén
                                                         ├─ localAdapter    → localStorage (demo)
                                                         └─ supabaseAdapter → Supabase (cliente)
```

La pantalla nunca sabe dónde están los datos. Los Providers llaman a `db` (`src/data/index.js`),
que es el adapter local o el de Supabase según `VITE_DATA_MODE`. Esa es la decisión de diseño central.

## Qué hace cada archivo

| Archivo | Para qué sirve |
|---|---|
| `src/main.jsx`, `src/App.jsx` | Arranque. Envuelve la app en `AuthProvider` → `ProductsProvider` → `SalesProvider`. |
| `src/router/index.jsx` | Rutas: `/login`, `/admin/*`, `/seller/*`, cada grupo con su layout y `ProtectedRoute`. |
| `src/components/ProtectedRoute.jsx` | Sin sesión → `/login`. Rol equivocado → te manda a tu inicio. |
| `src/store/AuthProvider.jsx` | Sesión demo guardada en `localStorage` (`name`, `role`). |
| `src/store/ProductsProvider.jsx` | Lista de productos + alta/edición/baja. Muestra toasts. |
| `src/store/SalesProvider.jsx` | Lista de ventas + `addSale` y `clearSales`. |
| `src/store/useCart.js` | Carrito con `useReducer`. El reducer es una función pura (por eso se testea fácil). |
| `src/data/index.js` | Elige el adapter según `VITE_DATA_MODE`. |
| `src/data/localAdapter.js` | Implementa la interfaz sobre `localStorage`. Replica `create_sale`. |
| `src/data/supabaseAdapter.js` | Misma interfaz sobre Supabase (`from(...)` y `rpc(...)`). |
| `src/data/seed.js` | Datos de ejemplo reproducibles (20 productos, 30 ventas). |
| `src/utils/exportToExcel.js` | Arma las filas del día y genera el `.xlsx` (exceljs, carga diferida). |
| `database/schema.sql` | Tablas y funciones SQL. `migrations/001_auth_rls.sql`: Auth + RLS (sin aplicar). |

## Recorrido: registrar una venta

1. El vendedor entra a `/seller` (`pages/seller/POS.jsx`) y toca un producto → `useCart.addItem`.
2. El reducer `add` suma la cantidad; si ya llegó al stock, devuelve un `error` y la pantalla muestra un toast.
3. Elige método de pago y pulsa **Cobrar** → `handleCheckout`.
4. `SalesProvider.addSale(sale)` llama `db.sales.create(sale)`.
5. **Modo local:** `localAdapter.sales.create` valida stock de TODOS los items en memoria, descuenta, arma la venta y escribe una sola vez (si algo falla no queda nada a medias).
   **Modo Supabase:** `rpc('create_sale')` hace lo mismo dentro de una transacción de Postgres.
6. `SalesProvider` recarga las ventas, `POS` refresca los productos (stock nuevo) y vacía el carrito.

## Conceptos clave para entrevista

- **Adapter pattern:** una interfaz (`list/create/update/remove`) y dos implementaciones intercambiables.
- **Atomicidad:** descontar stock y guardar la venta debe pasar completo o no pasar (transacción SQL / escritura única).
- **Reducer puro:** `cartReducer(state, action)` no toca el DOM ni el estado global; se prueba con simples llamadas.
- **Fecha local:** `toDateKey` evita `toISOString()` porque en UTC-6 después de las 6 pm daría el día siguiente.
