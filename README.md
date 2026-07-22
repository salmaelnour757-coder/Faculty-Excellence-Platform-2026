# Faculty Excellence Platform (FEP)

A configurable, institution-agnostic faculty development platform. Identifies faculty competency gaps, matches them to development pathways, and automatically compiles the resulting evidence of development — without duplicating what an institution's existing HRIS, LMS, or calendar system already does.

## Start here

1. **Read `docs/00-platform-design-spec.md` first.** It's the single source of truth for what this platform is and isn't.
2. **Read `docs/03-design-system.md`** before touching any UI — the visual language (colors, cards, motion) is fixed and described there.
3. **Each module has a one-page spec in `docs/02-module-specs/`** — read the spec for whatever module you're touching before writing code in its matching `src/modules/<name>/` folder.

## The rule that keeps this project sane

**Spec before code.** If you're about to build something in `src/modules/<name>/` and there's no matching file in `docs/02-module-specs/<name>.md` describing purpose, inputs, outputs, and which DB tables it touches — write that first, even if it's three sentences. This isn't bureaucracy: it's what makes the codebase legible to the next person who opens it, and it's what gives this project a dated authorship trail for IP purposes.

## Structure

```
docs/               — specs, schema, design system, changelog (read before src/)
src/modules/         — the core loop (assess, develop, evidence) + connect, insight
src/infrastructure/  — configuration, integration, communication — plumbing, not pages
src/shared/          — components, theme tokens, lib (Supabase client, auth)
src/config/          — institution.example.json — the "no institution hardcoded" pattern
```

## What FEP explicitly does not do

- Does not host course content — links to the LMS by course ID
- Does not manage personnel records — syncs faculty roster from the HRIS
- Does not run its own calendar — `.ics` export only
- Does not build its own workshop evaluation form — reads submission status from the Quality Department's existing Jotform
- Does not judge promotion readiness or touch the promotion committee process — Evidence organizes the record, nothing more

If you find yourself building any of the above inside FEP, stop — it means either the scope has drifted or there's a real integration gap worth flagging, not silently working around.

## Workflow

No CLI, no local dev server debugging against Vercel logs. Download the repo as a zip from GitHub, edit locally, replace/add files, and push through GitHub Desktop.

## Contributors

- Dr. Salma Elnour Rahma Mohamed — Licensor, original author
- Dr. Sara Ali
- Mr. Khabab Abdelmonem

See `LICENSE` (Business Source License 1.1) for usage terms.
