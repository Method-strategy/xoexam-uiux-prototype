# xoExam UI/UX — Project Brief for Claude

> This file is read automatically at the start of every chat session. Keep it up to date as decisions are made.

---

## Project Purpose

We are building a **tablet-based UI/UX controller** for the **xoExam™ ophthalmic examination system** by **Xenon Ophthalmics Inc.**. The app connects via **Bluetooth or Wi-Fi** to one or more medical-grade eye exam headsets, enabling local and remote administration of **19 eye tests** (expandable). It is a **cloud-based application** accessed through a secure login.

### Core Functional Areas
1. **Exam Administration** — run, monitor, and record results of 19 eye tests via connected headset(s)
2. **Patient Data Management** — full EHR-lite: patient records, exam history, results
3. **Professional Staff Management** — doctor/technician profiles, roles, scheduling
4. **Calendar & Scheduling** — exam appointments, staff scheduling
5. **Device Management** — connect, configure, calibrate, and health-monitor each xoExam™ headset (status, battery, live feed)
6. **Live Monitoring** — real-time view of active exam sessions

### Target Platform
- **Primary device**: Android-based tablet (sold as part of the xoExam™ system)
- **Starting pixel dimensions**: **1280 × 800px** (standard Android tablet landscape)
- **Responsive**: scales smoothly up to laptop (1440px) and desktop (1920px) via RWD
- **Touch-first**: all interactive elements ≥ 44px touch targets
- **Input**: touch primary, keyboard/mouse secondary

### XO™ Vision Care System — Module Ecosystem
The login/welcome screen is the launchpad for the full XO™ Vision Care System suite:
| Module | Status | Notes |
|---|---|---|
| **xoExam™** | In development (this project) | Eye exam administration |
| **xoIris™** | Deep in development | Cloud-based; login link already established |
| **xoFit™** | Future | Frame fitting system |
| **xoLab™** | Future | In-office eyewear finishing |

Each module links out to its own cloud app login. The Welcome screen is the unified entry point.

---

## Aesthetic Direction & Design Authority

### The Brief
xoExam is a pioneering medical device. The app controlling it must match that aesthetic — cutting-edge med tech, precision instrument feel. Aspirational references: Zeiss, Topcon (gold standard medical software UI).

### Design Authority
The designer (Claude) has full creative authority to execute this vision. The CD (user) directs at the vision level — "more precision," "too clinical," "needs more energy" — not at the detail level. Color decisions, spacing, depth, hierarchy are design calls, not approval items.

### Aesthetic Principles
- **Light primary UI** — clinical environment, lit exam rooms, working tool
- **Dark exam screens** — already implemented for active test conducting; keep and refine
- **Navy `#0e2f5e` as structural anchor** — sidebar, major chrome, provides depth
- **`#1f8eff` as primary xoExam accent** — dominant interactive color throughout
- **Contextual dark = clinical mode signal** — the shift from light (admin) to dark (exam) is meaningful UX
- **Translucent variants allowed** — tints, alphas, layered surfaces to create depth
- **Grayscale/black additive** — available when they serve cohesion
- **Rules can be bent** — when breaking a rule creates something that feels innovative and still reinforces the brand, that's the right call
- **RAG colors untouched** — Red/Amber/Green stay for alerts, status, clinical attention elements only
- **No off-brand colors for UI** — orange, random purples, warm tones on buttons/nav are gone

### Non-Negotiables
1. Functionality must not break
2. Final output must be clean and handoff-ready for Claude Code
3. Dark/light mode switching is a Phase 2 feature for Claude Code — not in scope now

### Work Approach
- Phase 1: Shell & Foundation (DashboardShell, sidebar, header) ✅
- Phase 2: Dashboard Overview ✅
- Phase 3: Exam flow screens
- Phase 4: Supporting pages (Patients, Devices, Analytics, Settings)
- Phase 5: Login & Welcome
- Each phase reviewed directionally before moving on

### Quality Standard
Every decision must be deliberate and defensible — either it serves the functionality or the aesthetic. Details are caught before the client sees them, not after. No back-checking required.




The prototype in this project (`index.html`) is the **authoritative, production-target codebase**. It is **replacing** the older Vite/TypeScript/Tailwind codebase found in the local folder "XO Exam System _ Dashboard - Method Version". That older codebase is reference-only — do not treat it as the source of truth.

The prototype is intentionally:
- **Self-contained** — a single HTML entry point loading modular `.jsx` components
- **Framework-light** — React + Babel (CDN), no build toolchain required
- **Cleaner and more efficient** than the Vite codebase it replaces

---

## Tech Stack (Prototype)

| Layer | Choice |
|---|---|
| Framework | React 18.3.1 (CDN, UMD) |
| Transpiler | Babel Standalone 7.29.0 (CDN) |
| Fonts | Nunito Sans (Google Fonts, 300/400/700) |
| Icons | Inline SVG paths (Heroicons-style, stroke-based) |
| Charts | Custom SVG / inline (no Recharts) |
| State | React useState/useEffect + localStorage persistence |
| Styling | Inline styles + global CSS in `<style>` tag |
| Entry point | `index.html` (consolidated v0.1.9; previously had a duplicate `xoExam Prototype.html` — retired) |
| Components | `components/*.jsx` (22 files, loaded via `<script type="text/babel" src>`) |
| Assets | `assets/` (logos: PNG + SVG) |

**CDN script tags (exact, pinned with integrity hashes — do not change):**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

**Critical multi-file Babel rule:** Each `<script type="text/babel">` has its own scope. To share components between files, assign them to `window` at the end of each component file (e.g. `Object.assign(window, { MyComponent })`). Name all style objects uniquely — never use `const styles = {...}` across multiple files.

---

## Brand & Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| Navy (primary bg) | `#0e2f5e` | Sidebar, login left panel, dark headers |
| Blue (accent) | `#1f8eff` | Buttons, focus rings, active states, links |
| Royal Blue | `#155bcc` | xoIris product color |
| Teal | `#05c1bc` | xoFit product color, secondary accent |
| Green | `#75d647` | xoLab product color |
| Light bg | `#f9fafb` | App background |
| Card bg | `#ffffff` | Cards, panels |
| Border | `#e5e7eb` | Dividers, card borders |
| Text primary | `#111827` | Headings |
| Text secondary | `#374151` | Body |
| Text muted | `#9ca3af` | Labels, metadata |

### Typography
- **Font**: Nunito Sans (Google Fonts), weights 300 / 400 / 700
- Font scale uses CSS clamp variables (`--fs-xs` through `--fs-xl`) defined in `:root`
- Minimum font size: 11px (`--fs-xs`); never go below this in UI

### Responsive Scale
```css
--fs-xs:   clamp(9px,  1.1vw, 11px)
--fs-sm:   clamp(11px, 1.3vw, 13px)
--fs-base: clamp(13px, 1.5vw, 15px)
--fs-md:   clamp(15px, 1.8vw, 18px)
--fs-lg:   clamp(18px, 2.2vw, 24px)
--fs-xl:   clamp(22px, 2.8vw, 32px)
--touch-min: 44px   /* minimum touch target */
--sidebar-w: clamp(200px, 18vw, 240px)
--pad: clamp(12px, 2vw, 24px)
```

### Breakpoints
- `< 767px` — small tablet portrait: hide sidebar (hamburger), 2-col stat grids
- `768–1023px` — tablet landscape: sidebar 200px, 2-col grids
- `1024px+` — desktop: full layout, `--pad: 24px`
- `1440px+` — large desktop: `--pad: 32px`

---

## Application Architecture

### Screen Flow
```
LoginScreen → WelcomeScreen → DashboardShell → [section content]
                                              ↘ ExamShell → [test component]
```

### Session Persistence
- Current screen: `localStorage('xoexam_screen')`
- Active section: `localStorage('xoexam_section')`
- Tweaks: `localStorage('xoexam_tweaks')`

### Tweak Defaults (in `index.html`)
```json
{
  "accentColor": "#1f8eff",
  "darkSidebar": true,
  "compactHeader": false,
  "showGreeting": true
}
```

---

## Component Index

| File | Role |
|---|---|
| `LoginScreen.jsx` | Split-panel login (navy left + form right) |
| `WelcomeScreen.jsx` | Product selector (xoExam, xoIris, xoFit, xoLab) |
| `DashboardShell.jsx` | Sidebar nav + header shell; routes to section content |
| `DashboardOverview.jsx` | Home dashboard: stats, quick actions, recent patients |
| `TestSelection.jsx` | Exam type grid (20+ test types) |
| `ExamShell.jsx` | Exam orchestration wrapper |
| `VisualAcuityTest.jsx` | Visual Acuity — Snellen/ETDRS chart, standalone on ExamShell |
| `PupillometryTest.jsx` | Pupillometry — static/dynamic/swinging, standalone on ExamShell |
| `ColorVisionTest.jsx` | Ishihara plates + D-15 Farnsworth (single file, four phases inside ExamShell) |
| `VisualFieldTest.jsx` | Visual Field perimetry, standalone on ExamShell |
| `WavefrontAberrometryTest.jsx` | Wavefront Aberrometry — extracted from RemainingTests (v0.1.9), standalone on ExamShell |
| `WavefrontRefractionTest.jsx` | Wavefront Refraction (v0.2.7) — two-stage objective wavefront + subjective liquid-lens phoropter + six competitive-parity enhancements (PSF/VA sim · binocular balance · multi-source Rx comparison · photopic/mesopic · Smart-Cylinder bracketing · progression tracker) merged into this single file in v0.2.7 (v2 fork deleted); supersedes but does NOT replace Aberrometry (both stay in catalog) |
| `ExtraocularMotilityTest.jsx` | Extraocular Motility — extracted from MotilityAndNeuro (v0.2.1), standalone on ExamShell |
| `RefractionAndContrast.jsx` | Refraction + contrast sensitivity tests (bundled) |
| `MotilityAndNeuro.jsx` | Visual Reaction Time + Eye Tracking + AI Pattern Recognition (EOM extracted to standalone as of v0.2.1) |
| `RemainingTests.jsx` | Remaining test modules (accommodation, convergence, etc.) — `SimpleTestShell` lives here |
| `PatientsPage.jsx` | Patient list, search, add new |
| `DevicesPage.jsx` | Device list, status, add new |
| `LiveFeedPage.jsx` | Real-time device camera feed |
| `AnalyticsPage.jsx` | Charts, metrics, reporting |
| `InventoryPage.jsx` | Equipment inventory management |
| `SettingsPage.jsx` | System + practice settings |
| `DoctorsPage.jsx` | Doctor list (stats + sort + ⋮ menu) + full-page DoctorProfile (6 tabs) |
| `DoctorsAndMessages.jsx` | Messaging system (doctor list moved to `DoctorsPage.jsx` as of v0.1.2) |
| `DeviceConnectionManager.jsx` | Device pairing/connection context provider |
| `AddForms.jsx` | Add patient / add device form modals |

### Sidebar Navigation Items
Dashboard · Live Feed · Devices · Patients · Tests · Analytics · Inventory · Doctors · Messages · Compliance

---

## Available Assets (`assets/`)

| File | Usage |
|---|---|
| `xo-vision-care-logo-dark.png` | Login screen (on navy) |
| `xo-exam-logo.png` | xoExam product card |
| `xo-iris-logo.png` | xoIris product card |
| `xo-fit-logo.png` | xoFit product card |
| `xo-lab-logo.png` | xoLab product card |
| `xenon-logo.png / .svg` | General Xenon branding (light bg) |
| `xenon-logo-dark.png / .svg` | General Xenon branding (dark bg) |

New 2026 logos are in the local reference folder at:
`XO Exam System _ Dashboard - Method Version/src/xenon-ophthalmics-corp-logo-2026*.png/svg`
Import them into `assets/` before using.

---

## Key Design Patterns

- **Cards**: white bg, `border-radius: 14px`, `border: 1.5px solid #e5e7eb`, subtle shadow
- **Buttons (primary)**: accent color fill, white text, `border-radius: 10px`, `font-weight: 700`
- **Buttons (secondary)**: accent color border + tinted bg, `border-radius: 9px`
- **Back buttons**: `32×32px`, `border-radius: 8px`, `#f9fafb` bg, `#e5e7eb` border
- **Section headers**: `font-size: var(--fs-md)`, `font-weight: 700`, `color: #111827`
- **Stat cards**: white, rounded-14, with colored icon area + number + label
- **Sidebar**: navy (`#0e2f5e`), white text, active item gets accent bg pill
- **Scrollbars**: 5px, `rgba(0,0,0,0.15)` thumb, transparent track

---

## Scope & Current Status

> **⚠️ PASTE THE FULL SCOPE FROM YOUR PREVIOUS CHAT HERE** — include feature list, priorities, what's done, what's in progress, and what's next.

