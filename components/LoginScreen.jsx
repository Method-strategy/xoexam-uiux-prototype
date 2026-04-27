
// LoginScreen.jsx — xoExam tablet login
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [focused, setFocused] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: '#f9fafb', fontFamily: "'Nunito Sans', sans-serif"
    }}>
      {/* Left Panel — Navy */}
      <div style={{
        flex: '0 0 52%', background: '#0e2f5e', display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '32px 56px', position: 'relative', overflow: 'hidden',
        gap: 32
      }}>
        {/* Accent line */}
        <div style={{ position:'absolute', top:0, right:0, width:3, height:'100%', background:'linear-gradient(180deg,#1f8eff,#66ccff)', opacity:0.5 }} />
        
        {/* BG blobs */}
        <div style={{ position:'absolute', top:'-20%', right:'-20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(31,142,255,0.12),transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(5,193,188,0.1),transparent 70%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize:'32px 32px' }} />

        {/* Logo + tagline */}
        <div style={{ textAlign:'center', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <img
            src="assets/xo-vision-care-logo-dark.png"
            alt="XO Vision Care"
            style={{ width:280, height:'auto' }}
          />
          <div style={{ fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.4)', letterSpacing:'0.01em' }}>
            One system. From appointment to finished eyewear.
          </div>
        </div>

        {/* XO Ring graphic */}
        <div style={{ zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img
            src="https://xophthalmics.com/wp-content/uploads/2026/04/xo-ring-graphic-scaled.png"
            alt="XO Integrated Vision Care"
            style={{ width:'100%', maxWidth:390, height:'auto' }}
            onError={e => { e.target.style.display='none'; }}
          />
        </div>

        {/* Compliance badges */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', zIndex:1 }}>
          {['HIPAA','SOC 2 Type II','AES-256','MFA'].map(b => (
            <div key={b} style={{
              fontSize:9, fontWeight:700, color:'#66ccff', letterSpacing:'0.1em',
              textTransform:'uppercase', border:'1px solid rgba(102,204,255,0.3)',
              borderRadius:4, padding:'4px 10px'
            }}>{b}</div>
          ))}
        </div>
      </div>

      {/* Right Panel — White Form */}
      <div style={{
        flex:'1 1 48%', background:'#ffffff', display:'flex', flexDirection:'column',
        justifyContent:'center', padding:'32px 56px'
      }}>
        <div style={{ maxWidth:400 }}>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#0e2f5e', marginBottom:4, lineHeight:1.2 }}>Welcome back</h1>
          <p style={{ fontSize:13, fontWeight:300, color:'#6b7280', marginBottom:24 }}>Sign in to access your practice portal</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#0e2f5e', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:6 }}>Email</label>
              <input
                type="email" placeholder="you@yourclinic.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={{
                  width:'100%', height:44, borderRadius:10, padding:'0 14px',
                  fontSize:13, fontWeight:300, color:'#0e2f5e', outline:'none',
                  background: focused==='email' ? '#fff' : '#f9fafb',
                  border: `1.5px solid ${focused==='email' ? '#1f8eff' : '#e5e7eb'}`,
                  transition:'all 0.2s', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif"
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#0e2f5e', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:6 }}>Password</label>
              <input
                type="password" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                style={{
                  width:'100%', height:44, borderRadius:10, padding:'0 14px',
                  fontSize:13, fontWeight:300, color:'#0e2f5e', outline:'none',
                  background: focused==='pass' ? '#fff' : '#f9fafb',
                  border: `1.5px solid ${focused==='pass' ? '#1f8eff' : '#e5e7eb'}`,
                  transition:'all 0.2s', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif"
                }}
              />
            </div>

            {/* Remember / Forgot */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:300, color:'#6b7280', cursor:'pointer' }}>
                <input type="checkbox" style={{ accentColor:'#1f8eff', width:13, height:13 }} /> Remember this device
              </label>
              <a href="#" style={{ fontSize:12, fontWeight:700, color:'#1f8eff', textDecoration:'none', minHeight:'unset', display:'inline' }}>Forgot password?</a>
            </div>

            {/* Sign In Button */}
            <button type="submit" disabled={loading} style={{
              width:'100%', height:48, borderRadius:12, border:'none', cursor:'pointer',
              background: loading ? '#9ca3af' : '#0e2f5e',
              color:'#ffffff', fontSize:14, fontWeight:700, letterSpacing:'0.02em',
              transition:'all 0.2s', fontFamily:"'Nunito Sans', sans-serif",
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {loading ? (
                <span style={{ display:'flex', gap:4 }}>
                  {[0,1,2].map(i => <span key={i} style={{
                    width:7, height:7, borderRadius:'50%', background:'white',
                    display:'inline-block', animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite`
                  }} />)}
                </span>
              ) : 'Sign in'}
            </button>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:14, margin:'16px 0' }}>
              <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
              <span style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>or</span>
              <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
            </div>

            {/* Support Buttons */}
            <div style={{ display:'flex', gap:10 }}>
              {['IT Support','Admin Portal'].map(label => (
                <button key={label} type="button" style={{
                  flex:1, height:40, borderRadius:10, border:'1.5px solid #e5e7eb',
                  background:'#f9fafb', cursor:'pointer', fontSize:12, fontWeight:700,
                  color:'#0e2f5e', fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s'
                }}
                onMouseEnter={e => e.target.style.borderColor='#1f8eff'}
                onMouseLeave={e => e.target.style.borderColor='#e5e7eb'}
                >{label}</button>
              ))}
            </div>
          </form>

          {/* Footer */}
          <div style={{ marginTop:64, paddingTop:18, textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Only from</div>
            <img src="assets/xenon-logo-light.png" alt="Xenon Ophthalmics" style={{ height:56 }} />
            <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', marginTop:6 }}>© 2026 Xenon Ophthalmics Inc. All rights reserved.</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:scale(0)}
          40%{transform:scale(1)}
        }
      `}</style>
      {/* Version badge */}
      <div style={{ position:'fixed', bottom:12, right:16, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', fontFamily:"'Nunito Sans', sans-serif", pointerEvents:'none', zIndex:100 }}>
        v0.1.1
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
