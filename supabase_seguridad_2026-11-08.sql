-- Ballonsdei: seguridad 2026-11-08
-- 1) Respaldo de reglas actuales
create schema if not exists respaldo;
create table if not exists respaldo.politicas_20261108 as
  select now() as fecha, schemaname, tablename, policyname, permissive, roles::text as roles, cmd, qual, with_check
  from pg_policies where schemaname in ('public','storage');
create table if not exists respaldo.rls_20261108 as
  select c.relname as tabla, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r';
alter table respaldo.politicas_20261108 enable row level security;
alter table respaldo.rls_20261108 enable row level security;

-- 2) ¿Es administrador? (sin recursión en profiles)
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and active = true)
$$;
revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- 3) Perfiles: nadie puede hacerse admin solo
drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Usuario ve su perfil" on public.profiles;
drop policy if exists "Admin gestiona perfiles" on public.profiles;
create policy "Usuario ve su perfil" on public.profiles for select to authenticated using (id = auth.uid() or public.es_admin());
create policy "Admin gestiona perfiles" on public.profiles for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- 4) Pedidos: el público ya no lee, cambia ni inserta directo
drop policy if exists "Allow anonymous orders" on public.orders;
drop policy if exists "Allow read all orders" on public.orders;
drop policy if exists "Allow update orders" on public.orders;

-- 5) Tablas sin reglas que la tienda pública necesita leer
drop policy if exists "Publico ve elementos" on public.customizer_elements;
drop policy if exists "Admin gestiona elementos" on public.customizer_elements;
create policy "Publico ve elementos" on public.customizer_elements for select to anon, authenticated using (true);
create policy "Admin gestiona elementos" on public.customizer_elements for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "Publico ve variantes" on public.product_variants;
drop policy if exists "Admin gestiona variantes" on public.product_variants;
create policy "Publico ve variantes" on public.product_variants for select to anon, authenticated using (true);
create policy "Admin gestiona variantes" on public.product_variants for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "Publico guarda disenos" on public.custom_designs;
drop policy if exists "Admin gestiona disenos" on public.custom_designs;
create policy "Publico guarda disenos" on public.custom_designs for insert to anon, authenticated with check (true);
create policy "Admin gestiona disenos" on public.custom_designs for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- 6) Encender la protección en todas las tablas
alter table public.categories enable row level security;
alter table public.custom_designs enable row level security;
alter table public.customizer_elements enable row level security;
alter table public.order_items enable row level security;
alter table public.orders enable row level security;
alter table public.product_images enable row level security;
alter table public.product_production_items enable row level security;
alter table public.product_variants enable row level security;
alter table public.production_items enable row level security;
alter table public.production_movements enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;

-- 7) Crear pedido de forma segura (estado siempre 'pending')
create or replace function public.crear_pedido(p_pedido jsonb, p_items jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := gen_random_uuid();
  v_num bigint;
  v_fecha timestamptz;
  it jsonb;
begin
  if coalesce(trim(p_pedido->>'customer_name'), '') = '' or coalesce(trim(p_pedido->>'customer_phone'), '') = '' then
    raise exception 'Faltan nombre o teléfono';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Productos inválidos';
  end if;

  insert into public.orders (id, customer_name, customer_phone, customer_email, customer_address, desired_date,
    delivery_method, payment_method, payment_status, order_status, subtotal, delivery_fee, total, notes)
  values (v_id,
    left(p_pedido->>'customer_name', 120),
    left(p_pedido->>'customer_phone', 40),
    left(nullif(p_pedido->>'customer_email', ''), 160),
    left(p_pedido->>'customer_address', 500),
    case when coalesce(p_pedido->>'desired_date', '') ~ '^\d{4}-\d{2}-\d{2}' then (left(p_pedido->>'desired_date', 10))::date end,
    left(p_pedido->>'delivery_method', 60),
    left(p_pedido->>'payment_method', 80),
    'pending', 'pending',
    greatest(coalesce((p_pedido->>'subtotal')::numeric, 0), 0),
    greatest(coalesce((p_pedido->>'delivery_fee')::numeric, 0), 0),
    greatest(coalesce((p_pedido->>'total')::numeric, 0), 0),
    left(p_pedido->>'notes', 4000))
  returning order_number, created_at into v_num, v_fecha;

  for it in select * from jsonb_array_elements(p_items) loop
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_id,
      (select pr.id from public.products pr where pr.id = case when coalesce(it->>'product_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then (it->>'product_id')::uuid end),
      left(coalesce(nullif(it->>'product_name', ''), 'Arreglo Floral'), 200),
      least(greatest(coalesce((it->>'quantity')::int, 1), 1), 99),
      greatest(coalesce((it->>'unit_price')::numeric, 0), 0));
  end loop;

  return json_build_object('id', v_id, 'order_number', v_num, 'created_at', v_fecha);
end $$;
revoke all on function public.crear_pedido(jsonb, jsonb) from public;
grant execute on function public.crear_pedido(jsonb, jsonb) to anon, authenticated;

-- 8) Fotos: el público solo puede VER las de productos
drop policy if exists "Acceso Publico product-images" on storage.objects;
