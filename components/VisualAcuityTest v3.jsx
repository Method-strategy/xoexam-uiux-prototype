// VisualAcuityTest v3.jsx — Redesigned by Method Marketing Agency, June 2026
// xoExam clinical tablet UI — 1280×800 base canvas
//
// v3 — FRONTIER NAVIGATION MODEL (builds on the v2 split-column layout).
// Resolves the chart-control questions from the Jun 3 2026 Gary/Zeshan call:
//   • The doctor always sees the WHOLE chart; one row is "active" (live to the
//     patient AND the only row scored), so the patient view can never desync.
//   • A frontier marks the furthest line reached. Going BACK to any encountered
//     line is free (tap to re-check; the patient view follows). Going AHEAD of
//     the frontier triggers a logged override confirm — soft lockout, not hard.
//   • Four row states drive the look: active (accent outline, full contrast,
//     gray character pointer) · completed (per-character FADED green/red, settled)
//     · available (encountered, unscored) · locked (ahead, pale gray + lock).
//   • Override is auditable: each jump records {from→to, eye, time}, surfaced as
//     a toast + a running count chip (Zeshan: "a backlog indicating the override").
//   • Clear-line affordance lets the doctor re-walk a line without a full reset.
//
//   LEFT  — Patient view: Snellen/Numbers show one LINE; Tumbling E / Landolt C
//           show one OPTOTYPE at a time. Black-on-white, no scoring colors.
//   RIGHT — Doctor control: the persistent chart with the four-state styling.
//
// Doctor-led (per CLAUDE.md rule 15): report shows MEASURED data + a doctor
// impression/sign-off affordance. No device-authored verdict banner.
//
// ISOLATED DEMO ONLY — not wired into WFR. Numbers stays here (VA only); it is
// dropped from the optotype set when this chart model is ported into WFR.
// All top-level identifiers are VA3_ prefixed to load alongside other VA files.

