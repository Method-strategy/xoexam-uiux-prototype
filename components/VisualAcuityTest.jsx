// VisualAcuityTest.jsx — Redesigned by Method Marketing Agency, May 2026
// Updated: chart type implementations + typography corrections + report label fix
// 2026-05-15: Refactored onto ExamShell. Internal Header + cancel dialog removed (now owned by ExamShell).
//             Eye-mode + view-toggle relocated to TestingSubBar inside testing-phase content.
//             No business-logic changes; render outputs of ready/testing/report phases unchanged.

const VA_LINES = [
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

const VA_LETTER_POOL = ['A','B','C','D','E','F','G','H','K','L','N','O','P','R','T','U','V','Z'];
const VA_NUMBER_POOL = ['1','2','3','4','5','6','7','8','9'];
const VA_E_ROTATIONS = [0, 90, 180, 270]; // legs pointing right, up, left, down

// ── v0.2.3 clinical accuracy additions ──
// Sloan 10 — the ETDRS standard letter set (10 letters of equal recognition
// difficulty at the legibility threshold). Used when ETDRS-style scoring is
// active. The legacy VA_LETTER_POOL above is retained for backward-compatible
// Snellen chart rendering.
const VA_SLOAN_10 = ['C','D','H','K','N','O','R','S','V','Z'];

// Snellen-to-LogMAR conversion. LogMAR = log10(denominator/20) for any '20/x'
// notation. LogMAR is the modern clinical standard for research, longitudinal
// comparison, and statistical analysis. Returned to 2 decimals.
//   20/200 → 1.00 · 20/20 → 0.00 · 20/10 → -0.30
function VA_snellenToLogMAR(snellen) {
  if (!snellen || snellen === '—') return null;
  const denom = parseFloat(String(snellen).split('/')[1]);
  if (!isFinite(denom) || denom <= 0) return null;
  return Math.log10(denom / 20);
}

// Format a logMAR value for display. Always 2-decimal, with explicit sign
// for negative values (so the report doesn't read e.g. '-.3').
function VA_formatLogMAR(lm) {
  if (lm === null || lm === undefined || !isFinite(lm)) return '—';
  return lm.toFixed(2);
}

// Clinical line-pass rule. Replaces the previous arbitrary 65% threshold with
// the published clinical convention: "more than half correct." On a 5-letter
// line, that's >=3/5; on an 8-letter line, >=5/8. Used by getBestVA() and
// the auto-advance trigger in toggleLetter().
function VA_lineIsPassed(correct, total) {
  if (total <= 0) return false;
  return correct > total / 2;
}

// Severity band derivation for the Patient Classification banner.
// Hodapp/AAO-style clinical convention applied to distance VA:
//   20/20 or better→normal·20/25–20/40→mild·20/50–20/100→moderate·20/200↓→significant
function VA_getInterp(bestSnellen) {
  if (!bestSnellen || bestSnellen === '—') return { band:'unscored', tint:'#9ca3af', bg:'#f9fafb', border:'#e5e7eb', text:'No data recorded.' };
  const denom = parseFloat(String(bestSnellen).split('/')[1]);
  if (!isFinite(denom)) return { band:'unscored', tint:'#9ca3af', bg:'#f9fafb', border:'#e5e7eb', text:'No data recorded.' };
  if (denom <= 20)  return { band:'normal',      tint:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', text:'Visual acuity within normal limits (20/20 or better). No reduction detected.' };
  if (denom <= 40)  return { band:'mild',        tint:'#d97706', bg:'#fffbeb', border:'#fde68a', text:'Mild reduction in distance visual acuity. Consider refractive correction; if best-corrected, monitor.' };
  if (denom <= 100) return { band:'moderate',    tint:'#ea580c', bg:'#fff7ed', border:'#fed7aa', text:'Moderate reduction in visual acuity. Refractive correction, comprehensive ocular health evaluation, and patient counselling recommended.' };
  return                  { band:'significant', tint:'#dc2626', bg:'#fef2f2', border:'#fecaca', text:'Significant reduction in visual acuity (20/200 or worse). Comprehensive ocular and neurological evaluation indicated.' };
}

function randomLetters(count) {
  return [...VA_LETTER_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}
function randomNumbers(count) {
  return Array.from({ length: count }, () => VA_NUMBER_POOL[Math.floor(Math.random() * VA_NUMBER_POOL.length)]);
}

// ── Design tokens ──
const C = {
  navy:      '#0e2f5e',
  text:      '#111827',
  text2:     '#374151',
  muted:     '#9ca3af',
  surface:   '#f9fafb',
  card:      '#ffffff',
  border:    '#e5e7eb',
  success:   '#10b981',
  error:     '#ef4444',
  warnBg:    '#eff6ff',
  warnBd:    '#bfdbfe',
  warnTx:    '#1d4ed8',
};
const FS = {
  xs:   'clamp(9px, 1.1vw, 11px)',
  sm:   'clamp(11px, 1.3vw, 13px)',
  base: 'clamp(13px, 1.5vw, 15px)',
  md:   'clamp(15px, 1.8vw, 18px)',
  lg:   'clamp(18px, 2.2vw, 24px)',
  xl:   'clamp(22px, 2.8vw, 32px)',
};
const FONT = "'Nunito Sans', sans-serif";

// All-caps clinical violator style
const violator = {
  fontSize: FS.xs,
  fontWeight: 700,
  color: C.muted,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

// Title-case report section header style — used for formal report headers only
const reportLabel = {
  fontSize: FS.xs,
  fontWeight: 700,
  color: C.muted,
  letterSpacing: '0.06em',
  marginBottom: 14,
  // No textTransform — title case is set by the string itself
};

// ── Small inline icons ──
const Icon = {
  back:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  eyeBoth:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><ellipse cx="7" cy="12" rx="3.2" ry="4"/><ellipse cx="17" cy="12" rx="3.2" ry="4"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/><circle cx="17" cy="12" r="1.2" fill="currentColor"/></svg>,
  eyeOne:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 8C8 8 5 10.5 3 12C5 13.5 8 16 12 16C16 16 19 13.5 21 12C19 10.5 16 8 12 8Z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>,
  refresh:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>,
  chev:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  check:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  x:         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  warn:      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  download:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  compare:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  arrow:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
};

// ── Optotype renderer ──
// Proper geometric optotypes for the non-letter chart types, so the patient
// identifies an ORIENTATION rather than naming a glyph (used for children,
// non-literate, and non-Latin-script patients):
//   kind 'E' — Snellen "tumbling E": one symbol (3 bars + spine on a 5×5 grid),
//              rotated to 0/90/180/270. It is always the same letter E — never
//              a mix of glyphs (the prior build rotated a font glyph, which read
//              as a generic chart; this draws the true optotype).
//   kind 'C' — Landolt C: a ring with a 1-unit gap; the patient reports which
//              way the gap points. Standard acuity optotype alongside the E.
// Rotation 0 = E legs / C gap point to the right; +90 increments rotate clockwise.
function VA_Optotype({ kind, size, rotation = 0, color }) {
  const rot = { transform: `rotate(${rotation}deg)`, display: 'block' };
  if (kind === 'C') {
    const cx = 2.5, cy = 2.5, R = 2.1, r = 1.15, gap = 42;
    const a0 = (gap / 2) * Math.PI / 180, a1 = (360 - gap / 2) * Math.PI / 180;
    const pt = (a, rad) => `${(cx + rad * Math.cos(a)).toFixed(3)} ${(cy + rad * Math.sin(a)).toFixed(3)}`;
    const d = `M ${pt(a0, R)} A ${R} ${R} 0 1 1 ${pt(a1, R)} L ${pt(a1, r)} A ${r} ${r} 0 1 0 ${pt(a0, r)} Z`;
    return <svg width={size} height={size} viewBox="0 0 5 5" style={rot}><path d={d} fill={color}/></svg>;
  }
  // Snellen E (default)
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

function VisualAcuityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── Phase & view state ──
  const [phase, setPhase] = React.useState('ready');
  const [eyeMode, setEyeMode] = React.useState('both');
  const [viewMode, setViewMode] = React.useState('individual');

  // ── Ready phase setup state ──
  const [chartType, setChartType] = React.useState('snellen'); // 'snellen' | 'numbers' | 'tumblingE' | 'tumblingC'
  const [startLine, setStartLine] = React.useState(5);

  // Tumbling E rotations, keyed by `${lineN}_${idx}`
  const [eRotations, setERotations] = React.useState({});
  const generateERotations = (lineN, count) => {
    const newRots = {};
    for (let i = 0; i < count; i++) {
      newRots[`${lineN}_${i}`] = VA_E_ROTATIONS[Math.floor(Math.random() * 4)];
    }
    return newRots;
  };

  // ── Chart lines (randomizable) ──
  const [chartLines, setChartLines] = React.useState(VA_LINES.map(l => ({ ...l, letters: [...l.letters] })));

  // ── Results: keyed by `${eyeMode}_${lineN}` ──
  const [results, setResults] = React.useState({});

  // ── Expanded lines ──
  const [expanded, setExpanded] = React.useState(new Set([5]));

  // ── Auto-progression toast ──
  const [advancingTo, setAdvancingTo] = React.useState(null);

  // ── Session notes ──
  const [notes, setNotes] = React.useState('');

  // ── Prescription ──
  const RX_DEFAULT = {
    OD: { sph: -2.00, cyl: -0.75, axis: 90 },
    OS: { sph: -2.25, cyl: -0.25, axis: 180 },
  };
  const [rx, setRx] = React.useState(RX_DEFAULT);
  const rxAdjusted = React.useMemo(() => {
    return ['OD','OS'].some(e =>
      rx[e].sph !== RX_DEFAULT[e].sph ||
      rx[e].cyl !== RX_DEFAULT[e].cyl ||
      rx[e].axis !== RX_DEFAULT[e].axis
    );
  }, [rx]);

  // ── Timer ──
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Result helpers ──
  const key = (lineN) => `${eyeMode}_${lineN}`;

  const getLineResults = (lineN) => {
    const line = chartLines.find(l => l.n === lineN);
    return results[key(lineN)] || Array(line.letters.length).fill(null);
  };

  const getScore = (lineN, forEyeMode) => {
    const em = forEyeMode || eyeMode;
    const k = `${em}_${lineN}`;
    const line = chartLines.find(l => l.n === lineN);
    const res = results[k] || [];
    const correct = res.filter(r => r === 'correct').length;
    const total = line.letters.length;
    return { correct, total, pct: total > 0 ? Math.round(correct / total * 100) : 0 };
  };

  const getBestVA = (em) => {
    for (let i = chartLines.length; i >= 1; i--) {
      const s = getScore(i, em);
      // v0.2.3: replaced arbitrary >=65% threshold with clinical convention
      // (more than half correct).
      if (s.correct > 0 && VA_lineIsPassed(s.correct, s.total)) return chartLines[i - 1].va;
    }
    return '—';
  };

  // ── Toggle letter: null → correct → incorrect → null ──
  const toggleLetter = (lineN, idx) => {
    const prev = getLineResults(lineN);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    setResults(r => ({ ...r, [key(lineN)]: next }));
    const allMarked = next.every(r => r !== null);
    const correct = next.filter(r => r === 'correct').length;
    const pct = Math.round(correct / next.length * 100);
    if (allMarked && VA_lineIsPassed(correct, next.length)) {
      const nextLine = lineN + 1;
      if (nextLine <= 10) {
        setAdvancingTo(nextLine);
        setTimeout(() => { setExpanded(new Set([nextLine])); setAdvancingTo(null); }, 500);
      }
    }
  };

  const markAll = (lineN, val) => {
    const line = chartLines.find(l => l.n === lineN);
    const next = Array(line.letters.length).fill(val);
    setResults(r => ({ ...r, [key(lineN)]: next }));
    if (val === 'correct') {
      const nextLine = lineN + 1;
      if (nextLine <= 10) {
        setAdvancingTo(nextLine);
        setTimeout(() => { setExpanded(new Set([nextLine])); setAdvancingTo(null); }, 500);
      }
    }
  };

  const regenerate = (lineN) => {
    const line = chartLines.find(l => l.n === lineN);
    const newLetters = chartType === 'numbers'
      ? randomNumbers(line.letters.length)
      : randomLetters(line.letters.length);
    setChartLines(prev => prev.map(l => l.n === lineN ? { ...l, letters: newLetters } : l));
    setResults(r => { const nr = { ...r }; delete nr[key(lineN)]; return nr; });
    setERotations(prev => ({ ...prev, ...generateERotations(lineN, line.letters.length) }));
  };

  // Regenerate chartLines content when chartType changes
  React.useEffect(() => {
    if (chartType === 'numbers') {
      setChartLines(VA_LINES.map(l => ({
        ...l,
        letters: randomNumbers(l.letters.length),
      })));
    } else if (chartType === 'snellen') {
      setChartLines(VA_LINES.map(l => ({ ...l, letters: [...l.letters] })));
    }
    // tumblingE keeps existing letters; display layer overrides to 'E'
  }, [chartType]);

  const toggleExpanded = (lineN) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(lineN)) next.delete(lineN); else next.add(lineN);
      return next;
    });
  };

  const adjustRx = (eye, field, delta) => {
    setRx(prev => {
      const val = prev[eye][field] + delta;
      let clamped = val;
      if (field === 'axis') clamped = ((val % 181) + 181) % 181;
      return { ...prev, [eye]: { ...prev[eye], [field]: parseFloat(clamped.toFixed(field === 'axis' ? 0 : 2)) } };
    });
  };

  const resetTest = () => {
    setPhase('ready');
    setResults({});
    setElapsed(0);
    setExpanded(new Set([startLine]));
    setNotes('');
    setERotations({});
    setChartLines(VA_LINES.map(l => ({ ...l, letters: [...l.letters] })));
    setChartType('snellen');
  };

  const startTest = () => {
    const allRots = {};
    VA_LINES.forEach(line => {
      Object.assign(allRots, generateERotations(line.n, line.letters.length));
    });
    setERotations(allRots);
    setExpanded(new Set([startLine]));
    setPhase('testing');
  };

  // ── Format helpers ──
  const fmtSph = (v) => v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
  const fmtCyl = (v) => v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);

  // ── Eye mode label helpers ──
  const eyeFull = { both: 'OU (binocular)', right: 'OD (right eye)', left: 'OS (left eye)' };
  const eyeShort = { both: 'OU', right: 'OD', left: 'OS' };

  // ────────────────────────────────────────────
  // SUBCOMPONENTS
  // ────────────────────────────────────────────

  const SnellenPreview = () => {
    const previewLines = VA_LINES.slice(0, 8);
    const labelMap = { snellen: 'Snellen reference', numbers: 'Numbers reference', tumblingE: 'Tumbling E reference', tumblingC: 'Tumbling C reference' };
    // Deterministic preview content per chart type
    const previewContent = (line) => {
      if (chartType === 'numbers') {
        return line.letters.map((_, i) => VA_NUMBER_POOL[(line.n * 3 + i) % VA_NUMBER_POOL.length]);
      }
      return line.letters;
    };
    return (
      <div style={{ background: '#fff', borderRight: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 20, left: 24, ...violator }}>{labelMap[chartType]}</div>
        <div style={{ position: 'absolute', top: 20, right: 24, ...violator, color: '#cbd5e1' }}>20 ft · 6 m</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: '#cbd5e1' }}>
          {previewLines.map(line => {
            const content = previewContent(line);
            return (
              <div key={line.n} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#cbd5e1', minWidth: 40, textAlign: 'right', letterSpacing: '0.05em' }}>{line.va}</span>
                <div style={{ display: 'flex', gap: Math.max(20 - line.letters.length * 1.5, 8), alignItems: 'flex-end' }}>
                  {content.map((l, i) => {
                    const isOpto = chartType === 'tumblingE' || chartType === 'tumblingC';
                    const optoKind = chartType === 'tumblingC' ? 'C' : 'E';
                    const rot = isOpto ? VA_E_ROTATIONS[(line.n * 7 + i * 3) % 4] : 0;
                    return isOpto ? (
                      <VA_Optotype key={i} kind={optoKind} size={Math.min(line.fs * 0.55, 92)} rotation={rot} color="#cbd5e1"/>
                    ) : (
                      <span key={i} style={{ fontSize: Math.min(line.fs * 0.55, 92), fontFamily: FONT, fontWeight: 700, color: '#cbd5e1', lineHeight: 1, display: 'inline-block' }}>{l}</span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SegmentedEye = ({ value, onChange, vertical }) => {
    const opts = [
      { v: 'right', short: 'OD', long: 'Right' },
      { v: 'left',  short: 'OS', long: 'Left'  },
      { v: 'both',  short: 'OU', long: 'Both'  },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {opts.map(o => {
          const active = value === o.v;
          return (
            <button key={o.v} onClick={() => onChange(o.v)} style={{
              minHeight: 60, padding: '10px 8px', borderRadius: 12,
              border: active ? `1.5px solid ${accent}` : `1.5px solid ${C.border}`,
              background: active ? `${accent}10` : '#fff',
              color: active ? accent : C.text2,
              cursor: 'pointer', fontFamily: FONT, fontWeight: 700,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}>{o.short}</span>
              <span style={{ fontSize: 10, fontWeight: 400, color: active ? accent : C.muted }}>{o.long}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const RxStepper = ({ eye, field, step, label }) => {
    const val = rx[eye][field];
    const display = field === 'axis' ? `${val}°` : (field === 'sph' ? fmtSph(val) : fmtCyl(val));
    const btnStyle = {
      width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border}`,
      background: '#fff', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700, color: C.text2, fontFamily: FONT, lineHeight: 1,
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={violator}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={btnStyle} onClick={() => adjustRx(eye, field, -step)}>−</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: C.text, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.surface, fontVariantNumeric: 'tabular-nums' }}>
            {display}
          </div>
          <button style={btnStyle} onClick={() => adjustRx(eye, field, step)}>+</button>
        </div>
      </div>
    );
  };

  const PrescriptionPanel = ({ lineN }) => {
    const eyes = eyeMode === 'both' ? ['OD', 'OS'] : eyeMode === 'right' ? ['OD'] : ['OS'];
    return (
      <div style={{ marginTop: 20, borderRadius: 12, background: C.warnBg, border: `1.5px solid ${C.warnBd}`, borderLeft: `4px solid ${C.warnBd}`, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.warnBd}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.warnTx, marginBottom: 2 }}>Prescription adjustment</div>
          <div style={{ fontSize: 11, fontWeight: 400, color: C.warnTx, opacity: 0.75 }}>Line scored below 65%. Refine the Rx and re-test.</div>
        </div>
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: eyes.map(() => '1fr').join(' '), gap: 24 }}>
          {eyes.map(eye => (
            <div key={eye}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.warnTx, marginBottom: 10, letterSpacing: '0.04em' }}>
                {eye} <span style={{ fontWeight: 400, opacity: 0.7 }}>· {eye === 'OD' ? 'right eye' : 'left eye'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <RxStepper eye={eye} field="sph"  step={0.25} label="SPH"/>
                <RxStepper eye={eye} field="cyl"  step={0.25} label="CYL"/>
                <RxStepper eye={eye} field="axis" step={1}    label="AXIS"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════
  // READY PHASE
  // ════════════════════════════════════════════
  const renderReady = () => (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 460px', overflow: 'hidden' }}>
      <SnellenPreview/>
      <div style={{ background: C.surface, padding: '36px 36px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...violator, marginBottom: 6 }}>Examination · pre-flight</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: '0 0 10px', lineHeight: 1.15 }}>Visual acuity test</h1>
        <p style={{ fontSize: 13, fontWeight: 400, color: C.text2, margin: '0 0 26px', lineHeight: 1.6 }}>
          Measures the sharpness and clarity of vision at near and distance for each eye. Configure the parameters below before beginning.
        </p>

        {/* Eye selection */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Eye selection</span>
            <span style={{ fontSize: 11, color: C.muted }}>{eyeFull[eyeMode]}</span>
          </div>
          <SegmentedEye value={eyeMode} onChange={setEyeMode}/>
        </div>

        {/* Chart type */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Chart type</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { v: 'snellen',   label: 'Snellen letters', sub: 'Standard A–Z' },
              { v: 'numbers',   label: 'Numbers',         sub: '1–9' },
              { v: 'tumblingE', label: 'Tumbling E',      sub: 'Orientation · 4-way' },
              { v: 'tumblingC', label: 'Tumbling C',      sub: 'Landolt gap · 4-way' },
            ].map(opt => {
              const active = chartType === opt.v;
              return (
                <button key={opt.v} onClick={() => setChartType(opt.v)} style={{
                  minHeight: 60, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                  border: active ? `1.5px solid ${accent}` : `1.5px solid ${C.border}`,
                  background: active ? `${accent}10` : '#fff',
                  fontFamily: FONT, display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start', justifyContent: 'center', gap: 2, transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? accent : C.text }}>{opt.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 400, color: active ? accent : C.muted }}>{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Starting line */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Starting line</span>
            <span style={{ fontSize: 11, color: C.muted }}>Auto-progresses on pass</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
            <button onClick={() => setStartLine(l => Math.max(1, l - 1))} style={{
              width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface,
              cursor: 'pointer', fontSize: 22, fontWeight: 700, color: C.text2, lineHeight: 1, fontFamily: FONT,
            }}>−</button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>Start at line</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {startLine} <span style={{ color: accent, fontSize: 16 }}>· {VA_LINES[startLine - 1].va}</span>
              </div>
            </div>
            <button onClick={() => setStartLine(l => Math.min(10, l + 1))} style={{
              width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface,
              cursor: 'pointer', fontSize: 22, fontWeight: 700, color: C.text2, lineHeight: 1, fontFamily: FONT,
            }}>+</button>
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <button onClick={startTest} style={{
          padding: '14px 24px', borderRadius: 12, border: 'none',
          background: `linear-gradient(135deg, ${accent}, #155bcc)`,
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          minHeight: 52, boxShadow: `0 6px 20px ${accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Begin test {Icon.arrow}
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // TESTING — INDIVIDUAL LINE CARDS
  // ════════════════════════════════════════════
  const LineCard = ({ line }) => {
    const lineRes = getLineResults(line.n);
    const allMarked = lineRes.length === line.letters.length && lineRes.every(r => r !== null);
    const score = getScore(line.n);
    const hasAny = lineRes.some(r => r !== null);
    const isExpanded = expanded.has(line.n);
    const showRxPanel = allMarked && score.pct < 65;
    const passed = allMarked && score.pct >= 65;

    return (
      <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
        {/* Header */}
        <div onClick={() => toggleExpanded(line.n)} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          cursor: 'pointer', minHeight: 56, background: '#fff',
          borderBottom: isExpanded ? `1px solid ${C.border}` : 'none',
        }}>
          <div style={{ minWidth: 70, fontSize: 14, fontWeight: 700, color: C.text }}>Line {line.n}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', minWidth: 70 }}>{line.va}</div>
          {hasAny && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 12,
              background: score.pct >= 65 ? `${C.success}18` : `${C.error}18`,
              color: score.pct >= 65 ? C.success : C.error,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: score.pct >= 65 ? C.success : C.error }}/>
              {score.correct}/{score.total} · {score.pct}% {passed ? '· pass' : allMarked ? '· fail' : ''}
            </span>
          )}
          <div style={{ flex: 1 }}/>
          <button title="Randomize letters" onClick={e => { e.stopPropagation(); regenerate(line.n); }} style={{
            width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
          }}>{Icon.refresh}</button>
          <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{Icon.chev}</div>
        </div>

        {/* Body */}
        {isExpanded && (
          <div style={{ padding: '24px 22px 22px' }}>
            {/* Letters */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: Math.max(40 - line.letters.length * 2, 14), flexWrap: 'wrap', marginBottom: 18,
            }}>
              {line.letters.map((letter, idx) => {
                const res = lineRes[idx];
                const bg = res === 'correct' ? C.success : res === 'incorrect' ? C.error : '#fff';
                const fg = res === null ? C.navy : '#fff';
                const isOpto = chartType === 'tumblingE' || chartType === 'tumblingC';
                const optoKind = chartType === 'tumblingC' ? 'C' : 'E';
                const rotation = isOpto ? (eRotations[`${line.n}_${idx}`] || 0) : 0;
                return (
                  <button key={idx} onClick={() => toggleLetter(line.n, idx)} style={{
                    minWidth: 64, minHeight: 64, padding: '10px 14px',
                    borderRadius: 14, cursor: 'pointer',
                    border: res === null ? `1.5px solid ${C.border}` : `1.5px solid ${bg}`,
                    background: bg, transition: 'all 0.15s', fontFamily: FONT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isOpto ? (
                      <VA_Optotype kind={optoKind} size={Math.min(line.fs, 84)} rotation={rotation} color={fg}/>
                    ) : (
                      <span style={{
                        fontSize: Math.min(line.fs, 84), fontWeight: 700, color: fg,
                        lineHeight: 1, userSelect: 'none',
                        textDecoration: res === 'incorrect' ? 'line-through' : 'none',
                        textDecorationThickness: 3,
                        display: 'inline-block',
                      }}>{letter}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action row + score bar */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => markAll(line.n, 'correct')} style={{
                minHeight: 44, padding: '10px 16px', borderRadius: 10,
                border: `1.5px solid ${C.success}`, background: '#f0fdf4',
                color: C.success, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>{Icon.check} Mark all correct</button>
              <button onClick={() => markAll(line.n, 'incorrect')} style={{
                minHeight: 44, padding: '10px 16px', borderRadius: 10,
                border: `1.5px solid ${C.error}`, background: '#fef2f2',
                color: C.error, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>{Icon.x} Mark all incorrect</button>
              <div style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>Pass threshold: 65%</span>
            </div>

            {/* Score bar */}
            {allMarked && (
              <div style={{
                marginTop: 14, padding: '12px 16px', borderRadius: 10,
                background: passed ? `${C.success}10` : `${C.error}10`,
                border: `1.5px solid ${passed ? C.success : C.error}40`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: passed ? C.success : C.error }}/>
                <div style={{ fontSize: 13, fontWeight: 700, color: passed ? C.success : C.error }}>
                  {score.correct}/{score.total} correct · {score.pct}% · {passed ? 'PASS' : 'FAIL'}
                </div>
                <div style={{ flex: 1 }}/>
                {advancingTo === line.n + 1 && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.success, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Advancing to line {line.n + 1} {Icon.arrow}
                  </div>
                )}
              </div>
            )}

            {/* Rx panel when failed */}
            {showRxPanel && <PrescriptionPanel lineN={line.n}/>}
          </div>
        )}
      </div>
    );
  };

  const renderIndividualLines = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {chartLines.map(line => <LineCard key={line.n} line={line}/>)}
    </div>
  );

  // ════════════════════════════════════════════
  // TESTING — FULL CHART VIEW
  // ════════════════════════════════════════════
  const renderFullChart = () => (
    <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={violator}>{chartType === 'tumblingE' ? 'Full tumbling E chart' : chartType === 'tumblingC' ? 'Full tumbling C chart' : chartType === 'numbers' ? 'Full numbers chart' : 'Full Snellen chart'}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 4 }}>{chartType === 'tumblingE' || chartType === 'tumblingC' ? 'Tap any symbol to mark' : 'Tap any letter to mark'}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>10 lines · {eyeFull[eyeMode]}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chartLines.map(line => {
          const lineRes = getLineResults(line.n);
          const score = getScore(line.n);
          const hasAny = lineRes.some(r => r !== null);
          return (
            <div key={line.n} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 90px', alignItems: 'center', gap: 16, padding: '6px 0', borderBottom: `1px dashed ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: accent, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{line.va}</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: Math.max(28 - line.letters.length * 1.5, 10) }}>
                {line.letters.map((letter, idx) => {
                  const res = lineRes[idx];
                  const isOpto = chartType === 'tumblingE' || chartType === 'tumblingC';
                  const optoKind = chartType === 'tumblingC' ? 'C' : 'E';
                  const rotation = isOpto ? (eRotations[`${line.n}_${idx}`] || 0) : 0;
                  const optoColor = res === 'correct' ? C.success : res === 'incorrect' ? C.error : C.text;
                  return (
                    <button key={idx} onClick={() => toggleLetter(line.n, idx)} style={{
                      fontSize: Math.min(line.fs, 70),
                      fontFamily: FONT, fontWeight: 700, lineHeight: 1,
                      color: res === 'correct' ? C.success : res === 'incorrect' ? C.error : C.text,
                      background: 'none', border: 'none', cursor: 'pointer',
                      textDecoration: res === 'incorrect' ? 'line-through' : 'none',
                      textDecorationThickness: 3,
                      padding: '4px 8px', minWidth: 44, minHeight: 44,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isOpto
                        ? <VA_Optotype kind={optoKind} size={Math.min(line.fs, 70)} rotation={rotation} color={optoColor}/>
                        : <span style={{ display: 'inline-block' }}>{letter}</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ textAlign: 'right' }}>
                {hasAny ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10,
                    background: score.pct >= 65 ? `${C.success}18` : `${C.error}18`,
                    color: score.pct >= 65 ? C.success : C.error,
                  }}>{score.pct}%</span>
                ) : <span style={{ fontSize: 10, color: C.muted }}>—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // TESTING — RIGHT SIDEBAR
  // ════════════════════════════════════════════
  const TestingSidebar = () => {
    const eyesShown = eyeMode === 'both' ? ['OD','OS'] : eyeMode === 'right' ? ['OD'] : ['OS'];
    const bestVA = getBestVA(eyeMode);
    const completedLines = chartLines.filter(l => {
      const r = results[`${eyeMode}_${l.n}`];
      return r && r.every(x => x !== null);
    }).length;
    return (
      <div style={{ width: 240, flexShrink: 0, background: C.card, borderLeft: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Current Rx */}
        <div style={{ padding: '18px 18px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...violator, marginBottom: 10 }}>Current Rx</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>
                <th style={{ ...violator, textAlign: 'left', fontSize: 9, paddingBottom: 6 }}>Eye</th>
                <th style={{ ...violator, textAlign: 'right', fontSize: 9, paddingBottom: 6 }}>SPH</th>
                <th style={{ ...violator, textAlign: 'right', fontSize: 9, paddingBottom: 6 }}>CYL</th>
                <th style={{ ...violator, textAlign: 'right', fontSize: 9, paddingBottom: 6 }}>AXIS</th>
              </tr>
            </thead>
            <tbody>
              {['OD','OS'].map(eye => (
                <tr key={eye}>
                  <td style={{ fontSize: 11, fontWeight: 700, color: C.text, padding: '4px 0' }}>{eye}</td>
                  <td style={{ fontSize: 11, fontWeight: 700, color: C.text2, textAlign: 'right' }}>{fmtSph(rx[eye].sph)}</td>
                  <td style={{ fontSize: 11, fontWeight: 700, color: C.text2, textAlign: 'right' }}>{fmtCyl(rx[eye].cyl)}</td>
                  <td style={{ fontSize: 11, fontWeight: 700, color: C.text2, textAlign: 'right' }}>{rx[eye].axis}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results so far */}
        <div style={{ padding: '18px 18px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...violator, marginBottom: 8 }}>Results so far</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Best VA · {eyeShort[eyeMode]}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: bestVA === '—' ? C.muted : C.navy, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 12 }}>{bestVA}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: C.muted }}>Lines completed</span>
            <span style={{ fontWeight: 700, color: C.text }}>{completedLines} / 10</span>
          </div>
          <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
            <div style={{ width: `${completedLines * 10}%`, height: '100%', background: accent, transition: 'width 0.25s' }}/>
          </div>
        </div>

        {/* Session notes */}
        <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...violator, marginBottom: 8 }}>Session notes</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observations, patient response, anomalies…"
            style={{
              flex: 1, minHeight: 90, resize: 'none',
              fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.text2,
              padding: '10px 12px', borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: C.surface,
              outline: 'none', lineHeight: 1.5,
            }}
          />
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════
  // REPORT PHASE
  // ════════════════════════════════════════════
  const renderReport = () => {
    const eyesToReport = eyeMode === 'both' ? ['right', 'left'] : [eyeMode];
    const now = new Date();
    const overallBestVA = getBestVA(eyeMode === 'both' ? 'both' : eyeMode);
    const acuityLabel = rxAdjusted ? 'BCVA' : 'UCVA';
    const acuityFull = rxAdjusted ? 'Best corrected visual acuity' : 'Uncorrected visual acuity';

    // Determine band for badge
    const vaToNum = (va) => {
      if (!va || va === '—') return 99999;
      const [, denom] = va.split('/').map(Number);
      return denom;
    };
    const vaNum = vaToNum(overallBestVA);
    let band, bandBg, bandFg;
    if (overallBestVA === '—') { band = 'Incomplete'; bandBg = '#f3f4f6'; bandFg = C.muted; }
    else if (vaNum <= 20) { band = 'Normal'; bandBg = '#dcfce7'; bandFg = C.success; }
    else if (vaNum >= 200) { band = 'Severely reduced'; bandBg = '#fee2e2'; bandFg = C.error; }
    else if (vaNum >= 40) { band = 'Reduced'; bandBg = '#fef3c7'; bandFg = '#b45309'; }
    else { band = 'Normal'; bandBg = '#dcfce7'; bandFg = C.success; }

    // Clinical interpretation copy
    let interp;
    if (overallBestVA === '—') interp = 'Insufficient data captured. Mark at least one line above the pass threshold to generate a clinical interpretation.';
    else if (vaNum <= 20) interp = `${overallBestVA} ${acuityLabel} is within normal limits — no significant refractive error detected at this acuity level.`;
    else if (vaNum >= 200) interp = `${overallBestVA} ${acuityLabel} indicates severely reduced acuity. Recommend referral and further diagnostic workup.`;
    else interp = `${overallBestVA} ${acuityLabel} suggests a meaningful refractive error that may benefit from further refinement or referral.`;

    return (
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>
        {/* Report header */}
        <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ ...violator, marginBottom: 6 }}>Test report · {acuityLabel}</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: '0 0 4px', lineHeight: 1.2 }}>Visual Acuity Test Report</h2>
              <div style={{ fontSize: 12, color: C.text2 }}>Marcus Williams · #4821-MW</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                minHeight: 44, padding: '10px 18px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${accent}, #155bcc)`, color: '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 3px 12px ${accent}40`,
              }}>{Icon.download} Export</button>
              <button style={{
                minHeight: 44, padding: '10px 16px', borderRadius: 9, border: `1.5px solid ${C.border}`,
                background: '#fff', color: C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>{Icon.compare} Compare</button>
              <button onClick={resetTest} style={{
                minHeight: 44, padding: '10px 16px', borderRadius: 9, border: 'none',
                background: 'transparent', color: C.text2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>New test</button>
            </div>
          </div>
        </div>

        {/* VA hero + interpretation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '22px 24px' }}>
            <div style={{ ...reportLabel, marginBottom: 8 }}>Final visual acuity</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.navy, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>{overallBestVA}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{acuityFull} ({acuityLabel}) — {eyeShort[eyeMode]}</div>
            <span style={{
              display: 'inline-block', padding: '5px 12px', borderRadius: 14,
              background: bandBg, color: bandFg, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.04em',
            }}>{band}</span>
          </div>
          <div style={{
            background: `${accent}0F`, borderRadius: 14,
            border: `1.5px solid ${accent}33`, padding: '22px 24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ ...reportLabel, color: accent, marginBottom: 8 }}>Clinical Interpretation</div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text, margin: 0, fontWeight: 400 }}>{interp}</p>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 12, fontStyle: 'italic' }}>Informational only — not a clinical diagnosis.</div>
          </div>
        </div>

        {/* Patient info */}
        <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '22px 24px' }}>
          <div style={reportLabel}>Patient Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {[['Name','Marcus Williams'],['Date of birth','10/11/1983'],['Patient ID','#4821-MW'],['Exam date', now.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})]].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 400, color: C.muted, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            {[['Start time', now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })],['Test duration', fmtTime(elapsed)],['Clinician', 'Dr. Smith'],['Chart type', chartType === 'snellen' ? 'Snellen letters' : chartType === 'numbers' ? 'Numbers (1–9)' : 'Tumbling E']].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 400, color: C.muted, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-eye results */}
        {eyesToReport.map(em => {
          const hasData = chartLines.some(l => {
            const k = `${em}_${l.n}`;
            return results[k] && results[k].some(r => r !== null);
          });
          if (!hasData) return null;
          const eyeLabel = em === 'right' ? 'OD · right eye' : em === 'left' ? 'OS · left eye' : 'OU · binocular';
          const bestVAEye = getBestVA(em);
          const bestLineN = chartLines.findIndex(l => l.va === bestVAEye) + 1;
          return (
            <div key={em} style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ ...reportLabel, marginBottom: 4 }}>Per-Eye Results</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{eyeLabel}</h3>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{bestVAEye}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
                    {VA_formatLogMAR(VA_snellenToLogMAR(bestVAEye))} <span style={{ color: '#9ca3af' }}>logMAR</span>
                  </div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                    {['Line','VA','Letters','Correct / total','Score','Result'].map(h => (
                      <th key={h} style={{ ...violator, textAlign: 'left', padding: '8px 10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartLines.map(line => {
                    const k = `${em}_${line.n}`;
                    const res = results[k];
                    if (!res || !res.some(r => r !== null)) return null;
                    const correct = res.filter(r => r === 'correct').length;
                    const pct = Math.round(correct / res.length * 100);
                    const passed = VA_lineIsPassed(correct, res.length);
                    const isBest = line.n === bestLineN;
                    return (
                      <tr key={line.n} style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: isBest ? `${accent}0C` : 'transparent',
                      }}>
                        <td style={{ padding: '10px 10px', fontSize: 13, color: C.text, fontWeight: 700 }}>{line.n}{isBest && <span style={{ marginLeft: 6, fontSize: 9, color: accent, fontWeight: 700, letterSpacing: '0.06em' }}>BEST</span>}</td>
                        <td style={{ padding: '10px 10px', fontSize: 13, color: C.text2, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{line.va}</td>
                        <td style={{ padding: '10px 10px', fontSize: 12, color: C.text2, letterSpacing: '0.1em', fontFamily: 'ui-monospace, Menlo, monospace' }}>{line.letters.join(' ')}</td>
                        <td style={{ padding: '10px 10px', fontSize: 12, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>{correct} / {res.length}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10,
                            background: passed ? `${C.success}18` : `${C.error}18`,
                            color: passed ? C.success : C.error,
                          }}>{pct}%</span>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                            color: passed ? C.success : C.error,
                          }}>{passed ? 'PASS' : 'FAIL'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Final Rx summary */}
        <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '22px 24px' }}>
          <div style={reportLabel}>Final Prescription Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {['OD','OS'].map(eye => (
              <div key={eye} style={{
                background: `${accent}10`, borderRadius: 12,
                border: `1.5px solid ${accent}30`, padding: '16px 18px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 12, letterSpacing: '0.04em' }}>
                  {eye} <span style={{ fontWeight: 400, opacity: 0.75 }}>· {eye === 'OD' ? 'right eye' : 'left eye'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Power (SPH)', fmtSph(rx[eye].sph)],
                    ['Cylinder (CYL)', fmtCyl(rx[eye].cyl)],
                    ['Axis', `${rx[eye].axis}°`],
                  ].map(([l,v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12, color: C.text2, fontWeight: 400 }}>{l}</span>
                      <span style={{ fontSize: 14, color: accent, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={resetTest} style={{
            minHeight: 44, padding: '11px 22px', borderRadius: 10,
            border: `1.5px solid ${C.border}`, background: '#fff',
            color: C.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          }}>New test</button>
          <button onClick={onBack} style={{
            minHeight: 44, padding: '11px 24px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${accent}, #155bcc)`,
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            boxShadow: `0 4px 14px ${accent}40`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>{Icon.check} Certify &amp; close</button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════
  // TESTING SUB-BAR — eye mode + view toggle
  // Lives at the top of the testing-phase content area, sticky on scroll.
  // Replaces the previous internal header (which is now ExamShell).
  // ════════════════════════════════════════════
  const TestingSubBar = () => (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: '#fff', borderBottom: `1px solid ${C.border}`,
      padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 14,
      minHeight: 56,
    }}>
      {/* Eye mode segmented control */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
        {[
          { v: 'right', label: 'OD', sub: 'right' },
          { v: 'left',  label: 'OS', sub: 'left'  },
          { v: 'both',  label: 'OU', sub: 'both'  },
        ].map(o => {
          const active = eyeMode === o.v;
          return (
            <button key={o.v} onClick={() => setEyeMode(o.v)} style={{
              minHeight: 38, padding: '6px 14px', borderRadius: 8, border: 'none',
              background: active ? '#fff' : 'transparent',
              color: active ? accent : C.muted,
              cursor: 'pointer', fontFamily: FONT, fontWeight: 700,
              fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {o.v === 'both' ? Icon.eyeBoth : Icon.eyeOne}
              </span>
              <span>{o.label}</span>
              <span style={{ fontSize: 10, fontWeight: 400, color: active ? accent : C.muted, opacity: 0.7 }}>· {o.sub}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }}/>

      {/* View toggle */}
      <div style={{ display: 'flex', background: C.surface, borderRadius: 10, padding: 3, gap: 2, border: `1px solid ${C.border}` }}>
        {[['individual','Line by line'],['fullChart','Full chart']].map(([val,label]) => (
          <button key={val} onClick={() => setViewMode(val)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: viewMode === val ? '#fff' : 'transparent',
            color: viewMode === val ? C.text : C.muted,
            fontSize: 11, fontWeight: 700, fontFamily: FONT, minHeight: 34,
            boxShadow: viewMode === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // MAIN — mounted inside the canonical ExamShell wrapper.
  // ExamShell owns: back arrow (hidden during testing), title strip, timer, Cancel test button + confirm dialog, Finish & Report button.
  // VA test owns: ready-phase layout, testing-phase sub-bar + chart content, report layout, right-side TestingSidebar.
  // ════════════════════════════════════════════
  return (
    <ExamShell
      title="Visual Acuity"
      accent={accent}
      onBack={onBack}
      patientName="Marcus Williams"
      patientId="#4821-MW"
      phase={phase}
      elapsed={elapsed}
      onFinish={() => setPhase('report')}
      rightPanel={phase === 'testing' ? <TestingSidebar/> : null}
    >
      {phase === 'ready' && renderReady()}
      {phase === 'testing' && (
        <React.Fragment>
          <TestingSubBar/>
          <div style={{ padding: '18px 22px 22px' }}>
            {viewMode === 'individual' ? renderIndividualLines() : renderFullChart()}
          </div>
        </React.Fragment>
      )}
      {phase === 'report' && (
        <div style={{ padding: 24 }}>
          {renderReport()}
        </div>
      )}

      <style>{`
        @keyframes va-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
        textarea::-webkit-scrollbar, *::-webkit-scrollbar { width: 5px; height: 5px; }
        *::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        *::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </ExamShell>
  );
}

Object.assign(window, { VisualAcuityTest });
