# xoExam™ — Development Brief
## v0.2.5 · May 22, 2026 · Pupillometry · Beta scope CLOSED

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## Executive summary

v0.2.5 brings **Pupillometry** to clinical fidelity. This is the sixth and final test in the originally-defined beta scope — **the beta scope is now closed**. Six of the device's nineteen planned exams are at clinical fidelity in the prototype: Visual Acuity, Color Vision, Visual Fields, Wavefront Aberrometry, Extraocular Motility, and Pupillometry.

The rebuild replaced a 237-line static-only sketch with a ~1100-line clinical-fidelity component conforming to the Component Interface Contract — wrapped in ExamShell, three-phase flow, OD-first bilateral sequence, Patient Classification banner, four-pattern clinical flag system, Doctor sign-off. Net-new clinical content over the legacy implementation: dynamic pupillary light reflex (PLR) sub-test, NPi (Neurological Pupil index) composite per NeurOptics NPi-200 reference, swinging-flashlight RAPD assessment with six-grade clinical scale, age-banded reference range lookup driven by patient age input, and the light-vs-dark anisocoria differential rule.

The full handoff documentation set has been reissued at v0.2.5: Engineering Handoff Specification, Clinical Standards Reference, Clinical Evaluation Brief. Seven new open clinical questions have been added to the engineering kickoff agenda — see §H of the Pupillometry clinical spec.

---

## What changed

### `PupillometryTest.jsx` — rebuilt onto ExamShell with clinical fidelity

Architecture-level changes:

- **ExamShell wrapper.** Three-phase flow (`ready` = eye-mode + sub-test config + patient age input · `testing` = sub-step state machine · `report`). Internal cancel modal removed — ExamShell owns canonical Cancel UX (back arrow hidden during testing, labeled red "Cancel test" button takes over with confirm modal).
- **Sub-test state machine inside testing.** Three sub-steps (`static → dynamic → swinging`). Static and dynamic each iterate the OD-first bilateral eye sequence with a full-screen `PUP_TransitionPrompt` between eyes (patient-repositioning copy + eye-sequence breadcrumb). Swinging runs as a single screen with alternating-stimulus animation and per-eye RAPD graders.
- **OD-first bilateral sequence** with `PUP_InlineEyePicker` / `PUP_EyeBreadcrumb` / `PUP_TransitionPrompt` — pattern adapted from WFA v0.1.9, VF v0.1.8, EOM v0.2.1.
- **All top-level identifiers prefixed `PUP_`** per the cross-file naming-collision rule.
- **Light-theme chrome** matching the other clinical-fidelity tests; the iris viewer itself stays dark (clinically appropriate for the dim headset interior).

### Clinical-accuracy additions (5 major)

1. **Age-banded reference range.** Patient age input on the setup screen drives a Winn et al. 1994 lookup table — six age bands (20s through 70+) × three light conditions (scotopic / mesopic / photopic), mean ± 1 SD. Captured values flag (`↯` icon, red text) when outside the age-band range, both in the testing sub-bar tiles and in the report's Static measurements table. Full Winn table surfaces in the report's Age-banded reference values card with the patient's band highlighted.

2. **Anisocoria interpretation upgraded.** Legacy code used `>1mm = significant` at a single light condition — missed the most important clinical signal (whether the anisocoria changes with light). v0.2.5 adds:
   - Anisocoria computed at each of the three light conditions (color-coded per severity band)
   - Dedicated light-vs-dark differential row in the Static measurements table — |aniso(dark) − aniso(light)|, flagged red at ≥ 0.3 mm with "≥ 0.3 mm = pathological pattern" annotation
   - `PUP_getAnisocoriaSeverity` + `PUP_getClinicalFlag` use the differential to distinguish sympathetic (Horner's, worse-in-dark) from parasympathetic (CN III, Adie's, pharmacologic, worse-in-light) patterns

3. **Dynamic pupillary light reflex sub-test added.** Net-new clinical content. `PUP_LightReflexChart` renders an SVG line graph of pupil size vs. time over a 3-second window with stimulus marker, baseline reference line, peak-constriction annotation. Six summary metric tiles (baseline / min / constriction % / latency / constriction velocity / T75 redilation). Production firmware will emit the real time-series; the prototype computes a piecewise-modelled curve from `PUP_simulateDynamics`.

4. **NPi (Neurological Pupil index) composite.** Net-new clinical metric. `PUP_computeNPi` produces a 0–5 score from the dynamic measurement; `PUP_npiSeverity` thresholds per NeurOptics NPi-200 reference (≥ 3.0 normal / 2.5–3.0 borderline / < 2.5 abnormal). Surfaced per eye in the dynamic sub-test as a prominent severity-tinted tile and again in the report's Dynamic measurements card.

