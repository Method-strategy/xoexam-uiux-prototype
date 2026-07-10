# xoExam™ UI/UX — Clinical Evaluation Brief
## A current-state guide for the doctor panel evaluating the user interface
### Method Marketing Agency for Xenon Ophthalmics Inc.

---

> This brief describes what the current xoExam™ prototype does clinically, test by test. It is written for the doctor panel evaluating the user interface — optometrists, ophthalmologists, and clinical reviewers. The goal is to make it quick to verify "does this match what I do in practice?" without needing context on the design process or prior iterations.
>
> This is not a regulatory submission, a clinical validation report, or a substitute for instrument calibration. It is a transparency document — what the design adheres to, so a clinician can evaluate it against current published standards.
>
> **v0.3.0 note — test-catalog visibility/ordering release, no clinical change.** v0.3.0 reorders the Tests selection grid to lead with a fixed clinical priority sequence and hides the legacy standalone Refraction placeholder from the catalog (the combined Wavefront Refraction supersedes it; code retained and restorable), and also hides the Tests-page category filter, per-card category labels, and search box (restorable). No exam component, clinical algorithm, or report was modified; the clinical content below is unchanged from v0.2.8. The brief is reissued only to keep the doc set on one unified version.

---

## What you are evaluating

Seven of the device's planned exams are currently at full clinical fidelity in the prototype — meaning the scoring, scales, interpretation logic, and reporting have been designed to match published clinical standards. The remaining tests in the catalog are visual placeholders only — they look correct and flow correctly, but their clinical layer has not yet been rebuilt. Treat any on-screen data in those placeholders as illustrative.

The seven clinically-faithful tests:

1. Visual Acuity
2. Color Vision (Ishihara + D-15 Farnsworth)
3. Visual Fields
4. Wavefront Aberrometry
5. Extraocular Motility
6. Pupillometry
7. Wavefront Refraction

The remaining tests in the catalog await their own clinical rebuilds in subsequent releases. The entire UI/UX ships as one unified build — currently v0.3.0; a test reaching clinical fidelity in an earlier release is correct and unchanged since then, not running older software.

---

## 1. Visual Acuity

### Clinical purpose
Measure best-corrected distance visual acuity to identify reduction in central vision and guide refractive correction.

### Reference standard
Snellen notation system (20/x feet equivalent), with LogMAR (log of the Minimum Angle of Resolution) surfaced in parallel for documentation and longitudinal comparison.

### What the UI does
- 10-line chart progression from 20/200 to 20/10 (LogMAR 1.00 to −0.30)
- Three chart types selectable: Snellen letters, Numbers (for non-readers), Tumbling E (for non-Latin literacy or pediatric use)
- Per-letter scoring — tap a letter to cycle through unmarked / correct / incorrect
- Per-eye testing: OD-only, OS-only, or OU
- Line-pass rule: more than half correct (clinical convention — 3+ on a 5-letter line)
- Auto-advance to the next line on passing
- Prescription adjustment panel surfaces on a failed line for SPH / CYL / AXIS refinement on either eye
- The report shows both Snellen and LogMAR notation, a per-line scoring table, and severity classification (Normal / Mild reduction / Moderate reduction / Significant reduction) driven by the worst-eye result

### What we'd like the panel to evaluate
- Does the chart type selection cover the patient populations you typically see?
- Is the per-letter scoring interaction efficient enough for a real clinical workflow?
- Does the LogMAR + Snellen dual-notation in the report match your documentation expectations?
- Is the prescription adjustment panel positioned correctly in the flow?

### What's coming (not yet in the UI)
ETDRS chart layout with Sloan 10 letter set and Bailey-Lovie crowding, pediatric LEA symbols, pinhole occluder workflow, and near-vision J-notation mode. These depend on confirming what the production headset's optics can simulate (true 40 cm near distance, pinhole insert availability).

---

## 2. Color Vision

### Clinical purpose
Screen for and characterize color vision deficiency — red-green (protan, deutan) and blue-yellow (tritan).

### Reference standard
Two complementary protocols:
- **Ishihara pseudo-isochromatic plates** — the global screening standard since 1917
- **D-15 Farnsworth dichotomous hue test** — quantitative confusion-axis assessment, scored using Vingrys & King-Smith (1988) moment-of-inertia methodology

