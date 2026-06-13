const API_URL='https://manager-khaki-ten.vercel.app'; // Vercel → Supabase
const GSHEET_URL='https://script.google.com/macros/s/AKfycbwHu6HvVRXHXNsNwtY2-DTRYY7AUAKcB9eEENTRxHulRiVHq3kJCNb_Cnt-6sycb4rDzw/exec';
const LOGO_URL='https://raw.githubusercontent.com/MR-REAL-png/Manager/main/logo.png';
const MOS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const CHART_COLORS=['#a78bfa','#f472b6','#60a5fa','#fb923c','#34d399','#818cf8','#fbbf24','#4ade80','#f87171','#e879f9','#38bdf8','#a3e635'];
const MONTH_COLORS=['#818cf8','#c084fc','#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#4ade80','#fbbf24','#e879f9','#38bdf8','#f87171'];

// ═══ SUPABASE REALTIME ═══
// Anon key aman dipakai di frontend (read-only public access)
const SUPABASE_URL='https://sskntgmjcrvfgtajazpn.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNza250Z21qY3J2Zmd0YWphenBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTUzMDcsImV4cCI6MjA5NTk3MTMwN30.v7EUvi5brdI3sokJJk3B6lAGhXfltPDqJy9uiu-Ni7o';

let _supabaseClient=null;
function getSupabaseClient(){
  if(_supabaseClient)return _supabaseClient;
  if(typeof window.supabase==='undefined')return null;
  _supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  return _supabaseClient;
}

function initRealtimeSync(){
  const uid=getUserUID();
  if(!uid)return;
  let lastUpdatedAt=null;

  // Polling setiap 10 detik
  setInterval(async()=>{
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=get-settings&uid=${uid}`);
      if(!res.ok)return;
      const json=await res.json();
      if(!json.success||!json.data)return;
      // Cek apakah ada perubahan baru
      if(json.updated_at&&json.updated_at!==lastUpdatedAt){
        if(lastUpdatedAt!==null){
          applySettings(json.data);
          // Reset allRows supaya dashboard reload fresh
          allRows=[];
          await fetchDBOptions();
          await loadDashboard();
          toast('Settings disinkron','ok');
        }
        lastUpdatedAt=json.updated_at;
      }
    }catch(e){/* silent fail */}
  },5000);
}

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

// ═══ PIN LOGIN ═══
let pinBuffer='';
let pinMode='login'; // 'login' | 'register' | 'confirm'
let pinRegisterName='';
let pinRegisterPin='';

function initPinOverlay(){
  // Cek apakah sudah login (ada session tersimpan)
  const session=localStorage.getItem('mm_session');
  if(session){
    try{
      const s=JSON.parse(session);
      if(s.username){
        // Langsung masuk, set UID
        localStorage.setItem('mm_uid',s.username);
        hidePinOverlay();
        return;
      }
    }catch(e){}
  }
  // Cek apakah sudah ada user terdaftar
  showPinOverlay();
}

function showPinOverlay(){
  const ov=document.getElementById('pinOverlay');
  if(ov){ov.style.display='flex';ov.classList.add('visible');ov.classList.remove('hidden');}
  pinBuffer='';
  // Init cosmic stars
  initPinStars();
  // Update datetime
  updatePinDatetime();
  if(!window._pinDatetimeTimer)window._pinDatetimeTimer=setInterval(updatePinDatetime,1000);
  pinMode='login';
  renderPinDots();
  document.getElementById('pinSubtitle').textContent='Masukkan PIN';
  document.getElementById('pinNameWrap').style.display='none';
  document.getElementById('pinSwitch').textContent='Belum punya akun? Daftar';
  document.getElementById('pinError').textContent='';
  // Init logo
  const logo=document.getElementById('pinLogo');
  if(logo)logo.style.backgroundImage=`url('https://raw.githubusercontent.com/MR-REAL-png/Manager/main/logo.png')`;
}

function hidePinOverlay(){
  const ov=document.getElementById('pinOverlay');
  if(ov){ov.classList.add('hidden');ov.classList.remove('visible');setTimeout(()=>{ov.style.display='none'},400);}
}

function pinKey(d){
  if(pinBuffer.length>=6)return;
  pinBuffer+=d;
  renderPinDots();
  if(pinBuffer.length===6){
    setTimeout(()=>pinSubmit(),120);
  }
}

function pinDel(){
  if(!pinBuffer.length)return;
  pinBuffer=pinBuffer.slice(0,-1);
  renderPinDots();
  document.getElementById('pinError').textContent='';
}

function renderPinDots(){
  const dots=document.querySelectorAll('#pinDots span');
  dots.forEach((d,i)=>{
    d.classList.toggle('filled',i<pinBuffer.length);
  });
}

function pinShakeError(msg){
  document.getElementById('pinError').textContent=msg;
  const dots=document.querySelectorAll('#pinDots span');
  dots.forEach(d=>{d.classList.add('shake');setTimeout(()=>d.classList.remove('shake'),400);});
  pinBuffer='';
  setTimeout(()=>renderPinDots(),50);
}

async function pinSubmit(){
  if(pinMode==='login'){
    // Cari user berdasarkan PIN
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({pin:pinBuffer})
      });
      const json=await res.json();
      if(json.success){
        // Simpan session
        localStorage.setItem('mm_session',JSON.stringify({username:json.username}));
        localStorage.setItem('mm_uid',json.username);
        hidePinOverlay();
        updateProfileUI();
        // Pull settings dengan UID baru
        await pullSettings();
        initRealtimeSync();
        fetchDBOptions().then(()=>loadDashboard());
      }else{
        pinShakeError(json.error||'PIN salah');
      }
    }catch(e){
      pinShakeError('Gagal terhubung ke server');
    }
  }
  else if(pinMode==='register'){
    // Simpan PIN sementara, minta konfirmasi
    pinRegisterPin=pinBuffer;
    pinBuffer='';
    pinMode='confirm';
    renderPinDots();
    document.getElementById('pinSubtitle').textContent='Konfirmasi PIN kamu';
    document.getElementById('pinError').textContent='';
  }
  else if(pinMode==='confirm'){
    if(pinBuffer!==pinRegisterPin){
      pinShakeError('PIN tidak cocok, coba lagi');
      pinMode='register';
      pinBuffer='';
      renderPinDots();
      document.getElementById('pinSubtitle').textContent='Buat PIN 6 digit';
      return;
    }
    // Daftar ke Supabase
    const name=document.getElementById('pinNameInput').value.trim()||'User';
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=register`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username:name,pin:pinRegisterPin})
      });
      const json=await res.json();
      if(json.success){
        localStorage.setItem('mm_session',JSON.stringify({username:json.username}));
        localStorage.setItem('mm_uid',json.username);
        hidePinOverlay();
        updateProfileUI();
        fetchDBOptions().then(()=>loadDashboard());
      }else{
        pinShakeError(json.error||'Gagal mendaftar');
        pinMode='register';
        pinBuffer='';
        renderPinDots();
        document.getElementById('pinSubtitle').textContent='Buat PIN 6 digit';
      }
    }catch(e){
      pinShakeError('Gagal terhubung ke server');
    }
  }
}

function pinToggleMode(){
  if(pinMode==='login'){
    pinMode='register';
    pinBuffer='';
    renderPinDots();
    document.getElementById('pinSubtitle').textContent='Buat PIN 6 digit';
    document.getElementById('pinNameWrap').style.display='block';
    document.getElementById('pinSwitch').textContent='Sudah punya akun? Masuk';
    document.getElementById('pinError').textContent='';
    document.getElementById('pinNameInput').focus();
  }else{
    pinMode='login';
    pinBuffer='';
    renderPinDots();
    document.getElementById('pinSubtitle').textContent='Masukkan PIN';
    document.getElementById('pinNameWrap').style.display='none';
    document.getElementById('pinSwitch').textContent='Belum punya akun? Daftar';
    document.getElementById('pinError').textContent='';
  }
}

function updateProfileUI(){
  const uid=getUserUID();
  if(!uid)return;
  // Tampilkan nama user login di setting profil
  const el=document.getElementById('settUserLogin');
  if(el)el.textContent=uid;
  // Avatar tetap pakai logo SE_REAL
  const av=document.getElementById('settAvatar');
  if(av){
    av.style.cssText=`width:64px;height:64px;border-radius:20px;background:url('${LOGO_URL}') center/cover;margin:0 auto 8px`;
    av.textContent='';
  }
}

function initPinStars(){
  const c=document.getElementById('pinStars');
  if(!c||c.children.length>0)return;
  for(let i=0;i<20;i++){
    const s=document.createElement('div');
    s.className='pin-star';
    s.style.cssText=`left:${Math.random()*100}%;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s;opacity:${Math.random()*0.6+0.2}`;
    c.appendChild(s);
  }
}

function updatePinDatetime(){
  const el=document.getElementById('pinDatetime');
  if(!el)return;
  const now=new Date();
  const hari=HARI[now.getDay()];
  const tgl=now.getDate();
  const bln=MOS[now.getMonth()];
  const jam=String(now.getHours()).padStart(2,'0');
  const mnt=String(now.getMinutes()).padStart(2,'0');
  el.textContent=`${hari}, ${tgl} ${bln} · ${jam}:${mnt}`;
}

function pinLogout(){
  localStorage.removeItem('mm_session');
  localStorage.removeItem('mm_uid');
  showPinOverlay();
}
// ID unik per user, generate sekali dan simpan di localStorage selamanya
function getUserUID(){
  let uid=localStorage.getItem('mm_uid');
  if(!uid){
    uid='uid_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
    localStorage.setItem('mm_uid',uid);
  }
  return uid;
}

