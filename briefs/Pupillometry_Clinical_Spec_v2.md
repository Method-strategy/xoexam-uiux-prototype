# Pupillometry — Unified Clinical & Design Spec (v2)
## xoExam UI/UX · Method Marketing Agency · May 22, 2026
## Initial spec (no v1 prompt) — scoping document for the v0.2.5 clinical-fidelity rebuild

> Pupillometry has been in the prototype as a visual/interaction sketch since v0.1.0 but has never been brought to clinical fidelity. This document is the v2 spec written from clinical research, intended to drive the v0.2.5 rebuild that closes beta scope (Pupillometry is the sixth and final beta-scope test).

---

## A. Clinical scope

Pupillometry in xoExam is broader than the current implementation suggests. The current code measures static pupil diameter at three light levels and computes anisocoria. Real clinical pupillometry covers:

1. **Static pupil size** under standardized conditions (scotopic, mesopic, photopic)
2. **Anisocoria assessment** — measured in both bright and dim light to distinguish physiological from pathological causes
3. **Dynamic pupillary light reflex (PLR)** — time-course of constriction and redilation in response to a light stimulus
4. **Swinging flashlight test for RAPD** (relative afferent pupillary defect, Marcus Gunn pupil) — the most clinically important pupillary sign for optic nerve / retinal disease
5. **NPi (Neurological Pupil index)** — a 0–5 composite score combining size, constriction velocity, latency, and dilation velocity. Standard in neuro-ICU and ED for monitoring intracranial pressure and brainstem function

The v0.2.5 spec covers all five. A pragmatic scope split is proposed in §E so the rebuild ships a clinically credible Pupillometry test even if some sub-tests are deferred for hardware confirmation.

---

## B. What's in the current implementation (v0.1.0–v0.2.4)

From `components/PupillometryTest.jsx` (~237 lines):

- Three light-level selector pills: Scotopic / Mesopic / Photopic with reference lux values
- Eye toggle (right / left) with measurement display
- Animated pupil simulation (iris with breathing pupil)
- Static measurement capture: a value derived from the base size + small random jitter
- Right sidebar: patient info + per-eye measurements + anisocoria computation (>1mm flagged as "Significant")
- "Begin Test" / "Pause" / "Capture OD/OS" / "New Test" / "Save Results" / "Print Report" action buttons

### What's clinically incomplete or incorrect

1. **No dynamic measurements.** The current capture is a single static diameter value with no constriction velocity, latency, redilation, or time-course data. Real pupillometry is fundamentally a dynamic measurement — that's what NPi and RAPD rely on.

2. **No swinging flashlight test (RAPD).** This is the most clinically important pupillary test. Its absence means optic nerve disease (the most common reason a doctor orders pupillometry) can't be detected.

3. **No NPi calculation.** Standard in neuro-ICU and ED settings; should be available given the headset's gaze-tracking capability.

4. **Anisocoria threshold simplistic.** Current code: `>1mm = significant`. Clinically correct gradient is:
   - **< 0.4 mm:** within normal physiological range (most people)
   - **0.4–1.0 mm:** mild anisocoria — physiological in ~20% of population if symmetric in light and dark
   - **> 1.0 mm:** moderate/significant — almost always pathological
   - **Changes with light:** the key clinical distinguisher. Worse-in-dark = sympathetic problem (Horner's, simple anisocoria). Worse-in-light = parasympathetic (CN III palsy, Adie's, pharmacologic).
   - The current implementation only measures at one light condition at a time, missing the light/dark comparison entirely.

5. **No age-banded reference table.** Pupil size decreases with age (senile miosis). A 6.5 mm scotopic pupil is normal at 25 but unusual at 75.

6. **UI style inconsistencies with the rest of the prototype:**
   - Dark theme on the iris viewer is okay (matches the clinical "dim room" feel for pupillometry) BUT the overall UI is light per the design system — dark exam screens are reserved for stimulus-presenting tests (refraction, contrast). Pupillometry doesn't need a dark UI; the iris itself is what's dark.
   - `linear-gradient(135deg, accent, #155bcc)` on the Begin Test button violates the no-gradient rule established in v0.1.8+
   - Light-level pills use vivid color backgrounds (purple / blue / amber) for each level — these aren't in the brand palette, and reading them as severity-coded is misleading (scotopic is not "purple severity")
   - `⚠ Significant` / `✓ Normal` emoji-style indicators violate the no-emoji rule (use SVG icons)
   - "Save Results" / "Print Report" action buttons don't match the canonical "Export report" / "Compare" / "Certify & close" trio used in every clinical-fidelity test

