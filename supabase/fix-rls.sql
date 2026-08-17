-- Permisos para la app familiar (sin login).
-- Copiar y ejecutar en: Supabase → SQL Editor → Run

alter table public.vinilos enable row level security;

drop policy if exists "lectura_vinilos" on public.vinilos;
drop policy if exists "insertar_vinilos" on public.vinilos;
drop policy if exists "actualizar_vinilos" on public.vinilos;
drop policy if exists "borrar_vinilos" on public.vinilos;
drop policy if exists "Enable read access for all users" on public.vinilos;
drop policy if exists "Enable insert for all users" on public.vinilos;
drop policy if exists "Enable update for all users" on public.vinilos;
drop policy if exists "Enable delete for all users" on public.vinilos;

create policy "lectura_vinilos"
on public.vinilos for select
to anon, authenticated
using (true);

create policy "insertar_vinilos"
on public.vinilos for insert
to anon, authenticated
with check (true);

create policy "actualizar_vinilos"
on public.vinilos for update
to anon, authenticated
using (true)
with check (true);

create policy "borrar_vinilos"
on public.vinilos for delete
to anon, authenticated
using (true);

-- Portadas (por si el cubo bloquea alguna acción)
insert into storage.buckets (id, name, public)
values ('portadas', 'portadas', true)
on conflict (id) do update set public = true;

drop policy if exists "portadas_lectura" on storage.objects;
drop policy if exists "portadas_subida" on storage.objects;
drop policy if exists "portadas_cambio" on storage.objects;
drop policy if exists "portadas_borrado" on storage.objects;

create policy "portadas_lectura"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portadas');

create policy "portadas_subida"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'portadas');

create policy "portadas_cambio"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'portadas')
with check (bucket_id = 'portadas');

create policy "portadas_borrado"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'portadas');
