# xoExam UI/UX

UI/UX prototype and engineering handoff for the **xoExam™** clinical examination system — Xenon Ophthalmics Inc.'s tablet-based ophthalmic exam platform, part of the XO™ Vision Care System.

Designed by [Method Marketing Agency](https://methoddigitalmarketing.com).

---

## Start here (in order)

1. **`xoExam UI-UX Engineering Handoff Specification v0.2.5.docx`** — master handoff document, current version. Read this first. Covers the engineering quick start, ExamShell component contract, integration touchpoints, the open decisions flagged as the engineering kickoff agenda, regulatory acknowledgment, React-Native portability notes, and the full asset inventory.

2. **`CLAUDE.md`** — project memory and source of truth. Design system, color tokens, typography scale, component interface contract, version log (v0.1.0 → v0.2.5), and the architectural rules that govern the prototype.

3. **`briefs/`** — per-test clinical specifications, one per clinical-fidelity test: Visual Acuity, Color Vision, Visual Fields, Wavefront Aberrometry, Extraocular Motility, **Pupillometry (new in v0.2.5)**. The clinician-facing companions live at the project root — **`xoExam Clinical Evaluation Brief.md`** (panel-evaluation guide) and **`xoExam Clinical Standards Reference.md`** (per-test standards summary).

4. **`index.html`** — the live prototype. Open directly in a browser (Chrome/Edge recommended). No build step required.

> **Older versioned docs are retained for reference.** Files like `…Specification v0.1.8.docx` and `…Development Brief 05-18-2026 v0.1.8.docx` remain in the repo so the evolution of the spec is traceable. Always read the highest-numbered version first.

---

## What's here

| Path | Contents |
|---|---|
| `index.html` | Main entry point — single-file React + Babel CDN prototype |
| `components/` | All React component files (`.jsx`), loaded by the prototype |
| `assets/` | Logos, marketing imagery, test-specific icons |
| `briefs/` | Per-test clinical specifications (six tests at clinical fidelity) |
| `_dist_v0.2.5/` | Current deployment package (zipped for hosting) |
| `_dist_v0.2.3/` · earlier | Previous deployment packages (retained for reference) |
| `xoExam UI-UX Engineering Handoff Specification v0.2.5.docx` | Master handoff spec (current) |
| `xoExam Development Brief 05-22-2026 v0.2.5.docx` | Release-specific brief (current) |
| `xoExam Development Brief.docx` | Cumulative client-facing progress brief |
| `xoExam Clinical Standards Reference.md` / `.docx` | Per-test standards summary (clinician-facing) |
| `xoExam Clinical Evaluation Brief.md` / `.docx` | Panel evaluation guide (clinician-facing) |
| `index.html` · `deploy.html` · `manifest.json` · `netlify.toml` | Deployment scaffolding |

---

## Current status (v0.2.5 — beta scope CLOSED)

- **Architecture:** Single-file React 18.3.1 + Babel Standalone (CDN), no build toolchain. Designed for port to **React Native + Kotlin** for the production Android tablet.
- **Tests at clinical fidelity (6 of 19):** Visual Acuity, Color Vision (Ishihara + D-15 Farnsworth), Visual Fields, Wavefront Aberrometry, Extraocular Motility, **Pupillometry (new in v0.2.5)**.
- **Beta scope:** **CLOSED.** The six originally-scoped tests are all at clinical fidelity. The remaining 13 tests are visual-fidelity placeholders awaiting their own clinical rebuilds in post-beta releases.
- **New in v0.2.5:** Pupillometry rebuilt from a 237-line static-only sketch into a ~1100-line clinical-fidelity component. Three sub-tests in a state machine inside the testing phase — static pupil size (three light conditions per eye with Winn 1994 age-banded reference ranges), dynamic pupillary light reflex (live PLR curve + six summary metrics + NPi composite per NeurOptics NPi-200 reference), swinging flashlight (alternating stimulus animation + per-eye RAPD grading). Anisocoria interpretation upgraded to the light-vs-dark differential rule. Four-pattern clinical flag system in the report — sympathetic Horner's, parasympathetic CN III, optic-nerve RAPD, neurological NPi. Patient Classification banner, Clinical Interpretation card, Doctor sign-off all per the established clinical-fidelity convention. Light-theme chrome replaces the legacy dark-themed action chrome (iris viewer itself stays dark — clinically appropriate for the headset interior).
- **Live deployment:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

## For engineering (MPR)

The handoff specification is the working document. Its "Open decisions — engineering kickoff agenda" section lists the items we need to resolve together — hardware-to-UI event contract, per-test data persistence schema, authentication model, export mechanism, the role/permissions model that gates Doctor sign-off, and others. Pupillometry adds seven new open questions to this list — dynamic data shape from firmware, NPi computation location, swinging-flashlight automation, clicker non-use, pharmacologic workflow scope, ambient lux measurement, dark adaptation timer.

This prototype is **the design and interaction reference**, not the production codebase. The `.jsx` files are written for portability — inline styles, hooks-only, no exotic dependencies — so the port to React Native is mechanical: swap primitives (`<div>` → `<View>`, `<button>` → `<Pressable>`, etc.), translate inline styles to `StyleSheet`, swap `localStorage` for `AsyncStorage`. See the v0.2.5 handoff spec for the full RN portability table.