### What the UI does
- Test order: OD then OS then OU as three discrete tests (not "OU = OD then OS")
- Transition modal between eyes with patient-positioning instructions
- Ishihara: 24 plates total (plates 1–4 with licensed images; plates 5–24 use clinically-correct simulated placeholders pending licensed asset delivery)
- Ishihara response: 3×4 number pad on the tablet (no text input) + "No response" option per plate
- D-15: 16 Munsell V5/C4 sRGB-approximation caps, near-constant luminance, drag-to-reorder arrangement
- Cap numbers hidden during arrangement (so the test is solved by hue discrimination, not by reading numbers)
- SVG polar plot of patient's sequence vs. ideal sequence
- Three-band classification (AAO-style): Normal color vision / Borderline / Deficiency detected
- Report shows per-eye polar diagnostic plot, plate-by-plate results table, D-15 scoring metrics

### What we'd like the panel to evaluate
- Does the cap palette look clinically credible to you when rendered on the tablet?
- Is the 3-band classification (Normal / Borderline / Deficiency) the right summarization, or do you prefer 4-band?
- Is the test order (OD → OS → OU as three discrete runs) consistent with how you'd run color vision in practice?

---

## 3. Visual Fields

### Clinical purpose
Map peripheral and central visual field sensitivity to detect glaucomatous defects, neurological field loss, and other patterns of visual field abnormality.

### Reference standard
Humphrey Field Analyzer (HFA) protocols — the global gold standard for automated perimetry. Background luminance 31.5 apostilbs (≈ 10 cd/m²). Strategies and patterns mirror the HFA II / HFA III instrument lineup.

### What the UI does
- Eye sequence: OD-first bilateral by default (user-tweakable to OS-first). Binocular-by-design patterns (Esterman, mEsterman, FDP, cFDP) always run as a single OU
- Monocular patterns available: 10-1, 10-2, 24-1, 24-2, 30-2, Screening, Goldmann
- Binocular patterns available: Functional Esterman (DVLA/DMV driving fitness), Modified Esterman (Central), FDP, Combined FDP Mode
- Strategies: SITA-Standard, SITA-Fast (default), SITA-Faster, Full Threshold
- Stimulus sizes: Goldmann III (default, 4 mm² at 1/3 m) and Goldmann V (64 mm²)
- Foveal threshold calibration before test start, surfaced on the report's central diagram
- **GHT (Glaucoma Hemifield Test)** result per eye in five categories: Within Normal Limits / Borderline / Outside Normal Limits / General Reduction of Sensitivity / Abnormally High Sensitivity
- **Probability plots:** Total Deviation and Pattern Deviation with HFA-style symbols
- **Reliability indices** (FP / FN / FL) banded to HFA's actual XX-flag thresholds. A Strict preset is selectable
- **Clinical override rule:** if any eye returns GHT "Outside Normal Limits" or "General Reduction," the patient classification is forced up at least one severity band even if MD is within normal limits — the standard clinical reading rule for early glaucoma
- Report shows MD, PSD, VFI per eye color-coded by Hodapp-Anderson-Parrish bands, age-banded reference MD table (20–30: −0.3 dB → 80+: −3.6 dB), and per-eye result cards with cumulative worst-eye classification

### What we'd like the panel to evaluate
- Are the pattern and strategy options the ones you'd actually use in practice?
- Is the GHT result + override rule reading correctly as you'd expect?
- Does the age-banded reference table belong in the report, or is it noise?
- Reliability index bands — are Standard / Strict thresholds calibrated to what you'd consider clinically acceptable?

---

## 4. Wavefront Aberrometry

### Clinical purpose
Map the optical aberrations of the entire eye — lower-order (defocus, astigmatism) and higher-order (coma, trefoil, spherical aberration) — to inform contact lens fitting, refractive surgery candidacy, IOL planning, and unexplained reduced BCVA workup.

### Reference standard
Hartmann-Shack wavefront sensor output mapped to Zernike polynomial coefficients (OSA / ANSI ordering convention). Reference range for higher-order aberrations (HOAs) is calibrated to a 6.0 mm analysis diameter per industry standard (NIDEK OPD-Scan, iDesign, Alcon WaveLight).