### Known completed:
- Login screen
- Welcome / product selector
- Dashboard shell with sidebar nav
- Dashboard overview
- Test selection grid
- **Visual Acuity Test** — full rebuild: individual line + full chart views, per-eye (OD/OS/OU) results, letter toggle (null→correct→incorrect), mark all correct/incorrect, regenerate letters, auto-progression at ≥65%, prescription adjustment panel (SPH/CYL/AXIS for OD & OS), detailed report with VA table + prescription summary, Export/Compare, cancel dialog
- **Contrast Sensitivity Test (Pelli-Robson)** — full rebuild: 12-line chart with contrast-faded letters (rgba rendering), line-by-line + full chart views, mark all, regenerate, prescription sidebar (OD/OS SPH/CYL/AXIS), auto-progression, report with CS summary per eye, cancel dialog
- **Visual Field Test** — full rebuild: eye selection, config dialog (stimulus size I-V, strategy, brightness/contrast, result format), pattern selection (7 monocular + 4 binocular), foveal calibration (crosshair + 4 brightness levels), conducting phase with live eye feed + xoExam lens controls + gaze tracking bars (Errors/Responses/Not Detected) + field dot pattern, detailed report with SVG sensitivity diagram + MD/PSD/VFI indices + clinical interpretation + reliability indices, cancel dialog
- **Wavefront Aberrometer** — full rebuild: eye selection (OS/OD/OU), testing phase with 3 collapsibles (Patient Alignment, Pupil Detection, Focus Level), calibrating + capturing circular SVG progress, measurement complete summary, full report with 4 view types (Pupil Image, Centroid Image SVG, Full Wavefront color grid, Full Wavefront Higher Orders), eye tab selector, Zernike Mode toggle, measurement data table (teal headers), notes textarea, Export/Compare, cancel dialog
- Refraction Test (dark fullscreen, auto/subjective phases — feature parity confirmed)
- Pupillometry, Color Vision, Motility (EOM), Eye Tracking, Visual Reaction Time, AI Pattern Recognition, Accommodation, Convergence, Fixation Stability, Binocular Vision, Keratometry, Tear Film, Confrontation — all at feature parity with local reference
- Patients, Devices, Live Feed, Analytics, Inventory, Settings, Doctors/Messages pages
- Device connection manager context
- Add patient / add device forms
- Tweaks panel (accent color, sidebar style, greeting bar, compact header)
- Responsive layout + touch targets
- Session persistence via localStorage

### Local Vite/TS codebase status:
All 19 exam tests have been rebuilt or confirmed at feature parity. All non-exam features have been verified. The local "XO Exam System _ Dashboard - Method Version" folder is **reference-only and can be fully retired**. The prototype is the authoritative codebase.

### Additional features completed (parity audit):
- **D-15 Farnsworth Color Test** — Color Vision test now has a proper selection screen (Ishihara + D-15). D-15 has full interactive cap arrangement, drag-to-reorder, SVG plot, defect analysis (Protan/Deutan/Tritan)
- **Manual Control Page** — Full device manual control: live eye feed with animated overlays, camera sliders (zoom/focus/brightness/contrast), orange directional pad, tracking target selector, patient metrics, language selector (12 languages), voice control, quick test launcher. Added to sidebar nav.
- **Patient Profile** — Full tabbed patient profile (Overview / Appointments / Tests / Insurance). Overview: demographics, medical status, notes. Appointments: upcoming + past with details. Tests: history with expandable results + Start New Test launcher (all 17 exam types). Insurance: primary/secondary + billing summary.

### In progress / next:
- Phase 3: Exam flow screens aesthetic pass
- Phase 4: Supporting pages aesthetic pass (Patients, Devices, Analytics, Settings)
- Phase 5: Login & Welcome screens
- Remove "← Login" dev navigation button before handoff

---

## Development Rules

0. **Test naming convention (codified v0.2.0).** UI labels use bare nouns — no "Test" / "Exam" suffix. The surrounding chrome ("Tests" sidebar, "Run new test" button, exam history) already establishes what they are; suffixes on every list item are redundant noun-stutter. Reports and printed PDFs keep the formal phrasing ("Wavefront Aberrometry Report," "Visual Acuity Report") because formal documents read differently than UI labels. Proper-named protocols keep their full names (D-15 Farnsworth, Pelli-Robson, Esterman, Confrontation Visual Field where used as a clinical descriptor in copy). Applies to: TestSelection.jsx catalog, PatientsPage.jsx + ManualControlPage.jsx launchers, and ExamShell `title=` values across all test components.

1. **Never break the single-file loading pattern.** `index.html` is the entry point. All components load as `<script type="text/babel" src="components/X.jsx">`.
2. **No build toolchain.** Everything runs directly in the browser via CDN Babel. No npm, no Vite, no webpack.
3. **Name style objects uniquely** per component file to avoid collisions (`const dashboardStyles`, `const loginStyles`, etc.).
4. **Name ALL top-level constants uniquely** across component files — not just style objects. If two `.jsx` files declare a top-level `const` with the same name (e.g. `EXAM_TYPES`), they will collide and overwrite each other. Use component-specific prefixes (e.g. `PATIENT_EXAM_TYPES`, `MC_TESTS`).
5. **Export components to `window`** at the bottom of each `.jsx` file so the main app can reference them.
5. **Preserve localStorage keys** — `xoexam_screen`, `xoexam_section`, `xoexam_tweaks`.
6. **Touch targets ≥ 44px** on all interactive elements.
7. **Font: Nunito Sans only.** Do not introduce additional typefaces.
8. **Inline styles preferred** over injected `<style>` blocks in components — keeps components portable.
9. **Never reference the local folder paths** in HTML/JSX. Copy needed assets into `assets/` first.
10. **The local Vite/TS codebase is reference only.** Read it for logic or design intent; never import from it.
11. **US English in all docs.** color (not colour), standardize (not standardise), authorize, organize, optimize, recognize, analyze, characterize, prioritize, summarize, categorize, micrometers (not micrometres), canceling (single-l), labeled (single-l). Applies to all client-facing docs (briefs, specs, README) and the prototype. Codified May 22, 2026 at CD direction.
12. **XLSX generation recipe (codified May 22, 2026).** A minimal-and-correct workbook for client feedback / data templates needs all of these to open cleanly in Excel without the "We found a problem" recovery prompt:
    - **STORED (uncompressed) zip** — implement crc32 + local file headers + central directory + EOCD by hand. JSZip is not available in `run_script`.
    - **Shared strings table** (`xl/sharedStrings.xml`) — use this instead of inline strings. Excel is happier with the standard pattern.
    - **No pre-populated blank rows.** Empty `<c><is><t></t></is></c>` cells inflate the file and trigger validation failures. Just write the header + one example row; leave the rest empty.
    - **Dimension element required** (`<dimension ref="A1:N2"/>`) — some readers reject sheets without it.
    - **Frozen header pane block** — `<sheetView ...><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView>`. The `<selection>` is what makes the freeze actually persist across Excel/Sheets/Numbers.
    - **Data validation dropdowns** — `<dataValidations count="N"><dataValidation type="list" allowBlank="1" sqref="E2:E1000"><formula1>"Opt1,Opt2,Opt3"</formula1></dataValidation></dataValidations>`. Avoid apostrophes and commas in option values — they break the CSV-style formula1.
    - **Tab order** — README first with `tabSelected="1"` on its sheetView; the per-category feedback tabs follow.
    - **Styles file** — bold white-on-navy header (s="1"), section heading (s="2"), title (s="3"), dropdown-tinted cell (s="4"). Keep it minimal; Excel rejects over-specified stylesheets.
    - Tested with Microsoft Excel for Mac. The working source lives in conversation history; copy-paste the run_script block when starting a new template.
