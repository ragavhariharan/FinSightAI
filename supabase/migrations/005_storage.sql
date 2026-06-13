-- FinSight AI — Person 1: storage bucket for CSV uploads
-- Also create bucket "statement-uploads" in Supabase Dashboard → Storage if this insert fails

insert into storage.buckets (id, name, public)
values ('statement-uploads', 'statement-uploads', false)
on conflict (id) do nothing;

create policy "statement_uploads_select_own"
  on storage.objects for select
  using (bucket_id = 'statement-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "statement_uploads_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'statement-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "statement_uploads_delete_own"
  on storage.objects for delete
  using (bucket_id = 'statement-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
