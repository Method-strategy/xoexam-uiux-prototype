# Wavefront Refraction — Clinical Specification v2

**Component:** `components/WavefrontRefractionTest.jsx` · **Test ID:** `wavefront-refraction`
**Status:** v0.2.8 — six competitive-parity enhancements merged into the single production component (v2 fork eliminated) · pending client review · hardware values confirmed (Steve, Q3/Q7/Q8, Jun 9 2026)
**Authored:** Method Marketing Agency, June 2026
**Source meeting:** xoExam v0.2.5 Review (May 27, 2026 · 2h16m · Zeshan Khan / Gary Hopkins / Steve Susanibar)

---

## 1. Purpose & lineage

Wavefront Refraction is the combined replacement for the traditional two-instrument refraction workflow:

| Traditional | xoExam |
|---|---|
| Autorefractor (objective) | Wavefront aberrometry capture |
| Phoropter (subjective) | Liquid-lens digital phoropter |

It is the most clinically important test in the suite — its output (the verified Rx) is the gate that releases the job object to the downstream xoFit fitting/finishing workflow.

**This component supersedes `WavefrontAberrometryTest.jsx` but does NOT remove it.** Per CD direction, the aberrometry test stays in the catalog and codebase; Wavefront Refraction is added as a new, parallel test (`id: wavefront-refraction`) built from a copy of it.

**Built from three sources:**
- `WavefrontAberrometryTest.jsx` — capture state machine, wavefront false-color map, color-scale legend, navy measurement table, report scaffold
- `RefractionAndContrast.jsx` (RefractionTest) — **live eye-scan look & feel** for the objective capture (dark viewer, breathing pupil, sweep line, centering ring) + new green alignment-lock
- `VisualAcuityTest.jsx` — VA chart, corrected/uncorrected logic, lens steppers, additive VA notation

All top-level identifiers are prefixed `WFR_` to avoid Babel global-scope collisions (VisualAcuityTest declares bare `C`/`FS`/`FONT`/`randomLetters` — never reused here).

---

## 2. Phase flow (mapped onto ExamShell)

```
entry → objective → subjective → report
(ready)  (testing)   (testing)    (report)
```

- **entry** (ExamShell `ready`) — two-card selector: **Full refraction** (objective→subjective, recommended) or **Subjective only** (skip objective; manual starting values). No Begin-Test button — cards drive navigation.
- **objective** (ExamShell `testing`) — monocular wavefront capture, **OD then OS**. Sub-stages: `init → calibrating → capturing → complete`. Cancel UX owned by ExamShell.
- **subjective** (ExamShell `testing`) — liquid-lens phoropter refinement. Step sequence per eye.
- **report** (ExamShell `report`) — unified results, Certify & close.

---

## 3. Clinical requirements — NON-NEGOTIABLE

1. **Axis before power (JCC).** Enforced by step order — `jcc-axis` always precedes `jcc-power`. The UI cannot reach power refinement before axis is confirmed.
2. **Fogging control.** After objective capture, a fog prompt offers **+0.75 D** with clinical explanation (relaxes accommodation, prevents over-minusing). Doctor may skip. Starting MPMVA sphere = objective sphere + fog.
3. **Sphere compensation note** visible during cylinder power: "For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion."
4. **Rx format discipline.** SPH/CYL always signed + 2 dp (`WFR_fmtSph`/`WFR_fmtCyl`); AXIS integer + ° (`WFR_fmtAxis`); ADD signed with D or "—" (`WFR_fmtAdd`). No exceptions.
5. **Monocular objective.** No OU averaging. Sequence OD → OS automatically via breadcrumb + transition modal.
6. **Certification gate.** "Certify & close" is the Rx certification event — flagged to MPR as a *system event*, not just a button. The Rx is not released downstream until certified. (Report sub-label: "Doctor sign-off · releases Rx to job object.")
7. **No clinical claims.** The report makes NO determinations/assessments/recommendations. Clinical Summary card states data only (scan counts, completion, "Final Rx pending clinician certification"). This is a deliberate divergence from the other clinical-fidelity tests, which carry a Patient Classification banner + Clinical Interpretation card — a refraction is a measurement-and-verification workflow, not a screening, so interpretive language is stripped per Zeshan's explicit direction ("we cannot claim any of that").
8. **Scan-count documentation.** Report shows scans taken per eye (1–3, quality indicator) — the wavefront retries on patient movement/blink and averages; the count tells the clinician how reliable the measurement is.

---

