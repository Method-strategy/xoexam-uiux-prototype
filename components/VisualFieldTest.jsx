// VisualFieldTest.jsx — v0.1.8 Clinical accuracy + ExamShell integration
// Method Marketing Agency · xoExam UI/UX · May 18, 2026
// xoExam clinical tablet UI — 1280×800 base canvas
//
// Architecture:
//   ExamShell phase: ready / testing / report
//   Internal vfStep (under ready): eye-selection → config → pattern → foveal
//   Eye-sequence:
//     Monocular patterns (10-1, 10-2, 24-1, 24-2, 30-2, Screening, Goldmann):
//       Single eye → one run · Both eyes → OD then OS (two runs, transition modal between)
//     Binocular patterns (Esterman, mEsterman, FDP, cFDP):
//       Always OU — no eye sequence, eye-selection sub-step skipped
//
// Cancel UX owned by ExamShell. Component MUST NOT build its own.
// All top-level identifiers prefixed VF_.

// ────────────────────────────────────────────────────────────────
// CONSTANTS — patterns, reference values, mock data
// ────────────────────────────────────────────────────────────────

const VF_MONOCULAR_PATTERNS = [
  { id:'10-1',  name:'10-1',               desc:'Macular assessment · 10° radius',     points: 68, kind:'monocular' },
  { id:'10-2',  name:'10-2',               desc:'Central field · 10° radius',          points: 68, kind:'monocular' },
  { id:'24-1',  name:'24-1',               desc:'Standard field · 24° off-axis',       points: 54, kind:'monocular' },
  { id:'24-2',  name:'24-2',               desc:'Standard glaucoma protocol · 24°',    points: 54, kind:'monocular' },
  { id:'30-2',  name:'30-2',               desc:'Extended field · 30° radius',         points: 76, kind:'monocular' },
  { id:'screen',name:'Screening / Rapid',  desc:'Suprathreshold gross field',           points: 40, kind:'monocular' },
  { id:'gold',  name:'Goldmann / Kinetic', desc:'Isopter mapping · advanced loss',      points: 60, kind:'monocular' },
];

const VF_BINOCULAR_PATTERNS = [
  { id:'ester', name:'Functional Esterman',         desc:'DVLA / DMV driving fitness',     points: 120, kind:'binocular' },
  { id:'mest',  name:'Modified Esterman (Central)', desc:'Central binocular field',        points: 80,  kind:'binocular' },
  { id:'fdp',   name:'FDP — Frequency Doubling',    desc:'Early glaucoma detection',       points: 54,  kind:'binocular' },
  { id:'cfdp',  name:'Combined FDP Mode',           desc:'FDP + standard perimetry',       points: 90,  kind:'binocular' },
];

// Age-banded reference MD (dB) — based on published HFA normative data
const VF_REFERENCE_MD_BY_AGE = [
  { band:'20–30', md:'-0.3 dB' },
  { band:'30–40', md:'-0.5 dB' },
  { band:'40–50', md:'-0.7 dB' },
  { band:'50–60', md:'-1.0 dB' },
  { band:'60–70', md:'-1.5 dB' },
  { band:'70–80', md:'-2.4 dB' },
  { band:'80+',   md:'-3.6 dB' },
];

// Reliability bands · Standard preset. Strict preset tightens these.
const VF_RELIABILITY_BANDS = {
  standard: {
    fp: { green: 8,  amber: 15, label:'False Positives' },
    fn: { green: 15, amber: 33, label:'False Negatives' },
    fl: { green: 10, amber: 20, label:'Fixation Losses' },
  },
  strict: {
    fp: { green: 5,  amber: 10, label:'False Positives' },
    fn: { green: 10, amber: 20, label:'False Negatives' },
    fl: { green: 5,  amber: 15, label:'Fixation Losses' },
  },
};

// GHT category color mapping
const VF_GHT_COLORS = {
  'Within Normal Limits':           { fg:'#047857', bg:'#dcfce7', border:'#bbf7d0' },
  'Borderline':                     { fg:'#92400e', bg:'#fef3c7', border:'#fde68a' },
  'Outside Normal Limits':          { fg:'#b91c1c', bg:'#fee2e2', border:'#fecaca' },
  'General Reduction of Sensitivity': { fg:'#9a3412', bg:'#ffedd5', border:'#fed7aa' },
  'Abnormally High Sensitivity':    { fg:'#92400e', bg:'#fef3c7', border:'#fde68a' },
};

// Mock clinical data per eye — enriched with GHT, foveal threshold, lens applied
const VF_MOCK_OD = {
  grid: [[29,31,32,33,32,31,29],[30,32,34,35,34,32,30],[28,31,33,34,33,31,28],[null,null,29,32,null,32,29],[28,30,32,33,32,30,28],[null,27,29,31,29,27,26],[null,null,26,28,28,26,25]],
  md: -4.12, psd: 5.23, vfi: 83, fp: 6, fn: 15, fl: 8,
  ght: 'Outside Normal Limits',
  fovealThreshold: 32,
};
const VF_MOCK_OS = {
  grid: [[30,32,33,34,33,32,30],[31,33,35,36,35,33,31],[29,32,34,35,34,32,29],[30,33,null,33,30,null,null],[29,31,33,34,33,31,29],[28,30,32,32,30,28,null],[27,29,30,29,27,null,null]],
  md: -3.24, psd: 4.16, vfi: 87, fp: 8, fn: 12, fl: 5,
  ght: 'Within Normal Limits',
  fovealThreshold: 33,
};
const VF_MOCK_OU_BINOCULAR = {
  // For Esterman-style binocular protocols: a 120-point binocular grid
  // (simplified for prototype — clinical Esterman is a fixed-point grid, not 7x7)
  grid: [[29,30,32,33,33,32,30],[31,33,34,35,35,34,32],[30,32,34,35,35,33,31],[31,33,35,null,35,33,31],[30,32,33,34,33,32,30],[28,30,32,33,32,30,28],[26,28,30,31,30,28,26]],
  md: -2.18, psd: 3.10, vfi: 91, fp: 4, fn: 9, fl: 6,
  ght: 'Within Normal Limits',
  fovealThreshold: 34,
  // Binocular-specific
  estermanScore: 115, // out of 120 in standard Esterman
  estermanTotal: 120,
};

// ────────────────────────────────────────────────────────────────
// CLINICAL HELPERS
// ────────────────────────────────────────────────────────────────

// Interpretation from MD + VFI bands. Used per-eye.
function VF_getInterp(md, vfi) {
  if (md > -2 && vfi >= 97) return { band:'normal',   text:'Within normal limits',     desc:'No significant field defect detected. Results within normal limits for age.', fg:'#047857', bg:'#f0fdf4', border:'#bbf7d0' };
  if (md >= -6 && vfi >= 85) return { band:'mild',     text:'Mild visual field loss',   desc:'Early field loss detected. Comparison with prior results and clinical correlation recommended.', fg:'#92400e', bg:'#fffbeb', border:'#fde68a' };
  if (md >= -12 && vfi >= 70) return { band:'moderate', text:'Moderate visual field loss',desc:'Significant field loss present. Ophthalmology referral and treatment review indicated.', fg:'#9a3412', bg:'#fff7ed', border:'#fed7aa' };
  return { band:'advanced', text:'Advanced visual field loss', desc:'Severe field loss. Urgent clinical review and management plan required.', fg:'#b91c1c', bg:'#fef2f2', border:'#fecaca' };
}

