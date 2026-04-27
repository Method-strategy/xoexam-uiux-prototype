// ColorVisionTest.jsx — Ishihara 24-plate + D-15 Farnsworth cap arrangement test

const ISHIHARA_PLATES = [
  { n:1,  correct:'12',  color:'#e63946', bg:'#f1c40f', image:'assets/ishihara-plate1.png' },
  { n:2,  correct:'8',   color:'#2980b9', bg:'#e74c3c', image:'assets/ishihara-plate2.png' },
  { n:3,  correct:'5',   color:'#27ae60', bg:'#e67e22', image:'assets/ishihara-plate3.png' },
  { n:4,  correct:'3',   color:'#8e44ad', bg:'#16a085', image:'assets/ishihara-plate4.png' },
  { n:5,  correct:'57',  color:'#c0392b', bg:'#f39c12' },
  { n:6,  correct:'5',   color:'#1abc9c', bg:'#e74c3c' },
  { n:7,  correct:'3',   color:'#d35400', bg:'#27ae60' },
  { n:8,  correct:'15',  color:'#2ecc71', bg:'#e74c3c' },
  { n:9,  correct:'74',  color:'#e74c3c', bg:'#3498db' },
  { n:10, correct:'2',   color:'#8e44ad', bg:'#f1c40f' },
  { n:11, correct:'6',   color:'#c0392b', bg:'#1abc9c' },
  { n:12, correct:'97',  color:'#27ae60', bg:'#e67e22' },
  { n:13, correct:'45',  color:'#e74c3c', bg:'#2ecc71' },
  { n:14, correct:'5',   color:'#3498db', bg:'#e74c3c' },
  { n:15, correct:'7',   color:'#f39c12', bg:'#8e44ad' },
  { n:16, correct:'16',  color:'#16a085', bg:'#c0392b' },
  { n:17, correct:'73',  color:'#e74c3c', bg:'#27ae60' },
  { n:18, correct:'26',  color:'#9b59b6', bg:'#e67e22' },
  { n:19, correct:'42',  color:'#1abc9c', bg:'#e74c3c' },
  { n:20, correct:'35',  color:'#e74c3c', bg:'#2980b9' },
  { n:21, correct:'96',  color:'#27ae60', bg:'#f39c12' },
  { n:22, correct:'8',   color:'#e67e22', bg:'#16a085' },
  { n:23, correct:'5',   color:'#c0392b', bg:'#2ecc71' },
  { n:24, correct:'2',   color:'#3498db', bg:'#e74c3c' },
];

