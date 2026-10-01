# Preguntas de entrevista — PuntMarketApp

Respuestas cortas de borrador: reescríbelas con tus palabras después de estudiar `docs/FLUJO.md`.

1. **¿Qué problema resuelve?**
   Un punto de venta simple: el vendedor cobra rápido y el admin ve inventario, ventas del día y exporta a Excel. Lo usa un supermercado real.

2. **¿Por qué hay una carpeta `data/` con dos adapters?**
   La demo pública no puede depender de Supabase gratis (se pausa por inactividad). Con un adapter, la misma app corre con datos en el navegador (demo) o con Supabase (cliente) cambiando `VITE_DATA_MODE`.

3. **¿Cómo evitas vender más de lo que hay en stock?**
   En Supabase, `create_sale` es una transacción que descuenta stock y falla si no alcanza. En local se valida todo en memoria antes de escribir. El carrito además limita la cantidad al stock.

4. **¿Por qué `useReducer` para el carrito?**
   Las transiciones (agregar, cambiar cantidad, quitar) dependen del estado anterior y tienen reglas (stock). Un reducer puro las concentra en un lugar y se prueba sin componentes.

5. **¿Cómo manejas los roles?**
   `ProtectedRoute` compara el rol de la sesión con el que pide la ruta. En la demo la sesión es local; para el cliente hay una migración con Supabase Auth + RLS (`database/migrations/001_auth_rls.sql`) para que la seguridad esté en la base de datos y no solo en el frontend.

6. **¿Qué es RLS y por qué importa?**
   Row Level Security: políticas en Postgres que deciden qué filas puede leer/escribir cada usuario. Sin ella, cualquiera con la anon key (que es pública) podría leer o borrar datos.

7. **¿Qué pasó con las fechas?**
   Tenía un bug: `toISOString()` da la fecha en UTC y en El Salvador después de las 6 pm ya marcaba el día siguiente, y las "ventas de hoy" salían mal. Lo resolví con `toDateKey` (fecha local) y lo cubrí con tests.

8. **¿Cómo probaste la app?**
   Vitest + Testing Library: 19 tests (adapter local incluida la atomicidad, reducer del carrito, rutas protegidas, utilidades de fecha/formato y filas del Excel). CI en GitHub Actions corre tests y build.

9. **¿Por qué cambiaste `xlsx`?**
   La versión de npm tenía vulnerabilidades sin parche (prototype pollution, ReDoS). Usé `exceljs` y lo cargo con `import()` dinámico para no inflar el bundle inicial.

10. **¿Qué mejorarías?**
    Login real con Supabase Auth en el cliente, paginación del historial, devoluciones/anulaciones de venta y code-splitting de las páginas.
