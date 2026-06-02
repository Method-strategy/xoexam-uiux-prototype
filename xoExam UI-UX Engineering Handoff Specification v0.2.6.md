# xoExam™ UI/UX — Engineering Handoff Specification
## v0.2.6 · June 2, 2026 · Wavefront Refraction

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## 1. What changed in v0.2.6 — accurate change log

This reissue captures the **Wavefront Refraction** test, added as a new parallel test. It supersedes v0.2.5. All sixteen sections of the prior spec remain authoritative unless updated below.

| Area | v0.2.5 | v0.2.6 |
|---|---|---|
| Tests at clinical fidelity | 6 of 19 | **7 of 19** (Wavefront Refraction added) |
| Component count in `components/` | 25 | **26** (Wavefront Refraction added; Aberrometry retained) |
| Per-test specs in `briefs/` | 6 | **7** (+ Wavefront Refraction) |
| Newest engineering integration item | Pupillometry firmware questions | **Certify & close as Rx-release system event** (gates downstream xoFit job) |

### Files touched in v0.2.6

| File | Change |
|---|---|
| `components/WavefrontRefractionTest.jsx` | **Added** — 1381 lines, all top-level identifiers `WFR_`-prefixed. The new two-stage refraction test. |
| `components/WavefrontAberrometryTest.jsx` | **Unchanged / retained.** Wavefront Refraction supersedes it but does NOT replace it — both remain in the catalog per CD direction. |
| `components/VisualAcuityTest.jsx` | **Edited** — geometric Tumbling E (Snellen E) and Tumbling C (Landolt ring) optotypes added via `VA_Optotype`; Tumbling C added as a 4th chart type. Same optotype shape is shared with the Wavefront Refraction subjective phoropter stage. |
| `components/TestSelection.jsx` | **Edited** — catalog entry added (`id: wavefront-refraction`, Refraction category). |
| `index.html` | **Edited** — `WavefrontRefractionTest.jsx` script include added; routing case `'wavefront-refraction'` added; title bumped to v0.2.6. |
| `briefs/WavefrontRefraction_Clinical_Spec_v1.md` | **Added** — authoritative clinical spec for the new test. |
| `CLAUDE.md` · `README.md` | **Updated** — version log, component index, test-stream table, status. |

This program is in **active, versioned development.** Each release brings one or more tests to clinical fidelity and reissues this doc set with the precise changelog above. The remaining 12 tests in the catalog are visual-fidelity placeholders awaiting their own clinical rebuilds; prioritization is set with the clinical evaluation team.

---

## 2. Engineering quick start (unchanged from v0.2.1)

- **Stack:** React 18.3.1 + Babel Standalone 7.29.0 via CDN. No build toolchain. `index.html` is the single entry point.
- **Open `index.html` directly** in a modern browser (Chrome / Edge recommended). The prototype renders immediately — no server, no install, no build.
- **Production target:** React Native + Kotlin Android tablet. The `.jsx` source is structured for mechanical port — inline styles, hooks-only, no exotic dependencies. See the v0.2.1 spec §10 for the full RN portability table.

---

## 3. ExamShell Component Interface Contract (unchanged)

Every test component must conform to this contract exactly. Wavefront Refraction is the seventh test built against it.

```js
function [TestName]({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  // ...
  return (
    <ExamShell
      title="[Test name — sentence case]"
      accent={accent}
      onBack={onBack}
      patientName={patientName}
      patientId={patientId}
      phase={phase}
      elapsed={elapsed}
      onBegin={startTest}
      onFinish={() => setPhase('report')}
      onNewTest={resetTest}
      rightPanel={phase === 'testing' ? <RightSidebar /> : null}
    >
      {phase === 'ready'   && renderReady()}
      {phase === 'testing' && renderTesting()}
      {phase === 'report'  && renderReport()}
    </ExamShell>
  );
}

Object.assign(window, { [TestName] });
```

ExamShell owns the canonical Cancel UX: back arrow hidden during testing, labeled red "Cancel test" button takes over, opens confirm modal. **Test components MUST NOT build their own cancel dialogs.**

