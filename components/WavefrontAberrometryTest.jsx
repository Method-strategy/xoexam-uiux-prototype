
// WavefrontAberrometryTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Extracted from RemainingTests.jsx and rebuilt against the v2 clinical spec
// (briefs/WavefrontAberrometry_Clinical_Spec_v2.md).
//
// Conforms to the xoExam Component Interface Contract:
//   - props: { onBack, tweaks }
//   - wraps every phase in <ExamShell>
//   - three phases (ready / testing / report) — cancel UX owned by ExamShell
//   - bilateral capture sequence: OD → OS (universal medical convention)
//   - sentence-case labels · no gradients · navy + accent palette only
//   - exports: Object.assign(window, { WavefrontAberrometryTest })


// ════════════════════════════════════════════════════════════════════════
// MOCK DATA — clinically plausible values at a 6.0 mm analysis diameter
// ════════════════════════════════════════════════════════════════════════
// rmsHOA / comaRMS / sphericalAberration are referenced to 6.0 mm because
// HOAs scale roughly as r⁴ — published normal-population thresholds assume
// a 6 mm aperture (NIDEK OPD-Scan, Alcon WaveLight, iDesign all default
// HOA reporting to 6 mm). The 4.5 mm value carried in the original mock
// was clinically inconsistent with the "<0.3 μm normal" reference range.
const WFA_EYE_DATA = {
  OD: { sphere:-1.25, cylinder:-0.50, axis:165, pupilDiameter:6.2, analysisDiameter:6.0, measurements:3, sphericalAberration:0.087, rmsHOA:0.261, comaRMS:0.163 },
  OS: { sphere:-1.50, cylinder:-0.75, axis:170, pupilDiameter:6.3, analysisDiameter:6.0, measurements:3, sphericalAberration:0.092, rmsHOA:0.284, comaRMS:0.187 },
};

// Standard false-color wavefront convention — blue (negative deviation) →
// green (zero) → yellow → red → pink (positive deviation). Used across
// NIDEK / Alcon / iDesign clinical aberrometers — do not alter.
function WFA_getWFColor(v) {
  if (v >= 50)  return 'rgb(255,41,117)';
  if (v >= 40)  return 'rgb(255,85,85)';
  if (v >= 30)  return 'rgb(255,136,85)';
  if (v >= 20)  return 'rgb(255,187,85)';
  if (v >= 10)  return 'rgb(255,238,85)';
  if (v >= 0)   return 'rgb(204,255,85)';
  if (v >= -20) return 'rgb(57,255,85)';
  if (v >= -40) return 'rgb(85,255,204)';
  if (v >= -60) return 'rgb(85,204,255)';
  return            'rgb(85,136,255)';
}

function WFA_makeGrid() {
  return Array.from({ length:17 }, (_, r) =>
    Array.from({ length:17 }, (_, c) => {
      const d = Math.sqrt((r-8)**2 + (c-8)**2);
      if (d > 8) return null;
      return Math.round((Math.random()*60) - 30);
    })
  );
}

// Build per-eye wavefront grids once per session so the user sees the same
// pattern across multiple report-view interactions (re-randomising on every
// render would feel like the data is "shifting").
const WFA_GRIDS = { OD: WFA_makeGrid(), OS: WFA_makeGrid() };

