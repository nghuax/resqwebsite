create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

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

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then
    null;
end
$$;

create table if not exists public.customer_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone', 'email')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fixer_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  team_name text,
  support_vehicle text,
  approval_status text not null default 'approved' check (approval_status in ('pending', 'approved', 'suspended')),
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.customer_profiles (profile_id)
select profiles.id
from public.profiles
where profiles.role = 'user'
on conflict (profile_id) do nothing;

insert into public.fixer_profiles as fixer_profiles (
  profile_id,
  team_name
)
select
  profiles.id,
  coalesce(nullif(btrim(profiles.full_name), ''), 'Fixer ResQ')
from public.profiles
where profiles.role = 'fixer'
on conflict (profile_id) do update
set team_name = coalesce(fixer_profiles.team_name, excluded.team_name);

alter table public.customer_profiles enable row level security;
alter table public.fixer_profiles enable row level security;

drop policy if exists "Customer profiles are viewable by owner" on public.customer_profiles;
create policy "Customer profiles are viewable by owner"
on public.customer_profiles
for select
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "Customer profiles are insertable by owner" on public.customer_profiles;
create policy "Customer profiles are insertable by owner"
on public.customer_profiles
for insert
to authenticated
with check (auth.uid() = profile_id);

drop policy if exists "Customer profiles are updateable by owner" on public.customer_profiles;
create policy "Customer profiles are updateable by owner"
on public.customer_profiles
for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "Fixer profiles are viewable by owner" on public.fixer_profiles;
create policy "Fixer profiles are viewable by owner"
on public.fixer_profiles
for select
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "Fixer profiles are insertable by owner" on public.fixer_profiles;
create policy "Fixer profiles are insertable by owner"
on public.fixer_profiles
for insert
to authenticated
with check (auth.uid() = profile_id);

drop policy if exists "Fixer profiles are updateable by owner" on public.fixer_profiles;
create policy "Fixer profiles are updateable by owner"
on public.fixer_profiles
for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

do $$
begin
  alter publication supabase_realtime add table public.customer_profiles;
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.fixer_profiles;
exception
  when duplicate_object then
    null;
end
$$;

create or replace function app_private.ensure_role_profile_tree(
  p_profile_id uuid,
  p_role text,
  p_full_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_role = 'fixer' then
    insert into public.fixer_profiles as fixer_profiles (
      profile_id,
      team_name
    )
    values (
      p_profile_id,
      coalesce(nullif(btrim(p_full_name), ''), 'Fixer ResQ')
    )
    on conflict (profile_id) do update
    set
      team_name = coalesce(fixer_profiles.team_name, excluded.team_name),
      updated_at = timezone('utc', now());

    delete from public.customer_profiles
    where customer_profiles.profile_id = p_profile_id;
  else
    insert into public.customer_profiles (profile_id)
    values (p_profile_id)
    on conflict (profile_id) do nothing;

    delete from public.fixer_profiles
    where fixer_profiles.profile_id = p_profile_id;
  end if;
end;
$$;

create or replace function app_private.sync_role_profile_tree_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.ensure_role_profile_tree(new.id, new.role, new.full_name);
  return new;
end;
$$;

drop trigger if exists sync_role_profile_tree_on_profiles on public.profiles;
create trigger sync_role_profile_tree_on_profiles
after insert or update of role, full_name
on public.profiles
for each row
execute function app_private.sync_role_profile_tree_trigger();

create or replace function app_private.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _role text := case
    when new.raw_user_meta_data ->> 'role' = 'fixer' then 'fixer'
    else 'user'
  end;
  _full_name text := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );
  _phone text := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    role
  )
  values (
    new.id,
    _full_name,
    _phone,
    new.email,
    _role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_auth_user on auth.users;
create trigger create_profile_for_new_auth_user
after insert on auth.users
for each row
execute function app_private.create_profile_for_new_auth_user();

insert into public.profiles (
  id,
  full_name,
  phone,
  email,
  role
)
select
  users.id,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), '')
  ),
  nullif(btrim(users.raw_user_meta_data ->> 'phone'), ''),
  users.email,
  case
    when users.raw_user_meta_data ->> 'role' = 'fixer' then 'fixer'
    else 'user'
  end
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
)
on conflict (id) do nothing;

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
using (
  auth.uid() = owner_id
);

