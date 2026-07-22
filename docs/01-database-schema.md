# Database Schema
`docs/01-database-schema.md`
Status: stub — to be filled in from the existing Supabase project (ddsfrevymtdfwgpdsbrs)

---

This document should describe every table in human-readable terms: what it stores, which module(s) read/write it, and its key relationships. It's referenced from `00-platform-design-spec.md` §5 — that section should not be filled in until this one is complete.

## Format for each table

```
### table_name
Owning module(s): Assess / Develop / Evidence / Connect / Insight / Configuration / Integration
Purpose: one or two sentences
Key columns: the ones that matter for understanding relationships, not every column
Relationships: which other tables this links to and how
RLS: what the row-level security policy restricts, in plain terms
```

## Known tables to document (carried over from the existing schema — confirm list against Supabase before filling in)

- institutions
- career_tracks (jsonb column on institutions, or its own table — confirm)
- domains
- items
- pathways
- workshops
- users / faculty
- assessments / TNI scores
- portfolio (being repurposed into Evidence's certificate records)
- (+ remaining tables to enumerate from the live schema)

## New additions needed for this rebuild

- `colleges` table (Institution → College)
- `departments` table (College → Department), with `college_id` FK
- `department_id` and `college_id` FK columns added to the faculty/users table
- `certificates` table (Evidence): faculty_id, workshop_id, issued_at, attendance_confirmed, evaluation_confirmed, export/PDF reference
- Jotform mapping: a `jotform_form_id` column on `workshops`, and a faculty-matching field (email or ID) confirmed against what the Quality Department's form actually captures

---

*Fill this in by exporting the current Supabase schema (Table Editor → each table, or `supabase db dump`) and writing the plain-language description above. Do this before the IP filing — it's the evidence the design spec's schema section points to.*
