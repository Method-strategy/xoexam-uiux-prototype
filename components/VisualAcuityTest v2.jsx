// VisualAcuityTest v2.jsx — Redesigned by Method Marketing Agency, June 2026
// xoExam clinical tablet UI — 1280×800 base canvas
//
// v2 LAYOUT EXPLORATION (split-column testing phase):
//   LEFT  — "Patient view": an honest emulation of what the patient sees through
//           the headset. Snellen shows ONE LINE at a time; Tumbling E / Landolt C
//           show ONE optotype at a time — each step reducing in size as the
//           patient advances. Neutral (no scoring colors); the patient never sees
//           right/wrong. For E/C, a 4-way clicker map shows the expected response
//           direction (the orientation the patient presses on the response clicker).
//   RIGHT — "Doctor control": the full chart, persistent, with a subtle outline
//           indicator surrounding the line / optotype the patient is currently on.
//           The indicator advances as the patient proceeds. The doctor taps any
//           optotype to mark it correct (green) or incorrect (red) — or watches it
//           flip as the patient's clicker input lands.
//
// Doctor-led (per CLAUDE.md rule 15): the report shows MEASURED data + a doctor
// impression/sign-off affordance. No device-authored verdict banner.
//
// All top-level identifiers are VA2_ prefixed so this file can load alongside the
// original VisualAcuityTest.jsx in the shell without collisions.

// Snellen ladder. fs = on-screen reference size at the chart's design scale.
const VA2_LINES = [
  { n:1,  va:'20/200', letters:['E'],                              fs:200 },
  { n:2,  va:'20/100', letters:['F','P'],                          fs:140 },
  { n:3,  va:'20/70',  letters:['T','O','Z'],                      fs:100 },
  { n:4,  va:'20/50',  letters:['L','P','E','D'],                  fs:80  },
  { n:5,  va:'20/40',  letters:['P','E','C','F','D'],              fs:64  },
  { n:6,  va:'20/30',  letters:['E','D','F','C','Z','P'],          fs:52  },
  { n:7,  va:'20/25',  letters:['F','E','L','O','P','Z','D'],      fs:44  },
  { n:8,  va:'20/20',  letters:['D','E','F','P','O','T','E','C'],  fs:36  },
  { n:9,  va:'20/15',  letters:['L','E','F','O','D','P','C','T'],  fs:28  },
  { n:10, va:'20/10',  letters:['F','D','P','L','T','C','E','O'],  fs:22  },
];

const VA2_LETTER_POOL = ['C','D','H','K','N','O','R','S','V','Z']; // Sloan 10
const VA2_NUMBER_POOL = ['1','2','3','4','5','6','7','8','9'];
const VA2_ROT = [0, 90, 180, 270]; // clockwise from "pointing right"

const VA2_C = {
  navy:    '#0e2f5e',
  text:    '#111827',
  text2:   '#374151',
  muted:   '#9ca3af',
  surface: '#f9fafb',
  card:    '#ffffff',
  border:  '#e5e7eb',
  success: '#10b981',
  error:   '#ef4444',
};
const VA2_FONT = "'Nunito Sans', sans-serif";

const VA2_violator = {
  fontSize: 11, fontWeight: 700, color: VA2_C.muted,
  letterSpacing: '0.08em', textTransform: 'uppercase',
};

const VA2_randLetters = (n) => [...VA2_LETTER_POOL].sort(() => Math.random() - 0.5).slice(0, n);
const VA2_randNumbers = (n) => Array.from({ length: n }, () => VA2_NUMBER_POOL[Math.floor(Math.random() * VA2_NUMBER_POOL.length)]);
const VA2_lineIsPassed = (correct, total) => total > 0 && correct > total / 2;

