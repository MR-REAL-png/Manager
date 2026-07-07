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
    s=new Date(eff);s.setDate(s.getDate()+1);
    const nm=m===11?0:m+1,ny=m===11?y+1:y;
    e=getEffective25(ny,nm);
  } else {
    const pm=m===0?11:m-1,py=m===0?y-1:y;
    s=new Date(getEffective25(py,pm));s.setDate(s.getDate()+1);
    e=new Date(eff);
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
      if(r.pembayaran&&!r.pembayaran.includes('Cash'))banks.push(r.pembayaran);
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
    return dbOpts;
  }catch(e){console.error('fetchDBOptions:',e)}
}

// ═══ CLOCK ═══

// ═══ FORMAT & UTILS ═══
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
  return Number((document.getElementById(id).value || '0').replace(/\./g, '').replace(/[^0-9]/g, '')) || 0;
}
function safeHTML(s){if(typeof s==='string'&&s.includes('<svg')){return s}const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.innerHTML=safeHTML(msg);el.className='toast show '+type;
  clearTimeout(toastT);toastT=setTimeout(()=>{el.className='toast'},3200);
}

// ═══ SALDO DOMPET (shared logic — dipakai dompet.js & modals.js agar selalu sinkron) ═══
function getSaldoAwalMap(){
  try{return JSON.parse(localStorage.getItem('mm_saldo_awal')||'{}')}catch(e){return{}}
}
function setSaldoAwal(bank,nominal){
  const m=getSaldoAwalMap();
  m[bank]=Number(nominal)||0;
  localStorage.setItem('mm_saldo_awal',JSON.stringify(m));
  return m;
}
// rows: allRows (semua transaksi), transfers: hasil fetchTransfers()
// return { banks:[...], saldoMap:{bank:saldo}, totalSaldo:number }
function hitungSaldoDompet(rows,transfers){
  const BUKAN_BANK=['cash','transfer','qris'];
  const saldoAwalMap=getSaldoAwalMap();
  const banks=[...new Set((rows||[]).map(r=>r.pembayaran).filter(Boolean).filter(b=>!BUKAN_BANK.includes(b.trim().toLowerCase())))].sort();
  const saldoMap={};
  banks.forEach(b=>saldoMap[b]=saldoAwalMap[b]||0);
  (rows||[]).forEach(r=>{
    if(!r.pembayaran||!saldoMap.hasOwnProperty(r.pembayaran))return;
    if(r.jenis==='Pemasukan')saldoMap[r.pembayaran]+=r.nominal;
    else if(r.jenis==='Pengeluaran')saldoMap[r.pembayaran]-=r.nominal;
  });
  (transfers||[]).forEach(t=>{
    if(saldoMap.hasOwnProperty(t.dari))saldoMap[t.dari]-=t.nominal;
    if(saldoMap.hasOwnProperty(t.ke))saldoMap[t.ke]+=t.nominal;
  });
  const totalSaldo=banks.reduce((s,b)=>s+saldoMap[b],0);
  return{banks,saldoMap,totalSaldo};
}

// ═══ DIAGNOSTIK: TRANSAKSI SALAH TANGGAL ═══
// Dari HP: buka Settings → "Cek Salah Tanggal" (pakai modal UI)
// Dari laptop/console: cekTransaksiSalahTanggal() untuk lihat detail di console
function cekTransaksiSalahTanggal(silent){
  if(!allRows.length){if(!silent)console.warn('allRows kosong — buka halaman Data/Dashboard dulu biar data ke-load');return null;}

  // 1) Ringkasan per bulan: jumlah transaksi & total, buat lihat bulan yang janggal
  const perBulan={};
  allRows.forEach(r=>{
    const key=r.tanggal.slice(0,7); // YYYY-MM
    if(!perBulan[key])perBulan[key]={count:0,masuk:0,keluar:0};
    perBulan[key].count++;
    if(r.jenis==='Pemasukan')perBulan[key].masuk+=r.nominal;
    else if(r.jenis==='Pengeluaran')perBulan[key].keluar+=r.nominal;
  });

  // 2) Kandidat: transaksi di tanggal 1-3 atau 28-31 (paling sering "kececer" beda bulan)
  const kandidatTanggalBatas=allRows.filter(r=>{
    const day=Number(r.tanggal.slice(8,10));
    return day<=3||day>=28;
  }).sort((a,b)=>a.tanggal.localeCompare(b.tanggal));

  // 3) Kandidat: mismatch timezone — cek apakah parsing Date geser hari
  const kandidatTimezone=allRows.filter(r=>{
    const iso=new Date(r.tanggal+'T00:00:00').toISOString().slice(0,10);
    return iso!==r.tanggal;
  });

  if(!silent){
    console.log('=== RINGKASAN PER BULAN ===');
    console.table(perBulan);
    console.log(`=== KANDIDAT DI TANGGAL BATAS (1-3 atau 28-31): ${kandidatTanggalBatas.length} transaksi ===`);
    console.table(kandidatTanggalBatas.map(r=>({id:r.id,tanggal:r.tanggal,jenis:r.jenis,kategori:r.kategori,nominal:r.nominal,rekening:r.pembayaran,catatan:r.detail})));
    console.log(`=== KANDIDAT MISMATCH TIMEZONE: ${kandidatTimezone.length} transaksi ===`);
    if(kandidatTimezone.length)console.table(kandidatTimezone.map(r=>({id:r.id,tanggal:r.tanggal,jenis:r.jenis,nominal:r.nominal})));
    toast(`Cek selesai — ${kandidatTanggalBatas.length} kandidat tanggal batas, ${kandidatTimezone.length} mismatch timezone. Lihat console (F12).`,'ok');
  }

  return{perBulan,kandidatTanggalBatas,kandidatTimezone};
}

// ═══ POPUP: HERO KAS ═══
