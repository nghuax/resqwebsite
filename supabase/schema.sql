create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role text not null default 'user' check (role in ('user', 'fixer')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles are updateable by owner" on public.profiles;
create policy "Profiles are updateable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

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

create table if not exists public.service_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.service_requests (id) on delete cascade,
  sender_id uuid references auth.users (id) on delete set null,
  sender_name text not null,
  sender_role text not null check (sender_role in ('user', 'fixer', 'system')),
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists service_request_messages_request_idx
  on public.service_request_messages (request_id, created_at asc);

alter table public.service_request_messages enable row level security;

drop policy if exists "Participants can view request messages" on public.service_request_messages;
create policy "Participants can view request messages"
on public.service_request_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        service_requests.requester_id = auth.uid()
        or service_requests.fixer_id = auth.uid()
      )
  )
);

drop policy if exists "Participants can create request messages" on public.service_request_messages;
create policy "Participants can create request messages"
on public.service_request_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        service_requests.requester_id = auth.uid()
        or service_requests.fixer_id = auth.uid()
      )
  )
  and (
    (sender_role = 'system' and sender_id is null)
    or sender_id = auth.uid()
  )
);

do $$
begin
  alter publication supabase_realtime add table public.service_request_messages;
exception
  when duplicate_object then
    null;
end
$$;

create table if not exists public.service_request_locations (
  request_id text not null references public.service_requests (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text not null check (actor_role in ('user', 'fixer')),
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  accuracy double precision,
  source text not null default 'browser' check (source in ('browser', 'fallback', 'manual')),
  address text,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (request_id, actor_role)
);

create index if not exists service_request_locations_request_idx
  on public.service_request_locations (request_id, updated_at desc);

alter table public.service_request_locations enable row level security;

drop policy if exists "Participants can view request locations" on public.service_request_locations;
create policy "Participants can view request locations"
on public.service_request_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        service_requests.requester_id = auth.uid()
        or service_requests.fixer_id = auth.uid()
      )
  )
);

drop policy if exists "Participants can create request locations" on public.service_request_locations;
create policy "Participants can create request locations"
on public.service_request_locations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        (actor_role = 'user' and service_requests.requester_id = auth.uid())
        or (actor_role = 'fixer' and service_requests.fixer_id = auth.uid())
      )
  )
  and actor_id = auth.uid()
);

drop policy if exists "Participants can update request locations" on public.service_request_locations;
create policy "Participants can update request locations"
on public.service_request_locations
for update
to authenticated
using (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        (actor_role = 'user' and service_requests.requester_id = auth.uid())
        or (actor_role = 'fixer' and service_requests.fixer_id = auth.uid())
      )
  )
  and actor_id = auth.uid()
)
with check (
  exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        (actor_role = 'user' and service_requests.requester_id = auth.uid())
        or (actor_role = 'fixer' and service_requests.fixer_id = auth.uid())
      )
  )
  and actor_id = auth.uid()
);

do $$
begin
  alter publication supabase_realtime add table public.service_request_locations;
exception
  when duplicate_object then
    null;
end
$$;