// ═══ SETTINGS SYNC ═══
// Kumpulkan semua settings lokal jadi satu object
function collectSettings(){
  return{
    mm_budgets_v2:   JSON.parse(localStorage.getItem('mm_budgets_v2')||'{}'),
    mm_custom_kats:  JSON.parse(localStorage.getItem('mm_custom_kats')||'[]'),
    mm_custom_banks: JSON.parse(localStorage.getItem('mm_custom_banks')||'[]'),
    mm_fixed_cats:   JSON.parse(localStorage.getItem('mm_fixed_cats')||'[]'),
    mm_periode:      JSON.parse(localStorage.getItem('mm_periode')||'{}'),
    mm_settings:     JSON.parse(localStorage.getItem('mm_settings')||'{}'),
    mm_t:            localStorage.getItem('mm_t')||'cosmic',
  };
}

// Terapkan settings dari Supabase ke localStorage
function applySettings(data){
  if(!data)return;
  if(data.mm_budgets_v2)  localStorage.setItem('mm_budgets_v2',  JSON.stringify(data.mm_budgets_v2));
  if(data.mm_custom_kats) localStorage.setItem('mm_custom_kats', JSON.stringify(data.mm_custom_kats));
  if(data.mm_custom_banks)localStorage.setItem('mm_custom_banks',JSON.stringify(data.mm_custom_banks));
  if(data.mm_fixed_cats)  localStorage.setItem('mm_fixed_cats',  JSON.stringify(data.mm_fixed_cats));
  if(data.mm_periode)     localStorage.setItem('mm_periode',     JSON.stringify(data.mm_periode));
  if(data.mm_settings)    localStorage.setItem('mm_settings',    JSON.stringify(data.mm_settings));
  if(data.mm_t)           localStorage.setItem('mm_t',           data.mm_t);
  // Terapkan ke variabel runtime
  const s=data.mm_settings||{};
  if(s.notifEnabled!==undefined)notifEnabled=s.notifEnabled;
  if(s.alertPct)alertPct=s.alertPct;
  if(s.adminPassword)adminPassword=s.adminPassword;
  if(data.mm_t)setTheme(data.mm_t,false);
}

// Push settings ke Supabase (fire and forget, tidak blokir UI)
async function pushSettings(){
  try{
    const uid=getUserUID();
    await fetch(`${API_URL}/api/sheets?action=save-settings`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({uid,data:collectSettings()})
    });
  }catch(e){console.warn('pushSettings gagal:',e);}
}

// Pull settings dari Supabase saat app load
async function pullSettings(){
  try{
    const uid=getUserUID();
    const res=await fetch(`${API_URL}/api/sheets?action=get-settings&uid=${uid}`);
    if(!res.ok)return;
    const json=await res.json();
    if(json.success&&json.data){
      applySettings(json.data);
      console.log('Settings berhasil disinkron dari Supabase');
    }
  }catch(e){console.warn('pullSettings gagal:',e);}
}
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
  updateAiScanBtn(); // sinkron cooldown timer jika masih berjalan
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
  else if(p==='dompet')loadDompet();
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
  else if(id==='dompet')loadDompet();
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
    // Rata² Budget = kas sisa ÷ sisa hari
    const sisaHariNow=getSisaHari(endDate).total;
    const avgBudget=sisaHariNow>0?Math.round(kas/sisaHariNow):0;
    const elAvgBudget=document.getElementById('d-avg-budget');
    if(elAvgBudget){elAvgBudget.textContent=kas<=0?'—':rpShort(avgBudget);elAvgBudget.style.color=kas<=0?'var(--red)':'#fbbf24';}
    avgDetailData={totalFleksibel:totalFleks,totalDays:totalDaysPeriode,avgHarian,byKategori:byKatFleksArr,kas,masuk,keluar,sisaHari:sisaHariNow,avgBudget,startDate,endDate};
    // Hide komposisi jika ada budget sebelum render
    const _bKey=getBudgetMonthKey(new Date(startDate).getFullYear(),new Date(startDate).getMonth());
    const _budgets=getBudgetsForMonth(_bKey);
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
  // Gunakan bulan saat ini untuk budget
  const now=new Date();
  const bKey=getBudgetMonthKey(now.getFullYear(),now.getMonth());
  const budgets=getBudgetsForMonth(bKey);
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
    return`<div class="bud-item tap-card" style="animation-delay:${i*0.05}s;cursor:pointer" onclick="openBudItemDetail('${k.kategori.replace(/'/g,"\\'")}')"><div class="bud-top"><span class="bud-name">${k.kategori}</span><span class="bud-pct">${pct}%</span></div><div class="bud-bar"><div class="bud-fill ${cls}" style="width:0%" data-w="${pct}"></div></div><div class="bud-amts"><span>${rpShort(k.nominal)}</span><span>dari ${rpShort(total)}</span></div></div>`;
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
  // Gunakan bulan saat ini untuk budget
  const now=new Date();
  const bKey=getBudgetMonthKey(now.getFullYear(),now.getMonth());
  const budgets=getBudgetsForMonth(bKey);
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
    <div class="bmon-item tap-card" style="animation-delay:${i*0.05}s;cursor:pointer" onclick="event.stopPropagation();openBudItemDetail('${k.kategori.replace(/'/g,'\\\'')}')">
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
  if(!rows.length){el.innerHTML=`<div class="empty-state"><div class="empty-ico">💸</div><div class="empty-title">Belum ada transaksi</div><div class="empty-sub">Tap <strong>+</strong> untuk menambahkan transaksi pertama</div></div>`;return}
  const sorted=[...rows].sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  const totM=rows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
  const totK=rows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
  const kas=totM-totK;
  const strip=`<div class="data-summary"><div class="ds-item"><div class="ds-lbl">Masuk</div><div class="ds-val g">${rpShort(totM)}</div></div><div class="ds-sep"></div><div class="ds-item"><div class="ds-lbl">Keluar</div><div class="ds-val r">${rpShort(totK)}</div></div><div class="ds-sep"></div><div class="ds-item"><div class="ds-lbl">Kas</div><div class="ds-val ${kas>=0?'g':'r'}">${kas<0?'−':'+'}${rpShort(Math.abs(kas))}</div></div></div>`;
  const grouped={};sorted.forEach(r=>{if(!grouped[r.tanggal])grouped[r.tanggal]=[];grouped[r.tanggal].push(r)});
  const html=Object.entries(grouped).map(([tgl,txs],gi)=>{
    const dk=txs.reduce((s,r)=>r.jenis==='Pemasukan'?s+r.nominal:s-r.nominal,0);
    const hasIn=txs.some(r=>r.jenis==='Pemasukan'),hasOut=txs.some(r=>r.jenis==='Pengeluaran');
    const dotCls=hasIn&&hasOut?'mix':hasIn?'inc':'spd';
    const cards=txs.map((r,ri)=>{
      const isIn=r.jenis==='Pemasukan',cls=isIn?'inc':'spd',arr=isIn?'↓':'↑';
      const eb=editMode?`<button class="edit-btn" onclick="event.stopPropagation();openEdit(${r.rowIndex})">${IC.edit} Edit</button>`:'';
      const kat=r.kategori||'';
      const tags=[r.pembayaran,r.metode].filter(Boolean).map(t=>`<span class="dtag">${t}</span>`).join('');
      const ketHtml=r.detail?`<span class="dc-ket-inline">${r.detail}</span>`:'';
      const editHtml=eb?`<div class="dc-edit-row">${eb}</div>`:'';
      return`<div class="dc ${cls}" style="animation-delay:${(gi*0.05)+(ri*0.03)}s" onclick="event.stopPropagation();openStrukDetail(${r.rowIndex})"><div class="dc-row1"><div class="dc-left"><span class="dc-kat">${kat}</span></div><div class="dc-right"><span class="dc-nom ${cls}">${arr} ${rp(r.nominal)}</span></div></div><div class="dc-divider"></div><div class="dc-tags"><div class="dc-tags-left">${tags}</div>${ketHtml}</div>${editHtml}</div>`;
    }).join('');
    return`<div class="date-group"><div class="dg-header"><div class="dg-dot ${dotCls}"></div><span class="dg-date">${IC.cal} ${formatTgl(tgl)}</span><span class="dg-kas ${dk>=0?'g':'r'}">${dk>=0?'+':'−'}${rp(Math.abs(dk))}</span></div><div class="dg-cards">${cards}</div></div>`;
  }).join('');
  el.innerHTML=strip+html;
}

function filterData(){
  const s=document.getElementById('srch').value.toLowerCase(),b=document.getElementById('fBulan').value,j=document.getElementById('fJenis').value;
  renderCards(allRows.filter(r=>(!s||[r.kategori,r.detail,r.metode,r.pembayaran,r.bulan].join(' ').toLowerCase().includes(s))&&(!b||r.bulan===b)&&(!j||r.jenis===j)));
}

// ═══ DOMPET ═══
const BANK_THEMES={
  'Jago':       {grad:'linear-gradient(135deg,#d97706,#fbbf24)',motif:'waves',txt:'#fff'},
  'Cash':       {grad:'linear-gradient(135deg,#059669,#34d399)',motif:'cash',txt:'#fff'},
  'BCA':        {grad:'linear-gradient(135deg,#1e40af,#3b82f6)',motif:'lines',txt:'#fff'},
  'Seabank':    {grad:'linear-gradient(135deg,#ea580c,#f97316)',motif:'triangles',txt:'#fff'},
  'Dana':       {grad:'linear-gradient(135deg,#2563eb,#7c3aed)',motif:'circles',txt:'#fff'},
  'Shopeepay':  {grad:'linear-gradient(135deg,#dc2626,#f97316)',motif:'dots',txt:'#fff'},
  'GoPay':      {grad:'linear-gradient(135deg,#047857,#10b981)',motif:'waves',txt:'#fff'},
  'OVO':        {grad:'linear-gradient(135deg,#6d28d9,#8b5cf6)',motif:'circles',txt:'#fff'},
  'default':    {grad:'linear-gradient(135deg,#7c3aed,#ec4899)',motif:'dots',txt:'#fff'},
};

function getBankTheme(name){
  const key=Object.keys(BANK_THEMES).find(k=>name.toLowerCase().includes(k.toLowerCase()));
  return BANK_THEMES[key]||BANK_THEMES.default;
}