7. **Not on ExamShell.** The test has its own header chrome (back button, title, timer pill, action row). This means the canonical Cancel UX is not in effect — the doctor can lose data by hitting back during testing. Must be refactored onto ExamShell like every other clinical-fidelity test.

8. **No OD-first sequence pattern.** The current code defaults to right eye then left, which is OD-first by coincidence, but there's no explicit InlineEyePicker / EyeBreadcrumb / TransitionPrompt pattern. Should follow the convention established in v0.1.7 / v0.1.8 / v0.1.9 / v0.2.1.

9. **No Doctor sign-off pattern.** Established in v0.1.9 as standard on every clinical-fidelity test.

10. **No Patient Classification banner.** Established in WFA / VF / EOM reports.

11. **No clinical interpretation card.** No logic surfacing "pattern consistent with Horner's syndrome" or "consider optic neuropathy — RAPD detected."

---

## C. Component contract (target for v0.2.5)

```js
// PupillometryTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Rebuilt onto ExamShell with full clinical-fidelity logic.

function PupillometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
}

Object.assign(window, { PupillometryTest });
```

All top-level identifiers prefixed `PUP_` (`PUP_LIGHT_CONDITIONS`, `PUP_AGE_NORMS`, `PUP_getAnisocoriaSeverity`, `PUP_computeNPi`, `PUP_getInterp`, `PUP_LightReflexChart`, etc.).

Wrapped in `<ExamShell>` with three phases (`ready` = setup · `testing` = sub-step state machine · `report`). Cancel UX owned by ExamShell. Sentence-case labels. Solid accent backgrounds. No gradients.

Routing in `index.html` unchanged:
```jsx
case 'pupillometry': return <PupillometryTest {...props}/>;
```

---

## D. Data model

### Light conditions

```js
const PUP_LIGHT_CONDITIONS = [
  { id:'scotopic',  label:'Scotopic',  lux:'< 0.001 lux', desc:'Dark-adapted (≥ 5 min in darkness)' },
  { id:'mesopic',   label:'Mesopic',   lux:'0.001–3 lux', desc:'Dim ambient light' },
  { id:'photopic',  label:'Photopic',  lux:'> 3 lux',     desc:'Bright ambient light' },
];
```

### Age-banded pupil size norms (Winn et al. 1994 / clinical convention)

```js
// Scotopic / mesopic / photopic pupil diameter ranges by age band.
// Values are mm; both bounds are means ± 1 SD of the population.
const PUP_AGE_NORMS = [
  { age:'20–29', scotopic:[6.0, 8.0], mesopic:[4.5, 6.0], photopic:[2.5, 4.0] },
  { age:'30–39', scotopic:[5.7, 7.6], mesopic:[4.3, 5.8], photopic:[2.4, 3.9] },
  { age:'40–49', scotopic:[5.4, 7.1], mesopic:[4.0, 5.4], photopic:[2.3, 3.7] },
  { age:'50–59', scotopic:[5.0, 6.6], mesopic:[3.7, 5.0], photopic:[2.2, 3.5] },
  { age:'60–69', scotopic:[4.6, 6.1], mesopic:[3.4, 4.6], photopic:[2.1, 3.3] },
  { age:'70+',   scotopic:[4.2, 5.7], mesopic:[3.1, 4.3], photopic:[2.0, 3.1] },
];
```

### Anisocoria severity

