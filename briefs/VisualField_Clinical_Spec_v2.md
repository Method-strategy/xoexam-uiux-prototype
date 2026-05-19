# Visual Fields Test — Unified Clinical & Design Spec (v2)
## xoExam UI/UX · Method Marketing Agency · May 18, 2026
## Supersedes: `VisualField_Clinical_Prompt.md` (May 2026)

> This spec merges the original Visual Field clinical prompt with (a) clinical-accuracy corrections drawn from the Humphrey Field Analyzer (HFA) reference standard and (b) the patterns established in xoExam v0.1.4 (Visual Acuity) and v0.1.7 (Color Vision). It is the authoritative document for the Visual Field test stream.

---

## A. What changed vs. the v1 prompt

### Carried forward unchanged
- Component identity (`VisualFieldTest({onBack, tweaks})`, `VF_` prefix, `window` export).
- Goldmann spelling sweep ("Goldman" → "Goldmann") throughout.
- Goldmann III as stimulus-size default.
- SITA-Fast as strategy default.
- Background-luminance documentation (31.5 apostilbs ≈ 10 cd/m²) shown in the report.
- All seven monocular patterns and all four binocular patterns, IDs preserved.
- Mock data structure (`VF_LEFT_DATA`, `VF_RIGHT_DATA`).
- The `VFSensGrid` (renamed `VF_SensGrid`) grayscale sensitivity map and its color coding.
- Lens controls clinical ranges and 0.25D / 1° steps; documented in report.
- The clinical interpretation thresholds in `getInterp()` (now `VF_getInterp()`).
- Sentence-case button labels and "Certify & close" renaming.
- Session-notes textarea in the testing-phase right sidebar.

### Clinical corrections to the v1 prompt
1. **Eye-sequence direction.** The v1 prompt's "left eye first, then right" is clinically backwards — universal medical convention is **OD (right) first, then OS, then OU**. This matches the convention we locked in for Color Vision v0.1.7. The current code's `testingEye: 'left'` default is therefore also wrong and must be flipped.
2. **SITA-Fast duration.** The v1 prompt cites "~3 min per eye." More accurate published HFA timing is ~4 min per eye for SITA-Fast on a 24-2; SITA Faster (a newer algorithm) is ~3 min. Keep the existing 0.8%/300ms simulation (~6 min) — that is realistic for a slower patient on SITA-Fast and the doctor will perceive it as appropriate.
3. **Reliability index thresholds.** v1 used FP <15% / FN <20% / FL <20%. The modern published consensus is:
   - **FP < 15%** — modern stricter cutoff (correct).
   - **FN < 33%** — the HFA's own "XX flag" threshold. Use 33% as the *unreliable* boundary, and treat 20–33% as *borderline / amber*. The original prompt's 20% is too strict — it would flag a large fraction of normal SITA tests on attentive patients.
   - **FL < 20%** — correct.
   So the bands become: **green < lower / amber middle / red ≥ upper**, with thresholds per index:
   - FP: green <8 · amber 8–14 · red ≥15
   - FN: green <15 · amber 15–32 · red ≥33
   - FL: green <10 · amber 10–19 · red ≥20
4. **Goldmann III stimulus area.** v1 said "4 mm²." The published HFA spec value is **4 mm²** projected at 1/3 m — keep, but format it as `4 mm²` not `4mm²` for typographic consistency.
5. **Goldmann V area.** v1 said "64 mm²." Correct.

### Clinical *omissions* in the v1 prompt — must be added
1. **GHT (Glaucoma Hemifield Test)** — the most clinically important categorical output on a real HFA printout for any glaucoma-screening pattern (24-2, 30-2, 10-2). The five categorical results are:
   - Within Normal Limits
   - Borderline
   - Outside Normal Limits
   - General Reduction of Sensitivity
   - Abnormally High Sensitivity *(rare; trigger-happy patient)*
   Add `ght: 'Outside Normal Limits'` to `VF_RIGHT_DATA` and `ght: 'Within Normal Limits'` to `VF_LEFT_DATA` as mock values. Display GHT as a pill on the per-eye result card (color-coded: green WNL, amber Borderline, red ONL/General Reduction, amber Abnormally High).
