drop policy occurrence_comments_insert_resident_author on public.occurrence_comments;

create policy occurrence_comments_insert_resident
	on public.occurrence_comments for insert to authenticated
	with check (
		(select private.current_app_role()) = 'resident'::public.app_role
		and author_profile_id = (select auth.uid())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_comments.occurrence_id
				and o.deleted_at is null
		)
	);

create policy occurrence_comments_delete_author
	on public.occurrence_comments for delete to authenticated
	using (
		author_profile_id = (select auth.uid())
		and (select private.is_app_user())
		and exists (
			select 1
			from public.occurrences as o
			where o.id = occurrence_comments.occurrence_id
				and o.deleted_at is null
		)
	);

grant delete on table public.occurrence_comments to authenticated;