### What the UI does
- Eye sequence: OD-first bilateral, OU runs OD then OS as two discrete captures with full-screen transition prompt
- Three-phase flow: eye selection → init / calibrating / capturing / complete → report
- Capture mechanics: 3 measurements averaged per eye (published clinical minimum)
- Analysis diameter: 6.0 mm
- Axis values: unsigned 0–180°
- Spherical aberration in micrometers (μm)
- Zernike notation: Z₄⁰ rendered with proper subscript / superscript per OSA / ANSI standard
- Primary metrics in the report: Sphere · Cylinder · Axis · Total HOA RMS · Coma RMS
- Clinical interpretation thresholds (Applegate / Marsack for 6 mm pupil): Excellent < 0.15 μm · Good < 0.30 μm · Mildly elevated < 0.45 μm · Significantly elevated ≥ 0.45 μm
- Elevated-HOA amber flag during capture if HOA RMS > 0.30 μm
- Four view types in report: Pupil image · Centroid image · Full wavefront · Higher orders only
- Color-scale legend under the wavefront map (−60 μm / 0 / +60 μm)
- False-color wavefront convention: blue (negative deviation) → green (zero) → yellow / red / pink (positive). Standard across major commercial aberrometers.

### What we'd like the panel to evaluate
- Is the analysis at 6.0 mm the right default? Should the doctor be able to change it per case?
- Are the interpretation thresholds correctly calibrated?
- Is "Total HOA RMS" the right summary metric for the dashboard banner, or do you prefer something else?
- Is the four-view report layout (Pupil / Centroid / Full Wavefront / Higher Orders Only) useful, or is it information overload?

---

## 5. Extraocular Motility

### Clinical purpose
Assess the function of the six extraocular muscles and the three cranial nerves controlling them (CN III oculomotor, CN IV trochlear, CN VI abducens) to detect strabismus, cranial nerve palsy, internuclear ophthalmoplegia, and other ocular motility disorders.

### Reference standard
International EOM grading scale (0 to ±4) — 0 = normal, negative values = underaction, positive values = overaction. Nine cardinal positions of gaze including primary, with primary + secondary muscle / cranial nerve mapping per position.

### What the UI does
- Three-phase flow with sub-test state machine: setup → versions → smooth pursuit → saccades → (conditional ductions-OD then ductions-OS) → report
- **Grading scale:** 0 to ±4 (0 = full normal range, default-selected, green; −1 ≈ 25% limitation; −2 ≈ 50%; −3 ≈ 75% with eye unable to pass midline; −4 = no movement; +1 to +3 = overaction in three grades)
- **Nine cardinal positions** with primary AND secondary muscle/CN mapping. The secondary mapping is critical for **CN IV (trochlear) detection** at down-and-in gaze: Down & right tests right inferior rectus (CN III-R) primarily AND left superior oblique (CN IV-L) secondarily; Down & left tests left inferior rectus (CN III-L) primarily AND right superior oblique (CN IV-R) secondarily. Both muscles and both CNs are surfaced in the Versions Results table so isolated CN IV palsy is not missed.
- **H-pattern motility diagram** (clinical standard) — 9 nodes connected by H-shape lines, color-coded by grade
- **Sub-tests:** Versions (binocular, all 9 positions — required) · Smooth pursuit (4-option qualitative: Normal / Mildly reduced / Markedly reduced / Absent) · Saccadic assessment (4-option: Normal / Prolonged latency / Hypometric / Hypermetric) · Ductions (monocular, OD then OS — auto-enables when any version grade ≠ 0, can be manually enabled at setup)
- **Clinical interpretation logic** in the report distinguishes:
  - Isolated single-muscle underaction → "isolated muscle underaction or cranial nerve palsy" pattern
  - Multiple underactions → flagged for internuclear ophthalmoplegia / complex CN palsy / restrictive strabismus assessment
  - Overaction-only → "primary overaction or secondary to contralateral muscle weakness"
  - Versions full but pursuit/saccades abnormal → neurological causes flagged
- **CN palsy clinical flag** — prominent red surface with full position / muscle / CN details and neurological-referral copy surfaces automatically whenever any single position grade is ≤ −3

### What we'd like the panel to evaluate
- Does the 0 to ±4 grading scale match how you'd record EOM findings? Specifically: are you accustomed to seeing 0 as "normal" or do some institutions still teach the old 1–5?
- Is the H-pattern diagram layout the convention you expect to see in a printed EOM report?
- Are the four sub-tests (Versions / Smooth pursuit / Saccades / Ductions) the right scope, or should anything be added or removed?
- The auto-enable of ductions when any version grade is non-zero — is that the right trigger logic?
- The interpretation banner copy (e.g., "Pattern consistent with isolated muscle underaction or cranial nerve palsy") — does the language read correctly to a doctor reviewing the report?

