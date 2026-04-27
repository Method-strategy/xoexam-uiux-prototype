
// WelcomeScreen.jsx — Product selector
function WelcomeScreen({ onSelect }) {
  const [hovered, setHovered] = React.useState(null);

  const products = [
    {
      id: 'xoiris', name: 'xoIris™', color: '#155bcc',
      description: 'Intelligent real-time\nintegrated scheduling',
      logo: 'assets/xo-iris-logo.png',
      locked: false, external: true
    },
    {
      id: 'xoexam', name: 'xoExam™', color: '#1f8eff',
      description: 'Clinically precise eye exams,\ndelivered anywhere',
      logo: 'assets/xo-exam-logo.png',
      locked: false, external: false
    },
    {
      id: 'xofit', name: 'xoFit™', color: '#05c1bc',
      description: 'Advanced frame\nfitting precision',
      logo: 'assets/xo-fit-logo.png',
      locked: true, external: false
    },
    {
      id: 'xolab', name: 'xoLab™', color: '#75d647',
      description: 'Precision in-office\neyewear finishing',
      logo: 'assets/xo-lab-logo.png',
      locked: true, external: false
    },
  ];

  return (
    <div style={{
      width:'100%', height:'100%', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden',
      background:'linear-gradient(135deg, #0e2f5e 0%, #1a4578 50%, #0e2f5e 100%)',
      fontFamily:"'Nunito Sans', sans-serif"
    }}>
      {/* BG blobs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'15%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(31,142,255,0.12),transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'15%', right:'10%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(5,193,188,0.1),transparent 70%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize:'32px 32px' }}/>
      </div>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:48, zIndex:1 }}>
        <img
          src="assets/xo-vision-care-horiz-dark.png"
          alt="XO Vision Care System"
          style={{ height:72, marginBottom:20 }}
        />
        <h1 style={{ fontSize:28, fontWeight:700, color:'#ffffff', margin:0, lineHeight:1.3 }}>
          Select a module to continue
        </h1>
      </div>

      {/* Product Cards */}
      <div style={{ display:'flex', gap:16, zIndex:1, padding:'0 24px' }}>
        {products.map(product => {
          const isHovered = hovered === product.id;
          const isLocked = product.locked;
          return (
            <div
              key={product.id}
              onMouseEnter={() => !isLocked && setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (isLocked) return;
                if (product.external) { window.open('https://xo-iris.com/login','_blank'); return; }
                onSelect(product.id);
              }}
              style={{
                width: 240, borderRadius:20, overflow:'hidden', cursor: isLocked ? 'default' : 'pointer',
                background: '#ffffff',
                border: isHovered && !isLocked
                  ? `2px solid ${product.color}`
                  : '2px solid rgba(255,255,255,0.6)',
                transform: isHovered && !isLocked ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                opacity: 1,
                boxShadow: isHovered && !isLocked
                  ? `0 24px 48px rgba(0,0,0,0.25), 0 0 0 1px ${product.color}40`
                  : '0 8px 32px rgba(0,0,0,0.18)',
                position:'relative'
              }}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div style={{
                  position:'absolute', top:12, right:12, zIndex:2,
                  width:24, height:24, borderRadius:'50%',
                  background:'rgba(0,0,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              )}

              {/* Color accent top bar */}
              <div style={{ height:5, background:`linear-gradient(90deg, ${product.color}, ${product.color}88)` }} />

              <div style={{ padding:24, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                {/* Logo */}
                <div style={{ height:40, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <img src={product.logo} alt={product.name}
                    style={{ width:180, height:34, objectFit:'contain', objectPosition:'center center' }}
                    onError={e => {
                      e.target.style.display='none';
                      e.target.nextSibling.style.display='block';
                    }}
                  />
                  <div style={{ display:'none', fontSize:18, fontWeight:700, color:'#0e2f5e' }}>{product.name}</div>
                </div>

                {/* Description */}
                <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', lineHeight:1.6, whiteSpace:'pre-line', margin:'0 0 20px' }}>
                  {product.description}
                </p>

                {/* CTA */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'center',
                  padding:'8px 12px', borderRadius:8, width:'100%', boxSizing:'border-box',
                  background: isHovered && !isLocked ? `${product.color}15` : '#f3f4f6',
                  border: `1px solid ${isHovered && !isLocked ? product.color+'40' : '#e5e7eb'}`,
                  transition:'all 0.2s', gap:8
                }}>
                  <span style={{ fontSize:11, fontWeight:700, color: isHovered && !isLocked ? product.color : '#6b7280', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {isLocked ? 'Contact Sales' : (product.external ? 'Open App' : 'Launch')}
                  </span>
                  {!isLocked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isHovered && !isLocked ? product.color : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isHovered && !isLocked ? 'translateX(2px)':'translateX(0)', transition:'transform 0.2s' }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ position:'absolute', bottom:24, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'center', gap:32, zIndex:1 }}>
        <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.4)' }}>© 2026 Xenon Ophthalmics Inc. All rights reserved.</div>
        <button onClick={() => window.__xoGoToLogin && window.__xoGoToLogin()} style={{
          background:'none', border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
          color:'rgba(255,255,255,0.3)', letterSpacing:'0.05em', fontFamily:"'Nunito Sans', sans-serif",
          transition:'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}
        >← Back to Login</button>
      </div>
    </div>
  );
}

Object.assign(window, { WelcomeScreen });