```js
function PUP_getAnisocoriaSeverity(diffMm, conditionDelta) {
  // diffMm = absolute |OD - OS| in mm
  // conditionDelta = |anisocoriaInDark - anisocoriaInLight| in mm
  if (diffMm < 0.4) return { band:'normal', text:'Within physiological range' };
  if (diffMm <= 1.0 && conditionDelta < 0.3) return { band:'normal', text:'Mild anisocoria, equal in light and dark — physiological' };
  if (conditionDelta >= 0.3) {
    // Anisocoria changes with light → pathological
    // (Direction depends on which condition shows the larger difference)
    return { band:'significant', text:'Anisocoria varies with light — pathological cause likely (sympathetic or parasympathetic dysfunction)' };
  }
  if (diffMm > 1.0) return { band:'significant', text:'Significant anisocoria — clinical correlation required' };
  return { band:'mild', text:'Mild anisocoria — monitor; compare light and dark conditions' };
}
```

### Dynamic PLR (pupillary light reflex) measurements per eye

```js
// Real pupillometry captures a time-course; this is the summary metric set
// extracted from it. All values are simulated for prototype; the production
// device computes them from the gaze-tracking time-series.
const PUP_DYNAMIC_SHAPE = {
  baselineSize:     5.4,  // mm, pre-stimulus
  minSize:          3.6,  // mm, peak constriction
  constrictionPct:  33.3, // (baseline - min) / baseline × 100
  latencyMs:        240,  // stimulus onset to constriction onset
  constrictionMs:   320,  // constriction onset to peak
  redilationMs:     1200, // peak to 75% recovery (T75)
  constrictionVel:  5.6,  // mm/sec, peak constriction velocity
  redilationVel:    1.5,  // mm/sec, peak redilation velocity
};
```

### NPi (Neurological Pupil index)

```js
// NPi: 0–5 composite of size + constriction velocity + latency + dilation velocity.
// Threshold conventions (NeurOptics NPi-200 reference):
//   ≥ 3.0 = normal
//   < 3.0 = abnormal
//   asymmetry > 0.7 between eyes = warning sign
//   decline > 0.7 from prior measurement = warning sign
function PUP_computeNPi(dynamics) {
  // Production firmware emits NPi directly; prototype computes a plausible value
  // from the dynamic shape. Real formula is NeurOptics-proprietary.
  // For prototype: scale of (constrictionPct/30) × (1 - latencyMs/600) × 5, clamped 0–5.
  const c = dynamics.constrictionPct / 30;
  const l = Math.max(0, 1 - dynamics.latencyMs / 600);
  return Math.max(0, Math.min(5, c * l * 5));
}
```

### RAPD (relative afferent pupillary defect) grading

```js
const PUP_RAPD_GRADES = [
  { id:'none', label:'No RAPD',       desc:'Both pupils constrict equally with swinging flashlight' },
  { id:'trace',label:'Trace RAPD',    desc:'Subtle dilation when light moves to affected eye' },
  { id:'1plus',label:'1+ RAPD',       desc:'Definite initial constriction, then redilation' },
  { id:'2plus',label:'2+ RAPD',       desc:'Slight initial constriction, prompt redilation' },
  { id:'3plus',label:'3+ RAPD',       desc:'No initial constriction, immediate dilation' },
  { id:'4plus',label:'4+ RAPD',       desc:'Amaurotic — no response to light in affected eye' },
];
```

---

## E. Phase / sub-step flow

```
ready (setup + config)
   ↓ Begin test
testing
   testStep state machine:
     static-od     → measure OD pupil at three light conditions
     static-os     → measure OS pupil at three light conditions
     dynamic-od    → (if enabled) measure dynamic PLR for OD
     dynamic-os    → (if enabled) measure dynamic PLR for OS
     swinging-flashlight → (if enabled) RAPD assessment
   ↓ Finish & report
report
```

Each sub-step has its own UI. ExamShell's green `Finish & Report` button enables only at the final enabled sub-step's completion state (same pattern as EOM v0.2.1).

### Configuration in the ready phase (setup)
- **Eye(s) to test:** OD-only / OS-only / OU (default OU)
- **Sub-tests:**
  - Static pupil size (binocular, three light conditions) — required, cannot be disabled
  - Dynamic light reflex (per-eye time-course measurement) — default on
  - Swinging flashlight (RAPD assessment) — default on
- **Patient age input** (drives the age-banded normal range)

---

## F. Phase-by-phase requirements

