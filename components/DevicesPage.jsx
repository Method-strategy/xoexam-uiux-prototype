
// DevicesPage.jsx — Device management

const DEVICES = [
  { id:'XO-1001', name:'xoExam Headset #1', serial:'XO-HD-2024-001', location:'Exam Room 1', status:'connected', battery:87, firmware:'v2.4.1', lastCalibration:'Apr 20, 2026', nextCalibration:'May 20, 2026', patientsToday:12, uptime:99.8, ip:'192.168.1.101', doctor:'Dr. Alice Brown', patient:'Sarah Mitchell', examType:'Visual Acuity', examDuration:'00:14:32' },
  { id:'XO-1002', name:'xoExam Headset #2', serial:'XO-HD-2024-002', location:'Exam Room 3', status:'connected', battery:62, firmware:'v2.4.1', lastCalibration:'Apr 19, 2026', nextCalibration:'May 19, 2026', patientsToday:9,  uptime:98.5, ip:'192.168.1.102', doctor:'Dr. Michael Chen', patient:'James Wilson', examType:'Pupillometry', examDuration:'00:11:45' },
  { id:'XO-1003', name:'xoExam Headset #3', serial:'XO-HD-2024-003', location:'Exam Room 2', status:'paused',    battery:45, firmware:'v2.4.0', lastCalibration:'Apr 18, 2026', nextCalibration:'May 18, 2026', patientsToday:7,  uptime:99.2, ip:'192.168.1.103', doctor:'Dr. Sarah Williams', patient:'Maria Garcia', examType:'Visual Field', examDuration:'00:08:20' },
  { id:'XO-1004', name:'xoExam Headset #4', serial:'XO-HD-2024-004', location:'Exam Room 4', status:'available', battery:94, firmware:'v2.4.1', lastCalibration:'Apr 22, 2026', nextCalibration:'May 22, 2026', patientsToday:0,  uptime:100,  ip:'192.168.1.104', doctor:null, patient:null, examType:null, examDuration:null },
  { id:'XO-1005', name:'xoExam Headset #5', serial:'XO-HD-2024-005', location:'Storage',     status:'available', battery:100,firmware:'v2.4.1', lastCalibration:'Apr 21, 2026', nextCalibration:'May 21, 2026', patientsToday:0,  uptime:100,  ip:'192.168.1.105', doctor:null, patient:null, examType:null, examDuration:null },
  { id:'XO-1006', name:'xoExam Headset #6', serial:'XO-HD-2024-006', location:'Exam Room 5', status:'connected', battery:73, firmware:'v2.4.1', lastCalibration:'Apr 17, 2026', nextCalibration:'May 17, 2026', patientsToday:11, uptime:97.8, ip:'192.168.1.106', doctor:'Dr. Alice Brown', patient:'Linda Thompson', examType:'Refraction', examDuration:'00:06:10' },
  { id:'XO-1007', name:'xoExam Headset #7', serial:'XO-HD-2024-007', location:'Repair Bay',  status:'offline',   battery:12, firmware:'v2.3.9', lastCalibration:'Apr 01, 2026', nextCalibration:'OVERDUE',       patientsToday:0,  uptime:0,    ip:'—', doctor:null, patient:null, examType:null, examDuration:null },
  { id:'XO-1008', name:'xoExam Headset #8', serial:'XO-HD-2024-008', location:'Exam Room 6', status:'paused',    battery:55, firmware:'v2.4.1', lastCalibration:'Apr 16, 2026', nextCalibration:'May 16, 2026', patientsToday:5,  uptime:98.9, ip:'192.168.1.108', doctor:'Dr. Michael Chen', patient:'Robert Kim', examType:'Keratometry', examDuration:'00:09:55' },
];

const STATUS_CONFIG = {
  connected:  { label:'LIVE',      bg:'#fee2e2', color:'#dc2626', dot:'#ef4444' },
  paused:     { label:'PAUSED',    bg:'#fef3c7', color:'#d97706', dot:'#f59e0b' },
  available:  { label:'Available', bg:'#cffafe', color:'#0891b2', dot:'#06b6d4' },
  offline:    { label:'Offline',   bg:'#f3f4f6', color:'#6b7280', dot:'#9ca3af' },
};

function BatteryBar({ level }) {
  const color = level > 60 ? '#10b981' : level > 30 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:32, height:14, border:`1.5px solid ${color}60`, borderRadius:3, overflow:'hidden', position:'relative' }}>
        <div style={{ width:`${level}%`, height:'100%', background:color, transition:'width 0.3s' }}/>
        <div style={{ position:'absolute', right:-4, top:'50%', transform:'translateY(-50%)', width:3, height:6, background:`${color}80`, borderRadius:'0 2px 2px 0' }}/>
      </div>
      <span style={{ fontSize:10, fontWeight:700, color }}>{level}%</span>
    </div>
  );
}

