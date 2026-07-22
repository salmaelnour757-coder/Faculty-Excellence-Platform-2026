# IP Registration Briefing Report
`docs/04-ip-registration-briefing.md`
Prepared: 22 July 2026 — for handoff to a future drafting session (Claude or otherwise) writing the formal IP registration / Ministry of Economy filing document.

---

## 1. Purpose of this document

This is a **briefing report, not the filing itself**. It consolidates everything that is already documented and verifiable in this repository — platform design, architecture, design system, and a real, git-verifiable development timeline — so that whoever drafts the actual registration document has full context in one place, without having to re-derive it from the codebase.

It deliberately does **not** attempt to write the authorship/originality narrative in Salma's voice. `docs/00-platform-design-spec.md` §1–2 are explicitly marked in that document as sections Salma needs to finalize herself ("intentionally left for Salma to finalize in her own words — naming contributions explicitly protects both her authorship claim and correctly credits collaborators, rather than leaving the split implicit"). This briefing surfaces the facts; it does not pre-write that narrative.

---

## 2. Platform identity

- **Name:** Faculty Excellence Platform (FEP) — a configurable, institution-agnostic faculty development platform.
- **Licensor:** Dr. Salma Elnour Rahma Mohamed (sole original author of the platform's architecture and scope design).
- **Contributors named in the spec:** Dr. Sara Ali, Mr. Khabab Abdelmonem (co-creators; contribution scope marked in the spec as still to be detailed by Salma).
- **License:** Business Source License 1.1, Salma as Licensor.
- **Repository:** `salmaelnour757-coder/Faculty-Excellence-Platform-2026` (GitHub, public).
- **Live deployment:** `https://salmaelnour757-coder.github.io/Faculty-Excellence-Platform-2026/` (GitHub Pages, deployed via GitHub Actions).
- **Backing infrastructure:** Supabase (Postgres + Auth + Edge Functions), project ref `xmufohombjmiikwlevko`.

---

## 3. Originality statement (as already articulated in the design spec)

Per `docs/00-platform-design-spec.md` §2, the platform's originality rests on three specific, connected design decisions:

1. **A closed assess-develop-evidence loop.** A faculty member's self-rated competency gaps (Assess) directly generate a personalized development pathway of recommended workshops (Develop), and completing that pathway automatically produces a certificate of attendance (Evidence) — with no manual re-entry of data at any step. Each module's output is the next module's input.

2. **An automated, rule-based certificate issuance mechanism.** A certificate is issued only when two independently-sourced conditions are both met: attendance confirmation and a submitted workshop evaluation, checked against the institution's existing Jotform evaluation system via the Integration layer. This automates an established Quality Department practice — the platform's contribution is the automation and the linkage to assessment/development data, not the underlying evaluation rule itself.

3. **An explicit, narrow scope boundary.** FEP deliberately does not replicate functions belonging to other institutional systems: no course content hosting (links to the LMS by course ID), no personnel records (syncs the faculty roster from the HRIS rather than duplicating it), no internal calendar (exports `.ics`), and — most deliberately — no promotion-readiness judgment or promotion-committee involvement. This boundary is itself claimed as a designed feature, not an omission.

Two further original contributions are named in the spec:

4. **The organizational visualization mechanism** — Insight's three-tier, privacy-scoped, gap-severity heat map (§4 of the design spec; detailed in §5 below).
5. **The named, described visual design system** — the "FEP Card Layer System" (§6 of the design spec; detailed in §6 below), offered as evidence of a described design system rather than an unnamed set of CSS classes.

---

## 4. Module architecture

**Core loop (sequential, each module's output feeds the next):**

| Module | Purpose | Status |
|---|---|---|
| **Assess** | Faculty complete a Training Needs Inventory (TNI): self-rating against institution-defined competency domains/items. | Built — reference implementation for the module structure. |
| **Develop** | Assess's gaps auto-generate an Individual Development Plan (IDP): ranked pathway recommendations by career track. Tracks enrolment, attendance, and evaluation-submission status. | Built. |
| **Evidence** | Auto-generates a certificate when a workshop's attendance and evaluation conditions are both met; compiles a faculty member's certificates into one exportable record. | Built. |

**Supporting modules:**

| Module | Purpose | Status |
|---|---|---|
| **Connect** | Directory of Expert-tier faculty (tier computed live from Assess's own scoring, ≥4.0 average competence), with mentoring request/accept/decline flow. | Built. |
| **Insight** | Institutional visualization scoped strictly to core-loop data: three-tier heat map (Institution → College → Department) plus four metrics cards, one per core-loop module. | Built — see §5 for the known simplification. |

**Infrastructure substrate (not faculty-facing pages):**

- **Configuration** — institution setup, competency domains/items, career tracks, and the `Institution → College → Department → Faculty` hierarchy every other module inherits. Org hierarchy tables and a minimal admin panel exist; role-based access gating at the data layer is still follow-up work (Insight is currently reachable only via the admin view).
- **Integration** — HRIS-synced faculty roster (not yet built beyond the schema), LMS-linked course IDs, Jotform-checked evaluation status (`supabase/functions/check-evaluation` edge function — Jotform API key stays server-side, never in the client bundle), `.ics` export, SSO-ready auth.
- **Communication Centre** — shared notification service (`CommCentre.jsx`, wired into admin nav 22 July 2026), backed by a 13-template library (`shared/emailTemplates.js`) covering onboarding, assessment, workshops, certificates, pathways, alerts, and mentoring — each institution can browse, customize, and save its own wording per template from Settings.

---

## 5. The Insight heat map (claimed original visualization mechanism)

Per design spec §4: a single hierarchy-aware component, rendered at three nested scopes:

| Scope | Rows | Columns | Audience |
|---|---|---|---|
| Institution | Colleges | Competency domains | Provost, institution admin |
| College | Departments | Competency domains | Dean |
| Department | Individual faculty | Competency items | Department head only |

Cell color encodes **gap severity** (distance below target) on the same scale at every scope, derived from the institution's own `--brand-accent` token at severity-mapped opacity — not a separate chart palette. Privacy is enforced by scope: Institution/College views show aggregates only; named individuals appear only within a Department's own head/chair view, with small-department cells (n<2) suppressed to prevent identification by inference.

**Known, documented simplification:** all three scopes currently use domain-level columns, not item-level columns at the Department scope as originally specified in the design intent — item-level would require a second column set. This was a deliberate build-order simplification, not a silent scope cut, and is recorded as such in `docs/CHANGELOG.md`.

---

## 6. Design system (claimed original contribution — the "FEP Card Layer System")

Full specification: `docs/03-design-system.md`. Summary:

**Token layers:**
- *Customizable* (institution-set, stored on `institutions.branding`): `--brand-primary`, `--brand-secondary`, `--brand-accent`. Shipped defaults: navy `#1B2A4A` / gold `#B08D3E` / teal `#2E6E6E`.
- *Derived* (computed via `color-mix()`, never separately configured): card header gloss gradient, accent text/pill/progress-bar fills, all Insight heat-map cell colors.
- *Surface* (light/dark, switched via `data-theme` attribute): dark mode is a separately designed palette (lifted navy-black tones), not a mechanical inversion of light mode.

**The gloss rule** — the system's most distinctive, explicitly named constraint: gradient fill appears in **exactly two places, system-wide** — the Card header background and the Primary button fill. Nowhere else gets a gradient. This restraint is asserted in the design doc itself as "part of the named system," not an incidental style choice.

**Motion system:** one easing curve (`cubic-bezier(.4, 0, .2, 1)`), three duration tiers (150ms micro-interactions, 250ms card/panel transitions, 400ms page/theme transitions), no bounce or overshoot curves anywhere.

**Components** (one implementation each, shared across every module — no module re-implements its own card or button): `Card`, `CardHeader`, `CardBody`, `SectionStrip`, `QuoteBox`, `Pill`, `Button`, `GlassPanel`.

**Verifiable implementation state as of this report:** every faculty-facing screen in the platform — Assess, Develop, Evidence, Insight, Connect, Settings, Communication Centre, Auth, Onboarding, Shell, the admin dashboard, the faculty dashboard, the portfolio view, and the invite-faculty flow — is built against this shared token/component set. Institution brand colors are propagated live into the `--brand-*` custom properties at runtime (`shared/theme/useBrandColors.js`) whenever an institution logs in, so the same component code renders differently per institution without any per-institution code branching. A working light/dark toggle (`shared/theme/useTheme.js`) persists the user's choice and falls back to OS preference on first visit.

---

## 7. Database schema

Full detail intended to live in `docs/01-database-schema.md`, which is currently a **stub** — it lists known tables (`institutions`, `domains`, `items`, `pathways`, `workshops`, `users`, `assessments`, `career_tracks`) and new additions made during this rebuild (`colleges`, `departments`, `certificates`, `workshop_attendance`, Jotform mapping columns) but has not yet been filled in with the full column-by-column detail exported from the live Supabase project. **This should be completed before filing**, per that document's own closing note, since the design spec's §5 explicitly defers to it.

Per repo policy, no SQL migrations are committed to this repository — schema changes are delivered as standalone `.sql` files run manually against the Supabase project, kept entirely out of git history.

---

## 8. Verifiable development timeline

The dates below are pulled directly from `git log` on this repository (`main` branch) — a genuine, machine-verifiable timestamp trail rather than a reconstructed narrative, which is exactly what design spec §7 calls for.

**Note on dates:** every commit below falls on a single calendar day, 22 July 2026. This reflects the actual git history of this repository as of this report; it is not a claim about when the underlying design thinking or prior-repository work occurred (the design spec itself references an "old repo" and "old app" predating this rebuild — that history is not captured in this repository's own commit log and would need to be sourced separately if it's relevant to the filing).

| Date/time | Milestone |
|---|---|
| 2026-07-22 13:33 | Initial commit — repo skeleton generated |
| 2026-07-22 15:07–18:29 | Core module build-out: shared theme tokens, Card/Button/Pill components, Assess, Develop, Evidence, Insight, Connect, PathwaysAdmin, org hierarchy admin |
| 2026-07-22 20:09 | GitHub Pages deploy pipeline fixed and confirmed live end-to-end |
| 2026-07-22 20:17–20:23 | `Settings.jsx` (9 admin sections) restyled onto the token system, section by section |
| 2026-07-22 20:36 | Fixed a crash-on-login bug (missing `branding` prop caused an uncaught error on every admin session) |
| 2026-07-22 20:46–20:56 | Built the 13-template notification/reminder library (`shared/emailTemplates.js`), added a browse/edit UI in Settings, wired the Communication Centre to it and into admin navigation |
| 2026-07-22 21:07 | Added a real, working light/dark theme toggle |
| 2026-07-22 21:12 | Fixed institution branding never being applied to the live theme tokens (`useBrandColors.js`) — the root cause of every institution seeing the same default colors regardless of what they'd customized |
| 2026-07-22 21:12–21:16 | Remaining legacy screens (AdminDashboard, FacultyDashboard, Portfolio, InviteFaculty) restyled onto the token system |
| 2026-07-22 21:28 | Fixed two functional bugs found during live login testing: a misplaced global "Invite faculty" button, and dashboard action buttons that didn't navigate anywhere (including a stale screen-id reference left over from an earlier module rename) |

**Total commits on `main` as of this report:** 29.
**Total application code (excluding docs/config):** ~5,100 lines across 14 module files, ~1,400 lines across 10 shared/theme files.

This commit-by-commit trail — timestamped, attributable to the repository's git history, and cross-checked against a live, publicly reachable deployment at each stage — is the "genuine, verifiable authorship evidence" the design spec's §7 asks for, as distinct from a narrative reconstructed after the fact.

---

## 9. What still needs Salma's direct input before this can become a filing

These are gaps this briefing deliberately does not fill, because doing so would mean guessing at facts only Salma can supply:

1. **Design spec §1–2** — authorship voice, and the precise contribution scope of Dr. Sara Ali and Mr. Khabab Abdelmonem (currently marked `[contribution scope to be confirmed/detailed by Salma]` in the spec itself).
2. **Design spec §7 milestones predating this repository** — "Original conception of seven-layer faculty development platform architecture" and "Initial Supabase schema and working Configuration/Assessment/Development modules built" are both marked `[Date]` placeholders in the spec, referring to work in an "old repo" not captured in this repository's git history.
3. **`docs/01-database-schema.md`** — needs to be filled in from the live Supabase schema (Table Editor export or `supabase db dump`) before it can support the filing's §5 schema summary.
4. **Filing jurisdiction specifics** — the spec references a "Ministry of Economy submission"; format, required supporting evidence, and any jurisdiction-specific claims process aren't captured anywhere in this repository and would need to come from Salma or legal counsel.