2. **Total Deviation & Pattern Deviation probability plots.** On a real HFA printout these sit beside the sensitivity grayscale, not buried in an "Advanced" toggle. Surface them as a small dual-plot block in the report under each eye (5×5 grid of probability symbols: `.`, `<5%`, `<2%`, `<1%`, `<0.5%`). For prototype, generate from the mock grid by a simple "below 25 dB" cascade — Design picks the visual treatment.
3. **Age-matched reference values.** Match the Color Vision report's Vingrys & King-Smith reference table pattern. Add a small table at the bottom of the per-eye section showing expected normal MD by decade (e.g., **20–30:** −0.3 dB · **40–50:** −0.7 dB · **60–70:** −1.5 dB · **70–80:** −2.4 dB · **80+:** −3.6 dB) so the doctor can compare the patient's MD to age-band normals without leaving the report.
4. **Foveal threshold in dB** — captured the v1 prompt's request, but specify storage shape: per-eye, e.g. `fovealThreshold: { OD: 33, OS: 32 }`. Display under Patient Information *and* annotate on the sensitivity map's central dot as a small `34 dB` label.
5. **Pattern-specific point counts** in the testing-phase header (10-2: 68 points · 24-2: 54 · 30-2: 76 · Esterman: 120) so the Responses gaze-bar maximum is correct for whichever pattern is being run, not hard-coded to 54.

---

## B. Architectural reconciliation — folding into our design system

### B1. Six-phase flow under ExamShell's three-phase contract

The v1 prompt mandates **six phases**: `eye-selection → config → pattern → foveal → conducting → report`. Our canonical ExamShell contract is **three phases**: `ready / testing / report`. These are not in conflict — they collapse cleanly:

| ExamShell phase | Internal `vfStep` sub-state | Notes |
|---|---|---|
| `ready` | `eye-selection` | OD/OS/OU pickable; defaults to OD |
| `ready` | `config` | Stimulus size, strategy, brightness, contrast, result format |
| `ready` | `pattern` | Pattern selection (7 monocular + 4 binocular) |
| `ready` | `foveal` | Foveal calibration (returns `fovealThreshold` in dB) |
| `testing` | `conducting` | Live exam with lens controls + gaze bars |
| `report` | — | Per-eye report + cumulative |

**Why this matters:** keeping the four pre-test sub-states under `ready` lets ExamShell handle Cancel correctly. In `ready` the back arrow returns without confirm (pre-test = no data loss). The moment foveal completes and we transition to `testing`, ExamShell hides the back arrow and shows the red "Cancel test" button. The doctor cannot accidentally exit mid-test.

**Implementation:**
```js
const [phase, setPhase] = React.useState('ready');         // ExamShell phase
const [vfStep, setVfStep] = React.useState('eye-selection'); // internal pre-test step
```

Render switch inside `ExamShell`:
```jsx
{phase === 'ready'   && vfStep === 'eye-selection' && renderEyeSelection()}
{phase === 'ready'   && vfStep === 'config'        && renderConfig()}
{phase === 'ready'   && vfStep === 'pattern'       && renderPatternSelection()}
{phase === 'ready'   && vfStep === 'foveal'        && renderFoveal()}
{phase === 'testing' && renderConducting()}
{phase === 'report'  && renderReport()}
```

### B2. Cancel UX — delete the custom dialog

The v1 prompt's cancel-dialog requirement (stacked vertical buttons, custom copy) **conflicts with our canonical cancel UX** (owned by ExamShell, side-by-side buttons, fixed copy). Per the Component Interface Contract in `CLAUDE.md`:

> Test components MUST NOT build their own cancel buttons or confirmation dialogs.

Remove `showCancel` state and any in-component cancel modal from `VisualFieldTest.jsx`. ExamShell handles it. The component passes plain `onBack`.

