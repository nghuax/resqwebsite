create table if not exists public.vehicles (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  plate text not null,
  year text not null,
  type text not null check (type in ('Xe máy', 'Ô tô')),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists vehicles_owner_plate_idx
  on public.vehicles (owner_id, plate);

alter table public.vehicles enable row level security;

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

create table if not exists public.service_requests (
  id text primary key,
  requester_id uuid not null references auth.users (id) on delete cascade,
  requester_name text not null,
  requester_phone text,
  service_id text not null,
  service_title text not null,
  service_price text not null,
  service_eta text not null,
  vehicle_id text not null,
  vehicle_name text not null,
  vehicle_plate text not null,
  vehicle_type text not null check (vehicle_type in ('Xe máy', 'Ô tô')),
  location_address text not null,
  location_lat double precision not null,
  location_lng double precision not null,
  location_source text not null check (location_source in ('browser', 'fallback', 'manual')),
  notes text,
  fixer_id uuid references auth.users (id) on delete set null,
  fixer_name text,
  fixer_team text,
  fixer_vehicle text,
  status text not null default 'Chờ fixer xác nhận' check (
    status in (
      'Chờ fixer xác nhận',
      'Fixer đã xác nhận',
      'Đang tiếp cận',
      'Đang hỗ trợ',
      'Hoàn thành',
      'Đã hủy'
    )
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists service_requests_requester_idx
  on public.service_requests (requester_id, created_at desc);

create index if not exists service_requests_fixer_idx
  on public.service_requests (fixer_id, created_at desc);

create index if not exists service_requests_status_idx
  on public.service_requests (status, created_at desc);

alter table public.service_requests enable row level security;

drop policy if exists "Requesters can view own requests" on public.service_requests;
create policy "Requesters can view own requests"
on public.service_requests
for select
to authenticated
using (auth.uid() = requester_id);

drop policy if exists "Requesters can create own requests" on public.service_requests;
create policy "Requesters can create own requests"
on public.service_requests
for insert
to authenticated
with check (auth.uid() = requester_id);

drop policy if exists "Requesters can update own requests" on public.service_requests;
create policy "Requesters can update own requests"
on public.service_requests
for update
to authenticated
using (auth.uid() = requester_id)
with check (auth.uid() = requester_id);

drop policy if exists "Fixers can view available and assigned requests" on public.service_requests;
create policy "Fixers can view available and assigned requests"
on public.service_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'fixer'
  )
  and (
    status = 'Chờ fixer xác nhận'
    or fixer_id = auth.uid()
  )
);

drop policy if exists "Fixers can claim and update requests" on public.service_requests;
create policy "Fixers can claim and update requests"
on public.service_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'fixer'
  )
  and (
    status = 'Chờ fixer xác nhận'
    or fixer_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'fixer'
  )
  and fixer_id = auth.uid()
);