## 4. Objective stage — eye-scan look & feel (key correction from v0 prompt)

The v0 prompt said to reuse the aberrometry test's *circular-progress* animation. **The transcript overrides this:** Zeshan repeatedly pointed to the **Refraction test's live eye-scan** as the look he wants ("this is what true aberrometry capture looks like… see how it does left and right").

`WFR_EyeScanStage` implements: dark circular viewer (clinically appropriate — headset interior), iris radial gradient, breathing pupil, accent sweep line, rotating dashed centering ring, and a **red alignment dot that turns the backdrop green once locked** ("when the red dot is over the patient pupil, background turned green").

Readiness collapsibles relabeled/pruned per the call:
- **Patient alignment** — X/Y position, headset fit (cornea-vertex removed).
- **Pupil detection** — **pupil size** (not "diameter"), pupil center location, detection quality.
- **Patient focus** — image sharpness (doctor **yes/no** readiness control — confirms the device image of the eye is sharp enough to capture; independent of subjective fogging), fixation (the "score" suffix and auto-focus/optics-path/analysis-zone sub-items removed).

Two-phase capture confirmed in code: `calibrating` (centering optics to pupil) → `capturing` (scan N of 3).

---

## 5. Subjective stage — step sequence

```
setup → sphere (MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add
```
*`mpmva2` (second MPMVA) auto-triggers only if cyl changed ≥ 0.50 D or axis changed ≥ 10° from objective.

- **setup** — corrected/uncorrected toggle + **optotype selector** (Letters / Tumbling E / Tumbling C). Corrected reveals SPH/CYL/AXIS/ADD steppers loading the existing Rx into the liquid lens. (Also where subjective-only mode enters starting values manually.) The optotype is a *patient-accessibility* choice (children / non-literate / non-Latin-script readers report orientation rather than naming a glyph), and the subjective stage is an acuity measurement, so it carries the same optotype options as the standalone Visual Acuity test. Tumbling E (Snellen E, 3 bars + spine) and Tumbling C (Landolt ring with gap) are drawn as proper geometric SVG optotypes via `WFR_Optotype` — one consistent symbol per chart, shrinking down the lines, varying orientation — not rotated font glyphs.
- **sphere (MPMVA)** — markable VA chart + sphere stepper (0.25 D). Fog badge shows applied fog.
- **jcc-axis** — JCC diagram (red = cylinder axis dot, white = 90° away; flip swaps), 4-power selector (0.25/0.50/0.75/1.00, default 0.50), **axis steppers at three step sizes (±1° / ±5° / ±15°)** so the doctor reduces the step after each reversal (15°→10°→5°→3°→1°), flip + comparison counter (advisory at ≈3, per doctor — NOT 6 as in the v0 prompt).
- **jcc-power** — same target, cylinder stepper, sphere-compensation note.
- **add** — ADD stepper + age-expected reference table, skippable.

Eye toggle (OD/OS) in the sub-bar; runs OD fully, then OS. Additive VA notation (e.g. `20/25 +4`) computed via `getBestVA` and surfaced in the right panel "Best VA so far."

---

## 6. Report

- Navy "Wavefront Refraction Report" title (formal, title case).
- Patient Information (title case) incl. refraction mode, fog applied, JCC power used.
- **Final Prescription** — most prominent (2px accent border), large signed Rx per eye + ADD + BCVA.
- **Two-box** lower row: **Objective Results** (navy measurement table, scans taken) | **Subjective Correction** (delta from objective → final).
- **Wavefront analysis** (objective only): vertical view rail (pupil image / centroid / full wavefront / high-low orders) freeing real estate for larger maps, **3 mm / 5 mm ring overlay toggle** (Zeshan/"core lab" requirement), **"+" zoom-scope** opening a pannable enlarged map, color-scale legend.
- **Clinical Summary** — data only.
- Actions: Export report · Compare · **Certify & close** (with Doctor sign-off label).

---

## 7. Open items / TBD for MPR & next review

- **Pass/fail threshold** (`WFR_lineIsPassed`) currently "more than half correct" (50% fail). Gary to validate against a published standard before lock; surfaced here as TBD.
- **Certify & close → system event** must be wired by MPR as the Rx-release trigger to the xoFit job object (not a UI-only action).
- **Patient-headset view is out of scope** — this component is the tablet (technician/doctor) view only. The patient-facing headset/clicker experience (objective self-administered mode) is a separate scope to be defined with MPR.
- Objective readiness panel values + green-lock timing depend on liquid-lens/eye-tracking capability (engineer confirmation).
- Mock data: `WFR_OBJ` per-eye values at 6.0 mm analysis diameter.

