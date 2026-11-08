create extension if not exists pgcrypto;

create table public.assets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, brand text, category text, model_number text, serial_number text,
 purchase_date date, purchase_price numeric(12,2), currency text not null default 'INR',
 seller text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 asset_id uuid references public.assets(id) on delete set null,
 document_type text not null, storage_path text not null, original_filename text, mime_type text not null,
 processing_status text not null default 'pending' check (processing_status in ('pending','processing','completed','failed')),
 created_at timestamptz not null default now()
);
create table public.extractions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 document_id uuid not null references public.documents(id) on delete cascade,
 extracted_data jsonb not null, user_verified boolean not null default false, created_at timestamptz not null default now()
);
create index assets_user_id_idx on public.assets(user_id);
create index documents_user_id_idx on public.documents(user_id);
create index documents_asset_id_idx on public.documents(asset_id);
create index extractions_user_id_idx on public.extractions(user_id);
create index extractions_document_id_idx on public.extractions(document_id);

alter table public.assets enable row level security;
alter table public.documents enable row level security;
alter table public.extractions enable row level security;

create policy "Users can read their own assets" on public.assets for select using (auth.uid() = user_id);
create policy "Users can create their own assets" on public.assets for insert with check (auth.uid() = user_id);
create policy "Users can update their own assets" on public.assets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own assets" on public.assets for delete using (auth.uid() = user_id);
create policy "Users can read their own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users can create their own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents" on public.documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own documents" on public.documents for delete using (auth.uid() = user_id);
create policy "Users can read their own extractions" on public.extractions for select using (auth.uid() = user_id);
create policy "Users can create their own extractions" on public.extractions for insert with check (auth.uid() = user_id);
create policy "Users can delete their own extractions" on public.extractions for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('ownership-documents','ownership-documents',false,10485760)
on conflict (id) do nothing;
create policy "Users can read own stored documents" on storage.objects for select using (
 bucket_id = 'ownership-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Users can upload to own document folder" on storage.objects for insert with check (
 bucket_id = 'ownership-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Users can delete own stored documents" on storage.objects for delete using (
 bucket_id = 'ownership-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