// Optotype renderer — 'E' Snellen tumbling E (3 bars + spine), 'C' Landolt C
// (ring with gap). Rotation 0 = legs / gap point right; +90 increments clockwise.
function VA2_Optotype({ kind, size, rotation = 0, color }) {
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

// Compact 4-way + center clicker glyph — the patient response device. Shown
// next to the response note so the doctor sees how the patient is answering.
function VA2_ClickerGlyph({ accent }) {
  const k = (gx, gy, fill) => (
    <div style={{ gridColumn: gx, gridRow: gy, width: 13, height: 13, borderRadius: 4, background: fill, border: `1px solid ${accent}` }}/>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 13px)', gridTemplateRows: 'repeat(3, 13px)', gap: 3 }}>
      {k(2, 1, '#fff')}
      {k(1, 2, '#fff')}
      {k(2, 2, accent)}
      {k(3, 2, '#fff')}
      {k(2, 3, '#fff')}
    </div>
  );
}

// Rotation (deg clockwise from "right") → direction key for the clicker map.
const VA2_rotToDir = (rot) => ({ 0:'right', 90:'down', 180:'left', 270:'up' }[((rot % 360) + 360) % 360] || 'right');

function VisualAcuityTestV2({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  const [phase, setPhase] = React.useState('ready');
  const [eyeMode, setEyeMode] = React.useState('right');
  const [chartType, setChartType] = React.useState('tumblingE'); // snellen | numbers | tumblingE | tumblingC
  const [startLine, setStartLine] = React.useState(3);

  const [chartLines, setChartLines] = React.useState(VA2_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  const [rotations, setRotations] = React.useState({}); // `${lineN}_${idx}` → deg
  const [results, setResults] = React.useState({});      // `${eye}_${lineN}` → [null|'correct'|'incorrect']
  const [pos, setPos] = React.useState(3);               // current line the patient is on
  const [eyeIdx, setEyeIdx] = React.useState(0);         // index into eyesToTest (OD→OS)
  const [resetArmed, setResetArmed] = React.useState(false); // two-tap confirm for in-exam Reset
  const [notes, setNotes] = React.useState('');
  const [impression, setImpression] = React.useState('');

  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);
  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const isOpto = chartType === 'tumblingE' || chartType === 'tumblingC'; // draw optotypes vs text
  const optoKind = chartType === 'tumblingC' ? 'C' : 'E';
  const chartLabel = chartType === 'tumblingE' ? 'Tumbling E' : chartType === 'tumblingC' ? 'Landolt C' : chartType === 'numbers' ? 'Numbers' : 'Snellen';
  const eyeNameFull = { OD: 'right eye', OS: 'left eye' };

  // Eyes to test, clinical OD-first order. Bilateral runs OD then OS.
  const eyesToTest = eyeMode === 'both' ? ['OD', 'OS'] : eyeMode === 'right' ? ['OD'] : ['OS'];
  const currentEye = eyesToTest[Math.min(eyeIdx, eyesToTest.length - 1)];

  // every chart type now renders a full row of optotypes (matches a real chart)
  const lineCount = (line) => line.letters.length;
  const key = (lineN, eye = currentEye) => `${eye}_${lineN}`;
  const getMarks = (lineN, eye = currentEye) => {
    const line = chartLines.find(l => l.n === lineN);
    return results[key(lineN, eye)] || Array(lineCount(line)).fill(null);
  };
  const getScore = (lineN, eye = currentEye) => {
    const line = chartLines.find(l => l.n === lineN);
    const res = results[key(lineN, eye)] || [];
    const correct = res.filter(r => r === 'correct').length;
    const total = lineCount(line);
    return { correct, total, pct: total > 0 ? Math.round(correct / total * 100) : 0 };
  };
  const getBestVA = (eye = currentEye) => {
    for (let i = chartLines.length; i >= 1; i--) {
      const s = getScore(i, eye);
      if (s.correct > 0 && VA2_lineIsPassed(s.correct, s.total)) return chartLines[i - 1].va;
    }
    return '—';
  };

  const genRotations = () => {
    const r = {};
    VA2_LINES.forEach(line => {
      const cnt = line.letters.length;
      for (let i = 0; i < cnt; i++) r[`${line.n}_${i}`] = VA2_ROT[Math.floor(Math.random() * 4)];
    });
    return r;
  };

  // advance the patient to the next line when the current one is fully marked & passed
  const maybeAdvance = (lineN, marks) => {
    const allMarked = marks.every(m => m !== null);
    const correct = marks.filter(m => m === 'correct').length;
    if (allMarked && VA2_lineIsPassed(correct, marks.length) && lineN < 10) {
      setTimeout(() => setPos(lineN + 1), 350);
    }
  };

  const toggleMark = (lineN, idx) => {
    if (!charUnlocked(lineN, idx)) return; // can't score a locked (ahead) optotype
    const prev = getMarks(lineN);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    setResults(r => ({ ...r, [key(lineN)]: next }));
    // When the CURRENT line becomes fully scored AND passed, auto-advance one line
    // smaller. On a fail it stays put — the doctor descends manually (the next row
    // is now unlocked). Identical for Snellen and E/C.
    if (lineN === pos && next.every(m => m !== null)) {
      const correct = next.filter(m => m === 'correct').length;
      if (VA2_lineIsPassed(correct, next.length) && lineN < 10) {
        setTimeout(() => setPos(lineN + 1), 320);
      }
    }
  };
  const markAll = (lineN, val) => {
    const line = chartLines.find(l => l.n === lineN);
    const next = Array(lineCount(line)).fill(val);
    setResults(r => ({ ...r, [key(lineN)]: next }));
    if (val === 'correct') maybeAdvance(lineN, next);
  };

  const regenerate = () => {
    setChartLines(prev => prev.map(l => {
      const letters = chartType === 'numbers' ? VA2_randNumbers(l.letters.length) : VA2_randLetters(l.letters.length);
      return { ...l, letters };
    }));
    setRotations(genRotations());
    setResults({});
  };

  React.useEffect(() => {
    if (chartType === 'numbers') setChartLines(VA2_LINES.map(l => ({ ...l, letters: VA2_randNumbers(l.letters.length) })));
    else setChartLines(VA2_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  }, [chartType]);

  const startTest = () => {
    setRotations(genRotations());
    setResults({});
    setEyeIdx(0);
    setPos(startLine);
    setResetArmed(false);
    setElapsed(0);
    setPhase('testing');
  };
  // advance to the next eye (bilateral OD→OS); restart the ladder for that eye
  const nextEye = () => {
    setEyeIdx(i => Math.min(i + 1, eyesToTest.length - 1));
    setPos(startLine);
    setResetArmed(false);
  };
  // in-exam reset: clear all scoring, return to chosen start line + char 1, same chart. Does NOT exit the test.
  const resetExam = () => {
    setResults({});
    setEyeIdx(0);
    setPos(startLine);
    setResetArmed(false);
  };
  const resetTest = () => {
    setPhase('ready');
    setResults({}); setRotations({}); setElapsed(0); setNotes(''); setImpression('');
    setEyeIdx(0); setPos(startLine); setResetArmed(false);
    setChartLines(VA2_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  };

  // ── Ready phase ──
  const SegBtn = ({ active, onClick, children, sub }) => (
    <button onClick={onClick} style={{
      minHeight: 60, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
      border: active ? `1.5px solid ${accent}` : `1.5px solid ${VA2_C.border}`,
      background: active ? `${accent}10` : '#fff', fontFamily: VA2_FONT,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: active ? accent : VA2_C.text }}>{children}</span>
      {sub && <span style={{ fontSize: 10, fontWeight: 400, color: active ? accent : VA2_C.muted }}>{sub}</span>}
    </button>
  );

  const renderReady = () => (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 440px', overflow: 'hidden', height: '100%' }}>
      {/* Preview */}
      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', borderRight: `1px solid ${VA2_C.border}` }}>
        <div style={{ position: 'absolute', top: 22, left: 26, ...VA2_violator }}>Patient view · preview</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {isOpto ? (
            <VA2_Optotype kind={optoKind} size={120} rotation={90} color={VA2_C.text}/>
          ) : (
            <div style={{ display: 'flex', gap: 14 }}>
              {(chartType === 'numbers' ? ['6','3','9'] : ['T','O','Z']).map((c, i) => (
                <span key={i} style={{ fontSize: 96, fontWeight: 700, color: VA2_C.text, fontFamily: VA2_FONT, lineHeight: 1 }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12, color: VA2_C.muted, marginTop: 20 }}>{isOpto ? 'One optotype at a time — reduces in size each step' : 'One line at a time — reduces in size each step'}</div>
        </div>
      </div>
      {/* Setup */}
      <div style={{ background: VA2_C.surface, padding: '34px 34px 26px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...VA2_violator, marginBottom: 6 }}>Examination · pre-flight</div>
        <h1 style={{ fontSize: 25, fontWeight: 700, color: VA2_C.navy, margin: '0 0 8px', lineHeight: 1.15 }}>Visual acuity <span style={{ color: accent }}>v2</span></h1>
        <p style={{ fontSize: 13, color: VA2_C.text2, margin: '0 0 24px', lineHeight: 1.6 }}>
          Split-view layout. The left panel emulates the patient's headset view; the right control panel gives the doctor the full chart with a live position indicator and tap-to-score.
        </p>

        <div style={{ fontSize: 12, fontWeight: 700, color: VA2_C.text, marginBottom: 10 }}>Eye selection</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
          {[['right','OD','Right'],['left','OS','Left'],['both','OU','Both']].map(([v, s, l]) => (
            <button key={v} onClick={() => setEyeMode(v)} style={{
              minHeight: 56, borderRadius: 12, cursor: 'pointer', fontFamily: VA2_FONT,
              border: eyeMode === v ? `1.5px solid ${accent}` : `1.5px solid ${VA2_C.border}`,
              background: eyeMode === v ? `${accent}10` : '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: eyeMode === v ? accent : VA2_C.text2 }}>{s}</span>
              <span style={{ fontSize: 10, color: eyeMode === v ? accent : VA2_C.muted }}>{l}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: VA2_C.text, marginBottom: 10 }}>Optotype</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 22 }}>
          <SegBtn active={chartType === 'snellen'}   onClick={() => setChartType('snellen')}   sub="Line at a time · verbal">Snellen letters</SegBtn>
          <SegBtn active={chartType === 'numbers'}   onClick={() => setChartType('numbers')}   sub="Line at a time · verbal">Numbers</SegBtn>
          <SegBtn active={chartType === 'tumblingE'} onClick={() => setChartType('tumblingE')} sub="Orientation · 4-way clicker">Tumbling E</SegBtn>
          <SegBtn active={chartType === 'tumblingC'} onClick={() => setChartType('tumblingC')} sub="Landolt gap · 4-way clicker">Landolt C</SegBtn>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: VA2_C.text }}>Starting line</span>
          <span style={{ fontSize: 11, color: VA2_C.muted }}>Auto-advances on pass</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: `1.5px solid ${VA2_C.border}`, borderRadius: 12, marginBottom: 26 }}>
          <button onClick={() => { setStartLine(l => Math.max(1, l - 1)); }} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${VA2_C.border}`, background: VA2_C.surface, cursor: 'pointer', fontSize: 22, fontWeight: 700, color: VA2_C.text2, fontFamily: VA2_FONT }}>−</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: VA2_C.muted }}>Start at line</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: VA2_C.text }}>{startLine} <span style={{ color: accent, fontSize: 16 }}>· {VA2_LINES[startLine - 1].va}</span></div>
          </div>
          <button onClick={() => { setStartLine(l => Math.min(10, l + 1)); }} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${VA2_C.border}`, background: VA2_C.surface, cursor: 'pointer', fontSize: 22, fontWeight: 700, color: VA2_C.text2, fontFamily: VA2_FONT }}>+</button>
        </div>

        <div style={{ flex: 1 }}/>
        <button onClick={startTest} style={{
          padding: '14px 24px', borderRadius: 12, border: 'none', background: accent,
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT,
          minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Begin test
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );

  // ── Testing phase: split column ──
  const currentLine = chartLines.find(l => l.n === pos) || chartLines[0];

  // Lockout (frontier) — prevents scoring/jumping AHEAD of natural progression,
  // while leaving all LARGER (easier) rows freely accessible.
  const lineFullyScored = (n) => { const m = results[key(n)]; const ln = chartLines.find(l => l.n === n); return !!(m && ln && m.length === lineCount(ln) && m.every(x => x !== null)); };
  const rowUnlocked = (n) => n <= startLine || lineFullyScored(n - 1); // start + larger rows always open; next row opens once current is fully scored (pass OR fail)
  const charUnlocked = (n, idx) => { if (!rowUnlocked(n)) return false; if (!isOpto) return true; const m = results[key(n)] || []; return idx === 0 || m[idx - 1] != null; };
  // active character (E/C) = first unscored optotype on the current line
  const lineComplete = lineFullyScored(pos);
  const activeChar = (() => { const cnt = lineCount(currentLine); const m = results[key(pos)] || []; for (let k = 0; k < cnt; k++) { if (m[k] == null) return k; } return Math.max(0, cnt - 1); })();
  const goToLine = (n) => { const t = Math.max(1, Math.min(10, n)); if (t < pos || rowUnlocked(t)) setPos(t); }; // up always allowed; down only to an unlocked row

  const PatientView = () => {
    const line = currentLine;
    const cnt = lineCount(line);
    // Snellen/numbers: patient sees the whole line; size to fit the panel.
    // E/C: patient sees ONE optotype at a time, sized to its acuity reference.
    const rowSz = Math.max(20, Math.min(line.fs, Math.floor(500 / cnt) - 10));
    const optoSz = Math.min(line.fs, 240);
    const responseNote = isOpto
      ? (lineComplete ? 'Line complete' : `Patient indicates orientation on the 4-way clicker · character ${activeChar + 1} of ${cnt}`)
      : 'Patient reads this line aloud · doctor scores';
    return (
      <div style={{ flex: 1, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* top labels */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }}/>
            <span style={{ ...VA2_violator }}>Patient view · headset</span>
          </div>
          <div style={{ ...VA2_violator, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{currentEye} · 20 ft</div>
        </div>

        {/* current stimulus — black on white. Snellen: whole line. E/C: one optotype at a time */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          {isOpto ? (
            <VA2_Optotype kind={optoKind} size={optoSz} rotation={rotations[`${line.n}_${activeChar}`] || 0} color={VA2_C.text}/>
          ) : (
            <div style={{ display: 'flex', gap: Math.max(rowSz * 0.42, 12), alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: cnt }).map((_, idx) => (
                <span key={idx} style={{ fontSize: rowSz, fontWeight: 700, color: VA2_C.text, fontFamily: VA2_FONT, lineHeight: 1 }}>{line.letters[idx]}</span>
              ))}
            </div>
          )}
        </div>

        {/* response note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 22px 22px' }}>
          {isOpto && <VA2_ClickerGlyph accent={accent}/>}
          <div style={{ fontSize: 11, color: VA2_C.muted }}>{responseNote}</div>
        </div>
      </div>
    );
  };

  const DoctorControl = () => {
    const best = getBestVA();
    const completed = chartLines.filter(l => { const r = results[key(l.n)]; return r && r.every(x => x !== null); }).length;
    const bilateral = eyesToTest.length > 1;
    const moreEyes = eyeIdx < eyesToTest.length - 1;
    return (
      <div style={{ flex: 1.05, background: '#fff', borderLeft: `1px solid ${VA2_C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: '12px 22px', borderBottom: `1px solid ${VA2_C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={VA2_violator}>Doctor control</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: VA2_C.text, marginTop: 3 }}>
              {chartLabel} · {currentEye} <span style={{ fontWeight: 400, color: VA2_C.muted }}>· {eyeNameFull[currentEye]}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}/>
          {/* OD→OS breadcrumb for bilateral */}
          {bilateral && (
            <div style={{ display: 'flex', gap: 6 }}>
              {eyesToTest.map((e, i) => {
                const active = i === eyeIdx;
                const done = i < eyeIdx;
                return (
                  <div key={e} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20,
                    border: `1.5px solid ${active ? accent : done ? VA2_C.success : VA2_C.border}`,
                    background: active ? `${accent}10` : done ? `${VA2_C.success}10` : '#fff',
                    color: active ? accent : done ? VA2_C.success : VA2_C.muted, fontSize: 12, fontWeight: 700,
                  }}>
                    {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    {e}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 10, color: VA2_C.muted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Line</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => goToLine(pos - 1)} disabled={pos <= 1} aria-label="Larger line" title="Larger (toward 20/200)" style={lineStepBtn(pos <= 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <div style={{ minWidth: 64, textAlign: 'center', fontSize: 15, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{currentLine.va}</div>
              <button onClick={() => goToLine(pos + 1)} disabled={pos >= 10 || !rowUnlocked(pos + 1)} aria-label="Smaller line" title="Smaller (toward 20/10)" style={lineStepBtn(pos >= 10 || !rowUnlocked(pos + 1))}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* chart — fits without scrolling */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '10px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chartLines.map(line => {
              const marks = getMarks(line.n);
              const score = getScore(line.n);
              const hasAny = marks.some(m => m !== null);
              const current = line.n === pos;
              const locked = !rowUnlocked(line.n);
              const dispSize = Math.max(15, Math.min(52, Math.round(line.fs * 0.46)));
              return (
                <div key={line.n} onClick={() => goToLine(line.n)} title={locked ? 'Locked — complete the line above first' : undefined} style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr 58px', alignItems: 'center', gap: 12,
                  padding: '2px 10px', borderRadius: 10, cursor: locked ? 'not-allowed' : 'pointer',
                  border: current ? `2px solid ${accent}` : '2px solid transparent',
                  background: current ? `${accent}0c` : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: current ? accent : VA2_C.muted, textAlign: 'right', fontVariantNumeric: 'tabular-nums', opacity: locked ? 0.4 : 1 }}>{line.va}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: Math.max(dispSize * 0.38, 8) }}>
                    {Array.from({ length: lineCount(line) }).map((_, idx) => {
                      const res = marks[idx];
                      const col = res === 'correct' ? VA2_C.success : res === 'incorrect' ? VA2_C.error : VA2_C.text;
                      const cLocked = !charUnlocked(line.n, idx);
                      const isCurChar = isOpto && current && idx === activeChar && !lineComplete && !cLocked; // gray pointer = optotype the patient is on
                      return (
                        <button key={idx} onClick={(e) => { e.stopPropagation(); toggleMark(line.n, idx); }} disabled={cLocked} title={cLocked ? 'Locked — score the previous optotype first' : 'Tap: correct → incorrect → clear'} style={{
                          background: isCurChar ? '#eef2f7' : 'none', cursor: cLocked ? 'not-allowed' : 'pointer', padding: 2,
                          border: isCurChar ? '2px solid #9ca3af' : '2px solid transparent', borderRadius: 9,
                          minWidth: 30, minHeight: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: VA2_FONT, lineHeight: 1, transition: 'all 0.15s', opacity: cLocked ? 0.22 : 1,
                        }}>
                          {isOpto
                            ? <VA2_Optotype kind={optoKind} size={dispSize} rotation={rotations[`${line.n}_${idx}`] || 0} color={col}/>
                            : <span style={{ fontSize: dispSize, fontWeight: 700, color: col, textDecoration: res === 'incorrect' ? 'line-through' : 'none', textDecorationThickness: 3 }}>{line.letters[idx]}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {hasAny ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: score.pct >= 50 ? `${VA2_C.success}18` : `${VA2_C.error}18`, color: score.pct >= 50 ? VA2_C.success : VA2_C.error }}>{score.correct}/{score.total}</span>
                    ) : <span style={{ fontSize: 10, color: VA2_C.muted }}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* control bar */}
        <div style={{ borderTop: `1px solid ${VA2_C.border}`, padding: '10px 22px', flexShrink: 0, background: VA2_C.surface, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 120 }}>
            <span style={{ fontSize: 11, color: VA2_C.muted }}>Best VA · {currentEye}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: best === '—' ? VA2_C.muted : VA2_C.navy, fontVariantNumeric: 'tabular-nums' }}>{best}</span>
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: VA2_C.border, overflow: 'hidden' }}>
            <div style={{ width: `${completed * 10}%`, height: '100%', background: accent, transition: 'width 0.25s' }}/>
          </div>
          <button onClick={() => { if (resetArmed) { resetExam(); } else { setResetArmed(true); setTimeout(() => setResetArmed(false), 3000); } }} title="Clear all scoring and return to the start line" style={{ minHeight: 40, padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${resetArmed ? VA2_C.error : VA2_C.border}`, background: resetArmed ? '#fef2f2' : '#fff', color: resetArmed ? VA2_C.error : VA2_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>
            {resetArmed ? 'Confirm reset' : 'Reset'}
          </button>
          <button onClick={regenerate} title="Randomize chart" style={{ width: 40, height: 40, borderRadius: 9, border: `1.5px solid ${VA2_C.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VA2_C.muted, flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
          </button>
          {moreEyes ? (
            <button onClick={nextEye} style={{ minHeight: 40, padding: '9px 18px', borderRadius: 9, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              Next eye: {eyesToTest[eyeIdx + 1]}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ) : (
            <button onClick={() => setPhase('report')} style={{ minHeight: 40, padding: '9px 18px', borderRadius: 9, border: 'none', background: VA2_C.success, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT, flexShrink: 0 }}>
              Finish &amp; report
            </button>
          )}
        </div>
      </div>
    );
  };

  function ctrlBtn(color, bg) {
    return {
      minHeight: 40, padding: '9px 14px', borderRadius: 9, cursor: 'pointer', fontFamily: VA2_FONT,
      fontSize: 12, fontWeight: 700,
      border: `1.5px solid ${color ? color : VA2_C.border}`,
      background: bg || '#fff', color: color || VA2_C.text2,
    };
  }

  function lineStepBtn(disabled) {
    return {
      width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${VA2_C.border}`,
      background: '#fff', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#d1d5db' : VA2_C.text2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    };
  }

  const renderTesting = () => (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <PatientView/>
      <DoctorControl/>
    </div>
  );

  // ── Report phase (doctor-led: data + impression, no device verdict) ──
  const renderReport = () => {
    const now = new Date();
    const rowsForEye = (eye) => chartLines
      .map(l => ({ ...l, score: getScore(l.n, eye) }))
      .filter(l => (results[key(l.n, eye)] || []).some(x => x !== null));
    const anyData = eyesToTest.some(e => rowsForEye(e).length > 0);
    return (
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA2_C.border}`, padding: '22px 24px' }}>
          <div style={{ ...VA2_violator, marginBottom: 6 }}>Test report</div>
          <h2 style={{ fontSize: 23, fontWeight: 700, color: VA2_C.navy, margin: '0 0 4px' }}>Visual Acuity Report</h2>
          <div style={{ fontSize: 12, color: VA2_C.text2 }}>Marcus Williams · #4821 · {now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
          {/* measured value(s) per eye */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA2_C.border}`, padding: '22px 24px' }}>
            <div style={{ ...VA2_violator, marginBottom: 14 }}>Measured best VA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {eyesToTest.map(e => (
                <div key={e} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: VA2_C.muted, minWidth: 30 }}>{e}</span>
                  <span style={{ fontSize: 40, fontWeight: 700, color: VA2_C.navy, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{getBestVA(e)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: VA2_C.muted, marginTop: 14 }}>{chartLabel} · last line above pass threshold</div>
          </div>
          {/* doctor impression — affordance, not a device verdict */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA2_C.border}`, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...VA2_violator, marginBottom: 10 }}>Doctor impression</div>
            <textarea value={impression} onChange={e => setImpression(e.target.value)} placeholder="Enter clinical impression…"
              style={{ flex: 1, minHeight: 96, resize: 'none', fontFamily: VA2_FONT, fontSize: 13, color: VA2_C.text2, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${VA2_C.border}`, background: VA2_C.surface, outline: 'none', lineHeight: 1.5 }}/>
            <div style={{ fontSize: 10, color: VA2_C.muted, marginTop: 8, fontStyle: 'italic' }}>The device records measurements. The clinician makes the clinical determination.</div>
          </div>
        </div>

        {/* per-line table */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA2_C.border}`, padding: '22px 24px' }}>
          <div style={{ ...VA2_violator, marginBottom: 14 }}>Line-by-line results</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr style={{ background: VA2_C.navy }}>
                {['Line', 'Acuity', 'Correct', 'Result'].map((h, i) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 700, color: '#fff', textAlign: i < 2 ? 'left' : 'right', padding: '9px 12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!anyData && <tr><td colSpan={4} style={{ padding: '16px 12px', fontSize: 13, color: VA2_C.muted, textAlign: 'center' }}>No lines scored.</td></tr>}
              {eyesToTest.map(eye => {
                const er = rowsForEye(eye);
                if (er.length === 0) return null;
                return (
                  <React.Fragment key={eye}>
                    <tr><td colSpan={4} style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 12px 6px', background: `${accent}08` }}>{eye} · {eyeNameFull[eye]}</td></tr>
                    {er.map(l => {
                      const passed = VA2_lineIsPassed(l.score.correct, l.score.total);
                      return (
                        <tr key={eye + l.n} style={{ borderBottom: `1px solid ${VA2_C.border}` }}>
                          <td style={{ fontSize: 13, fontWeight: 700, color: VA2_C.text, padding: '9px 12px' }}>Line {l.n}</td>
                          <td style={{ fontSize: 13, color: VA2_C.text2, padding: '9px 12px' }}>{l.va}</td>
                          <td style={{ fontSize: 13, color: VA2_C.text2, textAlign: 'right', padding: '9px 12px' }}>{l.score.correct}/{l.score.total}</td>
                          <td style={{ textAlign: 'right', padding: '9px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: passed ? `${VA2_C.success}18` : `${VA2_C.error}18`, color: passed ? VA2_C.success : VA2_C.error }}>{passed ? 'Pass' : 'Fail'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* doctor sign-off */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={VA2_violator}>Doctor sign-off</div>
            <div style={{ fontSize: 12, color: VA2_C.muted, marginTop: 2 }}>Reviewed and certified by the examining clinician.</div>
          </div>
          <button style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: `1.5px solid ${VA2_C.border}`, background: '#fff', color: VA2_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT }}>Export report</button>
          <button style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA2_FONT }}>Certify &amp; close</button>
        </div>
      </div>
    );
  };

  return (
    <ExamShell
      title="Visual acuity v2"
      accent={accent}
      onBack={onBack}
      phase={phase}
      elapsed={elapsed}
      onBegin={startTest}
      onFinish={() => setPhase('report')}
      onNewTest={resetTest}
    >
      {phase === 'ready' && renderReady()}
      {phase === 'testing' && renderTesting()}
      {phase === 'report' && renderReport()}
    </ExamShell>
  );
}

Object.assign(window, { VisualAcuityTestV2 });
