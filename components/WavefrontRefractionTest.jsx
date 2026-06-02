// WavefrontRefractionTest.jsx — Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Two-stage refraction: Stage 1 Objective (wavefront capture) → Stage 2 Subjective (liquid-lens phoropter)
// Built from: WavefrontAberrometryTest.jsx (capture state machine, wavefront map, data table, report)
//           + RefractionAndContrast.jsx RefractionTest (live eye-scan look & feel for objective capture)
//           + VisualAcuityTest.jsx (chart, corrected/uncorrected, additive VA notation for subjective)
// Supersedes WavefrontAberrometryTest.jsx — does NOT replace it (the aberrometry test stays in the catalog).
//
// Conforms to the xoExam Component Interface Contract:
//   - props { onBack, tweaks } · wraps every phase in <ExamShell> · Cancel UX owned by ExamShell
//   - ExamShell phases: ready (entry) · testing (objective + subjective) · report
//   - bilateral objective capture OD → OS · monocular only (no OU averaging)
//   - all top-level identifiers prefixed WFR_ to avoid Babel global-scope collisions
//   - sentence-case UI labels · title-case formal report headers · solid accent (no gradients)
//   - no clinical claims in the report (data only — doctor interprets)
//   - exports: Object.assign(window, { WavefrontRefractionTest })


// ════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════
// Objective wavefront results per eye. HOA values referenced to a 6.0 mm
// analysis diameter (published HOA norms assume a 6 mm aperture).
const WFR_OBJ = {
  OD: { sph:-1.25, cyl:-0.50, axis:165, pupilSize:6.2, analysisDia:6.0, scans:2, rmsHOA:0.261, comaRMS:0.163, sphAb:0.087 },
  OS: { sph:-1.50, cyl:-0.75, axis:170, pupilSize:6.3, analysisDia:6.0, scans:1, rmsHOA:0.284, comaRMS:0.187, sphAb:0.092 },
};
const WFR_MAX_SCANS = 3;

// VA chart lines — Snellen ladder. fs = on-screen reference size.
const WFR_VA_LINES = [
  { n:1,  va:'20/200', letters:['E'],                              fs:120 },
  { n:2,  va:'20/100', letters:['F','P'],                          fs:96  },
  { n:3,  va:'20/70',  letters:['T','O','Z'],                      fs:78  },
  { n:4,  va:'20/50',  letters:['L','P','E','D'],                  fs:62  },
  { n:5,  va:'20/40',  letters:['P','E','C','F','D'],              fs:52  },
  { n:6,  va:'20/30',  letters:['E','D','F','C','Z','P'],          fs:44  },
  { n:7,  va:'20/25',  letters:['F','E','L','O','P','Z','D'],      fs:38  },
  { n:8,  va:'20/20',  letters:['D','E','F','P','O','T','E','C'],  fs:32  },
  { n:9,  va:'20/15',  letters:['L','E','F','O','D','P','C','T'],  fs:26  },
  { n:10, va:'20/10',  letters:['F','D','P','L','T','C','E','O'],  fs:22  },
];

// ── Design tokens (WFR_-prefixed; never reuse VisualAcuityTest's bare C/FS) ──
const WFR_C = {
  navy:'#0e2f5e', text:'#111827', text2:'#374151', muted:'#9ca3af',
  surface:'#f9fafb', card:'#ffffff', border:'#e5e7eb',
  success:'#10b981', amber:'#d97706', error:'#dc2626',
};
const WFR_FONT = "'Nunito Sans', sans-serif";
const WFR_REPORT_LABEL = { fontSize:13, fontWeight:700, color:'#111827', letterSpacing:0 };
const WFR_VIOLATOR = { fontSize:11, fontWeight:700, color:WFR_C.muted, letterSpacing:'0.08em', textTransform:'uppercase' };

const WFR_EYE_NAMED = { OD:'Right eye (OD)', OS:'Left eye (OS)' };

// ── Rx format helpers (non-negotiable: signed + 2 dp; axis integer + °) ──
const WFR_fmtSph = v => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2));
const WFR_fmtCyl = v => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2));
const WFR_fmtAxis = v => `${Math.round(((v % 180) + 180) % 180) || 180}°`;
const WFR_fmtAdd = v => (v > 0 ? `+${v.toFixed(2)} D` : '—');

// Clinical line-pass rule: more than half correct (50% fail threshold,
// pending standards validation — see briefs/WavefrontRefraction_Clinical_Spec_v1.md §TBD).
const WFR_lineIsPassed = (correct, total) => total > 0 && correct > total / 2;

// Optotype renderer (shared shape with VisualAcuityTest's VA_Optotype).
// 'E' = Snellen tumbling E (3 bars + spine); 'C' = Landolt C (ring with gap).
// The patient reports the ORIENTATION — used for children, non-literate, and
// non-Latin-script patients. Rotation 0 = E legs / C gap face right.
const WFR_OPTO_ROT = [0, 90, 180, 270];
function WFR_Optotype({ kind, size, rotation = 0, color }) {
  const rot = { transform: `rotate(${rotation}deg)`, display: 'block' };
  if (kind === 'C') {
    const cx = 2.5, cy = 2.5, R = 2.1, r = 1.15, gap = 42;
    const a0 = (gap / 2) * Math.PI / 180, a1 = (360 - gap / 2) * Math.PI / 180;
    const pt = (a, rad) => `${(cx + rad * Math.cos(a)).toFixed(3)} ${(cy + rad * Math.sin(a)).toFixed(3)}`;
    const d = `M ${pt(a0, R)} A ${R} ${R} 0 1 1 ${pt(a1, R)} L ${pt(a1, r)} A ${r} ${r} 0 1 0 ${pt(a0, r)} Z`;
    return <svg width={size} height={size} viewBox="0 0 5 5" style={rot}><path d={d} fill={color}/></svg>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 5 5" style={rot}>
      <g fill={color}>
        <rect x="0" y="0" width="1" height="5"/>
        <rect x="0" y="0" width="5" height="1"/>
        <rect x="0" y="2" width="5" height="1"/>
        <rect x="0" y="4" width="5" height="1"/>
      </g>
    </svg>
  );
}

