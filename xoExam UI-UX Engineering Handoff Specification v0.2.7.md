# xoExam™ UI/UX — Engineering Handoff Specification
## v0.2.7 · June 8, 2026 · Wavefront Refraction — six competitive-parity enhancements merged

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## 1. What changed in v0.2.7 — accurate change log

This reissue folds the **six competitive-parity enhancements** for Wavefront Refraction into the single production component and **eliminates the parallel `v2` draft file**. It supersedes v0.2.6. All sixteen sections of the prior spec remain authoritative unless updated below.

| Area | v0.2.6 | v0.2.7 |
|---|---|---|
| Tests at clinical fidelity | 7 of 19 | **7 of 19** (no new test; Wavefront Refraction deepened) |
| Wavefront Refraction | base two-stage flow | **+ six competitive-parity enhancements merged in** |
| WFR source files | 1 production + 1 `v2` draft fork | **1 file only** (`v2` fork + harness deleted) |
| WFR report layout | single scrolling report | **tabbed report** (Summary · Rx comparison · Day & night · Vision simulation · Wavefront · Progression) |
| Newest engineering integration item | Certify & close as Rx-release system event | **Reehana hardware confirms (Q3/Q7/Q8)** gate the provisional 6 mm / vertex / Rx-range values |

### Files touched in v0.2.7

| File | Change |
|---|---|
| `components/WavefrontRefractionTest.jsx` | **Replaced** — the six-enhancement build folded into the single production file (~2280 lines, all `WFR_`-prefixed); component name kept as `WavefrontRefractionTest`. All Reehana-gated values isolated in named constants at the top (`WFR_ANALYSIS_DIA`, `WFR_SIXMM_PROVISIONAL`, `WFR_ZERNIKE_MAX_ORDER`/`WFR_ZERNIKE_MODES`, `WFR_VERTEX_MM`, `WFR_SPHERE_RANGE`/`WFR_CYL_RANGE`) so unconfirmed items flip with a one-line edit. |
| `components/WavefrontRefractionTest v2.jsx` | **Deleted** — the parallel draft fork. One file, one source of truth (CD direction: a divergent second copy is a versioning hazard). |
| `Wavefront Refraction v2 Demo.html` · `wfr-v2-demo/` | **Deleted** — the fork's standalone demo + single-file build. |
| `index.html` | **Edited** — title bumped to v0.2.7. No routing change: the shell already imported `WavefrontRefractionTest.jsx` and rendered `<WavefrontRefractionTest/>`, so the enhanced flow is now live in the full app. |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | **Added** — supersedes the v1 spec; documents the six enhancements and the doctor-led posture. |
| `deploy.html` · `deploy-new-site.html` | **Edited** — version strings bumped to v0.2.7. |
| `CLAUDE.md` · `README.md` | **Updated** — v0.2.7 version-log entry, WFR section rewritten (merge), component index, test-stream table, status, dist note. |

#### The six enhancements (all doctor-led-safe — measurements/simulations, never verdicts)

1. **PSF + simulated-VA before/after** — point-spread-function render + simulated acuity, habitual-vs-new Rx, driven by the Zernike set (Simulation tab).
2. **Binocular balance step** — after both eyes, via fogging / alternate occlusion (no prism hardware needed); subjective `subjStep:'binocular'`.
3. **Multi-source Rx comparison** — objective / subjective / habitual / unaided columns with spherical-equivalent deltas; habitual entered manually now, auto-pulled from history later (Rx-comparison tab).
4. **Photopic-vs-mesopic day-&-night** — 4 mm column (hardware-confirmed) + provisional 6 mm column with a night-shift Diff row (Day-&-night tab).
5. **Smart-Cylinder auto-bracketing** — JCC step ladder auto-sized to |cyl|, narrows one rung per reversal; toggle.
6. **Refraction progression tracker** — spherical-equivalent trend + D/yr rate vs age-banded reference; the at-risk call is left to the clinician (Progression tab).

