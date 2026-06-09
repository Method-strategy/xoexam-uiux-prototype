// WavefrontRefractionTest.jsx — Method Marketing Agency, June 2026
// xoExam clinical tablet UI — 1280×800 base canvas
//
// ┌─ Competitive-parity pass (Marco OPD-Scan III + Reichert Phoroptor VRx) ────────────────┐
// │ Adds the six CD-approved enhancements (Jun 2026) in one pass:                          │
// │   1. PSF + simulated-VA before/after (driven by Zernike, tied to old-vs-new Rx)        │
// │   2. Binocular balance step (fogging / alternate occlusion — no prism needed)          │
// │   3. Multi-source Rx comparison (objective · subjective · habitual · unaided + deltas)  │
// │   4. Photopic vs. mesopic refraction with a Diff row (day-vs-night)                     │
// │   5. Smart-Cylinder auto-bracketing on the JCC (step shrinks after each reversal)       │
// │   6. Refraction-based progression tracker (spherical-equiv trend vs age-banded norms)   │
// │                                                                                          │
// │ HEADSET-SENSOR VALUES ARE ISOLATED at the top (WFR_ANALYSIS_DIA / WFR_SIXMM_PROVISIONAL   │
// │ / WFR_ZERNIKE_* / WFR_VERTEX_MM / WFR_*_RANGE). Built to Steve's confirmed answers.        │
// │ CD direction (Jun 9 2026): WFR_REEHANA_CONFIRMED = true → Q3/Q7/Q8 present AS CONFIRMED,   │
// │ no "Provisional" pills / pending captions. Any later hardware revision is a one-line edit. │
// │ See briefs/WavefrontRefraction_Clinical_Spec_v2.md.                                        │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
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
// Objective wavefront results per eye. HOA values referenced to the CONFIRMED
// 4.0 mm imaging aperture (Steve, Jun 2026); the HOA magnitudes are aperture-
// scaled for a 4 mm analysis. To revert to a 6 mm baseline: restore pupilSize/
// analysisDia to ~6.0–6.3 and the 6 mm HOA magnitudes (rmsHOA ~0.261/0.284,
// comaRMS ~0.163/0.187, sphAb ~0.087/0.092) and bump WFR_ANALYSIS_DIA.
const WFR_OBJ = {
  OD: { sph:-1.25, cyl:-0.50, axis:165, pupilSize:4.3, analysisDia:4.0, scans:2, rmsHOA:0.082, comaRMS:0.051, sphAb:0.024 },
  OS: { sph:-1.50, cyl:-0.75, axis:170, pupilSize:4.4, analysisDia:4.0, scans:1, rmsHOA:0.094, comaRMS:0.061, sphAb:0.028 },
};
const WFR_MAX_SCANS = 3;

// ════════════════════════════════════════════════════════════════════════
// HEADSET-SENSOR CONSTANTS (v0.2.7 · confirmed from Steve, Jun 9 2026)
// ────────────────────────────────────────────────────────────────────────
// Values from the headset-sensor Q&A ("xoExam Headset Sensor Questions").
// Steve's answers, treated as CONFIRMED for this build (CD direction Jun 9
// 2026 — no "optical-team confirmation needed" hedging):
//   Q3  — detects pupil in dim vs. bright light; measures wavefront at 4 mm
//         and 6 mm pupil (day-vs-night refraction live).
//   Q7  — 4 mm imaging aperture; Zernike to 10th order (66 modes), lenslet-set.
//   Q8  — per opto-electrical spec sheet: sphere-only −14 to +14 D, sphere-
//         with-cylinder −6 to +6 D, cylinder 0 to −5 D; aperture 7 mm typ.
//
// WFR_REEHANA_CONFIRMED = true → present all of the above as confirmed (no
// "Provisional" pills / pending captions). These constants are still isolated
// here so any later hardware revision is a one-line edit, not a rebuild.
const WFR_REEHANA_CONFIRMED = true;  // CD direction Jun 9 2026: Steve's Q3/Q7/Q8 answers are confirmed — no hedging
const WFR_ANALYSIS_DIA      = 4.0;   // mm — confirmed imaging aperture (Steve, Q3/Q7)
const WFR_SIXMM_PROVISIONAL = true;  // true → 6 mm (dim / large-pupil) column shown
const WFR_ZERNIKE_MAX_ORDER = 10;    // 10th order — lenslet-set (Steve, Q7)
const WFR_ZERNIKE_MODES     = 66;    // 66 modes at 10th order
const WFR_VERTEX_MM         = '25–30'; // mm — confirmed range (Steve)
const WFR_SPHERE_RANGE      = '−14.00 to +14.00 D'; // sphere-only (Steve Q8 spec sheet)
const WFR_CYL_RANGE         = '0.00 to −5.00 D';    // cylinder (Steve Q8 spec sheet)

// Habitual (current spectacle) Rx — manual entry now; auto-pull from cloud
// history later (Q9 confirmed: time-series patient profile is the goal).
const WFR_HABITUAL_SEED = {
  OD: { sph:-1.00, cyl:-0.25, axis:160, add:0 },
  OS: { sph:-1.25, cyl:-0.50, axis:175, add:0 },
};

// Photopic (bright / small pupil) vs. mesopic (dim / large pupil) refraction.
// 4 mm and 6 mm both confirmed (Steve, Q3). Mesopic typically
// shifts more minus (night myopia). Values are sphere offsets from subjective.
const WFR_DAYNIGHT = {
  OD: { photo4:0.00, meso4:-0.25, photo6:0.00, meso6:-0.50 },
  OS: { photo4:0.00, meso4:-0.25, photo6:-0.25, meso6:-0.50 },
};

// Spherical-equivalent history per eye (cloud time-series, Q9). Most-recent
// visit is the current exam, appended live from the subjective endpoint.
const WFR_VISITS = {
  OD: [{ y:'2021', se:-0.50 }, { y:'2022', se:-0.75 }, { y:'2023', se:-1.00 }, { y:'2024', se:-1.13 }, { y:'2025', se:-1.38 }],
  OS: [{ y:'2021', se:-0.75 }, { y:'2022', se:-1.00 }, { y:'2023', se:-1.25 }, { y:'2024', se:-1.50 }, { y:'2025', se:-1.75 }],
};
// Age-banded mean myopia-progression reference (D/yr, magnitude). Reference
// only — the "at-risk" determination stays the clinician's call (doctor-led).
const WFR_PROG_NORMS = [
  { band:'7–9 yr',   lo:0.50, hi:1.00 },
  { band:'10–12 yr', lo:0.40, hi:0.75 },
  { band:'13–15 yr', lo:0.25, hi:0.50 },
  { band:'16–17 yr', lo:0.15, hi:0.35 },
  { band:'Adult',    lo:0.00, hi:0.15 },
];
const WFR_PATIENT_AGE = 42; // Marcus Williams, b. 1983
const WFR_PATIENT_BAND = 'Adult';

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
const WFR_fmtSE  = v => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)); // spherical equivalent
const WFR_SE = r => r.sph + r.cyl / 2;
const WFR_fmtDelta = (v, unit) => Math.abs(v) < 0.001 ? '—' : `${v > 0 ? '+' : ''}${unit === '°' ? Math.round(v) : v.toFixed(2)}${unit === '°' ? '°' : ''}`;

// #5 Smart-Cylinder bracket ladders. Initial step keys off |cyl|; the working
// step shrinks one rung per reversal so the endpoint converges (Reichert-style).
const WFR_PWR_LADDER = [0.50, 0.25];               // dioptric brackets
const WFR_AXIS_LADDER = [15, 10, 5, 3, 1];         // degrees
const WFR_powerStepFor = (cylMag, reversals) => {
  const start = cylMag >= 1.0 ? 0 : 1;             // ≥1.00 D starts coarse
  const idx = Math.min(start + reversals, WFR_PWR_LADDER.length - 1);
  return WFR_PWR_LADDER[idx];
};
const WFR_axisStepFor = (cylMag, reversals) => {
  const start = cylMag >= 1.5 ? 0 : cylMag >= 0.75 ? 1 : 2;
  const idx = Math.min(start + reversals, WFR_AXIS_LADDER.length - 1);
  return WFR_AXIS_LADDER[idx];
};

