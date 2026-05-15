
// ExamShell.jsx — Shared wrapper for all exam tests
// Provides: navigation chrome (back, title, patient, timer), phase controls (Begin/Cancel/Finish/New Test), and canonical cancel-test confirmation
//
// Cancel-test UX (canonical across all xoExam tests):
//   ready    → back arrow visible (left). Returns immediately. No confirm.
//   testing  → back arrow HIDDEN. Labeled "Cancel test" button (red) on the right. Opens confirm modal.
//                Confirm modal: "Cancel test?" + "Continue test" (default) / "Cancel test" (destructive).
//   report   → back arrow visible (left). Returns immediately. No confirm.
//
// Test components must NOT build their own cancel buttons or dialogs. They just pass onBack;
// ExamShell decides when to confirm before calling it.

function ExamShell({ title, accent, onBack, patientName, patientId, phase, elapsed, onBegin, onFinish, onNewTest, children, rightPanel }) {
  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const [showCancel, setShowCancel] = React.useState(false);

  const handleBackOrCancel = () => {
    if (phase === 'testing') setShowCancel(true);
    else onBack && onBack();
  };

  const confirmCancel = () => {
    setShowCancel(false);
    onBack && onBack();
  };

  // Close modal on Escape
  React.useEffect(() => {
    if (!showCancel) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowCancel(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCancel]);

  const backArrow = (
    <button onClick={handleBackOrCancel} aria-label="Back" title="Back" style={{ width:36, height:36, borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </button>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0, minHeight:60 }}>
        {/* Left: back arrow shown ONLY in ready or report. Hidden during testing to avoid accidental data loss. */}
        {phase !== 'testing' && backArrow}
        {phase !== 'testing' && <div style={{ width:1, height:20, background:'#e5e7eb' }}/>}

        {/* Eye icon */}
        <div style={{ width:28, height:28, borderRadius:7, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>

        {/* Title + patient */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', lineHeight:1.2 }}>{title}</div>
          <div style={{ fontSize:10, fontWeight:400, color:'#9ca3af', fontVariantNumeric:'tabular-nums' }}>Patient: {patientName || 'Marcus Williams'} · {patientId || '#4821'}</div>
        </div>

        <div style={{ flex:1 }}/>

        {/* Timer pill — testing phase only */}
        {phase === 'testing' && elapsed !== undefined && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, background:'#fef2f2', border:'1px solid #fecaca', minHeight:34 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#ef4444', animation:'examshell-pulse 1.2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', fontVariantNumeric:'tabular-nums', letterSpacing:'0.04em' }}>{fmtTime(elapsed)}</span>
          </div>
        )}

        {/* Right-side action group */}
        <div style={{ display:'flex', gap:8 }}>
          {phase === 'ready' && onBegin && (
            <button onClick={onBegin} style={{ minHeight:36, padding:'8px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
              Begin Test
            </button>
          )}
          {phase === 'testing' && (
            <>
              {/* Cancel test — labeled, red, opens confirm modal */}
              <button onClick={() => setShowCancel(true)} style={{ minHeight:36, padding:'8px 14px', borderRadius:9, border:'1.5px solid #fecaca', background:'#fff', color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Cancel test
              </button>
              {onFinish && (
                <button onClick={onFinish} style={{ minHeight:36, padding:'8px 18px', borderRadius:9, border:'none', background:'#10b981', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:'0 2px 6px rgba(16,185,129,0.35)' }}>
                  Finish &amp; Report
                </button>
              )}
            </>
          )}
          {phase === 'report' && onNewTest && (
            <button onClick={onNewTest} style={{ minHeight:36, padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
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

      {/* Cancel-test confirm modal — canonical across all xoExam tests */}
      {showCancel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15, 23, 42, 0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={() => setShowCancel(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:'#fff', borderRadius:18, padding:'32px 32px 28px', maxWidth:420, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#fef3c7', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:'0 0 8px', fontFamily:"'Nunito Sans', sans-serif" }}>Cancel test?</h3>
            <p style={{ fontSize:13, fontWeight:400, color:'#374151', margin:'0 0 22px', lineHeight:1.55, fontFamily:"'Nunito Sans', sans-serif" }}>
              All progress for this session will be lost and cannot be recovered.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={() => setShowCancel(false)} autoFocus style={{ width:'100%', minHeight:48, padding:'12px 20px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                Continue test
              </button>
              <button onClick={confirmCancel} style={{ width:'100%', minHeight:48, padding:'12px 20px', borderRadius:10, border:'1.5px solid #fca5a5', background:'#fef2f2', color:'#ef4444', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
                Cancel test
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes examshell-pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
}

Object.assign(window, { ExamShell });