function getBankMotifSVG(motif,color='rgba(255,255,255,0.15)'){
  if(motif==='waves')return`<svg style="position:absolute;bottom:0;right:0;width:60%;opacity:0.3" viewBox="0 0 200 100"><path d="M0,50 Q50,20 100,50 T200,50 T300,50" fill="none" stroke="${color}" stroke-width="2"/><path d="M0,70 Q50,40 100,70 T200,70 T300,70" fill="none" stroke="${color}" stroke-width="2"/><path d="M0,30 Q50,0 100,30 T200,30 T300,30" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
  if(motif==='lines')return`<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.15" viewBox="0 0 300 160">${Array.from({length:12},(_,i)=>`<line x1="0" y1="${i*15}" x2="300" y2="${i*15}" stroke="white" stroke-width="1"/>`).join('')}</svg>`;
  if(motif==='circles')return`<svg style="position:absolute;right:-20px;bottom:-20px;width:55%;opacity:0.2" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="white" stroke-width="2"/><circle cx="60" cy="60" r="35" fill="none" stroke="white" stroke-width="2"/><circle cx="60" cy="60" r="20" fill="none" stroke="white" stroke-width="2"/></svg>`;
  if(motif==='triangles')return`<svg style="position:absolute;right:0;top:0;width:50%;opacity:0.15" viewBox="0 0 150 150"><polygon points="75,10 140,130 10,130" fill="none" stroke="white" stroke-width="2"/><polygon points="75,40 120,120 30,120" fill="none" stroke="white" stroke-width="2"/></svg>`;
  if(motif==='cash')return`<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.1" viewBox="0 0 300 160">${Array.from({length:8},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="160" stroke="white" stroke-width="1"/>`).join('')}${Array.from({length:6},(_,i)=>`<line x1="0" y1="${i*30}" x2="300" y2="${i*30}" stroke="white" stroke-width="1"/>`).join('')}</svg>`;
  // dots
  return`<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.15" viewBox="0 0 300 160">${Array.from({length:40},(_,i)=>`<circle cx="${(i%8)*40+20}" cy="${Math.floor(i/8)*35+20}" r="3" fill="white"/>`).join('')}</svg>`;
}

function renderATMCard(bank,saldo,isActive){
  const theme=getBankTheme(bank);
  return`
    <div class="atm-card${isActive?' active':''}" style="background:${theme.grad}">
      ${getBankMotifSVG(theme.motif)}
      <!-- Chip silver -->
      <div style="position:absolute;top:18px;left:18px;width:36px;height:26px;border-radius:5px;background:linear-gradient(135deg,#e0e0e0,#a8a8a8);border:1px solid rgba(255,255,255,0.4);box-shadow:inset 0 1px 2px rgba(255,255,255,0.5)">
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(0,0,0,0.12);transform:translateY(-50%)"></div>
        <div style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(0,0,0,0.1);transform:translateX(-50%)"></div>
      </div>
      <!-- Inisial pojok kanan atas -->
      <div style="position:absolute;top:18px;right:18px;font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.55);letter-spacing:0.12em">${bank.slice(0,2).toUpperCase()}</div>
      <!-- Saldo -->
      <div style="position:absolute;bottom:36px;left:18px">
        <div style="font-size:0.52rem;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:3px">Saldo</div>
        <div style="font-size:1.2rem;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.25)">${rp(saldo)}</div>
      </div>
      <!-- Nama bank kanan bawah - lebih besar -->
      <div style="position:absolute;bottom:16px;right:18px;font-size:1.05rem;font-weight:800;color:rgba(255,255,255,0.95);letter-spacing:0.03em;text-shadow:0 2px 6px rgba(0,0,0,0.2)">${bank}</div>
    </div>`;
}

async function loadDompet(){
  const el=document.getElementById('dompetContent');
  if(!el)return;
  el.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
  try{
    if(!allRows.length)allRows=await fetchAllData();
    await fetchDBOptions();
    const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean))].sort();
    const saldoMap={};
    banks.forEach(b=>saldoMap[b]=0);
    allRows.forEach(r=>{
      if(!r.pembayaran)return;
      if(r.jenis==='Pemasukan')saldoMap[r.pembayaran]=(saldoMap[r.pembayaran]||0)+r.nominal;
      else if(r.jenis==='Pengeluaran')saldoMap[r.pembayaran]=(saldoMap[r.pembayaran]||0)-r.nominal;
    });
    const transfers=await fetchTransfers();
    transfers.forEach(t=>{
      saldoMap[t.dari]=(saldoMap[t.dari]||0)-t.nominal;
      saldoMap[t.ke]=(saldoMap[t.ke]||0)+t.nominal;
    });

    if(!banks.length){
      el.innerHTML='<div class="empty-state"><div class="empty-ico">💳</div><div class="empty-title">Belum ada rekening</div><div class="empty-sub">Tambahkan transaksi dengan pilih rekening</div></div>';
      return;
    }

    const icTransfer=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/></svg>`;

    const renderMutasi=(bank)=>{
      const filtered=transfers.filter(t=>t.dari===bank||t.ke===bank);
      if(!filtered.length)return'<div style="text-align:center;padding:24px;color:var(--tx3);font-size:0.8rem">Belum ada transfer untuk rekening ini</div>';
      return filtered.slice(0,20).map(t=>{
        const isMasuk=t.ke===bank;
        const warna=isMasuk?'var(--grn)':'var(--red)';
        const arah=isMasuk?'↓ Masuk dari':'↑ Keluar ke';
        const counterpart=isMasuk?t.dari:t.ke;
        return`
          <div onclick="openEditTransfer('${encodeURIComponent(JSON.stringify(t))}')" style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--glass);border:1px solid var(--bdr2);border-radius:12px;margin-bottom:8px;cursor:pointer;active:opacity:0.8">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:${isMasuk?'rgba(52,211,153,0.15)':'rgba(248,113,113,0.15)'};display:flex;align-items:center;justify-content:center;color:${warna}">${icTransfer}</div>
              <div>
                <div style="font-size:0.82rem;font-weight:600;color:#fff">${arah} <span style="color:var(--ac)">${counterpart}</span></div>
                <div style="font-size:0.65rem;color:var(--tx3)">${t.tanggal}${t.catatan?` · ${t.catatan}`:''}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="font-size:0.9rem;font-weight:700;color:${warna}">${isMasuk?'+':'-'}${rp(t.nominal)}</div>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
            </div>
          </div>`;
      }).join('');
    };

    el.innerHTML=`
      <div style="margin-bottom:16px">
        <div class="atm-carousel" id="atmCarousel">
          ${banks.map((b,i)=>renderATMCard(b,saldoMap[b]||0,i===0)).join('')}
        </div>
        <div class="atm-dots" id="atmDots">
          ${banks.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join('')}
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button onclick="openTransferModal()" style="display:flex;align-items:center;gap:6px;padding:10px 18px;background:linear-gradient(135deg,var(--ac),var(--ac2));border:none;border-radius:12px;color:#fff;font-size:0.8rem;font-weight:700;cursor:pointer">
          ${icTransfer} Transfer
        </button>
      </div>
      <div class="sec-lbl" id="mutasiLabel">Mutasi Transfer — ${banks[0]}</div>
      <div id="transferList">${renderMutasi(banks[0])}</div>`;

    initATMCarousel(banks,renderMutasi);
  }catch(e){
    el.innerHTML=`<div class="empty-state"><div class="empty-ico">⚠️</div><div class="empty-title">Gagal memuat</div></div>`;
    console.error(e);
  }
}

function initATMCarousel(banks,renderMutasi){
  const carousel=document.getElementById('atmCarousel');
  if(!carousel)return;
  let cur=0;
  const total=banks.length;
  const cards=carousel.querySelectorAll('.atm-card');
  const dots=document.querySelectorAll('#atmDots span');
  let startX=0,startScroll=0,isDragging=false;

  const snapTo=(idx,animate=true)=>{
    cur=Math.max(0,Math.min(total-1,idx));
    cards.forEach((c,i)=>c.classList.toggle('active',i===cur));
    dots.forEach((d,i)=>d.classList.toggle('active',i===cur));
    const card=cards[cur];
    if(card){
      const offset=card.offsetLeft-carousel.offsetLeft-(carousel.offsetWidth-card.offsetWidth)/2;
      if(animate){
        carousel.style.scrollBehavior='smooth';
        carousel.scrollLeft=offset;
        setTimeout(()=>{carousel.style.scrollBehavior='auto';},400);
      }else{
        carousel.style.scrollBehavior='auto';
        carousel.scrollLeft=offset;
      }
    }
    const lbl=document.getElementById('mutasiLabel');
    const list=document.getElementById('transferList');
    if(lbl)lbl.textContent=`Mutasi Transfer \u2014 ${banks[cur]}`;
    if(list)list.innerHTML=renderMutasi(banks[cur]);
  };

  // Snap ke kartu pertama saat init (tanpa animasi)
  snapTo(0,false);

  carousel.addEventListener('touchstart',e=>{
    isDragging=true;
    startX=e.touches[0].clientX;
    startScroll=carousel.scrollLeft;
    carousel.style.scrollBehavior='auto';
  },{passive:true});

  carousel.addEventListener('touchmove',e=>{
    if(!isDragging)return;
    const dx=startX-e.touches[0].clientX;
    carousel.scrollLeft=startScroll+dx;
  },{passive:true});

  carousel.addEventListener('touchend',e=>{
    if(!isDragging)return;
    isDragging=false;
    const diff=startX-e.changedTouches[0].clientX;
    let nextIdx=cur;
    if(Math.abs(diff)>40){nextIdx=diff>0?cur+1:cur-1;}
    snapTo(nextIdx,true);
  },{passive:true});
}

async function fetchTransfers(){
  try{
    const uid=getUserUID();
    const res=await fetch(`${API_URL}/api/sheets?action=get-transfers&uid=${uid}`);
    const json=await res.json();
    return json.success?json.data:[];
  }catch(e){return[];}
}

function openEditTransfer(encodedT){
  const t=JSON.parse(decodeURIComponent(encodedT));
  const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean))].sort();
  const body=document.getElementById('settModalBody');
  const title=document.getElementById('settModalTitle');
  settModalType='edit-transfer';
  // Simpan data transfer aktif untuk dipakai saat save/hapus
  window._editTransferData=t;
  title.innerHTML='\u270f\ufe0f Edit Transfer';
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:12px">Ubah atau hapus transfer ini.</p>
    <div class="fr"><label>Dari Rekening</label>
      <select class="fi" id="etDari">
        ${banks.map(b=>`<option${b===t.dari?' selected':''}>${b}</option>`).join('')}
      </select>
    </div>
    <div class="fr"><label>Ke Rekening</label>
      <select class="fi" id="etKe">
        ${banks.map(b=>`<option${b===t.ke?' selected':''}>${b}</option>`).join('')}
      </select>
    </div>
    <div class="fr"><label>Nominal</label><input class="fi" type="text" id="etNominal" inputmode="numeric" value="${Number(t.nominal).toLocaleString('id-ID')}" oninput="fmtTransferNom(this)"></div>
    <div class="fr"><label>Catatan (opsional)</label><input class="fi" type="text" id="etCatatan" value="${t.catatan||''}" placeholder="Contoh: bayar utang"></div>
    <div class="fr"><label>Tanggal</label><input class="fi" type="date" id="etTanggal" value="${t.tanggal}"></div>
    <div style="margin-top:4px">
      <button onclick="deleteTransfer('${encodeURIComponent(JSON.stringify(t))}')" style="width:100%;padding:10px;background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);border-radius:10px;color:var(--red);font-size:0.8rem;font-weight:600;cursor:pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
        Hapus Transfer
      </button>
    </div>`;
  document.getElementById('ovSett').classList.add('open');
}