drop policy if exists "Vehicles are insertable by owner" on public.vehicles;
create policy "Vehicles are insertable by owner"
on public.vehicles
for insert
to authenticated
with check (
  auth.uid() = owner_id
);

drop policy if exists "Vehicles are updateable by owner" on public.vehicles;
create policy "Vehicles are updateable by owner"
on public.vehicles
for update
to authenticated
using (
  auth.uid() = owner_id
)
with check (
  auth.uid() = owner_id
);

drop policy if exists "Vehicles are deletable by owner" on public.vehicles;
create policy "Vehicles are deletable by owner"
on public.vehicles
for delete
to authenticated
using (
  auth.uid() = owner_id
);

do $$
begin
  alter publication supabase_realtime add table public.vehicles;
exception
  when duplicate_object then
    null;
end
$$;

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
drop policy if exists "Requesters can update own requests" on public.service_requests;
drop policy if exists "Fixers can claim and update requests" on public.service_requests;

drop policy if exists "Fixers can view available and assigned requests" on public.service_requests;
create policy "Fixers can view available and assigned requests"
on public.service_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.fixer_profiles
    where fixer_profiles.profile_id = auth.uid()
      and fixer_profiles.approval_status = 'approved'
  )
  and (
    status = 'Chờ fixer xác nhận'
    or fixer_id = auth.uid()
  )
);

do $$
begin
  alter publication supabase_realtime add table public.service_requests;
exception
  when duplicate_object then
    null;
end
$$;