---

## 6. Pupillometry

### Clinical purpose
Measure pupil size under standardized light conditions, capture the dynamic pupillary light reflex, and detect a relative afferent pupillary defect (RAPD). These three measurements together screen for optic nerve disease, autonomic nervous system dysfunction (sympathetic and parasympathetic pathways), and intracranial pathology.

### Reference standard
- **Static pupil size:** Winn et al. 1994 age-banded normative data — six age bands (20s through 70+) × three light conditions (scotopic, mesopic, photopic), mean ± 1 SD
- **Anisocoria assessment:** light-vs-dark differential rule — anisocoria that varies with light condition by ≥ 0.3 mm is pathological (sympathetic if worse-in-dark, parasympathetic if worse-in-light)
- **Dynamic pupillary light reflex (PLR):** time-course capture of baseline size, peak constriction, latency, constriction velocity, T75 redilation, redilation velocity
- **NPi (Neurological Pupil index):** 0–5 composite score from NeurOptics NPi-200 reference — ≥ 3.0 normal, < 3.0 abnormal; asymmetry > 0.7 between eyes is a warning sign
- **RAPD (Marcus Gunn pupil) grading:** None / Trace / 1+ / 2+ / 3+ / 4+ amaurotic — standard clinical grading scale

### What the UI does
- Eye sequence: OD-first bilateral (OD then OS as discrete runs) or OD-only / OS-only at user choice
- In-test eye picker, eye-sequence breadcrumb, full-screen transition modal with patient-repositioning copy between eyes
- Patient age input on the setup screen — drives the age-banded reference range lookup
- Three sub-tests with state machine:
  - Static pupil size (required) — three light conditions per eye with deviation flags against the age-banded range
  - Dynamic light reflex (default on) — stimulus-flash animation, live PLR curve chart, summary metric tiles (baseline / min / constriction % / latency / constriction velocity / T75 redilation), NPi computed and surfaced per eye in a prominent severity-coded tile
  - Swinging flashlight (default on; requires both eyes) — alternating stimulus animation across both eyes, per-eye RAPD grade selector with all six grades exposed
- Iris/pupil viewer: animated iris with breathing pupil, calibrated to the active light condition; stimulus flash overlays during dynamic capture and swinging flashlight
- Patient Classification banner in the report with worst-finding-drives-bottom-line severity (Normal / Mild / Significant), per-eye NPi summary pills, per-eye RAPD summary pills, and overall anisocoria pill
- Static measurements table — 3 light conditions × eyes tested, with age-banded reference range column and dedicated anisocoria row showing the light/dark differential (≥ 0.3 mm flagged as pathological pattern)
- Dynamic measurements card per eye — PLR curve chart plus the six summary metrics, with NPi severity pill
- RAPD assessment card per eye with full clinical descriptor
- **CN III / Horner's / RAPD clinical flag** surfaces automatically and prominently when any of: RAPD ≥ 1+ on either eye, anisocoria varies with light condition (sympathetic vs parasympathetic pattern), NPi < 2.5 on either eye. Each pattern emits its own labeled flag with neuro-ophthalmic referral copy.
- Clinical Interpretation card with severity tint and finding-by-finding bullet list
- Age-banded reference values card so the printed report stands alone
- Doctor sign-off label above the Certify & close primary action

### What we'd like the panel to evaluate
- Does the static measurement protocol (three light conditions per eye, captured in sequence with age-banded reference range overlay) match how you'd run static pupillometry?
- The light/dark anisocoria differential rule (≥ 0.3 mm variation flags pathology) — is this the right threshold, and is the sympathetic-vs-parasympathetic interpretation copy reading correctly?
- NPi thresholds (≥ 3.0 normal, < 2.5 abnormal) and the asymmetry warning — calibrated against NeurOptics NPi-200 reference; does this match your reading practice if you've used the instrument?
- RAPD 6-grade scale (None / Trace / 1+ / 2+ / 3+ / 4+) — is the grade-by-grade descriptor copy clinically accurate?
- The Clinical Interpretation card's pattern-recognition flags (Horner's sympathetic, CN III parasympathetic, optic nerve RAPD, NPi neuro pattern) — does the auto-surfaced copy read correctly, or does it overstep?

