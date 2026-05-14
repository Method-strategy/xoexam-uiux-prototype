
// DoctorsPage.jsx — Doctor list + full profile (replaces previous popup modal)
// Tab pattern mirrors PatientProfile. Module lock pattern mirrors WelcomeScreen.

const DOCTORS = [
  {
    id:'1', name:'Dr. Alice Brown', initials:'AB', specialty:'Ophthalmologist', license:'MD-234567',
    phone:'(555) 111-2222', email:'alice.brown@xenonoph.com', exp:15, status:'Active', patients:342,
    dept:'Retina & Vitreous', shift:'Full Time', qual:'MD, FRCS',
    dob:'08/12/1978', joinDate:'01/15/2015', address:'123 Medical Plaza, Suite 400, Boston, MA 02115',
    emergency:'(555) 999-0000', medSchool:'Harvard Medical School', gradYear:2005,
    residency:'Massachusetts Eye and Ear Infirmary',
    fellowships:['Vitreoretinal Surgery — Johns Hopkins','Advanced Retina — Bascom Palmer'],
    certifications:['American Board of Ophthalmology','Fellow of the Royal College of Surgeons','Advanced Cardiac Life Support (ACLS)'],
    languages:['English','Spanish','Mandarin'],
    publications:23, avgRating:4.8, totalReviews:156, consultsMonth:89, successRate:97.5,
  },
  {
    id:'2', name:'Dr. Michael Chen', initials:'MC', specialty:'Optometrist', license:'OD-345678',
    phone:'(555) 222-3333', email:'michael.chen@xenonoph.com', exp:10, status:'Active', patients:278,
    dept:'General Optometry', shift:'Morning', qual:'OD, FAAO',
    dob:'03/04/1985', joinDate:'06/20/2018', address:'45 Vision Way, Cambridge, MA 02139',
    emergency:'(555) 888-7777', medSchool:'New England College of Optometry', gradYear:2012,
    residency:'VA Boston Healthcare System',
    fellowships:['Primary Care Optometry — Boston University'],
    certifications:['American Board of Optometry','Fellow, American Academy of Optometry'],
    languages:['English','Mandarin','Cantonese'],
    publications:8, avgRating:4.7, totalReviews:118, consultsMonth:104, successRate:96.2,
  },
  {
    id:'3', name:'Dr. Sarah Williams', initials:'SW', specialty:'Ophthalmologist', license:'MD-456789',
    phone:'(555) 333-4444', email:'sarah.williams@xenonoph.com', exp:12, status:'Active', patients:315,
    dept:'Cornea & Refractive', shift:'Full Time', qual:'MD, PhD',
    dob:'11/22/1981', joinDate:'03/10/2016', address:'78 Ophthalmic Drive, Boston, MA 02115',
    emergency:'(555) 777-6666', medSchool:'Johns Hopkins School of Medicine', gradYear:2008,
    residency:'Wilmer Eye Institute',
    fellowships:['Cornea & External Disease — Wills Eye Hospital','Refractive Surgery — Duke'],
    certifications:['American Board of Ophthalmology','American Academy of Ophthalmology'],
    languages:['English','French'],
    publications:31, avgRating:4.9, totalReviews:204, consultsMonth:96, successRate:98.1,
  },
  {
    id:'4', name:'Dr. James Patel', initials:'JP', specialty:'Glaucoma Specialist', license:'MD-567890',
    phone:'(555) 444-5555', email:'james.patel@xenonoph.com', exp:18, status:'Active', patients:401,
    dept:'Glaucoma', shift:'Evening', qual:'MD, FACS',
    dob:'06/18/1974', joinDate:'09/01/2012', address:'200 Pressure Point Ave, Brookline, MA 02446',
    emergency:'(555) 666-5555', medSchool:'Stanford University School of Medicine', gradYear:2002,
    residency:'Stanford Byers Eye Institute',
    fellowships:['Glaucoma — Wilmer Eye Institute'],
    certifications:['American Board of Ophthalmology','American Glaucoma Society'],
    languages:['English','Hindi','Gujarati'],
    publications:42, avgRating:4.8, totalReviews:267, consultsMonth:78, successRate:96.8,
  },
  {
    id:'5', name:'Dr. Lisa Torres', initials:'LT', specialty:'Pediatric Eye Care', license:'MD-678901',
    phone:'(555) 555-6666', email:'lisa.torres@xenonoph.com', exp:8, status:'On Leave', patients:156,
    dept:'Pediatrics', shift:'Morning', qual:'MD',
    dob:'02/14/1988', joinDate:'09/01/2019', address:'12 Childhood Lane, Newton, MA 02458',
    emergency:'(555) 555-4444', medSchool:'UCLA David Geffen School of Medicine', gradYear:2014,
    residency:'Boston Children\u2019s Hospital',
    fellowships:['Pediatric Ophthalmology — Boston Children\u2019s Hospital'],
    certifications:['American Board of Ophthalmology','American Association for Pediatric Ophthalmology'],
    languages:['English','Spanish'],
    publications:11, avgRating:4.9, totalReviews:142, consultsMonth:0, successRate:97.4,
  },
  {
    id:'6', name:'Dr. David Kumar', initials:'DK', specialty:'Oculoplastic Surgeon', license:'MD-789012',
    phone:'(555) 666-7777', email:'david.kumar@xenonoph.com', exp:14, status:'Active', patients:256,
    dept:'Oculoplastics', shift:'Full Time', qual:'MD, FACS',
    dob:'09/30/1979', joinDate:'02/28/2014', address:'89 Surgical Center Rd, Boston, MA 02118',
    emergency:'(555) 444-3333', medSchool:'University of Pennsylvania', gradYear:2006,
    residency:'Wills Eye Hospital',
    fellowships:['Oculoplastic & Reconstructive Surgery — Bascom Palmer'],
    certifications:['American Board of Ophthalmology','American Society of Ophthalmic Plastic Surgery'],
    languages:['English','Hindi'],
    publications:18, avgRating:4.7, totalReviews:189, consultsMonth:71, successRate:98.4,
  },
  {
    id:'7', name:'Dr. Emily Rodriguez', initials:'ER', specialty:'Retina Specialist', license:'MD-890123',
    phone:'(555) 777-8888', email:'emily.rodriguez@xenonoph.com', exp:20, status:'Active', patients:482,
    dept:'Retina & Vitreous', shift:'Full Time', qual:'MD, FACS, FASRS',
    dob:'04/03/1972', joinDate:'05/15/2010', address:'34 Macula Way, Boston, MA 02115',
    emergency:'(555) 333-2222', medSchool:'Yale School of Medicine', gradYear:2000,
    residency:'Bascom Palmer Eye Institute',
    fellowships:['Vitreoretinal Surgery — Bascom Palmer','Medical Retina — Cole Eye Institute'],
    certifications:['American Board of Ophthalmology','American Society of Retina Specialists'],
    languages:['English','Spanish','Portuguese'],
    publications:67, avgRating:4.9, totalReviews:312, consultsMonth:102, successRate:98.7,
  },
  {
    id:'8', name:'Dr. Robert Anderson', initials:'RA', specialty:'Neuro-Ophthalmologist', license:'MD-901234',
    phone:'(555) 888-9999', email:'robert.anderson@xenonoph.com', exp:11, status:'Active', patients:198,
    dept:'Neuro-Ophthalmology', shift:'Morning', qual:'MD, FAAN',
    dob:'12/07/1983', joinDate:'08/22/2017', address:'56 Cortex Court, Cambridge, MA 02138',
    emergency:'(555) 222-1111', medSchool:'University of Michigan Medical School', gradYear:2010,
    residency:'Massachusetts General Hospital',
    fellowships:['Neuro-Ophthalmology — Bascom Palmer'],
    certifications:['American Board of Ophthalmology','American Academy of Neurology'],
    languages:['English','German'],
    publications:14, avgRating:4.8, totalReviews:97, consultsMonth:64, successRate:97.0,
  },
];

