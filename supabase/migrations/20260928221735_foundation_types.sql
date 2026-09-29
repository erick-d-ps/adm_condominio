create schema if not exists private;

create type public.app_role as enum ('employee', 'resident');
create type public.occurrence_category as enum (
	'maintenance',
	'noise',
	'cleaning',
	'other'
);
create type public.occurrence_status as enum ('pending', 'in_review', 'resolved');
