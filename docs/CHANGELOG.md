# Changelog

Dated, one line per meaningful change. This is part of the IP evidence trail — keep it current as you build, don't reconstruct it later.

## 2026-07-22
- Rebuilt platform architecture from seven layers into a scoped 3-module core loop (Assess, Develop, Evidence) plus Connect and Insight, with Configuration/Integration/Communication demoted to infrastructure substrate
- Removed standalone Advance/Promotion-Readiness module — FEP does not judge promotion readiness or touch governance workflow; its one legitimate function (compiling an exportable evidence record) absorbed into Evidence
- Defined Evidence's core artifact as an auto-generated certificate of attendance, issued only when attendance is confirmed and the Quality Department's Jotform evaluation is submitted
- Designed organizational hierarchy (Institution → College → Department → Faculty) as real foreign keys in Configuration
- Designed Insight's three-tier heat map (Institution/College/Department scopes, gap-severity color, privacy-scoped by role)
- Named and specified the FEP Card Layer System design language: customizable brand color tokens, fixed structural/motion system, gloss limited to two surfaces, dark mode as its own designed palette
- Drafted `00-platform-design-spec.md` v1 and `03-design-system.md` v1
- Generated repo skeleton for the rebuild

## 2026-07-22 (continued)
- Ported Assess module from old Assessment.jsx: identical business logic, restyled onto token system
- Ported and consolidated Develop module from old IDP.jsx + FacultyPathways.jsx (previously two overlapping, independently-fetching components) into one, restyled
- Built shared theme tokens (customizable brand colors, light/dark surface palettes) and shared Card/Button/Pill components
- Updated Shell.jsx routing to match new module names (assess, develop replacing assessment, idp, pathways)
- Removed hardcoded Supabase anon-key fallback found in the old public repo's supabase.js
- Carried over remaining components (AdminDashboard, FacultyDashboard, Portfolio, InviteFaculty, Settings, Auth, Onboarding, CommCentre) as-is under src/modules/legacy/ pending their own proper ports
- Built Evidence module: certificate auto-issuance checking attendance_confirmed + Jotform evaluation status, compiled certificate record with print/export
- Added attendance/evaluation schema (supabase/sql/evidence_schema.sql): workshops.jotform_form_id, enrolments.attendance_confirmed/evaluation_confirmed, new certificates table with RLS
- Built supabase/functions/check-evaluation edge function — Jotform API key lives server-side only, never in the Vite app's env
- Ported PathwaysManagement.jsx into PathwaysAdmin.jsx (was never wired into the old Shell's nav) — added jotform_form_id field to the workshop form and a new attendance-marking panel (attendance confirmation didn't exist anywhere in the old app)
- Wired Evidence and PathwaysAdmin into Shell routing
