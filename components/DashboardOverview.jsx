// DashboardOverview.jsx — Elevated precision-instrument aesthetic
// Clean data density · #1f8eff primary · navy anchors · purposeful color

function StatCard({ icon, label, value, sub, color, trend, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#fff' : '#fff',
        borderRadius:14, padding:'18px 20px',
        cursor: onClick ? 'pointer' : 'default',
        border:`1.5px solid ${hov ? color+'60' : '#e8eaed'}`,
        transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hov ? `0 8px 28px ${color}18, 0 2px 8px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hov ? 'translateY(-3px)' : 'none',
        flex:1, minWidth:0, position:'relative', overflow:'hidden'
      }}>
      {/* Background accent glow */}
      {hov && <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${color}18, transparent 70%)`, pointerEvents:'none' }}/>}

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background:`linear-gradient(135deg, ${color}22, ${color}10)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          border:`1px solid ${color}25`
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
        </div>
        {trend && (
          <span style={{ fontSize:10, fontWeight:700, color: trend.startsWith('↑')?'#10b981':'#f59e0b', background: trend.startsWith('↑')?'#f0fdf4':'#fffbeb', padding:'2px 7px', borderRadius:20, border:`1px solid ${trend.startsWith('↑')?'#bbf7d0':'#fde68a'}` }}>{trend}</span>
        )}
      </div>
      <div style={{ fontSize:30, fontWeight:700, color:'#0d1117', lineHeight:1, letterSpacing:'-0.02em', marginBottom:5 }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#9ca3af', fontWeight:300, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ patientData, examData, accent, green, days }) {
  const maxVal = Math.max(...patientData);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
      {days.map((day, i) => {
        const pVal = patientData[i];
        const eVal = examData[i];
        const isToday = i === days.length - 1;
        return (
          <div key={day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:90 }}>
              <div style={{
                flex:1, borderRadius:'4px 4px 0 0',
                height:`${(pVal/maxVal)*88}%`,
                background: isToday ? accent : `${accent}38`,
                minHeight:4, transition:'height 0.4s ease'
              }}/>
              <div style={{
                flex:1, borderRadius:'4px 4px 0 0',
                height:`${(eVal/maxVal)*88}%`,
                background: isToday ? green : `${green}38`,
                minHeight:4, transition:'height 0.4s ease'
              }}/>
            </div>
            <span style={{ fontSize:9, fontWeight: isToday?700:300, color: isToday?accent:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}

function DashboardOverview({ onNavigate, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const navy = '#0e2f5e';
  const teal = '#05c1bc';
  const green = '#75d647';
  const lightBlue = '#66ccff';

  const days = ['M','T','W','T','F','S','T'];
  const weekData  = [35,42,41,47,45,52,48];
  const examData  = [12,15,14,16,15,18,17];

  const appointments = [
    { id:'a1', name:'John Carter',   initials:'JC', doctor:'Dr. Taylor',   time:'9:00 AM',  type:'Follow-up OCT',   status:'confirmed' },
    { id:'a2', name:'Amelia Wright', initials:'AW', doctor:'Dr. Patel',    time:'10:30 AM', type:'First Evaluation', status:'confirmed' },
    { id:'a3', name:'Hiro Tanaka',   initials:'HT', doctor:'Dr. Taylor',   time:'11:45 AM', type:'IOP Check',        status:'pending'   },
    { id:'a4', name:'Sara Okonkwo',  initials:'SO', doctor:'Dr. Patel',    time:'2:00 PM',  type:'Visual Acuity',    status:'confirmed' },
    { id:'a5', name:'Marcus Lee',    initials:'ML', doctor:'Dr. Williams', time:'3:15 PM',  type:'Color Vision',     status:'pending'   },
  ];

  const alerts = [
    { id:'al1', device:'xoExam 204', status:'Offline',          type:'error',   time:'8:42 AM',   color:'#ef4444' },
    { id:'al2', device:'xoExam 107', status:'Calibration Due',  type:'warning', time:'Yesterday', color:'#f59e0b' },
    { id:'al3', device:'xoExam 312', status:'Firmware Ready',   type:'info',    time:'Now',       color:accent    },
  ];

  const quickActions = [
    { label:'New Exam',      icon:'M12 5v14M5 12h14',                                          action:'tests'    },
    { label:'Add Patient',   icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14',    action:'patients' },
    { label:'Live Feed',     icon:'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', action:'live-feed' },
    { label:'Devices',       icon:'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', action:'devices' },
  ];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  const dateStr = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:18, minHeight:'100%', boxSizing:'border-box' }}>

      {/* ── Page header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Dashboard Overview</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0d1117', margin:0, letterSpacing:'-0.02em' }}>Good morning, Dr. Jessica</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#9ca3af', margin:'5px 0 0', lineHeight:1.5 }}>{dateStr} · {timeStr}</p>
        </div>

        {/* Quick actions */}
        <div style={{ display:'flex', gap:8 }}>
          {quickActions.map(qa => (
            <button key={qa.label} onClick={() => onNavigate(qa.action)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:5,
              padding:'10px 16px', borderRadius:11, border:'1.5px solid #e8eaed',
              background:'#fff', cursor:'pointer', fontSize:10, fontWeight:700, color:'#374151',
              textTransform:'uppercase', letterSpacing:'0.07em', transition:'all 0.18s',
              fontFamily:"'Nunito Sans', sans-serif", minHeight:44
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=accent; e.currentTarget.style.color=accent; e.currentTarget.style.background=`${accent}08`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 18px ${accent}20`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e8eaed'; e.currentTarget.style.color='#374151'; e.currentTarget.style.background='#fff'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={qa.icon}/></svg>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <StatCard
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          label="Patients Today" value="45" sub="8 new registrations" trend="↑ 8%" color={teal} onClick={() => onNavigate('patients')}/>
        <StatCard
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          label="Appointments" value="7" sub="2 pending · 5 confirmed" trend="↑ 3" color={accent} onClick={() => onNavigate('appointments')}/>
        <StatCard
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          label="Exams Today" value="18" sub="Avg 24 min per exam" trend="↑ 3" color={green} onClick={() => onNavigate('tests')}/>
        <StatCard
          icon="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
          label="Devices Online" value="6/8" sub="1 offline · 1 calibrating" color="#f59e0b" onClick={() => onNavigate('devices')}/>
      </div>

      {/* ── Middle row: Chart + Appointments ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Activity chart */}
        <div style={{ background:'#fff', borderRadius:14, padding:'20px 22px', border:'1.5px solid #e8eaed', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0d1117', letterSpacing:'-0.01em' }}>Practice Activity</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:2 }}>This week · patients & exams</div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              {[['Patients', accent], ['Exams', green]].map(([l,c]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                  <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <BarChart patientData={weekData} examData={examData} accent={accent} green={green} days={days}/>

          {/* Week totals */}
          <div style={{ display:'flex', gap:20, marginTop:16, paddingTop:16, borderTop:'1px solid #f0f2f5' }}>
            {[['Total Patients', weekData.reduce((a,b)=>a+b,0), accent], ['Total Exams', examData.reduce((a,b)=>a+b,0), green], ['Avg Daily', Math.round(weekData.reduce((a,b)=>a+b,0)/7), '#9ca3af']].map(([l,v,c]) => (
              <div key={l}>
                <div style={{ fontSize:18, fontWeight:700, color:c, letterSpacing:'-0.02em' }}>{v}</div>
                <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div style={{ background:'#fff', borderRadius:14, padding:'20px 22px', border:'1.5px solid #e8eaed', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0d1117', letterSpacing:'-0.01em' }}>Today's Schedule</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:2 }}>5 appointments · 2 pending</div>
            </div>
            <button onClick={() => onNavigate('appointments')} style={{ fontSize:11, fontWeight:700, color:accent, border:'none', background:'none', cursor:'pointer', padding:'5px 10px', borderRadius:7, fontFamily:"'Nunito Sans', sans-serif", transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=`${accent}10`}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>View all →</button>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6, overflowY:'auto' }}>
            {appointments.map(apt => (
              <div key={apt.id} style={{
                display:'flex', alignItems:'center', gap:11, padding:'9px 11px',
                borderRadius:9, border:'1.5px solid transparent',
                cursor:'pointer', transition:'all 0.15s', background:'#fafbfc'
              }}
              onMouseEnter={e => { e.currentTarget.style.background=`${accent}08`; e.currentTarget.style.borderColor=`${accent}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background='#fafbfc'; e.currentTarget.style.borderColor='transparent'; }}
              >
                <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${accent}40,${accent}20)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:accent, flexShrink:0, border:`1.5px solid ${accent}25` }}>
                  {apt.initials}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{apt.name}</div>
                  <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>{apt.type}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#374151' }}>{apt.time}</div>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase',
                    color: apt.status==='confirmed'?'#10b981':'#f59e0b' }}>{apt.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Device alerts ── */}
      <div style={{ background:'#fff', borderRadius:14, padding:'18px 22px', border:'1.5px solid #e8eaed', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0d1117', letterSpacing:'-0.01em' }}>Device Status</div>
          <button onClick={() => onNavigate('devices')} style={{ fontSize:11, fontWeight:700, color:accent, border:'none', background:'none', cursor:'pointer', padding:'5px 10px', borderRadius:7, fontFamily:"'Nunito Sans', sans-serif", transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background=`${accent}10`}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>Manage devices →</button>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {alerts.map(a => (
            <div key={a.id} onClick={() => onNavigate('devices')} style={{
              flex:1, display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
              borderRadius:11, background:`${a.color}07`,
              border:`1.5px solid ${a.color}25`,
              cursor:'pointer', transition:'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background=`${a.color}12`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${a.color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.background=`${a.color}07`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ width:38, height:38, borderRadius:10, background:`${a.color}18`, border:`1px solid ${a.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round">
                  {a.type==='error'
                    ? <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>
                    : a.type==='warning'
                    ? <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                    : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                  }
                </svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.device}</div>
                <div style={{ fontSize:11, fontWeight:300, color:a.color }}>{a.status}</div>
              </div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', flexShrink:0 }}>{a.time}</div>
            </div>
          ))}

          {/* Healthy devices summary */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderRadius:11, background:'#f0fdf4', border:'1.5px solid #bbf7d0' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#dcfce7', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>6 Devices Operational</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#10b981' }}>All systems normal</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { DashboardOverview });
