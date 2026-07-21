# PuntMarketApp

Aplicación de punto de venta (POS) construida con React, Vite, Tailwind CSS y Supabase.

## Características

- Dashboard de administración
- CRUD de productos
- Historial de ventas
- Punto de venta para vendedores
- Roles: admin y seller
- Base de datos en la nube con Supabase
- Exportación de reportes a PDF

## Requisitos

- Node.js 18+
- Cuenta de Supabase (gratis)

## Instalación

```bash
npm install
```

## Configuración de Supabase

1. Crea un proyecto gratuito en [https://supabase.com](https://supabase.com)
2. Ve al SQL Editor y ejecuta el contenido de `database/schema.sql`
3. Copia el URL del proyecto y el anon key
4. Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

5. Rellena las variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

El proyecto está configurado para deployarse en Netlify usando el archivo `netlify.toml`.

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

No olvides configurar las variables de entorno en el panel de Netlify.
