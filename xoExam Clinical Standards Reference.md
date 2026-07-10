# xoExam™ UI/UX — Clinical Standards Reference
## A guide for the clinical team evaluating the prototype
### Method Marketing Agency · July 2026 · Version 0.3.0

---

> **v0.3.0 note — test-catalog visibility/ordering release, no clinical change.** v0.3.0 reorders the Tests selection grid to lead with a fixed clinical priority sequence (Wavefront Refraction → Visual Acuity → Wavefront Aberrometry → Color Vision → Visual Field → Extraocular Motility → Pupillometry) and hides the legacy standalone **Refraction** placeholder from the catalog and patient launcher (the combined Wavefront Refraction supersedes it; the component and routing are retained and restorable). No exam component, clinical algorithm, scale, scoring rule, reference standard, or report was modified. Every clinical detail in this document is unchanged from v0.2.8; the document is reissued only to keep the doc set on one unified version per the project's versioning rule.

---

> This document maps each clinically-faithful test in the xoExam™ prototype to the published clinical standards, reference protocols, and scoring conventions it has been designed against. It is intended for the clinical evaluation team (optometrists, ophthalmologists, technicians, regulatory reviewers) who will assess whether the user interface accurately reflects current clinical practice.
>
> This is **not** a regulatory submission, a clinical validation report, or a substitute for instrument calibration. It is a transparency document — a list of what the design adheres to so a clinician can quickly verify "does this match what I do in practice?"

---

## How to use this document

For each test, three things are documented:

1. **Reference standard** — the published clinical reference the test was designed against.
2. **What's implemented** — the specific clinical conventions visible in the user interface.
3. **Open clinical questions** — items still pending engineering or clinical decision; included so the evaluation team knows what is not yet final.

Tests not listed in this guide are at **visual placeholder fidelity**: the UI looks correct and the screens flow correctly, but the clinical layer (scoring, scales, interpretation logic) has not yet been reviewed or rebuilt. These are flagged at the end of the guide.

---

## Scope of clinical fidelity in v0.3.0

> The xoExam UI/UX ships as one unified build. The right-hand column records *when each test last reached clinical fidelity*, not a separate version number per test.

| Test | Reference standard | Reached clinical fidelity in |
|---|---|---|
| Visual Acuity | Snellen + LogMAR conversion · Sloan 10 helper | v0.2.3 |
| Color Vision | Ishihara plates + D-15 Farnsworth | v0.1.7 |
| Visual Fields | Humphrey Field Analyzer (HFA) / Goldmann | v0.1.8 |
| Wavefront Aberrometry | Hartmann-Shack sensor / Zernike polynomial output | v0.1.9 |
| Extraocular Motility | International 0 to ±4 EOM grading | v0.2.1 |
| Pupillometry | Winn 1994 age-banded norms · NeurOptics NPi-200 reference · RAPD grading | v0.2.5 |
| Wavefront Refraction | Objective wavefront autorefraction + subjective JCC / MPMVA liquid-lens phoropter (six competitive-parity enhancements added v0.2.7) | v0.2.6 |

The remaining tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds in subsequent releases.

---

## 1. Visual Acuity (v0.2.3)

### Reference standard
Distance visual acuity measured using the **Snellen notation system** (20/x feet equivalent), the most widely recognized clinical convention in U.S. practice. Three chart types are supported in the prototype: standard Snellen letters, numbers (for non-readers), and Tumbling E (for non-Latin literacy or pediatric use).

### What's implemented
- **Chart progression:** 10 lines, 20/200 → 20/10
- **Letter pool:** Latin alphabet excluding low-discriminability letters
- **Chart types selectable:** Snellen letters, Numbers (1–9), Tumbling E (rotated E in 4 orientations)
- **Eye modes:** OD-only, OS-only, OU (both eyes — standard clinical sequence)
- **Per-line scoring:** mark each letter correct/incorrect; line-pass currently at ≥ 65% (under review — see open questions)
- **Auto-advance** to next line on passing
- **Prescription adjustment panel** for failed lines (SPH/CYL/AXIS for OD & OS)
- **Detailed report** with VA table per eye + prescription summary
- **Tested at:** simulated 20 ft / 6 m

