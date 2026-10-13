# xoExam™ — Development Brief
## v0.3.3 · October 13, 2026 · Objective & Subjective Refraction — binocular alignment, near vision, refraction-flow branching

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## What changed in v0.3.3

Three additions to **Objective & Subjective Refraction**, all inside `components/ObjectiveSubjectiveRefractionTest.jsx`. **Wavefront Refraction is untouched**, no other test was modified, and the count of tests at clinical fidelity is unchanged — **7 of 19**.

1. **Binocular alignment with digital prism** — the Balance tool now measures ocular alignment as well as balancing clarity.
2. **Near-vision workflow** — add, near acuity, and range of clear vision as one tool.
3. **Refraction-flow branching** — JCC opens in the mode the starting cylinder calls for, and the console notes when a step is not needed.

Sources: a client-provided remote-console model, reviewed for missing **functionality** only (not design), and Indiana University *Clinical Refraction in Eye Care*, chapter 3, "The Flow of Refraction".

---

## 1. Binocular — Balance | Alignment · prism

The Balance tool now answers two separate questions, kept separate on purpose:

- **Balance** — are both eyes equally clear? Dissociation by **alternate occlusion** or a new **per-eye split** (right eye sees the top line, left eye the bottom).
- **Alignment** — are the eyes aligned? Each eye gets its own copy of the target, color-coded. If the eyes aren't aligned, the patient sees two images. The clinician steps prism **Base In / Out / Up / Down** on either eye (0.25, 0.5 or 1Δ) until the images fuse. The amount needed is the measured deviation, shown live in Δ and as separation at the simulated 6 m.

**Targets:** fixation cross, the selected chart (Snellen / Tumbling E / Landolt C), or a fusion dot. Cross and chart give a **dissociated** reading; the fusion dot gives an **associated** reading with fusion held. The method is recorded.

**Split OU** divides the prism evenly between the eyes, as is common in prescribing.

**Doctor-led:** measured prism appears beside each eye's prescription with a **Meas. / Rx** toggle. It is recorded as a measurement by default and enters the final prescription only when the clinician elects to prescribe it.

**Seeing alignment at a glance:** when the two images fuse, the preview turns green and the two colored targets merge into one — the same thing the patient now sees — with the readout changing to "✓ Aligned".

**Base controls:** a cross-shaped pad labeled *Base* — Up and Down above and below, In and Out to the sides. The pad mirrors when switching eyes so **In always points toward the nose**, matching the direction on the patient's face.

**For engineering:** Base In moves the right eye's image one way and the left eye's the other. This mirroring is encoded in one documented function the device rendering must follow.

---

## 2. Near — Add | Near acuity | Range

- **Add:** linked across both eyes by default (unequal adds prompt a return to Balance, since they usually signal a distance imbalance); **distance prescription locked** while working on near; near prescription shown per eye; working distance in centimeters and inches; age-expected add with one-tap apply.
- **Near acuity:** recorded for both eyes or each eye, with its notation (Snellen-equivalent and M-units at the working distance), contrast, and lighting. The patient sees **reading text** or the selected chart, sized to the level being tested.
- **Convergence:** in a headset, near is simulated optically, so each eye's image is also turned inward to match the working distance. Without this the patient focuses for near while their eyes stay set for distance, which skews the add. Near PD is computed for downstream xoFit.
- **Range of clear vision:** plus and minus to blur (NRA / PRA), with **Center add** placing the add in the middle of the clear range.

---

## 3. Refraction-flow branching

Standard refraction is a funnel, and not every patient needs every step. The console now reflects that without forcing anything:

- **JCC opens by starting cylinder** — above 0.50 D, **axis first**; at or below 0.50 D, **power first** to confirm the cylinder is real; none present, a new **Probe** mode tests at 180°, 90°, 45° and 135° and, if cylinder is found, hands over to axis refinement. The Probe / Axis / Power toggle remains available.
- **Second MPMVA** shows "not needed" when JCC changed neither cylinder power nor axis.
- **Near** shows "not typically indicated" for patients under 40 (not when pseudophakic, who need an add regardless of age).

