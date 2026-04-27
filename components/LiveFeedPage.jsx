
// LiveFeedPage.jsx — Live exam monitoring grid

const LIVE_EXAMS = [
  { id:'e1', patient:'Sarah Mitchell',  patientId:'P-2024-001', examType:'Visual Acuity',   device:'xoExam #1', location:'Exam Room 1', doctor:'Dr. Alice Brown',    startTime:'14:30', duration:934,  status:'active',    vitals:{ pupil:'4.2mm', pressure:'15 mmHg' } },
  { id:'e2', patient:'James Wilson',    patientId:'P-2024-002', examType:'Pupillometry',    device:'xoExam #2', location:'Exam Room 3', doctor:'Dr. Michael Chen',   startTime:'14:45', duration:730,  status:'active',    vitals:{ pupil:'3.5mm', pressure:'14 mmHg' } },
  { id:'e3', patient:'Maria Garcia',    patientId:'P-2024-003', examType:'Visual Field',    device:'xoExam #3', location:'Exam Room 2', doctor:'Dr. Sarah Williams', startTime:'14:50', duration:525,  status:'paused',    vitals:{ pupil:'3.8mm', pressure:'16 mmHg' } },
  { id:'e4', patient:'Linda Thompson',  patientId:'P-2024-004', examType:'Refraction',      device:'xoExam #6', location:'Exam Room 5', doctor:'Dr. Alice Brown',    startTime:'15:00', duration:370,  status:'active',    vitals:{ pupil:'4.0mm', pressure:'13 mmHg' } },
  { id:'e5', patient:'Robert Kim',      patientId:'P-2024-005', examType:'Keratometry',     device:'xoExam #8', location:'Exam Room 6', doctor:'Dr. Michael Chen',   startTime:'15:10', duration:595,  status:'recording', vitals:{ pupil:'3.2mm', pressure:'17 mmHg' } },
];

// Patient-matched eye photos — one per live feed card
const EYE_FEEDS = [
  { src:'uploads/xo-ui-live-feed-eye-test-eyes_0000_sarah-mitchell.png',  filter:'none' },
  { src:'uploads/xo-ui-live-feed-eye-test-eyes_0001_hames-wilson.png',    filter:'none' },
  { src:'uploads/xo-ui-live-feed-eye-test-eyes_0002_maria-garcia.png',    filter:'none' },
  { src:'uploads/xo-ui-live-feed-eye-test-eyes_0003_linda-thompson.png',  filter:'none' },
  { src:'uploads/xo-ui-live-feed-eye-test-eyes_0004_robert-kim.png',      filter:'none' },
];