// ── Wavefront false-color map (standard blue→green→red convention) ──
function WFR_getWFColor(v) {
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
function WFR_makeGrid() {
  return Array.from({ length:17 }, (_, r) =>
    Array.from({ length:17 }, (_, c) => {
      const d = Math.sqrt((r-8)**2 + (c-8)**2);
      if (d > 8) return null;
      return Math.round((Math.random()*60) - 30);
    })
  );
}
const WFR_GRIDS = { OD: WFR_makeGrid(), OS: WFR_makeGrid() };


// ════════════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ════════════════════════════════════════════════════════════════════════

// Eye-sequence breadcrumb: done ✓ (green) · current (accent) · pending (gray)
function WFR_EyeBreadcrumb({ sequence, currentEye, completedSet, accent }) {
  if (!sequence || sequence.length <= 1) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {sequence.map((eye, i) => {
        const isDone = completedSet.has(eye);
        const isCurrent = eye === currentEye && !isDone;
        return (
          <React.Fragment key={eye}>
            <div style={{
              display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:14,
              background: isDone ? '#f0fdf4' : isCurrent ? `${accent}12` : '#f3f4f6',
              border:`1.5px solid ${isDone ? '#bbf7d0' : isCurrent ? accent : '#e5e7eb'}`,
              opacity: (!isDone && !isCurrent) ? 0.55 : 1
            }}>
              {isDone && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
              <span style={{ fontSize:11, fontWeight:700, color: isDone ? '#047857' : isCurrent ? accent : '#6b7280' }}>{eye}</span>
            </div>
            {i < sequence.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Full-screen modal between OD-complete and OS-init.
function WFR_TransitionPrompt({ sequence, currentEye, completedSet, onContinue, accent }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'#fff', borderRadius:18, padding:'34px 36px 28px', maxWidth:500, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', fontFamily:WFR_FONT }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <WFR_EyeBreadcrumb sequence={sequence} currentEye={currentEye} completedSet={completedSet} accent={accent}/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 10px', textAlign:'center' }}>
          Continue to {currentEye === 'OS' ? 'left' : 'right'} eye ({currentEye})
        </h3>
        <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:'0 0 22px', lineHeight:1.55, textAlign:'center' }}>
          Cover the patient's {currentEye === 'OS' ? 'right' : 'left'} eye with the occluder and align the {currentEye === 'OS' ? 'left' : 'right'} eye with the eyepiece. The system will recalibrate and recapture wavefront measurements.
        </p>
        <button onClick={onContinue} autoFocus style={{ width:'100%', minHeight:48, padding:'12px 20px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, boxShadow:`0 3px 12px ${accent}40` }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// Live eye-scan stage — ported from RefractionTest. Dark viewer (clinically
// appropriate — headset interior), breathing pupil, sweep line, centering
// ring, and a red alignment dot that turns the backdrop green once locked.
function WFR_EyeScanStage({ scanFrame, scanning, aligned, accent, size=240 }) {
  const pupilR = 26 + Math.sin(scanFrame * 0.12) * 3;
  const scanY = (scanFrame * 2.4) % size;
  const ringGreen = aligned && scanning;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', position:'relative', overflow:'hidden',
      background:'#1a0f0a', cursor:'default',
      border:`3px solid ${ringGreen ? '#10b981' : accent + '80'}`,
      boxShadow: ringGreen ? '0 0 0 4px rgba(16,185,129,0.18)' : `0 0 0 4px ${accent}14`,
      transition:'border-color 0.3s, box-shadow 0.3s'
    }}>
      {/* iris */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 40% 35%, #8B6914, #3d2b1f 42%, #160c07)' }}/>
      {/* pupil */}
      <div style={{ position:'absolute', top:'50%', left:'50%', width:pupilR*2, height:pupilR*2, borderRadius:'50%', background:'#000', transform:'translate(-50%,-50%)' }}>
        <div style={{ position:'absolute', top:'16%', left:'20%', width:'20%', height:'20%', borderRadius:'50%', background:'rgba(255,255,255,0.55)' }}/>
      </div>
      {/* alignment crosshair dot */}
      <div style={{ position:'absolute', top:'50%', left:'50%', width:9, height:9, borderRadius:'50%', transform:'translate(-50%,-50%)', background: ringGreen ? '#10b981' : '#ff3b3b', boxShadow:`0 0 8px ${ringGreen ? '#10b981' : '#ff3b3b'}`, transition:'background 0.3s' }}/>
      {/* sweep line */}
      {scanning && <div style={{ position:'absolute', left:0, right:0, height:2, top:scanY, background:`${accent}cc`, pointerEvents:'none' }}/>}
      {/* centering ring */}
      {scanning && <div style={{ position:'absolute', inset:18, borderRadius:'50%', border:`2px dashed ${(ringGreen ? '#10b981' : accent)}66`, animation:'wfrspin 3s linear infinite' }}/>}
      {/* reticle */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.5 }}>
        <line x1="50" y1="6" x2="50" y2="20" stroke={accent} strokeWidth="0.8"/>
        <line x1="50" y1="80" x2="50" y2="94" stroke={accent} strokeWidth="0.8"/>
        <line x1="6" y1="50" x2="20" y2="50" stroke={accent} strokeWidth="0.8"/>
        <line x1="80" y1="50" x2="94" y2="50" stroke={accent} strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

// Wavefront color map disc with optional 3 mm / 5 mm ring overlay.
function WFR_WavefrontGrid({ grid, size=220, rings=false }) {
  if (!grid) return null;
  const c = size / 2;
  // 17×17 grid spans ~16 mm equiv across the disc; map mm radius to px.
  const pxPerMM = (size / 2) / 3.4; // disc edge ≈ 3.4 mm radius (6.8 mm pupil)
  return (
    <div style={{ width:size, height:size, position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden' }}>
        <svg width={size} height={size} viewBox="0 0 170 170">
          {grid.map((row, r) => row.map((val, cc) => {
            if (val === null) return null;
            return <rect key={`${r}-${cc}`} x={cc*10} y={r*10} width={10} height={10} fill={WFR_getWFColor(val)} opacity={0.92}/>;
          }))}
        </svg>
      </div>
      {rings && (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <circle cx={c} cy={c} r={1.5 * pxPerMM} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="5 4"/>
          <circle cx={c} cy={c} r={2.5 * pxPerMM} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="5 4"/>
          <text x={c} y={c - 1.5*pxPerMM - 4} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" style={{ paintOrder:'stroke', stroke:'#000', strokeWidth:3 }}>3 mm</text>
          <text x={c} y={c - 2.5*pxPerMM - 4} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" style={{ paintOrder:'stroke', stroke:'#000', strokeWidth:3 }}>5 mm</text>
        </svg>
      )}
    </div>
  );
}

function WFR_CentroidImage({ size=220 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#f3f4f6', overflow:'hidden', flexShrink:0 }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {Array.from({ length:12 }).map((_, r) => Array.from({ length:12 }).map((_, c) => {
          const x = 20 + c*14, y = 20 + r*14;
          const d = Math.sqrt((x-110)**2 + (y-110)**2);
          if (d > 92) return null;
          const dx = (Math.random()-0.5)*9, dy = (Math.random()-0.5)*9;
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

function WFR_PupilImage({ size=220 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#1a0f0a', border:'2px solid rgba(0,0,0,0.15)', overflow:'hidden', flexShrink:0 }}>
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
  );
}

function WFR_ColorScaleLegend({ width=280 }) {
  const stops = ['rgb(85,136,255)','rgb(85,204,255)','rgb(57,255,85)','rgb(204,255,85)','rgb(255,238,85)','rgb(255,187,85)','rgb(255,136,85)','rgb(255,85,85)','rgb(255,41,117)'];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, marginTop:6 }}>
      <div style={{ width, height:10, borderRadius:5, background:`linear-gradient(to right, ${stops.join(', ')})`, border:'1px solid #e5e7eb' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', width, fontSize:10, fontWeight:600, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>
        <span>−60 μm</span><span>0</span><span>+60 μm</span>
      </div>
    </div>
  );
}

// Navy-headed objective measurement table.
function WFR_MeasTable({ eyeKeys }) {
  const navy = WFR_C.navy;
  const rows = [
    ['Sphere',               eyeKeys.map(k => `${WFR_fmtSph(WFR_OBJ[k].sph)} D`)],
    ['Cylinder',             eyeKeys.map(k => `${WFR_fmtCyl(WFR_OBJ[k].cyl)} D`)],
    ['Axis',                 eyeKeys.map(k => WFR_fmtAxis(WFR_OBJ[k].axis))],
    ['Pupil size',           eyeKeys.map(k => `${WFR_OBJ[k].pupilSize.toFixed(1)} mm`)],
    ['Analysis diameter',    eyeKeys.map(k => `${WFR_OBJ[k].analysisDia.toFixed(1)} mm`)],
    ['Scans taken',          eyeKeys.map(k => `${WFR_OBJ[k].scans} of ${WFR_MAX_SCANS}`)],
    ['Spherical aberration', eyeKeys.map(k => `${WFR_OBJ[k].sphAb.toFixed(3)} μm`)],
    ['Total HOA RMS',        eyeKeys.map(k => `${WFR_OBJ[k].rmsHOA.toFixed(3)} μm`)],
    ['Coma RMS',             eyeKeys.map(k => `${WFR_OBJ[k].comaRMS.toFixed(3)} μm`)],
  ];
  return (
    <div style={{ border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr>
            <th style={{ background:navy, color:'#fff', padding:'10px 14px', textAlign:'left', fontWeight:700, fontSize:11 }}>Measurement</th>
            {eyeKeys.map(k => <th key={k} style={{ background:navy, color:'#fff', padding:'10px 14px', textAlign:'center', fontWeight:700, fontSize:11 }}>{WFR_EYE_NAMED[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, vals], i) => (
            <tr key={label} style={{ borderTop:'1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding:'10px 14px', fontWeight:600, color:'#374151' }}>{label}</td>
              {vals.map((v, j) => <td key={j} style={{ padding:'10px 14px', textAlign:'center', color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</td>)}
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

function WavefrontRefractionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── Navigation ──
  const [stage, setStage] = React.useState('entry');   // entry · objective · subjective · report
  const [mode, setMode]   = React.useState('full');    // full · subjective-only (set on entry)

  // ── Eye management (objective is monocular: OD → OS) ──
  const objSequence = ['OD', 'OS'];
  const [objEye, setObjEye] = React.useState('OD');
  const [completedEyes, setCompletedEyes] = React.useState(new Set());
  const [showTransition, setShowTransition] = React.useState(false);

  // ── Objective capture sub-stages ──
  const [objPhase, setObjPhase] = React.useState('init'); // init · calibrating · capturing · complete
  const [progress, setProgress] = React.useState(0);
  const [scanFrame, setScanFrame] = React.useState(0);
  const [scanNum, setScanNum] = React.useState(1);
  const [showFog, setShowFog] = React.useState(false);    // fog prompt after objective complete

  // ── Subjective phase ──
  const [fogAmount, setFogAmount] = React.useState(0.75);
  const [isCorrected, setIsCorrected] = React.useState(false);
  const [subjEye, setSubjEye] = React.useState('OD');
  const [subjStep, setSubjStep] = React.useState('setup'); // setup · sphere · jcc-axis · jcc-power · mpmva2 · add
  const [jccPower, setJccPower] = React.useState(0.50);
  const [jccFlip, setJccFlip] = React.useState(1);
  const [comparisons, setComparisons] = React.useState(0);
  const [subjRx, setSubjRx] = React.useState({
    OD: { sph:0, cyl:0, axis:0, add:0 },
    OS: { sph:0, cyl:0, axis:0, add:0 },
  });
  // corrected starting Rx (manual entry for subjective-only / corrected toggle)
  const [corrRx, setCorrRx] = React.useState({
    OD: { sph:WFR_OBJ.OD.sph, cyl:WFR_OBJ.OD.cyl, axis:WFR_OBJ.OD.axis, add:0 },
    OS: { sph:WFR_OBJ.OS.sph, cyl:WFR_OBJ.OS.cyl, axis:WFR_OBJ.OS.axis, add:0 },
  });

  // ── VA chart (subjective) ──
  const [chartResults, setChartResults] = React.useState({}); // key `${eye}_${lineN}` → array
  const [doneEyesSubj, setDoneEyesSubj] = React.useState(new Set());
  const [optotype, setOptotype] = React.useState('letters'); // letters | tumblingE | tumblingC
  const [optoRot, setOptoRot] = React.useState({});           // key `${eye}_${n}_${idx}` → deg
  const genOptoRot = () => {
    const m = {};
    objSequence.forEach(e => WFR_VA_LINES.forEach(l => l.letters.forEach((_, i) => {
      m[`${e}_${l.n}_${i}`] = WFR_OPTO_ROT[Math.floor(Math.random() * 4)];
    })));
    return m;
  };

  // ── Shared ──
  const [elapsed, setElapsed] = React.useState(0);
  const [notes, setNotes] = React.useState('');

  // ── Report controls ──
  const [resultView, setResultView] = React.useState('full-wavefront'); // pupil · centroid · full-wavefront · higher
  const [resultEye, setResultEye] = React.useState('both');
  const [showRings, setShowRings] = React.useState(false);
  const [zoomEye, setZoomEye] = React.useState(null); // eye key for zoom modal
  const [zoomPan, setZoomPan] = React.useState({ x:0, y:0 });

  // Collapsibles
  const [openAlign, setOpenAlign] = React.useState(false);
  const [openPupil, setOpenPupil] = React.useState(false);
  const [openFocus, setOpenFocus] = React.useState(false);
  const [sharpOK, setSharpOK] = React.useState(true); // image-sharpness yes/no readiness control

  const timerRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const frameRef = React.useRef(null);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Timer runs through both testing stages ──
  React.useEffect(() => {
    if (stage === 'objective' || stage === 'subjective') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  // ── Eye-scan animation while capturing ──
  React.useEffect(() => {
    if (objPhase === 'calibrating' || objPhase === 'capturing') {
      frameRef.current = setInterval(() => setScanFrame(f => f + 1), 50);
    } else {
      clearInterval(frameRef.current);
    }
    return () => clearInterval(frameRef.current);
  }, [objPhase]);

  // ── Capture progress driver ──
  React.useEffect(() => {
    if (objPhase === 'calibrating' || objPhase === 'capturing') {
      progressRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (objPhase === 'calibrating' ? 5 : 3.2);
          if (next >= 100) { clearInterval(progressRef.current); return 100; }
          return next;
        });
      }, 90);
    } else {
      clearInterval(progressRef.current);
    }
    return () => clearInterval(progressRef.current);
  }, [objPhase]);

  React.useEffect(() => {
    if (progress >= 100 && objPhase === 'calibrating') {
      const t = setTimeout(() => { setObjPhase('capturing'); setProgress(0); }, 450);
      return () => clearTimeout(t);
    }
    if (progress >= 100 && objPhase === 'capturing') {
      const t = setTimeout(() => { setObjPhase('complete'); setScanNum(WFR_OBJ[objEye].scans); }, 450);
      return () => clearTimeout(t);
    }
  }, [progress, objPhase, objEye]);

  // ── Objective flow ──
  const beginObjective = () => {
    setMode('full');
    setObjEye('OD'); setCompletedEyes(new Set());
    setObjPhase('init'); setProgress(0);
    setElapsed(0);
    setStage('objective');
  };
  const startCapture = () => { setObjPhase('calibrating'); setProgress(0); setScanNum(1); };

  const objComplete = () => {
    const next = new Set(completedEyes); next.add(objEye); setCompletedEyes(next);
    const idx = objSequence.indexOf(objEye) + 1;
    if (idx < objSequence.length) {
      setObjEye(objSequence[idx]);
      setShowTransition(true);
    } else {
      // both eyes captured → fog handoff before subjective
      setShowFog(true);
    }
  };
  const continueAfterTransition = () => {
    setShowTransition(false);
    setObjPhase('init'); setProgress(0);
  };

  const enterSubjective = (fog) => {
    setFogAmount(fog);
    setShowFog(false);
    // seed subjective Rx from objective + fog on sphere
    const seed = {};
    objSequence.forEach(e => {
      seed[e] = { sph: parseFloat((WFR_OBJ[e].sph + fog).toFixed(2)), cyl: WFR_OBJ[e].cyl, axis: WFR_OBJ[e].axis, add: 0 };
    });
    setSubjRx(seed);
    setIsCorrected(mode === 'subjective-only' ? false : true);
    setSubjEye('OD'); setSubjStep('setup'); setComparisons(0);
    setOptoRot(genOptoRot());
    setStage('subjective');
  };

  // Subjective-only entry from the entry screen
  const beginSubjectiveOnly = () => {
    setMode('subjective-only');
    setFogAmount(0);
    const seed = {};
    objSequence.forEach(e => { seed[e] = { sph:0, cyl:0, axis:0, add:0 }; });
    setSubjRx(seed);
    setIsCorrected(false);
    setSubjEye('OD'); setSubjStep('setup'); setComparisons(0);
    setOptoRot(genOptoRot());
    setElapsed(0);
    setStage('subjective');
  };

  // ── Subjective Rx steppers ──
  const adjustSubj = (eye, field, delta) => {
    setSubjRx(prev => {
      let val = prev[eye][field] + delta;
      if (field === 'axis') val = ((val % 180) + 180) % 180;
      const dp = field === 'axis' ? 0 : 2;
      return { ...prev, [eye]: { ...prev[eye], [field]: parseFloat(val.toFixed(dp)) } };
    });
  };
  const adjustCorr = (eye, field, delta) => {
    setCorrRx(prev => {
      let val = prev[eye][field] + delta;
      if (field === 'axis') val = ((val % 180) + 180) % 180;
      const dp = field === 'axis' ? 0 : 2;
      return { ...prev, [eye]: { ...prev[eye], [field]: parseFloat(val.toFixed(dp)) } };
    });
  };

  // ── Subjective step advance (enforces axis → power order) ──
  const SUBJ_STEPS = ['sphere', 'jcc-axis', 'jcc-power', 'add'];
  const stepLabels = { sphere:'Sphere (MPMVA)', 'jcc-axis':'Cylinder axis', 'jcc-power':'Cylinder power', mpmva2:'Second MPMVA', add:'Near addition' };

  const advanceSubjStep = () => {
    setComparisons(0); setJccFlip(1);
    if (subjStep === 'setup') { setSubjStep('sphere'); return; }
    if (subjStep === 'sphere') { setSubjStep('jcc-axis'); return; }
    if (subjStep === 'jcc-axis') { setSubjStep('jcc-power'); return; }
    if (subjStep === 'jcc-power') {
      // conditional 2nd MPMVA if cyl changed ≥0.50D or axis ≥10°
      const cylCh = Math.abs(subjRx[subjEye].cyl - WFR_OBJ[subjEye].cyl) >= 0.50;
      const axCh  = Math.abs(subjRx[subjEye].axis - WFR_OBJ[subjEye].axis) >= 10;
      setSubjStep((cylCh || axCh) ? 'mpmva2' : 'add');
      return;
    }
    if (subjStep === 'mpmva2') { setSubjStep('add'); return; }
    if (subjStep === 'add') { finishSubjEye(); return; }
  };

  const finishSubjEye = () => {
    const done = new Set(doneEyesSubj); done.add(subjEye); setDoneEyesSubj(done);
    if (subjEye === 'OD') {
      setSubjEye('OS'); setSubjStep('setup'); setComparisons(0);
    } else {
      setStage('report');
    }
  };

  // ── VA chart marking (subjective) ──
  const chartKey = (eye, n) => `${eye}_${n}`;
  const getLine = (eye, n) => {
    const line = WFR_VA_LINES.find(l => l.n === n);
    return chartResults[chartKey(eye, n)] || Array(line.letters.length).fill(null);
  };
  const toggleLetter = (eye, n, idx) => {
    const cur = [...getLine(eye, n)];
    cur[idx] = cur[idx] === null ? 'correct' : cur[idx] === 'correct' ? 'incorrect' : null;
    setChartResults(r => ({ ...r, [chartKey(eye, n)]: cur }));
  };
  const markAll = (eye, n, val) => {
    const line = WFR_VA_LINES.find(l => l.n === n);
    setChartResults(r => ({ ...r, [chartKey(eye, n)]: Array(line.letters.length).fill(val) }));
  };

  // best VA with additive notation: returns { va, plus } e.g. "20/25" + 4
  const getBestVA = (eye) => {
    let baseIdx = -1;
    for (let i = WFR_VA_LINES.length - 1; i >= 0; i--) {
      const line = WFR_VA_LINES[i];
      const res = chartResults[chartKey(eye, line.n)] || [];
      const correct = res.filter(r => r === 'correct').length;
      if (correct > 0 && WFR_lineIsPassed(correct, line.letters.length)) { baseIdx = i; break; }
    }
    if (baseIdx < 0) return { va:'—', plus:0 };
    // additive: count correct on the next-smaller line that didn't fully pass
    let plus = 0;
    if (baseIdx + 1 < WFR_VA_LINES.length) {
      const nextLine = WFR_VA_LINES[baseIdx + 1];
      const res = chartResults[chartKey(eye, nextLine.n)] || [];
      const correct = res.filter(r => r === 'correct').length;
      if (!WFR_lineIsPassed(correct, nextLine.letters.length)) plus = correct;
    }
    return { va: WFR_VA_LINES[baseIdx].va, plus };
  };
  const fmtBestVA = (eye) => { const b = getBestVA(eye); return b.va === '—' ? '—' : (b.plus > 0 ? `${b.va} +${b.plus}` : b.va); };

  const resetTest = () => {
    setStage('entry'); setMode('full');
    setObjEye('OD'); setCompletedEyes(new Set()); setObjPhase('init'); setProgress(0);
    setShowFog(false); setShowTransition(false);
    setIsCorrected(false); setSubjEye('OD'); setSubjStep('setup'); setComparisons(0);
    setSubjRx({ OD:{sph:0,cyl:0,axis:0,add:0}, OS:{sph:0,cyl:0,axis:0,add:0} });
    setChartResults({}); setDoneEyesSubj(new Set());
    setOptotype('letters'); setOptoRot({});
    setElapsed(0); setNotes('');
    setResultView('full-wavefront'); setResultEye('both'); setShowRings(false); setZoomEye(null);
  };

  // ── Small shared sub-renderers ──
  const Stepper = ({ value, field, step, onAdjust, eye, fmt }) => {
    const btn = { width:40, height:40, minWidth:40, borderRadius:8, border:`1.5px solid ${WFR_C.border}`, background:'#fff', cursor:'pointer', fontSize:18, fontWeight:700, color:WFR_C.text2, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:WFR_FONT };
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => onAdjust(eye, field, -step)} style={btn}>−</button>
        <div style={{ minWidth:78, textAlign:'center', fontSize:16, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{fmt(value)}</div>
        <button onClick={() => onAdjust(eye, field, +step)} style={btn}>+</button>
      </div>
    );
  };

  // Axis refinement uses three step sizes (±1° / ±5° / ±15°) so the doctor can
  // reduce the step after each JCC reversal (15° → 10° → 5° → 3° → 1°).
  const AxisStepper = ({ value, eye }) => {
    const sBtn = (delta, label) => (
      <button key={label} onClick={() => adjustSubj(eye, 'axis', delta)}
        style={{ minWidth:48, minHeight:44, padding:'0 10px', borderRadius:8, border:`1.5px solid ${WFR_C.border}`, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, color:WFR_C.text2, fontFamily:WFR_FONT, fontVariantNumeric:'tabular-nums' }}>{label}</button>
    );
    return (
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        {sBtn(-15, '−15°')}{sBtn(-5, '−5°')}{sBtn(-1, '−1°')}
        <div style={{ minWidth:64, textAlign:'center', fontSize:20, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{WFR_fmtAxis(value)}</div>
        {sBtn(1, '+1°')}{sBtn(5, '+5°')}{sBtn(15, '+15°')}
      </div>
    );
  };

  const ClinicalNote = ({ children }) => (
    <div style={{ padding:'12px 14px', background:`${accent}08`, border:`1px solid ${accent}25`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <div style={{ fontSize:12, fontWeight:400, color:WFR_C.text2, lineHeight:1.55 }}>{children}</div>
    </div>
  );

  const Collapsible = ({ label, status, open, onToggle, children }) => (
    <div style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', overflow:'hidden', marginBottom:10 }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', cursor:'pointer' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#10b981' }}>{status}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      {open && <div style={{ padding:'0 16px 16px', borderTop:'1px solid #e5e7eb' }}>{children}</div>}
    </div>
  );
  const KV = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f3f4f6', fontSize:12 }}>
      <span style={{ color:'#6b7280' }}>{label}</span><span style={{ color:'#111827', fontWeight:700 }}>{value}</span>
    </div>
  );

  const primaryBtn = { minHeight:48, padding:'12px 30px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, boxShadow:`0 3px 12px ${accent}40` };
  const secondaryBtn = { minHeight:44, padding:'11px 22px', borderRadius:10, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT };


  // ════════════════════════════════════════════════════════════════════
  // RENDER: ENTRY
  // ════════════════════════════════════════════════════════════════════
  const renderEntry = () => {
    const Card = ({ icon, title, desc, badge, note, onClick, btn }) => (
      <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:32, display:'flex', flexDirection:'column', gap:14, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>{icon}</div>
          {badge && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:accent, background:`${accent}15`, padding:'4px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.06em' }}>{badge}</span>}
        </div>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:'#111827', marginBottom:6 }}>{title}</div>
          <div style={{ fontSize:13, fontWeight:400, color:'#6b7280', lineHeight:1.55 }}>{desc}</div>
        </div>
        {note && <div style={{ fontSize:11, fontWeight:400, color:'#9ca3af', fontStyle:'italic' }}>{note}</div>}
        <div style={{ flex:1 }}/>
        <button onClick={onClick} style={{ ...primaryBtn, width:'100%' }}>{btn}</button>
      </div>
    );
    return (
      <div style={{ padding:'40px 24px', display:'flex', justifyContent:'center', minHeight:'100%' }}>
        <div style={{ maxWidth:760, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:30 }}>
            <div style={{ ...WFR_VIOLATOR, color:accent, marginBottom:8 }}>Select refraction mode</div>
            <p style={{ fontSize:14, fontWeight:400, color:'#6b7280', margin:'0 auto', maxWidth:560, lineHeight:1.6 }}>
              Wavefront refraction combines objective measurement and subjective refinement in a single headset. Both stages can be run together or independently.
            </p>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'stretch' }}>
            <Card
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>}
              title="Full refraction"
              desc="Objective wavefront measurement first, then subjective refinement with the liquid lens. Recommended for comprehensive refraction."
              badge="Recommended"
              onClick={beginObjective}
              btn="Begin full refraction"
            />
            <Card
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M4 12h16M4 19h10"/></svg>}
              title="Subjective only"
              desc="Skip objective measurement and proceed directly to subjective refinement. Use when recent objective data is already available."
              note="Objective values will need to be entered manually as the starting point."
              onClick={beginSubjectiveOnly}
              btn="Begin subjective"
            />
          </div>
        </div>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════════════
  // RENDER: OBJECTIVE
  // ════════════════════════════════════════════════════════════════════
  const objRightPanel = (
    <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={WFR_VIOLATOR}>Objective results</div>
      {objSequence.map(e => {
        const done = completedEyes.has(e);
        const d = WFR_OBJ[e];
        return (
          <div key={e} style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', border:`1px solid ${done ? accent+'40' : '#e5e7eb'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color: done ? accent : '#9ca3af', marginBottom:8, display:'flex', justifyContent:'space-between' }}>
              {WFR_EYE_NAMED[e]} {done && <span>✓</span>}
            </div>
            {done ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {[['SPH', WFR_fmtSph(d.sph)], ['CYL', WFR_fmtCyl(d.cyl)], ['AXIS', WFR_fmtAxis(d.axis)]].map(([k,v]) => (
                  <div key={k} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:9, color:'#9ca3af', fontWeight:700, textTransform:'uppercase' }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize:11, color:'#9ca3af' }}>{e === objEye ? 'In progress' : 'Pending'}</div>}
          </div>
        );
      })}
      <div style={{ height:1, background:'#e5e7eb', margin:'4px 0' }}/>
      <div style={WFR_VIOLATOR}>Session notes</div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Capture quality, patient cooperation…" rows={4}
        style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:12, color:'#374151', fontFamily:WFR_FONT, resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
    </div>
  );

  const renderObjective = () => (
    <div style={{ padding:24, minHeight:'100%' }}>
      <div style={{ maxWidth:780, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Sub-bar */}
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: objPhase==='complete' ? '#10b981' : accent, boxShadow: objPhase==='complete' ? 'none' : `0 0 0 4px ${accent}25` }}/>
          <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{WFR_EYE_NAMED[objEye]}</span>
          <span style={{ fontSize:11, color:'#9ca3af' }}>·</span>
          <span style={{ fontSize:11, fontWeight:600, color:'#6b7280' }}>
            {objPhase === 'init' ? 'Pre-capture readiness' : objPhase === 'calibrating' ? 'Calibrating — centering optics to pupil' : objPhase === 'capturing' ? `Capturing — scan ${scanNum} of ${WFR_MAX_SCANS}` : 'Capture complete'}
          </span>
          <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
            <WFR_EyeBreadcrumb sequence={objSequence} currentEye={objEye} completedSet={completedEyes} accent={accent}/>
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:28 }}>
          {objPhase === 'init' && (
            <div style={{ maxWidth:540, margin:'0 auto' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                <WFR_EyeScanStage scanFrame={scanFrame} scanning={false} aligned={false} accent={accent} size={180}/>
              </div>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>Position {objEye === 'OS' ? 'left' : 'right'} eye</h2>
                <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, margin:0 }}>
                  Align the patient's {objEye === 'OS' ? 'left' : 'right'} eye with the aberrometer. The system calibrates, then averages up to {WFR_MAX_SCANS} scans for accuracy.
                </p>
              </div>
              <Collapsible label="Patient alignment" status="Ready" open={openAlign} onToggle={() => setOpenAlign(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <KV label="X-axis position" value="0.2 mm (within range)"/>
                  <KV label="Y-axis position" value="−0.1 mm (within range)"/>
                  <KV label="Headset fit" value="Seated"/>
                </div>
              </Collapsible>
              <Collapsible label="Pupil detection" status="Detected" open={openPupil} onToggle={() => setOpenPupil(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <KV label="Pupil size" value={`${WFR_OBJ[objEye].pupilSize.toFixed(1)} mm`}/>
                  <KV label="Pupil center location" value="0.1 mm, −0.2 mm"/>
                  <KV label="Detection quality" value="Excellent (98%)"/>
                </div>
              </Collapsible>
              <Collapsible label="Patient focus" status="Optimal" open={openFocus} onToggle={() => setOpenFocus(v => !v)}>
                <div style={{ paddingTop:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0' }}>
                    <span style={{ fontSize:12, color:WFR_C.text2 }}>Image sharpness</span>
                    <div style={{ display:'flex', gap:4, background:'#f3f4f6', borderRadius:8, padding:3 }}>
                      {['Yes', 'No'].map(o => {
                        const on = (o === 'Yes') === sharpOK;
                        return (
                          <button key={o} onClick={() => setSharpOK(o === 'Yes')}
                            style={{ minWidth:48, minHeight:34, padding:'0 12px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:WFR_FONT, background: on ? '#fff' : 'transparent', color: on ? (o === 'Yes' ? WFR_C.success : WFR_C.error) : '#9ca3af', boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{o}</button>
                        );
                      })}
                    </div>
                  </div>
                  <KV label="Fixation" value="Steady on target"/>
                </div>
              </Collapsible>
              <div style={{ textAlign:'center', marginTop:18 }}>
                <button onClick={startCapture} style={primaryBtn}>Start capture</button>
              </div>
            </div>
          )}

          {(objPhase === 'calibrating' || objPhase === 'capturing') && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, padding:'14px 0' }}>
              <WFR_EyeScanStage scanFrame={scanFrame} scanning={true} aligned={objPhase === 'capturing'} accent={accent} size={240}/>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>
                {objPhase === 'calibrating' ? 'Calibrating — centering optics to pupil' : `Capturing wavefront data — scan ${scanNum} of ${WFR_MAX_SCANS}`}
              </h2>
              <p style={{ fontSize:12, color:'#6b7280', textAlign:'center', maxWidth:420, lineHeight:1.55, margin:0 }}>
                {objPhase === 'calibrating'
                  ? 'Patient should fixate the central target and hold still.'
                  : `System averaging scans for accuracy. Background turns green when alignment is locked.`}
              </p>
              <div style={{ width:280, height:4, borderRadius:2, background:'#e5e7eb', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:accent, borderRadius:2, transition:'width 0.1s' }}/>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', fontVariantNumeric:'tabular-nums' }}>Elapsed {fmtTime(elapsed)}</div>
            </div>
          )}

          {objPhase === 'complete' && (() => {
            const d = WFR_OBJ[objEye];
            return (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'8px 0' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#f0fdf4', border:'2px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>Capture complete — {WFR_EYE_NAMED[objEye]}</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, width:'100%', maxWidth:520 }}>
                  {[['Sphere', `${WFR_fmtSph(d.sph)} D`], ['Cylinder', `${WFR_fmtCyl(d.cyl)} D`], ['Axis', WFR_fmtAxis(d.axis)],
                    ['Pupil size', `${d.pupilSize.toFixed(1)} mm`], ['Scans taken', `${d.scans} of ${WFR_MAX_SCANS}`], ['Total HOA RMS', `${d.rmsHOA.toFixed(3)} μm`]].map(([l,v]) => (
                    <div key={l} style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:4 }}>{l}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:12, marginTop:6 }}>
                  <button onClick={objComplete} style={primaryBtn}>
                    {objSequence.indexOf(objEye) + 1 < objSequence.length ? 'Scan other eye →' : 'Proceed to subjective →'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {showTransition && <WFR_TransitionPrompt sequence={objSequence} currentEye={objEye} completedSet={completedEyes} onContinue={continueAfterTransition} accent={accent}/>}

      {/* Fog handoff modal */}
      {showFog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:18, padding:'32px 34px 26px', maxWidth:520, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', fontFamily:WFR_FONT }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 8px' }}>Apply accommodation fog before subjective refinement?</h3>
            <p style={{ fontSize:13, color:'#374151', margin:'0 0 22px', lineHeight:1.6 }}>
              Fogging (+0.75 D) relaxes the patient's accommodation to prevent over-minusing during subjective refraction. Recommended for all patients.
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => enterSubjective(0.75)} autoFocus style={{ ...primaryBtn, flex:1 }}>Apply fog and continue</button>
              <button onClick={() => enterSubjective(0)} style={{ ...secondaryBtn, flex:1 }}>Skip fogging</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  // ════════════════════════════════════════════════════════════════════
  // RENDER: SUBJECTIVE
  // ════════════════════════════════════════════════════════════════════
  // Compact markable VA chart (light, doctor marks as patient reads)
  const VAChart = ({ eye, highlightLines }) => (
    <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'18px 20px', display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
      {WFR_VA_LINES.map(line => {
        const dim = highlightLines && !highlightLines.includes(line.n);
        const lineRes = getLine(eye, line.n);
        return (
          <div key={line.n} style={{ display:'flex', alignItems:'center', gap:14, width:'100%', justifyContent:'center', opacity: dim ? 0.18 : 1, transition:'opacity 0.2s' }}>
            <div style={{ width:48, fontSize:10, fontWeight:700, color:'#9ca3af', textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{line.va}</div>
            <div style={{ display:'flex', gap:Math.max(14 - line.letters.length, 6), alignItems:'center' }}>
              {line.letters.map((ltr, idx) => {
                const res = lineRes[idx];
                const bg = res === 'correct' ? WFR_C.success : res === 'incorrect' ? WFR_C.error : 'transparent';
                const fg = res ? '#fff' : WFR_C.navy;
                const isOpto = optotype !== 'letters';
                const optoKind = optotype === 'tumblingC' ? 'C' : 'E';
                const sz = Math.max(line.fs * 0.7, 30);
                return (
                  <button key={idx} onClick={() => toggleLetter(eye, line.n, idx)} title="Tap: correct → incorrect → clear"
                    style={{ minWidth:sz, minHeight:sz, padding:'2px 6px', borderRadius:8, border:'none', background:bg, cursor:'pointer', fontFamily:WFR_FONT, lineHeight:1, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                    {isOpto
                      ? <WFR_Optotype kind={optoKind} size={Math.min(line.fs, 56)} rotation={optoRot[`${eye}_${line.n}_${idx}`] || 0} color={fg}/>
                      : <span style={{ fontSize:Math.min(line.fs, 56), fontWeight:700, color:fg }}>{ltr}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const StepIndicator = () => {
    const order = ['sphere', 'jcc-axis', 'jcc-power', 'add'];
    const curIdx = subjStep === 'setup' ? -1 : subjStep === 'mpmva2' ? 2 : order.indexOf(subjStep);
    return (
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        {order.map((s, i) => {
          const active = i === curIdx;
          const done = i < curIdx;
          return (
            <React.Fragment key={s}>
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', borderRadius:18, background: active ? accent : done ? '#f0fdf4' : '#f3f4f6', border:`1.5px solid ${active ? accent : done ? '#bbf7d0' : '#e5e7eb'}` }}>
                <span style={{ fontSize:11, fontWeight:700, color: active ? '#fff' : done ? '#047857' : '#9ca3af' }}>{stepLabels[s]}</span>
              </div>
              {i < order.length - 1 && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const subjRightPanel = (
    <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={WFR_VIOLATOR}>Current Rx</div>
      {objSequence.map(e => {
        const r = subjRx[e];
        return (
          <div key={e} style={{ background:'#f9fafb', borderRadius:10, padding:'10px 12px', border:`1px solid ${e === subjEye ? accent+'50' : '#e5e7eb'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color: e === subjEye ? accent : '#6b7280', marginBottom:4 }}>{e}</div>
            <div style={{ fontSize:11, color:'#111827', fontWeight:600, fontVariantNumeric:'tabular-nums', lineHeight:1.5 }}>
              {WFR_fmtSph(r.sph)} {WFR_fmtCyl(r.cyl)} × {WFR_fmtAxis(r.axis)}<br/>ADD {WFR_fmtAdd(r.add)}
            </div>
          </div>
        );
      })}
      <div style={{ height:1, background:'#e5e7eb' }}/>
      <div style={WFR_VIOLATOR}>Best VA so far</div>
      <div style={{ fontSize:26, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{fmtBestVA(subjEye)} <span style={{ fontSize:12, color:'#9ca3af', fontWeight:600 }}>{subjEye}</span></div>
      <div style={{ height:1, background:'#e5e7eb' }}/>
      <div style={WFR_VIOLATOR}>Session notes</div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Patient responses, comfort…" rows={4}
        style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:12, color:'#374151', fontFamily:WFR_FONT, resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
    </div>
  );

  const renderSubjective = () => {
    const r = subjRx[subjEye];
    const jccTarget = subjStep === 'jcc-axis' || subjStep === 'jcc-power';
    return (
      <div style={{ padding:24, minHeight:'100%' }}>
        <div style={{ maxWidth:880, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>
          {/* Sub-bar: eye toggle + step indicator */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', background:'#f3f4f6', borderRadius:20, padding:3, gap:2 }}>
              {objSequence.map(e => (
                <button key={e} onClick={() => { setSubjEye(e); setSubjStep('setup'); }} style={{ padding:'6px 16px', borderRadius:18, border:'none', cursor:'pointer', background: subjEye===e ? '#fff' : 'transparent', color: subjEye===e ? '#111827' : '#6b7280', fontSize:12, fontWeight:700, boxShadow: subjEye===e ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontFamily:WFR_FONT, display:'flex', alignItems:'center', gap:6 }}>
                  {doneEyesSubj.has(e) && <span style={{ color:'#10b981' }}>✓</span>}{e}
                </button>
              ))}
            </div>
            <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}><StepIndicator/></div>
          </div>

          {/* SETUP — corrected/uncorrected */}
          {subjStep === 'setup' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:28, display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:4 }}>Corrected or uncorrected — {WFR_EYE_NAMED[subjEye]}</div>
                <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55 }}>
                  Uncorrected tests with zero liquid-lens power (no prescription). Corrected loads the patient's existing prescription into the liquid lens as the starting point.
                </div>
              </div>
              <div style={{ display:'flex', gap:14 }}>
                {[['uncorrected', false, 'Uncorrected', 'Zero liquid-lens power · no glasses'], ['corrected', true, 'Corrected', 'Existing Rx loaded into the liquid lens']].map(([id, val, t, sub]) => (
                  <button key={id} onClick={() => setIsCorrected(val)} style={{ flex:1, padding:'18px 16px', borderRadius:12, border:`2px solid ${isCorrected===val ? accent : '#e5e7eb'}`, background: isCorrected===val ? `${accent}10` : '#fff', cursor:'pointer', textAlign:'left', fontFamily:WFR_FONT }}>
                    <div style={{ fontSize:14, fontWeight:700, color: isCorrected===val ? accent : '#374151' }}>{t}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{sub}</div>
                  </button>
                ))}
              </div>
              {isCorrected && (
                <div style={{ background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px 18px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:12 }}>Corrected prescription — {subjEye} (liquid lens)</div>
                  <div style={{ display:'grid', gridTemplateColumns:'auto auto auto auto', gap:'12px 22px', alignItems:'center' }}>
                    {[['SPH','sph',0.25, WFR_fmtSph], ['CYL','cyl',0.25, WFR_fmtCyl], ['AXIS','axis',1, WFR_fmtAxis], ['ADD','add',0.25, WFR_fmtAdd]].map(([lab, field, step, fmt]) => (
                      <div key={field} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>{lab}</span>
                        <Stepper value={corrRx[subjEye][field]} field={field} step={step} onAdjust={adjustCorr} eye={subjEye} fmt={fmt}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>Optotype</div>
                <div style={{ display:'flex', gap:10 }}>
                  {[['letters','Letters','Snellen A–Z'], ['tumblingE','Tumbling E','Orientation · 4-way'], ['tumblingC','Tumbling C','Landolt gap · 4-way']].map(([id, t, sub]) => (
                    <button key={id} onClick={() => setOptotype(id)} style={{ flex:1, padding:'12px 14px', borderRadius:11, border:`1.5px solid ${optotype===id ? accent : '#e5e7eb'}`, background: optotype===id ? `${accent}10` : '#fff', cursor:'pointer', textAlign:'left', fontFamily:WFR_FONT, display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:7, background: optotype===id ? `${accent}18` : '#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {id === 'letters'
                          ? <span style={{ fontSize:18, fontWeight:700, color: optotype===id ? accent : '#9ca3af' }}>E</span>
                          : <WFR_Optotype kind={id === 'tumblingC' ? 'C' : 'E'} size={18} rotation={id === 'tumblingC' ? 90 : 0} color={optotype===id ? accent : '#9ca3af'}/>}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color: optotype===id ? accent : '#374151' }}>{t}</div>
                        <div style={{ fontSize:10, color:'#9ca3af' }}>{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:8 }}>Use Tumbling E or C for children, non-literate, or non-Latin-script patients — the patient reports the orientation rather than naming a letter.</div>
              </div>
              <ClinicalNote>
                {mode === 'subjective-only'
                  ? 'Subjective-only mode: enter the objective starting values manually above, then proceed.'
                  : `Starting sphere for MPMVA = objective ${WFR_fmtSph(WFR_OBJ[subjEye].sph)} D + fog ${fogAmount > 0 ? `+${fogAmount.toFixed(2)} D` : '(none)'} = ${WFR_fmtSph(r.sph)} D.`}
              </ClinicalNote>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={advanceSubjStep} style={primaryBtn}>Begin sphere refinement →</button>
              </div>
            </div>
          )}

          {/* SPHERE (MPMVA) and second MPMVA */}
          {(subjStep === 'sphere' || subjStep === 'mpmva2') && (
            <>
              <VAChart eye={subjEye}/>
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>
                  {subjStep === 'mpmva2' ? 'Second MPMVA — cylinder has changed, re-establishing sphere endpoint' : 'Maximum plus to maximum visual acuity (MPMVA)'}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>Sphere ({subjEye})</span>
                    <Stepper value={r.sph} field="sph" step={0.25} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtSph}/>
                  </div>
                  {fogAmount > 0 && subjStep === 'sphere' && (
                    <div style={{ fontSize:11, fontWeight:600, color:accent, background:`${accent}12`, padding:'8px 12px', borderRadius:8 }}>Fog applied: +{fogAmount.toFixed(2)} D above objective</div>
                  )}
                </div>
                <ClinicalNote>
                  {subjStep === 'mpmva2'
                    ? 'Add +0.50 D to fog, then reduce sphere in 0.25 D steps to maximum plus that still gives best VA.'
                    : 'Reduce sphere in 0.25 D steps until the patient achieves best VA. Stop at the maximum plus that gives best acuity (do not over-minus).'}
                </ClinicalNote>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={advanceSubjStep} style={primaryBtn}>{subjStep === 'mpmva2' ? 'Sphere endpoint confirmed →' : 'MPMVA achieved →'}</button>
                </div>
              </div>
            </>
          )}

          {/* JCC axis / power */}
          {jccTarget && (
            <>
              <VAChart eye={subjEye} highlightLines={[6, 7, 8]}/>
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>
                    {subjStep === 'jcc-axis' ? 'Jackson cross-cylinder — axis refinement' : 'Jackson cross-cylinder — power refinement'}
                  </div>
                  <div style={{ flex:1 }}/>
                  {subjStep === 'jcc-axis' && (
                    <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', background:'#f3f4f6', padding:'4px 10px', borderRadius:14, textTransform:'uppercase', letterSpacing:'0.05em' }}>Axis before power</div>
                  )}
                </div>

                <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start' }}>
                  {/* JCC diagram */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2"/>
                      {(() => {
                        const ax = r.axis * Math.PI / 180;
                        // red = cylinder axis dot, white = 90° away; flip swaps
                        const redA = jccFlip === 1 ? ax : ax + Math.PI/2;
                        const whiteA = redA + Math.PI/2;
                        const pt = (a, rad) => [60 + Math.cos(a)*rad, 60 - Math.sin(a)*rad];
                        const [rx1, ry1] = pt(redA, 38); const [rx2, ry2] = pt(redA + Math.PI, 38);
                        const [wx1, wy1] = pt(whiteA, 38); const [wx2, wy2] = pt(whiteA + Math.PI, 38);
                        return (
                          <>
                            <line x1={wx1} y1={wy1} x2={wx2} y2={wy2} stroke="#cbd5e1" strokeWidth="2"/>
                            <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#dc2626" strokeWidth="2"/>
                            <circle cx={rx1} cy={ry1} r="6" fill="#dc2626"/>
                            <circle cx={rx2} cy={ry2} r="6" fill="#dc2626"/>
                            <circle cx={wx1} cy={wy1} r="6" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                            <circle cx={wx2} cy={wy2} r="6" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                          </>
                        );
                      })()}
                    </svg>
                    <div style={{ fontSize:10, color:'#6b7280', textAlign:'center', maxWidth:140 }}>Red = cylinder axis · White = 90° away</div>
                    <button onClick={() => { setJccFlip(f => f === 1 ? 2 : 1); setComparisons(c => c + 1); }} style={{ ...secondaryBtn, minHeight:40, padding:'8px 18px' }}>Flip JCC (choice {jccFlip})</button>
                    <div style={{ fontSize:11, color: comparisons >= 3 ? WFR_C.amber : '#9ca3af', fontWeight:600 }}>Comparisons: {comparisons}{comparisons >= 3 ? ' · advisory (≈3 typical)' : ''}</div>
                  </div>

                  {/* JCC controls */}
                  <div style={{ flex:1, minWidth:280, display:'flex', flexDirection:'column', gap:16 }}>
                    <div>
                      <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>JCC power</span>
                      <div style={{ display:'flex', gap:8, marginTop:8 }}>
                        {[0.25, 0.50, 0.75, 1.00].map(p => (
                          <button key={p} onClick={() => setJccPower(p)} style={{ flex:1, minHeight:44, borderRadius:9, border:`1.5px solid ${jccPower===p ? accent : '#e5e7eb'}`, background: jccPower===p ? accent : '#fff', color: jccPower===p ? '#fff' : '#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, fontVariantNumeric:'tabular-nums' }}>{p.toFixed(2)}</button>
                        ))}
                      </div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:6 }}>0.50 D default (≤2.00 D cyl) · 1.00 D for &gt;2.00 D cyl</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>{subjStep === 'jcc-axis' ? `Axis (${subjEye})` : `Cylinder (${subjEye})`}</span>
                      {subjStep === 'jcc-axis'
                        ? <AxisStepper value={r.axis} eye={subjEye}/>
                        : <Stepper value={r.cyl} field="cyl" step={0.25} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtCyl}/>}
                    </div>
                  </div>
                </div>

                <ClinicalNote>
                  {subjStep === 'jcc-axis'
                    ? 'Flip the JCC. Ask: "Which is clearer — choice 1 or 2?" Move the axis toward the same-sign cylinder dot. Reduce step after each reversal: 15° → 10° → 5° → 3° → 1°.'
                    : 'Flip the JCC with the handle along the confirmed axis. Add minus cylinder when the patient prefers the minus position. For each −0.50 D CYL added, add +0.25 D SPH to maintain the circle of least confusion.'}
                </ClinicalNote>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={advanceSubjStep} style={primaryBtn}>{subjStep === 'jcc-axis' ? 'Axis confirmed →' : 'Power confirmed →'}</button>
                </div>
              </div>
            </>
          )}

          {/* NEAR ADDITION */}
          {subjStep === 'add' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>Near addition (ADD) — {WFR_EYE_NAMED[subjEye]}</div>
              <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>ADD ({subjEye})</span>
                  <Stepper value={r.add} field="add" step={0.25} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtAdd}/>
                </div>
                <div style={{ flex:1, minWidth:240, background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', padding:'12px 14px' }}>
                  <div style={{ ...WFR_VIOLATOR, fontSize:9, marginBottom:8 }}>Age-expected add</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px', fontSize:11, color:'#374151', fontVariantNumeric:'tabular-nums' }}>
                    {[['~40 yr','+0.75 to +1.00'], ['~45 yr','+1.25 to +1.50'], ['~50 yr','+1.75 to +2.00'], ['~55 yr','+2.00 to +2.25'], ['~60 yr','+2.25 to +2.50'], ['~65+ yr','+2.50 to +3.00']].map(([a,v]) => (
                      <div key={a} style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#9ca3af' }}>{a}</span><span style={{ fontWeight:700 }}>{v} D</span></div>
                    ))}
                  </div>
                </div>
              </div>
              <ClinicalNote>Add plus power until the patient achieves comfortable near vision. Skip for non-presbyopic patients.</ClinicalNote>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
                <button onClick={() => { adjustSubj(subjEye, 'add', -subjRx[subjEye].add); finishSubjEye(); }} style={secondaryBtn}>Skip near addition</button>
                <button onClick={advanceSubjStep} style={primaryBtn}>{subjEye === 'OS' ? 'Finish refraction →' : 'ADD confirmed · continue to OS →'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════════════
  // RENDER: REPORT
  // ════════════════════════════════════════════════════════════════════
  const renderReport = () => {
    const now = new Date();
    const ranObjective = mode === 'full';
    const eyeKeys = objSequence;
    const reportKeys = resultEye === 'both' ? eyeKeys : [resultEye];

    const deltaRow = (e) => {
      const dSph = subjRx[e].sph - WFR_OBJ[e].sph;
      const dCyl = subjRx[e].cyl - WFR_OBJ[e].cyl;
      const dAx  = subjRx[e].axis - WFR_OBJ[e].axis;
      const part = (label, v, unit) => Math.abs(v) < 0.001 ? `${label} unchanged` : `${label} ${v > 0 ? '+' : ''}${unit === '°' ? Math.round(v) : v.toFixed(2)}${unit}`;
      return `${part('SPH', dSph, 'D')} · ${part('CYL', dCyl, 'D')} · ${part('AXIS', dAx, '°')}`;
    };
    const bcva = (e) => fmtBestVA(e) === '—' ? '20/20' : fmtBestVA(e); // mock fallback

    return (
      <div style={{ padding:'20px 24px', minHeight:'100%' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Report title */}
          <div style={{ background:WFR_C.navy, borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="none"/></svg>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>Wavefront Refraction Report</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{ranObjective ? 'Full refraction (objective + subjective)' : 'Subjective only'}</div>
            </div>
          </div>

          {/* Patient information */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Patient Information</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
              {[['Patient name','Marcus Williams'], ['Patient ID','#4821'], ['Birthdate','10/11/1983'], ['Exam date', now.toLocaleDateString('en-US')],
                ['Refraction mode', ranObjective ? 'Full (objective + subjective)' : 'Subjective only'], ['Fog applied', fogAmount > 0 ? `Yes (+${fogAmount.toFixed(2)} D)` : 'No'],
                ['JCC power used', `${jccPower.toFixed(2)} D`], ['Test duration', fmtTime(elapsed)]].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:12, fontWeight:700, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{v}</div></div>
              ))}
            </div>
          </div>

          {/* Final prescription — most prominent */}
          <div style={{ background:'#fff', borderRadius:14, border:`2px solid ${accent}`, padding:'22px 24px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:16 }}>Final Prescription</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {objSequence.map(e => {
                const r = subjRx[e];
                return (
                  <div key={e} style={{ display:'flex', alignItems:'center', gap:18, padding:'14px 18px', background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', flexWrap:'wrap' }}>
                    <div style={{ width:36, fontSize:14, fontWeight:700, color:accent }}>{e}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums', letterSpacing:'0.01em' }}>
                      {WFR_fmtSph(r.sph)} {WFR_fmtCyl(r.cyl)} × {WFR_fmtAxis(r.axis)}
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>ADD {WFR_fmtAdd(r.add)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ ...WFR_VIOLATOR, fontSize:10 }}>BCVA achieved</span>
              <span style={{ fontSize:15, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{bcva('OD')} OD · {bcva('OS')} OS</span>
            </div>
          </div>

          {/* Objective + subjective change two-box */}
          <div style={{ display:'grid', gridTemplateColumns: ranObjective ? '1fr 1fr' : '1fr', gap:14 }}>
            {ranObjective && (
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
                <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Objective Results</div>
                <WFR_MeasTable eyeKeys={eyeKeys}/>
              </div>
            )}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Subjective Correction</div>
              {ranObjective ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ fontSize:11, color:'#6b7280', lineHeight:1.5 }}>Change from objective starting point to final subjective Rx:</div>
                  {objSequence.map(e => (
                    <div key={e} style={{ padding:'12px 14px', background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:accent, marginBottom:4 }}>{e}</div>
                      <div style={{ fontSize:12, color:'#374151', fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{deltaRow(e)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>Subjective refinement completed for OD and OS. No objective stage was run in this session.</div>
              )}
            </div>
          </div>

          {/* Wavefront maps (objective only) */}
          {ranObjective && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, flexWrap:'wrap' }}>
                <div style={WFR_REPORT_LABEL}>Wavefront Analysis</div>
                <div style={{ flex:1 }}/>
                {/* eye tabs */}
                <div style={{ display:'flex', background:'#f3f4f6', borderRadius:8, padding:3, gap:2 }}>
                  {[['OD','Right'], ['OS','Left'], ['both','Both']].map(([v,l]) => (
                    <button key={v} onClick={() => setResultEye(v)} style={{ padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer', background: resultEye===v ? '#fff' : 'transparent', color: resultEye===v ? '#111827' : '#6b7280', fontSize:11, fontWeight:700, boxShadow: resultEye===v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', fontFamily:WFR_FONT }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* vertical view rail (frees real estate for the maps) */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, width:160, flexShrink:0 }}>
                  <span style={{ ...WFR_VIOLATOR, fontSize:9, marginBottom:2 }}>View</span>
                  {[['pupil-image','Pupil image'], ['centroid-image','Centroid image'], ['full-wavefront','Full wavefront'], ['higher','High / low orders']].map(([v,l]) => (
                    <button key={v} onClick={() => setResultView(v)} style={{ padding:'10px 12px', borderRadius:9, border:`1.5px solid ${resultView===v ? accent : '#e5e7eb'}`, background: resultView===v ? `${accent}10` : '#fff', color: resultView===v ? accent : '#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, textAlign:'left' }}>{l}</button>
                  ))}
                  {(resultView === 'full-wavefront' || resultView === 'higher') && (
                    <button onClick={() => setShowRings(v => !v)} style={{ marginTop:6, padding:'10px 12px', borderRadius:9, border:`1.5px solid ${showRings ? accent : '#e5e7eb'}`, background: showRings ? accent : '#fff', color: showRings ? '#fff' : '#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, textAlign:'left' }}>3 / 5 mm rings</button>
                  )}
                </div>

                {/* maps */}
                <div style={{ flex:1, display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
                  {reportKeys.map(k => (
                    <div key={k} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{WFR_EYE_NAMED[k]}</div>
                      <div style={{ position:'relative' }}>
                        {resultView === 'pupil-image' && <WFR_PupilImage size={reportKeys.length === 2 ? 220 : 300}/>}
                        {resultView === 'centroid-image' && <WFR_CentroidImage size={reportKeys.length === 2 ? 220 : 300}/>}
                        {(resultView === 'full-wavefront' || resultView === 'higher') && <WFR_WavefrontGrid grid={WFR_GRIDS[k]} size={reportKeys.length === 2 ? 220 : 300} rings={showRings}/>}
                        {/* zoom-scope button */}
                        <button onClick={() => { setZoomEye(k); setZoomPan({ x:0, y:0 }); }} title="Zoom" style={{ position:'absolute', top:8, right:8, width:34, height:34, borderRadius:9, border:'1.5px solid rgba(255,255,255,0.7)', background:'rgba(15,23,42,0.55)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(resultView === 'full-wavefront' || resultView === 'higher') && (
                <div style={{ display:'flex', justifyContent:'center', marginTop:16 }}><WFR_ColorScaleLegend width={300}/></div>
              )}

              <div style={{ marginTop:18 }}><WFR_MeasTable eyeKeys={eyeKeys}/></div>
            </div>
          )}

          {/* Clinical summary — DATA ONLY, no determinations */}
          <div style={{ background:`${accent}0f`, border:`1.5px solid ${accent}33`, borderRadius:14, padding:'16px 20px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:10 }}>Clinical Summary</div>
            <ul style={{ margin:0, paddingLeft:18, fontSize:13, color:'#374151', lineHeight:1.7 }}>
              {ranObjective && <li>Objective refraction completed: {WFR_OBJ.OD.scans} scan(s) OD · {WFR_OBJ.OS.scans} scan(s) OS.</li>}
              <li>Subjective refinement completed: OD and OS.</li>
              <li>Final Rx pending clinician certification.</li>
            </ul>
          </div>

          {/* Session notes */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:10 }}>Session notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Clinician notes…" rows={3}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:13, color:'#374151', fontFamily:WFR_FONT, resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:24, flexWrap:'wrap' }}>
            <button style={secondaryBtn}>Export report</button>
            <button style={secondaryBtn}>Compare</button>
            <div style={{ flex:1 }}/>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:accent }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Doctor sign-off · releases Rx to job object
              </div>
              <button onClick={onBack} style={{ ...primaryBtn, padding:'12px 28px' }}>Certify &amp; close</button>
            </div>
          </div>
        </div>

        {/* Zoom modal */}
        {zoomEye && (
          <div onClick={() => setZoomEye(null)} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, backdropFilter:'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ position:'relative', width:'90vw', height:'90vh', maxWidth:720, maxHeight:720, background:'#0a0e1a', borderRadius:16, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div
                onPointerMove={e => { if (e.buttons === 1) setZoomPan(p => ({ x:p.x + e.movementX, y:p.y + e.movementY })); }}
                style={{ cursor:'grab', transform:`translate(${zoomPan.x}px, ${zoomPan.y}px) scale(1.8)`, touchAction:'none' }}>
                {resultView === 'pupil-image' && <WFR_PupilImage size={420}/>}
                {resultView === 'centroid-image' && <WFR_CentroidImage size={420}/>}
                {(resultView === 'full-wavefront' || resultView === 'higher') && <WFR_WavefrontGrid grid={WFR_GRIDS[zoomEye]} size={420} rings={showRings}/>}
              </div>
              <div style={{ position:'absolute', top:14, left:16, fontSize:12, fontWeight:700, color:'#fff' }}>{WFR_EYE_NAMED[zoomEye]} · drag to pan</div>
              <button onClick={() => setZoomEye(null)} style={{ position:'absolute', top:12, right:12, width:38, height:38, borderRadius:10, border:'none', background:'rgba(255,255,255,0.15)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════════════
  // EXAM SHELL WIRING
  // ════════════════════════════════════════════════════════════════════
  const shellPhase = stage === 'entry' ? 'ready' : stage === 'report' ? 'report' : 'testing';
  const shellTitle =
    stage === 'entry'      ? 'Wavefront refraction' :
    stage === 'objective'  ? 'Wavefront refraction — objective' :
    stage === 'subjective' ? 'Wavefront refraction — subjective' :
                             'Wavefront refraction — results';

  return (
    <>
      <ExamShell
        title={shellTitle}
        accent={accent}
        onBack={stage === 'subjective' ? () => setStage(mode === 'subjective-only' ? 'entry' : 'objective') : stage === 'objective' ? () => setStage('entry') : onBack}
        patientName="Marcus Williams"
        patientId="#4821"
        phase={shellPhase}
        elapsed={shellPhase === 'testing' ? elapsed : undefined}
        onBegin={null}
        onFinish={null}
        onNewTest={stage === 'report' ? resetTest : null}
        rightPanel={stage === 'objective' ? objRightPanel : stage === 'subjective' ? subjRightPanel : null}
      >
        {stage === 'entry'      && renderEntry()}
        {stage === 'objective'  && renderObjective()}
        {stage === 'subjective' && renderSubjective()}
        {stage === 'report'     && renderReport()}
      </ExamShell>
      <style>{`@keyframes wfrspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

Object.assign(window, { WavefrontRefractionTest });
