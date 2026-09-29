create unique index residents_active_unit_uidx
	on public.residents (upper(btrim(tower)), upper(btrim(apartment)))
	where is_active;

create unique index profiles_email_uidx on public.profiles (email);

create index occurrences_active_created_at_idx
	on public.occurrences (created_at desc, id desc)
	where deleted_at is null;

create index occurrences_active_status_category_idx
	on public.occurrences (status, category, created_at desc)
	where deleted_at is null;

create index occurrences_author_profile_id_idx
	on public.occurrences (author_profile_id);

create index occurrence_photos_occurrence_id_idx
	on public.occurrence_photos (occurrence_id);

create index occurrence_comments_occurrence_created_at_idx
	on public.occurrence_comments (occurrence_id, created_at, id);

create index occurrence_comments_author_profile_id_idx
	on public.occurrence_comments (author_profile_id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
	new.updated_at := pg_catalog.statement_timestamp();
	return new;
end;
$fn$;

create trigger profiles_set_updated_at
	before update on public.profiles
	for each row execute function private.set_updated_at();

create trigger residents_set_updated_at
	before update on public.residents
	for each row execute function private.set_updated_at();

create trigger occurrences_set_updated_at
	before update on public.occurrences
	for each row execute function private.set_updated_at();

create function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $fn$
	select p.role
	from public.profiles as p
	left join public.residents as r on r.profile_id = p.id
	where p.id = (select auth.uid())
		and p.is_active
		and (
			p.role = 'employee'::public.app_role
			or (p.role = 'resident'::public.app_role and r.is_active)
		)
$fn$;

create function private.is_app_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
	select (select private.current_app_role()) is not null
$fn$;

create function private.is_employee()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
	select (select private.current_app_role()) = 'employee'::public.app_role
$fn$;

create function private.can_edit_occurrence(p_occurrence_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
	select exists (
		select 1
		from public.occurrences as o
		where o.id = p_occurrence_id
			and o.author_profile_id = (select auth.uid())
			and o.status = 'pending'::public.occurrence_status
			and o.deleted_at is null
			and (select private.is_app_user())
	)
$fn$;

create function public.advance_occurrence_status(
	p_occurrence_id bigint,
	p_expected_status public.occurrence_status
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
begin
	if (select private.current_app_role()) is distinct from 'employee'::public.app_role then
		raise exception using errcode = '42501', message = 'Employee access required';
	end if;

	if p_expected_status is null or p_expected_status not in (
		'pending'::public.occurrence_status,
		'in_review'::public.occurrence_status
	) then
		return false;
	end if;

	update public.occurrences
	set status = case p_expected_status
		when 'pending'::public.occurrence_status then 'in_review'::public.occurrence_status
		else 'resolved'::public.occurrence_status
	end
	where id = p_occurrence_id
		and status = p_expected_status
		and deleted_at is null;

	return found;
end;
$fn$;

create function private.enforce_occurrence_photo_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
	photo_count bigint;
begin
	perform 1
	from public.occurrences as o
	where o.id = new.occurrence_id
		and o.deleted_at is null
	for update;

	if not found then
		raise exception using errcode = '23503', message = 'Occurrence is unavailable';
	end if;

	select count(*)
	into photo_count
	from public.occurrence_photos as p
	where p.occurrence_id = new.occurrence_id;

	if photo_count >= 5 then
		raise exception using errcode = '23514', message = 'An occurrence can have at most five photos';
	end if;

	return new;
end;
$fn$;

create trigger occurrence_photos_enforce_limit
	before insert on public.occurrence_photos
	for each row execute function private.enforce_occurrence_photo_limit();

create function public.soft_delete_occurrence(p_occurrence_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
begin
	update public.occurrences
	set deleted_at = pg_catalog.statement_timestamp()
	where id = p_occurrence_id
		and author_profile_id = (select auth.uid())
		and status = 'pending'::public.occurrence_status
		and deleted_at is null
		and (select private.is_app_user());

	return found;
end;
$fn$;
