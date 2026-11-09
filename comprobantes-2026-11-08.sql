-- Ballonsdei: comprobantes de pago privados + enlace temporal para WhatsApp (2026-11-08)
alter table public.orders add column if not exists comprobante_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprobantes', 'comprobantes', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Publico sube comprobantes" on storage.objects;
drop policy if exists "Admin ve comprobantes" on storage.objects;
drop policy if exists "Admin borra comprobantes" on storage.objects;
create policy "Publico sube comprobantes" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'comprobantes' and name ~ '^comprobante_[0-9]{10,16}_[a-f0-9]{24}\.(jpg|png|webp)$');
create policy "Admin ve comprobantes" on storage.objects for select to authenticated
  using (bucket_id = 'comprobantes' and public.es_admin());
create policy "Admin borra comprobantes" on storage.objects for delete to authenticated
  using (bucket_id = 'comprobantes' and public.es_admin());

create or replace function public.crear_pedido(p_pedido jsonb, p_items jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := gen_random_uuid();
  v_num bigint;
  v_fecha timestamptz;
  it jsonb;
  v_comp text := nullif(p_pedido->>'comprobante', '');
begin
  if coalesce(trim(p_pedido->>'customer_name'), '') = '' or coalesce(trim(p_pedido->>'customer_phone'), '') = '' then
    raise exception 'Faltan nombre o teléfono';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Productos inválidos';
  end if;
  if v_comp is not null and v_comp !~ '^comprobante_[0-9]{10,16}_[a-f0-9]{24}\.(jpg|png|webp)$' then
    v_comp := null;
  end if;

  insert into public.orders (id, customer_name, customer_phone, customer_email, customer_address, desired_date,
    delivery_method, payment_method, payment_status, order_status, subtotal, delivery_fee, total, notes, comprobante_url)
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
    left(p_pedido->>'notes', 4000),
    v_comp)
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

select id, public from storage.buckets where id = 'comprobantes';