---

## 8. Deferred (explicitly NOT in this build)

Per CD direction, Wavefront Refraction was prioritized ahead of all other v0.2.5-review feedback. The following from the transcript are logged for later passes and intentionally untouched here:
- ~~Standalone Visual Acuity Tumbling-E/C optotypes~~ — **done in this pass** (proper Snellen-E + Landolt-C geometric optotypes via `VA_Optotype`, Tumbling C added as a 4th chart type, shared shape with WFR's subjective stage). Remaining VA items still deferred: additive-notation report bug, 50%-vs-3/5 threshold validation.
- Color Vision / Ishihara clicker input + configurable cutoffs
- Patient Profile "Tests"→"Results" relabel + "Next visit test" pre-select
- Add-Patient form field bugs (focus loss, phone restriction, "primary diagnosis"→"primary complaint", billing → coming soon)
- Removing "early stage / diagnostic" status labels from Patients
- Hardware/logo branding (not software scope)

---

*Method Marketing Agency · xoExam UI/UX · Wavefront Refraction clinical specification v1 · June 2026*


---

## v0.2.7 — Six competitive-parity enhancements (merged into the single production component)

Benchmarked against the Marco OPD-Scan III aberrometer and the Reichert Phoroptor VRx digital refractor, and CD-approved (June 2026). All six were folded **directly into `components/WavefrontRefractionTest.jsx`** — the parallel `WavefrontRefractionTest v2.jsx` draft fork and its demo harness were deleted (one file, one source of truth). Every enhancement is **doctor-led-safe**: a measurement or a simulation, never a verdict. The report carries no Patient Classification banner.

1. **PSF + simulated-VA before/after** — point-spread-function render and simulated acuity derived from the Zernike set, comparing habitual Rx to the new Rx (Simulation tab). The before/after is tied to the old-vs-new Rx comparison.
2. **Binocular balance step** — runs after both eyes via fogging / alternate occlusion (no prism hardware required); subjective `subjStep:'binocular'`.
3. **Multi-source Rx comparison** — objective, subjective, habitual, and unaided with spherical-equivalent deltas (Rx-comparison tab). Habitual entered manually now; auto-pull from history later.
4. **Photopic vs. mesopic (day & night) refraction** — 4 mm analysis plus a 6 mm column (both hardware-confirmed) and a night-shift Diff row (Day-&-night tab).
5. **Smart-Cylinder auto-bracketing** — the JCC step size auto-sizes to the cylinder magnitude and narrows one rung after each reversal; toggle.
6. **Refraction-based progression tracker** — spherical-equivalent trend over visits + D/year vs. age-banded reference (Progression tab); the at-risk determination is left to the clinician.

**Report restructured into tabs:** Summary · Rx comparison · Day & night · Vision simulation · Wavefront (objective only) · Progression.

### Reversibility — hardware values isolated in named constants
Built to the confirmed **4 mm** analysis baseline throughout. Steve confirmed the hardware answers (Q3/Q7/Q8, Jun 9 2026); every hardware-dependent value is a named constant at the top of the file, so any later revision is a one-line edit — no teardown, no rebuild, no separate file:

| Constant | Value | Status |
|---|---|---|
| `WFR_REEHANA_CONFIRMED` | true | Confirmed (Steve, Q3/Q7/Q8) — no provisional hedging shown |
| `WFR_ANALYSIS_DIA` | 4.0 mm | Confirmed (Steve) |
| `WFR_SIXMM_PROVISIONAL` | true | Confirmed (Steve, Q3) — 6 mm columns shown |
| `WFR_ZERNIKE_MAX_ORDER` / `WFR_ZERNIKE_MODES` | 10 / 66 | Confirmed (Steve, Q7) — lenslet-limited |
| `WFR_VERTEX_MM` | 25–30 mm | Confirmed (Steve) |
| `WFR_SPHERE_RANGE` / `WFR_CYL_RANGE` | −14/+14 D · 0/−5 D | Confirmed (Steve, Q8 spec sheet) |

### Open
- Pass/fail acuity threshold for the subjective endpoint (Gary to validate).
- `Certify & close` → Rx-release system event wiring (MPR).
- Patient-facing headset view (out of scope for this component).

*This program remains pre-beta, active development pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. v0.2.7 is the integration version, not a finished milestone.*
