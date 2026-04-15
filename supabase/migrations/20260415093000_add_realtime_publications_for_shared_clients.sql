do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.vehicles;
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.service_requests;
exception
  when duplicate_object then
    null;
end
$$;
