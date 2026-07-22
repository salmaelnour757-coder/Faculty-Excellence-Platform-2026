# Faculty Excellence Platform (FEP)

A configurable, institution-agnostic faculty development platform. Identifies faculty competency gaps, matches them to development pathways, and automatically compiles the resulting evidence of development — without duplicating what an institution's existing HRIS, LMS, or calendar system already does.

## Start here

1. **Read `docs/00-platform-design-spec.md` first** — what this platform is and isn't.
2. **Read `docs/03-design-system.md`** before touching any UI — colors, cards, motion are fixed and described there.
3. **Each module has a spec in `docs/02-module-specs/`** — read it before writing code in the matching `src/modules/<name>/` folder.

## Current state of this repo (as of this port)

| Folder | Status |
|---|---|
| `src/modules/assess/` | Ported and restyled onto the token system. Business logic unchanged from the old repo. |
| `src/modules/develop/` | Ported and consolidated — merges what used to be two separate, overlapping components (IDP + FacultyPathways) into one. Restyled. **Missing:** attendance + Jotform evaluation-status check (tracked in the module spec). |
| `src/modules/evidence/` | Built — certificate auto-issuance (attendance + Jotform evaluation check), compiled record, print/export. |
| `src/modules/develop/PathwaysAdmin.jsx` | Ported from PathwaysManagement.jsx (never wired into the old Shell) + new: jotform_form_id field, attendance-marking panel. |
| `src/modules/connect/` | Built — Expert-tier directory (avg competence >= 4.0, computed live from Assess), mentoring request/accept/decline. |
| `src/modules/insight/` | Built — three-tier drill-down heat map + metrics cards. Department scope uses domain-level columns, not item-level as the original spec called for (a scoped-down simplification). Role gating not yet enforced — reachable only via admin view for now. |
| `src/infrastructure/configuration/OrgHierarchyAdmin.jsx` | Built — minimal college/department CRUD + faculty assignment. Insight depends on this being filled in. |
| Database schema (SQL) | **Not in this repo, by design** — SQL migration files are delivered separately in chat, run directly in the Supabase SQL editor. Keeps schema/data operations out of git entirely. Two migrations so far: the complete base schema, then the org hierarchy (colleges/departments) — see chat history for the actual SQL. |
| `supabase/functions/check-evaluation/` | Deploy this edge function and set `JOTFORM_API_KEY` as a Supabase secret (not a `VITE_` var) before Evidence's evaluation check will work. |
| `src/shared/components/Auth.jsx`, `Onboarding.jsx` | Restyled onto the token system, moved out of legacy/ (app-shell level, not business modules). Also fixed: both referenced CSS variables that no longer exist post-token-system, so they were rendering unstyled before this. |
| `src/modules/legacy/` | AdminDashboard, FacultyDashboard, Portfolio, InviteFaculty, Settings, CommCentre — still carried over **mechanically** (import paths fixed only). These use hardcoded hex colors directly rather than broken CSS vars, so they render fine, but completely ignore the token system — no brand-color customization, no dark mode. Settings.jsx (1000+ lines) is the biggest of these and the next worthwhile restyle candidate. |
| `src/infrastructure/` | Empty — Configuration, Integration, Communication not yet built as their own layer. |
| `src/shared/theme/`, `src/shared/components/` | The actual token system and Card/Button/Pill primitives — everything ported so far uses these. |

## The rule that keeps this project sane

**Spec before code.** If you're building in `src/modules/<name>/` and there's no matching file in `docs/02-module-specs/<name>.md`, write that first — even three sentences. This is what keeps the codebase legible and gives the project a dated authorship trail for IP purposes.

## What FEP explicitly does not do

- Does not host course content — links to the LMS by course ID
- Does not manage personnel records — syncs faculty roster from the HRIS
- Does not run its own calendar — `.ics` export only
- Does not build its own workshop evaluation form — reads submission status from the Quality Department's existing Jotform
- Does not judge promotion readiness or touch the promotion committee process

## Before you run this

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a `.env.local` file (already gitignored). The old repo had these hardcoded as fallback defaults directly in source — removed in this port. The client now throws clearly if they're missing instead of falling back silently.
- `npm install` — dependencies unchanged from the old repo's `package.json`.

## Deployment (GitHub Pages)

Not yet set up on GitHub itself — the workflow file is here (`.github/workflows/deploy.yml`), but two things need doing once in the repo's GitHub settings before it works:

1. **Add two repository secrets** — Settings → Secrets and variables → Actions → New repository secret:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (Same values as your local `.env.local`. These are GitHub's own secret store — separate from `.env.local`, and never appear in any file in this repo.)
2. **Enable Pages** — Settings → Pages → Source: "Deploy from a branch" → branch `gh-pages` (this branch gets created automatically the first time the workflow runs, so do step 1, push once, wait for the Action to finish, *then* come back and set this).

The workflow triggers on every push to `main`. If your default branch is actually called something else, change `branches: [main]` in the workflow file to match.

**One thing fixed vs. the old repo's setup:** `vite.config.js` now sets `base: '/Faculty-Excellence-Platform-2026/'`. The old repo's Pages deploy had no base path, no custom domain, and no `homepage` field — without one of those, GitHub Pages serves from a subdirectory and every asset 404s. If this repo ever gets renamed, that `base` value needs to match exactly.

## Workflow

No CLI-based deploy debugging. Download the repo as a zip from GitHub, edit locally, replace/add files, push through GitHub Desktop.

## Contributors

- Dr. Salma Elnour Rahma Mohamed — Licensor, original author
- Dr. Sara Ali
- Mr. Khabab Abdelmonem

See `LICENSE` (Business Source License 1.1 — bracketed terms still need filling in, see the note at the bottom of that file).