const DOC_REVIEWS = [
  { id:1, patient:'Sarah M.', rating:5, comment:'Excellent care and very thorough examination. Everything explained clearly.', date:'Oct 20, 2025' },
  { id:2, patient:'Michael T.', rating:5, comment:'Best ophthalmologist I have ever seen. Very professional and caring.', date:'Oct 18, 2025' },
  { id:3, patient:'Lisa K.', rating:4, comment:'Great overall. Wait time was a bit long but worth it.', date:'Oct 15, 2025' },
  { id:4, patient:'David R.', rating:5, comment:'Outstanding diagnosis and follow-up. Very pleased with the outcome.', date:'Oct 10, 2025' },
];

const DOC_SCHEDULE = [
  { day:'Monday',    date:'Oct 27', appts:[
    { time:'09:00 AM', patient:'John Doe',        type:'Follow-up',           dur:'30 min', room:'Room 301', status:'Confirmed' },
    { time:'10:30 AM', patient:'Jane Smith',      type:'Initial Consultation', dur:'45 min', room:'Room 301', status:'Confirmed' },
    { time:'02:00 PM', patient:'Robert Johnson',  type:'Surgery Consult',     dur:'60 min', room:'Room 302', status:'Pending' },
  ]},
  { day:'Tuesday',   date:'Oct 28', appts:[
    { time:'09:00 AM', patient:'Emily Davis',     type:'Post-Op Checkup',     dur:'30 min', room:'Room 301', status:'Confirmed' },
    { time:'11:00 AM', patient:'Michael Brown',   type:'Routine Exam',        dur:'30 min', room:'Room 301', status:'Confirmed' },
    { time:'03:00 PM', patient:'Anna Lee',        type:'Follow-up',           dur:'30 min', room:'Room 303', status:'Confirmed' },
  ]},
  { day:'Wednesday', date:'Oct 29', appts:[
    { time:'10:00 AM', patient:'Sarah Wilson',    type:'Emergency',           dur:'45 min', room:'Room 302', status:'Urgent' },
    { time:'01:30 PM', patient:'Kevin Chen',      type:'Routine Exam',        dur:'30 min', room:'Room 301', status:'Confirmed' },
  ]},
  { day:'Thursday',  date:'Oct 30', appts:[
    { time:'09:30 AM', patient:'Maria Garcia',    type:'Follow-up',           dur:'30 min', room:'Room 301', status:'Confirmed' },
    { time:'02:00 PM', patient:'Thomas Wright',   type:'Surgery Consult',     dur:'60 min', room:'Room 302', status:'Pending' },
  ]},
  { day:'Friday',    date:'Oct 31', appts:[
    { time:'09:00 AM', patient:'Patricia Miller', type:'Initial Consultation', dur:'45 min', room:'Room 301', status:'Confirmed' },
    { time:'11:30 AM', patient:'James Park',      type:'Routine Exam',        dur:'30 min', room:'Room 303', status:'Confirmed' },
  ]},
];