### Open clinical questions (slated for the v2 spec backfill, target v0.2.3)
- Add **LogMAR notation** as a parallel display to Snellen (research / statistical use, longitudinal comparison)
- Add **ETDRS chart** support as a third selectable mode (gold standard since 1982 — equal letter difficulty per line, proportional spacing, 0.1 logMAR steps)
- Add **pinhole occluder** affordance (distinguishes refractive vs pathological causes of reduced acuity)
- Add **near vision** component (J-notation or 14"/40 cm equivalent — half of a real comprehensive VA exam)
- Convert letter pool to **Sloan 10** (C, D, H, K, N, O, R, S, V, Z — the ETDRS standard set)
- Implement **Bailey-Lovie crowding rules** for letter spacing (proportional to letter size)
- Add **pediatric symbols** option (LEA symbols / HOTV) for non-readers and young children
- Review the 65% line-pass threshold — clinical convention is "more than half correct," typically 3/5 on a 5-letter line

---

## 2. Color Vision (v0.1.7)

### Reference standard
Two complementary protocols:

- **Ishihara pseudo-isochromatic plates** — the global screening standard since 1917 for red-green deficiency.
- **D-15 Farnsworth dichotomous hue test** — quantitative confusion-axis assessment for protan / deutan / tritan defects. Scoring follows **Vingrys & King-Smith (1988)** moment-of-inertia methodology (sRGB → Lab conversion, 2×2 eigendecomposition producing Major Radius / Minor Radius / Confusion Angle / TES / S-index / C-index).

### What's implemented
- **Protocol order:** OD → OS → OU as three discrete tests (not "OU = OD then OS")
- **Sequence affordances:** in-test eye picker, eye-sequence breadcrumb, full-screen transition modal between eyes with patient-positioning copy
- **Ishihara:**
  - 24 plates (licensed images for plates 1–4; clinically-correct simulated placeholders for plates 5–24 pending licensed asset delivery)
  - 3×4 number pad for patient response (no text input — avoids keyboard pitfalls on tablet)
  - "No response" option per plate
- **D-15 Farnsworth:**
  - 16 Munsell V5/C4 sRGB-approximation caps (replaces previous vivid rainbow which made sorting trivial)
  - Near-constant luminance / mid-saturation so sorting requires genuine hue discrimination
  - Cap numbers hidden on the puck UI during arrangement (numbers were leaking the answer)
  - Drag-to-reorder arrangement with reference cap fixed at position 0
  - SVG polar plot of patient's sequence vs. ideal sequence
- **Classification bands:** AAO-style 3-band (Normal color vision / Borderline / Deficiency detected) — replaces previous arbitrary 4-band scheme
- **Report:** Patient Classification banner, per-eye polar diagnostic plot, Plate-by-Plate Results table, D-15 results section
- **Session notes** textarea in sidebar

### Open clinical questions
- Licensed Ishihara plates 5–24 still pending — current placeholders are clearly marked as non-clinical
- Confirmation that Munsell V5/C4 approximations meet clinical-grade color accuracy when rendered on the production headset display

---

## 3. Visual Fields (v0.1.8)

### Reference standard
**Humphrey Field Analyzer (HFA) protocols** — the global gold standard for automated perimetry. Background luminance 31.5 apostilbs (≈ 10 cd/m²). Strategies and patterns mirror the HFA II / HFA III instrument lineup.

### What's implemented
- **Eye sequence:** OD-first bilateral (default; user-tweakable to OS-first). For binocular-by-design protocols (Esterman, mEsterman, FDP, cFDP), always OU as a single run.
- **Patterns supported:**
  - Monocular: 10-1, 10-2, 24-1, 24-2, 30-2, Screening, Goldmann
  - Binocular: Esterman, Modified Esterman (Central), FDP (Frequency Doubling), Combined FDP Mode
- **Strategies:** SITA-Standard, SITA-Fast (default), SITA-Faster, Full Threshold
- **Stimulus sizes:** Goldmann III (default, 4 mm² at 1/3 m) and Goldmann V (64 mm²)
- **Foveal threshold calibration** prior to test start (per-eye, on-grid annotation in report)
- **GHT (Glaucoma Hemifield Test):** five-category result per eye — Within Normal Limits / Borderline / Outside Normal Limits / General Reduction of Sensitivity / Abnormally High Sensitivity
- **Probability plots:** Total Deviation + Pattern Deviation, HFA-style symbols (`· · ▪ ■ ■`)
- **Reliability indices:** FP / FN / FL with HFA's actual XX-flag thresholds. Two presets selectable as Tweaks:
  - Standard: FP < 8, FN < 15, FL < 10
  - Strict: FP < 5, FN < 10, FL < 5
- **Clinical override rule:** if any eye returns GHT "Outside Normal Limits" or "General Reduction," the Patient Classification banner is forced up at least one severity band — matches standard clinical reading rule for early glaucoma
- **Age-banded reference MD table** in report (20–30: −0.3 dB → 80+: −3.6 dB)
- **Report indices:** MD, PSD, VFI per eye, color-coded by Hodapp-Anderson-Parrish bands
- **Cumulative multi-eye report** with worst-eye-drives-bottom-line classification + per-eye pill summary

### Open clinical questions (flagged for engineering)
- GHT compute location (firmware vs. cloud-side)
- Real liquid-lens correction range supported by the headset (placeholder values used currently)
- Point counts for any proprietary screen / gold patterns Xenon may add (we've used HFA-standard counts as defaults)
- Foveal calibration output shape (single dB value vs. 4-step staircase)

---

## 4. Wavefront Aberrometry (v0.1.9)

### Reference standard
**Hartmann-Shack wavefront sensor** output mapped to **Zernike polynomial coefficients** (OSA / ANSI ordering convention). Lower-order aberrations (defocus + astigmatism) plus higher-order aberrations (HOAs) — coma, trefoil, spherical aberration. Reference range for HOAs is calibrated to a **6.0 mm analysis diameter** per industry standard (NIDEK OPD-Scan, iDesign, Alcon WaveLight).

### What's implemented
- **Eye sequence:** OD-first bilateral. OU runs OD then OS as two discrete captures with full-screen transition prompt and breadcrumb.
- **Three-phase flow:** eye selection (ready) → init → calibrating → capturing → complete (testing) → report
- **Capture mechanics:** 3 measurements averaged per eye (published clinical minimum)
- **Analysis diameter:** 6.0 mm (industry-standard reference for HOA RMS normals)
- **Axis values:** unsigned 0–180° (correct convention; the legacy implementation had a clinically-impossible negative axis bug)
- **Spherical aberration units:** micrometres (μm) — correct unit, not millimetres
- **Zernike notation:** Z₄⁰ rendered with proper subscript / superscript per OSA / ANSI standard
- **Primary metrics surfaced:**
  - Sphere · Cylinder · Axis (lower-order Rx equivalent)
  - **Total HOA RMS** (the primary clinical summary metric)
  - **Coma RMS** (the most clinically significant individual HOA term)
- **Clinical interpretation thresholds** (Applegate / Marsack literature for 6mm pupil):
  - Excellent: HOA RMS < 0.15 μm
  - Good: HOA RMS < 0.30 μm
  - Mildly elevated: HOA RMS < 0.45 μm
  - Significantly elevated: HOA RMS ≥ 0.45 μm
- **Elevated-HOA amber flag** automatically surfaces during capture when HOA RMS > 0.30 μm
- **Four view types** in report: Pupil image · Centroid image · Full wavefront · Higher orders only
- **Color-scale legend** under the wavefront map (−60 μm / 0 / +60 μm) — required clinical interpretation aid
- **False-color wavefront convention:** blue (negative deviation) → green (zero) → yellow / red / pink (positive). Standard across NIDEK / Alcon / iDesign.

### Open clinical questions (flagged for engineering)
- Real Hartmann-Shack analysis-diameter range supported by the headset firmware
- Number of frames averaged — fixed at 3 in UI, but firmware may be configurable / adaptive
- Full Zernike coefficient vector availability vs. summary metrics only
- Firmware-emitted color-scale range (UI assumes ±60 μm; engineering to confirm)

---

## 5. Extraocular Motility (v0.2.1)

### Reference standard
**International EOM grading scale (0 to ±4)** — 0 = normal, negative values = underaction, positive values = overaction. **9 cardinal positions of gaze** including primary, with **primary + secondary muscle / cranial nerve mapping** per position so CN III, IV, and VI palsy can be correctly read from the results.

### What's implemented
- **Three-phase flow** with internal sub-test state machine inside testing:
  ```
  ready (setup + config)
    → testing (versions → smooth pursuit → saccades → conditional ductions-OD → ductions-OS)
    → report
  ```
- **Grading scale:** 0 to ±4 (replacing the legacy 1–5 which was clinically wrong)
  - 0 = full normal range (green, default-selected)
  - −1 = mild underaction (~25% limitation)
  - −2 = moderate underaction (~50%)
  - −3 = marked underaction (~75%, eye cannot pass midline)
  - −4 = no movement
  - +1 to +3 = overaction (mild / moderate / marked)
- **9 cardinal positions** with primary AND secondary muscle/CN mapping:

| Position | Primary muscle / CN | Secondary muscle / CN |
|---|---|---|
| Primary gaze | All balanced (CN III/IV/VI) | — (assess for tropia or phoria) |
| Right gaze | R lateral rectus (CN VI-R) | L medial rectus (CN III-L) |
| Left gaze | L lateral rectus (CN VI-L) | R medial rectus (CN III-R) |
| Up gaze | Superior recti (CN III) | Inferior obliques (CN III) |
| Down gaze | Inferior recti (CN III) | Superior obliques (CN IV) |
| Up & right | R superior rectus (CN III-R) | L inferior oblique (CN III-L) |
| Up & left | L superior rectus (CN III-L) | R inferior oblique (CN III-R) |
| **Down & right** | R inferior rectus (CN III-R) | **L superior oblique (CN IV-L)** — classic CN IV (L) palsy detection |
| **Down & left** | L inferior rectus (CN III-L) | **R superior oblique (CN IV-R)** — classic CN IV (R) palsy detection |

- **H-pattern motility diagram** (clinical standard) — 9 nodes connected by H-shape lines, color-coded by grade
- **Sub-tests:**
  - **Versions** (binocular, all 9 positions) — required
  - **Smooth pursuit** — 4-option qualitative selector: Normal / Mildly reduced / Markedly reduced / Absent
  - **Saccadic assessment** — 4-option: Normal / Prolonged latency / Hypometric / Hypermetric
  - **Ductions** (monocular, OD then OS) — auto-enables when any version grade ≠ 0, or doctor can enable manually at setup
- **Clinical interpretation logic** (Patient Classification banner):
  - Single-muscle underaction → "isolated muscle underaction or cranial nerve palsy" pattern
  - Multiple underactions → flagged for internuclear ophthalmoplegia / complex CN palsy / restrictive strabismus assessment
  - Overaction-only → "primary overaction or secondary to contralateral muscle weakness"
  - Versions full but pursuit/saccades abnormal → neurological causes flagged
- **CN palsy clinical flag:** prominent red surface with full position / muscle / CN details surfaces automatically whenever any single position grade is ≤ −3
- **Versions Results table:** 7 columns — Position · Primary muscle · Primary CN · Secondary muscle · Secondary CN · Grade · Interpretation

### Open clinical questions (flagged for engineering)
- Headset gaze-tracking data shape during versions — does firmware emit per-eye gaze vector or pre-computed underaction estimate? Affects whether grades are "doctor-confirmed" or "doctor-entered."
- Smooth pursuit metrics — firmware-computed gain / catch-up saccade count, or pure doctor observation?
- Saccade latency measurement — firmware-measured ms available?
- Confirmation that patient response clicker is NOT used in EOM (patient passively follows the target)

---

## 6. Pupillometry (v0.2.5)

### Reference standard
Four overlapping clinical references for pupillometry:

- **Static pupil size norms:** Winn et al. 1994 — age-banded mean ± 1 SD pupil diameter under scotopic, mesopic, and photopic conditions. Six age bands (20–29 / 30–39 / 40–49 / 50–59 / 60–69 / 70+).
- **Anisocoria interpretation:** light-vs-dark differential rule — anisocoria that varies between light conditions by ≥ 0.3 mm is pathological (sympathetic if worse-in-dark, parasympathetic if worse-in-light).
- **NPi (Neurological Pupil index):** NeurOptics NPi-200 reference — 0–5 composite score from baseline size, constriction velocity, latency, and dilation velocity. ≥ 3.0 normal · < 3.0 abnormal · asymmetry > 0.7 between eyes is a warning sign.
- **RAPD grading:** standard 6-grade clinical scale (None / Trace / 1+ / 2+ / 3+ / 4+ amaurotic), Marcus Gunn pupil testing convention.

### What's implemented
- **Eye sequence:** OD-first bilateral. OU runs OD then OS as discrete monocular captures with full-screen transition prompt + patient-repositioning copy + eye breadcrumb. OD-only / OS-only also selectable.
- **Three-phase flow** with internal sub-test state machine inside testing:
  ```
  ready (eye mode + sub-test config + patient age)
    → testing (static-OD → static-OS → dynamic-OD → dynamic-OS → swinging-flashlight)
    → report
  ```
- **Patient age input** on the setup screen drives the age-banded reference range lookup. Age band annotation surfaces on the report and on the right sidebar during testing.
- **Sub-tests:**
  - **Static pupil size** (required) — three light conditions per eye (scotopic / mesopic / photopic), each with its lux annotation, age-banded reference range, and deviation flag if the captured value falls outside the range
  - **Dynamic light reflex** (default on) — stimulus-flash animation drives the iris viewer; live PLR curve chart renders the time-course of the response; six summary metrics surfaced as tiles (Baseline / Minimum / Constriction % / Latency / Constriction velocity / T75 redilation); **NPi computed and surfaced per eye** in a prominent severity-coded tile (green ≥ 3.0 / amber 2.5–3.0 / red < 2.5)
  - **Swinging flashlight** (default on; requires both eyes tested) — alternating stimulus animation across the two eyes; per-eye RAPD grade selector exposing all six grades with descriptive copy
- **Iris viewer:** animated iris with breathing pupil, calibrated pupil size per light condition; stimulus flash overlay drives the dynamic capture and the swinging flashlight animation; dark iris with light surrounding chrome (clinical convention — pupillometry happens in a darkened headset interior, but the controller UI itself is light)
- **Static measurements table** (3 light conditions × eyes tested):
  - One row per light condition with the lux annotation and the age-banded reference range
  - Captured value per eye with deviation flag (`↯` icon) when outside the reference range
  - Anisocoria column (when both eyes tested) per light condition, color-coded by severity (green < 0.4 mm / amber 0.4–1.0 mm / red > 1.0 mm)
  - Dedicated **light/dark differential row** at the bottom showing |aniso(dark) − aniso(light)|, flagged red at ≥ 0.3 mm with the "≥ 0.3 mm = pathological pattern" annotation
- **Dynamic measurements card** per eye in the report:
  - PLR curve chart with stimulus marker, baseline reference line, peak-constriction annotation
  - Six summary metric tiles
  - NPi pill with severity tint
- **RAPD assessment card** per eye in the report with the selected grade and full clinical descriptor
- **CN III / Horner's / RAPD clinical flag** — prominent red surface, surfaces automatically when any of the following patterns are detected:
  - **Optic nerve disease pattern:** RAPD ≥ 1+ on either eye → "Relative afferent pupillary defect — {eye}" flag with neuro-ophthalmic referral copy
  - **Sympathetic pathway pattern:** anisocoria greater in dark by ≥ 0.3 mm → "Anisocoria greater in dark — sympathetic pattern" flag with cocaine / apraclonidine testing recommendation
  - **Parasympathetic pathway pattern:** anisocoria greater in light by ≥ 0.3 mm → "Anisocoria greater in light — parasympathetic pattern" flag with CN III palsy / Adie's / pharmacologic mydriasis differential
  - **Neuro pattern:** NPi < 2.5 on either eye → "Reduced neurological pupil index — {eye}" flag with intracranial / brainstem / pharmacologic differential
- **Patient Classification banner** in the report with worst-finding-drives-bottom-line severity (Normal / Mild / Significant) and per-finding summary pills (Anisocoria pill · per-eye NPi pills · RAPD pill)
- **Clinical Interpretation card** with severity tint, summary sentence, and bullet-list of specific findings (each age-banded deviation, each pathological anisocoria pattern, each NPi finding, each RAPD finding listed individually)
- **Age-banded reference values card** in the report (full Winn 1994 table, with the patient's age band highlighted) so the printed report stands alone
- **Session notes** textarea (sidebar during testing, dedicated card in the report)
- **Doctor sign-off** label above the Certify & close primary action

### Open clinical questions (flagged for engineering)
- **Dynamic data shape from firmware.** Does the headset emit a time-series of pupil diameter at ~30 Hz, or only summary metrics (baseline / min / latency / etc.)? Determines whether the UI re-draws the real PLR curve or just renders the summary numbers and a stylised reference curve.
- **NPi computation location.** Computed firmware-side per NeurOptics convention, or computed UI/cloud-side from the time-series? Most likely firmware-side.
- **Swinging flashlight automation.** Does the headset present the alternating light stimulus automatically (UI is a passive viewer + grade-recorder), or is the technician manually triggering left/right alternation?
- **Pupil response clicker.** Pupillometry does not use the patient clicker (the patient is passive). Confirm with engineering.
- **Pharmacological pupillometry workflow.** Cocaine and apraclonidine tests (Horner's syndrome confirmation) and pilocarpine test (Adie's pupil) follow specific dilation protocols. Out of scope for v0.2.5 but flag if Xenon plans to support these.
- **Ambient light measurement.** Does the headset measure actual ambient lux inside the device, or does the UI assume a calibrated dark interior? Affects whether "scotopic / mesopic / photopic" is a measured condition or a configured assumption.
- **Adaptation time enforcement.** Scotopic measurements require ≥ 5 minutes of dark adaptation for valid results. Does the firmware enforce this timing, or does the UI need to display a countdown timer?

---

## 7. Wavefront Refraction (v0.2.6 · enhanced v0.2.7)

### Reference standard
The combined digital replacement for the traditional two-instrument refraction workflow. **Objective stage:** wavefront aberrometry used as an autorefractor — the Hartmann-Shack-derived lower-order sphere / cylinder / axis is the objective starting point. **Subjective stage:** liquid-lens digital phoropter following standard manifest-refraction methodology — Maximum Plus to Maximum Visual Acuity (MPMVA) sphere endpoint, Jackson Cross Cylinder (JCC) for cylinder axis then power, fogging to control accommodation, and additive visual-acuity notation. The certified output is a verified spectacle prescription (Rx).

> **This test deliberately makes no clinical claims.** Unlike the other clinically-faithful tests, the report carries **no Patient Classification banner and no interpretive language.** A refraction is a measurement-and-verification workflow, not a screening, so interpretive output is stripped by clinical direction. The Clinical Summary states data only (scans taken, completion, "Final Rx pending clinician certification").

### New in v0.2.7 — six competitive-parity enhancements (all doctor-led-safe)
Benchmarked against the Marco OPD-Scan III and Reichert Phoroptor VRx. Every addition is a **measurement or simulation, never a verdict** — the report still asserts no clinical claim.
1. **PSF + simulated-VA before/after** — point-spread-function render and simulated acuity from the Zernike set, habitual Rx vs. new Rx.
2. **Binocular balance** — added after both eyes via fogging / alternate occlusion (no prism hardware required).
3. **Multi-source Rx comparison** — objective, subjective, habitual, and unaided side by side with spherical-equivalent deltas.
4. **Photopic vs. mesopic (day & night) refraction** — 4 mm analysis plus a 6 mm column (both hardware-confirmed) and a night-shift Diff row.
5. **Smart-Cylinder auto-bracketing** — the JCC step size auto-sizes to the cylinder magnitude and narrows after each reversal.
6. **Refraction-based progression tracker** — spherical-equivalent trend over visits and D/year vs. age-banded reference; the at-risk determination is left to the clinician.

> **Hardware values confirmed (Steve, Q3/Q7/Q8).** The 6 mm pupil columns, vertex distance (25–30 mm), and sphere/cylinder ranges (sphere −14 to +14 D, cylinder 0 to −5 D) are confirmed and isolated in named constants. Built to the confirmed 4 mm analysis baseline; any later hardware revision is a one-line change.

### What's implemented
- **Two-stage flow** mapped onto the shared three-phase framework:
  ```
  entry (full refraction / subjective-only)
    → objective  (monocular wavefront capture, OD → OS)
    → subjective (liquid-lens phoropter: setup → sphere/MPMVA → JCC axis → JCC power → [MPMVA-2] → add)
    → report
  ```
- **Objective capture** uses the live eye-scan presentation (dark viewer, breathing pupil, sweep line, rotating centering ring, and a red alignment dot that turns the backdrop green on lock) — not a circular-progress animation. Each eye documents a **scan count (1–3)**; the wavefront retries on movement / blink and averages, and the count communicates measurement reliability to the clinician.
- **Axis before power (JCC):** enforced by step order — the UI cannot reach cylinder-power refinement until the cylinder axis is confirmed (`jcc-axis` always precedes `jcc-power`).
- **Fogging control:** after objective capture a fog prompt offers **+0.75 D** with a clinical explanation (relaxes accommodation, prevents over-minusing). Skippable; starting MPMVA sphere = objective sphere + fog.
- **Sphere compensation note** during cylinder power: "For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion."
- **Rx format discipline:** SPH / CYL always signed + 2 dp; AXIS integer + °; ADD signed with D or "—". No exceptions.
- **Monocular discipline:** no OU averaging. The objective stage runs OD then OS automatically via breadcrumb + transition modal; the subjective stage refines per eye.
- **Optotype selector** (Letters / Tumbling E / Tumbling C) drawn as geometric SVG optotypes, shared with the standalone Visual Acuity test — for pediatric, non-literate, or non-Latin-script patients who report orientation rather than naming a glyph. Additive VA notation (e.g. `20/25 +4`) surfaced as best VA so far.
- **Report:** Final Prescription hero (signed Rx + ADD + BCVA per eye); Objective Results and Subjective Correction two-box (delta from objective → final); wavefront analysis (view rail, 3 mm / 5 mm ring overlay toggle, zoom-scope, color-scale legend); data-only Clinical Summary; **Doctor sign-off** above Certify & close.
- **Certify & close is a system event:** it certifies and releases the verified Rx to the downstream xoFit fitting/finishing job object. Report sub-label: "Doctor sign-off · releases Rx to job object."

### Open clinical questions (flagged for engineering)
- **Pass/fail acuity threshold** for the subjective stage currently "more than half correct" — to be validated against a published standard before lock.
- **Certify → Rx-release wiring:** the certification event must be implemented as the trigger that releases the Rx downstream (system event, not a UI-only action); couples to the role/permissions model.
- **Patient-facing headset view** for an objective self-administered mode is out of scope here (this is the tablet / technician-doctor view only) — separate scope to define.
- **Liquid-lens / eye-tracking capability** confirmation for the objective readiness panel values and green-lock timing.

---

## Cross-cutting clinical conventions

These apply consistently across every clinically-faithful test in xoExam.

### Eye-reference convention
**OD** (oculus dexter, right eye) before **OS** (oculus sinister, left eye). Matches universal medical convention used in patient charts, refraction records, Rx forms. The legacy prototype defaulted to OS-first in several tests; corrected to OD-first across the board.

### Doctor sign-off
Every clinical-fidelity test's report screen surfaces a small "Doctor sign-off" label above the primary "Certify & close" button. Terminology aligned with EHR standards used by Epic, Cerner, NextGen. "Doctor" correctly includes both MDs (ophthalmologists) and ODs (optometrists) as authorized xoExam users. The label is currently a visual cue; role-based gating activates in the post-beta Roles & Remote Operation design pass.

### Test cancellation
Cancellation during a test requires explicit confirmation: a labeled red "Cancel test" button (not a back arrow) opens a modal warning that all session progress will be lost. The principle: back arrows mean "navigate safely"; destructive actions get explicit labeled buttons.

### Test naming
UI labels use bare nouns ("Visual Field," "Extraocular Motility," "Wavefront Aberrometry") rather than appending "Test" or "Exam." The surrounding chrome ("Tests" sidebar, "Run new test" button, exam history) establishes context; the suffix would be redundant. Formal report headers retain "Report" or "Examination" for documentation gravity.

### Reliability and severity color coding
RAG palette (Red / Amber / Green) is reserved for clinical alerts, severity bands, and status indicators only. General UI styling does not use RAG. Severity in EOM grading and in the various Clinical Interpretation cards follows this convention.

### Session notes
Every clinical-fidelity test includes a Session notes textarea (sidebar during testing, dedicated card in the report). Intended for the clinician's free-text observations alongside the structured data.

### Patient identity
A patient identity confirmation step (between test selection and Begin test) is not yet implemented. Flagged as a regulatory decision pending with engineering. The current prototype assumes the technician has already confirmed the correct patient is in the headset.

---

## Visual-placeholder tests (clinical layer pending)

The following tests are clickable, walk through their basic UI, and integrate with the test catalog and patient profile — but their clinical scoring, scales, and interpretation have **not** yet been reviewed or rebuilt against published clinical standards. Treat their on-screen data as illustrative only.

- Refraction *(hidden from the catalog and patient launcher in v0.3.0 at CD direction — the combined Wavefront Refraction supersedes it; code retained and restorable)*
- Accommodation
- Keratometry
- Confrontation
- Esterman Binocular (routes to Visual Field with Esterman protocol pre-selected — clinical fidelity inherited from VF v0.1.8)
- Binocular Vision
- Convergence
- Contrast Sensitivity (Pelli-Robson visual fidelity only; clinical scoring not yet implemented)
- Visual Reaction Time
- Eye Tracking Accuracy
- Fixation Stability
- Tear Film
- AI Pattern Recognition

These will be brought to clinical fidelity in priority order. The clinical evaluation team's input on which of the remaining tests to prioritize next is welcomed.

---

## What this document does not cover

- **Instrument calibration.** This document describes the design intent of the UI. Whether the production headset actually delivers calibrated stimulus presentation, accurate color reproduction, valid threshold measurements, etc., is an engineering and regulatory question outside Method's scope.
- **Regulatory clearance.** Method's UI/UX prototype is not a medical device and has not been cleared by FDA, MDR, or any other regulatory body.
- **Clinical validation.** This is a transparency document, not a clinical validation report.
- **Per-patient outcomes.** Every example value shown in the prototype is mock data. Real patient data will populate the same fields in production.

---

## Questions or corrections

This document is updated at each clinical-fidelity milestone. If the clinical evaluation team identifies a deviation from current published standards, please flag it for the next revision. Contact Method Marketing Agency through the standard project channels.

*Method Marketing Agency · xoExam UI/UX Clinical Standards Reference · v0.3.0 · July 10, 2026*