### B3. Eye sequence — adopt the v0.1.7 mono-mono-binocular pattern

Color Vision v0.1.7 established the canonical pattern for any test that runs separately per eye: **OD → OS → OU**, three discrete runs, transition modals between phases, doctor can pick start eye, picker locks when first response is recorded. Visual Field must follow this with one **clinically necessary exception**:

| Pattern type | Eye-sequence behaviour |
|---|---|
| All 7 monocular patterns (10-1, 10-2, 24-1, 24-2, 30-2, Screening, Goldmann/Kinetic) | Three discrete runs: OD → OS → OU. Doctor may pick start eye (default OD) or run a single monocular eye only. |
| All 4 binocular patterns (Esterman, mEsterman, FDP, cFDP) | **Single OU run only.** Clinically these protocols are *defined* as binocular — Esterman is a DVLA/DMV binocular driving-fitness test by specification, FDP is a binocular frequency-doubling protocol. Skip the OD→OS→OU sequence entirely. The eye-selection sub-step is hidden for these patterns. |

Reuse from Color Vision (lift into shared scope or duplicate as `VF_*`):
- `VF_InlineEyePicker` — the 3-pill OD/OS/OU segmented control in the testing sub-bar.
- `VF_EyeBreadcrumb` — the done/current/pending/skipped progress diagram in the sub-bar.
- `VF_StartEyePicker` — the eye-sequence picker on the eye-selection sub-step.
- The transition modal (with 3-eye progress diagram + patient-positioning copy) between eye phases.

Patient-positioning copy for VF transitions:
- **→ OS:** *"Cover the patient's right eye with the occluder. Position the left eye at the eyepiece. The patient should fixate on the central target."*
- **→ OU:** *"Remove the occluder. Patient views with both eyes open. Adjust the IPD if needed."*

### B4. Report structure — match VA and Color Vision

The report renders as a **cumulative multi-eye report** that follows the v0.1.7 Color Vision structure exactly, adapted for VF data:

1. **Patient Classification banner** (the clinical bottom line)
   - Drives off the *worse* of the two monocular eyes' severity (worst MD + worst VFI gates the band).
   - Bands: Normal · Mild · Moderate · Advanced visual field loss.
   - Color coded per the v1 prompt's MD/VFI bands.
   - Special override: if either eye returned **GHT = Outside Normal Limits**, force the banner to at least "Mild — referral indicated" even if MD is within normal limits (this is the standard clinical reading rule for early glaucoma).
   - One-sentence clinical interpretation under the band, per v1 prompt.

2. **Per-eye result cards in a 1–3 column grid** (one card per eye actually tested)
   - OD card · OS card · OU card.
   - Each card shows: eye label, GHT pill, MD/PSD/VFI tiles (color-coded), foveal threshold, reliability indices (3 small bars or pills).
   - Reliability concern banner *on the card* if any of FP/FN/FL exceed red threshold.

3. **Per-eye detail sections** (full-width, one per eye)
   - Sensitivity map (existing `VF_SensGrid`, kept exactly).
   - Total Deviation plot (new).
   - Pattern Deviation plot (new).
   - Lens correction used during test (SPH/CYL/AXIS or "No correction applied").
   - Session notes (if entered).

4. **Reference values table** (single section, after per-eye details)
   - Age-band normal MD reference (table from §A.3 above).
   - HFA reliability-index thresholds (FP 15% / FN 33% / FL 20%) shown as a small key.
   - Calibration disclaimer matching the Color Vision report's pattern.