// Clinical interpretation thresholds — applied per-eye, then the worst
// eye drives the overall interpretation banner. Bands follow Applegate /
// Marsack literature for 6 mm pupil HOA RMS.
function WFA_getInterp(data) {
  if (!data) return null;
  if (data.rmsHOA < 0.15) return { band:'normal', tint:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', text:'Excellent optical quality. Higher-order aberrations within optimal range.' };
  if (data.rmsHOA < 0.30) return { band:'normal', tint:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', text:'Good optical quality. Higher-order aberrations within normal limits.' };
  if (data.rmsHOA < 0.45) return { band:'mild',   tint:'#d97706', bg:'#fffbeb', border:'#fde68a', text:'Mildly elevated higher-order aberrations. Consider impact on visual quality and refractive surgery candidacy.' };
  return                       { band:'high',   tint:'#dc2626', bg:'#fef2f2', border:'#fecaca', text:'Significantly elevated higher-order aberrations. Detailed corneal assessment recommended. Refractive surgery candidacy requires further evaluation.' };
}

function WFA_bandOrder(b) { return ({ normal:0, mild:1, high:2 })[b] ?? 0; }

// Display constants — keep section-header styling consistent with other tests.
const WFA_REPORT_LABEL = { fontSize:13, fontWeight:700, color:'#111827', textTransform:'none', letterSpacing:0 };


// ════════════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES — eye picker, breadcrumb, transition modal
// ════════════════════════════════════════════════════════════════════════
// Eye-sequence affordances mirror Color Vision v0.1.7 and Visual Fields
// v0.1.8 so the bilateral test pattern is consistent across tests.

const WFA_EYE_LABELS = { OD:'OD · Right eye', OS:'OS · Left eye', OU:'OU · Both eyes' };
const WFA_EYE_SHORT  = { OD:'OD', OS:'OS', OU:'OU' };
const WFA_EYE_NAMED  = { OD:'Right eye (OD)', OS:'Left eye (OS)' };

// Three-pill segmented control for eye selection on the ready phase.
function WFA_InlineEyePicker({ value, onChange, accent }) {
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
              padding:'28px 16px',
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
            <div style={{ display:'flex', justifyContent:'center', gap:4, marginBottom:12 }}>
              {(isBoth ? [1, 2] : [1]).map(i => (
                <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isSelected ? accent : '#6b7280'} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"/>
                  <circle cx="12" cy="12" r="4" fill={isSelected ? accent : '#6b7280'} stroke="none"/>
                </svg>
              ))}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color: isSelected ? accent : '#374151' }}>
              {eye === 'OD' ? 'Right eye only' : eye === 'OS' ? 'Left eye only' : 'Both eyes'}
            </div>
            <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:4 }}>{eye}</div>
          </button>
        );
      })}
    </div>
  );
}

// Breadcrumb shown during bilateral captures so the doctor sees progress.
// done ✓ (green) · current (accent ring) · pending (gray)
function WFA_EyeBreadcrumb({ sequence, currentEye, completedSet, accent }) {
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

// Full-screen modal between OD-complete and OS-init. Patient-positioning
// copy + breadcrumb so the technician confirms physical repositioning
// before the second capture begins.
function WFA_TransitionPrompt({ sequence, currentEye, completedSet, onContinue, accent }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'34px 36px 28px', maxWidth:500, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <WFA_EyeBreadcrumb sequence={sequence} currentEye={currentEye} completedSet={completedSet} accent={accent}/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 10px', textAlign:'center' }}>
          Continue to {currentEye === 'OS' ? 'left' : 'right'} eye ({currentEye})
        </h3>
        <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:'0 0 22px', lineHeight:1.55, textAlign:'center' }}>
          Reposition the patient so the {currentEye === 'OS' ? 'left' : 'right'} eye is aligned with the eyepiece.
          The system will recalibrate and recapture wavefront measurements.
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
// VISUALIZATION PRIMITIVES — preserved from the original AberrometerTest
// ════════════════════════════════════════════════════════════════════════

function WFA_CircularProgress({ pct, label, accent, size=280 }) {
  const r = 48, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)} style={{ transition:'stroke-dashoffset 0.3s' }}/>
      </svg>
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ width:size*0.65, height:size*0.65, borderRadius:'50%', overflow:'hidden', background:'#000', border:`2px solid ${accent}30` }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={48} fill="#1a0f0a"/>
            <ellipse cx={50} cy={50} rx={35} ry={32} fill="none" stroke={`${accent}60`} strokeWidth={1}/>
            {Array.from({ length:8 }).map((_, i) => {
              const a = i * 45 * Math.PI / 180;
              return <line key={i} x1={50 + Math.cos(a)*10} y1={50 + Math.sin(a)*10} x2={50 + Math.cos(a)*30} y2={50 + Math.sin(a)*30} stroke={`${accent}40`} strokeWidth={0.8}/>;
            })}
            <circle cx={50} cy={50} r={12} fill="#050505"/>
            <circle cx={44} cy={44} r={3} fill="rgba(255,255,255,0.4)"/>
            <line x1={50} y1={20} x2={50} y2={80} stroke={`${accent}80`} strokeWidth={0.8}/>
            <line x1={20} y1={50} x2={80} y2={50} stroke={`${accent}80`} strokeWidth={0.8}/>
          </svg>
        </div>
        <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginTop:8 }}>{label}</div>
        <div style={{ fontSize:18, fontWeight:700, color:'#111827', marginTop:2, fontVariantNumeric:'tabular-nums' }}>{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

function WFA_CentroidImage({ size=200 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#f3f4f6', overflow:'hidden' }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {Array.from({ length:12 }).map((_, r) => Array.from({ length:12 }).map((_, c) => {
          const x = 20 + c*14, y = 20 + r*14;
          const d = Math.sqrt((x-110)**2 + (y-110)**2);
          if (d > 92) return null;
          const dx = (Math.random()-0.5)*10, dy = (Math.random()-0.5)*10;
          return (
            <g key={`${r}-${c}`}>
              <circle cx={x} cy={y} r={1.5} fill="#4ade80" opacity={0.9}/>
              <line x1={x} y1={y} x2={x+dx} y2={y+dy} stroke="#111827" strokeWidth={0.5} opacity={0.7}/>
            </g>
          );
        }))}
      </svg>
    </div>
  );
}

