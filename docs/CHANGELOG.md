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
- Added attendance/evaluation schema (delivered separately as SQL, not committed to the repo): workshops.jotform_form_id, enrolments.attendance_confirmed/evaluation_confirmed, new certificates table with RLS
- Built supabase/functions/check-evaluation edge function — Jotform API key lives server-side only, never in the Vite app's env
- Ported PathwaysManagement.jsx into PathwaysAdmin.jsx (was never wired into the old Shell's nav) — added jotform_form_id field to the workshop form and a new attendance-marking panel (attendance confirmation didn't exist anywhere in the old app)
- Wired Evidence and PathwaysAdmin into Shell routing
- Discovered the new Supabase project (xmufohombjmiikwlevko) is empty — no base schema exists yet, unlike the old project. Wrote the full base schema as SQL (delivered separately, not committed to the repo — SQL migrations are kept out of git by design going forward).
- Corrected a modeling bug in the same pass: attendance/evaluation were placed on enrolments (pathway-level), but they're actually workshop-level events — moved to a new workshop_attendance table and patched Evidence.jsx and PathwaysAdmin.jsx to match
- Built Insight: three-tier drill-down heat map (Institution colleges -> College departments -> Department individuals), gap-severity color scale, small-group suppression (n<2) on aggregate views, three metrics cards (one per core-loop module)
- Added org hierarchy schema (colleges, departments, users.college_id/department_id) and a minimal OrgHierarchyAdmin panel to populate it — Insight has nothing to group by without this
- Simplified from the original spec: all three heat map scopes use domain-level columns, not item-level at the department scope as originally specified — item-level would need a second column set; flagged as a known simplification, not silently dropped
- Role gating not yet implemented at the data layer — Insight is currently reachable only via the admin view; tightening to real Provost/Dean/Chair-scoped access is follow-up work
- Built Connect: Expert-tier directory computed live from Assess's own competence ratings (avg competence >= 4.0 across a faculty member's rated items, no separately maintained list), mentoring request/accept/decline flow, sent/received request views
- This completes the full module set from the blueprint: Assess, Develop, Evidence, Insight, Connect all built (Configuration/Integration/Communication remain thin — org hierarchy and Jotform integration exist, but no dedicated settings UI beyond what's there)
- Restyled Auth and Onboarding, moved both out of modules/legacy/ into shared/components/ (they're app-shell level, not business modules). Discovered Auth.jsx and Onboarding.jsx referenced CSS variables (--navy, --muted, --teal, --white, --bg, --radius, --red, --shadow) that no longer exist since index.css was replaced with the token system — both were likely rendering unstyled. Fixed.
- Discovered Onboarding.jsx and Settings.jsx insert/reference columns that 00_complete_schema.sql never included (institutions.short_name/country/city/type/website/accreditation_bodies/policy, users.department/college/years_experience, domains.descriptor, pathways.certificate_title) — the reconstructed schema only covered what the already-ported modules needed. Extended additively rather than stripping functionality out of two legacy pages.
- Fixed a broken import in App.jsx (still pointed at modules/legacy/Auth and modules/legacy/Onboarding after those moved) and replaced its hardcoded loading-screen hex colors with tokens
- Checked all remaining legacy files (AdminDashboard, FacultyDashboard, Portfolio, InviteFaculty, Settings, CommCentre) for the same issue — they don't have it. They use hardcoded hex directly rather than CSS vars, so they render fine but ignore the token system entirely (no brand customization, no dark mode). Settings.jsx (1000+ lines) is the next worthwhile restyle candidate, not an urgent fix.
- Set up GitHub Pages deployment (chosen over Vercel): added .github/workflows/deploy.yml and a base path in vite.config.js. Discovered the old repo's Pages deploy was likely broken — no base path, no CNAME, no homepage field, so assets would 404 outside a domain root. Fixed in the new config. Repository secrets (VITE_SUPABASE_URL/ANON_KEY) and enabling Pages in GitHub settings are manual one-time steps, not yet done.
