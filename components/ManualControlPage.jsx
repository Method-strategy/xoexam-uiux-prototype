// ManualControlPage.jsx — Device manual control with camera, positioning, and test launcher
// Teal (#05c1bc) accent for manual control action buttons per brand palette

const MC_LANGUAGES = [
  { code:'en', name:'English',    flag:'🇺🇸' },
  { code:'es', name:'Español',    flag:'🇪🇸' },
  { code:'fr', name:'Français',   flag:'🇫🇷' },
  { code:'de', name:'Deutsch',    flag:'🇩🇪' },
  { code:'it', name:'Italiano',   flag:'🇮🇹' },
  { code:'pt', name:'Português',  flag:'🇵🇹' },
  { code:'zh', name:'中文',        flag:'🇨🇳' },
  { code:'ja', name:'日本語',      flag:'🇯🇵' },
  { code:'ko', name:'한국어',      flag:'🇰🇷' },
  { code:'ar', name:'العربية',    flag:'🇸🇦' },
  { code:'hi', name:'हिन्दी',     flag:'🇮🇳' },
  { code:'ru', name:'Русский',    flag:'🇷🇺' },
];

const MC_TESTS = [
  { id:'pupillometry',       name:'Pupillometry Test',       icon:'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' },
  { id:'visual-acuity',      name:'Visual Acuity Test',      icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id:'color-vision',       name:'Color Vision Test',       icon:'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id:'visual-field',       name:'Visual Field Test',       icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id:'aberrometer',        name:'Aberrometer Exam',        icon:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id:'contrast-sensitivity',name:'Contrast Sensitivity',  icon:'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' },
  { id:'extraocular-motility',name:'Extraocular Motility',  icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const MC_PATIENT = { name:'Marcus Williams', id:'XO-3025-0183', device:'xoExam #1' };

function ManualControlPage({ tweaks }) {
  const orange = '#1f8eff';
  const accent = tweaks?.accentColor || '#1f8eff';

  const [zoom, setZoom] = React.useState(100);
  const [focus, setFocus] = React.useState(50);
  const [brightness, setBrightness] = React.useState(50);
  const [contrast, setContrast] = React.useState(50);
  const [language, setLanguage] = React.useState('en');
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isListening, setIsListening] = React.useState(false);
  const [trackPos, setTrackPos] = React.useState({ x:50, y:50 });
  const [trackTarget, setTrackTarget] = React.useState('center');
  const [selectedTest, setSelectedTest] = React.useState('');
  const [showTestLaunched, setShowTestLaunched] = React.useState('');
  const [frame, setFrame] = React.useState(0);

  const recRef = React.useRef(null);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    animRef.current = setInterval(() => setFrame(f=>f+1), 50);
    return () => clearInterval(animRef.current);
  }, []);

  React.useEffect(() => {
    if (isRecording) recRef.current = setInterval(() => setRecordingTime(t=>t+1), 1000);
    else { clearInterval(recRef.current); }
    return () => clearInterval(recRef.current);
  }, [isRecording]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const movePos = (dir) => {
    const step = 10;
    setTrackPos(p => {
      switch(dir) {
        case 'up':    return { x:p.x, y:Math.max(15,p.y-step) };
        case 'down':  return { x:p.x, y:Math.min(85,p.y+step) };
        case 'left':  return { x:Math.max(15,p.x-step), y:p.y };
        case 'right': return { x:Math.min(85,p.x+step), y:p.y };
        case 'center':return { x:50, y:50 };
        default: return p;
      }
    });
  };

  const launchTest = (testId) => {
    const t = MC_TESTS.find(t=>t.id===testId);
    setShowTestLaunched(t?.name||'');
    setTimeout(() => setShowTestLaunched(''), 2000);
  };

  const scanY = (frame*2)%160;
  const pupilR = 24+Math.sin(frame*0.04)*4;
  const langObj = MC_LANGUAGES.find(l=>l.code===language)||MC_LANGUAGES[0];

  // Orange control button
  const OrangeBtn = ({ icon, label, onClick, active, small }) => (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      gap:6, padding:'0 14px',
      height:36,
      borderRadius:8, border:'1.5px solid #d1d5db',
      background: active ? '#1f2937' : '#f8f9fa',
      color: active ? '#fff' : '#374151',
      cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s',
      minHeight:44, boxShadow:'0 1px 2px rgba(0,0,0,0.08)',
      textAlign:'center', whiteSpace:'nowrap'
    }}
    onMouseEnter={e => { if(!active){ e.currentTarget.style.background='#f0f2f5'; e.currentTarget.style.borderColor='#9ca3af'; }}}
    onMouseLeave={e => { if(!active){ e.currentTarget.style.background='#f8f9fa'; e.currentTarget.style.borderColor='#d1d5db'; }}}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}><path d={icon}/></svg>
      {label && <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.04em' }}>{label}</span>}
    </button>
  );

  // Slider control
  const SliderRow = ({ label, value, onChange, min=0, max=100 }) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:700, color:orange }}>{value}{label==='Zoom'?'%':''}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)} style={{ width:'100%', accentColor:orange, cursor:'pointer' }}/>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'20px 20px 12px', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#111827' }}>Manual Device Control</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{MC_PATIENT.name} · {MC_PATIENT.id} · {MC_PATIENT.device}</div>
        </div>
        <div style={{ flex:1 }}/>

        {/* Language selector */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setShowLangMenu(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:700, color:'#374151', fontFamily:"'Nunito Sans', sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {langObj.flag} {langObj.name}
          </button>
          {showLangMenu && (
            <div style={{ position:'absolute', top:'100%', right:0, marginTop:4, background:'#fff', borderRadius:10, border:'1.5px solid #e5e7eb', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:100, width:180, maxHeight:260, overflowY:'auto' }}>
              {MC_LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} style={{ width:'100%', padding:'9px 14px', border:'none', background:language===l.code?`${accent}10`:'transparent', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:language===l.code?700:300, color:language===l.code?accent:'#374151', fontFamily:"'Nunito Sans', sans-serif" }}>
                  <span>{l.flag}</span><span>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice control */}
        <button onClick={() => setIsListening(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, border:`1.5px solid ${isListening?'#ef4444':'#e5e7eb'}`, background:isListening?'#fef2f2':'#fff', color:isListening?'#ef4444':'#374151', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Nunito Sans', sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
          {isListening ? 'Listening...' : 'Voice Control'}
        </button>

        {/* Save session */}
        <button style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Nunito Sans', sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Session
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 320px', overflow:'hidden' }}>

        {/* ── Left: Live Feed ── */}
        <div style={{ display:'flex', flexDirection:'column', padding:'20px 20px 20px', gap:16, overflow:'auto' }}>
          {/* Eye feed */}
          <div style={{ flex:'1 1 auto', background:'#000', borderRadius:14, position:'relative', overflow:'hidden', minHeight:320,
            filter:`brightness(${brightness/100*0.6+0.7}) contrast(${contrast/100*0.6+0.7})` }}>
            {/* Simulated eye with animation */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform:`scale(${zoom/100})` }}>
                {/* Iris */}
                <circle cx={140} cy={140} r={110} fill="url(#mcIris)"/>
                <defs>
                  <radialGradient id="mcIris" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#8B6914"/>
                    <stop offset="40%" stopColor="#5C4011"/>
                    <stop offset="100%" stopColor="#1a0d05"/>
                  </radialGradient>
                </defs>
                {/* Iris fibers */}
                {Array.from({length:18}).map((_,i)=>{
                  const a=i*20*Math.PI/180;
                  return <line key={i} x1={140} y1={140} x2={140+Math.cos(a)*108} y2={140+Math.sin(a)*108} stroke="rgba(180,120,40,0.12)" strokeWidth={1}/>;
                })}
                {/* Pupil */}
                <circle cx={140} cy={140} r={pupilR} fill="#000"/>
                {/* Corneal reflex */}
                <circle cx={120} cy={116} r={10} fill="rgba(255,255,255,0.5)"/>
                <circle cx={155} cy={124} r={5} fill="rgba(255,255,255,0.25)"/>
                {/* Scan line */}
                <line x1={10} y1={scanY+60} x2={270} y2={scanY+60} stroke={`${accent}70`} strokeWidth={1.5}/>
                {/* Tracking circle - follows trackPos */}
                <circle cx={trackPos.x*2.6} cy={trackPos.y*2.6} r={20} fill="none" stroke={orange} strokeWidth={2.5} strokeDasharray="6 4" opacity={0.8}/>
              </svg>
            </div>
            {/* Corner brackets */}
            {[[0,0,'l','t'],[1,0,'r','t'],[0,1,'l','b'],[1,1,'r','b']].map(([cx2,cy2,h,v],i)=>(
              <div key={i} style={{ position:'absolute', [v==='t'?'top':'bottom']:12, [h==='l'?'left':'right']:12, width:24, height:24, borderTop:v==='t'?`2px solid #05c1bc`:'none', borderBottom:v==='b'?`2px solid #05c1bc`:'none', borderLeft:h==='l'?`2px solid #05c1bc`:'none', borderRight:h==='r'?`2px solid #05c1bc`:'none' }}/>
            ))}
            {/* Tech overlay */}
            <div style={{ position:'absolute', top:12, left:16, fontSize:9, fontWeight:700, color:'#05c1bc', letterSpacing:'0.08em', lineHeight:1.8 }}>
              SCAN MODE: ACTIVE<br/>ZOOM: {zoom}%<br/>FOCUS: AUTO
            </div>
            <div style={{ position:'absolute', top:12, right:16, fontSize:9, fontWeight:700, color:'#05c1bc', letterSpacing:'0.08em', lineHeight:1.8, textAlign:'right' }}>
              QUALITY: OPTIMAL<br/>FPS: 60<br/>RESOLUTION: 4K
            </div>
            {/* Recording badge */}
            {isRecording && (
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-180%)', background:'#ef4444', borderRadius:20, padding:'4px 12px', display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'white', animation:'pulse 1s infinite' }}/>
                <span style={{ color:'white', fontSize:11, fontWeight:700 }}>{fmtTime(recordingTime)}</span>
              </div>
            )}
            {/* Crosshair */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ position:'relative', width:48, height:48 }}>
                <div style={{ position:'absolute', top:0, left:'50%', width:1.5, height:16, background:accent, transform:'translateX(-50%)' }}/>
                <div style={{ position:'absolute', bottom:0, left:'50%', width:1.5, height:16, background:accent, transform:'translateX(-50%)' }}/>
                <div style={{ position:'absolute', left:0, top:'50%', width:16, height:1.5, background:accent, transform:'translateY(-50%)' }}/>
                <div style={{ position:'absolute', right:0, top:'50%', width:16, height:1.5, background:accent, transform:'translateY(-50%)' }}/>
                <div style={{ position:'absolute', inset:8, borderRadius:'50%', border:`1.5px solid ${accent}` }}/>
              </div>
            </div>
          </div>

          {/* Camera controls */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'16px 20px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Camera Controls</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div>
                <SliderRow label="Zoom" value={zoom} onChange={setZoom} min={50} max={400}/>
                <SliderRow label="Focus" value={focus} onChange={setFocus}/>
              </div>
              <div>
                <SliderRow label="Brightness" value={brightness} onChange={setBrightness}/>
                <SliderRow label="Contrast" value={contrast} onChange={setContrast}/>
              </div>
            </div>
          </div>
          {/* Capture + Record */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              ['Capture Photo', false, () => {}],
              [isRecording ? `Stop · ${fmtTime(recordingTime)}` : 'Record Video', isRecording, () => { setIsRecording(v=>!v); if(isRecording) setRecordingTime(0); }],
              ['Zoom In',  false, () => setZoom(z=>Math.min(400,z+25))],
              ['Zoom Out', false, () => setZoom(z=>Math.max(50,z-25))],
            ].map(([label, active, onClick]) => (
              <button key={typeof label === 'string' ? label : 'rec'} onClick={onClick} style={{
                padding:'0 16px', height:44, borderRadius:8,
                border:`1.5px solid ${active ? '#1f2937' : '#d1d5db'}`,
                background: active ? '#1f2937' : '#f8f9fa',
                color: active ? '#fff' : '#374151',
                cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif",
                fontSize:11, fontWeight:700, letterSpacing:'0.03em',
                transition:'all 0.15s', whiteSpace:'nowrap',
                boxShadow:'0 1px 2px rgba(0,0,0,0.08)',
                display:'flex', alignItems:'center', justifyContent:'center',
                textAlign:'center'
              }}
              onMouseEnter={e => { if(!active){ e.currentTarget.style.background='#f0f2f5'; e.currentTarget.style.borderColor='#9ca3af'; }}}
              onMouseLeave={e => { if(!active){ e.currentTarget.style.background='#f8f9fa'; e.currentTarget.style.borderColor='#d1d5db'; }}}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Controls Panel ── */}
        <div style={{ borderLeft:'1px solid #e5e7eb', background:'#f9fafb', display:'flex', flexDirection:'column', overflow:'auto' }}>

          {/* Directional Position Control */}
          <div style={{ padding:16, borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Position Control</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, maxWidth:160, margin:'0 auto' }}>
              <div/>
              <OrangeBtn icon="5 15l7-7 7 7" onClick={() => movePos('up')}/>
              <div/>
              <OrangeBtn icon="15 19l-7-7 7-7" onClick={() => movePos('left')}/>
              <button onClick={() => movePos('center')} style={{ borderRadius:9, border:`1.5px solid ${orange}40`, background:`${orange}12`, color:orange, cursor:'pointer', fontSize:9, fontWeight:700, padding:'8px 2px', fontFamily:"'Nunito Sans', sans-serif" }}>CENTER</button>
              <OrangeBtn icon="9 5l7 7-7 7" onClick={() => movePos('right')}/>
              <div/>
              <OrangeBtn icon="19 9l-7 7-7-7" onClick={() => movePos('down')}/>
              <div/>
            </div>
          </div>

          {/* Eye Tracking Target */}
          <div style={{ padding:16, borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Tracking Target</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {['Center','Iris','Macula','Optic Nerve','Cornea'].map(t => {
                const id = t.toLowerCase().replace(' ','-');
                return (
                  <button key={id} onClick={() => setTrackTarget(id)} style={{ padding:'8px 12px', borderRadius:8, border:`1.5px solid ${trackTarget===id?orange:orange+'30'}`, background:trackTarget===id?orange:`${orange}08`, color:trackTarget===id?'#fff':orange, fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Positions */}
          <div style={{ padding:16, borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Quick Positions</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {['Superior','Inferior','Nasal','Temporal'].map(p => (
                <button key={p} onClick={() => {
                  const positions = { Superior:{x:50,y:25}, Inferior:{x:50,y:75}, Nasal:{x:30,y:50}, Temporal:{x:70,y:50} };
                  setTrackPos(positions[p]);
                }} style={{ padding:'7px 6px', borderRadius:8, border:`1px solid ${orange}30`, background:`${orange}08`, color:orange, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Patient Metrics */}
          <div style={{ padding:16, borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Patient Metrics</div>
            {[['IPD','63.5 mm'],['Right Pupil','4.2 mm'],['Left Pupil','4.1 mm'],['IOP Right','15 mmHg'],['IOP Left','14 mmHg'],['VA Right','20/20'],['VA Left','20/25']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f3f4f6' }}>
                <span style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{k}</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#111827' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Quick Test Launcher */}
          <div style={{ padding:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Launch Test</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {MC_TESTS.map(t => (
                <button key={t.id} onClick={() => launchTest(t.id)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                  borderRadius:8, border:`1px solid ${orange}25`, background:'#fff',
                  cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif",
                  color:'#374151', fontSize:11, fontWeight:300, transition:'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background=`${orange}10`; e.currentTarget.style.borderColor=`${orange}60`; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor=`${orange}25`; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2" strokeLinecap="round"><path d={t.icon}/></svg>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showTestLaunched && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#111827', color:'white', padding:'10px 20px', borderRadius:10, fontSize:12, fontWeight:700, zIndex:1000, boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
          Starting {showTestLaunched}...
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

Object.assign(window, { ManualControlPage });
