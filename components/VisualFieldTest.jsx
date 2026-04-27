// VisualFieldTest.jsx — Full feature parity with local reference
// Flow: Eye Selection → Config Dialog → Pattern Selection → Foveal Calibration → Conducting → Report

const VF_MONOCULAR_PATTERNS = [
  { id:'10-1',  name:'10-1',               desc:'Central Vision',       tag:'Monocular' },
  { id:'10-2',  name:'10-2',               desc:'Central Vision',       tag:'Monocular' },
  { id:'24-1',  name:'24-1',               desc:'Standard Field',       tag:'Monocular' },
  { id:'24-2',  name:'24-2',               desc:'Standard Field',       tag:'Monocular' },
  { id:'30-2',  name:'30-2',               desc:'Extended Field',       tag:'Monocular' },
  { id:'screen',name:'Screening / Rapid', desc:'Functional Field',     tag:'Monocular' },
  { id:'gold',  name:'Goldmann / Kinetic', desc:'Motion Field',         tag:'Monocular' },
];
const VF_BINOCULAR_PATTERNS = [
  { id:'ester', name:'Functional Esterman',         desc:'Binocular Field',     tag:'Binocular' },
  { id:'mest',  name:'Modified Esterman (Central)', desc:'Functional Field',    tag:'Binocular' },
  { id:'fdp',   name:'FDP (Freq Doubling)',          desc:'Early Glaucoma',      tag:'Binocular' },
  { id:'cfdp',  name:'Combined FDP Mode',           desc:'Integrated Function', tag:'Binocular' },
];

// Mock sensitivity data for report
const VF_LEFT_DATA = {
  grid: [[30,32,33,34,33,32,30],[31,33,35,36,35,33,31],[29,32,34,35,34,32,29],[30,33,null,33,30,null,null],[29,31,33,34,33,31,29],[28,30,32,32,30,28,null],[27,29,30,29,27,null,null]],
  md: -3.24, psd: 4.16, vfi: 87, fp: 8, fn: 12, fl: 5
};
const VF_RIGHT_DATA = {
  grid: [[29,31,32,33,32,31,29],[30,32,34,35,34,32,30],[28,31,33,34,33,31,28],[null,null,29,32,null,32,29],[28,30,32,33,32,30,28],[null,27,29,31,29,27,26],[null,null,26,28,28,26,25]],
  md: -4.12, psd: 5.23, vfi: 83, fp: 6, fn: 15, fl: 8
};

function VFSensGrid({ data, accent }) {
  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      <circle cx={110} cy={110} r={108} fill="#e5e7eb" stroke="#6b7280" strokeWidth={1.5}/>
      <line x1={110} y1={2} x2={110} y2={218} stroke="#9ca3af" strokeWidth={0.8}/>
      <line x1={2} y1={110} x2={218} y2={110} stroke="#9ca3af" strokeWidth={0.8}/>
      {data.grid.map((row, r) => row.map((val, c) => {
        if (val === null) return null;
        const x = 40 + c * 24, y = 40 + r * 24;
        const dist = Math.sqrt((x-110)**2 + (y-110)**2);
        if (dist > 105) return null;
        const isMissed = val < 20;
        return (
          <circle key={`${r}-${c}`} cx={x} cy={y} r={isMissed?7:4}
            fill={isMissed?'#1f2937': val>=30?'#d1d5db':val>=25?'#9ca3af':val>=20?'#6b7280':'#374151'}/>
        );
      }))}
      <circle cx={110} cy={110} r={5} fill="#1f2937"/>
    </svg>
  );
}

function VisualFieldTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';

  // ── State ──
  const [phase, setPhase] = React.useState('eye-selection');
  // eye-selection | config | pattern | foveal | conducting | report
  const [eye, setEye] = React.useState(null);
  const [pattern, setPattern] = React.useState(null);
  const [showConfig, setShowConfig] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);

  // Config settings
  const [cfg, setCfg] = React.useState({
    stimulusSize: 'III', strategy: 'SITA-Fast', pattern: '24-2',
    brightness: 50, contrast: 50, resultFormat: 'standard'
  });

  // Lens controls
  const [lens, setLens] = React.useState({
    left:  { sph: 0.00, cyl: 0.00, axis: 0 },
    right: { sph: 0.00, cyl: 0.00, axis: 0 },
  });

  // Test progress
  const [progress, setProgress] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [gazeErrors, setGazeErrors] = React.useState(0);
  const [responses, setResponses] = React.useState(0);
  const [notDetected, setNotDetected] = React.useState(0);
  const [testingEye, setTestingEye] = React.useState('left');
  const [dotFlash, setDotFlash] = React.useState(null);

  const timerRef = React.useRef(null);
  const progressRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'conducting') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      progressRef.current = setInterval(() => {
        setProgress(p => Math.min(p + 0.8, 100));
        setResponses(r => Math.min(r + 1, 54));
        setGazeErrors(g => Math.min(g + (Math.random() > 0.97 ? 1 : 0), 12));
        setNotDetected(n => Math.min(n + (Math.random() > 0.95 ? 1 : 0), 8));
        setDotFlash({ r: Math.floor(Math.random() * 7), c: Math.floor(Math.random() * 7) });
      }, 300);
    } else {
      clearInterval(timerRef.current);
      clearInterval(progressRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(progressRef.current); };
  }, [phase]);

  React.useEffect(() => {
    if (progress >= 100) {
      clearInterval(progressRef.current);
      if (eye === 'both' && testingEye === 'left') {
        setTimeout(() => { setTestingEye('right'); setProgress(0); setResponses(0); setGazeErrors(0); setNotDetected(0); }, 500);
      } else {
        setTimeout(() => setPhase('report'), 500);
      }
    }
  }, [progress]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const adjustLens = (side, field, delta) => {
    setLens(prev => {
      const val = prev[side][field] + delta;
      const clamped = field === 'axis' ? ((val % 181) + 181) % 181 : parseFloat(val.toFixed(2));
      return { ...prev, [side]: { ...prev[side], [field]: clamped } };
    });
  };

  const allPatterns = VF_MONOCULAR_PATTERNS.concat(VF_BINOCULAR_PATTERNS);
  const patternName = allPatterns.find(p => p.id === pattern)?.name || pattern;
  const eyeLabel = eye === 'both' ? 'Both Eyes (OU)' : eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)';

  // ── Lens stepper ──
  const LensField = ({ side, field, step, label }) => {
    const val = lens[side][field];
    const display = field === 'axis' ? `${val}` : (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    return (
      <div style={{ flex:1 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{label}</div>
        <input type="text" readOnly value={display} style={{ width:'100%', padding:'5px 4px', border:'1px solid #d1d5db', borderRadius:5, fontSize:11, fontWeight:700, textAlign:'center', color:'#111827', background:'#fff', marginBottom:3 }}/>
        <div style={{ display:'flex', gap:2 }}>
          <button onClick={() => adjustLens(side, field, -step)} style={{ flex:1, padding:'3px 0', border:'1px solid #d1d5db', borderRadius:4, background:'#f9fafb', cursor:'pointer', fontSize:11, color:'#374151' }}>▲</button>
          <button onClick={() => adjustLens(side, field, step)} style={{ flex:1, padding:'3px 0', border:'1px solid #d1d5db', borderRadius:4, background:'#f9fafb', cursor:'pointer', fontSize:11, color:'#374151' }}>▼</button>
        </div>
      </div>
    );
  };

  // ── Gaze bar ──
  const GazeBar = ({ label, value, max, color }) => {
    const filled = Math.round((value / max) * 40);
    return (
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:6 }}>{label}</div>
        <div style={{ display:'flex', gap:1, position:'relative', height:28, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
          {Array.from({length:40}).map((_, i) => (
            <div key={i} style={{ flex:1, height:'100%', background: i < filled ? color : '#e5e7eb', borderRight:'1px solid white' }}/>
          ))}
          {label === 'Responses' && (
            <div style={{
              position:'absolute', top:4, bottom:4, width:12, height:20, borderRadius:'50%', background:'#111827',
              left:`${Math.min((value/max)*100, 97)}%`, transition:'left 0.3s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)'
            }}/>
          )}
        </div>
      </div>
    );
  };

  // ── Visual field dot pattern ──
  const FieldPattern = ({ flash }) => (
    <svg width={280} height={280} viewBox="0 0 280 280">
      <circle cx={140} cy={140} r={138} fill="white" stroke="#d1d5db" strokeWidth={1.5}/>
      <line x1={140} y1={2} x2={140} y2={278} stroke="#e5e7eb" strokeWidth={1}/>
      <line x1={2} y1={140} x2={278} y2={140} stroke="#e5e7eb" strokeWidth={1}/>
      {Array.from({length:10}).map((_, row) => Array.from({length:10}).map((_, col) => {
        const x = 42 + col * 22, y = 42 + row * 22;
        const dist = Math.sqrt((x-140)**2 + (y-140)**2);
        if (dist > 135) return null;
        const isFlash = flash && flash.r === row && flash.c === col;
        return (
          <circle key={`${row}-${col}`} cx={x} cy={y} r={isFlash ? 6 : 3}
            fill={isFlash ? '#fff' : '#9ca3af'} stroke={isFlash ? accent : 'none'} strokeWidth={isFlash?2:0}/>
        );
      }))}
      <circle cx={140} cy={140} r={5} fill="#9ca3af"/>
      <text x={140} y={270} textAnchor="middle" fontSize={9} fill="#9ca3af">-.- mm</text>
    </svg>
  );

  // ══════════════════════════════════════════
  // RENDER: EYE SELECTION
  // ══════════════════════════════════════════
  if (phase === 'eye-selection') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Visual Field Test</div>
        <div style={{ flex:1 }}/>
        <button onClick={() => eye && setShowConfig(true)} disabled={!eye} style={{ padding:'8px 20px', borderRadius:9, border:'none', background: eye ? `linear-gradient(135deg,${accent},#155bcc)` : '#e5e7eb', color: eye ? '#fff' : '#9ca3af', fontSize:12, fontWeight:700, cursor: eye ? 'pointer' : 'default', fontFamily:"'Nunito Sans', sans-serif" }}>
          CONTINUE
        </button>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e5e7eb', padding:48, maxWidth:560, width:'100%', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:'0 0 8px' }}>Select Eye to Test</h2>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'0 0 32px' }}>Choose which eye(s) to include in this visual field examination.</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            {[['left','OS','Left Eye'],['right','OD','Right Eye'],['both','OU','Both Eyes']].map(([val,code,label]) => (
              <button key={val} onClick={() => setEye(val)} style={{
                padding:'28px 16px', borderRadius:14, border:`2px solid ${eye===val?accent:'#e5e7eb'}`,
                background: eye===val?`${accent}10`:'#fff', cursor:'pointer', textAlign:'center',
                boxShadow: eye===val?`0 4px 16px ${accent}25`:'none', transition:'all 0.2s', fontFamily:"'Nunito Sans', sans-serif"
              }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background: eye===val?accent:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color: eye===val?'#fff':'#6b7280' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"/>
                    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>
                  </svg>
                </div>
                <div style={{ fontSize:18, fontWeight:700, color: eye===val?accent:'#374151' }}>{code}</div>
                <div style={{ fontSize:12, fontWeight:300, color:'#6b7280', marginTop:4 }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Config Dialog */}
      {showConfig && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, maxWidth:520, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', maxHeight:'80vh', overflow:'auto' }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>Exam Configuration</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Stimulus Size */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Stimulus Size</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['I','II','III','IV','V'].map(s => (
                    <button key={s} onClick={() => setCfg(c=>({...c,stimulusSize:s}))} style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1.5px solid ${cfg.stimulusSize===s?accent:'#e5e7eb'}`, background:cfg.stimulusSize===s?accent:'#fff', color:cfg.stimulusSize===s?'#fff':'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Strategy */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Exam Strategy</label>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {['SITA-Fast','SITA-Standard','Full Threshold','SWAP'].map(s => (
                    <button key={s} onClick={() => setCfg(c=>({...c,strategy:s}))} style={{ padding:'10px 14px', borderRadius:8, border:`1.5px solid ${cfg.strategy===s?accent:'#e5e7eb'}`, background:cfg.strategy===s?`${accent}10`:'#fff', color:cfg.strategy===s?accent:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif" }}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Brightness + Contrast */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[['brightness','Brightness'],['contrast','Contrast']].map(([field,label]) => (
                  <div key={field}>
                    <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>{label}: {cfg[field]}%</label>
                    <input type="range" min={0} max={100} value={cfg[field]} onChange={e => setCfg(c=>({...c,[field]:+e.target.value}))} style={{ width:'100%' }}/>
                  </div>
                ))}
              </div>
              {/* Result Format */}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Result Format</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Standard','Advanced','Research'].map(f => (
                    <button key={f} onClick={() => setCfg(c=>({...c,resultFormat:f.toLowerCase()}))} style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1.5px solid ${cfg.resultFormat===f.toLowerCase()?accent:'#e5e7eb'}`, background:cfg.resultFormat===f.toLowerCase()?accent:'#fff', color:cfg.resultFormat===f.toLowerCase()?'#fff':'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={() => setShowConfig(false)} style={{ padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => { setShowConfig(false); setPhase('pattern'); }} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════
  // RENDER: PATTERN SELECTION
  // ══════════════════════════════════════════
  if (phase === 'pattern') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={() => setPhase('eye-selection')} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Select Exam Pattern</div>
        <div style={{ flex:1 }}/>
        <button onClick={() => pattern && setPhase('foveal')} disabled={!pattern} style={{ padding:'8px 20px', borderRadius:9, border:'none', background: pattern?`linear-gradient(135deg,${accent},#155bcc)`:'#e5e7eb', color: pattern?'#fff':'#9ca3af', fontSize:12, fontWeight:700, cursor:pattern?'pointer':'default', fontFamily:"'Nunito Sans', sans-serif" }}>
          CONTINUE
        </button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:24 }}>
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:28, maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>Select Exam Pattern</h2>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'0 0 24px' }}>
            {eye === 'both' ? 'Choose the visual field test pattern for both eyes' : `Choose the visual field test pattern for ${eye} eye`}
          </p>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Monocular Patterns</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {VF_MONOCULAR_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setPattern(p.id)} style={{
                  padding:'14px 16px', borderRadius:10, border:`1.5px solid ${pattern===p.id?accent:'#e5e7eb'}`,
                  background:pattern===p.id?`${accent}10`:'#fff', cursor:'pointer', textAlign:'left',
                  fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s'
                }}>
                  <div style={{ fontSize:13, fontWeight:700, color:pattern===p.id?accent:'#111827', marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:6 }}>{p.desc}</div>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:10, background:'#f3f4f6', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>{p.tag}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Binocular Patterns</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {VF_BINOCULAR_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setPattern(p.id)} style={{
                  padding:'14px 16px', borderRadius:10, border:`1.5px solid ${pattern===p.id?accent:'#e5e7eb'}`,
                  background:pattern===p.id?`${accent}10`:'#fff', cursor:'pointer', textAlign:'left',
                  fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s'
                }}>
                  <div style={{ fontSize:13, fontWeight:700, color:pattern===p.id?accent:'#111827', marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:6 }}>{p.desc}</div>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:10, background:`${accent}15`, color:accent, textTransform:'uppercase', letterSpacing:'0.06em' }}>{p.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  // RENDER: FOVEAL CALIBRATION
  // ══════════════════════════════════════════
  if (phase === 'foveal') {
    const eyeForFoveal = eye === 'both' ? 'Both Eyes' : eye === 'right' ? 'Right Eye' : 'Left Eye';
    const brightnessLevels = [100, 80, 60, 40];
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
        <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={() => setPhase('pattern')} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Foveal Threshold Calibration</div>
          <div style={{ flex:1 }}/>
          <button onClick={() => { setTestingEye(eye==='right'?'right':'left'); setPhase('conducting'); }} style={{ padding:'8px 20px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
            START CALIBRATION
          </button>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:24 }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:40, maxWidth:700, margin:'0 auto' }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>{eyeForFoveal} — Foveal Threshold</h2>
            <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'0 0 40px', lineHeight:1.6 }}>
              Instruct the patient to focus on the 4 yellow dots and press the button each time they see a white dot in the center.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
              {/* Crosshair */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width={280} height={280} viewBox="0 0 280 280">
                  <line x1={0} y1={140} x2={280} y2={140} stroke={accent} strokeWidth={1.5}/>
                  <line x1={140} y1={0} x2={140} y2={280} stroke={accent} strokeWidth={1.5}/>
                  <circle cx={140} cy={140} r={60} fill="none" stroke={accent} strokeWidth={1.5}/>
                  {/* Yellow fixation dots */}
                  {[[80,80],[200,80],[80,200],[200,200]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r={6} fill="#eab308"/>
                  ))}
                  {/* Center flash dot */}
                  <circle cx={140} cy={140} r={5} fill="white" stroke={accent} strokeWidth={1.5}/>
                </svg>
              </div>
              {/* Brightness levels */}
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {brightnessLevels.map((level, i) => (
                  <div key={level} style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:`${accent}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{level}%</div>
                      <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>Brightness Level</div>
                    </div>
                    <div style={{ width:48, height:20, borderRadius:4, background:`rgba(0,0,0,${level/100})`, border:'1px solid #e5e7eb' }}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: CONDUCTING
  // ══════════════════════════════════════════
  if (phase === 'conducting') {
    const isComplete = progress >= 100;
    const testEyeLabel = testingEye === 'left' ? 'Left Eye (OS)' : 'Right Eye (OD)';
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff', fontFamily:"'Nunito Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={() => setShowCancel(true)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Visual Field Exam</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>Marcus Williams</div>
          <div style={{ flex:1 }}/>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1.2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:accent }}>{fmtTime(elapsed)}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'auto', padding:24 }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{eye==='both'?testEyeLabel:eyeLabel}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>Pattern: {patternName} · Strategy: {cfg.strategy}</div>
          </div>

          {/* Main 2-column layout */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            {/* Left: Eye feed + lens controls */}
            <div>
              {/* Eye feed */}
              <div style={{ background:'#000', borderRadius:12, overflow:'hidden', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', marginBottom:12 }}>
                <div style={{ width:200, height:200, borderRadius:'50%', overflow:'hidden', border:`2px solid ${accent}40`, position:'relative' }}>
                  {/* Simulated eye */}
                  <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 40% 35%, #8B6914 0%, #3d2b1f 40%, #1a0f0a 70%)' }}/>
                  <div style={{ position:'absolute', top:'50%', left:'50%', width:60, height:60, borderRadius:'50%', background:'#050505', transform:'translate(-50%,-50%)' }}>
                    <div style={{ position:'absolute', top:'15%', left:'20%', width:'18%', height:'18%', borderRadius:'50%', background:'rgba(255,255,255,0.5)' }}/>
                  </div>
                  {/* Crosshair overlay */}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <line x1={40} y1={0} x2={40} y2={80} stroke={accent} strokeWidth={1} opacity={0.8}/>
                      <line x1={0} y1={40} x2={80} y2={40} stroke={accent} strokeWidth={1} opacity={0.8}/>
                    </svg>
                  </div>
                </div>
                <div style={{ position:'absolute', bottom:6, left:8, fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Live Eye Feed</div>
              </div>

              {/* xoExam lens controls */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {['left','right'].map(side => (
                  <div key={side} style={{ background:'#f9fafb', borderRadius:10, padding:'10px 12px', border:'1px solid #e5e7eb' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#374151', marginBottom:6 }}>{side==='left'?'Left Eye':'Right Eye'}</div>
                    <div style={{ fontSize:9, fontWeight:700, color:accent, marginBottom:6, textDecoration:'underline' }}>xoExam™:</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <LensField side={side} field="sph" step={0.25} label="SPH"/>
                      <LensField side={side} field="cyl" step={0.25} label="CYL"/>
                      <LensField side={side} field="axis" step={5} label="AXIS"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual field pattern */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb', borderRadius:12, border:'1.5px solid #e5e7eb' }}>
              <FieldPattern flash={dotFlash}/>
            </div>
          </div>

          {/* Gaze tracking bars */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
            <GazeBar label="Gaze Errors" value={gazeErrors} max={20} color="#fca5a5"/>
            <GazeBar label="Responses" value={responses} max={54} color="#c4b5fd"/>
            <GazeBar label="Not Detected" value={notDetected} max={20} color="#d1d5db"/>
          </div>

          {/* Progress bar + controls */}
          <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>
                  {eye==='both'?testEyeLabel:eyeLabel} {isComplete?'— Complete':''}
                </span>
                {isComplete && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:accent }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height:8, background:'#f3f4f6', borderRadius:4, marginBottom:14 }}>
              <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${accent},#155bcc)`, borderRadius:4, transition:'width 0.5s' }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setProgress(0); setResponses(0); setGazeErrors(0); setNotDetected(0); }} style={{ padding:'8px 20px', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                RESTART
              </button>
              <button onClick={() => setPhase('report')} disabled={!isComplete} style={{ padding:'8px 20px', borderRadius:9, border:'none', background: isComplete?`linear-gradient(135deg,${accent},#155bcc)`:'#e5e7eb', color: isComplete?'#fff':'#9ca3af', fontSize:12, fontWeight:700, cursor: isComplete?'pointer':'default', fontFamily:"'Nunito Sans', sans-serif" }}>
                VIEW RESULTS
              </button>
            </div>
          </div>
        </div>

        {/* Cancel dialog */}
        {showCancel && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', borderRadius:16, padding:32, maxWidth:400, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>Cancel Visual Field Test?</h3>
              <p style={{ fontSize:13, fontWeight:300, color:'#6b7280', margin:'0 0 24px', lineHeight:1.6 }}>All progress will be lost.</p>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button onClick={() => setShowCancel(false)} style={{ padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Continue Test</button>
                <button onClick={() => { setShowCancel(false); onBack(); }} style={{ padding:'10px 20px', borderRadius:9, border:'none', background:'#ef4444', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Cancel Test</button>
              </div>
            </div>
          </div>
        )}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: REPORT
  // ══════════════════════════════════════════
  const now = new Date();
  const getInterp = (data) => {
    if (data.md > -2 && data.vfi > 95) return { text:'Within normal limits', color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' };
    if (data.md >= -6 && data.vfi >= 85) return { text:'Mild visual field loss', color:'#d97706', bg:'#fffbeb', border:'#fde68a' };
    if (data.md >= -12 && data.vfi >= 70) return { text:'Moderate visual field loss', color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' };
    return { text:'Advanced visual field loss', color:'#dc2626', bg:'#fef2f2', border:'#fecaca' };
  };

  const eyesToReport = eye === 'both' ? [['left',VF_LEFT_DATA,'OS (Left Eye)'],['right',VF_RIGHT_DATA,'OD (Right Eye)']] :
    eye === 'left' ? [['left',VF_LEFT_DATA,'OS (Left Eye)']] : [['right',VF_RIGHT_DATA,'OD (Right Eye)']];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Visual Field Test — Report</div>
        <div style={{ flex:1 }}/>
        <button style={{ padding:'7px 16px', borderRadius:8, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>EXPORT EXAM</button>
        <button style={{ padding:'7px 16px', borderRadius:8, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>COMPARE EXAM</button>
        <button onClick={() => { setPhase('eye-selection'); setProgress(0); setElapsed(0); setResponses(0); setGazeErrors(0); setNotDetected(0); setEye(null); setPattern(null); }} style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Test</button>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:24 }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
          {/* Patient info */}
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 16px' }}>Patient Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:12 }}>
              {[['Patient Name','Marcus Williams'],['Birthdate','10/11/1983'],['Patient ID','#4821-MW'],['Exam Date',now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, paddingTop:12, borderTop:'1px solid #f3f4f6' }}>
              {[['Exam Type',`VF ${patternName}`],['Strategy',cfg.strategy],['Stimulus Size',`Goldman ${cfg.stimulusSize}`],['Test Duration',fmtTime(elapsed)]].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</div></div>
              ))}
            </div>
          </div>

          {/* Per-eye results */}
          {eyesToReport.map(([side, data, label]) => {
            const interp = getInterp(data);
            return (
              <div key={side} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>{label} Results</h3>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:32, alignItems:'start' }}>
                  {/* Field diagram */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:28, fontWeight:700, color:'#6b7280' }}>{side==='left'?'OS':'OD'}</div>
                    <VFSensGrid data={data} accent={accent}/>
                  </div>
                  {/* Stats */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {/* Clinical interpretation */}
                    <div style={{ padding:14, borderRadius:10, background:interp.bg, border:`1.5px solid ${interp.border}` }}>
                      <div style={{ fontSize:12, fontWeight:700, color:interp.color }}>{interp.text}</div>
                    </div>
                    {/* Indices */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                      {[['MD','Mean Deviation',`${data.md} dB`, data.md<-2?'#ef4444':'#10b981'],['PSD','Pattern SD',`${data.psd} dB`,data.psd>2?'#f59e0b':'#10b981'],['VFI','VF Index',`${data.vfi}%`,data.vfi>85?'#10b981':'#f59e0b']].map(([code,name,val,color]) => (
                        <div key={code} style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
                          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:2 }}>{name}</div>
                          <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{code}</div>
                          <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {/* Reliability */}
                    <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#374151', marginBottom:10 }}>Reliability Indices</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                        {[['False Positives',`${data.fp}%`,data.fp>15?'#ef4444':'#10b981'],['False Negatives',`${data.fn}%`,data.fn>20?'#ef4444':'#10b981'],['Fixation Losses',`${data.fl}%`,data.fl>20?'#ef4444':'#10b981']].map(([l,v,c]) => (
                          <div key={l} style={{ textAlign:'center' }}>
                            <div style={{ fontSize:9, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Test stats */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                      {[['Gaze Errors',gazeErrors],['Responses',responses],['Not Detected',notDetected]].map(([l,v]) => (
                        <div key={l} style={{ background:'#f9fafb', borderRadius:8, padding:'8px 10px', border:'1px solid #e5e7eb', textAlign:'center' }}>
                          <div style={{ fontSize:9, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:16, fontWeight:700, color:'#374151' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', paddingBottom:20 }}>
            <button onClick={() => { setPhase('eye-selection'); setProgress(0); setElapsed(0); setEye(null); setPattern(null); }} style={{ padding:'11px 28px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>New Test</button>
            <button onClick={onBack} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save &amp; Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VisualFieldTest });
