-- Ballonsdei: categorías según los productos (2026-11-08)
create table if not exists respaldo.productos_categoria_20261108 as select id, name, category_id from public.products;
alter table respaldo.productos_categoria_20261108 enable row level security;

with nuevas(nombre, slug, descripcion, orden) as (values
  ('Ramos Buchones','ramos-buchones','Ramos buchones de rosas, con dinero, rosas eternas y maquillaje.',1),
  ('Ramos de Mano y Novias','ramos-de-mano-y-novias','Ramos de mano y ramos para novias, quinceañeras y damas.',2),
  ('Arreglos Florales','arreglos-florales','Arreglos primaverales, diseños florales, box de rosas y centros de mesa.',3),
  ('Ositos y Peluches','ositos-y-peluches','Paquetes de ositos y peluches para regalar.',4),
  ('Desayunos y Canastas','desayunos-y-canastas','Desayunos sorpresa, canastas frutales, charcutería y chocolates.',5),
  ('Detalles y Regalos','detalles-y-regalos','Detalles, Día del Novio y cintas de cuadro de honor.',6),
  ('Bodas y Eventos','bodas-y-eventos','Bodas, decoración de entrada y decoración de auto.',7),
  ('Ofrendas Fúnebres','ofrendas-funebres','Ofrendas florales fúnebres.',8)
)
insert into public.categories (name, slug, description, active, sort_order, display_order)
select nombre, slug, descripcion, true, orden, orden from nuevas
where not exists (select 1 from public.categories c where c.slug = nuevas.slug);

update public.products p set category_id = c.id
from public.categories c
where c.slug = case
  when p.name ilike '%ofrenda%' then 'ofrendas-funebres'
  when p.name ilike '%buchon%' or p.name ilike '%solo rosas%' or p.name ilike '%maquillaje%' or p.name ilike 'Accesorios adicionales para ramos%' then 'ramos-buchones'
  when p.name ilike 'Ramos de mano%' or p.name ilike 'Ramos para:%' then 'ramos-de-mano-y-novias'
  when p.name ilike '%primaveral%' or p.name ilike 'Diseño Floral%' or p.name ilike 'Box %' or p.name ilike 'Arreglos en tazas%' or p.name ilike 'Centro de mesa%' then 'arreglos-florales'
  when p.name ilike '%osit%' or p.name ilike '%osos%' then 'ositos-y-peluches'
  when p.name ilike 'Desayuno%' or p.name ilike 'Canastas%' or p.name ilike 'Charcuter%' or p.name ilike 'Chocolates%' then 'desayunos-y-canastas'
  when p.name ilike 'Detalles%' or p.name ilike 'Dia del Novio%' or p.name ilike 'Cinta de Cuadro%' then 'detalles-y-regalos'
  when p.name ilike 'BODA%' or p.name ilike 'Decoración de%' then 'bodas-y-eventos'
end;

-- Foto de portada: la principal de un producto de la categoría
update public.categories c set image_url = (
  select i.image_url from public.product_images i join public.products p on p.id = i.product_id
  where p.category_id = c.id and p.price > 0
  order by i.position asc, p.price desc limit 1)
where c.image_url is null;

select c.name, count(p.id) productos, (c.image_url is not null) con_foto
from public.categories c left join public.products p on p.category_id = c.id
group by c.name, c.sort_order, c.image_url order by c.sort_order;
