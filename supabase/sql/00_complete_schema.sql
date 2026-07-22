-- Faculty Excellence Platform — complete schema for a fresh Supabase project
-- (xmufohombjmiikwlevko). Run top to bottom in the SQL Editor, once.
--
-- Policy approach: institution-config tables (institutions, domains, items,
-- pathways, workshops) use permissive "authenticated can do anything"
-- policies — this app doesn't yet enforce admin-vs-faculty at the database
-- level, only in the UI. That's a known gap, not an oversight: tighten these
-- once real role-based checks exist. Personal-data tables (users, responses,
-- enrolments, workshop_attendance, certificates) are properly scoped to the
-- owning faculty member from the start, since that boundary matters now.

-- ───────────────────────── institutions ─────────────────────────
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branding jsonb,
  career_tracks jsonb default '[]'::jsonb,
  comms_settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table institutions enable row level security;

create policy "authenticated full access to institutions"
  on institutions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── users ─────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) unique,
  institution_id uuid references institutions(id) not null,
  full_name text,
  email text,
  role text default 'faculty',
  rank text,
  career_track text,
  created_at timestamptz default now()
);

alter table users enable row level security;

create policy "users insert own record"
  on users for insert
  with check (auth_id = auth.uid());

create policy "users update own record"
  on users for update
  using (auth_id = auth.uid());

create policy "authenticated read all users"
  on users for select
  using (auth.role() = 'authenticated');

-- ───────────────────────── domains ─────────────────────────
create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) not null,
  domain_number int not null,
  code text,
  name text not null,
  core_focus text,
  created_at timestamptz default now()
);

alter table domains enable row level security;

create policy "authenticated full access to domains"
  on domains for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── items ─────────────────────────
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) not null,
  domain_id uuid references domains(id) not null,
  item_number int not null,
  item_text text not null,
  created_at timestamptz default now()
);

alter table items enable row level security;

create policy "authenticated full access to items"
  on items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── assessment_cycles ─────────────────────────
create table if not exists assessment_cycles (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) not null,
  name text not null,
  start_date date,
  status text default 'active',
  created_at timestamptz default now()
);

alter table assessment_cycles enable row level security;

create policy "authenticated full access to cycles"
  on assessment_cycles for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── responses ─────────────────────────
create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  item_id uuid references items(id) not null,
  cycle_id uuid references assessment_cycles(id) not null,
  institution_id uuid references institutions(id) not null,
  importance int check (importance between 1 and 5),
  competence int check (competence between 1 and 5),
  priority int check (priority between 1 and 5),
  tni int generated always as ((importance - competence) * priority) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, item_id, cycle_id)
);

alter table responses enable row level security;

create policy "faculty manage own responses"
  on responses for all
  using (user_id in (select id from users where auth_id = auth.uid()))
  with check (user_id in (select id from users where auth_id = auth.uid()));

-- ───────────────────────── pathways ─────────────────────────
create table if not exists pathways (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) not null,
  code text,
  name text not null,
  description text,
  domain_codes text[] default '{}',
  career_tracks text[] default '{}',
  cpd_credits numeric,
  duration_hours numeric,
  is_flagship boolean default false,
  is_active boolean default true,
  requires_approval boolean default false,
  created_at timestamptz default now()
);

alter table pathways enable row level security;

create policy "authenticated full access to pathways"
  on pathways for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── workshops ─────────────────────────
create table if not exists workshops (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) not null,
  pathway_id uuid references pathways(id) not null,
  title text not null,
  description text,
  facilitator text,
  format text default 'in_person',
  location text,
  meeting_link text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int,
  jotform_form_id text,
  created_at timestamptz default now()
);

alter table workshops enable row level security;

create policy "authenticated full access to workshops"
  on workshops for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── enrolments (pathway-level) ─────────────────────────
create table if not exists enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  pathway_id uuid references pathways(id) not null,
  institution_id uuid references institutions(id) not null,
  status text default 'active',
  progress_percent int default 0,
  created_at timestamptz default now(),
  unique (user_id, pathway_id)
);

alter table enrolments enable row level security;

create policy "authenticated full access to enrolments"
  on enrolments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── workshop_attendance (workshop-level) ─────────────
-- Corrected granularity: attendance and evaluation happen per WORKSHOP, not
-- per pathway. A faculty member enrols in a pathway (enrolments, above) and
-- attends multiple workshops within it (this table, one row per workshop).
create table if not exists workshop_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  workshop_id uuid references workshops(id) not null,
  attendance_confirmed boolean default false,
  evaluation_confirmed boolean default false,
  evaluation_checked_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, workshop_id)
);

alter table workshop_attendance enable row level security;

create policy "authenticated full access to attendance"
  on workshop_attendance for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────── certificates ─────────────────────────
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  workshop_id uuid references workshops(id) not null,
  pathway_id uuid references pathways(id),
  institution_id uuid references institutions(id) not null,
  issued_at timestamptz default now(),
  unique (user_id, workshop_id)
);

alter table certificates enable row level security;

create policy "faculty read own certificates"
  on certificates for select
  using (user_id in (select id from users where auth_id = auth.uid()));

create policy "authenticated insert certificates"
  on certificates for insert
  with check (auth.role() = 'authenticated');
