// VisualAcuityTest.jsx — Full feature parity with local reference (Figma Make version)
// Features: individual line + full chart views, per-eye results, prescription panel,
//           auto-progression, mark all, regenerate, detailed report

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

function randomLetters(count) {
  return [...VA_LETTER_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}

function VisualAcuityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── Phase & view state ──
  const [phase, setPhase] = React.useState('ready'); // ready | testing | report
  const [eyeMode, setEyeMode] = React.useState('both'); // both | right | left
  const [viewMode, setViewMode] = React.useState('individual'); // individual | fullChart
  const [showCancel, setShowCancel] = React.useState(false);

  // ── Chart lines (randomizable) ──
  const [chartLines, setChartLines] = React.useState(VA_LINES.map(l => ({ ...l, letters: [...l.letters] })));

  // ── Results: keyed by `${eyeMode}_${lineN}` ──
  const [results, setResults] = React.useState({});

  // ── Expanded lines ──
  const [expanded, setExpanded] = React.useState(new Set([5]));

  // ── Prescription ──
  const [rx, setRx] = React.useState({
    OD: { sph: -2.00, cyl: -0.75, axis: 90 },
    OS: { sph: -2.25, cyl: -0.25, axis: 180 },
  });

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
      if (s.correct > 0 && s.pct >= 65) return chartLines[i - 1].va;
    }
    return '—';
  };

  // ── Toggle letter: null → correct → incorrect → null ──
  const toggleLetter = (lineN, idx) => {
    const prev = getLineResults(lineN);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    const newResults = { ...results, [key(lineN)]: next };
    setResults(newResults);
    // Check auto-progression
    const allMarked = next.every(r => r !== null);
    const correct = next.filter(r => r === 'correct').length;
    const pct = Math.round(correct / next.length * 100);
    if (allMarked && pct >= 65) {
      const nextLine = lineN + 1;
      if (nextLine <= 10) {
        setTimeout(() => setExpanded(new Set([nextLine])), 500);
      }
    }
  };

  const markAll = (lineN, val) => {
    const line = chartLines.find(l => l.n === lineN);
    const next = Array(line.letters.length).fill(val);
    setResults(r => ({ ...r, [key(lineN)]: next }));
    if (val === 'correct') {
      const nextLine = lineN + 1;
      if (nextLine <= 10) setTimeout(() => setExpanded(new Set([nextLine])), 500);
    }
  };

  const regenerate = (lineN) => {
    const line = chartLines.find(l => l.n === lineN);
    const newLetters = randomLetters(line.letters.length);
    setChartLines(prev => prev.map(l => l.n === lineN ? { ...l, letters: newLetters } : l));
    setResults(r => { const nr = { ...r }; delete nr[key(lineN)]; return nr; });
  };

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
    setExpanded(new Set([5]));
    setChartLines(VA_LINES.map(l => ({ ...l, letters: [...l.letters] })));
  };

  // ── Eye mode icon ──
  const EyeIcon = ({ mode }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {mode === 'both'
        ? <><ellipse cx="7" cy="12" rx="3" ry="4"/><ellipse cx="17" cy="12" rx="3" ry="4"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/><circle cx="17" cy="12" r="1.2" fill="currentColor"/></>
        : <><path d="M12 8C8 8 5 10.5 3 12C5 13.5 8 16 12 16C16 16 19 13.5 21 12C19 10.5 16 8 12 8Z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></>
      }
    </svg>
  );

  // ── Prescription stepper ──
  const RxStepper = ({ eye, field, step, label }) => {
    const val = rx[eye][field];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => adjustRx(eye, field, -step)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#374151' }}>−</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 44, padding: '3px 0', borderRadius: 5, border: '1px solid #e5e7eb', background: '#fff' }}>
            {field === 'axis' ? `${val}°` : (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2))}
          </div>
          <button onClick={() => adjustRx(eye, field, step)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#374151' }}>+</button>
        </div>
      </div>
    );
  };

  // ── Prescription panel (shown when line score <60% and all marked) ──
  const PrescriptionPanel = ({ lineN }) => {
    const eyes = eyeMode === 'both' ? ['OD', 'OS'] : eyeMode === 'right' ? ['OD'] : ['OS'];
    return (
      <div style={{ marginTop: 16, padding: 16, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 12 }}>Prescription Adjustment</div>
        <div style={{ display: 'grid', gridTemplateColumns: eyes.map(() => '1fr').join(' '), gap: 20 }}>
          {eyes.map(eye => (
            <div key={eye}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 10 }}>{eye} ({eye === 'OD' ? 'Right' : 'Left'} Eye)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <RxStepper eye={eye} field="sph" step={0.25} label="SPH"/>
                <RxStepper eye={eye} field="cyl" step={0.25} label="CYL"/>
                <RxStepper eye={eye} field="axis" step={1} label="AXIS"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════
  // RENDER: READY PHASE
  // ══════════════════════════════════════════════
  const renderReady = () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: accent }}>
          <EyeIcon mode="both"/>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Visual Acuity Test</h2>
        <p style={{ fontSize: 13, fontWeight: 300, color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px' }}>
          This test measures the sharpness of vision using a Snellen chart. Select the eye(s) to test and click Start Test to begin.
        </p>
        <button onClick={() => setPhase('testing')} style={{ padding: '13px 40px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accent}, #155bcc)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", boxShadow: `0 4px 16px ${accent}40` }}>
          START TEST
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER: TESTING PHASE — INDIVIDUAL LINES VIEW
  // ══════════════════════════════════════════════
  const renderIndividualLines = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {chartLines.map(line => {
        const lineRes = getLineResults(line.n);
        const allMarked = lineRes.length === line.letters.length && lineRes.every(r => r !== null);
        const score = getScore(line.n);
        const hasAny = lineRes.some(r => r !== null);
        const isExpanded = expanded.has(line.n);
        const showRxPanel = allMarked && score.pct < 60;

        return (
          <div key={line.n} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
            {/* Line header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none', cursor: 'pointer' }} onClick={() => toggleExpanded(line.n)}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 56 }}>Line {line.n}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', minWidth: 54 }}>{line.va}</div>
              {hasAny && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: score.pct >= 65 ? '#10b98118' : '#ef444418', color: score.pct >= 65 ? '#10b981' : '#ef4444' }}>
                  {score.pct}%
                </span>
              )}
              <div style={{ flex: 1 }}/>
              {/* Regenerate */}
              <button onClick={e => { e.stopPropagation(); regenerate(line.n); }} title="Randomize letters" style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
              </button>
              {isExpanded && <>
                <button onClick={e => { e.stopPropagation(); markAll(line.n, 'correct'); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#f0fdf4', color: '#10b981', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  All Correct
                </button>
                <button onClick={e => { e.stopPropagation(); markAll(line.n, 'incorrect'); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  All Incorrect
                </button>
              </>}
              {/* Chevron */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: '24px 20px' }}>
                {/* Letters with checkboxes */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: Math.max(40 - line.letters.length * 2, 12), flexWrap: 'wrap', marginBottom: 8 }}>
                  {line.letters.map((letter, idx) => {
                    const res = lineRes[idx];
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        {/* Letter */}
                        <div style={{ fontSize: Math.min(line.fs, 96), fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, color: '#111827', lineHeight: 1, userSelect: 'none' }}>
                          {letter}
                        </div>
                        {/* Checkbox */}
                        <button onClick={() => toggleLetter(line.n, idx)} style={{
                          width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
                          border: `2px solid ${res === 'correct' ? '#10b981' : res === 'incorrect' ? '#ef4444' : '#d1d5db'}`,
                          background: res === 'correct' ? '#10b981' : res === 'incorrect' ? '#fff' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                        }}>
                          {res === 'correct' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                          {res === 'incorrect' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {/* Prescription panel */}
                {showRxPanel && <PrescriptionPanel lineN={line.n}/>}
              </div>
            )}
          </div>
        );
      })}

      {/* View Report */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, paddingBottom: 24 }}>
        <button onClick={() => setPhase('report')} style={{ padding: '12px 40px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accent}, #155bcc)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", boxShadow: `0 4px 16px ${accent}35` }}>
          VIEW REPORT
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER: TESTING PHASE — FULL CHART VIEW
  // ══════════════════════════════════════════════
  const renderFullChart = () => (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {chartLines.map(line => {
          const lineRes = getLineResults(line.n);
          return (
            <div key={line.n} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', minWidth: 60 }}>{line.va}</span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>Line {line.n}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                {line.letters.map((letter, idx) => {
                  const res = lineRes[idx];
                  return (
                    <button key={idx} onClick={() => toggleLetter(line.n, idx)} style={{
                      fontSize: Math.min(line.fs, 72),
                      fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, lineHeight: 1,
                      color: res === 'correct' ? '#10b981' : res === 'incorrect' ? '#ef4444' : '#111827',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textDecoration: res === 'incorrect' ? 'line-through' : 'none',
                      padding: '4px 8px', borderRadius: 6,
                      outline: res ? `2px solid ${res === 'correct' ? '#10b981' : '#ef4444'}` : 'none',
                      transition: 'all 0.15s'
                    }}>{letter}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setPhase('report')} style={{ padding: '12px 40px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accent}, #155bcc)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
          GENERATE REPORT
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER: REPORT PHASE
  // ══════════════════════════════════════════════
  const renderReport = () => {
    const eyesToReport = eyeMode === 'both' ? ['right', 'left'] : [eyeMode === 'right' ? 'right' : 'left'];
    const eyeCodeMap = { right: 'OD (Right Eye)', left: 'OS (Left Eye)', both: 'OU (Both Eyes)' };
    const now = new Date();

    return (
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
        {/* Report header */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Visual Acuity Test Report</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${accent}`, background: `${accent}10`, color: accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>EXPORT</button>
              <button style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${accent}`, background: `${accent}10`, color: accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>COMPARE</button>
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[['Patient Name','Marcus Williams'],['Birthdate','10/11/1983'],['Patient ID','#4821-MW'],['Exam Date', now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize: 11, fontWeight: 300, color: '#6b7280', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
            {[['Start Time', now.toLocaleTimeString()],['Test Duration', fmtTime(elapsed)],['Technician','Dr. Smith']].map(([l,v]) => (
              <div key={l}><div style={{ fontSize: 11, fontWeight: 300, color: '#6b7280', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{v}</div></div>
            ))}
          </div>
        </div>

        {/* Per-eye results */}
        {['right','left','both'].filter(em => {
          if (eyeMode === 'both') return em === 'right' || em === 'left';
          return em === eyeMode;
        }).map(em => {
          const hasData = chartLines.some(l => {
            const k = `${em}_${l.n}`;
            return results[k] && results[k].some(r => r !== null);
          });
          if (!hasData) return null;
          const eyeLabel = em === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)';
          return (
            <div key={em} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>{eyeLabel} Results</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e5e7eb' }}>
                    {['Line','Visual Acuity','Letters','Correct / Total','Score'].map(h => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left', padding: '8px 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
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
                    return (
                      <tr key={line.n} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151', fontWeight: 700 }}>{line.n}</td>
                        <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{line.va}</td>
                        <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151', letterSpacing: '0.1em' }}>{line.letters.join(' ')}</td>
                        <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{correct} / {res.length}</td>
                        <td style={{ padding: '9px 10px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: pct >= 65 ? '#10b98115' : '#ef444415', color: pct >= 65 ? '#10b981' : '#ef4444' }}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* VA + Rx summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 300, color: '#6b7280', marginBottom: 4 }}>Final Visual Acuity</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{getBestVA(em)}</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 300, color: '#6b7280', marginBottom: 6 }}>Prescription ({em === 'right' ? 'OD' : 'OS'})</div>
                  {[em === 'right' ? 'OD' : 'OS'].map(eye => (
                    <div key={eye} style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                      SPH {rx[eye].sph >= 0 ? `+${rx[eye].sph.toFixed(2)}` : rx[eye].sph.toFixed(2)} &nbsp;|&nbsp;
                      CYL {rx[eye].cyl >= 0 ? `+${rx[eye].cyl.toFixed(2)}` : rx[eye].cyl.toFixed(2)} &nbsp;|&nbsp;
                      AXIS {rx[eye].axis}°
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* OU summary when testing both */}
        {eyeMode === 'both' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Final Prescription Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['OD','OS'].map(eye => (
                <div key={eye} style={{ background: '#eff6ff', borderRadius: 10, padding: 16, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 10 }}>{eye} ({eye === 'OD' ? 'Right' : 'Left'} Eye)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[['Power (SPH)', rx[eye].sph >= 0 ? `+${rx[eye].sph.toFixed(2)}` : rx[eye].sph.toFixed(2)],['Cylinder (CYL)', rx[eye].cyl >= 0 ? `+${rx[eye].cyl.toFixed(2)}` : rx[eye].cyl.toFixed(2)],['Axis', `${rx[eye].axis}°`]].map(([l,v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#6b7280', fontWeight: 300 }}>{l}:</span>
                        <span style={{ color: '#111827', fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={resetTest} style={{ padding: '11px 28px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
            New Test
          </button>
          <button onClick={onBack} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accent}, #155bcc)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
            Save &amp; Close
          </button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f3f4f6', fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => phase === 'testing' ? setShowCancel(true) : onBack()} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Visual Acuity Test</div>

        {/* Eye mode selector */}
        {phase === 'testing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16 }}>
            {[['both','OU Both'],['right','OD Right'],['left','OS Left']].map(([val, label]) => (
              <button key={val} onClick={() => setEyeMode(val)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, opacity: eyeMode === val ? 1 : 0.4, transition: 'all 0.15s'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: eyeMode === val ? accent : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: eyeMode === val ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
                  <EyeIcon mode={val}/>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }}/>

        {/* Timer */}
        {phase === 'testing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${accent}12`, border: `1px solid ${accent}30` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{fmtTime(elapsed)}</span>
          </div>
        )}

        {/* View toggle (testing only) */}
        {phase === 'testing' && (
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 20, padding: 3, gap: 2 }}>
            {[['individual','Line by Line'],['fullChart','Full Chart']].map(([val,label]) => (
              <button key={val} onClick={() => setViewMode(val)} style={{ padding: '5px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', background: viewMode === val ? '#fff' : 'transparent', color: viewMode === val ? '#111827' : '#6b7280', fontSize: 11, fontWeight: 700, boxShadow: viewMode === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', fontFamily: "'Nunito Sans', sans-serif" }}>{label}</button>
            ))}
          </div>
        )}

        {/* Current prescription badge (testing) */}
        {phase === 'testing' && (
          <div style={{ fontSize: 10, fontWeight: 300, color: '#6b7280', lineHeight: 1.5, textAlign: 'right' }}>
            <span style={{ color: '#9ca3af' }}>OD: </span><span style={{ fontWeight: 700, color: '#374151' }}>SPH {rx.OD.sph >= 0 ? `+${rx.OD.sph.toFixed(2)}` : rx.OD.sph.toFixed(2)} CYL {rx.OD.cyl.toFixed(2)} AXIS {rx.OD.axis}°</span><br/>
            <span style={{ color: '#9ca3af' }}>OS: </span><span style={{ fontWeight: 700, color: '#374151' }}>SPH {rx.OS.sph >= 0 ? `+${rx.OS.sph.toFixed(2)}` : rx.OS.sph.toFixed(2)} CYL {rx.OS.cyl.toFixed(2)} AXIS {rx.OS.axis}°</span>
          </div>
        )}

        {/* Actions */}
        {phase === 'ready' && (
          <button onClick={() => setPhase('testing')} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${accent},#155bcc)`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
            Start Test
          </button>
        )}
        {phase === 'testing' && (
          <>
            <button onClick={() => setShowCancel(true)} style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
              Cancel Exam
            </button>
            <button onClick={() => setPhase('report')} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
              View Report
            </button>
          </>
        )}
        {phase === 'report' && (
          <button onClick={resetTest} style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
            New Test
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: phase === 'report' ? 24 : (phase === 'testing' ? '16px 20px' : 0) }}>
        {phase === 'ready' && renderReady()}
        {phase === 'testing' && (viewMode === 'individual' ? renderIndividualLines() : renderFullChart())}
        {phase === 'report' && renderReport()}
      </div>

      {/* ── Cancel Dialog ── */}
      {showCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Cancel Visual Acuity Test?</h3>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>Are you sure you want to cancel this examination? All progress will be lost.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancel(false)} style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
                Continue Test
              </button>
              <button onClick={() => { setShowCancel(false); onBack(); }} style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}>
                Cancel Test
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

Object.assign(window, { VisualAcuityTest });
