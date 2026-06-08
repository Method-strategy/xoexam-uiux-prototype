# Visual Acuity v3 — Chart Interaction Model & Audit Spec (v1)
## xoExam UI/UX · Method Marketing Agency · June 4, 2026
## Scope: the doctor/patient chart-interaction model demonstrated in `Visual Acuity v3 Demo.html`

> This document specifies the **chart interaction model** explored in the v3 demo
> (`components/VisualAcuityTest v3.jsx`, `VA3_` prefixed, `VisualAcuityTestV3`).
> It is the worked-out resolution of the chart-control questions raised in the
> Gary Hopkins / Zeshan Khan call of June 3, 2026.
>
> **Status / boundaries.** v3 is a **UI demonstration**. It is **not** wired into
> the shell, and it must **not** be dropped into Wavefront Refraction (WFR) as-is
> (see CLAUDE.md). The interaction model below is destined for WFR's **subjective**
> chart section; the production VA test (`VisualAcuity_Clinical_Spec_v2.md`) is a
> separate artifact and is unchanged by this work. This spec captures the model so
> the eventual WFR port is a deliberate, reviewed graft rather than a copy-paste.

---

## A. Interaction model — "frontier navigation"

The doctor always sees the **whole chart**. Exactly one row is **active** (live to
the patient and the only row scored), which keeps the doctor view and the patient
view from ever desyncing. A **frontier** marks the furthest (smallest) line reached.

Each row resolves to one of four states, which drive the visual treatment:

| State | Meaning | Look | Interaction |
|---|---|---|---|
| **active** | the row the patient is on | accent outline, full-contrast optotypes, gray character pointer | per-character scoring |
| **completed** | scored, behind the frontier | per-character **faded** green/red, settled gray ground | tap to re-activate (free); changing a mark is a logged event (§D) |
| **available** | encountered (≤ frontier), unscored | neutral, full contrast | tap to activate (free) |
| **locked** | ahead of the frontier | pale gray + lock glyph | tap → override confirm (§D) |

**Navigation rules.** Moving *back* to any encountered line is free and silent
(re-check freely — the patient view follows). Moving *ahead* of the frontier
requires a confirmed, logged **override** (§D).

**Patient view.** Snellen / Numbers present one **line** at a time; Tumbling E /
Landolt C present one **optotype** at a time, black-on-white (acuity is never
shown white-on-dark). The patient is never shown a scoring color.

---

## B. Timing — settle delay (slow-tap / fumble accommodation)

Both the per-line auto-advance and the per-character pointer advance use a single
tunable delay, `VA3_SETTLE_MS` (currently **850 ms**):

- After a score completes a row (and it passes), advancing to the next line is
  **delayed and cancellable**.
- After scoring the active character (E/C), the pointer — and the patient's single
  optotype — **lingers**, then settles to the next unscored optotype.
- **Any new scoring tap cancels a pending advance**, so the final letter can be
  re-tapped (e.g. correct → incorrect) without the row or pointer skipping ahead.

Rationale: accommodates slow finger taps and first-time operators; the patient is
never shown the next optotype until scoring is confirmed. The constant is a single
knob for tuning pace during clinical validation.

---

## C. Scoring, partial credit, and endpoint

### Partial credit (`+N`) — mirrors WFR exactly
Best VA is reported with additive notation, e.g. **20/40 +3**: base = smallest line
fully passed; `+N` = letters correct on the next-smaller line that did not fully
pass. Because scoring is **per-character**, the underlying record also captures
*which* letters earned the `+N`. This logic mirrors `WFR_getBestVA` / `WFR_fmtBestVA`
exactly so the demo and the production WFR report agree.

### Endpoint — implicit, with an explicit affordance
The acuity endpoint is **implicit**: best VA is the smallest line at/above the pass
threshold; no formal "fail the row" action is required for a valid result. For the
"patient cannot read this line" moment, a **"Can't read / End here"** control fills
the active line's remaining letters as incorrect — preserving any already-correct
letters for partial credit, marking the line **attempted-and-failed** (distinct from
a blank, un-tested line), and establishing the endpoint. It does not auto-advance.

### Three line outcomes in the record
- **Passed** (≥ threshold)
- **Attempted** (scored, below threshold — incl. "could not read" = 0 correct)
- **Not tested** (blank — omitted from the report table)

### Pass threshold
`VA3_lineIsPassed(correct, total) = correct > total / 2` (more-than-half), used
**internally only** for auto-advance and endpoint math — see §F.

---

## D. Required audit events

Two audit streams are implemented in v3 and are **first-class data**, intended to
carry into the production record and into operator-training / QA review.

