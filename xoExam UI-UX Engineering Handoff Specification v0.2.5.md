# xoExam™ UI/UX — Engineering Handoff Specification
## v0.2.5 · May 22, 2026 · Pupillometry · Beta scope CLOSED

**Method Marketing Agency for Xenon Ophthalmics Inc.**

---

## 1. What changed since v0.2.1

This v0.2.5 reissue captures the Pupillometry clinical-fidelity rebuild — the sixth and final beta-scope test. With Pupillometry shipped, **the originally-defined beta scope is closed**. All sixteen sections of v0.2.1 remain authoritative unless updated below.

| Area | v0.2.1 | v0.2.5 |
|---|---|---|
| Tests at clinical fidelity | 5 of 19 | **6 of 19** (Pupillometry added) |
| Beta scope status | One remaining (Pupillometry) | **CLOSED** |
| Per-test clinical specs in `briefs/` | 5 (VA, CV, VF, WFA, EOM) | **6** (+ Pupillometry) |
| Component count in `components/` | 25 | 25 (PupillometryTest.jsx replaced in-place, not added) |
| Open clinical questions on the kickoff agenda | ~22 | **~29** (7 added from Pupillometry §H) |
| Doctor sign-off pattern | Established (v0.1.9) | Applied to Pupillometry per §6 of Clinical Standards Reference |

The post-beta roadmap consists of the remaining 13 visual-fidelity placeholder tests, in priority order to be set with the clinical evaluation team.

---

## 2. Engineering quick start (unchanged from v0.2.1)

- **Stack:** React 18.3.1 + Babel Standalone 7.29.0 via CDN. No build toolchain. `index.html` is the single entry point.
- **Open `index.html` directly** in a modern browser (Chrome / Edge recommended). The prototype renders immediately — no server, no install, no build.
- **Production target:** React Native + Kotlin Android tablet. The `.jsx` source is structured for mechanical port — inline styles, hooks-only, no exotic dependencies. See the v0.2.1 spec §10 for the full RN portability table.

---

## 3. ExamShell Component Interface Contract (unchanged)

Every test component must conform to this contract exactly. Pupillometry was the sixth test rebuilt against it.

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

For tests with sub-test state machines inside the testing phase (EOM, Pupillometry), `finishAvailable()` is the local helper that gates ExamShell's green "Finish & Report" button — only at the last enabled sub-step's completion state.

---

## 4. Pupillometry — engineering-specific integration touchpoints

The clinical spec (`briefs/Pupillometry_Clinical_Spec_v2.md`) is the authoritative source. Engineering touchpoints specific to Pupillometry:

### 4.1 Hardware contract — open questions to resolve

These seven items are added to the engineering kickoff agenda (full list in §12). Each is flagged inline in the Clinical Standards Reference §6 and in `briefs/Pupillometry_Clinical_Spec_v2.md` §H.

| # | Question | Affects |
|---|---|---|
| 1 | Dynamic data shape from firmware — time-series at ~30 Hz, or summary metrics only? | `PUP_LightReflexChart` data binding; six summary tiles |
| 2 | NPi computation location — firmware-side (NeurOptics convention) or UI/cloud-side? | `PUP_computeNPi` helper (currently UI-computed for the prototype) |
| 3 | Swinging flashlight automation — headset-driven alternation, or technician-driven? | `PUP_SwingingScreen` behavior (currently UI-driven via Start/Pause stimulus button) |
| 4 | Pupil response clicker — pupillometry is passive; confirm clicker is not used | Headset event subscription; clicker disable while in Pupillometry |
| 5 | Pharmacologic workflow scope — cocaine/apraclonidine for Horner's, pilocarpine for Adie's | Out of scope for v0.2.5; if planned, follow-on `pharmaco-`-prefixed sub-test |
| 6 | Ambient light measurement — real headset-interior lux readback, or assumed calibrated? | `PUP_LIGHT_CONDITIONS` ambient value source |
| 7 | Adaptation time enforcement — firmware-enforced ≥ 5 min dark adaptation, or UI countdown? | Static sub-step phase logic; setup-screen warning copy |

### 4.2 Data persistence schema additions

Pupillometry adds these per-eye fields to the per-test results object (see v0.2.1 §6 for the cross-test schema):

```js
{
  testId: 'pupillometry',
  eyesTested: ['OD', 'OS'],   // or ['OD'] / ['OS']
  patientAge: 42,
  static: {
    OD: { scotopic: 6.7, mesopic: 4.9, photopic: 3.0 },
    OS: { scotopic: 6.6, mesopic: 4.8, photopic: 3.0 }
  },
  dynamic: {
    OD: {
      baselineSize: 5.4, minSize: 3.6, constrictionPct: 33.3,
      latencyMs: 240, constrictionMs: 320, redilationMs: 1200,
      constrictionVel: 5.6, redilationVel: 1.5,
      npi: 3.2                   // computed; firmware-side per Q4.1.2
    },
    OS: { /* same shape */ }
  },
  rapd: {
    OD: 'none',                  // 'none' | 'trace' | '1plus' | '2plus' | '3plus' | '4plus'
    OS: 'none'
  },
  notes: 'Free-text session notes',
  certifiedBy: '<doctor-id>',     // populated at Certify & close
  certifiedAt: '<ISO timestamp>'
}
```

### 4.3 Patient classification logic — pure-function port targets

The following helpers should port directly to the production codebase, with NPi swapped to firmware-provided when Q4.1.2 is resolved:

- `PUP_getAgeBand(age)` — Winn 1994 age-band lookup
- `PUP_inRange(value, [lo, hi])` — age-band deviation check
- `PUP_getAnisocoriaSeverity(diffMm, conditionDelta)` — light-vs-dark differential rule
- `PUP_computeNPi(dynamics)` — placeholder formula (swap to firmware passthrough)
- `PUP_npiSeverity(npi)` — NeurOptics threshold bands
- `PUP_getInterp(eyesTested, results, rapdByEye, ageBand, ranDynamic, ranSwinging)` — Patient Classification banner severity
- `PUP_getClinicalFlag(...)` — four-pattern flag matcher (Horner's, CN III, RAPD, NPi)

All pure JS, all live in `components/PupillometryTest.jsx`.

---

## 5. Open decisions — engineering kickoff agenda (cumulative, v0.2.5)

The cumulative list from v0.2.1 stands. New items added by Pupillometry are flagged with **[P]**:

1. Hardware-to-UI event contract (cross-test) — what events the headset fires, what payload, what the UI subscribes to
2. Per-test data persistence schema — final shape across all clinical-fidelity tests
3. Authentication model — login, session, doctor identity
4. Export mechanism — PDF generation, EHR forwarding, cloud sync
5. Role-based permissions — Doctor sign-off as a gate, not just a label
6. Patient identity confirmation step — currently assumed pre-test
7. Compliance scope — HIPAA, MDR class, FDA 510(k) path
8. **[P]** Dynamic data shape from firmware (Q4.1.1)
9. **[P]** NPi computation location (Q4.1.2)
10. **[P]** Swinging flashlight automation (Q4.1.3)
11. **[P]** Pupil response clicker non-use confirmation (Q4.1.4)
12. **[P]** Pharmacologic pupillometry workflow scope (Q4.1.5)
13. **[P]** Ambient light measurement from headset (Q4.1.6)
14. **[P]** Adaptation time enforcement (Q4.1.7)

See v0.2.1 §12 for the full annotation on items 1–7; items 8–14 are detailed in §4.1 above.

---

## 6. Regulatory acknowledgment (unchanged)

The xoExam UI/UX prototype is **not a medical device** and has not been cleared by FDA, MDR, or any other regulatory body. The clinical-accuracy work in `briefs/` and in the Clinical Standards Reference is a transparency document — a description of what the design adheres to — not a clinical validation report or regulatory submission. Production clinical validation is an engineering and regulatory responsibility outside Method's scope.

The same applies to instrument calibration: the prototype assumes the production headset will deliver calibrated stimulus presentation, accurate color reproduction, valid threshold measurements, and consistent ambient conditions. Whether it does is a hardware question outside the UI/UX layer.

---

## 7. Per-test specs (current)

| # | Test | Spec file in `briefs/` | Clinical-fidelity version |
|---|---|---|---|
| 1 | Visual Acuity | `VisualAcuity_Clinical_Spec_v2.md` | v0.2.3 |
| 2 | Color Vision | (in CLAUDE.md + Clinical Standards Reference §2) | v0.1.7 |
| 3 | Visual Fields | `VisualField_Clinical_Spec_v2.md` | v0.1.8 |
| 4 | Wavefront Aberrometry | `WavefrontAberrometry_Clinical_Spec_v2.md` | v0.1.9 |
| 5 | Extraocular Motility | `ExtraocularMotility_Clinical_Spec_v2.md` | v0.2.1 |
| 6 | **Pupillometry** | `Pupillometry_Clinical_Spec_v2.md` | **v0.2.5** |

The remaining 13 tests are visual-fidelity placeholders. Specs will be written as each one is brought to clinical fidelity in post-beta releases.

---

## 8. Document set issued at v0.2.5

| Document | Status |
|---|---|
| `xoExam UI-UX Engineering Handoff Specification v0.2.5.docx` | **This document** — supersedes v0.2.1 |
| `xoExam Development Brief 05-22-2026 v0.2.5.docx` | New per-release brief |
| `xoExam Development Brief.docx` (cumulative) | v0.2.5 entry to be appended |
| `xoExam Clinical Standards Reference.md` / `.docx` | Updated to v0.2.5 — Pupillometry §6 added |
| `xoExam Clinical Evaluation Brief.md` / `.docx` | Updated — Pupillometry §6 added |
| `briefs/Pupillometry_Clinical_Spec_v2.md` | Authoritative clinical spec for Pupillometry |
| `CLAUDE.md` | v0.2.5 entry appended; beta scope CLOSED |
| `README.md` | Status bumped to v0.2.5 |
| `_dist_v0.2.5/` | Deployment package |

---

## 16. Version history

| Spec version | Date | Trigger |
|---|---|---|
| v0.1.8 | May 18, 2026 | Visual Fields clinical fidelity + first formal handoff issue |
| v0.1.9 | May 21, 2026 | Wavefront Aberrometry clinical fidelity + Doctor sign-off pattern introduced |
| v0.2.1 | May 22, 2026 | Extraocular Motility clinical fidelity + naming convention sweep |
| **v0.2.5** | **May 22, 2026** | **Pupillometry clinical fidelity — beta scope CLOSED** |

Older versioned specs (v0.1.8 / v0.1.9 / v0.2.1) are retained in the repository so spec evolution is traceable for MPR / regulatory audit.

---

*Method Marketing Agency · xoExam UI/UX Engineering Handoff Specification · v0.2.5 · May 22, 2026*
