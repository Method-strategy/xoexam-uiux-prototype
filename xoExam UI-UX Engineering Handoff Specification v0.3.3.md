# xoExam™ UI/UX — Engineering Handoff Specification
## v0.3.3 · October 13, 2026 · Objective & Subjective Refraction — binocular alignment, near vision, refraction-flow branching

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## 0. What changed in v0.3.3 — accurate change log

All changes are inside `components/ObjectiveSubjectiveRefractionTest.jsx`. No other test was modified; `WavefrontRefractionTest.jsx` remains untouched; the count of tests at clinical fidelity is unchanged (7 of 19). Sources: a client-provided remote-console model (reviewed for missing **functionality** only, not design) and Indiana University *Clinical Refraction in Eye Care*, ch. 3 "The Flow of Refraction".

### Binocular — Balance | Alignment · prism
1. **Two modes.** Balance answers *equal clarity*; Alignment answers *ocular alignment*. Kept separate deliberately — the reference model conflated them.
2. **Balance dissociation:** alternate occlusion, or **per-eye split** (OD top line, OS bottom).
3. **Digital prism:** per eye, BI/BO/BU/BD in 0.25 / 0.5 / 1Δ steps; Split OU (divides net horizontal and vertical prism evenly between eyes, 0.25Δ rounding); Clear. State `prism = { OD:{h,v}, OS:{h,v} }` with **h > 0 = BO, h < 0 = BI, v > 0 = BU, v < 0 = BD**.
4. **Live separation:** patient-perceived image separation in Δ and cm at the simulated 6 m (1Δ = 1 cm/m); turns to "Aligned" at < 0.13Δ.
5. **Targets:** Cross · Chart (the selected Snellen / Tumbling E / Landolt C, doubled per eye) · Fusion dot. Cross and Chart record **dissociated**; Fusion dot records **associated** (fusion-locked, nonius).
6. **Prism in the prescription:** shown in each eye-card header with a **Meas./Rx** toggle. Default is measurement-only; it enters the final Rx only when the clinician elects to prescribe (doctor-led).
7. **Base-direction mirroring — MPR must follow `OSR_prismRenderOffset`.** The image shifts toward the prism apex; BI is nasal so the apex is temporal — +x for OD, −x for OS. The same BI moves the two eyes' images in **opposite** screen directions; BU/BD are not mirrored. Perceived position = render offset − ocular deviation (exo → crossed diplopia; right hyper → OD image lower).

### Near — Add | Near acuity | Range
8. **Add:** linked OU by default (unlink for a deliberate difference; unequal adds raise a prompt back to Balance); **distance Rx locked** while on Near (one-tap unlock); near Rx per eye (sphere + add); working distance 25/33/40/50 cm shown with inches; age-expected add with Apply.
9. **Near acuity:** recorded per OU/OD/OS as Snellen-equivalent with **M-units** at the working distance; contrast (high/low) and lighting (photopic/mesopic) recorded; target is Reading text (replaces Duochrome in the target slot at near) or the selected chart at near size.
10. **Convergence:** each eye's image converged for the working distance — total demand Δ = PD(cm) / (working distance + 2.7 cm)(m); near PD = PD × WD / (WD + 27 mm). Distance PD arrives from the objective scan via MPR (demo value 64 mm).
11. **Range of clear vision:** NRA / PRA steppers; **Center add** applies (NRA + PRA)/2, rounded to 0.25 D.

### Refraction-flow branching (IU ch. 3)
12. **JCC entry by starting cylinder** (`OSR_jccEntryStep`): > 0.50 D → **axis first**; ≤ 0.50 D → **power first** (confirm the cylinder is real); none → **Probe**. Probe | Axis | Power remains an override.
13. **Probe mode** (`jcc-probe`): JCC at 180 / 90 / 45 / 135° with Flip; "Cylinder found at X° → axis" seeds −0.25 D at that axis and hands to axis refinement; "No cylinder found" records and ends.
14. **Second MPMVA cue:** "Not needed · JCC unchanged" when JCC altered neither cylinder power nor axis (per-eye snapshot `jccEntryRef` at first JCC entry). Button remains available.
15. **Near cue:** "Age N · not typically indicated" under 40, suppressed when pseudophakic. Never blocks.

### Report
16. New **Near & binocular findings** card: working distance, near Rx, near acuity (M-units), near conditions, range of clear vision, near PD, balance method, measured prism + method, prescribed yes/no. Final Rx carries prism only when prescribed.

### Alignment usability (same release)
17. **Alignment indicator.** On fusion the in-tool preview and Peek view turn green (border, tint, ring); the red/blue targets collapse into one dark target; the separation readout sits in the preview caption and reads "✓ Aligned".
18. **Base pad.** The BI/BO/BU/BD row is replaced by a cross pad — Up / Down top and bottom, In / Out left and right with arrows, "Base · OD/OS" in the center. **Mirrored per eye so In always points nasal** (OD → In on the left, OS → In on the right). The prism-eye toggle moved to the tool header ("Prism on OD | OS"). Right-panel spacing tightened; alignment with Peek open measures exactly 656 / 656px.

