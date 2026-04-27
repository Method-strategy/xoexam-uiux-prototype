
// ExamShell.jsx — Shared wrapper for all exam tests
// Provides: header with back button, test name, patient info, timer, phase controls

function ExamShell({ title, accent, onBack, patientName, patientId, phase, elapsed, onBegin, onFinish, onNewTest, children, rightPanel }) {
  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ width:1, height:20, background:'#e5e7eb' }}/>
        <div style={{ width:28, height:28, borderRadius:7, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{title}</div>
          <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Patient: {patientName || 'Marcus Williams'} · {patientId || '#4821'}</div>
        </div>
        <div style={{ flex:1 }}/>
        {phase === 'testing' && elapsed !== undefined && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1.2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:accent }}>{fmtTime(elapsed)}</span>
          </div>
        )}
        <div style={{ display:'flex', gap:8 }}>
          {phase === 'ready' && onBegin && (
            <button onClick={onBegin} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
              Begin Test
            </button>
          )}
          {phase === 'testing' && onFinish && (
            <button onClick={onFinish} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:'#10b981', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              Finish &amp; Report
            </button>
          )}
          {phase === 'report' && onNewTest && (
            <button onClick={onNewTest} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
              New Test
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ flex:1, overflow:'auto' }}>{children}</div>
        {rightPanel && (
          <div style={{ flex:'0 0 260px', borderLeft:'1px solid #e5e7eb', background:'#fff', overflowY:'auto' }}>
            {rightPanel}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

Object.assign(window, { ExamShell });