async function deleteTransfer(encodedT){
  const t=JSON.parse(decodeURIComponent(encodedT));
  showConfirm('Hapus Transfer','Yakin ingin menghapus transfer ini?',async()=>{
    try{
      const uid=getUserUID();
      const r=await fetch(`${API_URL}/api/sheets?action=delete-transfer`,{
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({uid,id:t.id})
      });
      const j=await r.json();
      if(j.success){closeOv(null,'ovSett');toast('Transfer dihapus','ok');loadDompet();}
      else toast(j.error||'Gagal hapus','err');
    }catch(e){toast('Gagal terhubung','err');}
  });
}

function openTransferModal(){
  const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean))].sort();
  const body=document.getElementById('settModalBody');
  const title=document.getElementById('settModalTitle');
  const modal=document.getElementById('ovSett');
  settModalType='transfer';
  title.innerHTML='↔️ Transfer Saldo';
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:12px">Pindahkan saldo antar rekening.</p>
    <div class="fr"><label>Dari Rekening</label>
      <select class="fi" id="trDari">
        <option value="">— Pilih —</option>
        ${banks.map(b=>`<option>${b}</option>`).join('')}
      </select>
    </div>
    <div class="fr"><label>Ke Rekening</label>
      <select class="fi" id="trKe">
        <option value="">— Pilih —</option>
        ${banks.map(b=>`<option>${b}</option>`).join('')}
      </select>
    </div>
    <div class="fr"><label>Nominal</label><input class="fi" type="text" id="trNominal" placeholder="Rp 0" inputmode="numeric" oninput="fmtTransferNom(this)"></div>
    <div class="fr"><label>Catatan (opsional)</label><input class="fi" type="text" id="trCatatan" placeholder="Contoh: bayar utang"></div>
    <div class="fr"><label>Tanggal</label><input class="fi" type="date" id="trTanggal" value="${getLocalDate()}"></div>`;
  modal.classList.add('open');
}
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
      // Warna & inisial per bank
      const bankMap={
        'jago':     {bg:'#F5C518',color:'#1a1a1a',init:'J'},
        'seabank':  {bg:'#FF6B2B',color:'#fff',init:'SB'},
        'bca':      {bg:'#0066AE',color:'#fff',init:'BCA'},
        'bri':      {bg:'#003087',color:'#fff',init:'BRI'},
        'bni':      {bg:'#F37021',color:'#fff',init:'BNI'},
        'mandiri':  {bg:'#003087',color:'#F5A623',init:'M'},
        'dana':     {bg:'#118EEA',color:'#fff',init:'D'},
        'ovo':      {bg:'#4C3494',color:'#fff',init:'OVO'},
        'gopay':    {bg:'#00AED6',color:'#fff',init:'GP'},
        'shopeepay':{bg:'#EE4D2D',color:'#fff',init:'SP'},
        'linkaja':  {bg:'#E82529',color:'#fff',init:'LA'},
        'jenius':   {bg:'#2B6CB0',color:'#fff',init:'JN'},
        'transfer': {bg:'#60a5fa',color:'#1e3a5f',init:'TF'},
        'qris':     {bg:'#a855f7',color:'#fff',init:'QR'},
      };
      const key=bank.toLowerCase().replace(/[^a-z]/g,'');
      const found=Object.keys(bankMap).find(k=>key.includes(k));
      let ico;
      if(key.includes('cash')){
        ico=`<span style="background:#34d399;border-radius:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#064e3b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg></span>`;
      } else {
        const style=found?bankMap[found]:{bg:'rgba(168,85,247,0.5)',color:'#fff',init:bank.slice(0,2).toUpperCase()};
        ico=`<span style="background:${style.bg};color:${style.color};font-size:0.55rem;font-weight:800;letter-spacing:-0.02em;border-radius:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${style.init}</span>`;
      }
      return`<div class="bank-item" style="animation-delay:${i*0.05}s"><div class="bank-ico" style="background:transparent;padding:0">${ico}</div><div class="bank-info"><div class="bank-name">${bank}</div><div class="bank-sub">${pct}% dari total</div><div class="bank-bar-wrap"><div class="bank-bar-fill" style="width:0%" data-w="${pct}"></div></div></div><div class="bank-val">${rpShort(val)}</div></div>`;
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
  const masukHari=txs.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
  const keluarHari=txs.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
  const netHari=masukHari-keluarHari;
  const netCls=netHari>=0?'pos':'neg';
  const netPfx=netHari>=0?'+':'−';
  det.innerHTML=`<div class="kal-det-hd">
    <div class="kal-det-date">${IC.cal} ${formatTgl(tgl)}</div>
    <div class="kal-det-summary">
      ${masukHari>0?`<span class="kal-det-sum-in">+${rpShort(masukHari)}</span>`:''}
      ${keluarHari>0?`<span class="kal-det-sum-out">−${rpShort(keluarHari)}</span>`:''}
      <span class="kal-det-net ${netCls}">${netPfx}${rpShort(Math.abs(netHari))}</span>
    </div>
  </div>
  <div class="kal-det-txs">${txs.map(r=>{
    const isIn=r.jenis==='Pemasukan';
    const tags=[r.metode,r.pembayaran].filter(Boolean).map(t=>`<span class="kal-tx2-tag">${t}</span>`).join('');
    return`<div class="kal-tx2">
      <div class="kal-tx2-left">
        <div class="kal-tx2-kat">${r.kategori}</div>
        ${r.detail?`<div class="kal-tx2-det">${r.detail}</div>`:''}
        ${tags?`<div class="kal-tx2-tags">${tags}</div>`:''}
      </div>
      <div class="kal-tx2-right">
        <div class="kal-tx2-nom ${isIn?'inc':'spd'}">${isIn?'+':'−'}${rp(r.nominal)}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
  det.scrollIntoView({behavior:'smooth',block:'nearest'});
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
    const notifBKey=getBudgetMonthKey(now.getFullYear(),now.getMonth());
    const budgets=getBudgetsForMonth(notifBKey);
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
  const {startDate}=getActivePeriodResolved();
  const bKey=getBudgetMonthKey(new Date(startDate).getFullYear(),new Date(startDate).getMonth());
  const budgets=getBudgetsForMonth(bKey);
  const hw=byKatArr.some(k=>{const b=budgets[k.kategori]||0;return b>0&&k.nominal>=b});
  const badge=document.getElementById('notifBadge');
  if(badge)badge.style.display=hw?'inline':'none';
}