### Objective capture (same release)
19. **Objective scan count — 3 or 5** (Zeshan / Steve; hardware confirmed). Pre-capture "Scans per eye" selector, default 3. Readings are **averaged in power-vector space** (M, J0, J45 → sphere / cylinder / axis) — averaging raw axis fails across 0°/180°. A reading more than **1.00 D** from the median sphere or cylinder (blink, fixation loss, accommodative lapse) is **rejected and retaken automatically**, so the selected count of good scans is always reached. After capture the scan-to-scan **spread (SD)** for sphere and cylinder is shown and flagged at > 0.25 D as a measurement, not a verdict; **Take 2 more · average 5** extends a 3-scan capture without restarting. Scans averaged, rejected count and spread are recorded in the measurement table and clinical summary. **MPR:** the averaging and rejection logic lives in `OSR_runScans` / `OSR_toPV` / `OSR_fromPV`.

### Hardware (open)
Digital prism, per-eye split and convergence assume **independent per-eye displays with a calibrated pixels-per-degree figure** (1Δ ≈ 0.573°). Open with Steve. The on-screen confirmation chip is suppressed at CD direction (`OSR_PER_EYE_DISPLAY_CONFIRMED = true`); flip to `false` to restore it. Eye-tracking (Neurolens-style) remains a later objective cross-check.

### Verification
Every console state measured at **≤ 631px against 656px available** at 1280×800 with the sidebar open.

### Not built
Intermediate distance (60–70 cm) — held for xoFit.

---

## 0c. What changed in v0.3.2 — accurate change log

The v0.3.1 console **structure** is unchanged. v0.3.2 corrects the subjective **protocol** it runs, checked against the Westmead Eye Manual §8.2 (Sim / Yun / Catt / Fung). All changes are inside `components/ObjectiveSubjectiveRefractionTest.jsx`. No other test was modified; `WavefrontRefractionTest.jsx` remains untouched; the count of tests at clinical fidelity is unchanged.

The eight corrections and the resulting hardware requirement are specified in **§7a Clinical-protocol alignment** and **§7b Liquid-lens transition requirement** below. In summary:

1. Age-branched sphere protocol (`patientAge`, `pseudophakic`, `OSR_noAccom`) — direct comparison at 60+/pseudophakic, fogging protocol below 60 with +0.50 D / −0.25 D asymmetry.
2. JCC fixation target is a round "O" two lines above best acuity.
3. Separate cross-cylinder magnitudes: `jccPowerAxis` (higher, 0.50 D) and `jccPowerFine` (lower, 0.25 D).
4. Handle-vs-axis JCC alignment now depicted and labeled.
5. Sphere compensation applied via `OSR_adjustCyl` — 0.25 D per 0.50 D cylinder, accumulating, toggleable.
6. Axis-midpoint endpoint affordance (`axisBracket`).
7. Duochrome endpoint follows RAM-GAP, slightly to the red.
8. Near add follows habitual working distance as well as age.
9. **Skip-ahead acknowledgment removed** — `OSR_goLine` navigates acuity lines freely in both directions; the confirmation modal, override chip, `OSR_doOverride` recorder, `chartOverrides` state and the report's override audit row were deleted. The doctor moves between lines constantly during subjective refraction, so a gate on it was friction with no clinical payload. **Scope:** this console only — the Visual Acuity v3 frontier model retains its gate, where the chart *is* the scoring instrument and a skipped line leaves genuinely unscored letters.

**Bug fix:** the JCC Power tab header rendered "MPMVA".

**Unchanged and confirmed correct:** axis before power.

---
## 0b. What changed in v0.3.1 — accurate change log

A new parallel test plus an interaction-design rebuild of its subjective stage. **No existing test was modified** — `WavefrontRefractionTest.jsx` is byte-for-byte untouched — and the count of tests at clinical fidelity is unchanged.

### New component

`components/ObjectiveSubjectiveRefractionTest.jsx` — a full clone of `WavefrontRefractionTest.jsx` with **all 509 identifiers re-prefixed `WFR_` → `OSR_`** (and keyframes `wfrspin` / `wfrpsf` / `wfrblur` → `osr*`) to satisfy the project's unique-top-level-constant rule. Exports `ObjectiveSubjectiveRefractionTest`; test id `objective-subjective-refraction`. Wired via a `<script type="text/babel">` tag and a routing case in `index.html`, and registered second in the `EXAM_TYPES` catalog in `components/TestSelection.jsx`.

### Subjective stage rebuilt as a single-screen console

The six-screen sequence (`setup → sphere → jcc-axis → jcc-power → add → binocular`) is replaced by **three surfaces: scan · console · report.**

