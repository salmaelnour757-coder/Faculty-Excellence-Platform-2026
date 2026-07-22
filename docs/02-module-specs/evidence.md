# Module spec: Evidence

**Purpose:** Automatically generates a certificate of attendance when Develop's two conditions are both true — attendance confirmed and workshop evaluation submitted — then compiles a faculty member's accumulated certificates into one coherent, exportable record.

**Inputs:** Attendance + evaluation-confirmed flags (from Develop), workshop/pathway metadata (for certificate content).

**Outputs:** A certificate record per completed, evaluated workshop; a compiled export (format TBD — see open question below) covering all of a faculty member's certificates.

**Does not do:** Score against promotion criteria, flag readiness, or touch the promotion committee process in any way. Evidence's job stops at producing the organized record — what a faculty member or their chair does with it afterward (submit it for promotion, cite it in a review, anything else) is university governance, not FEP's concern.

**Open question:** Does the certificate need formal elements (institution letterhead/logo, CPD hours, signature block) for external use, or is it purely an internal FEP record with an export view? Decides whether this module needs a PDF-generation step or just a database record + export.

**DB tables touched:** New `certificates` table (faculty_id, workshop_id, issued_at, attendance_confirmed, evaluation_confirmed); reads Develop's enrolment/completion table.

**Status:** Not yet built in this form — the existing repo's Portfolio page (faculty-owned, manual) is being repurposed into this auto-generated, certificate-based version. Spec-first before writing components.
