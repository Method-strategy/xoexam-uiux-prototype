// ColorVisionTest.jsx — Ishihara 24-plate + D-15 Farnsworth cap arrangement test

const CV_ISHIHARA_PLATES = [
  { n:1,  correct:'12',  color:'#e63946', bg:'#f1c40f', image:'assets/ishihara-plate1.jpg' },
  { n:2,  correct:'8',   color:'#2980b9', bg:'#e74c3c', image:'assets/ishihara-plate2.jpg' },
  { n:3,  correct:'5',   color:'#27ae60', bg:'#e67e22', image:'assets/ishihara-plate3.jpg' },
  { n:4,  correct:'3',   color:'#8e44ad', bg:'#16a085', image:'assets/ishihara-plate4.jpg' },
  { n:5,  correct:'57',  color:'#c0392b', bg:'#f39c12' },
  { n:6,  correct:'5',   color:'#1abc9c', bg:'#e74c3c' },
  { n:7,  correct:'3',   color:'#d35400', bg:'#27ae60' },
  { n:8,  correct:'15',  color:'#2ecc71', bg:'#e74c3c' },
  { n:9,  correct:'74',  color:'#e74c3c', bg:'#3498db' },
  { n:10, correct:'2',   color:'#8e44ad', bg:'#f1c40f' },
  { n:11, correct:'6',   color:'#c0392b', bg:'#1abc9c' },
  { n:12, correct:'97',  color:'#27ae60', bg:'#e67e22' },
  { n:13, correct:'45',  color:'#e74c3c', bg:'#2ecc71' },
  { n:14, correct:'5',   color:'#3498db', bg:'#e74c3c' },
  { n:15, correct:'7',   color:'#f39c12', bg:'#8e44ad' },
  { n:16, correct:'16',  color:'#16a085', bg:'#c0392b' },
  { n:17, correct:'73',  color:'#e74c3c', bg:'#27ae60' },
  { n:18, correct:'26',  color:'#9b59b6', bg:'#e67e22' },
  { n:19, correct:'42',  color:'#1abc9c', bg:'#e74c3c' },
  { n:20, correct:'35',  color:'#e74c3c', bg:'#2980b9' },
  { n:21, correct:'96',  color:'#27ae60', bg:'#f39c12' },
  { n:22, correct:'8',   color:'#e67e22', bg:'#16a085' },
  { n:23, correct:'5',   color:'#c0392b', bg:'#2ecc71' },
  { n:24, correct:'2',   color:'#3498db', bg:'#e74c3c' },
];

// D-15 cap palette — clinically realistic approximation of Munsell V5 C4 hues.
// 16 colors total: index 0 is the PILOT (fixed reference cap), indices 1..15
// are the test caps the patient arranges. Mid-saturation, near-constant
// luminance — sorting requires hue discrimination (not lightness or chroma
// shortcuts), which is the point. Approximated from the standard D-15 plate
// set sampled in sRGB. Real clinical caps are validated against Munsell
// references; these values are for protocol demonstration on a non-color-
// calibrated tablet display (see the calibration disclaimer in the D-15
// report block).
const CV_D15_CAP_COLORS = [
  '#3D81B0', // pilot (P) — blue
  '#4185AC', // 1
  '#4189A6', // 2
  '#458DA0', // 3
  '#519098', // 4
  '#638F8A', // 5
  '#778C7B', // 6
  '#8A896E', // 7
  '#998261', // 8
  '#A07A5A', // 9
  '#A57158', // 10
  '#A56862', // 11
  '#A06370', // 12
  '#956280', // 13
  '#866691', // 14
  '#736C9D', // 15
];

// ── Vingrys & King-Smith (1988) "Moment of Inertia" scoring ──
// Standard clinical method for D-15 quantification. Computes 6 indices from
// the patient's cap arrangement; classifies defect type by confusion angle
// and severity by C-index.

// sRGB hex → CIE Lab (D65 reference white)
const CV_sRGBtoLab = (hex) => {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  const lin = (c) => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  const R = lin(r), G = lin(g), B = lin(b);
  // sRGB → XYZ (D65)
  const X = R*0.4124564 + G*0.3575761 + B*0.1804375;
  const Y = R*0.2126729 + G*0.7151522 + B*0.0721750;
  const Z = R*0.0193339 + G*0.1191920 + B*0.9503041;
  // XYZ → Lab (D65 reference white)
  const Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
  const f = (t) => t > 0.008856 ? Math.pow(t, 1/3) : 7.787*t + 16/116;
  const fx = f(X/Xn), fy = f(Y/Yn), fz = f(Z/Zn);
  return { L: 116*fy - 16, a: 500*(fx - fy), b: 200*(fy - fz) };
};

// Cap a*,b* coordinates derived once from the displayed sRGB values.
// Index aligns with CV_D15_CAP_COLORS (0 = pilot).
const CV_D15_LAB = CV_D15_CAP_COLORS.map(hex => CV_sRGBtoLab(hex));

// Compute V-K-S indices for a given cap ordering. `orderIds` is the full
// 16-element sequence (pilot first, then the 15 caps in patient order).
const CV_computeVKS = (orderIds) => {
  const labs = orderIds.map(id => CV_D15_LAB[id]);
  // 15 consecutive difference vectors in (a*, b*)
  const vectors = [];
  for (let i = 0; i < labs.length - 1; i++) {
    vectors.push({ da: labs[i+1].a - labs[i].a, db: labs[i+1].b - labs[i].b });
  }
  const N = vectors.length;
  // Second-moment matrix (uncentered — moment of inertia, not covariance)
  const Saa = vectors.reduce((s,v) => s + v.da*v.da, 0) / N;
  const Sbb = vectors.reduce((s,v) => s + v.db*v.db, 0) / N;
  const Sab = vectors.reduce((s,v) => s + v.da*v.db, 0) / N;
  // Eigendecomposition of the symmetric 2×2 [[Saa,Sab],[Sab,Sbb]]
  const trace = Saa + Sbb;
  const disc  = Math.sqrt(Math.max(0, (trace*trace)/4 - (Saa*Sbb - Sab*Sab)));
  const lambdaMajor = trace/2 + disc;
  const lambdaMinor = trace/2 - disc;
  const majorR = Math.sqrt(Math.max(0, lambdaMajor));
  const minorR = Math.sqrt(Math.max(0, lambdaMinor));
  // Confusion angle: orientation of the major eigenvector in Lab a*-b* plane.
  // For symmetric [[Saa,Sab],[Sab,Sbb]]: θ = ½·atan2(2·Sab, Saa − Sbb)
  const angleDeg = 0.5 * Math.atan2(2*Sab, Saa - Sbb) * 180 / Math.PI;
  // Vingrys-King-Smith: TES = √(M² + m²)
  const TES = Math.sqrt(majorR*majorR + minorR*minorR);
  // S-index: parallelism (M / m). High = highly aligned vectors = strong defect.
  const sIndex = minorR > 0.001 ? majorR / minorR : 99;
  return { angleDeg, majorR, minorR, TES, sIndex };
};

