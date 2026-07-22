# Module spec: Develop

**Purpose:** Turns Assess's gaps into an Individual Development Plan (IDP) — ranked pathway recommendations matched to the faculty member's career track — and manages enrolment through to completion. Also captures the two data points Evidence's certificate trigger depends on: attendance confirmation and evaluation-submission status.

**Inputs:** TNI scores (from Assess), career track (from Configuration), pathway/workshop definitions (admin-authored, linked to LMS course IDs), Jotform evaluation submission status (via Integration).

**Outputs:** Enrolment records with status (pending/active/complete), attendance flag, evaluation-confirmed flag. The combination of the last two is what Evidence watches for.

**Does not do:** Host course content (a workshop record points to the LMS's course by ID — Develop never stores lecture materials or session content). Does not build its own evaluation form — reads submission status from the Quality Department's existing Jotform via Integration.

**DB tables touched:** `pathways`, `workshops`, enrolment/completion table, reads `assessments` and `career_tracks`; writes attendance + evaluation-confirmed flags that Evidence reads.

**Status:** Pathways largely built in the existing repo (workshops table, enrolment, .ics export). Port and add: re-point workshop records to LMS course IDs, add the Jotform evaluation-status check.
