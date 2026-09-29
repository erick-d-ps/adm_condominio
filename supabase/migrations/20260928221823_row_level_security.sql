revoke all on schema private from public, anon, authenticated;
grant usage on schema public to authenticated;
grant usage on schema private to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.residents enable row level security;
alter table public.occurrences enable row level security;
alter table public.occurrence_photos enable row level security;
alter table public.occurrence_comments enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.residents from anon, authenticated;
revoke all on table public.occurrences from anon, authenticated;
revoke all on table public.occurrence_photos from anon, authenticated;
revoke all on table public.occurrence_comments from anon, authenticated;

grant select (id, role, display_name, is_active, created_at, updated_at)
	on table public.profiles to authenticated;
grant select (profile_id, tower, apartment, is_active, created_at, updated_at)
	on table public.residents to authenticated;
grant select on table public.occurrences to authenticated;
grant insert (public_id, title, description, category, location, author_profile_id)
	on table public.occurrences to authenticated;
grant update (title, description, category, location)
	on table public.occurrences to authenticated;
grant select on table public.occurrence_photos to authenticated;
grant insert (occurrence_id, storage_path, mime_type, size_bytes)
	on public.occurrence_photos to authenticated;
grant insert (occurrence_id, storage_path, mime_type, size_bytes)
	on public.occurrence_photos to authenticated;
grant select on table public.occurrence_comments to authenticated;
grant insert (occurrence_id, author_profile_id, body)
	on table public.occurrence_comments to authenticated;

create policy profiles_select_for_app_users
	on public.profiles for select to authenticated
	using (
		(select private.is_app_user())
		and (
			id = (select auth.uid())
			or (select private.is_employee())
		)
	);

create policy residents_select_for_app_users
	on public.residents for select to authenticated
	using (
		(select private.is_app_user())
		and (
			profile_id = (select auth.uid())
			or (select private.is_employee())
		)
	);

create policy occurrences_select_for_app_users
	on public.occurrences for select to authenticated
	using (
		(select private.is_app_user())
		and deleted_at is null
	);

create policy occurrences_insert_employee
	on public.occurrences for insert to authenticated
	with check (
		(select private.current_app_role()) = 'employee'::public.app_role
		and author_profile_id = (select auth.uid())
		and status = 'pending'::public.occurrence_status
		and deleted_at is null
	);

create policy occurrences_insert_resident
	on public.occurrences for insert to authenticated
	with check (
		(select private.current_app_role()) = 'resident'::public.app_role
		and author_profile_id = (select auth.uid())
		and status = 'pending'::public.occurrence_status
		and deleted_at is null
	);

create policy occurrences_update_author_pending
	on public.occurrences for update to authenticated
	using ((select private.can_edit_occurrence(id)))
	with check (
		(select private.can_edit_occurrence(id))
		and status = 'pending'::public.occurrence_status
		and deleted_at is null
	);

create policy occurrence_photos_select_for_app_users
	on public.occurrence_photos for select to authenticated
	using (
		(select private.is_app_user())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_photos.occurrence_id
				and o.deleted_at is null
		)
	);

create policy occurrence_photos_insert_author_pending
	on public.occurrence_photos for insert to authenticated
	with check (
		(select private.can_edit_occurrence(occurrence_id))
		and storage_path like occurrence_id::text || '/%'
	);

create policy occurrence_comments_select_for_app_users
	on public.occurrence_comments for select to authenticated
	using (
		(select private.is_app_user())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_comments.occurrence_id
				and o.deleted_at is null
		)
	);

create policy occurrence_comments_insert_employee
	on public.occurrence_comments for insert to authenticated
	with check (
		(select private.current_app_role()) = 'employee'::public.app_role
		and author_profile_id = (select auth.uid())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_comments.occurrence_id
				and o.deleted_at is null
		)
	);

create policy occurrence_comments_insert_resident_author
	on public.occurrence_comments for insert to authenticated
	with check (
		(select private.current_app_role()) = 'resident'::public.app_role
		and author_profile_id = (select auth.uid())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_comments.occurrence_id
				and o.author_profile_id = (select auth.uid())
				and o.deleted_at is null
		)
	);

revoke execute on function private.current_app_role() from public, anon;
revoke execute on function private.is_app_user() from public, anon;
revoke execute on function private.is_employee() from public, anon;
revoke execute on function private.can_edit_occurrence(bigint) from public, anon;
revoke execute on function private.set_updated_at() from public, anon;
revoke execute on function private.enforce_occurrence_photo_limit() from public, anon;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_app_user() to authenticated;
grant execute on function private.is_employee() to authenticated;
grant execute on function private.can_edit_occurrence(bigint) to authenticated;
grant execute on function private.set_updated_at() to authenticated, service_role;
grant execute on function private.enforce_occurrence_photo_limit() to authenticated, service_role;

revoke execute on function public.advance_occurrence_status(bigint, public.occurrence_status)
	from public, anon;
revoke execute on function public.soft_delete_occurrence(bigint) from public, anon;
grant execute on function public.advance_occurrence_status(bigint, public.occurrence_status)
	to authenticated;
grant execute on function public.soft_delete_occurrence(bigint) to authenticated;