// Provisional tag — marks every surface gated on Reehana's Q3/Q7/Q8 answers.
function WFR_ProvTag({ note, small }) {
  if (WFR_REEHANA_CONFIRMED) return null;
  return (
    <span title={note || 'Provisional — pending optical-team confirmation (Reehana, Q3/Q7/Q8)'}
      style={{ display:'inline-flex', alignItems:'center', gap:4, padding: small ? '2px 7px' : '3px 9px', borderRadius:20, background:'#fffbeb', border:'1.5px solid #fcd34d', color:'#b45309', fontSize: small ? 9 : 10, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap', verticalAlign:'middle' }}>
      <svg width={small ? 9 : 10} height={small ? 9 : 10} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      Provisional
    </span>
  );
}

// Clinical line-pass rule: more than half correct (50% fail threshold,
// pending standards validation — see briefs/WavefrontRefraction_Clinical_Spec_v1.md §TBD).
const WFR_lineIsPassed = (correct, total) => total > 0 && correct > total / 2;

// Chart-walk tuning (ported from the v3 chart-interaction model, Jun 2026).
// MPMVA stages use a frontier walk starting at 20/70; JCC stays a focused read.
const WFR_WALK_START = 3;
const WFR_SETTLE_MS = 850; // delay before the active char/line advances (cancellable)

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
  const [subjStep, setSubjStep] = React.useState('setup'); // setup · sphere · jcc-axis · jcc-power · mpmva2 · add · binocular
  const [jccPower, setJccPower] = React.useState(0.50);
  const [jccFlip, setJccFlip] = React.useState(1);
  const [comparisons, setComparisons] = React.useState(0);
  // #5 Smart-Cylinder auto-bracketing: step shrinks after each preference reversal
  const [smartBracket, setSmartBracket] = React.useState(true);
  const [jccReversals, setJccReversals] = React.useState(0);
  const [jccLastPref, setJccLastPref] = React.useState(null); // 1 | 2 — to detect reversals
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

  // ── Chart frontier-navigation model (ported from v3 chart model, Jun 2026) ──
  // Applies to the MPMVA stages (sphere / 2nd MPMVA); JCC stays a focused read.
  const [pos, setPos] = React.useState(WFR_WALK_START);            // active chart line
  const [frontier, setFrontier] = React.useState(WFR_WALK_START);  // furthest line reached
  const [charPtr, setCharPtr] = React.useState(0);                 // E/C: optotype patient is on
  const [settledLines, setSettledLines] = React.useState(new Set()); // left/recorded → gate back-edits
  const [chartOverrides, setChartOverrides] = React.useState([]);  // audit: ahead-of-progress jumps
  const [chartEdits, setChartEdits] = React.useState([]);          // audit: recorded-answer back-edits
  const [pendingOverride, setPendingOverride] = React.useState(null);
  const [pendingEdit, setPendingEdit] = React.useState(null);
  const [chartToast, setChartToast] = React.useState(null);
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
  const [reportTab, setReportTab] = React.useState('summary'); // summary·comparison·daynight·simulation·wavefront·progression

  // #2 Binocular balance (after both eyes refined) — fogging / alternate occlusion
  const [binocOcclude, setBinocOcclude] = React.useState('both'); // OD | OS | both — which eye is open
  const [binocFog, setBinocFog] = React.useState(true);
  const [binocBalanced, setBinocBalanced] = React.useState(false);
  // #3 Habitual (current spectacle) Rx — manual entry; auto-pull from history later
  const [habitualRx, setHabitualRx] = React.useState(WFR_HABITUAL_SEED);

  // Collapsibles
  const [openAlign, setOpenAlign] = React.useState(false);
  const [openPupil, setOpenPupil] = React.useState(false);
  const [openFocus, setOpenFocus] = React.useState(false);
  const [sharpOK, setSharpOK] = React.useState(true); // image-sharpness yes/no readiness control

  const timerRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const advanceRef = React.useRef(null);
  const charAdvRef = React.useRef(null);

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

  // Reset the chart walk on entering an MPMVA stage — clinically each lens setting
  // is its own acuity read, so the frontier/guard rails start fresh per stage
  // (decision A, validated Jun 2026; see VisualAcuity_v3_ChartModel spec §F).
  React.useEffect(() => {
    if (subjStep === 'sphere' || subjStep === 'mpmva2') {
      if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
      if (charAdvRef.current) { clearTimeout(charAdvRef.current); charAdvRef.current = null; }
      setPos(WFR_WALK_START); setFrontier(WFR_WALK_START); setCharPtr(0); setSettledLines(new Set());
      setChartResults(r => { const c = { ...r }; WFR_VA_LINES.forEach(l => { delete c[`${subjEye}_${l.n}`]; }); return c; });
    }
  }, [subjStep, subjEye]);

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
    setComparisons(0); setJccFlip(1); setJccReversals(0); setJccLastPref(null);
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
      // both eyes refined → binocular balance gate (full + subjective-only both apply)
      setBinocBalanced(false); setBinocOcclude('both'); setBinocFog(true);
      setSubjStep('binocular');
    }
  };

  // #2 Binocular balance — fogging / alternate occlusion; balances accommodation
  // between the two eyes (no prism required — Q10: optics introduce no prism).
  const nudgeBalance = (eye, delta) => {
    setSubjRx(prev => ({ ...prev, [eye]: { ...prev[eye], sph: parseFloat((prev[eye].sph + delta).toFixed(2)) } }));
  };
  const completeBinocular = () => { setBinocBalanced(true); setStage('report'); };

  // #3 Habitual (old) Rx steppers
  const adjustHabitual = (eye, field, delta) => {
    setHabitualRx(prev => {
      let val = prev[eye][field] + delta;
      if (field === 'axis') val = ((val % 180) + 180) % 180;
      const dp = field === 'axis' ? 0 : 2;
      return { ...prev, [eye]: { ...prev[eye], [field]: parseFloat(val.toFixed(dp)) } };
    });
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
    setPos(WFR_WALK_START); setFrontier(WFR_WALK_START); setCharPtr(0); setSettledLines(new Set());
    setChartOverrides([]); setChartEdits([]); setPendingOverride(null); setPendingEdit(null); setChartToast(null);
    setOptotype('letters'); setOptoRot({});
    setElapsed(0); setNotes('');
    setResultView('full-wavefront'); setResultEye('both'); setShowRings(false); setZoomEye(null);
    setReportTab('summary'); setJccReversals(0); setJccLastPref(null); setSmartBracket(true);
    setBinocOcclude('both'); setBinocFog(true); setBinocBalanced(false); setHabitualRx(WFR_HABITUAL_SEED);
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
              Wavefront refraction combines objective measurement and subjective refinement. Both stages can be run together or independently.
            </p>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'stretch' }}>
            <Card
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>}
              title="Objective + subjective"
              desc="Objective wavefront capture first, then subjective refinement with the liquid lens — the complete two-stage workflow."
              onClick={beginObjective}
              btn="Begin objective + subjective"
            />
            <Card
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M4 12h16M4 19h10"/></svg>}
              title="Subjective only"
              desc="Subjective refinement with the liquid lens only; the objective wavefront capture is skipped. Use when recent objective data is already available."
              note="Objective starting values are entered manually as the reference point."
              onClick={beginSubjectiveOnly}
              btn="Begin subjective only"
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

  // ════════════════════════════════════════════════════════════════════
  // Frontier chart model (MPMVA stages) — ported from the v3 chart demo.
  // Writes the SAME chartResults shape the report's getBestVA already reads.
  const WFR_cancelAdvance = () => { if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; } };
  const WFR_cancelCharAdv = () => { if (charAdvRef.current) { clearTimeout(charAdvRef.current); charAdvRef.current = null; } };
  const WFR_lineLen = (n) => (WFR_VA_LINES.find(l => l.n === n) || { letters: [] }).letters.length;
  const WFR_hasMark = (eye, n) => (chartResults[chartKey(eye, n)] || []).some(x => x != null);
  const WFR_encountered = (n) => n <= frontier;
  const WFR_rowState = (eye, n) => n === pos ? 'active' : WFR_hasMark(eye, n) ? 'completed' : WFR_encountered(n) ? 'available' : 'locked';
  const WFR_isOpto = optotype !== 'letters';
  const WFR_optoKind = optotype === 'tumblingC' ? 'C' : 'E';
  const WFR_charUnlocked = (eye, n, idx) => { if (!WFR_isOpto) return true; if (n !== pos) return true; const m = chartResults[chartKey(eye, n)] || []; return idx === 0 || m[idx - 1] != null; };
  const WFR_lineComplete = (eye, n) => { const m = chartResults[chartKey(eye, n)]; return !!(m && m.length === WFR_lineLen(n) && m.every(x => x != null)); };
  const WFR_flashToast = (msg) => { setChartToast(msg); setTimeout(() => setChartToast(null), 2600); };
  const WFR_settle = (eye, n) => { if ((chartResults[chartKey(eye, n)] || []).some(x => x != null)) setSettledLines(s => { const x = new Set(s); x.add(chartKey(eye, n)); return x; }); };

  const WFR_toggleChar = (eye, n, idx, allowAdvance) => {
    if (!WFR_charUnlocked(eye, n, idx)) return;
    WFR_cancelAdvance(); WFR_cancelCharAdv();
    const prev = getLine(eye, n);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    setChartResults(r => ({ ...r, [chartKey(eye, n)]: next }));
    if (n === pos) {
      if (WFR_isOpto) {
        setCharPtr(idx);
        if (next[idx] != null) { let nx = -1; for (let j = idx + 1; j < next.length; j++) { if (next[j] == null) { nx = j; break; } } if (nx >= 0) charAdvRef.current = setTimeout(() => { charAdvRef.current = null; setCharPtr(nx); }, WFR_SETTLE_MS); }
      }
      if (allowAdvance && next.every(m => m != null)) {
        const correct = next.filter(m => m === 'correct').length;
        if (WFR_lineIsPassed(correct, next.length) && n < 10) {
          advanceRef.current = setTimeout(() => { advanceRef.current = null; setSettledLines(s => { const x = new Set(s); x.add(chartKey(eye, n)); return x; }); setFrontier(f => Math.max(f, n + 1)); setPos(n + 1); }, WFR_SETTLE_MS);
        }
      }
    }
  };
  const WFR_onCharClick = (eye, n, idx) => {
    if (!WFR_encountered(n)) { setPendingOverride(n); return; }
    const marks = chartResults[chartKey(eye, n)] || [];
    if (settledLines.has(chartKey(eye, n)) && marks[idx] != null) { setPendingEdit({ n, idx }); return; }
    if (n !== pos) { setPos(n); WFR_toggleChar(eye, n, idx, false); return; }
    WFR_toggleChar(eye, n, idx, true);
  };
  const WFR_applyEdit = ({ n, idx }) => {
    const eye = subjEye;
    const prev = getLine(eye, n); const before = prev[idx];
    const after = before === null ? 'correct' : before === 'correct' ? 'incorrect' : null;
    const arr = [...prev]; arr[idx] = after;
    const va = (WFR_VA_LINES.find(l => l.n === n) || {}).va;
    WFR_cancelAdvance(); WFR_cancelCharAdv();
    setSettledLines(s => { const x = new Set(s); if ((chartResults[chartKey(eye, pos)] || []).some(m => m != null)) x.add(chartKey(eye, pos)); x.delete(chartKey(eye, n)); return x; });
    setChartResults(r => ({ ...r, [chartKey(eye, n)]: arr }));
    setChartEdits(e => [...e, { ts: Date.now(), eye, va, idx, from: before, to: after }]);
    setPos(n);
    WFR_flashToast(`Answer edit recorded · ${va} letter ${idx + 1}`);
  };
  const WFR_doOverride = (n) => {
    const eye = subjEye; WFR_cancelAdvance(); WFR_cancelCharAdv(); WFR_settle(eye, pos);
    const target = WFR_VA_LINES.find(l => l.n === n) || {};
    const cur = WFR_VA_LINES.find(l => l.n === pos) || {};
    setChartOverrides(o => [...o, { ts: Date.now(), from: cur.va, to: target.va, eye }]);
    setFrontier(f => Math.max(f, n)); setPos(n);
    WFR_flashToast(`Override recorded · ${cur.va} → ${target.va}`);
  };
  const WFR_goToLine = (n) => { const t = Math.max(1, Math.min(10, n)); if (t === pos) return; WFR_cancelAdvance(); WFR_cancelCharAdv(); WFR_settle(subjEye, pos); if (WFR_encountered(t)) setPos(t); else setPendingOverride(t); };
  const WFR_clearLine = () => { WFR_cancelAdvance(); WFR_cancelCharAdv(); setCharPtr(0); setChartResults(r => { const c = { ...r }; delete c[chartKey(subjEye, pos)]; return c; }); };
  const WFR_endHere = () => { WFR_cancelAdvance(); WFR_cancelCharAdv(); const cur = getLine(subjEye, pos).slice(); for (let i = 0; i < cur.length; i++) if (cur[i] == null) cur[i] = 'incorrect'; setChartResults(r => ({ ...r, [chartKey(subjEye, pos)]: cur })); };

  // 4-way clicker glyph — the patient's response device for Tumbling E / Landolt C.
  // Highlights the direction the patient presses for the shown optotype orientation.
  const WFR_rotToDir = (rot) => ({ 0:'right', 90:'down', 180:'left', 270:'up' }[((rot % 360) + 360) % 360] || 'right');
  const WFR_ClickerGlyph = ({ dir }) => {
    const cell = (gc, gr, on, key) => <div key={key} style={{ gridColumn:gc, gridRow:gr, width:16, height:16, borderRadius:4, background: on ? accent : '#fff', border:`1.5px solid ${on ? accent : '#cbd5e1'}` }}/>;
    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 16px)', gridTemplateRows:'repeat(3, 16px)', gap:3 }}>
        {cell(2, 1, dir === 'up', 'u')}
        {cell(1, 2, dir === 'left', 'l')}
        <div key="c" style={{ gridColumn:2, gridRow:2, width:16, height:16, borderRadius:'50%', background:'#eef2f7', border:'1.5px solid #cbd5e1' }}/>
        {cell(3, 2, dir === 'right', 'r')}
        {cell(2, 3, dir === 'down', 'd')}
      </div>
    );
  };

  // Patient view + doctor frontier chart for the MPMVA stages (client-approved v3 split)
  const WFR_WalkChart = () => {
    const eye = subjEye;
    const curLine = WFR_VA_LINES.find(l => l.n === pos) || WFR_VA_LINES[0];
    const cnt = curLine.letters.length;
    const lineDone = WFR_lineComplete(eye, pos);
    const activeRot = optoRot[`${eye}_${pos}_${charPtr}`] || 0;
    const patientNote = WFR_isOpto ? (lineDone ? 'Line complete' : `Patient indicates orientation on the 4-way clicker · character ${charPtr + 1} of ${cnt}`) : 'Patient reads this line aloud · doctor scores';
    const stepBtn = (disabled) => ({ width:36, height:36, borderRadius:8, border:`1.5px solid ${WFR_C.border}`, background:'#fff', cursor: disabled?'default':'pointer', color: disabled?'#d1d5db':WFR_C.text2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 });
    return (
      <div style={{ display:'flex', flex:1, minHeight:0, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
        {/* PATIENT VIEW — what the patient sees through the headset */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', borderRight:'1px solid #e5e7eb' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }}/>
              <span style={WFR_VIOLATOR}>Patient view · headset</span>
            </div>
            <span style={{ ...WFR_VIOLATOR, color:'#cbd5e1' }}>{eye} · 20 ft</span>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
            {WFR_isOpto
              ? <WFR_Optotype kind={WFR_optoKind} size={Math.min(curLine.fs * 1.4, 230)} rotation={activeRot} color={WFR_C.text}/>
              : <div style={{ display:'flex', gap:Math.max(curLine.fs * 0.4, 14), alignItems:'center' }}>{curLine.letters.map((ltr, i) => <span key={i} style={{ fontSize:Math.min(curLine.fs, Math.floor(560 / cnt)), fontWeight:700, color:WFR_C.text, lineHeight:1 }}>{ltr}</span>)}</div>}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'0 20px 22px' }}>
            {WFR_isOpto && !lineDone && <WFR_ClickerGlyph dir={WFR_rotToDir(activeRot)}/>}
            <div style={{ fontSize:11, color:WFR_C.muted }}>{patientNote}</div>
          </div>
        </div>
        {/* DOCTOR CONTROL — the full chart */}
        <div style={{ flex:1.05, display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid #e5e7eb' }}>
            <div>
              <div style={WFR_VIOLATOR}>Doctor control</div>
              <div style={{ fontSize:14, fontWeight:700, color:WFR_C.text, marginTop:3 }}>{optotype === 'letters' ? 'Snellen' : optotype === 'tumblingC' ? 'Landolt C' : 'Tumbling E'} · {eye}</div>
            </div>
            <div style={{ flex:1 }}/>
            <span style={{ fontSize:10, fontWeight:700, color:WFR_C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Line</span>
            <button onClick={() => WFR_goToLine(pos - 1)} disabled={pos <= 1} title="Larger (toward 20/200)" style={stepBtn(pos <= 1)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg></button>
            <div style={{ minWidth:58, textAlign:'center', fontSize:14, fontWeight:700, color:accent, fontVariantNumeric:'tabular-nums' }}>{curLine.va}</div>
            <button onClick={() => WFR_goToLine(pos + 1)} disabled={pos >= 10} title="Smaller (toward 20/10)" style={stepBtn(pos >= 10)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'8px 18px', display:'flex', flexDirection:'column', justifyContent:'flex-start', gap:2 }}>
          {WFR_VA_LINES.map(line => {
            const marks = getLine(eye, line.n);
            const st = WFR_rowState(eye, line.n);
            const current = st === 'active', completed = st === 'completed', locked = st === 'locked';
            const correct = marks.filter(m => m === 'correct').length;
            const total = line.letters.length;
            const pct = total ? Math.round(correct / total * 100) : 0;
            const hasAny = marks.some(m => m != null);
            const dispSize = Math.max(12, Math.min(27, Math.round(line.fs * 0.3)));
            return (
              <div key={line.n} onClick={() => WFR_goToLine(line.n)} title={locked ? 'Ahead of progress — tap to override (recorded)' : completed ? 'Completed — tap to re-check' : undefined}
                style={{ display:'grid', gridTemplateColumns:'46px 1fr 52px', alignItems:'center', gap:10, padding:'1px 8px', borderRadius:9, cursor:'pointer', border: current ? `2px solid ${accent}` : '2px solid transparent', background: current ? `${accent}0c` : completed ? '#f8fafc' : 'transparent' }}>
                <div style={{ fontSize:11, fontWeight:700, color: current ? accent : WFR_C.muted, textAlign:'right', fontVariantNumeric:'tabular-nums', opacity: locked ? 0.45 : completed ? 0.7 : 1 }}>{line.va}</div>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:Math.max(dispSize * 0.38, 8) }}>
                  {line.letters.map((ltr, idx) => {
                    const res = marks[idx];
                    const col = res === 'correct' ? WFR_C.success : res === 'incorrect' ? WFR_C.error : (locked ? '#c7ccd4' : WFR_C.text);
                    const cDisabled = current && !WFR_charUnlocked(eye, line.n, idx);
                    const isCur = WFR_isOpto && current && idx === charPtr && !lineDone && !cDisabled;
                    const op = cDisabled ? 0.22 : completed ? 0.5 : locked ? 0.5 : 1;
                    return (
                      <button key={idx} onClick={(e) => { e.stopPropagation(); WFR_onCharClick(eye, line.n, idx); }} disabled={cDisabled}
                        style={{ background: isCur ? '#eef2f7' : 'none', cursor: cDisabled ? 'not-allowed' : 'pointer', padding:2, border: isCur ? '2px solid #9ca3af' : '2px solid transparent', borderRadius:8, minWidth:22, minHeight:22, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:WFR_FONT, lineHeight:1, opacity:op }}>
                        {WFR_isOpto
                          ? <WFR_Optotype kind={WFR_optoKind} size={dispSize} rotation={optoRot[`${eye}_${line.n}_${idx}`] || 0} color={col}/>
                          : <span style={{ fontSize:dispSize, fontWeight:700, color:col, textDecoration: res === 'incorrect' ? 'line-through' : 'none', textDecorationThickness:3 }}>{ltr}</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ textAlign:'right' }}>
                  {hasAny ? <span style={{ fontSize:11, fontWeight:700, color:WFR_C.text2, fontVariantNumeric:'tabular-nums', opacity: completed ? 0.7 : 1 }}>{pct}%</span>
                    : locked ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c7ccd4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    : <span style={{ fontSize:10, color:WFR_C.muted }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderTop:'1px solid #e5e7eb', background:WFR_C.surface, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, minWidth:118 }}>
            <span style={{ fontSize:11, color:WFR_C.muted, whiteSpace:'nowrap' }}>Best VA · {eye}</span>
            <span style={{ fontSize:18, fontWeight:700, color: fmtBestVA(eye) === '—' ? WFR_C.muted : WFR_C.navy, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{fmtBestVA(eye)}</span>
          </div>
          {chartOverrides.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:`${WFR_C.amber}14`, border:`1.5px solid ${WFR_C.amber}55` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={WFR_C.amber} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontSize:11, fontWeight:700, color:WFR_C.amber }}>{chartOverrides.length} override{chartOverrides.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {chartEdits.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:`${WFR_C.navy}0d`, border:`1.5px solid ${WFR_C.navy}33` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={WFR_C.navy} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span style={{ fontSize:11, fontWeight:700, color:WFR_C.navy }}>{chartEdits.length} answer edit{chartEdits.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div style={{ flex:1 }}/>
          {!lineDone && (
            <button onClick={WFR_endHere} title="Patient can't read further — mark remaining letters incorrect and set the endpoint" style={{ minHeight:38, padding:'8px 12px', borderRadius:9, border:`1.5px solid ${WFR_C.border}`, background:'#fff', color:WFR_C.text2, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, display:'flex', alignItems:'center', gap:7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Can't read
            </button>
          )}
          {WFR_hasMark(eye, pos) && (
            <button onClick={WFR_clearLine} title="Clear this line's marks" style={{ minHeight:38, padding:'8px 12px', borderRadius:9, border:`1.5px solid ${WFR_C.border}`, background:'#fff', color:WFR_C.text2, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, display:'flex', alignItems:'center', gap:7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              Clear line
            </button>
          )}
        </div>
        </div>
      </div>
    );
  };

  // Override + back-edit confirm modals and the audit toast (fixed overlays)
  const WFR_chartModals = () => (
    <>
      {chartToast && (
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)', background:WFR_C.navy, color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:12, fontWeight:700, fontFamily:WFR_FONT, boxShadow:'0 8px 24px rgba(15,23,42,0.28)', zIndex:1200, display:'flex', alignItems:'center', gap:9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>{chartToast}
        </div>
      )}
      {pendingOverride != null && (() => { const t = WFR_VA_LINES.find(l => l.n === pendingOverride) || {}; const cur = WFR_VA_LINES.find(l => l.n === pos) || {}; return (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }} onClick={() => setPendingOverride(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:440, background:'#fff', borderRadius:16, padding:'26px 28px', boxShadow:'0 24px 60px rgba(15,23,42,0.32)', fontFamily:WFR_FONT }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${WFR_C.amber}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={WFR_C.amber} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
              <h3 style={{ fontSize:17, fontWeight:700, color:WFR_C.navy, margin:0 }}>Skip ahead to {t.va}?</h3>
            </div>
            <p style={{ fontSize:13, color:WFR_C.text2, lineHeight:1.6, margin:'0 0 20px' }}>This jumps past the patient's current line ({cur.va}), ahead of natural progression. Lines in between stay open and unscored. <strong style={{ color:WFR_C.text }}>The override will be recorded in the session log.</strong></p>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button autoFocus onClick={() => setPendingOverride(null)} style={secondaryBtn}>Cancel</button>
              <button onClick={() => { WFR_doOverride(pendingOverride); setPendingOverride(null); }} style={{ ...primaryBtn, background:WFR_C.amber }}>Override &amp; jump</button>
            </div>
          </div>
        </div>
      ); })()}
      {pendingEdit && (() => { const ev = WFR_VA_LINES.find(l => l.n === pendingEdit.n) || {}; return (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }} onClick={() => setPendingEdit(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:440, background:'#fff', borderRadius:16, padding:'26px 28px', boxShadow:'0 24px 60px rgba(15,23,42,0.32)', fontFamily:WFR_FONT }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
              <h3 style={{ fontSize:17, fontWeight:700, color:WFR_C.navy, margin:0 }}>Change a recorded answer?</h3>
            </div>
            <p style={{ fontSize:13, color:WFR_C.text2, lineHeight:1.6, margin:'0 0 20px' }}>Line {ev.va} was already completed. Editing letter {pendingEdit.idx + 1} changes a recorded result. <strong style={{ color:WFR_C.text }}>The change will be saved to the answer-edit log.</strong></p>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button autoFocus onClick={() => setPendingEdit(null)} style={secondaryBtn}>Cancel</button>
              <button onClick={() => { WFR_applyEdit(pendingEdit); setPendingEdit(null); }} style={primaryBtn}>Change answer</button>
            </div>
          </div>
        </div>
      ); })()}
    </>
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
      <div style={{ padding:'14px 24px', height:'100%', boxSizing:'border-box', overflowY:'auto' }}>
        <div style={{ maxWidth:(subjStep === 'sphere' || subjStep === 'mpmva2') ? 1180 : 880, margin:'0 auto', display:'flex', flexDirection:'column', gap:12, height:'100%', boxSizing:'border-box' }}>
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
          {WFR_chartModals()}

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
              {WFR_WalkChart()}
              <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>{subjStep === 'mpmva2' ? 'Second MPMVA · sphere' : 'MPMVA · sphere'} ({subjEye})</span>
                  <Stepper value={r.sph} field="sph" step={0.25} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtSph}/>
                </div>
                {fogAmount > 0 && subjStep === 'sphere' && (
                  <div style={{ fontSize:11, fontWeight:600, color:accent, background:`${accent}12`, padding:'6px 10px', borderRadius:8, whiteSpace:'nowrap' }}>Fog +{fogAmount.toFixed(2)} D</div>
                )}
                <div style={{ flex:1, minWidth:200, fontSize:11, color:WFR_C.muted, lineHeight:1.45 }}>
                  {subjStep === 'mpmva2'
                    ? 'Add +0.50 D fog, then reduce in 0.25 D steps to the best-VA sphere endpoint.'
                    : 'Reduce sphere in 0.25 D steps to the maximum plus that gives best VA — do not over-minus.'}
                </div>
                <button onClick={advanceSubjStep} style={{ ...primaryBtn, minHeight:44, padding:'11px 22px' }}>{subjStep === 'mpmva2' ? 'Sphere endpoint confirmed →' : 'MPMVA achieved →'}</button>
              </div>
            </>
          )}

          {/* JCC axis / power */}
          {jccTarget && (() => {
            // JCC fixates on a SINGLE line one larger than best VA (not the full chart).
            const bestVa = getBestVA(subjEye).va;
            const bestN = (WFR_VA_LINES.find(l => l.va === bestVa) || {}).n;
            const fixN = bestN ? Math.max(1, bestN - 1) : 5;
            const fixLine = WFR_VA_LINES.find(l => l.n === fixN) || WFR_VA_LINES[4];
            const fixCnt = fixLine.letters.length;
            // #5 Smart-Cylinder bracketing — working step auto-sizes to |cyl|
            // and shrinks one ladder rung per recorded reversal.
            const cylMag = Math.abs(r.cyl);
            const smartPwrStep = WFR_powerStepFor(cylMag, jccReversals);
            const smartAxisStep = WFR_axisStepFor(cylMag, jccReversals);
            const workingStep = subjStep === 'jcc-axis' ? `±${smartAxisStep}°` : `±${smartPwrStep.toFixed(2)} D`;
            const ladder = subjStep === 'jcc-axis' ? WFR_AXIS_LADDER.map(v => `${v}°`) : WFR_PWR_LADDER.map(v => v.toFixed(2));
            const rungIdx = subjStep === 'jcc-axis' ? WFR_AXIS_LADDER.indexOf(smartAxisStep) : WFR_PWR_LADDER.indexOf(smartPwrStep);
            return (
            <div style={{ flex:1, minHeight:0, display:'flex', gap:14 }}>
              {/* Patient fixation target — single line, the two flips compared against it */}
              <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }}/>
                    <span style={WFR_VIOLATOR}>Patient view · headset</span>
                  </div>
                  <span style={{ ...WFR_VIOLATOR, color:'#cbd5e1' }}>Fixation · {fixLine.va}</span>
                </div>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
                  {WFR_isOpto
                    ? <div style={{ display:'flex', gap:Math.max(fixLine.fs * 0.5, 18) }}>{fixLine.letters.map((_, i) => <WFR_Optotype key={i} kind={WFR_optoKind} size={Math.min(fixLine.fs, 92)} rotation={optoRot[`${subjEye}_${fixLine.n}_${i}`] || 0} color={WFR_C.text}/>)}</div>
                    : <div style={{ display:'flex', gap:Math.max(fixLine.fs * 0.45, 18) }}>{fixLine.letters.map((ltr, i) => <span key={i} style={{ fontSize:Math.min(fixLine.fs, Math.floor(540 / fixCnt)), fontWeight:700, color:WFR_C.text, lineHeight:1 }}>{ltr}</span>)}</div>}
                </div>
                <div style={{ padding:'0 20px 18px', textAlign:'center' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:20, background:`${accent}12`, border:`1.5px solid ${accent}` }}>
                    <span style={{ fontSize:13, fontWeight:700, color:accent }}>Showing choice {jccFlip}</span>
                  </div>
                  <div style={{ fontSize:11, color:WFR_C.muted, marginTop:10 }}>Patient compares the two flips — "which is clearer, 1 or 2?"</div>
                </div>
              </div>
              {/* JCC controls */}
              <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14, overflowY:'auto' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{subjStep === 'jcc-axis' ? 'JCC — axis refinement' : 'JCC — power refinement'}</div>
                  <div style={{ flex:1 }}/>
                  {subjStep === 'jcc-axis' && <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', background:'#f3f4f6', padding:'4px 10px', borderRadius:14, textTransform:'uppercase', letterSpacing:'0.05em' }}>Axis before power</div>}
                </div>
                <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <svg width="104" height="104" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2"/>
                      {(() => {
                        const ax = r.axis * Math.PI / 180;
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
                    <button onClick={() => { setJccFlip(f => f === 1 ? 2 : 1); setComparisons(c => c + 1); }} style={{ ...secondaryBtn, minHeight:40, padding:'8px 18px' }}>Flip JCC (choice {jccFlip})</button>
                    <div style={{ fontSize:11, color: comparisons >= 3 ? WFR_C.amber : '#9ca3af', fontWeight:600 }}>Comparisons: {comparisons}{comparisons >= 3 ? ' · ≈3 typical' : ''}</div>
                  </div>
                  <div style={{ flex:1, minWidth:240, display:'flex', flexDirection:'column', gap:14 }}>
                    {/* #5 Smart-Cylinder bracketing */}
                    <div style={{ background: smartBracket ? `${accent}0a` : '#f9fafb', border:`1.5px solid ${smartBracket ? accent+'44' : '#e5e7eb'}`, borderRadius:11, padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <span style={{ ...WFR_VIOLATOR, fontSize:9, color: smartBracket ? accent : WFR_C.muted }}>Smart-Cylinder bracketing</span>
                        <div style={{ flex:1 }}/>
                        <button onClick={() => setSmartBracket(v => !v)} title="Toggle auto-bracketing"
                          style={{ width:38, height:22, minWidth:38, minHeight:22, borderRadius:11, border:'none', cursor:'pointer', background: smartBracket ? accent : '#cbd5e1', position:'relative', flexShrink:0, transition:'background 0.15s' }}>
                          <span style={{ position:'absolute', top:2, left: smartBracket ? 18 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.2)' }}/>
                        </button>
                      </div>
                      {smartBracket ? (
                        <>
                          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:10 }}>
                            <div>
                              <div style={{ fontSize:9, color:WFR_C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Working step</div>
                              <div style={{ fontSize:24, fontWeight:700, color:accent, fontVariantNumeric:'tabular-nums', lineHeight:1.1 }}>{workingStep}</div>
                            </div>
                            <div style={{ flex:1 }}/>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:9, color:WFR_C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Reversals</div>
                              <div style={{ fontSize:24, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums', lineHeight:1.1 }}>{jccReversals}</div>
                            </div>
                          </div>
                          {/* ladder */}
                          <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                            {ladder.map((lab, i) => (
                              <div key={lab} style={{ flex:1, textAlign:'center', padding:'5px 0', borderRadius:7, fontSize:11, fontWeight:700, fontVariantNumeric:'tabular-nums',
                                background: i === rungIdx ? accent : i < rungIdx ? '#f0fdf4' : '#fff',
                                color: i === rungIdx ? '#fff' : i < rungIdx ? '#9ca3af' : WFR_C.text2,
                                border:`1.5px solid ${i === rungIdx ? accent : i < rungIdx ? '#bbf7d0' : '#e5e7eb'}`, textDecoration: i < rungIdx ? 'line-through' : 'none' }}>{lab}</div>
                            ))}
                          </div>
                          <button onClick={() => { setJccReversals(n => n + 1); setComparisons(c => c + 1); }}
                            disabled={rungIdx >= ladder.length - 1}
                            style={{ width:'100%', minHeight:38, borderRadius:9, border:`1.5px solid ${rungIdx >= ladder.length - 1 ? '#e5e7eb' : accent}`, background: rungIdx >= ladder.length - 1 ? '#f3f4f6' : `${accent}12`, color: rungIdx >= ladder.length - 1 ? '#9ca3af' : accent, fontSize:12, fontWeight:700, cursor: rungIdx >= ladder.length - 1 ? 'default' : 'pointer', fontFamily:WFR_FONT, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                            {rungIdx >= ladder.length - 1
                              ? 'Finest bracket reached'
                              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>Reversal reached · narrow bracket</>}
                          </button>
                          <div style={{ fontSize:10, color:WFR_C.muted, marginTop:7, lineHeight:1.4 }}>Step auto-set from cylinder magnitude ({WFR_fmtCyl(r.cyl)} D); narrows one rung each time the patient reverses preference.</div>
                        </>
                      ) : (
                        <div>
                          <div style={{ fontSize:11, color:WFR_C.muted, marginBottom:8 }}>Manual JCC cross-cylinder power</div>
                          <div style={{ display:'flex', gap:8 }}>
                            {[0.25, 0.50, 0.75, 1.00].map(p => (
                              <button key={p} onClick={() => setJccPower(p)} style={{ flex:1, minHeight:42, borderRadius:9, border:`1.5px solid ${jccPower===p ? accent : '#e5e7eb'}`, background: jccPower===p ? accent : '#fff', color: jccPower===p ? '#fff' : '#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:WFR_FONT, fontVariantNumeric:'tabular-nums' }}>{p.toFixed(2)}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>{subjStep === 'jcc-axis' ? `Axis (${subjEye})` : `Cylinder (${subjEye})`}{smartBracket ? ` · ${workingStep}` : ''}</span>
                      {subjStep === 'jcc-axis'
                        ? (smartBracket
                            ? <Stepper value={r.axis} field="axis" step={smartAxisStep} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtAxis}/>
                            : <AxisStepper value={r.axis} eye={subjEye}/>)
                        : <Stepper value={r.cyl} field="cyl" step={smartBracket ? smartPwrStep : 0.25} onAdjust={adjustSubj} eye={subjEye} fmt={WFR_fmtCyl}/>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:WFR_C.muted, lineHeight:1.45 }}>
                  {subjStep === 'jcc-axis'
                    ? 'Flip the JCC; ask "clearer — 1 or 2?" Move axis toward the same-sign dot. Reduce step after each reversal: 15° → 10° → 5° → 3° → 1°.'
                    : 'Flip with the handle along the axis. Add minus cylinder when the patient prefers the minus; add +0.25 D SPH per −0.50 D CYL.'}
                </div>
                <div style={{ flex:1 }}/>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={advanceSubjStep} style={{ ...primaryBtn, minHeight:44, padding:'11px 22px' }}>{subjStep === 'jcc-axis' ? 'Axis confirmed →' : 'Power confirmed →'}</button>
                </div>
              </div>
            </div>
            );
          })()}

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

          {/* #2 BINOCULAR BALANCE — fogging / alternate occlusion (no prism, Q10) */}
          {subjStep === 'binocular' && (() => {
            const sphDiff = subjRx.OD.sph - subjRx.OS.sph;
            const balanced = Math.abs(sphDiff) < 0.001;
            return (
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'24px 26px', display:'flex', flexDirection:'column', gap:18 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ width:46, height:46, borderRadius:11, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', color:accent, flexShrink:0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:17, fontWeight:700, color:'#111827' }}>Binocular balance</div>
                    <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginTop:3 }}>Equalize accommodation between the two eyes by fogging both, then alternately occluding. The clearer eye is balanced toward the other in +0.25 D steps until blur is equal. No prism is introduced — dissociation is by occlusion (per headset optics).</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                  {/* Alternate occlusion control */}
                  <div style={{ flex:1, minWidth:260, background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px 18px' }}>
                    <div style={{ ...WFR_VIOLATOR, fontSize:9, marginBottom:12 }}>Alternate occlusion</div>
                    <div style={{ display:'flex', background:'#fff', borderRadius:10, padding:4, gap:4, border:'1px solid #e5e7eb' }}>
                      {[['OD','Right open'], ['both','Both open'], ['OS','Left open']].map(([v,l]) => (
                        <button key={v} onClick={() => setBinocOcclude(v)} style={{ flex:1, minHeight:42, borderRadius:7, border:'none', cursor:'pointer', background: binocOcclude===v ? accent : 'transparent', color: binocOcclude===v ? '#fff' : '#6b7280', fontSize:12, fontWeight:700, fontFamily:WFR_FONT }}>{l}</button>
                      ))}
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, cursor:'pointer' }}>
                      <button onClick={() => setBinocFog(v => !v)} style={{ width:38, height:22, minWidth:38, minHeight:22, borderRadius:11, border:'none', cursor:'pointer', background: binocFog ? accent : '#cbd5e1', position:'relative', flexShrink:0 }}>
                        <span style={{ position:'absolute', top:2, left: binocFog ? 18 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.15s' }}/>
                      </button>
                      <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>Fog both eyes +0.75 D</span>
                    </label>
                    <div style={{ fontSize:11, color:WFR_C.muted, marginTop:10, lineHeight:1.45 }}>Ask the patient which eye's chart is clearer, or whether they appear equal.</div>
                  </div>

                  {/* Balance steppers */}
                  <div style={{ flex:1, minWidth:260, background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px 18px' }}>
                    <div style={{ ...WFR_VIOLATOR, fontSize:9, marginBottom:12 }}>Sphere balance</div>
                    {objSequence.map(e => (
                      <div key={e} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, opacity: binocOcclude==='both' || binocOcclude===e ? 1 : 0.4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color: e===subjEye?accent:'#374151', width:34 }}>{e}</span>
                        <Stepper value={subjRx[e].sph} field="sph" step={0.25} onAdjust={(eye,f,d) => nudgeBalance(eye,d)} eye={e} fmt={WFR_fmtSph}/>
                      </div>
                    ))}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:9, background: balanced ? '#f0fdf4' : `${WFR_C.amber}12`, border:`1px solid ${balanced ? '#bbf7d0' : WFR_C.amber+'55'}`, marginTop:4 }}>
                      <span style={{ fontSize:11, fontWeight:700, color: balanced ? '#047857' : WFR_C.amber }}>OD − OS sphere</span>
                      <span style={{ fontSize:14, fontWeight:700, color: balanced ? '#047857' : WFR_C.amber, fontVariantNumeric:'tabular-nums' }}>{balanced ? 'Balanced' : `${sphDiff > 0 ? '+' : ''}${sphDiff.toFixed(2)} D`}</span>
                    </div>
                  </div>
                </div>

                <ClinicalNote>Balance does not change the cylinder or axis — only the sphere is equalized. Skip for strongly anisometropic patients where equal blur is not expected.</ClinicalNote>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
                  <button onClick={completeBinocular} style={secondaryBtn}>Skip balance</button>
                  <button onClick={completeBinocular} style={primaryBtn}>Balance confirmed · view report →</button>
                </div>
              </div>
            );
          })()}
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

    // ── Report tab set (wavefront tab only when objective stage ran) ──
    const reportTabs = [
      ['summary', 'Summary'],
      ['comparison', 'Rx comparison'],
      ['daynight', 'Day & night'],
      ['simulation', 'Vision simulation'],
      ...(ranObjective ? [['wavefront', 'Wavefront']] : []),
      ['progression', 'Progression'],
    ];
    const activeTab = reportTabs.some(t => t[0] === reportTab) ? reportTab : 'summary';

    // ════════ #3 MULTI-SOURCE Rx COMPARISON ════════
    const renderComparison = () => {
      const srcRow = (label, rx, tone) => (
        <tr style={{ borderBottom:'1px solid #f3f4f6' }}>
          <td style={{ padding:'9px 12px', fontSize:12, fontWeight:700, color: tone || WFR_C.text2 }}>{label}</td>
          <td style={{ padding:'9px 12px', fontSize:12, color:WFR_C.text2, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{rx ? WFR_fmtSph(rx.sph) : '—'}</td>
          <td style={{ padding:'9px 12px', fontSize:12, color:WFR_C.text2, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{rx ? WFR_fmtCyl(rx.cyl) : '—'}</td>
          <td style={{ padding:'9px 12px', fontSize:12, color:WFR_C.text2, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{rx ? WFR_fmtAxis(rx.axis) : '—'}</td>
          <td style={{ padding:'9px 12px', fontSize:12, fontWeight:700, color:WFR_C.navy, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{rx ? WFR_fmtSE(WFR_SE(rx)) : '—'}</td>
        </tr>
      );
      return (
        <>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
              <div style={WFR_REPORT_LABEL}>Multi-source comparison</div>
              <div style={{ flex:1 }}/>
              <span style={{ fontSize:11, color:WFR_C.muted }}>Spherical equivalent (SE) shown for each source</span>
            </div>
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginBottom:16 }}>Objective wavefront, subjective endpoint, the patient's habitual spectacle Rx, and unaided — side by side with deltas. Habitual is entered manually below; it will auto-populate from the cloud patient time-series once history sync is live.</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {objSequence.map(e => {
                const unaided = { sph:0, cyl:0, axis:0, add:0 };
                const dHab = WFR_SE(subjRx[e]) - WFR_SE(habitualRx[e]);
                return (
                  <div key={e} style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
                    <div style={{ background:'#f9fafb', padding:'10px 14px', fontSize:12, fontWeight:700, color:accent, borderBottom:'1px solid #e5e7eb' }}>{WFR_EYE_NAMED[e]}</div>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead><tr style={{ background:'#fff' }}>{['Source','SPH','CYL','AXIS','SE'].map((h,i) => (<th key={h} style={{ fontSize:9, fontWeight:700, color:WFR_C.muted, textAlign: i===0?'left':'right', padding:'6px 12px', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f3f4f6' }}>{h}</th>))}</tr></thead>
                      <tbody>
                        {ranObjective && srcRow('Objective', WFR_OBJ[e])}
                        {srcRow('Subjective', subjRx[e], accent)}
                        {srcRow('Habitual', habitualRx[e])}
                        {srcRow('Unaided', unaided)}
                      </tbody>
                    </table>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background: Math.abs(dHab) >= 0.5 ? `${WFR_C.amber}10` : '#f9fafb', borderTop:'1px solid #e5e7eb' }}>
                      <span style={{ fontSize:11, fontWeight:700, color: Math.abs(dHab) >= 0.5 ? WFR_C.amber : '#6b7280' }}>SE change vs habitual</span>
                      <span style={{ fontSize:14, fontWeight:700, color: Math.abs(dHab) >= 0.5 ? WFR_C.amber : WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{WFR_fmtDelta(dHab, 'D')} D</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habitual Rx manual entry */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
              <div style={WFR_REPORT_LABEL}>Habitual prescription (current glasses)</div>
              <span style={{ fontSize:10, fontWeight:700, color:'#6b7280', background:'#f3f4f6', padding:'4px 10px', borderRadius:14, textTransform:'uppercase', letterSpacing:'0.05em' }}>Manual entry</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {objSequence.map(e => (
                <div key={e} style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:accent, marginBottom:12 }}>{e}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'auto auto', gap:'12px 20px' }}>
                    {[['SPH','sph',0.25, WFR_fmtSph], ['CYL','cyl',0.25, WFR_fmtCyl], ['AXIS','axis',1, WFR_fmtAxis], ['ADD','add',0.25, WFR_fmtAdd]].map(([lab, field, step, fmt]) => (
                      <div key={field} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <span style={{ ...WFR_VIOLATOR, fontSize:9 }}>{lab}</span>
                        <Stepper value={habitualRx[e][field]} field={field} step={step} onAdjust={adjustHabitual} eye={e} fmt={fmt}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:WFR_C.muted, marginTop:12, fontStyle:'italic' }}>Auto-pull from the patient's cloud time-series profile is planned (headset Q9 — time-series profile confirmed).</div>
          </div>

          {ranObjective && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Objective → subjective change</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {objSequence.map(e => (
                  <div key={e} style={{ padding:'12px 14px', background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:accent, marginBottom:4 }}>{e}</div>
                    <div style={{ fontSize:12, color:'#374151', fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{deltaRow(e)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    };

    // ════════ #4 PHOTOPIC vs MESOPIC (day-vs-night) ════════
    const renderDayNight = () => {
      const show6 = WFR_SIXMM_PROVISIONAL;
      return (
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
            <div style={WFR_REPORT_LABEL}>Photopic vs. mesopic refraction</div>
            <div style={{ flex:1 }}/>
            <span style={{ fontSize:11, color:WFR_C.muted }}>Day (bright / small pupil) vs. night (dim / large pupil)</span>
          </div>
          <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginBottom:16 }}>Wavefront-derived sphere under bright (small-pupil) and dim (large-pupil) conditions. The mesopic shift quantifies night myopia. Bright analysis is at {WFR_ANALYSIS_DIA.toFixed(1)} mm; the dim column reflects the dilated 6 mm pupil.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {objSequence.map(e => {
              const base = subjRx[e].sph;
              const dn = WFR_DAYNIGHT[e];
              const rows = [
                ['Photopic (bright)', base + dn.photo4, base + dn.photo6],
                ['Mesopic (dim)', base + dn.meso4, base + dn.meso6],
              ];
              const diff4 = dn.meso4 - dn.photo4;
              const diff6 = dn.meso6 - dn.photo6;
              return (
                <div key={e} style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ background:'#f9fafb', padding:'10px 14px', fontSize:12, fontWeight:700, color:accent, borderBottom:'1px solid #e5e7eb' }}>{WFR_EYE_NAMED[e]}</div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#fff' }}>
                        <th style={{ fontSize:9, fontWeight:700, color:WFR_C.muted, textAlign:'left', padding:'8px 12px', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f3f4f6' }}>Condition</th>
                        <th style={{ fontSize:9, fontWeight:700, color:WFR_C.text2, textAlign:'right', padding:'8px 12px', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f3f4f6' }}>{WFR_ANALYSIS_DIA.toFixed(1)} mm</th>
                        {show6 && <th style={{ fontSize:9, fontWeight:700, color:'#b45309', textAlign:'right', padding:'8px 12px', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f3f4f6', whiteSpace:'nowrap' }}>6 mm</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([lab, v4, v6]) => (
                        <tr key={lab} style={{ borderBottom:'1px solid #f3f4f6' }}>
                          <td style={{ padding:'9px 12px', fontSize:12, fontWeight:600, color:WFR_C.text2 }}>{lab}</td>
                          <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color:WFR_C.navy, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{WFR_fmtSph(v4)} D</td>
                          {show6 && <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color:'#92400e', textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{WFR_fmtSph(v6)} D</td>}
                        </tr>
                      ))}
                      <tr style={{ background: Math.abs(diff4) >= 0.25 ? `${WFR_C.amber}0e` : '#f9fafb' }}>
                        <td style={{ padding:'9px 12px', fontSize:12, fontWeight:700, color:WFR_C.text }}>Night shift (Diff)</td>
                        <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color: Math.abs(diff4) >= 0.25 ? WFR_C.amber : WFR_C.text2, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{WFR_fmtDelta(diff4, 'D')} D</td>
                        {show6 && <td style={{ padding:'9px 12px', fontSize:13, fontWeight:700, color: Math.abs(diff6) >= 0.25 ? WFR_C.amber : WFR_C.text2, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{WFR_fmtDelta(diff6, 'D')} D</td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          {show6 && !WFR_REEHANA_CONFIRMED && (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, padding:'10px 14px', background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:10 }}>
              <WFR_ProvTag/>
              <span style={{ fontSize:11, color:'#92400e', lineHeight:1.45 }}>The 6 mm column depends on confirmation that the headset images a 6 mm pupil (Q3). The headset confirms a {WFR_ANALYSIS_DIA.toFixed(1)} mm aperture and dim/bright detection today; 6 mm is pending Reehana's optical team. If unconfirmed, this column is removed with no other change.</span>
            </div>
          )}
        </div>
      );
    };

    // ════════ #1 PSF + SIMULATED-VA before/after ════════
    const renderSimulation = () => {
      const e = resultEye === 'both' ? 'OD' : resultEye;
      const residual = Math.abs(WFR_SE(habitualRx[e]) - WFR_SE(subjRx[e])); // habitual blur driver
      const beforeBlur = Math.min(2 + residual * 7, 10);
      const afterBlur = 0.6; // residual HOA only
      const psf = (spread, key) => (
        <svg width="150" height="150" viewBox="0 0 150 150" key={key}>
          <defs>
            <radialGradient id={`wfrpsf-${key}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.95"/>
              <stop offset="35%" stopColor={accent} stopOpacity="0.5"/>
              <stop offset="100%" stopColor={accent} stopOpacity="0"/>
            </radialGradient>
            <filter id={`wfrblur-${key}`}><feGaussianBlur stdDeviation={spread}/></filter>
          </defs>
          <rect x="0" y="0" width="150" height="150" fill="#0a0e1a"/>
          <circle cx="75" cy="75" r={10 + spread * 2.2} fill={`url(#wfrpsf-${key})`} filter={`url(#wfrblur-${key})`}/>
        </svg>
      );
      const simLine = (blur, key) => (
        <div key={key} style={{ background:'#fff', borderRadius:8, padding:'14px 10px', display:'flex', gap:10, justifyContent:'center', alignItems:'center', overflow:'hidden' }}>
          {['F','E','L','O','P','Z','D'].map((c,i) => (
            <span key={i} style={{ fontSize:34, fontWeight:700, color:'#111', filter:`blur(${blur}px)`, lineHeight:1 }}>{c}</span>
          ))}
        </div>
      );
      return (
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
            <div style={WFR_REPORT_LABEL}>Point-spread &amp; simulated acuity</div>
            <div style={{ flex:1 }}/>
            <div style={{ display:'flex', background:'#f3f4f6', borderRadius:8, padding:3, gap:2 }}>
              {[['OD','Right'], ['OS','Left']].map(([v,l]) => (
                <button key={v} onClick={() => setResultEye(v)} style={{ padding:'6px 14px', borderRadius:6, border:'none', cursor:'pointer', background: e===v ? '#fff' : 'transparent', color: e===v ? '#111827' : '#6b7280', fontSize:11, fontWeight:700, boxShadow: e===v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', fontFamily:WFR_FONT }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginBottom:16 }}>Retinal point-spread function and a simulated acuity line, reconstructed from the Zernike wavefront. Before = the patient's habitual glasses; after = the new prescription.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            {[['Through habitual glasses', beforeBlur, 'before'], ['Through new prescription', afterBlur, 'after']].map(([title, blur, key]) => (
              <div key={key} style={{ border:`1.5px solid ${key==='after' ? accent+'55' : '#e5e7eb'}`, borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', background: key==='after' ? `${accent}0c` : '#f9fafb', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color: key==='after' ? accent : WFR_C.text2 }}>{title}</span>
                  {key==='after' && <span style={{ fontSize:9, fontWeight:700, color:accent, background:`${accent}18`, padding:'2px 8px', borderRadius:10, textTransform:'uppercase' }}>New</span>}
                </div>
                <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    {psf(blur, key)}
                    <div style={{ fontSize:11, color:WFR_C.muted, lineHeight:1.5, maxWidth:90 }}>{key==='after' ? 'Tight, near-diffraction-limited point' : 'Spread point — blur from uncorrected error'}</div>
                  </div>
                  {simLine(blur, key)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, padding:'10px 14px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10 }}>
            <span style={{ fontSize:11, color:'#6b7280', lineHeight:1.45 }}>Reconstructed from {WFR_ZERNIKE_MODES} Zernike modes (to {WFR_ZERNIKE_MAX_ORDER}th order) at a {WFR_ANALYSIS_DIA.toFixed(1)} mm analysis diameter. Simulation is illustrative; it is not a substitute for the measured acuity.</span>
          </div>
        </div>
      );
    };

    // ════════ #6 REFRACTION-BASED PROGRESSION TRACKER ════════
    const renderProgression = () => {
      const W = 620, H = 220, padL = 44, padR = 16, padT = 18, padB = 34;
      const series = {};
      objSequence.forEach(e => { series[e] = [...WFR_VISITS[e], { y:'2026', se: parseFloat(WFR_SE(subjRx[e]).toFixed(2)) }]; });
      const allSE = objSequence.flatMap(e => series[e].map(p => p.se));
      const minSE = Math.min(...allSE, 0), maxSE = Math.max(...allSE, 0);
      const span = (maxSE - minSE) || 1;
      const years = series.OD.map(p => p.y);
      const xAt = i => padL + (i / (years.length - 1)) * (W - padL - padR);
      const yAt = se => padT + ((maxSE - se) / span) * (H - padT - padB);
      const colorFor = e => e === 'OD' ? accent : WFR_C.navy;
      const rateFor = e => {
        const s = series[e]; const yrs = (parseInt(s[s.length-1].y) - parseInt(s[0].y)) || 1;
        return (s[s.length-1].se - s[0].se) / yrs; // signed D/yr
      };
      const norm = WFR_PROG_NORMS.find(n => n.band === WFR_PATIENT_BAND);
      return (
        <>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
              <div style={WFR_REPORT_LABEL}>Spherical-equivalent progression</div>
              <div style={{ flex:1 }}/>
              <div style={{ display:'flex', gap:14 }}>
                {objSequence.map(e => (<div key={e} style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:3, background:colorFor(e), borderRadius:2 }}/><span style={{ fontSize:11, fontWeight:700, color:colorFor(e) }}>{e}</span></div>))}
              </div>
            </div>
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginBottom:14 }}>Spherical equivalent across visits, from the patient's cloud time-series. The current exam is the rightmost point.</div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
              {[0,0.25,0.5,0.75,1].map(t => { const se = maxSE - t*span; const y = yAt(se); return (
                <g key={t}><line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#f0f1f3" strokeWidth="1"/><text x={padL-8} y={y+3} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="Nunito Sans">{WFR_fmtSE(se)}</text></g>
              ); })}
              {years.map((yr,i) => (<text key={yr} x={xAt(i)} y={H-padB+18} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Nunito Sans">{yr}</text>))}
              {objSequence.map(e => (
                <g key={e}>
                  <polyline fill="none" stroke={colorFor(e)} strokeWidth="2.5" strokeLinejoin="round" points={series[e].map((p,i) => `${xAt(i)},${yAt(p.se)}`).join(' ')}/>
                  {series[e].map((p,i) => (<circle key={i} cx={xAt(i)} cy={yAt(p.se)} r={i===series[e].length-1?5:3.5} fill={i===series[e].length-1?colorFor(e):'#fff'} stroke={colorFor(e)} strokeWidth="2"/>))}
                </g>
              ))}
            </svg>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {objSequence.map(e => {
              const rate = rateFor(e); const mag = Math.abs(rate);
              const inBand = mag >= norm.lo && mag <= norm.hi;
              const aboveBand = mag > norm.hi;
              return (
                <div key={e} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'16px 18px' }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:colorFor(e) }}>{e}</span>
                    <span style={{ fontSize:22, fontWeight:700, color:WFR_C.navy, fontVariantNumeric:'tabular-nums' }}>{rate > 0 ? '+' : ''}{rate.toFixed(2)} D/yr</span>
                  </div>
                  <div style={{ fontSize:11, color:WFR_C.muted, marginBottom:6 }}>Mean rate across {series[e].length} visits</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:9, background:'#f9fafb', border:'1px solid #e5e7eb' }}>
                    <span style={{ fontSize:11, color:'#6b7280' }}>{WFR_PATIENT_BAND} reference</span>
                    <span style={{ fontSize:12, fontWeight:700, color: aboveBand ? WFR_C.amber : '#047857', fontVariantNumeric:'tabular-nums' }}>−{norm.lo.toFixed(2)} to −{norm.hi.toFixed(2)} D/yr</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'16px 20px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:12 }}>Age-banded progression reference</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontVariantNumeric:'tabular-nums' }}>
              <thead><tr style={{ background:WFR_C.navy }}>{['Age band','Mean myopia progression (D/yr)'].map((h,i) => (<th key={h} style={{ fontSize:11, fontWeight:700, color:'#fff', textAlign: i===0?'left':'right', padding:'8px 12px' }}>{h}</th>))}</tr></thead>
              <tbody>
                {WFR_PROG_NORMS.map(n => {
                  const cur = n.band === WFR_PATIENT_BAND;
                  return (<tr key={n.band} style={{ borderBottom:'1px solid #e5e7eb', background: cur ? `${accent}0a` : 'transparent' }}>
                    <td style={{ fontSize:12, fontWeight: cur?700:400, color: cur?accent:WFR_C.text2, padding:'8px 12px' }}>{n.band}{cur ? `  ·  patient (age ${WFR_PATIENT_AGE})` : ''}</td>
                    <td style={{ fontSize:12, color:WFR_C.text2, textAlign:'right', padding:'8px 12px' }}>−{n.lo.toFixed(2)} to −{n.hi.toFixed(2)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
            <div style={{ fontSize:11, color:WFR_C.muted, marginTop:10, fontStyle:'italic' }}>Reference bands are population means. Whether progression is clinically at-risk is the clinician's determination; the device reports the measured rate only.</div>
          </div>
        </>
      );
    };

    return (
      <div style={{ padding:'20px 24px', minHeight:'100%' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Report title */}
          <div style={{ background:WFR_C.navy, borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="none"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>Wavefront Refraction Report</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{ranObjective ? 'Objective + subjective' : 'Subjective only'}</div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:6 }}>
            {reportTabs.map(([id, label]) => {
              const on = activeTab === id;
              const isNew = ['comparison','daynight','simulation','progression'].includes(id);
              return (
                <button key={id} onClick={() => setReportTab(id)} style={{ flex:'1 1 auto', minHeight:42, padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer', background: on ? accent : 'transparent', color: on ? '#fff' : WFR_C.text2, fontSize:12, fontWeight:700, fontFamily:WFR_FONT, display:'flex', alignItems:'center', justifyContent:'center', gap:7, whiteSpace:'nowrap' }}>
                  {label}
                  {isNew && <span style={{ width:6, height:6, borderRadius:'50%', background: on ? '#fff' : accent }}/>}
                </button>
              );
            })}
          </div>

          {activeTab === 'comparison' && renderComparison()}
          {activeTab === 'daynight' && renderDayNight()}
          {activeTab === 'simulation' && renderSimulation()}
          {activeTab === 'progression' && renderProgression()}

          {activeTab === 'summary' && (<>
          {/* Patient information */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Patient Information</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
              {[['Patient name','Marcus Williams'], ['Patient ID','#4821'], ['Birthdate','10/11/1983'], ['Exam date', now.toLocaleDateString('en-US')],
                ['Refraction mode', ranObjective ? 'Objective + subjective' : 'Subjective only'], ['Fog applied', fogAmount > 0 ? `Yes (+${fogAmount.toFixed(2)} D)` : 'No'],
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

          {/* Per-line acuity (subjective chart) + session audit (ported from v3) */}
          <div style={{ display:'grid', gridTemplateColumns: (chartOverrides.length || chartEdits.length) > 0 ? '1fr 300px' : '1fr', gap:14 }}>
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Acuity by line — subjective endpoint</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontVariantNumeric:'tabular-nums' }}>
                <thead><tr style={{ background:WFR_C.navy }}>{['Eye','Line','Acuity','Correct','% correct'].map((h,i) => (<th key={h} style={{ fontSize:11, fontWeight:700, color:'#fff', textAlign: i < 3 ? 'left' : 'right', padding:'8px 12px' }}>{h}</th>))}</tr></thead>
                <tbody>
                  {(() => {
                    const rows = [];
                    objSequence.forEach(eye => {
                      WFR_VA_LINES.forEach(line => {
                        const res = chartResults[chartKey(eye, line.n)] || [];
                        if (!res.some(x => x != null)) return;
                        const correct = res.filter(x => x === 'correct').length;
                        const total = line.letters.length;
                        rows.push(
                          <tr key={eye + line.n} style={{ borderBottom:'1px solid #e5e7eb' }}>
                            <td style={{ fontSize:12, fontWeight:700, color:accent, padding:'8px 12px' }}>{eye}</td>
                            <td style={{ fontSize:12, color:WFR_C.text2, padding:'8px 12px' }}>Line {line.n}</td>
                            <td style={{ fontSize:12, color:WFR_C.text2, padding:'8px 12px' }}>{line.va}</td>
                            <td style={{ fontSize:12, color:WFR_C.text2, textAlign:'right', padding:'8px 12px' }}>{correct}/{total}</td>
                            <td style={{ fontSize:12, fontWeight:700, color:WFR_C.navy, textAlign:'right', padding:'8px 12px' }}>{Math.round(correct / total * 100)}%</td>
                          </tr>
                        );
                      });
                    });
                    return rows.length ? rows : <tr><td colSpan={5} style={{ padding:'14px 12px', fontSize:12, color:WFR_C.muted, textAlign:'center' }}>No chart lines scored.</td></tr>;
                  })()}
                </tbody>
              </table>
              <div style={{ fontSize:11, color:WFR_C.muted, marginTop:10, fontStyle:'italic' }}>Measured letters read per line. The clinician determines the clinical interpretation; the device does not assign a pass/fail verdict.</div>
            </div>
            {(chartOverrides.length || chartEdits.length) > 0 && (
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
                <div style={{ ...WFR_REPORT_LABEL, marginBottom:14 }}>Session audit</div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div><div style={{ fontSize:11, color:WFR_C.muted, marginBottom:3 }}>Ahead-of-progress overrides</div><div style={{ fontSize:22, fontWeight:700, color:WFR_C.navy }}>{chartOverrides.length}</div></div>
                  <div><div style={{ fontSize:11, color:WFR_C.muted, marginBottom:3 }}>Recorded-answer edits</div><div style={{ fontSize:22, fontWeight:700, color:WFR_C.navy }}>{chartEdits.length}</div></div>
                </div>
                <div style={{ fontSize:11, color:WFR_C.muted, marginTop:12, lineHeight:1.5, fontStyle:'italic' }}>Captured for quality assurance and operator training.</div>
              </div>
            )}
          </div>

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
          </>)}

          {/* Wavefront maps (objective only) */}
          {activeTab === 'wavefront' && ranObjective && (
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, flexWrap:'wrap' }}>
                <div style={WFR_REPORT_LABEL}>Wavefront Analysis</div>
                <span style={{ fontSize:11, color:WFR_C.muted }}>{WFR_ANALYSIS_DIA.toFixed(1)} mm analysis · {WFR_ZERNIKE_MODES} Zernike modes</span>
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
