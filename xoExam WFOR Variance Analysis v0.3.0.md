# xoExam™ — Wavefront Optimized Refraction (WFOR)
## Variance Analysis · Reference Description vs. Current Prototype

**Method Marketing Agency for Xenon Ophthalmics Inc.**
**Prototype version:** v0.3.0 · **Date:** July 29, 2026
**Reference document:** "Wavefront Optimized Refraction Description" (July 2026)
**Prototype component under review:** `components/WavefrontRefractionTest.jsx` (test id `wavefront-refraction`, all identifiers `WFR_` prefixed)

---

## Purpose of this document

This is a **working discussion document**, not a change order or a critique. It sets the WFOR process as outlined in the reference description alongside what the xoExam prototype currently implements, so the differences are visible in one place and can be talked through.

Differences are sorted into three categories:

1. **Aligned** — the prototype already does what the description outlines.
2. **Variance** — a difference between the description and the prototype.
3. **Hardware-gated** — described in the reference, but not buildable against current xoExam headset capability.

No prototype changes have been made. Nothing here should be read as a decision, and nothing here assumes the reference description is a fixed requirement — several items are more likely open questions or points where the description and the hardware simply have not yet been reconciled.

> **A note on scope.** The reference describes **WFO / WFOR** as an end-to-end clinical *process* — the aberrometer combined with the xoExam refraction, supported by a broader "Visual Path Diagnostics" data set. The prototype's `wavefront-refraction` test implements the **refraction portion** of that process. Several variances below are therefore not gaps in the test itself; they are scope sitting outside this one component, either in other tests or in back-end data flow. They are listed anyway for completeness.

> **Data population is out of our scope.** Cross-test value population (starting Rx, prior results, measured parameters flowing between tests) is being built by **MPR on the back end** — for example, Visual Field's starting Rx auto-populating from Wavefront Aberrometry, Visual Acuity, or the WFOR resultant Rx. Our responsibility is the **fields, labels, and provenance display** — where a value lands, what it is called, and what it says its source was. Where this document notes a manual-entry affordance, the expectation is auto-population with manual override as fallback.

---

## 1. Summary

**The prototype aligns well with the described process.** The governing principle of the reference description — that the instrument produces superior objective data while the doctor retains full professional control of the interpretation and the final prescription — is the same doctor-led principle the prototype is built on. The two-stage objective-then-subjective architecture, the multi-source Rx comparison including the old Rx, and the certify-and-release gate all correspond directly.

**The largest variance is the night-vision workflow.** The description outlines a complete **second subjective refraction** conducted under mesopic conditions, saved as a separately named "Night Vision" prescription, and then used to demonstrate the difference to the patient. The prototype currently treats photopic-vs-mesopic as a **measurement comparison presented in a report tab** — the data is there, the workflow is not. Closing that is design work, not hardware work.

**One variance likely resolves in the other direction.** The description calls for the objective measurement to be taken in a darkened room. Current understanding is that the xoExam headset does not require one — the gasketing over the eye area should be light-tight enough to establish mesopic conditions optically rather than environmentally. If that holds, this is a point where the description can be simplified rather than a gap for us to close. Worth confirming, since a dark-room requirement would meaningfully constrain the product's portability. See V7.

**A further cluster is hardware-gated.** The described "Visual Path Diagnostics" includes corneal topography (Placido), the internal astigmatism / IOL map separating corneal from posterior contributions, and Angle Kappa. Topography and the corneal-vs-internal split are already documented as next-version hardware. **Angle Kappa is not currently on any of our scope lists** — the one genuinely new item this review surfaces, and possibly feasible with the existing pupil camera plus fixation reflex. It warrants a hardware question.

**Counts:** 6 aligned · 7 variances · 3 hardware-gated · 3 open questions.

---

## 2. Where the prototype and the description align

