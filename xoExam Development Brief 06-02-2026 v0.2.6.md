# xoExam™ — Development Brief
## v0.2.6 · June 2, 2026 · Wavefront Refraction

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## Executive summary

v0.2.6 adds **Wavefront Refraction** — the combined digital replacement for the traditional two-instrument refraction workflow (autorefractor + phoropter). It brings the count of tests at clinical fidelity to **7 of 19**: Visual Acuity, Color Vision, Visual Fields, Wavefront Aberrometry, Extraocular Motility, Pupillometry, and now Wavefront Refraction.

This is the most clinically consequential test in the suite. Its output — the **verified prescription (Rx)** — is the gate that releases the job object to the downstream xoFit fitting/finishing workflow. It was prioritized ahead of other v0.2.5-review feedback at CD direction.

Wavefront Refraction is added as a **new, parallel test** built from a copy of Wavefront Aberrometry, the Refraction test's live eye-scan, and the Visual Acuity chart. It **supersedes but does not replace** Wavefront Aberrometry — both remain in the catalog per CD direction. The handoff doc set has been reissued at v0.2.6 with a precise per-file changelog.

This program is in active, versioned development. Each release brings one or more tests to clinical fidelity and ships an accurate changelog of exactly what was touched.

---

## What changed

### `components/WavefrontRefractionTest.jsx` — new two-stage refraction test (1381 lines, `WFR_`-prefixed)

A new test (`id: wavefront-refraction`, Refraction category) mapped onto ExamShell's three-phase contract as a four-phase clinical flow `entry → objective → subjective → report`.

**Entry.** Two-card selector — Full refraction (objective → subjective, recommended) or Subjective only (skip objective, enter manual starting values). Cards drive navigation; no separate Begin button.

**Objective stage (Stage 1 — replaces the autorefractor).** Monocular wavefront capture, **OD then OS**, using the Refraction test's **live eye-scan look** rather than the aberrometry circular-progress animation — a clinically appropriate dark viewer (the headset interior is dim), iris radial gradient, breathing pupil, accent sweep line, rotating dashed centering ring, and a red alignment dot that turns the backdrop **green once locked**. Sub-stages `init → calibrating → capturing`. Readiness collapsibles: Patient alignment, Pupil detection, Patient focus. Each eye documents a **scan count (1–3)** — the wavefront retries on movement/blink and averages; the count tells the clinician how reliable the measurement is.

**Subjective stage (Stage 2 — replaces the phoropter).** Liquid-lens digital phoropter refinement, step sequence per eye `setup → sphere (MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add`. Runs OD fully, then OS. Optotype selector (Letters / Tumbling E / Tumbling C) shared with the standalone Visual Acuity test. Additive VA notation (e.g. `20/25 +4`) surfaced in the right panel.

*`mpmva2` (a second MPMVA) auto-triggers only if cyl changed ≥ 0.50 D or axis changed ≥ 10° from objective.

### Clinical non-negotiables baked in

1. **Axis before power (JCC).** Enforced by step order — the UI cannot reach power refinement before axis is confirmed.
2. **Fogging control.** After objective capture, a fog prompt offers +0.75 D with a clinical explanation (relaxes accommodation, prevents over-minusing). Skippable. Starting MPMVA sphere = objective sphere + fog.
3. **Sphere compensation note** during cylinder power: "For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion."
4. **Rx format discipline.** SPH/CYL signed + 2 dp; AXIS integer + °; ADD signed with D or "—". No exceptions.
5. **Monocular objective.** No OU averaging. OD → OS via breadcrumb + transition modal.
6. **Certify & close is the Rx-certification system event.** The Rx is not released downstream until certified — flagged to engineering as a system event, not a UI-only action. Report sub-label: "Doctor sign-off · releases Rx to job object."
7. **Scan-count documentation** per eye, surfaced in the report.
8. **No clinical claims.** Deliberate divergence from the other clinical-fidelity tests — NO Patient Classification banner, NO interpretive language. A refraction is a measurement-and-verification workflow, not a screening, so interpretive language is stripped at clinical direction.

