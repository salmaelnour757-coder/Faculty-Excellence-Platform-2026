# Module spec: Insight

**Purpose:** Institutional visualization scoped strictly to what the core loop generates. Provides a three-tier heat map (Institution → College → Department, one component reused at each scope) and four metrics cards, one per core-loop module — never generic institutional BI.

**Inputs:** TNI scores + org hierarchy (Assess, Configuration) for the heat map; enrolment/completion (Develop) and certificate compilation rate (Evidence) for the metrics cards.

**Outputs:** Role-gated views — Provost/admin sees Institution scope, Dean sees their College, department head sees their Department (named individuals only at this scope, small-department cells suppressed). Faculty members see their own Evidence progress only, no heat map.

**Does not do:** Anything not traceable to Assess, Develop, or Evidence. If a proposed metric doesn't map to one of those three, it belongs in the institution's real BI tool, not here.

**DB tables touched:** Read-only across `assessments`, org hierarchy tables, enrolment/completion, `certificates`. Insight writes nothing.

**Status:** Placeholder in the existing repo. Spec-first — heat map design (three nested scopes, gap-severity color, privacy boundary) already worked out; needs the org hierarchy tables (colleges, departments) built in Configuration before this can be implemented.