13. **No finality / "phase-complete" language in docs (codified v0.2.6, Jun 2, 2026 at CD direction).** This is active, ongoing, versioned development — a long way from any "beta." Client-facing and internal docs must NOT use language that implies a program milestone is finished or final: avoid "beta scope CLOSED," "final," "complete program," "phase complete," "done," "shipped," and similar. State facts instead: the **version number**, the **count of tests at clinical fidelity** (e.g. "7 of 19"), and a **precise, accurate changelog of exactly what was touched** in the release (files added/edited, what changed, what's still open). Per-test "✅ complete" status in the test-stream table is fine — it describes one component's clinical-fidelity state, not the program. Versioning + accurate "what was touched" tracking is the priority; do not editorialize about how far along the overall program is.
14. **One version bump = the ENTIRE doc set brought current in the SAME pass (codified v0.2.6, Jun 2, 2026 at CD direction).** When the version is bumped, every client/handoff doc is updated to that version in one go — no partial reissues, no "I'll do the rest later," no back-and-forth. The full set that must move together: `CLAUDE.md`, `README.md`, the Engineering Handoff Specification, the cumulative + per-release Development Briefs, the **Clinical Standards Reference**, the **Clinical Evaluation Brief**, any per-test `briefs/` spec touched, `index.html` + `deploy.html` version strings, and the `_dist_vX.Y.Z/` package. Each gets: the new version number, the new "what was touched" content, and the unified-version framing. The product version is single and unified — there is no scenario where one doc is at vN and another at vN-1. Verify the whole set before presenting the package.

15. **Doctor-led output — the device MEASURES, the doctor CLAIMS (codified v0.2.6, Jun 2, 2026 at CD direction; standing principle).** xoExam is a doctor-led instrument in every way, and that posture must bear itself out in the UI/UX of every test. The device may **display any value it measured** (e.g. NPi 2.1, anisocoria 0.4 mm, RMS HOA 0.32 μm, MD −4.2 dB) and **any standardized, validated, field-expected instrument statistic** (GHT "Outside Normal Limits," MD/PSD probability plots, Winn reference bands, Humphrey reliability indices) — those are data and expected gold-standard instrument outputs; stripping them would make us look *less* like Zeiss/Humphrey, not more. What the device must **NEVER** do is render the bottom-line clinical **verdict, claim, categorization, qualification, or diagnosis** on its own. The clinician makes those. Concretely: the bottom-line impression is a **doctor affordance** — either blank for the clinician to write, or an input the clinician selects — never a banner/card the box asserts unprompted.
    - **Rationale (regulatory + competitive, not aesthetic):** Doctor-led is the shield against (a) FDA misbranding / intended-use overreach and (b) AOA-style formal complaints. Our top competitor **Eyebot (123 SEE, Inc.)** drew a formal AOA complaint to FDA/CDRH dated Mar 24, 2026 — full text at `uploads/Eyebot Regulatory Compliance Concerns 032326.pdf`. Its core thrust: a device making **disease-screening / diagnostic claims** and eliminating **professional supervision** beyond what its predicates support. A box that tells the doctor what a result *means* is precisely the surface that complaint targets. We do not hand a panelist that screenshot.
    - **WFR is the reference template.** Wavefront Refraction is the first test built correctly to this principle: it is a measurement/verification workflow and deliberately carries **no Patient Classification banner / no clinical-claims block** (per Zeshan). It is the model the rest of the catalog gets brought in line with — not the exception.
    - **Off-principle surfaces queued for a convert-to-doctor-affordance sweep** (device-authored severity verdicts we invented, NOT standardized statistics): Pupillometry `PUP_getInterp` "normal/mild/significant" Patient Classification banner; EOM Patient Classification banner + "CN palsy" auto-flag; Wavefront **Aberrometry** per-eye Patient Classification banner + four-band Clinical Interpretation card (excellent/good/mild/significant); Color Vision "Deficiency Detected" band naming; Visual Fields clinical-interpretation prose block. **Do not** strip standardized indices/plots in the same motion — only the invented bottom-line verdicts. Sweep happens AFTER WFR is locked as the reference pattern, test-by-test, never piecemeal mid-test. (Open decision for the sweep: convert each verdict into a doctor sign-off / impression field rather than deleting it, so "doctor-led" reads as an active affordance, not an absence.)

The product version is single and unified — every doc and surface carries the SAME version number. The per-test "reached clinical fidelity in vX.Y.Z" marker is a milestone timestamp, NOT a separate version (see rule 14 and the test-stream table note).

---

## Hardware Capability Findings & Future-Build Scope (Jun 2026)

> Source: competitor analysis (Marco OPD-Scan III aberrometer; Reichert Phoroptor VRx digital refractor; Supore Myopia Pro 800 biometer) + xoExam hardware Q&A answered by Steve. **Items marked "Reehana to confirm" are not final.** Doc to send to Reehana: `xoExam Headset Sensor Questions.docx`.

### Confirmed hardware capabilities (Steve, Jun 2026)
- **Wavefront:** images a **4 mm pupil**; Zernike to **10th order (66 modes)** (lenslet-limited). 6 mm pupil capability **pending Reehana**.
- **Pupil / lighting:** can detect pupil in **dim vs. bright** (photopic/mesopic) — hard yes.
- **Eye-tracking camera:** **40 fps**; gaze **accuracy** pending Reehana.
- **Patient history:** cloud will store a **time-series profile** per patient — yes.
- **Vertex distance:** **25–30 mm** (range, **not final** — Reehana).
- **Prism:** optics do **not** introduce prism; prism is **measured in software via the eye-tracking camera** (Neurolens-style).

### ⚠️ Correction to existing build (pending Reehana)
- **Wavefront Aberrometry analysis diameter:** the test is built to **6.0 mm** with 6 mm HOA norms/thresholds (see test-stream notes). Hardware currently images **4 mm**. **Do not rebuild yet** — annotate as provisional; if Reehana confirms 6 mm, keep; otherwise re-baseline HOA norms to 4 mm.

### 🔒 FUTURE / HARDWARE-GATED — NOT CURRENT SCOPE
Do not build these against current hardware; they require capabilities xoExam does not have today:
- **Corneal-vs-internal aberration split** — needs corneal topography (Placido). **Confirmed slated for next-version xoExam.** Today: total ocular aberrations only.
- **AL-based myopia management** (Supore-style: axial-length percentile curves, AL/CR ratio, growth-rate judgments) — requires **optical biometry (axial length) + segment biometry (CCT/ACD/LT/WTW)**, which the headset does **not** have. Separate device class.
- **Direct keratometry (K1/K2)** — only **Zernike-estimated**, **CMO-unvalidated**. Any K readout must be labeled estimated/provisional.
- **Full 4 mm + 6 mm day/night refraction** — 4 mm is available now; the **6 mm column is provisional pending Reehana**.
- **Optical prism / prism-dissociation phoria** — not available; software + eye-tracking (Neurolens-style) is the path, **pending gaze-accuracy confirmation**.

### ✅ WFR COMPETITIVE ENHANCEMENTS — APPROVED, QUEUED (do NOT start until Reehana confirms)
CD approved all six (Jun 2026); **build is on hold pending Reehana's answers**, then execute in **one pass**. All doctor-led-safe (measurements/simulations, never verdicts).
1. **PSF + VA simulation** in the report (driven by 10th-order Zernike). **Before/after is tied to the old-vs-new Rx comparison** (CD-confirmed pairing).
2. **Binocular balance step** after both eyes — via **fogging / alternate-occlusion** (no prism needed; works on liquid lens + occlusion we already have).
3. **Multi-source Rx comparison** (objective · subjective · habitual/old · unaided) with deltas; old-Rx manual entry now, auto-pull from history later.
4. **Photopic vs. mesopic refraction** with a Diff row — **4 mm now (hard yes)**; **6 mm column stubbed provisional**, flips on when Reehana confirms.
5. **Smart-Cylinder auto-bracketing** — UX on existing JCC (step size auto-set by cylinder magnitude, shrinks after each reversal).
6. **Refraction-based progression tracker** — spherical-equivalent trend over visits + D/year vs. age-banded norms (honest myopia toe-hold; reference bands shown, "at-risk" call stays the clinician's).

**CD layout direction:** build all six in one pass; **use tabs where needed to avoid scrolling / layout crowding** (designer discretion). Keep the 4 mm analysis-diameter reality consistent across PSF/VA-sim and the photopic refraction (don't perpetuate the 6 mm assumption).

### WFR v0.2.7 — six competitive-parity enhancements MERGED into production WFR (Jun 8, 2026)

In v0.2.7 the six CD-approved competitive-parity enhancements were folded **directly into the single production `components/WavefrontRefractionTest.jsx`** (component `WavefrontRefractionTest`, all `WFR_`-prefixed) and wired into the shell — there is **no parallel `v2` file**. The earlier `WavefrontRefractionTest v2.jsx` fork + its `Wavefront Refraction v2 Demo.html` harness were **deleted** to remove the versioning hazard of a divergent second copy (CD direction: one file, one source of truth). The whole product (shell + this test) is now v0.2.7.

**Draft framing (unchanged):** the entire program remains pre-beta, active development pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. v0.2.7 is the version that integrated these enhancements into one codebase — it is not a "finished" milestone (rule 13).

**Reversibility (the CD's key requirement) — preserved IN the one file:** every Reehana-gated value stays isolated in named constants at the top of `WavefrontRefractionTest.jsx` — `WFR_ANALYSIS_DIA` (4.0 mm, confirmed), `WFR_SIXMM_PROVISIONAL` (true → 6 mm columns shown + amber "Provisional" tagged; flip false → they vanish), `WFR_ZERNIKE_MAX_ORDER`/`WFR_ZERNIKE_MODES` (10/66, stated), `WFR_VERTEX_MM` (25–30, not final), `WFR_SPHERE_RANGE`/`WFR_CYL_RANGE` (placeholders — Q8 came back blank). If Q3/Q7/Q8 are not confirmed: edit those constants / flip the flag — **no teardown, no rebuild, no separate file.** Built to the 4 mm confirmed baseline throughout.

**What's now in production WFR:** (1) PSF + simulated-VA before/after (Simulation tab, habitual-vs-new); (2) binocular balance step (subjective `subjStep:'binocular'` after both eyes — fogging/alternate occlusion, no prism); (3) multi-source Rx comparison (Rx-comparison tab — objective/subjective/habitual/unaided + SE deltas, manual habitual entry); (4) photopic-vs-mesopic with night-shift Diff (Day-&-night tab — 4 mm + provisional 6 mm column); (5) Smart-Cylinder auto-bracketing on the JCC (step ladder auto-sized to |cyl|, narrows one rung per reversal, toggle); (6) refraction progression tracker (Progression tab — SE trend SVG + D/yr rate vs age-banded reference, at-risk call left to clinician). Report restructured into tabs (Summary · Rx comparison · Day & night · Vision simulation · Wavefront[obj-only] · Progression). Doctor-led preserved — no Patient Classification banner, reference data only. **OPEN:** the Reehana-gated values (6 mm pupil, vertex range, Rx ranges) stay provisional until confirmed; flip the constants when answers land.


---

## Project Stream Architecture — CONFIRMED DECISION (May 2026)

The xoExam UI/UX prototype is delivered as separate but connected project streams. This is the authoritative architecture going forward.

### Stream 1 — Shell (this project)
The application shell, navigation, and administrative screens:
- Login screen
- Welcome / module selector screen
- Dashboard overview
- Patient profile
- Exam orchestration (ExamShell wrapper)
- Admin functions
- Navigation and routing stubs

**Deliverable:** Complete shell prototype with test component slots — ExamShell renders a placeholder where each test component drops in.

**Status:** Substantially complete · Phase 3 (exam flow aesthetic pass) in progress · **do not add or edit test components in this session.**

**Current shell components:**
| File | Contents | Status |
|---|---|---|
| `LoginScreen.jsx` | Login screen | ✅ complete |
| `WelcomeScreen.jsx` | Module selector | ✅ complete |
| `DashboardShell.jsx` | Sidebar + header | ✅ complete |
| `DashboardOverview.jsx` | Dashboard overview | ✅ complete |
| `ExamShell.jsx` | Exam wrapper | ✅ complete |
| `TestSelection.jsx` | Test selection grid | ✅ complete |
| `PatientsPage.jsx` | Patient records | ✅ complete |
| `DevicesPage.jsx` | Device management | ✅ complete |
| `LiveFeedPage.jsx` | Live monitoring | ✅ complete |
| `AnalyticsPage.jsx` | Analytics | ✅ complete |
| `InventoryPage.jsx` | Inventory | ✅ complete |
| `SettingsPage.jsx` | Settings | ✅ complete |
| `DoctorsPage.jsx` | Doctor list + profiles | ✅ complete |
| `DoctorsAndMessages.jsx` | Messaging | ✅ complete |
| `ManualControlPage.jsx` | Device manual control | ✅ complete |
| `DeviceConnectionManager.jsx` | Device connection context | ✅ complete |
| `AddForms.jsx` | Add patient/device modals | ✅ complete |

### Bundled test files — extract before editing

Several tests are currently bundled in multi-component files rather than standalone files. Extraction into standalone files is part of the design pass process for each test. **Do not edit these bundled files directly in the shell session — extract the target component first.**

| Bundled file | Contents | Size |
|---|---|---|
| `RefractionAndContrast.jsx` | Refraction Test + Contrast Sensitivity Test | 44KB |
| `MotilityAndNeuro.jsx` | Extraocular Motility + Visual Reaction Time + Eye Tracking + Fixation Stability + AI Pattern Recognition | 38KB |
| `RemainingTests.jsx` | Binocular Vision + Accommodation + Convergence + Keratometry + Tear Film + Fixation Stability + AberrometerTest + Confrontation | 82KB |

Note: `SimpleTestShell` lives in `RemainingTests.jsx` and must remain there for other components that use it — do not duplicate it on extraction.

### Test stream status

> **The product version is unified — the whole prototype is v0.2.7.** The "✅ vX.Y.Z" in each row's Status records *when that component last reached clinical fidelity* (the release it was last meaningfully updated in), not a separate version number for the test. A row showing an earlier release is correct and unchanged since then, not behind.

| # | Test | File | Status |
|---|---|---|---|
| 02 | Visual Acuity | `VisualAcuityTest.jsx` standalone | ✅ v3 complete · report label fix pending |
| 03 | Color Vision | `ColorVisionTest.jsx` standalone | ✅ v1 complete · refactored in-place onto ExamShell with CV_ prefixes, D15 folded in, OD/OS/OU eye selector lifted above protocol cards, 3×4 number pad, session notes sidebar, AAO-style band naming (Normal/Borderline/Deficiency Detected), VA-style report with Clinical Interpretation card |
| 04 | Visual Fields | `VisualFieldTest.jsx` standalone | ✅ v0.1.8 complete · rebuilt in-place onto ExamShell with VF_ prefixes, six-phase flow collapsed to ready/testing/report (eye-selection/config/pattern/foveal sub-steps under `ready`), OD→OS sequence for bilateral monocular protocols (single OU for binocular by-design protocols), GHT category pill + clinical override rule, Total Deviation + Pattern Deviation probability plots, age-banded reference MD table, reliability rebanding (FP/FN/FL with green/amber/red per Standard / Strict preset), pattern-specific point counts, Goldmann spelling sweep, sentence-case sweep, Certify & close, lens stepper to 36px, session notes sidebar, foveal threshold per-eye with on-grid annotation |
| 05 | Wavefront Aberrometry | `WavefrontAberrometryTest.jsx` standalone | ✅ v0.1.9 complete · extracted from `RemainingTests.jsx` into standalone file with WFA_ prefixes · rebuilt onto ExamShell with three-phase flow + canonical Cancel UX · OD-first bilateral sequence with `WFA_InlineEyePicker` / `WFA_EyeBreadcrumb` / `WFA_TransitionPrompt` (pattern lifted from CV v0.1.7 / VF v0.1.8) · analysis diameter corrected to 6.0 mm so rmsHOA values + interpretation thresholds match published 6mm-pupil norms · clinical interpretation card with four-band logic (excellent <0.15 / good <0.30 / mild <0.45 / significant ≥0.45 μm) · per-eye Patient Classification banner driven by worst-eye HOA RMS · Total HOA RMS + Coma RMS surfaced as primary summary metrics · elevated-HOA amber flag at >0.30 μm · view-type segmented control replacing the `<select>` dropdown · color-scale legend added under the wavefront map · navy table header replacing teal palette violation · Zernike Z₄⁰ proper subscript/superscript notation · axis fixed to unsigned 0–180° · spherical aberration units corrected to μm · introduced first "Doctor sign-off" label above Certify & close (groundwork for post-beta Roles & Remote Operation pass) · sentence-case sweep · solid accent backgrounds replacing the gradient pattern · spec saved as `briefs/WavefrontAberrometry_Clinical_Spec_v2.md` superseding the v1 prompt |
| 06 | Extraocular Motility | `ExtraocularMotilityTest.jsx` standalone | ✅ v0.2.1 complete · extracted from `MotilityAndNeuro.jsx` into standalone file with EOM_ prefixes · rebuilt onto ExamShell with three-phase flow + canonical Cancel UX + sub-step state machine inside `testing` phase (versions → pursuit → saccades → ductions-OD → ductions-OS) · clinical grading scale corrected from arbitrary 1–5 to international standard 0 to ±4 (0 = normal, negative = underaction, positive = overaction) · 9 cardinal positions including primary gaze (was 8 directions, missing primary) · each position carries primary AND secondary muscle/CN mapping so CN IV palsy is correctly read at down-and-in gaze (the v1 prompt's single-muscle simplification would have missed this) · H-pattern motility diagram (clinical standard) replacing the radial 8-dot diagram · 4-option segmented selectors for smooth pursuit and saccadic assessment · ductions auto-enable when any version grade is non-zero (and can be manually enabled at setup) · OD-first bilateral ductions sequence · Patient Classification banner driven by `EOM_getInterp` (normal / mild / significant) · CN palsy clinical flag prominently surfaced at any single position grade ≤3 · Doctor sign-off label above Certify & close · navy table header (#0e2f5e) on the Versions results table · solid accent backgrounds replacing legacy `linear-gradient(135deg, accent, #155bcc)` styles · sentence-case sweep · OD/OS eye reference convention (legacy `'left'`/`'right'` removed) · spec saved as `briefs/ExtraocularMotility_Clinical_Spec_v2.md` superseding the v1 prompt |
| 07 | Pupillometry | `PupillometryTest.jsx` standalone | ✅ v0.2.5 complete · rebuilt in-place onto ExamShell with PUP_ prefixes · three-phase flow + canonical Cancel UX + sub-step state machine inside `testing` phase (static → dynamic → swinging) · OD-first bilateral sequence with `PUP_InlineEyePicker` / `PUP_EyeBreadcrumb` / `PUP_TransitionPrompt` (pattern adapted from WFA v0.1.9 / VF v0.1.8 / EOM v0.2.1) · patient age input driving age-banded reference range (Winn et al. 1994: six age bands × three light conditions) · anisocoria computed at each light condition + light-vs-dark differential row with ≥ 0.3 mm pathological flag · NPi composite computed and surfaced per eye with NeurOptics NPi-200 reference thresholds (≥ 3.0 normal / 2.5–3.0 borderline / < 2.5 abnormal) · dynamic PLR sub-test with live curve chart (`PUP_LightReflexChart`), stimulus flash overlay on iris viewer, six summary metrics surfaced as tiles (baseline / min / constriction % / latency / constriction velocity / T75 redilation) · swinging flashlight sub-test with alternating stimulus animation + 6-option RAPD grade selector per eye (None / Trace / 1+ / 2+ / 3+ / 4+) · Patient Classification banner driven by `PUP_getInterp` with worst-finding-drives-bottom-line severity (normal / mild / significant) + per-finding summary pills (anisocoria · NPi per eye · RAPD) · four-pattern clinical flag system in the report — sympathetic Horner's pattern (anisocoria worse in dark), parasympathetic CN III pattern (anisocoria worse in light), optic-nerve RAPD pattern (RAPD ≥ 1+), neurological NPi pattern (NPi < 2.5) — each emitting its own labeled red-surface flag with specific differential copy · Clinical Interpretation card with severity tint + finding-by-finding bullet list · age-banded reference values card (full Winn table with patient's band highlighted) · doctor sign-off label above Certify & close · light-theme chrome replacing the legacy dark-themed action chrome (iris viewer itself stays dark — clinically appropriate for the headset interior) · sentence-case sweep · solid accent backgrounds replacing the gradient pattern · emoji-style indicators (⚠ ✓) replaced with SVG icons · "Save Results" / "Print Report" replaced with canonical "Export report" / "Compare" / "Certify & close" trio · spec saved as `briefs/Pupillometry_Clinical_Spec_v2.md` |
| 05b | Wavefront Refraction | `WavefrontRefractionTest.jsx` standalone | ✅ v0.2.7 — six competitive-parity enhancements merged into the single production file (v2 fork deleted), still pending client review + Reehana hardware confirms · NEW parallel test (`id: wavefront-refraction`) built from a copy of WavefrontAberrometry + RefractionTest eye-scan + VisualAcuity chart; supersedes but does NOT replace Aberrometry (both remain in catalog) · all identifiers `WFR_` prefixed · the combined autorefractor + phoropter replacement — its certified Rx is the gate that releases the job to downstream xoFit · four-phase flow `entry → objective → subjective → report` mapped onto ExamShell `ready/testing/report` · OD→OS monocular objective wavefront capture using RefractionTest's live eye-scan look (dark viewer, breathing pupil, sweep line, red-dot-turns-green alignment lock) — NOT aberrometry circular-progress · subjective liquid-lens phoropter step sequence `setup → sphere(MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add` · clinical non-negotiables: axis-before-power JCC ordering, +0.75 D fogging prompt, sphere-compensation note, signed-2dp Rx discipline, monocular (no OU averaging), certify-as-system-event Rx-release gate, scan-count documentation, and DELIBERATELY no clinical claims in report (measurement/verification workflow, not screening — no Patient Classification banner per Zeshan) · optotype selector (Letters / Tumbling E / Tumbling C) via `WFR_Optotype` shared with VA · report: Final Prescription hero + Objective/Subjective two-box + wavefront analysis (3mm/5mm ring toggle, zoom-scope) · Doctor sign-off label above Certify & close · spec: `briefs/WavefrontRefraction_Clinical_Spec_v2.md` (v2 — six-enhancement pass) · **v0.2.7 merge:** PSF/VA simulation, binocular balance step, multi-source Rx comparison, photopic/mesopic day-&-night, Smart-Cylinder auto-bracketing, refraction progression tracker — all folded into this one file with a tabbed report; Reehana-gated values isolated in named constants (`WFR_SIXMM_PROVISIONAL` etc.) for one-flip reversal · OPEN: pass/fail threshold (Gary to validate), Certify→system-event wiring (MPR), Reehana Q3/Q7/Q8 confirms, patient-headset view out of scope |
| 08+ | Accommodation, Binocular Vision, Convergence, Keratometry, Tear Film, Visual Reaction Time, Eye Tracking, Fixation Stability, AI Pattern Recognition, Confrontation | bundled | ⬜ deferred until priority 6 complete |

### Visual Acuity v2 — UI demonstration prototype (NOT wired into anything · Jun 3, 2026)

A standalone split-column VA exploration built at CD direction to walk the client through the **Snellen / Tumbling E / Landolt C** presentation UX. Files: `components/VisualAcuityTest v2.jsx` (component, `VA2_`-prefixed, `VisualAcuityTestV2`), `Visual Acuity v2 Demo.html` (dev harness loading external components), and `va-v2-demo/index.html` (self-contained single-file build for Netlify — all sources inlined as `text/babel` blocks).

What it demonstrates: left = **patient view** (Snellen/Numbers show one *line* at a time; Tumbling E / Landolt C show one *optotype* at a time, advancing character-by-character) on a white field with black optotypes; right = **doctor control** = the full chart fitting with no scroll, accent **row** indicator + gray **character** indicator kept in lockstep with the patient, per-letter tap-to-score (clear→green→red, no bulk-mark buttons), mid-exam line stepper (up=larger/down=smaller, no cancel needed), OD→OS sequencing with breadcrumb, per-eye report (doctor impression field, no device verdict). Black-on-white contrast is mandatory (acuity is never white-on-dark).

**CRITICAL CAVEATS (CD, Jun 3, 2026):**
- The standalone `VisualAcuityTest.jsx` this v2 was forked from is **NOT in sync** with WFR's subjective section. WFR's subjective was derived from the *original* VA earlier and has since diverged — so v2 is a sibling of an out-of-date ancestor, not of the WFR code.
- v2 is **strictly a UI demonstration**. It must **NOT** be wired into WFR as-is. Any future port into the WFR subjective step requires careful review so it does not break the parts of WFR that are already correct.
- It does **not** update or supersede the production VA test or WFR. Nothing in the shell or WFR was touched.

### Visual Acuity v3 — Frontier Navigation Model (reference demo · Jun 3, 2026)

Builds on the v2 split-column layout to resolve the chart-control questions from the Jun 3 Gary/Zeshan call. Files: `components/VisualAcuityTest v3.jsx` (`VA3_`-prefixed, `VisualAcuityTestV3`) and `Visual Acuity v3 Demo.html`. Still **isolated — not wired into the shell.**

What it adds over v2: the doctor always sees the **whole chart** with one **active row** that is the only row live to the patient and the only row scored (patient view can't desync); a **frontier** marks the furthest line reached — going *back* to any encountered line is free, going *ahead* of the frontier triggers a **logged override confirm** (soft lockout, surfaced as a toast + running override-count chip); four row states (active / completed-faded / available / locked); a clear-line affordance to re-walk a line without a full reset. Optotype set: Snellen · Numbers · Tumbling E · Landolt C (Numbers is VA-only and is dropped on port into WFR).

### VA v4 — production rebuild plan (decision logged Jun 4, 2026)

**WFR's subjective section is now the most advanced, integrated, doctor-led version of the acuity-chart engine.** The VA v3 frontier-navigation model + the Snellen/Tumbling E/Landolt C optotype system have already been ported into `WavefrontRefractionTest.jsx` as the `WFR_`-prefixed chart engine (`WFR_Optotype`, `pos`/`frontier`/`charPtr`/`settledLines`/`chartOverrides`/`chartEdits`, four row states, 4-way clicker glyph) — and WFR correctly **drops Numbers** per the port plan. The standalone `VisualAcuityTest.jsx` is the **stale ancestor** (predates this model — do NOT use it as the basis).

**Workflow:** (1) get WFR's subjective section correct (gated on the six enhancements + Reehana); (2) then rebuild VA as a standalone **VA v4** whose foundation is **WFR's subjective chart engine** — re-adding the **Numbers** optotype WFR omits and stripping the refraction-specific phoropter scaffolding. VA v4 forks from WFR's *production* code, **not** from the old `VisualAcuityTest.jsx` and **not** directly from VA v3.

**Keep for reference (do not delete):** original `VisualAcuityTest.jsx`, `VisualAcuityTest v2.jsx`, `VisualAcuityTest v3.jsx` — VA v4 will draw parts from each, but **mostly from WFR's subjective section.**

---

## Component Interface Contract — ALL TEST COMPONENTS MUST FOLLOW

Every test component must conform to this interface exactly so engineers can wire any component into the shell without modification.

### Props
```js
function [TestName]({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
}
```
- `onBack` — function called when the doctor exits the test (back button or cancel confirmed)
- `tweaks.accentColor` — hex string, the module accent color injected by the shell based on active module context

### Window assignment (required at end of every file)
```js
Object.assign(window, { [TestName] });
```

### ExamShell usage (required — every test renders inside ExamShell)
```jsx
return (
  <ExamShell
    title="[Test name — sentence case]"
    accent={accent}
    onBack={onBack}
    patientName={patientName}
    patientId={patientId}
    phase={phase}
    elapsed={elapsed}
    onBegin={startTest}
    onFinish={() => setPhase('report')}
    onNewTest={resetTest}
    rightPanel={phase === 'testing' ? <RightSidebar /> : null}
  >
    {phase === 'ready'   && renderReady()}
    {phase === 'testing' && renderTesting()}
    {phase === 'report'  && renderReport()}
  </ExamShell>
);
```

### Three-phase architecture (required)
- `ready` — pre-test briefing, setup options, Begin test button
- `testing` — active examination with live controls and right sidebar
- `report` — results, clinical interpretation, Export, Certify & close

### Canonical Cancel UX (owned by ExamShell, never by the test)
ExamShell handles all cancel-during-testing behavior. Test components MUST NOT build their own cancel buttons or confirmation dialogs.

| Phase | Header chrome |
|---|---|
| `ready` | Back arrow visible (left). Returns immediately via `onBack`. No confirm. |
| `testing` | **Back arrow hidden.** A labeled red "Cancel test" button appears on the right of the header. Opens the canonical confirm modal: *"Cancel test? All progress for this session will be lost and cannot be recovered."* with `[Continue test]` (default, autoFocus) and `[Cancel test]` (destructive). |
| `report` | Back arrow visible. Returns immediately. No confirm. |

The principle: **back arrows mean "navigate safely." Destructive actions get labeled buttons.** The two semantics never share a control. Mobile swipe-back / browser back / ESC are not "exit during testing" affordances — the labeled red button is.

Test components pass plain `onBack`. ExamShell intercepts and decides when to confirm before calling it.

### File header comment (required)
```js
// [ComponentName].jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
```

### No imports or build dependencies
Single file. No import statements. No export statements except window assignment. React hooks only. Inline styles only.

### Test session deliverable format

Each test stream session must deliver **two artifacts**:

1. **`demo.html`** — standalone deployable harness with React/Babel CDN, loading `ExamShell.jsx` + `[TestName].jsx`, mounting the component with placeholder `onBack` and default `tweaks={{ accentColor: '#1f8eff' }}`. Deployed to its own Netlify URL for client review.
2. **`[TestName].jsx`** — the standalone component file, conforming to the Component Interface Contract above. Delivered to the shell session for integration into the main prototype.

The test session also ships a copy of `ExamShell.jsx` so the harness can mount the contract. **The shell session's `ExamShell.jsx` remains canonical — test sessions sync from it, never the reverse.** If a test stream needs ExamShell to grow a new prop, that change is proposed to the shell session first, accepted into the canonical file, then pulled back into the test session.

**Demo HTML harness template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>xoExam — [Test Name]</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700&display=swap">
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
</head>
<body style="margin:0; font-family:'Nunito Sans',sans-serif; background:#f9fafb;">
  <div id="root"></div>
  <script type="text/babel" src="ExamShell.jsx"></script>
  <script type="text/babel" src="[TestName].jsx"></script>
  <script type="text/babel">
    const App = () => <[TestName] onBack={() => alert('Back to test selection')} tweaks={{ accentColor: '#1f8eff' }} />;
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

**Why two artifacts:** The demo HTML is what the client clicks through and approves. The `.jsx` is what the shell ingests. Because the demo harness loads the `.jsx` the exact same way the main shell does, **what the client approves is byte-identical to what lands in the shell** — zero translation cost between approval and integration.

---

## Engineering Handoff Model

### Canonical handoff document set (lives at project root, ships with every deployment)

The following documents are the authoritative client-facing handoff artifacts. They live at the project root and must be copied into every deployment package (`_dist_v0.1.x/`) so the GitHub repo always has the current set.

| File | Purpose | Cadence |
|---|---|---|
| `CLAUDE.md` | Internal project memory — design decisions, version log, contracts | Updated every release |
| `xoExam UI-UX Engineering Handoff Specification vX.Y.Z.docx` | **Master handoff spec** — engineering integration touchpoints, TBD agenda, regulatory ack, design system reference | Reissue at each clinical-fidelity milestone (v0.1.8, v0.1.9, v0.2.5, v0.2.6, …) — supersedes prior versions |
| `xoExam Development Brief.docx` | Cumulative client-facing progress brief (v0.1.0 → most recent) | Updated periodically |
| `xoExam Development Brief MM-DD-YYYY vX.Y.Z.docx` | Per-release brief | New file per release |
| `briefs/<Test>_Clinical_Spec_v2.md` | Per-test clinical specifications | New file per test that reaches clinical fidelity |

**When a new version of any handoff doc is generated:**
1. Save the new version at project root (overwriting if the version number matches, or alongside if not).
2. Copy it into the current `_dist_v0.1.x/` deployment folder.
3. Re-present the deployment package for download so the client has the updated zip.

**The handoff spec is a living document.** When new clinical specs are added, integration decisions are resolved, or compliance frameworks change, reissue the spec with the next version number. Treat the v0.1.8 issue as the template — same 16-section structure.

### Document versioning rule (codified v0.1.9, May 21, 2026)

| File type | Strategy | Reason |
|---|---|---|
| `CLAUDE.md` | Single file, updated in place | Living project memory — internal version log captures evolution. |
| `README.md` | Single file, updated in place | Repo entry point — must reflect current state. |
| `xoExam Development Brief.docx` (cumulative) | Single file, updated in place | Cumulative client narrative v0.1.0 → present. Replaced each release. |
| `xoExam Development Brief MM-DD-YYYY vX.Y.Z.docx` | New file per release | Per-release snapshot. Old versions retained for reference. |
| `xoExam UI-UX Engineering Handoff Specification vX.Y.Z.docx` | New file per clinical-fidelity milestone | Versioned reference. Old versions retained so spec evolution is traceable for MPR. |
| `briefs/<Test>_Clinical_Spec_v2.md` | Versioned suffix | `_v2` supersedes `_v1`. Bump to `_v3` only on major scope rewrite. |
| `_dist_vX.Y.Z/` | New folder per release | Old `_dist_` folders retained for reference. |

**Rule:** never overwrite a versioned doc. The repo accumulates a documentary trail; old versions stay so MPR (and we) can audit how the spec evolved.

### Engineering integration model

The shell prototype contains ExamShell and routing stubs. Each test component is a separate file. Engineers:

1. Include all component files in the single HTML prototype alongside the shell
2. Wire the routing in the shell to render the correct test component when selected
3. Replace placeholder patient data (`patientName`, `patientId`) with live session data from the patient object
4. Connect real Bluetooth/WiFi device events to test phase transitions
5. Connect cloud sync to the report/certify action
6. Implement authentication behind the login screen
7. Connect HIPAA-compliant data storage to session results

**The UI/UX deliverable is the visual and interaction layer only.** Security, compliance, connectivity, and data persistence are engineering responsibilities.

---

## Version Log

| Version | Date | Changes |
|---|---|---|
| v0.1.0 | Apr 27, 2026 | Initial deploy — 20 tests, corrected test list, category filters (Refraction, Visual Field, Binocular, Sensory, Neuro, Ocular Surface, AI), Ishihara plates 1–4 with real images + correct answers, D-15 icon, Esterman Binocular Functional Test added, Eyes Converging Exam added, Wavefront duplicate removed, Xenon Ophthalmics Inc. naming corrected |
| v0.1.1 | May 7, 2026 | Interim deploy. |
| v0.1.2 | May 14, 2026 | **Doctor section rebuild** — client Figma audit revealed our popup-modal doctor view was missing the full Doctor section. Rebuilt as full-page tabbed `DoctorProfile`: 6 tabs (Overview / Contact / Credentials / Schedule / Connected Modules / Reviews). Connected Modules tab makes the doctor record the XO ecosystem hub — xoIris™ unlocked (links to `xo-iris.com/login`), xoFit™ + xoLab™ locked with “Contact XO Sales” CTA (lock pattern shared with WelcomeScreen). Doctors list expanded 5→8 entries with full data model (~25 fields each: DOB, address, emergency contact, education, fellowships, certifications, languages, publications, success rate, ratings). Added stats bar (Total/Active/On Leave + specialties distribution), sort menu (name/patients/experience/department), per-card ⋮ menu. Split `DoctorsAndMessages.jsx` → new `DoctorsPage.jsx` + slimmed messaging file. Nomenclature swept: xoExam™ / xoIris™ / xoFit™ / xoLab™ (lowercase prefix + ™) consistent across messages. Zero Figma palette bleed — stayed on our navy + accent blue, product colors confined to their own module cards. |
| v0.1.3 | May 14, 2026 | **Module tabs refactor + marketing surfaces** — collapsed single "Connected Modules" tab into three per-product tabs (xoIris™ / xoFit™ / xoLab™), 8 tabs total. xoIris™ tab shows connected state only: green Connected pill, last-sync timestamp, Open xoIris CTA, 4-up data stats grid (synced appts / today's schedule / no-show flags / pending confirms) — no marketing copy. xoFit™ and xoLab™ tabs are full marketing surfaces: locked status pill, product-color tagline as headline, optional punchline (xoLab uses "Small footprint. Big revenue impact."), client-supplied blurb, Contact XO Sales + Learn More CTAs, real product imagery full-bleed on a 360px right column. Marketing images optimized: 1080×1350 PNG (≈1 MB each) → 720×900 JPG @ 0.82 (≈60 KB each), `loading="lazy"` + `decoding="async"`. Sidebar reorder: Doctors moved up below Devices. Logged-in doctor affordance: small camera badge on Dr. Alice Brown's avatar on her profile + list card, "Your Profile" / "You" tag indicating self-service photo upload. |
| v0.1.4 | May 15, 2026 | **Stream architecture activated + Visual Acuity refactored onto ExamShell + canonical Cancel UX** — first test stream delivery integrated under the new architecture (CLAUDE.md). VA test session delivered approved `VisualAcuityTest.jsx` (59KB, 1120→1073 lines after refactor) and inlined demo HTML; verified byte-identical via gzip extraction. Refactored onto canonical `ExamShell` wrapper: internal Header subcomponent + showCancel state + cancel modal removed entirely; eye-mode + view-toggle relocated to a sticky `TestingSubBar` at the top of testing-phase content. Business logic, render functions, screen layouts preserved byte-for-byte. **ExamShell upgraded to own canonical Cancel UX across all 19 tests:** back arrow hidden during `testing` phase (no more accidental data loss via muscle-memory ← clicks), replaced by a labeled red "Cancel test" button on the right side of the header, opens confirm modal (warning icon, "Continue test" default / "Cancel test" destructive), backdrop click + ESC dismiss. Tests pass plain `onBack`; ExamShell decides when to confirm. Rule codified in CLAUDE.md Component Interface Contract — test components MUST NOT build their own cancel dialogs. Script load order in `index.html` corrected so `ExamShell.jsx` loads before any test component. |
| v0.1.5 | May 15, 2026 | **Color Vision rebuilt in-place onto ExamShell + D-15 folded into single file + clinical UX upgrades** — full surgical patch of `ColorVisionTest.jsx` (29.5KB → 44KB, 463 → 769 lines) executed in three atomic batches, no carve-out to separate design session. **Batch 1 (structural):** renamed all top-level consts/funcs to `CV_` prefix (`CV_ISHIHARA_PLATES`, `CV_D15_CAP_COLORS`, `CV_shuffle`, `CV_IshiharaPlate`) to remove collision risk; deleted the answer-text overlay leak inside `CV_IshiharaPlate` (placeholder SVG was faintly displaying the correct answer through the dots); folded the top-level `D15ColorTest` component into `ColorVisionTest` as `renderD15()` with state, helpers, and `D15PlotSVG` all lifted into the parent's scope. **Batch 2 (contract):** wrapped selection screen + D-15 in canonical `<ExamShell>` (selection at `phase="ready"`, D-15 at `phase="testing"`), inheriting Cancel UX automatically for both; lifted eye selector (OD/OS/OU) out of the Ishihara card and placed it ABOVE both protocol cards as a section-level segmented control (matches VA's eye-mode style); changed default eye `OU → OD` (clinical convention); fixed timer to also run during D-15. **Batch 3 (UX polish):** replaced Ishihara text input with a 3×4 number pad (1–9, ←, 0, ✓ submit, 64px touch targets) + "No response" button below; added Session notes textarea to both Ishihara and D-15 right sidebars; added `CV_VIOLATOR` + `CV_REPORT_LABEL` design-system constants at file top and applied across all-caps/title-case label usage; renamed `'Not Read'` → `'No Response'` everywhere; changed defect bands from 4-band (Normal/Mild/Moderate/Severe) to 3-band AAO-style (Normal color vision / Borderline / Deficiency detected); rebuilt the report with VA-style structure (report header card · score hero + accent-tinted Clinical Interpretation paragraph · Patient Information with Protocol + Eye tested + Duration · Plate-by-Plate Results table with title-case headers · D-15 Results section with embedded plot SVG · Certify & close). All four phases now render inside ExamShell. |
| v0.1.6 | May 15, 2026 | **Color Vision D-15 polish** — two client UX corrections. (1) **Finish & Report button added to D-15** via `onFinish={d15Analyzed ? () => { setTestMode(null); setPhase('results'); } : null}` — green button appears in ExamShell header once analysis runs, replacing the redundant inline "Complete Test" button (deleted). Inline analysis card now just shows the patient sequence in monospace and a small hint to use Finish & Report. (2) **Cap numbers removed from puck UI** — labels under each cap in the Available Caps pool and next to each cap in the Your Order sequence were leaking the cap IDs, making the arrangement trivially solvable by sorting numbers instead of matching colors. Pucks are now unlabeled circles only; the `cap.id` is still used internally for scoring and shown in the post-analysis sequence display, just not during arrangement. Reference cap copy "Cap 1 — start here" reworded to "Reference cap — arrange the remaining 14 caps by color similarity, starting next to this one." Pool caps enlarged 44→48px and given subtle hover scale; sequence puck row tightened to remove the now-empty label space. `onNewTest` in the results phase now also calls `d15Reset()` so re-running the test re-shuffles the cap pool. |
| v0.1.8 | May 18, 2026 | **Visual Field — clinical accuracy overhaul + ExamShell integration + canonical eye-sequence pattern adapted for perimetry** — `VisualFieldTest.jsx` rebuilt in-place from 631 → ~1100 lines following a synthesized v2 clinical spec (`briefs/VisualField_Clinical_Spec_v2.md`) that supersedes the v1 prompt. All top-level identifiers prefixed `VF_`. **Architecture:** Six-phase flow (`eye-selection → config → pattern → foveal → conducting → report`) collapsed under ExamShell's canonical `ready / testing / report` contract — the first four pre-test phases become `vfStep` sub-states under `ready`, putting ExamShell's canonical Cancel UX in charge the moment foveal completes and testing begins (back arrow hidden during testing, labeled red Cancel test button takes over). Internal cancel modal and `showCancel` state removed from the component. **Eye-sequence (clinical correction from v2 spec):** for automated perimetry there is no true OU mode for monocular patterns — bilateral testing is OD then OS as two separate runs. Implemented as: single eye → one run; both eyes → OD then OS (default; user-tweakable to OS-first via `vfDefaultStartEye`); binocular-by-design patterns (Esterman, mEsterman, FDP, cFDP) always single OU. Default start eye flipped from `'left'` to `'right'` (OD-first) per universal medical convention — current code had this clinically backwards. New top-level components factored from Color Vision v0.1.7 patterns: `VF_InlineEyePicker` (3-pill segmented control, locks when first response recorded), `VF_EyeBreadcrumb` (done/current/pending visual progress), `VF_TransitionPrompt` (full-screen modal between OD and OS with breadcrumb + patient-positioning copy: "Cover the patient's right eye with the occluder…"). **Clinical accuracy additions:** GHT (Glaucoma Hemifield Test) — five-category pill per eye (Within Normal Limits / Borderline / Outside Normal Limits / General Reduction of Sensitivity / Abnormally High Sensitivity) with color-coded surface; GHT override rule in `VF_classifyOverall` forces Patient Classification banner up at least one severity band if any eye returns Outside Normal Limits or General Reduction even when MD is within normal limits (standard clinical reading rule for early glaucoma). Total Deviation + Pattern Deviation probability plots (`VF_DevPlot` rendering HFA-style 5-tier probability symbols `· · ▪ ■ ■`) surfaced by default in per-eye detail sections, not buried under an Advanced toggle. Age-banded reference MD table (20–30: −0.3 dB → 80+: −3.6 dB) under each report — pattern matches Color Vision v0.1.7 Vingrys & King-Smith reference population table. Reliability index rebanding: HFA's actual XX-flag thresholds applied — `Standard` preset (FP 8/15, FN 15/33, FL 10/20) replaces the v1 prompt's too-strict 15/20/20 thresholds; new `Strict` preset (FP 5/10, FN 10/20, FL 5/15) exposed as a tweak. Reliability concern banner surfaces in report when any index hits red. Pattern-specific point counts (10-2: 68, 24-2: 54, 30-2: 76, Esterman: 120, etc.) drive the Responses gaze-bar maximum — previously hard-coded to 54. **Report rebuilt as cumulative multi-eye in CV v0.1.7 structure:** Patient Classification banner (worst-eye-drives-bottom-line + GHT override + per-eye pill summary on right) · Reliability concern banner (conditional) · Patient information (8-field grid incl. Background luminance with 31.5 asb std annotation, Eye(s) tested, Reliability preset) · Per-eye result cards (1–3 column grid, MD/PSD/VFI tiles color-coded by Hodapp-Anderson-Parrish bands, GHT pill, reliability mini-tiles, foveal threshold) · Per-eye detail sections (Grayscale Sensitivity + Total Deviation + Pattern Deviation side-by-side, lens correction applied, session duration, Esterman score where applicable) · Reference values + Clinical interpretation columns (age-banded MD table + interpretation paragraph + session notes + calibration disclaimer) · Actions (Export report · Compare · Certify & close). **Typography + visual sweep:** Goldmann spelling sweep ("Goldman" → "Goldmann"); sentence case across all buttons (CONTINUE → Continue, START CALIBRATION → Start calibration, SAVE & CLOSE → Certify & close, EXPORT EXAM → Export report); solid accent backgrounds replacing `linear-gradient(135deg, accent, #155bcc)` per design-system convention (gradients aren't used elsewhere in the prototype); lens stepper button minimum 36×36px per v1 prompt; foveal threshold annotated as a small `34 dB` label on the sensitivity grid's central dot. **Tweaks added:** `vfReliability` (`'standard'` | `'strict'`) and `vfDefaultStartEye` (`'OD'` | `'OS'`). **Open clinical questions flagged in §E of the spec for engineering** (GHT compute location, real liquid-lens correction range, proprietary `screen` / `gold` pattern point counts, foveal calibration output shape) — proceeded with placeholder values, engineering to confirm with firmware team. **Post-deploy patches (verifier-driven):** added `whiteSpace:'nowrap'` + `flexShrink:0` to all four pattern-card name/points-tag pairs (monocular and binocular) so hyphenated pattern IDs ("10-1", "24-2", "30-2", etc.) no longer wrap at the hyphen and overlap their descriptions; changed testing-phase 2-column grid from `'1fr 1fr'` to `'minmax(0, 1fr) minmax(0, 1fr)'` so the live FieldPattern column is no longer pushed behind the right sidebar when the left column's lens-control content exerts min-content pressure (same minmax(0) safety applied to the report's per-eye summary card grid).
| v0.1.7 | May 15, 2026 | **Color Vision — clinical accuracy overhaul + OD/OS/OU sequence flow + Ishihara plate placeholders** — major surgical patch of `ColorVisionTest.jsx` (44KB → ~76KB, 769 → 1330 lines) executed in three architectural batches. **Batch A (eye-sequence flow):** clinical color-vision sequence is now OD → OS → OU (three discrete tests — monocular right, monocular left, binocular both), not "OU = test OD then OS." Each test runs forward from the doctor's chosen start eye; transition modals between eye phases include a 3-eye progress diagram (done ✓ / next accent / future dimmed) and patient-positioning copy specific to next eye ("Cover right eye, position left eye"). After the protocol's final eye, a continuation prompt offers "Continue to D-15?" (or Ishihara, vice versa) with "Finish & report" as secondary. `advanceAfterEyePhase()` replaces `advanceAfterProtocol`; archives are now `{ OD, OS, OU }` per protocol. **Batch B (in-test eye picker):** removed the shared OD/OS/OU selector from the Color Vision landing screen entirely; per-card start-eye picker also removed from protocol cards. Test opens defaulted to OD; doctor can override via a new `CV_InlineEyePicker` (3-pill OD/OS/OU) placed in the upper-left of each test's sticky sub-bar. Picker locks once doctor has answered any plate / placed any cap. Eye-sequence breadcrumb (`CV_EyeBreadcrumb` — top-level component) lives in the center of the sub-bar showing done/current/pending/skipped states. **Batch C (D-15 clinical accuracy):** replaced vivid rainbow 15-color cap palette with 16 Munsell V5/C4 sRGB approximations (pilot at index 0 + 15 test caps); near-constant luminance / mid-saturation so sorting requires genuine hue discrimination. Implemented full **Vingrys & King-Smith (1988) moment-of-inertia scoring**: sRGB→Lab conversion (D65), 2×2 second-moment eigendecomposition produces Major Radius / Minor Radius / Confusion Angle / TES / S-index / C-index. `CV_classifyD15()` gates Normal classification on TES + C-index, then assigns Protan/Deutan/Tritan by confusion angle (>+0.7°, +0.7° to −65°, ≤−65°) and Slight/Moderate/Strong by C-index (<1.5 / 1.5–3.0 / >3.0). D-15 standalone Analyze button removed — Finish & Report (green, ExamShell header) runs analysis inline, validates 15 caps placed, then routes to report. **Cumulative report rebuilt as 3-eye:** Patient Classification banner (worst monocular eye drives clinical bottom-line; OU reported separately as binocular function), per-eye Ishihara score cards in a 1–3 column grid, per-eye plate-by-plate tables, per-eye D-15 sections with 6-index V-K-S indices table + 3-zone severity strip (Slight/Moderate/Strong with patient marker at C-index position) + Vingrys & King-Smith reference population table (Normal / Protanopia / Protanomaly / Deuteranopia / Deuteranomaly / Tritan) + new clinical polar diagnostic plot (caps drawn at canonical CIE a*-b* positions, thick polyline traces patient's order from pilot, dashed reference confusion lines for protan/deutan/tritan overlaid) + calibration disclaimer. **Ishihara plates 5–24** (no licensed image) now render a session-stable random 1- or 2-digit number blended into the dot field via SVG `<text>` in the foreground color with faint stroke, plus a tiny "simulated" tag at the corner; the generated number doubles as the plate's `correctAnswer` so the design-testing flow can actually score correctly. Timer hardened to freeze on entry to report AND pause during every transition prompt. D-15 launch icon cropped to just the colorful circle (`assets/d15-icon-circle.png` at 256×256) — text below the logo on the original asset was illegible at 96px. New top-level components: `CV_StartEyePicker`, `CV_InlineEyePicker`, `CV_EyeBreadcrumb` — factored to be lifted into VA/VF/Contrast for the reusable mono-mono-binocular pattern. |
| v0.1.9 | May 21, 2026 | **Wavefront Aberrometry — clinical accuracy overhaul + extraction from `RemainingTests.jsx` + ExamShell integration + first "Doctor sign-off" pattern** — `AberrometerTest` (bundled in `RemainingTests.jsx`, 528 lines) extracted into standalone `components/WavefrontAberrometryTest.jsx` (52KB, ~880 lines) following a synthesized v2 clinical spec (`briefs/WavefrontAberrometry_Clinical_Spec_v2.md`) that supersedes the v1 client prompt. All top-level identifiers prefixed `WFA_`. The alias `const WavefrontAberrometer = AberrometerTest` removed; `index.html` routes both `'aberrometer'` and `'wavefront'` cases to `WavefrontAberrometryTest`. **Architecture:** rebuilt onto canonical `ExamShell` with three-phase flow (`ready` = eye-selection · `testing` = init→calibrating→capturing→complete · `report`). Internal cancel modal and `showCancel` state removed — ExamShell owns Cancel UX. `BEGIN CAPTURE` (sentence-case fix) lives inside the testing-phase `init` substage after the three readiness collapsibles (Patient alignment / Pupil detection / Focus level), separate from ExamShell's `Begin Test` which transitions ready→testing. **Eye-sequence (clinical correction from v2 spec):** OD-first bilateral order (universal medical convention) — the existing code's OS-first default was clinically backwards. When OU is selected, runs OD → OS as two discrete captures with `WFA_TransitionPrompt` (full-screen modal: "Continue to left eye / Reposition the patient…") between them. `WFA_InlineEyePicker` on the ready phase (OD/OS/OU as 3-pill segmented control, eye icons, OS/OD/OU codes); `WFA_EyeBreadcrumb` in the testing sub-bar shows done ✓ / current accent / pending dimmed across bilateral runs. Patterns lifted from CV v0.1.7 and VF v0.1.8 for consistency. **Clinical accuracy corrections:** axis fixed to unsigned 0–180° (was `-1.70`, impossible value); cylinder values made plausible (`OD -0.50 / OS -0.75` — original had cylinder identical to axis, a copy-paste bug); spherical aberration units fixed (μm not mm); measurements averaged corrected to clinical minimum of 3 (was 2); **analysis diameter changed from 4.5 mm to 6.0 mm** — HOAs scale as r⁴ and the "<0.3 μm normal" reference range from the literature applies to a 6 mm pupil; at 4.5 mm the rmsHOA values the v1 prompt called "slightly below normal" would actually read as moderately elevated, breaking the interpretation thresholds. 6.0 mm matches NIDEK OPD-Scan / iDesign / Alcon WaveLight industry default. Patient's actual pupil stays at 6.3 / 6.2 mm. New per-eye data fields: `rmsHOA` (total higher-order aberration RMS) and `comaRMS` (coma is the most clinically significant individual HOA term) — both surfaced as primary summary metrics throughout. **Report rebuilt in CV v0.1.7 / VF v0.1.8 structure:** Patient Classification banner driven by worst-eye HOA RMS (four-band logic: excellent <0.15 / good <0.30 / mildly elevated <0.45 / significantly elevated ≥0.45 μm) with per-eye summary pills · Patient information card with Analysis diameter + Measurements averaged added, hardcoded "Pupil Size: 4.0 mm" field removed (inconsistent with per-eye 6.2/6.3 mm data) · Wavefront analysis results card with view-type **segmented button control** (Pupil image / Centroid image / Full wavefront / Higher orders only) replacing the v1 `<select>` dropdown, eye tabs sentence-case ("Left eye" / "Right eye" / "Both eyes"), Zernike mode toggle, **WFA_ColorScaleLegend** added under the wavefront map (gradient bar with −60 μm / 0 / +60 μm labels — required clinical interpretation aid that was missing), navy table header (`#0e2f5e`) replacing the teal `#0d9488` palette violation, measurement table rebuilt with sentence-case row labels + correct units (D, °, mm, μm) + new rows for Total HOA RMS and Coma RMS · Per-eye Clinical Interpretation cards (1- or 2-column grid) with band-tinted background/border (green/amber/red) · Session notes textarea · Actions row with **first "Doctor sign-off" label** above the primary "Certify & close" button — small 11px label, accent color, check-shield icon — groundwork for the post-beta Roles & Remote Operation pass (CLAUDE.md open scope item). **Zernike mode display fixed:** `Z₄⁰` rendered with proper `<sub>`/`<sup>` tags (replacing the v1 `Z4⁰` flat string); value rendered directly from `sphericalAberration.toFixed(3)` (replacing the buggy `.split('.')[1]` approach that produced clinically meaningless strings). **Capture-complete substage upgraded:** 3-column tile grid showing Sphere / Cylinder / Axis / Total HOA RMS / Coma RMS / Test duration, plus amber clinical flag ("Elevated higher-order aberrations detected.") surfaced automatically when `rmsHOA > 0.30 μm`. **Design-system sweep:** all `linear-gradient(135deg, accent, #155bcc)` instances replaced with solid `accent` backgrounds (matches VF v0.1.8 sweep; no gradients per CLAUDE.md); sentence-case across all buttons (`START TEST` → `Begin Test` via ExamShell, `BEGIN CAPTURE` → `Begin capture`, `EXPORT EXAM` → `Export report`, `COMPARE EXAM` → `Compare`, `Save & Close` → `Certify & close`, `ZERNIKE MODE` → `Zernike mode`, view-type all-caps → sentence case, eye tabs all-caps → sentence case); no-emoji collapsible status pills; Munsell-safe palette throughout. **Doctor sign-off label** (new pattern, this is the first test to surface it): renders above the Certify & close button as `▸ Doctor sign-off` in accent color, 11px, sentence case. Naming chosen to (a) match EHR terminology — Epic/Cerner/NextGen all use "sign-off" — and (b) correctly include both MDs and ODs as authorised users of xoExam. Future state (post-beta Roles pass): when a tech is signed in, label flips to "Awaiting doctor sign-off" and the button disables. v0.1.9 ships visual hint only; enforcement requires the auth/role contract to land. **Engineering handoff additions** (for spec reissue at next clinical-fidelity milestone): real Hartmann-Shack analysis-diameter range supported by the headset firmware, number of frames averaged (configurable / adaptive?), full Zernike coefficient vector availability, and the firmware-emitted color-scale range (we've assumed ±60 μm in the legend; engineering to confirm). Doctor sign-off role gating depends on existing handoff-spec open question #7 (authentication model). |
| v0.2.0 | May 21, 2026 | **Naming convention sweep + dead-entry removal + repository housekeeping (no new clinical content)** — codified the bare-noun naming convention for UI labels: tests in the catalog, launchers, and ExamShell titles drop the redundant "Test" / "Exam" suffix (the surrounding chrome already establishes what they are; the suffix is noun-stutter). Sweep applied per client-approved spreadsheet (`xoExam Test Naming Convention.xlsx`): `Visual Field Exam` → `Visual Field`; `Visual Acuity Exam` → `Visual Acuity`; `Extraocular Motility Exam` → `Extraocular Motility` (not abbreviated to EOM per client direction); `Contrast Sensitivity Exam` → `Contrast Sensitivity`; `Confrontation Exam` → `Confrontation`; `Color Vision Test` → `Color Vision`; `Pupillometry Test` → `Pupillometry`; `Tear Film Test` → `Tear Film`; `Visual Reaction Time Test` → `Visual Reaction Time`; `Eye Tracking Accuracy Test` → `Eye Tracking Accuracy`; `Fixation Stability Test` → `Fixation Stability`; `Binocular Vision Test` → `Binocular Vision`; `Convergence Test` → `Convergence`; `Accommodation Test` → `Accommodation`; `Keratometry Test` → `Keratometry`; `Refraction Test` → `Refraction`; `AI Pattern Recognition Test` → `AI Pattern Recognition`; `Esterman Binocular Functional Test` → `Esterman Binocular` (where it remains as a Visual Field protocol label inside VisualFieldTest). Wavefront Aberrometry was already bare ✓. Files touched: `components/TestSelection.jsx` (catalog rewrite), `components/PatientsPage.jsx` + `components/ManualControlPage.jsx` (launcher names), `components/RemainingTests.jsx` + `components/MotilityAndNeuro.jsx` + `components/ColorVisionTest.jsx` + `components/VisualFieldTest.jsx` (`<ExamShell title=…>` values), `components/PupillometryTest.jsx` + `components/RefractionAndContrast.jsx` (internal headers in not-yet-on-ExamShell tests + canonical Cancel modal copy). **Dead test-catalog entries cleaned up:** `eyes-converging` was a clinical duplicate of Convergence and previously mis-routed to ConfrontationTest (whitescreen-equivalent — wrong test rendered); removed from `TestSelection.jsx` and its phantom routing case removed from `index.html`. `visual-field-estheryman` was previously also mis-routed to ConfrontationTest (Esterman is a Visual Field protocol, not Confrontation); the catalog entry is **retained** and re-routed correctly to `VisualFieldTest` with the Esterman protocol pre-selected via a new `defaultPattern` prop on VisualFieldTest. The launcher now provides a one-click path into the Esterman driving-fitness binocular field test, skipping the eye-selection and pattern-selection sub-steps (which are unnecessary for binocular-by-design protocols). Doctors retain the alternative path of selecting Visual Field → Esterman from the pattern step. Catalog count = 19 tests (down from 20 — only the genuinely-dead `eyes-converging` duplicate was dropped). **`defaultPattern` prop added to VisualFieldTest** for direct-launch routing of any pattern (currently used for Esterman; available for future direct-launch entries). For binocular patterns the effect sets `protocolEye='OU'` and skips to `vfStep='foveal'`; for monocular patterns it pre-selects the pattern but leaves the doctor on eye-selection to pick OD / OS / both. **Stale code-comment cleanup:** `RemainingTests.jsx` header comment updated — "Aberrometer, Wavefront" removed (extracted in v0.1.9), bare-noun naming sweep applied to remaining test list. **Document & deployment hygiene:** `index.html` title bumped to v0.2.0; `deploy.html` version label bumped to v0.2.0; CLAUDE.md Development Rule #0 codifies the bare-noun convention so future tests follow it; `_dist_v0.2.0/` deployment package built. Test stream status table updated to reflect Ocular Motility → v0.2.1 and Pupillometry → v0.2.2 (shifted back one release each since v0.2.0 was consumed by housekeeping rather than a clinical-fidelity test). **Not in this release** (per CLAUDE.md cadence rule): no Engineering Handoff Specification reissue and no per-release brief docx — those reissue at clinical-fidelity milestones only. CLAUDE.md (this file) and README.md update in place. Next clinical-fidelity milestone (v0.2.1, Ocular Motility) will get the full doc reissue. |
| v0.2.1 | May 22, 2026 | **Extraocular Motility — clinical accuracy overhaul + extraction from `MotilityAndNeuro.jsx` + ExamShell integration + sub-step state machine** — `ExtraocularMotilityTest` (bundled in `MotilityAndNeuro.jsx`, 186 lines including helpers) extracted into standalone `components/ExtraocularMotilityTest.jsx` (~57KB, ~1140 lines) following a synthesized v2 clinical spec (`briefs/ExtraocularMotility_Clinical_Spec_v2.md`) that supersedes the v1 client prompt. All top-level identifiers prefixed `EOM_`. `VisualReactionTimeTest`, `EyeTrackingAccuracyTest`, `AIPatternRecognitionTest` stay in `MotilityAndNeuro.jsx` (not in beta scope). `MotilityAndNeuro.jsx` window export updated to drop `ExtraocularMotilityTest`. **Architecture:** rebuilt onto canonical `ExamShell` with three-phase flow (`ready` = setup + sub-test config · `testing` = sub-step state machine · `report`). The testing phase has its own internal state machine (`versions → pursuit → saccades → [ductions-OD → ductions-OS]`) because EOM is uniquely structured among xoExam tests — it's not a single uniform measurement but a sequence of clinically distinct sub-tests, each with its own UI. ExamShell's green Finish & Report button enables only at the final enabled sub-step's completion state (computed by `computeNextStep()` + `finishAvailable()` helpers). Internal cancel modal removed — ExamShell owns Cancel UX. **Clinical accuracy corrections (3 major + 2 design-decision reconciliations):** (1) Grading scale 1–5 → **international standard 0 to ±4** — current 1–5 was clinically wrong; doctors don't recognize "5/5" as a valid EOM finding. 0 = normal (default-selected, green), -1 to -4 = underaction (amber→red gradient), +1 to +3 = overaction (blue-purple). Color coding per `EOM_getGradeInfo()`. (2) 8 directions → **9 cardinal positions including primary gaze** — primary gaze (center) is where tropia/phoria assessment happens; legacy implementation missed it entirely. (3) **Primary + secondary muscle/CN mapping per position** — the v1 prompt's single-muscle simplification would have missed CN IV (trochlear) palsy, which is classically detected at down-and-in gaze (down-right tests R inferior rectus / CN III primarily but also L superior oblique / CN IV; down-left tests L inferior rectus / CN III but also R superior oblique / CN IV). Each `EOM_POSITIONS` entry now carries both. CN IV detection is preserved in the Versions Results table and the testing-phase position label. (4) Catalog/ExamShell naming reconciled to v0.2.0 bare-noun convention — v1 prompt suggested "Ocular Motility & Tracking" (title case + suffix) for catalog and "Extraocular motility" (lowercase) for ExamShell, both conflicting with codified rules. Kept as **"Extraocular Motility"** (bare, title case) throughout. (5) Eye refs converted from legacy `'left'`/`'right'` to **OD/OS** per universal medical convention established in VA/CV/VF/WFA. **Sub-tests added:** Versions (binocular, 9 positions, required). Smooth Pursuit (single-screen, 4-option segmented — Normal / Mildly reduced / Markedly reduced / Absent). Saccades (single-screen, 4-option — Normal / Prolonged latency / Hypometric / Hypermetric). Ductions (per-eye monocular with fellow eye occluded, OD-first then OS, auto-enables when any version grade ≠ 0 OR doctor manually toggles at setup). **EOM_HPatternDiagram component** — clinical-standard H-pattern motility diagram with 9 position nodes connected by H-shape lines, color-coded per grade, active position highlighted with accent ring during testing. Occluded-eye indicator chip on the diagram for ductions runs. Used in three places: ready-phase preview (dim/unscored), testing right-sidebar mini (live progress), report (large + per-eye duction diagrams if run). **EOM_GradeSelector component** — row of 8 buttons (-4, -3, -2, -1, 0, +1, +2, +3) with per-grade color and severity labels (Mild / Moderate / Marked / No mvmt / Mild OA / Mod OA / Marked OA). 0 pre-selected per clinical convention. ≥52px tall per touch target rule. **Report rebuilt in CV v0.1.7 / VF v0.1.8 / WFA v0.1.9 structure:** Patient Classification banner driven by `EOM_getInterp()` (severity tiers: normal / mild / significant; logic distinguishes isolated single-muscle underaction → CN palsy pattern, multiple underactions → possible INO/complex palsy, overaction-only, versions-full-but-pursuit/saccades-abnormal) with per-test summary pills on the right (Versions worst grade · Pursuit · Saccades) · CN palsy clinical flag (conditional, prominent red surface with SVG warning icon, surfaces at any single position grade ≤ -3 with full position/muscle/CN details and neurological referral copy) · Patient information card (8-field 4-column grid including Tests performed list) · Motility Diagram card (large H-pattern for Versions binocular; if ductions ran, additional OD and OS duction diagrams side-by-side, each with occluded-eye indicator) · Versions Results table with navy header (#0e2f5e) and 7 columns (Position · Primary muscle · Primary CN · Secondary muscle · Secondary CN · Grade · Interpretation) — color-coded grade pills · Pursuit + Saccades two-up summary cards · Session notes textarea · Actions row with **Doctor sign-off** label above primary Certify & close button (v0.1.9 pattern, now standard on every clinical-fidelity test). **Design-system sweep:** all legacy `linear-gradient(135deg, accent, #155bcc)` instances replaced with solid `accent` backgrounds (matches VF/WFA conventions); emoji removed (v1 prompt had ⚠️ in CN flag — replaced with SVG warning icon per design system); sentence-case across all buttons (`Begin test`, `Next position →`, `Finish & report →`, `Certify & close`, `Export report`, `Compare`); no off-palette colors. **Engineering handoff additions** (for Handoff Spec v0.2.1 §12): headset gaze-tracking data shape during versions (firmware emits per-eye vector or pre-computed underaction estimate?), smooth pursuit metrics (firmware-computed gain/catch-up count, or pure doctor observation?), saccade latency in ms (firmware-measured?), confirmation that the patient response clicker is not used in EOM. **Rollback path:** `_dist_v0.2.0/` retained as the canonical pre-v0.2.1 snapshot per the codified document versioning rule — copy back from there if rollback is ever needed. Five-minute file-copy operation. |
| v0.2.2 | May 22, 2026 | **Housekeeping pass — dev "← Login" affordance removed + UI dead-ends audit + Clinical Standards Reference document created** — three concurrent items rolled into one release. (1) **"← Login" dev nav button removed** from `components/DashboardShell.jsx` header chrome and its global `window.__xoGoToLogin` hook removed from `index.html`. This was a development affordance left over from early prototype navigation; redundant with the two proper sign-out paths already in place (sidebar bottom "Sign out" button at DashboardShell line 316 + avatar/notification dropdown "Sign out" menu item at line 192 — both call `onLogout` which routes back to login). CLAUDE.md's "Remove '← Login' dev navigation button before handoff" todo is now satisfied. (2) **UI dead-ends audit completed.** Methodical grep + read pass across all 25+ components and `index.html` routing. Findings: routing is solid — both the `renderTestComponent` switch (index.html:304) and the App-level section switch (index.html:359) have default-case fallbacks that prevent whitescreens for unknown route IDs. Phantom routes were already cleaned in v0.2.0 (`eyes-converging` removed; `visual-field-estheryman` rerouted to VisualFieldTest with Esterman pre-selected via the `defaultPattern` prop). All modals checked have proper close mechanisms — ExamShell cancel modal (Escape key + backdrop click + Continue button + autofocus), VisualFieldTest config modal (backdrop click + close button), ColorVisionTest transition modals (Continue button), WavefrontAberrometryTest transition modal (Continue button), DevicesPage detail modal (backdrop click + setSelected(null)), PatientsPage add-patient modal (setShowAddForm(false) via onNavigate), DeviceConnectionManager pairing modal (backdrop click + onClose). All Add forms (AddPatient, AddDevice) have both submit and back-arrow paths. Manual Control language menu closes on selection. No empty `onClick={() => {}}` handlers found in live code. **No actionable dead-ends found.** This pass confirms the prototype's navigation safety net is intact. (3) **xoExam Clinical Standards Reference v0.2.2** — new document type, complementary to the Engineering Handoff Specification. Where the handoff spec is for MPR (engineering), this document is for the clinical evaluation team (optometrists, ophthalmologists, technicians, regulatory reviewers). For each of the five clinically-faithful tests (VA, CV, VF, WFA, EOM), the doc lists the published reference standard, what's implemented (specific clinical conventions visible in the UI), and open clinical questions still pending engineering or clinical decision. Cross-cutting conventions section covers OD/OS eye reference, Doctor sign-off, Cancel UX, bare-noun test naming, RAG palette use, session notes, patient identity confirmation. Visual-placeholder tests (14 of them) are explicitly flagged at the end so the evaluation team knows what is NOT at clinical fidelity yet. Saved as `xoExam Clinical Standards Reference.md` (project root, living doc, updated each clinical-fidelity milestone) AND `xoExam Clinical Standards Reference v0.2.2.docx` (versioned, per the document versioning rule). Both ship in `_dist_v0.2.2/`. **Not in this release** (per cadence): no Engineering Handoff Specification reissue (clinical-fidelity milestones only — last was v0.2.1; next will be v0.2.3 VA backfill). Title bump (`index.html` → v0.2.2, `deploy.html` → v0.2.2). Test stream status table updates: VA flagged for v0.2.3 spec backfill, UI dead-ends audit logged as complete. README.md updated to reflect v0.2.2 status. |
| v0.2.3 | May 22, 2026 | **Visual Acuity v2 spec backfill + clinical-accuracy edits + Clinical Standards Reference update** — VA reached "clinical fidelity" in v0.1.4 but pre-dated the formal spec format and carried a couple of clinically-arbitrary defaults. v0.2.3 backfills the v2 spec and lands the high-priority clinical corrections. **briefs/VisualAcuity_Clinical_Spec_v2.md written** documenting: LogMAR notation alongside Snellen; ETDRS chart conventions (5-letter lines, 0.1 logMAR steps, Sloan 10 letter set, Bailey-Lovie crowding, letter-by-letter scoring); pinhole occluder workflow; near-vision J-notation mode; pediatric LEA symbols; corrected line-pass threshold (clinical convention is "more than half correct," not the arbitrary 65% the legacy implementation used). **Code edits applied to `components/VisualAcuityTest.jsx`:** (1) Added `VA_SLOAN_10` constant — the ETDRS standard 10-letter set (C, D, H, K, N, O, R, S, V, Z) for use in ETDRS-style scoring. (2) Added `VA_snellenToLogMAR()` conversion helper — `logMAR = log10(denominator/20)` for any `20/x` Snellen value; 20/200→1.00, 20/20→0.00, 20/10→−0.30. (3) Added `VA_formatLogMAR()` 2-decimal display formatter. (4) Added `VA_lineIsPassed(correct, total)` clinical-threshold helper — replaces the arbitrary 65% rule with the published convention "more than half correct" (3+ on a 5-letter line, 5+ on an 8-letter line). Applied at three sites: `getBestVA()` line-search, the auto-advance trigger in `toggleLetter()`, and the per-eye results table's pass/fail column in the report. (5) Added `VA_getInterp(bestSnellen)` severity-band derivation — Hodapp/AAO-style clinical convention applied to distance VA (Normal ≤20/20, Mild 20/25–20/40, Moderate 20/50–20/100, Significant ≥20/200) for the Patient Classification banner. (6) Per-eye result card now surfaces LogMAR alongside Snellen — Snellen retained as the primary large display, logMAR shown immediately below in muted style for documentation and trend analysis. **Open clinical questions** flagged in spec §E for engineering: real headset distance calibration (20 ft / 6 m simulated by optics?), pinhole hardware mechanism (physical insert / digital mask / external card?), near-vision optical path fidelity (40 cm), licensed pediatric LEA Symbol Chart assets, ETDRS letter-level response timing from firmware. **Clinical Standards Reference doc updated:** §1 (Visual Acuity) rewritten to reflect v0.2.3 clinical fidelity — LogMAR conversion shown, Sloan 10 helper documented, corrected threshold called out, Patient Classification banner described, Doctor sign-off parity confirmed. Visual Acuity removed from the "pending backfill" footnote. Scope-of-fidelity table at top updated from v0.2.2 to v0.2.3. **Scope intentionally limited** for this release: the v2 spec describes the full clinical surface (ETDRS chart layout, pediatric LEA symbol rendering, pinhole occluder workflow, near-vision mode), but v0.2.3 ships the high-priority clinical-accuracy backfill only — LogMAR display, corrected threshold, Sloan 10 helper, classification helper, conversion utilities. The remaining surface (full ETDRS rendering with Bailey-Lovie crowding, LEA symbol SVGs, pinhole UI affordance, J-notation near mode) is scoped for a follow-on visual pass once the open clinical questions are confirmed with Xenon engineering. **Not in this release** (cadence note): no Engineering Handoff Specification reissue — the open-decisions list for VA is captured in the v2 spec md and will be folded into the next reissue (v0.2.4 or v0.2.5 alongside Pupillometry). No per-release brief docx; CLAUDE.md and the Clinical Standards Reference capture this release. Title bumps applied (`index.html` v0.2.3, `deploy.html` v0.2.3). `_dist_v0.2.3/` built. |

| v0.2.5 | May 22, 2026 | **Pupillometry — clinical accuracy overhaul + ExamShell integration + sub-step state machine + beta-scope CLOSED** — `PupillometryTest.jsx` rebuilt in place from a 237-line static-only sketch into a ~1100-line clinical-fidelity component following the v2 spec (`briefs/Pupillometry_Clinical_Spec_v2.md`). All top-level identifiers prefixed `PUP_`. **Architecture:** wrapped in canonical `ExamShell` with three-phase flow (`ready` = eye-mode + sub-test config + patient age input · `testing` = sub-step state machine · `report`). The testing phase has a three-stage state machine (`static → dynamic → swinging`) where static and dynamic each iterate the OD-first bilateral eye sequence with full-screen `PUP_TransitionPrompt` between eyes; swinging runs as a single screen with alternating-stimulus animation and per-eye RAPD graders. `finishAvailable()` enables ExamShell's green Finish & Report button only at the last enabled sub-step's completion state (matches EOM v0.2.1 / WFA v0.1.9 pattern). Internal cancel modal removed — ExamShell owns Cancel UX (back arrow hidden during testing, labeled red Cancel test button takes over). **Clinical-accuracy additions (5 major):** (1) **Age-banded reference range** — patient age input on the setup screen drives a Winn et al. 1994 lookup table (six age bands × three light conditions, mean ± 1 SD diameter). Captured values flag (`↯` icon, red text) when outside the age-band range, both in the testing sub-bar tiles and in the report's Static measurements table. Full Winn table surfaces in the report's Age-banded reference values card with the patient's band highlighted in accent. (2) **Anisocoria interpretation upgraded** from the legacy `>1mm = significant` single-condition rule to the clinically-correct light-vs-dark differential. The report's Static measurements table now has dedicated Anisocoria columns per light condition (color-coded green/amber/red per severity band) plus a dedicated bottom row showing |aniso(dark) − aniso(light)| with `≥ 0.3 mm = pathological pattern` annotation. The Patient Classification banner's interpretation logic (`PUP_getInterp`) and pattern-flag logic (`PUP_getClinicalFlag`) both consume the differential to distinguish sympathetic (Horner's, worse-in-dark) from parasympathetic (CN III, Adie's, worse-in-light) patterns. (3) **Dynamic pupillary light reflex** sub-test added — net new clinical content. `PUP_LightReflexChart` SVG renders a piecewise-modelled time-course curve (3-second window, stimulus marker, baseline reference dashed line, peak-constriction annotation). Six summary metric tiles (baseline / min / constriction % / latency / constriction velocity / T75 redilation) surfaced from a simulated `PUP_simulateDynamics` model — production firmware will emit the real time-series. (4) **NPi (Neurological Pupil index)** composite — net new clinical metric. `PUP_computeNPi` produces a 0–5 score from the dynamic shape; `PUP_npiSeverity` thresholds per NeurOptics NPi-200 reference (≥ 3.0 normal / 2.5–3.0 borderline / < 2.5 abnormal). Surfaced per eye in the dynamic sub-test as a prominent severity-tinted tile and again in the report's Dynamic measurements card. (5) **Swinging flashlight (RAPD) sub-test added** — net new clinical content. `PUP_SwingingScreen` runs an alternating-stimulus animation across two iris viewers (3-second dwell, configurable via the Start/Pause stimulus button); each eye gets its own 6-option grade selector (None / Trace / 1+ / 2+ / 3+ / 4+) with descriptive copy. **Patient Classification banner** with worst-finding-drives-bottom-line severity (normal / mild / significant) + per-finding summary pills (anisocoria · NPi per eye · RAPD). **Four-pattern clinical flag system** in the report — sympathetic Horner's, parasympathetic CN III/Adie's, optic-nerve RAPD ≥ 1+, neurological NPi < 2.5 — each emitting its own labeled red-surface flag with specific differential and referral copy. **Clinical Interpretation card** with severity tint + finding-by-finding bullet list (each age-banded deviation, each pathological anisocoria pattern, each NPi finding, each RAPD finding enumerated). **Visual sweep:** legacy dark-themed action chrome replaced with the canonical light-theme convention (iris viewer itself stays dark — clinically appropriate for the dim headset interior); `linear-gradient(135deg,accent,#155bcc)` Begin Test button replaced with solid accent; vivid purple/blue/amber light-level pills replaced with brand-palette segmented control (severity coding doesn't apply to light conditions — scotopic isn't "purple severity"); emoji-style `⚠ Significant` / `✓ Normal` indicators replaced with SVG icons throughout; "Save Results" / "Print Report" action buttons replaced with the canonical "Export report" / "Compare" / "Certify & close" trio; Doctor sign-off label above Certify & close (v0.1.9 pattern). **Sentence-case sweep.** **OD-first bilateral sequence** (was OD-first by coincidence; now explicit). **Beta scope CLOSED** — Pupillometry is the sixth and final beta-scope test; six of nineteen tests are now at clinical fidelity. The remaining thirteen tests are visual-fidelity placeholders awaiting their own clinical rebuilds in post-beta releases. **Clinical Evaluation Brief + Clinical Standards Reference + Engineering Handoff Spec all reissued at v0.2.5.** |
| v0.2.6 | Jun 2, 2026 | **Wavefront Refraction — new two-stage refraction test (post-beta, CD-prioritized ahead of all other v0.2.5-review feedback)** — `components/WavefrontRefractionTest.jsx` (1381 lines, all identifiers `WFR_` prefixed) added as a NEW parallel test (`id: wavefront-refraction`, surfaced in TestSelection under Refraction, routed in index.html). **Supersedes but does NOT remove `WavefrontAberrometryTest.jsx`** — per CD direction the aberrometry test stays in the catalog and codebase; Wavefront Refraction is built from a copy of it + RefractionTest's live eye-scan + VisualAcuity's chart. This is the combined replacement for the traditional two-instrument refraction workflow (autorefractor → wavefront capture; phoropter → liquid-lens digital phoropter) and is the most clinically important test in the suite — its certified Rx is the gate that releases the job object to the downstream xoFit fitting/finishing flow. **Architecture:** four-phase flow `entry → objective → subjective → report` mapped onto ExamShell's `ready/testing/report` contract (ExamShell owns Cancel UX). entry = two-card selector (Full refraction / Subjective only). objective = monocular OD→OS wavefront capture with RefractionTest's live eye-scan look (dark viewer, breathing pupil, accent sweep line, rotating centering ring, red alignment dot that turns the backdrop green on lock) — NOT the aberrometry circular-progress, per Zeshan's explicit direction. subjective = liquid-lens phoropter step sequence `setup → sphere(MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add` (mpmva2 auto-triggers if cyl changed ≥ 0.50 D or axis ≥ 10°). **Clinical non-negotiables baked in:** axis-before-power JCC enforced by step order; +0.75 D fogging prompt after objective; sphere-compensation note during cyl power; signed-2dp Rx discipline (`WFR_fmtSph/Cyl/Axis/Add`); monocular objective (no OU averaging); Certify & close framed as the Rx-certification SYSTEM EVENT (Rx not released downstream until certified); scan-count documentation per eye (1–3); and — a deliberate divergence from the other clinical-fidelity tests — NO clinical claims / NO Patient Classification banner (a refraction is measurement-and-verification, not screening: “we cannot claim any of that”). Optotype selector (Letters / Tumbling E / Tumbling C) drawn as geometric SVG via `WFR_Optotype`, shared with the standalone VA test (Tumbling C added there as a 4th chart type in this pass). Report: Final Prescription hero (2px accent border, signed Rx + ADD + BCVA per eye) + Objective/Subjective two-box + Wavefront analysis (vertical view rail, 3mm/5mm ring overlay toggle, “+” zoom-scope, color-scale legend) + data-only Clinical Summary + Doctor sign-off above Certify & close. Spec: `briefs/WavefrontRefraction_Clinical_Spec_v1.md` (supersedes the v0 prompt). **OPEN / TBD:** `WFR_lineIsPassed` 50% pass threshold (Gary to validate vs published standard); Certify→system-event wiring (MPR); patient-facing headset/clicker view explicitly out of scope (tablet view only). **JCC axis refinement** uses three step sizes (±1°/±5°/±15°) so the doctor reduces the step after each reversal; **image sharpness** in the objective Patient-focus panel is a doctor yes/no readiness control (confirms the device image is sharp enough to capture — independent of subjective fogging). **Full doc set reissued at v0.2.6** in one pass (rule 14): Engineering Handoff Spec, both Development Briefs (per-release + cumulative), Clinical Standards Reference, Clinical Evaluation Brief, this file, README, deploy.html, and _dist_v0.2.6/. |

| v0.2.7 | Jun 8, 2026 | **Wavefront Refraction — six competitive-parity enhancements merged into the single production component + v2 fork eliminated** — the six CD-approved enhancements that had been built in a parallel draft (`WavefrontRefractionTest v2.jsx` / `WavefrontRefractionTestV2`) were folded **directly into production `components/WavefrontRefractionTest.jsx`** (component renamed back to `WavefrontRefractionTest`, all `WFR_` prefixes intact, ~2280 lines). The fork file `components/WavefrontRefractionTest v2.jsx` + its harness `Wavefront Refraction v2 Demo.html` + the standalone `wfr-v2-demo/` build were **deleted** — one file, one source of truth (CD direction: a parallel file is a versioning hazard). The shell already imported `WavefrontRefractionTest.jsx` and rendered `<WavefrontRefractionTest/>`, so the enhanced flow is now live inside the full app with no routing change. **The six enhancements now in production:** (1) PSF + simulated-VA before/after; (2) binocular balance step (fogging/alternate occlusion, no prism); (3) multi-source Rx comparison (objective/subjective/habitual/unaided + SE deltas); (4) photopic-vs-mesopic day-&-night with Diff row; (5) Smart-Cylinder auto-bracketing on the JCC; (6) refraction progression tracker. Report restructured into tabs. **Doctor-led preserved** — no Patient Classification banner, reference data only. **Reversibility kept in-file:** all Reehana-gated values isolated in named constants at the top (`WFR_ANALYSIS_DIA` 4.0 mm confirmed · `WFR_SIXMM_PROVISIONAL` flag for the provisional 6 mm columns · `WFR_ZERNIKE_MAX_ORDER`/`WFR_ZERNIKE_MODES` 10/66 · `WFR_VERTEX_MM` 25–30 not final · `WFR_SPHERE_RANGE`/`WFR_CYL_RANGE` placeholders) — if Q3/Q7/Q8 come back different, edit the constants / flip the flag, no rebuild. **Doc set brought current together (rule 14):** CLAUDE.md, README.md, Engineering Handoff Specification v0.2.7, Development Brief 06-08-2026 v0.2.7, Clinical Standards Reference v0.2.7, Clinical Evaluation Brief, `briefs/WavefrontRefraction_Clinical_Spec_v2.md`, version strings in index.html + deploy.html + deploy-new-site.html, and the `_dist_v0.2.7/` package. **Framing (rule 13):** program remains pre-beta active development pending MPR + Xenon CMO + doctor-panel feedback; v0.2.7 is the integration version, not a finished milestone. |
