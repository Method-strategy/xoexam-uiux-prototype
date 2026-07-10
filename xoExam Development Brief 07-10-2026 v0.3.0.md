# xoExam™ — Development Brief
## v0.3.0 · July 10, 2026 · Test catalog visibility, ordering + filtering pass

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## What changed in v0.3.0

Three connected Tests-page corrections at CD direction. **No test was added, no clinical logic was touched.** The count of tests at clinical fidelity is unchanged — **7 of 19**.

1. **Tests grid reordered.** The Tests selection grid now leads with a fixed clinical priority sequence: **Wavefront Refraction → Visual Acuity → Wavefront Aberrometry → Color Vision → Visual Field → Extraocular Motility → Pupillometry.** All remaining tests follow in their prior order.
2. **Legacy standalone "Refraction" hidden.** The plain Refraction test is hidden from the Tests grid and the patient Start-New-Test launcher. The combined **Wavefront Refraction** supersedes it for the refraction workflow. Component and routing are retained in code and fully restorable.
3. **Tests-page filtering hidden.** The category filter pills, the per-card uppercase category subheads, and the search box are hidden behind a `SHOW_FILTERS = false` flag on `TestSelection.jsx` — the short catalog doesn't need filtering or search. Restorable by flipping the flag.

---

## Executive summary

v0.3.0 is a focused catalog pass on the Tests surface. It puts the clinical team's priority tests at the front of the selection grid in a deliberate sequence, and retires the legacy standalone **Refraction** placeholder from view now that the combined **Wavefront Refraction** (objective wavefront autorefraction + subjective liquid-lens phoropter) is the intended refraction workflow.

Nothing clinical changed. No exam component, algorithm, scale, report, or doctor-led affordance was modified. The hidden Refraction test is commented out — not deleted — so it can be restored by uncommenting a single catalog line if the clinical team wants it back. The program remains **pre-beta, active development** pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel.

---

## Detail

### 1. Tests grid reordered
- `components/TestSelection.jsx`: the `EXAM_TYPES` array now opens with the seven priority tests in the exact sequence above; every other test follows in its previous relative order.
- Only array order changed. Each test keeps its `category`, so the category-filter chips (Refraction, Visual Field, Binocular, Sensory, Neuro, Ocular Surface, AI) continue to group and filter exactly as before.

### 2. Legacy standalone Refraction hidden
- `components/TestSelection.jsx`: the `refraction` catalog entry is commented out (tagged `HIDDEN (Jul 2026, CD request)`).
- `components/PatientsPage.jsx`: the `refraction` entry is removed from `PATIENT_EXAM_TYPES` (the patient profile's Start-New-Test launcher), same tag.
- The test component and its `case 'refraction'` route in `index.html` are untouched — the test still runs if invoked directly and is restorable by uncommenting the catalog lines.

### 3. Wavefront Aberrometry retained
- Wavefront Aberrometry remains available in all three catalogs — the Tests grid, the patient launcher, and the Manual Control quick-launcher.

---

## Files touched

| File | Change |
|---|---|
| `components/TestSelection.jsx` | **Edited** — `EXAM_TYPES` reordered to the seven-test priority sequence; `refraction` entry commented out (hidden); category filter pills, per-card category subheads, and search box hidden behind `SHOW_FILTERS`. |
| `components/PatientsPage.jsx` | **Edited** — `refraction` removed from `PATIENT_EXAM_TYPES` (patient launcher). |
| `index.html` | **Edited** — title bumped to v0.3.0. No routing change. |
| `deploy.html` | **Edited** — version strings bumped to v0.3.0. |
| `CLAUDE.md` · `README.md` | **Updated** — v0.3.0 version-log entry, unified-version note, status. |

---

## Version numbering note

The prior cadence was patch-only (v0.2.5 → v0.2.9). v0.3.0 is a deliberate **minor** bump rather than v0.2.10: the change is user-facing catalog behavior, and "v0.3.0" reads unambiguously next to the existing "v0.2.1" (a "v0.2.10" tag is easy to misread). The product version stays single and unified across every doc and surface.

---

## Tests at clinical fidelity (7 of 19)

> The entire UI/UX ships as one unified build — **v0.3.0**. The column shows *when each test last reached clinical fidelity*, not a per-test version number. None changed in v0.3.0.

| # | Test | Reached clinical fidelity in |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 (Tumbling E/C optotypes added v0.2.6) |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |
| 7 | Wavefront Refraction | v0.2.6 (six enhancements merged v0.2.7) |

The remaining 12 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds. The clinical evaluation panel's input on which to prioritize next is welcomed.

---

## Open items for engineering / next review

Unchanged from v0.2.9 — v0.3.0 opened no new engineering questions:

1. **Certify & close → Rx-release system event.** MPR to wire this as the trigger that releases the verified Wavefront Refraction Rx to the xoFit job object. Couples to the role/permissions model.
2. **VA pass/fail threshold** for the subjective endpoint (currently "more than half correct") — Gary to validate against a published standard before lock.
3. **Patient-facing headset/clicker view** for objective self-administered mode — out of scope for this build.

---

## Document set issued at v0.3.0

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.3.0.docx` / `.md` | Reissued at v0.3.0 — §0 catalog change log added |
| `xoExam Development Brief 07-10-2026 v0.3.0.docx` / `.md` | This release-specific brief |
| `xoExam Development Brief.docx` (cumulative) | v0.3.0 entry appended |
| `xoExam Clinical Standards Reference v0.3.0.docx` / `.md` | Reissued at v0.3.0 — catalog-only release, no clinical change |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.3.0 — catalog-only release, no clinical change |
| `CLAUDE.md` | v0.3.0 entry appended; unified-version note updated |
| `README.md` | Status bumped to v0.3.0 |
| `_dist_v0.3.0/` | Deployment package (current) |

---

## Deployment

- **Code:** `components/TestSelection.jsx`, `components/PatientsPage.jsx` (edited)
- **Title bumped:** `index.html` → v0.3.0
- **Deploy harness:** `deploy.html` → v0.3.0
- **Distribution package:** `_dist_v0.3.0/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.3.0 · July 10, 2026*
