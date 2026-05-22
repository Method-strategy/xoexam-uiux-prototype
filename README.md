# xoExam UI/UX

UI/UX prototype and engineering handoff for the **xoExam™** clinical examination system — Xenon Ophthalmics Inc.'s tablet-based ophthalmic exam platform, part of the XO™ Vision Care System.

Designed by [Method Marketing Agency](https://methoddigitalmarketing.com).

---

## Start here (in order)

1. **`xoExam UI-UX Engineering Handoff Specification v0.2.1.docx`** — master handoff document, current version. Read this first. Covers the engineering quick start, ExamShell component contract, integration touchpoints, the open decisions flagged as the engineering kickoff agenda, regulatory acknowledgment, React-Native portability notes, and the full asset inventory.

2. **`CLAUDE.md`** — project memory and source of truth. Design system, color tokens, typography scale, component interface contract, version log (v0.1.0 → v0.2.1), and the architectural rules that govern the prototype.

3. **`briefs/`** — per-test clinical specifications. Currently contains `VisualField_Clinical_Spec_v2.md`, `WavefrontAberrometry_Clinical_Spec_v2.md`, and `ExtraocularMotility_Clinical_Spec_v2.md`. New entries are added as remaining tests reach clinical fidelity.

4. **`index.html`** — the live prototype. Open directly in a browser (Chrome/Edge recommended). No build step required.

> **Older versioned docs are retained for reference.** Files like `…Specification v0.1.8.docx` and `…Development Brief 05-18-2026 v0.1.8.docx` remain in the repo so the evolution of the spec is traceable. Always read the highest-numbered version first.

---

## What's here

| Path | Contents |
|---|---|
| `index.html` | Main entry point — single-file React + Babel CDN prototype |
| `components/` | All React component files (`.jsx`), loaded by the prototype |
| `assets/` | Logos, marketing imagery, test-specific icons |
| `briefs/` | Per-test clinical specifications |
| `_dist_v0.1.9/` | Current deployment package (zipped for hosting) |
| `_dist_v0.1.8/` | Previous deployment package (retained for reference) |
| `xoExam Development Brief 05-21-2026 v0.1.9.docx` | Release-specific brief (current) |
| `xoExam Development Brief 05-18-2026 v0.1.8.docx` | Previous release-specific brief |
| `xoExam Development Brief.docx` | Cumulative client-facing progress brief |
| `index.html` · `deploy.html` · `manifest.json` · `netlify.toml` | Deployment scaffolding |

---

## Current status (v0.2.1)

- **Architecture:** Single-file React 18.3.1 + Babel Standalone (CDN), no build toolchain. Designed for port to **React Native + Kotlin** for the production Android tablet.
- **Tests at clinical fidelity (5 of 19):** Visual Acuity, Color Vision, Visual Fields, Wavefront Aberrometry, **Extraocular Motility** (new in v0.2.1).
- **Beta scope:** 6 tests. Remaining: Pupillometry (v0.2.2) — closes beta scope.
- **New in v0.2.1:** Extraocular Motility rebuilt at clinical fidelity — international 0 to ±4 grading scale replacing the legacy 1–5, 9 cardinal positions including primary gaze, primary + secondary muscle/CN mapping (CN IV detection at down-and-in gaze preserved), H-pattern motility diagram, sub-test state machine for versions / pursuit / saccades / ductions.
- **Live deployment:** [xoexam-uiux-main.netlify.app](https://xoexam-uiux-main.netlify.app)

---

## For engineering (MPR)

The handoff specification is the working document. Its "Open decisions — engineering kickoff agenda" section lists the items we need to resolve together — hardware-to-UI event contract, per-test data persistence schema, authentication model, export mechanism, the role/permissions model that gates Doctor sign-off, and others.

This prototype is **the design and interaction reference**, not the production codebase. The `.jsx` files are written for portability — inline styles, hooks-only, no exotic dependencies — so the port to React Native is mechanical: swap primitives (`<div>` → `<View>`, `<button>` → `<Pressable>`, etc.), translate inline styles to `StyleSheet`, swap `localStorage` for `AsyncStorage`. See the v0.1.9 handoff spec for the full RN portability table.
