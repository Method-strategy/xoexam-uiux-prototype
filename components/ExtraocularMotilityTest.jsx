
// ExtraocularMotilityTest.jsx — Redesigned by Method Marketing Agency, May 2026
// xoExam clinical tablet UI — 1280×800 base canvas
// Extracted from MotilityAndNeuro.jsx and rebuilt against the v2 clinical spec
// (briefs/ExtraocularMotility_Clinical_Spec_v2.md).
//
// Conforms to the xoExam Component Interface Contract:
//   - props: { onBack, tweaks }
//   - wraps every phase in <ExamShell>
//   - three phases (ready / testing / report) — cancel UX owned by ExamShell
//   - sub-step flow inside testing: versions → pursuit → saccades → [ductions-OD → ductions-OS]
//   - sentence-case labels · no gradients · navy + accent palette only
//   - exports: Object.assign(window, { ExtraocularMotilityTest })


// ════════════════════════════════════════════════════════════════════════
// DATA — clinical positions, grading scale, helpers
// ════════════════════════════════════════════════════════════════════════
// 9 cardinal positions of gaze. Each carries a primary and secondary muscle
// / CN mapping. The secondary mapping is critical for CN IV (trochlear)
// detection — CN IV palsy is classically read at down-and-in gaze, which
// in the v1 prompt's single-muscle-per-position model would have been
// missed.
const EOM_POSITIONS = [
  { id:'primary',    label:'Primary gaze', short:'Center',     dx: 0, dy: 0, primaryMuscle:'All muscles balanced',  primaryCN:'CN III / IV / VI', secondaryMuscle:null,                       secondaryCN:null,         note:'Assess for tropia or phoria — note any manifest deviation' },
  { id:'right',      label:'Right gaze',   short:'Right',      dx: 1, dy: 0, primaryMuscle:'Right lateral rectus',  primaryCN:'CN VI (R)',         secondaryMuscle:'Left medial rectus',       secondaryCN:'CN III (L)', note:null },
  { id:'left',       label:'Left gaze',    short:'Left',       dx:-1, dy: 0, primaryMuscle:'Left lateral rectus',   primaryCN:'CN VI (L)',         secondaryMuscle:'Right medial rectus',      secondaryCN:'CN III (R)', note:null },
  { id:'up',         label:'Up gaze',      short:'Up',         dx: 0, dy:-1, primaryMuscle:'Superior recti',        primaryCN:'CN III',            secondaryMuscle:'Inferior obliques',        secondaryCN:'CN III',     note:null },
  { id:'down',       label:'Down gaze',    short:'Down',       dx: 0, dy: 1, primaryMuscle:'Inferior recti',        primaryCN:'CN III',            secondaryMuscle:'Superior obliques',        secondaryCN:'CN IV',      note:null },
  { id:'up-right',   label:'Up & right',   short:'Up-right',   dx: 1, dy:-1, primaryMuscle:'Right superior rectus', primaryCN:'CN III (R)',        secondaryMuscle:'Left inferior oblique',    secondaryCN:'CN III (L)', note:null },
  { id:'up-left',    label:'Up & left',    short:'Up-left',    dx:-1, dy:-1, primaryMuscle:'Left superior rectus',  primaryCN:'CN III (L)',        secondaryMuscle:'Right inferior oblique',   secondaryCN:'CN III (R)', note:null },
  { id:'down-right', label:'Down & right', short:'Down-right', dx: 1, dy: 1, primaryMuscle:'Right inferior rectus', primaryCN:'CN III (R)',        secondaryMuscle:'Left superior oblique',    secondaryCN:'CN IV (L)',  note:'Classic CN IV (L) palsy detection position' },
  { id:'down-left',  label:'Down & left',  short:'Down-left',  dx:-1, dy: 1, primaryMuscle:'Left inferior rectus',  primaryCN:'CN III (L)',        secondaryMuscle:'Right superior oblique',   secondaryCN:'CN IV (R)',  note:'Classic CN IV (R) palsy detection position' },
];

// International clinical standard EOM grading scale — 0 to ±4.
// 0 = normal (full range of motion). Negative values = underaction. Positive
// values = overaction. This replaces the previous (incorrect) 1–5 scale.
const EOM_GRADE_VALUES = [-4, -3, -2, -1, 0, 1, 2, 3];
const EOM_GRADE_DEFAULT = 0;

