
// RemainingTests.jsx — Binocular Vision, Accommodation, Convergence, Keratometry, Tear Film,
//                      Fixation Stability, Confrontation
// (Wavefront Aberrometry was extracted to its own standalone file in v0.1.9.)

// ── Generic test shell for simpler tests ──
function SimpleTestShell({ title, accent, onBack, icon, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ width:28, height:28, borderRadius:7, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d={icon}/></svg>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{title}</div>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>{children}</div>
    </div>
  );
}

// ── Binocular Vision Test ──
function BinocularVisionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [score, setScore] = React.useState({ stereo:null, fusion:null, suppression:null });
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const STEREO_LEVELS = ['3000"','1500"','800"','400"','200"','140"','100"','80"','60"','40"'];
  const [stereoLevel, setStereoLevel] = React.useState(0);

  return (
    <ExamShell title="Binocular Vision" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); setStereoLevel(0); setScore({stereo:null,fusion:null,suppression:null}); }}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Results</div>
          {[['Stereo Acuity', score.stereo||'—', STEREO_LEVELS[stereoLevel]], ['Fusion', score.fusion||'—', ''], ['Suppression', score.suppression||'—', '']].map(([k,v,sub]) => (
            <div key={k} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:16, fontWeight:700, color: v!=='—'?'#111827':'#d1d5db' }}>{v !== '—' ? v : sub || '—'}</div>
            </div>
          ))}
          {phase === 'report' && <button style={{ width:'100%', marginTop:4, padding:'9px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>}
        </div>
      }
    >
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
        {phase !== 'report' && <>
          {/* Stereo Acuity */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Stereoacuity Test</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:16 }}>Which circle appears to "float" in front?</div>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:80, height:80, borderRadius:12, background:`${accent}08`, border:`1.5px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  onClick={() => { setScore(s => ({ ...s, stereo:STEREO_LEVELS[stereoLevel] })); if(stereoLevel<9) setStereoLevel(l=>l+1); }}
                >
                  {i === 1 ? '⦿' : '○'}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>Current level:</span>
              <span style={{ fontSize:13, fontWeight:700, color:accent }}>{STEREO_LEVELS[stereoLevel]}</span>
              <div style={{ flex:1, height:4, background:'#f3f4f6', borderRadius:2 }}>
                <div style={{ width:`${(stereoLevel/9)*100}%`, height:'100%', background:accent, borderRadius:2 }}/>
              </div>
            </div>
          </div>

          {/* Fusion */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Fusion Test (Worth 4-Dot)</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:16 }}>How many dots does the patient see?</div>
            <div style={{ display:'flex', gap:10 }}>
              {[['2 dots','Suppression','#ef4444'],['3 dots','Suppression','#f59e0b'],['4 dots','Normal Fusion','#10b981'],['5 dots','Diplopia','#8b5cf6']].map(([label,result,color]) => (
                <button key={label} onClick={() => setScore(s => ({ ...s, fusion:result, suppression:result==='Suppression'?'Present':'Absent' }))}
                  style={{ flex:1, padding:'12px 8px', borderRadius:10, border:`1.5px solid ${score.fusion===result?color:'#e5e7eb'}`, background:score.fusion===result?`${color}12`:'#f9fafb', cursor:'pointer', textAlign:'center', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:score.fusion===result?color:'#374151' }}>{label}</div>
                  <div style={{ fontSize:9, fontWeight:300, color:'#9ca3af', marginTop:3 }}>{result}</div>
                </button>
              ))}
            </div>
          </div>
        </>}

        {phase === 'report' && (
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:16 }}>Binocular Vision Summary</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {[['Stereo Acuity', score.stereo||STEREO_LEVELS[stereoLevel],'arc seconds'],['Binocular Fusion',score.fusion||'Not tested',''],['Suppression',score.suppression||'Not tested','']].map(([k,v,u]) => (
                <div key={k} style={{ background:'#f9fafb', borderRadius:10, padding:'14px 16px', border:'1px solid #e5e7eb', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#111827', marginBottom:4 }}>{v}</div>
                  {u && <div style={{ fontSize:10, color:'#9ca3af' }}>{u}</div>}
                  <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:6 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ExamShell>
  );
}

// ── Accommodation Test ──
function AccommodationTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [eye, setEye] = React.useState('right');
  const [distance, setDistance] = React.useState(40); // cm
  const [results, setResults] = React.useState({ right:null, left:null });
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const amplitude = distance > 0 ? (100/distance).toFixed(2) : 0; // Diopters

  const recordResult = () => {
    setResults(r => ({ ...r, [eye]: { nearPoint: distance, amplitude: parseFloat(amplitude) } }));
    if (eye === 'right') setEye('left');
    else setPhase('report');
  };

  return (
    <ExamShell title="Accommodation" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); setResults({right:null,left:null}); setDistance(40); setEye('right'); }}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Measurements</div>
          {[['OD (Right)', results.right], ['OS (Left)', results.left]].map(([label,r]) => (
            <div key={label} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{label}</div>
              {r ? <>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{r.amplitude} D</div>
                <div style={{ fontSize:10, fontWeight:300, color:'#6b7280' }}>NP: {r.nearPoint}cm</div>
              </> : <div style={{ fontSize:12, color:'#d1d5db' }}>—</div>}
            </div>
          ))}
        </div>
      }
    >
      {phase !== 'report' ? (
        <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
          <div style={{ display:'flex', gap:8 }}>
            {[['right','OD Right'],['left','OS Left']].map(([val,label]) => (
              <button key={val} onClick={() => setEye(val)} style={{ padding:'6px 16px', borderRadius:20, border:`1.5px solid ${eye===val?accent:'#e5e7eb'}`, background:eye===val?accent:'#fff', color:eye===val?'#fff':'#6b7280', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'24px 32px', textAlign:'center', minWidth:320 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Near Point Distance</div>
            <div style={{ fontSize:48, fontWeight:700, color:accent, marginBottom:4 }}>{distance} <span style={{ fontSize:20 }}>cm</span></div>
            <div style={{ fontSize:14, fontWeight:300, color:'#6b7280', marginBottom:20 }}>Amplitude: <strong>{amplitude} D</strong></div>
            <input type="range" min="5" max="100" value={distance} onChange={e => setDistance(Number(e.target.value))}
              style={{ width:'100%', accentColor:accent, marginBottom:16 }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#9ca3af', marginBottom:20 }}>
              <span>5cm (Very close)</span><span>100cm (Arm length)</span>
            </div>
            <button onClick={recordResult} style={{ padding:'12px 32px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Record {eye==='right'?'OD':'OS'} →
            </button>
          </div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', textAlign:'center', maxWidth:360, lineHeight:1.6 }}>
            Move a near target toward the patient until they report the first sustained blur. Record the near point distance.
          </div>
        </div>
      ) : (
        <div style={{ padding:24 }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:16 }}>Accommodation Results</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['OD', results.right], ['OS', results.left]].map(([label,r]) => r && (
                <div key={label} style={{ background:'#f9fafb', borderRadius:10, padding:'16px', border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
                  <div style={{ fontSize:32, fontWeight:700, color:accent }}>{r.amplitude} <span style={{ fontSize:16 }}>D</span></div>
                  <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>Near point: {r.nearPoint}cm</div>
                </div>
              ))}
            </div>
            <button style={{ marginTop:16, padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>
          </div>
        </div>
      )}
    </ExamShell>
  );
}

// ── Convergence Test ──
function ConvergenceTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [elapsed, setElapsed] = React.useState(0);
  const [breakPoint, setBreakPoint] = React.useState(10);
  const [recoveryPoint, setRecoveryPoint] = React.useState(14);
  const [method, setMethod] = React.useState('npc'); // npc | prism
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const isNormal = breakPoint <= 10 && recoveryPoint <= 15;

  return (
    <ExamShell title="Convergence" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); }}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>NPC Results</div>
          <div style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Break Point</div>
            <div style={{ fontSize:20, fontWeight:700, color:breakPoint<=10?'#10b981':'#ef4444' }}>{breakPoint}cm</div>
          </div>
          <div style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Recovery Point</div>
            <div style={{ fontSize:20, fontWeight:700, color:recoveryPoint<=15?'#10b981':'#ef4444' }}>{recoveryPoint}cm</div>
          </div>
          <div style={{ padding:'10px 12px', borderRadius:9, background:isNormal?'#f0fdf4':'#fef2f2', border:`1px solid ${isNormal?'#bbf7d0':'#fecaca'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:isNormal?'#16a34a':'#dc2626' }}>{isNormal?'✓ Normal NPC':'⚠ Receded NPC'}</div>
          </div>
        </div>
      }
    >
      <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
        {/* Method selector */}
        <div style={{ display:'flex', background:'#f3f4f6', borderRadius:20, padding:3, gap:2 }}>
          {[['npc','Near Point of Convergence'],['prism','Prism Bar']].map(([val,label]) => (
            <button key={val} onClick={() => setMethod(val)} style={{ padding:'7px 16px', borderRadius:18, border:'none', cursor:'pointer', background:method===val?'#fff':'transparent', color:method===val?'#111827':'#6b7280', fontSize:11, fontWeight:700, boxShadow:method===val?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
          ))}
        </div>

        {method === 'npc' && (
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'24px 32px', width:'100%', maxWidth:400 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:20 }}>Near Point of Convergence</div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Break Point (diplopia onset)</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="range" min="1" max="40" value={breakPoint} onChange={e=>setBreakPoint(Number(e.target.value))} style={{ flex:1, accentColor:accent }}/>
                <span style={{ fontSize:18, fontWeight:700, color:accent, width:60, textAlign:'right' }}>{breakPoint}cm</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Recovery Point (fusion restored)</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="range" min="1" max="50" value={recoveryPoint} onChange={e=>setRecoveryPoint(Number(e.target.value))} style={{ flex:1, accentColor:accent }}/>
                <span style={{ fontSize:18, fontWeight:700, color:accent, width:60, textAlign:'right' }}>{recoveryPoint}cm</span>
              </div>
            </div>
          </div>
        )}

        {method === 'prism' && (
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'24px 32px', width:'100%', maxWidth:480 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:12 }}>Prism Bar Vergences</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['BI Break','10Δ'],['BI Recovery','6Δ'],['BO Break','18Δ'],['BO Recovery','12Δ']].map(([label,val]) => (
                <div key={label} style={{ background:'#f9fafb', borderRadius:9, padding:'12px', border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{label}</div>
                  <input defaultValue={val} style={{ width:'100%', height:36, borderRadius:8, border:'1.5px solid #e5e7eb', padding:'0 10px', fontSize:14, fontWeight:700, color:accent, outline:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', textAlign:'center', maxWidth:360, lineHeight:1.6 }}>
          Normal NPC: Break ≤10cm, Recovery ≤15cm.<br/>Receded NPC may indicate convergence insufficiency.
        </div>
      </div>
    </ExamShell>
  );
}

// ── Keratometry Test ──
function KeratometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [measuring, setMeasuring] = React.useState(false);
  const [measured, setMeasured] = React.useState({ right:false, left:false });
  const [eye, setEye] = React.useState('right');
  const [scanFrame, setScanFrame] = React.useState(0);
  const results = {
    right: { k1:43.25, k2:44.00, axis:90, astig:0.75, avg:43.63 },
    left:  { k1:42.75, k2:43.50, axis:180, astig:0.75, avg:43.13 }
  };
  const scanRef = React.useRef(null);

  const startMeasure = () => {
    setMeasuring(true);
    scanRef.current = setInterval(() => setScanFrame(f=>f+1), 50);
    setTimeout(() => {
      setMeasuring(false);
      clearInterval(scanRef.current);
      setMeasured(m => ({ ...m, [eye]:true }));
      if (eye === 'right') setEye('left');
    }, 3000);
  };

  const ringR = 60 + Math.sin(scanFrame*0.15)*4;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0e1a', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Keratometry Test</div>
      </div>
      <div style={{ flex:1, display:'flex', gap:0 }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:32 }}>
          <div style={{ display:'flex', gap:10 }}>
            {[['right','OD'],['left','OS']].map(([val,label]) => (
              <button key={val} onClick={() => setEye(val)} style={{ padding:'8px 20px', borderRadius:20, border:`2px solid ${eye===val?accent:'rgba(255,255,255,0.2)'}`, background:eye===val?`${accent}25`:'transparent', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                {measured[val] && <span style={{ color:'#10b981' }}>✓</span>}{label}
              </button>
            ))}
          </div>
          {/* Mire ring simulation */}
          <div style={{ position:'relative', width:200, height:200 }}>
            <svg width={200} height={200} viewBox="0 0 200 200">
              <circle cx={100} cy={100} r={70} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              {[...Array(6)].map((_,i) => (
                <ellipse key={i} cx={100} cy={100} rx={ringR*0.6+i*8} ry={ringR*0.4+i*5} fill="none" stroke={accent} strokeWidth="1.5" opacity={0.6-i*0.08}/>
              ))}
              <circle cx={100} cy={100} r={8} fill={accent} opacity={0.8}/>
              {measuring && <circle cx={100} cy={100} r={80} fill="none" stroke={accent} strokeWidth="1" strokeDasharray="4 4" opacity={0.4} style={{ animation:'spin 4s linear infinite' }}/>}
            </svg>
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 24px', border:'1px solid rgba(255,255,255,0.1)', minWidth:280 }}>
            {measured[eye] ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, textAlign:'center' }}>
                {[['K1',`${results[eye].k1}D`],['K2',`${results[eye].k2}D`],['Axis',`${results[eye].axis}°`],['Astig',`${results[eye].astig}D`]].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:accent }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:12 }}>{measuring ? 'Measuring corneal curvature...' : 'Click to measure'}</div>
            )}
          </div>
          {!measuring && !measured[eye] && (
            <button onClick={startMeasure} style={{ padding:'12px 32px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Measure {eye==='right'?'OD':'OS'}</button>
          )}
        </div>
        <div style={{ width:220, background:'rgba(255,255,255,0.04)', borderLeft:'1px solid rgba(255,255,255,0.08)', padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Measurements</div>
          {[['OD (Right)', results.right, measured.right],['OS (Left)', results.left, measured.left]].map(([label,r,done]) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'12px', border:`1px solid ${done?accent+'40':'rgba(255,255,255,0.08)'}`, marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:done?accent:'rgba(255,255,255,0.4)', marginBottom:6, display:'flex', justifyContent:'space-between' }}>{label}{done&&<span>✓</span>}</div>
              {done ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {[['K1',`${r.k1}D`],['K2',`${r.k2}D`],['Avg',`${r.avg}D`],['Astig',`${r.astig}D`]].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{v}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>Not measured</div>}
            </div>
          ))}
          {measured.right && measured.left && <button style={{ width:'100%', padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Results</button>}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform-origin:100px 100px;transform:rotate(0)}to{transform-origin:100px 100px;transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Tear Film Test ──
function TearFilmTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [method, setMethod] = React.useState('tbut'); // tbut | schirmer
  const [elapsed, setElapsed] = React.useState(0);
  const [tbutOD, setTbutOD] = React.useState(null);
  const [tbutOS, setTbutOS] = React.useState(null);
  const [schirmerOD, setSchirmerOD] = React.useState(null);
  const [schirmerOS, setSchirmerOS] = React.useState(null);
  const [counting, setCounting] = React.useState(false);
  const [countDown, setCountDown] = React.useState(0);
  const [currentEye, setCurrentEye] = React.useState('right');
  const timerRef = React.useRef(null);
  const countRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startCount = () => {
    setCounting(true);
    setCountDown(0);
    countRef.current = setInterval(() => {
      setCountDown(c => {
        if (c >= 30) {
          clearInterval(countRef.current);
          setCounting(false);
          const t = Math.round(8 + Math.random()*12);
          if (method === 'tbut') {
            if (currentEye === 'right') { setTbutOD(t); setCurrentEye('left'); }
            else { setTbutOS(t); }
          } else {
            if (currentEye === 'right') { setSchirmerOD(t); setCurrentEye('left'); }
            else { setSchirmerOS(t); }
          }
          return 30;
        }
        return c+1;
      });
    }, 1000);
  };

  const tbut = method === 'tbut' ? { od:tbutOD, os:tbutOS } : { od:schirmerOD, os:schirmerOS };
  const unit = method === 'tbut' ? 'sec' : 'mm/5min';

  return (
    <ExamShell title="Tear Film" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); setTbutOD(null); setTbutOS(null); setSchirmerOD(null); setSchirmerOS(null); setCurrentEye('right'); }}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Results ({unit})</div>
          {[['OD', tbut.od], ['OS', tbut.os]].map(([label,v]) => (
            <div key={label} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:20, fontWeight:700, color: v ? (v>10?'#10b981':'#ef4444') : '#d1d5db' }}>{v ? `${v} ${unit}` : '—'}</div>
              {v && <div style={{ fontSize:10, color: v>10?'#10b981':'#ef4444' }}>{v>10?'Normal':'Reduced'}</div>}
            </div>
          ))}
        </div>
      }
    >
      <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        {/* Method selector */}
        <div style={{ display:'flex', background:'#f3f4f6', borderRadius:20, padding:3, gap:2 }}>
          {[['tbut','TBUT (Tear Break-Up)'],['schirmer',"Schirmer's Test"]].map(([val,label]) => (
            <button key={val} onClick={() => setMethod(val)} style={{ padding:'7px 16px', borderRadius:18, border:'none', cursor:'pointer', background:method===val?'#fff':'transparent', color:method===val?'#111827':'#6b7280', fontSize:12, fontWeight:700, boxShadow:method===val?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'24px 32px', textAlign:'center', minWidth:340 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>
            {method === 'tbut' ? 'Tear Break-Up Time' : "Schirmer's Wetting Test"}
          </div>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:20, lineHeight:1.6 }}>
            {method === 'tbut'
              ? 'Apply fluorescein, ask patient to blink once, then keep eyes open. Start timer and record time to first dry spot.'
              : "Place filter paper strip at lower lid margin. Record wetting after 5 minutes."}
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:12 }}>
            Testing: {currentEye === 'right' ? 'OD (Right Eye)' : 'OS (Left Eye)'}
          </div>
          {counting ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:48, fontWeight:700, color:accent }}>{countDown}s</div>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:3, width:'100%' }}>
                <div style={{ width:`${(countDown/30)*100}%`, height:'100%', background:accent, borderRadius:3, transition:'width 1s' }}/>
              </div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{method==='tbut'?'Watching for tear break-up...':'Measuring wetting...'}</div>
            </div>
          ) : (
            <button onClick={startCount} disabled={phase !== 'testing'} style={{
              padding:'12px 32px', borderRadius:9, border:'none',
              background: phase==='testing' ? `linear-gradient(135deg,${accent},#155bcc)` : '#d1d5db',
              color:'white', fontSize:14, fontWeight:700, cursor: phase==='testing'?'pointer':'not-allowed', fontFamily:"'Nunito Sans', sans-serif"
            }}>
              {phase!=='testing' ? 'Begin Test First' : `Start ${currentEye==='right'?'OD':'OS'} Timer`}
            </button>
          )}
        </div>
        <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', textAlign:'center', lineHeight:1.6 }}>
          Normal TBUT: &gt;10 seconds · Reduced: &lt;10 seconds indicates dry eye
        </div>
      </div>
    </ExamShell>
  );
}