function WFA_WavefrontGrid({ grid, size=200 }) {
  if (!grid) return null;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
      <svg width={size} height={size} viewBox="0 0 170 170">
        {grid.map((row, r) => row.map((val, c) => {
          if (val === null) return null;
          return <rect key={`${r}-${c}`} x={c*10} y={r*10} width={10} height={10} fill={WFA_getWFColor(val)} opacity={0.9}/>;
        }))}
      </svg>
    </div>
  );
}

// Horizontal gradient legend below the wavefront map. Required clinical
// display element — without it the false-color map cannot be interpreted.
function WFA_ColorScaleLegend({ width=240 }) {
  const stops = [
    'rgb(85,136,255)',    // -60
    'rgb(85,204,255)',
    'rgb(57,255,85)',
    'rgb(204,255,85)',
    'rgb(255,238,85)',
    'rgb(255,187,85)',
    'rgb(255,136,85)',
    'rgb(255,85,85)',
    'rgb(255,41,117)'     // +60
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, marginTop:6 }}>
      <div style={{
        width, height:10, borderRadius:5,
        background: `linear-gradient(to right, ${stops.join(', ')})`,
        border:'1px solid #e5e7eb'
      }}/>
      <div style={{ display:'flex', justifyContent:'space-between', width, fontSize:10, fontWeight:600, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>
        <span>−60 μm</span><span>0</span><span>+60 μm</span>
      </div>
    </div>
  );
}

