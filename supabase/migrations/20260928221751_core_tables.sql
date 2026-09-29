create table public.profiles (
	id uuid primary key references auth.users (id) on delete restrict,
	email text not null,
	role public.app_role not null,
	display_name text not null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint profiles_email_normalized check (email = lower(btrim(email))),
	constraint profiles_display_name_not_empty check (length(btrim(display_name)) > 0)
);

create table public.residents (
	profile_id uuid primary key references public.profiles (id) on delete restrict,
	tower text not null,
	apartment text not null,
	phone text not null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint residents_tower_not_empty check (length(btrim(tower)) > 0),
	constraint residents_apartment_not_empty check (length(btrim(apartment)) > 0),
	constraint residents_phone_not_empty check (length(btrim(phone)) > 0)
);

create table public.occurrences (
	id bigint generated always as identity primary key,
	public_id text not null unique,
	title text not null,
	description text not null,
	category public.occurrence_category not null,
	location text not null,
	status public.occurrence_status not null default 'pending',
	author_profile_id uuid not null references public.profiles (id) on delete restrict,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	deleted_at timestamptz,
	constraint occurrences_public_id_format check (public_id ~ '^OC-[A-Z0-9]{8}$'),
	constraint occurrences_title_not_empty check (length(btrim(title)) > 0),
	constraint occurrences_description_not_empty check (length(btrim(description)) > 0),
	constraint occurrences_location_not_empty check (length(btrim(location)) > 0)
);

create table public.occurrence_photos (
	id bigint generated always as identity primary key,
	occurrence_id bigint not null references public.occurrences (id) on delete cascade,
	storage_path text not null unique,
	mime_type text not null,
	size_bytes bigint not null,
	created_at timestamptz not null default now(),
	constraint occurrence_photos_storage_path_not_empty check (length(btrim(storage_path)) > 0),
	constraint occurrence_photos_mime_type check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
	constraint occurrence_photos_size_bytes check (size_bytes > 0 and size_bytes <= 5242880)
);

create table public.occurrence_comments (
	id bigint generated always as identity primary key,
	occurrence_id bigint not null references public.occurrences (id) on delete cascade,
	author_profile_id uuid not null references public.profiles (id) on delete restrict,
	body text not null,
	created_at timestamptz not null default now(),
	constraint occurrence_comments_body_not_empty check (length(btrim(body)) > 0)
);
