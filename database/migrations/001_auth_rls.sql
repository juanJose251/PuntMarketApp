-- 001_auth_rls.sql  —  Supabase Auth + Row Level Security (SOLO version del cliente)
--
-- ESTADO: escrito pero NO aplicado ni probado contra ninguna base de datos.
-- Antes de usarlo:
--   1. Haz respaldo de la BD del cliente.
--   2. Pruebalo primero en un proyecto Supabase de pruebas.
--   3. Crea los usuarios en Authentication > Users y asigna su rol en `profiles`.
--   4. Cambia el login de la app a supabase.auth.signInWithPassword (hoy el login es "demo").
-- Si aplicas esto sin cambiar el login, la app dejara de poder leer/escribir (anon bloqueado).

-- Perfiles: un registro por usuario de auth con su rol.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller'))
);

-- Helpers. SECURITY DEFINER para poder leer profiles dentro de las politicas sin recursion.
CREATE OR REPLACE FUNCTION current_role_name()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(current_role_name() = 'admin', FALSE)
$$;

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario lee el suyo; solo admin gestiona.
CREATE POLICY profiles_read_own  ON profiles FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_admin_all ON profiles FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- products: cualquier usuario con sesion lee; solo admin escribe.
-- (el stock lo descuenta create_sale, que corre como SECURITY DEFINER)
CREATE POLICY products_read        ON products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY products_admin_write ON products FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- sales / sale_items: admin ve todo; vendedor solo lo que registro. Se insertan solo via create_sale.
CREATE POLICY sales_read ON sales FOR SELECT TO authenticated
  USING (is_admin() OR seller_name = (SELECT name FROM profiles WHERE id = auth.uid()));
CREATE POLICY sale_items_read ON sale_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM sales s WHERE s.id = sale_items.sale_id));

-- create_sale: exige sesion, valida stock y usa el nombre del perfil (no confia en el cliente).
CREATE OR REPLACE FUNCTION create_sale(
  p_total DECIMAL,
  p_payment_method TEXT,
  p_seller_name TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id UUID;
  v_seller TEXT;
  item JSONB;
  v_updated INT;
BEGIN
  SELECT name INTO v_seller FROM profiles WHERE id = auth.uid();
  IF v_seller IS NULL THEN
    RAISE EXCEPTION 'Usuario sin perfil';
  END IF;

  INSERT INTO sales (total, payment_method, seller_name)
  VALUES (p_total, p_payment_method, v_seller)
  RETURNING id INTO v_sale_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Descuenta solo si alcanza el stock; si no, aborta toda la transaccion.
    UPDATE products
    SET stock = stock - (item->>'quantity')::INT, updated_at = NOW()
    WHERE id = (item->>'productId')::UUID
      AND stock >= (item->>'quantity')::INT;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
      RAISE EXCEPTION 'Stock insuficiente de %', item->>'name';
    END IF;

    INSERT INTO sale_items (sale_id, product_id, name, price, quantity, subtotal)
    VALUES (
      v_sale_id,
      (item->>'productId')::UUID,
      item->>'name',
      (item->>'price')::DECIMAL,
      (item->>'quantity')::INT,
      (item->>'subtotal')::DECIMAL
    );
  END LOOP;

  RETURN v_sale_id;
END;
$$;

-- clear_sales: solo admin.
CREATE OR REPLACE FUNCTION clear_sales()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo un administrador puede limpiar el historial';
  END IF;
  DELETE FROM sale_items WHERE id IS NOT NULL;
  DELETE FROM sales WHERE id IS NOT NULL;
END;
$$;

-- Las funciones quedan cerradas para usuarios sin sesion.
REVOKE EXECUTE ON FUNCTION create_sale(DECIMAL, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION clear_sales() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION create_sale(DECIMAL, TEXT, TEXT, JSONB) TO authenticated;
GRANT  EXECUTE ON FUNCTION clear_sales() TO authenticated;
