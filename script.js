const API_URL='https://manager-khaki-ten.vercel.app'; // Vercel → Supabase
const GSHEET_URL='https://script.google.com/macros/s/AKfycbwHu6HvVRXHXNsNwtY2-DTRYY7AUAKcB9eEENTRxHulRiVHq3kJCNb_Cnt-6sycb4rDzw/exec';
const LOGO_URL='https://raw.githubusercontent.com/MR-REAL-png/Manager/main/logo.png';
const MOS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const CHART_COLORS=['#a78bfa','#f472b6','#60a5fa','#fb923c','#34d399','#818cf8','#fbbf24','#4ade80','#f87171','#e879f9','#38bdf8','#a3e635'];
const MONTH_COLORS=['#818cf8','#c084fc','#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#4ade80','#fbbf24','#e879f9','#38bdf8','#f87171'];

// ═══ SVG ICONS (Heroicons) ═══
const IC = {
  in:  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:13px;height:13px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"/></svg>',
  out: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:13px;height:13px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"/></svg>',
  card:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg>',
  bank:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>',
  cal: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>',
  note:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>',
  edit:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:12px;height:12px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>',
  warn:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',
  ok:  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
  notif:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>',
  chart:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>',
  tag: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"/></svg>',
  target:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
  reload:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
  lock:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>',
  save:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>',
  upload:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',
  down: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>',
  box: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>',
};


const ADMIN_PASS_DEFAULT='sheril';

let allRows=[],dbOpts={banks:[],kategoris:[],metodes:[],jenis:[]};
let isAdmin=false,editMode=false;
let chartKat=null,chartTab=null,chartRekap=null,chartMetode=null,chartKal=null,chartHarian=null;
let toastT,avgDetailData=null;
let kalYear=new Date().getFullYear(),kalMonth=new Date().getMonth();
let settModalType='';
let notifEnabled=true,alertPct=80,adminPassword=ADMIN_PASS_DEFAULT,komposisiRingkas=true;

