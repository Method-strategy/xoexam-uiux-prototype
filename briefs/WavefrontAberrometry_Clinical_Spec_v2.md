# Wavefront Aberrometry Test — Unified Clinical & Design Spec (v2)
## xoExam UI/UX · Method Marketing Agency · May 21, 2026
## Supersedes: `WavefrontAberrometry_Clinical_Prompt.md` (May 2026)

> This spec merges the v1 clinical prompt with (a) Method's clinical-accuracy audit and (b) the patterns established in xoExam v0.1.7 (Color Vision) and v0.1.8 (Visual Fields). It is the authoritative document for the Wavefront Aberrometry test stream and the source of truth for v0.1.9.

---

## A. What changed vs. the v1 prompt

### Carried forward unchanged
- Component extraction requirements (new file `WavefrontAberrometryTest.jsx`, `WFA_` prefix, `window` export, no duplication of `SimpleTestShell`).
- Test name correction ("Aberrometer Exam" → "Wavefront Aberrometry") throughout.
- Three-phase flow (`eye-selection → testing → report`) and four testing sub-stages (`init → calibrating → capturing → complete`).
- Axis as unsigned 0–180° (fix the impossible negative value).
- Spherical aberration unit fix (μm, not mm).
- Zernike Z₄⁰ notation in Zernike mode.
- Measurement table header color change (teal → navy `#0e2f5e`).
- Color-scale legend addition under the wavefront map.
- Result view types renamed and converted from a `<select>` to a segmented button control.
- Eye tab case correction ("LEFT EYE" / "RIGHT EYE" / "BOTH EYES" → sentence case).
- Clinical interpretation card with threshold bands (added — was missing).
- Cancel-test copy improvement (modal owned by ExamShell, not the test).
- All four wavefront view types preserved (Pupil image · Centroid image · Full wavefront · Higher orders only).
- Color gradient (`getWFColor` / `WFA_getWFColor`) preserved as clinically standard.
- Report actions renamed ("EXPORT EXAM" → "Export report"; "COMPARE EXAM" → "Compare"; "Save & Close" → "Certify & close").

### Clinical corrections to the v1 prompt

1. **Eye-sequence direction — OD first, not OS.** The v1 prompt says *"bilateral sequence (left eye first, then right) is correct — keep exactly."* This is clinically backwards. Universal medical convention is **OD (right) first, then OS** — matches patient charts, refraction records, and what we locked in for Color Vision v0.1.7 and Visual Fields v0.1.8. The current code's `testingEye: 'left'` default must be flipped.

   **Sequence rule:** when "both" is selected, run OD → OS as two discrete capture runs (Wavefront has no binocular-by-design mode — both is always two monocular runs).

2. **Analysis diameter and rmsHOA value consistency.** v1 specifies `measurementDiameter: 4.5 mm` with `rmsHOA: 0.284 μm` characterized as "slightly below normal." This is internally inconsistent — HOAs scale roughly as r⁴, so the "normal <0.3 μm" reference range applies to a **6mm pupil**, not 4.5mm. At 4.5mm, 0.284 μm reads as moderately elevated, which would mis-classify against the interpretation thresholds the spec also defines.

   **Fix:** change analysis diameter to **6.0 mm** (industry standard — NIDEK OPD-Scan, iDesign, Alcon WaveLight all report HOA at 6mm). Keep the rmsHOA values; they now correctly read as "good optical quality." Patient's actual pupil stays at 6.3 / 6.2 mm.

   ```js
   const WFA_EYE_DATA = {
     OD: { sphere:-1.25, cylinder:-0.50, axis:165, pupilDiameter:6.2, analysisDiameter:6.0, measurements:3, sphericalAberration:0.087, rmsHOA:0.261, comaRMS:0.163 },
     OS: { sphere:-1.50, cylinder:-0.75, axis:170, pupilDiameter:6.3, analysisDiameter:6.0, measurements:3, sphericalAberration:0.092, rmsHOA:0.284, comaRMS:0.187 },
   };
   ```

   Spherical-aberration values nudged up slightly (0.087 / 0.092 μm) to be plausible at 6mm analysis — typical young-adult positive SA at 6mm is 0.08–0.15 μm.

3. **Eye-sequence design-system pattern.** v1 doesn't mention the OD↔OS transition affordances we established in CV v0.1.7 and VF v0.1.8. WFA must adopt the same pattern:
   - `WFA_InlineEyePicker` — segmented OD/OS/OU control. (Wavefront uses this on the eye-selection screen, not mid-test, since the testing phase is automated.)
   - `WFA_EyeBreadcrumb` — done ✓ / current accent / pending dimmed, shown in the testing-phase header during bilateral captures.
   - `WFA_TransitionPrompt` — full-screen modal between OD-complete and OS-init with breadcrumb + patient-positioning copy: *"Position the patient's left eye at the eyepiece. The system will recalibrate and recapture wavefront measurements."*

