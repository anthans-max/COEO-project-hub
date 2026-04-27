-- ============================================================
-- COEO Project Hub — Doc Uploads
-- Extends coeo_docs with file metadata columns and provisions
-- a private 'project-docs' Supabase Storage bucket.
-- ============================================================

-- Schema: add nullable upload-metadata columns to coeo_docs.
-- Existing rows (URL-link docs) leave these NULL.
alter table coeo_docs add column if not exists file_path text;
alter table coeo_docs add column if not exists file_size bigint;
alter table coeo_docs add column if not exists mime_type text;

-- Storage bucket: private. Reads must go through the signed-URL route handler
-- (server-side, service-role key). Writes happen from the browser via anon.
insert into storage.buckets (id, name, public)
values ('project-docs', 'project-docs', false)
on conflict (id) do nothing;

-- RLS on storage.objects scoped to the project-docs bucket.
-- Anon may insert/update/delete (browser uploads + cleanup).
-- No select policy — reads are issued only by the signed-URL route handler.
create policy "project_docs_insert"
  on storage.objects for insert
  with check (bucket_id = 'project-docs');

create policy "project_docs_update"
  on storage.objects for update
  using (bucket_id = 'project-docs')
  with check (bucket_id = 'project-docs');

create policy "project_docs_delete"
  on storage.objects for delete
  using (bucket_id = 'project-docs');
