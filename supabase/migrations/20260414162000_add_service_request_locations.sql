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
