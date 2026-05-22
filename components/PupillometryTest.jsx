
// PupillometryTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Rebuilt against the v2 clinical spec (briefs/Pupillometry_Clinical_Spec_v2.md)
// for the v0.2.5 beta-closing release.
//
// Conforms to the xoExam Component Interface Contract:
//   - props: { onBack, tweaks }
//   - wraps every phase in <ExamShell>
//   - three phases (ready / testing / report) — Cancel UX owned by ExamShell
//   - sub-step flow inside testing: static (× eye sequence) → dynamic (× eye sequence) → swinging
//   - sentence-case labels · no gradients · navy + accent palette only
//   - exports: Object.assign(window, { PupillometryTest })


// ════════════════════════════════════════════════════════════════════════
// DATA — light conditions, age norms, anisocoria + NPi helpers, RAPD grades
// ════════════════════════════════════════════════════════════════════════

const PUP_LIGHT_CONDITIONS = [
  { id:'scotopic', label:'Scotopic', lux:'< 0.001 lux', desc:'Dark-adapted (≥ 5 min in darkness)',  ambient:0.05, adaptSec:300 },
  { id:'mesopic',  label:'Mesopic',  lux:'0.001–3 lux', desc:'Dim ambient light',                    ambient:0.40, adaptSec:5   },
  { id:'photopic', label:'Photopic', lux:'> 3 lux',     desc:'Bright ambient light',                 ambient:0.95, adaptSec:5   },
];

// Winn et al. 1994 / clinical convention. Scotopic / mesopic / photopic
// diameter ranges by age band, in millimetres (mean ± 1 SD).
const PUP_AGE_NORMS = [
  { age:'20–29', min:20, max:29, scotopic:[6.0, 8.0], mesopic:[4.5, 6.0], photopic:[2.5, 4.0] },
  { age:'30–39', min:30, max:39, scotopic:[5.7, 7.6], mesopic:[4.3, 5.8], photopic:[2.4, 3.9] },
  { age:'40–49', min:40, max:49, scotopic:[5.4, 7.1], mesopic:[4.0, 5.4], photopic:[2.3, 3.7] },
  { age:'50–59', min:50, max:59, scotopic:[5.0, 6.6], mesopic:[3.7, 5.0], photopic:[2.2, 3.5] },
  { age:'60–69', min:60, max:69, scotopic:[4.6, 6.1], mesopic:[3.4, 4.6], photopic:[2.1, 3.3] },
  { age:'70+',   min:70, max:120,scotopic:[4.2, 5.7], mesopic:[3.1, 4.3], photopic:[2.0, 3.1] },
];

function PUP_getAgeBand(age) {
  const a = Number(age) || 42;
  return PUP_AGE_NORMS.find(b => a >= b.min && a <= b.max) || PUP_AGE_NORMS[PUP_AGE_NORMS.length - 1];
}

function PUP_inRange(val, [lo, hi]) {
  if (val === null || val === undefined) return null;
  const v = Number(val);
  return v >= lo && v <= hi;
}

// Anisocoria severity per §D of spec. diffMm = |OD − OS| at one light
// condition. conditionDelta = |aniso(dark) − aniso(light)|. If anisocoria
// changes with light, the cause is almost certainly pathological — the
// direction (worse-in-dark vs worse-in-light) localises it to the
// sympathetic or parasympathetic pathway.
function PUP_getAnisocoriaSeverity(diffMm, conditionDelta) {
  if (diffMm == null) return { band:'unknown', text:'—', tint:'#9ca3af' };
  const d = Math.abs(diffMm);
  if (conditionDelta != null && conditionDelta >= 0.3) {
    return { band:'significant', tint:'#dc2626',
      text:'Anisocoria varies with light — pathological cause likely (sympathetic or parasympathetic dysfunction).' };
  }
  if (d > 1.0) {
    return { band:'significant', tint:'#dc2626',
      text:'Significant anisocoria — clinical correlation required.' };
  }
  if (d < 0.4) {
    return { band:'normal', tint:'#10b981',
      text:'Within physiological range.' };
  }
  return { band:'mild', tint:'#d97706',
    text:'Mild anisocoria — symmetric in light and dark, consistent with physiological anisocoria in ~20% of the population.' };
}

// NPi: 0–5 composite of size + constriction velocity + latency + dilation
// velocity. Production firmware emits NPi directly; the prototype computes
// a plausible value from the dynamic shape. Thresholds per NeurOptics
// NPi-200 reference:
//   ≥ 3.0 normal · 2.5–3.0 borderline · < 2.5 abnormal
//   asymmetry > 0.7 between eyes = warning sign
function PUP_computeNPi(dynamics) {
  if (!dynamics) return null;
  const c = dynamics.constrictionPct / 30;
  const l = Math.max(0, 1 - dynamics.latencyMs / 600);
  return Math.max(0, Math.min(5, c * l * 5));
}

function PUP_npiSeverity(npi) {
  if (npi == null) return { band:'unknown', tint:'#9ca3af', label:'—' };
  if (npi >= 3.0)  return { band:'normal',      tint:'#10b981', label:'Normal'     };
  if (npi >= 2.5)  return { band:'mild',        tint:'#d97706', label:'Borderline' };
  return                  { band:'significant', tint:'#dc2626', label:'Abnormal'   };
}

const PUP_RAPD_GRADES = [
  { id:'none',   label:'No RAPD',   short:'None',  desc:'Both pupils constrict equally with swinging flashlight',     severity:'normal'      },
  { id:'trace',  label:'Trace',     short:'Trace', desc:'Subtle dilation when light moves to the affected eye',       severity:'mild'        },
  { id:'1plus',  label:'1+',        short:'1+',    desc:'Definite initial constriction, then redilation',             severity:'significant' },
  { id:'2plus',  label:'2+',        short:'2+',    desc:'Slight initial constriction, prompt redilation',             severity:'significant' },
  { id:'3plus',  label:'3+',        short:'3+',    desc:'No initial constriction, immediate dilation',                severity:'significant' },
  { id:'4plus',  label:'4+',        short:'4+',    desc:'Amaurotic — no response to light in the affected eye',       severity:'significant' },
];

const PUP_REPORT_LABEL = { fontSize:13, fontWeight:700, color:'#111827', textTransform:'none', letterSpacing:0 };

const PUP_DEFAULT_DYNAMICS = {
  baselineSize:    5.4,
  minSize:         3.6,
  constrictionPct: 33.3,
  latencyMs:       240,
  constrictionMs:  320,
  redilationMs:    1200,
  constrictionVel: 5.6,
  redilationVel:   1.5,
};

// Simulated dynamic-PLR generator. Production firmware emits the actual
// time-series; the prototype builds a plausible curve so the chart and the
// summary metrics are internally consistent.
function PUP_simulateDynamics(eye) {
  const seed = eye === 'OD' ? 1 : 1.06;
  const baselineSize    = +(5.4 * seed).toFixed(2);
  const minSize         = +(baselineSize * (0.62 + (Math.random() - 0.5) * 0.06)).toFixed(2);
  const constrictionPct = +(((baselineSize - minSize) / baselineSize) * 100).toFixed(1);
  const latencyMs       = Math.round(240 + (Math.random() - 0.5) * 30);
  const constrictionMs  = Math.round(320 + (Math.random() - 0.5) * 30);
  const redilationMs    = Math.round(1200 + (Math.random() - 0.5) * 200);
  const constrictionVel = +(((baselineSize - minSize) / (constrictionMs / 1000)) * 0.9).toFixed(2);
  const redilationVel   = +(((baselineSize - minSize) / (redilationMs / 1000)) * 0.85).toFixed(2);
  return { baselineSize, minSize, constrictionPct, latencyMs, constrictionMs, redilationMs, constrictionVel, redilationVel };
}