For tests with sub-stage state machines inside the testing phase (EOM, Pupillometry, and now Wavefront Refraction's objective→subjective sequence), `finishAvailable()` is the local helper that gates ExamShell's green "Finish & Report" button — only at the last enabled sub-step's completion state.

---

## 4. Wavefront Refraction — engineering-specific integration touchpoints

The clinical spec (`briefs/WavefrontRefraction_Clinical_Spec_v1.md`) is the authoritative source. Engineering touchpoints specific to this test:

### 4.1 Certify & close is a SYSTEM EVENT — the most consequential integration point in the suite

Wavefront Refraction produces the **verified prescription (Rx)** — the combined output of the objective wavefront capture and the subjective phoropter refinement. Its **"Certify & close" action is not a UI-only state change.** It is the certification event that **releases the Rx to the downstream xoFit fitting/finishing job object.**

- The prototype surfaces this as a button with a "Doctor sign-off · releases Rx to job object" sub-label.
- **MPR must wire Certify & close to emit the Rx-release event** to the job/order pipeline. Until certified, the Rx is not released downstream.
- This couples to the role/permissions model (kickoff agenda item 5): only an authorized doctor identity may certify.

### 4.2 Two-stage capture model

| Stage | UI phase | Behavior | Hardware contract |
|---|---|---|---|
| Objective | ExamShell `testing` (sub-stage `objective`) | Monocular wavefront capture, **OD then OS**. Live eye-scan look — dark viewer, breathing pupil, accent sweep line, rotating centering ring, red alignment dot that turns the backdrop green on lock. Sub-stages `init → calibrating → capturing → complete`. | Liquid-lens / eye-tracking capability drives readiness panel values and green-lock timing — engineer confirmation needed. Per-eye **scan count (1–3)** documents reliability; the wavefront retries on movement/blink and averages. |
| Subjective | ExamShell `testing` (sub-stage `subjective`) | Liquid-lens digital phoropter. Step sequence per eye `setup → sphere (MPMVA) → jcc-axis → jcc-power → [mpmva2*] → add`. | Liquid-lens power presentation per step; optotype rendering on the patient chart. |

`mpmva2` (second MPMVA) auto-triggers only if cyl changed ≥ 0.50 D or axis changed ≥ 10° from objective.

### 4.3 Clinical non-negotiables enforced in the UI (preserve on port)

1. **Axis before power (JCC).** Enforced by step order — `jcc-axis` always precedes `jcc-power`. The UI cannot reach power refinement before axis is confirmed.
2. **Fogging control.** After objective capture a fog prompt offers **+0.75 D** with clinical explanation; starting MPMVA sphere = objective sphere + fog. Doctor may skip.
3. **Sphere compensation note** visible during cylinder power: "For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion."
4. **Rx format discipline.** SPH/CYL always signed + 2 dp; AXIS integer + °; ADD signed with D or "—". Helpers: `WFR_fmtSph` / `WFR_fmtCyl` / `WFR_fmtAxis` / `WFR_fmtAdd`.
5. **Monocular objective.** No OU averaging. Sequence OD → OS automatically via breadcrumb + transition modal.
6. **No clinical claims in the report.** Deliberate divergence from the other clinical-fidelity tests: NO Patient Classification banner, NO interpretive language. A refraction is a measurement-and-verification workflow, not a screening. The Clinical Summary states data only (scan counts, completion, "Final Rx pending clinician certification").

### 4.4 Data persistence schema additions

Wavefront Refraction adds this per-test results object (see v0.2.1 §6 for the cross-test schema):

```js
{
  testId: 'wavefront-refraction',
  mode: 'full',                  // 'full' (objective→subjective) | 'subjective-only'
  eyesTested: ['OD', 'OS'],
  objective: {
    OD: { sph:-1.25, cyl:-0.50, axis:165, pupilSize:6.2, analysisDia:6.0, scans:2,
          rmsHOA:0.261, comaRMS:0.163, sphAb:0.087 },
    OS: { /* same shape */ }
  },
  fogApplied: 0.75,              // D, or 0 if skipped
  subjective: {
    OD: { sph:-1.00, cyl:-0.50, axis:165, add:0, bcva:'20/20', jccPower:0.50 },
    OS: { /* same shape */ }
  },
  finalRx: {
    OD: { sph:-1.00, cyl:-0.50, axis:165, add:0 },
    OS: { /* same shape */ }
  },
  notes: 'Free-text session notes',
  certifiedBy: '<doctor-id>',    // populated at Certify & close — Rx-release event
  certifiedAt: '<ISO timestamp>'
}
```

### 4.5 Pure-function port targets

- `WFR_fmtSph` / `WFR_fmtCyl` / `WFR_fmtAxis` / `WFR_fmtAdd` — Rx format discipline
- `WFR_lineIsPassed(correct, total)` — VA pass/fail threshold (see open item 4.6.1)
- `WFR_getBestVA(...)` — additive VA notation (e.g. `20/25 +4`)
- `WFR_Optotype` — geometric Tumbling E / Landolt C renderer (shared with Visual Acuity)

### 4.6 Open items / TBD for the engineering kickoff

1. **VA pass/fail threshold** (`WFR_lineIsPassed`) currently "more than half correct." **Gary to validate** against a published standard before lock.
2. **Certify & close → system event** wiring (§4.1) — MPR to implement as the Rx-release trigger to the xoFit job object.
3. **Patient-facing headset view is out of scope.** This component is the tablet (technician/doctor) view only. The patient-facing headset/clicker experience (objective self-administered mode) is separate scope to define with MPR.
4. Objective readiness panel values + green-lock timing depend on liquid-lens / eye-tracking capability (engineer confirmation).

---

## 5. Open decisions — engineering kickoff agenda (cumulative, v0.2.6)

The cumulative list from v0.2.5 stands. New items added by Wavefront Refraction are flagged **[R]**:

1. Hardware-to-UI event contract (cross-test) — what events the headset fires, what payload, what the UI subscribes to
2. Per-test data persistence schema — final shape across all clinical-fidelity tests
3. Authentication model — login, session, doctor identity
4. Export mechanism — PDF generation, EHR forwarding, cloud sync
5. Role-based permissions — Doctor sign-off as a gate, not just a label
6. Patient identity confirmation step — currently assumed pre-test
7. Compliance scope — HIPAA, MDR class, FDA 510(k) path
8–14. Pupillometry firmware/clinical questions (v0.2.5 §4.1 — items 8–14)
15. **[R]** Certify & close → Rx-release system event wiring to the xoFit job object (§4.1)
16. **[R]** VA pass/fail threshold validation for the subjective stage (§4.6.1)
17. **[R]** Patient-facing headset/clicker view scope for objective self-administered mode (§4.6.3)
18. **[R]** Liquid-lens / eye-tracking capability for objective readiness + green-lock timing (§4.6.4)

---

## 6. Regulatory acknowledgment (unchanged)

The xoExam UI/UX prototype is **not a medical device** and has not been cleared by FDA, MDR, or any other regulatory body. The clinical-accuracy work in `briefs/` and in the Clinical Standards Reference is a transparency document — a description of what the design adheres to — not a clinical validation report or regulatory submission. Production clinical validation is an engineering and regulatory responsibility outside Method's scope.

Note specific to Wavefront Refraction: the report **deliberately makes no clinical claims** — no determinations, assessments, or recommendations. This is by design: a refraction is a measurement-and-verification workflow, not a screening. The verified Rx is a measured output for clinician certification, not a diagnostic finding.

The same calibration assumption applies as for all tests: the prototype assumes the production headset delivers calibrated stimulus presentation, accurate liquid-lens power, valid wavefront measurement, and consistent conditions. Whether it does is a hardware question outside the UI/UX layer.

---

## 7. Per-test specs (current)

> **The product version is unified.** The entire xoExam UI/UX ships as one build — currently **v0.2.6**. The right-hand column records *when each test last reached clinical fidelity* (the release it was last meaningfully updated in), not a separate version number for that test. A test showing an earlier release is correct and unchanged since then, not behind.

| # | Test | Spec file in `briefs/` | Reached clinical fidelity in |
|---|---|---|---|
| 1 | Visual Acuity | `VisualAcuity_Clinical_Spec_v2.md` | v0.2.3 (Tumbling E/C added v0.2.6) |
| 2 | Color Vision | (in CLAUDE.md + Clinical Standards Reference §2) | v0.1.7 |
| 3 | Visual Fields | `VisualField_Clinical_Spec_v2.md` | v0.1.8 |
| 4 | Wavefront Aberrometry | `WavefrontAberrometry_Clinical_Spec_v2.md` | v0.1.9 |
| 5 | Extraocular Motility | `ExtraocularMotility_Clinical_Spec_v2.md` | v0.2.1 |
| 6 | Pupillometry | `Pupillometry_Clinical_Spec_v2.md` | v0.2.5 |
| 7 | **Wavefront Refraction** | `WavefrontRefraction_Clinical_Spec_v1.md` | **v0.2.6** |

The remaining 12 tests are visual-fidelity placeholders. Specs are written as each one is brought to clinical fidelity.

---

## 8. Document set issued at v0.2.6

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.6.docx` | **This document** — supersedes v0.2.5 |
| `xoExam Development Brief 06-02-2026 v0.2.6.docx` | New per-release brief |
| `xoExam Development Brief.docx` (cumulative) | v0.2.6 entry appended |
| `briefs/WavefrontRefraction_Clinical_Spec_v1.md` | Authoritative clinical spec for Wavefront Refraction |
| `xoExam Clinical Standards Reference v0.2.6.docx` / `.md` | Reissued at v0.2.6 — Wavefront Refraction §7 added, scope table updated |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.6 — Wavefront Refraction §7 added, panel-evaluation prompts |
| `CLAUDE.md` | v0.2.6 entry appended; component index + test-stream table updated; naming conventions codified (rules 13–14) |
| `README.md` | Status bumped to v0.2.6 |
| `_dist_v0.2.6/` | Deployment package |

---

## 16. Version history

| Spec version | Date | Trigger |
|---|---|---|
| v0.1.8 | May 18, 2026 | Visual Fields clinical fidelity + first formal handoff issue |
| v0.1.9 | May 21, 2026 | Wavefront Aberrometry clinical fidelity + Doctor sign-off pattern introduced |
| v0.2.1 | May 22, 2026 | Extraocular Motility clinical fidelity + naming convention sweep |
| v0.2.5 | May 22, 2026 | Pupillometry clinical fidelity |
| **v0.2.6** | **June 2, 2026** | **Wavefront Refraction — new two-stage refraction test; Certify & close as Rx-release system event** |

Older versioned specs are retained in the repository so spec evolution is traceable for MPR / regulatory audit.

---

*Method Marketing Agency · xoExam UI/UX Engineering Handoff Specification · v0.2.6 · June 2, 2026*