async function submitInput(){
  const tgl=document.getElementById('inTgl').value,jenis=document.getElementById('inJenis').value;
  const kat=document.getElementById('inKat').value,nom=getNomVal('inNom');
  const metode=document.getElementById('inMetode').value,bank=document.getElementById('inBank').value;
  const ket=document.getElementById('inKet').value,bulan=document.getElementById('inBulan').value;
  if(!tgl||!jenis||!kat||!nom){toast('Lengkapi field wajib','err');return}
  document.getElementById('inLoad').style.display='flex';document.getElementById('btnSimpan').disabled=true;
  try{
    await sheetsAppend([[tgl,bulan,kat,nom,metode,ket,bank,jenis]]);
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
  else if(type==='changepin'){
    title.innerHTML='🔑 Ganti PIN';
    body.innerHTML=`
      <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:14px">Masukkan PIN lama, lalu PIN baru sebanyak 2 kali.</p>
      <div class="fr"><label>PIN Lama</label><input class="fi" type="password" id="pinOld" placeholder="6 digit" maxlength="6" inputmode="numeric"></div>
      <div class="fr"><label>PIN Baru</label><input class="fi" type="password" id="pinNew" placeholder="6 digit" maxlength="6" inputmode="numeric"></div>
      <div class="fr"><label>Konfirmasi PIN Baru</label><input class="fi" type="password" id="pinConf" placeholder="6 digit" maxlength="6" inputmode="numeric"></div>`;
    document.getElementById('ovSett').classList.add('open');
    return;
  }
  else if(type==='anggaran'){
    title.innerHTML=`${IC.tag.replace('width:20px;height:20px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Anggaran per Kategori`;
    body.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
    document.getElementById('ovSett').classList.add('open');
    // Reset ke bulan saat ini setiap kali buka
    anggaranModalYear = new Date().getFullYear();
    anggaranModalMonth = new Date().getMonth();
    const renderAnggaran=()=>{
      const key=getBudgetMonthKey(anggaranModalYear,anggaranModalMonth);
      const budgets=getBudgetsForMonth(key);
      const kats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
      if(!kats.length){body.innerHTML=`<div class="empty"><div class="ei">${IC.tag}</div><p>Belum ada kategori.<br>Tambahkan transaksi pengeluaran dulu.</p></div>`;return}
      const totalAnggaranSimpan=kats.reduce((s,k)=>s+(Number(budgets[k])||0),0);
      const allV2=getAllBudgetsV2();
      const hasOtherMonths=Object.keys(allV2).length>0;
      const prevDate=new Date(anggaranModalYear,anggaranModalMonth-1,1);
      const prevKey=getBudgetMonthKey(prevDate.getFullYear(),prevDate.getMonth());
      const prevBudgets=allV2[prevKey]||{};
      const canCopy=Object.keys(prevBudgets).length>0&&!Object.keys(budgets).length;
      body.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;background:var(--glass);border:1px solid var(--bdr2);border-radius:12px;padding:8px 12px">
          <button onclick="anggaranNavMonth(-1)" style="background:none;border:none;color:var(--tx2);cursor:pointer;padding:4px 8px;font-size:1.2rem;line-height:1">‹</button>
          <span id="anggaranMonthLbl" style="font-size:0.85rem;font-weight:600;color:#fff">${MOS[anggaranModalMonth]} ${anggaranModalYear}</span>
          <button onclick="anggaranNavMonth(1)" style="background:none;border:none;color:var(--tx2);cursor:pointer;padding:4px 8px;font-size:1.2rem;line-height:1">›</button>
        </div>
        ${canCopy?`<button onclick="anggaranCopyPrev()" style="width:100%;margin-bottom:10px;padding:8px;background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:8px;color:var(--grn);font-size:0.75rem;cursor:pointer">📋 Salin dari ${MOS[prevDate.getMonth()]} ${prevDate.getFullYear()}</button>`:''}
        <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Set batas anggaran per kategori untuk <b style="color:#c084fc">${MOS[anggaranModalMonth]} ${anggaranModalYear}</b>. Kosongkan untuk tidak ada limit.</p>
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
          Budget tersimpan per bulan. Navigasi ‹ › untuk lihat/edit bulan lain.
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
  const defaultBanks=(dbOpts.banks||[]).filter(b=>!customBanks.includes(b));
  const renderChip=(b,isCustom)=>`
    <div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid ${isCustom?'rgba(168,85,247,0.4)':'var(--bdr2)'};border-radius:50px;font-size:0.75rem;color:${isCustom?'#c084fc':'var(--tx2)'}">
      ${b}
      ${isCustom?`<button onclick="removeCustomBank('${b}')" style="background:none;border:none;color:var(--red);cursor:pointer;padding:0 0 0 4px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>`:''}
    </div>`;
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px">Tambah rekening/dompet digital kustom.</p>
    <div class="fr"><label>Nama Rekening</label><input class="fi" type="text" id="newBankInput" placeholder="Contoh: BCA, Jago, Dana"></div>
    ${defaultBanks.length||customBanks.length?`
    <div style="margin-top:4px;margin-bottom:6px;font-size:0.65rem;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em">Rekening tersedia</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${defaultBanks.map(b=>renderChip(b,false)).join('')}
      ${customBanks.map(b=>renderChip(b,true)).join('')}
    </div>`:''}
    <div style="margin-top:8px;font-size:0.65rem;color:var(--tx3)">💡 Rekening ungu = kustom (bisa dihapus)</div>`;
}

function renderKategoriModal(){
  const body=document.getElementById('settModalBody');
  const customKats=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
  const allKats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
  const defaultKats=allKats.filter(k=>!customKats.includes(k));
  const renderChip=(k,isCustom)=>`
    <div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid ${isCustom?'rgba(168,85,247,0.4)':'var(--bdr2)'};border-radius:50px;font-size:0.75rem;color:${isCustom?'#c084fc':'var(--tx2)'}">
      ${k}
      ${isCustom?`<button onclick="removeCustomKat('${k}')" style="background:none;border:none;color:var(--red);cursor:pointer;padding:0 0 0 4px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>`:''}
    </div>`;
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px">Tambah kategori pengeluaran kustom.</p>
    <div class="fr"><label>Nama Kategori</label><input class="fi" type="text" id="newKatInput" placeholder="Contoh: Hobi, Olahraga"></div>
    ${defaultKats.length||customKats.length?`
    <div style="margin-top:4px;margin-bottom:6px;font-size:0.65rem;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em">Kategori tersedia</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${defaultKats.map(k=>renderChip(k,false)).join('')}
      ${customKats.map(k=>renderChip(k,true)).join('')}
    </div>`:''}
    <div style="margin-top:8px;font-size:0.65rem;color:var(--tx3)">💡 Kategori ungu = kustom (bisa dihapus)</div>`;
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
  renderRekeningModal();fetchDBOptions();pushSettings();
}
function removeCustomKat(name){
  let a=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
  a=a.filter(k=>k!==name);localStorage.setItem('mm_custom_kats',JSON.stringify(a));
  renderKategoriModal();fetchDBOptions();pushSettings();
}

// ═══ ANGGARAN PER BULAN ═══
// Key format: "YYYY-MM" → { KategoriA: 150000, KategoriB: 500000, ... }
// Storage: mm_budgets_v2 = { "2025-06": {...}, "2025-07": {...} }

function getBudgetMonthKey(year, month) {
  // month: 0-based
  return `${year}-${String(month+1).padStart(2,'0')}`;
}

function getAllBudgetsV2() {
  return JSON.parse(localStorage.getItem('mm_budgets_v2') || '{}');
}

function getBudgetsForMonth(key) {
  const all = getAllBudgetsV2();
  // Fallback: jika bulan ini belum ada, coba migrate dari mm_budgets lama
  if (!all[key]) {
    const legacy = JSON.parse(localStorage.getItem('mm_budgets') || '{}');
    if (Object.keys(legacy).length > 0) return legacy;
    return {};
  }
  return all[key] || {};
}

function saveBudgetsForMonth(key, budgets) {
  const all = getAllBudgetsV2();
  all[key] = budgets;
  localStorage.setItem('mm_budgets_v2', JSON.stringify(all));
}

function copyBudgetFromPrevMonth(targetKey) {
  const all = getAllBudgetsV2();
  const [y, m] = targetKey.split('-').map(Number);
  const prevDate = new Date(y, m-2, 1); // m-1 karena 0-based, lalu -1 lagi = bulan sebelumnya
  const prevKey = getBudgetMonthKey(prevDate.getFullYear(), prevDate.getMonth());
  const prev = all[prevKey] || {};
  if (Object.keys(prev).length > 0) {
    all[targetKey] = { ...prev };
    localStorage.setItem('mm_budgets_v2', JSON.stringify(all));
    return true;
  }
  return false;
}

// State untuk modal anggaran
let anggaranModalYear = new Date().getFullYear();
let anggaranModalMonth = new Date().getMonth();

// ═══ TOTAL ANGGARAN (live update) ═══
function updateAnggaranTotal(){
  const inputs=document.querySelectorAll('#settModalBody input[data-kat]');
  let total=0;
  inputs.forEach(inp=>{const v=Number(inp.value);if(v>0)total+=v;});
  const el=document.getElementById('anggaranTotalVal');
  if(el)el.textContent=total>0?rp(total):'—';
}

function anggaranNavMonth(dir){
  // Simpan nilai saat ini sebelum pindah bulan
  const key=getBudgetMonthKey(anggaranModalYear,anggaranModalMonth);
  const budgets=getBudgetsForMonth(key);
  const inputs=document.querySelectorAll('#settModalBody input[data-kat]');
  let hasInput=false;
  inputs.forEach(inp=>{if(inp.value){hasInput=true;budgets[inp.dataset.kat]=Number(inp.value);}else{delete budgets[inp.dataset.kat];}});
  if(hasInput)saveBudgetsForMonth(key,budgets);

  // Navigasi bulan
  anggaranModalMonth+=dir;
  if(anggaranModalMonth>11){anggaranModalMonth=0;anggaranModalYear++;}
  if(anggaranModalMonth<0){anggaranModalMonth=11;anggaranModalYear--;}

  // Re-render modal
  const newKey=getBudgetMonthKey(anggaranModalYear,anggaranModalMonth);
  const newBudgets=getBudgetsForMonth(newKey);
  const kats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
  const totalAnggaranSimpan=kats.reduce((s,k)=>s+(Number(newBudgets[k])||0),0);
  const allV2=getAllBudgetsV2();
  const prevDate=new Date(anggaranModalYear,anggaranModalMonth-1,1);
  const prevKey=getBudgetMonthKey(prevDate.getFullYear(),prevDate.getMonth());
  const prevBudgets=allV2[prevKey]||{};
  const canCopy=Object.keys(prevBudgets).length>0&&!Object.keys(newBudgets).length;
  const body=document.getElementById('settModalBody');
  body.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;background:var(--glass);border:1px solid var(--bdr2);border-radius:12px;padding:8px 12px">
      <button onclick="anggaranNavMonth(-1)" style="background:none;border:none;color:var(--tx2);cursor:pointer;padding:4px 8px;font-size:1.2rem;line-height:1">‹</button>
      <span id="anggaranMonthLbl" style="font-size:0.85rem;font-weight:600;color:#fff">${MOS[anggaranModalMonth]} ${anggaranModalYear}</span>
      <button onclick="anggaranNavMonth(1)" style="background:none;border:none;color:var(--tx2);cursor:pointer;padding:4px 8px;font-size:1.2rem;line-height:1">›</button>
    </div>
    ${canCopy?`<button onclick="anggaranCopyPrev()" style="width:100%;margin-bottom:10px;padding:8px;background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:8px;color:var(--grn);font-size:0.75rem;cursor:pointer">📋 Salin dari ${MOS[prevDate.getMonth()]} ${prevDate.getFullYear()}</button>`:''}
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Set batas anggaran per kategori untuk <b style="color:#c084fc">${MOS[anggaranModalMonth]} ${anggaranModalYear}</b>. Kosongkan untuk tidak ada limit.</p>
    ${kats.map((k,i)=>{
      const id='bgt_'+i;
      const val=newBudgets[k]||'';
      return`<div class="fr"><label>${k}</label><input class="fi" type="number" id="${id}" data-kat="${k}" placeholder="Rp — tidak ada limit" value="${val}" min="0" oninput="updateAnggaranTotal()"></div>`;
    }).join('')}
    <div id="anggaranTotalBox" style="margin-top:10px;padding:10px 12px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);border-radius:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:0.75rem;color:var(--tx2)">${IC.chart.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:4px')} Total Anggaran</span>
      <span id="anggaranTotalVal" style="font-size:0.88rem;font-weight:700;color:#c084fc">${totalAnggaranSimpan>0?rp(totalAnggaranSimpan):'—'}</span>
    </div>
    <div style="padding:8px 10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);border-radius:8px;font-size:0.7rem;color:var(--grn);margin-top:6px">
      Budget tersimpan per bulan. Navigasi ‹ › untuk lihat/edit bulan lain.
    </div>`;
}

function anggaranCopyPrev(){
  const prevDate=new Date(anggaranModalYear,anggaranModalMonth-1,1);
  const prevKey=getBudgetMonthKey(prevDate.getFullYear(),prevDate.getMonth());
  const allV2=getAllBudgetsV2();
  const prev=allV2[prevKey]||{};
  if(!Object.keys(prev).length){toast('Tidak ada data bulan lalu','err');return;}
  const targetKey=getBudgetMonthKey(anggaranModalYear,anggaranModalMonth);
  saveBudgetsForMonth(targetKey,{...prev});
  toast(`Disalin dari ${MOS[prevDate.getMonth()]} ${prevDate.getFullYear()}`,'ok');
  // Re-render dengan data yang baru disalin — trigger nav 0 (stay, tapi re-render)
  anggaranModalMonth--;
  anggaranNavMonth(1);
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
    const key=getBudgetMonthKey(anggaranModalYear,anggaranModalMonth);
    const budgets=getBudgetsForMonth(key);
    (dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income')).forEach((k,i)=>{
      const el=document.getElementById('bgt_'+i);
      if(el&&el.value)budgets[k]=Number(el.value);
      else if(el&&!el.value)delete budgets[k];
    });
    saveBudgetsForMonth(key,budgets);
    toast(`Anggaran ${MOS[anggaranModalMonth]} ${anggaranModalYear} disimpan`,'ok');
    pushSettings();
  }
  else if(settModalType==='alertpct'){const val=Number(document.getElementById('alertPctInput').value);if(val>=50&&val<=100){alertPct=val;document.getElementById('alertPctLabel').textContent=`${alertPct}% dari anggaran`;saveSettingsStorage();pushSettings();toast('Batas diperbarui','ok')}}
  else if(settModalType==='periode'){
    const from=document.getElementById('periodeFrom')?.value;
    const to=document.getElementById('periodeTo')?.value;
    if(from&&to){localStorage.setItem('mm_periode',JSON.stringify({startDate:from,endDate:to}));updatePeriodUI();loadDashboard();pushSettings();toast('Periode disimpan','ok')}
  }
  else if(settModalType==='katrata'){
    const checks=document.querySelectorAll('#settModalBody input[type=checkbox]');
    const excl=[];checks.forEach(c=>{if(c.checked)excl.push(c.value)});
    localStorage.setItem('mm_fixed_cats',JSON.stringify(excl));updateKatRataLabel();pushSettings();toast('Kategori disimpan','ok');
  }
  else if(settModalType==='changepin'){
    const old=document.getElementById('pinOld')?.value;
    const nw=document.getElementById('pinNew')?.value;
    const cf=document.getElementById('pinConf')?.value;
    if(!old||old.length!==6){toast('PIN lama harus 6 digit','err');return;}
    if(!nw||nw.length!==6){toast('PIN baru harus 6 digit','err');return;}
    if(nw!==cf){toast('Konfirmasi PIN tidak cocok','err');return;}
    const uid=getUserUID();
    // Verifikasi PIN lama dulu
    fetch(`${API_URL}/api/sheets?action=login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:old})})
    .then(r=>r.json()).then(async j=>{
      if(!j.success){toast('PIN lama salah','err');return;}
      // Update PIN di Supabase
      const res=await fetch(`${API_URL}/api/sheets?action=changepin`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:uid,oldPin:old,newPin:nw})});
      const data=await res.json();
      if(data.success){closeSettModal();toast('PIN berhasil diubah','ok');}
      else toast(data.error||'Gagal ganti PIN','err');
    }).catch(()=>toast('Gagal terhubung','err'));
  }
  else if(settModalType==='transfer'){
    const dari=document.getElementById('trDari')?.value;
    const ke=document.getElementById('trKe')?.value;
    const nominal=Number(document.getElementById('trNominal')?.value.replace(/\./g,'').replace(/[^0-9]/g,''));
    const catatan=document.getElementById('trCatatan')?.value||'';
    const tanggal=document.getElementById('trTanggal')?.value;
    if(!dari){toast('Pilih rekening asal','err');return;}
    if(!ke){toast('Pilih rekening tujuan','err');return;}
    if(dari===ke){toast('Rekening tidak boleh sama','err');return;}
    if(!nominal||nominal<=0){toast('Nominal harus lebih dari 0','err');return;}
    if(!tanggal){toast('Pilih tanggal','err');return;}
    const uid=getUserUID();
    // Disable tombol Simpan agar tidak bisa klik ganda
    const btnOk=document.querySelector('#ovSett .btn-ok');
    if(btnOk){btnOk.disabled=true;btnOk.textContent='Menyimpan...';}
    try{
      const r=await fetch(`${API_URL}/api/sheets?action=save-transfer`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({uid,dari,ke,nominal,catatan,tanggal})
      });
      const j=await r.json();
      if(j.success){closeOv(null,'ovSett');toast('Transfer berhasil dicatat','ok');loadDompet();}
      else toast(j.error||'Gagal menyimpan transfer','err');
    }catch(e){
      toast('Gagal terhubung, coba lagi','err');
    }finally{
      if(btnOk){btnOk.disabled=false;btnOk.textContent='Simpan';}
    }
    return; // jangan lanjut ke closeOv di bawah
  }
  else if(settModalType==='edit-transfer'){
    const t=window._editTransferData;
    if(!t){toast('Data tidak ditemukan','err');return;}
    const dari=document.getElementById('etDari')?.value;
    const ke=document.getElementById('etKe')?.value;
    const nominal=Number(document.getElementById('etNominal')?.value.replace(/\./g,'').replace(/[^0-9]/g,''));
    const catatan=document.getElementById('etCatatan')?.value||'';
    const tanggal=document.getElementById('etTanggal')?.value;
    if(!dari||!ke){toast('Pilih rekening','err');return;}
    if(dari===ke){toast('Rekening tidak boleh sama','err');return;}
    if(!nominal||nominal<=0){toast('Nominal harus lebih dari 0','err');return;}
    if(!tanggal){toast('Pilih tanggal','err');return;}
    const uid=getUserUID();
    const btnOk=document.querySelector('#ovSett .btn-ok');
    if(btnOk){btnOk.disabled=true;btnOk.textContent='Menyimpan...';}
    try{
      const r=await fetch(`${API_URL}/api/sheets?action=update-transfer`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({uid,id:t.id,dari,ke,nominal,catatan,tanggal})
      });
      const j=await r.json();
      if(j.success){closeOv(null,'ovSett');toast('Transfer diperbarui','ok');loadDompet();}
      else toast(j.error||'Gagal update','err');
    }catch(e){toast('Gagal terhubung','err');}
    finally{if(btnOk){btnOk.disabled=false;btnOk.textContent='Simpan';}}
    return;
  }
  else if(settModalType==='rekening'){
    const val=document.getElementById('newBankInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_banks',JSON.stringify(a));fetchDBOptions();pushSettings();toast('Rekening ditambah','ok')}else toast('Sudah ada','err')}
  }
  else if(settModalType==='kategori'){
    const val=document.getElementById('newKatInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_kats',JSON.stringify(a));fetchDBOptions();pushSettings();toast('Kategori ditambah','ok')}else toast('Sudah ada','err')}
  }
  else if(settModalType==='password'){const old=document.getElementById('passOld').value,nw=document.getElementById('passNew').value,cf=document.getElementById('passConf').value;if(old!==adminPassword){toast('Password lama salah','err');return}if(nw!==cf){toast('Konfirmasi tidak cocok','err');return}if(nw.length<4){toast('Min 4 karakter','err');return}adminPassword=nw;saveSettingsStorage();pushSettings();toast('Password diperbarui','ok')}
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
function toggleNotif(){notifEnabled=!notifEnabled;const nt=document.getElementById('notifToggle');if(nt)nt.classList.toggle('on',notifEnabled);saveSettingsStorage();pushSettings();toast(notifEnabled?'Notifikasi aktif':'Notifikasi nonaktif','ok')}
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
function toggleTheme(){
  const cur=document.documentElement.getAttribute('data-theme');
  const next=cur==='ocean'?'cosmic':'ocean';
  // Slide-down curtain dari atas
  const curtain=document.createElement('div');
  curtain.style.cssText=`
    position:fixed;top:0;left:0;right:0;
    height:100vh;z-index:99998;pointer-events:none;
    background:${next==='ocean'
      ?'linear-gradient(160deg,#0c3460 0%,#0a4a8c 50%,#0c3460 100%)'
      :'linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)'};
    transform:translateY(-100%);
    animation:themeCurtain 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
  `;
  document.body.appendChild(curtain);
  // Ganti tema di tengah animasi (saat curtain menutupi layar)
  setTimeout(()=>setTheme(next),260);
  setTimeout(()=>curtain.remove(),600);
}