| # | Described | Prototype status |
|---|---|---|
| A1 | **Professional judgment retained by the doctor** — the doctor maintains full professional control over the process and the final correction; clinical interpretation cannot be replaced with technology alone. | **Aligned — the strongest correspondence in the set.** WFOR deliberately carries no Patient Classification banner and no device-authored clinical verdict. Reference data and measurements are shown; the bottom-line call is a doctor affordance. This is the reference pattern the rest of the catalog is being brought in line with. |
| A2 | **Objective data is superior, but subjective response is irreplaceable** — there is no substitute for evaluating subjective responses to optical correction. | **Aligned.** Four-phase flow `entry → objective → subjective → report`: objective wavefront capture followed by a subjective liquid-lens phoropter sequence. Neither stage is skippable by design. |
| A3 | **Multiple refractions stored and compared** to each other and to the old Rx. | **Aligned.** The Rx-comparison tab presents objective · subjective · habitual (old) · unaided with spherical-equivalent deltas. |
| A4 | **Photopic and mesopic optical zones assessed.** | **Partially aligned — data present, workflow absent.** The Day-&-night tab shows photopic vs. mesopic with a night-shift Diff row at both 4 mm and 6 mm. See V1. |
| A5 | **Digitally controlled electronic refractor** performing the refraction. | **Aligned.** The subjective step is modeled as a liquid-lens phoropter with a stepped sequence (MPMVA → JCC axis → JCC power → add), replacing the manual phoropter. |
| A6 | **Networked to EMR**, data transmitted electronically for recording accuracy and speed. | **Aligned in design intent.** Certify & close is specified as the Rx-release system event that hands the verified prescription downstream. The wiring itself is an open MPR item, already flagged as such. |

---

## 3. Variances

### V1 · Night vision is described as a workflow; the prototype treats it as a report comparison
**Priority: high — the primary variance.**

The description outlines an eight-step process in which steps 5 through 8 constitute a **second complete subjective refraction**:

- The first subjective refraction is completed in normal lighting, targeting best-corrected VA.
- The doctor selects **"Night Vision"** from a dropdown, which **duplicates the subjective refraction into a new field**.
- The doctor dials in the **mesopic refraction as the starting point** and switches the chart to a **black background with white letters**.
- The doctor completes the **second refraction** against that mesopic starting point.

The prototype has the underlying photopic/mesopic measurement and displays the difference, but there is **no second subjective pass, no separately named prescription, and no reversed-contrast chart state.** This is the difference between reporting a finding and conducting a procedure.

**What closing it would involve:** a branch in the subjective step sequence after the first refraction completes; a named second Rx record ("Night Vision") seeded from the mesopic values; a reversed-contrast chart mode; and a report carrying both prescriptions side by side.

---

### V2 · The 0.75 D trigger rule is not implemented
**Priority: high — low effort, clear clinical rule.**

The description gives an explicit gate for entering the night-vision path: the patient reports night-vision difficulty, **or** there is a **greater than 0.75 D difference between photopic and mesopic sphere and cylinder**.

The prototype computes the photopic-vs-mesopic difference but does not evaluate it against a threshold or surface a prompt. The night-vision path — once built — would otherwise depend on the doctor noticing the delta unaided.

**Design note, doctor-led:** the appropriate treatment is a **prompt, not an automatic branch**. The device may surface "photopic/mesopic difference exceeds 0.75 D — second refraction for night vision?" and leave the decision to the clinician. It should not branch on its own, and it should not characterize the finding as abnormal.

---

### V3 · No patient demonstration mode for day vs. night
**Priority: medium-high.**

Step 8 describes the doctor illustrating to the patient the difference between the two prescriptions in dark and light environments "with just a simple selection between subjective and Night Vision." The Prescriptive Validation section reinforces the intent: the comparison exists so the patient has confidence in their choice and in the prescription.

The prototype has PSF and simulated-VA before/after, but it is wired to **habitual-vs-new**, not **day-vs-night**, and it is presented as a clinical report element rather than a patient-facing demonstration.

**What closing it would involve:** extending the simulation pairing to accept the day/night pair, and a presentation state suitable for turning the screen toward the patient.

---

### V4 · Best-corrected VA at distance *and* near not explicitly targeted
**Priority: medium.**

Step 5 notes the doctor will "strive for the best corrected VA for distance and near." The prototype's subjective sequence ends with an add step, which addresses near correction, but the flow does not explicitly establish and record **best-corrected near VA** as a target alongside distance.

**What closing it would involve:** a recorded near-VA endpoint in the subjective sequence and a corresponding report line, rather than treating near as an add-power value only.

---