create table if not exists public.request_assignments (
  request_id text primary key references public.service_requests (id) on delete cascade,
  requester_id uuid not null references auth.users (id) on delete cascade,
  fixer_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'accepted' check (status in ('accepted', 'completed', 'cancelled')),
  accepted_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  cancelled_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists request_assignments_fixer_idx
  on public.request_assignments (fixer_id, status, accepted_at desc);

insert into public.request_assignments (
  request_id,
  requester_id,
  fixer_id,
  status,
  accepted_at,
  completed_at,
  cancelled_at,
  updated_at
)
select
  service_requests.id,
  service_requests.requester_id,
  service_requests.fixer_id,
  case
    when service_requests.status = 'Hoàn thành' then 'completed'
    when service_requests.status = 'Đã hủy' then 'cancelled'
    else 'accepted'
  end,
  coalesce(service_requests.updated_at, service_requests.created_at),
  case
    when service_requests.status = 'Hoàn thành' then coalesce(service_requests.updated_at, service_requests.created_at)
    else null
  end,
  case
    when service_requests.status = 'Đã hủy' then coalesce(service_requests.updated_at, service_requests.created_at)
    else null
  end,
  timezone('utc', now())
from public.service_requests
where service_requests.fixer_id is not null
on conflict (request_id) do nothing;

alter table public.request_assignments enable row level security;

drop policy if exists "Participants can view request assignments" on public.request_assignments;
create policy "Participants can view request assignments"
on public.request_assignments
for select
to authenticated
using (
  auth.uid() = requester_id
  or auth.uid() = fixer_id
);

do $$
begin
  alter publication supabase_realtime add table public.request_assignments;
exception
  when duplicate_object then
    null;
end
$$;

create table if not exists public.request_status_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.service_requests (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text not null check (actor_role in ('user', 'fixer', 'system')),
  event_type text not null check (event_type in ('created', 'accepted', 'progressed', 'completed', 'cancelled')),
  status text not null check (
    status in (
      'Chờ fixer xác nhận',
      'Fixer đã xác nhận',
      'Đang tiếp cận',
      'Đang hỗ trợ',
      'Hoàn thành',
      'Đã hủy'
    )
  ),
  detail text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists request_status_events_request_idx
  on public.request_status_events (request_id, created_at asc);

alter table public.request_status_events enable row level security;

drop policy if exists "Participants can view request status events" on public.request_status_events;
create policy "Participants can view request status events"
on public.request_status_events
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

do $$
begin
  alter publication supabase_realtime add table public.request_status_events;
exception
  when duplicate_object then
    null;
end
$$;

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
  sender_id = auth.uid()
  and exists (
    select 1
    from public.service_requests
    where service_requests.id = request_id
      and (
        (sender_role = 'user' and service_requests.requester_id = auth.uid())
        or (sender_role = 'fixer' and service_requests.fixer_id = auth.uid())
      )
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

create or replace function app_private.request_status_message(
  p_status text,
  p_actor_name text default null
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  case p_status
    when 'Chờ fixer xác nhận' then
      return 'Yêu cầu đã được ghi nhận. Fixer sẽ xác nhận đơn trong ít phút tới.';
    when 'Fixer đã xác nhận' then
      return coalesce(nullif(btrim(p_actor_name), ''), 'Fixer ResQ') || ' đã xác nhận đơn và bắt đầu chuẩn bị di chuyển.';
    when 'Đang tiếp cận' then
      return 'Fixer đang di chuyển tới điểm hẹn của bạn.';
    when 'Đang hỗ trợ' then
      return 'Fixer đã đến nơi và đang hỗ trợ trực tiếp.';
    when 'Hoàn thành' then
      return 'Ca hỗ trợ đã hoàn thành. Bạn có thể xem lại lịch sử và thanh toán nếu cần.';
    when 'Đã hủy' then
      return 'Yêu cầu đã được hủy.';
    else
      return 'ResQ đã cập nhật trạng thái yêu cầu.';
  end case;
end;
$$;

create or replace function app_private.append_status_event(
  p_request_id text,
  p_actor_id uuid,
  p_actor_role text,
  p_event_type text,
  p_status text,
  p_detail text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.request_status_events (
    request_id,
    actor_id,
    actor_role,
    event_type,
    status,
    detail
  )
  values (
    p_request_id,
    p_actor_id,
    p_actor_role,
    p_event_type,
    p_status,
    p_detail
  );
$$;

create or replace function app_private.append_system_message(
  p_request_id text,
  p_body text
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.service_request_messages (
    request_id,
    sender_id,
    sender_name,
    sender_role,
    body
  )
  values (
    p_request_id,
    null,
    'ResQ',
    'system',
    p_body
  );
$$;

create or replace function app_private.create_service_request_internal(
  p_request_id text,
  p_service_id text,
  p_service_title text,
  p_service_price text,
  p_service_eta text,
  p_vehicle_id text,
  p_vehicle_name text,
  p_vehicle_plate text,
  p_vehicle_type text,
  p_location_address text,
  p_location_lat double precision,
  p_location_lng double precision,
  p_location_source text,
  p_notes text default null
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _profile public.profiles%rowtype;
  _vehicle public.vehicles%rowtype;
  _existing_request_id text;
  _created_request public.service_requests%rowtype;
  _vehicle_name text := coalesce(nullif(btrim(p_vehicle_name), ''), 'Phương tiện ResQ');
  _vehicle_plate text := upper(nullif(btrim(p_vehicle_plate), ''));
  _vehicle_year text := '2026';
  _vehicle_type text;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để tạo yêu cầu.';
  end if;

  select *
  into _profile
  from public.profiles
  where profiles.id = _actor_id;

  if not found then
    insert into public.profiles (
      id,
      full_name,
      phone,
      email,
      role
    )
    select
      users.id,
      coalesce(
        nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
        nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
        'Khách ResQ'
      ),
      nullif(btrim(users.raw_user_meta_data ->> 'phone'), ''),
      users.email,
      'user'
    from auth.users
    where users.id = _actor_id
    on conflict (id) do nothing;

    select *
    into _profile
    from public.profiles
    where profiles.id = _actor_id;
  end if;

  if not found or _profile.role <> 'user' then
    raise exception 'Chỉ tài khoản khách hàng mới có thể tạo yêu cầu.';
  end if;

  if _vehicle_plate is null then
    raise exception 'Biển số xe không hợp lệ.';
  end if;

  _vehicle_type := case
    when p_vehicle_type in ('Xe máy', 'Ô tô') then p_vehicle_type
    else null
  end;

  if _vehicle_type is null then
    raise exception 'Loại xe không hợp lệ.';
  end if;

  select *
  into _vehicle
  from public.vehicles
  where vehicles.id = p_vehicle_id
    and vehicles.owner_id = _actor_id;

  if not found then
    select *
    into _vehicle
    from public.vehicles
    where vehicles.owner_id = _actor_id
      and vehicles.plate = _vehicle_plate
    order by vehicles.created_at desc
    limit 1;
  end if;

  if found then
    update public.vehicles
    set
      name = _vehicle_name,
      plate = _vehicle_plate,
      type = _vehicle_type,
      updated_at = timezone('utc', now())
    where vehicles.id = _vehicle.id
      and vehicles.owner_id = _actor_id
    returning *
    into _vehicle;
  else
    insert into public.vehicles (
      id,
      owner_id,
      name,
      plate,
      year,
      type,
      is_default,
      updated_at
    )
    values (
      p_vehicle_id,
      _actor_id,
      _vehicle_name,
      _vehicle_plate,
      _vehicle_year,
      _vehicle_type,
      not exists (
        select 1
        from public.vehicles
        where vehicles.owner_id = _actor_id
      ),
      timezone('utc', now())
    )
    returning *
    into _vehicle;
  end if;

  select service_requests.id
  into _existing_request_id
  from public.service_requests
  where service_requests.requester_id = _actor_id
    and service_requests.status in (
      'Chờ fixer xác nhận',
      'Fixer đã xác nhận',
      'Đang tiếp cận',
      'Đang hỗ trợ'
    )
  order by service_requests.created_at desc
  limit 1;

  if _existing_request_id is not null then
    select *
    into _created_request
    from public.service_requests
    where service_requests.id = _existing_request_id;

    return _created_request;
  end if;

  insert into public.service_requests (
    id,
    requester_id,
    requester_name,
    requester_phone,
    service_id,
    service_title,
    service_price,
    service_eta,
    vehicle_id,
    vehicle_name,
    vehicle_plate,
    vehicle_type,
    location_address,
    location_lat,
    location_lng,
    location_source,
    notes,
    fixer_id,
    fixer_name,
    fixer_team,
    fixer_vehicle,
    status,
    updated_at
  )
  values (
    p_request_id,
    _actor_id,
    coalesce(
      nullif(btrim(_profile.full_name), ''),
      nullif(split_part(coalesce(_profile.email, ''), '@', 1), ''),
      'Khách ResQ'
    ),
    nullif(btrim(_profile.phone), ''),
    p_service_id,
    p_service_title,
    p_service_price,
    p_service_eta,
    _vehicle.id,
    _vehicle.name,
    _vehicle.plate,
    _vehicle.type,
    p_location_address,
    p_location_lat,
    p_location_lng,
    p_location_source,
    nullif(btrim(coalesce(p_notes, '')), ''),
    null,
    null,
    'Đội ResQ chờ xác nhận',
    'Fixer sẽ xác nhận sau',
    'Chờ fixer xác nhận',
    timezone('utc', now())
  )
  returning *
  into _created_request;

  perform app_private.append_status_event(
    _created_request.id,
    _actor_id,
    'user',
    'created',
    _created_request.status,
    null
  );

  perform app_private.append_system_message(
    _created_request.id,
    app_private.request_status_message(_created_request.status, null)
  );

  return _created_request;
end;
$$;

grant execute on function app_private.create_service_request_internal(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text
) to authenticated;

create or replace function public.create_service_request(
  p_request_id text,
  p_service_id text,
  p_service_title text,
  p_service_price text,
  p_service_eta text,
  p_vehicle_id text,
  p_vehicle_name text,
  p_vehicle_plate text,
  p_vehicle_type text,
  p_location_address text,
  p_location_lat double precision,
  p_location_lng double precision,
  p_location_source text,
  p_notes text default null
)
returns public.service_requests
language sql
security invoker
set search_path = ''
as $$
  select app_private.create_service_request_internal(
    p_request_id,
    p_service_id,
    p_service_title,
    p_service_price,
    p_service_eta,
    p_vehicle_id,
    p_vehicle_name,
    p_vehicle_plate,
    p_vehicle_type,
    p_location_address,
    p_location_lat,
    p_location_lng,
    p_location_source,
    p_notes
  );
$$;

create or replace function app_private.accept_service_request_internal(
  p_request_id text
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _profile public.profiles%rowtype;
  _fixer_profile public.fixer_profiles%rowtype;
  _updated_request public.service_requests%rowtype;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để nhận đơn.';
  end if;

  select *
  into _profile
  from public.profiles
  where profiles.id = _actor_id;

  select *
  into _fixer_profile
  from public.fixer_profiles
  where fixer_profiles.profile_id = _actor_id;

  if not found
    or _profile.role <> 'fixer'
    or _fixer_profile.approval_status <> 'approved'
    or not coalesce(_fixer_profile.is_available, false) then
    raise exception 'Chỉ fixer đang hoạt động và đã được duyệt mới có thể nhận đơn.';
  end if;

  update public.service_requests
  set
    fixer_id = _actor_id,
    fixer_name = coalesce(
      nullif(btrim(_profile.full_name), ''),
      nullif(split_part(coalesce(_profile.email, ''), '@', 1), ''),
      'Fixer ResQ'
    ),
    fixer_team = coalesce(
      nullif(btrim(_fixer_profile.team_name), ''),
      'Đội Fixer ResQ'
    ),
    fixer_vehicle = coalesce(
      nullif(btrim(_fixer_profile.support_vehicle), ''),
      case
        when vehicle_type = 'Xe máy' then 'Xe máy toolkit ResQ'
        else 'Van cứu hộ ResQ'
      end
    ),
    status = 'Fixer đã xác nhận',
    updated_at = timezone('utc', now())
  where service_requests.id = p_request_id
    and service_requests.status = 'Chờ fixer xác nhận'
  returning *
  into _updated_request;

  if not found then
    raise exception 'Đơn hàng này không còn ở trạng thái chờ fixer xác nhận.';
  end if;

  insert into public.request_assignments (
    request_id,
    requester_id,
    fixer_id,
    status,
    accepted_at,
    completed_at,
    cancelled_at,
    updated_at
  )
  values (
    _updated_request.id,
    _updated_request.requester_id,
    _actor_id,
    'accepted',
    timezone('utc', now()),
    null,
    null,
    timezone('utc', now())
  )
  on conflict (request_id) do update
  set
    requester_id = excluded.requester_id,
    fixer_id = excluded.fixer_id,
    status = 'accepted',
    accepted_at = excluded.accepted_at,
    completed_at = null,
    cancelled_at = null,
    updated_at = excluded.updated_at;

  perform app_private.append_status_event(
    _updated_request.id,
    _actor_id,
    'fixer',
    'accepted',
    _updated_request.status,
    null
  );

  perform app_private.append_system_message(
    _updated_request.id,
    app_private.request_status_message(
      _updated_request.status,
      _updated_request.fixer_name
    )
  );

  return _updated_request;
end;
$$;

grant execute on function app_private.accept_service_request_internal(text)
to authenticated;

create or replace function public.accept_service_request(
  p_request_id text
)
returns public.service_requests
language sql
security invoker
set search_path = ''
as $$
  select app_private.accept_service_request_internal(p_request_id);
$$;

create or replace function app_private.advance_service_request_status_internal(
  p_request_id text
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _current_request public.service_requests%rowtype;
  _next_status text;
  _event_type text := 'progressed';
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để cập nhật đơn.';
  end if;

  select *
  into _current_request
  from public.service_requests
  where service_requests.id = p_request_id
    and service_requests.fixer_id = _actor_id
  for update;

  if not found then
    raise exception 'Bạn không có quyền cập nhật đơn này.';
  end if;

  case _current_request.status
    when 'Fixer đã xác nhận' then _next_status := 'Đang tiếp cận';
    when 'Đang tiếp cận' then _next_status := 'Đang hỗ trợ';
    when 'Đang hỗ trợ' then
      _next_status := 'Hoàn thành';
      _event_type := 'completed';
    when 'Hoàn thành' then
      return _current_request;
    else
      raise exception 'Không thể cập nhật thêm trạng thái cho đơn này.';
  end case;

  update public.service_requests
  set
    status = _next_status,
    updated_at = timezone('utc', now())
  where service_requests.id = p_request_id
  returning *
  into _current_request;

  if _next_status = 'Hoàn thành' then
    update public.request_assignments
    set
      status = 'completed',
      completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where request_assignments.request_id = p_request_id;
  end if;

  perform app_private.append_status_event(
    _current_request.id,
    _actor_id,
    'fixer',
    _event_type,
    _current_request.status,
    null
  );

  perform app_private.append_system_message(
    _current_request.id,
    app_private.request_status_message(_current_request.status, _current_request.fixer_name)
  );

  return _current_request;
end;
$$;

grant execute on function app_private.advance_service_request_status_internal(text)
to authenticated;

create or replace function public.advance_service_request_status(
  p_request_id text
)
returns public.service_requests
language sql
security invoker
set search_path = ''
as $$
  select app_private.advance_service_request_status_internal(p_request_id);
$$;

create or replace function app_private.complete_service_request_internal(
  p_request_id text
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _current_request public.service_requests%rowtype;
  _actor_role text;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để hoàn tất đơn.';
  end if;

  select *
  into _current_request
  from public.service_requests
  where service_requests.id = p_request_id
    and (
      service_requests.requester_id = _actor_id
      or service_requests.fixer_id = _actor_id
    )
  for update;

  if not found then
    raise exception 'Bạn không có quyền hoàn tất đơn này.';
  end if;

  if _current_request.status = 'Hoàn thành' then
    return _current_request;
  end if;

  if _current_request.status = 'Đã hủy' then
    raise exception 'Đơn đã bị hủy nên không thể hoàn tất.';
  end if;

  _actor_role := case
    when _current_request.fixer_id = _actor_id then 'fixer'
    else 'user'
  end;

  update public.service_requests
  set
    status = 'Hoàn thành',
    updated_at = timezone('utc', now())
  where service_requests.id = p_request_id
  returning *
  into _current_request;

  update public.request_assignments
  set
    status = 'completed',
    completed_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where request_assignments.request_id = p_request_id;

  perform app_private.append_status_event(
    _current_request.id,
    _actor_id,
    _actor_role,
    'completed',
    _current_request.status,
    null
  );

  perform app_private.append_system_message(
    _current_request.id,
    app_private.request_status_message(_current_request.status, _current_request.fixer_name)
  );

  return _current_request;
end;
$$;

grant execute on function app_private.complete_service_request_internal(text)
to authenticated;

create or replace function public.complete_service_request(
  p_request_id text
)
returns public.service_requests
language sql
security invoker
set search_path = ''
as $$
  select app_private.complete_service_request_internal(p_request_id);
$$;

create or replace function app_private.cancel_service_request_internal(
  p_request_id text
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _current_request public.service_requests%rowtype;
  _actor_role text;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để hủy đơn.';
  end if;

  select *
  into _current_request
  from public.service_requests
  where service_requests.id = p_request_id
    and (
      service_requests.requester_id = _actor_id
      or service_requests.fixer_id = _actor_id
    )
  for update;

  if not found then
    raise exception 'Bạn không có quyền hủy đơn này.';
  end if;

  if _current_request.status = 'Đã hủy' then
    return _current_request;
  end if;

  if _current_request.status = 'Hoàn thành' then
    raise exception 'Đơn đã hoàn thành nên không thể hủy.';
  end if;

  _actor_role := case
    when _current_request.fixer_id = _actor_id then 'fixer'
    else 'user'
  end;

  update public.service_requests
  set
    status = 'Đã hủy',
    updated_at = timezone('utc', now())
  where service_requests.id = p_request_id
  returning *
  into _current_request;

  update public.request_assignments
  set
    status = 'cancelled',
    cancelled_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where request_assignments.request_id = p_request_id;

  perform app_private.append_status_event(
    _current_request.id,
    _actor_id,
    _actor_role,
    'cancelled',
    _current_request.status,
    null
  );

  perform app_private.append_system_message(
    _current_request.id,
    app_private.request_status_message(_current_request.status, null)
  );

  return _current_request;
end;
$$;

grant execute on function app_private.cancel_service_request_internal(text)
to authenticated;

create or replace function public.cancel_service_request(
  p_request_id text
)
returns public.service_requests
language sql
security invoker
set search_path = ''
as $$
  select app_private.cancel_service_request_internal(p_request_id);
$$;

create or replace function app_private.send_request_message_internal(
  p_request_id text,
  p_body text
)
returns public.service_request_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _current_request public.service_requests%rowtype;
  _profile public.profiles%rowtype;
  _sender_role text;
  _message public.service_request_messages%rowtype;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để gửi tin nhắn.';
  end if;

  if nullif(btrim(coalesce(p_body, '')), '') is null then
    raise exception 'Tin nhắn không được để trống.';
  end if;

  select *
  into _current_request
  from public.service_requests
  where service_requests.id = p_request_id;

  if not found then
    raise exception 'Không tìm thấy yêu cầu tương ứng.';
  end if;

  if _current_request.requester_id = _actor_id then
    _sender_role := 'user';
  elsif _current_request.fixer_id = _actor_id then
    _sender_role := 'fixer';
  else
    raise exception 'Bạn không có quyền gửi tin nhắn cho yêu cầu này.';
  end if;

  select *
  into _profile
  from public.profiles
  where profiles.id = _actor_id;

  insert into public.service_request_messages (
    request_id,
    sender_id,
    sender_name,
    sender_role,
    body
  )
  values (
    p_request_id,
    _actor_id,
    coalesce(
      nullif(btrim(_profile.full_name), ''),
      nullif(split_part(coalesce(_profile.email, ''), '@', 1), ''),
      'Người dùng ResQ'
    ),
    _sender_role,
    btrim(p_body)
  )
  returning *
  into _message;

  return _message;
end;
$$;

grant execute on function app_private.send_request_message_internal(text, text)
to authenticated;

create or replace function public.send_request_message(
  p_request_id text,
  p_body text
)
returns public.service_request_messages
language sql
security invoker
set search_path = ''
as $$
  select app_private.send_request_message_internal(p_request_id, p_body);
$$;

create or replace function public.load_live_request_state()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  _actor_id uuid := auth.uid();
  _profile public.profiles%rowtype;
  _active_request jsonb := null;
  _pending_requests jsonb := '[]'::jsonb;
  _request_history jsonb := '[]'::jsonb;
  _fixer_approval_status text := null;
  _fixer_is_available boolean := null;
  _has_active_assignment boolean := false;
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để tải dữ liệu yêu cầu.';
  end if;

  select *
  into _profile
  from public.profiles
  where profiles.id = _actor_id;

  if not found then
    raise exception 'Không tìm thấy hồ sơ tương ứng.';
  end if;

  if _profile.role = 'fixer' then
    select
      fixer_profiles.approval_status,
      fixer_profiles.is_available
    into
      _fixer_approval_status,
      _fixer_is_available
    from public.fixer_profiles
    where fixer_profiles.profile_id = _actor_id;

    select to_jsonb(request_row)
    into _active_request
    from (
      select sr.*
      from public.request_assignments ra
      join public.service_requests sr
        on sr.id = ra.request_id
      where ra.fixer_id = _actor_id
        and ra.status = 'accepted'
        and sr.status in ('Fixer đã xác nhận', 'Đang tiếp cận', 'Đang hỗ trợ')
      order by coalesce(ra.accepted_at, sr.updated_at, sr.created_at) desc
      limit 1
    ) request_row;

    _has_active_assignment := _active_request is not null;

    if coalesce(_fixer_approval_status, 'pending') = 'approved'
      and coalesce(_fixer_is_available, true) then
      select coalesce(
        jsonb_agg(to_jsonb(request_row) order by request_row.created_at desc),
        '[]'::jsonb
      )
      into _pending_requests
      from (
        select sr.*
        from public.service_requests sr
        where sr.status = 'Chờ fixer xác nhận'
        order by sr.created_at desc
        limit case
          when _has_active_assignment then 6
          else 12
        end
      ) request_row;
    end if;

    select coalesce(
      jsonb_agg((to_jsonb(request_row) - 'sort_at') order by request_row.sort_at desc),
      '[]'::jsonb
    )
    into _request_history
    from (
      select
        sr.*,
        coalesce(
          ra.completed_at,
          ra.cancelled_at,
          ra.accepted_at,
          sr.updated_at,
          sr.created_at
        ) as sort_at
      from public.service_requests sr
      left join public.request_assignments ra
        on ra.request_id = sr.id
      where sr.fixer_id = _actor_id
      order by sort_at desc
      limit 12
    ) request_row;
  else
    select to_jsonb(request_row)
    into _active_request
    from (
      select sr.*
      from public.service_requests sr
      where sr.requester_id = _actor_id
        and sr.status in ('Chờ fixer xác nhận', 'Fixer đã xác nhận', 'Đang tiếp cận', 'Đang hỗ trợ')
      order by coalesce(sr.updated_at, sr.created_at) desc
      limit 1
    ) request_row;

    select coalesce(
      jsonb_agg((to_jsonb(request_row) - 'sort_at') order by request_row.sort_at desc),
      '[]'::jsonb
    )
    into _request_history
    from (
      select
        sr.*,
        coalesce(
          ra.completed_at,
          ra.cancelled_at,
          sr.updated_at,
          sr.created_at
        ) as sort_at
      from public.service_requests sr
      left join public.request_assignments ra
        on ra.request_id = sr.id
      where sr.requester_id = _actor_id
      order by sort_at desc
      limit 12
    ) request_row;
  end if;

  return jsonb_build_object(
    'actor_role',
    _profile.role,
    'active_request',
    _active_request,
    'pending_requests',
    _pending_requests,
    'request_history',
    _request_history,
    'fixer_approval_status',
    _fixer_approval_status,
    'fixer_is_available',
    _fixer_is_available
  );
end;
$$;

create or replace function public.list_request_status_events(
  p_request_id text
)
returns setof public.request_status_events
language sql
security invoker
set search_path = ''
as $$
  select request_status_events.*
  from public.request_status_events
  where request_status_events.request_id = p_request_id
  order by request_status_events.created_at asc;
$$;

grant execute on function public.load_live_request_state()
to authenticated;

grant execute on function public.list_request_status_events(text)
to authenticated;
