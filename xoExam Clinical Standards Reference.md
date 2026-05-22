# xoExam™ UI/UX — Clinical Standards Reference
## A guide for the clinical team evaluating the prototype
### Method Marketing Agency · May 2026 · Version 0.2.3

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

## Scope of clinical fidelity in v0.2.3

| Test | Reference standard | Clinical-fidelity version |
|---|---|---|
| Visual Acuity | Snellen + LogMAR conversion · Sloan 10 helper | v0.2.3 |
| Color Vision | Ishihara plates + D-15 Farnsworth | v0.1.7 |
| Visual Fields | Humphrey Field Analyzer (HFA) / Goldmann | v0.1.8 |
| Wavefront Aberrometry | Hartmann-Shack sensor / Zernike polynomial output | v0.1.9 |
| Extraocular Motility | International 0 to ±4 EOM grading | v0.2.1 |

Pupillometry will join this list at v0.2.5; the remaining 13 tests are visual-fidelity placeholders awaiting their own clinical rebuilds.

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

- Refraction
- Accommodation
- Keratometry
- Confrontation
- Esterman Binocular (routes to Visual Field with Esterman protocol pre-selected — clinical fidelity inherited from VF v0.1.8)
- Binocular Vision
- Convergence
- Contrast Sensitivity (Pelli-Robson visual fidelity only; clinical scoring not yet implemented)
- Pupillometry (slated for v0.2.5 clinical rebuild)
- Visual Reaction Time
- Eye Tracking Accuracy
- Fixation Stability
- Tear Film
- AI Pattern Recognition

These will be brought to clinical fidelity in priority order. The clinical evaluation team's input on which ones to prioritize after Pupillometry is welcomed.

---

## What this document does not cover

- **Instrument calibration.** This document describes the design intent of the UI. Whether the production headset actually delivers calibrated stimulus presentation, accurate color reproduction, valid threshold measurements, etc., is an engineering and regulatory question outside Method's scope.
- **Regulatory clearance.** Method's UI/UX prototype is not a medical device and has not been cleared by FDA, MDR, or any other regulatory body.
- **Clinical validation.** This is a transparency document, not a clinical validation report.
- **Per-patient outcomes.** Every example value shown in the prototype is mock data. Real patient data will populate the same fields in production.

---

## Questions or corrections

This document is updated at each clinical-fidelity milestone. If the clinical evaluation team identifies a deviation from current published standards, please flag it for the next revision. Contact Method Marketing Agency through the standard project channels.

*Method Marketing Agency · xoExam UI/UX Clinical Standards Reference · v0.2.3 · May 22, 2026*
