-- Fix "Database error deleting user" in Supabase Auth dashboard.
-- All public FKs already CASCADE; the usual blocker is trigger_recompute_snapshot
-- firing on every cascaded transaction DELETE during auth user removal.

create or replace function public.handle_auth_user_delete()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  perform set_config('finsight.user_deleting', old.id::text, true);

  begin
    delete from storage.objects
    where bucket_id = 'statement-uploads'
      and (
        owner = old.id
        or (storage.foldername(name))[1] = old.id::text
      );
  exception when others then
    null;
  end;

  return old;
end;
$$;

drop trigger if exists on_auth_user_delete on auth.users;
create trigger on_auth_user_delete
  before delete on auth.users
  for each row execute function public.handle_auth_user_delete();

create or replace function public.trigger_recompute_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := coalesce(new.user_id, old.user_id);
begin
  if coalesce(current_setting('finsight.user_deleting', true), '') = v_user_id::text then
    return coalesce(new, old);
  end if;

  begin
    perform public.recompute_dashboard_snapshot(v_user_id);
  exception when others then
    null;
  end;

  return coalesce(new, old);
end;
$$;

-- Fallback: run from SQL editor if dashboard delete still fails
--   select public.admin_delete_user('uuid-here');
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, storage, auth
as $$
begin
  perform set_config('finsight.user_deleting', p_user_id::text, true);

  begin
    delete from storage.objects
    where owner = p_user_id
       or (bucket_id = 'statement-uploads' and (storage.foldername(name))[1] = p_user_id::text);
  exception when others then
    null;
  end;

  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to service_role;