function EyeFeed({ status, examType, photoUrl, cssFilter, frame }) {
  const scanY = ((frame * 1.5) % 100);
  const isPaused = status === 'paused';

  return (
    <div style={{ width:'100%', aspectRatio:'16/9', background:'#000', borderRadius:'0 0 10px 10px', position:'relative', overflow:'hidden' }}>

      {/* Real eye photo — zoomed to show full eye including sclera */}
      <img
        src={photoUrl}
        alt="Patient eye feed"
        style={{
          width:'100%', height:'100%', objectFit:'cover',
          objectPosition:'center center',
          width:'100%', height:'100%', objectFit:'cover',
          opacity: isPaused ? 0.45 : 1,
          filter: isPaused ? `grayscale(60%) ${cssFilter||''}` : (cssFilter || 'none'),
          transition:'opacity 0.3s'
        }}
        onError={e => { e.target.style.display='none'; }}
      />

      {/* Diagnostic overlays */}
      {!isPaused && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          {/* Scan line — CSS animation for smooth movement */}
          <div style={{
            position:'absolute', left:0, right:0, height:1.5,
            background:'linear-gradient(90deg, transparent, rgba(31,142,255,0.75) 20%, rgba(31,142,255,0.75) 80%, transparent)',
            animation:'scanline 1.8s linear infinite',
            boxShadow:'0 0 4px rgba(31,142,255,0.4)'
          }}/>
          {/* SVG overlays */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 320 180" preserveAspectRatio="none">
            {/* Corner brackets */}
            <path d="M8 24 L8 8 L24 8" fill="none" stroke="rgba(31,142,255,0.85)" strokeWidth={1.5}/>
            <path d="M296 24 L296 8 L280 8" fill="none" stroke="rgba(31,142,255,0.85)" strokeWidth={1.5}/>
            <path d="M8 156 L8 172 L24 172" fill="none" stroke="rgba(31,142,255,0.85)" strokeWidth={1.5}/>
            <path d="M296 156 L296 172 L280 172" fill="none" stroke="rgba(31,142,255,0.85)" strokeWidth={1.5}/>
            {/* Crosshair */}
            <line x1={150} y1={90} x2={162} y2={90} stroke="rgba(255,255,255,1)" strokeWidth={1.5}/>
            <line x1={178} y1={90} x2={170} y2={90} stroke="rgba(255,255,255,1)" strokeWidth={1.5}/>
            <line x1={160} y1={80} x2={160} y2={82} stroke="rgba(255,255,255,1)" strokeWidth={1.5}/>
            <line x1={160} y1={98} x2={160} y2={100} stroke="rgba(255,255,255,1)" strokeWidth={1.5}/>
            {/* Center dot */}
            <circle cx={160} cy={90} r={2} fill="rgba(255,255,255,1)"/>
            {/* Pupil detection ring */}
            <circle cx={160} cy={90} r={26} fill="none" stroke="rgba(5,193,188,0.95)" strokeWidth={1.5} strokeDasharray="4 3"/>
            {/* Iris detection ring */}
            <circle cx={160} cy={90} r={50} fill="none" stroke="rgba(31,142,255,0.75)" strokeWidth={1.2} strokeDasharray="6 4"/>
          </svg>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'rgba(0,0,0,0.55)', borderRadius:8, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span style={{ fontSize:10, fontWeight:700, color:'#f59e0b', letterSpacing:'0.08em' }}>PAUSED</span>
          </div>
        </div>
      )}

      {/* Bottom overlay: exam type + recording */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 10px 6px', background:'linear-gradient(to top, rgba(0,0,0,0.65), transparent)', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.7)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{examType}</span>
        {status === 'recording' && (
          <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.5)', padding:'2px 7px', borderRadius:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444', animation:'pulse 1s infinite' }}/>
            <span style={{ fontSize:9, fontWeight:700, color:'#ef4444', letterSpacing:'0.08em' }}>REC</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveFeedPage({ tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [filter, setFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('grid');
  const [elapsed, setElapsed] = React.useState(0);
  const [frame, setFrame] = React.useState(0);
  const [expanded, setExpanded] = React.useState(null);

  React.useEffect(() => {
    const id = setInterval(() => { setElapsed(e => e+1); setFrame(f => f+1); }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmtDur = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const filtered = LIVE_EXAMS.filter(e => filter==='all' || e.status===filter);

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Live Feed</h1>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'#fee2e2', border:'1px solid #fca5a5' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#dc2626' }}>{LIVE_EXAMS.filter(e=>e.status==='active'||e.status==='recording').length} Active</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {/* Filter */}
          {[['all','All'],['active','Active'],['paused','Paused'],['recording','Recording']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${filter===val ? accent : '#e5e7eb'}`, background: filter===val ? accent : '#fff', color: filter===val ? '#fff' : '#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Feed grid */}
      <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns: viewMode==='grid' ? 'repeat(auto-fill, minmax(280px,1fr))' : '1fr', gap:14, alignContent:'start' }}>
        {filtered.map(exam => {
          const cfg = { active:{ bg:'#fee2e2', color:'#dc2626', dot:'#ef4444' }, paused:{ bg:'#fef3c7', color:'#d97706', dot:'#f59e0b' }, recording:{ bg:'#fee2e2', color:'#dc2626', dot:'#ef4444' } }[exam.status];
          return (
            <div key={exam.id} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 8px 24px ${accent}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; }}
              onClick={() => setExpanded(expanded===exam.id ? null : exam.id)}
            >
              <EyeFeed status={exam.status} examType={exam.examType} photoUrl={EYE_FEEDS[parseInt(exam.id.replace('e',''))-1].src} cssFilter={EYE_FEEDS[parseInt(exam.id.replace('e',''))-1].filter} frame={frame}/>

              <div style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{exam.patient}</div>
                    <div style={{ fontSize:10, fontWeight:300, color:'#6b7280' }}>{exam.examType} · {exam.location}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 7px', borderRadius:20, background:cfg.bg }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:cfg.dot, animation:'pulse 1.2s infinite' }}/>
                    <span style={{ fontSize:9, fontWeight:700, color:cfg.color, letterSpacing:'0.07em', textTransform:'uppercase' }}>{exam.status}</span>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:14 }}>
                    {Object.entries(exam.vitals).map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>{k==='pupil'?'Pupil':'IOP'}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:accent }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Duration</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#374151', fontVariantNumeric:'tabular-nums' }}>{fmtDur(exam.duration + elapsed)}</div>
                  </div>
                </div>

                <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>{exam.doctor} · {exam.device}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={e => e.stopPropagation()} style={{ width:26, height:26, borderRadius:6, border:`1px solid ${accent}30`, background:`${accent}10`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                    <button onClick={e => e.stopPropagation()} style={{ width:26, height:26, borderRadius:6, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280' }}>
                      {exam.status==='paused'
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes scanline { 0%{top:0%} 100%{top:100%} }`}</style>
    </div>
  );
}

Object.assign(window, { LiveFeedPage });