> **Provisional values pending Reehana (Q3/Q7/Q8).** The 6 mm pupil columns, vertex distance (25–30 mm), and sphere/cylinder ranges are flagged provisional and isolated in named constants. If the hardware answers differ, edit the constant / flip `WFR_SIXMM_PROVISIONAL` — no rebuild, no separate file.

> **Framing.** The program remains pre-beta, active development pending final feedback from MPR and Xenon's Chief Medical Officer + doctor panel. v0.2.7 is the integration version, not a finished milestone.

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

## 5. Open decisions — engineering kickoff agenda (cumulative, v0.2.7)

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

> **The product version is unified.** The entire xoExam UI/UX ships as one build — currently **v0.2.7**. The right-hand column records *when each test last reached clinical fidelity* (the release it was last meaningfully updated in), not a separate version number for that test. A test showing an earlier release is correct and unchanged since then, not behind.

| # | Test | Spec file in `briefs/` | Reached clinical fidelity in |
|---|---|---|---|
| 1 | Visual Acuity | `VisualAcuity_Clinical_Spec_v2.md` | v0.2.3 (Tumbling E/C added v0.2.6) |
| 2 | Color Vision | (in CLAUDE.md + Clinical Standards Reference §2) | v0.1.7 |
| 3 | Visual Fields | `VisualField_Clinical_Spec_v2.md` | v0.1.8 |
| 4 | Wavefront Aberrometry | `WavefrontAberrometry_Clinical_Spec_v2.md` | v0.1.9 |
| 5 | Extraocular Motility | `ExtraocularMotility_Clinical_Spec_v2.md` | v0.2.1 |
| 6 | Pupillometry | `Pupillometry_Clinical_Spec_v2.md` | v0.2.5 |
| 7 | **Wavefront Refraction** | `WavefrontRefraction_Clinical_Spec_v2.md` | **v0.2.6** (six enhancements merged v0.2.7) |

The remaining 12 tests are visual-fidelity placeholders. Specs are written as each one is brought to clinical fidelity.

---

## 8. Document set issued at v0.2.7

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.7.docx` | **This document** — supersedes v0.2.6 |
| `xoExam Development Brief 06-08-2026 v0.2.7.docx` | New per-release brief |
| `xoExam Development Brief.docx` (cumulative) | v0.2.7 entry appended |
| `briefs/WavefrontRefraction_Clinical_Spec_v2.md` | Supersedes v1 — six-enhancement pass, doctor-led posture |
| `xoExam Clinical Standards Reference v0.2.7.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction §7 updated for the six enhancements |
| `xoExam Clinical Evaluation Brief.docx` / `.md` | Reissued at v0.2.7 — Wavefront Refraction panel prompts updated |
| `CLAUDE.md` | v0.2.7 entry appended; WFR section rewritten (merge); component index + test-stream table updated |
| `README.md` | Status bumped to v0.2.7 |
| `_dist_v0.2.7/` | Deployment package |

---

## 16. Version history

| Spec version | Date | Trigger |
|---|---|---|
| v0.1.8 | May 18, 2026 | Visual Fields clinical fidelity + first formal handoff issue |
| v0.1.9 | May 21, 2026 | Wavefront Aberrometry clinical fidelity + Doctor sign-off pattern introduced |
| v0.2.1 | May 22, 2026 | Extraocular Motility clinical fidelity + naming convention sweep |
| v0.2.5 | May 22, 2026 | Pupillometry clinical fidelity |
| v0.2.6 | June 2, 2026 | Wavefront Refraction — new two-stage refraction test; Certify & close as Rx-release system event |
| **v0.2.7** | **June 8, 2026** | **Wavefront Refraction — six competitive-parity enhancements merged into the single production file; `v2` fork eliminated** |

Older versioned specs are retained in the repository so spec evolution is traceable for MPR / regulatory audit.

---

*Method Marketing Agency · xoExam UI/UX Engineering Handoff Specification · v0.2.7 · June 8, 2026*
