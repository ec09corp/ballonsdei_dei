-- Ballonsdei: el stock baja cuando el pedido se ACEPTA (confirmado/en preparación/listo/entregado)
-- y vuelve si después se cancela o regresa a pendiente. Solo una vez por pedido.
alter table public.orders add column if not exists stock_descontado boolean not null default false;

create or replace function public.ajustar_stock_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  activos text[] := array['confirmed','preparing','ready','delivered'];
begin
  if new.order_status = any(activos) and not old.stock_descontado then
    update public.products p set stock = greatest(p.stock - x.cant, 0)
    from (select product_id, sum(quantity) cant from public.order_items
          where order_id = new.id and product_id is not null group by product_id) x
    where p.id = x.product_id;
    new.stock_descontado := true;
  elsif not (new.order_status = any(activos)) and old.stock_descontado then
    update public.products p set stock = p.stock + x.cant
    from (select product_id, sum(quantity) cant from public.order_items
          where order_id = new.id and product_id is not null group by product_id) x
    where p.id = x.product_id;
    new.stock_descontado := false;
  end if;
  return new;
end $$;
revoke all on function public.ajustar_stock_pedido() from public, anon, authenticated;

drop trigger if exists trg_ajustar_stock_pedido on public.orders;
create trigger trg_ajustar_stock_pedido
  before update of order_status on public.orders
  for each row when (old.order_status is distinct from new.order_status)
  execute function public.ajustar_stock_pedido();
