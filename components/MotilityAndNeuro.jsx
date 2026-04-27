
// ExtraocularMotilityTest.jsx + VisualReactionTimeTest.jsx + EyeTrackingAccuracyTest.jsx + AIPatternRecognitionTest.jsx

// ── Extraocular Motility ──
const EOM_DIRECTIONS = ['Right','Top-Right','Top','Top-Left','Left','Bottom-Left','Bottom','Bottom-Right'];
const DIR_POSITIONS = { 'Right':[1,0], 'Top-Right':[1,-1], 'Top':[0,-1], 'Top-Left':[-1,-1], 'Left':[-1,0], 'Bottom-Left':[-1,1], 'Bottom':[0,1], 'Bottom-Right':[1,1] };

function EOMMeter({ score, onChange }) {
  return (
    <div style={{ display:'flex', gap:3 }}>
      {[1,2,3,4,5].map(v => (
        <button key={v} onClick={() => onChange(v)} style={{
          width:24, height:24, borderRadius:4, border:'1.5px solid #e5e7eb',
          background: score >= v ? '#1f8eff' : '#f9fafb',
          cursor:'pointer', transition:'all 0.15s'
        }}/>
      ))}
    </div>
  );
}

function EOMDiagram({ results, activeDir, accent }) {
  const cx = 80, cy = 80, r = 55;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* Grid lines */}
      <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#e5e7eb" strokeWidth="1"/>
      <line x1={cx} y1={cy-r} x2={cx} y2={cy+r} stroke="#e5e7eb" strokeWidth="1"/>
      <line x1={cx-r*0.7} y1={cy-r*0.7} x2={cx+r*0.7} y2={cy+r*0.7} stroke="#e5e7eb" strokeWidth="1"/>
      <line x1={cx+r*0.7} y1={cy-r*0.7} x2={cx-r*0.7} y2={cy+r*0.7} stroke="#e5e7eb" strokeWidth="1"/>
      {/* Center eye */}
      <circle cx={cx} cy={cy} r={14} fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r={5} fill={accent}/>
      {/* Direction dots */}
      {EOM_DIRECTIONS.map(dir => {
        const [dx,dy] = DIR_POSITIONS[dir];
        const x = cx + dx*r*0.85, y = cy + dy*r*0.85;
        const result = results.find(r => r.direction === dir);
        const done = result?.completed;
        const isActive = activeDir === dir;
        const score = result?.score || 0;
        const color = done ? (score>=4?'#10b981':score>=2?'#f59e0b':'#ef4444') : (isActive?accent:'#d1d5db');
        return (
          <g key={dir}>
            <circle cx={x} cy={y} r={10} fill={isActive?`${accent}20`:done?`${color}20`:'#f9fafb'} stroke={color} strokeWidth={isActive?2.5:1.5}/>
            {done && <text x={x} y={y+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{score}</text>}
            {!done && isActive && <circle cx={x} cy={y} r={4} fill={accent}/>}
          </g>
        );
      })}
    </svg>
  );
}

function ExtraocularMotilityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [step, setStep] = React.useState('setup'); // setup | testing | report
  const [eye, setEye] = React.useState('left');
  const [dirIdx, setDirIdx] = React.useState(0);
  const [leftResults, setLeftResults] = React.useState(EOM_DIRECTIONS.map(d => ({ direction:d, score:0, completed:false })));
  const [rightResults, setRightResults] = React.useState(EOM_DIRECTIONS.map(d => ({ direction:d, score:0, completed:false })));

  const currentResults = eye === 'left' ? leftResults : rightResults;
  const setCurrentResults = eye === 'left' ? setLeftResults : setRightResults;
  const currentDir = EOM_DIRECTIONS[dirIdx];
  const currentTest = currentResults.find(r => r.direction === currentDir);
  const completedCount = currentResults.filter(r => r.completed).length;

  const setScore = (score) => {
    setCurrentResults(prev => prev.map(r => r.direction === currentDir ? { ...r, score } : r));
  };

  const nextDirection = () => {
    setCurrentResults(prev => prev.map(r => r.direction === currentDir ? { ...r, completed:true } : r));
    if (dirIdx < EOM_DIRECTIONS.length - 1) setDirIdx(i => i+1);
    else {
      if (eye === 'left') { setEye('right'); setDirIdx(0); }
      else setStep('report');
    }
  };

  const getAvgScore = (results) => {
    const done = results.filter(r => r.completed);
    return done.length > 0 ? (done.reduce((s,r) => s+r.score,0)/done.length).toFixed(1) : '—';
  };

  if (step === 'setup') return (
    <ExamShell title="Extraocular Motility Test" accent={accent} onBack={onBack} phase="ready" onBegin={() => setStep('testing')}>
      <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        <div style={{ fontSize:18, fontWeight:700, color:'#111827' }}>Extraocular Motility (EOM)</div>
        <div style={{ fontSize:13, fontWeight:300, color:'#6b7280', maxWidth:480, textAlign:'center', lineHeight:1.7 }}>
          Assess eye movement in 8 cardinal directions for each eye. Score each direction 1–5 based on range and smoothness of movement.
        </div>
        <EOMDiagram results={[]} activeDir={null} accent={accent}/>
        <div style={{ fontSize:12, fontWeight:300, color:'#9ca3af' }}>8 directions × 2 eyes = 16 measurements</div>
      </div>
    </ExamShell>
  );

  if (step === 'testing') return (
    <ExamShell title="Extraocular Motility Test" accent={accent} onBack={onBack} phase="testing"
      onFinish={() => setStep('report')}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Progress</div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:4 }}>OD (Right Eye)</div>
            <div style={{ height:4, background:'#f3f4f6', borderRadius:2 }}>
              <div style={{ width:`${(rightResults.filter(r=>r.completed).length/8)*100}%`, height:'100%', background:accent, borderRadius:2 }}/>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:4 }}>OS (Left Eye)</div>
            <div style={{ height:4, background:'#f3f4f6', borderRadius:2 }}>
              <div style={{ width:`${(leftResults.filter(r=>r.completed).length/8)*100}%`, height:'100%', background:'#10b981', borderRadius:2 }}/>
            </div>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Scores</div>
          {currentResults.filter(r=>r.completed).map(r => (
            <div key={r.direction} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f3f4f6' }}>
              <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{r.direction}</span>
              <div style={{ display:'flex', gap:2 }}>
                {[1,2,3,4,5].map(v => <div key={v} style={{ width:8, height:8, borderRadius:2, background:r.score>=v?accent:'#e5e7eb' }}/>)}
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div style={{ padding:32, display:'flex', gap:32, alignItems:'flex-start', justifyContent:'center' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <EOMDiagram results={currentResults} activeDir={currentDir} accent={accent}/>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>Testing {eye==='left'?'Left (OS)':'Right (OD)'} Eye</div>
        </div>
        <div style={{ flex:1, maxWidth:360 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:4 }}>Direction: {currentDir}</div>
          <div style={{ fontSize:12, fontWeight:300, color:'#6b7280', marginBottom:20 }}>{dirIdx+1} of 8 · {eye==='left'?'OS Left':'OD Right'} Eye</div>
          <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:10 }}>Score (1=impaired, 5=full range)</div>
          <div style={{ display:'flex', gap:8, marginBottom:24 }}>
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => setScore(v)} style={{
                flex:1, padding:'14px 0', borderRadius:10, border:`2px solid ${currentTest?.score===v?accent:'#e5e7eb'}`,
                background: currentTest?.score===v?accent:'#f9fafb', color: currentTest?.score===v?'white':'#374151',
                fontSize:16, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
              }}>{v}</button>
            ))}
          </div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginBottom:16 }}>
            1=Severe impairment · 3=Partial · 5=Full normal range
          </div>
          <button onClick={nextDirection} disabled={!currentTest?.score} style={{
            width:'100%', padding:'12px 0', borderRadius:9, border:'none',
            background: currentTest?.score ? `linear-gradient(135deg,${accent},#155bcc)` : '#d1d5db',
            color:'white', fontSize:13, fontWeight:700, cursor: currentTest?.score ? 'pointer' : 'not-allowed',
            fontFamily:"'Nunito Sans', sans-serif"
          }}>{dirIdx < EOM_DIRECTIONS.length-1 || eye==='left' ? 'Next Direction →' : 'Complete Test'}</button>
        </div>
      </div>
    </ExamShell>
  );

  return (
    <ExamShell title="Extraocular Motility — Report" accent={accent} onBack={onBack}
      phase="report" onNewTest={() => { setStep('setup'); setDirIdx(0); setEye('left'); setLeftResults(EOM_DIRECTIONS.map(d=>({direction:d,score:0,completed:false}))); setRightResults(EOM_DIRECTIONS.map(d=>({direction:d,score:0,completed:false}))); }}
    >
      <div style={{ padding:24, display:'flex', gap:24 }}>
        {[['OD (Right)', rightResults],['OS (Left)', leftResults]].map(([label,res]) => (
          <div key={label} style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:16 }}>Average score: <strong>{getAvgScore(res)}/5</strong></div>
            <EOMDiagram results={res} activeDir={null} accent={accent}/>
            <div style={{ marginTop:16 }}>
              {res.map(r => (
                <div key={r.direction} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:12, fontWeight:300, color:'#374151', width:90 }}>{r.direction}</span>
                  <div style={{ display:'flex', gap:3 }}>
                    {[1,2,3,4,5].map(v => <div key={v} style={{ width:12, height:12, borderRadius:3, background:r.score>=v?(r.score>=4?'#10b981':r.score>=2?'#f59e0b':'#ef4444'):'#e5e7eb' }}/>)}
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:r.score>=4?'#10b981':r.score>=2?'#f59e0b':'#ef4444', width:30, textAlign:'right' }}>{r.score}/5</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExamShell>
  );
}