5. **Swinging flashlight (RAPD) sub-test added.** Net-new clinical content. `PUP_SwingingScreen` runs an alternating-stimulus animation across two iris viewers (3-second dwell, configurable via Start/Pause stimulus button). Each eye gets its own six-option grade selector — None / Trace / 1+ / 2+ / 3+ / 4+ — with descriptive copy at the bottom and per-eye severity bands.

### Report-level additions

- **Patient Classification banner** with worst-finding-drives-bottom-line severity (normal / mild / significant) + per-finding summary pills (anisocoria · NPi per eye · RAPD).
- **Four-pattern clinical flag system** in the report — each pattern emits its own labeled red-surface flag with specific differential and referral copy:
  - Sympathetic Horner's pattern (anisocoria greater in dark)
  - Parasympathetic CN III / Adie's pattern (anisocoria greater in light)
  - Optic nerve RAPD pattern (RAPD ≥ 1+ on either eye)
  - Neurological NPi pattern (NPi < 2.5 on either eye)
- **Clinical Interpretation card** with severity tint + finding-by-finding bullet list (each age-banded deviation, each pathological anisocoria pattern, each NPi finding, each RAPD finding enumerated).
- **Age-banded reference values card** with the full Winn table and the patient's age band highlighted — so the printed report stands alone.

### Visual sweep

- Legacy `linear-gradient(135deg,accent,#155bcc)` Begin Test button replaced with solid accent (matches the no-gradient convention established in v0.1.8+).
- Vivid purple / blue / amber light-level pills replaced with brand-palette segmented control. Severity coding doesn't apply to light conditions (scotopic isn't "purple severity"), so the old palette was clinically misleading.
- Emoji-style `⚠ Significant` / `✓ Normal` indicators replaced with SVG icons throughout.
- "Save Results" / "Print Report" action buttons replaced with the canonical "Export report" / "Compare" / "Certify & close" trio.
- **Doctor sign-off** label above Certify & close, matching the v0.1.9 pattern established for clinical-fidelity tests.
- Sentence-case sweep across all buttons and labels.

---

## Beta scope status

**The originally-defined beta scope is now CLOSED.** All six tests have been brought to clinical fidelity:

| # | Test | Clinical-fidelity version |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |

The remaining 13 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds in post-beta releases. The clinical evaluation panel's input on which of the 13 to prioritise next is welcomed.

---

## New open clinical questions (from Pupillometry §H)

These are added to the engineering kickoff agenda:

1. **Dynamic data shape from firmware.** Time-series at ~30 Hz, or only summary metrics?
2. **NPi computation location.** Firmware-side (NeurOptics-style) or UI/cloud-side from the time-series?
3. **Swinging flashlight automation.** Headset-driven alternation, or technician-driven?
4. **Pupil response clicker.** Pupillometry is passive — confirm clicker is not used.
5. **Pharmacologic pupillometry workflow.** Cocaine / apraclonidine / pilocarpine protocols — Xenon's roadmap?
6. **Ambient light measurement.** Real headset-interior lux readback, or assume calibrated dark?
7. **Adaptation time enforcement.** Firmware-enforced ≥ 5 min dark adaptation, or UI countdown timer needed?

---

## Document set issued at v0.2.5

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.5.docx` | New — supersedes v0.2.1 |
| `xoExam Development Brief 05-22-2026 v0.2.5.docx` | New release-specific brief |
| `xoExam Development Brief.docx` (cumulative) | Updated with v0.2.5 entry |
| `xoExam Clinical Standards Reference.md` / `.docx` | Updated to v0.2.5 — added Pupillometry §6, updated scope-of-fidelity table |
| `xoExam Clinical Evaluation Brief.md` / `.docx` | Updated — added Pupillometry §6, removed from "not yet at clinical fidelity" list |
| `briefs/Pupillometry_Clinical_Spec_v2.md` | Authoritative clinical spec (already in repo since pre-rebuild scoping) |
| `CLAUDE.md` | v0.2.5 entry appended to version log; test stream status table updated; beta scope marked CLOSED |
| `README.md` | Status bumped to v0.2.5 |

---

## Deployment

- **Code:** `components/PupillometryTest.jsx` (replaced)
- **Title bumped:** `index.html` → v0.2.5
- **Deploy harness:** `deploy.html` → v0.2.5
- **Distribution package:** `_dist_v0.2.5/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.2.5 · May 22, 2026*