// ═══ PARSE TANGGAL ═══
function parseTanggal(raw) {
  if(!raw) return '';
  if(!isNaN(Number(raw)) && Number(raw) > 40000) {
    const d = new Date((Number(raw) - 25569) * 86400 * 1000);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  if(typeof raw === 'string' && raw.includes('/')) {
    const p = raw.split('/');
    if(p.length === 3) {
      const d = p[0].padStart(2,'0'), m = p[1].padStart(2,'0');
      const y = p[2].length === 2 ? '20'+p[2] : p[2];
      return `${y}-${m}-${d}`;
    }
  }
  if(typeof raw === 'string' && raw.includes('-') && raw.length >= 8) {
    return raw.substring(0,10);
  }
  if(typeof raw === 'string' && raw.includes('-')) {
    const p = raw.split('-');
    if(p.length === 3 && p[0].length <= 2) {
      return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
    }
  }
  return '';
}

// ═══ PERIOD ═══
function getEffective25(year,month){
  const d=new Date(year,month,24);
  const dow=d.getDay();
  if(dow===6) d.setDate(23);
  return d;
}
function getActivePeriod(){
  const today=new Date();today.setHours(0,0,0,0);
  const y=today.getFullYear(),m=today.getMonth();
  const eff=getEffective25(y,m);
  let s,e;
  if(today>eff){
    s=new Date(eff);
    const nm=m===11?0:m+1,ny=m===11?y+1:y;
    e=getEffective25(ny,nm);
  } else {
    const pm=m===0?11:m-1,py=m===0?y-1:y;
    s=getEffective25(py,pm);e=new Date(eff);
  }
  return{startDate:s,endDate:e};
}
function getActivePeriodResolved(){
  const periodeCustom=JSON.parse(localStorage.getItem('mm_periode')||'{}');
  if(periodeCustom.startDate&&periodeCustom.endDate){
    return{startDate:new Date(periodeCustom.startDate),endDate:new Date(periodeCustom.endDate)};
  }
  return getActivePeriod();
}
function fmtDateShort(d){return`${d.getDate()} ${MOS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`}
function getSisaHari(endDate){
  const today=new Date();today.setHours(0,0,0,0);
  const end=new Date(endDate);end.setHours(0,0,0,0);
  let total=0,weekday=0,weekend=0,cur=new Date(today);
  while(cur<end){cur.setDate(cur.getDate()+1);if(cur<=end){const dow=cur.getDay();if(dow===0||dow===6)weekend++;else weekday++;total++;}}
  return{total,weekday,weekend};
}
function updatePeriodUI(){
  const{startDate,endDate}=getActivePeriodResolved();
  const ps=`${fmtDateShort(startDate)} – ${fmtDateShort(endDate)}`;
  const sisa=getSisaHari(endDate);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('drawerPeriodVal',ps);set('drawerSub',`Sisa ${sisa.total} hari`);
  set('dashPeriodVal',ps);set('dashPeriodDays',`${sisa.total} hari lagi`);
  set('hk-period-text',ps);
  set('sisaTotal',sisa.total);set('sisaWeekday',sisa.weekday);set('sisaWeekend',sisa.weekend);
}

// ═══ LOGO ═══
function initLogo(){
  ['brandIco','drawerAvatar','settAvatar'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const img=document.createElement('img');
    img.src=LOGO_URL;img.alt='logo';
    img.onerror=()=>{el.innerHTML=IC.chart;el.style.fontSize='1.1rem';el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center'};
    el.innerHTML='';el.appendChild(img);
  });
}

// ═══ PARTICLES ═══
function initParticles(){
  const c=document.getElementById('particles');if(!c)return;
  for(let i=0;i<18;i++){const p=document.createElement('div');p.className='particle';p.style.cssText=`left:${Math.random()*100}%;width:${Math.random()*3+1}px;height:${Math.random()*3+1}px;animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s;opacity:${Math.random()*0.6+0.2}`;c.appendChild(p)}
}
function initOceanParticles(){
  const c=document.getElementById('oceanParticles');if(!c)return;
  for(let i=0;i<14;i++){const p=document.createElement('div');p.className='ocean-particle';p.style.cssText=`left:${Math.random()*100}%;width:${Math.random()*4+1}px;height:${Math.random()*4+1}px;animation-duration:${Math.random()*18+8}s;animation-delay:${Math.random()*12}s;opacity:${Math.random()*0.5+0.15}`;c.appendChild(p)}
}

// ═══ DRAWER ═══
function openDrawer(){document.getElementById('drawer').classList.add('open');document.getElementById('drawerOverlay').classList.add('open')}
function closeDrawer(){document.getElementById('drawer').classList.remove('open');document.getElementById('drawerOverlay').classList.remove('open')}

// ═══ INPUT MODAL ═══
function openInputModal(){
  document.getElementById('inTgl').value=getLocalDate();syncBulan('in');
  document.getElementById('inJenis').value='';
  document.getElementById('inKat').innerHTML='<option value="">— Pilih Jenis dulu —</option>';
  document.getElementById('inNom').value='';
  document.getElementById('inMetode').value='';
  fillBank('inBank','');
  document.getElementById('inKet').value='';
  renderQuickKat();
  document.getElementById('ovInput').classList.add('open');
}

// ═══ API ═══
async function apiPost(action,body){
  const res=await fetch(`${API_URL}/api/sheets?action=${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok){const e=await res.json();throw new Error(e.error||'Gagal simpan')}
  return await res.json();
}
async function apiPut(action,body){
  const res=await fetch(`${API_URL}/api/sheets?action=${action}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok){const e=await res.json();throw new Error(e.error||'Gagal update')}
  return await res.json();
}
async function sheetsAppend(values){return apiPost('append',{values})}
async function sheetsUpdate(id,values){return apiPut('update',{id,values})}

async function fetchAllData(){
  const res=await fetch(`${API_URL}/api/sheets?action=get`);
  if(!res.ok)throw new Error('Gagal ambil data: '+res.status);
  const json=await res.json();
  if(!json.success)throw new Error(json.error||'Gagal ambil data');
  return (json.data||[]).map(r=>({
    id:r.id,rowIndex:r.id,
    tanggal:r.tanggal||'',bulan:r.bulan||'',kategori:r.kategori||'',
    nominal:Number(r.nominal)||0,pembayaran:r.pembayaran||'',
    detail:r.detail||'',metode:r.metode||'',jenis:r.jenis||''
  })).filter(r=>r.tanggal);
}

async function fetchDBOptions(){
  try{
    if(!allRows.length)allRows=await fetchAllData();
    const banks=[],kategoris=[];
    allRows.forEach(r=>{
      if(r.metode&&!r.metode.includes('Cash'))banks.push(r.metode);
      if(r.kategori)kategoris.push(r.kategori);
    });
    const customKats=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
    const customBanks=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');
    dbOpts={
      banks:[...new Set([...banks,...customBanks])],
      kategoris:[...new Set([...kategoris,...customKats])].sort(),
      metodes:['Cash','Transfer','QRIS'],
      jenis:['Pemasukan','Pengeluaran']
    };
    fillBank('inBank','');fillBank('eBank','');
    // return agar .then() bisa dipanggil
    return dbOpts;
  }catch(e){console.error('fetchDBOptions:',e)}
}

// ═══ CLOCK ═══
function updateClock(){
  const n=new Date();
  const e1=document.getElementById('hdrTime'),e2=document.getElementById('hdrDate');
  if(e1)e1.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  if(e2)e2.textContent=`${HARI[n.getDay()]}, ${n.getDate()} ${MOS[n.getMonth()]} ${n.getFullYear()}`;
}
setInterval(updateClock,1000);

// ═══ NAV ═══
function goPage(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('.bnav-btn').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('.drawer-item').forEach(el=>el.classList.remove('active'));
  const pg=document.getElementById('pg-'+p);if(pg)pg.classList.add('on');
  const nb=document.getElementById('nb-'+p);if(nb)nb.classList.add('on');
  const di=document.getElementById('di-'+p);if(di)di.classList.add('active');
  window.scrollTo(0,0);
  // Tampilkan skeleton dulu sebelum load
  if(p==='data'){
    // Langsung tampilkan skeleton, baru load data
    const el=document.getElementById('dataList');
    if(el&&!allRows.length){
      el.innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div>';
    }
    loadData();
  }
  else if(p==='tabungan'&&document.getElementById('tabContent').style.display!=='none')loadTabungan();
  else if(p==='rekap')loadRekap();
  else if(p==='metode')loadMetode();
  else if(p==='kalender')renderKalender();
  else if(p==='notif')loadNotif();
  else if(p==='target-sett')loadTargetSett();
}
function doRefresh(){
  const p=document.querySelector('.page.on');if(!p)return;
  allRows=[];toast('Memuat ulang...');
  const id=p.id.replace('pg-','');
  if(id==='dashboard')loadDashboard();
  else if(id==='data')loadData();
  else if(id==='tabungan')loadTabungan();
  else if(id==='rekap')loadRekap();
  else if(id==='metode')loadMetode();
  else if(id==='notif')loadNotif();
}

// ═══ DASHBOARD ═══
async function loadDashboard(){
  const now=new Date();
  const b=MOS[now.getMonth()],t=String(now.getFullYear());
  const lbl=document.getElementById('dashPeriodLabel');
  if(lbl)lbl.textContent=`${b} ${t}`;
  document.getElementById('d-kas').textContent='...';
  document.getElementById('d-masuk').textContent='...';
  document.getElementById('d-keluar').textContent='...';
  document.getElementById('budgetList').innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div>';
  const _bmon=document.getElementById('budgetMonitor');if(_bmon)_bmon.style.display='none';
  const _bmonLbl=document.getElementById('bmonSecLbl');if(_bmonLbl)_bmonLbl.style.display='none';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    const{startDate,endDate}=getActivePeriodResolved();
    const sd=new Date(startDate);sd.setHours(0,0,0,0);
    const ed=new Date(endDate);ed.setHours(23,59,59,999);
    const rows=allRows.filter(r=>{const d=new Date(r.tanggal);return d>=sd&&d<=ed});
    const masuk=rows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
    const keluar=rows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
    const kas=masuk-keluar;
    const days=[...new Set(rows.map(r=>r.tanggal))].length;
    const tdim=new Date(parseInt(t),MOS.indexOf(b)+1,0).getDate();
    const FIXED_CATS=JSON.parse(localStorage.getItem('mm_fixed_cats')||'["Tabungan","Kos","Tf Rumah","Listrik Rumah","Internet","Listrik"]');
    const fleks=rows.filter(r=>r.jenis==='Pengeluaran'&&!FIXED_CATS.some(fc=>r.kategori.toLowerCase().includes(fc.toLowerCase())));
    const totalFleks=fleks.reduce((s,r)=>s+r.nominal,0);
    const totalDaysPeriode=Math.round((ed-sd)/(1000*60*60*24));
    const avgHarian=totalDaysPeriode>0?Math.round(totalFleks/totalDaysPeriode):0;
    const byKat=groupBy(rows.filter(r=>r.jenis==='Pengeluaran'),'kategori');
    const byKatArr=Object.entries(byKat).map(([k,v])=>({kategori:k,nominal:v.reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nominal-a.nominal);
    const byKatFleks=groupBy(fleks,'kategori');
    const byKatFleksArr=Object.entries(byKatFleks).map(([k,v])=>({kategori:k,nominal:v.reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nominal-a.nominal);
    document.getElementById('hk-periode-lbl').textContent=`${b} ${t}`;
    countUp('d-kas',Math.abs(kas),kas<0?'−':'');
    document.getElementById('d-masuk').textContent=rpShort(masuk);
    document.getElementById('d-keluar').textContent=rpShort(keluar);
    document.getElementById('d-avg').textContent=rpShort(avgHarian);
    document.getElementById('d-active-days').textContent=`${days} hari`;
    document.getElementById('d-total-days-val').textContent=`${tdim} hari`;
    avgDetailData={totalFleksibel:totalFleks,totalDays:totalDaysPeriode,avgHarian,byKategori:byKatFleksArr};
    // Hide komposisi jika ada budget sebelum render
    const _budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
    const _hasBudget=Object.values(_budgets).some(v=>Number(v)>0);
    const _kompSec=document.getElementById('kompSection');
    if(_kompSec)_kompSec.style.display=_hasBudget?'none':'';
    renderChartKat(byKatArr);renderBudget(byKatArr);renderChartHarian(rows);
    updatePeriodUI();
    if(notifEnabled)checkBudgetAlerts(byKatArr);
  }catch(e){toast('Gagal load: '+e.message,'err');console.error(e)}
}

function renderChartKat(byCat){
  const wrap=document.getElementById('chartKat')?.parentElement;if(!wrap)return;
  if(chartKat){try{chartKat.destroy()}catch(e){}chartKat=null;}
  if(!byCat.length){wrap.innerHTML=`<div class="empty"><div class="ei">${IC.chart}</div><p>Belum ada pengeluaran</p></div>`;return}
  wrap.innerHTML='<canvas id="chartKat"></canvas>';
  const ctx=document.getElementById('chartKat').getContext('2d');
  const total=byCat.reduce((s,k)=>s+k.nominal,0);
  const isOcean=document.documentElement.getAttribute('data-theme')==='ocean';
  const bdrCol=isOcean?'rgba(10,74,140,0.6)':'rgba(15,12,41,0.6)';
  // Warna legend kontras: lebih terang di cosmic, biru muda di ocean
  const legendColor=isOcean?'#B8DEFF':'#E2D9FF';
  const plugin={id:'rdg',afterDraw(chart){
    const{ctx:c,chartArea:ca}=chart;if(!ca)return;
    const cx=(ca.left+ca.right)/2,cy=(ca.top+ca.bottom)/2;
    c.save();c.textAlign='center';c.textBaseline='middle';
    c.fillStyle=isOcean?'rgba(184,222,255,0.6)':'rgba(226,217,255,0.6)';c.font=`500 11px 'DM Sans',sans-serif`;c.fillText('Total',cx,cy-14);
    c.fillStyle='rgba(255,255,255,0.95)';c.font=`bold 20px 'Playfair Display',serif`;c.fillText((total/1e6).toFixed(1)+'jt',cx,cy+10);
    c.restore();
  }};
  chartKat=new Chart(ctx,{
    type:'doughnut',plugins:[plugin],
    data:{labels:byCat.map(k=>k.kategori),datasets:[{
      data:byCat.map(k=>k.nominal),
      backgroundColor:CHART_COLORS.slice(0,byCat.length),
      borderWidth:1.5,
      borderColor:bdrCol,
      hoverOffset:6,
      spacing:2
    }]},
    options:{
      responsive:true,
      cutout:'52%',
      animation:{animateRotate:true,duration:1000,easing:'easeOutQuart'},
      plugins:{
        legend:{display:false},
                tooltip:{callbacks:{label:c=>` ${c.label}: ${rp(c.raw)} (${Math.round(c.raw/total*100)}%)`}}
      }
    }
  });
  // Custom HTML legend — 3 kolom rata kiri
  const legEl=document.getElementById('chartLegend');
  if(legEl){
    const isOc=document.documentElement.getAttribute('data-theme')==='ocean';
    const lgColor=isOc?'#B8DEFF':'#E2D9FF';
    legEl.innerHTML=byCat.map((k,i)=>{
      const pct=Math.round(k.nominal/total*100);
      const lbl=k.kategori.length>12?k.kategori.slice(0,11)+'…':k.kategori;
      const col=CHART_COLORS[i%CHART_COLORS.length];
      return`<div class="cl-item"><div class="cl-dot" style="background:${col}"></div><span class="cl-txt" style="color:${lgColor}">${lbl} ${pct}%</span></div>`;
    }).join('');
  }

}

function renderChartHarian(rows){
  const wrap=document.getElementById('chartHarian')?.parentElement;if(!wrap)return;
  if(chartHarian){try{chartHarian.destroy()}catch(e){}chartHarian=null;}
  const byDay={};
  rows.filter(r=>r.jenis==='Pengeluaran').forEach(r=>{
    byDay[r.tanggal]=(byDay[r.tanggal]||0)+r.nominal;
  });
  const sorted=Object.keys(byDay).sort();
  if(!sorted.length){wrap.innerHTML=`<div class="empty"><div class="ei">${IC.chart}</div><p>Belum ada data harian</p></div>`;return}
  wrap.innerHTML='<canvas id="chartHarian"></canvas>';
  const ctx=document.getElementById('chartHarian').getContext('2d');
  const tc='rgba(255,255,255,0.45)';
  const labels=sorted.map(d=>{const p=d.split('-');return`${p[2]}/${p[1]}`});
  const values=sorted.map(d=>byDay[d]);
  const maxVal=Math.max(...values);
  const gradient=ctx.createLinearGradient(0,0,0,230);
  gradient.addColorStop(0,'rgba(99,234,210,0.35)');
  gradient.addColorStop(0.5,'rgba(168,85,247,0.2)');
  gradient.addColorStop(1,'rgba(168,85,247,0.0)');
  const lineGrad=ctx.createLinearGradient(0,0,ctx.canvas.width||400,0);
  lineGrad.addColorStop(0,'#63EAD2');
  lineGrad.addColorStop(0.5,'#a855f7');
  lineGrad.addColorStop(1,'#f472b6');
  const pointColors=values.map(v=>v===maxVal?'#f87171':'rgba(255,255,255,0.2)');
  const pointSizes=values.map(v=>v===maxVal?5:2);
  chartHarian=new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[{label:'Pengeluaran',data:values,fill:true,backgroundColor:gradient,borderColor:lineGrad,borderWidth:1.5,pointBackgroundColor:pointColors,pointBorderColor:pointColors,pointRadius:pointSizes,pointHoverRadius:6,pointHoverBackgroundColor:'#f472b6',tension:0.45}]},
    options:{
      responsive:true,
      animation:{duration:1000,easing:'easeInOutQuart'},
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>` ${rp(c.raw)}`,title:t=>t[0].label},backgroundColor:'rgba(15,12,41,0.85)',titleColor:'rgba(255,255,255,0.6)',bodyColor:'#f472b6',borderColor:'rgba(168,85,247,0.4)',borderWidth:1,padding:10,cornerRadius:8}
      },
      scales:{
        y:{ticks:{callback:v=>rpShort(v),color:tc,font:{size:9}},grid:{color:'rgba(255,255,255,0.04)'},border:{display:false}},
        x:{ticks:{color:tc,font:{size:9},maxRotation:45},grid:{display:false},border:{display:false}}
      }
    }
  });
}

