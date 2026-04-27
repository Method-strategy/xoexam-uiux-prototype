// PatientsPage.jsx — Full patient list + tabbed patient profile
// Overview / Appointments / Tests / Insurance tabs

const PATIENTS = [
  { id:'1', name:'Willy Ben Chen',       initials:'WC', dob:'10-02-1998', age:27, patientId:'XO-3025-0183', phone:'(555) 123-4567', email:'willy.chen@example.com',        gender:'Male',   insurance:'Blue Cross Blue Shield', status:'Active', doctor:'Dr. Alice Brown',    phase:'Early Stage',  lastVisit:'10-04-2025', diagnosis:'Myopia',               medStatus:'Stable'   },
  { id:'2', name:'Emily Watford',         initials:'EW', dob:'20-01-1988', age:37, patientId:'XO-3025-0184', phone:'(555) 234-5678', email:'emily.watford@example.com',       gender:'Female', insurance:'UnitedHealthcare',       status:'Active', doctor:'Dr. Michael Chen',   phase:'Ongoing',      lastVisit:'09-04-2025', diagnosis:'Glaucoma',             medStatus:'Critical' },
  { id:'3', name:'Nicholas Robertson',    initials:'NR', dob:'24-06-1999', age:25, patientId:'XO-3025-0185', phone:'(555) 345-6789', email:'nicholas.robertson@example.com',  gender:'Male',   insurance:'Aetna',                  status:'Active', doctor:'Dr. Alice Brown',    phase:'Early Stage',  lastVisit:'08-04-2025', diagnosis:'Astigmatism',          medStatus:'Stable'   },
  { id:'4', name:'Sarah Mitchell',        initials:'SM', dob:'14-09-1992', age:32, patientId:'XO-3025-0186', phone:'(555) 456-7890', email:'sarah.mitchell@example.com',      gender:'Female', insurance:'Cigna',                  status:'Active', doctor:'Dr. Sarah Williams', phase:'Maintenance',  lastVisit:'07-04-2025', diagnosis:'Cataracts',            medStatus:'Stable'   },
  { id:'5', name:'James Wilson',          initials:'JW', dob:'03-11-1975', age:49, patientId:'XO-3025-0187', phone:'(555) 567-8901', email:'james.wilson@example.com',        gender:'Male',   insurance:'Medicare',               status:'Active', doctor:'Dr. Michael Chen',   phase:'Ongoing',      lastVisit:'06-04-2025', diagnosis:'Diabetic Retinopathy', medStatus:'Critical' },
  { id:'6', name:'Maria Garcia',          initials:'MG', dob:'07-03-2001', age:24, patientId:'XO-3025-0188', phone:'(555) 678-9012', email:'maria.garcia@example.com',        gender:'Female', insurance:'Medicaid',               status:'New',    doctor:'Dr. Alice Brown',    phase:'Early Stage',  lastVisit:'05-04-2025', diagnosis:'Color Blindness',      medStatus:'Mild'     },
  { id:'7', name:'Robert Kim',            initials:'RK', dob:'19-07-1968', age:56, patientId:'XO-3025-0189', phone:'(555) 789-0123', email:'robert.kim@example.com',          gender:'Male',   insurance:'Blue Cross Blue Shield', status:'Active', doctor:'Dr. Sarah Williams', phase:'Maintenance',  lastVisit:'04-04-2025', diagnosis:'Macular Degeneration', medStatus:'Stable'   },
  { id:'8', name:'Linda Thompson',        initials:'LT', dob:'25-12-1983', age:41, patientId:'XO-3025-0190', phone:'(555) 890-1234', email:'linda.thompson@example.com',      gender:'Female', insurance:'Aetna',                  status:'Active', doctor:'Dr. Michael Chen',   phase:'Ongoing',      lastVisit:'03-04-2025', diagnosis:'Dry Eye Syndrome',     medStatus:'Mild'     },
];

