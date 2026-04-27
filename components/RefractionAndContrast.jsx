
// RefractionTest.jsx + ContrastSensitivityTest.jsx

function RefractionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('auto'); // auto | subjective | results
  const [eye, setEye] = React.useState('right');
  const [elapsed, setElapsed] = React.useState(0);
  const [measuring, setMeasuring] = React.useState(false);
  const [measured, setMeasured] = React.useState({ right:false, left:false });
  const [scanFrame, setScanFrame] = React.useState(0);
  const [results, setResults] = React.useState({
    right: { sphere:-2.00, cylinder:-0.75, axis:90, va:'20/40', add:null },
    left:  { sphere:-2.25, cylinder:-0.25, axis:180, va:'20/30', add:null }
  });
  const [subjectiveChoice, setSubjectiveChoice] = React.useState(null); // 1 | 2
  const [subjectiveRound, setSubjectiveRound] = React.useState(1);
  const timerRef = React.useRef(null);
  const scanRef = React.useRef(null);

  React.useEffect(() => {
    if (measuring) {
      timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
      scanRef.current = setInterval(() => setScanFrame(f => f+1), 50);
    } else { clearInterval(timerRef.current); clearInterval(scanRef.current); }
    return () => { clearInterval(timerRef.current); clearInterval(scanRef.current); };
  }, [measuring]);

  const startMeasurement = () => {
    setMeasuring(true);
    setTimeout(() => {
      setMeasuring(false);
      setMeasured(m => ({ ...m, [eye]: true }));
      if (eye === 'right') setEye('left');
    }, 3000);
  };

  const pupilR = 24 + Math.sin(scanFrame * 0.1) * 3;
  const scanY = ((scanFrame * 2) % 160);
  const res = results[eye];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Refraction Test</div>
        <div style={{ flex:1 }}/>
        {/* Phase toggle */}
        <div style={{ display:'flex', background:'#f3f4f6', borderRadius:20, padding:3, gap:2 }}>
          {[['auto','Auto Refraction'],['subjective','Subjective']].map(([val,label]) => (
            <button key={val} onClick={() => setPhase(val)} style={{ padding:'6px 16px', borderRadius:18, border:'none', cursor:'pointer', background:phase===val?'#fff':'transparent', color:phase===val?'#111827':'#6b7280', fontSize:12, fontWeight:700, boxShadow:phase===val?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Body — dark background like original */}
      <div style={{ flex:1, background:'#0a0e1a', display:'flex', gap:0, overflow:'hidden' }}>
        {/* Main area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, padding:32 }}>
          {/* Eye toggles */}
          <div style={{ display:'flex', gap:12 }}>
            {[['right','OD Right'],['left','OS Left']].map(([val,label]) => (
              <button key={val} onClick={() => setEye(val)} style={{
                padding:'10px 24px', borderRadius:20, border:`2px solid ${eye===val?accent:'rgba(255,255,255,0.2)'}`,
                background: eye===val?`${accent}25`:'transparent', color:'white', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:8
              }}>
                {measured[val] && <span style={{ color:'#10b981' }}>✓</span>}
                {label}
              </button>
            ))}
          </div>

          {phase === 'auto' && (
            <>
              {/* Eye simulation */}
              <div style={{ width:200, height:200, borderRadius:'50%', border:`3px solid ${accent}60`, position:'relative', overflow:'hidden', background:'#1a0f0a', cursor:'pointer' }} onClick={() => !measuring && startMeasurement()}>
                {/* Iris */}
                <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 40% 35%, #8B6914, #3d2b1f 40%, #1a0f0a)' }}/>
                {/* Pupil */}
                <div style={{ position:'absolute', top:'50%', left:'50%', width:pupilR*2, height:pupilR*2, borderRadius:'50%', background:'#000', transform:'translate(-50%,-50%)', transition:'none' }}>
                  <div style={{ position:'absolute', top:'15%', left:'20%', width:'18%', height:'18%', borderRadius:'50%', background:'rgba(255,255,255,0.6)' }}/>
                </div>
                {/* Scan line */}
                {measuring && <div style={{ position:'absolute', left:0, right:0, height:2, background:`${accent}80`, top:scanY, pointerEvents:'none' }}/>}
                {/* Ring overlay */}
                {measuring && <div style={{ position:'absolute', inset:16, borderRadius:'50%', border:`2px dashed ${accent}50`, animation:'spin 3s linear infinite' }}/>}
              </div>

              {/* Results display */}
              <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 24px', border:'1px solid rgba(255,255,255,0.12)', minWidth:280 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, textAlign:'center' }}>
                  {measuring ? 'Measuring...' : measured[eye] ? `${eye==='right'?'OD':'OS'} Measurement` : 'Click eye to measure'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, textAlign:'center' }}>
                  {[['Sphere', res.sphere.toFixed(2)], ['Cylinder', res.cylinder.toFixed(2)], ['Axis', `${res.axis}°`]].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{label}</div>
                      <div style={{ fontSize:26, fontWeight:700, color: measured[eye] ? accent : 'rgba(255,255,255,0.2)' }}>{measured[eye] ? val : '—'}</div>
                    </div>
                  ))}
                </div>
                {measured[eye] && (
                  <div style={{ marginTop:12, textAlign:'center', fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.5)' }}>
                    Visual Acuity: <span style={{ fontWeight:700, color:accent }}>{res.va}</span>
                  </div>
                )}
              </div>
              {!measuring && !measured[eye] && (
                <button onClick={startMeasurement} style={{ padding:'12px 32px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                  Start Auto Refraction
                </button>
              )}
            </>
          )}

          {phase === 'subjective' && (
            <>
              <div style={{ fontSize:96, fontWeight:900, color:'white', lineHeight:1 }}>E</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:16, marginBottom:16 }}>Which is clearer — Option 1 or 2?</div>
              <div style={{ display:'flex', gap:16 }}>
                <div style={{ padding:'20px 40px', background:subjectiveChoice===1?`${accent}30`:'rgba(255,255,255,0.05)', border:`2px solid ${subjectiveChoice===1?accent:'rgba(255,255,255,0.2)'}`, borderRadius:12, cursor:'pointer', textAlign:'center', color:'white' }}
                  onClick={() => setSubjectiveChoice(1)}>
                  <div style={{ fontSize:24, fontWeight:700 }}>1</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>Lens A</div>
                </div>
                <div style={{ padding:'20px 40px', background:subjectiveChoice===2?`${accent}30`:'rgba(255,255,255,0.05)', border:`2px solid ${subjectiveChoice===2?accent:'rgba(255,255,255,0.2)'}`, borderRadius:12, cursor:'pointer', textAlign:'center', color:'white' }}
                  onClick={() => setSubjectiveChoice(2)}>
                  <div style={{ fontSize:24, fontWeight:700 }}>2</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>Lens B</div>
                </div>
              </div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Round {subjectiveRound} of 5</div>
              {subjectiveChoice && (
                <button onClick={() => { setSubjectiveRound(r => r+1); setSubjectiveChoice(null); }} style={{ padding:'10px 28px', borderRadius:9, border:'none', background:accent, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Next</button>
              )}
            </>
          )}
        </div>

        {/* Right panel */}
        <div style={{ width:240, background:'rgba(255,255,255,0.04)', borderLeft:'1px solid rgba(255,255,255,0.08)', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Measurements</div>
          {[['OD (Right)', results.right, measured.right], ['OS (Left)', results.left, measured.left]].map(([label, r, done]) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 14px', border:`1px solid ${done?accent+'40':'rgba(255,255,255,0.08)'}` }}>
              <div style={{ fontSize:11, fontWeight:700, color: done?accent:'rgba(255,255,255,0.4)', marginBottom:8, display:'flex', justifyContent:'space-between' }}>
                {label} {done && <span>✓</span>}
              </div>
              {done ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                  {[['Sph',r.sphere.toFixed(2)],['Cyl',r.cylinder.toFixed(2)],['Axis',`${r.axis}°`]].map(([k,v]) => (
                    <div key={k} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{v}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>Not measured</div>}
            </div>
          ))}
          {measured.right && measured.left && (
            <button style={{ padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', marginTop:'auto', fontFamily:"'Nunito Sans', sans-serif" }}>
              Save Results
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Contrast Sensitivity Test (Pelli-Robson) ──
// Full feature parity: individual + full chart views, per-eye results,
// contrast-rendered letters, prescription panel, auto-progression, report

const CS_LINES_DEFAULT = [
  { n:1,  cs:'2.10', letters:['H','S','Z','D','S','N'], contrast:1.00 },
  { n:2,  cs:'1.95', letters:['C','K','R','Z','V','R'], contrast:0.85 },
  { n:3,  cs:'1.80', letters:['N','D','C','O','S','K'], contrast:0.70 },
  { n:4,  cs:'1.65', letters:['O','Z','K','V','H','Z'], contrast:0.55 },
  { n:5,  cs:'1.50', letters:['N','H','O','N','R','D'], contrast:0.40 },
  { n:6,  cs:'1.35', letters:['V','R','C','S','N','K'], contrast:0.28 },
  { n:7,  cs:'1.20', letters:['D','Z','O','H','V','C'], contrast:0.20 },
  { n:8,  cs:'1.05', letters:['K','N','R','H','C','S'], contrast:0.14 },
  { n:9,  cs:'0.90', letters:['O','V','D','S','Z','R'], contrast:0.10 },
  { n:10, cs:'0.75', letters:['H','D','K','O','R','N'], contrast:0.07 },
  { n:11, cs:'0.60', letters:['C','Z','S','V','N','H'], contrast:0.05 },
  { n:12, cs:'0.45', letters:['R','K','D','H','O','V'], contrast:0.03 },
];

const CS_LETTER_POOL = ['A','B','C','D','E','F','G','H','K','L','N','O','P','R','S','T','U','V','Z'];

function csRandomLetters(count) {
  return [...CS_LETTER_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}

function ContrastSensitivityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  const [phase, setPhase] = React.useState('ready');
  const [eyeMode, setEyeMode] = React.useState('both');
  const [viewMode, setViewMode] = React.useState('individual');
  const [showCancel, setShowCancel] = React.useState(false);
  const [chartLines, setChartLines] = React.useState(CS_LINES_DEFAULT.map(l => ({ ...l, letters: [...l.letters] })));
  const [results, setResults] = React.useState({});
  const [expanded, setExpanded] = React.useState(new Set([1]));
  const [rx, setRx] = React.useState({
    OD: { sph: -2.00, cyl: -0.75, axis: 90 },
    OS: { sph: -2.25, cyl: -0.25, axis: 180 },
  });
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const key = lineN => `${eyeMode}_${lineN}`;

  const getLineRes = lineN => {
    const line = chartLines.find(l => l.n === lineN);
    return results[key(lineN)] || Array(line.letters.length).fill(null);
  };

  const getScore = (em, lineN) => {
    const k = `${em}_${lineN}`;
    const line = chartLines.find(l => l.n === lineN);
    const res = results[k] || [];
    const correct = res.filter(r => r === 'correct').length;
    return { correct, total: line.letters.length, pct: line.letters.length > 0 ? Math.round(correct / line.letters.length * 100) : 0 };
  };

  const getBestCS = em => {
    for (let i = chartLines.length; i >= 1; i--) {
      const s = getScore(em, i);
      if (s.correct > 0 && s.pct >= 65) return chartLines[i - 1].cs;
    }
    return '—';
  };

  const toggleLetter = (lineN, idx) => {
    const line = chartLines.find(l => l.n === lineN);
    const prev = getLineRes(lineN);
    const next = [...prev];
    next[idx] = next[idx] === null ? 'correct' : next[idx] === 'correct' ? 'incorrect' : null;
    setResults(r => ({ ...r, [key(lineN)]: next }));
    const allMarked = next.every(r => r !== null);
    const pct = Math.round(next.filter(r => r === 'correct').length / next.length * 100);
    if (allMarked && pct >= 65 && lineN < chartLines.length) {
      setTimeout(() => setExpanded(new Set([lineN + 1])), 500);
    }
  };

  const markAll = (lineN, val) => {
    const line = chartLines.find(l => l.n === lineN);
    const next = Array(line.letters.length).fill(val);
    setResults(r => ({ ...r, [key(lineN)]: next }));
    if (val === 'correct' && lineN < chartLines.length) {
      setTimeout(() => setExpanded(new Set([lineN + 1])), 500);
    }
  };

  const regenerate = lineN => {
    const line = chartLines.find(l => l.n === lineN);
    setChartLines(prev => prev.map(l => l.n === lineN ? { ...l, letters: csRandomLetters(l.letters.length) } : l));
    setResults(r => { const nr = { ...r }; delete nr[key(lineN)]; return nr; });
  };

  const toggleExpanded = lineN => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(lineN)) next.delete(lineN); else next.add(lineN);
      return next;
    });
  };

  const adjustRx = (eye, field, delta) => {
    setRx(prev => {
      const val = prev[eye][field] + delta;
      const clamped = field === 'axis' ? ((val % 181) + 181) % 181 : val;
      return { ...prev, [eye]: { ...prev[eye], [field]: parseFloat(clamped.toFixed(field === 'axis' ? 0 : 2)) } };
    });
  };

  const resetTest = () => {
    setPhase('ready'); setResults({}); setElapsed(0);
    setExpanded(new Set([1]));
    setChartLines(CS_LINES_DEFAULT.map(l => ({ ...l, letters: [...l.letters] })));
  };

  // Prescription stepper
  const RxStep = ({ eye, field, step, label }) => {
    const val = rx[eye][field];
    const display = field === 'axis' ? `${val}°` : (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          <button onClick={() => adjustRx(eye, field, -step)} style={{ width:22, height:22, borderRadius:5, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', fontSize:13, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
          <div style={{ flex:1, textAlign:'center', fontSize:11, fontWeight:700, color:'#111827', padding:'2px 4px', borderRadius:4, border:'1px solid #e5e7eb', background:'#fff', minWidth:48 }}>{display}</div>
          <button onClick={() => adjustRx(eye, field, step)} style={{ width:22, height:22, borderRadius:5, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', fontSize:13, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
        </div>
      </div>
    );
  };

  // Prescription panel
  const PrescriptionPanel = () => {
    const eyes = eyeMode === 'both' ? ['OD','OS'] : eyeMode === 'right' ? ['OD'] : ['OS'];
    return (
      <div style={{ marginTop:14, padding:14, background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:10 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#1d4ed8', marginBottom:10 }}>Prescription Adjustment</div>
        <div style={{ display:'grid', gridTemplateColumns:eyes.map(()=>'1fr').join(' '), gap:16 }}>
          {eyes.map(eye => (
            <div key={eye}>
              <div style={{ fontSize:10, fontWeight:700, color:'#1d4ed8', marginBottom:8 }}>{eye} ({eye==='OD'?'Right':'Left'} Eye)</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <RxStep eye={eye} field="sph" step={0.25} label="SPH"/>
                <RxStep eye={eye} field="cyl" step={0.25} label="CYL"/>
                <RxStep eye={eye} field="axis" step={1} label="AXIS"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Ready ──
  const renderReady = () => (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:48, maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:32 }}>👁</div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111827', margin:'0 0 12px' }}>Contrast Sensitivity Test</h2>
        <p style={{ fontSize:13, fontWeight:300, color:'#6b7280', lineHeight:1.6, margin:'0 0 32px' }}>
          This test measures your ability to distinguish between different shades of gray using the Pelli-Robson chart. Letters gradually become lighter as you progress through the chart.
        </p>
        <button onClick={() => setPhase('testing')} style={{ padding:'13px 40px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 4px 16px ${accent}40` }}>
          START TEST
        </button>
      </div>
    </div>
  );

  // ── Individual lines view ──
  const renderIndividual = () => (
    <div style={{ display:'flex', gap:20 }}>
      {/* Lines (left 2/3) */}
      <div style={{ flex:'1 1 0', display:'flex', flexDirection:'column', gap:8 }}>
        {chartLines.map(line => {
          const lineRes = getLineRes(line.n);
          const allMarked = lineRes.length === line.letters.length && lineRes.every(r => r !== null);
          const score = getScore(eyeMode, line.n);
          const hasAny = lineRes.some(r => r !== null);
          const isExpanded = expanded.has(line.n);
          const showRxPanel = allMarked && score.pct < 60;

          return (
            <div key={line.n} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#f9fafb', borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none', cursor:'pointer' }}
                onClick={() => toggleExpanded(line.n)}>
                <div style={{ fontSize:11, fontWeight:700, color:'#374151', minWidth:48 }}>Line {line.n}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', minWidth:44 }}>CS {line.cs}</div>
                {/* Contrast swatch */}
                <div style={{ width:20, height:20, borderRadius:4, border:'1px solid #e5e7eb', background:`rgba(0,0,0,${line.contrast})` }}/>
                {hasAny && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:score.pct>=65?'#10b98118':'#ef444418', color:score.pct>=65?'#10b981':'#ef4444' }}>{score.pct}%</span>}
                <div style={{ flex:1 }}/>
                <button onClick={e => { e.stopPropagation(); regenerate(line.n); }} title="Randomize" style={{ width:28, height:28, borderRadius:7, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
                </button>
                {isExpanded && <>
                  <button onClick={e => { e.stopPropagation(); markAll(line.n,'correct'); }} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #10b981', background:'#f0fdf4', color:'#10b981', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> All Correct
                  </button>
                  <button onClick={e => { e.stopPropagation(); markAll(line.n,'incorrect'); }} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #ef4444', background:'#fef2f2', color:'#ef4444', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg> All Incorrect
                  </button>
                </>}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform:isExpanded?'rotate(180deg)':'none', transition:'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
              </div>

              {isExpanded && (
                <div style={{ padding:'28px 20px' }}>
                  {/* Letters with contrast + checkboxes */}
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:20, flexWrap:'wrap' }}>
                    {line.letters.map((letter, idx) => {
                      const res = lineRes[idx];
                      return (
                        <div key={idx} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                          {/* Letter rendered at contrast level */}
                          <div style={{
                            fontSize:64, fontWeight:700, lineHeight:1, userSelect:'none',
                            fontFamily:"'Nunito Sans', sans-serif",
                            color:`rgba(0,0,0,${line.contrast})`,
                            padding:'8px 12px', borderRadius:8,
                            outline: res==='correct' ? '3px solid #10b981' : res==='incorrect' ? '3px solid #ef4444' : 'none',
                            background: res==='correct'?'#f0fdf4':res==='incorrect'?'#fef2f2':'transparent',
                            transition:'all 0.15s'
                          }}>{letter}</div>
                          {/* Checkbox */}
                          <button onClick={() => toggleLetter(line.n, idx)} style={{
                            width:32, height:32, borderRadius:6, cursor:'pointer',
                            border:`2px solid ${res==='correct'?'#10b981':res==='incorrect'?'#ef4444':'#d1d5db'}`,
                            background:res==='correct'?'#10b981':'#fff',
                            display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s'
                          }}>
                            {res==='correct' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                            {res==='incorrect' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {showRxPanel && <PrescriptionPanel/>}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display:'flex', justifyContent:'center', marginTop:16, paddingBottom:24 }}>
          <button onClick={() => setPhase('report')} style={{ padding:'12px 40px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 4px 16px ${accent}35` }}>
            VIEW REPORT
          </button>
        </div>
      </div>

      {/* Prescription sidebar (right 1/3) */}
      <div style={{ flex:'0 0 240px' }}>
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:16, position:'sticky', top:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Prescription Adjustment</div>
          {['OD','OS'].map(eye => (
            <div key={eye} style={{ marginBottom:16, paddingBottom:16, borderBottom: eye==='OD' ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{eye} ({eye==='OD'?'Right':'Left'} Eye)</div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <RxStep eye={eye} field="sph" step={0.25} label="Power (SPH)"/>
                <RxStep eye={eye} field="cyl" step={0.25} label="Cylinder"/>
                <RxStep eye={eye} field="axis" step={5} label="Axis"/>
              </div>
            </div>
          ))}
          <button onClick={() => setPhase('report')} style={{ width:'100%', padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
            Complete Test
          </button>
        </div>
      </div>
    </div>
  );

  // ── Full chart view ──
  const renderFullChart = () => (
    <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:40 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:'#374151', margin:0 }}>Full Pelli-Robson Chart</h3>
        <button onClick={() => { setChartLines(CS_LINES_DEFAULT.map(l => ({ ...l, letters: csRandomLetters(l.letters.length) }))); setResults({}); }} style={{ padding:'6px 14px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Regenerate All
        </button>
      </div>
      <div style={{ background:'#fafafa', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:24 }}>
        {chartLines.map(line => {
          const lineRes = getLineRes(line.n);
          return (
            <div key={line.n}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:10, color:'#9ca3af' }}>Line {line.n}</span>
                <span style={{ fontSize:10, color:'#9ca3af' }}>CS {line.cs}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:16 }}>
                {line.letters.map((letter, idx) => {
                  const res = lineRes[idx];
                  return (
                    <button key={idx} onClick={() => toggleLetter(line.n, idx)} style={{
                      fontSize:52, fontWeight:700, lineHeight:1,
                      fontFamily:"'Nunito Sans', sans-serif",
                      color:`rgba(0,0,0,${line.contrast})`,
                      background:'white', border:'none', cursor:'pointer',
                      padding:'6px 10px', borderRadius:8,
                      outline: res==='correct' ? '3px solid #10b981' : res==='incorrect' ? '3px solid #ef4444' : 'none',
                      transition:'all 0.15s'
                    }}>{letter}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:32, display:'flex', justifyContent:'center' }}>
        <button onClick={() => setPhase('report')} style={{ padding:'12px 40px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
          GENERATE REPORT
        </button>
      </div>
    </div>
  );

  // ── Report ──
  const renderReport = () => {
    const now = new Date();
    return (
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20, paddingBottom:40 }}>
        {/* Header */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Contrast Sensitivity Test Results</h2>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ padding:'8px 18px', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>EXPORT</button>
              <button style={{ padding:'8px 18px', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>COMPARE</button>
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 16px' }}>Patient Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:14 }}>
            {[['Patient Name','Marcus Williams'],['Birthdate','10/11/1983'],['Patient ID','#4821-MW'],['Exam Date', now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, paddingTop:14, borderTop:'1px solid #f3f4f6' }}>
            {[['Start Time', now.toLocaleTimeString()],['Test Duration', fmtTime(elapsed)],['Technician','Dr. Smith']].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
            ))}
          </div>
        </div>

        {/* CS Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[['Both Eyes (OU)','both'],['Left Eye (OS)','left'],['Right Eye (OD)','right']].map(([label,em]) => (
            <div key={em} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20, textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:getBestCS(em)!=='—'?accent:'#d1d5db' }}>{getBestCS(em)}</div>
              <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>Contrast Sensitivity (log units)</div>
            </div>
          ))}
        </div>

        {/* Prescription Summary */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 16px' }}>Final Prescription</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {['OD','OS'].map(eye => (
              <div key={eye} style={{ background:'#eff6ff', borderRadius:10, padding:16, border:'1px solid #bfdbfe' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1d4ed8', marginBottom:10 }}>{eye} ({eye==='OD'?'Right':'Left'} Eye)</div>
                {[['Power (SPH)', rx[eye].sph>=0?`+${rx[eye].sph.toFixed(2)}`:rx[eye].sph.toFixed(2)],['Cylinder',rx[eye].cyl>=0?`+${rx[eye].cyl.toFixed(2)}`:rx[eye].cyl.toFixed(2)],['Axis',`${rx[eye].axis}°`]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                    <span style={{ color:'#6b7280', fontWeight:300 }}>{l}:</span>
                    <span style={{ color:'#111827', fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={resetTest} style={{ padding:'11px 28px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Test</button>
          <button onClick={onBack} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save &amp; Close</button>
        </div>
      </div>
    );
  };

  // ── Main render ──
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={() => phase==='testing' ? setShowCancel(true) : onBack()} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Contrast Sensitivity Test</div>
        <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>Pelli-Robson</div>

        {/* Eye mode (testing only) */}
        {phase==='testing' && (
          <div style={{ display:'flex', alignItems:'center', gap:14, marginLeft:12 }}>
            {[['both','OU Both'],['right','OD Right'],['left','OS Left']].map(([val,label]) => (
              <button key={val} onClick={() => setEyeMode(val)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:8, opacity:eyeMode===val?1:0.4, transition:'all 0.15s' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:eyeMode===val?accent:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', color:eyeMode===val?'#fff':'#6b7280', transition:'all 0.15s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    {val==='both'?<><ellipse cx="7" cy="12" rx="3" ry="4"/><ellipse cx="17" cy="12" rx="3" ry="4"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/><circle cx="17" cy="12" r="1.2" fill="currentColor"/></>:<><path d="M12 8C8 8 5 10.5 3 12C5 13.5 8 16 12 16C16 16 19 13.5 21 12C19 10.5 16 8 12 8Z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></>}
                  </svg>
                </div>
                <span style={{ fontSize:9, fontWeight:700, color:'#374151' }}>{label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ flex:1 }}/>

        {phase==='testing' && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1.2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:accent }}>{fmtTime(elapsed)}</span>
          </div>
        )}

        {phase==='testing' && (
          <div style={{ display:'flex', background:'#f3f4f6', borderRadius:20, padding:3, gap:2 }}>
            {[['individual','Line by Line'],['fullChart','Full Chart']].map(([val,label]) => (
              <button key={val} onClick={() => setViewMode(val)} style={{ padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', background:viewMode===val?'#fff':'transparent', color:viewMode===val?'#111827':'#6b7280', fontSize:11, fontWeight:700, boxShadow:viewMode===val?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
            ))}
          </div>
        )}

        {phase==='ready' && <button onClick={() => setPhase('testing')} style={{ padding:'8px 20px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Start Test</button>}
        {phase==='testing' && <>
          <button onClick={() => setShowCancel(true)} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #fca5a5', background:'#fef2f2', color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Cancel Exam</button>
          <button onClick={() => setPhase('report')} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:'#10b981', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>View Report</button>
        </>}
        {phase==='report' && <button onClick={resetTest} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Test</button>}
      </div>

      {/* Body */}
      <div style={{ flex:1, overflow:'auto', padding: phase==='report'?24:(phase==='testing'?'16px 20px':0) }}>
        {phase==='ready' && renderReady()}
        {phase==='testing' && (viewMode==='individual' ? renderIndividual() : renderFullChart())}
        {phase==='report' && renderReport()}
      </div>

      {/* Cancel dialog */}
      {showCancel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, maxWidth:400, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>Cancel Contrast Sensitivity Test?</h3>
            <p style={{ fontSize:13, fontWeight:300, color:'#6b7280', margin:'0 0 24px', lineHeight:1.6 }}>Are you sure you want to cancel this examination? All progress will be lost.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setShowCancel(false)} style={{ padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Continue Test</button>
              <button onClick={() => { setShowCancel(false); onBack(); }} style={{ padding:'10px 20px', borderRadius:9, border:'none', background:'#ef4444', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Cancel Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { RefractionTest, ContrastSensitivityTest });
