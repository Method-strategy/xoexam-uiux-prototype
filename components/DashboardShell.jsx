// DashboardShell.jsx — Elevated shell: precision instrument aesthetic
// Navy anchor sidebar · #1f8eff primary · clean light header

const NAV_ITEMS = [
  { id:'overview',       label:'Dashboard',      icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id:'live-feed',      label:'Live Feed',       icon:'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id:'manual-control', label:'Manual Control',  icon:'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { id:'devices',        label:'Devices',         icon:'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  { id:'patients',       label:'Patients',        icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'tests',          label:'Tests',           icon:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id:'analytics',      label:'Analytics',       icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id:'inventory',      label:'Inventory',       icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id:'doctor-list',    label:'Doctors',         icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id:'messages',       label:'Messages',        icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id:'compliance',     label:'Compliance',      icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

function NavIcon({ d, size=16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

function DashboardShell({ activeSection, onNavigate, onLogout, children, tweaks }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [notifications, setNotifications] = React.useState(5);
  const [searchVal, setSearchVal] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [devicesOpen, setDevicesOpen] = React.useState(false);
  const [patientsOpen, setPatientsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e) => { if (e.matches) setSidebarOpen(false); else setSidebarOpen(true); };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const accent = tweaks?.accentColor || '#1f8eff';
  const navy = '#0e2f5e';
  const teal = '#05c1bc';

  return (
    <div style={{
      width:'100%', height:'100%', display:'flex', flexDirection:'column',
      fontFamily:"'Nunito Sans', sans-serif", background:'#f0f2f5', overflow:'hidden'
    }}>

      {/* ══════════════════════════════════════════
          TOP HEADER
      ══════════════════════════════════════════ */}
      <header style={{
        height:58, background:'#ffffff',
        borderBottom:'1px solid rgba(0,0,0,0.07)',
        display:'flex', alignItems:'center',
        paddingLeft:0, paddingRight:20, gap:0,
        flexShrink:0, zIndex:30,
        boxShadow:'0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)'
      }}>

        {/* Sidebar toggle — flush with sidebar width */}
        <div style={{
          width: sidebarOpen ? 'clamp(200px,18vw,240px)' : 58,
          transition:'width 0.3s ease',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 12px 0 16px', flexShrink:0, overflow:'hidden'
        }}>
          {sidebarOpen && (
            <div style={{ display:'flex', alignItems:'center', overflow:'hidden', flex:1 }}>
              <img src="assets/xo-exam-logo.png" alt="xoExam" style={{ height:22, objectFit:'contain', flexShrink:0 }}
                onError={e => { e.target.style.display='none'; }}/>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width:32, height:32, borderRadius:7, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', flexShrink:0, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#f0f2f5'; e.currentTarget.style.color=accent; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="15" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width:1, height:32, background:'rgba(0,0,0,0.07)', flexShrink:0 }}/>

        {/* Search */}
        <div style={{ flex:'1 1 0', maxWidth:440, margin:'0 20px', position:'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={searchFocused?accent:'#9ca3af'} strokeWidth="2" strokeLinecap="round"
            style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', transition:'stroke 0.2s' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={searchVal} onChange={e=>setSearchVal(e.target.value)}
            onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
            placeholder="Search patients, tests, devices..."
            style={{
              width:'100%', height:36, borderRadius:9, paddingLeft:36, paddingRight:14,
              fontSize:12, fontWeight:300, color:'#1f2937', outline:'none', boxSizing:'border-box',
              background: searchFocused?'#fff':'#f5f6f8',
              border:`1.5px solid ${searchFocused?accent:'transparent'}`,
              transition:'all 0.2s', fontFamily:"'Nunito Sans', sans-serif"
            }}
          />
          {searchFocused && <kbd style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:9, fontWeight:700, color:'#9ca3af', background:'#f0f2f5', padding:'2px 6px', borderRadius:4, border:'1px solid #e5e7eb' }}>ESC</kbd>}
        </div>

        <div style={{ flex:1 }}/>

        {/* Back to Login — design nav only */}
        <button onClick={() => window.__xoGoToLogin && window.__xoGoToLogin()}
          style={{ padding:'0 12px', height:34, borderRadius:8, border:'1.5px solid #e8eaed', background:'#fff', cursor:'pointer', fontSize:11, fontWeight:300, color:'#9ca3af', fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s', flexShrink:0, marginRight:8 }}
          onMouseEnter={e => { e.currentTarget.style.color='#374151'; e.currentTarget.style.borderColor='#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='#e8eaed'; }}
        >← Login</button>

        {/* Connect Device */}
        <button onClick={() => window.__xoOpenScanner && window.__xoOpenScanner()}
          style={{
            display:'flex', alignItems:'center', gap:7, padding:'0 14px', height:34,
            borderRadius:8, border:`1.5px solid ${accent}`,
            background:`${accent}`, color:'#fff',
            cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.02em',
            fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.2s',
            boxShadow:`0 2px 8px ${accent}30`, flexShrink:0,
            marginRight:8
          }}
          onMouseEnter={e => { e.currentTarget.style.background='#1070d4'; e.currentTarget.style.boxShadow=`0 4px 14px ${accent}45`; }}
          onMouseLeave={e => { e.currentTarget.style.background=accent; e.currentTarget.style.boxShadow=`0 2px 8px ${accent}30`; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8.56 2.9A7 7 0 0119 9v5"/><path d="M8 16H5a2 2 0 01-2-2V9a7 7 0 0112-5"/><circle cx="12" cy="20" r="2"/><line x1="12" y1="10" x2="12" y2="18"/></svg>
          Connect Device
        </button>

        {/* Notification bell */}
        <button onClick={() => setNotifications(0)}
          style={{ position:'relative', width:36, height:36, borderRadius:8, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', marginRight:4, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#f0f2f5'; e.currentTarget.style.color=accent; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          {notifications > 0 && (
            <span style={{ position:'absolute', top:5, right:5, width:14, height:14, borderRadius:'50%', background:'#ef4444', color:'white', fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{notifications}</span>
          )}
        </button>

        {/* Settings */}
        <button onClick={() => onNavigate('settings')}
          style={{ width:36, height:36, borderRadius:8, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', marginRight:8, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#f0f2f5'; e.currentTarget.style.color=accent; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>

        {/* Divider */}
        <div style={{ width:1, height:28, background:'rgba(0,0,0,0.07)', marginRight:12, flexShrink:0 }}/>

        {/* User avatar */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setUserMenuOpen(v=>!v)}
            style={{ display:'flex', alignItems:'center', gap:9, padding:'4px 8px 4px 4px', borderRadius:20, border:'none', background:'transparent', cursor:'pointer', transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#f0f2f5'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg, ${accent}, #155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:700, flexShrink:0, boxShadow:`0 2px 8px ${accent}35` }}>J</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#1f2937', lineHeight:1.2 }}>Dr. Jessica</div>
              <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', lineHeight:1.2 }}>Optometrist</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform:userMenuOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {userMenuOpen && (
            <div style={{ position:'absolute', right:0, top:'100%', marginTop:6, background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:100, minWidth:180, overflow:'hidden' }}
              onMouseLeave={() => setUserMenuOpen(false)}>
              {[['Profile','M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],['Settings','M12 15a3 3 0 100-6 3 3 0 000 6z'],['Help','M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']].map(([label,icon]) => (
                <button key={label} style={{ width:'100%', padding:'10px 14px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:12, fontWeight:300, color:'#374151', fontFamily:"'Nunito Sans', sans-serif", textAlign:'left', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f5f6f8'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round"><path d={icon}/></svg>
                  {label}
                </button>
              ))}
              <div style={{ height:1, background:'#f0f2f5', margin:'4px 0' }}/>
              <button onClick={onLogout} style={{ width:'100%', padding:'10px 14px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:12, fontWeight:700, color:'#ef4444', fontFamily:"'Nunito Sans', sans-serif", textAlign:'left', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════
          BODY: SIDEBAR + MAIN
      ══════════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? 'clamp(200px,18vw,240px)' : 0,
          minWidth: sidebarOpen ? 'clamp(200px,18vw,240px)' : 0,
          background:navy,
          display:'flex', flexDirection:'column',
          transition:'width 0.3s ease, min-width 0.3s ease',
          overflow:'hidden', flexShrink:0, position:'relative', zIndex:10
        }}>

          {/* Subtle top accent bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${accent}, #66ccff, ${accent}00)` }}/>

          {/* Device status indicator */}
          <div style={{ padding:'16px 16px 10px', borderBottom:`1px solid rgba(255,255,255,0.07)`, flexShrink:0 }}>
            <button onClick={() => window.__xoOpenScanner && window.__xoOpenScanner()}
              style={{
                width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid rgba(31,142,255,0.35)`,
                background:'rgba(31,142,255,0.12)', cursor:'pointer',
                display:'flex', alignItems:'center', gap:10,
                fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(31,142,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(31,142,255,0.12)'}
            >
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 0 3px rgba(16,185,129,0.25)', flexShrink:0, animation:'pulse 2s infinite' }}/>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.9)', lineHeight:1.2 }}>xoExam #1 · Online</div>
                <div style={{ fontSize:9, fontWeight:300, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>Battery 87% · Connected</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex:1, overflowY:'auto', padding:'10px 10px', scrollbarWidth:'none' }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id ||
                (item.id === 'devices' && activeSection?.startsWith('devices')) ||
                (item.id === 'patients' && activeSection?.startsWith('patients'));
              const hasSubmenu = item.id === 'devices' || item.id === 'patients';
              const submenuOpen = item.id === 'devices' ? devicesOpen : item.id === 'patients' ? patientsOpen : false;
              const toggleSubmenu = item.id === 'devices' ? () => setDevicesOpen(v=>!v) : item.id === 'patients' ? () => setPatientsOpen(v=>!v) : null;

              return (
                <div key={item.id} style={{ marginBottom:1 }}>
                  <button
                    onClick={() => { if (hasSubmenu) toggleSubmenu(); onNavigate(item.id); }}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'8px 10px', borderRadius:9, border:'none', cursor:'pointer',
                      background: isActive ? `rgba(31,142,255,0.18)` : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontSize:12, fontWeight: isActive ? 700 : 400,
                      transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif", textAlign:'left',
                      position:'relative'
                    }}
                    onMouseEnter={e => { if(!isActive){ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}}
                    onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}}
                  >
                    {/* Active indicator */}
                    {isActive && <div style={{ position:'absolute', left:0, top:6, bottom:6, width:3, borderRadius:'0 3px 3px 0', background:`linear-gradient(180deg, ${accent}, #66ccff)` }}/>}

                    {/* Icon */}
                    <div style={{
                      width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      background: isActive ? accent : 'rgba(255,255,255,0.07)',
                      boxShadow: isActive ? `0 2px 10px ${accent}60` : 'none',
                      transition:'all 0.2s'
                    }}>
                      <NavIcon d={item.icon} size={14}/>
                    </div>

                    <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:12 }}>{item.label}</span>

                    {hasSubmenu && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform:submenuOpen?'rotate(90deg)':'none', transition:'transform 0.2s', opacity:0.4, flexShrink:0 }}>
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    )}
                  </button>

                  {/* Submenu */}
                  {hasSubmenu && submenuOpen && (
                    <div style={{ paddingLeft:18, marginLeft:14, borderLeft:'1px solid rgba(31,142,255,0.25)', marginTop:2, marginBottom:4 }}>
                      {['List','Add New'].map(sub => {
                        const subId = `${item.id}-${sub.toLowerCase().replace(' ','-')}`;
                        const isSubActive = activeSection === subId;
                        return (
                          <button key={sub} onClick={() => onNavigate(subId)} style={{
                            width:'100%', textAlign:'left', padding:'6px 10px', borderRadius:7, border:'none', cursor:'pointer',
                            background: isSubActive?`rgba(31,142,255,0.15)`:'transparent',
                            color: isSubActive?'#66ccff':'rgba(255,255,255,0.35)',
                            fontSize:11, fontWeight: isSubActive?700:300,
                            transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
                          }}
                          onMouseEnter={e => { if(!isSubActive) { e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}}
                          onMouseLeave={e => { if(!isSubActive) { e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}}
                          >{item.label} {sub}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom: version + logout */}
          <div style={{ padding:'10px 10px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
            <button onClick={onLogout} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'8px 10px', borderRadius:9, border:'none', cursor:'pointer',
              background:'transparent', color:'rgba(255,255,255,0.3)', fontSize:12,
              fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.3)'; }}
            >
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </div>
              <span>Log out</span>
            </button>
            <div style={{ paddingLeft:10, marginTop:8 }}>
              <div style={{ fontSize:9, fontWeight:300, color:'rgba(255,255,255,0.2)', letterSpacing:'0.05em' }}>xoExam™ Controller v2.1</div>
              <div style={{ fontSize:9, fontWeight:300, color:'rgba(255,255,255,0.2)' }}>Xenon Ophthalmics Inc.</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', background:'#f0f2f5' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

Object.assign(window, { DashboardShell, NavIcon });