// ── Fixation Stability Test ──
function FixationStabilityTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [elapsed, setElapsed] = React.useState(0);
  const [dots, setDots] = React.useState([]);
  const [frame, setFrame] = React.useState(0);
  const timerRef = React.useRef(null);
  const dotRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') {
      timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
      dotRef.current = setInterval(() => {
        setFrame(f => f+1);
        setDots(d => [...d.slice(-80), {
          x: 50 + (Math.random()-0.5)*8,
          y: 50 + (Math.random()-0.5)*8,
          t: Date.now()
        }]);
      }, 100);
    } else {
      clearInterval(timerRef.current);
      clearInterval(dotRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(dotRef.current); };
  }, [phase]);

  const stability = dots.length > 10 ? Math.max(60, 95 - dots.reduce((s,d,i,arr) => {
    if (i === 0) return s;
    const dx = d.x-arr[i-1].x, dy = d.y-arr[i-1].y;
    return s + Math.sqrt(dx*dx+dy*dy);
  }, 0)/dots.length*10) : 0;

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <ExamShell title="Fixation Stability" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); setDots([]); }}
      rightPanel={
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Live Metrics</div>
          {[['Stability',`${Math.round(stability)}%`],['Duration',fmtTime(elapsed)],['Samples',dots.length]].map(([k,v]) => (
            <div key={k} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:18, fontWeight:700, color:accent }}>{v}</div>
            </div>
          ))}
          {phase === 'report' && <button style={{ width:'100%', marginTop:4, padding:'9px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>}
        </div>
      }
    >
      <div style={{ padding:24, display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        {/* Fixation plot */}
        <div style={{ width:300, height:300, background:'#0a0e1a', borderRadius:16, border:`2px solid ${accent}30`, position:'relative', overflow:'hidden' }}>
          {/* Target cross */}
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:2, height:30, background:`${accent}80` }}/>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:30, height:2, background:`${accent}80` }}/>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:12, height:12, borderRadius:'50%', border:`2px solid ${accent}`, marginLeft:-6, marginTop:-6 }}/>
          {/* Fixation dots */}
          {dots.map((d,i) => (
            <div key={i} style={{
              position:'absolute', width:4, height:4, borderRadius:'50%',
              background:accent, opacity: 0.2 + (i/dots.length)*0.8,
              left:`${d.x}%`, top:`${d.y}%`, transform:'translate(-50%,-50%)',
              transition:'none'
            }}/>
          ))}
          {phase !== 'testing' && phase !== 'report' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>Begin test to see fixation plot</div>
            </div>
          )}
        </div>
        {phase === 'report' && (
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'16px 24px', textAlign:'center', minWidth:280 }}>
            <div style={{ fontSize:28, fontWeight:700, color:stability>85?'#10b981':'#f59e0b' }}>{Math.round(stability)}%</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Fixation Stability</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:4 }}>
              {stability>85?'Excellent — central fixation maintained':'Good — minor drift detected'}
            </div>
          </div>
        )}
      </div>
    </ExamShell>
  );
}