4. **Gradient buttons — design-system violation.** Per CLAUDE.md (and corrected in the v0.1.8 sweep), the xoExam design system uses **solid accent backgrounds — no gradients**. The existing `AberrometerTest` uses `linear-gradient(135deg, ${accent}, #155bcc)` in multiple places (start button, continue button, save button). Replace every instance with solid `accent`.

5. **Additional typography sweep misses from v1.**
   - "BEGIN CAPTURE" → "Begin capture"
   - "Test Right Eye →" → "Continue to left eye →" (changes with OD-first sequence)
   - View selector currently styled `background:'#0d9488'` (teal) — palette violation. Replace with the standard segmented-button look (light gray container, white selected pill with `#111827` text).
   - "Pupil Size: 4.0 mm" hardcoded in patient information card — remove (redundant with the measurement table; also clinically inconsistent with the per-eye 6.2 / 6.3 mm values in `WFA_EYE_DATA`).

---

## B. Doctor sign-off pattern (new — groundwork for the Roles & Remote Operation pass)

Wavefront Aberrometry is the first test to introduce the **doctor sign-off** visual cue. This is groundwork for the post-beta "Roles & Remote Operation" design pass (CLAUDE.md), which will formalize the Technician vs. Doctor permission model. For v0.1.9 we add the visual hint only — no role enforcement yet.

### Placement
In the report phase, immediately above the **Certify & close** primary button.

### Visual
Small label, 11px, sentence case, accent color. Optional small dot or chevron prefix. Reads:

> **Doctor sign-off**

### Why "Doctor sign-off"
- **"Sign-off"** is the standard EHR term for a clinician taking authoritative ownership of a result (Epic, Cerner, NextGen all use this).
- **"Doctor"** correctly covers both **MDs (ophthalmologists)** and **ODs (optometrists)** — both are licensed xoExam users. *"Physician"* would exclude ODs (major user base) and *"Provider"* reads as American-HMO jargon.
- Names the *action* (sign-off), not the *restriction* ("only," "required") — respectful framing.

### Future state (not in v0.1.9 — flagged for Roles pass)
When a tech is signed in, the Certify & close button is disabled and the label reads *"Awaiting doctor sign-off."* When a doctor is signed in, the label reads *"Doctor sign-off"* and the button is enabled. The auth/role model required to drive these states is not in v0.1.9 scope.

---

## C. Component contract

```js
// WavefrontAberrometryTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Extracted from RemainingTests.jsx

function WavefrontAberrometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
}

Object.assign(window, { WavefrontAberrometryTest });
```

All top-level identifiers prefixed `WFA_` (`WFA_EYE_DATA`, `WFA_getWFColor`, `WFA_makeGrid`, `WFA_InlineEyePicker`, `WFA_EyeBreadcrumb`, `WFA_TransitionPrompt`, `WFA_CircularProgress`, `WFA_CentroidImage`, `WFA_WavefrontGrid`, `WFA_MeasTable`, `WFA_getInterp`, `WFA_REPORT_LABEL`, etc.).

Wrapper: `<ExamShell>` with three phases (`ready` = eye-selection · `testing` = init→calibrating→capturing→complete · `report`). Cancel UX is owned by ExamShell — the test must not build its own cancel button or modal.

`SimpleTestShell` is **not** copied — it stays in `RemainingTests.jsx`. The alias `const WavefrontAberrometer = AberrometerTest;` and the `AberrometerTest` function itself are removed from `RemainingTests.jsx` and from its `Object.assign(window, {…})` export list.

Routing in `xoExam Prototype.html`:
```jsx
case 'aberrometer':           return <WavefrontAberrometryTest {...props}/>;
case 'wavefront':             return <WavefrontAberrometryTest {...props}/>;  // alias case → same component
```

---

## D. Phase-by-phase requirements

### `ready` phase (eye-selection)
- ExamShell header: title = "Wavefront Aberrometry"; left back arrow visible.
- Body: card with `WFA_InlineEyePicker` (OD / OS / OU). Default selection: **OD**.
- Begin button = ExamShell's standard "Begin Test" — provided by ExamShell `onBegin` prop. (No inline Start button.)

### `testing` phase
- ExamShell header: title shows "Wavefront Aberrometry — Right eye (OD)" or "— Left eye (OS)" based on `testingEye`. Cancel-test button (red, labeled) shown on right by ExamShell. No `onFinish` during init/calibrating/capturing. When `stage === 'complete'`, show ExamShell's green "Finish & Report" button — this advances to OS (in bilateral mode) or to the report.

- **`init` substage:** central card with eye icon, "Position right eye" headline, three collapsibles (Patient Alignment · Pupil Detection · Focus Level), and a solid-accent "Begin capture" button. Below the headline, when bilateral, show `WFA_EyeBreadcrumb` so the doctor sees progress.

- **`calibrating` substage:** `WFA_CircularProgress` (the existing simulated eye-scan animation) with label "Calibrating system…" and elapsed timer. Auto-advances at 5%/100ms.

- **`capturing` substage:** same component, label "Capturing wavefront data…", auto-advances at 3%/100ms.