const TEST_RESULTS = [
  { id:'1', name:'Visual Acuity Test',      date:'15 Oct 2024', result:'20/20 OD, 20/25 OS',          status:'Normal', doctor:'Dr. Sarah Chen',   duration:'15 min',
    details:{ rightEye:{ label:'OD', value:'20/20', note:'Excellent VA' }, leftEye:{ label:'OS', value:'20/25', note:'Mild reduction, correctable' }, recommendation:'Consider glasses for distance viewing', technician:'Sarah Miller', method:'Snellen Chart at 20 feet' } },
  { id:'2', name:'Intraocular Pressure',     date:'15 Oct 2024', result:'14 mmHg OD, 15 mmHg OS',     status:'Normal', doctor:'Dr. Sarah Chen',   duration:'10 min',
    details:{ rightEye:{ label:'OD', value:'14 mmHg', note:'Within normal range' }, leftEye:{ label:'OS', value:'15 mmHg', note:'Within normal range' }, recommendation:'Continue annual monitoring. No signs of glaucoma.', technician:'Michael Chen', method:'Goldmann Applanation Tonometry' } },
  { id:'3', name:'Visual Field Test',        date:'20 Sep 2024', result:'No defects detected',         status:'Normal', doctor:'Dr. Michael Ross',  duration:'20 min',
    details:{ rightEye:{ label:'OD', value:'Sensitivity 98%', note:'Full visual field' }, leftEye:{ label:'OS', value:'Sensitivity 97%', note:'Full visual field' }, recommendation:'Excellent results. Continue routine monitoring.', technician:'Emma Watson', method:'Humphrey VF 24-2' } },
  { id:'4', name:'Color Vision Test',        date:'20 Sep 2024', result:'Normal color perception',     status:'Normal', doctor:'Dr. Michael Ross',  duration:'8 min',
    details:{ rightEye:{ label:'Score', value:'24/24 correct', note:'All Ishihara plates correct' }, leftEye:{ label:'Type', value:'Trichromatic', note:'No deficiency detected' }, recommendation:'Normal trichromatic vision', technician:'David Lee', method:'Ishihara 24-plate' } },
];

const UPCOMING_APPTS = [
  { id:'1', date:'15 Nov 2024', time:'09:30 AM', type:'Comprehensive Eye Exam', doctor:'Dr. Sarah Chen', status:'Confirmed', room:'Exam Room 3' },
  { id:'2', date:'22 Nov 2024', time:'02:00 PM', type:'Follow-up',              doctor:'Dr. Sarah Chen', status:'Confirmed', room:'Exam Room 1' },
];
const PAST_APPTS = [
  { id:'3', date:'15 Oct 2024', time:'10:00 AM', type:'Annual Check-up',        doctor:'Dr. Sarah Chen',    status:'Completed', notes:'Vision stable, no changes to prescription needed.' },
  { id:'4', date:'20 Sep 2024', time:'03:30 PM', type:'Contact Lens Fitting',   doctor:'Dr. Michael Ross',  status:'Completed', notes:'Fitted for new contact lenses. Patient reports good comfort.' },
  { id:'5', date:'01 Aug 2024', time:'11:00 AM', type:'Glaucoma Screening',     doctor:'Dr. Alice Brown',   status:'Completed', notes:'Pressures within normal range. No signs of progression.' },
];

const PATIENT_EXAM_TYPES = [
  { id:'visual-acuity', name:'Visual Acuity Exam' },
  { id:'color-vision', name:'Color Vision Test' },
  { id:'visual-field', name:'Visual Field Exam' },
  { id:'aberrometer', name:'Aberrometer Exam' },
  { id:'contrast-sensitivity', name:'Contrast Sensitivity' },
  { id:'extraocular-motility', name:'Extraocular Motility' },
  { id:'pupillometry', name:'Pupillometry Test' },
  { id:'refraction', name:'Refraction Test' },
  { id:'binocular-vision', name:'Binocular Vision Test' },
  { id:'accommodation', name:'Accommodation Test' },
  { id:'convergence', name:'Convergence Test' },
  { id:'keratometry', name:'Keratometry Test' },
  { id:'tear-film', name:'Tear Film Test' },
  { id:'visual-reaction-time', name:'Visual Reaction Time' },
  { id:'eye-tracking-accuracy', name:'Eye Tracking Accuracy' },
  { id:'fixation-stability', name:'Fixation Stability' },
  { id:'ai-pattern-recognition', name:'AI Pattern Recognition' },
];

function StatusBadge({ status }) {
  const c = {
    'Active':      { bg:'#dcfce7', color:'#16a34a' },
    'New':         { bg:'#dbeafe', color:'#2563eb' },
    'Stable':      { bg:'#dcfce7', color:'#16a34a' },
    'Critical':    { bg:'#fee2e2', color:'#dc2626' },
    'Mild':        { bg:'#fef9c3', color:'#ca8a04' },
    'Normal':      { bg:'#dcfce7', color:'#16a34a' },
    'Confirmed':   { bg:'#dbeafe', color:'#2563eb' },
    'Completed':   { bg:'#f3f4f6', color:'#6b7280' },
    'Early Stage': { bg:'#eff6ff', color:'#3b82f6' },
    'Ongoing':     { bg:'#fef3c7', color:'#d97706' },
    'Maintenance': { bg:'#f0fdf4', color:'#16a34a' },
  }[status] || { bg:'#f3f4f6', color:'#6b7280' };
  return <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:c.bg, color:c.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{status}</span>;
}

