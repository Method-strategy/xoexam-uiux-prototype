# xoExam UI/UX

UI/UX prototype and engineering handoff for the **xoExam™** clinical examination system — Xenon Ophthalmics Inc.'s tablet-based ophthalmic exam platform, part of the XO™ Vision Care System.

Designed by [Method Marketing Agency](https://methoddigitalmarketing.com).

---

## Start here (in order)

1. **`xoExam UI-UX Engineering Handoff Specification v0.3.0.docx`** — master handoff document, current version. Read this first. Covers the engineering quick start, ExamShell component contract, integration touchpoints, the open decisions flagged as the engineering kickoff agenda, regulatory acknowledgment, React-Native portability notes, and the full asset inventory.

2. **`CLAUDE.md`** — project memory and source of truth. Design system, color tokens, typography scale, component interface contract, version log (v0.1.0 → v0.3.0), and the architectural rules that govern the prototype.

3. **`briefs/`** — per-test clinical specifications, one per clinical-fidelity test: Visual Acuity, Color Vision, Visual Fields, Wavefront Aberrometry, Extraocular Motility, Pupillometry, **Wavefront Refraction (v2 — six competitive-parity enhancements merged in v0.2.7)**. The clinician-facing companions live at the project root — **`xoExam Clinical Evaluation Brief.md`** (panel-evaluation guide) and **`xoExam Clinical Standards Reference.md`** (per-test standards summary).

4. **`index.html`** — the live prototype. Open directly in a browser (Chrome/Edge recommended). No build step required.

> **Older versioned docs are retained for reference.** Files like `…Specification v0.2.9.docx` and `…Development Brief 06-16-2026 v0.2.9.docx` remain in the repo so the evolution of the spec is traceable. Always read the highest-numbered version first.

---

## What's here

| Path | Contents |
|---|---|
| `index.html` | Main entry point — single-file React + Babel CDN prototype |
| `components/` | All React component files (`.jsx`), loaded by the prototype |
| `assets/` | Logos, marketing imagery, test-specific icons |
| `briefs/` | Per-test clinical specifications (seven tests at clinical fidelity) |
| `_dist_v0.3.0/` | Current deployment package (zipped for hosting) |
| `_dist_v0.2.9/` · earlier | Previous deployment packages (retained for reference) |
| `xoExam UI-UX Engineering Handoff Specification v0.3.0.docx` | Master handoff spec (current) |
| `xoExam Development Brief 07-10-2026 v0.3.0.docx` | Release-specific brief (current) |
| `xoExam Development Brief.docx` | Cumulative client-facing progress brief |
| `xoExam Clinical Standards Reference.md` / `.docx` | Per-test standards summary (clinician-facing) |
| `xoExam Clinical Evaluation Brief.md` / `.docx` | Panel evaluation guide (clinician-facing) |
| `index.html` · `deploy.html` · `manifest.json` · `netlify.toml` | Deployment scaffolding |

---

## Current status (v0.3.0)

- **Architecture:** Single-file React 18.3.1 + Babel Standalone (CDN), no build toolchain. Designed for port to **React Native + Kotlin** for the production Android tablet.
- **Tests at clinical fidelity (7 of 19):** Visual Acuity, Color Vision (Ishihara + D-15 Farnsworth), Visual Fields, Wavefront Aberrometry, Extraocular Motility, Pupillometry, **Wavefront Refraction**.
- **Program status:** Active, versioned, pre-beta development pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. Each release brings one or more tests to clinical fidelity and reissues the handoff doc set with an accurate per-version changelog. The remaining 12 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds; the clinical evaluation panel's input on prioritization is welcomed.
- **New in v0.3.0 (test catalog visibility + ordering pass — no test or clinical changes):** The Tests selection grid now leads with a fixed clinical priority sequence — **Wavefront Refraction → Visual Acuity → Wavefront Aberrometry → Color Vision → Visual Field → Extraocular Motility → Pupillometry** — with all remaining tests following in their prior order (category-filter chips still group by category). The legacy standalone **Refraction** placeholder is hidden from the Tests grid and the patient Start-New-Test launcher now that the combined **Wavefront Refraction** is the intended refraction workflow; its component and routing are retained in code and restorable. Count at clinical fidelity unchanged (7 of 19). *(Prior release v0.2.9: shell navigation + list/grid view pass.)*
- **Live deployment:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

## For engineering (MPR)

The handoff specification is the working document. Its "Open decisions — engineering kickoff agenda" section lists the items we need to resolve together — hardware-to-UI event contract, per-test data persistence schema, authentication model, export mechanism, the role/permissions model that gates Doctor sign-off, and others. Wavefront Refraction adds the most consequential one yet: **Certify & close must be wired as the Rx-release system event** that hands the verified prescription to the downstream xoFit job object.

This prototype is **the design and interaction reference**, not the production codebase. The `.jsx` files are written for portability — inline styles, hooks-only, no exotic dependencies — so the port to React Native is mechanical: swap primitives (`<div>` → `<View>`, `<button>` → `<Pressable>`, etc.), translate inline styles to `StyleSheet`, swap `localStorage` for `AsyncStorage`. See the v0.3.0 handoff spec for the full RN portability table.
