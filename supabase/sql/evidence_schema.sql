-- Evidence module schema additions
-- Run in Supabase SQL editor (Project → SQL Editor) against the new
-- xmufohombjmiikwlevko project. Additive only — nothing here touches
-- existing tables' existing columns.

-- 1. Workshops need to know which Jotform evaluation form covers them
alter table workshops
  add column if not exists jotform_form_id text;

-- 2. Enrolments need the two flags Evidence's certificate trigger watches
alter table enrolments
  add column if not exists attendance_confirmed boolean default false,
  add column if not exists evaluation_confirmed boolean default false,
  add column if not exists evaluation_checked_at timestamptz;

-- 3. Certificates — Evidence's core artifact
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  workshop_id uuid references workshops(id) not null,
  pathway_id uuid references pathways(id),
  institution_id uuid references institutions(id) not null,
  issued_at timestamptz default now(),
  unique (user_id, workshop_id)  -- one certificate per faculty per workshop
);

alter table certificates enable row level security;

-- Faculty can read their own certificates
create policy "faculty reads own certificates"
  on certificates for select
  using (user_id = auth.uid());

-- System/service role inserts certificates (via the edge function, not
-- directly from the browser using a faculty member's own session) —
-- adjust this policy once you decide whether faculty can also self-trigger
-- the check-and-issue action from their own session.
create policy "service role manages certificates"
  on certificates for all
  using (auth.role() = 'service_role');
