
// AnalyticsPage.jsx — Charts and metrics

const WEEKLY = [
  { day:'Mon', exams:89, uptime:99.2, performance:94 },
  { day:'Tue', exams:95, uptime:98.8, performance:92 },
  { day:'Wed', exams:102,uptime:99.5, performance:96 },
  { day:'Thu', exams:87, uptime:98.2, performance:90 },
  { day:'Fri', exams:98, uptime:99.1, performance:95 },
  { day:'Sat', exams:42, uptime:99.8, performance:98 },
  { day:'Sun', exams:28, uptime:99.9, performance:99 },
];

const BY_HOUR = [8,28,35,42,18,15,38,45,32,22].map((v,i) => ({ hour:`${i+8}AM`, exams:v }));

const EXAM_DIST = [
  { name:'Visual Acuity', value:342, color:'#1f8eff' },
  { name:'Pupillometry',  value:256, color:'#05c1bc' },
  { name:'Visual Field',  value:198, color:'#66ccff' },
  { name:'Color Vision',  value:167, color:'#155bcc' },
  { name:'Refraction',    value:145, color:'#75d647' },
  { name:'Other',         value:234, color:'#6366f1' },
];

const DEVICE_PERF = [
  { device:'xoExam #1', uptime:99.8, exams:234, avgTime:12.3, errors:2 },
  { device:'xoExam #2', uptime:98.5, exams:198, avgTime:13.1, errors:5 },
  { device:'xoExam #3', uptime:99.2, exams:267, avgTime:11.8, errors:3 },
  { device:'xoExam #4', uptime:97.8, exams:178, avgTime:14.2, errors:8 },
  { device:'xoExam #6', uptime:99.5, exams:245, avgTime:12.0, errors:1 },
];

function SimpleBarChart({ data, xKey, yKey, color, height=100 }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height, padding:'0 4px' }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, height:'100%', justifyContent:'flex-end' }}>
          <div style={{ width:'100%', borderRadius:'3px 3px 0 0', background:color, height:`${(d[yKey]/max)*85}%`, minHeight:2, transition:'height 0.5s', position:'relative' }}>
          </div>
          <span style={{ fontSize:8, color:'#9ca3af', fontWeight:300, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%', textAlign:'center' }}>{d[xKey]}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size=120 }) {
  const total = data.reduce((s,d) => s+d.value, 0);
  let angle = -90;
  const r = 40, cx = size/2, cy = size/2;
  const slices = data.map(d => {
    const pct = d.value/total;
    const startAngle = angle;
    angle += pct * 360;
    const endAngle = angle;
    const start = { x: cx + r*Math.cos(startAngle*Math.PI/180), y: cy + r*Math.sin(startAngle*Math.PI/180) };
    const end = { x: cx + r*Math.cos(endAngle*Math.PI/180), y: cy + r*Math.sin(endAngle*Math.PI/180) };
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, path:`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`, pct };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i) => <path key={i} d={s.path} fill={s.color} opacity="0.85"/>)}
      <circle cx={cx} cy={cy} r={r*0.55} fill="white"/>
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">{total.toLocaleString()}</text>
      <text x={cx} y={cy+16} textAnchor="middle" fontSize="7" fill="#9ca3af">TOTAL</text>
    </svg>
  );
}

function AnalyticsPage({ tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [tab, setTab] = React.useState('overview');
  const [timeRange, setTimeRange] = React.useState('7days');

  const totalExams = DEVICE_PERF.reduce((s,d)=>s+d.exams,0);
  const avgUptime = (DEVICE_PERF.reduce((s,d)=>s+d.uptime,0)/DEVICE_PERF.length).toFixed(1);
  const totalErrors = DEVICE_PERF.reduce((s,d)=>s+d.errors,0);
  const avgTime = (DEVICE_PERF.reduce((s,d)=>s+d.avgTime,0)/DEVICE_PERF.length).toFixed(1);

  const tabs = ['overview','devices','exams'];

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif", overflowY:'auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Analytics</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>Device performance and exam insights</p>
        </div>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ height:36, padding:'0 12px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:12, color:'#374151', outline:'none', fontFamily:"'Nunito Sans', sans-serif", cursor:'pointer' }}>
          <option value="24hours">Last 24 Hours</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'flex', gap:12, flexShrink:0 }}>
        {[
          { label:'Total Exams', value:totalExams, sub:'↑ 12% vs last week', color:accent, icon:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
          { label:'Avg Uptime',  value:`${avgUptime}%`, sub:'↑ 0.3% vs last week', color:'#10b981', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          { label:'Avg Exam Time',value:`${avgTime}m`, sub:'↓ 0.8m vs last week', color:'#f59e0b', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label:'Total Errors', value:totalErrors, sub:'↓ 3 vs last week',     color:'#ef4444', icon:'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(card => (
          <div key={card.label} style={{ flex:1, background:'#fff', borderRadius:14, padding:'16px 18px', border:'1.5px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${card.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round"><path d={card.icon}/></svg>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:700, color:'#111827', lineHeight:1 }}>{card.value}</div>
            <div style={{ fontSize:11, fontWeight:300, color: card.sub.startsWith('↑') ? '#10b981' : '#ef4444', marginTop:4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'flex', gap:14, flexShrink:0 }}>

        {/* Weekly bar chart */}
        <div style={{ flex:'1 1 50%', background:'#fff', borderRadius:14, padding:18, border:'1.5px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Weekly Exams</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginBottom:14 }}>Total exams per day this week</div>
          <SimpleBarChart data={WEEKLY} xKey="day" yKey="exams" color={accent} height={110}/>
        </div>

        {/* Exam type donut */}
        <div style={{ flex:'1 1 25%', background:'#fff', borderRadius:14, padding:18, border:'1.5px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Exam Types</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginBottom:10 }}>Distribution this period</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <DonutChart data={EXAM_DIST} size={110}/>
            <div style={{ flex:1 }}>
              {EXAM_DIST.slice(0,4).map(d => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }}/>
                  <span style={{ fontSize:10, fontWeight:300, color:'#374151', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.name}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:'#374151' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly usage */}
        <div style={{ flex:'1 1 25%', background:'#fff', borderRadius:14, padding:18, border:'1.5px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Peak Hours</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginBottom:14 }}>Exams by hour of day</div>
          <SimpleBarChart data={BY_HOUR} xKey="hour" yKey="exams" color="#05c1bc" height={110}/>
        </div>
      </div>

      {/* Device performance table */}
      <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', flexShrink:0 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Device Performance</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:0, background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'8px 18px' }}>
          {['Device','Uptime','Exams','Avg Time','Errors'].map(h => (
            <span key={h} style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>
          ))}
        </div>
        {DEVICE_PERF.map((d,i) => (
          <div key={d.device} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', alignItems:'center', padding:'12px 18px', borderBottom: i<DEVICE_PERF.length-1 ? '1px solid #f3f4f6' : 'none' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{d.device}</span>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ flex:1, height:4, background:'#f3f4f6', borderRadius:2, maxWidth:60 }}>
                  <div style={{ width:`${d.uptime}%`, height:'100%', background: d.uptime>99?'#10b981':d.uptime>98?accent:'#f59e0b', borderRadius:2 }}/>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{d.uptime}%</span>
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{d.exams}</span>
            <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{d.avgTime} min</span>
            <span style={{ fontSize:11, fontWeight:700, color: d.errors>5?'#ef4444':d.errors>2?'#f59e0b':'#10b981' }}>{d.errors}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsPage });
