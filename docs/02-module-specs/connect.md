# Module spec: Connect

**Purpose:** A directory of Expert-tier faculty that others can browse and contact for mentoring. Merges what were previously two separately-conceived features (Mentoring, Experts Capital) into one module with one data source.

**Inputs:** Faculty tier, sourced live from Assess's own scoring calculation — never a separately maintained "expert list" that can drift out of sync with actual competency data.

**Outputs:** Browsable directory filtered by domain/expertise; mentoring request/connection records.

**Does not do:** Replace a formal mentoring program's administration (contracts, hours logging for credit, etc., if the institution has one) — Connect is a discovery and initial-contact layer, not a full mentoring management system.

**DB tables touched:** Reads `assessments`/tier calculation; new mentoring-request table.

**Status:** Not yet built. Spec-first; lowest priority in the core-loop-adjacent set since Assess/Develop/Evidence establish the data it depends on.
