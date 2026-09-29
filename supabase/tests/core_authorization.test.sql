begin;

select plan(15);

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'employee@example.test', now(), now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'resident@example.test', now(), now(), now()),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'other@example.test', now(), now(), now()),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'new-resident@example.test', now(), now(), now());

insert into public.profiles (id, email, role, display_name)
values
  ('10000000-0000-4000-8000-000000000001', 'employee@example.test', 'employee', 'Funcionário de teste'),
  ('10000000-0000-4000-8000-000000000002', 'resident@example.test', 'resident', 'Morador de teste'),
  ('10000000-0000-4000-8000-000000000003', 'other@example.test', 'resident', 'Outro morador'),
  ('10000000-0000-4000-8000-000000000004', 'new-resident@example.test', 'resident', 'Novo morador');

insert into public.residents (profile_id, tower, apartment, phone)
values
  ('10000000-0000-4000-8000-000000000002', 'A', '101', '+5511999990001'),
  ('10000000-0000-4000-8000-000000000003', 'A', '102', '+5511999990002');

insert into public.occurrences (public_id, title, description, category, location, author_profile_id)
values
  ('OC-TEST0001', 'Vazamento', 'Vazamento na cozinha', 'maintenance', 'A-101', '10000000-0000-4000-8000-000000000002'),
  ('OC-TEST0002', 'Lâmpada', 'Lâmpada queimada', 'other', 'Hall', '10000000-0000-4000-8000-000000000001');

select throws_ok(
  $$insert into public.residents (profile_id, tower, apartment, phone)
    values ('10000000-0000-4000-8000-000000000004', ' A ', ' 101 ', '+5511999990004')$$,
  '23505',
  null,
  'a second active resident cannot claim the same normalized unit'
);

set local role anon;
select throws_ok(
  $$select id from public.occurrences$$,
  '42501',
  null,
  'anonymous users cannot read occurrences'
);

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000002';
select is(
  (select count(*)::integer from public.occurrences),
  2,
  'an active resident can read every occurrence'
);

select is(
  (select count(*)::integer from public.profiles),
  1,
  'a resident can only read their own profile'
);

select is(
  (select count(*)::integer from public.residents),
  1,
  'a resident can only read their own unit record'
);

select throws_ok(
  $$insert into public.occurrences (public_id, title, description, category, location, author_profile_id)
    values ('OC-TEST0003', 'Falso autor', 'Teste', 'other', 'Hall', '10000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'a resident cannot create an occurrence for another author'
);

select throws_ok(
  $$insert into public.occurrence_comments (occurrence_id, author_profile_id, body)
    values (
      (select id from public.occurrences where public_id = 'OC-TEST0002'),
      '10000000-0000-4000-8000-000000000002',
      'Comentário indevido'
    )$$,
  '42501',
  null,
  'a resident cannot comment on another author occurrence'
);

select results_eq(
  $$insert into public.occurrence_comments (occurrence_id, author_profile_id, body)
    values (
      (select id from public.occurrences where public_id = 'OC-TEST0001'),
      '10000000-0000-4000-8000-000000000002',
      'Acesso autorizado'
    )
    returning body$$,
  array['Acesso autorizado'],
  'a resident can comment on their own occurrence'
);

select throws_ok(
  $$select public.advance_occurrence_status(
    (select id from public.occurrences where public_id = 'OC-TEST0001'),
    'pending'
  )$$,
  '42501',
  null,
  'a resident cannot advance status'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';

select is(
  public.advance_occurrence_status(
    (select id from public.occurrences where public_id = 'OC-TEST0001'),
    'pending'
  ),
  true,
  'an employee advances pending to in review'
);

select is(
  (select status::text from public.occurrences where public_id = 'OC-TEST0001'),
  'in_review',
  'the occurrence is now in review'
);

select is(
  public.advance_occurrence_status(
    (select id from public.occurrences where public_id = 'OC-TEST0001'),
    'in_review'
  ),
  true,
  'an employee advances in review to resolved'
);

select is(
  public.advance_occurrence_status(
    (select id from public.occurrences where public_id = 'OC-TEST0001'),
    'pending'
  ),
  false,
  'an employee cannot move a resolved occurrence backward'
);

reset role;

update public.residents
set is_active = false
where profile_id = '10000000-0000-4000-8000-000000000002';

select lives_ok(
  $$insert into public.residents (profile_id, tower, apartment, phone)
    values ('10000000-0000-4000-8000-000000000004', 'A', '101', '+5511999990004')$$,
  'an inactive resident releases the unit'
);

insert into public.occurrence_photos (occurrence_id, storage_path, mime_type, size_bytes)
select
  (select id from public.occurrences where public_id = 'OC-TEST0002'),
  '2/photo-' || photo_number || '.jpg',
  'image/jpeg',
  1024
from generate_series(1, 5) as photo_number;

select throws_ok(
  $$insert into public.occurrence_photos (occurrence_id, storage_path, mime_type, size_bytes)
    values (
      (select id from public.occurrences where public_id = 'OC-TEST0002'),
      '2/photo-6.jpg',
      'image/jpeg',
      1024
    )$$,
  '23514',
  null,
  'the database rejects a sixth photo'
);

select * from finish();
rollback;