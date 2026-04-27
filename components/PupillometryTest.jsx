
// PupillometryTest.jsx — Interactive pupillometry exam screen

function PupillometryTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [phase, setPhase] = React.useState('ready'); // ready | testing | report
  const [elapsed, setElapsed] = React.useState(0);
  const [lightLevel, setLightLevel] = React.useState('mesopic'); // scotopic | mesopic | photopic
  const [currentEye, setCurrentEye] = React.useState('right');
  const [measurements, setMeasurements] = React.useState({ right: null, left: null });
  const [animFrame, setAnimFrame] = React.useState(0);
  const timerRef = React.useRef(null);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      animRef.current = setInterval(() => setAnimFrame(f => f + 1), 50);
    } else {
      clearInterval(timerRef.current);
      clearInterval(animRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(animRef.current); };
  }, [phase]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const lightLevels = [
    { id:'scotopic',  label:'Scotopic',  lux:'< 0.001 lux', desc:'Dark-adapted',   color:'#8b5cf6' },
    { id:'mesopic',   label:'Mesopic',   lux:'0.001–3 lux', desc:'Dim light',      color:'#1f8eff' },
    { id:'photopic',  label:'Photopic',  lux:'> 3 lux',     desc:'Bright light',   color:'#f59e0b' },
  ];

  const currentLevel = lightLevels.find(l => l.id === lightLevel);

  // Simulated pupil size based on light level + animation
  const basePupilSize = lightLevel === 'scotopic' ? 7.2 : lightLevel === 'mesopic' ? 5.4 : 3.1;
  const breathe = Math.sin(animFrame * 0.08) * 0.15;
  const pupilDiameter = phase === 'testing' ? basePupilSize + breathe : basePupilSize;
  const irisSize = 12; // mm
  const containerSize = 160;
  const scaleFactor = containerSize / irisSize;

  const captureMeasurement = () => {
    const val = (basePupilSize + (Math.random() * 0.4 - 0.2)).toFixed(1);
    setMeasurements(m => ({ ...m, [currentEye]: val }));
    if (currentEye === 'right') setCurrentEye('left');
    else setPhase('report');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ width:1, height:20, background:'#e5e7eb' }}/>
        <div style={{ width:28, height:28, borderRadius:7, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill={accent}/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Pupillometry Test</div>
          <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Patient: Marcus Williams · {currentLevel.label} condition</div>
        </div>
        <div style={{ flex:1 }}/>
        {phase === 'testing' && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1.2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:accent }}>{fmtTime(elapsed)}</span>
          </div>
        )}
        <div style={{ display:'flex', gap:8 }}>
          {phase === 'ready' && <button onClick={() => setPhase('testing')} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>Begin Test</button>}
          {phase === 'testing' && <>
            <button onClick={() => setPhase('ready')} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Pause</button>
            <button onClick={captureMeasurement} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:'#10b981', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Capture {currentEye === 'right' ? 'OD' : 'OS'}
            </button>
          </>}
          {phase === 'report' && <button onClick={() => { setPhase('ready'); setMeasurements({right:null,left:null}); setElapsed(0); setCurrentEye('right'); }} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Test</button>}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Left: Pupil Viewer */}
        <div style={{ flex:'1 1 60%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, padding:24 }}>

          {/* Light level selector */}
          <div style={{ display:'flex', gap:8 }}>
            {lightLevels.map(l => (
              <button key={l.id} onClick={() => setLightLevel(l.id)} style={{
                padding:'6px 16px', borderRadius:20, border:`1.5px solid ${lightLevel===l.id ? l.color : '#e5e7eb'}`,
                background: lightLevel===l.id ? l.color : '#fff', color: lightLevel===l.id ? '#fff' : '#6b7280',
                fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
              }}>{l.label}</button>
            ))}
          </div>

          {/* Eye toggle */}
          <div style={{ display:'flex', gap:8 }}>
            {[['right','OD Right'],['left','OS Left']].map(([val,label]) => (
              <button key={val} onClick={() => setCurrentEye(val)} style={{
                padding:'5px 14px', borderRadius:20, border:`1.5px solid ${currentEye===val ? accent : '#e5e7eb'}`,
                background: currentEye===val ? accent : '#fff', color: currentEye===val ? '#fff' : '#6b7280',
                fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
              }}>{label}{measurements[val] && ` · ${measurements[val]}mm`}</button>
            ))}
          </div>

          {/* Pupil Simulation */}
          <div style={{ position:'relative', width:containerSize + 60, height:containerSize + 60, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {/* Outer glow rings */}
            {phase === 'testing' && [1,2,3].map(i => (
              <div key={i} style={{
                position:'absolute', borderRadius:'50%',
                width: containerSize + i*24, height: containerSize + i*24,
                border:`1px solid ${currentLevel.color}${String(Math.round(30/i)).padStart(2,'0')}`,
                animation: `ripple ${1.5 + i*0.3}s ease-out infinite`,
                animationDelay: `${i*0.2}s`
              }}/>
            ))}
            {/* Iris */}
            <div style={{
              width:containerSize, height:containerSize, borderRadius:'50%', position:'relative', overflow:'hidden',
              background:`radial-gradient(circle at 40% 35%, #5c4033, #3d2b1f 40%, #1a0f0a)`,
              boxShadow:`0 0 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.4)`,
              border: `3px solid ${currentLevel.color}40`
            }}>
              {/* Iris texture lines */}
              {[...Array(12)].map((_,i) => (
                <div key={i} style={{
                  position:'absolute', top:'50%', left:'50%', width:'45%', height:1,
                  background:'rgba(180,120,60,0.15)', transformOrigin:'left center',
                  transform:`rotate(${i*30}deg)`
                }}/>
              ))}
              {/* Pupil */}
              <div style={{
                position:'absolute', top:'50%', left:'50%',
                width: pupilDiameter * scaleFactor, height: pupilDiameter * scaleFactor,
                borderRadius:'50%', background:'#000000',
                transform:'translate(-50%,-50%)',
                transition: phase === 'testing' ? 'none' : 'all 0.8s ease',
                boxShadow:'0 0 12px rgba(0,0,0,0.8)'
              }}>
                {/* Corneal reflex */}
                <div style={{ position:'absolute', top:'18%', left:'22%', width:'18%', height:'18%', borderRadius:'50%', background:'rgba(255,255,255,0.6)' }}/>
              </div>
            </div>

            {/* Diameter indicator */}
            {phase === 'testing' && (
              <div style={{
                position:'absolute', bottom:-32, left:'50%', transform:'translateX(-50%)',
                fontSize:20, fontWeight:700, color:currentLevel.color, whiteSpace:'nowrap'
              }}>
                {pupilDiameter.toFixed(1)} mm
              </div>
            )}
          </div>

          {/* Condition info */}
          <div style={{ display:'flex', gap:16, background:'#fff', borderRadius:12, padding:'12px 20px', border:'1px solid #e5e7eb' }}>
            {[['Condition', currentLevel.desc], ['Light Level', currentLevel.lux], ['Reference', `${(basePupilSize-0.5).toFixed(1)}–${(basePupilSize+0.5).toFixed(1)} mm`]].map(([label, val]) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginTop:3 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Panel */}
        <div style={{ flex:'0 0 240px', borderLeft:'1px solid #e5e7eb', background:'#fff', overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>

          {/* Patient */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Patient</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:accent }}>MW</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Marcus Williams</div>
                <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>ID #4821 · Age 42</div>
              </div>
            </div>
          </div>

          <div style={{ height:1, background:'#f3f4f6' }}/>

          {/* Measurements */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Measurements</div>
            {[['OD (Right)', measurements.right], ['OS (Left)', measurements.left]].map(([label, val]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:8, background:'#f9fafb', marginBottom:6, border:'1px solid #e5e7eb' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{label}</span>
                <span style={{ fontSize:14, fontWeight:700, color: val ? '#111827' : '#d1d5db' }}>{val ? `${val} mm` : '—'}</span>
              </div>
            ))}
            {measurements.right && measurements.left && (
              <div style={{ padding:'8px 10px', borderRadius:8, background:`${accent}08`, border:`1px solid ${accent}25`, marginTop:4 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Anisocoria</div>
                <div style={{ fontSize:14, fontWeight:700, color: Math.abs(measurements.right - measurements.left) > 1 ? '#ef4444' : '#10b981', marginTop:2 }}>
                  {Math.abs(measurements.right - measurements.left).toFixed(1)} mm {Math.abs(measurements.right - measurements.left) > 1 ? '⚠ Significant' : '✓ Normal'}
                </div>
              </div>
            )}
          </div>

          {phase === 'report' && (
            <>
              <div style={{ height:1, background:'#f3f4f6' }}/>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Actions</div>
                <button style={{ width:'100%', padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:8, fontFamily:"'Nunito Sans', sans-serif" }}>Save Results</button>
                <button style={{ width:'100%', padding:'10px 0', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Print Report</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes ripple { 0%{opacity:0.5;transform:scale(0.95)} 100%{opacity:0;transform:scale(1.08)} }
      `}</style>
    </div>
  );
}

Object.assign(window, { PupillometryTest });