### What's coming (not yet in the UI)
Real-time dark adaptation countdown (≥ 5 minutes for scotopic measurement validity — currently the firmware is assumed to enforce this), pharmacological testing workflows (cocaine and apraclonidine for Horner's confirmation, pilocarpine for Adie's pupil), and ambient lux measurement readback from the headset interior. These depend on firmware capability confirmation with engineering.

---

## 7. Wavefront Refraction

### Clinical purpose
Produce a verified spectacle prescription by combining an objective starting measurement with subjective refinement — the digital replacement for the autorefractor-plus-phoropter workflow. The certified prescription is the output that releases the job to the downstream xoFit fitting/finishing workflow.

### Reference standard
- **Objective stage:** wavefront aberrometry used as an autorefractor — the Hartmann-Shack-derived lower-order sphere / cylinder / axis is the objective starting point.
- **Subjective stage:** standard manifest-refraction methodology on a liquid-lens digital phoropter — Maximum Plus to Maximum Visual Acuity (MPMVA) sphere endpoint, Jackson Cross Cylinder (JCC) for cylinder axis then power, fogging to control accommodation, additive visual-acuity notation.

> **This test deliberately makes no clinical claims.** Unlike the other clinically-faithful tests, the report carries no Patient Classification banner and no interpretive language. A refraction is a measurement-and-verification workflow, not a screening — interpretive output is stripped by clinical direction. The Clinical Summary states data only.

### What the UI does
- Two-stage flow: entry (full refraction or subjective-only) → objective (monocular wavefront capture, OD then OS) → subjective (per eye: sphere/MPMVA → JCC axis → JCC power → optional second MPMVA → add) → report
- Objective capture uses the live eye-scan presentation (dark viewer, breathing pupil, sweep line, centering ring, and a red alignment dot that turns the backdrop green on lock), documenting a scan count (1–3) per eye to communicate measurement reliability
- **Axis before power (JCC):** enforced by step order — cylinder-power refinement is unreachable until the cylinder axis is confirmed
- **Fogging:** a +0.75 D fog prompt after objective capture (relaxes accommodation, prevents over-minusing); skippable
- **Sphere compensation note** during cylinder power: for each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion
- **Rx discipline:** SPH/CYL signed + 2 dp; AXIS integer + °; ADD signed with D or "—". Monocular throughout — no OU averaging
- **Optotype selector** (Letters / Tumbling E / Tumbling C) drawn as geometric SVG optotypes, shared with Visual Acuity, for pediatric / non-literate / non-Latin-script patients; additive VA notation (e.g. 20/25 +4) surfaced as best VA so far
- **Report:** Final Prescription hero (signed Rx + ADD + BCVA per eye); Objective Results and Subjective Correction two-box; wavefront analysis with 3 mm / 5 mm ring overlay toggle, zoom-scope, and color-scale legend; data-only Clinical Summary; Doctor sign-off above Certify & close
- **New in v0.2.7 — six competitive-parity enhancements (all measurements/simulations, never verdicts):** (1) **PSF + simulated-VA** before/after, habitual vs. new Rx; (2) **binocular balance** step after both eyes via fogging / alternate occlusion (no prism); (3) **multi-source Rx comparison** — objective / subjective / habitual / unaided with spherical-equivalent deltas; (4) **photopic vs. mesopic (day & night)** — 4 mm and 6 mm both hardware-confirmed, with a night-shift Diff row; (5) **Smart-Cylinder auto-bracketing** on the JCC (step auto-sizes to cylinder magnitude, narrows after each reversal); (6) **refraction progression tracker** — spherical-equivalent trend + D/yr vs. age-banded reference, at-risk call left to the clinician. The report is now organized into tabs (Summary · Rx comparison · Day & night · Vision simulation · Wavefront · Progression). The 6 mm columns, vertex range, and Rx ranges are **hardware-confirmed** (Steve, Q3/Q7/Q8).
- **Certify & close is a system event** — it releases the verified Rx to the downstream xoFit job object (not a UI-only action)

