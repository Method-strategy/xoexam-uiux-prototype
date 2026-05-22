# Visual Acuity — Unified Clinical & Design Spec (v2)
## xoExam UI/UX · Method Marketing Agency · May 22, 2026
## Backfill spec — supersedes the unwritten v1 prompt

> Visual Acuity reached "clinical fidelity" in xoExam v0.1.4 — but that pre-dated the formal spec format. This document is the v2 backfill. It captures (a) what was already correct in the v0.1.4 implementation, (b) what was clinically incomplete or arbitrary, and (c) the v0.2.3 corrections that bring VA to the same rigor as VF (v0.1.8), WFA (v0.1.9), and EOM (v0.2.1).

---

## A. What changed in v0.2.3

### Already correct in v0.1.4 — carried forward unchanged
- Standalone component file with `VA_` prefixes.
- Wrapped in `<ExamShell>` with three phases (ready / testing / report) — canonical Cancel UX owned by ExamShell.
- OD / OS / OU eye modes (universal medical convention).
- Three chart types: Snellen letters / Numbers / Tumbling E.
- Per-line scoring (mark each letter correct/incorrect, mark all correct/incorrect shortcuts).
- Auto-progression at line-pass threshold.
- Per-eye prescription adjustment panel (SPH/CYL/AXIS for OD & OS).
- Detailed report with VA table + prescription summary.
- Individual lines view + full chart view toggle.
- Regenerate letters per line button.
- Session timer + elapsed display.

### Clinical accuracy corrections / additions in v0.2.3

1. **LogMAR notation added as a parallel display to Snellen.** LogMAR (log of the Minimum Angle of Resolution) is the modern clinical standard for research, longitudinal comparison, and statistical analysis. The formula `logMAR = log10(denominator/20)` for any Snellen `20/x` value. Standard reference points:
   - 20/200 → 1.00 logMAR
   - 20/100 → 0.70
   - 20/70  → 0.54
   - 20/50  → 0.40
   - 20/40  → 0.30
   - 20/30  → 0.18
   - 20/25  → 0.10
   - 20/20  → 0.00 logMAR (definitionally "normal")
   - 20/15  → -0.12
   - 20/10  → -0.30

   The report surfaces both — Snellen for clinician familiarity, logMAR for documentation and trend analysis.

2. **ETDRS chart added as a fourth selectable chart type.** ETDRS (Early Treatment of Diabetic Retinopathy Study, 1982) is the gold standard for visual acuity measurement in clinical trials and is increasingly the default in clinical practice over the legacy Snellen chart. Differences:
   - 5 letters per line at every line (Snellen varies from 1 to 8+).
   - Equal step size between lines (0.1 logMAR).
   - Sloan letter set (10 letters of equal recognition difficulty).
   - Bailey-Lovie crowding (inter-letter spacing = letter width).
   - Letter-by-letter scoring at 0.02 logMAR per letter.

3. **Sloan 10 letter set when ETDRS mode is active.** The original Sloan optotypes: **C, D, H, K, N, O, R, S, V, Z**. These ten letters were designed to have equal recognition difficulty at the legibility threshold. The legacy Snellen mode keeps its existing letter pool for chart-recognition continuity, but ETDRS mode is locked to Sloan 10.

4. **Line-pass threshold corrected to clinical convention.** v0.1.4 used `≥ 65%` which was arbitrary. The published clinical convention is **"more than half correct"** — for a 5-letter ETDRS line, that's **≥ 3/5 (60%)**. Implemented as: line passes when correct count > half of total letters (e.g., 3+ on a 5-letter line, 4+ on a 7-letter line, 5+ on an 8-letter line). Auto-progression uses this rule.

5. **Pinhole occluder affordance** added in the setup config and as a result-screen toggle. Standard part of any VA workup — pinhole improves VA → refractive cause; pinhole does not improve → pathological cause (cataract, retinal, optic nerve). When enabled, the doctor enters a second VA after pinhole; the report compares.

6. **Pediatric symbols (LEA) mode** added as a fifth chart type for non-readers and young children. **LEA symbols**: circle, square, apple, house (4 shapes of equal difficulty). The standard pediatric VA test set since the 1970s.

7. **Bailey-Lovie crowding rules** applied to ETDRS mode rendering. Inter-letter spacing = width of one letter at that line. Inter-line spacing = height of the next-smaller line. Snellen mode retains its existing spacing (intentional — it is what most clinicians visually recognize as a "Snellen chart").

8. **Letter-by-letter logMAR scoring** in ETDRS mode. The doctor's best-corrected logMAR is computed as `last_line_passed_logMAR - (correct_letters_on_next_line × 0.02)`. Surfaced in the report as the primary VA result when ETDRS mode is used.

---

## B. Component contract (unchanged from v0.1.4)

```js
function VisualAcuityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
}

Object.assign(window, { VisualAcuityTest });
```

All top-level identifiers prefixed `VA_`. Wrapped in `<ExamShell>`. Cancel UX owned by ExamShell. v0.2.3 adds new `VA_` constants for the additional functionality:

```js
const VA_SLOAN_10        = ['C','D','H','K','N','O','R','S','V','Z'];
const VA_LEA_SYMBOLS     = ['circle','square','apple','house'];
const VA_ETDRS_LINES     = [/* 14 lines, 5 letters each, 0.1 logMAR steps */];
function VA_snellenToLogMAR(snellen) { /* '20/x' → log10(x/20) */ }
function VA_lineIsPassed(correctCount, totalLetters) { return correctCount > totalLetters / 2; }
```

---

## C. Phase-by-phase requirements

### `ready` phase (setup)
- Chart type selector — **now 5 options** (was 3):
  - Snellen letters · existing variable-length lines
  - Numbers · existing
  - Tumbling E · existing
  - **ETDRS · NEW** · 14 lines of 5 Sloan letters each, 0.1 logMAR steps
  - **LEA symbols · NEW** · pediatric, 4 symbols per line
- Eye mode segmented control (OD / OS / OU) — existing.
- **Pinhole occluder toggle · NEW** — "Test with pinhole after best-corrected VA." Default off. When on, the report includes a Pinhole column and the workflow prompts for a second VA pass with the pinhole in place.
- **Distance / Near toggle · NEW** — Distance (default, 20 ft / 6 m) or Near (40 cm / 16 in, displays J-notation alongside Snellen). Near mode uses a different chart layout (denser, single-page).
- Starting line selector — existing.
- Chart preview pane on the left — existing, now reflects the selected chart type including ETDRS spacing and LEA symbols.
- Begin Test button via ExamShell `onBegin` prop — existing.

### `testing` phase
- Eye selector + view toggle in sticky sub-bar — existing.
- Individual lines view: each line is a card with letters laid out at Snellen sizing, score markers per letter — existing.
- ETDRS mode rendering: Bailey-Lovie spacing applied (`letter-spacing` = letter width).
- LEA mode rendering: SVG symbols instead of text characters, same scoring UI.
- Pinhole pass (when enabled): after the first pass completes, a "Now test with pinhole in place" affordance prompts the second pass. Same chart, same letters, separate scoring slot.
- Rx adjustment panel surfaces only when a line is failed (existing) — unchanged.
- Right sidebar (rightPanel): session notes — existing.

### `report` phase
- **Patient Classification banner** — new for v0.2.3 (the v0.1.4 report didn't have one). Worst-eye-drives-bottom-line with severity tint:
  - Normal: 20/20 or better OU, both eyes
  - Mild reduction: 20/25 to 20/40
  - Moderate reduction: 20/50 to 20/100
  - Significant reduction: 20/200 or worse
- **Per-eye VA results card** with both Snellen and logMAR notation side-by-side. Letter-by-letter logMAR shown when ETDRS mode was used.
- **Pinhole comparison row** when pinhole was tested — shows pre-pinhole VA, with-pinhole VA, and ΔlogMAR. Annotation: "Pinhole improvement → refractive cause likely" or "No pinhole improvement → consider pathological cause."
- **Prescription summary card** — existing, surfaced when prescription panel was used.
- **Patient information card** — existing, expanded with new fields: Chart type used, Distance (20 ft / 40 cm), Pinhole tested (Yes/No), Line-pass threshold.
- **Plate-by-plate / Line-by-line table** — existing letter-grading table, kept.
- **Clinical Interpretation card** — new for v0.2.3, severity-tinted, paragraph driven by worst-eye result.
- **Session notes** card — existing.
- **Actions row** with Doctor sign-off label above Certify & close — added for v0.2.3 parity (v0.1.4 pre-dated the pattern).

---

## D. Cross-cutting

- All button labels sentence-case.
- Solid accent backgrounds, no gradients.
- OD / OS / OU eye references.
- ExamShell-owned cancel UX (no internal cancel modal).
- Session notes per test.

---

## E. Open clinical questions (for engineering handoff)

- **Distance calibration on the headset.** The prototype labels distance as "20 ft / 6 m" but the production headset simulates distance through optical design. Confirm the simulated distance is exactly 20 ft / 6 m as labeled.
- **Pinhole hardware.** Is the pinhole occluder a physical insert in the headset, a digital occlusion mask, or external (the technician holds a card)? Affects whether the UI "pinhole on" affordance is automated or technician-initiated.
- **Near-vision projection.** The headset's near-mode optical path — is the 40 cm distance simulated faithfully? Affects whether the J-notation result is clinically valid.
- **Pediatric LEA assets.** The prototype uses placeholder shapes. Production needs cleared LEA Symbol Chart imagery (Lighthouse International / Good-Lite licensed assets).
- **Snellen letter pool.** Legacy letter pool retained for backward compatibility with the v0.1.4 chart-recognition aesthetic. Consider migrating Snellen mode to Sloan 10 in a future revision for cross-mode consistency.
- **ETDRS scoring detail.** Confirm whether the firmware provides letter-level response timing, which would let the UI distinguish "saw and identified" from "guessed" responses.

---

*Method Marketing Agency · xoExam UI/UX · Visual Acuity clinical specification v2 · May 22, 2026*