1. **Procedures are tools, not steps.** A rail exposes MPMVA · JCC · Near add · Balance; any is selectable at any time in any order. No inter-procedure "next" buttons, no gating. This follows the Reichert VRx / Zeiss VISUSCREEN console model and is the interaction-design expression of the project's doctor-led principle — the clinician drives, the device responds.
2. **The prescription matrix is the instrument.** Rows SPH/CYL/AXIS/ADD × columns **Reference · Working · Δ**, per eye, always visible and always editable. The active tool *focuses* the row it governs (`OSR_TOOL_FIELD`) rather than rendering duplicate steppers, which eliminated the redundant per-tool control cards.
3. **Reference source selector** — Objective / Habitual / Unaided, read-only. Values are populated upstream by MPR's cross-test data layer; the UI owns the fields, labels and provenance display only. Axis Δ is computed as the **shortest signed rotation over 180°**.
4. **The chart is not mirrored on the controller.** In refraction the chart is a **stimulus** the patient judges, not a **scoring instrument** as it is in Visual Acuity (where the v3 frontier model correctly shows the doctor the whole chart). The console therefore carries only a compact presentation readout — 20/xx with logMAR, target, presentation mode — plus a **Peek** toggle for on-demand verification. This is the change that made the single screen fit.
5. **Duochrome added as a target**, not a procedure — it changes what the patient sees, not what the doctor adjusts. The ≈20/30 validity floor surfaces inline on the level readout when it applies.
6. **Tumbling E and Landolt C are locked to single-character presentation** — a row invites scanning and neighbour referencing, which corrupts a forced-choice orientation response. "Letters" renamed **Snellen**, with an "A" glyph so it is visually distinct from Tumbling E.
7. **JCC unified** into one tool with an **Axis | Power** segmented toggle, defaulting to axis — the clinical standard, because a power judgment made through a misaligned cylinder is unreliable.
8. **Removed:** Smart-Cylinder auto-bracketing; the patient-response button block (the prescription controls are the input system); and the procedural guidance strip (textbook MPMVA coaching, which is training material rather than instrument copy). Replaced by **device-state chips only** — fog applied, scan count.
9. **Fogging is adjustable** in 0.25 D steps (0–3.00 D, default +0.75) at session setup, and **balance fogging** likewise (0.25–3.00 D, default +0.75). Both were previously hard-coded.
10. **Session setup is dismissible** — X, click-outside, or Done — returning to the active tool rather than restarting the exam.

## 7a. Clinical-protocol alignment (Westmead Eye Manual §8.2)

The subjective console was checked against the Westmead Eye Manual's subjective-refraction protocol (§8.2, Sim / Yun / Catt / Fung) and corrected on the following points:

1. **Age-branched sphere protocol.** The sphere step now branches on accommodation. Patients **≥60 or pseudophakic** get a direct plus/minus preference comparison, because accommodation is not a factor. Patients **under 60** get the fogging protocol: add **+0.50 D**, confirm whether vision is worse, and reduce only in **−0.25 D** steps. Patient age and a pseudophakic flag are set in session setup; age is expected to arrive from the patient record via MPR's data layer. Running one protocol for both populations either wastes steps on a pseudophakic patient or produces an over-minused prescription in a pre-presbyope.
2. **JCC fixation target corrected.** JCC now presents a **round target ("O") two lines above best acuity**, not a full letter line one step larger. A round optotype shows the astigmatic smear without letter-recognition confounds. The target and its acuity level are labeled in the JCC accessory.
3. **Separate JCC powers for axis and power.** A **higher** cross-cylinder is used for axis refinement and a **lower** one for power refinement; these are now independent values (defaults 0.50 D and 0.25 D) rather than a single shared setting.
4. **Handle vs. axis alignment is now depicted.** In axis refinement the JCC **handle** lies along the cylinder axis (cross axes at ±45°); in power refinement one JCC **axis** lies along it. The dial renders both states and labels which is in force.
5. **Sphere compensation is active.** For each **0.50 D of cylinder** added, **0.25 D of opposite sphere** is applied to hold the circle of least confusion. Because cylinder moves in 0.25 D steps, compensation accumulates and applies on alternate steps; a pending indicator shows the accrued amount. The behavior is toggleable so the clinician can override.
6. **Axis midpoint affordance.** The endpoint may be reached either by equality of the two flips or by narrowing to a small range of axes, in which case the midpoint is taken. The console lets the clinician mark bracket axes and apply the computed **midpoint**.
7. **Duochrome endpoint corrected.** The mnemonic **RAM-GAP** (red add minus, green add plus) is surfaced, and the endpoint is stated as leaving the patient **slightly on the red side** — deliberate anti-over-minus insurance — rather than as strict equality.
8. **Near add follows working distance.** Add power now offers habitual **working-distance** selection (25 / 33 / 40 / 50 cm) with the resulting dioptric demand, alongside the age-expected value, since the manual ties add power to the patient's daily activities and viewing distance rather than age alone.

Confirmed unchanged: **axis before power** — the correct axis can be found despite incorrect power, but correct power cannot be found with an incorrect axis.

## 7b. ⚠ Hardware requirement for MPR — liquid-lens transitions must "protect the fog"

**This is an engineering constraint, not a UI behavior, and it has no UI workaround.**

The manual's instruction for trial frames is that when changing plus lenses the clinician places the **new** plus lens before removing the **old** one, so the patient is never given an unfogged moment in which to accommodate. On the xoExam liquid lens the equivalent requirement is a **transition constraint**:

> While fogging is in force, a commanded power change must never pass through a state with **less plus** than both its start and end values. The lens must move monotonically, or hold the greater plus value through the transition.

If the lens momentarily dips toward minus while changing power — for example by zeroing before setting a new value — the patient's accommodation is released, the fog is lost, and the sphere endpoint drifts minus. The failure is silent: nothing on screen indicates it, and the resulting prescription is simply over-minused.

This applies to every power change during a fogged MPMVA, and to the fogging step itself. It should be verified on hardware and documented in the lens-control interface.

### Verification

Layout was verified by measurement rather than inspection: console content is **563px against 682px available** at the 1280×800 tablet target. Eye cards wrap to stacked below ~660px of pane width so stepper values never collapse. All interactive targets are ≥44px.

### Logged, not built

**Test mode** (CD direction): all tests should open with the left sidebar collapsed, opening only via the hamburger and restoring prior state on exit. Recorded in the `CLAUDE.md` backlog with rationale (≈200–240px reclaimed at 1280×800, plus mode signaling) and the open question — hover-to-open does not exist on a touch tablet, so click-only is likely correct.

---
## 0a. What changed in v0.3.0 — accurate change log

This reissue records a test-catalog visibility/ordering pass; **no test was added and no clinical logic was touched.** Count at clinical fidelity unchanged — 7 of 19.

1. **Tests grid reordered.** `components/TestSelection.jsx` now leads with a fixed clinical priority sequence — Wavefront Refraction → Visual Acuity → Wavefront Aberrometry → Color Vision → Visual Field → Extraocular Motility → Pupillometry — with all remaining tests following in their prior order. Only the `EXAM_TYPES` array order changed; each entry keeps its `category`, so the category-filter chips still group by category.
2. **Legacy standalone "Refraction" hidden from the catalog.** The plain Refraction test is removed from the Tests grid (`TestSelection.jsx`) and the patient Start-New-Test launcher (`PatientsPage.jsx`, `PATIENT_EXAM_TYPES`). The combined **Wavefront Refraction** supersedes it for the refraction workflow. The component and its routing case in `index.html` are retained (catalog entries commented, tagged "HIDDEN (Jul 2026, CD request)"), so it is restorable by uncommenting.
3. **Wavefront Aberrometry retained across all catalogs** (Tests grid, patient launcher, Manual Control launcher).
4. **Tests-page filtering UI hidden.** The category filter pills, the per-card category subheads, and the search box in `TestSelection.jsx` are hidden behind a `SHOW_FILTERS = false` flag (restorable) — the short catalog no longer needs filtering or search.
5. **Version numbering.** Bumped v0.2.9 → **v0.3.0** — a minor bump rather than v0.2.10, because this is user-facing catalog behavior and reads unambiguously alongside the existing v0.2.1.
6. **Doc set reissued at v0.3.0.** This specification, the Development Brief (07-10-2026 v0.3.0), the Clinical Standards Reference, the Clinical Evaluation Brief, `CLAUDE.md`, `README.md`, and the `_dist_v0.3.0/` package are brought to v0.3.0 together. The clinical documents carry a no-clinical-change note for this release.

---

## 0a. What changed in v0.2.9 — accurate change log

This reissue records a shell/navigation pass; **no test was added and no clinical logic was touched.** Count at clinical fidelity unchanged — 7 of 19.

1. **Sidebar sub-menus removed.** Patients and Devices previously expanded into sub-menus in `components/DashboardShell.jsx`; both are removed, so every sidebar item now navigates directly to its section. `hasSubmenu` is `false` for all items. The destination pages already expose their primary actions in-page (+ Add Patient / + Add Device), so the sub-menu entries were redundant.
2. **List / Grid view toggle added to Patients, Devices, and Doctors.** A consistent segmented `List · Grid` control switches each page between a table list and a card grid. Patients defaults to List; Devices and Doctors default to Grid. Each page persists its choice independently — `xoexam_patients_view`, `xoexam_devices_view`, `xoexam_doctors_view`. Views built where missing: a Patients card grid, a Devices fleet table, and a Doctors table; all card/row clicks open the same detail view as before.
3. **Toggle placement standardized.** The control sits in the top action row next to the + Add button on all three pages.
4. **Doc set reissued at v0.2.9.** This specification, the Development Brief (06-16-2026 v0.2.9), the Clinical Standards Reference, the Clinical Evaluation Brief, `CLAUDE.md`, `README.md`, and the `_dist_v0.2.9/` package are brought to v0.2.9 together. The clinical documents carry a shell-only / no-clinical-change note for this release.

---

## 0b. What changed in v0.2.8 — accurate change log

This reissue records three changes on top of v0.2.7; no test was added and no clinical logic was rebuilt.