// ── Module lock pattern (same vocabulary as WelcomeScreen) ──
function ModuleCard({ id, name, color, tagline, status, action, onAction }) {
  const [hover, setHover] = React.useState(false);
  const locked = status === 'locked';
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      onClick={()=>!locked && onAction && onAction()}
      style={{
        flex:1, background:'#fff', borderRadius:14,
        border: `1.5px solid ${hover && !locked ? color : '#e5e7eb'}`,
        cursor: locked ? 'default' : 'pointer', overflow:'hidden',
        boxShadow: hover && !locked ? `0 8px 24px ${color}25` : 'none',
        transform: hover && !locked ? 'translateY(-2px)' : 'none',
        transition:'all 0.2s', position:'relative', minWidth:0
      }}
    >
      {locked && (
        <div style={{ position:'absolute', top:14, right:14, width:26, height:26, borderRadius:'50%', background:'rgba(14,47,94,0.06)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      )}
      <div style={{ height:4, background:`linear-gradient(90deg, ${color}, ${color}88)`, opacity: locked ? 0.4 : 1 }}/>
      <div style={{ padding:'20px 22px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:6 }}>
          <span style={{ fontSize:18, fontWeight:700, color: locked ? '#9ca3af' : '#0e2f5e', letterSpacing:'-0.01em' }}>{name}</span>
        </div>
        <p style={{ fontSize:12, fontWeight:300, color: locked ? '#9ca3af' : '#6b7280', lineHeight:1.5, margin:'0 0 18px', minHeight:36 }}>{tagline}</p>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
          padding:'9px 13px', borderRadius:8,
          background: locked ? '#f9fafb' : (hover ? `${color}12` : '#f9fafb'),
          border: `1px solid ${locked ? '#e5e7eb' : (hover ? color+'40' : '#e5e7eb')}`,
          transition:'all 0.2s'
        }}>
          <span style={{ fontSize:11, fontWeight:700, color: locked ? '#9ca3af' : (hover ? color : '#6b7280'), textTransform:'uppercase', letterSpacing:'0.08em' }}>
            {action}
          </span>
          {!locked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hover?color:'#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:hover?'translateX(2px)':'none', transition:'transform 0.2s' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Doctor Profile (full page, 6 tabs) ──
function DoctorProfile({ doc, onBack, accent }) {
  const [tab, setTab] = React.useState('overview');

  const TABS = [
    ['overview','Overview'],
    ['contact','Contact'],
    ['credentials','Credentials'],
    ['schedule','Schedule'],
    ['modules','Connected Modules'],
    ['reviews','Reviews'],
  ];

  const tenure = new Date().getFullYear() - parseInt(doc.joinDate.split('/')[2],10);

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'8px 0', borderBottom:'1px solid #f3f4f6', gap:12 }}>
      <span style={{ fontSize:12, fontWeight:300, color:'#6b7280', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:700, color:'#111827', textAlign:'right' }}>{value}</span>
    </div>
  );

  const StatCard = ({ icon, iconBg, iconColor, label, value, sub, subColor }) => (
    <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:18, display:'flex', alignItems:'flex-start', gap:14 }}>
      <div style={{ width:38, height:38, borderRadius:'50%', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:iconColor }}>{icon}</div>
      <div style={{ minWidth:0, flex:1 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2 }}>{value}</div>
        {sub && <div style={{ fontSize:11, fontWeight:300, color: subColor || '#6b7280' }}>{sub}</div>}
      </div>
    </div>
  );

  const ApptStatusBadge = ({ status }) => {
    const map = {
      'Confirmed': { bg:'#dcfce7', fg:'#16a34a' },
      'Pending':   { bg:'#fef3c7', fg:'#d97706' },
      'Urgent':    { bg:'#fee2e2', fg:'#dc2626' },
    };
    const s = map[status] || { bg:'#f3f4f6', fg:'#6b7280' };
    return <span style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.fg, textTransform:'uppercase', letterSpacing:'0.06em' }}>{status}</span>;
  };

  // ── Overview tab ──
  const renderOverview = () => (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/></svg>}
        iconBg={`${accent}15`} iconColor={accent}
        label="Department" value={doc.dept} sub={doc.shift}
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="m15.5 12.9 1.5 8.5-5-3-5 3 1.5-8.5"/></svg>}
        iconBg={`${accent}15`} iconColor={accent}
        label="License Number" value={doc.license} sub="Valid & Active"
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
        iconBg={`${accent}15`} iconColor={accent}
        label="Joined" value={doc.joinDate} sub={`${tenure} years with us`}
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36L9.24 2.18 6.89 10.54A2 2 0 0 1 4.49 12H2"/></svg>}
        iconBg="#dcfce7" iconColor="#16a34a"
        label="This Month" value={`${doc.consultsMonth} Consultations`} sub="+12% from last month" subColor="#16a34a"
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>}
        iconBg="#ede9fe" iconColor="#7c3aed"
        label="Publications" value={`${doc.publications} Research Papers`} sub="Peer-reviewed"
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        iconBg="#dbeafe" iconColor="#2563eb"
        label="Languages" value={doc.languages.join(', ')} sub={`${doc.languages.length} languages`}
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        iconBg="#dcfce7" iconColor="#16a34a"
        label="Success Rate" value={`${doc.successRate}%`} sub="Across all procedures"
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        iconBg="#fef3c7" iconColor="#d97706"
        label="Patient Rating" value={`${doc.avgRating} / 5.0`} sub={`${doc.totalReviews} reviews`}
      />
      <StatCard
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 7h-7m7 5h-7m7 5h-7M4 7h.01M4 12h.01M4 17h.01"/></svg>}
        iconBg={`${accent}15`} iconColor={accent}
        label="Active Patients" value={doc.patients} sub={`${doc.exp} years experience`}
      />
    </div>
  );

  // ── Contact tab ──
  const renderContact = () => (
    <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:18 }}>Contact Information</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 32px' }}>
        <Row label="Email" value={doc.email}/>
        <Row label="Phone" value={doc.phone}/>
        <Row label="Emergency Contact" value={doc.emergency}/>
        <Row label="Date of Birth" value={doc.dob}/>
        <div style={{ gridColumn:'1/-1' }}>
          <Row label="Address" value={doc.address}/>
        </div>
      </div>
    </div>
  );

  // ── Credentials tab ──
  const CredSection = ({ title, items, dotColor }) => (
    <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>{title}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map((item,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:'#f9fafb', borderRadius:8, border:'1px solid #f3f4f6' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:dotColor, marginTop:6, flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCredentials = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Education</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ paddingLeft:14, borderLeft:`2px solid ${accent}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Medical Degree ({doc.qual.split(',')[0].trim()})</div>
            <div style={{ fontSize:12, fontWeight:300, color:'#6b7280', marginTop:2 }}>{doc.medSchool}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:2 }}>Graduated {doc.gradYear}</div>
          </div>
          <div style={{ paddingLeft:14, borderLeft:`2px solid ${accent}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Residency</div>
            <div style={{ fontSize:12, fontWeight:300, color:'#6b7280', marginTop:2 }}>{doc.residency}</div>
            <div style={{ fontSize:11, fontWeight:300, color:'#9ca3af', marginTop:2 }}>Ophthalmology · 3 years</div>
          </div>
        </div>
      </div>
      <CredSection title="Fellowships" items={doc.fellowships} dotColor="#7c3aed"/>
      <CredSection title="Certifications" items={doc.certifications} dotColor="#16a34a"/>
    </div>
  );

  // ── Schedule tab ──
  const renderSchedule = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>This Week's Schedule</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:2 }}>Oct 27 — Oct 31, 2025</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      {DOC_SCHEDULE.map(day => (
        <div key={day.day} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{day.day}</span>
            <span style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{day.date}</span>
            <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:accent }}>{day.appts.length} {day.appts.length===1?'appointment':'appointments'}</span>
          </div>
          {day.appts.map((a,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'90px 1fr 140px 100px 90px', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i<day.appts.length-1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.time}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{a.patient}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.type}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.room}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{a.dur}</div>
              <ApptStatusBadge status={a.status}/>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // ── Modules tab ──
  const renderModules = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>XO Vision Care System</div>
        <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:0, lineHeight:1.6 }}>
          Connected modules available to {doc.name.replace('Dr. ','Dr. ')}. xoExam™ is active for this practice. Additional modules expand the care continuum from scheduling to fitting to finishing.
        </p>
      </div>
      <div style={{ display:'flex', gap:14 }}>
        <ModuleCard
          id="xoiris" name="xoIris™" color="#155bcc"
          tagline="Intelligent real-time integrated scheduling. Sync patient and doctor appointments with xoExam."
          status="unlocked" action="Open xoIris"
          onAction={() => window.open('https://xo-iris.com/login','_blank')}
        />
        <ModuleCard
          id="xofit" name="xoFit™" color="#05c1bc"
          tagline="Advanced frame fitting precision. Sync frame measurements directly to patient records."
          status="locked" action="Contact XO Sales"
        />
        <ModuleCard
          id="xolab" name="xoLab™" color="#75d647"
          tagline="Precision in-office eyewear finishing. Close the loop from prescription to delivery."
          status="locked" action="Contact XO Sales"
        />
      </div>
      <div style={{ background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.5 }}>
          Locked modules require additional licensing. Contact your XO Sales representative to unlock xoFit™ and xoLab™ for this practice.
        </span>
      </div>
    </div>
  );

  // ── Reviews tab ──
  const renderReviews = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:24, display:'flex', alignItems:'center', gap:24 }}>
        <div style={{ textAlign:'center', paddingRight:24, borderRight:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:42, fontWeight:700, color:'#111827', lineHeight:1 }}>{doc.avgRating}</div>
          <div style={{ display:'flex', gap:2, marginTop:8, justifyContent:'center' }}>
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.floor(doc.avgRating) ? '#f59e0b' : '#e5e7eb'} stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:6 }}>{doc.totalReviews} reviews</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:4 }}>Patient feedback</div>
          <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', lineHeight:1.6 }}>
            Reviews collected via post-appointment surveys. Showing the {DOC_REVIEWS.length} most recent.
          </div>
        </div>
      </div>
      {DOC_REVIEWS.map(r => (
        <div key={r.id} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:18 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#6b7280' }}>
                {r.patient.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{r.patient}</div>
                <div style={{ display:'flex', gap:2, marginTop:2 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= r.rating ? '#f59e0b' : '#e5e7eb'} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>{r.date}</span>
          </div>
          <p style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.6, margin:0 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f3f4f6', fontFamily:"'Nunito Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'16px 24px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, color:'#6b7280', fontFamily:"'Nunito Sans', sans-serif", padding:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Doctors
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'white', flexShrink:0 }}>{doc.initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, color:'#111827' }}>{doc.name}</div>
              <span style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:20, background: doc.status==='Active'?'#dcfce7':'#fef3c7', color: doc.status==='Active'?'#16a34a':'#d97706', textTransform:'uppercase', letterSpacing:'0.06em' }}>{doc.status}</span>
              <span style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'#eff6ff', color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.06em' }}>{doc.shift}</span>
            </div>
            <div style={{ fontSize:12, fontWeight:300, color:'#6b7280' }}>
              {doc.qual} · {doc.specialty} · {doc.dept} · {doc.license}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Edit Profile</button>
            <button style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif" }}>Message</button>
            <button style={{ padding:'8px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', gap:6, boxShadow:`0 3px 8px ${accent}40` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Generate Report
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginTop:16 }}>
          {TABS.map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:'10px 20px', border:'none', background:'none', cursor:'pointer',
              fontSize:13, fontWeight: tab===id?700:300, color: tab===id?accent:'#6b7280',
              borderBottom:`2px solid ${tab===id?accent:'transparent'}`,
              fontFamily:"'Nunito Sans', sans-serif", transition:'all 0.15s', marginBottom:-1
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:'auto', padding:24 }}>
        {tab==='overview'    && renderOverview()}
        {tab==='contact'     && renderContact()}
        {tab==='credentials' && renderCredentials()}
        {tab==='schedule'    && renderSchedule()}
        {tab==='modules'     && renderModules()}
        {tab==='reviews'     && renderReviews()}
      </div>
    </div>
  );
}

