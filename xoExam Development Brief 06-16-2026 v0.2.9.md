# xoExam™ — Development Brief
## v0.2.9 · June 16, 2026 · Shell navigation + list/grid view pass

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## What changed in v0.2.9

Three connected shell/navigation corrections at CD direction. **No test was added, no clinical logic was touched.** The count of tests at clinical fidelity is unchanged — **7 of 19**.

1. **Sidebar sub-menus removed.** Patients and Devices previously expanded into sub-menus in the side navigation. Both are removed — every sidebar item now navigates directly to its section. The destination pages already carry their own primary actions (**+ Add Patient**, **+ Add Device** in-page), so the sub-menu entries were redundant.
2. **List / Grid view toggle added to Patients, Devices, and Doctors.** A segmented `List · Grid` control switches each page between a table list view and a card grid.
3. **Toggle placement standardized.** The control sits in the top action row next to the **+ Add** button on all three pages, matching the layout the others were aligned to.

---

## Executive summary

v0.2.9 is a focused interaction-design pass on the administrative shell. It removes navigation redundancy (the Patients/Devices sub-menus) and gives the three highest-volume record pages — Patients, Devices, Doctors — a consistent way to switch between a dense **list** and a scannable **card grid**, so the clinic can choose the density that fits the task (triage a long roster in list; browse identities/status at a glance in grid).

This is shell work only. No exam component, clinical algorithm, report, or doctor-led affordance was modified. The program remains **pre-beta, active development** pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel.

---

## Detail

### 1. Sidebar sub-menus removed
- `components/DashboardShell.jsx`: `hasSubmenu` is now `false` for every navigation item. The Patients and Devices expand/collapse chevrons and their child items are gone.
- Clicking **Patients** opens the patient list directly; clicking **Devices** opens the device list directly.
- Rationale: the in-page **+ Add** affordances already cover the action the sub-menus duplicated, and a flat nav is faster to operate on a touch tablet.

### 2. List / Grid view toggle
A single, consistent segmented control (`List · Grid`, accent active state, pill group, ≥ 44 px touch targets) was added to three pages. Each page persists its own preference independently in `localStorage`, so a clinician's choice survives reloads:

| Page | Default | New view built | Persistence key |
|---|---|---|---|
| Patients | **List** (established table view) | Card grid — avatar, status + phase badges, diagnosis, last visit, physician | `xoexam_patients_view` |
| Devices | **Grid** (established status-card view) | Fleet table — status, current exam, battery, uptime, next calibration | `xoexam_devices_view` |
| Doctors | **Grid** (established identity-card view) | Table — avatar, specialty, department, experience, status, patient count, ⋮ menu | `xoexam_doctors_view` |

All card and row clicks open the same detail view / profile as before — the toggle changes presentation only, never behavior or data.

### 3. Placement standardized
The toggle is positioned in the top action row, immediately beside the **+ Add Patient / + Add Device / + Add Doctor** button on each page, so the control lives in the same place everywhere.

---

## Files touched

| File | Change |
|---|---|
| `components/DashboardShell.jsx` | **Edited** — `hasSubmenu` forced to `false`; Patients/Devices sub-menus removed. |
| `components/PatientsPage.jsx` | **Edited** — added `view` state (`xoexam_patients_view`, default List), List/Grid toggle next to + Add Patient, new card-grid render. |
| `components/DevicesPage.jsx` | **Edited** — added `view` state (`xoexam_devices_view`, default Grid), List/Grid toggle next to the action buttons, new fleet-table list render. |
| `components/DoctorsPage.jsx` | **Edited** — added `view` state (`xoexam_doctors_view`, default Grid), List/Grid toggle next to + Add Doctor, new table list render. |
| `index.html` | **Edited** — title bumped to v0.2.9. No routing change. |
| `deploy.html` · `deploy-new-site.html` | **Edited** — version strings bumped to v0.2.9. |
| `CLAUDE.md` · `README.md` | **Updated** — v0.2.9 version-log entry, component-index notes, sidebar-nav note, localStorage-key list, status. |

---

## Tests at clinical fidelity (7 of 19)

> The entire UI/UX ships as one unified build — **v0.2.9**. The column shows *when each test last reached clinical fidelity*, not a per-test version number. None changed in v0.2.9.

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

Unchanged from v0.2.8 — v0.2.9 opened no new engineering questions:

1. **Certify & close → Rx-release system event.** MPR to wire this as the trigger that releases the verified Wavefront Refraction Rx to the xoFit job object. Couples to the role/permissions model.
2. **VA pass/fail threshold** for the subjective endpoint (currently "more than half correct") — Gary to validate against a published standard before lock.
3. **Patient-facing headset/clicker view** for objective self-administered mode — out of scope for this build.

---

## Document set issued at v0.2.9

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.9.docx` / `.md` | Reissued at v0.2.9 — §0 shell/navigation change log added |
| `xoExam Development Brief 06-16-2026 v0.2.9.docx` / `.md` | This release-specific brief |
| `xoExam Development Brief.docx` (cumulative) | v0.2.9 entry appended |
| `xoExam Clinical Standards Reference v0.2.9.docx` / `.md` | Reissued at v0.2.9 — shell-only release, no clinical change |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.9 — shell-only release, no clinical change |
| `CLAUDE.md` | v0.2.9 entry appended; component index, sidebar-nav note, localStorage keys, status updated |
| `README.md` | Status bumped to v0.2.9 |
| `_dist_v0.2.9/` | Deployment package (current) |

---

## Deployment

- **Code:** `components/DashboardShell.jsx`, `PatientsPage.jsx`, `DevicesPage.jsx`, `DoctorsPage.jsx` (edited)
- **Title bumped:** `index.html` → v0.2.9
- **Deploy harness:** `deploy.html` · `deploy-new-site.html` → v0.2.9
- **Distribution package:** `_dist_v0.2.9/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.2.9 · June 16, 2026*
