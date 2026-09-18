# xoExam™ — Development Brief
## v0.3.2 · September 18, 2026 · Objective & Subjective Refraction — subjective protocol aligned to published clinical technique

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## What changed in v0.3.2

The v0.3.1 console **structure** is unchanged. v0.3.2 corrects the subjective **protocol** that runs inside it, checked line by line against the **Westmead Eye Manual §8.2** subjective-refraction technique.

Nine changes, all inside `components/ObjectiveSubjectiveRefractionTest.jsx`. **Wavefront Refraction is untouched**, no other test was modified, and the count of tests at clinical fidelity is unchanged — **7 of 19**.

A **hardware requirement** was identified in the process and has been logged for engineering.

---

## Executive summary

v0.3.1 answered the interaction question — can the whole subjective refraction happen on one screen. v0.3.2 answers the clinical one: **is the procedure it runs correct.**

The most consequential finding is that our sphere step ran a single protocol for every patient. Published technique branches it, and for a specific reason: fogging exists to neutralize **accommodation**. In a patient over 60, or a pseudophakic patient, there is no accommodation to neutralize — fogging is wasted steps. In a pre-presbyopic patient, skipping fogging (or using symmetric step sizes) produces an **over-minused prescription**, because the patient's accommodation absorbs additional minus and they keep accepting it. They leave with glasses that make them focus constantly, and they return complaining of eyestrain and headaches.

The remaining corrections tighten the JCC, the sphere-cylinder relationship, and the duochrome endpoint. Individually small; together they are the difference between a plausible-looking refraction workflow and one a refractionist would recognize as correct.

The hardware finding is the item that most needs engineering attention, because it cannot be solved in the UI and it fails **silently** — see below.

---

## The corrections

### 1. Age-branched sphere protocol
The sphere step now branches on whether accommodation is in play.

- **≥60 years or pseudophakic** — direct ±0.25 D plus/minus preference comparison. No fogging; the fogging panel states why it is not used.
- **Under 60** — fogging protocol with the correct **asymmetric** steps: add **+0.50 D**, confirm whether vision is worse, and reduce only in **−0.25 D** increments.

Patient age and a pseudophakic flag are set in session setup. Age is expected to arrive from the patient record through MPR's cross-test data layer.

### 2. JCC fixation target corrected
JCC now presents a **round target ("O") two lines above best acuity**, replacing a full letter line one step larger. A round optotype shows the astigmatic smear without letter-recognition confounds. The target and its acuity level are labeled, and the patient-view Peek renders it.

### 3. Separate cross-cylinder magnitudes for axis and power
A **higher** cross-cylinder for axis refinement, a **lower** one for power refinement — now independent values (defaults 0.50 D and 0.25 D) rather than one shared setting, each labeled accordingly.

### 4. Handle vs. axis alignment is now depicted
In axis refinement the JCC **handle** lies along the cylinder axis, with the cross axes at ±45°. In power refinement one JCC **axis** lies along it. The dial renders both states and captions which is in force — previously it showed one arrangement for both.

### 5. Sphere compensation is active
For each **0.50 D of cylinder** added, **0.25 D of opposite sphere** is applied, holding the circle of least confusion. Because cylinder moves in 0.25 D steps, the compensation accumulates and applies on alternate steps, with a pending indicator showing the accrued amount. Toggleable, so the clinician can override.

### 6. Axis midpoint endpoint
The axis endpoint is reached either when both flips look equal **or** when the clinician is switching within a narrow range of axes — in which case the midpoint of that range is taken. The console now lets the clinician mark bracket axes and apply the computed **midpoint**.

### 7. Duochrome endpoint corrected
The mnemonic **RAM-GAP** (red add minus, green add plus) is surfaced, and the endpoint is stated as leaving the patient **slightly on the red side** rather than at strict equality. The red bias is deliberate insurance against over-minusing — the same concern that drives the whole maximum-plus discipline.

### 8. Skip-ahead acknowledgment removed
During subjective refraction the doctor moves between acuity lines constantly — testing a finer line after a sphere change, dropping back when the patient struggles. The console previously asked for an acknowledgment before jumping past the patient's current line. That has been removed at Xenon's direction: line navigation is now free in both directions, by any distance, with no dialog. The supporting machinery (confirmation modal, override counter, audit row) was deleted rather than left inactive.

