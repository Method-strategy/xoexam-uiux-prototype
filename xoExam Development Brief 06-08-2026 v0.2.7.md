# xoExam™ — Development Brief
## v0.2.7 · June 8, 2026 · Wavefront Refraction — six competitive-parity enhancements merged

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## Executive summary

v0.2.7 folds the **six competitive-parity enhancements** for **Wavefront Refraction** directly into the single production component and **eliminates the parallel `v2` draft file**. No new test is added; the count at clinical fidelity stays **7 of 19**. The work deepens the most clinically consequential test in the suite — the one whose verified prescription (Rx) gates the downstream xoFit fitting/finishing workflow.

The enhancements had been built in a parallel draft (`WavefrontRefractionTest v2.jsx`) for an MPR walkthrough ahead of hardware confirmations. At CD direction they were merged into the one production file — **one file, one source of truth** — because a divergent second copy is a versioning hazard. The shell already loaded `WavefrontRefractionTest.jsx`, so the enhanced flow is now live in the full app with no routing change.

This program remains **pre-beta, active development** pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. v0.2.7 is the integration version, not a finished milestone.

---

## What changed

### The six enhancements (all doctor-led-safe — measurements/simulations, never verdicts)

Benchmarked against the **Marco OPD-Scan III** aberrometer and the **Reichert Phoroptor VRx** digital refractor.

1. **PSF + simulated-VA before/after** — point-spread-function render and simulated acuity from the Zernike set, comparing habitual Rx to the new Rx (Simulation tab). Before/after is tied to the old-vs-new Rx comparison.
2. **Binocular balance step** — runs after both eyes via fogging / alternate occlusion (no prism hardware required); subjective `subjStep:'binocular'`.
3. **Multi-source Rx comparison** — objective / subjective / habitual / unaided with spherical-equivalent deltas (Rx-comparison tab). Habitual entered manually now; auto-pull from history later.
4. **Photopic vs. mesopic (day & night)** — 4 mm column (hardware-confirmed) plus a provisional 6 mm column with a night-shift Diff row (Day-&-night tab).
5. **Smart-Cylinder auto-bracketing** — the JCC step size auto-sizes to the cylinder magnitude and narrows one rung after each reversal; toggle.
6. **Refraction-based progression tracker** — spherical-equivalent trend over visits + D/year vs. age-banded reference (Progression tab); the at-risk determination is left to the clinician.

**Report restructured into tabs:** Summary · Rx comparison · Day & night · Vision simulation · Wavefront (objective only) · Progression.

**Doctor-led preserved.** No Patient Classification banner, no interpretive verdicts — reference data and simulations only. A refraction stays a measurement-and-verification workflow.

### Reversibility — Reehana-gated values isolated in named constants

Built to the confirmed **4 mm** analysis baseline throughout. Every value pending Reehana's hardware answers (Q3/Q7/Q8) is a named constant at the top of `WavefrontRefractionTest.jsx`, so an unconfirmed item flips with a one-line edit — no teardown, no rebuild, no separate file:

| Constant | Value | Status |
|---|---|---|
| `WFR_ANALYSIS_DIA` | 4.0 mm | Confirmed (Steve, Jun 2026) |
| `WFR_SIXMM_PROVISIONAL` | true | Provisional — shows 6 mm columns + amber "Provisional" tag; flip false to hide |
| `WFR_ZERNIKE_MAX_ORDER` / `WFR_ZERNIKE_MODES` | 10 / 66 | Stated (lenslet-limited) |
| `WFR_VERTEX_MM` | 25–30 mm | Not final (Reehana) |
| `WFR_SPHERE_RANGE` / `WFR_CYL_RANGE` | placeholders | Q8 returned blank — pending |

### Files touched

| File | Change |
|---|---|
| `components/WavefrontRefractionTest.jsx` | **Replaced** — six-enhancement build folded into the single production file (~2280 lines, all `WFR_`-prefixed); component name kept as `WavefrontRefractionTest`. |
| `components/WavefrontRefractionTest v2.jsx` | **Deleted** — the parallel draft fork (versioning hazard removed). |
| `Wavefront Refraction v2 Demo.html` · `wfr-v2-demo/` | **Deleted** — the fork's demo + standalone build. |
| `index.html` | **Edited** — title bumped to v0.2.7. No routing change. |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | **Added** — supersedes v1; documents the six enhancements + doctor-led posture. |
| `deploy.html` · `deploy-new-site.html` | **Edited** — version strings bumped to v0.2.7. |
| `CLAUDE.md` · `README.md` | **Updated** — v0.2.7 version-log entry, WFR section rewritten (merge), component index, status, dist note. |

---

## Tests at clinical fidelity (7 of 19)

> The entire UI/UX ships as one unified build — **v0.2.7**. The column shows *when each test last reached clinical fidelity*, not a per-test version number.

| # | Test | Reached clinical fidelity in |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 (Tumbling E/C optotypes added v0.2.6) |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |
| 7 | **Wavefront Refraction** | v0.2.6 (six enhancements merged v0.2.7) |

The remaining 12 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds. The clinical evaluation panel's input on which to prioritize next is welcomed.

---

## Open items for engineering / next review

1. **Reehana hardware confirms (Q3/Q7/Q8)** — 6 mm pupil capability, vertex distance range, and sphere/cylinder ranges. Until confirmed, those surfaces stay provisional (flip the named constants when answers land).
2. **Certify & close → Rx-release system event.** MPR to wire this as the trigger that releases the verified Rx to the xoFit job object. Couples to the role/permissions model.
3. **VA pass/fail threshold** for the subjective endpoint (currently "more than half correct") — Gary to validate against a published standard before lock.
4. **Patient-facing headset/clicker view** for objective self-administered mode — out of scope for this build.

---

## Document set issued at v0.2.7

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.7.docx` | New — supersedes v0.2.6 |
| `xoExam Development Brief 06-08-2026 v0.2.7.docx` | This release-specific brief |
| `xoExam Development Brief.docx` (cumulative) | Updated with v0.2.7 entry |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | Supersedes v1 — six-enhancement pass |
| `xoExam Clinical Standards Reference v0.2.7.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction §7 updated |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction panel prompts updated |
| `CLAUDE.md` | v0.2.7 entry appended; WFR section rewritten (merge); component index + test-stream table updated |
| `README.md` | Status bumped to v0.2.7 |

---

## Deployment

- **Code:** `components/WavefrontRefractionTest.jsx` (replaced — six enhancements merged); `v2` fork + harness deleted
- **Title bumped:** `index.html` → v0.2.7
- **Deploy harness:** `deploy.html` · `deploy-new-site.html` → v0.2.7
- **Distribution package:** `_dist_v0.2.7/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.2.7 · June 8, 2026*