function DeviceCard({ device, accent, onClick }) {
  const cfg = STATUS_CONFIG[device.status];
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background:'#fff', borderRadius:14, border:`1.5px solid ${hov ? accent : '#e5e7eb'}`,
      boxShadow: hov ? `0 8px 24px ${accent}18` : '0 1px 4px rgba(0,0,0,0.04)',
      transform: hov ? 'translateY(-2px)' : 'none', transition:'all 0.2s', cursor:'pointer',
      overflow:'hidden'
    }}>
      {/* Status bar */}
      <div style={{ height:3, background: device.status==='connected' ? '#ef4444' : device.status==='paused' ? '#f59e0b' : device.status==='available' ? '#06b6d4' : '#9ca3af' }}/>
      <div style={{ padding:'14px 16px' }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{device.name}</div>
            <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', marginTop:2 }}>{device.serial} · {device.location}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:20, background:cfg.bg }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot, animation: device.status==='connected' ? 'pulse 1.2s infinite' : 'none' }}/>
            <span style={{ fontSize:9, fontWeight:700, color:cfg.color, letterSpacing:'0.08em' }}>{cfg.label}</span>
          </div>
        </div>

        {/* Active exam info */}
        {device.patient && (
          <div style={{ background:`${accent}08`, borderRadius:8, padding:'8px 10px', marginBottom:10, border:`1px solid ${accent}20` }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Current Exam</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{device.patient}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{device.examType} · {device.examDuration}</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Today</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{device.patientsToday} pts</div>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Uptime</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{device.uptime}%</div>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>Battery</div>
            <BatteryBar level={device.battery}/>
          </div>
        </div>

        {/* Firmware */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>FW {device.firmware}</span>
          <span style={{ fontSize:10, fontWeight:300, color: device.nextCalibration==='OVERDUE' ? '#ef4444' : '#9ca3af' }}>
            Cal: {device.nextCalibration}
          </span>
        </div>
      </div>
    </div>
  );
}

function DevicesPage({ tweaks, onNavigate }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [filter, setFilter] = React.useState('All');
  const [selected, setSelected] = React.useState(null);

  const counts = {
    All: DEVICES.length,
    Live: DEVICES.filter(d => d.status==='connected').length,
    Paused: DEVICES.filter(d => d.status==='paused').length,
    Available: DEVICES.filter(d => d.status==='available').length,
    Offline: DEVICES.filter(d => d.status==='offline').length,
  };

  const filtered = filter === 'All' ? DEVICES : DEVICES.filter(d => {
    if (filter==='Live') return d.status==='connected';
    if (filter==='Paused') return d.status==='paused';
    if (filter==='Available') return d.status==='available';
    if (filter==='Offline') return d.status==='offline';
    return true;
  });

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Device Management</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>Monitor and manage your xoExam diagnostic headsets</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => onNavigate('calibration')} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Calibrate
          </button>
          <button onClick={() => onNavigate('devices-add-new')} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Device
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display:'flex', gap:10, flexShrink:0 }}>
        {Object.entries(counts).map(([label, count]) => {
          const colors = { All:'#1f8eff', Live:'#ef4444', Paused:'#f59e0b', Available:'#06b6d4', Offline:'#9ca3af' };
          const c = colors[label];
          const isActive = filter === label;
          return (
            <button key={label} onClick={() => setFilter(label)} style={{
              flex:1, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${isActive ? c : '#e5e7eb'}`,
              background: isActive ? `${c}10` : '#fff', cursor:'pointer', textAlign:'center',
              transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
            }}>
              <div style={{ fontSize:18, fontWeight:700, color: isActive ? c : '#111827' }}>{count}</div>
              <div style={{ fontSize:10, fontWeight:700, color: isActive ? c : '#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:12, alignContent:'start' }}>
        {filtered.map(device => (
          <DeviceCard key={device.id} device={device} accent={accent} onClick={() => setSelected(device)}/>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => e.target===e.currentTarget && setSelected(null)}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ background:`linear-gradient(135deg,#0e2f5e,${accent})`, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'white' }}>{selected.name}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.7)' }}>{selected.serial} · {selected.location}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.2)', cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Status', STATUS_CONFIG[selected.status].label], ['IP Address', selected.ip], ['Firmware', selected.firmware], ['Uptime', `${selected.uptime}%`], ['Last Calibration', selected.lastCalibration], ['Next Calibration', selected.nextCalibration]].map(([l,v]) => (
                  <div key={l} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: v==='OVERDUE'?'#ef4444':'#111827' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Calibrate Now</button>
                <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>View Logs</button>
                <button style={{ flex:1, padding:'9px 0', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

Object.assign(window, { DevicesPage });