// ═══ AVG DETAIL ═══
function openAvgDetail(){
  const t=document.getElementById('bsTitle');if(t)t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg> Detail Pengeluaran Fleksibel';
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
function showConfirm(title,msg,onOk){document.getElementById('cfmTitle').innerHTML=title;document.getElementById('cfmMsg').textContent=msg;document.getElementById('cfmOk').onclick=()=>{closeOv(null,'ovConfirm');onOk()};document.getElementById('ovConfirm').classList.add('open')}

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
function fmtNom(el) {
  // Simpan posisi cursor
  const raw = el.value.replace(/\./g, '').replace(/[^0-9]/g, '');
  if (raw === '') { el.value = ''; return; }
  el.value = Number(raw).toLocaleString('id-ID');
}
function fmtTransferNom(el){
  const raw=el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  if(raw===''){el.value='';return;}
  el.value=Number(raw).toLocaleString('id-ID');
}
function getNomVal(id) {
  // Baca nilai nominal tanpa titik pemisah
  return Number((document.getElementById(id).value || '0').replace(/\./g, '').replace(/[^0-9]/g, '')) || 0;
}
function safeHTML(s){if(typeof s==='string'&&s.includes('<svg')){return s}const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.innerHTML=safeHTML(msg);el.className='toast show '+type;
  clearTimeout(toastT);toastT=setTimeout(()=>{el.className='toast'},3200);
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded',async()=>{
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
  // Cek session login
  const session=localStorage.getItem('mm_session');
  if(session){
    try{
      const s=JSON.parse(session);
      if(s.username){
        localStorage.setItem('mm_uid',s.username);
        hidePinOverlay();
        updateProfileUI();
        await pullSettings();
        initRealtimeSync();
        fetchDBOptions().then(()=>loadDashboard());
        return;
      }
    }catch(e){}
  }
  // Belum login — tampilkan PIN overlay
  showPinOverlay();
});