const D15_CAP_COLORS = [
  '#00A1D6','#4DB8D1','#80C7C3','#A6D2B0','#C7DB97',
  '#E1E07E','#F8E168','#FFD058','#FFB84D','#FF9A4A',
  '#FF7850','#F6535F','#E12C7A','#C015A0','#960EC3',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function IshiharaPlate({ plate, size=180 }) {
  if (plate.image) {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'3px solid #e5e7eb', background:'#f5f5f0' }}>
        <img src={plate.image} alt={`Ishihara Plate ${plate.n}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      </div>
    );
  }

  const dots = React.useMemo(() => {
    const arr = [];
    const seed = plate.n * 137;
    for (let i = 0; i < 220; i++) {
      const x = ((seed*(i+1)*7919)%100);
      const y = ((seed*(i+1)*6271)%100);
      const r = 2 + ((seed*i*3571)%4);
      const distFromCenter = Math.sqrt((x-50)**2+(y-50)**2);
      if (distFromCenter > 48) continue;
      const isNumber = Math.abs(x-50) < 16 && Math.abs(y-50) < 26;
      arr.push({ x, y, r, isNumber });
    }
    return arr;
  }, [plate.n]);

  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', position:'relative', border:'3px solid #e5e7eb', flexShrink:0, background:'#f5f5f0' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {dots.map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r}
            fill={d.isNumber ? plate.color : plate.bg} opacity={0.75+(i%3)*0.08}/>
        ))}
        <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="900"
          fill={plate.color} opacity="0.32" fontFamily="Arial">{plate.correct}</text>
      </svg>
    </div>
  );
}

// ── D-15 Color Test Component ──
function D15ColorTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [available, setAvailable] = React.useState(() =>
    shuffle(Array.from({length:15}, (_,i) => ({ id:i+1, color:D15_CAP_COLORS[i] })))
  );
  const [sequence, setSequence] = React.useState([]);
  const [analysis, setAnalysis] = React.useState('');
  const [analyzed, setAnalyzed] = React.useState(false);
  const [dragIdx, setDragIdx] = React.useState(null);

  const addCap = (cap) => {
    if (sequence.find(c=>c.id===cap.id)) return;
    setSequence(s=>[...s,cap]);
  };

  const removeCap = (id) => setSequence(s=>s.filter(c=>c.id!==id));

  const onDragStart = (idx) => (e) => { setDragIdx(idx); e.dataTransfer.effectAllowed='move'; };
  const onDragOver = (idx) => (e) => { e.preventDefault(); };
  const onDrop = (idx) => (e) => {
    e.preventDefault();
    if (dragIdx===null || dragIdx===idx) return;
    setSequence(s => {
      const next=[...s];
      const [moved]=next.splice(dragIdx,1);
      next.splice(idx,0,moved);
      return next;
    });
    setDragIdx(null);
  };

  const reset = () => {
    setAvailable(shuffle(Array.from({length:15},(_,i)=>({id:i+1,color:D15_CAP_COLORS[i]}))));
    setSequence([]); setAnalysis(''); setAnalyzed(false);
  };

  const analyze = () => {
    if (sequence.length!==15) { setAnalysis('Please arrange all 15 caps before analyzing.'); return; }
    const userOrder = sequence.map(c=>c.id);
    const perfect = userOrder.every((v,i)=>v===i+1);
    if (perfect) { setAnalysis('Normal color vision: Caps ordered correctly (1–15).'); setAnalyzed(true); return; }
    const crossings = [];
    for (let i=0;i<userOrder.length-1;i++) {
      if (Math.abs(userOrder[i]-userOrder[i+1])>5) crossings.push([userOrder[i],userOrder[i+1]]);
    }
    if (!crossings.length) { setAnalysis('Mild deviation — likely normal or minor color defect.'); setAnalyzed(true); return; }
    const protanCaps = new Set([12,13,14]);
    const tritanCaps = new Set([1,2,3]);
    const protanCross = crossings.some(([a,b])=>protanCaps.has(a)||protanCaps.has(b));
    const tritanCross = crossings.some(([a,b])=>tritanCaps.has(a)||tritanCaps.has(b));
    if (protanCross&&!tritanCross) setAnalysis('Possible Protan or Deutan defect detected — red-green color deficiency.');
    else if (tritanCross) setAnalysis('Possible Tritan defect detected — blue-yellow color deficiency.');
    else setAnalysis('Unspecified color vision defect detected. Further clinical testing recommended.');
    setAnalyzed(true);
  };

  // SVG Plot
  const PlotSVG = () => {
    const userOrder = sequence.map(c=>c.id);
    const w=400, h=220, pad=32;
    const xs = i => pad + (i*(w-2*pad))/14;
    const ys = v => h-pad-((v-1)*(h-2*pad))/14;
    const pathD = userOrder.map((v,i)=>`${i===0?'M':'L'}${xs(i)},${ys(v)}`).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width:'100%' }}>
        <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#e5e7eb" strokeWidth={1}/>
        <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#e5e7eb" strokeWidth={1}/>
        {Array.from({length:15},(_,i)=>(
          <text key={i} x={xs(i)} y={h-pad+14} textAnchor="middle" fontSize={9} fill="#9ca3af">{i+1}</text>
        ))}
        {Array.from({length:15},(_,i)=>(
          <text key={i} x={pad-6} y={ys(i+1)+3} textAnchor="end" fontSize={9} fill="#9ca3af">{i+1}</text>
        ))}
        {userOrder.length>1&&<path d={pathD} fill="none" stroke={accent} strokeWidth={2}/>}
        {userOrder.map((v,i)=><circle key={i} cx={xs(i)} cy={ys(v)} r={4} fill={accent}/>)}
        <text x={w/2} y={14} textAnchor="middle" fontSize={10} fill="#374151">D-15 Result: Cap # vs Position</text>
      </svg>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>D-15 Farnsworth Color Arrangement Test</div>
        <div style={{ flex:1 }}/>
        <button onClick={reset} style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Reset</button>
        <button onClick={analyze} disabled={sequence.length!==15} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:sequence.length===15?`linear-gradient(135deg,${accent},#155bcc)`:'#e5e7eb', color:sequence.length===15?'#fff':'#9ca3af', fontSize:11, fontWeight:700, cursor:sequence.length===15?'pointer':'default', fontFamily:"'Nunito Sans', sans-serif" }}>Submit</button>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:20 }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Instructions */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', lineHeight:1.6, margin:0 }}>
              Arrange the 15 colored caps in order of color similarity, starting from the reference cap. Click any cap to add it to your sequence. Drag caps within the sequence to reorder. Click × to remove.
            </p>
          </div>

          {/* Reference cap */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Reference Cap</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:D15_CAP_COLORS[0], border:'2px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}/>
              <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>Cap 1 — start here</div>
            </div>
          </div>

          {/* Available caps */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Available Caps</div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Click a cap to add it →</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {available.map(cap => {
                const selected = sequence.some(c=>c.id===cap.id);
                return (
                  <button key={cap.id} onClick={() => addCap(cap)} disabled={selected} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                    background:'none', border:'none', cursor:selected?'not-allowed':'pointer',
                    opacity:selected?0.3:1, transition:'transform 0.15s', padding:4,
                  }}
                  onMouseEnter={e => !selected && (e.currentTarget.style.transform='scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:cap.color, border:'2px solid rgba(0,0,0,0.08)', boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }}/>
                    <span style={{ fontSize:9, fontWeight:700, color:'#6b7280' }}>{cap.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sequence */}
          <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your Order ({sequence.length}/15)</div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Drag to reorder · Click × to remove</div>
            </div>
            {sequence.length === 0 ? (
              <div style={{ fontSize:12, fontWeight:300, color:'#d1d5db', padding:'20px 0', textAlign:'center' }}>No caps selected yet.</div>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {sequence.map((cap,idx) => (
                  <div key={cap.id} draggable
                    onDragStart={onDragStart(idx)}
                    onDragOver={onDragOver(idx)}
                    onDrop={onDrop(idx)}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'#f9fafb', borderRadius:24, border:'1px solid #e5e7eb', padding:'4px 8px 4px 4px', cursor:'grab', boxShadow:'0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:cap.color, border:'2px solid rgba(0,0,0,0.08)', flexShrink:0 }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{cap.id}</span>
                    <button onClick={() => removeCap(cap.id)} style={{ width:18, height:18, borderRadius:'50%', border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#9ca3af', lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plot + Analysis */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Plot</div>
              {sequence.length>1 ? <PlotSVG/> : <div style={{ fontSize:12, fontWeight:300, color:'#d1d5db', padding:'40px 0', textAlign:'center' }}>Add caps to see plot</div>}
            </div>
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Analysis</div>
              <div style={{ background:'#f9fafb', borderRadius:8, padding:14, minHeight:80, marginBottom:16 }}>
                <p style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.6, margin:0 }}>
                  {analysis || 'Submit to analyze arrangement.'}
                </p>
              </div>
              {analyzed && sequence.length===15 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                    <span style={{ color:'#6b7280', fontWeight:300 }}>Sequence:</span>
                    <span style={{ color:'#374151', fontWeight:700, fontSize:9 }}>{sequence.map(c=>c.id).join(' → ')}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                    <span style={{ color:'#6b7280', fontWeight:300 }}>Caps arranged:</span>
                    <span style={{ color:'#374151', fontWeight:700 }}>{sequence.length}/15</span>
                  </div>
                  <button onClick={onBack} style={{ width:'100%', marginTop:8, padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                    Complete Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Color Vision Test ──
function ColorVisionTest({ onBack, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [testMode, setTestMode] = React.useState(null); // null | 'ishihara' | 'd15'
  const [phase, setPhase] = React.useState('selection');
  const [eye, setEye] = React.useState('OU');
  const [currentPlate, setCurrentPlate] = React.useState(0);
  const [answer, setAnswer] = React.useState('');
  const [answerFocused, setAnswerFocused] = React.useState(false);
  const [responses, setResponses] = React.useState([]);
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    if (phase === 'testing') timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const submitAnswer = (resp) => {
    const plate = ISHIHARA_PLATES[currentPlate];
    const result = resp===''?'Not Read':resp===plate.correct?'Correct':'Incorrect';
    const newResponses = [...responses, { plate:plate.n, correct:plate.correct, answer:resp||'—', result }];
    setResponses(newResponses);
    setAnswer('');
    if (currentPlate < ISHIHARA_PLATES.length-1) setCurrentPlate(c=>c+1);
    else setPhase('results');
  };

  const correctCount = responses.filter(r=>r.result==='Correct').length;
  const total = responses.length;
  const score = total>0?Math.round(correctCount/total*100):0;
  const deficiencyType = score>=85?'Normal Color Vision':score>=60?'Mild Color Deficiency':score>=40?'Moderate Color Deficiency':'Severe Color Deficiency';

  // D-15 mode
  if (testMode === 'd15') return <D15ColorTest onBack={() => setTestMode(null)} tweaks={tweaks}/>;

  // Selection screen
  if (phase === 'selection' || !testMode) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Color Vision Test</div>
        <div style={{ flex:1 }}/>
        <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>Select a test to begin</div>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ maxWidth:680, width:'100%' }}>
          <p style={{ fontSize:14, fontWeight:300, color:'#6b7280', textAlign:'center', margin:'0 0 32px' }}>
            You can start the Color Vision Test with either the left or right eye. Select the type of test below.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Ishihara */}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', cursor:'default' }}>
              <div style={{ display:'flex', gap:8 }}>
                {ISHIHARA_PLATES.slice(0,3).map(p=><IshiharaPlate key={p.n} plate={p} size={64}/>)}
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:6 }}>Ishihara Color Vision Test</div>
                <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', lineHeight:1.6, margin:'0 0 20px' }}>
                  Standard 24-plate test for detecting red-green color vision deficiencies
                </p>
              </div>
              {/* Eye selector */}
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                {[['OD','Right'],['OS','Left'],['OU','Both']].map(([val,label]) => (
                  <button key={val} onClick={() => setEye(val)} style={{ padding:'5px 12px', borderRadius:7, border:`1.5px solid ${eye===val?accent:'#e5e7eb'}`, background:eye===val?accent:'#fff', color:eye===val?'#fff':'#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{val}</button>
                ))}
              </div>
              <button onClick={() => { setTestMode('ishihara'); setPhase('testing'); }} style={{ width:'100%', padding:'11px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                Start Ishihara Test
              </button>
            </div>

            {/* D-15 */}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              {/* D-15 icon */}
              <img src="assets/d15-icon.png" alt="D-15 Color Vision Test" style={{ width:96, height:96, objectFit:'contain' }}/>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:6 }}>D-15 Color Vision Test</div>
                <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', lineHeight:1.6, margin:'0 0 20px' }}>
                  Interactive cap arrangement test for detecting and classifying color vision deficiencies
                </p>
              </div>
              <div style={{ width:'100%', height:44 }}/>
              <button onClick={() => setTestMode('d15')} style={{ width:'100%', padding:'11px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                Launch D-15 Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Ishihara testing phase
  if (phase === 'testing') {
    const plate = ISHIHARA_PLATES[currentPlate];
    return (
      <ExamShell title="Color Vision Test (Ishihara)" accent={accent} onBack={() => { setPhase('selection'); setTestMode(null); setCurrentPlate(0); setResponses([]); }}
        phase="testing" elapsed={elapsed}
        onFinish={() => setPhase('results')}
        rightPanel={
          <div style={{ padding:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Progress</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#111827', marginBottom:4 }}>{currentPlate+1} / {ISHIHARA_PLATES.length}</div>
            <div style={{ height:6, background:'#f3f4f6', borderRadius:3, marginBottom:16 }}>
              <div style={{ width:`${(currentPlate/ISHIHARA_PLATES.length)*100}%`, height:'100%', background:accent, borderRadius:3, transition:'width 0.3s' }}/>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Previous</div>
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {responses.slice(-6).reverse().map((r,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 8px', borderRadius:7, background:r.result==='Correct'?'#f0fdf4':r.result==='Incorrect'?'#fef2f2':'#f9fafb', marginBottom:4, border:`1px solid ${r.result==='Correct'?'#bbf7d0':r.result==='Incorrect'?'#fecaca':'#e5e7eb'}` }}>
                  <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>Plate {r.plate}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:r.result==='Correct'?'#16a34a':r.result==='Incorrect'?'#dc2626':'#6b7280' }}>{r.result}</span>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div style={{ padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Plate {plate.n} of {ISHIHARA_PLATES.length} · Eye: {eye}</div>
          <IshiharaPlate plate={plate} size={240}/>
          <div style={{ fontSize:14, fontWeight:300, color:'#6b7280' }}>What number does the patient see?</div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input value={answer} onChange={e=>setAnswer(e.target.value)}
              onFocus={() => setAnswerFocused(true)} onBlur={() => setAnswerFocused(false)}
              onKeyDown={e=>e.key==='Enter'&&submitAnswer(answer)}
              placeholder="Enter number..."
              style={{ width:180, height:48, borderRadius:10, border:`1.5px solid ${answerFocused?accent:'#e5e7eb'}`, padding:'0 16px', fontSize:18, fontWeight:700, textAlign:'center', outline:'none', background:'#fff', fontFamily:"'Nunito Sans', sans-serif" }}
            />
            <button onClick={() => submitAnswer(answer)} style={{ height:48, padding:'0 20px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Submit</button>
            <button onClick={() => submitAnswer('')} style={{ height:48, padding:'0 16px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Can't Read</button>
          </div>
        </div>
      </ExamShell>
    );
  }

  // Results
  return (
    <ExamShell title="Color Vision Test — Results" accent={accent} onBack={onBack}
      phase="report" onNewTest={() => { setPhase('selection'); setTestMode(null); setCurrentPlate(0); setResponses([]); setElapsed(0); }}
    >
      <div style={{ padding:24, display:'flex', gap:20 }}>
        <div style={{ flex:'0 0 280px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Result Summary</div>
            <div style={{ fontSize:36, fontWeight:700, color:score>=85?'#10b981':score>=60?'#f59e0b':'#ef4444', marginBottom:4 }}>{score}%</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>{deficiencyType}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{correctCount} of {total} plates correct · {fmtTime(elapsed)}</div>
            <div style={{ marginTop:14, height:8, background:'#f3f4f6', borderRadius:4 }}>
              <div style={{ width:`${score}%`, height:'100%', background:score>=85?'#10b981':score>=60?'#f59e0b':'#ef4444', borderRadius:4, transition:'width 0.8s' }}/>
            </div>
          </div>
          <button style={{ padding:'10px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Save Report</button>
        </div>
        <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'60px 80px 80px 80px', gap:0, background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'8px 16px' }}>
            {['Plate','Correct','Given','Result'].map(h => <span key={h} style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>)}
          </div>
          <div style={{ maxHeight:400, overflowY:'auto' }}>
            {responses.map((r,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 80px 80px 80px', alignItems:'center', padding:'8px 16px', borderBottom:'1px solid #f3f4f6', background:i%2===0?'transparent':'#fafafa' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>#{r.plate}</span>
                <span style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{r.correct}</span>
                <span style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{r.answer}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:r.result==='Correct'?'#dcfce7':r.result==='Incorrect'?'#fee2e2':'#f3f4f6', color:r.result==='Correct'?'#16a34a':r.result==='Incorrect'?'#dc2626':'#6b7280', width:'fit-content' }}>{r.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExamShell>
  );
}

Object.assign(window, { ColorVisionTest });