1. **Hardware answers confirmed (Steve, Q3/Q7/Q8 — June 9, 2026).** The headset-sensor questions came back: pupil detection in dim vs. bright light; wavefront imaging at **4 mm** (6 mm treated as confirmed per CD direction); Zernike to **10th order / 66 modes**; vertex **25–30 mm**; sphere-only range **−14 to +14 D**; cylinder range **0 to −5 D** (per the opto-electrical spec sheet). Wavefront Refraction now presents all of these as confirmed — `WFR_REEHANA_CONFIRMED = true` removes every "Provisional" pill and pending caption, and the real sphere/cylinder ranges replace the prior Q8 placeholders. Values stay isolated in named constants for any later revision.
2. **Toggle-switch rendering fix.** The Smart-Cylinder auto-bracketing and binocular-fogging toggles were being forced to squares by the global `button { min-height/min-width: 44px }` touch-target rule; both are now constrained to a proper rectangle (`minWidth:38, minHeight:22`).
3. **Doc set reissued at v0.2.8.** This specification, the Development Brief, the Clinical Standards Reference, the Clinical Evaluation Brief, `CLAUDE.md`, `README.md`, the Wavefront Refraction spec, and the `_dist_v0.2.8/` package are all brought to v0.2.8 together.

---

## 1. What changed in v0.2.7 — accurate change log

This reissue folds the **six competitive-parity enhancements** for Wavefront Refraction into the single production component and **eliminates the parallel `v2` draft file**. It supersedes v0.2.6. All sixteen sections of the prior spec remain authoritative unless updated below.

| Area | v0.2.6 | v0.2.7 |
|---|---|---|
| Tests at clinical fidelity | 7 of 19 | **7 of 19** (no new test; Wavefront Refraction deepened) |
| Wavefront Refraction | base two-stage flow | **+ six competitive-parity enhancements merged in** |
| WFR source files | 1 production + 1 `v2` draft fork | **1 file only** (`v2` fork + harness deleted) |
| WFR report layout | single scrolling report | **tabbed report** (Summary · Rx comparison · Day & night · Vision simulation · Wavefront · Progression) |
| Newest engineering integration item | Certify & close as Rx-release system event | **Steve's hardware answers (Q3/Q7/Q8) confirmed** — 6 mm / vertex / Rx-range values locked in |

### Files touched in v0.2.7

| File | Change |
|---|---|
| `components/WavefrontRefractionTest.jsx` | **Replaced** — the six-enhancement build folded into the single production file (~2280 lines, all `WFR_`-prefixed); component name kept as `WavefrontRefractionTest`. All Reehana-gated values isolated in named constants at the top (`WFR_ANALYSIS_DIA`, `WFR_SIXMM_PROVISIONAL`, `WFR_ZERNIKE_MAX_ORDER`/`WFR_ZERNIKE_MODES`, `WFR_VERTEX_MM`, `WFR_SPHERE_RANGE`/`WFR_CYL_RANGE`) so unconfirmed items flip with a one-line edit. |
| `components/WavefrontRefractionTest v2.jsx` | **Deleted** — the parallel draft fork. One file, one source of truth (CD direction: a divergent second copy is a versioning hazard). |
| `Wavefront Refraction v2 Demo.html` · `wfr-v2-demo/` | **Deleted** — the fork's standalone demo + single-file build. |
| `index.html` | **Edited** — title bumped to v0.2.7. No routing change: the shell already imported `WavefrontRefractionTest.jsx` and rendered `<WavefrontRefractionTest/>`, so the enhanced flow is now live in the full app. |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | **Added** — supersedes the v1 spec; documents the six enhancements and the doctor-led posture. |
| `deploy.html` · `deploy-new-site.html` | **Edited** — version strings bumped to v0.2.7. |
| `CLAUDE.md` · `README.md` | **Updated** — v0.2.7 version-log entry, WFR section rewritten (merge), component index, test-stream table, status, dist note. |

#### The six enhancements (all doctor-led-safe — measurements/simulations, never verdicts)

1. **PSF + simulated-VA before/after** — point-spread-function render + simulated acuity, habitual-vs-new Rx, driven by the Zernike set (Simulation tab).
2. **Binocular balance step** — after both eyes, via fogging / alternate occlusion (no prism hardware needed); subjective `subjStep:'binocular'`.
3. **Multi-source Rx comparison** — objective / subjective / habitual / unaided columns with spherical-equivalent deltas; habitual entered manually now, auto-pulled from history later (Rx-comparison tab).
4. **Photopic-vs-mesopic day-&-night** — 4 mm column + 6 mm column (both hardware-confirmed) with a night-shift Diff row (Day-&-night tab).
5. **Smart-Cylinder auto-bracketing** — JCC step ladder auto-sized to |cyl|, narrows one rung per reversal; toggle.
6. **Refraction progression tracker** — spherical-equivalent trend + D/yr rate vs age-banded reference; the at-risk call is left to the clinician (Progression tab).

> **Hardware values confirmed (Steve, Q3/Q7/Q8).** The 6 mm pupil columns, vertex distance (25–30 mm), and sphere/cylinder ranges (sphere −14 to +14 D, cylinder 0 to −5 D) are confirmed and isolated in named constants. Any later hardware revision is a one-line edit — no rebuild, no separate file.