---

## 4. Objective scan count — 3 or 5

Requested by Zeshan and Steve; hardware confirmed. Before capture, the clinician chooses **3 or 5 scans per eye** (default 3). Three is the routine clinical standard; five is used where precision matters most — young patients with active accommodation, unsteady fixation, tear-film instability, or progression tracking.

- **Correct averaging.** Readings are averaged as power vectors and converted back to sphere / cylinder / axis. Averaging axis values directly gives wrong answers near horizontal (170° and 10° would average to 90°).
- **Bad readings are retaken automatically.** A reading more than 1.00 D away from the others — typically a blink or a lapse in fixation — is discarded and replaced, so the selected number of good scans is always reached.
- **Spread is shown.** After capture, the scan-to-scan variation for sphere and cylinder is displayed and flagged when high. This is a measurement for the clinician, not a judgment. A 3-scan capture can be extended to 5 with **Take 2 more** without starting over.
- **Recorded.** Scans averaged, readings rejected, and the spread appear in the report.

## Report

A new **Near & binocular findings** section records working distance, near prescription, near acuity, near conditions, range of clear vision, near PD, balance method, measured prism with its method, and whether prism was prescribed.

---

## Files touched

| File | Change |
|---|---|
| `components/ObjectiveSubjectiveRefractionTest.jsx` | **Edited** — alignment/prism, near workflow, JCC branching, report findings |
| `index.html` · `deploy.html` | **Edited** — version strings |
| `components/WavefrontRefractionTest.jsx` | **Untouched** |
| `CLAUDE.md` · `README.md` | **Updated** — v0.3.3 log |

---

## Verification

Every console state measured at **≤ 631px of the 656px available** at the 1280×800 tablet target with the sidebar open — no scrolling.

---

## Open items

1. **Per-eye display hardware (Steve).** Digital prism, the per-eye split and near convergence assume independent per-eye displays with a calibrated pixels-per-degree figure. The on-screen confirmation note has been removed; the question remains open.
2. **Distance PD source.** Expected from the objective scan via MPR; a demonstration value is used in the prototype.
3. **Intermediate distance (60–70 cm).** Not built; held for xoFit.
4. **Which refraction model proceeds.** Objective & Subjective Refraction is a development branch of Wavefront Refraction and, if approved, would replace it.
5. **Certify & close → Rx-release system event** — MPR to wire, unchanged.
6. **Liquid-lens "protect the fog" transition constraint** — carried from v0.3.2, to verify on hardware.

---

## Tests at clinical fidelity (7 of 19)

> The prototype ships as one unified build — **v0.3.3**. None of the seven changed in this release.

| # | Test | Reached clinical fidelity in |
|---|---|---|
| 1 | Visual Acuity | v0.2.3 |
| 2 | Color Vision (Ishihara + D-15 Farnsworth) | v0.1.7 |
| 3 | Visual Fields | v0.1.8 |
| 4 | Wavefront Aberrometry | v0.1.9 |
| 5 | Extraocular Motility | v0.2.1 |
| 6 | Pupillometry | v0.2.5 |
| 7 | Wavefront Refraction | v0.2.6 (six enhancements merged v0.2.7) |

Objective & Subjective Refraction remains a parallel development branch presented for review and is not counted separately.

---

## Deployment

- **Edited:** `components/ObjectiveSubjectiveRefractionTest.jsx`, `index.html`, `deploy.html`
- **Distribution package:** `_dist_v0.3.3/`
- **Live:** [xoexam-uiux.netlify.app](https://xoexam-uiux.netlify.app)

---

*Method Marketing Agency · xoExam UI/UX Development Brief · v0.3.3 · October 13, 2026*
