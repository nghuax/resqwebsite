create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

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

drop policy if exists "Vehicles are viewable by owner" on public.vehicles;
create policy "Vehicles are viewable by owner"
on public.vehicles
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.customer_profiles
    where customer_profiles.profile_id = auth.uid()
  )
);

drop policy if exists "Vehicles are insertable by owner" on public.vehicles;
create policy "Vehicles are insertable by owner"
on public.vehicles
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.customer_profiles
    where customer_profiles.profile_id = auth.uid()
  )
);

drop policy if exists "Vehicles are updateable by owner" on public.vehicles;
create policy "Vehicles are updateable by owner"
on public.vehicles
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.customer_profiles
    where customer_profiles.profile_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.customer_profiles
    where customer_profiles.profile_id = auth.uid()
  )
);

drop policy if exists "Vehicles are deletable by owner" on public.vehicles;
create policy "Vehicles are deletable by owner"
on public.vehicles
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.customer_profiles
    where customer_profiles.profile_id = auth.uid()
  )
);

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
begin
  if _actor_id is null then
    raise exception 'Bạn cần đăng nhập để tạo yêu cầu.';
  end if;

  select *
  into _profile
  from public.profiles
  where profiles.id = _actor_id;

  if not found or _profile.role <> 'user' then
    raise exception 'Chỉ tài khoản khách hàng mới có thể tạo yêu cầu.';
  end if;

  select *
  into _vehicle
  from public.vehicles
  where vehicles.id = p_vehicle_id
    and vehicles.owner_id = _actor_id;

  if not found then
    raise exception 'Không tìm thấy phương tiện hợp lệ cho yêu cầu này.';
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
    raise exception 'Bạn đang có một yêu cầu đang hoạt động.';
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

  if not found or _profile.role <> 'fixer' or _fixer_profile.approval_status <> 'approved' then
    raise exception 'Chỉ fixer đã được duyệt mới có thể nhận đơn.';
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