This applies to this console only. The **Visual Acuity v3** frontier model keeps its acknowledgment, where the argument for it is different and stronger — there the chart *is* the measuring instrument, so skipping a line leaves genuinely unscored letters in the record.

### 9. Near add follows working distance
Add power now offers habitual **working-distance** selection (25 / 33 / 40 / 50 cm) with the resulting dioptric demand, alongside the age-expected value. Add power follows the patient's daily activities and viewing distance, not age alone.

---

## Confirmed correct, unchanged

**Axis before power.** The correct axis can be found in the presence of incorrect power, but the correct power cannot be found in the presence of an incorrect axis. The v0.3.1 JCC ordering was right and is unchanged.

---

## ⚠ Hardware requirement for engineering — liquid-lens transitions must "protect the fog"

**This cannot be solved in the UI, and it fails silently.**

In conventional trial-frame technique, when changing plus lenses the clinician places the **new** plus lens before removing the **old** one, so the patient is never given an unfogged instant in which to accommodate. On the xoExam liquid lens the equivalent is a **transition constraint**:

> While fogging is in force, a commanded power change must never pass through a state with **less plus** than both its start and end values. The lens must move monotonically, or hold the greater plus value through the transition.

If the lens momentarily dips toward minus while changing power — for instance by zeroing before setting a new value — the patient's accommodation is released, the fog is lost, and the sphere endpoint drifts minus. **Nothing on screen indicates this has happened.** The prescription is simply over-minused, and the failure looks identical to a normal exam.

This applies to every power change during a fogged MPMVA, and to the fogging step itself. It should be verified on hardware and documented in the lens-control interface. Recommended as a direct question to Steve.

---

## Files touched

| File | Change |
|---|---|
| `components/ObjectiveSubjectiveRefractionTest.jsx` | **Edited** — eight protocol corrections, skip-ahead gate removed; JCC Power header bug fixed |
| `index.html` · `deploy.html` | **Edited** — version strings |
| `components/WavefrontRefractionTest.jsx` | **Untouched** |
| `CLAUDE.md` · `README.md` | **Updated** — v0.3.2 log |
| Handoff Specification v0.3.2 | **New** — §7a protocol alignment, §7b lens-transition requirement |

---

## Bug fix

The JCC **Power** tab header rendered "MPMVA" instead of "JCC" — the tool-metadata lookup did not map the power sub-step back to the unified JCC tool.

---

## Source

Westmead Eye Manual, §8.2 Subjective Refraction (Sim, Yun, Catt, Fung) — used as an independent published reference for standard technique. It is a teaching reference, not a regulatory standard; the clinical team's own judgment governs, and any of these corrections can be revisited on their direction.

---

## Open items

1. **Which refraction model proceeds.** Objective & Subjective Refraction is a **development branch of Wavefront Refraction** and, if approved, would **replace** it. Both remain in the catalog for direct comparison until that decision is made.
2. **Liquid-lens transition constraint** — verify on hardware (Steve); no UI workaround exists.
3. **Patient age source** — confirm it arrives from the patient record via MPR rather than manual entry.
4. **Response-driven optics** — whether a patient response should drive the lens directly rather than the clinician adjusting, as digital phoropters do.
5. **Guided mode** — whether procedural coaching and a suggested-next-tool highlight are wanted for technicians, behind an optional toggle.
6. **Certify & close → Rx-release system event** — MPR to wire, unchanged.
7. **VA pass/fail threshold** — Gary to validate, unchanged.
8. **WFOR variance items still open** — night-vision workflow, the 0.75 D trigger, and the patient day/night demonstration, per `xoExam WFOR Variance Analysis v0.3.0`.

---

## Tests at clinical fidelity (7 of 19)

> The prototype ships as one unified build — **v0.3.2**. The column records *when each test last reached clinical fidelity*, not a per-test version.

| # | Test | Reached clinical fidelity in |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |
| 7 | Wavefront Refraction | v0.2.6 (six enhancements merged v0.2.7) |

Objective & Subjective Refraction remains a **parallel development branch** of the refraction workflow presented for review; it is not counted separately, since its clinical content derives from Wavefront Refraction.

---

## Deployment

- **Edited:** `components/ObjectiveSubjectiveRefractionTest.jsx`, `index.html`, `deploy.html`
- **Distribution package:** `_dist_v0.3.2/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.3.2 · September 18, 2026*
