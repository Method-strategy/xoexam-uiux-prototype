
// InventoryPage.jsx — Equipment and supplies management

const EQUIPMENT = [
  { id:'EQ001', name:'XO Diagnostic Headset Pro',  serial:'XO-HD-2024-001', type:'Headset',   status:'operational', location:'Exam Room 1', lastCal:'Apr 20, 2026', nextCal:'May 20, 2026', condition:'excellent', usageHrs:1240, warranty:'Dec 2026' },
  { id:'EQ002', name:'XO Diagnostic Headset Pro',  serial:'XO-HD-2024-002', type:'Headset',   status:'operational', location:'Exam Room 3', lastCal:'Apr 19, 2026', nextCal:'May 19, 2026', condition:'good',      usageHrs:980,  warranty:'Dec 2026' },
  { id:'EQ003', name:'XO Diagnostic Headset Pro',  serial:'XO-HD-2024-003', type:'Headset',   status:'maintenance', location:'Repair Bay',  lastCal:'Apr 18, 2026', nextCal:'OVERDUE',      condition:'fair',      usageHrs:2100, warranty:'Dec 2026' },
  { id:'EQ004', name:'Charging Dock Station 8-Bay', serial:'CD-2023-001',   type:'Accessory', status:'operational', location:'Tech Room',   lastCal:'N/A',          nextCal:'N/A',          condition:'excellent', usageHrs:3200, warranty:'Jun 2025' },
  { id:'EQ005', name:'Sanitation UV Cabinet',       serial:'UV-2023-002',   type:'Hygiene',   status:'operational', location:'Hallway',     lastCal:'N/A',          nextCal:'N/A',          condition:'good',      usageHrs:1800, warranty:'Aug 2025' },
];

const SUPPLIES = [
  { id:'S001', name:'Lens Cleaning Wipes',          category:'Hygiene',    stock:245, minStock:50,  unit:'pcs',    supplier:'MedSupply Co.',   cost:0.12,  expiry:'Dec 2026' },
  { id:'S002', name:'Disposable Eye Shields',        category:'Hygiene',    stock:180, minStock:100, unit:'pcs',    supplier:'OptoCare Ltd.',   cost:0.45,  expiry:'Mar 2027' },
  { id:'S003', name:'Silicone Headset Padding',      category:'Accessory',  stock:32,  minStock:20,  unit:'sets',   supplier:'XO Parts',        cost:8.50,  expiry:null },
  { id:'S004', name:'Isopropyl Alcohol 70%',         category:'Hygiene',    stock:12,  minStock:20,  unit:'bottles',supplier:'CleanMed',        cost:4.20,  expiry:'Jan 2027' },
  { id:'S005', name:'USB-C Charging Cables',         category:'Electrical', stock:8,   minStock:10,  unit:'pcs',    supplier:'TechSource',      cost:12.00, expiry:null },
  { id:'S006', name:'Anti-Fog Spray',                category:'Hygiene',    stock:28,  minStock:15,  unit:'bottles',supplier:'ClearView Inc.',  cost:6.75,  expiry:'Sep 2026' },
];

const STATUS_COLORS = {
  operational: { bg:'#dcfce7', color:'#16a34a' },
  maintenance:  { bg:'#fef3c7', color:'#d97706' },
  calibration:  { bg:'#dbeafe', color:'#2563eb' },
  retired:      { bg:'#f3f4f6', color:'#6b7280' },
};
const COND_COLORS = { excellent:'#10b981', good:'#1f8eff', fair:'#f59e0b', poor:'#ef4444' };