- **`complete` substage:** green check icon, "Measurement complete" headline, 2×3 grid of summary tiles: Sphere · Cylinder · Axis · Total HOA RMS · Coma RMS · Test duration. If `rmsHOA > 0.30` show an amber clinical flag: *"Elevated higher-order aberrations detected."*

### `report` phase
- Patient information card (4-column grid): Patient name · Birthdate · Patient ID · Eye(s) tested · Exam type · Exam date · Start time · Test duration · Analysis diameter · Measurements averaged. (Remove the old hardcoded "Pupil Size: 4.0 mm" field.)

- **Results card** — header "Wavefront analysis results":
  - Segmented button control for view type (Pupil image · Centroid image · Full wavefront · Higher orders only). No `<select>` dropdown.
  - Eye tabs: Left eye · Right eye · Both eyes (sentence case).
  - Zernike mode toggle (only when view is full-wavefront or higher orders only).
  - Image display row (one or two eyes side-by-side depending on selection).
  - **Color-scale legend** under the wavefront map: horizontal gradient bar (blue → green → yellow → red → pink), labels "−60 μm" / "0" / "+60 μm".
  - Measurement table with navy header (`#0e2f5e`), columns "Left eye (OS)" / "Right eye (OD)", rows: Sphere · Cylinder · Axis · Pupil diameter · Analysis diameter · Measurements taken · Spherical aberration · Total HOA RMS · Coma RMS. Units: D, °, mm, μm (lowercase μ, lowercase m where applicable).

- **Clinical interpretation card** — accent at 6% bg, accent at 20% border. Logic:
  ```js
  function WFA_getInterp(data) {
    if (data.rmsHOA < 0.15) return { band:'normal',  text:'Excellent optical quality. Higher-order aberrations within optimal range.' };
    if (data.rmsHOA < 0.30) return { band:'normal',  text:'Good optical quality. Higher-order aberrations within normal limits.' };
    if (data.rmsHOA < 0.45) return { band:'mild',    text:'Mildly elevated higher-order aberrations. Consider impact on visual quality and refractive surgery candidacy.' };
    return                       { band:'high',    text:'Significantly elevated higher-order aberrations. Detailed corneal assessment recommended. Refractive surgery candidacy requires further evaluation.' };
  }
  ```
  Normal: green tint. Mild: amber tint. High: red tint.

- **Session notes** card — textarea, label "Session notes" (sentence case).

- **Actions** row:
  - Left: secondary "Export report" + "Compare" + (ExamShell-provided) "New Test"
  - Right: small "Doctor sign-off" label above the primary "Certify & close" button.

---

## E. What MUST NOT change

- Three-phase flow + four sub-stages (init → calibrating → capturing → complete).
- Circular progress simulation timings (5%/100ms calibrating, 3%/100ms capturing).
- Four view types (Pupil image · Centroid image · Full wavefront · Higher orders only).
- Wavefront color gradient (`WFA_getWFColor`) — clinically standard, must not be altered.
- Wavefront grid SVG (17×17 disc) and centroid image SVG rendering.
- Three readiness collapsibles (Alignment, Pupil, Focus) — content preserved, sentence-case headers.
- `Object.assign(window, { WavefrontAberrometryTest })`.

---

## F. What MUST NOT carry over from `RemainingTests.jsx`

- `SimpleTestShell` — stays in `RemainingTests.jsx` for other tests.
- The `WavefrontAberrometer` alias line — `xoExam Prototype.html` is updated instead to route both cases to `WavefrontAberrometryTest`.
- `AberrometerTest` function — removed from `RemainingTests.jsx` entirely; removed from its `window` export.
- Any cancel modal — ExamShell owns this.

---

## G. Open engineering questions (handoff)

Add to the Engineering Handoff Spec at the v0.1.9 reissue (Section 10):

- **Real measurement diameter range** — what pupil diameters does the xoExam headset's Hartmann-Shack sensor support for HOA analysis? (We've assumed 6.0mm industry-standard. Confirm with hardware spec.)
- **Number of frames averaged** — is "3 measurements" the firmware default, configurable, or adaptive? UI currently shows it as a fixed value.
- **Zernike output format** — does the firmware return full Zernike coefficient vector (Z₂⁻² through Z₆⁺⁶, OSA/ANSI ordering) or only summary metrics? UI currently displays Z₄⁰, total HOA RMS, and coma RMS — but a real Zernike-mode view would benefit from a coefficient table or 2D pyramid visualization.
- **Color-scale range** — the prototype labels the legend as "−60 μm / 0 / +60 μm." Confirm the actual diopter or micron range emitted by the firmware so the legend matches.
- **Doctor sign-off role gating** — depends on the authentication / role model (open question #7 in the existing handoff spec). v0.1.9 ships the visual hint only; enforcement requires the auth contract to be settled.

---

*Method Marketing Agency · xoExam UI/UX · Wavefront Aberrometry clinical specification v2 · May 21, 2026*