5. **Report actions** (in `ExamShell`'s rightPanel / footer per the canonical pattern)
   - **Export report** (secondary).
   - **Compare** (secondary).
   - **Certify & close** (primary).

### B5. Component-level corrections to current code

Mark these as required edits when the test-stream session opens the file:

| Current code | Required change |
|---|---|
| `useState('eye-selection')` for phase | Split into `phase` (ExamShell) + `vfStep` (internal); see B1 |
| `testingEye: 'left'` default | Flip to `'right'` (OD-first) per v0.1.7 |
| `eye === 'both'` runs single OU pass | Rebuild as OD→OS→OU sequence for monocular patterns; keep single OU for binocular patterns |
| Internal cancel modal (`showCancel`) | Delete; ExamShell owns this |
| `'CONTINUE'`, `'START CALIBRATION'`, etc. uppercase buttons | Sentence case |
| Header back arrow + custom title row | Remove; wrap in `<ExamShell title="Visual field" accent={accent} onBack={onBack} phase={phase} elapsed={elapsed} …>` |
| Button `linear-gradient(135deg, accent, #155bcc)` | Solid accent, design-system style (gradients aren't used elsewhere in the prototype) |
| Lens-stepper buttons 24×24 | 36×36 minimum (v1 prompt is correct) |
| Responses bar max hard-coded at 54 | Drive from `VF_POINT_COUNT[pattern]` |
| `getInterp()` | Rename `VF_getInterp()`; add the GHT override rule from §B4.1 |
| `VFSensGrid` | Rename `VF_SensGrid`; keep visual exactly |
| Pattern entry `Goldman / Kinetic` | `Goldmann / Kinetic` |
| Result format labels | "Standard" / "Advanced" / "Research" — already correct |

---

## C. Tweaks-panel exposure (per project pattern)

Surface two test-specific tweaks alongside the global `accentColor`:

- **Reliability index strictness:** `Standard` (FP 15 / FN 33 / FL 20) vs `Strict` (FP 10 / FN 20 / FL 15). Lets the practice tune to their internal QA bar.
- **Default start eye:** OD / OS. Some practices prefer OS-first for left-handed examiners.

Do not expose stimulus size, strategy, or pattern as global tweaks — these are per-exam clinical choices, not practice-wide defaults.

---

## D. Deliverable from the Visual Field test stream

Per the Component Interface Contract:

1. **`demo.html`** — standalone harness loading `ExamShell.jsx` + `VisualFieldTest.jsx`, mounted with `tweaks={{ accentColor:'#1f8eff' }}` and a placeholder `onBack`. Deployed to its own Netlify URL for client review.
2. **`VisualFieldTest.jsx`** — standalone component file, all top-level identifiers prefixed `VF_`, `Object.assign(window, { VisualFieldTest })` at the bottom, no internal cancel UX, wrapped in `ExamShell`, following A + B above.

The test-stream `ExamShell.jsx` is synced *from* this shell project, not the reverse. If the VF stream needs ExamShell to grow a new prop (e.g. `rightPanel` swap during foveal calibration), propose it back to the shell session first.

---

## E. Open clinical questions to confirm with client before build

These are not blocking the design pass but should be resolved before client launch:

1. **GHT calculation source:** for a real clinical product, the GHT category is derived from the HFA's proprietary hemifield comparison algorithm. The xoExam liquid-lens headset will need its own equivalent algorithm — confirm whether engineering's perimetry firmware will compute and return GHT, or whether xoExam will compute it cloud-side from raw threshold data.
2. **Liquid lens limits:** SPH ±14.00 D and CYL ±6.00 D are placeholder ranges from the v1 prompt. Confirm the headset's actual liquid-lens correction range with engineering before locking the UI ranges.
3. **Pattern point counts** for the proprietary `screen` (Screening) and `gold` (Goldmann/Kinetic) patterns. Standard HFA patterns are known (10-2: 68, 24-2: 54, 30-2: 76, Esterman: 120) — xoExam-specific patterns need confirmation.
4. **Foveal calibration scoring:** the v1 prompt asks for a single dB threshold output, but real HFA foveal testing returns a 4-of-4 staircase result. Confirm whether xoExam's firmware returns a single threshold or a 4-level response array.

---

*Method Marketing Agency · xoExam UI/UX · Visual Fields v2 spec · May 18, 2026*
*Supersedes `VisualField_Clinical_Prompt.md`. Carry this document into the Visual Field test stream.*
