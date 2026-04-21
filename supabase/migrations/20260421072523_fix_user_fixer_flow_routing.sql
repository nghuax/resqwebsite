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
set
  team_name = coalesce(fixer_profiles.team_name, excluded.team_name),
  updated_at = timezone('utc', now());

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