// ── Doctor List (expanded with stats + filter + sort + per-card menu) ──
function DoctorsPage({ tweaks }) {
  const accent = tweaks?.accentColor || '#1f8eff';
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('name');
  const [sortMenuOpen, setSortMenuOpen] = React.useState(false);

  const filtered = DOCTORS.filter(d => !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.dept.toLowerCase().includes(search.toLowerCase()) ||
    d.license.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy==='name')      return a.name.localeCompare(b.name);
    if (sortBy==='patients')  return b.patients - a.patients;
    if (sortBy==='exp')       return b.exp - a.exp;
    if (sortBy==='dept')      return a.dept.localeCompare(b.dept);
    return 0;
  });

  // Stats
  const total = DOCTORS.length;
  const active = DOCTORS.filter(d => d.status==='Active').length;
  const onLeave = DOCTORS.filter(d => d.status==='On Leave').length;
  const ophths = DOCTORS.filter(d => d.specialty.includes('Ophthalmologist')).length;
  const opts = DOCTORS.filter(d => d.specialty==='Optometrist').length;
  const specs = DOCTORS.filter(d => d.specialty.includes('Specialist') || d.specialty.includes('Surgeon') || d.specialty.includes('Pediatric') || d.specialty.includes('Neuro')).length;

  if (selected) return <DoctorProfile doc={selected} onBack={()=>setSelected(null)} accent={accent}/>;

  return (
    <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16, height:'100%', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif", overflow:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Doctors</h1>
          <p style={{ fontSize:12, fontWeight:300, color:'#6b7280', margin:'3px 0 0' }}>{total} practitioners on staff</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} placeholder="Search by name, specialty, dept, license..."
              style={{ height:38, width:280, paddingLeft:32, paddingRight:12, borderRadius:9, border:`1.5px solid ${searchFocused?accent:'#e5e7eb'}`, background:'#fff', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:"'Nunito Sans', sans-serif" }}
            />
          </div>
          <div style={{ position:'relative' }}>
            <button onClick={()=>setSortMenuOpen(v=>!v)} style={{ width:38, height:38, borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
            </button>
            {sortMenuOpen && (
              <div style={{ position:'absolute', top:42, right:0, background:'#fff', borderRadius:9, border:'1.5px solid #e5e7eb', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', padding:6, minWidth:140, zIndex:10 }}>
                {[['name','Name'],['patients','Patients'],['exp','Experience'],['dept','Department']].map(([k,l]) => (
                  <button key={k} onClick={()=>{ setSortBy(k); setSortMenuOpen(false); }} style={{
                    display:'block', width:'100%', textAlign:'left', padding:'8px 12px', border:'none', background: sortBy===k ? `${accent}10` : 'transparent',
                    color: sortBy===k ? accent : '#374151', fontSize:12, fontWeight: sortBy===k?700:300, cursor:'pointer', borderRadius:6, fontFamily:"'Nunito Sans', sans-serif"
                  }}>Sort by {l}</button>
                ))}
              </div>
            )}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${accent},#155bcc)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif", boxShadow:`0 3px 12px ${accent}40` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Doctor
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, flexShrink:0 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Medical Staff Overview</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:32 }}>
            <div>
              <div style={{ fontSize:26, fontWeight:700, color:'#111827', lineHeight:1 }}>{total}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:4 }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize:26, fontWeight:700, color:'#16a34a', lineHeight:1 }}>{active}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:4 }}>Active</div>
            </div>
            <div>
              <div style={{ fontSize:26, fontWeight:700, color:'#d97706', lineHeight:1 }}>{onLeave}</div>
              <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginTop:4 }}>On Leave</div>
            </div>
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e5e7eb', padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Specialties Distribution</div>
          <div style={{ display:'flex', gap:14 }}>
            {[
              { count:ophths, label:'Ophthalmologists', color:accent },
              { count:opts,   label:'Optometrists',     color:'#155bcc' },
              { count:specs,  label:'Specialists',      color:'#05c1bc' },
            ].map((s,i) => (
              <div key={i} style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
                  <span style={{ fontSize:18, fontWeight:700, color:'#111827' }}>{s.count}</span>
                  <span style={{ fontSize:10, fontWeight:300, color:'#6b7280' }}>{s.label}</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:'#f3f4f6', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(s.count/total)*100}%`, background:s.color, borderRadius:3, transition:'width 0.3s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor grid */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, alignContent:'start' }}>
        {sorted.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#9ca3af', fontSize:12, fontWeight:300 }}>
            No doctors found matching your search.
          </div>
        )}
        {sorted.map(doc => (
          <div key={doc.id} onClick={()=>setSelected(doc)} style={{
            background:'#fff', borderRadius:14, border:'1.5px solid #e5e7eb', padding:18, cursor:'pointer', transition:'all 0.2s', position:'relative'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 8px 24px ${accent}18`; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}
          >
            {/* per-card menu */}
            <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen===doc.id ? null : doc.id); }} style={{
              position:'absolute', top:12, right:12, width:24, height:24, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {menuOpen===doc.id && (
              <div style={{ position:'absolute', top:38, right:12, background:'#fff', borderRadius:9, border:'1.5px solid #e5e7eb', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', padding:6, minWidth:140, zIndex:5 }}
                   onClick={e => e.stopPropagation()}>
                {[
                  ['View Profile', () => { setSelected(doc); setMenuOpen(null); }],
                  ['Edit Details', () => setMenuOpen(null)],
                  ['View Schedule', () => { setSelected(doc); setMenuOpen(null); }],
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 12px', border:'none', background:'transparent', color:'#374151', fontSize:12, fontWeight:300, cursor:'pointer', borderRadius:6, fontFamily:"'Nunito Sans', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >{label}</button>
                ))}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, paddingRight:24 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#155bcc)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'white', flexShrink:0 }}>{doc.initials}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'#6b7280' }}>{doc.specialty}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20, background: doc.status==='Active'?'#dcfce7':'#fef3c7', color: doc.status==='Active'?'#16a34a':'#d97706', textTransform:'uppercase', letterSpacing:'0.06em' }}>{doc.status}</span>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'#eff6ff', color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.06em' }}>{doc.shift}</span>
            </div>
            <div style={{ fontSize:11, fontWeight:300, color:'#6b7280', marginBottom:3 }}>{doc.dept}</div>
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #f3f4f6', marginTop:8 }}>
              <span style={{ fontSize:11, fontWeight:300, color:'#9ca3af' }}>{doc.exp} yrs exp</span>
              <span style={{ fontSize:11, fontWeight:700, color:accent }}>{doc.patients} patients</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DoctorsPage, DoctorProfile });