// ── Patient Profile ──
function PatientProfile({ patient, onBack, accent }) {
  const [tab, setTab] = React.useState('overview');
  const [selectedTest, setSelectedTest] = React.useState(null);
  const [showTestDetail, setShowTestDetail] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');
  const [notes, setNotes] = React.useState([
    { id:'1', date:'15 Oct 2024', author:'Dr. Sarah Chen', text:'Patient reports occasional eye strain when using computer for extended periods. Recommended 20-20-20 rule.' },
    { id:'2', date:'20 Sep 2024', author:'Dr. Michael Ross', text:'Successfully fitted for contact lenses. Patient educated on proper insertion and removal techniques.' },
  ]);
  const [showExamLauncher, setShowExamLauncher] = React.useState(false);
  const [launchedExam, setLaunchedExam] = React.useState('');

  const TABS = [['overview','Overview'],['appointments','Appointments'],['tests','Tests'],['insurance','Insurance']];

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(n=>[{ id:Date.now().toString(), date:new Date().toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'}), author:'Dr. Smith', text:noteText },...n]);
    setNoteText('');
  };

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
      <span style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{value}</span>
    </div>
  );

  // Overview tab
  const renderOverview = () => (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
      {/* Demographics */}
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Demographics</div>
        <Row label="Date of Birth" value={patient.dob}/>
        <Row label="Age" value={`${patient.age} years`}/>
        <Row label="Gender" value={patient.gender}/>
        <Row label="Phone" value={patient.phone}/>
        <Row label="Email" value={patient.email}/>
        <Row label="Patient ID" value={patient.patientId}/>
        <Row label="Registration" value="January 15, 2023"/>
        <Row label="Blood Type" value="A+"/>
      </div>

      {/* Medical */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Medical Status</div>
          <Row label="Primary Diagnosis" value={patient.diagnosis}/>
          <Row label="Medical Status" value={patient.medStatus}/>
          <Row label="Treatment Phase" value={patient.phase}/>
          <Row label="Primary Physician" value={patient.doctor}/>
          <Row label="Last Visit" value={patient.lastVisit}/>
          <Row label="Insurance" value={patient.insurance}/>
        </div>
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Allergies & Conditions</div>
          <Row label="Known Allergies" value="Penicillin"/>
          <Row label="Emergency Contact" value="John (Family)"/>
          <Row label="Emergency Phone" value="(555) 987-6543"/>
        </div>
      </div>

      {/* Notes - full width */}
      <div style={{ gridColumn:'1/-1', background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Clinical Notes</div>
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add a clinical note..." style={{ flex:1, padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:12, fontWeight:300, color:'#374151', fontFamily:"'Nunito Sans', sans-serif", resize:'none', height:72, outline:'none' }}/>
          <button onClick={addNote} style={{ padding:'0 20px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", flexShrink:0 }}>Add Note</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {notes.map(n => (
            <div key={n.id} style={{ background:'#f9fafb', borderRadius:9, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:accent }}>{n.author}</span>
                <span style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>{n.date}</span>
              </div>
              <p style={{ fontSize:12, fontWeight:300, color:'#374151', margin:0, lineHeight:1.6 }}>{n.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Appointments tab
  const renderAppointments = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Upcoming */}
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Upcoming Appointments</div>
          <button style={{ padding:'6px 14px', borderRadius:8, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>+ Add Appointment</button>
        </div>
        {UPCOMING_APPTS.map((a,i) => (
          <div key={a.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 160px 120px 80px', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:i<UPCOMING_APPTS.length-1?'1px solid #f3f4f6':'none' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.date}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.time}</div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.type}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.doctor}</div>
            </div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.room}</div>
            <StatusBadge status={a.status}/>
            <button style={{ padding:'6px 12px', borderRadius:7, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Reschedule</button>
          </div>
        ))}
      </div>

      {/* Past */}
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Past Appointments</div>
        </div>
        {PAST_APPTS.map((a,i) => (
          <div key={a.id} style={{ padding:'14px 20px', borderBottom:i<PAST_APPTS.length-1?'1px solid #f3f4f6':'none' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:6 }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.date} · {a.time}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginTop:2 }}>{a.type}</div>
                  <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.doctor}</div>
                </div>
              </div>
              <StatusBadge status={a.status}/>
            </div>
            {a.notes && <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.6, background:'#f9fafb', borderRadius:7, padding:'8px 10px', border:'1px solid #f3f4f6' }}>{a.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // Tests tab
  const renderTests = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Launch test */}
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: showExamLauncher?16:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Start New Exam</div>
          <button onClick={() => setShowExamLauncher(v=>!v)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'#05c1bc', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Start New Test
          </button>
        </div>
        {showExamLauncher && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {PATIENT_EXAM_TYPES.map(e => (
              <button key={e.id} onClick={() => { setLaunchedExam(e.name); setShowExamLauncher(false); setTimeout(()=>setLaunchedExam(''),2500); }} style={{ padding:'10px 12px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'left', fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s' }}
              onMouseEnter={e2=>{e2.currentTarget.style.borderColor=accent;e2.currentTarget.style.background=`${accent}08`;}}
              onMouseLeave={e2=>{e2.currentTarget.style.borderColor='#e5e7eb';e2.currentTarget.style.background='#f9fafb';}}>
                {e.name}
              </button>
            ))}
          </div>
        )}
        {launchedExam && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'#f0fdf4', borderRadius:8, border:'1px solid #bbf7d0', fontSize:12, fontWeight:700, color:'#16a34a' }}>
            ✓ Starting {launchedExam}...
          </div>
        )}
      </div>

      {/* Test results */}
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Test History</div>
        </div>
        {TEST_RESULTS.map((t,i) => (
          <div key={t.id} style={{ padding:'14px 20px', borderBottom:i<TEST_RESULTS.length-1?'1px solid #f3f4f6':'none', cursor:'pointer' }}
            onClick={() => setShowTestDetail(showTestDetail===t.id?null:t.id)}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 200px 120px 100px 80px', alignItems:'center', gap:12 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{t.name}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{t.doctor} · {t.duration}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{t.result}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>{t.date}</div>
              <StatusBadge status={t.status}/>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform:showTestDetail===t.id?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0 }}><path d="M6 9l6 6 6-6"/></svg>
            </div>
            {/* Detail expand */}
            {showTestDetail === t.id && (
              <div style={{ marginTop:14, padding:16, background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  {[t.details.rightEye, t.details.leftEye].map((eye,j) => (
                    <div key={j} style={{ background:'#fff', borderRadius:9, padding:'12px 14px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{eye.label}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:accent, marginBottom:3 }}>{eye.value}</div>
                      <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{eye.note}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {[['Recommendation',t.details.recommendation],['Technician',t.details.technician],['Method',t.details.method]].map(([l,v])=>(
                    <div key={l} style={{ display:'flex', gap:8, fontSize:11 }}>
                      <span style={{ fontWeight:700, color:'#374151', minWidth:110 }}>{l}:</span>
                      <span style={{ fontWeight:300, color:'#6b7280' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Insurance tab
  const renderInsurance = () => (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
      {[
        { label:'Primary Insurance', data:{ Provider:'Blue Cross Blue Shield', 'Policy #':'BCBS-1283-A', 'Group #':'GRP-9876', 'Plan Type':'PPO', Coverage:'Vision & General', 'Effective Date':'01/01/2024', 'Expiry Date':'12/31/2024', 'Co-pay':'$20', Deductible:'$500' } },
        { label:'Secondary Insurance', data:{ Provider:'VSP Vision Care', 'Policy #':'VSP-4521-B', 'Group #':'GRP-3344', 'Plan Type':'Vision Only', Coverage:'Vision Specialist', 'Effective Date':'01/01/2024', 'Expiry Date':'12/31/2024', 'Co-pay':'$10', Deductible:'$0' } }
      ].map(ins => (
        <div key={ins.label} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:16 }}>{ins.label}</div>
          {Object.entries(ins.data).map(([k,v]) => <Row key={k} label={k} value={v}/>)}
          <button style={{ width:'100%', marginTop:16, padding:'9px 0', borderRadius:9, border:`1.5px solid ${accent}`, background:`${accent}10`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>
            Verify Coverage
          </button>
        </div>
      ))}

      {/* Billing summary */}
      <div style={{ gridColumn:'1/-1', background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Billing Summary</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[['Total Billed','$1,240.00'],['Insurance Paid','$980.00'],['Patient Balance','$260.00'],['Last Payment','$130.00']].map(([l,v]) => (
            <div key={l} style={{ background:'#f9fafb', borderRadius:10, padding:'14px 16px', border:'1px solid #e5e7eb', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#111827' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Profile header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'16px 24px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, color:'#6b7280', fontFamily:"'Nunito Sans', sans-serif", padding:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Patients
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {/* Avatar */}
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'white', flexShrink:0 }}>{patient.initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, color:'#111827' }}>{patient.name}</div>
              <StatusBadge status={patient.status}/>
              <StatusBadge status={patient.medStatus}/>
            </div>
            <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>{patient.patientId} · Age {patient.age} · {patient.gender} · {patient.doctor}</div>
          </div>
          {/* Actions */}
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Edit Profile</button>
            <button style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Message</button>
            <button onClick={() => { setTab('tests'); setShowExamLauncher(true); }} style={{ padding:'8px 16px', borderRadius:9, border:'none', background:'#05c1bc', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Start New Test
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginTop:16, borderBottom:'none' }}>
          {TABS.map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:'10px 20px', border:'none', background:'none', cursor:'pointer',
              fontSize:13, fontWeight:tab===id?700:300, color:tab===id?accent:'#6b7280',
              borderBottom:`2px solid ${tab===id?accent:'transparent'}`,
              fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s', marginBottom:-1
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflow:'auto', padding:24 }}>
        {tab==='overview'     && renderOverview()}
        {tab==='appointments' && renderAppointments()}
        {tab==='tests'        && renderTests()}
        {tab==='insurance'    && renderInsurance()}
      </div>
    </div>
  );
}

// ── Patient List ──
function PatientsPage({ tweaks, onNavigate }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [filterPhase, setFilterPhase] = React.useState('All');
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [showAddForm, setShowAddForm] = React.useState(false);

  const filtered = PATIENTS.filter(p => {
    const matchSearch = search==='' || p.name.toLowerCase().includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus==='All' || p.status===filterStatus;
    const matchPhase  = filterPhase==='All'  || p.phase===filterPhase;
    return matchSearch && matchStatus && matchPhase;
  });

  if (selectedPatient) return <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} accent={accent}/>;

  return (
    <div style={{ padding:'20px 24px 24px', height:'100%', overflow:'auto', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#111827' }}>Patients</div>
          <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>{PATIENTS.length} total · {PATIENTS.filter(p=>p.status==='Active').length} active</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setShowAddForm(true)} style={{ padding:'9px 18px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:'1 1 220px', position:'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patients, ID, diagnosis..." style={{ width:'100%', padding:'9px 12px 9px 32px', borderRadius:9, border:'1.5px solid #e5e7eb', fontSize:12, fontWeight:300, color:'#374151', background:'#fff', outline:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
        </div>
        {[['Status',['All','Active','New'],filterStatus,setFilterStatus],['Phase',['All','Early Stage','Ongoing','Maintenance'],filterPhase,setFilterPhase]].map(([label,opts,val,set]) => (
          <div key={label} style={{ display:'flex', gap:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', alignSelf:'center' }}>{label}:</span>
            {opts.map(o => (
              <button key={o} onClick={()=>set(o)} style={{ padding:'6px 12px', borderRadius:20, border:`1.5px solid ${val===o?accent:'#e5e7eb'}`, background:val===o?accent:'#fff', color:val===o?'#fff':'#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>{o}</button>
            ))}
          </div>
        ))}
      </div>

      {/* Patient list */}
      <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 140px 120px 100px 80px', gap:0, background:'#f9fafb', borderBottom:'1.5px solid #e5e7eb', padding:'10px 20px' }}>
          {['Patient','Status','Diagnosis','Last Visit','Phase',''].map(h => <span key={h} style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</span>)}
        </div>
        {filtered.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>No patients match your search.</div>
        )}
        {filtered.map((p,i) => (
          <div key={p.id}
            onClick={() => setSelectedPatient(p)}
            style={{ display:'grid', gridTemplateColumns:'1fr 120px 140px 120px 100px 80px', alignItems:'center', gap:0, padding:'14px 20px', borderBottom:i<filtered.length-1?'1px solid #f3f4f6':'none', cursor:'pointer', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            {/* Patient info */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${accent}80,${accent})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>{p.initials}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{p.name}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{p.patientId} · Age {p.age}</div>
              </div>
            </div>
            <StatusBadge status={p.status}/>
            <div style={{ fontSize:12, fontWeight:300, color:'#374151' }}>{p.diagnosis}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{p.lastVisit}</div>
            <StatusBadge status={p.phase}/>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
          </div>
        ))}
      </div>

      {/* Add patient modal */}
      {showAddForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <AddPatientPage tweaks={tweaks} onNavigate={() => setShowAddForm(false)}/>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PatientsPage });