// Snellen ladder. fs = on-screen reference size at the chart's design scale.
const VA3_LINES = [
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

const VA3_LETTER_POOL = ['C','D','H','K','N','O','R','S','V','Z']; // Sloan 10
const VA3_NUMBER_POOL = ['1','2','3','4','5','6','7','8','9'];
const VA3_ROT = [0, 90, 180, 270]; // clockwise from "pointing right"

const VA3_C = {
  navy:    '#0e2f5e',
  text:    '#111827',
  text2:   '#374151',
  muted:   '#9ca3af',
  surface: '#f9fafb',
  card:    '#ffffff',
  border:  '#e5e7eb',
  success: '#10b981',
  error:   '#ef4444',
  warning: '#f59e0b',
};
const VA3_FONT = "'Nunito Sans', sans-serif";

const VA3_violator = {
  fontSize: 11, fontWeight: 700, color: VA3_C.muted,
  letterSpacing: '0.08em', textTransform: 'uppercase',
};

const VA3_randLetters = (n) => [...VA3_LETTER_POOL].sort(() => Math.random() - 0.5).slice(0, n);
const VA3_randNumbers = (n) => Array.from({ length: n }, () => VA3_NUMBER_POOL[Math.floor(Math.random() * VA3_NUMBER_POOL.length)]);
const VA3_lineIsPassed = (correct, total) => total > 0 && correct > total / 2;

// Settle delay (ms) before the active character / line advances after a score.
// Deliberately generous: lets the doctor re-tap to correct a mark (e.g. flip
// correct → incorrect) and accommodates slow taps / first-time fumbling without
// the highlight — or the patient's optotype — skipping ahead. Single tunable knob.
const VA3_SETTLE_MS = 850;

// Optotype renderer — 'E' Snellen tumbling E (3 bars + spine), 'C' Landolt C
// (ring with gap). Rotation 0 = legs / gap point right; +90 increments clockwise.
function VA3_Optotype({ kind, size, rotation = 0, color }) {
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
function VA3_ClickerGlyph({ accent }) {
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
const VA3_rotToDir = (rot) => ({ 0:'right', 90:'down', 180:'left', 270:'up' }[((rot % 360) + 360) % 360] || 'right');

function VisualAcuityTestV3({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  const [phase, setPhase] = React.useState('ready');
  const [eyeMode, setEyeMode] = React.useState('right');
  const [chartType, setChartType] = React.useState('tumblingE'); // snellen | numbers | tumblingE | tumblingC
  const [startLine, setStartLine] = React.useState(3);

  const [chartLines, setChartLines] = React.useState(VA3_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  const [rotations, setRotations] = React.useState({}); // `${lineN}_${idx}` → deg
  const [results, setResults] = React.useState({});      // `${eye}_${lineN}` → [null|'correct'|'incorrect']
  const [pos, setPos] = React.useState(3);               // current line the patient is on
  const [charPtr, setCharPtr] = React.useState(0);       // E/C: character the patient is on (lags scoring by VA3_SETTLE_MS)
  const [eyeIdx, setEyeIdx] = React.useState(0);         // index into eyesToTest (OD→OS)
  const [resetArmed, setResetArmed] = React.useState(false); // two-tap confirm for in-exam Reset
  const [frontier, setFrontier] = React.useState(3);     // furthest (smallest) line reached; gates ahead-of-progress moves
  const [pendingOverride, setPendingOverride] = React.useState(null); // line n awaiting override confirm
  const [overrides, setOverrides] = React.useState([]);  // audit log: [{ts, from, to, eye}]
  const [toast, setToast] = React.useState(null);        // transient "recorded" note
  const [settledLines, setSettledLines] = React.useState(new Set()); // lines left/recorded — gate back-edits
  const [pendingEdit, setPendingEdit] = React.useState(null);   // {n, idx} awaiting back-edit confirm
  const [edits, setEdits] = React.useState([]);          // audit log: answer edits on settled lines
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
  // Best VA with additive (+N) notation — mirrors WFR_getBestVA EXACTLY so this
  // demo and the production WFR report agree. base = smallest line that fully
  // PASSED; +N = letters correct on the next-smaller line when it did NOT pass.
  // Scoring is per-character, so the underlying data also records WHICH letters
  // those N were — the client's "20/40 +3, and we know which three" requirement.
  // INTEGRATION CONTRACT: at WFR port time this math is NOT carried over; WFR's
  // own getBestVA/fmtBestVA stay byte-identical and read the same results shape.
  const getBestVA = (eye = currentEye) => {
    let baseIdx = -1;
    for (let i = chartLines.length - 1; i >= 0; i--) {
      const s = getScore(chartLines[i].n, eye);
      if (s.correct > 0 && VA3_lineIsPassed(s.correct, s.total)) { baseIdx = i; break; }
    }
    if (baseIdx < 0) return { va: '—', plus: 0 };
    let plus = 0;
    if (baseIdx + 1 < chartLines.length) {
      const next = chartLines[baseIdx + 1];
      const s = getScore(next.n, eye);
      if (!VA3_lineIsPassed(s.correct, s.total)) plus = s.correct;
    }
    return { va: chartLines[baseIdx].va, plus };
  };
  const fmtBestVA = (eye = currentEye) => { const b = getBestVA(eye); return b.va === '—' ? '—' : (b.plus > 0 ? `${b.va} +${b.plus}` : b.va); };

  const genRotations = () => {
    const r = {};
    VA3_LINES.forEach(line => {
      const cnt = line.letters.length;
      for (let i = 0; i < cnt; i++) r[`${line.n}_${i}`] = VA3_ROT[Math.floor(Math.random() * 4)];
    });
    return r;
  };

  // advance the patient to the next line when the current one is fully marked & passed
  const maybeAdvance = (lineN, marks) => {
    const allMarked = marks.every(m => m !== null);
    const correct = marks.filter(m => m === 'correct').length;
    if (allMarked && VA3_lineIsPassed(correct, marks.length) && lineN < 10) {
      setTimeout(() => setPos(lineN + 1), 350);
    }
  };

  const advanceRef = React.useRef(null);
  const charAdvRef = React.useRef(null);
  const cancelAdvance = () => { if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; } };
  const cancelCharAdv = () => { if (charAdvRef.current) { clearTimeout(charAdvRef.current); charAdvRef.current = null; } };
  const firstUnscored = (n) => {
    const ln = chartLines.find(l => l.n === n) || { letters: [] };
    const m = results[key(n)] || [];
    for (let j = 0; j < ln.letters.length; j++) if (m[j] == null) return j;
    return Math.max(0, ln.letters.length - 1);
  };
  const toggleChar = (lineN, idx, allowAdvance) => {
    if (!charUnlocked(lineN, idx)) return; // active-row E/C order lock
    cancelAdvance(); cancelCharAdv(); // any new tap cancels a pending row OR character
                                      // advance, so slow taps and corrections aren't skipped.
    const prev = getMarks(lineN);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    setResults(r => ({ ...r, [key(lineN)]: next }));

    if (lineN === pos) {
      // E/C: the highlight (and the patient's single optotype) follows the tapped
      // character, then settles to the next unscored one after a deliberate pause
      // — the patient is never shown the next optotype until scoring is confirmed.
      if (isOpto) {
        setCharPtr(idx);
        if (next[idx] != null) {
          let nxt = -1;
          for (let j = idx + 1; j < next.length; j++) { if (next[j] == null) { nxt = j; break; } }
          if (nxt >= 0) charAdvRef.current = setTimeout(() => { charAdvRef.current = null; setCharPtr(nxt); }, VA3_SETTLE_MS);
        }
      }
      // Whole line fully scored AND passing → advance one line smaller (also delayed
      // and cancellable, so the final letter can still be re-tapped to incorrect).
      if (allowAdvance && next.every(m => m !== null)) {
        const correct = next.filter(m => m === 'correct').length;
        if (VA3_lineIsPassed(correct, next.length) && lineN < 10) {
          advanceRef.current = setTimeout(() => {
            advanceRef.current = null;
            setSettledLines(s => { const x = new Set(s); x.add(key(lineN)); return x; });
            setFrontier(f => Math.max(f, lineN + 1));
            setPos(lineN + 1);
          }, VA3_SETTLE_MS);
        }
      }
    }
  };
  // settle = mark a line as "left / recorded" once the doctor moves on from it.
  // Editing a recorded answer on a settled line is what triggers the back-edit
  // warning + audit entry (navigating back, by itself, stays free).
  const settle = (n) => { if ((results[key(n)] || []).some(m => m != null)) setSettledLines(s => { const x = new Set(s); x.add(key(n)); return x; }); };
  // unified tap: score active row · continue/activate a behind row (free) · override
  // ahead · CHANGING an already-recorded answer on a settled line → soft warning.
  const onCharClick = (n, idx) => {
    if (!encountered(n)) { setPendingOverride(n); return; }
    const marks = results[key(n)] || [];
    if (settledLines.has(key(n)) && marks[idx] != null) { setPendingEdit({ n, idx }); return; }
    if (n !== pos) { setPos(n); toggleChar(n, idx, false); return; }
    toggleChar(n, idx, true);
  };
  // confirmed back-edit: log it, unlock the line for free correction, apply the flip.
  const applyEdit = ({ n, idx }) => {
    const prev = results[key(n)] || [];
    const before = prev[idx];
    const after = before === null ? 'correct' : before === 'correct' ? 'incorrect' : null;
    const arr = [...prev]; arr[idx] = after;
    const va = (chartLines.find(l => l.n === n) || {}).va;
    cancelAdvance(); cancelCharAdv();
    setSettledLines(s => { const x = new Set(s); if ((results[key(pos)] || []).some(m => m != null)) x.add(key(pos)); x.delete(key(n)); return x; });
    setResults(r => ({ ...r, [key(n)]: arr }));
    setEdits(e => [...e, { ts: Date.now(), eye: currentEye, va, idx, from: before, to: after }]);
    setPos(n);
    flashToast(`Answer edit recorded · ${va} letter ${idx + 1}`);
  };
  // clear just the active line's marks so an E/C re-walk starts clean at character 1
  const clearLine = () => { cancelAdvance(); cancelCharAdv(); setCharPtr(0); setResults(r => { const c = { ...r }; delete c[key(pos)]; return c; }); };
  // "Can't read / End here" — the patient can't (or won't) read further. Fill the
  // active line's UNSCORED letters as incorrect, which (a) preserves any already-
  // correct letters so partial credit / +N still counts them, (b) marks the line
  // fully attempted-and-failed (distinct from a blank, un-tested line), and (c)
  // establishes the endpoint: the last passed line above. Does not auto-advance.
  const endHere = () => {
    cancelAdvance(); cancelCharAdv();
    const cur = getMarks(pos).slice();
    for (let i = 0; i < cur.length; i++) if (cur[i] == null) cur[i] = 'incorrect';
    setResults(r => ({ ...r, [key(pos)]: cur }));
  };
  // When the active line or eye changes, cancel any pending character advance and
  // place the pointer on that line's first unscored optotype (0 on a fresh line).
  React.useEffect(() => { cancelCharAdv(); setCharPtr(firstUnscored(pos)); }, [pos, currentEye]);
  const markAll = (lineN, val) => {
    const line = chartLines.find(l => l.n === lineN);
    const next = Array(lineCount(line)).fill(val);
    setResults(r => ({ ...r, [key(lineN)]: next }));
    if (val === 'correct') maybeAdvance(lineN, next);
  };

  const regenerate = () => {
    setChartLines(prev => prev.map(l => {
      const letters = chartType === 'numbers' ? VA3_randNumbers(l.letters.length) : VA3_randLetters(l.letters.length);
      return { ...l, letters };
    }));
    setRotations(genRotations());
    setResults({});
  };

  React.useEffect(() => {
    if (chartType === 'numbers') setChartLines(VA3_LINES.map(l => ({ ...l, letters: VA3_randNumbers(l.letters.length) })));
    else setChartLines(VA3_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  }, [chartType]);

  const startTest = () => {
    cancelAdvance(); cancelCharAdv(); setCharPtr(0);
    setRotations(genRotations());
    setResults({});
    setEyeIdx(0);
    setPos(startLine);
    setFrontier(startLine);
    setOverrides([]);
    setSettledLines(new Set()); setEdits([]);
    setResetArmed(false);
    setElapsed(0);
    setPhase('testing');
  };
  // advance to the next eye (bilateral OD→OS); restart the ladder for that eye
  const nextEye = () => {
    cancelAdvance(); cancelCharAdv(); setCharPtr(0);
    setEyeIdx(i => Math.min(i + 1, eyesToTest.length - 1));
    setPos(startLine);
    setFrontier(startLine);
    setResetArmed(false);
  };
  // in-exam reset: clear all scoring, return to chosen start line + char 1, same chart. Does NOT exit the test.
  const resetExam = () => {
    cancelAdvance(); cancelCharAdv(); setCharPtr(0);
    setResults({});
    setEyeIdx(0);
    setPos(startLine);
    setFrontier(startLine);
    setOverrides([]);
    setSettledLines(new Set()); setEdits([]);
    setResetArmed(false);
  };
  const resetTest = () => {
    cancelAdvance(); cancelCharAdv(); setCharPtr(0);
    setPhase('ready');
    setResults({}); setRotations({}); setElapsed(0); setNotes(''); setImpression('');
    setEyeIdx(0); setPos(startLine); setFrontier(startLine); setOverrides([]); setResetArmed(false);
    setSettledLines(new Set()); setEdits([]);
    setChartLines(VA3_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  };

  // ── Ready phase ──
  const SegBtn = ({ active, onClick, children, sub }) => (
    <button onClick={onClick} style={{
      minHeight: 60, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
      border: active ? `1.5px solid ${accent}` : `1.5px solid ${VA3_C.border}`,
      background: active ? `${accent}10` : '#fff', fontFamily: VA3_FONT,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: active ? accent : VA3_C.text }}>{children}</span>
      {sub && <span style={{ fontSize: 10, fontWeight: 400, color: active ? accent : VA3_C.muted }}>{sub}</span>}
    </button>
  );

  const renderReady = () => (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 440px', overflow: 'hidden', height: '100%' }}>
      {/* Preview */}
      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', borderRight: `1px solid ${VA3_C.border}` }}>
        <div style={{ position: 'absolute', top: 22, left: 26, ...VA3_violator }}>Patient view · preview</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {isOpto ? (
            <VA3_Optotype kind={optoKind} size={120} rotation={90} color={VA3_C.text}/>
          ) : (
            <div style={{ display: 'flex', gap: 14 }}>
              {(chartType === 'numbers' ? ['6','3','9'] : ['T','O','Z']).map((c, i) => (
                <span key={i} style={{ fontSize: 96, fontWeight: 700, color: VA3_C.text, fontFamily: VA3_FONT, lineHeight: 1 }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12, color: VA3_C.muted, marginTop: 20 }}>{isOpto ? 'One optotype at a time — reduces in size each step' : 'One line at a time — reduces in size each step'}</div>
        </div>
      </div>
      {/* Setup */}
      <div style={{ background: VA3_C.surface, padding: '34px 34px 26px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...VA3_violator, marginBottom: 6 }}>Examination · pre-flight</div>
        <h1 style={{ fontSize: 25, fontWeight: 700, color: VA3_C.navy, margin: '0 0 8px', lineHeight: 1.15 }}>Visual acuity <span style={{ color: accent }}>v3</span></h1>
        <p style={{ fontSize: 13, color: VA3_C.text2, margin: '0 0 24px', lineHeight: 1.6 }}>
          Split-view layout. The left panel emulates the patient's headset view; the right control panel gives the doctor the full chart with a live position indicator and tap-to-score.
        </p>

        <div style={{ fontSize: 12, fontWeight: 700, color: VA3_C.text, marginBottom: 10 }}>Eye selection</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
          {[['right','OD','Right'],['left','OS','Left'],['both','OU','Both']].map(([v, s, l]) => (
            <button key={v} onClick={() => setEyeMode(v)} style={{
              minHeight: 56, borderRadius: 12, cursor: 'pointer', fontFamily: VA3_FONT,
              border: eyeMode === v ? `1.5px solid ${accent}` : `1.5px solid ${VA3_C.border}`,
              background: eyeMode === v ? `${accent}10` : '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: eyeMode === v ? accent : VA3_C.text2 }}>{s}</span>
              <span style={{ fontSize: 10, color: eyeMode === v ? accent : VA3_C.muted }}>{l}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: VA3_C.text, marginBottom: 10 }}>Optotype</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 22 }}>
          <SegBtn active={chartType === 'snellen'}   onClick={() => setChartType('snellen')}   sub="Line at a time · verbal">Snellen letters</SegBtn>
          <SegBtn active={chartType === 'numbers'}   onClick={() => setChartType('numbers')}   sub="Line at a time · verbal">Numbers</SegBtn>
          <SegBtn active={chartType === 'tumblingE'} onClick={() => setChartType('tumblingE')} sub="Orientation · 4-way clicker">Tumbling E</SegBtn>
          <SegBtn active={chartType === 'tumblingC'} onClick={() => setChartType('tumblingC')} sub="Landolt gap · 4-way clicker">Landolt C</SegBtn>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: VA3_C.text }}>Starting line</span>
          <span style={{ fontSize: 11, color: VA3_C.muted }}>Auto-advances on pass</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: `1.5px solid ${VA3_C.border}`, borderRadius: 12, marginBottom: 26 }}>
          <button onClick={() => { setStartLine(l => Math.max(1, l - 1)); }} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: VA3_C.surface, cursor: 'pointer', fontSize: 22, fontWeight: 700, color: VA3_C.text2, fontFamily: VA3_FONT }}>−</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: VA3_C.muted }}>Start at line</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: VA3_C.text }}>{startLine} <span style={{ color: accent, fontSize: 16 }}>· {VA3_LINES[startLine - 1].va}</span></div>
          </div>
          <button onClick={() => { setStartLine(l => Math.min(10, l + 1)); }} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: VA3_C.surface, cursor: 'pointer', fontSize: 22, fontWeight: 700, color: VA3_C.text2, fontFamily: VA3_FONT }}>+</button>
        </div>

        <div style={{ flex: 1 }}/>
        <button onClick={startTest} style={{
          padding: '14px 24px', borderRadius: 12, border: 'none', background: accent,
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT,
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

  // ── Frontier navigation model ──────────────────────────────────────────
  // The doctor always sees the WHOLE chart. One row is "active" (live to the
  // patient and the only row scored). A frontier marks the furthest row reached.
  // Rows AT or BEHIND the frontier are freely navigable (re-check, no warning);
  // rows AHEAD of it require a logged override. Four row states drive the look:
  //   active · completed (scored, faded green/red) · available · locked (ahead).
  const lineFullyScored = (n) => { const m = results[key(n)]; const ln = chartLines.find(l => l.n === n); return !!(m && ln && m.length === lineCount(ln) && m.every(x => x !== null)); };
  const hasAnyMark = (n) => (results[key(n)] || []).some(x => x !== null);
  const encountered = (n) => n <= frontier;                  // at/behind frontier → free
  const rowState = (n) => {
    if (n === pos) return 'active';
    if (hasAnyMark(n)) return 'completed';
    if (encountered(n)) return 'available';
    return 'locked';                                          // ahead of frontier
  };
  // E/C character order-lock applies ONLY on the active row (one optotype at a time)
  const charUnlocked = (n, idx) => { if (!isOpto) return true; if (n !== pos) return true; const m = results[key(n)] || []; return idx === 0 || m[idx - 1] != null; };
  const lineComplete = lineFullyScored(pos);

  const flashToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const doOverride = (n) => {
    cancelAdvance(); cancelCharAdv(); settle(pos);
    const target = chartLines.find(l => l.n === n) || {};
    setOverrides(o => [...o, { ts: Date.now(), from: currentLine.va, to: target.va, eye: currentEye }]);
    setFrontier(f => Math.max(f, n));
    setPos(n);
    flashToast(`Override recorded · ${currentLine.va} → ${target.va}`);
  };
  // navigate the active row. back / at frontier = free; ahead = override confirm.
  const goToLine = (n) => {
    const t = Math.max(1, Math.min(10, n));
    if (t === pos) return;
    cancelAdvance(); cancelCharAdv(); settle(pos);
    if (encountered(t)) setPos(t);
    else setPendingOverride(t);
  };

  const PatientView = () => {
    const line = currentLine;
    const cnt = lineCount(line);
    // Snellen/numbers: patient sees the whole line; size to fit the panel.
    // E/C: patient sees ONE optotype at a time, sized to its acuity reference.
    const rowSz = Math.max(20, Math.min(line.fs, Math.floor(500 / cnt) - 10));
    const optoSz = Math.min(line.fs, 240);
    const responseNote = isOpto
      ? (lineComplete ? 'Line complete' : `Patient indicates orientation on the 4-way clicker · character ${charPtr + 1} of ${cnt}`)
      : 'Patient reads this line aloud · doctor scores';
    return (
      <div style={{ flex: 1, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* top labels */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }}/>
            <span style={{ ...VA3_violator }}>Patient view · headset</span>
          </div>
          <div style={{ ...VA3_violator, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{currentEye} · 20 ft</div>
        </div>

        {/* current stimulus — black on white. Snellen: whole line. E/C: one optotype at a time */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          {isOpto ? (
            <VA3_Optotype kind={optoKind} size={optoSz} rotation={rotations[`${line.n}_${charPtr}`] || 0} color={VA3_C.text}/>
          ) : (
            <div style={{ display: 'flex', gap: Math.max(rowSz * 0.42, 12), alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: cnt }).map((_, idx) => (
                <span key={idx} style={{ fontSize: rowSz, fontWeight: 700, color: VA3_C.text, fontFamily: VA3_FONT, lineHeight: 1 }}>{line.letters[idx]}</span>
              ))}
            </div>
          )}
        </div>

        {/* response note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 22px 22px' }}>
          {isOpto && <VA3_ClickerGlyph accent={accent}/>}
          <div style={{ fontSize: 11, color: VA3_C.muted }}>{responseNote}</div>
        </div>
      </div>
    );
  };

  const DoctorControl = () => {
    const best = fmtBestVA();
    const completed = chartLines.filter(l => { const r = results[key(l.n)]; return r && r.every(x => x !== null); }).length;
    const bilateral = eyesToTest.length > 1;
    const moreEyes = eyeIdx < eyesToTest.length - 1;
    return (
      <div style={{ flex: 1.05, background: '#fff', borderLeft: `1px solid ${VA3_C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: '12px 22px', borderBottom: `1px solid ${VA3_C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={VA3_violator}>Doctor control</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: VA3_C.text, marginTop: 3 }}>
              {chartLabel} · {currentEye} <span style={{ fontWeight: 400, color: VA3_C.muted }}>· {eyeNameFull[currentEye]}</span>
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
                    border: `1.5px solid ${active ? accent : done ? VA3_C.success : VA3_C.border}`,
                    background: active ? `${accent}10` : done ? `${VA3_C.success}10` : '#fff',
                    color: active ? accent : done ? VA3_C.success : VA3_C.muted, fontSize: 12, fontWeight: 700,
                  }}>
                    {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    {e}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 10, color: VA3_C.muted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Line</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => goToLine(pos - 1)} disabled={pos <= 1} aria-label="Larger line" title="Larger (toward 20/200)" style={lineStepBtn(pos <= 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <div style={{ minWidth: 64, textAlign: 'center', fontSize: 15, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{currentLine.va}</div>
              <button onClick={() => goToLine(pos + 1)} disabled={pos >= 10} aria-label="Smaller line" title="Smaller (toward 20/10)" style={lineStepBtn(pos >= 10)}>
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
              const st = rowState(line.n);            // active | completed | available | locked
              const current = st === 'active';
              const completed = st === 'completed';
              const locked = st === 'locked';         // ahead of frontier
              const dispSize = Math.max(15, Math.min(52, Math.round(line.fs * 0.46)));
              const rowTitle = locked ? 'Ahead of progress — tap to override (recorded)'
                : completed ? 'Completed — tap to re-check' : undefined;
              return (
                <div key={line.n} onClick={() => goToLine(line.n)} title={rowTitle} style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr 58px', alignItems: 'center', gap: 12,
                  padding: '2px 10px', borderRadius: 10, cursor: 'pointer',
                  border: current ? `2px solid ${accent}` : '2px solid transparent',
                  background: current ? `${accent}0c` : completed ? '#f8fafc' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: current ? accent : VA3_C.muted, textAlign: 'right', fontVariantNumeric: 'tabular-nums', opacity: locked ? 0.45 : completed ? 0.7 : 1 }}>{line.va}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: Math.max(dispSize * 0.38, 8) }}>
                    {Array.from({ length: lineCount(line) }).map((_, idx) => {
                      const res = marks[idx];
                      const col = res === 'correct' ? VA3_C.success : res === 'incorrect' ? VA3_C.error : (locked ? '#c7ccd4' : VA3_C.text);
                      const cDisabled = current && !charUnlocked(line.n, idx); // active-row E/C order lock
                      const isCurChar = isOpto && current && idx === charPtr && !lineComplete && !cDisabled; // gray pointer = optotype patient is on
                      // completed rows render their marks FADED (grayed green/red); ahead rows are pale gray
                      const charOpacity = cDisabled ? 0.22 : completed ? 0.5 : locked ? 0.5 : 1;
                      return (
                        <button key={idx} onClick={(e) => { e.stopPropagation(); onCharClick(line.n, idx); }} disabled={cDisabled} title={cDisabled ? 'Score the previous optotype first' : undefined} style={{
                          background: isCurChar ? '#eef2f7' : 'none', cursor: cDisabled ? 'not-allowed' : 'pointer', padding: 2,
                          border: isCurChar ? '2px solid #9ca3af' : '2px solid transparent', borderRadius: 9,
                          minWidth: 30, minHeight: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: VA3_FONT, lineHeight: 1, transition: 'all 0.15s', opacity: charOpacity,
                        }}>
                          {isOpto
                            ? <VA3_Optotype kind={optoKind} size={dispSize} rotation={rotations[`${line.n}_${idx}`] || 0} color={col}/>
                            : <span style={{ fontSize: dispSize, fontWeight: 700, color: col, textDecoration: res === 'incorrect' ? 'line-through' : 'none', textDecorationThickness: 3 }}>{line.letters[idx]}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {hasAny ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, opacity: completed ? 0.55 : 1, background: '#f3f4f6', color: VA3_C.text2, fontVariantNumeric: 'tabular-nums' }}>{score.correct}/{score.total}</span>
                    ) : locked ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7ccd4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : <span style={{ fontSize: 10, color: VA3_C.muted }}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* control bar */}
        <div style={{ borderTop: `1px solid ${VA3_C.border}`, padding: '10px 22px', flexShrink: 0, background: VA3_C.surface, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 150 }}>
            <span style={{ fontSize: 11, color: VA3_C.muted, whiteSpace: 'nowrap' }}>Best VA · {currentEye}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: best === '—' ? VA3_C.muted : VA3_C.navy, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{best}</span>
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: VA3_C.border, overflow: 'hidden' }}>
            <div style={{ width: `${completed * 10}%`, height: '100%', background: accent, transition: 'width 0.25s' }}/>
          </div>
          {overrides.length > 0 && (
            <div title={overrides.map(o => `${o.eye} ${o.from}→${o.to}`).join(' · ')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9, background: `${VA3_C.warning || '#f59e0b'}14`, border: `1.5px solid ${VA3_C.warning || '#f59e0b'}55`, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={VA3_C.warning || '#f59e0b'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: VA3_C.warning || '#b45309' }}>{overrides.length} override{overrides.length > 1 ? 's' : ''} recorded</span>
            </div>
          )}
          {edits.length > 0 && (
            <div title={edits.map(e => `${e.eye} ${e.va} L${e.idx + 1}`).join(' · ')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9, background: `${VA3_C.navy}0d`, border: `1.5px solid ${VA3_C.navy}33`, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={VA3_C.navy} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: VA3_C.navy }}>{edits.length} answer edit{edits.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {!lineComplete && (
            <button onClick={endHere} title="Patient can't read further — mark remaining letters incorrect and set the endpoint" style={{ minHeight: 40, padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${VA3_C.border}`, background: '#fff', color: VA3_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Can't read
            </button>
          )}
          {hasAnyMark(pos) && (
            <button onClick={clearLine} title="Clear this line's marks (re-walk from character 1)" style={{ minHeight: 40, padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${VA3_C.border}`, background: '#fff', color: VA3_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              Clear line
            </button>
          )}
          <button onClick={() => { if (resetArmed) { resetExam(); } else { setResetArmed(true); setTimeout(() => setResetArmed(false), 3000); } }} title="Clear all scoring and return to the start line" style={{ minHeight: 40, padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${resetArmed ? VA3_C.error : VA3_C.border}`, background: resetArmed ? '#fef2f2' : '#fff', color: resetArmed ? VA3_C.error : VA3_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>
            {resetArmed ? 'Confirm reset' : 'Reset'}
          </button>
          <button onClick={regenerate} title="Randomize chart" style={{ width: 40, height: 40, borderRadius: 9, border: `1.5px solid ${VA3_C.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VA3_C.muted, flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
          </button>
          {moreEyes ? (
            <button onClick={nextEye} style={{ minHeight: 40, padding: '9px 18px', borderRadius: 9, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              Next eye: {eyesToTest[eyeIdx + 1]}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ) : (
            <button onClick={() => setPhase('report')} style={{ minHeight: 40, padding: '9px 18px', borderRadius: 9, border: 'none', background: VA3_C.success, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, flexShrink: 0 }}>
              Finish &amp; report
            </button>
          )}
        </div>
      </div>
    );
  };

  function ctrlBtn(color, bg) {
    return {
      minHeight: 40, padding: '9px 14px', borderRadius: 9, cursor: 'pointer', fontFamily: VA3_FONT,
      fontSize: 12, fontWeight: 700,
      border: `1.5px solid ${color ? color : VA3_C.border}`,
      background: bg || '#fff', color: color || VA3_C.text2,
    };
  }

  function lineStepBtn(disabled) {
    return {
      width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${VA3_C.border}`,
      background: '#fff', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#d1d5db' : VA3_C.text2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    };
  }

  const renderTesting = () => {
    const target = pendingOverride != null ? (chartLines.find(l => l.n === pendingOverride) || {}) : null;
    return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <PatientView/>
      <DoctorControl/>

      {/* transient override audit toast */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 78, left: '50%', transform: 'translateX(-50%)', background: VA3_C.navy, color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: VA3_FONT, boxShadow: '0 8px 24px rgba(15,23,42,0.28)', zIndex: 40, display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      {/* back-edit confirm — changing a recorded answer on a completed line is logged */}
      {pendingEdit && (() => {
        const ev = chartLines.find(l => l.n === pendingEdit.n) || {};
        return (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setPendingEdit(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, background: '#fff', borderRadius: 16, padding: '26px 28px', boxShadow: '0 24px 60px rgba(15,23,42,0.32)', fontFamily: VA3_FONT }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: VA3_C.navy, margin: 0 }}>Change a recorded answer?</h3>
            </div>
            <p style={{ fontSize: 13, color: VA3_C.text2, lineHeight: 1.6, margin: '0 0 20px' }}>
              Line {ev.va} was already completed. Editing letter {pendingEdit.idx + 1} changes a recorded result. <strong style={{ color: VA3_C.text }}>The change will be saved to the answer-edit log.</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button autoFocus onClick={() => setPendingEdit(null)} style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: '#fff', color: VA3_C.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT }}>Cancel</button>
              <button onClick={() => { applyEdit(pendingEdit); setPendingEdit(null); }} style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT }}>Change answer</button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* override confirm — jumping ahead of the patient's progress is a logged event */}
      {target && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
             onClick={() => setPendingOverride(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, background: '#fff', borderRadius: 16, padding: '26px 28px', boxShadow: '0 24px 60px rgba(15,23,42,0.32)', fontFamily: VA3_FONT }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${VA3_C.warning || '#f59e0b'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={VA3_C.warning || '#f59e0b'} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: VA3_C.navy, margin: 0 }}>Skip ahead to {target.va}?</h3>
            </div>
            <p style={{ fontSize: 13, color: VA3_C.text2, lineHeight: 1.6, margin: '0 0 20px' }}>
              This jumps past the patient's current line ({currentLine.va}), ahead of natural progression. Lines in between stay open and unscored. <strong style={{ color: VA3_C.text }}>The override will be recorded in the session log.</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button autoFocus onClick={() => setPendingOverride(null)} style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: '#fff', color: VA3_C.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT }}>Cancel</button>
              <button onClick={() => { doOverride(pendingOverride); setPendingOverride(null); }} style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: 'none', background: VA3_C.warning || '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
                Override &amp; jump
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  // ── Report phase (doctor-led: data + impression, no device verdict) ──
  const renderReport = () => {
    const now = new Date();
    const rowsForEye = (eye) => chartLines
      .map(l => ({ ...l, score: getScore(l.n, eye) }))
      .filter(l => (results[key(l.n, eye)] || []).some(x => x !== null));
    const anyData = eyesToTest.some(e => rowsForEye(e).length > 0);
    return (
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA3_C.border}`, padding: '22px 24px' }}>
          <div style={{ ...VA3_violator, marginBottom: 6 }}>Test report</div>
          <h2 style={{ fontSize: 23, fontWeight: 700, color: VA3_C.navy, margin: '0 0 4px' }}>Visual Acuity Report</h2>
          <div style={{ fontSize: 12, color: VA3_C.text2 }}>Marcus Williams · #4821 · {now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
          {/* measured value(s) per eye */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA3_C.border}`, padding: '22px 24px' }}>
            <div style={{ ...VA3_violator, marginBottom: 14 }}>Measured best VA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {eyesToTest.map(e => (
                <div key={e} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: VA3_C.muted, minWidth: 30 }}>{e}</span>
                  <span style={{ fontSize: 36, fontWeight: 700, color: VA3_C.navy, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{fmtBestVA(e)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: VA3_C.muted, marginTop: 14 }}>{chartLabel} · smallest line passed; <strong style={{ color: VA3_C.text2 }}>+N</strong> = letters read on the next line</div>
          </div>
          {/* doctor impression — affordance, not a device verdict */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA3_C.border}`, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...VA3_violator, marginBottom: 10 }}>Doctor impression</div>
            <textarea value={impression} onChange={e => setImpression(e.target.value)} placeholder="Enter clinical impression…"
              style={{ flex: 1, minHeight: 96, resize: 'none', fontFamily: VA3_FONT, fontSize: 13, color: VA3_C.text2, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: VA3_C.surface, outline: 'none', lineHeight: 1.5 }}/>
            <div style={{ fontSize: 10, color: VA3_C.muted, marginTop: 8, fontStyle: 'italic' }}>The device records measurements. The clinician makes the clinical determination.</div>
          </div>
        </div>

        {/* per-line table */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA3_C.border}`, padding: '22px 24px' }}>
          <div style={{ ...VA3_violator, marginBottom: 14 }}>Line-by-line results</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr style={{ background: VA3_C.navy }}>
                {['Line', 'Acuity', 'Correct', '% correct'].map((h, i) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 700, color: '#fff', textAlign: i < 2 ? 'left' : 'right', padding: '9px 12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!anyData && <tr><td colSpan={4} style={{ padding: '16px 12px', fontSize: 13, color: VA3_C.muted, textAlign: 'center' }}>No lines scored.</td></tr>}
              {eyesToTest.map(eye => {
                const er = rowsForEye(eye);
                if (er.length === 0) return null;
                return (
                  <React.Fragment key={eye}>
                    <tr><td colSpan={4} style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 12px 6px', background: `${accent}08` }}>{eye} · {eyeNameFull[eye]}</td></tr>
                    {er.map(l => {
                      return (
                        <tr key={eye + l.n} style={{ borderBottom: `1px solid ${VA3_C.border}` }}>
                          <td style={{ fontSize: 13, fontWeight: 700, color: VA3_C.text, padding: '9px 12px' }}>Line {l.n}</td>
                          <td style={{ fontSize: 13, color: VA3_C.text2, padding: '9px 12px' }}>{l.va}</td>
                          <td style={{ fontSize: 13, color: VA3_C.text2, textAlign: 'right', padding: '9px 12px' }}>{l.score.correct}/{l.score.total}</td>
                          <td style={{ textAlign: 'right', padding: '9px 12px' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: VA3_C.navy, fontVariantNumeric: 'tabular-nums' }}>{l.score.pct}%</span>
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

        {/* session audit — overrides + answer edits (QA / operator-training signal) */}
        {(overrides.length > 0 || edits.length > 0) && (
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${VA3_C.border}`, padding: '18px 24px' }}>
            <div style={{ ...VA3_violator, marginBottom: 12 }}>Session audit</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, color: VA3_C.muted, marginBottom: 3 }}>Ahead-of-progress overrides</div><div style={{ fontSize: 22, fontWeight: 700, color: VA3_C.navy }}>{overrides.length}</div></div>
              <div><div style={{ fontSize: 11, color: VA3_C.muted, marginBottom: 3 }}>Recorded-answer edits</div><div style={{ fontSize: 22, fontWeight: 700, color: VA3_C.navy }}>{edits.length}</div></div>
            </div>
            <div style={{ fontSize: 11, color: VA3_C.muted, marginTop: 12, lineHeight: 1.5, fontStyle: 'italic' }}>Captured for quality assurance and operator training — frequent overrides or back-edits may indicate a workflow or training need.</div>
          </div>
        )}

        {/* doctor sign-off */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={VA3_violator}>Doctor sign-off</div>
            <div style={{ fontSize: 12, color: VA3_C.muted, marginTop: 2 }}>Reviewed and certified by the examining clinician.</div>
          </div>
          <button style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: `1.5px solid ${VA3_C.border}`, background: '#fff', color: VA3_C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT }}>Export report</button>
          <button style={{ minHeight: 44, padding: '11px 18px', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: VA3_FONT }}>Certify &amp; close</button>
        </div>
      </div>
    );
  };

  return (
    <ExamShell
      title="Visual acuity v3"
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

Object.assign(window, { VisualAcuityTestV3 });
