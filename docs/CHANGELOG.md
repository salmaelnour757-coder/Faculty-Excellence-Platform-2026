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