> **Framing.** The program remains pre-beta, active development pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. v0.2.7 is the integration version, not a finished milestone.

---

## 2. Engineering quick start (unchanged from v0.2.1)

- **Stack:** React 18.3.1 + Babel Standalone 7.29.0 via CDN. No build toolchain. `index.html` is the single entry point.
- **Open `index.html` directly** in a modern browser (Chrome / Edge recommended). The prototype renders immediately — no server, no install, no build.
- **Production target:** React Native + Kotlin Android tablet. The `.jsx` source is structured for mechanical port — inline styles, hooks-only, no exotic dependencies. See the v0.2.1 spec §10 for the full RN portability table.

---

## 3. ExamShell Component Interface Contract (unchanged)

Every test component must conform to this contract exactly. Wavefront Refraction is the seventh test built against it.

```js
function [TestName]({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
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
}

Object.assign(window, { [TestName] });
```

ExamShell owns the canonical Cancel UX: back arrow hidden during testing, labeled red "Cancel test" button takes over, opens confirm modal. **Test components MUST NOT build their own cancel dialogs.**

For tests with sub-stage state machines inside the testing phase (EOM, Pupillometry, and now Wavefront Refraction's objective→subjective sequence), `finishAvailable()` is the local helper that gates ExamShell's green "Finish & Report" button — only at the last enabled sub-step's completion state.

---

## 4. Wavefront Refraction — engineering-specific integration touchpoints

The clinical spec (`briefs/WavefrontRefraction_Clinical_Spec_v1.md`) is the authoritative source. Engineering touchpoints specific to this test:

### 4.1 Certify & close is a SYSTEM EVENT — the most consequential integration point in the suite

Wavefront Refraction produces the **verified prescription (Rx)** — the combined output of the objective wavefront capture and the subjective phoropter refinement. Its **"Certify & close" action is not a UI-only state change.** It is the certification event that **releases the Rx to the downstream xoFit fitting/finishing job object.**

- The prototype surfaces this as a button with a "Doctor sign-off · releases Rx to job object" sub-label.
- **MPR must wire Certify & close to emit the Rx-release event** to the job/order pipeline. Until certified, the Rx is not released downstream.
- This couples to the role/permissions model (kickoff agenda item 5): only an authorized doctor identity may certify.

### 4.2 Two-stage capture model

| Stage | UI phase | Behavior | Hardware contract |
|---|---|---|---|
| Objective | ExamShell `testing` (sub-stage `objective`) | Monocular wavefront capture, **OD then OS**. Live eye-scan look — dark viewer, breathing pupil, accent sweep line, rotating centering ring, red alignment dot that turns the backdrop green on lock. Sub-stages `init → calibrating → capturing → complete`. | Liquid-lens / eye-tracking capability drives readiness panel values and green-lock timing — engineer confirmation needed. Per-eye **scan count (1–3)** documents reliability; the wavefront retries on movement/blink and averages. |
| Subjective | ExamShell `testing` (sub-stage `subjective`) | Liquid-lens digital phoropter. Step sequence per eye `setup → sphere (MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add`. | Liquid-lens power presentation per step; optotype rendering on the patient chart. |

`mpmva2` (second MPMVA) auto-triggers only if cyl changed ≥ 0.50 D or axis changed ≥ 10° from objective.

### 4.3 Clinical non-negotiables enforced in the UI (preserve on port)

1. **Axis before power (JCC).** Enforced by step order — `jcc-axis` always precedes `jcc-power`. The UI cannot reach power refinement before axis is confirmed.
2. **Fogging control.** After objective capture a fog prompt offers **+0.75 D** with clinical explanation; starting MPMVA sphere = objective sphere + fog. Doctor may skip.
3. **Sphere compensation note** visible during cylinder power: "For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion."
4. **Rx format discipline.** SPH/CYL always signed + 2 dp; AXIS integer + °; ADD signed with D or "—". Helpers: `WFR_fmtSph` / `WFR_fmtCyl` / `WFR_fmtAxis` / `WFR_fmtAdd`.
5. **Monocular objective.** No OU averaging. Sequence OD → OS automatically via breadcrumb + transition modal.
6. **No clinical claims in the report.** Deliberate divergence from the other clinical-fidelity tests: NO Patient Classification banner, NO interpretive language. A refraction is a measurement-and-verification workflow, not a screening. The Clinical Summary states data only (scan counts, completion, "Final Rx pending clinician certification").

### 4.4 Data persistence schema additions

Wavefront Refraction adds this per-test results object (see v0.2.1 §6 for the cross-test schema):

```js
{
  testId: 'wavefront-refraction',
  mode: 'full',                  // 'full' (objective→subjective) | 'subjective-only'
  eyesTested: ['OD', 'OS'],
  objective: {
    OD: { sph:-1.25, cyl:-0.50, axis:165, pupilSize:6.2, analysisDia:6.0, scans:2,
          rmsHOA:0.261, comaRMS:0.163, sphAb:0.087 },
    OS: { /* same shape */ }
  },
  fogApplied: 0.75,              // D, or 0 if skipped
  subjective: {
    OD: { sph:-1.00, cyl:-0.50, axis:165, add:0, bcva:'20/20', jccPower:0.50 },
    OS: { /* same shape */ }
  },
  finalRx: {
    OD: { sph:-1.00, cyl:-0.50, axis:165, add:0 },
    OS: { /* same shape */ }
  },
  notes: 'Free-text session notes',
  certifiedBy: '<doctor-id>',    // populated at Certify & close — Rx-release event
  certifiedAt: '<ISO timestamp>'
}
```

### 4.5 Pure-function port targets

- `WFR_fmtSph` / `WFR_fmtCyl` / `WFR_fmtAxis` / `WFR_fmtAdd` — Rx format discipline
- `WFR_lineIsPassed(correct, total)` — VA pass/fail threshold (see open item 4.6.1)
- `WFR_getBestVA(...)` — additive VA notation (e.g. `20/25 +4`)
- `WFR_Optotype` — geometric Tumbling E / Landolt C renderer (shared with Visual Acuity)

### 4.6 Open items / TBD for the engineering kickoff

1. **VA pass/fail threshold** (`WFR_lineIsPassed`) currently "more than half correct." **Gary to validate** against a published standard before lock.
2. **Certify & close → system event** wiring (§4.1) — MPR to implement as the Rx-release trigger to the xoFit job object.
3. **Patient-facing headset view is out of scope.** This component is the tablet (technician/doctor) view only. The patient-facing headset/clicker experience (objective self-administered mode) is separate scope to define with MPR.
4. Objective readiness panel values + green-lock timing depend on liquid-lens / eye-tracking capability (engineer confirmation).

---

## 5. Open decisions — engineering kickoff agenda (cumulative, v0.2.7)

The cumulative list from v0.2.5 stands. New items added by Wavefront Refraction are flagged **[R]**:

1. Hardware-to-UI event contract (cross-test) — what events the headset fires, what payload, what the UI subscribes to
2. Per-test data persistence schema — final shape across all clinical-fidelity tests
3. Authentication model — login, session, doctor identity
4. Export mechanism — PDF generation, EHR forwarding, cloud sync
5. Role-based permissions — Doctor sign-off as a gate, not just a label
6. Patient identity confirmation step — currently assumed pre-test
7. Compliance scope — HIPAA, MDR class, FDA 510(k) path
8–14. Pupillometry firmware/clinical questions (v0.2.5 §4.1 — items 8–14)
15. **[R]** Certify & close → Rx-release system event wiring to the xoFit job object (§4.1)
16. **[R]** VA pass/fail threshold validation for the subjective stage (§4.6.1)
17. **[R]** Patient-facing headset/clicker view scope for objective self-administered mode (§4.6.3)
18. **[R]** Liquid-lens / eye-tracking capability for objective readiness + green-lock timing (§4.6.4)

---

## 6. Regulatory acknowledgment (unchanged)

The xoExam UI/UX prototype is **not a medical device** and has not been cleared by FDA, MDR, or any other regulatory body. The clinical-accuracy work in `briefs/` and in the Clinical Standards Reference is a transparency document — a description of what the design adheres to — not a clinical validation report or regulatory submission. Production clinical validation is an engineering and regulatory responsibility outside Method's scope.

Note specific to Wavefront Refraction: the report **deliberately makes no clinical claims** — no determinations, assessments, or recommendations. This is by design: a refraction is a measurement-and-verification workflow, not a screening. The verified Rx is a measured output for clinician certification, not a diagnostic finding.

The same calibration assumption applies as for all tests: the prototype assumes the production headset delivers calibrated stimulus presentation, accurate liquid-lens power, valid wavefront measurement, and consistent conditions. Whether it does is a hardware question outside the UI/UX layer.

---

## 7. Per-test specs (current)

> **The product version is unified.** The entire xoExam UI/UX ships as one build — currently **v0.3.3**. The right-hand column records *when each test last reached clinical fidelity* (the release it was last meaningfully updated in), not a separate version number for that test. A test showing an earlier release is correct and unchanged since then, not behind.

| # | Test | Spec file in `briefs/` | Reached clinical fidelity in |
|---|---|---|---|
| 1 | Visual Acuity | `VisualAcuity_Clinical_Spec_v2.md` | v0.2.3 (Tumbling E/C added v0.2.6) |
| 2 | Color Vision | (in CLAUDE.md + Clinical Standards Reference §2) | v0.1.7 |
| 3 | Visual Fields | `VisualField_Clinical_Spec_v2.md` | v0.1.8 |
| 4 | Wavefront Aberrometry | `WavefrontAberrometry_Clinical_Spec_v2.md` | v0.1.9 |
| 5 | Extraocular Motility | `ExtraocularMotility_Clinical_Spec_v2.md` | v0.2.1 |
| 6 | Pupillometry | `Pupillometry_Clinical_Spec_v2.md` | v0.2.5 |
| 7 | **Wavefront Refraction** | `WavefrontRefraction_Clinical_Spec_v2.md` | **v0.2.6** (six enhancements merged v0.2.7) |

The remaining 12 tests are visual-fidelity placeholders. Specs are written as each one is brought to clinical fidelity.

---

## 8. Document set issued at v0.3.3

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.3.3.docx` | **This document** — supersedes v0.3.2 |
| `xoExam Development Brief 10-13-2026 v0.3.3.docx` | New per-release brief (v0.3.3) |
| `xoExam Clinical Standards Reference v0.3.3.docx` / `.md` | Reissued at v0.3.3 — prism, near and JCC branching recorded |
| `xoExam WFOR Variance Analysis v0.3.0.docx` / `.md` | Carried forward — reference-description gap analysis |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.3.3 — prism, near and JCC branching are the review subject |
| `xoExam Development Brief.docx` (cumulative) | v0.3.3 entry appended |
| `CLAUDE.md` | v0.3.3 entry appended |
| `README.md` | Status bumped to v0.3.3 |
| `_dist_v0.3.3/` | Deployment package (current) |

### Earlier (v0.2.9) document set

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.9.docx` | **This document** — supersedes v0.2.8 |
| `xoExam Development Brief 06-16-2026 v0.2.9.docx` | New per-release brief (v0.2.9) |
| `xoExam Clinical Standards Reference v0.2.9.docx` / `.md` | Reissued at v0.2.9 — shell-only release, no clinical change |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.9 — shell-only release, no clinical change |
| `xoExam Development Brief.docx` (cumulative) | v0.2.9 entry appended |
| `CLAUDE.md` | v0.2.9 entry appended; component index, sidebar-nav note, localStorage keys, status updated |
| `README.md` | Status bumped to v0.2.9 |
| `_dist_v0.2.9/` | Deployment package (current) |

### Earlier (v0.2.8) document set

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.8.docx` | Superseded by v0.2.9 |
| `xoExam Development Brief 06-09-2026 v0.2.8.docx` | Per-release brief (v0.2.8) |
| `xoExam Clinical Standards Reference v0.2.8.docx` / `.md` | Reissued at v0.2.8 — hardware-confirmed framing |
| `xoExam Development Brief 06-08-2026 v0.2.7.docx` | New per-release brief |
| `xoExam Development Brief.docx` (cumulative) | v0.2.7 entry appended |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | Supersedes v1 — six-enhancement pass, doctor-led posture |
| `xoExam Clinical Standards Reference v0.2.7.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction §7 updated for the six enhancements |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction panel prompts updated |
| `CLAUDE.md` | v0.2.7 entry appended; WFR section rewritten (merge); component index + test-stream table updated |
| `README.md` | Status bumped to v0.2.7 |
| `_dist_v0.2.8/` | Deployment package (current) |

---

## 16. Version history

| Spec version | Date | Trigger |
|---|---|---|
| v0.1.8 | May 18, 2026 | Visual Fields clinical fidelity + first formal handoff issue |
| v0.1.9 | May 21, 2026 | Wavefront Aberrometry clinical fidelity + Doctor sign-off pattern introduced |
| v0.2.1 | May 22, 2026 | Extraocular Motility clinical fidelity + naming convention sweep |
| v0.2.5 | May 22, 2026 | Pupillometry clinical fidelity |
| v0.2.6 | June 2, 2026 | Wavefront Refraction — new two-stage refraction test; Certify & close as Rx-release system event |
| **v0.2.7** | **June 8, 2026** | **Wavefront Refraction — six competitive-parity enhancements merged into the single production file; `v2` fork eliminated** |
| **v0.2.8** | **June 9, 2026** | **Hardware answers confirmed (Steve, Q3/Q7/Q8) — 4 & 6 mm pupil, Zernike 10/66, vertex 25–30 mm, sphere −14/+14 D, cylinder 0/−5 D; Smart-Cylinder & binocular toggle-switch fix; full doc-set reissue** |
| **v0.2.9** | **June 16, 2026** | **Shell navigation + list/grid view pass — sidebar sub-menus removed; List/Grid view toggle added to Patients, Devices, Doctors; no test or clinical change** |
| **v0.3.0** | **July 10, 2026** | **Test catalog visibility, ordering + filtering pass — Tests grid reordered to a fixed clinical priority sequence; legacy standalone Refraction hidden from the catalog; Tests-page filter pills / category labels / search hidden; no test or clinical change** |
| **v0.3.1** | **September 18, 2026** | **Objective & Subjective Refraction added — parallel test; subjective stage rebuilt as a single-screen instrument console** |
| **v0.3.2** | **September 18, 2026** | **Subjective protocol aligned to Westmead Eye Manual §8.2; liquid-lens "protect the fog" requirement; skip-ahead acknowledgment removed** |
| **v0.3.3** | **October 13, 2026** | **Digital-prism binocular alignment, near-vision workflow, JCC branching on starting cylinder** |

Older versioned specs are retained in the repository so spec evolution is traceable for MPR / regulatory audit.

---

*Method Marketing Agency · xoExam UI/UX Engineering Handoff Specification · v0.3.3 · October 13, 2026*
