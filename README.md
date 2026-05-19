# xoExam UI/UX

UI/UX prototype and engineering handoff for the **xoExam™** clinical examination system — Xenon Ophthalmics Inc.'s tablet-based ophthalmic exam platform, part of the XO™ Vision Care System.

Designed by [Method Marketing Agency](https://methoddigitalmarketing.com).

---

## Start here (in order)

1. **`xoExam UI-UX Engineering Handoff Specification v0.1.8.docx`** — master handoff document. Read this first. Covers the engineering quick start, ExamShell component contract, the 10 integration touchpoints, the 11 open decisions flagged as the engineering kickoff agenda, regulatory acknowledgment, and the full asset inventory.

2. **`CLAUDE.md`** — project memory and source of truth. Design system, color tokens, typography scale, component interface contract, version log (v0.1.0 → v0.1.8), and the architectural rules that govern the prototype.

3. **`briefs/`** — per-test clinical specifications. Currently contains `VisualField_Clinical_Spec_v2.md` — the template format for clinical-fidelity test docs. More will be added as remaining tests reach clinical fidelity.

4. **`xoExam Prototype.html`** — the live prototype. Open directly in a browser (Chrome/Edge recommended). No build step required.

---

## What's here

| Path | Contents |
|---|---|
| `xoExam Prototype.html` | Main entry point — single-file React + Babel CDN prototype |
| `components/` | All React component files (`.jsx`), loaded by the prototype |
| `assets/` | Logos, marketing imagery, test-specific icons |
| `briefs/` | Per-test clinical specifications |
| `_dist_v0.1.8/` | Current deployment package (zipped for hosting) |
| `xoExam Development Brief 05-18-2026 v0.1.8.docx` | Release-specific brief |
| `xoExam Development Brief.docx` | Cumulative client-facing progress brief |
| `index.html` · `deploy.html` · `manifest.json` · `netlify.toml` | Deployment scaffolding |

---

## Current status (v0.1.8)

- **Architecture:** Single-file React 18.3.1 + Babel Standalone (CDN), no build toolchain. Designed for port to React Native + Kotlin for the production Android tablet.
- **Tests at clinical fidelity (3 of 19):** Visual Acuity, Color Vision, Visual Fields
- **Beta scope:** 6 tests. Next 3 to reach clinical fidelity: Wavefront Aberrometry, Ocular Motility, Pupillometry.
- **Live deployment:** [xoexam-uiux-main.netlify.app](https://xoexam-uiux-main.netlify.app)

---

## For engineering (MPR)

The handoff specification is the working document. Section 10 ("Open decisions — engineering kickoff agenda") lists the 11 items we need to resolve together — hardware-to-UI event contract, per-test data persistence schema, authentication model, export mechanism, and others.

This prototype is **the design and interaction reference**, not the production codebase. The `.jsx` files are written for portability — inline styles, hooks-only, no exotic dependencies — so the port to React Native is mechanical: swap primitives (`<div>` → `<View>`, `<button>` → `<Pressable>`, etc.), translate inline styles to `StyleSheet`, swap `localStorage` for `AsyncStorage`.