### `ready` phase
- ExamShell title: `Pupillometry`. Back arrow visible.
- Briefing card with iris-icon header, brief description ("Measure pupil size, light reflex, and detect afferent pupillary defects").
- Configuration:
  - Eye-mode picker (`PUP_InlineEyePicker` — OD / OS / OU — pattern from v0.1.7 / v0.1.8)
  - Sub-test checkboxes (Static, Dynamic, Swinging flashlight)
  - Age input (number field, used for age-banded normal range lookup)
- Begin button via ExamShell `onBegin` prop.

### `testing` phase — static sub-step (per eye)
- Sub-bar showing: eye chip · sub-test name · progress through three light conditions
- Two-column layout:
  - **Left (50%):** Animated iris/pupil viewer (carry over from current implementation — it's the strongest visual element). Light condition cycles automatically (scotopic → wait 30s for adaptation → mesopic → wait 5s → photopic). Pupil simulation reflects the active condition.
  - **Right (50%):** Three measurement cards (one per light condition), each shows captured diameter + status (pending / captured), Capture button when active, age-banded reference range below the captured value
- After all three conditions captured for current eye, advance to next eye or next sub-step

### `testing` phase — dynamic sub-step (per eye)
- Sub-bar showing: eye chip · "Dynamic light reflex"
- Light stimulus flashes (visual indicator: bright pulse animation)
- Real-time PLR chart (`PUP_LightReflexChart` — line graph of pupil size vs. time over the 3-second response window)
- Captured summary metrics displayed below the chart:
  - Baseline size (mm) · Min size (mm) · Constriction (%) · Latency (ms) · Constriction velocity (mm/sec) · Redilation T75 (ms)
- Calculated NPi shown in a prominent tile (color-coded: ≥3 green, <3 amber/red)
- Next button advances after one capture (firmware averages multiple internally)

### `testing` phase — swinging flashlight sub-step
- Single-screen sub-test
- Visual indicator showing light alternating between OD and OS (3-second dwell each side, ~3 cycles)
- Doctor grades RAPD: 6-option selector (None / Trace / 1+ / 2+ / 3+ / 4+) per eye if either is affected
- Default selection: None
- Brief reference text below: "Watch for the affected eye to dilate when the light moves to it — that's the positive RAPD finding."

### Right sidebar during testing (`rightPanel` prop)
- "Progress" violator + sub-test progression list (Static OD · Static OS · Dynamic OD · Dynamic OS · Swinging flashlight, with done ✓ / current accent / pending dim states)
- "Session notes" violator + textarea

### `report` phase
- **Patient Classification banner** — worst-finding-drives-bottom-line. Severity tiers:
  - **Normal:** All pupil sizes within age-banded reference range; anisocoria < 0.4 mm; NPi ≥ 3 both eyes; no RAPD
  - **Mild:** Mild anisocoria (0.4–1.0 mm, symmetric in light/dark); pupil sizes 1 SD outside age band; NPi 2.5–3.0
  - **Significant:** Significant anisocoria (>1 mm OR varies with light); NPi <2.5 either eye; RAPD ≥ 1+
- **Patient information card** — Name · Birthdate · ID · Age · Exam date/time/duration · Tests performed
- **Static measurements table** — 3 light conditions × 2 eyes grid. Each cell shows captured diameter, age-banded reference range, deviation flag if outside range. Includes Anisocoria row at bottom (calculated separately for each light condition + the light-dark differential).
- **Dynamic measurements card** (if dynamic sub-test ran) — per-eye PLR chart + summary metrics table. NPi prominently displayed per eye with severity color.
- **RAPD assessment card** (if swinging flashlight ran) — per-eye selected grade + clinical descriptor + interpretation.
- **CN III / Horner's / RAPD clinical flag** (conditional, prominent red surface, SVG warning icon) — surfaces automatically when:
  - Anisocoria >1mm AND varies with light: "Pattern consistent with sympathetic (Horner's) or parasympathetic (CN III, Adie's, pharmacologic) dysfunction. Clinical correlation required."
  - RAPD ≥ 1+: "Relative afferent pupillary defect detected on {eye}. Consistent with optic nerve disease or extensive retinal disease. Neuro-ophthalmic referral recommended."
  - NPi < 2.5 either eye: "Reduced neurological pupil index. Consider intracranial pathology, brainstem dysfunction, or pharmacologic effect. Clinical correlation required."
- **Clinical Interpretation card** — paragraph-form summary of the findings with severity tint.
- **Age-banded reference values** card — small printout of the age-band ranges so the report stands alone.
- **Session notes** card.
- **Actions row** with **Doctor sign-off** label above primary "Certify & close" button (v0.1.9 pattern).

---

## G. Scope-cut options for v0.2.5 (in case implementation runs long)

If full scope is not feasible in v0.2.5 alone, the recommended cuts in priority order (drop first):

1. **Swinging flashlight / RAPD assessment** — most clinically valuable, last to drop. Keep if at all possible.
2. **NPi** — most novel; depends on dynamic measurements. Drop second.
3. **Dynamic PLR sub-test entirely** — drop third. Keeps static-only Pupillometry as a credible baseline test that closes beta scope; dynamic + NPi + RAPD ship in a v0.3.x follow-on.

The full ExamShell refactor + Patient Classification banner + Doctor sign-off + light/dark anisocoria + age-banded norms MUST ship regardless — these are the parity items that bring Pupillometry in line with the other clinical-fidelity tests.

---

## H. Open clinical questions (for engineering handoff)

- **Dynamic data shape from firmware.** Does the headset emit a time-series of pupil diameter measurements (e.g., 30 Hz sample rate), or only summary metrics (baseline, min, latency, etc.)? Determines whether the UI displays a live PLR chart or just the summary numbers.
- **NPi computation location.** Is NPi computed firmware-side (Neuroptics-style proprietary algorithm) or do we compute from the time-series in the UI/cloud? Most likely firmware-side per Neuroptics convention.
- **Swinging flashlight automation.** Does the headset present the alternating light stimulus automatically, or does the technician manually trigger left/right alternation? Affects whether the UI is a passive viewer or an active controller during the RAPD sub-test.
- **Pupil response clicker.** Pupillometry does not use the patient clicker (the patient is passive). Confirm.
- **Pharmacological pupillometry workflow.** Cocaine and apraclonidine tests (for Horner's syndrome confirmation) and pilocarpine test (for Adie's pupil) follow specific dilation protocols. Out of scope for v0.2.5 but flag if Xenon plans to support these.
- **Ambient light measurement.** Does the headset measure the actual ambient light (lux) inside the device, or do we assume the patient is in a calibrated dark room? Affects whether "scotopic / mesopic / photopic" is a measured condition or a configured assumption.
- **Adaptation time enforcement.** Scotopic measurements require ≥ 5 minutes of dark adaptation for valid results. Does the firmware enforce this timing, or does the UI need to display a countdown timer?

---

## I. Implementation plan (for the v0.2.5 fresh-session work)

1. **Read this spec.** Treat it as authoritative — the clinical research is captured here.
2. **Refactor `PupillometryTest.jsx` onto ExamShell** with three phases (ready / testing / report). Use the EOM v0.2.1 sub-test state machine pattern as the architectural reference.
3. **Add `PUP_` prefixed constants and helpers** per §D.
4. **Migrate the iris/pupil viewer** — it's the strongest existing visual element; keep it and update for the dynamic sub-step too.
5. **Implement the three sub-steps** per §F. Use scope-cut option from §G if running long.
6. **Build the report** per §F, including Patient Classification banner, CN III/Horner's/RAPD flag, Clinical Interpretation card, and Doctor sign-off.
7. **Strip the dark-themed chrome** — match the light-theme convention of the other clinical-fidelity tests.
8. **Sweep gradients to solid accent, remove emoji, sentence-case all labels.**
9. **Update the Clinical Evaluation Brief** to add a Pupillometry section with the standard structure (clinical purpose · reference standard · what the UI does · what we'd like the panel to evaluate).
10. **Update the Clinical Standards Reference** with the full Pupillometry section.
11. **Update CLAUDE.md** with the v0.2.5 entry. **Reissue Engineering Handoff Specification at v0.2.5** (clinical-fidelity milestone — last full reissue was v0.2.1; this is overdue and closes beta scope). Per-release brief + cumulative brief update. Build `_dist_v0.2.5/`.
12. **This is the beta-closing release** — give it the full ceremony.

---

*Method Marketing Agency · xoExam UI/UX · Pupillometry clinical specification v2 · May 22, 2026*