// Patient classification: worst eye drives bottom-line, with GHT override.
// If either monocular eye returned GHT = Outside Normal Limits, force at
// least 'mild' even when MD is within normal limits — this is the standard
// clinical reading rule for early glaucoma detection.
function VF_classifyOverall(eyeReports) {
  if (!eyeReports.length) return null;
  let worst = eyeReports[0].interp;
  for (const r of eyeReports) {
    if (VF_bandOrder(r.interp.band) > VF_bandOrder(worst.band)) worst = r.interp;
  }
  const onlGht = eyeReports.some(r => r.data.ght === 'Outside Normal Limits');
  const reducedGht = eyeReports.some(r => r.data.ght === 'General Reduction of Sensitivity');
  if ((onlGht || reducedGht) && worst.band === 'normal') {
    return { ...VF_getInterp(-3, 90), gtOverride:true };
  }
  return worst;
}
function VF_bandOrder(b) {
  return ({ normal:0, mild:1, moderate:2, advanced:3 })[b] ?? 0;
}

// Reliability band evaluator: returns { color, label, level }
function VF_reliabilityCheck(value, kind, bands) {
  const b = bands[kind];
  if (value < b.green) return { color:'#047857', level:'green', label:'Reliable' };
  if (value < b.amber) return { color:'#b45309', level:'amber', label:'Borderline' };
  return { color:'#b91c1c', level:'red', label:'Unreliable' };
}

// Derive Total Deviation grid from sensitivity grid (mock).
// Real HFA TD = patient sensitivity − age-matched normal at each point.
// For prototype, subtract a fixed normal of 32 dB and clip to 0 minimum significance.
function VF_computeTD(grid) {
  return grid.map(row => row.map(v => v === null ? null : v - 32));
}
// Pattern Deviation grid = TD with general depression removed.
// For prototype, shift TD by the median TD value.
function VF_computePD(grid) {
  const td = VF_computeTD(grid);
  const flat = td.flat().filter(v => v !== null);
  flat.sort((a,b) => a - b);
  const median = flat[Math.floor(flat.length / 2)] || 0;
  return td.map(row => row.map(v => v === null ? null : v - median));
}
// Probability symbol for a deviation value (dB).
// Mirrors HFA probability plot: '.', '<5%', '<2%', '<1%', '<0.5%'.
function VF_devSymbol(v) {
  if (v === null) return null;
  if (v >= -2) return { glyph:'·',     fill:'#9ca3af', size:3  };
  if (v >= -5) return { glyph:'·',     fill:'#6b7280', size:4  };
  if (v >= -8) return { glyph:'▪',     fill:'#374151', size:5  };
  if (v >= -12) return { glyph:'■',    fill:'#1f2937', size:7  };
  return { glyph:'■', fill:'#000', size:9 };
}

// ────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────

// Grayscale sensitivity diagram — preserved from prior version, renamed
function VF_SensGrid({ data, accent, label }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width={220} height={220} viewBox="0 0 220 220">
        <circle cx={110} cy={110} r={108} fill="#e5e7eb" stroke="#6b7280" strokeWidth={1.5}/>
        <line x1={110} y1={2} x2={110} y2={218} stroke="#9ca3af" strokeWidth={0.8}/>
        <line x1={2} y1={110} x2={218} y2={110} stroke="#9ca3af" strokeWidth={0.8}/>
        {data.grid.map((row, r) => row.map((val, c) => {
          if (val === null) return null;
          const x = 40 + c * 24, y = 40 + r * 24;
          const dist = Math.sqrt((x-110)**2 + (y-110)**2);
          if (dist > 105) return null;
          const isMissed = val < 20;
          return (
            <circle key={`${r}-${c}`} cx={x} cy={y} r={isMissed?7:4}
              fill={isMissed?'#1f2937': val>=30?'#d1d5db':val>=25?'#9ca3af':val>=20?'#6b7280':'#374151'}/>
          );
        }))}
        {/* Foveal threshold annotation at center */}
        <circle cx={110} cy={110} r={9} fill="#fff" stroke={accent} strokeWidth={1.5}/>
        <text x={110} y={113.5} textAnchor="middle" fontSize={9} fontWeight={700} fill={accent}>{data.fovealThreshold}</text>
      </svg>
      {label && <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.04em' }}>{label}</div>}
    </div>
  );
}

// Total Deviation / Pattern Deviation probability plot — small 7x7 grid
function VF_DevPlot({ grid, title }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={68} fill="#fafafa" stroke="#e5e7eb" strokeWidth={1}/>
        <line x1={70} y1={2} x2={70} y2={138} stroke="#e5e7eb" strokeWidth={0.6}/>
        <line x1={2} y1={70} x2={138} y2={70} stroke="#e5e7eb" strokeWidth={0.6}/>
        {grid.map((row, r) => row.map((val, c) => {
          const sym = VF_devSymbol(val);
          if (!sym) return null;
          const x = 26 + c * 15, y = 26 + r * 15;
          const dist = Math.sqrt((x-70)**2 + (y-70)**2);
          if (dist > 65) return null;
          if (sym.glyph === '·') return <circle key={`${r}-${c}`} cx={x} cy={y} r={sym.size/2} fill={sym.fill}/>;
          return <rect key={`${r}-${c}`} x={x-sym.size/2} y={y-sym.size/2} width={sym.size} height={sym.size} fill={sym.fill}/>;
        }))}
      </svg>
      <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.04em' }}>{title}</div>
    </div>
  );
}

// GHT category pill
function VF_GHTPill({ status }) {
  const c = VF_GHT_COLORS[status] || VF_GHT_COLORS['Borderline'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:14, background:c.bg, border:`1px solid ${c.border}`, color:c.fg, fontSize:10, fontWeight:700, letterSpacing:'0.02em' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.fg }}/>
      GHT · {status}
    </span>
  );
}