// ── Visual Reaction Time Test ──
function VisualReactionTimeTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [state, setState] = React.useState('idle'); // idle | waiting | ready | done
  const [times, setTimes] = React.useState([]);
  const [trial, setTrial] = React.useState(0);
  const [startTime, setStartTime] = React.useState(0);
  const [tooEarly, setTooEarly] = React.useState(false);
  const TOTAL = 5;
  const timeoutRef = React.useRef(null);

  const startTrial = () => {
    setState('waiting');
    setTooEarly(false);
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timeoutRef.current);
      setTooEarly(true);
      setState('idle');
    } else if (state === 'ready') {
      const rt = Date.now() - startTime;
      const newTimes = [...times, rt];
      setTimes(newTimes);
      const newTrial = trial + 1;
      setTrial(newTrial);
      if (newTrial >= TOTAL) setState('done');
      else { setState('idle'); setTimeout(startTrial, 1000); }
    }
  };

  const avg = times.length > 0 ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;
  const best = times.length > 0 ? Math.min(...times) : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0e1a', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Visual Reaction Time Test</div>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', gap:6 }}>
          {Array.from({length:TOTAL}).map((_,i) => (
            <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:i<trial?'#10b981':i===trial&&state!=='idle'&&state!=='done'?accent:'rgba(255,255,255,0.2)' }}/>
          ))}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28, padding:32 }}
        onClick={handleClick}>

        {state === 'idle' && trial === 0 && (
          <>
            <div style={{ color:'white', fontSize:20, fontWeight:700 }}>Visual Reaction Time Test</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14, textAlign:'center', maxWidth:400, lineHeight:1.7 }}>
              Click as soon as the green circle appears. {TOTAL} trials total. Do NOT click before it appears.
            </div>
            <button onClick={e => { e.stopPropagation(); startTrial(); }} style={{ padding:'14px 36px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Start Test
            </button>
          </>
        )}

        {state === 'idle' && trial > 0 && trial < TOTAL && (
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:16 }}>Get ready... {times[times.length-1]}ms</div>
        )}

        {state === 'waiting' && (
          <>
            <div style={{ width:120, height:120, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <span style={{ color:'white', fontSize:40 }}>✋</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>Wait for green... don't click yet!</div>
            {tooEarly && <div style={{ color:'#f59e0b', fontSize:13, fontWeight:700 }}>⚠ Too early! Wait for green.</div>}
          </>
        )}

        {state === 'ready' && (
          <>
            <div style={{ width:160, height:160, borderRadius:'50%', background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', animation:'scaleIn 0.1s ease', boxShadow:'0 0 60px rgba(16,185,129,0.6)' }}>
              <span style={{ color:'white', fontSize:56 }}>👁</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:16, fontWeight:700 }}>CLICK NOW!</div>
          </>
        )}

        {state === 'done' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color:'white', marginBottom:20 }}>Test Complete!</div>
            <div style={{ display:'flex', gap:20, marginBottom:24 }}>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 24px', textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, color:accent }}>{avg}ms</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.07em' }}>Average</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 24px', textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, color:'#10b981' }}>{best}ms</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.07em' }}>Best</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20 }}>
              {times.map((t,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'white' }}>{t}ms</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Trial {i+1}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={e=>{e.stopPropagation();}} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Results</button>
              <button onClick={e=>{e.stopPropagation();setTimes([]);setTrial(0);setState('idle');}} style={{ padding:'10px 20px', borderRadius:9, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Retry</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes scaleIn{from{transform:scale(0.5)}to{transform:scale(1)}}`}</style>
    </div>
  );
}

// ── Eye Tracking Accuracy Test ──
function EyeTrackingAccuracyTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready'); // ready | calibrating | tracking | results
  const [calIdx, setCalIdx] = React.useState(0);
  const [calPoints, setCalPoints] = React.useState([]);
  const [gaze, setGaze] = React.useState({ x:50, y:50 });
  const [target, setTarget] = React.useState({ x:50, y:50 });
  const [accuracy, setAccuracy] = React.useState(0);
  const [frame, setFrame] = React.useState(0);
  const calPattern = [{x:50,y:50},{x:10,y:10},{x:90,y:10},{x:10,y:90},{x:90,y:90},{x:50,y:10},{x:50,y:90},{x:10,y:50},{x:90,y:50}];
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'tracking') {
      intervalRef.current = setInterval(() => {
        setFrame(f => f+1);
        setGaze(g => ({
          x: target.x + (Math.random()-0.5)*8,
          y: target.y + (Math.random()-0.5)*8
        }));
        const dx = gaze.x - target.x, dy = gaze.y - target.y;
        setAccuracy(Math.max(0, 100 - Math.sqrt(dx*dx+dy*dy)*2));
      }, 100);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [phase, target]);

  const startCalibration = () => {
    setPhase('calibrating');
    setCalIdx(0);
    setCalPoints([]);
    runCal(0);
  };

  const runCal = (idx) => {
    if (idx >= calPattern.length) { setPhase('tracking'); setTarget(calPattern[Math.floor(Math.random()*calPattern.length)]); return; }
    setTarget(calPattern[idx]);
    setTimeout(() => {
      setCalPoints(prev => [...prev, calPattern[idx]]);
      setCalIdx(idx+1);
      runCal(idx+1);
    }, 800);
  };

  const accuracyColor = accuracy > 85 ? '#10b981' : accuracy > 70 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0e1a', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Eye Tracking Accuracy Test</div>
        <div style={{ flex:1 }}/>
        {phase === 'tracking' && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:20, background:accuracyColor+'30', border:`1px solid ${accuracyColor}60` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:accuracyColor, animation:'pulse 1s infinite' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:accuracyColor }}>{Math.round(accuracy)}% accuracy</span>
          </div>
        )}
      </div>

      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {/* Calibration/tracking field */}
        {(phase === 'calibrating' || phase === 'tracking') && (
          <>
            {/* Completed cal points */}
            {calPoints.map((p,i) => (
              <div key={i} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:16, height:16, borderRadius:'50%', background:'#10b981', border:'2px solid #10b981', transform:'translate(-50%,-50%)', opacity:0.4 }}/>
            ))}
            {/* Target */}
            <div style={{ position:'absolute', left:`${target.x}%`, top:`${target.y}%`, transform:'translate(-50%,-50%)', transition:'all 0.4s ease' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', animation:'ringPulse 0.8s ease infinite' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:accent }}/>
              </div>
            </div>
            {/* Gaze indicator */}
            {phase === 'tracking' && (
              <div style={{ position:'absolute', left:`${gaze.x}%`, top:`${gaze.y}%`, width:20, height:20, borderRadius:'50%', border:'2px solid #f59e0b', transform:'translate(-50%,-50%)', opacity:0.7, transition:'none',
                background:'rgba(245,158,11,0.2)'
              }}/>
            )}
            {/* Instructions */}
            <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.5)', fontSize:12, textAlign:'center' }}>
              {phase==='calibrating' ? `Calibrating... ${calIdx}/${calPattern.length}` : 'Follow the blue dot with your eyes'}
            </div>
          </>
        )}

        {phase === 'ready' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'white' }}>Eye Tracking Accuracy Test</div>
            <div style={{ fontSize:13, fontWeight:300, color:'rgba(255,255,255,0.5)', maxWidth:400, textAlign:'center', lineHeight:1.7 }}>
              The system will display calibration points across the screen. The patient should follow each dot with their eyes. Accuracy is measured after calibration.
            </div>
            <button onClick={startCalibration} style={{ padding:'14px 36px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Start Calibration
            </button>
          </div>
        )}

        {phase === 'tracking' && (
          <div style={{ position:'absolute', top:16, right:16, background:'rgba(0,0,0,0.6)', borderRadius:12, padding:'12px 16px', backdropFilter:'blur(8px)' }}>
            <div style={{ fontSize:28, fontWeight:700, color:accuracyColor }}>{Math.round(accuracy)}%</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Accuracy</div>
            <button onClick={() => setPhase('results')} style={{ marginTop:10, width:'100%', padding:'7px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Save Results
            </button>
          </div>
        )}

        {phase === 'results' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'white' }}>Calibration Results</div>
            <div style={{ width:200, height:200, borderRadius:'50%', border:`4px solid ${accuracyColor}`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:700, color:accuracyColor }}>{Math.round(accuracy)}%</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Tracking Accuracy</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['Calibration Points', calPattern.length], ['Average Error', `${(100-accuracy).toFixed(1)}%`], ['Status', accuracy>85?'PASS':'RETRY']].map(([k,v]) => (
                <div key={k} style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:accuracy>85?'#10b981':'#f59e0b' }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => {}} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>
              <button onClick={() => { setPhase('ready'); setCalPoints([]); }} style={{ padding:'10px 20px', borderRadius:9, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Recalibrate</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes ringPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.2)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ── AI Pattern Recognition Test ──
function AIPatternRecognitionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('capture'); // capture | analyzing | results
  const [progress, setProgress] = React.useState(0);
  const [findings, setFindings] = React.useState([]);
  const [scanFrame, setScanFrame] = React.useState(0);

  const FINDINGS = [
    { category:'Optic Disc Analysis',     status:'normal',    confidence:96, details:'Cup-to-disc ratio: 0.3 (Normal range)', severity:'none' },
    { category:'Retinal Vessel Analysis', status:'normal',    confidence:94, details:'No arteriovenous nicking detected',      severity:'none' },
    { category:'Macula Assessment',       status:'attention', confidence:87, details:'Subtle drusen detected — recommend monitoring', severity:'mild' },
    { category:'Hemorrhage Detection',    status:'normal',    confidence:98, details:'No retinal hemorrhages identified',      severity:'none' },
    { category:'RNFL Thickness',          status:'normal',    confidence:91, details:'Within normal limits bilaterally',       severity:'none' },
    { category:'Diabetic Retinopathy',    status:'normal',    confidence:99, details:'No diabetic changes detected',           severity:'none' },
    { category:'Glaucoma Screening',      status:'attention', confidence:82, details:'Optic nerve head asymmetry — monitor',  severity:'mild' },
  ];

  const startAnalysis = () => {
    setPhase('analyzing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setFindings(FINDINGS); setPhase('results'); return 100; }
        setScanFrame(f => f+1);
        return p + 1.5;
      });
    }, 80);
  };

  const statusColors = { normal:'#10b981', attention:'#f59e0b', warning:'#ef4444' };
  const scanY = ((scanFrame * 2) % 200);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0e1a', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:`linear-gradient(135deg,${accent},#8b5cf6)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'white' }}>AI Pattern Recognition</div>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>
        {/* Left: Image capture / analysis */}
        <div style={{ flex:'1 1 55%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, gap:20 }}>
          {/* Simulated fundus image */}
          <div style={{ width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle at 60% 40%, #3d1a00, #1a0800)', border:`3px solid ${accent}40`, position:'relative', overflow:'hidden' }}>
            {/* Retinal vessels */}
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ position:'absolute', inset:0 }}>
              <path d="M120 120 Q80 80 40 60" stroke="#8B0000" strokeWidth="2" fill="none" opacity="0.6"/>
              <path d="M120 120 Q160 80 200 60" stroke="#8B0000" strokeWidth="2" fill="none" opacity="0.6"/>
              <path d="M120 120 Q100 160 60 180" stroke="#8B0000" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <path d="M120 120 Q140 160 180 180" stroke="#8B0000" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <path d="M120 120 Q90 110 70 90 Q55 75 45 65" stroke="#8B0000" strokeWidth="1" fill="none" opacity="0.4"/>
              <circle cx="160" cy="120" r="18" fill="#cc6600" opacity="0.7"/>
              <circle cx="160" cy="120" r="8" fill="#ff8800" opacity="0.9"/>
            </svg>
            {/* AI scan overlay */}
            {phase === 'analyzing' && (
              <>
                <div style={{ position:'absolute', left:0, right:0, height:2, background:`${accent}80`, top:scanY, transition:'none' }}/>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle, ${accent}15, transparent 70%)`, animation:'aiPulse 1.5s ease infinite' }}/>
              </>
            )}
            {phase === 'results' && (
              <div style={{ position:'absolute', inset:0, border:`2px solid #10b981`, borderRadius:'50%', animation:'none' }}/>
            )}
          </div>

          {phase === 'capture' && (
            <button onClick={startAnalysis} style={{ padding:'14px 36px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#8b5cf6)`, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0"/></svg>
              Analyze with AI
            </button>
          )}

          {phase === 'analyzing' && (
            <div style={{ textAlign:'center', width:'100%', maxWidth:300 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'white', marginBottom:8 }}>AI Analysis in Progress</div>
              <div style={{ height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, marginBottom:8 }}>
                <div style={{ width:`${progress}%`, height:'100%', background:`linear-gradient(90deg,${accent},#8b5cf6)`, borderRadius:3, transition:'width 0.2s' }}/>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{Math.round(progress)}% complete</div>
            </div>
          )}

          {phase === 'results' && (
            <div style={{ display:'flex', gap:12 }}>
              <button style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#8b5cf6)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>
              <button onClick={() => { setPhase('capture'); setProgress(0); setFindings([]); }} style={{ padding:'10px 20px', borderRadius:9, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Scan</button>
            </div>
          )}
        </div>

        {/* Right: Findings */}
        <div style={{ flex:'0 0 320px', borderLeft:'1px solid rgba(255,255,255,0.08)', padding:20, overflowY:'auto' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>AI Findings</div>
          {phase === 'capture' && (
            <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, textAlign:'center', marginTop:40 }}>Start analysis to see AI findings</div>
          )}
          {phase === 'analyzing' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {Array.from({length:4}).map((_,i) => (
                <div key={i} style={{ height:56, background:'rgba(255,255,255,0.04)', borderRadius:10, animation:'shimmer 1.5s ease infinite', animationDelay:`${i*0.2}s` }}/>
              ))}
            </div>
          )}
          {phase === 'results' && findings.map((f,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'12px 14px', marginBottom:8, border:`1px solid ${statusColors[f.status]}30` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'white' }}>{f.category}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:`${statusColors[f.status]}20`, color:statusColors[f.status] }}>
                  {f.status === 'normal' ? '✓ Normal' : f.status === 'attention' ? '⚠ Review' : '✗ Alert'}
                </span>
              </div>
              <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>{f.details}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.1)', borderRadius:2 }}>
                  <div style={{ width:`${f.confidence}%`, height:'100%', background:statusColors[f.status], borderRadius:2 }}/>
                </div>
                <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.4)' }}>{f.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes aiPulse{0%,100%{opacity:0.3}50%{opacity:0.7}} @keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:0.7}}`}</style>
    </div>
  );
}

Object.assign(window, { ExtraocularMotilityTest, VisualReactionTimeTest, EyeTrackingAccuracyTest, AIPatternRecognitionTest });
