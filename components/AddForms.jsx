
// AddDevicePage.jsx + AddPatientPage.jsx

function AddDevicePage({ tweaks, onNavigate }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [step, setStep] = React.useState(1); // 1: details, 2: network, 3: confirm
  const [form, setForm] = React.useState({
    name: '', serial: '', location: '', room: '', firmware: 'v2.4.1', notes: '',
    wifi: '', ip: 'auto', subnet: '', gateway: '', dns: '',
  });
  const [saved, setSaved] = React.useState(false);
  const [focused, setFocused] = React.useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const Field = ({ label, field, placeholder, type='text', required }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>
        {label}{required && <span style={{ color:'#ef4444', marginLeft:3 }}>*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused(null)}
        placeholder={placeholder}
        style={{
          width:'100%', height:42, borderRadius:9, border:`1.5px solid ${focused===field ? accent : '#e5e7eb'}`,
          padding:'0 14px', fontSize:13, fontWeight:300, color:'#111827', outline:'none',
          background: focused===field ? '#fff' : '#f9fafb',
          transition:'all 0.2s', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif"
        }}
      />
    </div>
  );

  const steps = ['Device Details', 'Network Setup', 'Review & Add'];

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:20, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={() => onNavigate('devices')} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Add New Device</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>Register a new xoExam diagnostic headset</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
        {steps.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={num}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700,
                  background: isDone ? '#10b981' : isActive ? accent : '#e5e7eb',
                  color: isDone || isActive ? 'white' : '#9ca3af',
                  transition:'all 0.3s'
                }}>
                  {isDone ? '✓' : num}
                </div>
                <span style={{ fontSize:12, fontWeight: isActive ? 700 : 300, color: isActive ? '#111827' : '#9ca3af', whiteSpace:'nowrap' }}>{label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex:1, height:2, background: step > num ? '#10b981' : '#e5e7eb', margin:'0 12px', minWidth:24, transition:'background 0.3s' }}/>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', gap:20 }}>
        <div style={{ flex:'1 1 60%', background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>

          {step === 1 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Device Information</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <Field label="Device Name" field="name" placeholder="e.g. xoExam Headset #9" required/>
                <Field label="Serial Number" field="serial" placeholder="e.g. XO-HD-2024-009" required/>
                <Field label="Location" field="location" placeholder="e.g. Exam Room 7"/>
                <Field label="Room / Area" field="room" placeholder="e.g. Room 7"/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Firmware Version</label>
                <select value={form.firmware} onChange={e => set('firmware', e.target.value)} style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, color:'#111827', outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif" }}>
                  <option>v2.4.1 (Latest)</option>
                  <option>v2.4.0</option>
                  <option>v2.3.9</option>
                </select>
              </div>
              <div style={{ marginTop:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes about this device..." rows={3}
                  style={{ width:'100%', borderRadius:9, border:'1.5px solid #e5e7eb', padding:'10px 14px', fontSize:13, fontWeight:300, color:'#111827', outline:'none', background:'#f9fafb', resize:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Network Configuration</div>
              <Field label="WiFi Network (SSID)" field="wifi" placeholder="e.g. XenonClinic-5G" required/>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>IP Address</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['auto','manual'].map(v => (
                    <button key={v} onClick={() => set('ip', v)} style={{ flex:1, padding:'9px 0', borderRadius:9, border:`1.5px solid ${form.ip===v ? accent : '#e5e7eb'}`, background: form.ip===v ? `${accent}10` : '#f9fafb', color: form.ip===v ? accent : '#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", textTransform:'capitalize' }}>
                      {v === 'auto' ? 'Auto (DHCP)' : 'Manual'}
                    </button>
                  ))}
                </div>
              </div>
              {form.ip === 'manual' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                  <Field label="IP Address" field="subnet" placeholder="192.168.1.XXX"/>
                  <Field label="Subnet Mask" field="gateway" placeholder="255.255.255.0"/>
                  <Field label="Gateway" field="gateway" placeholder="192.168.1.1"/>
                  <Field label="DNS Server" field="dns" placeholder="8.8.8.8"/>
                </div>
              )}
              {/* Connection test */}
              <div style={{ marginTop:8, padding:16, background:`${accent}08`, borderRadius:10, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Network Scan</div>
                  <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>Click to scan for nearby xoExam devices</div>
                </div>
                <button style={{ marginLeft:'auto', padding:'7px 14px', borderRadius:8, border:'none', background:accent, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Scan</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Review & Confirm</div>
              <div style={{ background:'#f9fafb', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
                {[
                  ['Device Name', form.name || '(not set)'],
                  ['Serial Number', form.serial || '(not set)'],
                  ['Location', form.location || '(not set)'],
                  ['Room', form.room || '(not set)'],
                  ['Firmware', form.firmware],
                  ['Network', form.wifi ? `${form.wifi} · ${form.ip === 'auto' ? 'DHCP' : 'Static IP'}` : '(not configured)'],
                  ['Notes', form.notes || '—'],
                ].map(([k,v], i, arr) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'11px 16px', borderBottom: i<arr.length-1 ? '1px solid #e5e7eb' : 'none' }}>
                    <span style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#111827', maxWidth:'60%', textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              {saved && (
                <div style={{ marginTop:16, padding:14, background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize:12, fontWeight:700, color:'#16a34a' }}>Device registered successfully! Redirecting to Devices...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Help panel */}
        <div style={{ flex:'0 0 220px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:10 }}>
              {step === 1 ? '📋 Step 1 Tips' : step === 2 ? '📡 Step 2 Tips' : '✅ Almost done!'}
            </div>
            {step === 1 && ['Find the serial number on the device label or box', 'Use a descriptive name to easily identify the device', 'Specify the room so staff know where to find it'].map((tip,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', background:`${accent}18`, color:accent, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</div>
                <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.5 }}>{tip}</span>
              </div>
            ))}
            {step === 2 && ['Ensure the device is powered on and nearby', 'Use the clinic WiFi network, not a guest network', 'DHCP is recommended for most setups'].map((tip,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', background:`${accent}18`, color:accent, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</div>
                <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.5 }}>{tip}</span>
              </div>
            ))}
            {step === 3 && <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.6 }}>Review all details before confirming. After adding, the device will need to be calibrated before use.</span>}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ display:'flex', justifyContent:'space-between', flexShrink:0 }}>
        <button onClick={() => step > 1 ? setStep(s => s-1) : onNavigate('devices')} style={{ padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        <button onClick={() => {
          if (step < 3) { setStep(s => s+1); }
          else {
            setSaved(true);
            setTimeout(() => onNavigate('devices'), 1800);
          }
        }} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
          {step < 3 ? 'Continue →' : '✓ Add Device'}
        </button>
      </div>
    </div>
  );
}

// ── Add Patient Page ──

function AddPatientPage({ tweaks, onNavigate }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [step, setStep] = React.useState(1); // 1: personal, 2: medical, 3: confirm
  const [focused, setFocused] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName:'', lastName:'', dob:'', gender:'', phone:'', email:'', address:'',
    insurance:'', insuranceNum:'', physician:'', diagnosis:'', allergies:'', notes:'',
    emergencyName:'', emergencyPhone:'', emergencyRel:''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const Field = ({ label, field, placeholder, type='text', required, half }) => (
    <div style={{ marginBottom:14, gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>
        {label}{required && <span style={{ color:'#ef4444', marginLeft:3 }}>*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused(null)}
        placeholder={placeholder}
        style={{
          width:'100%', height:42, borderRadius:9, border:`1.5px solid ${focused===field ? accent : '#e5e7eb'}`,
          padding:'0 14px', fontSize:13, fontWeight:300, color:'#111827', outline:'none',
          background: focused===field ? '#fff' : '#f9fafb',
          transition:'all 0.2s', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif"
        }}
      />
    </div>
  );

  const steps = ['Personal Info', 'Medical Details', 'Review & Save'];

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={() => onNavigate('patients')} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Add New Patient</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>Register a new patient in the system</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
        {steps.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={num}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: isDone ? '#10b981' : isActive ? accent : '#e5e7eb', color: isDone || isActive ? 'white' : '#9ca3af', transition:'all 0.3s' }}>
                  {isDone ? '✓' : num}
                </div>
                <span style={{ fontSize:12, fontWeight: isActive ? 700 : 300, color: isActive ? '#111827' : '#9ca3af', whiteSpace:'nowrap' }}>{label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex:1, height:2, background: step > num ? '#10b981' : '#e5e7eb', margin:'0 12px', minWidth:24, transition:'background 0.3s' }}/>}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ flex:1, overflowY:'auto', display:'flex', gap:20 }}>
        <div style={{ flex:'1 1 60%', background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:24 }}>

          {step === 1 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Personal Information</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <Field label="First Name" field="firstName" placeholder="First name" required half/>
                <Field label="Last Name"  field="lastName"  placeholder="Last name"  required half/>
                <Field label="Date of Birth" field="dob" placeholder="MM-DD-YYYY" type="text" required half/>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Gender<span style={{ color:'#ef4444', marginLeft:3 }}>*</span></label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, color: form.gender ? '#111827' : '#9ca3af', outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif" }}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </div>
                <Field label="Phone Number" field="phone" placeholder="(555) 000-0000" required half/>
                <Field label="Email Address" field="email" placeholder="patient@email.com" type="email" half/>
                <div style={{ marginBottom:14, gridColumn:'span 2' }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Address</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address, city, state, zip"
                    style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, color:'#111827', outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'8px 0 14px' }}>Emergency Contact</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
                {[['emergencyName','Name','Contact name'],['emergencyPhone','Phone','(555) 000-0000'],['emergencyRel','Relationship','e.g. Spouse']].map(([field,label,ph]) => (
                  <div key={field} style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
                    <input value={form[field]} onChange={e => set(field, e.target.value)} placeholder={ph}
                      onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                      style={{ width:'100%', height:42, borderRadius:9, border:`1.5px solid ${focused===field?accent:'#e5e7eb'}`, padding:'0 14px', fontSize:13, fontWeight:300, outline:'none', background: focused===field?'#fff':'#f9fafb', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Medical Information</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <Field label="Insurance Provider" field="insurance" placeholder="e.g. Blue Cross Blue Shield" half/>
                <Field label="Insurance Number" field="insuranceNum" placeholder="e.g. BC-234567" half/>
                <div style={{ marginBottom:14, gridColumn:'span 1' }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Primary Physician</label>
                  <select value={form.physician} onChange={e => set('physician', e.target.value)} style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, color: form.physician ? '#111827' : '#9ca3af', outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif" }}>
                    <option value="">Assign physician</option>
                    <option>Dr. Alice Brown</option><option>Dr. Michael Chen</option><option>Dr. Sarah Williams</option><option>Dr. James Patel</option>
                  </select>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Primary Diagnosis</label>
                  <select value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, color: form.diagnosis ? '#111827' : '#9ca3af', outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif" }}>
                    <option value="">Select diagnosis</option>
                    <option>Myopia</option><option>Hyperopia</option><option>Astigmatism</option><option>Glaucoma</option><option>Cataracts</option><option>Macular Degeneration</option><option>Diabetic Retinopathy</option><option>Color Blindness</option><option>Dry Eye Syndrome</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Known Allergies</label>
                <input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, latex — or 'None known'"
                  style={{ width:'100%', height:42, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:13, fontWeight:300, outline:'none', background:'#f9fafb', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Clinical Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any relevant medical history, current medications, or special requirements..." rows={4}
                  style={{ width:'100%', borderRadius:9, border:'1.5px solid #e5e7eb', padding:'10px 14px', fontSize:13, fontWeight:300, outline:'none', background:'#f9fafb', resize:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18 }}>Review & Confirm</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Full Name', `${form.firstName} ${form.lastName}`.trim() || '(not set)'],
                  ['Date of Birth', form.dob || '(not set)'],
                  ['Gender', form.gender || '(not set)'],
                  ['Phone', form.phone || '(not set)'],
                  ['Email', form.email || '—'],
                  ['Insurance', form.insurance || '—'],
                  ['Physician', form.physician || '—'],
                  ['Diagnosis', form.diagnosis || '—'],
                ].map(([k,v]) => (
                  <div key={k} style={{ background:'#f9fafb', borderRadius:9, padding:'10px 12px', border:'1px solid #e5e7eb' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Auto-generated ID preview */}
              <div style={{ marginTop:14, padding:14, background:`${accent}08`, borderRadius:10, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', gap:10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#374151' }}>Patient ID will be assigned automatically</div>
                  <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>e.g. XO-3025-0209 · Generated upon save</div>
                </div>
              </div>
              {saved && (
                <div style={{ marginTop:14, padding:14, background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize:12, fontWeight:700, color:'#16a34a' }}>Patient registered successfully! Redirecting to Patients...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right help */}
        <div style={{ flex:'0 0 200px' }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:10 }}>
              {step===1?'📋 Personal Info':step===2?'🏥 Medical Info':'✅ Almost done!'}
            </div>
            {step===1 && ['First and last name are required','Date of birth must be MM-DD-YYYY format','At least one contact method is required'].map((t,i) => (
              <div key={i} style={{ display:'flex', gap:7, marginBottom:8 }}>
                <div style={{ width:15, height:15, borderRadius:'50%', background:`${accent}18`, color:accent, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
            {step===2 && ['Insurance details help with billing','Assign a physician now or later','Clinical notes are visible to all doctors'].map((t,i) => (
              <div key={i} style={{ display:'flex', gap:7, marginBottom:8 }}>
                <div style={{ width:15, height:15, borderRadius:'50%', background:`${accent}18`, color:accent, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
            {step===3 && <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.6 }}>Review all information before saving. You can edit patient details any time from the Patients section.</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', flexShrink:0 }}>
        <button onClick={() => step>1 ? setStep(s=>s-1) : onNavigate('patients')} style={{ padding:'10px 20px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
          {step===1 ? 'Cancel' : '← Back'}
        </button>
        <button onClick={() => {
          if (step<3) setStep(s=>s+1);
          else { setSaved(true); setTimeout(() => onNavigate('patients'), 1800); }
        }} style={{ padding:'10px 24px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
          {step<3 ? 'Continue →' : '✓ Save Patient'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AddDevicePage, AddPatientPage });
