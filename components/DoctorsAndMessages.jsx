
// MessagesPage.jsx — Messaging UI (Doctor list/profile lives in DoctorsPage.jsx)

const CONVOS = [
  { id:'1', name:'Sarah Johnson',   initials:'SJ', type:'patient', lastMsg:'Thank you for the appointment confirmation', time:'2m ago',  unread:true,  online:true,  isAI:true,  messages:[{id:'m1',from:'patient',text:'Hi, I wanted to confirm my appointment for tomorrow at 2 PM.',time:'10:30 AM'},{id:'m2',from:'ai',text:'Hello Sarah! Your appointment is confirmed for tomorrow at 2 PM with Dr. Taylor. Please arrive 15 minutes early.',time:'10:32 AM'},{id:'m3',from:'patient',text:"Thank you for the appointment confirmation. I'll be there!",time:'2m ago'}] },
  { id:'2', name:'Michael Chen',    initials:'MC', type:'staff',   lastMsg:'The calibration report is ready',           time:'12m ago', unread:false, online:true,  isAI:false, messages:[{id:'m4',from:'staff',text:'Hey, the calibration report for xoExam™ #3 is ready for review.',time:'12m ago'}] },
  { id:'3', name:'Dr. Alice Brown', initials:'AB', type:'staff',   lastMsg:'Can we reschedule the 3PM exam?',          time:'1h ago',  unread:true,  online:false, isAI:false, messages:[{id:'m5',from:'staff',text:'Can we reschedule the 3PM exam to 4PM? I have an emergency.',time:'1h ago'}] },
  { id:'4', name:'James Wilson',    initials:'JW', type:'patient', lastMsg:'When will results be available?',           time:'2h ago',  unread:false, online:false, isAI:true,  messages:[{id:'m6',from:'patient',text:'When will my exam results be available?',time:'2h ago'}] },
];

function MessagesPage({ tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [activeConvo, setActiveConvo] = React.useState(CONVOS[0]);
  const [newMsg, setNewMsg] = React.useState('');
  const [messages, setMessages] = React.useState(CONVOS[0].messages);
  const [msgFocused, setMsgFocused] = React.useState(false);

  const selectConvo = (c) => {
    setActiveConvo(c);
    setMessages(c.messages);
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    const msg = { id:`m${Date.now()}`, from:'me', text:newMsg, time:'Just now' };
    setMessages(m => [...m, msg]);
    setNewMsg('');
  };

  return (
    <div style={{ display:'flex', height:'100%', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:260, borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #e5e7eb' }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>Messages</h2>
          <div style={{ position:'relative' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input placeholder="Search..." style={{ width:'100%', height:34, paddingLeft:28, paddingRight:10, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}/>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {CONVOS.map(c => (
            <div key={c.id} onClick={() => selectConvo(c)} style={{
              padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f3f4f6',
              background: activeConvo.id===c.id ? `${accent}08` : 'transparent', transition:'background 0.15s'
            }}
            onMouseEnter={e => { if(activeConvo.id!==c.id) e.currentTarget.style.background='#f9fafb'; }}
            onMouseLeave={e => { if(activeConvo.id!==c.id) e.currentTarget.style.background='transparent'; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${c.type==='patient'?accent:'#6b7280'},${c.type==='patient'?'#155bcc':'#374151'})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>{c.initials}</div>
                  {c.online && <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:'#10b981', border:'2px solid white' }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</span>
                    <span style={{ fontSize:9, fontWeight:300, color:'#9ca3af', flexShrink:0, marginLeft:4 }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>{c.lastMsg}</div>
                </div>
                {c.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:accent, flexShrink:0 }}/>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        {/* Chat header */}
        <div style={{ padding:'12px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>{activeConvo.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{activeConvo.name}</div>
              <div style={{ fontSize:10, fontWeight:300, color: activeConvo.online ? '#10b981' : '#9ca3af' }}>{activeConvo.online ? 'Online' : 'Offline'} · {activeConvo.type}</div>
            </div>
          </div>
          {activeConvo.isAI && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              <span style={{ fontSize:10, fontWeight:700, color:accent }}>AI Active</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12, background:'#f9fafb' }}>
          {messages.map(msg => {
            const isMe = msg.from === 'me';
            const isAI = msg.from === 'ai';
            return (
              <div key={msg.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap:8 }}>
                {!isMe && (
                  <div style={{ width:28, height:28, borderRadius:'50%', background: isAI ? `linear-gradient(135deg,${accent},#155bcc)` : '#6b7280', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0, marginTop:2 }}>
                    {isAI ? 'AI' : activeConvo.initials}
                  </div>
                )}
                <div style={{ maxWidth:'70%' }}>
                  {isAI && <div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>XO AI Assistant</div>}
                  <div style={{
                    padding:'10px 14px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isMe ? `linear-gradient(135deg,${accent},#155bcc)` : isAI ? `${accent}10` : '#fff',
                    border: isAI ? `1px solid ${accent}25` : isMe ? 'none' : '1px solid #e5e7eb',
                    fontSize:12, fontWeight:300, color: isMe ? 'white' : '#374151', lineHeight:1.5,
                    boxShadow:'0 1px 3px rgba(0,0,0,0.06)'
                  }}>{msg.text}</div>
                  <div style={{ fontSize:9, fontWeight:300, color:'#9ca3af', marginTop:3, textAlign: isMe?'right':'left' }}>{msg.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', background:'#fff', display:'flex', gap:10, alignItems:'flex-end', flexShrink:0 }}>
          <div style={{ flex:1, borderRadius:10, border:`1.5px solid ${msgFocused?accent:'#e5e7eb'}`, background:'#f9fafb', transition:'border-color 0.2s', padding:'8px 12px' }}>
            <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)} onFocus={()=>setMsgFocused(true)} onBlur={()=>setMsgFocused(false)}
              onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              style={{ width:'100%', resize:'none', border:'none', background:'transparent', fontSize:12, fontWeight:300, color:'#111827', outline:'none', fontFamily:"'Nunito Sans', sans-serif", lineHeight:1.5 }}
            />
          </div>
          <button onClick={sendMsg} style={{ width:38, height:38, borderRadius:10, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0, boxShadow:`0 3px 8px ${accent}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MessagesPage });