// Worst-finding-drives-bottom-line interpretation. Severity tiers per §F
// of the spec: normal · mild · significant. Severity escalates if any of:
//   – any static measurement outside age-banded reference range
//   – anisocoria pathological pattern
//   – NPi below normal in either eye
//   – any RAPD ≥ 1+
function PUP_getInterp(eyesTested, resultsByEye, rapdByEye, ageBand, ranDynamic, ranSwinging) {
  const findings = [];
  let severity = 'normal';

  const escalate = (tier) => {
    if (tier === 'significant') severity = 'significant';
    else if (tier === 'mild' && severity !== 'significant') severity = 'mild';
  };

  // Static — age-banded deviation per eye / per condition
  for (const eye of eyesTested) {
    const r = resultsByEye[eye]?.static;
    if (!r) continue;
    PUP_LIGHT_CONDITIONS.forEach(c => {
      const val = r[c.id];
      if (val == null) return;
      const inR = PUP_inRange(val, ageBand[c.id]);
      if (inR === false) {
        const [lo, hi] = ageBand[c.id];
        const direction = val < lo ? 'small' : 'large';
        findings.push(`${eye} ${c.label.toLowerCase()} pupil ${val.toFixed(1)} mm is ${direction} for age (${lo.toFixed(1)}–${hi.toFixed(1)} mm).`);
        escalate('mild');
      }
    });
  }

  // Anisocoria — calculated when OU was tested
  if (eyesTested.length === 2) {
    const od = resultsByEye.OD?.static, os = resultsByEye.OS?.static;
    if (od && os) {
      const aniLight = (od.photopic != null && os.photopic != null) ? Math.abs(od.photopic - os.photopic) : null;
      const aniDark  = (od.scotopic != null && os.scotopic != null) ? Math.abs(od.scotopic - os.scotopic) : null;
      const conditionDelta = (aniLight != null && aniDark != null) ? Math.abs(aniDark - aniLight) : null;
      const worstDiff = Math.max(aniLight ?? 0, aniDark ?? 0);
      const aniSev = PUP_getAnisocoriaSeverity(worstDiff, conditionDelta);
      if (aniSev.band === 'significant') {
        findings.push(aniSev.text);
        escalate('significant');
      } else if (aniSev.band === 'mild') {
        findings.push(aniSev.text);
        escalate('mild');
      }
    }
  }

  // NPi — dynamic metric
  if (ranDynamic) {
    for (const eye of eyesTested) {
      const dyn = resultsByEye[eye]?.dynamic;
      if (!dyn) continue;
      const npi = PUP_computeNPi(dyn);
      const sev = PUP_npiSeverity(npi);
      if (sev.band === 'significant') {
        findings.push(`${eye} NPi ${npi.toFixed(1)} is below normal — consider intracranial or brainstem pathology.`);
        escalate('significant');
      } else if (sev.band === 'mild') {
        findings.push(`${eye} NPi ${npi.toFixed(1)} is borderline.`);
        escalate('mild');
      }
    }
  }

  // RAPD
  if (ranSwinging && rapdByEye) {
    ['OD', 'OS'].forEach(eye => {
      const grade = rapdByEye[eye];
      if (!grade || grade === 'none') return;
      const g = PUP_RAPD_GRADES.find(r => r.id === grade);
      if (g.severity === 'significant') {
        findings.push(`${eye} relative afferent pupillary defect (${g.label}) detected.`);
        escalate('significant');
      } else if (g.severity === 'mild') {
        findings.push(`${eye} trace relative afferent pupillary defect noted — re-test recommended for confirmation.`);
        escalate('mild');
      }
    });
  }

  let summary;
  if (severity === 'normal') {
    summary = 'Pupillary findings within normal limits for age. Symmetric size, brisk light reflex, no relative afferent pupillary defect.';
  } else if (severity === 'mild') {
    summary = 'Pupillary findings show mild deviation from age-matched norms. Findings are likely physiological; recommend follow-up if clinical context suggests otherwise.';
  } else {
    summary = 'Pupillary findings consistent with potential pathology. Clinical correlation and neuro-ophthalmic referral recommended.';
  }

  const palette = {
    normal:      { tint:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' },
    mild:        { tint:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    significant: { tint:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
  }[severity];

  return { severity, summary, findings, ...palette };
}

// Specific pattern-based clinical flag. Renders prominent red alert when:
//   – Anisocoria varies with light (sympathetic vs parasympathetic pattern)
//   – RAPD ≥ 1+ on either eye
//   – NPi < 2.5 on either eye
// Returns null if no pattern flag should fire.
function PUP_getClinicalFlag(eyesTested, resultsByEye, rapdByEye, ranDynamic, ranSwinging) {
  const flags = [];

  // RAPD flag
  if (ranSwinging && rapdByEye) {
    ['OD', 'OS'].forEach(eye => {
      const grade = rapdByEye[eye];
      if (!grade || grade === 'none' || grade === 'trace') return;
      const g = PUP_RAPD_GRADES.find(r => r.id === grade);
      flags.push({
        title: `Relative afferent pupillary defect — ${eye}`,
        body: `${g.label} RAPD detected on ${eye}. Consistent with optic nerve disease or extensive retinal pathology. Neuro-ophthalmic referral recommended.`,
      });
    });
  }

  // Anisocoria with light-dark variation
  if (eyesTested.length === 2) {
    const od = resultsByEye.OD?.static, os = resultsByEye.OS?.static;
    if (od && os && od.photopic != null && os.photopic != null && od.scotopic != null && os.scotopic != null) {
      const aniLight = Math.abs(od.photopic - os.photopic);
      const aniDark  = Math.abs(od.scotopic - os.scotopic);
      if (Math.abs(aniDark - aniLight) >= 0.3) {
        const worseInDark = aniDark > aniLight;
        flags.push({
          title: worseInDark
            ? 'Anisocoria greater in dark — sympathetic pattern'
            : 'Anisocoria greater in light — parasympathetic pattern',
          body: worseInDark
            ? 'Pattern consistent with sympathetic pathway dysfunction (Horner\'s syndrome, simple anisocoria). Consider cocaine or apraclonidine testing for confirmation.'
            : 'Pattern consistent with parasympathetic pathway dysfunction (CN III palsy, Adie\'s pupil, pharmacologic mydriasis). Clinical correlation required.',
        });
      } else if (Math.max(aniLight, aniDark) > 1.0) {
        flags.push({
          title: 'Significant anisocoria',
          body: `${Math.max(aniLight, aniDark).toFixed(1)} mm difference between eyes. Clinical correlation required.`,
        });
      }
    }
  }

  // NPi flag
  if (ranDynamic) {
    ['OD', 'OS'].forEach(eye => {
      const dyn = resultsByEye[eye]?.dynamic;
      if (!dyn) return;
      const npi = PUP_computeNPi(dyn);
      if (npi < 2.5) {
        flags.push({
          title: `Reduced neurological pupil index — ${eye}`,
          body: `NPi ${npi.toFixed(1)} (< 2.5). Consider intracranial pathology, brainstem dysfunction, or pharmacologic effect. Clinical correlation required.`,
        });
      }
    });
  }

  if (!flags.length) return null;
  return flags;
}


// ════════════════════════════════════════════════════════════════════════
// REUSED PATTERNS — InlineEyePicker, EyeBreadcrumb, TransitionPrompt
// (adapted from WFA v0.1.9 / VF v0.1.8 / EOM v0.2.1 conventions)
// ════════════════════════════════════════════════════════════════════════

function PUP_InlineEyePicker({ value, onChange, accent }) {
  return (
    <div role="radiogroup" aria-label="Eye selection" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
      {['OD', 'OS', 'OU'].map(eye => {
        const isSelected = value === eye;
        const isBoth = eye === 'OU';
        return (
          <button
            key={eye}
            onClick={() => onChange(eye)}
            role="radio"
            aria-checked={isSelected}
            style={{
              padding:'24px 16px',
              borderRadius:14,
              border:`2px solid ${isSelected ? accent : '#e5e7eb'}`,
              background: isSelected ? `${accent}10` : '#fff',
              cursor:'pointer',
              textAlign:'center',
              boxShadow: isSelected ? `0 4px 16px ${accent}25` : 'none',
              transition:'all 0.2s',
              fontFamily:"'Nunito Sans', sans-serif"
            }}
          >
            <div style={{ display:'flex', justifyContent:'center', gap:4, marginBottom:10 }}>
              {(isBoth ? [1, 2] : [1]).map(i => (
                <svg key={i} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isSelected ? accent : '#6b7280'} strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill={isSelected ? accent : '#6b7280'} stroke="none"/>
                </svg>
              ))}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color: isSelected ? accent : '#374151' }}>
              {eye === 'OD' ? 'Right eye only' : eye === 'OS' ? 'Left eye only' : 'Both eyes'}
            </div>
            <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:3 }}>{eye}</div>
          </button>
        );
      })}
    </div>
  );
}