// Eye breadcrumb — done / current / pending pills
function VF_EyeBreadcrumb({ sequence, currentIndex, archive, accent }) {
  if (!sequence || sequence.length <= 1) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {sequence.map((eye, i) => {
        const done = !!archive[eye];
        const current = i === currentIndex;
        const fg = current ? accent : done ? '#047857' : '#9ca3af';
        const bg = current ? `${accent}18` : done ? '#dcfce7' : '#f3f4f6';
        const border = current ? accent : done ? '#bbf7d0' : '#e5e7eb';
        return (
          <React.Fragment key={eye}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:14, background:bg, border:`1.5px solid ${border}`, color:fg, fontSize:11, fontWeight:700 }}>
              {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
              {eye}
            </div>
            {i < sequence.length - 1 && <div style={{ width:14, height:1.5, background:'#e5e7eb' }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Inline eye picker — locks once the first response has been recorded
function VF_InlineEyePicker({ value, options, onChange, locked, accent }) {
  return (
    <div style={{ display:'flex', gap:0, border:`1.5px solid ${locked ? '#e5e7eb' : accent}`, borderRadius:9, overflow:'hidden', background:'#fff' }}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => !locked && onChange(opt)} disabled={locked && !active} style={{
            minWidth:44, minHeight:34, padding:'6px 12px', border:'none',
            background: active ? accent : '#fff',
            color: active ? '#fff' : locked ? '#9ca3af' : '#374151',
            fontSize:11, fontWeight:700, cursor: locked ? 'default' : 'pointer',
            fontFamily:"'Nunito Sans', sans-serif",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// Transition prompt between OD and OS — patient positioning instructions
function VF_TransitionPrompt({ fromEye, toEye, sequence, currentIndex, archive, onContinue, accent }) {
  const copy = toEye === 'OS'
    ? "Cover the patient's right eye with the occluder. Position the left eye at the eyepiece. The patient should fixate on the central target."
    : toEye === 'OD'
      ? "Cover the patient's left eye with the occluder. Position the right eye at the eyepiece. The patient should fixate on the central target."
      : "Remove the occluder. Patient views with both eyes open. Adjust the IPD if needed.";
  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'34px 36px 28px', maxWidth:500, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <VF_EyeBreadcrumb sequence={sequence} currentIndex={currentIndex} archive={archive} accent={accent}/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 10px', textAlign:'center' }}>
          {fromEye ? `${fromEye} complete — continue to ${toEye}` : `Begin ${toEye}`}
        </h3>
        <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:'0 0 22px', lineHeight:1.55, textAlign:'center' }}>
          {copy}
        </p>
        <button onClick={onContinue} style={{ width:'100%', minHeight:48, padding:'12px 20px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
          Start {toEye} test
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────

function VisualFieldTest({ onBack, tweaks, defaultPattern }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const reliabilityPreset = tweaks?.vfReliability === 'strict' ? 'strict' : 'standard';
  const defaultStartEye = tweaks?.vfDefaultStartEye === 'OS' ? 'OS' : 'OD';
  const reliabilityBands = VF_RELIABILITY_BANDS[reliabilityPreset];

  // ── Phase / sub-step ──
  const [phase, setPhase] = React.useState('ready');         // ExamShell phase
  const [vfStep, setVfStep] = React.useState('eye-selection'); // ready sub-step

  // ── Protocol selections ──
  // protocolEye: 'OD' | 'OS' | 'both' (monocular pattern) or 'OU' (binocular pattern)
  const [protocolEye, setProtocolEye] = React.useState(null);
  const [pattern, setPattern] = React.useState(null);
  const [showConfig, setShowConfig] = React.useState(false);

  // ── Direct-launch pre-selection ───────────────────────────────────
  // When a catalog entry routes here with a `defaultPattern` prop set
  // (e.g. the top-level "Esterman Binocular" launcher in TestSelection.jsx),
  // pre-select that pattern on mount so the doctor lands directly on the
  // foveal calibration step instead of having to walk through eye-selection
  // and pattern-selection sub-steps. Binocular patterns force protocolEye='OU'
  // per the architecture rule. Monocular launches just pre-select the
  // pattern and leave the doctor on the eye-selection step.
  React.useEffect(() => {
    if (!defaultPattern) return;
    const monoDef = VF_MONOCULAR_PATTERNS.find(p => p.id === defaultPattern);
    const binoDef = VF_BINOCULAR_PATTERNS.find(p => p.id === defaultPattern);
    const def = monoDef || binoDef;
    if (!def) return;
    setPattern(defaultPattern);
    if (def.kind === 'binocular') {
      setProtocolEye('OU');
      setVfStep('foveal');
    } else {
      // Monocular: keep at eye-selection so the doctor still picks OD/OS/both
      setVfStep('eye-selection');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [cfg, setCfg] = React.useState({
    stimulusSize:'III', strategy:'SITA-Fast',
    brightness:50, contrast:50, resultFormat:'standard'
  });

  // ── Lens controls ──
  const [lens, setLens] = React.useState({
    OD: { sph: 0.00, cyl: 0.00, axis: 0 },
    OS: { sph: 0.00, cyl: 0.00, axis: 0 },
  });

  // ── Eye-sequence runtime ──
  // sequence derived from protocolEye + pattern kind. e.g. ['OD','OS'] for both-eyes monocular.
  const patternDef = React.useMemo(
    () => [...VF_MONOCULAR_PATTERNS, ...VF_BINOCULAR_PATTERNS].find(p => p.id === pattern),
    [pattern]
  );
  const eyeSequence = React.useMemo(() => {
    if (!patternDef) return [];
    if (patternDef.kind === 'binocular') return ['OU'];
    if (protocolEye === 'both') return defaultStartEye === 'OS' ? ['OS','OD'] : ['OD','OS'];
    if (protocolEye === 'OD' || protocolEye === 'OS') return [protocolEye];
    return [];
  }, [patternDef, protocolEye, defaultStartEye]);

  const [currentEyeIndex, setCurrentEyeIndex] = React.useState(0);
  const [eyeArchive, setEyeArchive] = React.useState({ OD:null, OS:null, OU:null });
  const [showTransition, setShowTransition] = React.useState(false);
  const currentEye = eyeSequence[currentEyeIndex] || null;

  // ── Live test state (per current eye) ──
  const [progress, setProgress]   = React.useState(0);
  const [elapsed, setElapsed]     = React.useState(0);
  const [responses, setResponses] = React.useState(0);
  const [gazeErrors, setGazeErrors] = React.useState(0);
  const [notDetected, setNotDetected] = React.useState(0);
  const [dotFlash, setDotFlash]   = React.useState(null);
  const [pickerLocked, setPickerLocked] = React.useState(false);
  const [sessionNotes, setSessionNotes] = React.useState('');
  const [fovealThresholds, setFovealThresholds] = React.useState({ OD:null, OS:null, OU:null });

  const timerRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const patternPoints = patternDef?.points || 54;

  // ── Effects: timer + progress simulation during testing ──
  React.useEffect(() => {
    if (phase !== 'testing' || showTransition) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 0.8, 100));
      setResponses(r => { if (r === 0) setPickerLocked(true); return Math.min(r + 1, patternPoints); });
      setGazeErrors(g => Math.min(g + (Math.random() > 0.97 ? 1 : 0), 12));
      setNotDetected(n => Math.min(n + (Math.random() > 0.95 ? 1 : 0), 8));
      setDotFlash({ r: Math.floor(Math.random() * 10), c: Math.floor(Math.random() * 10) });
    }, 300);
    return () => { clearInterval(timerRef.current); clearInterval(progressRef.current); };
  }, [phase, showTransition, patternPoints, currentEyeIndex]);

  // ── On progress complete: archive eye, advance or finish ──
  React.useEffect(() => {
    if (progress < 100) return;
    clearInterval(progressRef.current);

    const eye = currentEye;
    if (!eye) return;
    const mockData = eye === 'OD' ? VF_MOCK_OD : eye === 'OS' ? VF_MOCK_OS : VF_MOCK_OU_BINOCULAR;
    const archived = {
      ...mockData,
      fovealThreshold: fovealThresholds[eye] || mockData.fovealThreshold,
      fp: mockData.fp, fn: mockData.fn, fl: mockData.fl,
      gazeErrors, responses, notDetected,
      lensApplied: eye === 'OU' ? null : { ...lens[eye] },
      durationSec: elapsed,
    };
    setEyeArchive(prev => ({ ...prev, [eye]: archived }));

    const nextIndex = currentEyeIndex + 1;
    if (nextIndex < eyeSequence.length) {
      setTimeout(() => {
        setShowTransition(true);
        setCurrentEyeIndex(nextIndex);
        setProgress(0);
        setResponses(0);
        setGazeErrors(0);
        setNotDetected(0);
        setPickerLocked(false);
      }, 400);
    } else {
      setTimeout(() => setPhase('report'), 500);
    }
  }, [progress]);

  // ── Helpers ──
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const adjustLens = (side, field, delta) => {
    setLens(prev => {
      const val = prev[side][field] + delta;
      const clamped = field === 'axis' ? ((val % 181) + 181) % 181 : parseFloat(val.toFixed(2));
      return { ...prev, [side]: { ...prev[side], [field]: clamped } };
    });
  };

  const resetTestState = () => {
    setProgress(0); setElapsed(0); setResponses(0); setGazeErrors(0); setNotDetected(0); setDotFlash(null);
    setPickerLocked(false); setSessionNotes(''); setEyeArchive({ OD:null, OS:null, OU:null }); setCurrentEyeIndex(0);
    setFovealThresholds({ OD:null, OS:null, OU:null });
  };

  const handleNewTest = () => {
    resetTestState();
    setProtocolEye(null); setPattern(null);
    setVfStep('eye-selection'); setPhase('ready');
  };

  const allPatterns = VF_MONOCULAR_PATTERNS.concat(VF_BINOCULAR_PATTERNS);
  const patternName = allPatterns.find(p => p.id === pattern)?.name || pattern || '—';

  // ── Lens stepper sub-component (closure over adjustLens) ──
  const LensField = ({ side, field, step, label }) => {
    const val = lens[side][field];
    const display = field === 'axis' ? `${val}°` : (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    return (
      <div style={{ flex:1 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
        <input type="text" readOnly value={display} style={{ width:'100%', padding:'7px 4px', border:'1px solid #d1d5db', borderRadius:6, fontSize:12, fontWeight:700, textAlign:'center', color:'#111827', background:'#fff', marginBottom:4, fontFamily:"'Nunito Sans', sans-serif" }}/>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => adjustLens(side, field, -step)} style={{ flex:1, minHeight:36, border:'1px solid #d1d5db', borderRadius:6, background:'#f9fafb', cursor:'pointer', fontSize:12, color:'#374151', fontFamily:"'Nunito Sans', sans-serif" }}>−</button>
          <button onClick={() => adjustLens(side, field, step)}  style={{ flex:1, minHeight:36, border:'1px solid #d1d5db', borderRadius:6, background:'#f9fafb', cursor:'pointer', fontSize:12, color:'#374151', fontFamily:"'Nunito Sans', sans-serif" }}>+</button>
        </div>
      </div>
    );
  };

  // ── Gaze bar sub-component ──
  const GazeBar = ({ label, value, max, color }) => {
    const pct = Math.min((value / max) * 100, 100);
    const filled = Math.round((pct / 100) * 40);
    return (
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#6b7280' }}>{label}</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#374151', fontVariantNumeric:'tabular-nums' }}>{value}<span style={{ color:'#9ca3af' }}>/{max}</span></div>
        </div>
        <div style={{ display:'flex', gap:1, position:'relative', height:24, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
          {Array.from({length:40}).map((_, i) => (
            <div key={i} style={{ flex:1, height:'100%', background: i < filled ? color : '#e5e7eb', borderRight:'1px solid white' }}/>
          ))}
        </div>
      </div>
    );
  };

  // ── Live field-pattern dot map ──
  const FieldPattern = ({ flash }) => (
    <svg width={260} height={260} viewBox="0 0 280 280">
      <circle cx={140} cy={140} r={138} fill="white" stroke="#d1d5db" strokeWidth={1.5}/>
      <line x1={140} y1={2} x2={140} y2={278} stroke="#e5e7eb" strokeWidth={1}/>
      <line x1={2} y1={140} x2={278} y2={140} stroke="#e5e7eb" strokeWidth={1}/>
      {Array.from({length:10}).map((_, row) => Array.from({length:10}).map((_, col) => {
        const x = 42 + col * 22, y = 42 + row * 22;
        const dist = Math.sqrt((x-140)**2 + (y-140)**2);
        if (dist > 135) return null;
        const isFlash = flash && flash.r === row && flash.c === col;
        return (
          <circle key={`${row}-${col}`} cx={x} cy={y} r={isFlash ? 6 : 3}
            fill={isFlash ? '#fff' : '#9ca3af'} stroke={isFlash ? accent : 'none'} strokeWidth={isFlash?2:0}/>
        );
      }))}
      <circle cx={140} cy={140} r={5} fill="#9ca3af"/>
    </svg>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER: READY · EYE SELECTION
  // ════════════════════════════════════════════════════════════════
  const renderEyeSelection = () => (
    <div style={{ padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ maxWidth:720, margin:'0 auto', background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:36 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>Select eye protocol</h2>
        <p style={{ fontSize:13, fontWeight:400, color:'#6b7280', margin:'0 0 28px', lineHeight:1.55 }}>
          Choose which eye(s) to include. Bilateral testing runs as two separate monocular tests, OD then OS by default.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          {[
            { val:'OD',   code:'OD',   label:'Right eye only' },
            { val:'OS',   code:'OS',   label:'Left eye only' },
            { val:'both', code:'Both', label:'OD then OS (bilateral)' },
          ].map(opt => {
            const active = protocolEye === opt.val;
            return (
              <button key={opt.val} onClick={() => setProtocolEye(opt.val)} style={{
                padding:'24px 16px', borderRadius:12,
                border:`2px solid ${active ? accent : '#e5e7eb'}`,
                background: active ? `${accent}10` : '#fff',
                cursor:'pointer', textAlign:'center', minHeight:140,
                fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s',
              }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background: active ? accent : '#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color: active ? '#fff' : '#9ca3af' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"/>
                    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>
                  </svg>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color: active ? accent : '#111827', marginBottom:4 }}>{opt.code}</div>
                <div style={{ fontSize:11, fontWeight:400, color:'#6b7280' }}>{opt.label}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:28 }}>
          <button onClick={() => protocolEye && setVfStep('pattern')} disabled={!protocolEye} style={{
            minHeight:44, padding:'10px 28px', borderRadius:10, border:'none',
            background: protocolEye ? accent : '#e5e7eb',
            color: protocolEye ? '#fff' : '#9ca3af',
            fontSize:13, fontWeight:700, cursor: protocolEye ? 'pointer' : 'default',
            fontFamily:"'Nunito Sans', sans-serif",
          }}>Continue</button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER: READY · PATTERN SELECTION
  // ════════════════════════════════════════════════════════════════
  const renderPatternSelection = () => {
    const showMono = protocolEye !== 'OU'; // we don't use OU at this stage, but reserved
    return (
      <div style={{ padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ maxWidth:760, margin:'0 auto', background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:32 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:0 }}>Select exam pattern</h2>
            <button onClick={() => setVfStep('eye-selection')} style={{ minHeight:32, padding:'6px 12px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>← Eye selection</button>
          </div>
          <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'0 0 22px' }}>
            Protocol: <strong style={{ color:'#111827' }}>{protocolEye === 'both' ? 'OD then OS' : protocolEye}</strong> · Binocular patterns auto-switch to OU.
          </p>

          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:'0.07em', marginBottom:10 }}>MONOCULAR PATTERNS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {VF_MONOCULAR_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setPattern(p.id)} style={{
                  padding:'14px 16px', borderRadius:10, minHeight:80,
                  border:`1.5px solid ${pattern===p.id?accent:'#e5e7eb'}`,
                  background:pattern===p.id?`${accent}10`:'#fff',
                  cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif"
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:pattern===p.id?accent:'#111827', whiteSpace:'nowrap' }}>{p.name}</div>
                    <span style={{ fontSize:9, fontWeight:700, color:'#9ca3af', letterSpacing:'0.04em', whiteSpace:'nowrap', flexShrink:0 }}>{p.points} pts</span>
                  </div>
                  <div style={{ fontSize:11, fontWeight:400, color:'#6b7280' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:'0.07em', marginBottom:10 }}>BINOCULAR PATTERNS <span style={{ color:'#9ca3af', fontWeight:400 }}>· always OU, single run</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {VF_BINOCULAR_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setPattern(p.id)} style={{
                  padding:'14px 16px', borderRadius:10, minHeight:80,
                  border:`1.5px solid ${pattern===p.id?accent:'#e5e7eb'}`,
                  background:pattern===p.id?`${accent}10`:'#fff',
                  cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif"
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:pattern===p.id?accent:'#111827', whiteSpace:'nowrap' }}>{p.name}</div>
                    <span style={{ fontSize:9, fontWeight:700, color:'#9ca3af', letterSpacing:'0.04em', whiteSpace:'nowrap', flexShrink:0 }}>{p.points} pts</span>
                  </div>
                  <div style={{ fontSize:11, fontWeight:400, color:'#6b7280' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:24, paddingTop:20, borderTop:'1px solid #f3f4f6' }}>
            <button onClick={() => setShowConfig(true)} style={{ minHeight:40, padding:'9px 18px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Exam settings · {cfg.strategy} · Goldmann {cfg.stimulusSize}
            </button>
            <button onClick={() => pattern && setVfStep('foveal')} disabled={!pattern} style={{
              minHeight:44, padding:'10px 28px', borderRadius:10, border:'none',
              background: pattern ? accent : '#e5e7eb',
              color: pattern ? '#fff' : '#9ca3af',
              fontSize:13, fontWeight:700, cursor: pattern ? 'pointer' : 'default',
              fontFamily:"'Nunito Sans', sans-serif",
            }}>Continue</button>
          </div>
        </div>

        {showConfig && renderConfigModal()}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER: CONFIG MODAL
  // ════════════════════════════════════════════════════════════════
  const renderConfigModal = () => (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(4px)' }} onClick={() => setShowConfig(false)}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:18, padding:32, maxWidth:540, width:'90%', maxHeight:'85vh', overflow:'auto', fontFamily:"'Nunito Sans', sans-serif", boxShadow:'0 24px 80px rgba(0,0,0,0.35)' }}>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>Exam settings</h3>
        <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'0 0 22px' }}>Clinical defaults are pre-selected. Override only if the case requires it.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', display:'block', marginBottom:8 }}>STIMULUS SIZE <span style={{ color:'#9ca3af', fontWeight:400 }}>· Goldmann classification · III is the clinical default</span></label>
            <div style={{ display:'flex', gap:8 }}>
              {['I','II','III','IV','V'].map(s => (
                <button key={s} onClick={() => setCfg(c=>({...c,stimulusSize:s}))} style={{
                  flex:1, minHeight:44, padding:'10px 0', borderRadius:9,
                  border:`1.5px solid ${cfg.stimulusSize===s?accent:'#e5e7eb'}`,
                  background:cfg.stimulusSize===s?accent:'#fff',
                  color:cfg.stimulusSize===s?'#fff':'#374151',
                  fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif"
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', display:'block', marginBottom:8 }}>STRATEGY</label>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                ['SITA-Fast',     '~4 min/eye · clinical efficiency default'],
                ['SITA-Standard', '~6 min/eye · more precise · preferred for diagnosis'],
                ['Full Threshold','~14 min/eye · legacy · maximum detail'],
                ['SWAP',          'Blue-on-yellow · earliest glaucoma detection'],
              ].map(([s, desc]) => {
                const active = cfg.strategy === s;
                return (
                  <button key={s} onClick={() => setCfg(c=>({...c,strategy:s}))} style={{
                    minHeight:48, padding:'10px 14px', borderRadius:9,
                    border:`1.5px solid ${active?accent:'#e5e7eb'}`,
                    background:active?`${accent}10`:'#fff',
                    color:active?accent:'#374151',
                    fontSize:12, fontWeight:700, cursor:'pointer', textAlign:'left',
                    fontFamily:"'Nunito Sans', sans-serif"
                  }}>
                    <div>{s}</div>
                    <div style={{ fontSize:10, fontWeight:400, color: active ? accent : '#9ca3af', marginTop:2 }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[['brightness','Brightness'],['contrast','Contrast']].map(([field,label]) => (
              <div key={field}>
                <label style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', display:'block', marginBottom:8 }}>{label.toUpperCase()} · {cfg[field]}% <span style={{ color:'#9ca3af', fontWeight:400 }}>{field==='brightness' && cfg.brightness === 50 ? '(31.5 asb · calibrated standard)' : ''}</span></label>
                <input type="range" min={0} max={100} value={cfg[field]} onChange={e => setCfg(c=>({...c,[field]:+e.target.value}))} style={{ width:'100%' }}/>
              </div>
            ))}
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', display:'block', marginBottom:8 }}>RESULT FORMAT</label>
            <div style={{ display:'flex', gap:8 }}>
              {['Standard','Advanced','Research'].map(f => (
                <button key={f} onClick={() => setCfg(c=>({...c,resultFormat:f.toLowerCase()}))} style={{
                  flex:1, minHeight:40, padding:'9px 0', borderRadius:9,
                  border:`1.5px solid ${cfg.resultFormat===f.toLowerCase()?accent:'#e5e7eb'}`,
                  background:cfg.resultFormat===f.toLowerCase()?accent:'#fff',
                  color:cfg.resultFormat===f.toLowerCase()?'#fff':'#374151',
                  fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif"
                }}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
          <button onClick={() => setShowConfig(false)} style={{ minHeight:40, padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Close</button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER: READY · FOVEAL CALIBRATION
  // ════════════════════════════════════════════════════════════════
  const renderFoveal = () => {
    const brightnessLevels = [100, 80, 60, 40];
    return (
      <div style={{ padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ maxWidth:760, margin:'0 auto', background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:36 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:0 }}>Foveal threshold calibration</h2>
            <button onClick={() => setVfStep('pattern')} style={{ minHeight:32, padding:'6px 12px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>← Pattern selection</button>
          </div>
          <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'0 0 28px', lineHeight:1.6 }}>
            Establishes the patient's central sensitivity baseline before peripheral testing. Ask the patient to look directly at the center of the display and press the response button each time they see a brief flash of light. They should keep their gaze fixed throughout.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={260} height={260} viewBox="0 0 280 280">
                <line x1={0} y1={140} x2={280} y2={140} stroke={accent} strokeWidth={1.5}/>
                <line x1={140} y1={0} x2={140} y2={280} stroke={accent} strokeWidth={1.5}/>
                <circle cx={140} cy={140} r={60} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="3 4"/>
                {[[80,80],[200,80],[80,200],[200,200]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={6} fill="#eab308"/>
                ))}
                <circle cx={140} cy={140} r={5} fill="white" stroke={accent} strokeWidth={1.5}/>
              </svg>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:'0.07em' }}>STIMULUS BRIGHTNESS LEVELS</div>
              {brightnessLevels.map((level) => (
                <div key={level} style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{level}%</div>
                    <div style={{ fontSize:11, fontWeight:400, color:'#6b7280' }}>Descending threshold staircase</div>
                  </div>
                  <div style={{ width:56, height:24, borderRadius:5, background:`rgba(0,0,0,${level/100})`, border:'1px solid #e5e7eb' }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER: TESTING · CONDUCTING
  // ════════════════════════════════════════════════════════════════
  const renderConducting = () => {
    const eyeLabel = currentEye === 'OD' ? 'Right eye (OD)' : currentEye === 'OS' ? 'Left eye (OS)' : 'Both eyes (OU)';

    return (
      <div style={{ position:'relative', minHeight:'100%' }}>
        {/* Sticky sub-bar: inline picker + breadcrumb */}
        <div style={{
          position:'sticky', top:0, zIndex:10,
          background:'#fff', borderBottom:'1px solid #e5e7eb',
          padding:'12px 24px', display:'flex', alignItems:'center', gap:16,
          fontFamily:"'Nunito Sans', sans-serif",
        }}>
          {eyeSequence.length > 1 && currentEye !== 'OU' && (
            <VF_InlineEyePicker
              value={currentEye}
              options={eyeSequence}
              locked={pickerLocked}
              accent={accent}
              onChange={(eye) => {
                const idx = eyeSequence.indexOf(eye);
                if (idx >= 0) {
                  setCurrentEyeIndex(idx);
                  setProgress(0); setResponses(0); setGazeErrors(0); setNotDetected(0);
                }
              }}
            />
          )}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{eyeLabel}</span>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'#d1d5db' }}/>
            <span style={{ fontSize:11, fontWeight:600, color:'#6b7280' }}>{patternName} · {cfg.strategy} · Goldmann {cfg.stimulusSize}</span>
          </div>
          <VF_EyeBreadcrumb sequence={eyeSequence} currentIndex={currentEyeIndex} archive={eyeArchive} accent={accent}/>
        </div>

        {/* Body */}
        <div style={{ padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1fr) minmax(0, 1fr)', gap:20, marginBottom:20 }}>
            {/* Left: eye feed + lens controls */}
            <div>
              <div style={{ background:'#000', borderRadius:12, overflow:'hidden', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', marginBottom:14 }}>
                <div style={{ width:180, height:180, borderRadius:'50%', overflow:'hidden', border:`2px solid ${accent}40`, position:'relative' }}>
                  <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 40% 35%, #8B6914 0%, #3d2b1f 40%, #1a0f0a 70%)' }}/>
                  <div style={{ position:'absolute', top:'50%', left:'50%', width:60, height:60, borderRadius:'50%', background:'#050505', transform:'translate(-50%,-50%)' }}>
                    <div style={{ position:'absolute', top:'15%', left:'20%', width:'18%', height:'18%', borderRadius:'50%', background:'rgba(255,255,255,0.5)' }}/>
                  </div>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <line x1={40} y1={0} x2={40} y2={80} stroke={accent} strokeWidth={1} opacity={0.8}/>
                      <line x1={0} y1={40} x2={80} y2={40} stroke={accent} strokeWidth={1} opacity={0.8}/>
                    </svg>
                  </div>
                </div>
                <div style={{ position:'absolute', bottom:8, left:10, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.06em' }}>EYE TRACKING FEED · LIVE</div>
              </div>

              {/* Liquid lens controls */}
              <div style={{ background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em' }}>LIQUID LENS — xoExam™</div>
                  <div style={{ fontSize:10, fontWeight:400, color:'#9ca3af' }}>Eliminates blur-induced artifact during test</div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {['OD','OS'].map(side => {
                    const isActiveSide = currentEye === side || currentEye === 'OU';
                    return (
                      <div key={side} style={{ background:'#fff', borderRadius:10, padding:'10px 12px', border:`1px solid ${isActiveSide ? accent + '40' : '#e5e7eb'}`, opacity: isActiveSide ? 1 : 0.45 }}>
                        <div style={{ fontSize:10, fontWeight:700, color: isActiveSide ? accent : '#9ca3af', marginBottom:8 }}>{side === 'OD' ? 'Right eye · OD' : 'Left eye · OS'}</div>
                        <div style={{ display:'flex', gap:8 }}>
                          <LensField side={side} field="sph"  step={0.25} label="SPH"/>
                          <LensField side={side} field="cyl"  step={0.25} label="CYL"/>
                          <LensField side={side} field="axis" step={5}    label="AXIS"/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: live field-pattern dot map */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fafafa', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
              <FieldPattern flash={dotFlash}/>
              <div style={{ marginTop:10, fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em' }}>LIVE FIELD — {patternName.toUpperCase()}</div>
            </div>
          </div>

          {/* Gaze tracking bars */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:'14px 18px', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', marginBottom:12 }}>RELIABILITY MONITORING</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
              <GazeBar label="Responses" value={responses} max={patternPoints} color={accent}/>
              <GazeBar label="Gaze errors" value={gazeErrors} max={Math.round(patternPoints * 0.33)} color="#f59e0b"/>
              <GazeBar label="Not detected" value={notDetected} max={Math.round(patternPoints * 0.33)} color="#9ca3af"/>
            </div>
          </div>

          {/* Progress */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:'14px 18px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>Test progress</span>
              <span style={{ fontSize:13, fontWeight:700, color:accent, fontVariantNumeric:'tabular-nums' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height:8, background:'#f3f4f6', borderRadius:4 }}>
              <div style={{ height:'100%', width:`${progress}%`, background:accent, borderRadius:4, transition:'width 0.5s' }}/>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER: TESTING · RIGHT SIDEBAR (session notes)
  // ════════════════════════════════════════════════════════════════
  const renderTestingSidebar = () => (
    <div style={{ padding:'18px 18px 20px', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', marginBottom:12 }}>SESSION NOTES</div>
      <textarea
        value={sessionNotes}
        onChange={e => setSessionNotes(e.target.value)}
        placeholder="Patient behavior, fixation difficulties, fatigue, breaks…"
        style={{
          width:'100%', minHeight:140, padding:12, borderRadius:10,
          border:'1.5px solid #e5e7eb', background:'#fafafa',
          fontSize:12, fontWeight:400, color:'#111827', resize:'vertical',
          fontFamily:"'Nunito Sans', sans-serif", lineHeight:1.5,
        }}
      />

      <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', marginTop:22, marginBottom:10 }}>FOVEAL THRESHOLDS</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {eyeSequence.map(eye => (
          <div key={eye} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, background:'#fafafa', border:'1px solid #f3f4f6' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{eye}</span>
            <span style={{ fontSize:12, fontWeight:700, color: eyeArchive[eye] ? '#047857' : '#9ca3af', fontVariantNumeric:'tabular-nums' }}>
              {eyeArchive[eye] ? `${eyeArchive[eye].fovealThreshold} dB` : currentEye === eye ? 'in progress' : 'pending'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.05em', marginTop:22, marginBottom:8 }}>RELIABILITY KEY</div>
      <div style={{ fontSize:10, fontWeight:400, color:'#6b7280', lineHeight:1.6 }}>
        FP &lt; {reliabilityBands.fp.amber}% · FN &lt; {reliabilityBands.fn.amber}% · FL &lt; {reliabilityBands.fl.amber}% indicates a reliable test under the {reliabilityPreset === 'strict' ? 'Strict' : 'Standard'} preset.
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER: REPORT
  // ════════════════════════════════════════════════════════════════
  const renderReport = () => {
    const now = new Date();
    const eyeReports = eyeSequence
      .map(eye => eyeArchive[eye] ? { eye, data: eyeArchive[eye], interp: VF_getInterp(eyeArchive[eye].md, eyeArchive[eye].vfi) } : null)
      .filter(Boolean);

    if (!eyeReports.length) return null;

    const overall = VF_classifyOverall(eyeReports);
    const totalDuration = eyeReports.reduce((sum, r) => sum + (r.data.durationSec || 0), 0);
    const hasReliabilityConcern = eyeReports.some(r => {
      const fp = VF_reliabilityCheck(r.data.fp, 'fp', reliabilityBands);
      const fn = VF_reliabilityCheck(r.data.fn, 'fn', reliabilityBands);
      const fl = VF_reliabilityCheck(r.data.fl, 'fl', reliabilityBands);
      return fp.level === 'red' || fn.level === 'red' || fl.level === 'red';
    });

    return (
      <div style={{ padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Patient Classification banner */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', marginBottom:10 }}>PATIENT CLASSIFICATION</div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:24 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'inline-block', padding:'8px 16px', borderRadius:10, background:overall.bg, border:`1.5px solid ${overall.border}`, color:overall.fg, fontSize:16, fontWeight:700, marginBottom:10 }}>
                  {overall.text}{overall.gtOverride && ' · GHT-driven'}
                </div>
                <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:0, lineHeight:1.55 }}>{overall.desc}</p>
                {overall.gtOverride && (
                  <p style={{ fontSize:11, fontWeight:400, color:'#9a3412', margin:'8px 0 0', lineHeight:1.5 }}>
                    Severity elevated above MD/VFI alone because the GHT returned Outside Normal Limits / General Reduction on at least one eye — standard clinical reading rule for early glaucoma.
                  </p>
                )}
              </div>
              <div style={{ minWidth:240, display:'flex', flexDirection:'column', gap:6 }}>
                {eyeReports.map(r => (
                  <div key={r.eye} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'#fafafa', border:'1px solid #f3f4f6' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{r.eye}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:r.interp.fg }}>{r.interp.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reliability concern banner */}
          {hasReliabilityConcern && (
            <div style={{ background:'#fef2f2', borderRadius:12, border:'1.5px solid #fecaca', padding:'14px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#b91c1c', marginBottom:4 }}>Reliability concern</div>
                <div style={{ fontSize:12, fontWeight:400, color:'#7f1d1d', lineHeight:1.55 }}>
                  One or more reliability indices exceed acceptable thresholds. Results should be interpreted with caution and the test may need to be repeated.
                </div>
              </div>
            </div>
          )}

          {/* Patient information */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 16px' }}>Patient information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:12 }}>
              {[['Patient name','Marcus Williams'],['Birthdate','10/11/1983'],['Patient ID','#4821-MW'],['Exam date',now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, paddingTop:12, borderTop:'1px solid #f3f4f6' }}>
              {[
                ['Pattern', patternName],
                ['Strategy', cfg.strategy],
                ['Stimulus size', `Goldmann ${cfg.stimulusSize}`],
                ['Total duration', fmtTime(totalDuration)],
                ['Background luminance', `${cfg.brightness}% · 31.5 asb std`],
                ['Eye(s) tested', eyeReports.map(r => r.eye).join(', ')],
                ['Result format', cfg.resultFormat.charAt(0).toUpperCase() + cfg.resultFormat.slice(1)],
                ['Reliability preset', reliabilityPreset === 'strict' ? 'Strict' : 'Standard'],
              ].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
              ))}
            </div>
          </div>

          {/* Per-eye summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:eyeReports.length === 1 ? '1fr' : eyeReports.length === 2 ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap:16 }}>
            {eyeReports.map(({ eye, data, interp }) => (
              <div key={eye} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#111827' }}>{eye}</div>
                  <VF_GHTPill status={data.ght}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                  {[
                    { code:'MD',  name:'Mean Deviation',     val:`${data.md.toFixed(2)} dB`, color: data.md > -2 ? '#047857' : data.md > -6 ? '#b45309' : data.md > -12 ? '#9a3412' : '#b91c1c' },
                    { code:'PSD', name:'Pattern SD',         val:`${data.psd.toFixed(2)} dB`, color: data.psd < 2 ? '#047857' : data.psd < 4 ? '#b45309' : '#b91c1c' },
                    { code:'VFI', name:'Visual Field Index', val:`${data.vfi}%`,             color: data.vfi >= 97 ? '#047857' : data.vfi >= 85 ? '#b45309' : data.vfi >= 70 ? '#9a3412' : '#b91c1c' },
                  ].map(m => (
                    <div key={m.code} style={{ background:'#fafafa', borderRadius:9, padding:'10px 8px', border:'1px solid #f3f4f6', textAlign:'center' }}>
                      <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', marginBottom:2 }}>{m.code}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:m.color, fontVariantNumeric:'tabular-nums' }}>{m.val}</div>
                      <div style={{ fontSize:9, fontWeight:400, color:'#9ca3af', marginTop:2 }}>{m.name}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:10, borderRadius:8, background:interp.bg, border:`1px solid ${interp.border}`, marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:interp.fg }}>{interp.text}</div>
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.05em', marginBottom:6 }}>RELIABILITY</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {['fp','fn','fl'].map(k => {
                    const v = data[k];
                    const r = VF_reliabilityCheck(v, k, reliabilityBands);
                    return (
                      <div key={k} style={{ padding:'8px 6px', borderRadius:7, background:'#fafafa', border:'1px solid #f3f4f6', textAlign:'center' }}>
                        <div style={{ fontSize:9, fontWeight:400, color:'#6b7280' }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:r.color, fontVariantNumeric:'tabular-nums' }}>{v}%</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:12, fontSize:11, fontWeight:400, color:'#6b7280' }}>
                  Foveal threshold: <strong style={{ color:'#111827' }}>{data.fovealThreshold} dB</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Per-eye detail sections — sensitivity map + TD + PD + lens */}
          {eyeReports.map(({ eye, data }) => (
            <div key={`detail-${eye}`} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 18px' }}>{eye} — Detailed results</h3>
              <div style={{ display:'flex', gap:32, flexWrap:'wrap', justifyContent:'flex-start' }}>
                <div>
                  <VF_SensGrid data={data} accent={accent} label="GRAYSCALE SENSITIVITY"/>
                </div>
                <div>
                  <VF_DevPlot grid={VF_computeTD(data.grid)} title="TOTAL DEVIATION"/>
                </div>
                <div>
                  <VF_DevPlot grid={VF_computePD(data.grid)} title="PATTERN DEVIATION"/>
                </div>
                <div style={{ flex:1, minWidth:220, display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.06em', marginBottom:8 }}>LENS CORRECTION APPLIED</div>
                    {data.lensApplied ? (
                      <div style={{ background:'#fafafa', borderRadius:9, padding:'10px 12px', border:'1px solid #f3f4f6', fontSize:12, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>
                        SPH {data.lensApplied.sph >= 0 ? '+' : ''}{data.lensApplied.sph.toFixed(2)} · CYL {data.lensApplied.cyl >= 0 ? '+' : ''}{data.lensApplied.cyl.toFixed(2)} · AXIS {data.lensApplied.axis}°
                      </div>
                    ) : (
                      <div style={{ fontSize:11, fontWeight:400, color:'#6b7280' }}>No lens correction (binocular protocol)</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.06em', marginBottom:8 }}>SESSION DURATION</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{fmtTime(data.durationSec || 0)}</div>
                  </div>
                  {data.estermanScore !== undefined && (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.06em', marginBottom:8 }}>ESTERMAN SCORE</div>
                      <div style={{ fontSize:18, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{data.estermanScore}<span style={{ color:'#9ca3af', fontSize:13 }}>/{data.estermanTotal}</span></div>
                      <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginTop:2 }}>{Math.round(data.estermanScore / data.estermanTotal * 100)}% binocular field</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Reference values + clinical interpretation */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:22 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 12px' }}>Reference values — age-banded normal MD</h3>
              <p style={{ fontSize:11, fontWeight:400, color:'#6b7280', margin:'0 0 12px', lineHeight:1.5 }}>Expected mean deviation in age-matched normal populations. Compare with patient MD to confirm pathology vs. normal age-related decline.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {VF_REFERENCE_MD_BY_AGE.map(r => (
                  <div key={r.band} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderRadius:6, background:'#fafafa', border:'1px solid #f3f4f6', fontSize:12 }}>
                    <span style={{ fontWeight:700, color:'#374151' }}>{r.band}</span>
                    <span style={{ fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{r.md}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:22 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 12px' }}>Clinical interpretation</h3>
              <p style={{ fontSize:12, fontWeight:400, color:'#374151', margin:'0 0 12px', lineHeight:1.6 }}>{overall.desc}</p>
              {sessionNotes && (
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.06em', marginTop:14, marginBottom:6 }}>SESSION NOTES</div>
                  <div style={{ fontSize:12, fontWeight:400, color:'#374151', whiteSpace:'pre-wrap', padding:'10px 12px', background:'#fafafa', borderRadius:8, border:'1px solid #f3f4f6', lineHeight:1.5 }}>{sessionNotes}</div>
                </>
              )}
              <div style={{ fontSize:10, fontWeight:400, color:'#9ca3af', marginTop:14, lineHeight:1.5, paddingTop:12, borderTop:'1px solid #f3f4f6' }}>
                Calibration disclaimer: this xoExam visual field analysis is a clinical-research-grade decision support tool. Definitive diagnosis and treatment decisions must be made by a licensed ophthalmologist in the context of complete clinical findings.
              </div>
            </div>
          </div>

          {/* Report actions */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', paddingBottom:20 }}>
            <button style={{ minHeight:44, padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Export report</button>
            <button style={{ minHeight:44, padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Compare</button>
            <button onClick={onBack} style={{ minHeight:44, padding:'11px 28px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Certify &amp; close</button>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // ROOT RETURN — wrap in ExamShell with phase-appropriate content
  // ════════════════════════════════════════════════════════════════

  // Begin Test handler: only enabled when ready & on foveal sub-step
  const handleBegin = (vfStep === 'foveal' && pattern && (protocolEye || patternDef?.kind === 'binocular')) ? () => {
    // Set initial mock foveal thresholds for all eyes in sequence
    const seq = patternDef?.kind === 'binocular' ? ['OU'] : (protocolEye === 'both' ? (defaultStartEye === 'OS' ? ['OS','OD'] : ['OD','OS']) : [protocolEye]);
    const fovs = {};
    seq.forEach(e => { fovs[e] = e === 'OD' ? VF_MOCK_OD.fovealThreshold : e === 'OS' ? VF_MOCK_OS.fovealThreshold : VF_MOCK_OU_BINOCULAR.fovealThreshold; });
    setFovealThresholds(prev => ({ ...prev, ...fovs }));
    setCurrentEyeIndex(0);
    setShowTransition(seq.length > 1); // show prompt on first eye if sequence
    setPhase('testing');
  } : null;

  const handleFinish = () => setPhase('report');

  return (
    <ExamShell
      title="Visual Field"
      accent={accent}
      onBack={onBack}
      patientName="Marcus Williams"
      patientId="#4821-MW"
      phase={phase}
      elapsed={elapsed}
      onBegin={handleBegin}
      onFinish={phase === 'testing' ? handleFinish : null}
      onNewTest={phase === 'report' ? handleNewTest : null}
      rightPanel={phase === 'testing' ? renderTestingSidebar() : null}
    >
      {phase === 'ready' && vfStep === 'eye-selection' && renderEyeSelection()}
      {phase === 'ready' && vfStep === 'pattern'        && renderPatternSelection()}
      {phase === 'ready' && vfStep === 'foveal'         && renderFoveal()}
      {phase === 'testing' && renderConducting()}
      {phase === 'testing' && showTransition && (
        <VF_TransitionPrompt
          fromEye={currentEyeIndex > 0 ? eyeSequence[currentEyeIndex - 1] : null}
          toEye={currentEye}
          sequence={eyeSequence}
          currentIndex={currentEyeIndex}
          archive={eyeArchive}
          accent={accent}
          onContinue={() => setShowTransition(false)}
        />
      )}
      {phase === 'report' && renderReport()}
    </ExamShell>
  );
}

// Auto-skip eye-selection for binocular patterns: when the doctor picks a binocular pattern,
// jump straight from pattern → foveal (skip eye-selection inputs).
// Handled inline via patternDef.kind check — protocolEye is not required for binocular.

Object.assign(window, { VisualFieldTest });