// ── Confrontation Visual Field ──
function ConfrontationTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready');
  const [eye, setEye] = React.useState('right');
  const [results, setResults] = React.useState({
    right: { superior:null, inferior:null, nasal:null, temporal:null, 'superior-nasal':null, 'superior-temporal':null, 'inferior-nasal':null, 'inferior-temporal':null },
    left:  { superior:null, inferior:null, nasal:null, temporal:null, 'superior-nasal':null, 'superior-temporal':null, 'inferior-nasal':null, 'inferior-temporal':null }
  });
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e=>e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const QUADRANTS = [
    { id:'superior-temporal', label:'ST', angle:-45, r:0.65 },
    { id:'superior',          label:'S',  angle:-90, r:0.65 },
    { id:'superior-nasal',    label:'SN', angle:-135,r:0.65 },
    { id:'temporal',          label:'T',  angle:0,   r:0.65 },
    { id:'nasal',             label:'N',  angle:180, r:0.65 },
    { id:'inferior-temporal', label:'IT', angle:45,  r:0.65 },
    { id:'inferior',          label:'I',  angle:90,  r:0.65 },
    { id:'inferior-nasal',    label:'IN', angle:135, r:0.65 },
  ];
  const cx = 100, cy = 100, R = 70;
  const toXY = (angle, r) => ({ x: cx + Math.cos(angle*Math.PI/180)*R*r, y: cy + Math.sin(angle*Math.PI/180)*R*r });

  const setQuadrant = (quadId, val) => {
    setResults(r => ({ ...r, [eye]: { ...r[eye], [quadId]: val } }));
  };
  const eyeResults = results[eye];
  const allDone = Object.values(eyeResults).every(v => v !== null);

  return (
    <ExamShell title="Confrontation" accent={accent} onBack={onBack}
      phase={phase} elapsed={elapsed}
      onBegin={() => setPhase('testing')}
      onFinish={() => setPhase('report')}
      onNewTest={() => { setPhase('ready'); setElapsed(0); }}
    >
      <div style={{ padding:24, display:'flex', gap:24 }}>
        {/* Eye selector */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Testing Eye</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {[['right','OD Right'],['left','OS Left']].map(([val,label]) => (
              <button key={val} onClick={()=>setEye(val)} style={{ padding:'8px 14px', borderRadius:9, border:`1.5px solid ${eye===val?accent:'#e5e7eb'}`, background:eye===val?`${accent}10`:'#fff', color:eye===val?accent:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
            ))}
          </div>

          {/* Visual field diagram */}
          <svg width={200} height={200} viewBox="0 0 200 200">
            <circle cx={cx} cy={cy} r={R} fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5"/>
            {/* Dividing lines */}
            <line x1={cx-R} y1={cy} x2={cx+R} y2={cy} stroke="#e5e7eb" strokeWidth="1"/>
            <line x1={cx} y1={cy-R} x2={cx} y2={cy+R} stroke="#e5e7eb" strokeWidth="1"/>
            <line x1={cx-R*0.7} y1={cy-R*0.7} x2={cx+R*0.7} y2={cy+R*0.7} stroke="#e5e7eb" strokeWidth="1"/>
            <line x1={cx+R*0.7} y1={cy-R*0.7} x2={cx-R*0.7} y2={cy+R*0.7} stroke="#e5e7eb" strokeWidth="1"/>
            {/* Quadrant buttons */}
            {QUADRANTS.map(q => {
              const pos = toXY(q.angle, q.r);
              const val = eyeResults[q.id];
              const color = val==='normal'?'#10b981':val==='reduced'?'#f59e0b':val==='absent'?'#ef4444':accent;
              return (
                <g key={q.id}>
                  <circle cx={pos.x} cy={pos.y} r={14}
                    fill={val?`${color}20`:`${accent}10`}
                    stroke={val?color:accent}
                    strokeWidth={val?2:1.5}
                    style={{ cursor:'pointer' }}
                    onClick={() => {
                      if(phase!=='testing') return;
                      const cycle = { null:'normal', normal:'reduced', reduced:'absent', absent:null };
                      setQuadrant(q.id, cycle[val]);
                    }}
                  />
                  <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize="8" fontWeight="700" fill={val?color:'#6b7280'}>{q.label}</text>
                </g>
              );
            })}
            {/* Center eye */}
            <circle cx={cx} cy={cy} r={10} fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
            <circle cx={cx} cy={cy} r={4} fill={accent}/>
          </svg>
          <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', marginTop:8, textAlign:'center', lineHeight:1.6 }}>
            Click segments: Normal → Reduced → Absent
          </div>
        </div>

        {/* Legend + summary */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:10 }}>Legend</div>
            {[['normal','Normal',  '#10b981'],['reduced','Reduced','#f59e0b'],['absent','Absent','#ef4444']].map(([k,label,color]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:color }}/>
                <span style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16, flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:10 }}>Quadrant Results</div>
            {QUADRANTS.map(q => {
              const val = eyeResults[q.id];
              const color = val==='normal'?'#10b981':val==='reduced'?'#f59e0b':val==='absent'?'#ef4444':'#d1d5db';
              return (
                <div key={q.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{q.id.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${color}18`, color }}>{val||'—'}</span>
                </div>
              );
            })}
          </div>

          {phase === 'testing' && allDone && (
            <button onClick={() => setPhase('report')} style={{ padding:'10px 0', borderRadius:9, border:'none', background:'#10b981', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Complete Test
            </button>
          )}
          {phase === 'report' && (
            <button style={{ padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Save Report
            </button>
          )}
        </div>
      </div>
    </ExamShell>
  );
}

Object.assign(window, {
  BinocularVisionTest, AccommodationTest, ConvergenceTest,
  KeratometryTest, TearFilmTest, FixationStabilityTest,
  ConfrontationTest
});
