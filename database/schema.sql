-- Schema para POS App en Supabase
-- Ejecutar este archivo en el SQL Editor de Supabase

-- Extension para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items de cada venta
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Función para crear una venta y decrementar stock en una sola transacción
CREATE OR REPLACE FUNCTION create_sale(
  p_total DECIMAL,
  p_payment_method TEXT,
  p_seller_name TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_sale_id UUID;
  item JSONB;
BEGIN
  -- Insertar la venta
  INSERT INTO sales (total, payment_method, seller_name)
  VALUES (p_total, p_payment_method, p_seller_name)
  RETURNING id INTO v_sale_id;

  -- Insertar items y decrementar stock
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO sale_items (sale_id, product_id, name, price, quantity, subtotal)
    VALUES (
      v_sale_id,
      (item->>'productId')::UUID,
      item->>'name',
      (item->>'price')::DECIMAL,
      (item->>'quantity')::INT,
      (item->>'subtotal')::DECIMAL
    );

    UPDATE products
    SET stock = stock - (item->>'quantity')::INT,
        updated_at = NOW()
    WHERE id = (item->>'productId')::UUID;
  END LOOP;

  RETURN v_sale_id;
END;
$$;

-- Función para limpiar todo el historial de ventas
CREATE OR REPLACE FUNCTION clear_sales()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM sale_items;
  DELETE FROM sales;
END;
$$;

-- Productos de ejemplo (opcional: quitar si no se desean datos iniciales)
INSERT INTO products (name, price, stock, category)
VALUES
  ('Camisa', 15.00, 50, 'Ropa'),
  ('Pantalón', 25.00, 30, 'Ropa'),
  ('Zapatos', 45.00, 20, 'Calzado'),
  ('Gorra', 10.00, 40, 'Accesorios'),
  ('Bolso', 20.00, 15, 'Accesorios'),
  ('Reloj', 35.00, 10, 'Accesorios'),
  ('Chaqueta', 55.00, 12, 'Ropa'),
  ('Jeans', 30.00, 25, 'Ropa')
ON CONFLICT (id) DO NOTHING;
