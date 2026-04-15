drop policy if exists "Vehicles are viewable by owner" on public.vehicles;
create policy "Vehicles are viewable by owner"
on public.vehicles
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Vehicles are insertable by owner" on public.vehicles;
create policy "Vehicles are insertable by owner"
on public.vehicles
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Vehicles are updateable by owner" on public.vehicles;
create policy "Vehicles are updateable by owner"
on public.vehicles
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Vehicles are deletable by owner" on public.vehicles;
create policy "Vehicles are deletable by owner"
on public.vehicles
for delete
to authenticated
using (auth.uid() = owner_id);