function InventoryPage({ tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [tab, setTab] = React.useState('equipment');
  const [search, setSearch] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);

  const lowStock = SUPPLIES.filter(s => s.stock <= s.minStock);

  const filteredEquip = EQUIPMENT.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.serial.includes(search) || e.location.toLowerCase().includes(search.toLowerCase()));
  const filteredSupplies = SUPPLIES.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Inventory</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>Equipment and supplies management</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {lowStock.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:9, background:'#fef3c7', border:'1px solid #fde68a' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontSize:11, fontWeight:700, color:'#d97706' }}>{lowStock.length} Low Stock</span>
            </div>
          )}
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', background:'#f3f4f6', borderRadius:10, padding:3, gap:2 }}>
          {[['equipment','Equipment'],['supplies','Supplies']].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)} style={{ padding:'7px 18px', borderRadius:8, border:'none', cursor:'pointer', background: tab===val ? '#fff' : 'transparent', color: tab===val ? '#111827' : '#6b7280', fontSize:12, fontWeight:700, boxShadow: tab===val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition:'all 0.15s', fontFamily:"'Nunito Sans', sans-serif" }}>{label}</button>
          ))}
        </div>
        <div style={{ position:'relative' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
            placeholder="Search inventory..."
            style={{ height:36, width:220, paddingLeft:32, paddingRight:12, borderRadius:9, border:`1.5px solid ${searchFocused?accent:'#e5e7eb'}`, background:'#fff', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Equipment Table */}
      {tab === 'equipment' && (
        <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr 1fr 1fr', gap:0, background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'9px 16px', flexShrink:0 }}>
            {['Equipment','Serial / Location','Status','Condition','Calibration','Warranty'].map(h => (
              <span key={h} style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>
            ))}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredEquip.map((e,i) => {
              const sc = STATUS_COLORS[e.status] || STATUS_COLORS.operational;
              return (
                <div key={e.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr 1fr 1fr', alignItems:'center', padding:'12px 16px', borderBottom: i<filteredEquip.length-1?'1px solid #f3f4f6':'none', transition:'background 0.15s', cursor:'pointer' }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=`${accent}06`}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                >
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{e.name}</div>
                    <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af', marginTop:1 }}>{e.type} · {e.usageHrs}h used</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{e.serial}</div>
                    <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>{e.location}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:sc.bg, color:sc.color, textTransform:'capitalize', width:'fit-content' }}>{e.status}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:COND_COLORS[e.condition] }}/>
                    <span style={{ fontSize:11, fontWeight:300, color:'#374151', textTransform:'capitalize' }}>{e.condition}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:300, color: e.nextCal==='OVERDUE' ? '#ef4444' : '#374151' }}>{e.nextCal}</span>
                  <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{e.warranty}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplies Table */}
      {tab === 'supplies' && (
        <div style={{ flex:1, background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.2fr 1fr 1fr', gap:0, background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'9px 16px', flexShrink:0 }}>
            {['Item','Category','Stock Level','Supplier','Cost / Unit'].map(h => (
              <span key={h} style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>
            ))}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredSupplies.map((s,i) => {
              const isLow = s.stock <= s.minStock;
              const pct = Math.min(100, Math.round(s.stock/s.minStock*100));
              const barColor = isLow ? '#ef4444' : s.stock < s.minStock*1.5 ? '#f59e0b' : '#10b981';
              return (
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.2fr 1fr 1fr', alignItems:'center', padding:'12px 16px', borderBottom: i<filteredSupplies.length-1?'1px solid #f3f4f6':'none', background: isLow ? '#fef9f0' : 'transparent', transition:'background 0.15s', cursor:'pointer' }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=isLow?'#fef3c7':`${accent}06`}
                  onMouseLeave={ev=>ev.currentTarget.style.background=isLow?'#fef9f0':'transparent'}
                >
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111827', display:'flex', alignItems:'center', gap:6 }}>
                      {s.name}
                      {isLow && <span style={{ fontSize:9, fontWeight:700, background:'#fef3c7', color:'#d97706', padding:'1px 6px', borderRadius:20, letterSpacing:'0.06em' }}>LOW</span>}
                    </div>
                    {s.expiry && <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>Expires {s.expiry}</div>}
                  </div>
                  <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{s.category}</span>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <div style={{ flex:1, height:4, background:'#f3f4f6', borderRadius:2 }}>
                        <div style={{ width:`${Math.min(100,s.stock/Math.max(s.minStock*2,1)*100)}%`, height:'100%', background:barColor, borderRadius:2 }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color: isLow ? '#ef4444' : '#374151' }}>{s.stock} {s.unit}</span>
                    </div>
                    <div style={{ fontSize:9, fontWeight:300, color:'#9ca3af' }}>Min: {s.minStock} {s.unit}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>{s.supplier}</span>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:11, fontWeight:300, color:'#374151' }}>${s.cost.toFixed(2)}</span>
                    <button style={{ fontSize:10, fontWeight:700, color:accent, border:`1px solid ${accent}30`, background:`${accent}10`, borderRadius:6, padding:'3px 8px', cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Reorder</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { InventoryPage });
