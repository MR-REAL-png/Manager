function initPinOverlay(){
  const session=localStorage.getItem('mm_session');
  if(session){
    try{
      const s=JSON.parse(session);
      if(s.username){
        localStorage.setItem('mm_uid',s.username);
        if(s.group_id)localStorage.setItem('mm_group_id',s.group_id);
        if(s.role)localStorage.setItem('mm_role',s.role);
        hidePinOverlay();
        return;
      }
    }catch(e){}
  }
  showPinOverlay();
}

function showPinOverlay(){
  const ov=document.getElementById('pinOverlay');
  if(ov){ov.style.display='flex';ov.classList.add('visible');ov.classList.remove('hidden');}
  pinBuffer='';
  initPinStars();
  updatePinDatetime();
  if(!window._pinDatetimeTimer)window._pinDatetimeTimer=setInterval(updatePinDatetime,1000);
  pinMode='login';
  renderPinDots();
  document.getElementById('pinSubtitle').textContent='Masukkan PIN';
  document.getElementById('pinNameWrap').style.display='none';
  document.getElementById('pinSwitch').textContent='Belum punya akun? Daftar';
  document.getElementById('pinError').textContent='';
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
  if(pinBuffer.length===6){setTimeout(()=>pinSubmit(),120);}
}

function pinDel(){
  if(!pinBuffer.length)return;
  pinBuffer=pinBuffer.slice(0,-1);
  renderPinDots();
  document.getElementById('pinError').textContent='';
}

function renderPinDots(){
  const dots=document.querySelectorAll('#pinDots span');
  dots.forEach((d,i)=>{d.classList.toggle('filled',i<pinBuffer.length);});
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
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({pin:pinBuffer})
      });
      const json=await res.json();
      if(json.success){
        // Simpan session + group info
        localStorage.setItem('mm_session',JSON.stringify({
          username:json.username,
          group_id:json.group_id||null,
          role:json.role||'member'
        }));
        localStorage.setItem('mm_uid',json.username);
        if(json.group_id)localStorage.setItem('mm_group_id',json.group_id);
        else localStorage.removeItem('mm_group_id');
        localStorage.setItem('mm_role',json.role||'member');
        hidePinOverlay();
        updateProfileUI();
        applyRoleUI(json.role||'member');
        await pullSettings();
        initRealtimeSync();
        initRealtimeSync();
        // Load anggota group untuk badge warna
        loadGroupMembers();
      }else{
        pinShakeError(json.error||'PIN salah');
      }
    }catch(e){
      pinShakeError('Gagal terhubung ke server');
    }
  }
  else if(pinMode==='register'){
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
    const name=document.getElementById('pinNameInput').value.trim()||'User';
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=register`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username:name,pin:pinRegisterPin})
      });
      const json=await res.json();
      if(json.success){
        localStorage.setItem('mm_session',JSON.stringify({
          username:json.username,
          group_id:null,
          role:'member'
        }));
        localStorage.setItem('mm_uid',json.username);
        localStorage.setItem('mm_role','member');
        localStorage.removeItem('mm_group_id');
        hidePinOverlay();
        updateProfileUI();
        applyRoleUI('member');
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
  const el=document.getElementById('settUserLogin');
  if(el)el.textContent=uid;
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
  localStorage.removeItem('mm_group_id');
  localStorage.removeItem('mm_role');
  showPinOverlay();
}

// ═══ HELPER ROLE & GROUP ═══

function getUserUID(){
  let uid=localStorage.getItem('mm_uid');
  if(!uid){
    uid='uid_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
    localStorage.setItem('mm_uid',uid);
  }
  return uid;
}

function getUserRole(){
  return localStorage.getItem('mm_role')||'member';
}

function getUserGroupId(){
  return localStorage.getItem('mm_group_id')||null;
}

function isViewer(){
  return getUserRole()==='viewer';
}

// Terapkan UI berdasarkan role
function applyRoleUI(role){
  const isView=role==='viewer';
  // Sembunyikan tombol + (FAB) untuk viewer
  const btnAdd=document.getElementById('btnAdd');
  if(btnAdd)btnAdd.style.display=isView?'none':'flex';
  // Tampilkan tab Dompet di bottom nav untuk viewer
  const nbDompet=document.getElementById('nb-dompet');
  if(nbDompet)nbDompet.style.display=isView?'flex':'none';
  // Class body untuk CSS targeting
  document.body.classList.toggle('viewer-mode',isView);
  // Update label group di settings
  if(typeof updateGroupStatusLabel==='function')updateGroupStatusLabel();
}

// ═══ SETTINGS SYNC ═══

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

function applySettings(data){
  if(!data)return;
  if(data.mm_budgets_v2)  localStorage.setItem('mm_budgets_v2',  JSON.stringify(data.mm_budgets_v2));
  if(data.mm_custom_kats) localStorage.setItem('mm_custom_kats', JSON.stringify(data.mm_custom_kats));
  if(data.mm_custom_banks)localStorage.setItem('mm_custom_banks',JSON.stringify(data.mm_custom_banks));
  if(data.mm_fixed_cats)  localStorage.setItem('mm_fixed_cats',  JSON.stringify(data.mm_fixed_cats));
  if(data.mm_periode)     localStorage.setItem('mm_periode',     JSON.stringify(data.mm_periode));
  if(data.mm_settings)    localStorage.setItem('mm_settings',    JSON.stringify(data.mm_settings));
  if(data.mm_t)           localStorage.setItem('mm_t',           data.mm_t);
  const s=data.mm_settings||{};
  if(s.notifEnabled!==undefined)notifEnabled=s.notifEnabled;
  if(s.alertPct)alertPct=s.alertPct;
  if(s.adminPassword)adminPassword=s.adminPassword;
  if(data.mm_t)setTheme(data.mm_t,false);
}

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
