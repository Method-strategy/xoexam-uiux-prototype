
// TestSelection.jsx — Exam type grid

const EXAM_TYPES = [
  // Refraction
  { id:'refraction',               name:'Refraction Test',              category:'Refraction',      color:'#1f8eff', iconPath:'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id:'aberrometer',              name:'Aberrometer Exam',             category:'Refraction',      color:'#ec4899', iconPath:'M13 10V3L4 14h7v7l9-11h-7z' },
  { id:'accommodation',            name:'Accommodation Test',           category:'Refraction',      color:'#06b6d4', iconPath:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { id:'keratometry',              name:'Keratometry Test',             category:'Refraction',      color:'#f97316', iconPath:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  // Visual Field
  { id:'visual-field',             name:'Visual Field Exam',            category:'Visual Field',    color:'#155bcc', iconPath:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id:'confrontation',            name:'Confrontation Exam',           category:'Visual Field',    color:'#66ccff', iconPath:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'visual-field-estheryman',  name:'Esterman Binocular Functional Test', category:'Visual Field', color:'#3b82f6', iconPath:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  // Binocular
  { id:'binocular-vision',         name:'Binocular Vision Test',        category:'Binocular',       color:'#10b981', iconPath:'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id:'convergence',              name:'Convergence Test',             category:'Binocular',       color:'#75d647', iconPath:'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id:'extraocular-motility',     name:'Extraocular Motility Exam',    category:'Binocular',       color:'#f59e0b', iconPath:'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
  { id:'eyes-converging',          name:'Eyes Converging Exam',         category:'Binocular',       color:'#0ea5e9', iconPath:'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  // Sensory
  { id:'visual-acuity',            name:'Visual Acuity Exam',           category:'Sensory',         color:'#1f8eff', iconPath:'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id:'color-vision',             name:'Color Vision Test',            category:'Sensory',         color:'#05c1bc', iconPath:'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id:'contrast-sensitivity',     name:'Contrast Sensitivity Exam',    category:'Sensory',         color:'#6366f1', iconPath:'M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M19.07 4.93l.707-.707' },
  // Neuro
  { id:'pupillometry',             name:'Pupillometry Test',            category:'Neuro',           color:'#8b5cf6', iconPath:'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'visual-reaction-time',     name:'Visual Reaction Time Test',    category:'Neuro',           color:'#ef4444', iconPath:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'eye-tracking',             name:'Eye Tracking Accuracy Test',   category:'Neuro',           color:'#1f8eff', iconPath:'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id:'fixation-stability',       name:'Fixation Stability Test',      category:'Neuro',           color:'#a855f7', iconPath:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  // Ocular Surface
  { id:'tear-film',                name:'Tear Film Test',               category:'Ocular Surface',  color:'#14b8a6', iconPath:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  // AI
  { id:'ai-pattern',               name:'AI Pattern Recognition Test',  category:'AI',              color:'#1fff6f', iconPath:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

const CATEGORIES = ['All', 'Refraction', 'Visual Field', 'Binocular', 'Sensory', 'Neuro', 'Ocular Surface', 'AI'];

function TestSelection({ onSelectExam, tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [hovered, setHovered] = React.useState(null);
  const [searchFocused, setSearchFocused] = React.useState(false);

  const filtered = EXAM_TYPES.filter(e => {
    const matchCat = activeCategory === 'All' || e.category === activeCategory;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Examination Tests</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>{EXAM_TYPES.length} tests available · Select one to begin</p>
        </div>
        {/* Search */}
        <div style={{ position:'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Search tests..."
            style={{
              height:38, paddingLeft:34, paddingRight:14, borderRadius:9, border:`1.5px solid ${searchFocused ? accent : '#e5e7eb'}`,
              background:'#fff', fontSize:12, fontWeight:300, color:'#111827', outline:'none',
              width:220, boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif", transition:'border-color 0.2s'
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', flexShrink:0 }}>
        {CATEGORIES.map(cat => {
          const isActive = cat === activeCategory;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding:'5px 14px', borderRadius:20, border:`1.5px solid ${isActive ? accent : '#e5e7eb'}`,
              background: isActive ? accent : '#fff', color: isActive ? '#fff' : '#6b7280',
              fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.04em',
              transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif"
            }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
        gap:12, overflowY:'auto', flex:1, paddingBottom:8, paddingRight:4, paddingTop:8,
        alignContent:'start'
      }}>
        {filtered.map(exam => {
          const isHov = hovered === exam.id;
          return (
            <div
              key={exam.id}
              onMouseEnter={() => setHovered(exam.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectExam(exam.id, exam.name)}
              style={{
                background:'#ffffff', borderRadius:14, padding:'16px 14px', cursor:'pointer',
                border: `1.5px solid ${isHov ? exam.color : '#e5e7eb'}`,
                boxShadow: isHov ? `0 8px 24px ${exam.color}28` : '0 1px 4px rgba(0,0,0,0.04)',
                transform: isHov ? 'translateY(-3px)' : 'none',
                transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                display:'flex', flexDirection:'column', gap:10
              }}
            >
              {/* Icon circle */}
              <div style={{ width:40, height:40, borderRadius:10, background:`${exam.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={exam.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={exam.iconPath}/>
                </svg>
              </div>

              {/* Name */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#111827', lineHeight:1.3 }}>{exam.name}</div>
                <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', marginTop:3, textTransform:'uppercase', letterSpacing:'0.07em' }}>{exam.category}</div>
              </div>

              {/* Arrow */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginTop:'auto', paddingTop:4, borderTop:`1px solid ${isHov ? exam.color+'25' : '#f3f4f6'}`,
                transition:'border-color 0.2s'
              }}>
                <span style={{ fontSize:10, fontWeight:700, color: isHov ? exam.color : '#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', transition:'color 0.2s' }}>Start</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isHov ? exam.color : '#d1d5db'} strokeWidth="2.5" strokeLinecap="round" style={{ transform: isHov ? 'translateX(2px)':'none', transition:'all 0.2s' }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 0', color:'#9ca3af', fontSize:13, fontWeight:300 }}>
            No tests match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TestSelection, EXAM_TYPES });