### V5 · Chart contrast — an exception worth codifying
**Priority: medium.**

The described night-vision step calls for a **black background with white letters**. The prototype's Visual Acuity chart specification states the opposite as mandatory: black optotypes on a white field, because acuity is not presented white-on-dark.

**Both positions are correct in their own context.** Standard acuity measurement requires black-on-white. Mesopic/night-vision refraction reasonably uses reversed contrast, since the intent is to replicate the patient's night-driving condition. This is not an error in either document.

**Suggestion:** codify the exception explicitly — black-on-white remains mandatory for acuity measurement; reversed contrast is permitted **only** in the night-vision refraction step, where it is a deliberate simulation of the mesopic environment. Left unstated, it reads as a contradiction between two of our own specifications.

---

### V6 · Pupillometry and refraction are coupled in the description, separate in the prototype
**Priority: medium — partly an MPR data-flow item.**

The description refers to photopic and mesopic sphere and cylinder obtained "when measuring in the **pupillometry mode**," and to the doctor reviewing "the **pupillometry refraction**" to assess the photopic-vs-mesopic pupil difference. That model treats pupil measurement and refraction as coupled within one measurement mode.

In the prototype, Pupillometry and Wavefront Refraction are **separate tests with no shared surface**. The photopic/mesopic values in WFOR are not presented as originating from the pupillometry measurement, and the pupil sizes captured in Pupillometry do not appear in the refraction context.

**Scope note:** the value transfer itself is MPR's back-end work. Ours is the **provenance display** — WFOR showing that its photopic/mesopic pupil values came from the Pupillometry measurement, with pupil diameters visible in the refraction context so the difference can be assessed where the description expects it to be assessed.

---

### V7 · Dark room — likely resolves in the prototype's favor
**Priority: high — worth confirming early, as it shapes the night-vision build.**

Step 3 describes the aberrometer measurement being taken **in a darkened room**, and step 7 has the room lights turned off before the night-vision refraction. That is consistent with how table-top instruments operate: because the optical path is open to the room, the room supplies the mesopic condition.

**Current understanding is that the xoExam headset does not carry this constraint.** The gasketing over the eye area should be light-tight enough that photopic and mesopic conditions are established **inside the headset** by controlling internal illumination, rather than by darkening the exam room. If confirmed, the measurement condition becomes a device setting rather than an environmental prerequisite.

**Why it is worth settling early:**

- **Portability.** Much of the value of a tablet-controlled headset is that it works outside a conventional exam lane — mobile clinic, retail floor, school screening, remote or field settings — none of which can reliably provide a darkenable room. A dark-room requirement in the WFOR procedure would narrow where the system can be used.
- **Repeatability.** Internal illumination is measurable and reproducible; ambient room darkness is not. Two rooms "with the lights off" are not necessarily the same mesopic condition. A device-controlled condition is the more defensible measurement.
- **Workflow simplicity.** No lights to manage and no room adaptation step interrupting the exam.
- **Build implications.** Whether mesopic is a device setting or an environmental step changes how the night-vision workflow (V1) is designed, so this is better answered before that work is specified.

**Suggested approach:** rather than implementing a dark-room prompt, have the objective and night-vision steps **record the internal illumination condition** used for each capture (photopic / mesopic) and display it in the report as the measurement condition. That preserves the clinical intent of step 3 — a known, documented mesopic measurement — without the environmental dependency.

**To confirm:** whether headset gasketing is light-tight across the full mesopic range. This is a question for Steve. It is quite possible the description was drafted from familiar table-top workflow and simply predates this detail of the headset design.

---

## 4. Hardware-gated — described, not buildable today

These are **not prototype gaps.** They are capabilities the current xoExam headset does not have. Listed so the boundary between "not yet built" and "not yet possible" is unambiguous in front of the clinical team.