### What we'd like the panel to evaluate
- Does the two-stage flow (objective wavefront → subjective JCC/MPMVA refinement) match how you'd run a refraction on a digital phoropter?
- Is the +0.75 D fogging prompt and the axis-before-power JCC ordering correct and complete?
- Is the "no clinical claims / measurement-and-verification only" stance for the report the right call, versus the interpretive banners the other tests carry?
- What is the right pass/fail acuity threshold for the subjective endpoint? (Currently "more than half correct," flagged for validation.)
- Does anything about the certified-Rx-as-release-gate model raise a clinical or workflow concern?
- On the six v0.2.7 enhancements: does the **binocular balance** via fogging/alternate occlusion (no prism) read as clinically valid? Are the **multi-source Rx comparison**, **day-&-night (photopic/mesopic)**, and **progression tracker** the right competitive-parity additions, presented as data rather than verdicts? Is the **Smart-Cylinder auto-bracketing** behavior on the JCC what you'd expect?

### What's coming (not yet in the UI)
A patient-facing headset view for an objective self-administered mode (this component is the tablet / technician-doctor view only), and the engineering wiring that turns Certify & close into the downstream Rx-release event. Both depend on scoping with engineering.

---

## Cross-cutting conventions

These apply consistently across every clinically-faithful test:

**Eye reference.** OD (right) before OS (left). Universal medical convention used in patient charts, refraction records, prescriptions. When testing both eyes, the workflow is always OD first.

**Doctor sign-off.** Every clinical-fidelity test's report ends with a "Doctor sign-off" label above the primary "Certify & close" button. Terminology matches EHR standards used by Epic, Cerner, and NextGen. "Doctor" is used (rather than "Physician" or "Provider") to correctly include both MDs (ophthalmologists) and ODs (optometrists) as authorized xoExam users.

**Test cancellation.** Canceling a test mid-flow requires an explicit confirmation modal — the back arrow is hidden during testing and a labeled red "Cancel test" button takes its place. The principle: back arrows mean "navigate safely"; destructive actions get explicit labeled buttons. No accidental data loss.

**Test names.** UI labels use bare nouns ("Visual Field," "Extraocular Motility") rather than appending "Test" or "Exam." Formal report headers retain "Report" suffix for documentation weight.

**Severity color coding.** Red / Amber / Green palette is reserved for clinical alerts, severity bands, and status indicators only — never used for general UI styling.

**Session notes.** Every clinical-fidelity test includes a free-text Session notes textarea (sidebar during testing, dedicated card in the report) for the clinician's own observations alongside the structured data.

**Patient identity.** A patient identity confirmation step (between test selection and Begin test) is not yet implemented. The current prototype assumes the technician has already confirmed the correct patient is in the headset. This is flagged as a regulatory decision pending — the panel's input here is welcomed.

---

## Tests not yet at clinical fidelity

These tests are clickable in the prototype and walk through their basic UI, but their clinical scoring and interpretation have not yet been rebuilt against published standards. Treat their on-screen data as illustrative only.

- Refraction
- Accommodation
- Keratometry
- Confrontation
- Esterman Binocular (this one inherits clinical fidelity from Visual Fields — it routes to the Visual Field test with the Esterman protocol pre-selected)
- Binocular Vision
- Convergence
- Contrast Sensitivity (Pelli-Robson visual fidelity only; clinical scoring not yet implemented)
- Visual Reaction Time
- Eye Tracking Accuracy
- Fixation Stability
- Tear Film
- AI Pattern Recognition

The panel's input on which of these should be prioritized for the next clinical rebuild is welcomed.

---

## How to give us feedback

Specific items to flag:

- **Deviations from current published clinical standards.** If something on screen doesn't match how you'd run the test in practice, please flag it with the published reference we should be conforming to.
- **Workflow friction.** Tablet-based testing introduces interaction patterns that paper-based or older instrument workflows didn't have. If a step feels awkward or wrong, that's exactly what we want to catch in this review.
- **Terminology and copy.** The clinical phrasing in interpretations, banners, and labels should read naturally to a doctor. If anything reads as institutional jargon, generic medical-software boilerplate, or just wrong — please flag it.
- **What's missing.** If an entire affordance or step that you'd expect to see is absent, that's high-value feedback.

Please return your observations through the standard project channels. The development team will respond directly to clinical accuracy issues; UI/UX adjustments will be incorporated in the next design iteration.

---

*Method Marketing Agency · xoExam UI/UX Clinical Evaluation Brief · v0.3.0 · July 10, 2026*
