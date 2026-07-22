# Module spec: Assess

**Purpose:** Captures each faculty member's self-rated competency scores against the institution's Training Needs Inventory (TNI) — the domains and items defined in Configuration. This is the entry point of the core loop; every downstream module (Develop, Evidence, Insight) reads from what's recorded here.

**Inputs:** Institution-defined competency domains/items (from Configuration), faculty identity and org placement (college/department, from Configuration's hierarchy).

**Outputs:** Per-faculty, per-item scores, timestamped by assessment cycle. Feeds Develop's gap calculation and Insight's heat map severity coloring directly — no transformation step between Assess's output and either consumer.

**Does not do:** Content delivery, quizzes, or anything resembling course assessment — this is a self-rating instrument, not a test.

**DB tables touched:** `domains`, `items`, `assessments`/TNI scores table, reads `institutions`/`users` for org placement.

**Status:** Working in the existing repo (data-saving bug already fixed) — port as the reference implementation for how a module should be structured in the new layout.
