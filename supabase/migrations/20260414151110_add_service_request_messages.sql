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