function EOM_getGradeInfo(grade) {
  if (grade === 0)  return { label:'Normal',                color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', severity:'normal' };
  if (grade === -1) return { label:'Mild underaction',      color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', severity:'mild' };
  if (grade === -2) return { label:'Moderate underaction',  color:'#d97706', bg:'#fef3c7', border:'#fcd34d', severity:'mild' };
  if (grade === -3) return { label:'Marked underaction',    color:'#ea580c', bg:'#fff7ed', border:'#fed7aa', severity:'significant' };
  if (grade === -4) return { label:'No movement',           color:'#dc2626', bg:'#fef2f2', border:'#fecaca', severity:'significant' };
  if (grade ===  1) return { label:'Mild overaction',       color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe', severity:'mild' };
  if (grade ===  2) return { label:'Moderate overaction',   color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', severity:'mild' };
  if (grade ===  3) return { label:'Marked overaction',     color:'#6d28d9', bg:'#ddd6fe', border:'#a78bfa', severity:'mild' };
  return { label:'Unscored', color:'#9ca3af', bg:'#f9fafb', border:'#e5e7eb', severity:'unscored' };
}

const EOM_PURSUIT_GRADES = [
  { id:'normal',  label:'Normal',           desc:'Smooth, continuous pursuit' },
  { id:'mild',    label:'Mildly reduced',   desc:'Occasional catch-up saccades, generally smooth' },
  { id:'marked',  label:'Markedly reduced', desc:'Frequent catch-up saccades, pursuit interrupted' },
  { id:'absent',  label:'Absent',           desc:'Patient cannot maintain smooth pursuit' },
];

const EOM_SACCADE_GRADES = [
  { id:'normal',      label:'Normal',            desc:'Appropriate latency and accuracy' },
  { id:'prolonged',   label:'Prolonged latency', desc:'Slow to initiate movement' },
  { id:'hypometric',  label:'Hypometric',        desc:'Undershoots the target' },
  { id:'hypermetric', label:'Hypermetric',       desc:'Overshoots the target' },
];

const EOM_REPORT_LABEL = { fontSize:13, fontWeight:700, color:'#111827', textTransform:'none', letterSpacing:0 };

function EOM_findGrade(arr, id) {
  return arr.find(r => r.id === id);
}

// Worst-grade calculator used by the Patient Classification banner.
// Returns the grade with the largest absolute value (most clinically
// significant finding drives the bottom line).
function EOM_worstGrade(results) {
  const completed = results.filter(r => r.completed);
  if (!completed.length) return null;
  return completed.reduce((worst, r) =>
    Math.abs(r.grade) > Math.abs(worst.grade) ? r : worst
  , completed[0]);
}

// Overall clinical interpretation. Severity tiers: normal / mild / significant.
// Single isolated underaction → CN palsy pattern. Multiple underactions →
// possible INO or complex palsy. Overaction only → primary or secondary
// overaction. Versions full but pursuit/saccades abnormal → neuro causes.
function EOM_getInterp(versionResults, pursuitGrade, saccadeGrade, odDuctionResults, osDuctionResults) {
  const abnormalVersions = versionResults.filter(r => r.completed && r.grade !== 0);
  const hasUnderaction = abnormalVersions.some(r => r.grade < 0);
  const hasOveraction  = abnormalVersions.some(r => r.grade > 0);
  const hasMarked      = abnormalVersions.some(r => r.grade <= -3);
  const hasAbnormalPursuit  = pursuitGrade && pursuitGrade !== 'normal';
  const hasAbnormalSaccades = saccadeGrade && saccadeGrade !== 'normal';

  if (abnormalVersions.length === 0 && !hasAbnormalPursuit && !hasAbnormalSaccades) {
    return { severity:'normal', tint:'#10b981', bg:'#f0fdf4', border:'#bbf7d0',
      text:'Full and unrestricted extraocular movements in all nine gaze positions. Normal smooth pursuit and saccades.' };
  }
  if (abnormalVersions.length === 1 && hasUnderaction) {
    const r = abnormalVersions[0];
    const pos = EOM_POSITIONS.find(p => p.id === r.id);
    return { severity:'significant', tint:'#dc2626', bg:'#fef2f2', border:'#fecaca',
      text:`Underaction detected at ${pos.label.toLowerCase()} (${pos.primaryMuscle}, ${pos.primaryCN}). Pattern consistent with isolated muscle underaction or cranial nerve palsy. Neurological correlation recommended if not previously evaluated.` };
  }
  if (abnormalVersions.length > 1 && hasUnderaction) {
    return { severity:'significant', tint:'#dc2626', bg:'#fef2f2', border:'#fecaca',
      text:'Multiple gaze positions show underaction. Pattern requires careful assessment for internuclear ophthalmoplegia, complex cranial nerve palsy, or restrictive strabismus. Neuro-ophthalmic evaluation recommended.' };
  }
  if (hasOveraction && !hasUnderaction) {
    return { severity:'mild', tint:'#d97706', bg:'#fffbeb', border:'#fde68a',
      text:'Overaction noted without corresponding underaction. May represent primary overaction or secondary to contralateral muscle weakness. Clinical correlation recommended.' };
  }
  if (!hasUnderaction && !hasOveraction && (hasAbnormalPursuit || hasAbnormalSaccades)) {
    const fragments = [];
    if (hasAbnormalPursuit)  fragments.push('smooth pursuit reduced');
    if (hasAbnormalSaccades) fragments.push('saccades abnormal');
    return { severity:'mild', tint:'#d97706', bg:'#fffbeb', border:'#fde68a',
      text:`Versions full but ${fragments.join(' and ')}. Consider neurological causes, medication effects, or fatigue. Clinical correlation recommended.` };
  }
  return { severity:'mild', tint:'#d97706', bg:'#fffbeb', border:'#fde68a',
    text:'Mixed findings — see detailed results above. Clinical correlation required.' };
}


// ════════════════════════════════════════════════════════════════════════
// EOM H-PATTERN DIAGRAM
// ════════════════════════════════════════════════════════════════════════
// Standard clinical H-pattern motility diagram. Nine position nodes laid out
// in a 3×3 grid connected by H-shape lines. Each node is rendered with the
// color appropriate to its grade (normal=green, underaction=amber/red,
// overaction=blue-purple), with the grade value displayed inside. The
// active position (during testing) gets an accent ring + accent center dot.
// occludedEye, when set, overlays an eye-patch icon to signal monocular
// (ductions) testing.
function EOM_HPatternDiagram({ results, activePositionId, accent, size, occludedEye, dimUnscored }) {
  const S = size || 200;
  const cx = S / 2, cy = S / 2;
  const spread = S * 0.36; // distance from center to outer ring
  const nodePositions = EOM_POSITIONS.map(p => ({
    ...p,
    x: cx + p.dx * spread,
    y: cy + p.dy * spread,
  }));

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display:'block' }}>
      {/* H-pattern connecting lines */}
      <g stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round">
        {/* Vertical bars of the H (left column, center, right column) */}
        <line x1={cx - spread} y1={cy - spread} x2={cx - spread} y2={cy + spread}/>
        <line x1={cx + spread} y1={cy - spread} x2={cx + spread} y2={cy + spread}/>
        <line x1={cx}          y1={cy - spread} x2={cx}          y2={cy + spread}/>
        {/* Horizontal crossbar of the H */}
        <line x1={cx - spread} y1={cy} x2={cx + spread} y2={cy}/>
      </g>

      {/* Position nodes */}
      {nodePositions.map(node => {
        const result = results && EOM_findGrade(results, node.id);
        const completed = result?.completed;
        const grade = result?.grade ?? null;
        const info = EOM_getGradeInfo(completed ? grade : 'unscored');
        const isActive = activePositionId === node.id;
        const r = isActive ? 16 : 14;
        const fillColor = completed ? info.bg : (dimUnscored ? '#f9fafb' : '#ffffff');
        const strokeColor = isActive ? accent : (completed ? info.color : '#d1d5db');
        const textColor = completed ? info.color : '#9ca3af';

        return (
          <g key={node.id}>
            {/* Optional active highlight ring */}
            {isActive && (
              <circle cx={node.x} cy={node.y} r={r + 4} fill="none" stroke={accent} strokeWidth="1.5" opacity="0.3"/>
            )}
            <circle cx={node.x} cy={node.y} r={r} fill={fillColor} stroke={strokeColor} strokeWidth={isActive ? 2.5 : 1.8}/>
            {completed ? (
              <text x={node.x} y={node.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={textColor} fontFamily="'Nunito Sans', sans-serif">
                {grade > 0 ? `+${grade}` : grade}
              </text>
            ) : (
              isActive && <circle cx={node.x} cy={node.y} r={4} fill={accent}/>
            )}
          </g>
        );
      })}

      {/* Occluded-eye indicator for ductions diagrams */}
      {occludedEye && (
        <g transform={`translate(${S - 38}, 14)`}>
          <rect x={-2} y={-2} width={36} height={20} rx={10} fill="#1f2937"/>
          <text x={16} y={11} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="'Nunito Sans', sans-serif">
            {occludedEye === 'OD' ? 'OS covered' : 'OD covered'}
          </text>
        </g>
      )}
    </svg>
  );
}


// ════════════════════════════════════════════════════════════════════════
// GRADE SELECTOR — row of 8 buttons (-4 through +3)
// ════════════════════════════════════════════════════════════════════════
function EOM_GradeSelector({ value, onChange, accent }) {
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
      {EOM_GRADE_VALUES.map(g => {
        const info = EOM_getGradeInfo(g);
        const selected = value === g;
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            style={{
              flex:'1 1 0', minWidth:62, minHeight:52,
              borderRadius:10,
              border:`2px solid ${selected ? info.color : '#e5e7eb'}`,
              background: selected ? info.bg : '#fff',
              color: selected ? info.color : '#374151',
              fontSize:16, fontWeight:700,
              cursor:'pointer', transition:'all 0.15s',
              fontFamily:"'Nunito Sans', sans-serif",
              fontVariantNumeric:'tabular-nums',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
              padding:'6px 4px',
            }}
          >
            <div style={{ fontSize:18, lineHeight:1 }}>{g > 0 ? `+${g}` : g}</div>
            <div style={{ fontSize:9, fontWeight:600, lineHeight:1.1, color: selected ? info.color : '#9ca3af', textAlign:'center' }}>
              {g === 0 ? 'Normal' : g < 0 ? (g === -4 ? 'No mvmt' : g === -3 ? 'Marked' : g === -2 ? 'Mod' : 'Mild') : (g === 3 ? 'Marked OA' : g === 2 ? 'Mod OA' : 'Mild OA')}
            </div>
          </button>
        );
      })}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// OPTION SELECTOR — 4-option stacked segmented selector (pursuit / saccades)
// ════════════════════════════════════════════════════════════════════════
function EOM_OptionSelector({ value, onChange, options, accent }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(opt => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              width:'100%', minHeight:56,
              padding:'12px 16px',
              borderRadius:10,
              border:`2px solid ${selected ? accent : '#e5e7eb'}`,
              background: selected ? `${accent}10` : '#fff',
              color: selected ? accent : '#374151',
              cursor:'pointer', transition:'all 0.15s',
              fontFamily:"'Nunito Sans', sans-serif",
              display:'flex', alignItems:'center', gap:14, textAlign:'left',
            }}
          >
            <div style={{
              width:22, height:22, borderRadius:'50%',
              border:`2px solid ${selected ? accent : '#d1d5db'}`,
              background: selected ? accent : '#fff',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              {selected && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color: selected ? accent : '#111827', marginBottom:2 }}>{opt.label}</div>
              <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', lineHeight:1.4 }}>{opt.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════

function ExtraocularMotilityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = React.useState('ready');         // ready · testing · report
  const [testStep, setTestStep] = React.useState('versions'); // versions · pursuit · saccades · ductions-OD · ductions-OS
  const [positionIndex, setPositionIndex] = React.useState(0);

  // Sub-test config (set in the ready phase)
  const [includePursuit, setIncludePursuit] = React.useState(true);
  const [includeSaccades, setIncludeSaccades] = React.useState(true);
  const [includeDuctions, setIncludeDuctions] = React.useState(false);

  // Results
  const blankResults = () => EOM_POSITIONS.map(p => ({ id:p.id, grade:0, completed:false }));
  const [versionResults,  setVersionResults]  = React.useState(blankResults);
  const [odDuctionResults, setOdDuctionResults] = React.useState(blankResults);
  const [osDuctionResults, setOsDuctionResults] = React.useState(blankResults);
  const [pursuitGrade, setPursuitGrade] = React.useState('normal');
  const [saccadeGrade, setSaccadeGrade] = React.useState('normal');

  const [notes, setNotes] = React.useState('');
  const [elapsed, setElapsed] = React.useState(0);

  // Re-entrancy guard for rapid "Next position" taps. On a tablet, doctors
  // double-tap or rapid-tap the advance button as they get into a rhythm;
  // without a lock, the closure-stale `positionIndex` in the guard inside
  // advanceFromPositional lets multiple setPositionIndex(i=>i+1) calls fire
  // before React re-renders, pushing positionIndex past EOM_POSITIONS.length
  // and crashing the render. The lock holds for ~120ms (below the typical
  // double-tap window) so one tap = one advance.
  const advanceLockRef = React.useRef(false);

  // Ductions auto-enable when any version grade is non-zero. The doctor
  // can also turn it on manually in the setup config.
  const versionsHaveAbnormal = versionResults.some(r => r.completed && r.grade !== 0);
  const willRunDuctions = includeDuctions || versionsHaveAbnormal;

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
    setTestStep('versions');
    setPositionIndex(0);
    setElapsed(0);
  };

  const setGradeFor = (which, grade) => {
    const updater = which === 'versions' ? setVersionResults
                   : which === 'ductions-OD' ? setOdDuctionResults
                   : setOsDuctionResults;
    updater(prev => prev.map((r, i) => i === positionIndex ? { ...r, grade, completed:true } : r));
  };

  const advanceFromPositional = (currentStep) => {
    if (advanceLockRef.current) return;
    advanceLockRef.current = true;
    setTimeout(() => { advanceLockRef.current = false; }, 120);

    if (positionIndex < EOM_POSITIONS.length - 1) {
      setPositionIndex(i => i + 1);
      return;
    }
    // End of this positional sub-step — figure out what's next.
    const nextStep = computeNextStep(currentStep);
    if (nextStep === 'report') {
      setPhase('report');
    } else {
      setTestStep(nextStep);
      setPositionIndex(0);
    }
  };

  const advanceFromOptional = (currentStep) => {
    if (advanceLockRef.current) return;
    advanceLockRef.current = true;
    setTimeout(() => { advanceLockRef.current = false; }, 120);

    const nextStep = computeNextStep(currentStep);
    if (nextStep === 'report') {
      setPhase('report');
    } else {
      setTestStep(nextStep);
      if (nextStep.startsWith('ductions-')) setPositionIndex(0);
    }
  };

  function computeNextStep(from) {
    if (from === 'versions') {
      if (includePursuit)  return 'pursuit';
      if (includeSaccades) return 'saccades';
      if (willRunDuctions) return 'ductions-OD';
      return 'report';
    }
    if (from === 'pursuit') {
      if (includeSaccades) return 'saccades';
      if (willRunDuctions) return 'ductions-OD';
      return 'report';
    }
    if (from === 'saccades') {
      if (willRunDuctions) return 'ductions-OD';
      return 'report';
    }
    if (from === 'ductions-OD') return 'ductions-OS';
    if (from === 'ductions-OS') return 'report';
    return 'report';
  }

  // Finish & Report button (ExamShell green button) enabled when:
  //   - testStep is the final enabled sub-step
  //   - and that sub-step has reached its completion state
  function finishAvailable() {
    if (phase !== 'testing') return false;
    const next = computeNextStep(testStep);
    if (next !== 'report') return false;
    if (testStep === 'versions') return versionResults.every(r => r.completed);
    if (testStep === 'ductions-OS') return osDuctionResults.every(r => r.completed);
    // pursuit + saccades default-select 'normal', so they're always "complete"
    return true;
  }

  const resetForNewTest = () => {
    setPhase('ready');
    setTestStep('versions');
    setPositionIndex(0);
    setVersionResults(blankResults());
    setOdDuctionResults(blankResults());
    setOsDuctionResults(blankResults());
    setPursuitGrade('normal');
    setSaccadeGrade('normal');
    setNotes('');
    setElapsed(0);
    setIncludeDuctions(false);
  };


  // ════════════════════════════════════════════════════════════════════
  // RENDER: READY
  // ════════════════════════════════════════════════════════════════════
  const renderReady = () => (
    <div style={{ padding:'40px 24px', display:'flex', justifyContent:'center', minHeight:'100%' }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:48, maxWidth:760, width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
          <div style={{ width:40, height:40, borderRadius:9, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" fill={accent}/>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Extraocular Motility</h2>
            <p style={{ fontSize:12, fontWeight:400, color:'#6b7280', margin:'2px 0 0' }}>Assess eye movement through the nine cardinal positions of gaze. Tests the function of the six extraocular muscles and their cranial nerve innervation.</p>
          </div>
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'24px 0 22px' }}/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:32, alignItems:'flex-start' }}>
          {/* Configuration */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', letterSpacing:'0.04em', marginBottom:10 }}>Test configuration</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { id:'versions',  label:'Versions (binocular)',   desc:'Tests conjugate gaze across nine positions with both eyes open. Required for all EOM exams.', checked:true,             onChange:null,                     disabled:true },
                { id:'pursuit',   label:'Smooth pursuit',          desc:'Qualitative assessment of patient following a smoothly moving target.',                       checked:includePursuit,   onChange:setIncludePursuit,        disabled:false },
                { id:'saccades',  label:'Saccadic assessment',     desc:'Rapid eye movements to targets at various eccentricities.',                                    checked:includeSaccades,  onChange:setIncludeSaccades,       disabled:false },
                { id:'ductions',  label:'Ductions (monocular)',    desc:'Per-eye range with the fellow eye occluded. Auto-enables if any version grade is abnormal.',  checked:includeDuctions,  onChange:setIncludeDuctions,       disabled:false },
              ].map(row => {
                const cardEnabled = !row.disabled;
                return (
                  <label key={row.id} style={{
                    display:'flex', gap:12, alignItems:'flex-start',
                    padding:'12px 14px',
                    borderRadius:10,
                    border:`1.5px solid ${row.checked ? `${accent}50` : '#e5e7eb'}`,
                    background: row.checked ? `${accent}08` : '#fff',
                    cursor: cardEnabled ? 'pointer' : 'default',
                    opacity: row.disabled ? 0.9 : 1,
                  }}>
                    <input type="checkbox"
                      checked={row.checked}
                      disabled={row.disabled}
                      onChange={cardEnabled && row.onChange ? (e => row.onChange(e.target.checked)) : undefined}
                      style={{ marginTop:3, width:18, height:18, accentColor:accent, cursor: cardEnabled ? 'pointer' : 'default' }}
                    />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:2 }}>
                        {row.label}
                        {row.disabled && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, color:'#9ca3af' }}>Required</span>}
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
                Grading uses the international 0 to ±4 scale. 0 = full range of motion (normal). Negative values = underaction. Positive values = overaction.
              </div>
            </div>
          </div>

          {/* H-pattern preview */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', letterSpacing:'0.04em', marginBottom:10 }}>Cardinal positions</div>
            <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:14, padding:18, display:'flex', justifyContent:'center' }}>
              <EOM_HPatternDiagram results={null} activePositionId={null} accent={accent} size={220} dimUnscored={true}/>
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', textAlign:'center', marginTop:8, letterSpacing:'0.04em' }}>
              9 POSITIONS · 1 PRIMARY + 8 CARDINAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // ════════════════════════════════════════════════════════════════════
  // RENDER: TESTING
  // ════════════════════════════════════════════════════════════════════
  const renderTesting = () => {
    if (testStep === 'versions')     return renderPositional('versions',     versionResults,   null);
    if (testStep === 'ductions-OD')  return renderPositional('ductions-OD',  odDuctionResults, 'OS');
    if (testStep === 'ductions-OS')  return renderPositional('ductions-OS',  osDuctionResults, 'OD');
    if (testStep === 'pursuit')      return renderOptionScreen('pursuit');
    if (testStep === 'saccades')     return renderOptionScreen('saccades');
    return null;
  };

  // Versions / Ductions share a layout: H-pattern on left, grade selector on right.
  // step ∈ 'versions' | 'ductions-OD' | 'ductions-OS'
  // occludedEye is set during ductions (the patched eye)
  const renderPositional = (step, results, occludedEye) => {
    // Defensive clamp: belt-and-suspenders alongside advanceLockRef. Even if
    // a rapid-tap somehow slips through, the render never reads past the end
    // of the positions array, so the worst case is a single repeat render
    // of the last position rather than a whitescreen crash.
    const safeIndex = Math.min(positionIndex, EOM_POSITIONS.length - 1);
    const position = EOM_POSITIONS[safeIndex];
    const current = EOM_findGrade(results, position.id);
    const currentGrade = current?.completed ? current.grade : EOM_GRADE_DEFAULT;
    const stepLabel =
      step === 'versions' ? 'Versions' :
      step === 'ductions-OD' ? 'Ductions · Right eye (OD)' :
      'Ductions · Left eye (OS)';
    const occludedCopy =
      step === 'ductions-OD' ? "Occlude the patient's left eye. Test right eye range of motion." :
      step === 'ductions-OS' ? "Occlude the patient's right eye. Test left eye range of motion." :
      'Both eyes open. Ask the patient to follow the target through the position.';
    const isLastInStep = safeIndex === EOM_POSITIONS.length - 1;
    const nextLabel = isLastInStep ? (() => {
      const next = computeNextStep(step);
      if (next === 'report')        return 'Finish & report →';
      if (next === 'pursuit')       return 'Next: Smooth pursuit →';
      if (next === 'saccades')      return 'Next: Saccades →';
      if (next === 'ductions-OD')   return 'Next: Ductions (OD) →';
      if (next === 'ductions-OS')   return 'Next: Ductions (OS) →';
      return 'Next →';
    })() : 'Next position →';

    return (
      <div style={{ padding:24, minHeight:'100%' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Sub-bar: step name + position progress */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 0 4px ${accent}25` }}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{stepLabel}</span>
              <span style={{ fontSize:11, fontWeight:400, color:'#9ca3af' }}>·</span>
              <span style={{ fontSize:11, fontWeight:600, color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>
                Position {positionIndex + 1} of {EOM_POSITIONS.length}
              </span>
            </div>
            <div style={{ flex:1, display:'flex', justifyContent:'flex-end', gap:6 }}>
              {EOM_POSITIONS.map((p, i) => {
                const r = EOM_findGrade(results, p.id);
                const done = r?.completed;
                const isCurrent = i === safeIndex;
                return (
                  <div key={p.id} style={{
                    width:isCurrent ? 18 : 10, height:10, borderRadius:5,
                    background: done ? '#10b981' : isCurrent ? accent : '#e5e7eb',
                    transition:'all 0.15s',
                  }}/>
                );
              })}
            </div>
          </div>

          {/* Main card — two columns */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'24px 28px', display:'grid', gridTemplateColumns:'minmax(0, 280px) minmax(0, 1fr)', gap:32, alignItems:'flex-start' }}>

            {/* Left: H-pattern + position labels */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <EOM_HPatternDiagram
                results={results}
                activePositionId={position.id}
                accent={accent}
                size={240}
                occludedEye={occludedEye}
              />
              <div style={{ textAlign:'center', width:'100%' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:6 }}>{position.label}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6b7280', lineHeight:1.5 }}>{position.primaryMuscle}</div>
                <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.04em', marginTop:2 }}>{position.primaryCN}</div>
                {position.secondaryMuscle && (
                  <>
                    <div style={{ width:24, height:1, background:'#e5e7eb', margin:'8px auto' }}/>
                    <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Also</div>
                    <div style={{ fontSize:11, fontWeight:500, color:'#6b7280', lineHeight:1.4 }}>{position.secondaryMuscle}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.04em', marginTop:1 }}>{position.secondaryCN}</div>
                  </>
                )}
              </div>
            </div>

            {/* Right: instruction + grade selector */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>
                Clinical instruction
              </div>
              <p style={{ fontSize:13, fontWeight:400, color:'#374151', lineHeight:1.55, margin:'0 0 6px' }}>{occludedCopy}</p>
              {position.note && (
                <p style={{ fontSize:12, fontWeight:600, color:accent, margin:'0 0 6px', lineHeight:1.5 }}>{position.note}</p>
              )}

              <div style={{ height:1, background:'#e5e7eb', margin:'16px 0 14px' }}/>

              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:10 }}>
                Grade
              </div>
              <EOM_GradeSelector value={currentGrade} onChange={(g) => setGradeFor(step, g)} accent={accent}/>

              <div style={{ marginTop:14, padding:'10px 12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, fontSize:11, fontWeight:400, color:'#6b7280', lineHeight:1.6 }}>
                <strong style={{ color:'#374151', fontWeight:700 }}>0</strong> = Full normal range &nbsp;·&nbsp;
                <strong style={{ color:'#374151', fontWeight:700 }}>−1</strong> ≈ 25% limitation &nbsp;·&nbsp;
                <strong style={{ color:'#374151', fontWeight:700 }}>−2</strong> ≈ 50% &nbsp;·&nbsp;
                <strong style={{ color:'#374151', fontWeight:700 }}>−3</strong> ≈ 75%, cannot pass midline &nbsp;·&nbsp;
                <strong style={{ color:'#374151', fontWeight:700 }}>−4</strong> = no movement
                <br/>
                <strong style={{ color:'#374151', fontWeight:700 }}>+1 / +2 / +3</strong> = overaction (mild / moderate / marked)
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
                <button
                  onClick={() => {
                    // Ensure the current position is marked complete with the
                    // currently-displayed grade (0 by default) before advancing.
                    if (!current?.completed) setGradeFor(step, currentGrade);
                    advanceFromPositional(step);
                  }}
                  style={{
                    minHeight:48, padding:'12px 24px', borderRadius:10,
                    border:'none', background:accent, color:'#fff',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                    fontFamily:"'Nunito Sans', sans-serif",
                    boxShadow:`0 3px 12px ${accent}40`,
                  }}>
                  {nextLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptionScreen = (step) => {
    const options = step === 'pursuit' ? EOM_PURSUIT_GRADES : EOM_SACCADE_GRADES;
    const value   = step === 'pursuit' ? pursuitGrade : saccadeGrade;
    const setter  = step === 'pursuit' ? setPursuitGrade : setSaccadeGrade;
    const title   = step === 'pursuit' ? 'Smooth pursuit assessment' : 'Saccadic assessment';
    const instr   = step === 'pursuit'
      ? 'Present a smoothly moving target and observe the patient\'s pursuit quality. Watch for catch-up saccades and smoothness of tracking.'
      : 'Present targets at various eccentric positions. Observe the speed, accuracy, and latency of the patient\'s eye movements to each target.';
    const next = computeNextStep(step);
    const nextLabel =
      next === 'report'        ? 'Finish & report →' :
      next === 'saccades'      ? 'Next: Saccades →' :
      next === 'ductions-OD'   ? 'Next: Ductions (OD) →' :
      'Next →';

    return (
      <div style={{ padding:24, minHeight:'100%' }}>
        <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'12px 18px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 0 4px ${accent}25` }}/>
            <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{title}</span>
          </div>

          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'28px 28px 24px' }}>
            <p style={{ fontSize:13, fontWeight:400, color:'#374151', lineHeight:1.6, margin:'0 0 22px' }}>{instr}</p>

            <EOM_OptionSelector value={value} onChange={setter} options={options} accent={accent}/>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24 }}>
              <button
                onClick={() => advanceFromOptional(step)}
                style={{
                  minHeight:48, padding:'12px 24px', borderRadius:10,
                  border:'none', background:accent, color:'#fff',
                  fontSize:13, fontWeight:700, cursor:'pointer',
                  fontFamily:"'Nunito Sans', sans-serif",
                  boxShadow:`0 3px 12px ${accent}40`,
                }}>
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightSidebar = () => {
    const completedVersions = versionResults.filter(r => r.completed).length;
    return (
      <div style={{ padding:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Progress</div>

        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#374151' }}>Versions</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#374151', fontVariantNumeric:'tabular-nums' }}>{completedVersions}/{EOM_POSITIONS.length}</span>
          </div>
          <div style={{ height:4, background:'#f3f4f6', borderRadius:2 }}>
            <div style={{ width:`${(completedVersions/EOM_POSITIONS.length)*100}%`, height:'100%', background:accent, borderRadius:2, transition:'width 0.2s' }}/>
          </div>
        </div>

        <div style={{ marginBottom:14, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            ['Smooth pursuit',     includePursuit,  testStep === 'pursuit'],
            ['Saccades',           includeSaccades, testStep === 'saccades'],
            ['Ductions (OD)',      willRunDuctions, testStep === 'ductions-OD'],
            ['Ductions (OS)',      willRunDuctions, testStep === 'ductions-OS'],
          ].map(([label, enabled, active]) => enabled ? (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, color: active ? accent : '#6b7280' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background: active ? accent : '#d1d5db' }}/>
              {label}
            </div>
          ) : null)}
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'14px 0' }}/>

        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Versions diagram</div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
          <EOM_HPatternDiagram
            results={versionResults}
            activePositionId={testStep === 'versions' ? EOM_POSITIONS[Math.min(positionIndex, EOM_POSITIONS.length - 1)].id : null}
            accent={accent}
            size={160}
            dimUnscored={true}
          />
        </div>

        <div style={{ height:1, background:'#e5e7eb', margin:'14px 0' }}/>

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


  // ════════════════════════════════════════════════════════════════════
  // RENDER: REPORT
  // ════════════════════════════════════════════════════════════════════
  const renderReport = () => {
    const now = new Date();
    const interp = EOM_getInterp(versionResults, pursuitGrade, saccadeGrade, odDuctionResults, osDuctionResults);
    const worstVersion = EOM_worstGrade(versionResults);
    const worstVersionInfo = worstVersion ? EOM_getGradeInfo(worstVersion.grade) : null;
    const pursuitOpt = EOM_PURSUIT_GRADES.find(o => o.id === pursuitGrade);
    const saccadeOpt = EOM_SACCADE_GRADES.find(o => o.id === saccadeGrade);
    const ranDuctions = odDuctionResults.some(r => r.completed) || osDuctionResults.some(r => r.completed);

    // CN-palsy flag — any single position grade -3 or -4
    const cnFlagPosition = versionResults
      .filter(r => r.completed && r.grade <= -3)
      .map(r => ({ result:r, position: EOM_POSITIONS.find(p => p.id === r.id) }))[0];

    return (
      <div style={{ padding:'20px 24px', minHeight:'100%' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Patient Classification banner */}
          <div style={{ background:interp.bg, border:`1.5px solid ${interp.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:'#fff', border:`2px solid ${interp.tint}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={interp.tint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {interp.severity === 'normal' ? <path d="M20 6L9 17l-5-5"/> : <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
              </svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:interp.tint, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Clinical interpretation</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.4 }}>{interp.text}</div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              {worstVersionInfo && (
                <div style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${worstVersionInfo.color}40`, fontSize:11, fontWeight:700, color:worstVersionInfo.color, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>Versions</div>
                  <div>{worstVersion.grade > 0 ? '+' : ''}{worstVersion.grade}</div>
                </div>
              )}
              <div style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${pursuitGrade === 'normal' ? '#10b98140' : '#d9770640'}`, fontSize:11, fontWeight:700, color:pursuitGrade === 'normal' ? '#10b981' : '#d97706', textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>Pursuit</div>
                <div>{pursuitOpt?.label.split(' ')[0]}</div>
              </div>
              <div style={{ padding:'6px 12px', borderRadius:8, background:'#fff', border:`1.5px solid ${saccadeGrade === 'normal' ? '#10b98140' : '#d9770640'}`, fontSize:11, fontWeight:700, color:saccadeGrade === 'normal' ? '#10b981' : '#d97706', textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#6b7280' }}>Saccades</div>
                <div>{saccadeOpt?.label.split(' ')[0]}</div>
              </div>
            </div>
          </div>

          {/* CN palsy flag (conditional) */}
          {cnFlagPosition && (
            <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#7f1d1d', marginBottom:2 }}>Significant restriction detected</div>
                <div style={{ fontSize:12, fontWeight:500, color:'#991b1b', lineHeight:1.5 }}>
                  {cnFlagPosition.position.label} ({cnFlagPosition.result.grade}) — {cnFlagPosition.position.primaryMuscle}, {cnFlagPosition.position.primaryCN}. Consider cranial nerve palsy. Neurological referral may be indicated if not previously evaluated.
                </div>
              </div>
            </div>
          )}

          {/* Patient information */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...EOM_REPORT_LABEL, marginBottom:14 }}>Patient information</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
              {[
                ['Patient name',     'Marcus Williams'],
                ['Birthdate',        '10/11/1983'],
                ['Patient ID',       'azx7895'],
                ['Test duration',    fmtTime(elapsed)],
                ['Exam type',        'Extraocular Motility'],
                ['Exam date',        now.toLocaleDateString('en-US')],
                ['Start time',       now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })],
                ['Tests performed', [
                    'Versions',
                    includePursuit ? 'Pursuit' : null,
                    includeSaccades ? 'Saccades' : null,
                    ranDuctions ? 'Ductions' : null,
                  ].filter(Boolean).join(' · ')],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#6b7280', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* H-pattern diagram(s) */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...EOM_REPORT_LABEL, marginBottom:14 }}>Motility diagram</div>
            <div style={{ display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.04em' }}>Versions (binocular)</div>
                <EOM_HPatternDiagram results={versionResults} activePositionId={null} accent={accent} size={260}/>
              </div>
              {ranDuctions && (
                <>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.04em' }}>Ductions · Right eye (OD)</div>
                    <EOM_HPatternDiagram results={odDuctionResults} activePositionId={null} accent={accent} size={220} occludedEye="OS"/>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.04em' }}>Ductions · Left eye (OS)</div>
                    <EOM_HPatternDiagram results={osDuctionResults} activePositionId={null} accent={accent} size={220} occludedEye="OD"/>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Versions Results table */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...EOM_REPORT_LABEL, marginBottom:14 }}>Versions results</div>
            <div style={{ border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>
                    {['Position', 'Primary muscle', 'Primary CN', 'Secondary muscle', 'Secondary CN', 'Grade', 'Interpretation'].map(h => (
                      <th key={h} style={{ background:'#0e2f5e', color:'#fff', padding:'10px 12px', textAlign:'left', fontWeight:700, fontSize:11, letterSpacing:'0.02em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EOM_POSITIONS.map((p, i) => {
                    const r = EOM_findGrade(versionResults, p.id);
                    const info = EOM_getGradeInfo(r?.completed ? r.grade : 'unscored');
                    return (
                      <tr key={p.id} style={{ borderTop:'1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ padding:'10px 12px', fontWeight:600, color:'#374151' }}>{p.label}</td>
                        <td style={{ padding:'10px 12px', color:'#111827' }}>{p.primaryMuscle}</td>
                        <td style={{ padding:'10px 12px', color:'#111827', fontVariantNumeric:'tabular-nums' }}>{p.primaryCN}</td>
                        <td style={{ padding:'10px 12px', color:'#6b7280' }}>{p.secondaryMuscle || '—'}</td>
                        <td style={{ padding:'10px 12px', color:'#6b7280', fontVariantNumeric:'tabular-nums' }}>{p.secondaryCN || '—'}</td>
                        <td style={{ padding:'10px 12px', textAlign:'center' }}>
                          <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:6, background:info.bg, border:`1.5px solid ${info.border}`, color:info.color, fontWeight:700, fontVariantNumeric:'tabular-nums', minWidth:28 }}>
                            {r?.completed ? (r.grade > 0 ? `+${r.grade}` : r.grade) : '—'}
                          </span>
                        </td>
                        <td style={{ padding:'10px 12px', color:info.color, fontWeight:600 }}>{info.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pursuit + Saccades summary */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              ['Smooth pursuit', pursuitOpt],
              ['Saccades',       saccadeOpt],
            ].map(([title, opt]) => {
              const normal = opt?.id === 'normal';
              return (
                <div key={title} style={{
                  background: normal ? '#f0fdf4' : '#fffbeb',
                  border: `1.5px solid ${normal ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius:14, padding:'14px 18px',
                }}>
                  <div style={{ fontSize:11, fontWeight:700, color: normal ? '#047857' : '#92400e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:3 }}>{opt?.label}</div>
                  <div style={{ fontSize:11, fontWeight:400, color:'#6b7280', lineHeight:1.5 }}>{opt?.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Session notes */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'18px 20px' }}>
            <div style={{ ...EOM_REPORT_LABEL, marginBottom:10 }}>Session notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Patient noted mild diplopia in right gaze; head tilt observed during ductions."
              style={{ width:'100%', minHeight:90, padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:13, fontWeight:400, color:'#374151', fontFamily:"'Nunito Sans', sans-serif", resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {/* Actions row */}
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


  // ════════════════════════════════════════════════════════════════════
  // EXAM SHELL
  // ════════════════════════════════════════════════════════════════════
  return (
    <ExamShell
      title="Extraocular Motility"
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


Object.assign(window, { ExtraocularMotilityTest });
