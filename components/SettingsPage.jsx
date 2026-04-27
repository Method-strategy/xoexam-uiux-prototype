
// SettingsPage.jsx — System settings with tabs

function Toggle({ value, onChange, accent }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:40, height:22, borderRadius:11, border:'none', cursor:'pointer',
      background: value ? accent : '#d1d5db', position:'relative', transition:'background 0.2s', flexShrink:0
    }}>
      <div style={{
        position:'absolute', top:3, left: value ? 21 : 3, width:16, height:16,
        borderRadius:'50%', background:'white', transition:'left 0.2s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
      }}/>
    </button>
  );
}

function SettingsRow({ label, sub, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{label}</div>
        {sub && <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingsPage({ tweaks, onUpdateTweak }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [tab, setTab] = React.useState('account');
  const [notifs, setNotifs] = React.useState({ email:true, push:true, sms:false, examAlerts:true, deviceAlerts:true, patientReminders:true, systemUpdates:false });
  const [privacy, setPrivacy] = React.useState({ dataSharing:false, analytics:true, crashReports:true });
  const [sound, setSound] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id:'account',  label:'Account',      icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id:'notifs',   label:'Notifications', icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
    { id:'display',  label:'Display',       icon:'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
    { id:'security', label:'Security',      icon:'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id:'system',   label:'System',        icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div style={{ display:'flex', height:'100%', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Settings Sidebar */}
      <div style={{ width:200, borderRight:'1px solid #e5e7eb', background:'#f9fafb', padding:'20px 12px', flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, paddingLeft:10 }}>Settings</div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:9, border:'none', cursor:'pointer',
            background: tab===t.id ? `${accent}12` : 'transparent',
            color: tab===t.id ? accent : '#374151',
            fontSize:13, fontWeight: tab===t.id ? 700 : 400, transition:'all 0.15s',
            fontFamily:"'Nunito Sans', sans-serif", marginBottom:2
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d={t.icon}/>
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{ flex:1, overflowY:'auto', padding:28 }}>
        
        {/* Account */}
        {tab === 'account' && (
          <div style={{ maxWidth:560 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:20 }}>Account Settings</h2>
            {/* Avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:20, background:'#f9fafb', borderRadius:14, border:'1px solid #e5e7eb' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'white' }}>J</div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>Dr. Jessica Taylor</div>
                <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>jessica.taylor@xenonoph.com</div>
                <button style={{ marginTop:6, fontSize:11, fontWeight:700, color:accent, border:`1px solid ${accent}30`, background:`${accent}10`, borderRadius:6, padding:'3px 10px', cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Change Photo</button>
              </div>
            </div>
            {[['Full Name','Dr. Jessica Taylor'],['Email','jessica.taylor@xenonoph.com'],['Phone','(555) 123-4567'],['License Number','MD-789012'],['Department','Cornea & Refractive']].map(([label,val]) => (
              <div key={label} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
                <input defaultValue={val} style={{ width:'100%', height:40, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 12px', fontSize:13, fontWeight:300, color:'#111827', outline:'none', background:'#fff', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
            ))}
            <button onClick={handleSave} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", marginTop:6 }}>
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifs' && (
          <div style={{ maxWidth:520 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:20 }}>Notification Preferences</h2>
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'4px 20px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', padding:'14px 0 6px' }}>Channels</div>
              <SettingsRow label="Email Notifications" sub="Receive updates via email"><Toggle value={notifs.email} onChange={v=>setNotifs({...notifs,email:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="Push Notifications" sub="In-app browser notifications"><Toggle value={notifs.push} onChange={v=>setNotifs({...notifs,push:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="SMS Alerts" sub="Text message for critical alerts"><Toggle value={notifs.sms} onChange={v=>setNotifs({...notifs,sms:v})} accent={accent}/></SettingsRow>
              <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', padding:'14px 0 6px' }}>Alert Types</div>
              <SettingsRow label="Exam Alerts" sub="When exams start, pause, or complete"><Toggle value={notifs.examAlerts} onChange={v=>setNotifs({...notifs,examAlerts:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="Device Alerts" sub="Offline, calibration due, low battery"><Toggle value={notifs.deviceAlerts} onChange={v=>setNotifs({...notifs,deviceAlerts:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="Patient Reminders" sub="Appointment reminders and check-ins"><Toggle value={notifs.patientReminders} onChange={v=>setNotifs({...notifs,patientReminders:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="System Updates" sub="Firmware and software update alerts"><Toggle value={notifs.systemUpdates} onChange={v=>setNotifs({...notifs,systemUpdates:v})} accent={accent}/></SettingsRow>
            </div>
          </div>
        )}

        {/* Display */}
        {tab === 'display' && (
          <div style={{ maxWidth:520 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:20 }}>Display Settings</h2>
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'4px 20px' }}>
              <SettingsRow label="Dark Mode" sub="Switch to dark theme"><Toggle value={darkMode} onChange={setDarkMode} accent={accent}/></SettingsRow>
              <SettingsRow label="Auto-save" sub="Automatically save exam progress"><Toggle value={autoSave} onChange={setAutoSave} accent={accent}/></SettingsRow>
              <SettingsRow label="Sound Effects" sub="Play sounds for exam events"><Toggle value={sound} onChange={setSound} accent={accent}/></SettingsRow>
              <SettingsRow label="Accent Color" sub="Primary interactive color">
                <div style={{ display:'flex', gap:6 }}>
                  {['#1f8eff','#155bcc','#05c1bc','#8b5cf6','#10b981'].map(c => (
                    <button key={c} onClick={() => onUpdateTweak && onUpdateTweak('accentColor', c)} style={{ width:22, height:22, borderRadius:'50%', background:c, border:`2px solid ${accent===c?'#111827':'transparent'}`, cursor:'pointer', transition:'transform 0.15s', transform:accent===c?'scale(1.2)':'scale(1)' }}/>
                  ))}
                </div>
              </SettingsRow>
            </div>
          </div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div style={{ maxWidth:520 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:20 }}>Security & Privacy</h2>
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'4px 20px', marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', padding:'14px 0 6px' }}>Password</div>
              {['Current Password','New Password','Confirm New Password'].map(label => (
                <div key={label} style={{ marginBottom:12 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', letterSpacing:'0.06em', marginBottom:5 }}>{label}</label>
                  <input type="password" placeholder="••••••••" style={{ width:'100%', height:40, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 12px', fontSize:13, outline:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                </div>
              ))}
              <button style={{ padding:'9px 20px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", marginBottom:14 }}>Update Password</button>
            </div>
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'4px 20px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', padding:'14px 0 6px' }}>Privacy</div>
              <SettingsRow label="Data Sharing" sub="Share anonymized usage data"><Toggle value={privacy.dataSharing} onChange={v=>setPrivacy({...privacy,dataSharing:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="Analytics" sub="Help improve xoExam with usage analytics"><Toggle value={privacy.analytics} onChange={v=>setPrivacy({...privacy,analytics:v})} accent={accent}/></SettingsRow>
              <SettingsRow label="Crash Reports" sub="Automatically send crash logs"><Toggle value={privacy.crashReports} onChange={v=>setPrivacy({...privacy,crashReports:v})} accent={accent}/></SettingsRow>
            </div>
          </div>
        )}

        {/* System */}
        {tab === 'system' && (
          <div style={{ maxWidth:520 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:20 }}>System Information</h2>
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:20, marginBottom:14 }}>
              {[['Application','xoExam™ Controller v2.4.1'],['Platform','Tablet Web Interface'],['Device OS','iPadOS 17.4'],['Last Sync','April 23, 2026 · 09:14 AM'],['Support Contact','support@xenonoph.com'],['License','Professional · 8 devices']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'10px 0', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Check for Updates</button>
              <button style={{ flex:1, padding:'10px 0', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Export Logs</button>
              <button style={{ flex:1, padding:'10px 0', borderRadius:9, border:'1.5px solid #fee2e2', background:'#fee2e2', color:'#dc2626', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Factory Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