// ═══ POPUP: HERO KAS ═══
function openKasDetail(){
  const t=document.getElementById('bsTitle');
  if(t)t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/></svg> Ringkasan Arus Kas';
  document.getElementById('bsOverlay').classList.add('open');
  const body=document.getElementById('bsBody');
  if(!avgDetailData){body.innerHTML=`<div class="empty"><div class="ei">${IC.chart}</div><p>Load dashboard dulu</p></div>`;return}
  const d=avgDetailData;
  const kas=d.kas,masuk=d.masuk,keluar=d.keluar,sisa=d.sisaHari,avgBudget=d.avgBudget;
  const kasPos=kas>=0;
  const pfx=kasPos?'+':'−';
  const col=kasPos?'var(--grn)':'var(--red)';
  // Top 3 kategori pengeluaran
  const top3=d.byKategori.slice(0,3);
  const totalKeluar=keluar||1;
  body.innerHTML=`
  <div class="bs-kas-hero">
    <div class="bs-kas-hero-lbl">Arus Kas Periode</div>
    <div class="bs-kas-hero-val" style="color:${col}">${pfx}${rp(Math.abs(kas))}</div>
    <div class="bs-kas-hero-sub">${fmtDateShort(d.startDate)} – ${fmtDateShort(d.endDate)}</div>
  </div>
  <div class="bs-kas-pills">
    <div class="bs-kas-pill">
      <div class="bs-kas-pill-lbl">Masuk</div>
      <div class="bs-kas-pill-val" style="color:var(--grn)">${rpShort(masuk)}</div>
    </div>
    <div class="bs-kas-pill">
      <div class="bs-kas-pill-lbl">Keluar</div>
      <div class="bs-kas-pill-val" style="color:var(--red)">${rpShort(keluar)}</div>
    </div>
    <div class="bs-kas-pill">
      <div class="bs-kas-pill-lbl">Sisa Hari</div>
      <div class="bs-kas-pill-val">${sisa} hari</div>
    </div>
  </div>
  <div class="bs-kas-rows">
    <div class="bs-kas-row">
      <div class="bs-kas-row-lbl">Rata² Budget/Hari</div>
      <div class="bs-kas-row-val" style="color:${kasPos?'#fbbf24':'var(--red)'}">${kasPos?rpShort(avgBudget):'Over'}</div>
    </div>
    <div class="bs-kas-row">
      <div class="bs-kas-row-lbl">Hemat dari Pemasukan</div>
      <div class="bs-kas-row-val" style="color:${col}">${masuk>0?Math.round(kas/masuk*100):0}%</div>
    </div>
    ${top3.length?`<div style="font-size:0.6rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px">Top Pengeluaran</div>
    ${top3.map(k=>`<div class="bs-kas-row">
      <div class="bs-kas-row-lbl">${k.kategori}</div>
      <div class="bs-kas-row-val" style="color:var(--red)">${rpShort(k.nominal)} <span style="color:var(--tx3);font-size:0.6rem">(${Math.round(k.nominal/totalKeluar*100)}%)</span></div>
    </div>`).join('')}`:''}
  </div>`;
}

// ═══ POPUP: BUD-ITEM KATEGORI ═══
function openBudItemDetail(kat){
  const t=document.getElementById('bsTitle');
  if(t)t.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"/></svg> ${kat}`;
  document.getElementById('bsOverlay').classList.add('open');
  const body=document.getElementById('bsBody');
  const{startDate,endDate}=getActivePeriodResolved();
  const sd=new Date(startDate);sd.setHours(0,0,0,0);
  const ed=new Date(endDate);ed.setHours(23,59,59,999);
  const txs=allRows.filter(r=>{
    const d=new Date(r.tanggal);
    return d>=sd&&d<=ed&&r.jenis==='Pengeluaran'&&r.kategori===kat;
  }).sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  const total=txs.reduce((s,r)=>s+r.nominal,0);
  const bsdKey=getBudgetMonthKey(new Date(startDate).getFullYear(),new Date(startDate).getMonth());
  const budgets=getBudgetsForMonth(bsdKey);
  const budget=budgets[kat]||0;
  const hasBudget=budget>0;
  const pct=hasBudget?Math.min(Math.round(total/budget*100),999):null;
  const sisa=hasBudget?budget-total:null;
  const over=hasBudget&&total>budget;
  // Hero color
  const heroGrad=over?'linear-gradient(135deg,#7f1d1d,#dc2626)'
    :pct>=alertPct?'linear-gradient(135deg,#78350f,#d97706)'
    :'linear-gradient(135deg,#14532d,#16a34a)';
  const days=[...new Set(txs.map(r=>r.tanggal))].length;
  const avgHariKat=days>0?Math.round(total/days):0;
  body.innerHTML=`
  <div class="bs-bud-hero" style="background:${hasBudget?heroGrad:'linear-gradient(135deg,#1e1b4b,#4c1d95)'}">
    <div class="bs-bud-hero-top">
      <div class="bs-bud-hero-name">${kat}</div>
      ${hasBudget?`<div class="bs-bud-hero-pct">${pct}%</div>`:''}
    </div>
    ${hasBudget?`<div class="bs-bud-bar-wrap"><div class="bs-bud-bar-fill" id="budBarFill" style="width:0%;background:rgba(255,255,255,0.9)" data-w="${Math.min(pct,100)}"></div></div>`:''}
    <div class="bs-bud-hero-amts">
      <span>${rp(total)} terpakai</span>
      ${hasBudget?`<span>dari ${rp(budget)}</span>`:''}
    </div>
  </div>
  <div class="bs-bud-stats">
    <div class="bs-bud-stat">
      <div class="bs-bud-stat-lbl">Jumlah Transaksi</div>
      <div class="bs-bud-stat-val">${txs.length}x</div>
    </div>
    <div class="bs-bud-stat">
      <div class="bs-bud-stat-lbl">Rata²/Hari Aktif</div>
      <div class="bs-bud-stat-val">${rpShort(avgHariKat)}</div>
    </div>
    ${hasBudget?`<div class="bs-bud-stat">
      <div class="bs-bud-stat-lbl">Sisa Budget</div>
      <div class="bs-bud-stat-val" style="color:${over?'var(--red)':'var(--grn)'}">${over?'−':'+'}${rpShort(Math.abs(sisa))}</div>
    </div>
    <div class="bs-bud-stat">
      <div class="bs-bud-stat-lbl">Status</div>
      <div class="bs-bud-stat-val" style="color:${over?'var(--red)':pct>=alertPct?'#fbbf24':'var(--grn)'}">${over?'Over Budget':pct>=alertPct?'Hampir Habis':'Aman'}</div>
    </div>`:`<div class="bs-bud-stat">
      <div class="bs-bud-stat-lbl">Hari Aktif</div>
      <div class="bs-bud-stat-val">${days} hari</div>
    </div><div class="bs-bud-stat"></div>`}
  </div>
  ${txs.length?`<div style="font-size:0.6rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Riwayat Transaksi</div>
  <div class="bs-bud-txlist">${txs.slice(0,15).map(r=>`<div class="bs-bud-tx">
    <div class="bs-bud-tx-left">
      <div class="bs-bud-tx-tgl">${formatTgl(r.tanggal)}</div>
      ${r.detail?`<div class="bs-bud-tx-det">${r.detail}</div>`:''}
    </div>
    <div class="bs-bud-tx-nom">−${rp(r.nominal)}</div>
  </div>`).join('')}${txs.length>15?`<div style="text-align:center;font-size:0.65rem;color:var(--tx3);padding:4px">+${txs.length-15} transaksi lainnya</div>`:''}</div>`:''}`;
  setTimeout(()=>{const b=document.getElementById('budBarFill');if(b)b.style.width=b.dataset.w+'%'},100);
}

// ═══ POPUP: RATA² BUDGET ═══
function openBudgetRataDetail(){}

// ═══ POPUP: STRUK TRANSAKSI ═══
function openStrukDetail(rowIdx){
  try{
  if(editMode)return; // jangan popup kalau edit mode aktif
  const r=allRows.find(x=>x.rowIndex===rowIdx);if(!r)return;
  const t=document.getElementById('bsTitle');
  if(t)t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/></svg> Detail Transaksi';
  document.getElementById('bsOverlay').classList.add('open');
  const body=document.getElementById('bsBody');
  const isIn=r.jenis==='Pemasukan';
  const cls=isIn?'inc':'spd';
  const arr=isIn?'↓':'↑';
  // Kategori icon (ambil emoji jika ada di depan)
  const katParts=r.kategori.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*(.*)/u);
  const katIco=katParts?katParts[1]:'📋';
  const katName=katParts?katParts[2]:r.kategori;
  // Cari semua tx hari yang sama untuk konteks
  const sameDayTxs=allRows.filter(x=>x.tanggal===r.tanggal&&x.rowIndex!==rowIdx);
  const dayNet=allRows.filter(x=>x.tanggal===r.tanggal).reduce((s,x)=>x.jenis==='Pemasukan'?s+x.nominal:s-x.nominal,0);
  const rows=[
    {lbl:'Tanggal',val:formatTgl(r.tanggal),hl:true},
    {lbl:'Kategori',val:r.kategori,hl:true},
    r.detail?{lbl:'Keterangan',val:r.detail,hl:true}:null,
    r.metode?{lbl:'Metode',val:r.metode}:null,
    r.pembayaran?{lbl:'Rekening',val:r.pembayaran}:null,
    r.bulan?{lbl:'Bulan',val:r.bulan}:null,
    {lbl:'Kas Hari Ini',val:`${dayNet>=0?'+':'−'}${rp(Math.abs(dayNet))}`,hl:false},
    {lbl:'Tx Lain Hari Ini',val:sameDayTxs.length?`${sameDayTxs.length} transaksi`:'Tidak ada'},
  ].filter(Boolean);
  body.innerHTML=`<div class="bs-struk">
    <div class="bs-struk-header">
      <div class="bs-struk-header-ico">${katIco}</div>
      <div class="bs-struk-header-kat">${katName}</div>
      <span class="bs-struk-header-jenis ${cls}">${isIn?IC.in:IC.out} ${r.jenis}</span>
    </div>
    <div class="bs-struk-nom">
      <div class="bs-struk-nom-lbl">Nominal</div>
      <div class="bs-struk-nom-val ${cls}">${arr} ${rp(r.nominal)}</div>
    </div>
    <div class="bs-struk-rows">
      ${rows.map(row=>`<div class="bs-struk-row">
        <div class="bs-struk-row-lbl">${row.lbl}</div>
        <div class="bs-struk-row-val${row.hl?' hl':''}">${row.val}</div>
      </div>`).join('')}
    </div>
    <div class="bs-struk-footer">
      <div class="bs-struk-footer-txt">SE_REAL · ${new Date().toLocaleDateString('id-ID')}</div>
    </div>
  </div>`;
  }catch(e){console.error('struk error',e)}
}


// ═══════════════════════════════════════════════
// AI SCAN — Gemini Image Parser
// ═══════════════════════════════════════════════

let aiScanAbort = false;
let aiScanCooldown = 0;      // sisa detik cooldown
let aiScanCooldownTimer = null;

function startAiCooldown(seconds) {
  aiScanCooldown = seconds;
  clearInterval(aiScanCooldownTimer);
  updateAiScanBtn();
  aiScanCooldownTimer = setInterval(() => {
    aiScanCooldown--;
    updateAiScanBtn();
    if (aiScanCooldown <= 0) {
      clearInterval(aiScanCooldownTimer);
      aiScanCooldown = 0;
      updateAiScanBtn();
    }
  }, 1000);
}

function updateAiScanBtn() {
  const btn = document.getElementById('btnAiScan');
  if (!btn) return;
  if (aiScanCooldown > 0) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor  = 'not-allowed';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Tunggu ${aiScanCooldown}d`;
  } else {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.cursor  = '';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/></svg>Scan AI`;
  }
}

function triggerAiScan() {
  if (aiScanCooldown > 0) return;
  document.getElementById('aiImageInput').value = '';
  document.getElementById('aiImageInput').click();
}

function cancelAiScan() {
  aiScanAbort = true;
  closeAiScanOv();
}

function closeAiScanOv() {
  const ov = document.getElementById('aiScanOv');
  if (ov) ov.classList.remove('open');
}

function openAiScanOv(imgSrc) {
  aiScanAbort = false;
  const ov    = document.getElementById('aiScanOv');
  const prev  = document.getElementById('aiScanPreview');
  const lbl   = document.getElementById('aiScanLbl');
  const cancel= document.getElementById('aiScanCancel');
  const line  = document.getElementById('aiScanLine');

  prev.src = imgSrc;
  lbl.textContent = 'Menganalisis gambar...';
  cancel.style.display = 'block';
  line.style.animationPlayState = 'running';
  ov.classList.add('open');
}

function setAiScanStatus(msg) {
  const lbl = document.getElementById('aiScanLbl');
  if (lbl) lbl.textContent = msg;
}

async function handleAiImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('File harus berupa gambar','err'); return; }

  // Convert to base64
  const base64 = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = () => rej(new Error('Gagal baca gambar'));
    reader.readAsDataURL(file);
  });

  // Show scan overlay with preview
  const previewUrl = URL.createObjectURL(file);
  openAiScanOv(previewUrl);

  try {
    setAiScanStatus('Menganalisis gambar...');

    const res = await fetch(`${API_URL}/api/parse-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType: file.type,
        categories: (dbOpts.kategoris || []),
        banks: (dbOpts.banks || [])
      })
    });

    if (aiScanAbort) return;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}`);
    }

    setAiScanStatus('Memproses hasil...');
    const data = await res.json();

    if (aiScanAbort) return;

    // Brief success pause so user sees the scan complete
    await new Promise(r => setTimeout(r, 600));
    closeAiScanOv();
    URL.revokeObjectURL(previewUrl);

    // Fill form fields from AI result
    fillFormFromAI(data);
    toast(`${IC.ok.replace('width:20px;height:20px','width:13px;height:13px;vertical-align:-2px;margin-right:3px')} Data berhasil di-scan!`, 'ok');

  } catch (e) {
    if (aiScanAbort) return;
    closeAiScanOv();
    URL.revokeObjectURL(previewUrl);
    toast('Scan gagal: ' + e.message, 'err');
    console.error('[AI Scan]', e);
    // Cooldown: 503 high demand → 30d, rate limit → 15d, lainnya → 10d
    const msg = e.message || '';
    const cd  = msg.includes('high demand') || msg.includes('503') ? 30
               : msg.includes('rate-limit') || msg.includes('429') ? 15 : 10;
    startAiCooldown(cd);
  }
}

function fillFormFromAI(data) {
  // Tanggal
  if (data.tanggal) {
    try {
      // Normalize to YYYY-MM-DD
      let tgl = data.tanggal;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(tgl)) {
        const [d,m,y] = tgl.split('/');
        tgl = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      }
      document.getElementById('inTgl').value = tgl;
      syncBulan('in');
    } catch(e) { /* keep default date */ }
  }

  // Jenis
  if (data.jenis) {
    const jenisEl = document.getElementById('inJenis');
    const mapped = data.jenis.toLowerCase().includes('masuk') ? 'Pemasukan' : 'Pengeluaran';
    jenisEl.value = mapped;
    onJenisChange('in');

    // Set kategori setelah onJenisChange populate options
    setTimeout(() => {
      if (data.kategori) {
        const katEl  = document.getElementById('inKat');
        const opts   = Array.from(katEl.options);
        // Strip semua non-alphanumeric untuk perbandingan
        const stripFn = s => s.replace(/[^\w\s]/gu, '').replace(/\s+/g, ' ').toLowerCase().trim();
        const aiKat  = stripFn(data.kategori);

        // 1. Exact match setelah strip
        let match = opts.findIndex(o => stripFn(o.value) === aiKat);

        // 2. Contains match
        if (match < 0) match = opts.findIndex(o => {
          const v = stripFn(o.value);
          return v.includes(aiKat) || aiKat.includes(v);
        });

        // 3. Kata pertama match
        if (match < 0) {
          const firstWord = aiKat.split(' ')[0];
          if (firstWord.length > 2)
            match = opts.findIndex(o => stripFn(o.value).includes(firstWord));
        }

        if (match >= 0) katEl.selectedIndex = match;
      }
    }, 150);
  }

  // Nominal
  if (data.nominal) {
    const nomRaw = String(data.nominal).replace(/[^0-9]/g,'');
    const nomEl  = document.getElementById('inNom');
    nomEl.value  = nomRaw ? Number(nomRaw).toLocaleString('id-ID') : '';
  }

  // Metode
  if (data.metode) {
    const metodeEl = document.getElementById('inMetode');
    const ml = data.metode.toLowerCase();
    if (ml.includes('cash') || ml.includes('tunai')) metodeEl.value = 'Cash';
    else if (ml.includes('qris') || ml.includes('qr')) metodeEl.value = 'QRIS';
    else if (ml.includes('transfer') || ml.includes('debit') || ml.includes('kredit')) metodeEl.value = 'Transfer';
    onMetodeChange('in');

    // Bank
    if (data.bank) {
      setTimeout(() => {
        const bankEl  = document.getElementById('inBank');
        const opts    = Array.from(bankEl.options);
        const stripFn = s => s.replace(/[^\w\s]/gu, '').replace(/\s+/g, ' ').toLowerCase().trim();
        const aiBank  = stripFn(data.bank);

        // Exact match dulu
        let match = opts.findIndex(o => stripFn(o.value) === aiBank);
        // Contains match
        if (match < 0) match = opts.findIndex(o => {
          const v = stripFn(o.value);
          return v.includes(aiBank) || aiBank.includes(v);
        });
        // Kata pertama
        if (match < 0) {
          const fw = aiBank.split(' ')[0];
          if (fw.length > 1) match = opts.findIndex(o => stripFn(o.value).includes(fw));
        }
        if (match >= 0) bankEl.selectedIndex = match;
      }, 350);
    }
  }

  // Keterangan
  if (data.keterangan) {
    document.getElementById('inKet').value = data.keterangan;
  }
}