| # | Described | Status |
|---|---|---|
| H1 | **Corneal topography (Placido disc)** — to determine how much the corneal surface contributes to refractive power and the aberration profile, and to assess tear film and surface abnormalities. | **Not current hardware.** Already documented as slated for the next-version xoExam. Today the headset measures total ocular aberrations only. |
| H2 | **Internal astigmatism map / IOL Map** — separating corneal-surface contribution from structures posterior to the cornea (posterior corneal surface, lens, vitreous, retina). | **Not current hardware.** Depends on H1 (topography) to compute the corneal-vs-internal split. Already on the future list. |
| H3 | **Angle Kappa** — with a visual image of the optical reflex and its alignment to the pupillary center, to assess physiological alignment of the optical elements. | **Not currently in any xoExam scope document — the one new item this review surfaces.** It may be feasible with the existing pupil camera plus a fixation reflex capture, which would make it a software/UX build rather than new hardware. **Recommend a hardware question to Steve** before treating it as gated. |

**Related, partially covered:** the description refers to RMS values "for each zone" across the photopic and mesopic optical zones, supporting assessment of the symmetry and consistency of power distribution. The prototype reports RMS higher-order aberrations at 4 mm and 6 mm analysis diameters — close, but framed by analysis diameter rather than by photopic/mesopic zone. Worth confirming whether the intended framing requires a different presentation.

---

## 5. Open questions

| # | Item | Question |
|---|---|---|
| D1 | **Naming — WFOR.** The reference names the process **Wavefront Optimized Refraction (WFO / WFOR)**. The prototype calls the test **Wavefront Refraction**. | Adopt WFOR across UI, reports, and documentation? It is the more precise and more descriptive term. **Awaiting CD go-ahead — nothing renamed yet.** |
| D2 | **One device or two.** The description refers to the aberrometer sending its auto-refraction value **to** "the XoExam refractor," which reads as two connected instruments. The xoExam headset performs **both** in one device. | Confirm intent. The single-device architecture removes the transfer step and a second patient positioning, but the described process depends on a handoff at step 3, so it is worth aligning rather than assuming. |
| D3 | **Dark room.** See **V7**, where this is treated as a variance likely resolving in the prototype's favor. | Confirm with Steve that headset gasketing is light-tight across the full mesopic range, so conditions can be set by internal illumination alone. The prototype would then **record the internal illumination condition** per capture (alongside scan count, which it already tracks) rather than prompt for a darkened room. |
| D4 | **"CV" field.** Step 2 notes "a field should be created in the CV labeled 'Night Vision.'" | Confirm what CV refers to — chart view, clinical view, or a record field. This determines whether the named Night Vision prescription lives in the exam UI, the patient record, or both. |

---

## 6. Suggested sequence for discussion

Offered as a starting point:

1. **Resolve D1–D4 first.** Quick answers that change how the rest is built — particularly D4, which determines where the Night Vision prescription lives.
2. **Send two hardware questions to Steve together:** **Angle Kappa** feasibility (H3) and **gasket light-tightness** (V7 / D3). Both change the shape of the work depending on the answer, and V7 in particular should be settled before the night-vision workflow is specified, since it determines whether the mesopic condition is a device setting or an environmental step.
3. **Treat V1 + V2 + V3 as one coherent piece of work.** The trigger prompt, the second subjective refraction, and the patient demonstration are three parts of one clinical story; building them piecemeal would produce a disjointed workflow. This touches the WFOR component, which is the reference pattern for the catalog, so per project practice it should be a deliberate single pass rather than incremental edits.
4. **V5 (contrast exception) can be codified regardless** of whether V1 is built now, since the contradiction currently sits between two of our own specifications.
5. **V4 and V6** are smaller and can follow.

---

## 7. Bottom line

The prototype's WFOR implements the **refraction core** of the described process faithfully, and its doctor-led posture matches the professional-judgment framing closely enough that the two documents reinforce one another.

What it does not yet implement is the **night-vision arm** — the trigger, the second subjective refraction under mesopic conditions, the separately named prescription, and the patient demonstration. That is the substance of the variance, and it is design work within reach.

The remaining differences are either hardware-gated and already documented as such, or scope living outside this single test component.

**Two items are worth early attention.** The **Angle Kappa question** (H3), because it is the only variance whose category is currently unknown. And **V7, the dark-room question**, which likely resolves in the prototype's favor — if the gasketing confirms as expected, the description can be simplified rather than the workflow constrained, and settling it clears the way to specify the night-vision build.

---

*Method Marketing Agency · xoExam WFOR Variance Analysis · Prototype v0.3.0 · July 29, 2026*
*Working discussion document — no prototype changes have been made.*
