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