function PUP_EyeBreadcrumb({ sequence, currentEye, completedSet, accent }) {
  if (!sequence || sequence.length <= 1) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {sequence.map((eye, i) => {
        const isDone    = completedSet.has(eye);
        const isCurrent = eye === currentEye && !isDone;
        const isPending = !isDone && !isCurrent;
        return (
          <React.Fragment key={eye}>
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'5px 11px', borderRadius:14,
              background: isDone ? '#f0fdf4' : isCurrent ? `${accent}12` : '#f3f4f6',
              border:`1.5px solid ${isDone ? '#bbf7d0' : isCurrent ? accent : '#e5e7eb'}`,
              opacity: isPending ? 0.55 : 1
            }}>
              {isDone && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
              <span style={{
                fontSize:11, fontWeight:700, fontVariantNumeric:'tabular-nums',
                color: isDone ? '#047857' : isCurrent ? accent : '#6b7280'
              }}>
                {eye}
              </span>
            </div>
            {i < sequence.length - 1 && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PUP_TransitionPrompt({ sequence, currentEye, completedSet, subTestLabel, onContinue, accent }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'34px 36px 28px', maxWidth:500, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <PUP_EyeBreadcrumb sequence={sequence} currentEye={currentEye} completedSet={completedSet} accent={accent}/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 10px', textAlign:'center' }}>
          {subTestLabel}: continue to {currentEye === 'OS' ? 'left' : 'right'} eye ({currentEye})
        </h3>
        <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:'0 0 22px', lineHeight:1.55, textAlign:'center' }}>
          Cover the patient's {currentEye === 'OS' ? 'right' : 'left'} eye with the occluder.
          Confirm the {currentEye === 'OS' ? 'left' : 'right'} eye is centered in the eyepiece before continuing.
        </p>
        <button onClick={onContinue} autoFocus style={{
          width:'100%', minHeight:48, padding:'12px 20px', borderRadius:10, border:'none',
          background: accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
          fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40`
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// IRIS VIEWER — animated pupil over a textured iris.
// Carried over from the original implementation and refined for the v0.2.5
// rebuild. The iris itself stays dark (clinically appropriate — pupillometry
// happens in a darkened headset interior). All surrounding chrome is light.
// ════════════════════════════════════════════════════════════════════════
function PUP_IrisViewer({ pupilMm, irisMm = 12, size = 220, accent, label, flashPct = 0, animate = true }) {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setFrame(f => f + 1), 60);
    return () => clearInterval(id);
  }, [animate]);

  const breathe = animate ? Math.sin(frame * 0.1) * 0.12 : 0;
  const dispMm  = pupilMm + breathe;
  const scale   = size / irisMm;
  const pupilPx = Math.max(8, dispMm * scale);

  // Stimulus flash overlay (used during dynamic + swinging sub-tests).
  // flashPct is 0–100, modulates a white veil that simulates the light pulse.
  const flashOpacity = Math.min(0.55, flashPct / 100 * 0.55);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <div style={{
        position:'relative', width:size + 24, height:size + 24,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'#0b0d10', borderRadius:18, border:'1.5px solid #1f2937',
        boxShadow:'0 8px 28px rgba(0,0,0,0.25), inset 0 0 30px rgba(0,0,0,0.6)',
      }}>
        {/* Outer ranging reticle */}
        <svg width={size + 8} height={size + 8} viewBox="0 0 100 100" style={{ position:'absolute', opacity:0.18 }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke={accent} strokeWidth="0.4" strokeDasharray="1 2"/>
          <line x1="50" y1="6" x2="50" y2="14" stroke={accent} strokeWidth="0.6"/>
          <line x1="50" y1="86" x2="50" y2="94" stroke={accent} strokeWidth="0.6"/>
          <line x1="6" y1="50" x2="14" y2="50" stroke={accent} strokeWidth="0.6"/>
          <line x1="86" y1="50" x2="94" y2="50" stroke={accent} strokeWidth="0.6"/>
        </svg>

        {/* Iris */}
        <div style={{
          width:size, height:size, borderRadius:'50%', position:'relative', overflow:'hidden',
          background:'radial-gradient(circle at 38% 32%, #6b4a30, #3d2916 38%, #1a0e07)',
          boxShadow:'0 0 30px rgba(0,0,0,0.7), inset 0 0 24px rgba(0,0,0,0.5)',
        }}>
          {/* Iris striae */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{
              position:'absolute', top:'50%', left:'50%',
              width:size * 0.45, height:1, background:'rgba(190,130,70,0.16)',
              transformOrigin:'left center',
              transform:`rotate(${i * 20}deg)`,
            }}/>
          ))}
          {/* Iris collarette */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            width:size * 0.5, height:size * 0.5, borderRadius:'50%',
            transform:'translate(-50%,-50%)',
            border:'1px solid rgba(170,110,60,0.25)',
          }}/>

          {/* Pupil */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            width:pupilPx, height:pupilPx, borderRadius:'50%',
            background:'#000', transform:'translate(-50%,-50%)',
            transition: animate ? 'width 0.18s linear, height 0.18s linear' : 'none',
            boxShadow:'inset 0 0 6px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9)',
          }}>
            {/* Corneal reflex */}
            <div style={{
              position:'absolute', top:'18%', left:'22%',
              width:'20%', height:'20%', borderRadius:'50%',
              background:'rgba(255,255,255,0.55)', filter:'blur(0.5px)',
            }}/>
          </div>
        </div>

        {/* Stimulus flash overlay */}
        {flashOpacity > 0 && (
          <div style={{
            position:'absolute', inset:12, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)',
            opacity:flashOpacity, pointerEvents:'none',
            transition:'opacity 80ms linear',
          }}/>
        )}
      </div>

      {label && (
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <span style={{ fontSize:24, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{dispMm.toFixed(1)}</span>
          <span style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>mm</span>
          <span style={{ fontSize:11, fontWeight:600, color:'#9ca3af' }}>· {label}</span>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// LIGHT-REFLEX CHART — SVG line graph of pupil size vs time.
// Drawn from the dynamic measurement object; renders the canonical PLR
// curve with annotations for baseline, latency, peak constriction, and T75.
// ════════════════════════════════════════════════════════════════════════
function PUP_LightReflexChart({ dynamics, accent, width = 480, height = 200 }) {
  if (!dynamics) return null;
  const { baselineSize, minSize, latencyMs, constrictionMs, redilationMs } = dynamics;

  const totalMs = 3000; // 3-second display window
  const pad = { top:18, right:14, bottom:30, left:42 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  // y-axis range (mm). Anchor to common pupil range so multiple charts are comparable.
  const yMin = 2.0, yMax = 8.0;
  const xToPx = ms => pad.left + (ms / totalMs) * W;
  const yToPx = mm => pad.top + (1 - (mm - yMin) / (yMax - yMin)) * H;

  // Build the response curve: flat baseline → constriction → recovery.
  // Use a simple piecewise model: 100 samples across the window.
  const samples = [];
  const recovery75 = baselineSize - (baselineSize - minSize) * 0.25; // 75% of the way back
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * totalMs;
    let mm;
    if (t < latencyMs) {
      mm = baselineSize;
    } else if (t < latencyMs + constrictionMs) {
      const k = (t - latencyMs) / constrictionMs;
      // Smooth ease-in for constriction
      mm = baselineSize - (baselineSize - minSize) * (1 - Math.cos(k * Math.PI)) / 2;
    } else {
      const k = Math.min(1, (t - latencyMs - constrictionMs) / redilationMs);
      // Recovery to T75
      mm = minSize + (recovery75 - minSize) * (1 - Math.cos(k * Math.PI)) / 2;
    }
    samples.push({ x: xToPx(t), y: yToPx(mm), mm, t });
  }
  const path = samples.map((s, i) => (i === 0 ? `M${s.x.toFixed(1)} ${s.y.toFixed(1)}` : `L${s.x.toFixed(1)} ${s.y.toFixed(1)}`)).join(' ');

  // Stimulus marker
  const stimX = xToPx(latencyMs * 0.5); // approximate stimulus onset, fixed marker
  const peakX = xToPx(latencyMs + constrictionMs);
  const peakY = yToPx(minSize);
  const baseY = yToPx(baselineSize);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display:'block', background:'#fff', borderRadius:10, border:'1px solid #e5e7eb' }}>
      {/* Y grid + labels */}
      {[2, 4, 6, 8].map(mm => (
        <g key={mm}>
          <line x1={pad.left} y1={yToPx(mm)} x2={pad.left + W} y2={yToPx(mm)} stroke="#f3f4f6" strokeWidth="1"/>
          <text x={pad.left - 6} y={yToPx(mm) + 3} fontSize="10" fill="#9ca3af" fontWeight="600" textAnchor="end" fontFamily="'Nunito Sans', sans-serif">{mm} mm</text>
        </g>
      ))}
      {/* X grid + labels */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000].map(ms => (
        <g key={ms}>
          <line x1={xToPx(ms)} y1={pad.top} x2={xToPx(ms)} y2={pad.top + H} stroke="#f9fafb" strokeWidth="1"/>
          <text x={xToPx(ms)} y={pad.top + H + 14} fontSize="9" fill="#9ca3af" fontWeight="600" textAnchor="middle" fontFamily="'Nunito Sans', sans-serif">{ms === 0 ? '0' : `${ms} ms`}</text>
        </g>
      ))}
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + H} stroke="#d1d5db" strokeWidth="1"/>
      <line x1={pad.left} y1={pad.top + H} x2={pad.left + W} y2={pad.top + H} stroke="#d1d5db" strokeWidth="1"/>

      {/* Stimulus flash bar */}
      <rect x={stimX - 3} y={pad.top + 2} width={6} height={H - 4} fill="#fde68a" opacity="0.7"/>
      <text x={stimX} y={pad.top - 4} fontSize="9" fill="#92400e" fontWeight="700" textAnchor="middle" fontFamily="'Nunito Sans', sans-serif">Stimulus</text>

      {/* Curve */}
      <path d={path} stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>

      {/* Baseline marker */}
      <line x1={pad.left} y1={baseY} x2={pad.left + W} y2={baseY} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"/>

      {/* Peak constriction marker */}
      <circle cx={peakX} cy={peakY} r="4" fill="#dc2626"/>
      <text x={peakX + 8} y={peakY + 3} fontSize="10" fill="#dc2626" fontWeight="700" fontFamily="'Nunito Sans', sans-serif">Min {minSize.toFixed(1)} mm</text>
    </svg>
  );
}


// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════

function PupillometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = React.useState('ready');
  const [eyeMode, setEyeMode] = React.useState('OU');
  const [includeDynamic, setIncludeDynamic]   = React.useState(true);
  const [includeSwinging, setIncludeSwinging] = React.useState(true);
  const [patientAge, setPatientAge] = React.useState(42);

  // Testing-phase state
  const [testStep, setTestStep] = React.useState('static');         // static · dynamic · swinging
  const [testingEye, setTestingEye] = React.useState('OD');
  const [staticIndex, setStaticIndex] = React.useState(0);          // 0/1/2 → which light condition
  const [showTransition, setShowTransition] = React.useState(false);
  const [pendingTransition, setPendingTransition] = React.useState(null);
  const [dynamicFlash, setDynamicFlash] = React.useState(0);        // 0–100, current stimulus brightness
  const [dynamicCapturing, setDynamicCapturing] = React.useState(false);

  // Results storage:
  //   resultsByEye.OD.static = { scotopic, mesopic, photopic }
  //   resultsByEye.OD.dynamic = { baselineSize, minSize, ... } | null
  const blankResults = () => ({
    OD: { static: { scotopic:null, mesopic:null, photopic:null }, dynamic:null },
    OS: { static: { scotopic:null, mesopic:null, photopic:null }, dynamic:null },
  });
  const [results, setResults] = React.useState(blankResults);
  const [rapdGrades, setRapdGrades] = React.useState({ OD:'none', OS:'none' });

  const [notes, setNotes]     = React.useState('');
  const [elapsed, setElapsed] = React.useState(0);

  const ageBand = PUP_getAgeBand(patientAge);

  const eyeSequence = eyeMode === 'OD' ? ['OD']
                    : eyeMode === 'OS' ? ['OS']
                    : ['OD', 'OS'];

  // ── Timer ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (phase !== 'testing') return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Phase / sub-step transitions ───────────────────────────────────
  const beginTest = () => {
    setPhase('testing');
    setTestStep('static');
    setTestingEye(eyeSequence[0]);
    setStaticIndex(0);
    setElapsed(0);
  };

  const captureStatic = (mm) => {
    const cond = PUP_LIGHT_CONDITIONS[staticIndex];
    setResults(prev => ({
      ...prev,
      [testingEye]: {
        ...prev[testingEye],
        static: { ...prev[testingEye].static, [cond.id]: mm },
      },
    }));
  };

  // Step computations. eyesDoneIn(step) = which eyes have completed the
  // given sub-step. completedEyes is shown in the EyeBreadcrumb / passed to
  // TransitionPrompt to render done ticks correctly.
  const staticCompleteFor = (eye) =>
    PUP_LIGHT_CONDITIONS.every(c => results[eye].static[c.id] != null);
  const dynamicCompleteFor = (eye) =>
    results[eye].dynamic != null;

  const completedSetForStep = (step) => {
    const set = new Set();
    if (step === 'static') {
      eyeSequence.forEach(eye => { if (staticCompleteFor(eye)) set.add(eye); });
    } else if (step === 'dynamic') {
      eyeSequence.forEach(eye => { if (dynamicCompleteFor(eye)) set.add(eye); });
    }
    return set;
  };

  // Advance from a fully-completed static sub-step for current eye.
  // Decides: next light condition for same eye → next eye in static →
  // next sub-test (dynamic / swinging / report).
  const advanceFromStatic = () => {
    // Mid-eye: cycle light conditions
    if (staticIndex < PUP_LIGHT_CONDITIONS.length - 1) {
      setStaticIndex(staticIndex + 1);
      return;
    }
    // Static done for this eye → next eye in sequence?
    const idx = eyeSequence.indexOf(testingEye);
    if (idx < eyeSequence.length - 1) {
      const nextEye = eyeSequence[idx + 1];
      setPendingTransition({ kind:'static', nextEye });
      setShowTransition(true);
      return;
    }
    // Static fully done → dynamic / swinging / report
    moveToNextSubTest('static');
  };

  const advanceFromDynamic = () => {
    const idx = eyeSequence.indexOf(testingEye);
    if (idx < eyeSequence.length - 1) {
      const nextEye = eyeSequence[idx + 1];
      setPendingTransition({ kind:'dynamic', nextEye });
      setShowTransition(true);
      return;
    }
    moveToNextSubTest('dynamic');
  };

  const moveToNextSubTest = (fromStep) => {
    if (fromStep === 'static') {
      if (includeDynamic) {
        setTestStep('dynamic');
        setTestingEye(eyeSequence[0]);
        return;
      }
      if (includeSwinging && eyeSequence.length === 2) {
        setTestStep('swinging');
        return;
      }
      setPhase('report');
      return;
    }
    if (fromStep === 'dynamic') {
      if (includeSwinging && eyeSequence.length === 2) {
        setTestStep('swinging');
        return;
      }
      setPhase('report');
      return;
    }
    if (fromStep === 'swinging') {
      setPhase('report');
    }
  };

  const onTransitionContinue = () => {
    if (!pendingTransition) return;
    setTestingEye(pendingTransition.nextEye);
    if (pendingTransition.kind === 'static') {
      setStaticIndex(0);
    }
    setShowTransition(false);
    setPendingTransition(null);
  };

  // Finish & Report enabled when at the last enabled sub-step and that step
  // is in a completable state. Static & dynamic must have captured data;
  // swinging is always completable (defaults to "none" for both eyes).
  function finishAvailable() {
    if (phase !== 'testing') return false;
    const lastEye = eyeSequence[eyeSequence.length - 1];

    if (testStep === 'static') {
      if (includeDynamic) return false;
      if (includeSwinging && eyeSequence.length === 2) return false;
      // last enabled step IS static
      return testingEye === lastEye && staticCompleteFor(lastEye);
    }
    if (testStep === 'dynamic') {
      if (includeSwinging && eyeSequence.length === 2) return false;
      return testingEye === lastEye && dynamicCompleteFor(lastEye);
    }
    if (testStep === 'swinging') {
      return true;
    }
    return false;
  }

  // ── Dynamic sub-test capture animation ────────────────────────────
  // Plays a brief stimulus flash and writes the simulated PLR results when
  // it lands. Pure UI motion — production firmware streams the real curve.
  const runDynamicCapture = () => {
    if (dynamicCapturing) return;
    setDynamicCapturing(true);
    const start = Date.now();
    const total = 1400;
    const tick = () => {
      const t = Date.now() - start;
      const k = Math.min(1, t / total);
      // Flash: ramp up first 30%, hold, ramp down last 30%
      let flash;
      if (k < 0.25) flash = (k / 0.25) * 100;
      else if (k < 0.6) flash = 100;
      else flash = Math.max(0, 100 * (1 - (k - 0.6) / 0.4));
      setDynamicFlash(flash);
      if (k < 1) requestAnimationFrame(tick);
      else {
        setDynamicFlash(0);
        const dyn = PUP_simulateDynamics(testingEye);
        setResults(prev => ({
          ...prev,
          [testingEye]: { ...prev[testingEye], dynamic: dyn },
        }));
        setDynamicCapturing(false);
      }
    };
    requestAnimationFrame(tick);
  };

  const resetForNewTest = () => {
    setPhase('ready');
    setTestStep('static');
    setTestingEye('OD');
    setStaticIndex(0);
    setResults(blankResults());
    setRapdGrades({ OD:'none', OS:'none' });
    setNotes('');
    setElapsed(0);
  };


  // ══════════════════════════════════════════════════════════════════
  // RENDER: READY
  // ══════════════════════════════════════════════════════════════════
  const renderReady = () => (
    <div style={{ padding:'32px 24px', display:'flex', justifyContent:'center', minHeight:'100%' }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'36px 40px', maxWidth:820, width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:6 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill={accent} stroke="none"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Pupillometry</h2>
            <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'4px 0 0', maxWidth:560, lineHeight:1.5 }}>
              Measure pupil size at three light conditions, capture the dynamic light reflex, and detect relative afferent pupillary defects.
            </p>
          </div>
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'20px 0' }}/>

        <div style={{ fontSize:12, fontWeight:700, color:'#111827', letterSpacing:'0.04em', marginBottom:10 }}>Eye(s) to test</div>
        <PUP_InlineEyePicker value={eyeMode} onChange={setEyeMode} accent={accent}/>

        <div style={{ height:1, background:'#e5e7eb', margin:'24px 0 18px' }}/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:24, alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', letterSpacing:'0.04em', marginBottom:10 }}>Sub-tests</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { id:'static',    label:'Static pupil size',         desc:'Three light conditions (scotopic, mesopic, photopic). Required for all pupillometry exams.', checked:true,             onChange:null,            disabled:true },
                { id:'dynamic',   label:'Dynamic light reflex',       desc:'Per-eye time-course measurement of constriction and redilation in response to a light stimulus.', checked:includeDynamic,   onChange:setIncludeDynamic,  disabled:false },
                { id:'swinging',  label:'Swinging flashlight (RAPD)', desc:'Alternating light stimulus across the eyes to detect relative afferent pupillary defect.',     checked:includeSwinging,  onChange:setIncludeSwinging, disabled: eyeSequence.length !== 2 },
              ].map(row => {
                const cardEnabled = !row.disabled;
                const showOuOnlyHint = row.id === 'swinging' && eyeSequence.length !== 2;
                return (
                  <label key={row.id} style={{
                    display:'flex', gap:12, alignItems:'flex-start',
                    padding:'12px 14px',
                    borderRadius:10,
                    border:`1.5px solid ${row.checked && cardEnabled ? `${accent}50` : '#e5e7eb'}`,
                    background: row.checked && cardEnabled ? `${accent}08` : '#fff',
                    cursor: cardEnabled ? 'pointer' : 'default',
                    opacity: row.disabled && row.id !== 'static' ? 0.55 : 1,
                  }}>
                    <input type="checkbox"
                      checked={row.checked && cardEnabled}
                      disabled={row.disabled}
                      onChange={cardEnabled && row.onChange ? (e => row.onChange(e.target.checked)) : undefined}
                      style={{ marginTop:3, width:18, height:18, accentColor:accent, cursor: cardEnabled ? 'pointer' : 'default' }}
                    />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:2 }}>
                        {row.label}
                        {row.id === 'static' && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, color:'#9ca3af' }}>Required</span>}
                        {showOuOnlyHint && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, color:'#9ca3af' }}>Requires both eyes</span>}
                      </div>
                      <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', lineHeight:1.5 }}>{row.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop:18, padding:'12px 14px', background:`${accent}06`, border:`1px solid ${accent}20`, borderRadius:10, display:'flex', alignItems:'flex-start', gap:10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <div style={{ fontSize:11, fontWeight:400, color:'#374151', lineHeight:1.6 }}>
                Scotopic measurements require ≥ 5 minutes of dark adaptation. The headset enforces this timing automatically before the first capture.
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', letterSpacing:'0.04em', marginBottom:10 }}>Patient age</div>
            <input
              type="number"
              min="1" max="120"
              value={patientAge}
              onChange={e => setPatientAge(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, fontWeight:600, color:'#111827', fontFamily:"'Nunito Sans', sans-serif", outline:'none' }}
            />
            <div style={{ marginTop:8, fontSize:11, fontWeight:400, color:'#6b7280', lineHeight:1.5 }}>
              Used to look up the age-banded reference range ({ageBand.age}).
            </div>

            <div style={{ marginTop:18, padding:'12px 14px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Reference range</div>
              {PUP_LIGHT_CONDITIONS.map(c => (
                <div key={c.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:'#374151', padding:'2px 0' }}>
                  <span>{c.label}</span>
                  <span style={{ fontVariantNumeric:'tabular-nums' }}>{ageBand[c.id][0].toFixed(1)}–{ageBand[c.id][1].toFixed(1)} mm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // ══════════════════════════════════════════════════════════════════
  // RENDER: TESTING — three sub-step renderers
  // ══════════════════════════════════════════════════════════════════
  const renderTesting = () => {
    if (testStep === 'static')   return renderStatic();
    if (testStep === 'dynamic')  return renderDynamic();
    if (testStep === 'swinging') return renderSwinging();
    return null;
  };

  // ── Static sub-step ──────────────────────────────────────────────
  const renderStatic = () => {
    const cond = PUP_LIGHT_CONDITIONS[staticIndex];
    const captured = results[testingEye].static[cond.id];
    const refRange = ageBand[cond.id];

    // Pupil sim for current condition
    const basePupil = cond.id === 'scotopic' ? 6.8 + (testingEye === 'OS' ? 0.1 : 0)
                    : cond.id === 'mesopic'  ? 5.0 + (testingEye === 'OS' ? 0.1 : 0)
                    : 3.0 + (testingEye === 'OS' ? 0.1 : 0);

    const isLastInStep =
      staticIndex === PUP_LIGHT_CONDITIONS.length - 1 &&
      testingEye === eyeSequence[eyeSequence.length - 1];

    const nextLabel = isLastInStep
      ? (() => {
          if (includeDynamic) return 'Next: Dynamic light reflex →';
          if (includeSwinging && eyeSequence.length === 2) return 'Next: Swinging flashlight →';
          return 'Finish & report →';
        })()
      : staticIndex < PUP_LIGHT_CONDITIONS.length - 1
        ? `Next: ${PUP_LIGHT_CONDITIONS[staticIndex + 1].label} →`
        : `Next: ${eyeSequence[eyeSequence.indexOf(testingEye) + 1]} →`;

    return (
      <div style={{ padding:24, minHeight:'100%' }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Sub-bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 0 4px ${accent}25` }}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Static pupil size · {testingEye}</span>
              <span style={{ fontSize:11, fontWeight:400, color:'#9ca3af' }}>·</span>
              <span style={{ fontSize:11, fontWeight:600, color:'#6b7280' }}>
                Condition {staticIndex + 1} of {PUP_LIGHT_CONDITIONS.length}
              </span>
            </div>
            <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
              <PUP_EyeBreadcrumb sequence={eyeSequence} currentEye={testingEye} completedSet={completedSetForStep('static')} accent={accent}/>
            </div>
          </div>

          {/* Main card — two columns */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'24px 28px', display:'grid', gridTemplateColumns:'minmax(0, 1fr) minmax(0, 1fr)', gap:32, alignItems:'flex-start' }}>

            {/* Left: iris viewer */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <PUP_IrisViewer pupilMm={basePupil} size={220} accent={accent} label={cond.label}/>
              <div style={{ display:'flex', gap:12, fontSize:11, fontWeight:600, color:'#6b7280' }}>
                <span><strong style={{ color:'#374151', fontWeight:700 }}>{cond.lux}</strong></span>
                <span>·</span>
                <span>{cond.desc}</span>
              </div>
            </div>

            {/* Right: measurement controls */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>
                Light condition
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:18 }}>
                {PUP_LIGHT_CONDITIONS.map((c, i) => {
                  const done = results[testingEye].static[c.id] != null;
                  const active = i === staticIndex;
                  return (
                    <div key={c.id} style={{
                      flex:1, padding:'10px 12px',
                      borderRadius:10,
                      border:`1.5px solid ${active ? accent : done ? '#bbf7d0' : '#e5e7eb'}`,
                      background: active ? `${accent}10` : done ? '#f0fdf4' : '#f9fafb',
                      textAlign:'center',
                    }}>
                      <div style={{ fontSize:11, fontWeight:700, color: active ? accent : done ? '#047857' : '#6b7280' }}>{c.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginTop:3, fontVariantNumeric:'tabular-nums' }}>
                        {results[testingEye].static[c.id] != null ? `${results[testingEye].static[c.id].toFixed(1)} mm` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>
                Capture
              </div>
              <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{cond.label} measurement</div>
                    <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', marginTop:2 }}>
                      Age-banded reference: {refRange[0].toFixed(1)}–{refRange[1].toFixed(1)} mm
                    </div>
                  </div>
                  {captured != null && PUP_inRange(captured, refRange) === false && (
                    <div style={{ fontSize:10, fontWeight:700, color:'#d97706', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:6, padding:'3px 8px' }}>
                      Outside range
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <button
                    onClick={() => captureStatic(+(basePupil + (Math.random() - 0.5) * 0.3).toFixed(2))}
                    style={{
                      flex:1, minHeight:46, padding:'10px 16px', borderRadius:10,
                      border:'none', background:accent, color:'#fff',
                      fontSize:13, fontWeight:700, cursor:'pointer',
                      fontFamily:"'Nunito Sans', sans-serif",
                      boxShadow:`0 3px 12px ${accent}40`,
                    }}>
                    {captured != null ? 'Re-capture' : 'Capture measurement'}
                  </button>
                  {captured != null && (
                    <button
                      onClick={() => captureStatic(null)}
                      style={{
                        minHeight:46, padding:'10px 14px', borderRadius:10,
                        border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280',
                        fontSize:12, fontWeight:700, cursor:'pointer',
                        fontFamily:"'Nunito Sans', sans-serif",
                      }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
                <button
                  onClick={advanceFromStatic}
                  disabled={captured == null}
                  style={{
                    minHeight:48, padding:'12px 24px', borderRadius:10,
                    border:'none',
                    background: captured == null ? '#d1d5db' : accent,
                    color:'#fff',
                    fontSize:13, fontWeight:700, cursor: captured == null ? 'not-allowed' : 'pointer',
                    fontFamily:"'Nunito Sans', sans-serif",
                    boxShadow: captured == null ? 'none' : `0 3px 12px ${accent}40`,
                  }}>
                  {nextLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showTransition && pendingTransition && (
          <PUP_TransitionPrompt
            sequence={eyeSequence}
            currentEye={pendingTransition.nextEye}
            completedSet={completedSetForStep('static')}
            subTestLabel="Static pupil size"
            onContinue={onTransitionContinue}
            accent={accent}
          />
        )}
      </div>
    );
  };

  // ── Dynamic sub-step ─────────────────────────────────────────────
  const renderDynamic = () => {
    const dyn = results[testingEye].dynamic;
    const npi = dyn ? PUP_computeNPi(dyn) : null;
    const npiSev = PUP_npiSeverity(npi);

    // Animated pupil during the flash
    const breathBase = 5.4;
    const flashPupil = dyn
      ? dyn.baselineSize - (dyn.baselineSize - dyn.minSize) * (dynamicFlash / 100)
      : breathBase - (breathBase - 3.5) * (dynamicFlash / 100);

    const isLastEye = testingEye === eyeSequence[eyeSequence.length - 1];
    const nextLabel = isLastEye
      ? (includeSwinging && eyeSequence.length === 2 ? 'Next: Swinging flashlight →' : 'Finish & report →')
      : `Next: ${eyeSequence[eyeSequence.indexOf(testingEye) + 1]} →`;

    return (
      <div style={{ padding:24, minHeight:'100%' }}>
        <div style={{ maxWidth:1040, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Sub-bar */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 0 4px ${accent}25` }}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Dynamic light reflex · {testingEye}</span>
            </div>
            <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
              <PUP_EyeBreadcrumb sequence={eyeSequence} currentEye={testingEye} completedSet={completedSetForStep('dynamic')} accent={accent}/>
            </div>
          </div>

          {/* Main card */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'24px 28px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 280px) minmax(0, 1fr)', gap:32, alignItems:'flex-start' }}>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                <PUP_IrisViewer pupilMm={flashPupil} size={220} accent={accent} flashPct={dynamicFlash}/>
                <button
                  onClick={runDynamicCapture}
                  disabled={dynamicCapturing}
                  style={{
                    minHeight:46, padding:'12px 22px', borderRadius:10,
                    border:'none', background: dynamicCapturing ? '#d1d5db' : accent, color:'#fff',
                    fontSize:13, fontWeight:700,
                    cursor: dynamicCapturing ? 'not-allowed' : 'pointer',
                    fontFamily:"'Nunito Sans', sans-serif",
                    boxShadow: dynamicCapturing ? 'none' : `0 3px 12px ${accent}40`,
                  }}>
                  {dynamicCapturing ? 'Capturing…' : dyn ? 'Re-capture' : 'Trigger stimulus'}
                </button>
                <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', textAlign:'center', maxWidth:260, lineHeight:1.5 }}>
                  Headset will present a calibrated light pulse and capture the {testingEye} pupillary response.
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8 }}>
                  Pupillary light reflex curve
                </div>
                <PUP_LightReflexChart dynamics={dyn} accent={accent} width={520} height={210}/>
                {!dyn && (
                  <div style={{ marginTop:-200, height:210, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:12, fontWeight:600, pointerEvents:'none' }}>
                    Trigger the stimulus to capture the response curve.
                  </div>
                )}

                {dyn && (
                  <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                    {[
                      ['Baseline',            `${dyn.baselineSize.toFixed(2)} mm`],
                      ['Minimum',             `${dyn.minSize.toFixed(2)} mm`],
                      ['Constriction',        `${dyn.constrictionPct.toFixed(1)} %`],
                      ['Latency',             `${dyn.latencyMs} ms`],
                      ['Constriction vel.',   `${dyn.constrictionVel.toFixed(2)} mm/s`],
                      ['T75 redilation',      `${dyn.redilationMs} ms`],
                    ].map(([l, v]) => (
                      <div key={l} style={{ padding:'10px 12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:9 }}>
                        <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginTop:3, fontVariantNumeric:'tabular-nums' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {dyn && npi != null && (
                  <div style={{ marginTop:14, padding:'14px 18px', background: npiSev.tint === '#10b981' ? '#f0fdf4' : npiSev.tint === '#d97706' ? '#fffbeb' : '#fef2f2', border:`1.5px solid ${npiSev.tint}40`, borderRadius:10, display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ fontSize:30, fontWeight:700, color:npiSev.tint, fontVariantNumeric:'tabular-nums', minWidth:70 }}>{npi.toFixed(1)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:npiSev.tint, textTransform:'uppercase', letterSpacing:'0.06em' }}>Neurological Pupil index (NPi)</div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginTop:2 }}>
                        {npiSev.label} — ≥ 3.0 normal · &lt; 3.0 abnormal
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
                  <button
                    onClick={advanceFromDynamic}
                    disabled={!dyn}
                    style={{
                      minHeight:48, padding:'12px 24px', borderRadius:10,
                      border:'none', background: !dyn ? '#d1d5db' : accent, color:'#fff',
                      fontSize:13, fontWeight:700, cursor: !dyn ? 'not-allowed' : 'pointer',
                      fontFamily:"'Nunito Sans', sans-serif",
                      boxShadow: !dyn ? 'none' : `0 3px 12px ${accent}40`,
                    }}>
                    {nextLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showTransition && pendingTransition && (
          <PUP_TransitionPrompt
            sequence={eyeSequence}
            currentEye={pendingTransition.nextEye}
            completedSet={completedSetForStep('dynamic')}
            subTestLabel="Dynamic light reflex"
            onContinue={onTransitionContinue}
            accent={accent}
          />
        )}
      </div>
    );
  };

  // ── Swinging flashlight sub-step ─────────────────────────────────
  // Cycling stimulus animation + per-eye grade selector for the doctor.
  const renderSwinging = () => {
    return <PUP_SwingingScreen
      results={results} accent={accent}
      rapdGrades={rapdGrades} setRapdGrades={setRapdGrades}
      onFinish={() => setPhase('report')}
    />;
  };

  // Right sidebar during testing — progress + session notes
  const renderRightSidebar = () => {
    const subSteps = [
      { id:'static',   label:'Static pupil size',         enabled:true,            active:testStep === 'static' },
      { id:'dynamic',  label:'Dynamic light reflex',       enabled:includeDynamic,  active:testStep === 'dynamic' },
      { id:'swinging', label:'Swinging flashlight',        enabled:includeSwinging && eyeSequence.length === 2, active:testStep === 'swinging' },
    ];

    return (
      <div style={{ padding:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Progress</div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {subSteps.filter(s => s.enabled).map((s, i) => {
            // For static/dynamic, render per-eye sub-rows
            const showEyeRows = (s.id === 'static' || s.id === 'dynamic') && eyeSequence.length === 2;
            return (
              <div key={s.id}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, color: s.active ? accent : '#374151' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: s.active ? accent : '#d1d5db' }}/>
                  {s.label}
                </div>
                {showEyeRows && (
                  <div style={{ marginLeft:18, marginTop:6, display:'flex', flexDirection:'column', gap:4 }}>
                    {eyeSequence.map(eye => {
                      const done = s.id === 'static' ? staticCompleteFor(eye) : dynamicCompleteFor(eye);
                      const cur  = s.active && testingEye === eye && !done;
                      return (
                        <div key={eye} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, color: done ? '#047857' : cur ? accent : '#9ca3af' }}>
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                          ) : (
                            <div style={{ width:6, height:6, borderRadius:'50%', background: cur ? accent : '#d1d5db' }}/>
                          )}
                          {eye} {done ? 'captured' : cur ? '— in progress' : 'pending'}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'18px 0' }}/>

        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Patient</div>
        <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Marcus Williams</div>
        <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginTop:2 }}>Age {patientAge} · {ageBand.age} reference</div>

        <div style={{ height:1, background:'#e5e7eb', margin:'18px 0' }}/>

        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Session notes</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observations during testing…"
          style={{ width:'100%', minHeight:80, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, fontWeight:400, color:'#374151', fontFamily:"'Nunito Sans', sans-serif", resize:'vertical', outline:'none', boxSizing:'border-box' }}
        />
      </div>
    );
  };


  // ══════════════════════════════════════════════════════════════════
  // RENDER: REPORT
  // ══════════════════════════════════════════════════════════════════
  const renderReport = () => {
    const now = new Date();
    const ranDynamic  = ['OD','OS'].some(e => results[e].dynamic);
    const ranSwinging = (eyeSequence.length === 2) && includeSwinging;
    const eyesTested  = eyeSequence;
    const interp      = PUP_getInterp(eyesTested, results, rapdGrades, ageBand, ranDynamic, ranSwinging);
    const clinFlags   = PUP_getClinicalFlag(eyesTested, results, rapdGrades, ranDynamic, ranSwinging);

    // Anisocoria computation for the report
    const od = results.OD?.static, os = results.OS?.static;
    const haveOU = eyeSequence.length === 2;
    const aniByCondition = haveOU ? PUP_LIGHT_CONDITIONS.map(c => {
      if (od[c.id] == null || os[c.id] == null) return { id:c.id, label:c.label, value:null };
      return { id:c.id, label:c.label, value: Math.abs(od[c.id] - os[c.id]) };
    }) : [];
    const aniLight = haveOU && od.photopic != null && os.photopic != null ? Math.abs(od.photopic - os.photopic) : null;
    const aniDark  = haveOU && od.scotopic != null && os.scotopic != null ? Math.abs(od.scotopic - os.scotopic) : null;
    const conditionDelta = (aniLight != null && aniDark != null) ? Math.abs(aniDark - aniLight) : null;
    const overallAniSev = haveOU ? PUP_getAnisocoriaSeverity(Math.max(aniLight ?? 0, aniDark ?? 0), conditionDelta) : null;

    return (
      <div style={{ padding:'20px 24px', minHeight:'100%' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Patient Classification banner */}
          <div style={{ background:interp.bg, border:`1.5px solid ${interp.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:'#fff', border:`2px solid ${interp.tint}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={interp.tint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {interp.severity === 'normal'
                  ? <path d="M20 6L9 17l-5-5"/>
                  : <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
              </svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:interp.tint, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Patient classification</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.4 }}>{interp.summary}</div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              {haveOU && overallAniSev && (
                <div style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${overallAniSev.tint}40`, fontSize:11, fontWeight:700, color:overallAniSev.tint, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>Anisocoria</div>
                  <div>{Math.max(aniLight ?? 0, aniDark ?? 0).toFixed(1)} mm</div>
                </div>
              )}
              {ranDynamic && eyesTested.map(eye => {
                const npi = PUP_computeNPi(results[eye]?.dynamic);
                const sev = PUP_npiSeverity(npi);
                return npi != null ? (
                  <div key={eye} style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${sev.tint}40`, fontSize:11, fontWeight:700, color:sev.tint, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>
                    <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>NPi {eye}</div>
                    <div>{npi.toFixed(1)}</div>
                  </div>
                ) : null;
              })}
              {ranSwinging && (
                <div style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${(rapdGrades.OD !== 'none' || rapdGrades.OS !== 'none') ? '#dc262640' : '#10b98140'}`, fontSize:11, fontWeight:700, color:(rapdGrades.OD !== 'none' || rapdGrades.OS !== 'none') ? '#dc2626' : '#10b981', textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>RAPD</div>
                  <div>{(rapdGrades.OD === 'none' && rapdGrades.OS === 'none') ? 'None' : (rapdGrades.OD !== 'none' ? `OD ${PUP_RAPD_GRADES.find(g => g.id === rapdGrades.OD)?.short}` : `OS ${PUP_RAPD_GRADES.find(g => g.id === rapdGrades.OS)?.short}`)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical flag(s) — conditional */}
          {clinFlags && clinFlags.map((f, i) => (
            <div key={i} style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#7f1d1d', marginBottom:2 }}>{f.title}</div>
                <div style={{ fontSize:12, fontWeight:500, color:'#991b1b', lineHeight:1.5 }}>{f.body}</div>
              </div>
            </div>
          ))}

          {/* Patient information */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...PUP_REPORT_LABEL, marginBottom:14 }}>Patient information</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
              {[
                ['Patient name', 'Marcus Williams'],
                ['Birthdate',    '10/11/1983'],
                ['Patient ID',   'azx7895'],
                ['Age',          `${patientAge} (${ageBand.age} reference band)`],
                ['Exam type',    'Pupillometry'],
                ['Exam date',    now.toLocaleDateString('en-US')],
                ['Start time',   now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })],
                ['Test duration',fmtTime(elapsed)],
                ['Eyes tested',  eyesTested.join(' · ')],
                ['Tests performed', ['Static', ranDynamic ? 'Dynamic light reflex' : null, ranSwinging ? 'Swinging flashlight' : null].filter(Boolean).join(' · ')],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Static measurements table */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...PUP_REPORT_LABEL, marginBottom:14 }}>Static pupil measurements</div>
            <div style={{ border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>
                    {['Light condition', 'Lux', ...eyesTested, ...(haveOU ? ['Anisocoria'] : []), 'Age-banded reference'].map(h => (
                      <th key={h} style={{ background:'#0e2f5e', color:'#fff', padding:'10px 12px', textAlign:'left', fontWeight:700, fontSize:11, letterSpacing:'0.02em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PUP_LIGHT_CONDITIONS.map((c, i) => {
                    const ref = ageBand[c.id];
                    const aniRow = haveOU && od[c.id] != null && os[c.id] != null ? Math.abs(od[c.id] - os[c.id]) : null;
                    return (
                      <tr key={c.id} style={{ borderTop:'1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ padding:'10px 12px', fontWeight:700, color:'#374151' }}>{c.label}</td>
                        <td style={{ padding:'10px 12px', color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>{c.lux}</td>
                        {eyesTested.map(eye => {
                          const val = results[eye].static[c.id];
                          const inR = val != null ? PUP_inRange(val, ref) : null;
                          return (
                            <td key={eye} style={{ padding:'10px 12px', fontWeight:700, color: val == null ? '#9ca3af' : inR ? '#111827' : '#dc2626', fontVariantNumeric:'tabular-nums' }}>
                              {val != null ? `${val.toFixed(1)} mm` : '—'}
                              {val != null && !inR && (
                                <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:'#dc2626' }}>↯</span>
                              )}
                            </td>
                          );
                        })}
                        {haveOU && (
                          <td style={{ padding:'10px 12px', fontWeight:700, color: aniRow == null ? '#9ca3af' : aniRow > 1.0 ? '#dc2626' : aniRow >= 0.4 ? '#d97706' : '#10b981', fontVariantNumeric:'tabular-nums' }}>
                            {aniRow != null ? `${aniRow.toFixed(2)} mm` : '—'}
                          </td>
                        )}
                        <td style={{ padding:'10px 12px', color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>
                          {ref[0].toFixed(1)}–{ref[1].toFixed(1)} mm
                        </td>
                      </tr>
                    );
                  })}
                  {haveOU && (
                    <tr style={{ borderTop:'1.5px solid #d1d5db', background:'#f3f4f6' }}>
                      <td style={{ padding:'10px 12px', fontWeight:700, color:'#111827' }}>Anisocoria — light/dark Δ</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}></td>
                      <td colSpan={eyesTested.length} style={{ padding:'10px 12px', fontWeight:700, color: conditionDelta != null && conditionDelta >= 0.3 ? '#dc2626' : '#374151', fontVariantNumeric:'tabular-nums' }}>
                        {conditionDelta != null ? `${conditionDelta.toFixed(2)} mm` : '—'}
                      </td>
                      <td colSpan={2} style={{ padding:'10px 12px', fontWeight:600, color:'#6b7280', fontSize:11 }}>
                        ≥ 0.3 mm = pathological pattern
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic measurements (conditional) */}
          {ranDynamic && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ ...PUP_REPORT_LABEL, marginBottom:14 }}>Dynamic light reflex</div>
              <div style={{ display:'grid', gridTemplateColumns: eyesTested.length === 2 ? '1fr 1fr' : '1fr', gap:18 }}>
                {eyesTested.map(eye => {
                  const dyn = results[eye].dynamic;
                  const npi = PUP_computeNPi(dyn);
                  const sev = PUP_npiSeverity(npi);
                  if (!dyn) {
                    return <div key={eye} style={{ padding:'14px 16px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, fontSize:12, fontWeight:600, color:'#9ca3af' }}>{eye} — not captured</div>;
                  }
                  return (
                    <div key={eye} style={{ padding:'14px 16px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{eye} ({eye === 'OD' ? 'Right' : 'Left'})</div>
                        <div style={{ padding:'4px 10px', borderRadius:6, background:'#fff', border:`1.5px solid ${sev.tint}40`, fontSize:11, fontWeight:700, color:sev.tint }}>
                          NPi {npi.toFixed(1)} · {sev.label}
                        </div>
                      </div>
                      <PUP_LightReflexChart dynamics={dyn} accent={accent} width={420} height={170}/>
                      <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:11 }}>
                        {[
                          ['Baseline',        `${dyn.baselineSize.toFixed(2)} mm`],
                          ['Min size',        `${dyn.minSize.toFixed(2)} mm`],
                          ['Constriction',    `${dyn.constrictionPct.toFixed(1)} %`],
                          ['Latency',         `${dyn.latencyMs} ms`],
                          ['Constr. vel.',    `${dyn.constrictionVel.toFixed(2)} mm/s`],
                          ['T75',             `${dyn.redilationMs} ms`],
                        ].map(([l, v]) => (
                          <div key={l}>
                            <div style={{ fontWeight:600, color:'#9ca3af', fontSize:10, textTransform:'uppercase', letterSpacing:'0.04em' }}>{l}</div>
                            <div style={{ fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAPD assessment (conditional) */}
          {ranSwinging && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ ...PUP_REPORT_LABEL, marginBottom:14 }}>Swinging flashlight — RAPD assessment</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {['OD', 'OS'].map(eye => {
                  const g = PUP_RAPD_GRADES.find(r => r.id === rapdGrades[eye]);
                  const sev = g.severity;
                  const palette = sev === 'normal' ? { bg:'#f0fdf4', border:'#bbf7d0', tint:'#047857' }
                               : sev === 'mild'   ? { bg:'#fffbeb', border:'#fde68a', tint:'#92400e' }
                                                  : { bg:'#fef2f2', border:'#fecaca', tint:'#991b1b' };
                  return (
                    <div key={eye} style={{ padding:'14px 18px', background:palette.bg, border:`1.5px solid ${palette.border}`, borderRadius:10 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:palette.tint, textTransform:'uppercase', letterSpacing:'0.06em' }}>{eye} — {eye === 'OD' ? 'Right' : 'Left'} eye</div>
                        <div style={{ fontSize:13, fontWeight:700, color:palette.tint }}>{g.label}</div>
                      </div>
                      <div style={{ fontSize:11, fontWeight:500, color:'#6b7280', lineHeight:1.5 }}>{g.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Interpretation card */}
          <div style={{ background:interp.bg, border:`1.5px solid ${interp.border}`, borderRadius:14, padding:'18px 20px' }}>
            <div style={{ ...PUP_REPORT_LABEL, marginBottom:10, color:interp.tint }}>Clinical interpretation</div>
            <p style={{ fontSize:13, fontWeight:400, color:'#374151', lineHeight:1.65, margin:0 }}>{interp.summary}</p>
            {interp.findings.length > 0 && (
              <ul style={{ margin:'12px 0 0 18px', padding:0, fontSize:12, fontWeight:500, color:'#374151', lineHeight:1.7 }}>
                {interp.findings.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>

          {/* Age-banded reference values card */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...PUP_REPORT_LABEL, marginBottom:10 }}>Age-banded reference values</div>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:10, lineHeight:1.5 }}>
              Mean ± 1 SD pupil diameter (mm) by age band. Source: Winn et al. 1994 and clinical convention.
            </div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr>
                    {['Age band', 'Scotopic', 'Mesopic', 'Photopic'].map(h => (
                      <th key={h} style={{ background:'#f3f4f6', color:'#374151', padding:'8px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PUP_AGE_NORMS.map((b, i) => (
                    <tr key={b.age} style={{ borderTop:'1px solid #e5e7eb', background: b.age === ageBand.age ? `${accent}10` : i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding:'7px 12px', fontWeight:700, color: b.age === ageBand.age ? accent : '#374151' }}>
                        {b.age}{b.age === ageBand.age && ' ←'}
                      </td>
                      <td style={{ padding:'7px 12px', color:'#374151', fontVariantNumeric:'tabular-nums' }}>{b.scotopic[0].toFixed(1)}–{b.scotopic[1].toFixed(1)}</td>
                      <td style={{ padding:'7px 12px', color:'#374151', fontVariantNumeric:'tabular-nums' }}>{b.mesopic[0].toFixed(1)}–{b.mesopic[1].toFixed(1)}</td>
                      <td style={{ padding:'7px 12px', color:'#374151', fontVariantNumeric:'tabular-nums' }}>{b.photopic[0].toFixed(1)}–{b.photopic[1].toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Session notes */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...PUP_REPORT_LABEL, marginBottom:10 }}>Session notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Patient noted photophobia in bright condition. Eyelid drape observed during dynamic capture on OD."
              style={{ width:'100%', minHeight:90, padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:13, fontWeight:400, color:'#374151', fontFamily:"'Nunito Sans', sans-serif", resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {/* Actions row with Doctor sign-off */}
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:24, flexWrap:'wrap' }}>
            <button style={{ padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Export report
            </button>
            <button style={{ padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Compare
            </button>
            <div style={{ flex:1 }}/>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:accent, letterSpacing:'0.02em' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Doctor sign-off
              </div>
              <button onClick={onBack} style={{ padding:'12px 28px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
                Certify &amp; close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════
  // EXAM SHELL
  // ══════════════════════════════════════════════════════════════════
  return (
    <ExamShell
      title="Pupillometry"
      accent={accent}
      onBack={onBack}
      patientName="Marcus Williams"
      patientId="#4821"
      phase={phase}
      elapsed={phase === 'testing' ? elapsed : undefined}
      onBegin={phase === 'ready' ? beginTest : null}
      onFinish={finishAvailable() ? () => setPhase('report') : null}
      onNewTest={phase === 'report' ? resetForNewTest : null}
      rightPanel={phase === 'testing' ? renderRightSidebar() : null}
    >
      {phase === 'ready'   && renderReady()}
      {phase === 'testing' && renderTesting()}
      {phase === 'report'  && renderReport()}
    </ExamShell>
  );
}


// ════════════════════════════════════════════════════════════════════════
// SWINGING FLASHLIGHT SCREEN
// Separated from the main render tree so its alternating-stimulus animation
// state stays scoped here.
// ════════════════════════════════════════════════════════════════════════
function PUP_SwingingScreen({ accent, rapdGrades, setRapdGrades, onFinish }) {
  const [activeEye, setActiveEye] = React.useState('OD');
  const [running, setRunning] = React.useState(false);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setActiveEye(e => e === 'OD' ? 'OS' : 'OD');
    }, 1800);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  return (
    <div style={{ padding:24, minHeight:'100%' }}>
      <div style={{ maxWidth:1040, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 0 4px ${accent}25` }}/>
          <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Swinging flashlight — RAPD assessment</span>
          <div style={{ flex:1 }}/>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              minHeight:36, padding:'8px 16px', borderRadius:9,
              border:`1.5px solid ${running ? '#fecaca' : accent}`,
              background: running ? '#fef2f2' : accent,
              color: running ? '#ef4444' : '#fff',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif",
            }}>
            {running ? 'Pause stimulus' : 'Start stimulus'}
          </button>
        </div>

        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'28px 30px' }}>
          {/* Stimulus animation: two iris viewers, one is flashed at a time */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'center', marginBottom:24 }}>
            {['OD', 'OS'].map(eye => {
              const flash = running && activeEye === eye ? 100 : 0;
              const pupil = running && activeEye === eye ? 3.4 : 5.4;
              return (
                <div key={eye} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#374151', letterSpacing:'0.04em' }}>
                    {eye} — {eye === 'OD' ? 'Right' : 'Left'} eye
                  </div>
                  <PUP_IrisViewer pupilMm={pupil} size={200} accent={accent} flashPct={flash} animate={!running}/>
                  {running && (
                    <div style={{ fontSize:11, fontWeight:700, color: activeEye === eye ? accent : '#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {activeEye === eye ? 'Stimulated' : 'Resting'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding:'12px 14px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, marginBottom:20, display:'flex', alignItems:'flex-start', gap:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <div style={{ fontSize:12, fontWeight:500, color:'#92400e', lineHeight:1.55 }}>
              Watch for the <strong>affected eye to dilate</strong> when the light moves to it — that's the positive RAPD finding. Grade the response per eye below.
            </div>
          </div>

          {/* Grade selectors */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {['OD', 'OS'].map(eye => (
              <div key={eye}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                  RAPD grade — {eye}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6 }}>
                  {PUP_RAPD_GRADES.map(g => {
                    const selected = rapdGrades[eye] === g.id;
                    const sevColor = g.severity === 'normal' ? '#10b981' : g.severity === 'mild' ? '#d97706' : '#dc2626';
                    return (
                      <button
                        key={g.id}
                        onClick={() => setRapdGrades(prev => ({ ...prev, [eye]: g.id }))}
                        title={g.desc}
                        style={{
                          minHeight:54, padding:'8px 6px', borderRadius:9,
                          border:`2px solid ${selected ? sevColor : '#e5e7eb'}`,
                          background: selected ? `${sevColor}10` : '#fff',
                          color: selected ? sevColor : '#374151',
                          fontSize:13, fontWeight:700, cursor:'pointer',
                          fontFamily:"'Nunito Sans', sans-serif",
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
                        }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{g.short}</div>
                        <div style={{ fontSize:9, fontWeight:500, color: selected ? sevColor : '#9ca3af', lineHeight:1.1 }}>
                          {g.id === 'none' ? 'No defect' : g.id === 'trace' ? 'Subtle' : 'Definite'}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {rapdGrades[eye] !== 'none' && (
                  <div style={{ marginTop:8, fontSize:11, fontWeight:500, color:'#6b7280', lineHeight:1.5 }}>
                    {PUP_RAPD_GRADES.find(g => g.id === rapdGrades[eye])?.desc}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24 }}>
            <button
              onClick={() => { setRunning(false); onFinish(); }}
              style={{
                minHeight:48, padding:'12px 24px', borderRadius:10,
                border:'none', background:accent, color:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer',
                fontFamily:"'Nunito Sans', sans-serif",
                boxShadow:`0 3px 12px ${accent}40`,
              }}>
              Finish &amp; report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


Object.assign(window, { PupillometryTest });