function renderBudget(byCat){
  const el=document.getElementById('budgetList');
  // Sembunyikan komposisi jika sudah ada budget
  const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
  const hasBudget=Object.values(budgets).some(v=>Number(v)>0);
  const kompSec=document.getElementById('kompSection');
  if(kompSec)kompSec.style.display=hasBudget?'none':'';
  if(!byCat.length){el.innerHTML=`<div class="empty"><div class="ei">${IC.ok}</div><p>Belum ada pengeluaran</p></div>`;renderBudgetMonitor([]);return}
  const total=byCat.reduce((s,k)=>s+k.nominal,0);
  // Toggle Semua/Ringkas
  const btn=document.getElementById('btnToggleView');
  if(btn){btn.classList.toggle('on',komposisiRingkas);btn.innerHTML=komposisiRingkas?'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> Semua':'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/></svg> Ringkas';}
  let tampil=byCat;
  if(komposisiRingkas&&byCat.length>5){
    const top5=byCat.slice(0,5);
    const lainNom=byCat.slice(5).reduce((s,k)=>s+k.nominal,0);
    tampil=[...top5,{kategori:'Lainnya',nominal:lainNom}];
  }
  el.innerHTML=tampil.map((k,i)=>{
    const pct=total>0?Math.round(k.nominal/total*100):0;
    const cls=pct>=30?'bud-over':pct>=15?'bud-warn':'bud-ok';
    return`<div class="bud-item" style="animation-delay:${i*0.05}s"><div class="bud-top"><span class="bud-name">${k.kategori}</span><span class="bud-pct">${pct}%</span></div><div class="bud-bar"><div class="bud-fill ${cls}" style="width:0%" data-w="${pct}"></div></div><div class="bud-amts"><span>${rpShort(k.nominal)}</span><span>dari ${rpShort(total)}</span></div></div>`;
  }).join('');
  setTimeout(()=>{el.querySelectorAll('.bud-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
  renderBudgetMonitor(byCat);
}

function toggleKomposisiView(){
  komposisiRingkas=!komposisiRingkas;
  // Re-render dengan data terakhir
  const byKat=groupBy(allRows.filter(r=>{
    const{startDate,endDate}=getActivePeriodResolved();
    const sd=new Date(startDate);sd.setHours(0,0,0,0);
    const ed=new Date(endDate);ed.setHours(23,59,59,999);
    const d=new Date(r.tanggal);
    return d>=sd&&d<=ed&&r.jenis==='Pengeluaran';
  }),'kategori');
  const byKatArr=Object.entries(byKat).map(([k,v])=>({kategori:k,nominal:v.reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nominal-a.nominal);
  renderBudget(byKatArr);
}

let bmonRingkas=true;
function toggleBmonView(){
  bmonRingkas=!bmonRingkas;
  const byKat=groupBy(allRows.filter(r=>{
    const{startDate,endDate}=getActivePeriodResolved();
    const sd=new Date(startDate);sd.setHours(0,0,0,0);
    const ed=new Date(endDate);ed.setHours(23,59,59,999);
    const d=new Date(r.tanggal);
    return d>=sd&&d<=ed&&r.jenis==='Pengeluaran';
  }),'kategori');
  const byKatArr=Object.entries(byKat).map(([k,v])=>({kategori:k,nominal:v.reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nominal-a.nominal);
  renderBudgetMonitor(byKatArr);
}
function renderBudgetMonitor(byCat){
  const el=document.getElementById('budgetMonitor');
  const secLbl=document.getElementById('bmonSecLbl');
  if(!el||!secLbl)return;
  const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
  const allItems=byCat.filter(k=>budgets[k.kategori]>0).map(k=>{
    const budget=budgets[k.kategori];
    const pct=Math.min(Math.round(k.nominal/budget*100),999);
    const cls=pct>100?'bmon-over':pct>=alertPct?'bmon-warn':'bmon-ok';
    const barW=Math.min(pct,100);
    const over=pct>100;
    return{k,budget,pct,cls,barW,over};
  });
  if(!allItems.length){el.style.display='none';secLbl.style.display='none';return}
  const bmonBtn=document.getElementById('btnBmonToggle');
  if(bmonBtn){bmonBtn.classList.toggle('on',bmonRingkas);bmonBtn.innerHTML=bmonRingkas?'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg> Semua':'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/></svg> Ringkas';}
  let items=bmonRingkas&&allItems.length>5?allItems.slice(0,5):allItems;
  secLbl.style.display='';el.style.display='flex';
  el.innerHTML=items.map(({k,budget,pct,cls,barW,over},i)=>`
    <div class="bmon-item" style="animation-delay:${i*0.05}s">
      <div class="bmon-top">
        <span class="bmon-name">${k.kategori}</span>
        <span class="bmon-pct" style="color:${pct>100?'var(--red)':pct===100?'var(--grn)':pct>=alertPct?'#fbbf24':'var(--grn)'}">${pct}%${pct>100?' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>':pct===100?' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg>':pct>=alertPct?' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>':' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>'}</span>
      </div>
      <div class="bmon-bar"><div class="bmon-fill ${cls}" style="width:0%" data-w="${barW}"></div></div>
      <div class="bmon-amts">
        <span class="${over?'over':''}">${rpShort(k.nominal)} terpakai</span>
        <span>dari ${rpShort(budget)}</span>
      </div>
    </div>`).join('');
  if(bmonRingkas&&allItems.length>5)el.innerHTML+=`<div style="text-align:center;font-size:0.72rem;color:var(--tx3);padding:6px 0">+${allItems.length-5} kategori lainnya</div>`;
  setTimeout(()=>{el.querySelectorAll('.bmon-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
}

// ═══ DATA ═══
async function loadData(){
  const el=document.getElementById('dataList');
  try{
    // Selalu tampilkan skeleton dulu (animasi konsisten dengan menu lain)
    el.innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div>';
    if(!allRows.length)allRows=await fetchAllData();
    await new Promise(r=>setTimeout(r,120));
    renderCards(allRows);
    syncFilterBulan();
  }catch(e){
    el.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Gagal memuat data</p></div>`;
    toast('Gagal load data: '+e.message,'err');console.error(e);
  }
}

// Sinkronkan dropdown bulan dengan periode aktif
function syncFilterBulan(){
  const sel=document.getElementById('fBulan');if(!sel)return;
  const{startDate,endDate}=getActivePeriodResolved();
  const sd=new Date(startDate);sd.setHours(0,0,0,0);
  const ed=new Date(endDate);ed.setHours(23,59,59,999);
  // Kumpulkan bulan yang ada dalam rentang periode
  const bulanDalamPeriode=new Set();
  allRows.forEach(r=>{
    const d=new Date(r.tanggal);
    if(d>=sd&&d<=ed&&r.bulan)bulanDalamPeriode.add(r.bulan);
  });
  // Rebuild options: "Semua" + bulan dalam periode (urut MOS) + bulan lain
  const bulanPeriodeUrut=MOS.filter(m=>bulanDalamPeriode.has(m));
  const bulanLain=[...new Set(allRows.map(r=>r.bulan).filter(b=>b&&!bulanDalamPeriode.has(b)))];
  const curVal=sel.value;
  sel.innerHTML='<option value="">Semua Bulan</option>';
  if(bulanPeriodeUrut.length){
    const grp=document.createElement('optgroup');grp.label='— Periode Aktif —';
    bulanPeriodeUrut.forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent=b;grp.appendChild(o)});
    sel.appendChild(grp);
  }
  if(bulanLain.length){
    const grp2=document.createElement('optgroup');grp2.label='— Lainnya —';
    bulanLain.forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent=b;grp2.appendChild(o)});
    sel.appendChild(grp2);
  }
  // Restore nilai sebelumnya jika masih ada
  if(curVal)sel.value=curVal;
}

function renderCards(rows){
  const el=document.getElementById('dataList');
  if(!rows.length){el.innerHTML=`<div class="empty"><div class="ei">${IC.chart}</div><p>Belum ada data</p></div>`;return}
  const sorted=[...rows].sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  const totM=rows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
  const totK=rows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
  const kas=totM-totK;
  const strip=`<div class="data-summary"><div class="ds-item"><div class="ds-lbl">Masuk</div><div class="ds-val g">${rpShort(totM)}</div></div><div class="ds-sep"></div><div class="ds-item"><div class="ds-lbl">Keluar</div><div class="ds-val r">${rpShort(totK)}</div></div><div class="ds-sep"></div><div class="ds-item"><div class="ds-lbl">Kas</div><div class="ds-val ${kas>=0?'g':'r'}">${kas<0?'−':'+'}${rpShort(Math.abs(kas))}</div></div></div>`;
  const grouped={};sorted.forEach(r=>{if(!grouped[r.tanggal])grouped[r.tanggal]=[];grouped[r.tanggal].push(r)});
  const html=Object.entries(grouped).map(([tgl,txs],gi)=>{
    const dk=txs.reduce((s,r)=>r.jenis==='Pemasukan'?s+r.nominal:s-r.nominal,0);
    const cards=txs.map((r,ri)=>{
      const isIn=r.jenis==='Pemasukan',cls=isIn?'inc':'spd',arr=isIn?'↓':'↑';
      const eb=editMode?`<button class="edit-btn" onclick="openEdit(${r.rowIndex})">${IC.edit} Edit</button>`:'';
      return`<div class="dc ${cls}" style="animation-delay:${(gi*0.05)+(ri*0.03)}s"><div class="dc-row1"><div><div class="dc-kat">${r.kategori}</div></div><div><div class="dc-nom ${cls}">${arr} ${rp(r.nominal)}</div><div class="dc-badge ${cls}">${isIn?IC.in:IC.out} ${r.jenis}</div></div></div><div class="dc-tags">${r.pembayaran?`<span class="dtag"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg> ${r.pembayaran}</span>`:''} ${r.metode?`<span class="dtag"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg> ${r.metode}</span>`:''} ${r.bulan?`<span class="dtag"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg> ${r.bulan}</span>`:''} ${eb}</div>${r.detail?`<div class="dc-ket"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg> ${r.detail}</div>`:''}</div>`;
    }).join('');
    return`<div class="date-group"><div class="dg-header"><div class="dg-dot"></div><span class="dg-date">${IC.cal} ${formatTgl(tgl)}</span><span class="dg-kas ${dk>=0?'g':'r'}">${dk>=0?'+':'−'}${rp(Math.abs(dk))}</span></div><div class="dg-cards">${cards}</div></div>`;
  }).join('');
  el.innerHTML=strip+html;
}

function filterData(){
  const s=document.getElementById('srch').value.toLowerCase(),b=document.getElementById('fBulan').value,j=document.getElementById('fJenis').value;
  renderCards(allRows.filter(r=>(!s||[r.kategori,r.detail,r.metode,r.pembayaran,r.bulan].join(' ').toLowerCase().includes(s))&&(!b||r.bulan===b)&&(!j||r.jenis===j)));
}

// ═══ TABUNGAN ═══
function showTab(){document.getElementById('tabLock').style.display='none';document.getElementById('tabContent').style.display='block';loadTabungan()}
function hideTab(){document.getElementById('tabContent').style.display='none';document.getElementById('tabLock').style.display='block'}

async function loadTabungan(){
  document.getElementById('tabList').innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    const tbm={};
    allRows.forEach(r=>{
      if(r.jenis==='Pengeluaran'&&r.kategori&&r.kategori.toLowerCase().includes('tabungan'))
        tbm[r.bulan]=(tbm[r.bulan]||0)+r.nominal;
    });
    let targetTotal=18000000,blt={};
    try{
      const savedTargets=JSON.parse(localStorage.getItem('mm_targets')||'{}');
      if(Object.keys(savedTargets).length>0){blt=savedTargets;targetTotal=Object.values(blt).reduce((s,v)=>s+v,0);}
    }catch(e){console.warn('Gagal baca target:',e)}
    const tt=Object.values(tbm).reduce((s,v)=>s+v,0);
    const pct=targetTotal>0?Math.min(Math.round(tt/targetTotal*100),100):0;
    document.getElementById('tabTotal').textContent=rp(targetTotal);
    const sub=document.getElementById('tabSub');if(sub)sub.textContent=`Terkumpul: ${rp(tt)} · ${pct}% tercapai`;
    const fill=document.getElementById('tabBarFill');if(fill)setTimeout(()=>fill.style.width=pct+'%',100);
    const bd=MOS.map(b=>({bulan:b,tabungan:tbm[b]||0,target:blt[b]||2000000})).filter(b=>b.tabungan>0||b.target>0);
    renderTabList(bd);renderChartTab(bd);
  }catch(e){toast('Gagal load tabungan: '+e.message,'err');console.error(e)}
}

function renderTabList(data){
  const el=document.getElementById('tabList');
  if(!data.length){el.innerHTML=`<div class="empty"><div class="ei">${IC.bank}</div><p>Belum ada data tabungan</p></div>`;return}
  el.innerHTML=data.map((b,i)=>{
    const pct=b.target>0?Math.min(Math.round(b.tabungan/b.target*100),100):0;
    const done=b.target>0&&b.tabungan>=b.target;
    const color=MONTH_COLORS[MOS.indexOf(b.bulan)%MONTH_COLORS.length];
    return`<div class="tab-item" style="animation-delay:${i*0.05}s"><div class="tab-row"><span class="tab-mo">${done?IC.ok:'○'} ${b.bulan}</span><span class="tab-pc" style="color:${color}">${pct}%</span></div><div class="tab-bar"><div class="tab-bar-fill" style="width:0%;background:${color}" data-w="${pct}"></div></div><div class="tab-amts"><div class="tab-amt-item"><div class="tab-amt-lbl">Tabungan</div><div class="tab-amt-val">${rpShort(b.tabungan)}</div></div><div class="tab-amt-item"><div class="tab-amt-lbl">Target</div><div class="tab-amt-val">${rpShort(b.target)}</div></div></div></div>`;
  }).join('');
  setTimeout(()=>{el.querySelectorAll('.tab-bar-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
}

function renderChartTab(data){
  const ctx=document.getElementById('chartTab')?.getContext('2d');if(!ctx)return;
  if(chartTab)chartTab.destroy();if(!data.length)return;
  const tc='rgba(255,255,255,0.5)';
  chartTab=new Chart(ctx,{type:'bar',data:{labels:data.map(b=>b.bulan.slice(0,3)),datasets:[{label:'Tabungan',data:data.map(b=>b.tabungan),backgroundColor:'rgba(52,211,153,0.6)',borderColor:'#34d399',borderWidth:2,borderRadius:6},{label:'Target',data:data.map(b=>b.target),type:'line',borderColor:'#a855f7',pointRadius:4,fill:false,tension:0.3,borderDash:[5,4]}]},options:{responsive:true,animation:{duration:800,easing:'easeOutQuart'},plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10},color:tc}}},scales:{y:{ticks:{callback:v=>'Rp '+(v/1e6).toFixed(1)+'jt',color:tc,font:{size:10}},grid:{color:'rgba(255,255,255,0.06)'},border:{display:false}},x:{ticks:{color:tc,font:{size:10}},grid:{display:false},border:{display:false}}}}});
}

// ═══ TARGET SETTING ═══
function hitungTarget(){
  const total=Number(document.getElementById('tgtTotal').value)||0;
  const from=document.getElementById('tgtFrom').value;
  const to=document.getElementById('tgtTo').value;
  const fi=MOS.indexOf(from),ti=MOS.indexOf(to);
  const res=document.getElementById('tgtResult'),grid=document.getElementById('tgtMoGrid');
  const btn=document.getElementById('btnSaveTgt');
  if(!total||fi<0||ti<0||ti<fi){res.style.display='none';btn.style.display='none';return}
  const count=ti-fi+1;
  const perBulan=Math.round(total/count);
  document.getElementById('tgtPerBulan').textContent=rp(perBulan);
  grid.innerHTML=MOS.slice(fi,ti+1).map(mo=>`<div class="tgt-mo-item"><div class="tgt-mo-name">${mo.slice(0,3)}</div><div class="tgt-mo-val">${rpShort(perBulan)}</div></div>`).join('');
  res.style.display='block';btn.style.display='block';
}

async function saveTarget(){
  const total=Number(document.getElementById('tgtTotal').value)||0;
  const from=document.getElementById('tgtFrom').value;
  const to=document.getElementById('tgtTo').value;
  const fi=MOS.indexOf(from),ti=MOS.indexOf(to);
  if(!total||fi<0||ti<0||ti<fi){toast('Lengkapi form dulu','err');return}
  const count=ti-fi+1;
  const perBulan=Math.round(total/count);
  const btn=document.getElementById('btnSaveTgt');
  btn.disabled=true;btn.textContent='Menyimpan...';
  try{
    const existing=JSON.parse(localStorage.getItem('mm_targets')||'{}');
    for(let i=fi;i<=ti;i++){existing[MOS[i]]=perBulan;}
    localStorage.setItem('mm_targets',JSON.stringify(existing));
    toast('Target tersimpan!','ok');
    loadTargetSett();
  }catch(e){toast('Gagal simpan: '+e.message,'err')}
  finally{btn.disabled=false;btn.innerHTML=IC.save+'Simpan Target'}
}

async function loadTargetSett(){
  const el=document.getElementById('tgtCurList');
  try{
    const targets=JSON.parse(localStorage.getItem('mm_targets')||'{}');
    const items=MOS.map(mo=>({bulan:mo,target:targets[mo]||0})).filter(m=>m.target>0);
    if(!items.length){el.innerHTML=`<div class="empty"><div class="ei">${IC.target}</div><p>Belum ada target tersimpan</p></div>`;return}
    el.innerHTML=items.map((m,i)=>`<div class="tab-item" style="animation-delay:${i*0.05}s"><div class="tab-row"><span class="tab-mo">${IC.target} ${m.bulan}</span><span class="tab-pc" style="color:var(--grn)">${rpShort(m.target)}</span></div></div>`).join('');
  }catch(e){el.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Gagal baca target</p></div>`}
}

// ═══ REKAP ═══
async function loadRekap(){
  const t=document.getElementById('rekapTahun').value;
  document.getElementById('rekapList').innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div>';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    const rows=allRows.filter(r=>r.tanggal.startsWith(t));
    const tm=rows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
    const tk=rows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
    const kas=tm-tk;
    document.getElementById('rekap-masuk').textContent=rp(tm);
    document.getElementById('rekap-keluar').textContent=rp(tk);
    const ke=document.getElementById('rekap-kas');ke.textContent=(kas<0?'−':'+')+rp(Math.abs(kas));ke.style.color=kas>=0?'#34d399':'#f87171';
    const bm=MOS.map(bln=>{
      const mr=rows.filter(r=>r.bulan===bln);
      const m=mr.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
      const k=mr.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
      return{bulan:bln,masuk:m,keluar:k,kas:m-k};
    }).filter(m=>m.masuk>0||m.keluar>0);
    document.getElementById('rekapList').innerHTML=bm.map((m,i)=>`<div class="month-item" style="animation-delay:${i*0.05}s"><div class="month-item-top"><span class="month-name">${m.bulan} ${t}</span><span class="month-kas" style="color:${m.kas>=0?'#34d399':'#f87171'}">${m.kas>=0?'+':'−'}${rpShort(Math.abs(m.kas))}</span></div><div class="month-row"><div class="month-col"><div class="month-col-lbl">Pemasukan</div><div class="month-col-val" style="color:#34d399">${rpShort(m.masuk)}</div></div><div class="month-col"><div class="month-col-lbl">Pengeluaran</div><div class="month-col-val" style="color:#f87171">${rpShort(m.keluar)}</div></div></div></div>`).join('');
    const ctx=document.getElementById('chartRekap')?.getContext('2d');if(!ctx)return;
    if(chartRekap)chartRekap.destroy();const tc='rgba(255,255,255,0.5)';
    chartRekap=new Chart(ctx,{type:'bar',data:{labels:bm.map(m=>m.bulan.slice(0,3)),datasets:[{label:'Pemasukan',data:bm.map(m=>m.masuk),backgroundColor:'rgba(52,211,153,0.5)',borderColor:'#34d399',borderWidth:2,borderRadius:6},{label:'Pengeluaran',data:bm.map(m=>m.keluar),backgroundColor:'rgba(248,113,113,0.5)',borderColor:'#f87171',borderWidth:2,borderRadius:6}]},options:{responsive:true,animation:{duration:800},plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10},color:tc}}},scales:{y:{ticks:{callback:v=>'Rp '+(v/1e6).toFixed(1)+'jt',color:tc,font:{size:10}},grid:{color:'rgba(255,255,255,0.06)'},border:{display:false}},x:{ticks:{color:tc,font:{size:10}},grid:{display:false},border:{display:false}}}}});
  }catch(e){toast('Gagal load rekap','err')}
}

// ═══ METODE ═══
async function loadMetode(){
  document.getElementById('bankList').innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div>';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    const bln=document.getElementById('metodeBulan').value;
    const rows=allRows.filter(r=>r.jenis==='Pengeluaran'&&(!bln||r.bulan===bln));
    const bm={Cash:0,Transfer:0,QRIS:0},bb={};
    rows.forEach(r=>{bm[r.pembayaran]=(bm[r.pembayaran]||0)+r.nominal;const bank=r.metode||r.pembayaran;bb[bank]=(bb[bank]||0)+r.nominal});
    const total=rows.reduce((s,r)=>s+r.nominal,0);
    document.getElementById('m-cash').textContent=rpShort(bm.Cash||0);
    document.getElementById('m-transfer').textContent=rpShort(bm.Transfer||0);
    document.getElementById('m-qris').textContent=rpShort(bm.QRIS||0);
    const ctx=document.getElementById('chartMetode')?.getContext('2d');if(ctx){
      if(chartMetode){try{chartMetode.destroy()}catch(e){}chartMetode=null;}
      const isOcean=document.documentElement.getAttribute('data-theme')==='ocean';
      const bdrCol=isOcean?'rgba(10,74,140,0.4)':'rgba(6,78,59,0.4)';
      const lblColor='rgba(255,255,255,0.92)';
      const lbls=Object.keys(bm).filter(k=>bm[k]>0),dm=lbls.map(k=>bm[k]);
      if(dm.length)chartMetode=new Chart(ctx,{type:'doughnut',data:{labels:lbls,datasets:[{data:dm,backgroundColor:['rgba(52,211,153,0.75)','rgba(96,165,250,0.75)','rgba(168,85,247,0.75)'],borderWidth:1.5,borderRadius:6,spacing:3,borderColor:bdrCol}]},options:{responsive:true,cutout:'60%',animation:{animateRotate:true,duration:800},plugins:{legend:{position:'bottom',labels:{boxWidth:8,boxHeight:8,font:{size:10.5},color:lblColor,padding:8}},tooltip:{callbacks:{label:c=>` ${c.label}: ${rp(c.raw)}`}}}}});
    }
    const ba=Object.entries(bb).sort((a,b)=>b[1]-a[1]);
    document.getElementById('bankList').innerHTML=ba.map(([bank,val],i)=>{
      const pct=total>0?Math.round(val/total*100):0;
      const ico=IC.bank;
      return`<div class="bank-item" style="animation-delay:${i*0.05}s"><div class="bank-ico">${ico}</div><div class="bank-info"><div class="bank-name">${bank}</div><div class="bank-sub">${pct}% dari total</div><div class="bank-bar-wrap"><div class="bank-bar-fill" style="width:0%" data-w="${pct}"></div></div></div><div class="bank-val">${rpShort(val)}</div></div>`;
    }).join('');
    setTimeout(()=>{document.querySelectorAll('.bank-bar-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
  }catch(e){toast('Gagal load metode','err')}
}

// ═══ KALENDER ═══
function renderKalender(){
  const tl=document.getElementById('kalTitle');if(!tl)return;
  tl.textContent=`${MOS[kalMonth]} ${kalYear}`;
  const firstDay=new Date(kalYear,kalMonth,1).getDay();
  const dim=new Date(kalYear,kalMonth+1,0).getDate();
  const today=new Date();
  const{startDate,endDate}=getActivePeriodResolved();
  const mr=allRows.filter(r=>{const d=new Date(r.tanggal);return d.getFullYear()===kalYear&&d.getMonth()===kalMonth&&r.jenis==='Pengeluaran'});
  const bd={};mr.forEach(r=>{const day=new Date(r.tanggal).getDate();bd[day]=(bd[day]||0)+r.nominal});
  const grid=document.getElementById('kalGrid');if(!grid)return;
  const dh=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  let html=dh.map(d=>`<div class="kal-day-hdr">${d}</div>`).join('');
  for(let i=0;i<firstDay;i++)html+=`<div class="kal-day empty"></div>`;
  for(let d=1;d<=dim;d++){
    const isToday=d===today.getDate()&&kalMonth===today.getMonth()&&kalYear===today.getFullYear();
    const hasData=bd[d]>0;
    const cd=new Date(kalYear,kalMonth,d);cd.setHours(0,0,0,0);
    const sd=new Date(startDate);sd.setHours(0,0,0,0);
    const ed=new Date(endDate);ed.setHours(0,0,0,0);
    const isPMark=cd.getTime()===sd.getTime()||cd.getTime()===ed.getTime();
    const cls=isToday?'today':isPMark?'period-mark':hasData?'has-data':'';
    html+=`<div class="kal-day ${cls}" onclick="showKalDetail(${d})">${d}</div>`;
  }
  const totalCells=firstDay+dim;
  const remainder=totalCells%7;
  if(remainder>0){for(let i=0;i<7-remainder;i++)html+=`<div class="kal-day empty"></div>`;}
  grid.innerHTML=html;
  updatePeriodUI();
  const ctx=document.getElementById('chartKal')?.getContext('2d');if(!ctx)return;
  if(chartKal)chartKal.destroy();
  const labels=Array.from({length:dim},(_,i)=>i+1),data=labels.map(d=>bd[d]||0);
  const tc='rgba(255,255,255,0.5)';
  chartKal=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Pengeluaran',data,backgroundColor:data.map(v=>v>0?'rgba(168,85,247,0.6)':'rgba(255,255,255,0.05)'),borderColor:data.map(v=>v>0?'#a855f7':'transparent'),borderWidth:1,borderRadius:4}]},options:{responsive:true,animation:{duration:600},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${rp(c.raw)}`}}},scales:{y:{ticks:{callback:v=>rpShort(v),color:tc,font:{size:9}},grid:{color:'rgba(255,255,255,0.05)'},border:{display:false}},x:{ticks:{color:tc,font:{size:8}},grid:{display:false},border:{display:false}}}}});
}

function showKalDetail(day){
  const tgl=`${kalYear}-${pad(kalMonth+1)}-${pad(day)}`;
  const txs=allRows.filter(r=>r.tanggal===tgl);
  const det=document.getElementById('kalDetail');if(!det)return;
  if(!txs.length){det.style.display='none';return}
  det.style.display='block';
  document.getElementById('kalDetailDate').innerHTML=`${IC.cal} ${formatTgl(tgl)}`;
  document.getElementById('kalTxList').innerHTML=txs.map(r=>`<div class="kal-tx"><span class="kal-tx-kat">${r.kategori}</span><span class="kal-tx-nom" style="color:${r.jenis==='Pemasukan'?'#34d399':'#f87171'}">${r.jenis==='Pemasukan'?'+':'−'}${rp(r.nominal)}</span></div>`).join('');
}
function kalPrev(){kalMonth--;if(kalMonth<0){kalMonth=11;kalYear--}renderKalender()}
function kalNext(){kalMonth++;if(kalMonth>11){kalMonth=0;kalYear++}renderKalender()}

// ═══ NOTIF ═══
let notifications=[];
async function loadNotif(){
  document.getElementById('notifList').innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    notifications=[];
    const now=new Date(),b=MOS[now.getMonth()],t=String(now.getFullYear());
    const rows=allRows.filter(r=>r.bulan===b&&r.tanggal.startsWith(t)&&r.jenis==='Pengeluaran');
    const bk=groupBy(rows,'kategori');
    const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
    Object.entries(bk).forEach(([kat,txs])=>{
      const total=txs.reduce((s,r)=>s+r.nominal,0),budget=budgets[kat]||0;
      if(budget>0){
        const pct=Math.round(total/budget*100);
        if(pct>100)notifications.push({type:'warn',ico:'warn',title:`Budget ${kat} Jebol!`,msg:`Realisasi ${rp(total)} (${pct}%) dari budget ${rp(budget)}`,time:'Bulan ini'});
        else if(pct===100)notifications.push({type:'ok',ico:'target',title:`${kat} Sesuai Anggaran`,msg:`Terpakai ${rp(total)} — tepat 100% dari budget`,time:'Bulan ini'});
        else if(pct>=alertPct)notifications.push({type:'warn',ico:'warn',title:`Peringatan: ${kat}`,msg:`Sudah ${pct}% dari budget. Sisa ${rp(budget-total)}`,time:'Bulan ini'});
        else notifications.push({type:'ok',ico:'ok',title:`${kat} Aman`,msg:`${pct}% dari budget. Sisa ${rp(budget-total)}`,time:'Bulan ini'});
      }
    });
    const tk=rows.reduce((s,r)=>s+r.nominal,0),days=[...new Set(rows.map(r=>r.tanggal))].length;
    if(days>0)notifications.unshift({type:'info',ico:'chart',title:`Rata-rata Harian ${b}`,msg:`${rp(Math.round(tk/days))}/hari dari ${days} hari aktif`,time:'Update terbaru'});
    const{startDate,endDate}=getActivePeriodResolved();
    const sisa=getSisaHari(endDate);
    notifications.unshift({type:'info',ico:'cal',title:`Periode Aktif`,msg:`${fmtDateShort(startDate)} – ${fmtDateShort(endDate)} · Sisa ${sisa.total} hari`,time:'Real-time'});
    renderNotif();
    const badge=document.getElementById('notifBadge');
    if(badge)badge.style.display=notifications.some(n=>n.type==='warn')?'inline':'none';
  }catch(e){toast('Gagal load notifikasi','err')}
}

function renderNotif(){
  const el=document.getElementById('notifList');
  if(!notifications.length){el.innerHTML=`<div class="empty"><div class="ei">${IC.notif}</div><p>Belum ada notifikasi.<br>Set anggaran di Pengaturan.</p></div>`;return}
  el.innerHTML=`<div class="notif-list">${notifications.map((n,i)=>`<div class="notif-item ${n.type}" style="animation-delay:${i*0.06}s"><div class="notif-ico">${IC[n.ico]||''}</div><div class="notif-body"><div class="notif-title">${n.title}</div><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div></div>`).join('')}</div>`;
}

function checkBudgetAlerts(byKatArr){
  const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
  const hw=byKatArr.some(k=>{const b=budgets[k.kategori]||0;return b>0&&k.nominal>=b});
  const badge=document.getElementById('notifBadge');
  if(badge)badge.style.display=hw?'inline':'none';
}

async function submitInput(){
  const tgl=document.getElementById('inTgl').value,jenis=document.getElementById('inJenis').value;
  const kat=document.getElementById('inKat').value,nom=document.getElementById('inNom').value;
  const metode=document.getElementById('inMetode').value,bank=document.getElementById('inBank').value;
  const ket=document.getElementById('inKet').value,bulan=document.getElementById('inBulan').value;
  if(!tgl||!jenis||!kat||!nom){toast('Lengkapi field wajib','err');return}
  document.getElementById('inLoad').style.display='flex';document.getElementById('btnSimpan').disabled=true;
  try{
    await sheetsAppend([[tgl,bulan,kat,Number(nom),metode,ket,bank,jenis]]);
    saveRecentKat(kat,jenis);toast('Data tersimpan!','ok');closeOv(null,'ovInput');allRows=[];
    if(document.getElementById('pg-data').classList.contains('on'))loadData();
    if(document.getElementById('pg-dashboard').classList.contains('on'))loadDashboard();
  }catch(e){toast('Gagal simpan: '+e.message,'err')}
  finally{document.getElementById('inLoad').style.display='none';document.getElementById('btnSimpan').disabled=false}
}

// ═══ EDIT/DELETE ═══
function toggleEditMode(){
  if(!isAdmin){
    document.getElementById('adminPass').value='';document.getElementById('adminErr').style.display='none';
    document.getElementById('ovAdmin').classList.add('open');
    setTimeout(()=>document.getElementById('adminPass').focus(),200);
  } else {
    isAdmin=false;editMode=false;setTheme('cosmic');
    const btn=document.getElementById('editModeBtn');if(btn){btn.innerHTML=IC.edit+' Edit';btn.classList.remove('on')}
    toast(`${IC.lock.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:3px')} Edit mode nonaktif`,'ok');renderCards(allRows);
  }
}

function doAdminLogin(){
  const pass=document.getElementById('adminPass').value;
  if(pass===adminPassword){
    isAdmin=true;editMode=true;closeOv(null,'ovAdmin');setTheme('ocean');
    const btn=document.getElementById('editModeBtn');if(btn){btn.innerHTML=IC.edit+' Selesai';btn.classList.add('on')}
    toast(`${IC.ok.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:3px')} Edit mode aktif`,'ok');renderCards(allRows);
  } else document.getElementById('adminErr').style.display='block';
}

function openEdit(rowIdx){
  if(!isAdmin)return;
  const r=allRows.find(x=>x.rowIndex===rowIdx);if(!r)return;
  document.getElementById('editRow').value=rowIdx;
  document.getElementById('eTgl').value=r.tanggal;syncBulan('e');
  document.getElementById('eJenis').value=r.jenis;onJenisChange('e');
  setTimeout(()=>{
    document.getElementById('eKat').value=r.kategori;
    document.getElementById('eMetode').value=r.pembayaran;
    fillBank('eBank',r.pembayaran);
    setTimeout(()=>{document.getElementById('eBank').value=r.metode},80);
  },80);
  document.getElementById('eNom').value=r.nominal;document.getElementById('eKet').value=r.detail||'';
  document.getElementById('ovEdit').classList.add('open');
}

async function doEdit(){
  const ri=Number(document.getElementById('editRow').value);
  const tgl=document.getElementById('eTgl').value,j=document.getElementById('eJenis').value;
  const k=document.getElementById('eKat').value,n=document.getElementById('eNom').value;
  const m=document.getElementById('eMetode').value,b=document.getElementById('eBank').value;
  const d=document.getElementById('eKet').value,bln=document.getElementById('eBulan').value;
  if(!tgl||!j||!k||!n){toast('Lengkapi field','err');return}
  document.getElementById('eLoad').style.display='flex';
  try{await sheetsUpdate(ri,[tgl,bln,k,Number(n),m,d,b,j]);toast('Diupdate!','ok');closeOv(null,'ovEdit');allRows=[];loadData()}
  catch(e){toast('Gagal update','err')}
  finally{document.getElementById('eLoad').style.display='none'}
}

async function doDelete(){
  showConfirm(`${IC.warn.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:3px')} Hapus Transaksi`,'Yakin ingin menghapus data ini?',async()=>{
    const ri=Number(document.getElementById('editRow').value);
    document.getElementById('eLoad').style.display='flex';
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=delete`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:ri})});
      if(!res.ok){const e=await res.json();throw new Error(e.error||'Gagal hapus')}
      toast('Dihapus','ok');closeOv(null,'ovEdit');allRows=[];loadData()
    }
    catch(e){toast('Gagal hapus','err')}
    finally{document.getElementById('eLoad').style.display='none'}
  });
}

// ═══ PENGATURAN ═══
function loadSettings(){
  const s=JSON.parse(localStorage.getItem('mm_settings')||'{}');
  if(s.username){['settUsername','drawerUsername'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=s.username});const bn=document.querySelector('.brand-name');if(bn)bn.textContent=s.username;const dt=document.querySelector('.drawer-title');if(dt)dt.textContent=s.username;}
  if(s.notifEnabled!==undefined)notifEnabled=s.notifEnabled;
  if(s.alertPct)alertPct=s.alertPct;
  if(s.adminPassword)adminPassword=s.adminPassword;
  document.getElementById('alertPctLabel').textContent=`${alertPct}% dari anggaran`;
  const nt=document.getElementById('notifToggle');if(nt)nt.classList.toggle('on',notifEnabled);
  updateKatRataLabel();
}

function openSettModal(type){
  settModalType=type;
  const title=document.getElementById('settModalTitle'),body=document.getElementById('settModalBody');
  if(type==='nama'){title.innerHTML=`${IC.edit.replace('width:12px;height:12px','width:14px;height:14px')} Ubah Nama`;const cur=document.getElementById('settUsername').textContent;body.innerHTML=`<div class="fr"><label>Nama Baru</label><input class="fi" type="text" id="settNamaInput" value="${cur}" placeholder="Nama kamu"></div>`}
  else if(type==='anggaran'){
    title.innerHTML=`${IC.tag.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Anggaran per Kategori`;
    body.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
    document.getElementById('ovSett').classList.add('open');
    const renderAnggaran=()=>{
      const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
      const kats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
      if(!kats.length){body.innerHTML=`<div class="empty"><div class="ei">${IC.tag}</div><p>Belum ada kategori.<br>Tambahkan transaksi pengeluaran dulu.</p></div>`;return}
      // Hitung total anggaran dari nilai yang tersimpan
      const totalAnggaranSimpan=kats.reduce((s,k)=>s+(Number(budgets[k])||0),0);
      body.innerHTML=`
        <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Set batas anggaran bulanan per kategori. Kosongkan untuk tidak ada limit.</p>
        ${kats.map((k,i)=>{
          const id='bgt_'+i;
          const val=budgets[k]||'';
          return`<div class="fr"><label>${k}</label><input class="fi" type="number" id="${id}" data-kat="${k}" placeholder="Rp — tidak ada limit" value="${val}" min="0" oninput="updateAnggaranTotal()"></div>`;
        }).join('')}
        <div id="anggaranTotalBox" style="margin-top:10px;padding:10px 12px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);border-radius:10px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.75rem;color:var(--tx2)">${IC.chart.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:4px')} Total Anggaran</span>
          <span id="anggaranTotalVal" style="font-size:0.88rem;font-weight:700;color:#c084fc">${totalAnggaranSimpan>0?rp(totalAnggaranSimpan):'—'}</span>
        </div>
        <div style="padding:8px 10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);border-radius:8px;font-size:0.7rem;color:var(--grn);margin-top:6px">
          Budget akan muncul di notifikasi jika pengeluaran melebihi batas.
        </div>`;
    };
    // Pastikan data & kategori ter-load sebelum render
    (async()=>{
      try{
        if(!allRows.length)allRows=await fetchAllData();
        await fetchDBOptions();
        renderAnggaran();
      }catch(e){
        body.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Gagal memuat data.<br>Coba refresh dulu.</p></div>`;
        console.error('anggaran modal error:',e);
      }
    })();
    return;
  }
  else if(type==='rekening'){
    title.innerHTML=`${IC.bank.replace('width:13px;height:13px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Kelola Rekening`;
    renderRekeningModal();
  }
  else if(type==='kategori'){
    title.innerHTML=`${IC.tag.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Kelola Kategori`;
    renderKategoriModal();
  }
  else if(type==='katrata'){
    title.innerHTML=`${IC.chart.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Kategori Rata-rata`;
    renderKatRataModal();
  }
  else if(type==='alertpct'){
    title.innerHTML=`${IC.notif.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Batas Peringatan`;
    body.innerHTML=`<div class="fr"><label>Persentase Peringatan (%)</label><input class="fi" type="number" id="alertPctInput" value="${alertPct}" min="50" max="100" placeholder="80"></div><p style="font-size:0.7rem;color:var(--tx3);margin-top:6px">Notifikasi muncul saat pengeluaran mencapai persentase ini dari budget.</p>`;
  }
  else if(type==='periode'){
    title.innerHTML=`${IC.cal.replace('width:13px;height:13px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Atur Periode`;
    const{startDate,endDate}=getActivePeriodResolved();
    const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    body.innerHTML=`
      <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Atur periode kustom atau reset ke otomatis (tanggal 24/25 tiap bulan).</p>
      <div class="fr"><label>Dari Tanggal</label><input class="fi" type="date" id="periodeFrom" value="${fmt(startDate)}" onchange="autoFriday('periodeFrom')"></div>
      <div class="fr"><label>Sampai Tanggal</label><input class="fi" type="date" id="periodeTo" value="${fmt(endDate)}" onchange="autoFriday('periodeTo')"></div>
      <button class="btn-cx" style="width:100%;margin-top:8px" onclick="resetPeriode()">${IC.reload} Reset ke Otomatis</button>`;
  }
  else if(type==='password'){
    title.innerHTML=`${IC.lock.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Ganti Password`;
    body.innerHTML=`<div class="fr"><label>Password Lama</label><input class="fi" type="password" id="passOld" placeholder="••••"></div><div class="fr"><label>Password Baru</label><input class="fi" type="password" id="passNew" placeholder="••••"></div><div class="fr"><label>Konfirmasi</label><input class="fi" type="password" id="passConf" placeholder="••••"></div>`;
  }
  document.getElementById('ovSett').classList.add('open');
}

function renderRekeningModal(){
  const body=document.getElementById('settModalBody');
  const customBanks=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px">Tambah rekening/dompet digital kustom.</p>
    <div class="fr"><label>Nama Rekening</label><input class="fi" type="text" id="newBankInput" placeholder="Contoh: BCA, Jago, Dana"></div>
    <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
      ${customBanks.map(b=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid var(--bdr2);border-radius:50px;font-size:0.75rem;color:var(--tx2)">${b}<button onclick="removeCustomBank('${b}')" style="background:none;border:none;color:var(--red);cursor:pointer;padding:0 0 0 4px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button></div>`).join('')}
    </div>`;
}

function renderKategoriModal(){
  const body=document.getElementById('settModalBody');
  const customKats=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px">Tambah kategori pengeluaran kustom.</p>
    <div class="fr"><label>Nama Kategori</label><input class="fi" type="text" id="newKatInput" placeholder="Contoh: Hobi, Olahraga"></div>
    <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
      ${customKats.map(k=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid var(--bdr2);border-radius:50px;font-size:0.75rem;color:var(--tx2)">${k}<button onclick="removeCustomKat('${k}')" style="background:none;border:none;color:var(--red);cursor:pointer;padding:0 0 0 4px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button></div>`).join('')}
    </div>`;
}

function renderKatRataModal(){
  const body=document.getElementById('settModalBody');
  const excl=JSON.parse(localStorage.getItem('mm_fixed_cats')||'["Tabungan","Kos","Tf Rumah","Listrik Rumah","Internet","Listrik"]');
  const allKats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Centang kategori yang dikecualikan dari perhitungan rata-rata harian.</p>
    ${allKats.map(k=>`<label style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--bdr);font-size:0.82rem;color:#fff;cursor:pointer"><input type="checkbox" ${excl.some(e=>e.toLowerCase()===k.toLowerCase())?'checked':''} value="${k}" style="width:16px;height:16px;accent-color:var(--ac)"> ${k}</label>`).join('')}`;
}

function removeCustomBank(name){
  let a=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');
  a=a.filter(b=>b!==name);localStorage.setItem('mm_custom_banks',JSON.stringify(a));
  renderRekeningModal();fetchDBOptions();
}
function removeCustomKat(name){
  let a=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
  a=a.filter(k=>k!==name);localStorage.setItem('mm_custom_kats',JSON.stringify(a));
  renderKategoriModal();fetchDBOptions();
}

// ═══ TOTAL ANGGARAN (live update) ═══
function updateAnggaranTotal(){
  const inputs=document.querySelectorAll('#settModalBody input[data-kat]');
  let total=0;
  inputs.forEach(inp=>{const v=Number(inp.value);if(v>0)total+=v;});
  const el=document.getElementById('anggaranTotalVal');
  if(el)el.textContent=total>0?rp(total):'—';
}

async function saveSettModal(){
  const body=document.getElementById('settModalBody');
  const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
  if(settModalType==='export'){
    const from=document.getElementById('expFrom')?.value;
    const to=document.getElementById('expTo')?.value;
    const bln=document.getElementById('expBulan')?.value;
    let rows=allRows.filter(r=>{
      const d=new Date(r.tanggal);
      const df=from?new Date(from):null,dt=to?new Date(to):null;
      return(!df||d>=df)&&(!dt||d<=dt)&&(!bln||r.bulan===bln);
    });
    if(!rows.length){toast('Tidak ada data','err');return}
    const header='Tanggal,Bulan,Kategori,Nominal,Pembayaran,Detail,Metode,Jenis';
    const csv=rows.map(r=>`${r.tanggal},${r.bulan},"${r.kategori}",${r.nominal},"${r.pembayaran}","${r.detail||''}","${r.metode}",${r.jenis}`).join('\n');
    const blob=new Blob([header+'\n'+csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`transaksi_${from||'all'}_${to||'all'}.csv`;a.click();
    URL.revokeObjectURL(url);toast('CSV diunduh!','ok');closeOv(null,'ovSett');return;
  }
  if(settModalType==='nama'){const val=document.getElementById('settNamaInput').value.trim();if(val){['settUsername','drawerUsername'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=val});const bn=document.querySelector('.brand-name');if(bn)bn.textContent=val;const dt=document.querySelector('.drawer-title');if(dt)dt.textContent=val;const s=JSON.parse(localStorage.getItem('mm_settings')||'{}');s.username=val;localStorage.setItem('mm_settings',JSON.stringify(s));toast('Nama diperbarui','ok')}}
  else if(settModalType==='anggaran'){
    (dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income')).forEach((k,i)=>{const el=document.getElementById('bgt_'+i);if(el&&el.value)budgets[k]=Number(el.value);else if(el&&!el.value)delete budgets[k]});localStorage.setItem('mm_budgets',JSON.stringify(budgets));toast('Anggaran disimpan','ok')}
  else if(settModalType==='alertpct'){const val=Number(document.getElementById('alertPctInput').value);if(val>=50&&val<=100){alertPct=val;document.getElementById('alertPctLabel').textContent=`${alertPct}% dari anggaran`;saveSettingsStorage();toast('Batas diperbarui','ok')}}
  else if(settModalType==='periode'){
    const from=document.getElementById('periodeFrom')?.value;
    const to=document.getElementById('periodeTo')?.value;
    if(from&&to){localStorage.setItem('mm_periode',JSON.stringify({startDate:from,endDate:to}));updatePeriodUI();loadDashboard();toast('Periode disimpan','ok')}
  }
  else if(settModalType==='katrata'){
    const checks=document.querySelectorAll('#settModalBody input[type=checkbox]');
    const excl=[];checks.forEach(c=>{if(c.checked)excl.push(c.value)});
    localStorage.setItem('mm_fixed_cats',JSON.stringify(excl));updateKatRataLabel();toast('Kategori disimpan','ok');
  }
  else if(settModalType==='rekening'){
    const val=document.getElementById('newBankInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_banks',JSON.stringify(a));fetchDBOptions();toast('Rekening ditambah','ok')}else toast('Sudah ada','err')}
  }
  else if(settModalType==='kategori'){
    const val=document.getElementById('newKatInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_kats',JSON.stringify(a));fetchDBOptions();toast('Kategori ditambah','ok')}else toast('Sudah ada','err')}
  }
  else if(settModalType==='password'){const old=document.getElementById('passOld').value,nw=document.getElementById('passNew').value,cf=document.getElementById('passConf').value;if(old!==adminPassword){toast('Password lama salah','err');return}if(nw!==cf){toast('Konfirmasi tidak cocok','err');return}if(nw.length<4){toast('Min 4 karakter','err');return}adminPassword=nw;saveSettingsStorage();toast('Password diperbarui','ok')}
  closeOv(null,'ovSett');
}

function updateExpCount(){
  const from=document.getElementById('expFrom')?.value;
  const to=document.getElementById('expTo')?.value;
  const bln=document.getElementById('expBulan')?.value;
  const count=allRows.filter(r=>{
    const d=new Date(r.tanggal);
    const df=from?new Date(from):null,dt=to?new Date(to):null;
    return(!df||d>=df)&&(!dt||d<=dt)&&(!bln||r.bulan===bln);
  }).length;
  const el=document.getElementById('expCount');
  if(el)el.textContent=count+' transaksi';
}

function triggerExportGSheet(){
  const from=document.getElementById('expFrom')?.value;
  const to=document.getElementById('expTo')?.value;
  const bln=document.getElementById('expBulan')?.value;
  let rows=allRows.filter(r=>{
    const d=new Date(r.tanggal);
    const df=from?new Date(from):null,dt=to?new Date(to):null;
    return(!df||d>=df)&&(!dt||d<=dt)&&(!bln||r.bulan===bln);
  });
  if(!rows.length){toast('Tidak ada data di rentang ini','err');return}
  const fromDate=from?fmtDateShort(new Date(from)):'awal';
  const toDate=to?fmtDateShort(new Date(to)):'sekarang';
  // Tutup ovSett dulu, buka confirm, kalau OK buka ovSett lagi untuk progress bar
  closeOv(null,'ovSett');
  showExportConfirm('Export ke GSheet',`Akan export ${rows.length} baris, periode ${fromDate} – ${toDate}. Lanjut?`,()=>{
    // Buka kembali ovSett sebagai container progress bar
    document.getElementById('ovSett').classList.add('open');
    doExportGSheet(from,to,bln);
  });
}

function showExportConfirm(title,msg,onOk){
  document.getElementById('cfmTitle').textContent=title;
  document.getElementById('cfmMsg').textContent=msg;
  const btnOk=document.getElementById('cfmOk');
  const newBtn=btnOk.cloneNode(true);
  // Reset styling — hapus gaya destruktif, pakai gaya normal
  newBtn.style.cssText='';
  newBtn.className='btn-ok';
  newBtn.innerHTML=`${IC.ok.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:3px')} Lanjut`;
  btnOk.parentNode.replaceChild(newBtn,btnOk);
  newBtn.onclick=()=>{closeOv(null,'ovConfirm');onOk();};
  document.getElementById('ovConfirm').classList.add('open');
}

async function doExportGSheet(from,to,bln){
  const btn=document.getElementById('btnExportGSheet');

  // Filter rows
  let rows=allRows.filter(r=>{
    const d=new Date(r.tanggal);
    const df=from?new Date(from):null,dt=to?new Date(to):null;
    return(!df||d>=df)&&(!dt||d<=dt)&&(!bln||r.bulan===bln);
  });

  // Disable tombol & ganti label
  if(btn){btn.disabled=true;btn.textContent='Mengirim...';}

  // Inject progress bar ke body modal
  const body=document.getElementById('settModalBody');
  let pw=document.getElementById('gsheetProgressWrap');
  if(!pw){
    pw=document.createElement('div');
    pw.id='gsheetProgressWrap';
    pw.style.cssText='margin-top:12px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;height:28px;position:relative';
    pw.innerHTML=`<div id="gsheetProgressBar" style="height:100%;width:0%;background:linear-gradient(90deg,#34a853,#0f9d58);transition:width 0.4s ease;border-radius:8px"></div><div id="gsheetProgressLabel" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.72rem;color:#fff;font-weight:600">0%</div>`;
    body.appendChild(pw);
  }

  const bar=document.getElementById('gsheetProgressBar');
  const lbl=document.getElementById('gsheetProgressLabel');

  // Fake progress — naik pelan hingga 85%, makin lambat mendekati batas
  let pct=0;
  const interval=setInterval(()=>{
    const step=pct<40?4:pct<65?2:pct<80?0.8:0.2;
    pct=Math.min(pct+step,85);
    bar.style.width=pct+'%';
    lbl.textContent=Math.round(pct)+'%';
  },200);

  // Map ke format 8 kolom: Tanggal,Bulan,Kategori,Nominal,Pembayaran,Detail,Metode,Jenis
  const mapped=rows.map(r=>{
    const d=new Date(r.tanggal);
    const tgl=`${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    return[tgl,r.bulan,r.kategori,r.nominal,r.pembayaran,r.detail||'',r.metode,r.jenis];
  });

  try{
    // Kirim sebagai form-encoded supaya tidak kena CORS preflight block
    const formData=new URLSearchParams();
    formData.append('data',JSON.stringify({rows:mapped,dateFrom:from||'',dateTo:to||''}));
    const res=await fetch(GSHEET_URL,{
      method:'POST',
      body:formData,
      redirect:'follow'
    });

    clearInterval(interval);
    // Lompat ke 100%
    bar.style.width='100%';
    lbl.textContent='100%';

    // Parse JSON sementara nunggu delay di 100%
    let json={};
    try{const txt=await res.text();json=JSON.parse(txt);}catch(_){}

    // Tunggu 2.5 detik di 100% supaya progress bar sempat keliatan
    await new Promise(r=>setTimeout(r,1500));

    if(json.success===true){
      toast(rows.length+' baris berhasil dikirim ke GSheet!','ok');
      await new Promise(r=>setTimeout(r,1000));
      closeOv(null,'ovSett');
    } else if(json.success===false){
      toast('GSheet: '+(json.error||json.message||'Unknown error'),'err');
      resetGSheetBtn(btn);
    } else {
      if(res.ok){
        toast(rows.length+' baris berhasil dikirim ke GSheet!','ok');
        await new Promise(r=>setTimeout(r,1500));
        closeOv(null,'ovSett');
      } else {
        toast('Gagal kirim ke GSheet','err');
        resetGSheetBtn(btn);
      }
    }
  }catch(err){
    clearInterval(interval);
    bar.style.width='100%';
    bar.style.background='linear-gradient(90deg,#ef4444,#dc2626)';
    lbl.textContent='Gagal';
    await new Promise(r=>setTimeout(r,600));
    toast('Gagal kirim ke GSheet: '+err.message,'err');
    resetGSheetBtn(btn);
  }
}

function resetGSheetBtn(btn){
  if(btn){btn.disabled=false;btn.innerHTML=IC.upload+'Export ke GSheet';}
  const pw=document.getElementById('gsheetProgressWrap');
  if(pw)pw.remove();
}

function exportCSV(){
  if(!allRows.length){toast('Load data dulu','err');return}
  const body=document.getElementById('settModalBody');
  const title=document.getElementById('settModalTitle');
  settModalType='export';
  title.innerHTML=`${IC.chart.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Export Data`;
  const now=new Date();
  body.innerHTML=`
    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:10px">Pilih rentang tanggal export:</p>
    <div class="fr"><label>Dari Tanggal</label><input class="fi" type="date" id="expFrom" value="${now.getFullYear()}-01-01" oninput="updateExpCount()"></div>
    <div class="fr"><label>Sampai Tanggal</label><input class="fi" type="date" id="expTo" value="${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}" oninput="updateExpCount()"></div>
    <div class="fr"><label>Filter Bulan (opsional)</label>
      <select class="fs" id="expBulan" onchange="updateExpCount()"><option value="">Semua Bulan</option>${MOS.map(m=>`<option>${m}</option>`).join('')}</select>
    </div>
    <div style="margin-top:8px;padding:8px 10px;background:var(--glass);border-radius:8px;font-size:0.7rem;color:var(--tx2)">
      Data terpilih: <strong id="expCount" style="color:#fff">${allRows.length} transaksi</strong>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn-ok" style="flex:1;font-size:0.78rem" onclick="saveSettModal()">${IC.save} Download CSV</button>
      <button class="btn-ok" id="btnExportGSheet" style="flex:1;font-size:0.78rem;background:linear-gradient(135deg,#34a853,#0f9d58)" onclick="triggerExportGSheet()">${IC.upload}Export ke GSheet</button>
    </div>`;
  const _ft=document.querySelector('#ovSett .modal-ft');if(_ft)_ft.style.display='none';
  document.getElementById('ovSett').classList.add('open');
}

function autoFriday(inputId){
  const inp=document.getElementById(inputId);if(!inp||!inp.value)return;
  const d=new Date(inp.value+'T00:00:00');const dow=d.getDay();
  if(dow===6)d.setDate(d.getDate()-1);else if(dow===0)d.setDate(d.getDate()-2);
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
  inp.value=`${y}-${m}-${dd}`;
}
function updateKatRataLabel(){
  const excl=JSON.parse(localStorage.getItem('mm_fixed_cats')||'["Tabungan","Kos","Tf Rumah","Listrik Rumah","Internet","Listrik"]');
  const el=document.getElementById('katRataLabel');if(el)el.textContent=`${excl.length} kategori dikecualikan`;
}
function saveSettingsStorage(){const s=JSON.parse(localStorage.getItem('mm_settings')||'{}');s.notifEnabled=notifEnabled;s.alertPct=alertPct;s.adminPassword=adminPassword;localStorage.setItem('mm_settings',JSON.stringify(s))}
function toggleNotif(){notifEnabled=!notifEnabled;const nt=document.getElementById('notifToggle');if(nt)nt.classList.toggle('on',notifEnabled);saveSettingsStorage();toast(notifEnabled?'Notifikasi aktif':'Notifikasi nonaktif','ok')}
function resetPeriode(){localStorage.removeItem('mm_periode');updatePeriodUI();closeOv(null,'ovSett');loadDashboard();toast('Periode direset ke otomatis','ok')}

// ═══ THEME ═══
function loadTheme(){setTheme(localStorage.getItem('mm_t')||'cosmic',false)}
function setTheme(t,save=true){
  document.documentElement.setAttribute('data-theme',t==='ocean'?'ocean':'cosmic');
  if(save)localStorage.setItem('mm_t',t);
  const isOcean=t==='ocean';
  ['themeToggle','drawerThemeToggle'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',isOcean)});
  const tl=document.getElementById('themeLabel');if(tl)tl.textContent=isOcean?'Ocean (Edit Mode)':'Cosmic (Default)';
  const dl=document.getElementById('drawerThemeLbl');if(dl)dl.innerHTML=`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' style='width:15px;height:15px;vertical-align:middle;margin-right:4px'><path stroke-linecap='round' stroke-linejoin='round' d='M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z'/></svg> Tema: \${isOcean?'Ocean':'Cosmic'}`;
}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');setTheme(cur==='ocean'?'cosmic':'ocean')}

// ═══ AVG DETAIL ═══
function openAvgDetail(){
  document.getElementById('bsOverlay').classList.add('open');
  const body=document.getElementById('bsBody');
  if(!avgDetailData||!avgDetailData.byKategori.length){body.innerHTML=`<div class="empty"><div class="ei">${IC.chart}</div><p>Load dashboard dulu</p></div>`;return}
  const d=avgDetailData,total=d.totalFleksibel,days=d.totalDays,maxN=Math.max(...d.byKategori.map(k=>k.nominal),1);
  body.innerHTML=`<div class="bs-sum"><div class="bs-sum-lbl">Total Pengeluaran Fleksibel</div><div class="bs-sum-val">${rp(total)}</div><div class="bs-sum-avg">Rata-rata ${rp(d.avgHarian)}/hari · ${days} hari aktif</div></div><div class="bs-kat-list">${d.byKategori.map(k=>{const avg=Math.round(k.nominal/days),pct=Math.round(k.nominal/maxN*100),share=total>0?Math.round(k.nominal/total*100):0;return`<div class="bs-kat"><div class="bs-kat-top"><span class="bs-kat-name">${k.kategori}</span><span class="bs-kat-total">${rp(k.nominal)}</span></div><div class="bs-kat-avg">Rata-rata ${rp(avg)}/hari · ${share}% dari total</div><div class="bs-kat-bar"><div class="bs-kat-fill" style="width:0%" data-w="${pct}"></div></div></div>`}).join('')}</div>`;
  setTimeout(()=>{body.querySelectorAll('.bs-kat-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
}
function closeBs(){document.getElementById('bsOverlay').classList.remove('open')}

// ═══ MODAL ═══
function closeOv(e,id){if(!e||e.target.id===id){document.getElementById(id).classList.remove('open');if(id==='ovSett'){const _ft=document.querySelector('#ovSett .modal-ft');if(_ft)_ft.style.display=''}}}
function showConfirm(title,msg,onOk){document.getElementById('cfmTitle').textContent=title;document.getElementById('cfmMsg').textContent=msg;document.getElementById('cfmOk').onclick=()=>{closeOv(null,'ovConfirm');onOk()};document.getElementById('ovConfirm').classList.add('open')}

// ═══ FORM ═══
function syncBulan(pfx){const v=document.getElementById(pfx==='in'?'inTgl':'eTgl').value,b=document.getElementById(pfx==='in'?'inBulan':'eBulan');if(!v)return;b.value=MOS[parseInt(v.split('-')[1],10)-1]||''}
function onJenisChange(pfx){
  const j=document.getElementById(pfx==='in'?'inJenis':'eJenis').value;
  const sel=document.getElementById(pfx==='in'?'inKat':'eKat');
  sel.innerHTML='<option value="">— Pilih —</option>';
  if(j==='Pemasukan')sel.innerHTML+='<option value="💰 Income">💰 Income</option>';
  else if(j==='Pengeluaran')(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income')).forEach(k=>{sel.innerHTML+=`<option value="${k}">${k}</option>`});
}
function onMetodeChange(pfx){fillBank(pfx==='in'?'inBank':'eBank',document.getElementById(pfx==='in'?'inMetode':'eMetode').value)}
function fillBank(id,metode){
  const sel=document.getElementById(id);if(!sel)return;
  if(metode==='Cash'){sel.innerHTML='<option value="💵 Cash">💵 Cash</option>';sel.value='💵 Cash';return}
  const banks=(dbOpts.banks||[]).filter(b=>!b.toLowerCase().includes('cash'));
  sel.innerHTML='<option value="">— Pilih Bank —</option>'+banks.map(b=>`<option value="${b}">${b}</option>`).join('');
}
function getRecentKats(){try{return JSON.parse(localStorage.getItem('mm_recent_kat')||'[]')}catch(e){return[]}}
function saveRecentKat(kat,jenis){let a=getRecentKats().filter(x=>x.kat!==kat);a.unshift({kat,jenis});localStorage.setItem('mm_recent_kat',JSON.stringify(a.slice(0,5)))}
function renderQuickKat(){
  const wrap=document.getElementById('quickKatWrap');if(!wrap)return;
  const recent=getRecentKats();
  if(!recent.length){wrap.style.display='none';return}
  wrap.style.display='block';
  document.getElementById('quickKatList').innerHTML=recent.map(x=>`<button class="qk-btn ${x.jenis==='Pemasukan'?'qk-inc':'qk-spd'}" onclick="applyQuickKat('${x.kat}','${x.jenis}')">${x.kat}</button>`).join('');
}
function applyQuickKat(kat,jenis){document.getElementById('inJenis').value=jenis;onJenisChange('in');setTimeout(()=>{document.getElementById('inKat').value=kat},60)}

// ═══ RIPPLE ═══
document.addEventListener('click',function(e){
  const btn=e.target.closest('button:not(.sett-toggle),.bnav-btn,.dc,.tap-card');if(!btn)return;
  const ripple=document.createElement('span');ripple.className='ripple';
  const rect=btn.getBoundingClientRect(),size=Math.max(rect.width,rect.height);
  ripple.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.style.position='relative';btn.style.overflow='hidden';btn.appendChild(ripple);
  setTimeout(()=>ripple.remove(),600);
});

// ═══ UTILS ═══
function rp(v){if(v===undefined||v===null||v==='')return'Rp 0';return'Rp '+Number(v).toLocaleString('id-ID')}
function rpShort(v){v=Number(v)||0;if(v>=1e9)return(v/1e9).toFixed(1).replace(/\.0$/,'')+'M';if(v>=1e6)return(v/1e6).toFixed(2).replace(/\.?0+$/,'')+'jt';if(v>=1e3)return(v/1e3).toFixed(0)+'rb';return String(v)}
function formatTgl(s){if(!s)return'—';const p=s.split('-');if(p.length!==3||Number(p[0])<1990)return'—';return`${p[2]}/${p[1]}/${p[0]}`}
function pad(n){return String(n).padStart(2,'0')}
function getLocalDate(){const d=new Date();return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function groupBy(arr,key){return arr.reduce((g,r)=>{(g[r[key]]=g[r[key]]||[]).push(r);return g},{})}
function countUp(id,target,prefix=''){
  const el=document.getElementById(id);if(!el)return;
  const steps=40,step=900/steps;let cur=0;
  const timer=setInterval(()=>{cur+=target/steps;if(cur>=target){cur=target;clearInterval(timer)}el.textContent=prefix+rp(Math.round(cur))},step);
}
function safeHTML(s){if(typeof s==='string'&&s.includes('<svg')){return s}const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.innerHTML=safeHTML(msg);el.className='toast show '+type;
  clearTimeout(toastT);toastT=setTimeout(()=>{el.className='toast'},3200);
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded',()=>{
  initParticles();initOceanParticles();
  updateClock();loadTheme();loadSettings();initLogo();
  document.getElementById('inTgl').value=getLocalDate();syncBulan('in');
  const now=new Date();
  document.getElementById('rekapTahun').value=String(now.getFullYear());
  const tgtFrom=document.getElementById('tgtFrom');
  const tgtTo=document.getElementById('tgtTo');
  if(tgtFrom)tgtFrom.value=MOS[now.getMonth()];
  if(tgtTo){const nextM=Math.min(now.getMonth()+5,11);tgtTo.value=MOS[nextM]}
  updatePeriodUI();
  fetchDBOptions().then(()=>loadDashboard());
});


