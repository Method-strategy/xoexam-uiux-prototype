# Extraocular Motility & Tracking — Unified Clinical & Design Spec (v2)
## xoExam UI/UX · Method Marketing Agency · May 22, 2026
## Supersedes: `ExtraocularMotility_Clinical_Prompt.md` (May 2026)

> This spec merges the v1 clinical prompt with (a) Method's clinical-accuracy audit and (b) the patterns established in xoExam v0.1.4 (Visual Acuity), v0.1.7 (Color Vision), v0.1.8 (Visual Fields), v0.1.9 (Wavefront Aberrometry), and v0.2.0 (naming convention sweep). It is the authoritative document for the Extraocular Motility test stream and the source of truth for v0.2.1.

---

## A. What changed vs. the v1 prompt

### Carried forward from the v1 prompt — all clinically correct
- **0 to ±4 grading scale** replacing the existing 1–5 (the existing scale is clinically wrong; doctors don't recognize "5/5" as a valid EOM finding).
- **9 positions** including primary gaze (the existing 8-direction implementation misses primary, which is where tropia/phoria assessment happens).
- **Sub-test structure:** Versions → Smooth Pursuit → Saccades → Ductions (conditional).
- **H-pattern motility diagram** replacing the radial-dot diagram.
- **CN palsy flag** at any individual grade of -3 or -4.
- **Color coding by grade** (green = normal, amber/red gradient for underaction, blue-purple for overaction). RAG palette use is appropriate here as a clinical severity application.
- **Component extraction** into standalone `ExtraocularMotilityTest.jsx` with `EOM_` prefixes.
- **`window` export.** `SimpleTestShell` / `Visual Reaction Time` / `Eye Tracking Accuracy` / `AI Pattern Recognition` stay in `MotilityAndNeuro.jsx`.

### Clinical corrections / additions to the v1 prompt

1. **CN IV (trochlear) testing — add secondary muscle / CN field per position.** The v1 prompt lists single-muscle-per-position, which is a simplification — cardinal positions actually test pairs. The clinically critical case is **CN IV palsy**, which is classically detected at "down-and-in" gaze:
   - Down-right tests not just right inferior rectus (CN III) but also LEFT superior oblique (CN IV).
   - Down-left tests not just left inferior rectus (CN III) but also RIGHT superior oblique (CN IV).
   - A doctor reading the report needs to see "CN IV (L)" or "CN IV (R)" in the down-and-in positions or CN IV palsy can be missed.

   **Fix:** each position carries an optional `secondaryMuscle` + `secondaryCN` field. Surface both primary and secondary in the testing-phase position label and in the report's Versions Results table.

2. **Catalog name correction.** The v1 prompt suggests two names: "Ocular Motility & Tracking" (catalog) and "Extraocular motility" (ExamShell, lowercase). Both conflict with the codified v0.2.0 bare-noun naming rule and the title-case ExamShell convention established for VA / CV / VF / WFA.
   - **Catalog name:** `Extraocular Motility` (bare, title case — matches the v0.2.0 sweep).
   - **ExamShell title:** `Extraocular Motility` (title case, matches VA / CV / VF / WFA).
   - **Report title:** `Extraocular Motility Report` (formal document; "Report" suffix allowed in formal headers per Dev Rule #0).
   - The "& Tracking" suffix the v1 prompt floated is dropped — smooth pursuit and saccades are clinical sub-tests inside EOM, not separate enough to warrant changing the test name.

3. **No emoji.** v1 prompt uses `⚠️` in the CN palsy flag. Replace with SVG warning icon per the xoExam design system (no emoji anywhere; SVG only).

4. **Solid accent backgrounds.** The legacy `MotilityAndNeuro.jsx` code uses `linear-gradient(135deg, accent, #155bcc)` in several buttons. Per the design-system convention established in v0.1.8 and codified in v0.1.9, the prototype uses solid accent backgrounds only — sweep all gradients during extraction.

5. **Eye reference convention.** Legacy code uses `'left'` / `'right'`. Convert to `OD` / `OS` per the convention established in VA / CV / VF / WFA (universal medical convention).

6. **Patterns layered from v0.1.4 – v0.2.0:**
   - **Doctor sign-off label** above Certify & close in the report (v0.1.9 pattern — now standard on every clinical-fidelity test).
   - **Patient Classification banner** at the top of the report (worst-finding-drives-bottom-line + per-finding pills on the right). Pattern from WFA v0.1.9 / VF v0.1.8.
   - **Clinical Interpretation card** per the v1 prompt's `getEOMInterp()` logic, with severity-tinted background (green / amber / red).
   - **Cancel UX** owned by ExamShell — no internal cancel modal, no internal cancel button. ExamShell hides the back arrow and shows the labeled red "Cancel test" button during testing.
   - **`Object.assign(window, { ExtraocularMotilityTest })`** at file end.
   - **Sentence-case button labels** throughout (Begin test, Next position, Finish & report, Certify & close).

---

## B. Component contract

```js
// ExtraocularMotilityTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Extracted from MotilityAndNeuro.jsx

function ExtraocularMotilityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
}

Object.assign(window, { ExtraocularMotilityTest });
```

All top-level identifiers prefixed `EOM_` (`EOM_POSITIONS`, `EOM_GRADE_VALUES`, `EOM_getGradeInfo`, `EOM_getInterp`, `EOM_HPatternDiagram`, `EOM_GradeSelector`, `EOM_PursuitSelector`, `EOM_SaccadeSelector`, `EOM_REPORT_LABEL`, etc.).

Wrapper: `<ExamShell>` with three phases (`ready` = setup · `testing` = sub-step state machine · `report`). Cancel UX is owned by ExamShell. Test must not build its own cancel button or modal.

Routing in `index.html`:
```jsx
case 'extraocular-motility': return <ExtraocularMotilityTest {...props}/>;
```

Old `ExtraocularMotilityTest` function and its helpers (`EOM_DIRECTIONS`, `DIR_POSITIONS`, `EOMMeter`, `EOMDiagram`) removed from `MotilityAndNeuro.jsx`. `MotilityAndNeuro.jsx` keeps `VisualReactionTimeTest`, `EyeTrackingAccuracyTest`, `AIPatternRecognitionTest`. Its `window` export drops `ExtraocularMotilityTest`. **Rollback path:** `_dist_v0.2.0/` is the canonical pre-v0.2.1 snapshot.

---

## C. Data model

### Grade scale

```js
const EOM_GRADE_VALUES = [-4, -3, -2, -1, 0, 1, 2, 3];
const EOM_GRADE_DEFAULT = 0;

function EOM_getGradeInfo(grade) {
  if (grade === 0)  return { label: 'Normal',         color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' };
  if (grade === -1) return { label: 'Mild underaction',     color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
  if (grade === -2) return { label: 'Moderate underaction', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' };
  if (grade === -3) return { label: 'Marked underaction',   color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
  if (grade === -4) return { label: 'No movement',          color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  if (grade ===  1) return { label: 'Mild overaction',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' };
  if (grade ===  2) return { label: 'Moderate overaction', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' };
  if (grade ===  3) return { label: 'Marked overaction',   color: '#6d28d9', bg: '#ddd6fe', border: '#a78bfa' };
  return { label: 'Unscored', color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' };
}
```

### Positions (with primary + secondary muscle / CN)

```js
const EOM_POSITIONS = [
  { id:'primary',     label:'Primary gaze',  dx: 0, dy: 0,  primaryMuscle:'All muscles balanced',         primaryCN:'CN III / IV / VI',  secondaryMuscle:null,                      secondaryCN:null,           note:'Assess for tropia or phoria' },
  { id:'right',       label:'Right gaze',    dx: 1, dy: 0,  primaryMuscle:'Right lateral rectus',          primaryCN:'CN VI (R)',          secondaryMuscle:'Left medial rectus',      secondaryCN:'CN III (L)',   note:null },
  { id:'left',        label:'Left gaze',     dx:-1, dy: 0,  primaryMuscle:'Left lateral rectus',           primaryCN:'CN VI (L)',          secondaryMuscle:'Right medial rectus',     secondaryCN:'CN III (R)',   note:null },
  { id:'up',          label:'Up gaze',       dx: 0, dy:-1,  primaryMuscle:'Superior recti',                primaryCN:'CN III',             secondaryMuscle:'Inferior obliques',       secondaryCN:'CN III',       note:null },
  { id:'down',        label:'Down gaze',     dx: 0, dy: 1,  primaryMuscle:'Inferior recti',                primaryCN:'CN III',             secondaryMuscle:'Superior obliques',       secondaryCN:'CN IV',        note:null },
  { id:'up-right',    label:'Up & right',    dx: 1, dy:-1,  primaryMuscle:'Right superior rectus',         primaryCN:'CN III (R)',         secondaryMuscle:'Left inferior oblique',   secondaryCN:'CN III (L)',   note:null },
  { id:'up-left',     label:'Up & left',     dx:-1, dy:-1,  primaryMuscle:'Left superior rectus',          primaryCN:'CN III (L)',         secondaryMuscle:'Right inferior oblique',  secondaryCN:'CN III (R)',   note:null },
  { id:'down-right',  label:'Down & right',  dx: 1, dy: 1,  primaryMuscle:'Right inferior rectus',         primaryCN:'CN III (R)',         secondaryMuscle:'Left superior oblique',   secondaryCN:'CN IV (L)',    note:'Classic CN IV (L) palsy position' },
  { id:'down-left',   label:'Down & left',   dx:-1, dy: 1,  primaryMuscle:'Left inferior rectus',          primaryCN:'CN III (L)',         secondaryMuscle:'Right superior oblique',  secondaryCN:'CN IV (R)',    note:'Classic CN IV (R) palsy position' },
];
```

### Pursuit / Saccade grades

```js
const EOM_PURSUIT_GRADES = [
  { id:'normal',    label:'Normal',          desc:'Smooth, continuous pursuit' },
  { id:'mild',      label:'Mildly reduced',  desc:'Occasional catch-up saccades' },
  { id:'marked',    label:'Markedly reduced', desc:'Frequent catch-up saccades' },
  { id:'absent',    label:'Absent',          desc:'Cannot maintain pursuit' },
];

const EOM_SACCADE_GRADES = [
  { id:'normal',     label:'Normal',           desc:'Appropriate latency and accuracy' },
  { id:'prolonged',  label:'Prolonged latency', desc:'Slow to initiate' },
  { id:'hypometric', label:'Hypometric',       desc:'Undershoots the target' },
  { id:'hypermetric',label:'Hypermetric',      desc:'Overshoots the target' },
];
```

---

## D. Phase / sub-step flow

```
ready (setup)
   ↓ Begin test
testing
   testStep state machine:
     versions (9 positions, binocular)
        ↓ all 9 graded → Next: pursuit
     pursuit (single screen, 4-option)
        ↓ Next: saccades
     saccades (single screen, 4-option)
        ↓ Next: ductions (if enabled) OR Finish & report
     ductions-OD (9 positions, monocular right) [conditional on config OR auto-enable if any version grade ≠ 0]
        ↓ Next: ductions OS
     ductions-OS (9 positions, monocular left)
        ↓ Finish & report
report
```

ExamShell's green `Finish & Report` button (its `onFinish` prop) appears only when the current sub-step is the final enabled sub-step AND that sub-step has reached its completion state. Until then, sub-steps progress via inline "Next" buttons within the testing-phase content area.

---

## E. Phase-by-phase requirements

### `ready` phase (setup)

- ExamShell title: `Extraocular Motility`. Back arrow visible.
- Body: clean briefing card centered.
  - Headline: `Extraocular Motility`
  - Subhead: brief clinical description (the v1 prompt's text is fine).
  - Inactive `EOM_HPatternDiagram` preview (all positions neutral gray).
  - Test configuration checklist:
    - Versions (binocular) ✅ default on · cannot be disabled
    - Smooth pursuit ✅ default on
    - Saccadic assessment ✅ default on
    - Ductions (monocular) ☐ default off · auto-enables if any version grade ≠ 0
- Begin button = ExamShell's standard `Begin Test` (via `onBegin` prop). No inline Start button.

### `testing` phase — versions sub-step

- Top sub-bar: progress chip showing `Versions · {n} of 9` plus inline progress dots for the 9 positions (filled for completed, accent ring for current, gray for pending).
- Two-column layout:
  - **Left (40%):** `EOM_HPatternDiagram` with current position highlighted (accent ring + accent dot). Below: position label (bold), primary muscle + CN label (muted), secondary muscle + CN label if present (muted, smaller). For primary gaze: show "Assess for tropia or phoria" note.
  - **Right (60%):** Clinical instruction ("Both eyes open. Ask the patient to follow the target to {position}. Observe for any limitation or overaction."). `EOM_GradeSelector` horizontal row of 8 buttons [-4, -3, -2, -1, 0, +1, +2, +3]. 0 pre-selected by default (green, "Normal" label). Negative values: amber-to-red gradient by severity. Positive values: blue-purple. Each button ≥ 44px tall, touch-target-compliant. Clinical legend below buttons in muted text. `Next position →` button.
- After 9 positions complete, the testing area swaps to the next enabled sub-step (or report).
- Right sidebar (via `rightPanel` prop on ExamShell): "Progress" violator, mini `EOM_HPatternDiagram` showing scored positions to date, position count, divider, "Session notes" violator, textarea.

### `testing` phase — smooth pursuit sub-step

- Single centered card with:
  - Headline: `Smooth pursuit assessment`
  - Instruction: "Present a smoothly moving target and observe the patient's pursuit quality."
  - 4-option segmented selector (stacked, full-width, ≥ 44px each) — Normal (default-selected) / Mildly reduced / Markedly reduced / Absent. Each option shows label + descriptor.
- `Next: Saccades →` button (or `Next: Ductions →` / `Finish & Report` per config).

### `testing` phase — saccades sub-step

- Same shape as pursuit — segmented selector with Normal (default) / Prolonged latency / Hypometric / Hypermetric.

### `testing` phase — ductions sub-step (OD then OS, conditional)

- Auto-enables if any version grade ≠ 0. Doctor can manually enable in setup.
- Same shape as versions but monocular: patch icon overlay on the H-pattern diagram (occluded eye), instruction copy adjusted ("Occlude the patient's left eye. Test right eye range of motion at {position}.").
- OD first, then OS — matches the universal OD-first convention.

### `report` phase

- **Patient Classification banner** at top — worst-finding-drives-bottom-line. Severity color (green / amber / red) drives banner tint. Per-eye / per-test pills on the right side (Versions worst grade · Pursuit · Saccades · Ductions if present).
- **Patient information card** (4-column grid): Patient name · Birthdate · Patient ID · Exam type · Exam date · Start time · Test duration · Tests performed (Versions, Pursuit, Saccades, [Ductions]).
- **Versions H-pattern diagram(s):** Large H-pattern diagram with all 9 positions colored by grade. If ductions ran, two diagrams side-by-side labeled "Versions" and "Ductions" (the ductions diagram shows per-eye worst grade per position).
- **Versions Results table** — header style `EOM_REPORT_LABEL` (title case, no textTransform). Columns: Position · Primary muscle · Primary CN · Secondary muscle · Secondary CN · Grade · Interpretation. Navy header (`#0e2f5e`) per WFA convention. Color-coded grade cell.
- **Smooth Pursuit & Saccades summary card** — two-up grid, each shows label, selected grade, descriptor.
- **CN palsy clinical flag** (conditional, prominent, red surface, SVG warning icon): if any single position grade is -3 or -4, surface `"Significant restriction detected at {position} — {primaryMuscle} — {primaryCN}. Consider CN palsy. Neurological referral may be indicated if not previously evaluated."`
- **Clinical Interpretation card** — per the v1 prompt's `getEOMInterp()` logic. Severity tint (green / amber / red).
- **Session notes** card.
- **Actions row:**
  - Left: secondary `Export report` + `Compare` + ExamShell-provided `New Test`.
  - Right: small `Doctor sign-off` label above the primary `Certify & close` button (v0.1.9 pattern).

---

## F. What MUST NOT change

- Three-phase architecture (`ready` / `testing` / `report`).
- Versions → Pursuit → Saccades → Ductions sub-test sequence.
- 0 to ±4 grading scale.
- 9-position cardinal-gaze set including primary.
- H-pattern motility diagram (clinical standard).
- `Object.assign(window, { ExtraocularMotilityTest })`.

---

## G. What MUST NOT carry over from `MotilityAndNeuro.jsx`

- The `EOMMeter` 1–5 button component — replaced by `EOM_GradeSelector`.
- The 1–5 scoring scale — replaced by 0 to ±4.
- The 8-direction `EOM_DIRECTIONS` array — replaced by 9-position `EOM_POSITIONS`.
- The `EOMDiagram` 8-dot radial diagram — replaced by `EOM_HPatternDiagram`.
- All `linear-gradient(135deg, accent, #155bcc)` button styling — replaced by solid accent.
- `eye === 'left'` / `'right'` references — replaced by `OD` / `OS`.
- `VisualReactionTimeTest`, `EyeTrackingAccuracyTest`, `AIPatternRecognitionTest` stay in `MotilityAndNeuro.jsx`.

---

## H. Open engineering questions (handoff)

Add to the Engineering Handoff Spec at the v0.2.1 reissue (Section 12):

- **Headset gaze-tracking data shape** — does the firmware emit a per-eye gaze vector during versions, or does it provide a pre-computed "underaction" estimate per direction? The UI assumes the doctor grades manually; if the device offers automated grading, the grade selector becomes "doctor-confirmed" rather than "doctor-entered."
- **Smooth pursuit data** — does the firmware compute pursuit gain / catch-up saccade count, or is this purely doctor observation? Affects whether the pursuit grade UI shows raw data or just a grade selector.
- **Saccade latency measurement** — same question as above. Firmware could provide actual latency ms, in which case the UI surfaces both the number and the doctor's grade.
- **Patient response clicker** — not used in EOM. Confirm this is correct (the patient passively follows the target; no button presses).

---

*Method Marketing Agency · xoExam UI/UX · Extraocular Motility clinical specification v2 · May 22, 2026*