// Pre-compute the perfect-arrangement reference (caps in canonical order
// 0,1,2,...,15). C-index is the ratio of patient majorR to this baseline.
const CV_D15_PERFECT = CV_computeVKS([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

// Classify D-15 result into (defect type, severity) per the doc's thresholds.
// Type assignment is GATED by defect presence — if TES is small (well-
// arranged), classify Normal regardless of angle.
const CV_classifyD15 = (vks) => {
  const cIndex = vks.majorR / CV_D15_PERFECT.majorR;
  // Normal gate: well-arranged (low C-index AND low TES). Per the doc,
  // Normal C-index ≈ 1.0 with TES ≈ 11; threshold C < 1.2 mirrors clinical
  // convention. Use OR of TES guard to catch unusually small arrangements.
  if (cIndex < 1.2 && vks.TES < 14) {
    return { type:'Normal', severity:'Slight', cIndex, label:'Normal color vision' };
  }
  // Type from confusion angle (Vingrys-King-Smith convention)
  let type;
  if      (vks.angleDeg >  0.7)  type = 'Protan';
  else if (vks.angleDeg > -65)   type = 'Deutan';
  else                            type = 'Tritan';
  // Severity from C-index
  let severity;
  if      (cIndex < 1.5) severity = 'Slight';
  else if (cIndex < 3.0) severity = 'Moderate';
  else                    severity = 'Strong';
  return { type, severity, cIndex, label: `${type} defect — ${severity.toLowerCase()}` };
};

// Reference population values from Vingrys & King-Smith (1988) — shown in
// the D-15 report so the doctor can eyeball where the patient sits relative
// to typical defect profiles.
const CV_D15_REFERENCE = [
  { label:'Normal',         angle:'+62.0', major:'9.2',  minor:'6.7', TES:'11.4', s:'1.38', c:'1.00' },
  { label:'Protanopia',     angle:'+8.8',  major:'38.8', minor:'6.6', TES:'39.4', s:'6.16', c:'4.20' },
  { label:'Protanomaly',    angle:'+28.3', major:'18.0', minor:'8.2', TES:'20.4', s:'1.97', c:'1.95' },
  { label:'Deuteranopia',   angle:'-7.4',  major:'37.9', minor:'6.3', TES:'38.4', s:'6.19', c:'4.10' },
  { label:'Deuteranomaly',  angle:'-5.8',  major:'25.4', minor:'9.6', TES:'27.5', s:'2.99', c:'2.75' },
  { label:'Tritan defects', angle:'-82.8', major:'24.0', minor:'6.4', TES:'24.9', s:'3.94', c:'2.60' },
];

// ── Vingrys & King-Smith (1988) end ──

// All-caps clinical violator style — for sidebar labels, badges, status pills
const CV_VIOLATOR = {
  fontSize: 11,
  fontWeight: 700,
  color: '#9ca3af',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

// Title-case report section header style — for formal report sections only
const CV_REPORT_LABEL = {
  fontSize: 11,
  fontWeight: 700,
  color: '#9ca3af',
  letterSpacing: '0.06em',
  marginBottom: 14,
  // No textTransform — title case set by string
};

function CV_shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// Clinical color-vision eye sequence (module scope so top-level components can use it).
// Doctor picks a START eye; the test runs forward to OU (always last).
const CV_EYE_SEQUENCE = ['OD', 'OS', 'OU'];
const CV_EYE_LONG = { OD:'OD · right eye', OS:'OS · left eye', OU:'OU · both eyes' };
const CV_EYE_SHORT = { OD:'OD · right', OS:'OS · left', OU:'OU · both' };

// Compact "Start at eye" picker used INSIDE the testing sub-bar (upper-left).
// Test always opens defaulted to OD; doctor can override here if they want to
// start at OS or OU. Disabled once the doctor has begun responding so they
// can't lose progress — they must Cancel test (red button) to restart.
function CV_InlineEyePicker({ value, onChange, accent, disabled }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      {CV_EYE_SEQUENCE.map(side => {
        const active = value === side;
        return (
          <button
            key={side}
            onClick={() => !disabled && onChange(side)}
            disabled={disabled}
            title={disabled ? 'Cancel and restart the test to change start eye' : `Start at ${CV_EYE_LONG[side]}`}
            style={{
              minWidth:38, minHeight:30, padding:'4px 10px', borderRadius:8,
              border: active ? `1.5px solid ${accent}` : '1.5px solid #e5e7eb',
              background: active ? `${accent}10` : '#fff',
              color: active ? accent : '#6b7280',
              fontFamily:"'Nunito Sans', sans-serif", fontSize:11, fontWeight:700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled && !active ? 0.45 : 1,
              transition:'all 0.15s', letterSpacing:'0.04em'
            }}
          >{side}</button>
        );
      })}
    </div>
  );
}

// Compact "Start at eye" picker shown on each protocol card. Three buttons
// (OD/OS/OU) plus a single-line sequence preview underneath so the doctor sees
// the planned chain at a glance — e.g. picking OS shows "OS → OU".
function CV_StartEyePicker({ value, onChange, accent }) {
  const startIdx = CV_EYE_SEQUENCE.indexOf(value);
  return (
    <div style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', padding:'10px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase' }}>Start at eye</span>
        <span style={{ fontSize:10, color:'#6b7280', fontWeight:700 }}>{CV_EYE_SHORT[value]}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6, marginBottom:8 }}>
        {CV_EYE_SEQUENCE.map(side => {
          const active = value === side;
          return (
            <button key={side} onClick={() => onChange(side)} style={{
              minHeight:44, padding:'8px 4px', borderRadius:9,
              border: active ? `1.5px solid ${accent}` : '1.5px solid #e5e7eb',
              background: active ? `${accent}10` : '#fff',
              color: active ? accent : '#6b7280',
              fontFamily:"'Nunito Sans', sans-serif", fontSize:13, fontWeight:700,
              cursor:'pointer', transition:'all 0.15s', letterSpacing:'0.04em'
            }}>{side}</button>
          );
        })}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:10, fontWeight:700, letterSpacing:'0.06em' }}>
        {CV_EYE_SEQUENCE.map((side, idx) => {
          const inSeq = idx >= startIdx;
          return (
            <React.Fragment key={side}>
              <span style={{ color: inSeq ? accent : '#d1d5db' }}>{side}</span>
              {idx < CV_EYE_SEQUENCE.length - 1 && (
                <span style={{ color: inSeq && (idx+1) >= startIdx ? accent : '#d1d5db' }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Eye-sequence breadcrumb shown in the testing UI header. Three pills representing
// OD → OS → OU. Each pill is one of: done (check + green), current (filled accent),
// pending (gray outline), or skipped (very dim — if the doctor started at OS, OD
// is rendered as skipped).
function CV_EyeBreadcrumb({ startEye, currentEye, archive, accent }) {
  const startIdx = CV_EYE_SEQUENCE.indexOf(startEye);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:"'Nunito Sans', sans-serif" }}>
      {CV_EYE_SEQUENCE.map((side, idx) => {
        const inSeq    = idx >= startIdx;
        const isCurrent = side === currentEye;
        const isDone    = inSeq && archive && archive[side];
        let bg, fg, bd, showCheck = false;
        if (!inSeq)         { bg='#fafafa'; fg='#d1d5db'; bd='1px dashed #e5e7eb'; }
        else if (isDone)    { bg='#dcfce7'; fg='#10b981'; bd='1.5px solid #86efac'; showCheck = true; }
        else if (isCurrent) { bg=`${accent}1a`; fg=accent; bd=`1.5px solid ${accent}`; }
        else                { bg='#f9fafb'; fg='#9ca3af'; bd='1.5px solid #e5e7eb'; }
        return (
          <React.Fragment key={side}>
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:18, background:bg, border:bd }}>
              {showCheck && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
              <span style={{ fontSize:11, fontWeight:700, color:fg, letterSpacing:'0.04em' }}>{side}</span>
            </div>
            {idx < CV_EYE_SEQUENCE.length - 1 && (
              <span style={{ fontSize:11, color:'#d1d5db', userSelect:'none' }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CV_IshiharaPlate({ plate, size=180, simulatedNumber=null }) {
  if (plate.image) {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'3px solid #e5e7eb', background:'#f5f5f0' }}>
        <img src={plate.image} alt={`Ishihara Plate ${plate.n}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      </div>
    );
  }

  const dots = React.useMemo(() => {
    const arr = [];
    const seed = plate.n * 137;
    for (let i = 0; i < 220; i++) {
      const x = ((seed*(i+1)*7919)%100);
      const y = ((seed*(i+1)*6271)%100);
      const r = 2 + ((seed*i*3571)%4);
      const distFromCenter = Math.sqrt((x-50)**2+(y-50)**2);
      if (distFromCenter > 48) continue;
      const isNumber = Math.abs(x-50) < 16 && Math.abs(y-50) < 26;
      arr.push({ x, y, r, isNumber });
    }
    return arr;
  }, [plate.n]);

  // Render the blended number for SIMULATED plates only (5-24, no licensed image)
  const showNumber = simulatedNumber !== null && simulatedNumber !== undefined;

  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', position:'relative', border:'3px solid #e5e7eb', flexShrink:0, background:'#f5f5f0' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {dots.map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r}
            fill={d.isNumber ? plate.color : plate.bg} opacity={0.75+(i%3)*0.08}/>
        ))}
        {showNumber && (
          <text
            x="50" y="50"
            textAnchor="middle" dominantBaseline="central"
            fontFamily="'Nunito Sans', sans-serif"
            fontWeight="700"
            fontSize={String(simulatedNumber).length > 1 ? 42 : 50}
            fill={plate.color}
            opacity="0.78"
            style={{ paintOrder:'stroke', stroke:plate.bg, strokeWidth:1.2, strokeOpacity:0.45 }}
          >{simulatedNumber}</text>
        )}
      </svg>
      {showNumber && size >= 120 && (
        <div style={{ position:'absolute', bottom:6, right:8, fontSize:8, fontWeight:700, color:'rgba(0,0,0,0.32)', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:"'Nunito Sans', sans-serif" }}>simulated</div>
      )}
    </div>
  );
}

// ── Main Color Vision Test ──
function ColorVisionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [testMode, setTestMode] = React.useState(null); // null | 'ishihara' | 'd15'
  const [phase, setPhase] = React.useState('selection');

  // Per-test start-eye picker. Doctor chooses on each protocol card.
  // Defaults to OD; can be overridden to OS or OU to start partway into the sequence.
  const [ishiharaStartEye, setIshiharaStartEye] = React.useState('OD');
  const [d15StartEye,      setD15StartEye]      = React.useState('OD');

  // The eye actively under test. Cycles forward: OD → OS → OU.
  const [currentEye, setCurrentEye] = React.useState('OD');

  const [currentPlate, setCurrentPlate] = React.useState(0);
  const [answer, setAnswer] = React.useState('');
  const [responses, setResponses] = React.useState([]);
  const [elapsed, setElapsed] = React.useState(0);
  const [notes, setNotes] = React.useState('');

  // Archived per-eye results. Each protocol can have up to 3 eye phases (OD, OS, OU).
  // ishiharaResults[eye] = array of response objects (same shape as `responses`)
  // d15Results[eye]      = { sequence, analysis, analyzed }
  const [ishiharaResults, setIshiharaResults] = React.useState({ OD:null, OS:null, OU:null });
  const [d15Results,      setD15Results]      = React.useState({ OD:null, OS:null, OU:null });

  // Transition modal — pauses timer, blocks UI. Kind:
  //   'eye'                  — advance to the next eye within the same protocol
  //   'protocol-to-d15'      — after Ishihara protocol fully complete
  //   'protocol-to-ishihara' — after D-15 protocol fully complete (if Ishihara not yet done)
  const [transition, setTransition] = React.useState(null);

  const timerRef = React.useRef(null);

  // ── Eye sequence helpers ──
  // Clinical color-vision sequence: monocular right, monocular left, binocular both.
  // CV_EYE_SEQUENCE lives at module scope so the StartEyePicker / EyeBreadcrumb
  // top-level components can use it too.
  const nextEyeAfter = (eye) => {
    const idx = CV_EYE_SEQUENCE.indexOf(eye);
    return idx === -1 || idx >= CV_EYE_SEQUENCE.length - 1 ? null : CV_EYE_SEQUENCE[idx + 1];
  };
  const eyesPlannedFrom = (startEye) => {
    const idx = CV_EYE_SEQUENCE.indexOf(startEye);
    return idx === -1 ? [] : CV_EYE_SEQUENCE.slice(idx);
  };
  const eyePositionInstruction = (eye) => {
    if (eye === 'OD') return 'Ask the patient to cover their left eye and position their right eye in the eyepiece.';
    if (eye === 'OS') return 'Ask the patient to cover their right eye and position their left eye in the eyepiece.';
    return 'Ask the patient to uncover both eyes and look straight forward into the eyepiece.';
  };
  const eyeLongLabel = (eye) => CV_EYE_LONG[eye] || eye;
  const eyeShortLabel = (eye) => CV_EYE_SHORT[eye] || eye;

  // Generate simulated answers for plates without licensed images (5-24).
  // Stable per session via useMemo. Used as BOTH the visible blended number
  // on the plate AND the correct answer for scoring.
  const simulatedAnswers = React.useMemo(() => {
    const out = {};
    for (const p of CV_ISHIHARA_PLATES) {
      if (p.image) continue;
      // 60% 2-digit, 40% 1-digit — looks more like a real plate set
      const isTwoDigit = Math.random() < 0.6;
      out[p.n] = isTwoDigit
        ? String(10 + Math.floor(Math.random() * 90))
        : String(1 + Math.floor(Math.random() * 9));
    }
    return out;
  }, []);
  const getPlateAnswer = (plate) => plate.image ? plate.correct : simulatedAnswers[plate.n];
  const getSimulatedNumber = (plate) => plate.image ? null : simulatedAnswers[plate.n];

  // Timer: runs ONLY during active testing AND no transition modal is open.
  // Stops on results, selection, and any transition prompt.
  React.useEffect(() => {
    const active = phase === 'testing' && !transition;
    if (active) timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase, transition]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── D-15 state ──
  // 16 colors total: index 0 is the PILOT (fixed reference cap, displayed but
  // not draggable). Indices 1–15 are the test caps the patient arranges.
  const [d15Available, setD15Available] = React.useState(() =>
    CV_shuffle(Array.from({length:15}, (_,i) => ({ id:i+1, color:CV_D15_CAP_COLORS[i+1] })))
  );
  const [d15Sequence, setD15Sequence] = React.useState([]);
  const [d15Analysis, setD15Analysis] = React.useState('');
  const [d15Analyzed, setD15Analyzed] = React.useState(false);
  const [d15DragIdx, setD15DragIdx] = React.useState(null);

  // ── D-15 helpers ──
  const d15AddCap = (cap) => {
    if (d15Sequence.find(c => c.id === cap.id)) return;
    setD15Sequence(s => [...s, cap]);
  };
  const d15RemoveCap = (id) => setD15Sequence(s => s.filter(c => c.id !== id));
  const d15OnDragStart = (idx) => (e) => { setD15DragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
  const d15OnDragOver = (idx) => (e) => { e.preventDefault(); };
  const d15OnDrop = (idx) => (e) => {
    e.preventDefault();
    if (d15DragIdx === null || d15DragIdx === idx) return;
    setD15Sequence(s => {
      const next = [...s];
      const [moved] = next.splice(d15DragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setD15DragIdx(null);
  };
  const d15Reset = () => {
    setD15Available(CV_shuffle(Array.from({length:15}, (_,i) => ({ id:i+1, color:CV_D15_CAP_COLORS[i+1] }))));
    setD15Sequence([]);
    setD15Analysis('');
    setD15Analyzed(false);
  };
  // (Old d15Analyze function removed — its standalone button is gone. The
  // Vingrys-King-Smith scoring now runs inline inside finishD15 via
  // computeD15Analysis. See the V-K-S module-scope helpers at the top.)

  // ── D-15 polar plot (Vingrys-King-Smith diagnostic plot) ──
  // Plots all 16 caps at their canonical (a*, b*) Lab positions, connects
  // them in the patient's order with a thick polyline, and overlays the
  // three reference confusion lines (protan / deutan / tritan) so the doctor
  // can read defect type at a glance from the orientation of the patient's
  // major axis. The screenshot in the brief shows this exact layout.
  const D15PlotSVG = ({ sequence = d15Sequence, size = 320, showConfusion = true }) => {
    const w = size, h = size;
    // Center the plot on the centroid of cap positions; scale to fit.
    const cx = CV_D15_LAB.reduce((s,p) => s + p.a, 0) / CV_D15_LAB.length;
    const cy = CV_D15_LAB.reduce((s,p) => s + p.b, 0) / CV_D15_LAB.length;
    const maxR = Math.max(...CV_D15_LAB.map(p => Math.hypot(p.a - cx, p.b - cy)));
    const scale = (Math.min(w,h) / 2 - 28) / maxR;
    const toSVG = (lab) => ({
      x: w/2 + (lab.a - cx) * scale,
      y: h/2 - (lab.b - cy) * scale,   // invert b* for screen-y
    });
    const orderIds = [0, ...sequence.map(c => c.id)];
    const valid = sequence.length > 0;

    // Reference confusion-line angles in (a*, b*) Lab space.
    const confusionLines = [
      { name:'protan', angleDeg: 8.8 },
      { name:'deutan', angleDeg: -7.4 },
      { name:'tritan', angleDeg: -82.8 },
    ];

    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display:'block' }}>
        {/* Soft reference circle through the cap radius */}
        <circle cx={w/2} cy={h/2} r={maxR * scale} fill="none" stroke="#f3f4f6" strokeWidth={1}/>

        {/* Confusion-line guides */}
        {showConfusion && confusionLines.map(line => {
          const rad = line.angleDeg * Math.PI / 180;
          // Line length extends slightly beyond the reference circle.
          const len = maxR * scale * 1.05;
          const dx = Math.cos(rad) * len;
          const dy = -Math.sin(rad) * len; // invert for screen
          return (
            <g key={line.name} opacity="0.55">
              <line x1={w/2 - dx} y1={h/2 - dy} x2={w/2 + dx} y2={h/2 + dy}
                    stroke="#9ca3af" strokeWidth={0.8} strokeDasharray="3 3"/>
              <text x={w/2 + dx + 4} y={h/2 + dy - 2}
                    fontSize={9} fill="#6b7280" textAnchor="start" fontWeight="700"
                    fontFamily="'Nunito Sans', sans-serif">{line.name}</text>
            </g>
          );
        })}

        {/* Patient connection polyline */}
        {valid && (
          <polyline
            points={orderIds.map(id => { const p = toSVG(CV_D15_LAB[id]); return `${p.x},${p.y}`; }).join(' ')}
            fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          />
        )}

        {/* Cap markers, labelled */}
        {CV_D15_LAB.map((lab, idx) => {
          const p = toSVG(lab);
          const isPilot = idx === 0;
          return (
            <g key={idx}>
              <rect x={p.x - 7} y={p.y - 7} width={14} height={14} rx={2}
                    fill={CV_D15_CAP_COLORS[idx]}
                    stroke={isPilot ? '#0e2f5e' : '#fff'} strokeWidth={isPilot ? 2 : 1.5}/>
              <text x={p.x} y={p.y - 11}
                    fontSize={9} fontWeight="700" fill="#374151" textAnchor="middle"
                    fontFamily="'Nunito Sans', sans-serif">{isPilot ? 'P' : idx}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  // ── Eye + protocol transition helpers ──
  // Called when the active eye finishes a protocol. Archives the working
  // buffer, then decides whether to:
  //   (a) advance to the NEXT eye in the OD → OS → OU sequence (within same protocol)
  //   (b) prompt to continue to the other protocol (if it hasn't been started)
  //   (c) go straight to the report (this protocol's final eye AND other protocol done)
  const advanceAfterEyePhase = (protocol, archivedIshihara, archivedD15) => {
    const nextEye = nextEyeAfter(currentEye);
    if (nextEye) {
      // Stay in the same protocol; cycle to the next eye phase.
      setTransition({ kind:'eye', nextEye, nextProtocol:protocol });
      return;
    }
    // Final eye phase of this protocol completed (currentEye === 'OU').
    // Check whether the other protocol has been started at all.
    const otherHasResults = (archive) => archive.OD || archive.OS || archive.OU;
    if (protocol === 'ishihara' && !otherHasResults(archivedD15)) {
      setTransition({ kind:'protocol-to-d15' });
      return;
    }
    if (protocol === 'd15' && !otherHasResults(archivedIshihara)) {
      setTransition({ kind:'protocol-to-ishihara' });
      return;
    }
    setTestMode(null);
    setPhase('results');
  };

  const submitAnswer = (resp) => {
    const plate = CV_ISHIHARA_PLATES[currentPlate];
    const correct = getPlateAnswer(plate);
    const result = resp===''?'No Response':resp===correct?'Correct':'Incorrect';
    const newResponses = [...responses, { plate:plate.n, correct, answer:resp||'—', result }];
    setResponses(newResponses);
    setAnswer('');
    if (currentPlate < CV_ISHIHARA_PLATES.length-1) {
      setCurrentPlate(c=>c+1);
      return;
    }
    // Last plate completed for the current eye — archive and decide next.
    const nextIshihara = { ...ishiharaResults, [currentEye]: newResponses };
    setIshiharaResults(nextIshihara);
    advanceAfterEyePhase('ishihara', nextIshihara, d15Results);
  };

  // Pure D-15 analysis function — runs Vingrys-King-Smith (1988) moment-of-
  // inertia scoring synchronously. Returns the human-readable classification
  // label, the analyzed flag, and the full numeric results (VKS indices +
  // defect classification) so the report can render the clinical-grade table.
  const computeD15Analysis = (sequence) => {
    if (sequence.length !== 15) {
      return { analysis:'Place all 15 caps before analyzing.', analyzed:false, vks:null, classification:null };
    }
    // Prepend the pilot (id 0) to form the full 16-element ordering.
    const orderIds = [0, ...sequence.map(c => c.id)];
    const vks = CV_computeVKS(orderIds);
    const cls = CV_classifyD15(vks);
    return { analysis: cls.label, analyzed:true, vks, classification: cls };
  };

  const finishD15 = () => {
    // Validate before archiving — F&R should be disabled until 15 caps are placed,
    // but defend anyway in case of stale onClick.
    if (d15Sequence.length !== 15) return;
    // Compute analysis inline (replaces the old standalone Analyze button).
    const { analysis, analyzed, vks, classification } = computeD15Analysis(d15Sequence);
    // Also mirror to live state so any in-progress sidebar reads stay consistent.
    setD15Analysis(analysis);
    setD15Analyzed(analyzed);
    const snapshot = { sequence:d15Sequence, analysis, analyzed, vks, classification };
    const nextD15 = { ...d15Results, [currentEye]: snapshot };
    setD15Results(nextD15);
    advanceAfterEyePhase('d15', ishiharaResults, nextD15);
  };

  // Transition modal handlers
  const acceptTransition = () => {
    if (!transition) return;
    if (transition.kind === 'eye') {
      const { nextEye, nextProtocol } = transition;
      setCurrentEye(nextEye);
      setTransition(null);
      if (nextProtocol === 'ishihara') {
        setResponses([]);
        setCurrentPlate(0);
        setAnswer('');
        setTestMode('ishihara');
      } else {
        d15Reset();
        setTestMode('d15');
      }
      setPhase('testing');
      return;
    }
    // protocol-to-d15 or protocol-to-ishihara — start the OTHER protocol from
    // its own per-protocol start-eye selection.
    setTransition(null);
    if (transition.kind === 'protocol-to-d15') {
      setCurrentEye(d15StartEye);
      d15Reset();
      setTestMode('d15');
    } else {
      setCurrentEye(ishiharaStartEye);
      setResponses([]);
      setCurrentPlate(0);
      setAnswer('');
      setTestMode('ishihara');
    }
    setPhase('testing');
  };

  const declineTransition = () => {
    setTransition(null);
    setTestMode(null);
    setPhase('results');
  };

  // Transition modal renderer. Position:fixed escapes ExamShell layout, so we
  // simply drop {renderTransitionOverlay()} as the last child of every ExamShell
  // return. ExamShell does not introduce any transform/filter ancestor, so the
  // overlay correctly covers the entire viewport including the ExamShell chrome.
  const renderTransitionOverlay = () => {
    if (!transition) return null;
    const kind = transition.kind;
    const isEye = kind === 'eye';
    const nextEye = transition.nextEye;

    let kicker, title, body, primaryLabel, secondaryLabel;
    if (isEye) {
      kicker = `Eye transition · ${currentEye} → ${nextEye}`;
      const nextEyePhrase = nextEye === 'OD' ? 'right eye' : nextEye === 'OS' ? 'left eye' : 'binocular viewing';
      title = nextEye === 'OU'
        ? 'Switch to binocular pass'
        : `Switch to ${nextEyePhrase}`;
      body = eyePositionInstruction(nextEye) + ' Confirm when ready.';
      primaryLabel = `Ready — start ${nextEye}`;
      secondaryLabel = 'Finish & report';
    } else if (kind === 'protocol-to-d15') {
      kicker = 'Protocol continuation';
      title = 'Continue to D-15 Farnsworth?';
      body = 'The D-15 cap arrangement test classifies the type and severity of any color vision defect detected by Ishihara screening. Run it now to capture both protocols on this report.';
      primaryLabel = 'Continue to D-15';
      secondaryLabel = 'Finish & report';
    } else {
      kicker = 'Protocol continuation';
      title = 'Continue to Ishihara screening?';
      body = 'Ishihara plates screen for red-green color vision deficiency. Run them in the same session to capture both protocols on this report.';
      primaryLabel = 'Continue to Ishihara';
      secondaryLabel = 'Finish & report';
    }

    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(14,47,94,0.55)', backdropFilter:'blur(4px)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Nunito Sans', sans-serif" }}>
        <div role="dialog" aria-modal="true" style={{ width:'100%', maxWidth:520, background:'#fff', borderRadius:18, boxShadow:'0 24px 80px rgba(0,0,0,0.35)', padding:'28px 28px 22px', border:'1.5px solid #e5e7eb' }}>
          {isEye ? (
            // Three-eye progress diagram: OD → OS → OU. Completed phases get a
            // check, the next phase glows in accent, future phases are dimmed.
            // The currently-completed phase (currentEye, which just finished)
            // is shown as completed.
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:14, marginBottom:18 }}>
              {CV_EYE_SEQUENCE.map((side, idx) => {
                const isCompleted = CV_EYE_SEQUENCE.indexOf(currentEye) >= idx;
                const isNext      = side === nextEye;
                const isFuture    = !isCompleted && !isNext;
                const fg = isNext ? accent : isCompleted ? '#10b981' : '#d1d5db';
                const bg = isNext ? `${accent}1a` : isCompleted ? '#dcfce7' : '#f3f4f6';
                const bd = isNext ? `2px solid ${accent}` : isCompleted ? '2px solid #86efac' : '2px solid #e5e7eb';
                return (
                  <React.Fragment key={side}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                      <div style={{ width:56, height:56, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: bg, border: bd, transition:'all 0.2s' }}>
                        {isCompleted ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3" fill={isNext ? accent : 'transparent'}/>
                          </svg>
                        )}
                      </div>
                      <div style={{ fontSize:10, fontWeight:700, color: fg, letterSpacing:'0.06em' }}>{side}{isNext ? ' · NEXT' : isCompleted ? ' · DONE' : ''}</div>
                    </div>
                    {idx < CV_EYE_SEQUENCE.length - 1 && (
                      <div style={{ width:18, height:2, background: isCompleted || (CV_EYE_SEQUENCE[idx+1] === nextEye) ? accent : '#e5e7eb', borderRadius:1, opacity: isFuture ? 0.4 : 1 }}/>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`${accent}1a`, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${accent}` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          )}
          <div style={{ ...CV_VIOLATOR, marginBottom:6, textAlign:'center' }}>{kicker}</div>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#0e2f5e', margin:'0 0 10px', lineHeight:1.3, textAlign:'center' }}>{title}</h2>
          <p style={{ fontSize:13, fontWeight:400, color:'#374151', lineHeight:1.55, margin:'0 0 22px', textAlign:'center' }}>{body}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={acceptTransition} autoFocus style={{ width:'100%', minHeight:48, padding:'13px 18px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 4px 14px ${accent}40`, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {primaryLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <button onClick={declineTransition} style={{ width:'100%', minHeight:44, padding:'11px 18px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{secondaryLabel}</button>
          </div>
        </div>
      </div>
    );
  };

  // (Old working-buffer Ishihara stats removed — the report now reads from
  // archived per-eye results via ishiharaStats(eyeKey). See "Results" block below.)

  const renderD15 = () => (
    <ExamShell
      title="Color Vision — D-15"
      accent={accent}
      onBack={() => { setTestMode(null); setPhase('selection'); d15Reset(); }}
      patientName="Marcus Williams"
      patientId="#4821"
      phase="testing"
      elapsed={elapsed}
      onFinish={d15Sequence.length === 15 ? finishD15 : null}
      rightPanel={
        <div style={{ padding:18, display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <div style={{ ...CV_VIOLATOR, marginBottom:10 }}>Arrangement</div>
            <div style={{ fontSize:26, fontWeight:700, color:'#111827', lineHeight:1, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>{d15Sequence.length} <span style={{ fontSize:14, color:'#9ca3af', fontWeight:400 }}>/ 15</span></div>
            <div style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>Eye: {eyeShortLabel(currentEye)}</div>
            <div style={{ height:6, background:'#f3f4f6', borderRadius:3 }}>
              <div style={{ width:`${(d15Sequence.length/15)*100}%`, height:'100%', background:accent, borderRadius:3, transition:'width 0.3s' }}/>
            </div>
          </div>

          {d15Analyzed && (
            <div style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', padding:12 }}>
              <div style={{ ...CV_VIOLATOR, marginBottom:6 }}>Result</div>
              <div style={{ fontSize:12, fontWeight:400, color:'#374151', lineHeight:1.55 }}>{d15Analysis}</div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ ...CV_VIOLATOR, marginBottom:8 }}>Session notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observations, patient response, anomalies…"
              style={{ minHeight:90, resize:'vertical', fontFamily:"'Nunito Sans', sans-serif", fontSize:12, fontWeight:400, color:'#374151', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#f9fafb', outline:'none', lineHeight:1.5 }}
            />
          </div>
        </div>
      }
    >
      {/* Sub-action-bar: eye-sequence breadcrumb + arrangement count + Reset.
          Analyze is gone — Finish & Report (in the ExamShell header) now runs
          analysis inline and routes to the report. */}
      <div style={{ position:'sticky', top:0, zIndex:5, background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'12px 22px', display:'flex', alignItems:'center', gap:14, minHeight:56 }}>
        <CV_InlineEyePicker
          value={currentEye}
          onChange={(newEye) => { setD15StartEye(newEye); setCurrentEye(newEye); }}
          accent={accent}
          disabled={d15Sequence.length > 0 || !!d15Results.OD || !!d15Results.OS || !!d15Results.OU}
        />
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', lineHeight:1.2 }}>Cap arrangement</div>
          <div style={{ fontSize:11, color:'#9ca3af' }}>{eyeLongLabel(currentEye)}</div>
        </div>
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <CV_EyeBreadcrumb startEye={d15StartEye} currentEye={currentEye} archive={d15Results} accent={accent}/>
        </div>
        <div style={{ fontSize:11, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>{d15Sequence.length} / 15 placed</div>
        <button onClick={d15Reset} style={{ minHeight:36, padding:'7px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Reset</button>
      </div>

      <div style={{ padding:20 }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', lineHeight:1.6, margin:0 }}>
              Arrange the 15 colored caps in order of color similarity, starting from the reference cap. Click any cap to add it to your sequence. Drag caps within the sequence to reorder. Click × to remove.
            </p>
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Reference Cap</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:CV_D15_CAP_COLORS[0], border:'2px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}/>
              <div style={{ fontSize:12, fontWeight:400, color:'#374151', lineHeight:1.55 }}>Reference cap — arrange the remaining 14 caps by color similarity, starting next to this one.</div>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Available Caps</div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Click a cap to add it →</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {d15Available.map(cap => {
                const selected = d15Sequence.some(c => c.id === cap.id);
                return (
                  <button key={cap.id} onClick={() => d15AddCap(cap)} disabled={selected} title={selected ? 'Already placed' : 'Tap to add'} style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'none', border:'none', cursor:selected?'not-allowed':'pointer',
                    opacity:selected?0.25:1, transition:'transform 0.15s', padding:4,
                  }}
                  onMouseEnter={e => !selected && (e.currentTarget.style.transform='scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:cap.color, border:'2px solid rgba(0,0,0,0.08)', boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }}/>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your Order ({d15Sequence.length}/15)</div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Drag to reorder · Click × to remove</div>
            </div>
            {d15Sequence.length === 0 ? (
              <div style={{ fontSize:12, fontWeight:300, color:'#d1d5db', padding:'20px 0', textAlign:'center' }}>No caps selected yet.</div>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {d15Sequence.map((cap,idx) => (
                  <div key={cap.id} draggable
                    onDragStart={d15OnDragStart(idx)}
                    onDragOver={d15OnDragOver(idx)}
                    onDrop={d15OnDrop(idx)}
                    title="Drag to reorder"
                    style={{ display:'flex', alignItems:'center', gap:4, background:'#f9fafb', borderRadius:24, border:'1px solid #e5e7eb', padding:'4px 6px 4px 4px', cursor:'grab', boxShadow:'0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:cap.color, border:'2px solid rgba(0,0,0,0.08)', flexShrink:0 }}/>
                    <button onClick={() => d15RemoveCap(cap.id)} aria-label="Remove" style={{ width:20, height:20, borderRadius:'50%', border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#9ca3af', lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Plot</div>
              {d15Sequence.length>1 ? <D15PlotSVG/> : <div style={{ fontSize:12, fontWeight:300, color:'#d1d5db', padding:'40px 0', textAlign:'center' }}>Add caps to see plot</div>}
            </div>
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Analysis</div>
              <div style={{ background:'#f9fafb', borderRadius:8, padding:14, minHeight:80, marginBottom:16 }}>
                <p style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.6, margin:0 }}>
                  {d15Analysis || 'Place all 15 caps in your preferred order. Click Finish & Report to analyze and view the full report.'}
                </p>
              </div>
              {d15Sequence.length === 15 && (
                <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'10px 12px', borderRadius:8, background:'#f9fafb', border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', textTransform:'uppercase' }}>Patient sequence</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#374151', fontFamily:'ui-monospace, Menlo, monospace', wordBreak:'break-all' }}>{d15Sequence.map(c=>c.id).join(' → ')}</div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>All 15 caps placed. Use <strong>Finish &amp; Report</strong> to analyze and view the report.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {renderTransitionOverlay()}
    </ExamShell>
  );

  // D-15 mode — rendered inline; uses lifted state from ColorVisionTest scope
  if (testMode === 'd15') return renderD15();

  // Selection screen — only when phase is explicitly 'selection'. (Was previously
  // `phase === 'selection' || !testMode`, but that swallowed the results phase
  // when transitions cleared testMode on the way to the report.)
  if (phase === 'selection') return (
    <ExamShell
      title="Color Vision"
      accent={accent}
      onBack={onBack}
      patientName="Marcus Williams"
      patientId="#4821"
      phase="ready"
    >
      <div style={{ padding:'40px 36px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:720 }}>

          {/* Intro */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Examination · pre-flight</div>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#0e2f5e', margin:'0 0 10px', lineHeight:1.15 }}>Select protocol</h1>
            <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:0, lineHeight:1.6 }}>
              Ishihara screens for red-green deficiency · D-15 Farnsworth classifies defect type and severity. Each protocol runs through the OD → OS → OU sequence from your chosen start eye.
            </p>
          </div>

          {/* Protocol cards — each owns its own start-eye choice */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Ishihara */}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24, display:'flex', flexDirection:'column', gap:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                {CV_ISHIHARA_PLATES.slice(0,3).map(p=><CV_IshiharaPlate key={p.n} plate={p} size={64}/>)}
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:6 }}>Ishihara Color Vision Test</div>
                <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', lineHeight:1.55, margin:'0 0 8px' }}>
                  24-plate screening for red-green color vision deficiencies.
                </p>
                <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', textTransform:'uppercase' }}>24 plates · screening</div>
              </div>
              <button onClick={() => {
                setIshiharaStartEye('OD');
                setCurrentEye('OD');
                setResponses([]);
                setCurrentPlate(0);
                setAnswer('');
                setIshiharaResults({ OD:null, OS:null, OU:null });
                setD15Results({ OD:null, OS:null, OU:null });
                setElapsed(0);
                setTestMode('ishihara');
                setPhase('testing');
              }} style={{ width:'100%', minHeight:48, padding:'12px 0', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
                Start Ishihara test
              </button>
            </div>

            {/* D-15 */}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24, display:'flex', flexDirection:'column', gap:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <img src="assets/d15-icon-circle.png" alt="D-15 Color Vision Test" style={{ width:96, height:96, objectFit:'contain' }}/>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:6 }}>Farnsworth D-15 Color Arrangement</div>
                <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', lineHeight:1.55, margin:'0 0 8px' }}>
                  Cap arrangement test for classifying color defect type and severity.
                </p>
                <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', textTransform:'uppercase' }}>15 caps · classification</div>
              </div>
              <button onClick={() => {
                setD15StartEye('OD');
                setCurrentEye('OD');
                d15Reset();
                setIshiharaResults({ OD:null, OS:null, OU:null });
                setD15Results({ OD:null, OS:null, OU:null });
                setElapsed(0);
                setTestMode('d15');
                setPhase('testing');
              }} style={{ width:'100%', minHeight:48, padding:'12px 0', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
                Start D-15 test
              </button>
            </div>
          </div>

        </div>
      </div>
      {renderTransitionOverlay()}
    </ExamShell>
  );

    // Ishihara testing phase
  if (phase === 'testing') {
    const plate = CV_ISHIHARA_PLATES[currentPlate];
    const padKey = (k) => {
      if (k === 'back') setAnswer(a => a.slice(0, -1));
      else if (k === 'submit') submitAnswer(answer);
      else if (answer.length < 2) setAnswer(a => a + k);
    };
    return (
      <ExamShell title="Color Vision — Ishihara" accent={accent} onBack={() => { setPhase('selection'); setTestMode(null); setCurrentPlate(0); setResponses([]); setIshiharaResults({ OD:null, OS:null, OU:null }); setD15Results({ OD:null, OS:null, OU:null }); }}
        phase="testing" elapsed={elapsed}
        onFinish={() => setPhase('results')}
        rightPanel={
          <div style={{ padding:18, display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <div style={{ ...CV_VIOLATOR, marginBottom:10 }}>Progress</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#111827', lineHeight:1, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>{currentPlate+1} <span style={{ fontSize:14, color:'#9ca3af', fontWeight:400 }}>/ {CV_ISHIHARA_PLATES.length}</span></div>
              <div style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>Eye: {eyeShortLabel(currentEye)}</div>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:3 }}>
                <div style={{ width:`${(currentPlate/CV_ISHIHARA_PLATES.length)*100}%`, height:'100%', background:accent, borderRadius:3, transition:'width 0.3s' }}/>
              </div>
            </div>

            <div>
              <div style={{ ...CV_VIOLATOR, marginBottom:8 }}>Recent responses</div>
              {responses.length === 0 ? (
                <div style={{ fontSize:11, color:'#d1d5db' }}>None yet.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {responses.slice(-6).reverse().map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:7, background:r.result==='Correct'?'#f0fdf4':r.result==='Incorrect'?'#fef2f2':'#f9fafb', border:`1px solid ${r.result==='Correct'?'#bbf7d0':r.result==='Incorrect'?'#fecaca':'#e5e7eb'}` }}>
                      <span style={{ fontSize:11, fontWeight:400, color:'#374151' }}>Plate {r.plate}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:r.result==='Correct'?'#16a34a':r.result==='Incorrect'?'#dc2626':'#6b7280', letterSpacing:'0.04em' }}>{r.result.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ ...CV_VIOLATOR, marginBottom:8 }}>Session notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observations, patient response, anomalies…"
                style={{ minHeight:90, resize:'vertical', fontFamily:"'Nunito Sans', sans-serif", fontSize:12, fontWeight:400, color:'#374151', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#f9fafb', outline:'none', lineHeight:1.5 }}
              />
            </div>
          </div>
        }
      >
        {/* Sub-action-bar: eye-sequence breadcrumb + plate progress. Mirrors
            the D-15 sub-bar so the testing UIs feel homogenous. */}
        <div style={{ position:'sticky', top:0, zIndex:5, background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'12px 22px', display:'flex', alignItems:'center', gap:14, minHeight:56 }}>
          <CV_InlineEyePicker
            value={currentEye}
            onChange={(newEye) => { setIshiharaStartEye(newEye); setCurrentEye(newEye); }}
            accent={accent}
            disabled={responses.length > 0 || !!ishiharaResults.OD || !!ishiharaResults.OS || !!ishiharaResults.OU}
          />
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', lineHeight:1.2 }}>Plate {plate.n} of {CV_ISHIHARA_PLATES.length}</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>{eyeLongLabel(currentEye)}</div>
          </div>
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <CV_EyeBreadcrumb startEye={ishiharaStartEye} currentEye={currentEye} archive={ishiharaResults} accent={accent}/>
          </div>
          <div style={{ fontSize:11, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>{currentPlate+1} / {CV_ISHIHARA_PLATES.length}</div>
        </div>

        <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
          <CV_IshiharaPlate plate={plate} size={240} simulatedNumber={getSimulatedNumber(plate)}/>
          <div style={{ fontSize:13, fontWeight:400, color:'#6b7280' }}>What number does the patient see?</div>

          {/* Answer display */}
          <div style={{ minWidth:220, height:64, borderRadius:12, border:`2px solid ${answer ? accent : '#e5e7eb'}`, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:700, color:answer ? '#111827' : '#d1d5db', fontVariantNumeric:'tabular-nums', letterSpacing:'0.08em', padding:'0 24px', transition:'border-color 0.15s' }}>
            {answer || '–'}
          </div>

          {/* Number pad */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 64px)', gap:8 }}>
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} onClick={() => padKey(d)} style={{ width:64, height:64, borderRadius:12, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:22, fontWeight:700, color:'#0e2f5e', cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.1s' }}
                onMouseDown={e => { e.currentTarget.style.background = `${accent}10`; e.currentTarget.style.borderColor = accent; }}
                onMouseUp={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >{d}</button>
            ))}
            <button onClick={() => padKey('back')} disabled={!answer} title="Backspace" style={{ width:64, height:64, borderRadius:12, border:'1.5px solid #e5e7eb', background:'#f9fafb', fontSize:18, fontWeight:700, color:answer?'#374151':'#d1d5db', cursor:answer?'pointer':'not-allowed', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H7M7 12l5-5M7 12l5 5"/><rect x="2" y="5" width="5" height="14" rx="1"/></svg>
            </button>
            <button onClick={() => padKey('0')} style={{ width:64, height:64, borderRadius:12, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:22, fontWeight:700, color:'#0e2f5e', cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>0</button>
            <button onClick={() => padKey('submit')} disabled={!answer} style={{ width:64, height:64, borderRadius:12, border:'none', background:answer ? `linear-gradient(135deg,${accent},#155bcc)` : '#e5e7eb', color:answer?'#fff':'#9ca3af', fontSize:18, fontWeight:700, cursor:answer?'pointer':'not-allowed', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', boxShadow:answer?`0 3px 10px ${accent}40`:'none' }} title="Submit">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </button>
          </div>

          {/* No response button */}
          <button onClick={() => submitAnswer('')} style={{ marginTop:4, minHeight:44, padding:'10px 22px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>No response</button>
        </div>
        {renderTransitionOverlay()}
      </ExamShell>
    );
  }

  // ── Results — cumulative across protocols and eyes ──
  const now = new Date();
  const fullEyeLabel = (e) => CV_EYE_LONG[e] || e;

  // All three possible eye phases per protocol.
  const eyesIshihara = CV_EYE_SEQUENCE.filter(e => ishiharaResults[e]);
  const eyesD15      = CV_EYE_SEQUENCE.filter(e => d15Results[e]);
  const eyesTested   = Array.from(new Set([...eyesIshihara, ...eyesD15]));

  const protocolsRun = [];
  if (eyesIshihara.length) protocolsRun.push('Ishihara');
  if (eyesD15.length)      protocolsRun.push('D-15 Farnsworth');

  const eyesTestedLabel =
    eyesTested.length === 0 ? '—'
    : eyesTested.length === 1 ? fullEyeLabel(eyesTested[0])
    : eyesTested.join(', ');
  const protocolLabel = protocolsRun.length ? protocolsRun.join(' · ') : '—';

  // Per-eye Ishihara stats helper
  const ishiharaStats = (eyeKey) => {
    const resps = ishiharaResults[eyeKey];
    if (!resps) return null;
    const correct = resps.filter(r => r.result === 'Correct').length;
    const noResp  = resps.filter(r => r.result === 'No Response').length;
    const totalR  = resps.length;
    const sc = totalR ? Math.round(correct/totalR*100) : 0;
    const band = sc >= 85 ? 'Normal color vision' : sc >= 60 ? 'Borderline' : 'Deficiency detected';
    const bandBg = sc >= 85 ? '#dcfce7' : sc >= 60 ? '#fef3c7' : '#fee2e2';
    const bandFg = sc >= 85 ? '#10b981' : sc >= 60 ? '#b45309' : '#ef4444';
    return { resps, correct, noResp, totalR, score: sc, band, bandBg, bandFg };
  };

  // PATIENT CLASSIFICATION: clinically driven by the WORST MONOCULAR eye (OD or OS).
  // OU is binocular function — informative but not used for the monocular diagnosis.
  const ishiharaMonocularEyes = eyesIshihara.filter(e => e !== 'OU');
  const ishiharaOUstats = ishiharaResults.OU ? ishiharaStats('OU') : null;
  const worstMonocularStats = ishiharaMonocularEyes.length
    ? ishiharaMonocularEyes.map(e => ishiharaStats(e)).reduce((a,b) => a.score <= b.score ? a : b)
    : null;
  const patientClassification = worstMonocularStats ? {
    band:   worstMonocularStats.band,
    bandBg: worstMonocularStats.bandBg,
    bandFg: worstMonocularStats.bandFg,
    score:  worstMonocularStats.score,
    eye:    ishiharaMonocularEyes.find(e => ishiharaStats(e).score === worstMonocularStats.score),
  } : null;

  const cumulativeClinicalInterp = (() => {
    if (!protocolsRun.length) return 'No data captured yet. Complete plates to generate a clinical interpretation.';
    const parts = [];
    if (eyesIshihara.length) {
      const lines = eyesIshihara.map(e => {
        const s = ishiharaStats(e);
        const tag = e === 'OU' ? ' (binocular)' : '';
        return `${fullEyeLabel(e)}${tag} ${s.score}% (${s.correct}/${s.totalR}) — ${s.band.toLowerCase()}`;
      });
      parts.push(`Ishihara: ${lines.join('; ')}.`);
    }
    if (eyesD15.length) {
      const lines = eyesD15.map(e => {
        const tag = e === 'OU' ? ' (binocular)' : '';
        return `${fullEyeLabel(e)}${tag} — ${d15Results[e].analysis || 'not analyzed.'}`;
      });
      parts.push(`D-15 Farnsworth: ${lines.join('; ')}`);
    }
    if (patientClassification) {
      if (patientClassification.score >= 60) {
        parts.push(`D-15 Farnsworth recommended for defect classification.`);
      } else {
        parts.push(`D-15 Farnsworth recommended to classify defect type (Protan / Deutan / Tritan).`);
      }
    }
    return parts.join(' ');
  })();

  const resetAllAndSelection = () => {
    setPhase('selection');
    setTestMode(null);
    setCurrentEye('OD');
    setCurrentPlate(0);
    setResponses([]);
    setIshiharaResults({ OD:null, OS:null, OU:null });
    setD15Results({ OD:null, OS:null, OU:null });
    setElapsed(0);
    setNotes('');
    setTransition(null);
    d15Reset();
  };

  return (
    <ExamShell title="Color Vision — Results" accent={accent} onBack={onBack}
      phase="report"
      onNewTest={resetAllAndSelection}
    >
      <div style={{ maxWidth:980, margin:'0 auto', padding:'24px 32px 32px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* Report header */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'22px 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div>
              <div style={{ ...CV_VIOLATOR, marginBottom:6 }}>Test report</div>
              <h2 style={{ fontSize:24, fontWeight:700, color:'#0e2f5e', margin:'0 0 4px', lineHeight:1.2, fontFamily:"'Nunito Sans', sans-serif" }}>Color Vision Test Report</h2>
              <div style={{ fontSize:12, color:'#374151' }}>Marcus Williams · #4821 · {eyesTestedLabel} · {protocolLabel}</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ minHeight:44, padding:'10px 18px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:8, boxShadow:`0 3px 12px ${accent}40` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Export report
              </button>
              <button style={{ minHeight:44, padding:'10px 16px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Compare</button>
            </div>
          </div>
        </div>

        {/* Patient Classification banner — worst-monocular-eye verdict + binocular note.
            Only renders when at least one monocular Ishihara eye was screened.
            This is the at-a-glance clinical bottom line; the per-eye score cards
            and the prose clinical interpretation below give the supporting detail. */}
        {patientClassification && (
          <div style={{ background:'#fff', borderRadius:14, border:`1.5px solid ${patientClassification.bandFg}33`, padding:'22px 24px', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ ...CV_REPORT_LABEL, marginBottom:6 }}>Patient Classification</div>
              <div style={{ fontSize:24, fontWeight:700, color:patientClassification.bandFg, lineHeight:1.1 }}>{patientClassification.band}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, paddingLeft:24, borderLeft:`1px solid ${patientClassification.bandFg}33` }}>
              <div style={{ fontSize:11, fontWeight:400, color:'#9ca3af' }}>Driven by worst monocular eye</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{fullEyeLabel(patientClassification.eye)} · {patientClassification.score}%</div>
              {ishiharaOUstats && (
                <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', marginTop:6 }}>
                  Binocular function (OU): <strong style={{ color:ishiharaOUstats.bandFg }}>{ishiharaOUstats.band}</strong> at {ishiharaOUstats.score}%
                </div>
              )}
            </div>
            <span style={{ padding:'8px 14px', borderRadius:18, background:patientClassification.bandBg, color:patientClassification.bandFg, fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{patientClassification.band}</span>
          </div>
        )}

        {/* Per-eye Ishihara score cards (one per eye that was screened) */}
        {eyesIshihara.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${eyesIshihara.length}, 1fr)`, gap:16 }}>
            {eyesIshihara.map(eyeKey => {
              const s = ishiharaStats(eyeKey);
              return (
                <div key={eyeKey} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ ...CV_REPORT_LABEL, marginBottom:0 }}>{fullEyeLabel(eyeKey)}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.06em', textTransform:'uppercase' }}>Ishihara</div>
                  </div>
                  <div style={{ fontSize:56, fontWeight:700, color:s.bandFg, lineHeight:1, marginBottom:8, fontVariantNumeric:'tabular-nums' }}>{s.score}%</div>
                  <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>{s.correct} of {s.totalR} plates correct{s.noResp > 0 ? ` · ${s.noResp} no response` : ''}</div>
                  <span style={{ display:'inline-block', padding:'5px 12px', borderRadius:14, background:s.bandBg, color:s.bandFg, fontSize:11, fontWeight:700, letterSpacing:'0.04em' }}>{s.band}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Clinical interpretation (synthesized across eyes + protocols) */}
        <div style={{ background:`${accent}0F`, borderRadius:14, border:`1.5px solid ${accent}33`, padding:'22px 24px' }}>
          <div style={{ ...CV_REPORT_LABEL, color:accent, marginBottom:8 }}>Clinical Interpretation</div>
          <p style={{ fontSize:14, lineHeight:1.55, color:'#111827', margin:0, fontWeight:400 }}>{cumulativeClinicalInterp}</p>
          <div style={{ fontSize:10, color:'#9ca3af', marginTop:12, fontStyle:'italic' }}>Informational only — not a clinical diagnosis.</div>
        </div>

        {/* Patient info */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'22px 24px' }}>
          <div style={CV_REPORT_LABEL}>Patient Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18 }}>
            {[['Name','Marcus Williams'],['Date of birth','10/11/1983'],['Patient ID','#4821'],['Exam date', now.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})]].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize:11, fontWeight:400, color:'#9ca3af', marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18, marginTop:16, paddingTop:16, borderTop:'1px solid #e5e7eb' }}>
            {[['Protocols', protocolLabel],['Eyes tested', eyesTestedLabel],['Test duration', fmtTime(elapsed)],['Clinician','Dr. Smith']].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize:11, fontWeight:400, color:'#9ca3af', marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ishihara plate-by-plate — section per eye */}
        {eyesIshihara.map(eyeKey => {
          const s = ishiharaStats(eyeKey);
          return (
            <div key={`ishi-${eyeKey}`} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'22px 24px' }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ ...CV_REPORT_LABEL, marginBottom:0 }}>Plate-by-Plate Results — {fullEyeLabel(eyeKey)}</div>
                <div style={{ fontSize:11, fontWeight:700, color:s.bandFg, letterSpacing:'0.04em' }}>{s.score}% · {s.correct}/{s.totalR}</div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1.5px solid #e5e7eb' }}>
                    {['Plate','Correct answer','Patient response','Result'].map(h => (
                      <th key={h} style={{ ...CV_REPORT_LABEL, marginBottom:0, textAlign:'left', padding:'8px 10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.resps.map((r,i) => {
                    const passed = r.result === 'Correct';
                    const noResp = r.result === 'No Response';
                    const badgeBg = passed?'#dcfce7':noResp?'#f3f4f6':'#fee2e2';
                    const badgeFg = passed?'#16a34a':noResp?'#6b7280':'#dc2626';
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid #e5e7eb', background:passed?'transparent':noResp?'#fafafa':'#fef2f2' }}>
                        <td style={{ padding:'10px 10px', fontSize:13, color:'#111827', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>#{r.plate}</td>
                        <td style={{ padding:'10px 10px', fontSize:13, color:'#374151', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{r.correct}</td>
                        <td style={{ padding:'10px 10px', fontSize:13, color:'#374151', fontWeight:400, fontVariantNumeric:'tabular-nums' }}>{r.answer}</td>
                        <td style={{ padding:'10px 10px' }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:10, background:badgeBg, color:badgeFg, letterSpacing:'0.06em' }}>{r.result.toUpperCase()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* D-15 Farnsworth results — section per eye. Full Vingrys & King-Smith
            (1988) clinical readout: 6-index table, reference population, polar
            diagnostic plot with confusion lines, and severity strip. */}
        {eyesD15.length > 0 && (
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'22px 24px' }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ ...CV_REPORT_LABEL, marginBottom:0 }}>D-15 Farnsworth Results</div>
              <div style={{ fontSize:10, color:'#9ca3af', fontStyle:'italic' }}>Vingrys & King-Smith (1988) moment-of-inertia scoring</div>
            </div>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 18px', lineHeight:1.5 }}>
              Calibration note: results assume calibrated headset optics. Tablet preview is for protocol demonstration only.
            </p>

            {eyesD15.map((eyeKey, blockIdx) => {
              const d = d15Results[eyeKey];
              const v = d.vks;
              const c = d.classification;
              const cIndex = v ? (v.majorR / CV_D15_PERFECT.majorR) : null;
              // Severity bar position: map C-index 1.0..4.0 to 0..100%
              const sevPct = cIndex !== null ? Math.min(100, Math.max(0, ((cIndex - 1.0) / 3.0) * 100)) : 0;
              const sevColor = c?.severity === 'Slight' ? '#10b981' : c?.severity === 'Moderate' ? '#b45309' : '#ef4444';
              const sevBg    = c?.severity === 'Slight' ? '#dcfce7' : c?.severity === 'Moderate' ? '#fef3c7' : '#fee2e2';

              return (
                <div key={`d15-${eyeKey}`} style={{ paddingTop: blockIdx > 0 ? 24 : 0, borderTop: blockIdx > 0 ? '1px solid #f3f4f6' : 'none', marginTop: blockIdx > 0 ? 24 : 0 }}>
                  {/* Eye header + classification badge */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, gap:16 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#0e2f5e' }}>{fullEyeLabel(eyeKey)}</div>
                      <div style={{ fontSize:13, color:'#374151', marginTop:4, fontWeight:400 }}>{c?.label || d.analysis}</div>
                    </div>
                    {c && (
                      <span style={{ padding:'6px 14px', borderRadius:18, background:sevBg, color:sevColor, fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{c.severity}</span>
                    )}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:24, alignItems:'start' }}>
                    {/* Left column: indices + reference + severity */}
                    <div>
                      {/* Patient's V-K-S indices */}
                      <div style={{ ...CV_REPORT_LABEL, marginBottom:8 }}>Patient indices</div>
                      <div style={{ overflowX:'auto', marginBottom:16 }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontVariantNumeric:'tabular-nums' }}>
                          <thead>
                            <tr style={{ borderBottom:`1.5px solid ${accent}33` }}>
                              {['Angle','Major','Minor','TES','S-index','C-index'].map(h => (
                                <th key={h} style={{ fontSize:10, fontWeight:700, color:accent, textAlign:'left', padding:'6px 8px', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom:'1px solid #f3f4f6' }}>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{v ? `${v.angleDeg >= 0 ? '+' : ''}${v.angleDeg.toFixed(1)}°` : '—'}</td>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{v ? v.majorR.toFixed(1) : '—'}</td>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{v ? v.minorR.toFixed(1) : '—'}</td>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{v ? v.TES.toFixed(1) : '—'}</td>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{v ? v.sIndex.toFixed(2) : '—'}</td>
                              <td style={{ fontSize:13, fontWeight:700, color:'#111827', padding:'10px 8px' }}>{cIndex !== null ? cIndex.toFixed(2) : '—'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Severity strip */}
                      <div style={{ ...CV_REPORT_LABEL, marginBottom:8 }}>Severity</div>
                      <div style={{ position:'relative', height:32, marginBottom:6, borderRadius:6, overflow:'hidden', background:'linear-gradient(to right, #dcfce7 0%, #dcfce7 16.6%, #fef3c7 16.6%, #fef3c7 66.6%, #fee2e2 66.6%, #fee2e2 100%)', border:'1px solid #e5e7eb' }}>
                        {cIndex !== null && (
                          <div style={{ position:'absolute', left:`${sevPct}%`, top:0, bottom:0, width:3, background:'#0e2f5e', transform:'translateX(-1.5px)', boxShadow:'0 0 0 2px white' }}/>
                        )}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.04em' }}>
                        <span>Slight</span><span>Moderate</span><span>Strong</span>
                      </div>

                      {/* Reference population */}
                      <div style={{ ...CV_REPORT_LABEL, marginTop:16, marginBottom:8 }}>Reference values (Vingrys &amp; King-Smith 1988)</div>
                      <div style={{ overflowX:'auto', background:'#f9fafb', borderRadius:8, border:'1px solid #e5e7eb', padding:'4px 0' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontVariantNumeric:'tabular-nums' }}>
                          <thead>
                            <tr>
                              {['Population','Angle','Major','Minor','TES','S','C'].map(h => (
                                <th key={h} style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textAlign:'left', padding:'6px 8px', letterSpacing:'0.04em', textTransform:'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {CV_D15_REFERENCE.map(r => (
                              <tr key={r.label} style={{ borderTop:'1px solid #f3f4f6' }}>
                                <td style={{ fontSize:11, fontWeight:700, color:'#111827', padding:'6px 8px' }}>{r.label}</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.angle}°</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.major}</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.minor}</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.TES}</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.s}</td>
                                <td style={{ fontSize:11, fontWeight:400, color:'#374151', padding:'6px 8px' }}>{r.c}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right column: diagnostic plot */}
                    <div>
                      <div style={{ ...CV_REPORT_LABEL, marginBottom:8 }}>Diagnostic plot</div>
                      <div style={{ background:'#fafafa', borderRadius:10, border:'1px solid #e5e7eb', padding:12 }}>
                        <D15PlotSVG sequence={d.sequence} size={300}/>
                      </div>
                      <p style={{ fontSize:10, color:'#9ca3af', margin:'8px 4px 0', lineHeight:1.5 }}>
                        Caps drawn at their canonical CIE a*-b* positions; thick line traces the patient's order from the pilot (P). Dashed reference lines indicate the orientation patients with Protan / Deutan / Tritan defects would arrange along.
                      </p>
                    </div>
                  </div>

                  {/* Patient sequence below */}
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #f3f4f6' }}>
                    <div style={{ ...CV_REPORT_LABEL, marginBottom:6 }}>Patient sequence</div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#374151', fontFamily:'ui-monospace, Menlo, monospace', wordBreak:'break-all' }}>P → {d.sequence.map(c => c.id).join(' → ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
          <button onClick={resetAllAndSelection} style={{ minHeight:44, padding:'11px 22px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New test</button>
          <button onClick={onBack} style={{ minHeight:44, padding:'11px 24px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 4px 14px ${accent}40`, display:'flex', alignItems:'center', gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Certify &amp; close
          </button>
        </div>
      </div>
      {renderTransitionOverlay()}
    </ExamShell>
  );
}

Object.assign(window, { ColorVisionTest });
