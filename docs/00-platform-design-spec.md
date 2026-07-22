# Faculty Excellence Platform — Platform Design Specification
`docs/00-platform-design-spec.md`
Version 1.0 — Draft for review
Prepared: 22 July 2026

---

## 1. Title, authorship, and date

**Faculty Excellence Platform (FEP)** — a configurable, institution-agnostic faculty development platform.

**Original author / Licensor:** Dr. Salma Elnour Rahma Mohamed. Sole original author of the platform's architecture, scope design, and this specification.

**Contributors:**
- Dr. Sara Ali — co-creator; [contribution scope to be confirmed/detailed by Salma]
- Mr. Khabab Abdelmonem — co-creator; [contribution scope to be confirmed/detailed by Salma]

*(This section is intentionally left for Salma to finalize in her own words — naming contributions explicitly protects both her authorship claim and correctly credits collaborators, rather than leaving the split implicit.)*

**Date of this specification:** 22 July 2026. Filed under Salma's personal account/email, independent of GMU institutional systems.

**License:** Business Source License 1.1, Salma as Licensor.

---

## 2. Purpose and originality statement

*(Draft — Salma to revise into her own words before filing.)*

FEP identifies faculty development needs and organizes the resulting evidence of development activity. It does this through a deliberately narrow, sequential mechanism — not a general-purpose LMS, HR system, or promotion tool.

The platform's originality rests on three specific, connected design decisions:

1. **A closed assess-develop-evidence loop.** A faculty member's self-rated competency gaps (Assess) directly generate a personalized development pathway of recommended workshops (Develop), and completing that pathway automatically produces a certificate of attendance (Evidence) — with no manual re-entry of data at any step. Each module's output is the next module's input.

2. **An automated, rule-based certificate issuance mechanism.** The certificate is issued only when two independently-sourced conditions are both met: attendance confirmation and a submitted workshop evaluation (checked against the institution's existing Jotform evaluation system via the Integration layer). This automates an established Quality Department practice rather than inventing new evaluation logic — the platform's contribution is the automation and the linkage to the assessment/development data, not the underlying rule.

3. **An explicit, narrow scope boundary.** FEP deliberately does not replicate functions that belong to other institutional systems: it does not host course content (links to the LMS by course ID), does not manage faculty personnel records (syncs faculty roster from the HRIS rather than duplicating it), does not run its own calendar (exports `.ics` rather than competing with one), and — most deliberately — does not judge promotion readiness or touch the promotion committee process. FEP organizes evidence; what an institution does with that evidence afterward is its own governance decision. This boundary is itself a designed feature, not an omission, and is what allows FEP to plug cleanly into any institution's existing systems rather than requiring institutions to replace them.

Additionally, the platform includes an original organizational visualization mechanism (§4) and a named, described visual design system (§6) — both original creative contributions distinct from the functional architecture.

---

## 3. Module architecture

FEP consists of a three-module core loop, two supporting modules, and an infrastructure substrate.

**Core loop (sequential):**

- **Assess** — Faculty complete a Training Needs Inventory (TNI), self-rating against institution-defined competency domains and items. Scores are stored per faculty member and drive every downstream module.

- **Develop** — Gaps identified in Assess automatically generate an Individual Development Plan (IDP): ranked pathway recommendations matched to the faculty member's career track. Each pathway is composed of workshops (linked to the institution's LMS by course ID). Develop tracks enrolment, attendance confirmation, and — via Integration — evaluation submission status.

- **Evidence** — When a workshop's attendance and evaluation conditions are both satisfied, a certificate of attendance is automatically generated. Evidence compiles a faculty member's accumulated certificates into one coherent, exportable record.

**Supporting modules:**

- **Connect** — A directory of Expert-tier faculty (tier derived from Assess's own scoring), enabling mentoring requests. Consolidates what would otherwise be two separately-maintained lists into one.

- **Insight** — Institutional visualization and reporting, scoped strictly to what the core loop generates. Provides a three-tier heat map (Institution → College → Department, described fully in §4) and four metrics cards, one per core-loop module.

**Infrastructure substrate (not faculty-facing pages):**

- **Configuration** — Institution setup: competency domains/items, career tracks, and the organizational hierarchy (Institution → College → Department → Faculty) that every other module inherits.
- **Integration** — The platform's explicit boundary with the rest of the university's systems: HRIS-synced faculty roster, LMS-linked course IDs, Jotform-checked evaluation status, `.ics` calendar export, and SSO-ready authentication.
- **Communication Centre** — A shared notification service triggered by the core loop and Connect; owned by none of them individually.

---

## 4. Organizational hierarchy and heat map design

Configuration establishes a real foreign-key hierarchy — `Institution → College → Department → Faculty` — rather than flat or free-text grouping. Every faculty record carries `college_id` and `department_id`, which every other module inherits automatically.

Insight's heat map is a single component rendered at three nested scopes from this hierarchy:

| Scope | Rows | Columns | Audience |
|---|---|---|---|
| Institution | Colleges | Competency domains | Provost, institution admin |
| College | Departments | Competency domains | Dean |
| Department | Individual faculty | Competency items | Department head only |

Cell color encodes **gap severity** (distance below target), not performance, and the same color scale is used at every scope. Privacy is enforced by scope: Institution and College views show aggregates only; named individuals are visible exclusively within a Department's own head/chair view, with small-department cells suppressed below a minimum count to prevent identification by inference.

This three-tier, privacy-scoped, gap-severity heat map — driven by a single hierarchy-aware component rather than three separately built visualizations — is an original design mechanism distinct from generic institutional BI/dashboard tools.

---

## 5. Database schema summary

*(Full detail lives in `docs/01-database-schema.md` — referenced here, not duplicated.)*

The schema (13+ tables, Row-Level Security policies throughout) implements the module architecture in §3: institution/college/department hierarchy tables, competency domain/item tables, TNI scores, pathways and workshops, enrolment/attendance records, generated certificates, and role-based access control aligned to the Insight privacy scoping in §4.

---

## 6. Design system description

*(Full detail lives in `docs/03-design-system.md` — referenced here, not duplicated.)*

FEP's visual and interaction language — named the **FEP Card Layer System** — separates a fixed structural/motion design (cards, section strips, elevation scale, a single gloss rule limited to two specific surfaces, one consistent motion curve) from institution-customizable brand color tokens. The structural system, not any specific color, is the original creative asset: any institution can set its own three brand colors without altering the platform's distinctive look and feel.

---

## 7. Development timeline

*(To be populated from `docs/CHANGELOG.md` and GitHub commit history as the rebuild proceeds — this section should be filled in with real dated entries shortly before filing, giving the Ministry of Economy submission genuine, verifiable authorship evidence rather than a reconstructed narrative.)*

Key milestones to date:
- [Date] — Original conception of seven-layer faculty development platform architecture
- [Date] — Initial Supabase schema and working Configuration/Assessment/Development modules built
- 22 July 2026 — Architecture reconceptualized into scoped core loop (Assess/Develop/Evidence) with explicit non-overlap boundary against HRIS/LMS/calendar/promotion-governance systems; organizational hierarchy and Insight heat map designed; certificate issuance mechanism (attendance + Jotform evaluation) specified; FEP Card Layer System design language formalized
- [Date] — Rebuild begins under new module structure
- [Date] — Filing submitted

---

*This is a working draft (v1.0). Sections 1 and 2 need Salma's own voice before filing; sections 3–6 are ready to reference as-is once the rebuild's docs/01 and docs/03 files exist alongside this one; section 7 needs real dates filled in as work proceeds.*
