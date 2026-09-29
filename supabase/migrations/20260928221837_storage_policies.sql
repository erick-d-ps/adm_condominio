insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'occurrence-photos',
	'occurrence-photos',
	false,
	5242880,
	array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
		file_size_limit = excluded.file_size_limit,
		allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;
grant usage on schema storage to authenticated;
revoke all on table storage.objects from anon, authenticated;
grant select on table storage.objects to authenticated;

create policy occurrence_storage_select_for_app_users
	on storage.objects for select to authenticated
	using (
		bucket_id = 'occurrence-photos'
		and (select private.is_app_user())
		and exists (
			select 1
			from public.occurrences as o
			where o.id::text = (storage.foldername(name))[1]
				and o.deleted_at is null
		)
	);