### Report

- Navy "Wavefront Refraction Report" title (formal, title case).
- Patient Information including refraction mode, fog applied, JCC power used.
- **Final Prescription** — most prominent (2px accent border): large signed Rx per eye + ADD + BCVA.
- **Two-box** lower row: Objective Results (navy measurement table, scans taken) and Subjective Correction (delta from objective → final).
- **Wavefront analysis** (objective only): vertical view rail (pupil image / centroid / full wavefront / high-low orders), **3 mm / 5 mm ring overlay toggle**, "+" zoom-scope opening a pannable enlarged map, color-scale legend.
- **Clinical Summary** — data only.
- Actions: Export report · Compare · **Certify & close** (with Doctor sign-off label).

### `components/VisualAcuityTest.jsx` — geometric optotypes added

Tumbling E (Snellen E — 3 bars + spine on a 5×5 grid) and Tumbling C (Landolt ring with a 1-unit gap) drawn as proper geometric SVG optotypes via `VA_Optotype` — one consistent symbol per chart, shrinking down the lines, varying orientation, rather than rotated font glyphs. Tumbling C added as a 4th chart type. The same optotype shape is shared with Wavefront Refraction's subjective stage. This serves patient accessibility (children, non-literate, non-Latin-script readers report orientation rather than naming a glyph).

### Retained, not replaced

`components/WavefrontAberrometryTest.jsx` is **unchanged** and stays in the catalog. Wavefront Refraction supersedes it as the working refraction tool but does not remove it — per CD direction both tests remain available.

---

## Tests at clinical fidelity (7 of 19)

> The entire UI/UX ships as one unified build — **v0.2.6**. The column below shows *when each test last reached clinical fidelity*, not a per-test version number. A test listed at an earlier release is correct and unchanged since then, not running older software.

| # | Test | Reached clinical fidelity in |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 (Tumbling E/C optotypes added v0.2.6) |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |
| 7 | **Wavefront Refraction** | **v0.2.6** |

The remaining 12 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds. The clinical evaluation panel's input on which to prioritize next is welcomed.

---

## Open items for engineering / next review

1. **Certify & close → Rx-release system event.** MPR to wire this as the trigger that releases the verified Rx to the xoFit job object. Couples to the role/permissions model (only an authorized doctor may certify).
2. **VA pass/fail threshold** for the subjective stage (`WFR_lineIsPassed`, currently "more than half correct") — Gary to validate against a published standard before lock.
3. **Patient-facing headset/clicker view** for objective self-administered mode — out of scope for this build; separate scope to define with MPR.
4. **Liquid-lens / eye-tracking capability** confirmation for objective readiness panel values and green-lock timing.

---

## Document set issued at v0.2.6

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.6.docx` | New — supersedes v0.2.5 |
| `xoExam Development Brief 06-02-2026 v0.2.6.docx` | New release-specific brief |
| `xoExam Development Brief.docx` (cumulative) | Updated with v0.2.6 entry |
| `briefs/WavefrontRefraction_Clinical_Spec_v1.md` | Authoritative clinical spec for Wavefront Refraction |
| `xoExam Clinical Standards Reference v0.2.6.docx` / `.md` | Reissued at v0.2.6 — Wavefront Refraction added |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.6 — Wavefront Refraction added |
| `CLAUDE.md` | v0.2.6 entry appended; component index + test-stream table updated; naming conventions codified (rules 13–14) |
| `README.md` | Status bumped to v0.2.6 |

---

## Deployment

- **Code:** `components/WavefrontRefractionTest.jsx` (added); `components/VisualAcuityTest.jsx` (edited)
- **Title bumped:** `index.html` → v0.2.6
- **Deploy harness:** `deploy.html` → v0.2.6
- **Distribution package:** `_dist_v0.2.6/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.2.6 · June 2, 2026*
