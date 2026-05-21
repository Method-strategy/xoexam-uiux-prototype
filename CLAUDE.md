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
| `VisualAcuityTest.jsx` | Snellen chart test UI |
| `PupillometryTest.jsx` | Pupil size/response test UI |
| `ColorVisionTest.jsx` | Ishihara plates + D-15 Farnsworth (single file, four phases inside ExamShell) |
| `VisualFieldTest.jsx` | Peripheral vision mapping UI |
| `RefractionAndContrast.jsx` | Refraction + contrast sensitivity tests |
| `MotilityAndNeuro.jsx` | Extraocular motility + neuro tests |
| `RemainingTests.jsx` | Remaining test modules (accommodation, convergence, etc.) |
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

| # | Test | File | Status |
|---|---|---|---|
| 02 | Visual Acuity | `VisualAcuityTest.jsx` standalone | ✅ v3 complete · report label fix pending |
| 03 | Color Vision | `ColorVisionTest.jsx` standalone | ✅ v1 complete · refactored in-place onto ExamShell with CV_ prefixes, D15 folded in, OD/OS/OU eye selector lifted above protocol cards, 3×4 number pad, session notes sidebar, AAO-style band naming (Normal/Borderline/Deficiency Detected), VA-style report with Clinical Interpretation card |
| 04 | Visual Fields | `VisualFieldTest.jsx` standalone | ✅ v0.1.8 complete · rebuilt in-place onto ExamShell with VF_ prefixes, six-phase flow collapsed to ready/testing/report (eye-selection/config/pattern/foveal sub-steps under `ready`), OD→OS sequence for bilateral monocular protocols (single OU for binocular by-design protocols), GHT category pill + clinical override rule, Total Deviation + Pattern Deviation probability plots, age-banded reference MD table, reliability rebanding (FP/FN/FL with green/amber/red per Standard / Strict preset), pattern-specific point counts, Goldmann spelling sweep, sentence-case sweep, Certify & close, lens stepper to 36px, session notes sidebar, foveal threshold per-eye with on-grid annotation |
| 05 | Wavefront Aberrometry | `WavefrontAberrometryTest.jsx` standalone | ✅ v0.1.9 complete · extracted from `RemainingTests.jsx` into standalone file with WFA_ prefixes · rebuilt onto ExamShell with three-phase flow + canonical Cancel UX · OD-first bilateral sequence with `WFA_InlineEyePicker` / `WFA_EyeBreadcrumb` / `WFA_TransitionPrompt` (pattern lifted from CV v0.1.7 / VF v0.1.8) · analysis diameter corrected to 6.0 mm so rmsHOA values + interpretation thresholds match published 6mm-pupil norms · clinical interpretation card with four-band logic (excellent <0.15 / good <0.30 / mild <0.45 / significant ≥0.45 μm) · per-eye Patient Classification banner driven by worst-eye HOA RMS · Total HOA RMS + Coma RMS surfaced as primary summary metrics · elevated-HOA amber flag at >0.30 μm · view-type segmented control replacing the `<select>` dropdown · color-scale legend added under the wavefront map · navy table header replacing teal palette violation · Zernike Z₄⁰ proper subscript/superscript notation · axis fixed to unsigned 0–180° · spherical aberration units corrected to μm · introduced first "Doctor sign-off" label above Certify & close (groundwork for post-beta Roles & Remote Operation pass) · sentence-case sweep · solid accent backgrounds replacing the gradient pattern · spec saved as `briefs/WavefrontAberrometry_Clinical_Spec_v2.md` superseding the v1 prompt |
| 06 | Ocular Motility | extract from `MotilityAndNeuro.jsx` → `OcularMotilityTest.jsx` | ⬜ needs assessment + extraction |
| 07 | Pupillometry | `PupillometryTest.jsx` standalone | ⬜ needs assessment |
| 08+ | Accommodation, Binocular Vision, Convergence, Keratometry, Tear Film, Visual Reaction Time, Eye Tracking, Fixation Stability, AI Pattern Recognition, Confrontation | bundled | ⬜ deferred until priority 6 complete |

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
| `xoExam UI-UX Engineering Handoff Specification vX.Y.Z.docx` | **Master handoff spec** — engineering integration touchpoints, TBD agenda, regulatory ack, design system reference | Reissue at each beta-test fidelity milestone (v0.1.8, v0.1.9, v0.2.0, etc.) — supersedes prior versions |
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