// Navy-headered measurement table (replaces the teal #0d9488 violation).
function WFA_MeasTable({ eyeKeys }) {
  const navy = '#0e2f5e';
  const rows = [
    ['Sphere',                eyeKeys.map(k => `${WFA_EYE_DATA[k].sphere.toFixed(2)} D`)],
    ['Cylinder',              eyeKeys.map(k => `${WFA_EYE_DATA[k].cylinder.toFixed(2)} D`)],
    ['Axis',                  eyeKeys.map(k => `${WFA_EYE_DATA[k].axis}°`)],
    ['Pupil diameter',        eyeKeys.map(k => `${WFA_EYE_DATA[k].pupilDiameter.toFixed(1)} mm`)],
    ['Analysis diameter',     eyeKeys.map(k => `${WFA_EYE_DATA[k].analysisDiameter.toFixed(1)} mm`)],
    ['Measurements averaged', eyeKeys.map(k => `${WFA_EYE_DATA[k].measurements}`)],
    ['Spherical aberration',  eyeKeys.map(k => `${WFA_EYE_DATA[k].sphericalAberration.toFixed(3)} μm`)],
    ['Total HOA RMS',         eyeKeys.map(k => `${WFA_EYE_DATA[k].rmsHOA.toFixed(3)} μm`)],
    ['Coma RMS',              eyeKeys.map(k => `${WFA_EYE_DATA[k].comaRMS.toFixed(3)} μm`)],
  ];
  return (
    <div style={{ border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr>
            <th style={{ background:navy, color:'#fff', padding:'10px 14px', textAlign:'left', fontWeight:700, fontSize:11, letterSpacing:'0.02em' }}>Measurement</th>
            {eyeKeys.map(k => (
              <th key={k} style={{ background:navy, color:'#fff', padding:'10px 14px', textAlign:'center', fontWeight:700, fontSize:11, letterSpacing:'0.02em' }}>
                {k === 'OS' ? 'Left eye (OS)' : 'Right eye (OD)'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, vals], i) => (
            <tr key={label} style={{ borderTop:'1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding:'10px 14px', fontWeight:600, color:'#374151' }}>{label}</td>
              {vals.map((v, j) => (
                <td key={j} style={{ padding:'10px 14px', textAlign:'center', color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════

function WavefrontAberrometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── State ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = React.useState('ready');         // ready · testing · report
  const [selectedEye, setSelectedEye] = React.useState('OD'); // OD · OS · OU (default OD per medical convention)
  const [testingEye,  setTestingEye]  = React.useState('OD'); // current capture eye
  const [completedEyes, setCompletedEyes] = React.useState(new Set());
  const [stage,    setStage]    = React.useState('init');    // init · calibrating · capturing · complete
  const [progress, setProgress] = React.useState(0);
  const [elapsed,  setElapsed]  = React.useState(0);
  const [totalElapsed, setTotalElapsed] = React.useState(0); // accumulated for report
  const [showTransition, setShowTransition] = React.useState(false);
  const [notes, setNotes] = React.useState('');

  // Report controls
  const [resultView, setResultView] = React.useState('full-wavefront');
  const [resultEye,  setResultEye]  = React.useState('both');
  const [zernikeMode, setZernikeMode] = React.useState(false);

  // Pre-capture collapsibles
  const [expandAlign, setExpandAlign] = React.useState(false);
  const [expandPupil, setExpandPupil] = React.useState(false);
  const [expandFocus, setExpandFocus] = React.useState(false);

  // Eye sequence derived from selectedEye. OU runs OD → OS.
  const eyeSequence = selectedEye === 'OU' ? ['OD', 'OS'] : [selectedEye];
  const eyeKeys     = eyeSequence;

  // Timer + progress refs
  const timerRef    = React.useRef(null);
  const progressRef = React.useRef(null);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Capture animation effect ──────────────────────────────────────────
  React.useEffect(() => {
    if (stage === 'calibrating' || stage === 'capturing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      progressRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (stage === 'calibrating' ? 5 : 3);
          if (next >= 100) { clearInterval(progressRef.current); return 100; }
          return next;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
      clearInterval(progressRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(progressRef.current); };
  }, [stage]);

  React.useEffect(() => {
    if (progress >= 100 && stage === 'calibrating') {
      const t = setTimeout(() => { setStage('capturing'); setProgress(0); }, 500);
      return () => clearTimeout(t);
    } else if (progress >= 100 && stage === 'capturing') {
      const t = setTimeout(() => setStage('complete'), 500);
      return () => clearTimeout(t);
    }
  }, [progress, stage]);

  // ── Phase transitions ─────────────────────────────────────────────────
  const beginTest = () => {
    setTestingEye(eyeSequence[0]);
    setCompletedEyes(new Set());
    setStage('init');
    setProgress(0);
    setElapsed(0);
    setTotalElapsed(0);
    setPhase('testing');
  };

  const startCapture = () => {
    setStage('calibrating');
    setProgress(0);
    setElapsed(0);
  };

  // Finish & Report (ExamShell onFinish). At stage='complete':
  //   - if OU and we just finished OD → show transition modal → continue to OS
  //   - otherwise → go to report
  const handleFinish = () => {
    if (stage !== 'complete') return;
    const next = new Set(completedEyes); next.add(testingEye);
    setCompletedEyes(next);
    setTotalElapsed(t => t + elapsed);

    const nextIdx = eyeSequence.indexOf(testingEye) + 1;
    if (nextIdx < eyeSequence.length) {
      // Move on to the next eye via transition modal.
      setTestingEye(eyeSequence[nextIdx]);
      setShowTransition(true);
    } else {
      setPhase('report');
    }
  };

  const continueAfterTransition = () => {
    setShowTransition(false);
    setStage('init');
    setProgress(0);
    setElapsed(0);
  };

  const resetForNewTest = () => {
    setPhase('ready');
    setSelectedEye('OD');
    setTestingEye('OD');
    setCompletedEyes(new Set());
    setStage('init');
    setProgress(0);
    setElapsed(0);
    setTotalElapsed(0);
    setNotes('');
    setResultView('full-wavefront');
    setResultEye('both');
    setZernikeMode(false);
  };

  // ── Sub-components defined inside main so they close over `accent` ────
  const Collapsible = ({ label, status, open, onToggle, children }) => (
    <div style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', overflow:'hidden', marginBottom:10 }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', cursor:'pointer' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#10b981' }}>{status}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      {open && <div style={{ padding:'0 16px 16px', borderTop:'1px solid #e5e7eb' }}>{children}</div>}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f3f4f6', fontSize:12 }}>
      <span style={{ color:'#6b7280', fontWeight:400 }}>{label}</span>
      <span style={{ color:'#111827', fontWeight:700 }}>{value}</span>
    </div>
  );


  // ── RENDER: READY ─────────────────────────────────────────────────────
  const renderReady = () => (
    <div style={{ padding:'40px 24px', display:'flex', justifyContent:'center', minHeight:'100%' }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:48, maxWidth:640, width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" fill={accent}/>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:0 }}>Select eye(s) for testing</h2>
            <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'2px 0 0' }}>Wavefront aberrometry measures the full optical aberration of each eye.</p>
          </div>
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'22px 0 26px' }}/>

        <WFA_InlineEyePicker value={selectedEye} onChange={setSelectedEye} accent={accent}/>

        <div style={{ marginTop:24, padding:'14px 16px', background:`${accent}08`, border:`1px solid ${accent}25`, borderRadius:10, display:'flex', alignItems:'flex-start', gap:10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <div style={{ fontSize:12, fontWeight:400, color:'#374151', lineHeight:1.55 }}>
            Patient remains still and focused on the central fixation target throughout each capture.
            The system averages {WFA_EYE_DATA.OD.measurements} measurements per eye at a {WFA_EYE_DATA.OD.analysisDiameter.toFixed(1)} mm analysis diameter.
            {selectedEye === 'OU' && <> Bilateral captures run <strong>OD then OS</strong>.</>}
          </div>
        </div>
      </div>
    </div>
  );


  // ── RENDER: TESTING ───────────────────────────────────────────────────
  const eyeName = WFA_EYE_NAMED[testingEye];

  const renderTesting = () => (
    <div style={{ padding:24, minHeight:'100%' }}>
      <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Sub-bar: eye-name + breadcrumb */}
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: stage==='complete' ? '#10b981' : accent, boxShadow: stage==='complete' ? 'none' : `0 0 0 4px ${accent}25` }}/>
            <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{eyeName}</span>
            <span style={{ fontSize:11, fontWeight:400, color:'#9ca3af' }}>·</span>
            <span style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'capitalize' }}>
              {stage === 'init' ? 'Pre-capture readiness' : stage === 'calibrating' ? 'Calibrating' : stage === 'capturing' ? 'Capturing' : 'Capture complete'}
            </span>
          </div>
          <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
            <WFA_EyeBreadcrumb sequence={eyeSequence} currentEye={testingEye} completedSet={completedEyes} accent={accent}/>
          </div>
        </div>

        {/* Main capture card */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:28 }}>
          {stage === 'init' && (
            <div style={{ maxWidth:520, margin:'0 auto' }}>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', color:accent }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>
                  </svg>
                </div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>
                  Position {testingEye === 'OS' ? 'left' : 'right'} eye
                </h2>
                <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', lineHeight:1.55, margin:0 }}>
                  Align the patient's {testingEye === 'OS' ? 'left' : 'right'} eye with the aberrometer.
                  The system will automatically calibrate and capture {WFA_EYE_DATA[testingEye].measurements} wavefront measurements.
                </p>
              </div>

              <Collapsible label="Patient alignment" status="Ready" open={expandAlign} onToggle={() => setExpandAlign(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <Row label="X-axis position"  value="0.2 mm (within range)"/>
                  <Row label="Y-axis position"  value="−0.1 mm (within range)"/>
                  <Row label="Z-axis position"  value="0.0 mm (optimal)"/>
                  <Row label="Head tilt"        value="1.2° (acceptable)"/>
                  <Row label="Corneal vertex"   value="Aligned"/>
                </div>
              </Collapsible>
              <Collapsible label="Pupil detection" status="Detected" open={expandPupil} onToggle={() => setExpandPupil(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <Row label="Pupil diameter"     value={`${WFA_EYE_DATA[testingEye].pupilDiameter.toFixed(1)} mm`}/>
                  <Row label="Detection quality"  value="Excellent (98%)"/>
                  <Row label="Pupil center X"     value="0.1 mm"/>
                  <Row label="Pupil center Y"     value="−0.2 mm"/>
                  <Row label="Edge clarity"       value="Sharp"/>
                </div>
              </Collapsible>
              <Collapsible label="Focus level" status="Optimal" open={expandFocus} onToggle={() => setExpandFocus(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <Row label="Focus score"        value="96 / 100"/>
                  <Row label="Image sharpness"    value="Excellent"/>
                  <Row label="Contrast ratio"     value="12.4:1"/>
                  <Row label="Auto-focus status"  value="Locked"/>
                  <Row label="Optical path"       value="Clear"/>
                  <Row label="Analysis zone"      value={`${WFA_EYE_DATA[testingEye].analysisDiameter.toFixed(1)} mm`}/>
                </div>
              </Collapsible>

              <div style={{ textAlign:'center', marginTop:18 }}>
                <button onClick={startCapture} style={{
                  minHeight:48, padding:'12px 36px', borderRadius:10, border:'none',
                  background: accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
                  fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40`
                }}>
                  Begin capture
                </button>
              </div>
            </div>
          )}

          {(stage === 'calibrating' || stage === 'capturing') && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'20px 0' }}>
              <WFA_CircularProgress pct={progress} label={stage === 'calibrating' ? 'Calibrating…' : 'Capturing…'} accent={accent}/>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>
                {stage === 'calibrating' ? 'Calibrating system' : 'Capturing wavefront data'}
              </h2>
              <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', textAlign:'center', maxWidth:420, lineHeight:1.55, margin:0 }}>
                Remind the patient to remain still and keep their {testingEye === 'OS' ? 'left' : 'right'} eye focused on the fixation target.
              </p>
              <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', fontVariantNumeric:'tabular-nums' }}>Elapsed {fmtTime(elapsed)}</div>
            </div>
          )}

          {stage === 'complete' && (() => {
            const d = WFA_EYE_DATA[testingEye];
            const elevated = d.rmsHOA > 0.30;
            return (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, padding:'16px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0fdf4', border:'2px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>Measurement complete</h2>
                <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', textAlign:'center', margin:0, maxWidth:420, lineHeight:1.55 }}>
                  Wavefront aberrometry data captured for the {testingEye === 'OS' ? 'left' : 'right'} eye.
                  {eyeSequence.length > 1 && testingEye === eyeSequence[0] && <> Finish &amp; report to advance to the {eyeSequence[1] === 'OS' ? 'left' : 'right'} eye ({eyeSequence[1]}).</>}
                </p>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, width:'100%', maxWidth:520 }}>
                  {[
                    ['Sphere',         `${d.sphere.toFixed(2)} D`],
                    ['Cylinder',       `${d.cylinder.toFixed(2)} D`],
                    ['Axis',           `${d.axis}°`],
                    ['Total HOA RMS',  `${d.rmsHOA.toFixed(3)} μm`],
                    ['Coma RMS',       `${d.comaRMS.toFixed(3)} μm`],
                    ['Test duration',  fmtTime(elapsed)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:4, textTransform:'none' }}>{l}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {elevated && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'#fffbeb', border:'1px solid #fde68a', maxWidth:520, width:'100%' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize:12, fontWeight:600, color:'#92400e' }}>Elevated higher-order aberrations detected.</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {showTransition && (
        <WFA_TransitionPrompt
          sequence={eyeSequence}
          currentEye={testingEye}
          completedSet={completedEyes}
          onContinue={continueAfterTransition}
          accent={accent}
        />
      )}
    </div>
  );


  // ── RENDER: REPORT ────────────────────────────────────────────────────
  const renderReport = () => {
    const now = new Date();
    const resultEyeKeys = resultEye === 'both' ? eyeKeys : resultEye === 'OS' ? ['OS'] : ['OD'];
    // Filter to eyes that were actually tested in this session
    const safeResultKeys = resultEyeKeys.filter(k => eyeKeys.includes(k));
    const reportKeys = safeResultKeys.length ? safeResultKeys : eyeKeys;

    const showLegend = resultView === 'full-wavefront' || resultView === 'full-wavefront-higher';
    const showZernikeToggle = showLegend;

    const eyeReports = eyeKeys.map(k => ({ eye:k, data:WFA_EYE_DATA[k], interp:WFA_getInterp(WFA_EYE_DATA[k]) }));
    const worstInterp = eyeReports.reduce((w, r) => !w || WFA_bandOrder(r.interp.band) > WFA_bandOrder(w.band) ? r.interp : w, null);

    const eyesTested = eyeKeys.length === 2 ? 'OU (both eyes)' : eyeKeys[0] === 'OS' ? 'OS (left eye)' : 'OD (right eye)';

    return (
      <div style={{ padding:'20px 24px', minHeight:'100%' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Patient classification banner */}
          {worstInterp && (
            <div style={{ background:worstInterp.bg, border:`1.5px solid ${worstInterp.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:'#fff', border:`2px solid ${worstInterp.tint}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={worstInterp.tint} strokeWidth="2.5" strokeLinecap="round">
                  {worstInterp.band === 'normal' ? <path d="M20 6L9 17l-5-5"/> : <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
                </svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:worstInterp.tint, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Clinical interpretation</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.4 }}>{worstInterp.text}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {eyeReports.map(r => (
                  <div key={r.eye} style={{
                    padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${r.interp.tint}40`,
                    fontSize:11, fontWeight:700, color:r.interp.tint, fontVariantNumeric:'tabular-nums', textAlign:'center'
                  }}>
                    <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>{r.eye}</div>
                    <div>{r.data.rmsHOA.toFixed(3)} μm</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient information card */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...WFA_REPORT_LABEL, marginBottom:14 }}>Patient information</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14 }}>
              {[
                ['Patient name',          'Marcus Williams'],
                ['Birthdate',             '10/11/1983'],
                ['Patient ID',            'azx7895'],
                ['Eye(s) tested',         eyesTested],
                ['Exam type',             'Wavefront aberrometry'],
                ['Exam date',             now.toLocaleDateString('en-US')],
                ['Start time',            now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })],
                ['Test duration',         fmtTime(totalElapsed || elapsed)],
                ['Analysis diameter',     `${WFA_EYE_DATA.OD.analysisDiameter.toFixed(1)} mm`],
                ['Measurements averaged', `${WFA_EYE_DATA.OD.measurements} per eye`],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Wavefront analysis results card */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, flexWrap:'wrap' }}>
              <div style={WFA_REPORT_LABEL}>Wavefront analysis results</div>
              <div style={{ flex:1 }}/>
              {/* Eye tabs */}
              {eyeKeys.length > 1 && (
                <div style={{ display:'flex', background:'#f3f4f6', borderRadius:8, padding:3, gap:2 }}>
                  {[['OD','Right eye'], ['OS','Left eye'], ['both','Both eyes']].map(([val, label]) => (
                    <button key={val} onClick={() => setResultEye(val)} style={{
                      padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer',
                      background: resultEye === val ? '#fff' : 'transparent',
                      color:      resultEye === val ? '#111827' : '#6b7280',
                      fontSize:11, fontWeight:700,
                      boxShadow:  resultEye === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View-type segmented control + Zernike mode */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, flexWrap:'wrap' }}>
              <div style={{ display:'flex', background:'#f3f4f6', borderRadius:8, padding:3, gap:2 }}>
                {[
                  ['pupil-image',            'Pupil image'],
                  ['centroid-image',         'Centroid image'],
                  ['full-wavefront',         'Full wavefront'],
                  ['full-wavefront-higher',  'Higher orders only'],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setResultView(val)} style={{
                    padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer',
                    background: resultView === val ? '#fff' : 'transparent',
                    color:      resultView === val ? '#111827' : '#6b7280',
                    fontSize:11, fontWeight:700,
                    boxShadow:  resultView === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {showZernikeToggle && (
                <button onClick={() => setZernikeMode(v => !v)} style={{
                  padding:'7px 14px', borderRadius:8,
                  border:`1.5px solid ${zernikeMode ? accent : '#e5e7eb'}`,
                  background: zernikeMode ? accent : '#fff',
                  color:      zernikeMode ? '#fff' : '#374151',
                  fontSize:11, fontWeight:700, cursor:'pointer',
                  fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  Zernike mode
                </button>
              )}
            </div>

            {/* Image display */}
            <div style={{ display:'flex', gap:32, justifyContent:reportKeys.length === 1 ? 'flex-start' : 'center', flexWrap:'wrap', marginBottom:18 }}>
              {reportKeys.map(k => (
                <div key={k} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.04em' }}>
                    {k === 'OS' ? 'Left eye (OS)' : 'Right eye (OD)'}
                  </div>
                  {resultView === 'pupil-image' && (
                    <div style={{ width:reportKeys.length === 2 ? 200 : 280, height:reportKeys.length === 2 ? 200 : 280, borderRadius:'50%', background:'#1a0f0a', border:`2px solid ${accent}40` }}>
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <circle cx={50} cy={50} r={48} fill="#1a0f0a"/>
                        <ellipse cx={50} cy={50} rx={32} ry={30} fill="#3d2b1f"/>
                        {Array.from({ length:12 }).map((_, i) => {
                          const a = i*30*Math.PI/180;
                          return <line key={i} x1={50+Math.cos(a)*14} y1={50+Math.sin(a)*14} x2={50+Math.cos(a)*28} y2={50+Math.sin(a)*28} stroke="#5a3a20" strokeWidth={0.8}/>;
                        })}
                        <circle cx={50} cy={50} r={12} fill="#050505"/>
                        <circle cx={44} cy={44} r={3} fill="rgba(255,255,255,0.5)"/>
                      </svg>
                    </div>
                  )}

                  {resultView === 'centroid-image' && (
                    <WFA_CentroidImage size={reportKeys.length === 2 ? 200 : 280}/>
                  )}

                  {(resultView === 'full-wavefront' || resultView === 'full-wavefront-higher') && (
                    zernikeMode ? (
                      <div style={{
                        width: reportKeys.length === 2 ? 200 : 280,
                        height: reportKeys.length === 2 ? 200 : 280,
                        borderRadius:'50%', background:'#f9fafb', border:'1px solid #e5e7eb',
                        display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4
                      }}>
                        <div style={{ fontSize:32, fontWeight:700, color:accent, lineHeight:1 }}>
                          Z<sub style={{ fontSize:'0.55em' }}>4</sub><sup style={{ fontSize:'0.55em' }}>0</sup>
                        </div>
                        <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>Spherical aberration</div>
                        <div style={{ fontSize:18, fontWeight:700, color:'#111827', marginTop:4, fontVariantNumeric:'tabular-nums' }}>
                          {WFA_EYE_DATA[k].sphericalAberration.toFixed(3)} μm
                        </div>
                        <div style={{ marginTop:8, display:'flex', gap:14, fontSize:10, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>
                          <div>HOA RMS <strong style={{ color:'#111827' }}>{WFA_EYE_DATA[k].rmsHOA.toFixed(3)}</strong></div>
                          <div>Coma <strong style={{ color:'#111827' }}>{WFA_EYE_DATA[k].comaRMS.toFixed(3)}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <WFA_WavefrontGrid grid={WFA_GRIDS[k]} size={reportKeys.length === 2 ? 200 : 280}/>
                      </>
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Color scale legend */}
            {showLegend && !zernikeMode && (
              <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                <WFA_ColorScaleLegend width={280}/>
              </div>
            )}

            {/* Measurement table */}
            <WFA_MeasTable eyeKeys={eyeKeys}/>
          </div>

          {/* Clinical interpretation + Session notes side-by-side */}
          <div style={{ display:'grid', gridTemplateColumns: eyeKeys.length === 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap:14 }}>
            {/* Per-eye clinical interpretation */}
            {eyeReports.map(r => (
              <div key={r.eye} style={{
                background:r.interp.bg, border:`1.5px solid ${r.interp.border}`, borderRadius:14, padding:'16px 18px'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:r.interp.tint }}/>
                  <div style={{ fontSize:11, fontWeight:700, color:r.interp.tint, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {r.eye === 'OS' ? 'Left eye (OS)' : 'Right eye (OD)'}
                  </div>
                  <div style={{ flex:1 }}/>
                  <div style={{ fontSize:11, fontWeight:700, color:r.interp.tint, fontVariantNumeric:'tabular-nums' }}>
                    HOA RMS {r.data.rmsHOA.toFixed(3)} μm
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:'#111827', lineHeight:1.5 }}>{r.interp.text}</div>
              </div>
            ))}
          </div>

          {/* Session notes */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...WFA_REPORT_LABEL, marginBottom:10 }}>Session notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Patient reported difficulty maintaining fixation during the second OS capture; data quality remains acceptable."
              style={{
                width:'100%', minHeight:90, padding:'10px 12px',
                border:'1px solid #e5e7eb', borderRadius:10,
                fontSize:13, fontWeight:400, color:'#374151',
                fontFamily:"'Nunito Sans', sans-serif", resize:'vertical', outline:'none',
                boxSizing:'border-box'
              }}
            />
          </div>

          {/* Actions row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:24, flexWrap:'wrap' }}>
            <button style={{
              padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`,
              color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif"
            }}>
              Export report
            </button>
            <button style={{
              padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`,
              color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif"
            }}>
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
              <button onClick={onBack} style={{
                padding:'12px 28px', borderRadius:10, border:'none', background:accent,
                color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
                fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40`
              }}>
                Certify &amp; close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ── EXAM SHELL ────────────────────────────────────────────────────────
  return (
    <ExamShell
      title="Wavefront Aberrometry"
      accent={accent}
      onBack={onBack}
      patientName="Marcus Williams"
      patientId="#4821"
      phase={phase}
      elapsed={phase === 'testing' ? elapsed : undefined}
      onBegin={phase === 'ready' ? beginTest : null}
      onFinish={phase === 'testing' && stage === 'complete' ? handleFinish : null}
      onNewTest={phase === 'report' ? resetForNewTest : null}
    >
      {phase === 'ready'   && renderReady()}
      {phase === 'testing' && renderTesting()}
      {phase === 'report'  && renderReport()}
    </ExamShell>
  );
}


Object.assign(window, { WavefrontAberrometryTest });