### D1. Ahead-of-progress override (implemented)
Jumping to a line ahead of the frontier opens a confirm ("Skip ahead to 20/X? …
recorded in the session log") and writes an entry `{ts, from, to, eye}`. Surfaced
live as a count chip and in the report's **Session audit** block.

### D2. Recorded-answer back-edit (implemented)
Navigating back is free; **changing an already-recorded answer on a previously
completed ("settled") line** opens a soft confirm and writes an entry
`{ts, eye, line, letter, from, to}`. Confirming unlocks the line for free
correction; moving on re-settles it, so each return trip is a distinct logged
event. Surfaced live as a count chip and in the report's **Session audit** block.
Rationale (per CD, Jun 4 2026): a technician who repeatedly goes back and changes
answers may need additional device training — this is a deliberate QA signal.

### D3. Clicker-vs-record divergence (DEFERRED — engineering requirement)
**Not implemented in v3; documented here as a required audit event for engineering.**

In **objective mode** (the patient's 4-way clicker reports E/C orientation directly
from the headset — see the subjective/objective distinction raised on the Jun 3 call),
each character has **two** values:

- **indicated** — what the patient's clicker actually reported
- **recorded** — what was ultimately scored (doctor-entered or edited)

A divergence (`indicated !== recorded`) — clicker says X, record says Y, whether by
direct entry or later edit — **must be flagged and logged** as its own audit event.

- **Applies in objective/clicker mode only.** In a subjective read-aloud exam the
  operator's entry is the sole record; there is no clicker signal to disagree with,
  so nothing is flagged.
- **Doctor-led posture (asset, not liability).** A divergence flag is positive
  evidence that clinical judgment was applied on top of the raw device input —
  exactly the professional-supervision posture that distinguishes xoExam from
  unsupervised-screening concerns (cf. the Eyebot/AOA matter, CLAUDE.md rule 15).
  It is an integrity record, not a device verdict.
- **Dependency.** The comparison requires the headset to deliver the live clicker
  signal; that path is MPR/back-end engineering. The **UI data model is ours** and
  should not preclude it — see §F.

---

## E. Doctor-led compliance (CLAUDE.md rule 15)

- The report shows **measured data only**: per-line letters-correct (n/total) and
  **% correct** (column header "% correct"), and the derived acuity value (20/X +N).
- There is **no device-authored pass/fail verdict** per line. (An earlier v3 draft
  rendered Pass/Fail chips; these were removed June 4 2026 at CD direction as a
  device-authored categorization.) The pass threshold survives only as internal
  navigation/endpoint math, never as a displayed claim.
- The bottom-line clinical impression is a **doctor affordance** (free-text field +
  "device records measurements; the clinician makes the clinical determination" +
  Doctor sign-off above Certify & close).

---

## F. Integration contract for the WFR port

When this chart model is grafted into WFR's subjective section (a deliberate,
reviewed edit — snapshot WFR first):

1. **Do not carry over v3's scoring math.** WFR's `getBestVA` / `fmtBestVA` / Rx /
   report stay **byte-identical**. The chart only *writes* the per-character
   `chartResults` structure (`${eye}_${n}` → `[null|'correct'|'incorrect']`) that
   WFR already reads. The `20/X +N` (and which letters) flows through unchanged.
2. **WFR's report gains line-by-line detail (option B, CD Jun 4 2026):** alongside
   its existing `BCVA 20/40 +3` summary, surface the per-line breakdown (letters
   correct, % per line) now that the granular data exists in `chartResults`.
3. **Drop Numbers from the optotype set in WFR** (Numbers stays in VA only, per the
   Jun 3 call); keep Snellen / Tumbling E / Landolt C.
4. **Frontier vs. `subjStep` (OPEN).** Decide whether the chart frontier persists or
   resets as the doctor moves through the JCC refraction steps. Resolve before port.
5. **Data-model readiness for D3.** To leave room for clicker-vs-record divergence
   without a later rewrite, consider evolving each mark from a bare
   `'correct' | 'incorrect'` to `{ indicated, scored, source }`. Then
   `indicated !== scored` makes the divergence flag derivable for free once the
   headset clicker signal is available. (Not required for the chart UX itself.)

---

## G. Open engineering questions

- **Objective-mode clicker signal.** Confirm the headset delivers per-optotype
  clicker responses (orientation + timestamp) so D3 divergence can be computed.
- **Frontier vs. `subjStep`** persistence in WFR (see §F.4).
- **Settle timing.** `VA3_SETTLE_MS` (850 ms) is a placeholder for clinical
  validation — confirm a value that balances pace against slow-tap tolerance.
- **Pass threshold.** More-than-half is used for internal navigation only; confirm
  it (and the `+N` convention) against the validated standard before production.
- **Audit retention.** Where do the override / back-edit / (future) divergence logs
  persist, and what is the retention / export path for QA and operator training?

---

*Method Marketing Agency · xoExam UI/UX · Visual Acuity v3 chart-interaction & audit spec v1 · June 4, 2026*
