const API_URL='https://manager-khaki-ten.vercel.app'; // Vercel → Supabase
const LOGO_URL='https://raw.githubusercontent.com/MR-REAL-png/Manager/main/logo.png';
const MOS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const CHART_COLORS=['#a78bfa','#f472b6','#60a5fa','#fb923c','#34d399','#818cf8','#fbbf24','#4ade80','#f87171','#e879f9','#38bdf8','#a3e635'];
const MONTH_COLORS=['#818cf8','#c084fc','#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#4ade80','#fbbf24','#e879f9','#38bdf8','#f87171'];
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
    img.onerror=()=>{el.textContent='💰';el.style.fontSize='1.1rem';el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center'};
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
  allRows=[];toast('🔄 Memuat ulang...');
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
  document.getElementById('d-kas').textContent='⌛';
  document.getElementById('d-masuk').textContent='⌛';
  document.getElementById('d-keluar').textContent='⌛';
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
    renderChartKat(byKatArr);renderBudget(byKatArr);renderChartHarian(rows);
    updatePeriodUI();
    if(notifEnabled)checkBudgetAlerts(byKatArr);
  }catch(e){toast('❌ Gagal load: '+e.message,'err');console.error(e)}
}

function renderChartKat(byCat){
  const wrap=document.getElementById('chartKat')?.parentElement;if(!wrap)return;
  if(chartKat){try{chartKat.destroy()}catch(e){}chartKat=null;}
  if(!byCat.length){wrap.innerHTML='<div class="empty"><div class="ei">📊</div><p>Belum ada pengeluaran</p></div>';return}
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
  // Kelompokkan pengeluaran per hari
  const byDay={};
  rows.filter(r=>r.jenis==='Pengeluaran').forEach(r=>{
    byDay[r.tanggal]=(byDay[r.tanggal]||0)+r.nominal;
  });
  // Urutkan tanggal
  const sorted=Object.keys(byDay).sort();
  if(!sorted.length){wrap.innerHTML='<div class="empty"><div class="ei">📈</div><p>Belum ada data harian</p></div>';return}
  wrap.innerHTML='<canvas id="chartHarian"></canvas>';
  const ctx=document.getElementById('chartHarian').getContext('2d');
  const isOcean=document.documentElement.getAttribute('data-theme')==='ocean';
  const tc='rgba(255,255,255,0.5)';
  const labels=sorted.map(d=>{const p=d.split('-');return`${p[2]}/${p[1]}`});
  const values=sorted.map(d=>byDay[d]);
  const lineColor=isOcean?'#60a5fa':'#a78bfa';
  const pointColor=isOcean?'#38bdf8':'#f472b6';
  // Gradient fill untuk area di bawah garis
  const gradient=ctx.createLinearGradient(0,0,0,200);
  gradient.addColorStop(0,isOcean?'rgba(96,165,250,0.35)':'rgba(167,139,250,0.35)');
  gradient.addColorStop(1,isOcean?'rgba(96,165,250,0.02)':'rgba(167,139,250,0.02)');
  chartHarian=new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Pengeluaran',
        data:values,
        fill:true,
        backgroundColor:gradient,
        borderColor:lineColor,
        borderWidth:2,
        pointBackgroundColor:pointColor,
        pointBorderColor:lineColor,
        pointRadius:4,
        pointHoverRadius:6,
        pointBorderWidth:1.5,
        tension:0.4,
      }]
    },
    options:{
      responsive:true,
      animation:{duration:800,easing:'easeOutQuart'},
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>' '+rp(c.raw)}}
      },
      scales:{
        y:{
          ticks:{callback:v=>rpShort(v),color:tc,font:{size:9}},
          grid:{color:'rgba(255,255,255,0.06)'},
          border:{display:false}
        },
        x:{
          ticks:{color:tc,font:{size:9},maxRotation:45},
          grid:{display:false},
          border:{display:false}
        }
      }
    }
  });
}

function renderBudget(byCat){
  const el=document.getElementById('budgetList');
  if(!byCat.length){el.innerHTML='<div class="empty"><div class="ei">✅</div><p>Belum ada pengeluaran</p></div>';renderBudgetMonitor([]);return}
  const total=byCat.reduce((s,k)=>s+k.nominal,0);
  // Toggle Semua/Ringkas
  const btn=document.getElementById('btnToggleView');
  if(btn){btn.classList.toggle('on',komposisiRingkas);btn.textContent=komposisiRingkas?'📋 Semua':'🔢 Ringkas';}
  let tampil=byCat;
  if(komposisiRingkas&&byCat.length>5){
    const top5=byCat.slice(0,5);
    const lainNom=byCat.slice(5).reduce((s,k)=>s+k.nominal,0);
    tampil=[...top5,{kategori:'📦 Lainnya',nominal:lainNom}];
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

function renderBudgetMonitor(byCat){
  const el=document.getElementById('budgetMonitor');
  const secLbl=document.getElementById('bmonSecLbl');
  if(!el||!secLbl)return;
  const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
  const items=byCat.filter(k=>budgets[k.kategori]>0).map(k=>{
    const budget=budgets[k.kategori];
    const pct=Math.min(Math.round(k.nominal/budget*100),999);
    const cls=pct>=100?'bmon-over':pct>=alertPct?'bmon-warn':'bmon-ok';
    const barW=Math.min(pct,100);
    const over=pct>=100;
    return{k,budget,pct,cls,barW,over};
  });
  if(!items.length){el.style.display='none';secLbl.style.display='none';return}
  secLbl.style.display='';el.style.display='flex';
  el.innerHTML=items.map(({k,budget,pct,cls,barW,over},i)=>`
    <div class="bmon-item" style="animation-delay:${i*0.05}s">
      <div class="bmon-top">
        <span class="bmon-name">${k.kategori}</span>
        <span class="bmon-pct" style="color:${pct>=100?`var(--red)`:pct>=alertPct?`#fbbf24`:`var(--grn)`}">${pct}%${pct>=100?` 🚨`:pct>=alertPct?` ⚠️`:` ✅`}</span>
      </div>
      <div class="bmon-bar"><div class="bmon-fill ${cls}" style="width:0%" data-w="${barW}"></div></div>
      <div class="bmon-amts">
        <span class="${over?'over':''}">${rpShort(k.nominal)} terpakai</span>
        <span>dari ${rpShort(budget)}</span>
      </div>
    </div>`).join('');
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
    el.innerHTML='<div class="empty"><div class="ei">\u26a0\ufe0f</div><p>Gagal memuat data</p></div>';
    toast('\u274c Gagal load data: '+e.message,'err');console.error(e);
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
  if(!rows.length){el.innerHTML='<div class="empty"><div class="ei">📋</div><p>Belum ada data</p></div>';return}
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
      const eb=editMode?`<button class="edit-btn" onclick="openEdit(${r.rowIndex})">✏️ Edit</button>`:'';
      return`<div class="dc ${cls}" style="animation-delay:${(gi*0.05)+(ri*0.03)}s"><div class="dc-row1"><div><div class="dc-kat">${r.kategori}</div></div><div><div class="dc-nom ${cls}">${arr} ${rp(r.nominal)}</div><div class="dc-badge ${cls}">${isIn?'📥':'📤'} ${r.jenis}</div></div></div><div class="dc-tags">${r.pembayaran?`<span class="dtag">💳 ${r.pembayaran}</span>`:''} ${r.metode?`<span class="dtag">🏦 ${r.metode}</span>`:''} ${r.bulan?`<span class="dtag">📆 ${r.bulan}</span>`:''} ${eb}</div>${r.detail?`<div class="dc-ket">📝 ${r.detail}</div>`:''}</div>`;
    }).join('');
    return`<div class="date-group"><div class="dg-header"><div class="dg-dot"></div><span class="dg-date">📅 ${formatTgl(tgl)}</span><span class="dg-kas ${dk>=0?'g':'r'}">${dk>=0?'+':'−'}${rp(Math.abs(dk))}</span></div><div class="dg-cards">${cards}</div></div>`;
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
  }catch(e){toast('❌ Gagal load tabungan: '+e.message,'err');console.error(e)}
}

function renderTabList(data){
  const el=document.getElementById('tabList');
  if(!data.length){el.innerHTML='<div class="empty"><div class="ei">🏦</div><p>Belum ada data tabungan</p></div>';return}
  el.innerHTML=data.map((b,i)=>{
    const pct=b.target>0?Math.min(Math.round(b.tabungan/b.target*100),100):0;
    const done=b.target>0&&b.tabungan>=b.target;
    const color=MONTH_COLORS[MOS.indexOf(b.bulan)%MONTH_COLORS.length];
    return`<div class="tab-item" style="animation-delay:${i*0.05}s"><div class="tab-row"><span class="tab-mo">${done?'✅':'⬜'} ${b.bulan}</span><span class="tab-pc" style="color:${color}">${pct}%</span></div><div class="tab-bar"><div class="tab-bar-fill" style="width:0%;background:${color}" data-w="${pct}"></div></div><div class="tab-amts"><div class="tab-amt-item"><div class="tab-amt-lbl">Tabungan</div><div class="tab-amt-val">${rpShort(b.tabungan)}</div></div><div class="tab-amt-item"><div class="tab-amt-lbl">Target</div><div class="tab-amt-val">${rpShort(b.target)}</div></div></div></div>`;
  }).join('');
  setTimeout(()=>{el.querySelectorAll('.tab-bar-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
}

function renderChartTab(data){
  const ctx=document.getElementById('chartTab')?.getContext('2d');if(!ctx)return;
  if(chartTab)chartTab.destroy();if(!data.length)return;
  const tc='rgba(255,255,255,0.5)';
  chartTab=new Chart(ctx,{type:'bar',data:{labels:data.map(b=>b.bulan.slice(0,3)),datasets:[{label:'✅ Tabungan',data:data.map(b=>b.tabungan),backgroundColor:'rgba(52,211,153,0.6)',borderColor:'#34d399',borderWidth:2,borderRadius:6},{label:'🎯 Target',data:data.map(b=>b.target),type:'line',borderColor:'#a855f7',pointRadius:4,fill:false,tension:0.3,borderDash:[5,4]}]},options:{responsive:true,animation:{duration:800,easing:'easeOutQuart'},plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10},color:tc}}},scales:{y:{ticks:{callback:v=>'Rp '+(v/1e6).toFixed(1)+'jt',color:tc,font:{size:10}},grid:{color:'rgba(255,255,255,0.06)'},border:{display:false}},x:{ticks:{color:tc,font:{size:10}},grid:{display:false},border:{display:false}}}}});
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
  if(!total||fi<0||ti<0||ti<fi){toast('⚠️ Lengkapi form dulu','err');return}
  const count=ti-fi+1;
  const perBulan=Math.round(total/count);
  const btn=document.getElementById('btnSaveTgt');
  btn.disabled=true;btn.textContent='⌛ Menyimpan...';
  try{
    const existing=JSON.parse(localStorage.getItem('mm_targets')||'{}');
    for(let i=fi;i<=ti;i++){existing[MOS[i]]=perBulan;}
    localStorage.setItem('mm_targets',JSON.stringify(existing));
    toast('✅ Target tersimpan!','ok');
    loadTargetSett();
  }catch(e){toast('❌ Gagal simpan: '+e.message,'err')}
  finally{btn.disabled=false;btn.textContent='💾 Simpan Target'}
}

async function loadTargetSett(){
  const el=document.getElementById('tgtCurList');
  try{
    const targets=JSON.parse(localStorage.getItem('mm_targets')||'{}');
    const items=MOS.map(mo=>({bulan:mo,target:targets[mo]||0})).filter(m=>m.target>0);
    if(!items.length){el.innerHTML='<div class="empty"><div class="ei">🎯</div><p>Belum ada target tersimpan</p></div>';return}
    el.innerHTML=items.map((m,i)=>`<div class="tab-item" style="animation-delay:${i*0.05}s"><div class="tab-row"><span class="tab-mo">🎯 ${m.bulan}</span><span class="tab-pc" style="color:var(--grn)">${rpShort(m.target)}</span></div></div>`).join('');
  }catch(e){el.innerHTML='<div class="empty"><div class="ei">⚠️</div><p>Gagal baca target</p></div>'}
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
    chartRekap=new Chart(ctx,{type:'bar',data:{labels:bm.map(m=>m.bulan.slice(0,3)),datasets:[{label:'📥 Pemasukan',data:bm.map(m=>m.masuk),backgroundColor:'rgba(52,211,153,0.5)',borderColor:'#34d399',borderWidth:2,borderRadius:6},{label:'📤 Pengeluaran',data:bm.map(m=>m.keluar),backgroundColor:'rgba(248,113,113,0.5)',borderColor:'#f87171',borderWidth:2,borderRadius:6}]},options:{responsive:true,animation:{duration:800},plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10},color:tc}}},scales:{y:{ticks:{callback:v=>'Rp '+(v/1e6).toFixed(1)+'jt',color:tc,font:{size:10}},grid:{color:'rgba(255,255,255,0.06)'},border:{display:false}},x:{ticks:{color:tc,font:{size:10}},grid:{display:false},border:{display:false}}}}});
  }catch(e){toast('❌ Gagal load rekap','err')}
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
      const ico=bank.includes('BCA')?'🔵':bank.includes('Jago')?'🟡':bank.includes('Seabank')?'🟠':bank.includes('Dana')?'⚫️':'💵';
      return`<div class="bank-item" style="animation-delay:${i*0.05}s"><div class="bank-ico">${ico}</div><div class="bank-info"><div class="bank-name">${bank}</div><div class="bank-sub">${pct}% dari total</div><div class="bank-bar-wrap"><div class="bank-bar-fill" style="width:0%" data-w="${pct}"></div></div></div><div class="bank-val">${rpShort(val)}</div></div>`;
    }).join('');
    setTimeout(()=>{document.querySelectorAll('.bank-bar-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
  }catch(e){toast('❌ Gagal load metode','err')}
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
  document.getElementById('kalDetailDate').textContent=`📅 ${formatTgl(tgl)}`;
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
        if(pct>=100)notifications.push({type:'warn',ico:'🚨',title:`Budget ${kat} Jebol!`,msg:`Realisasi ${rp(total)} (${pct}%) dari budget ${rp(budget)}`,time:'Bulan ini'});
        else if(pct>=alertPct)notifications.push({type:'warn',ico:'⚠️',title:`Peringatan: ${kat}`,msg:`Sudah ${pct}% dari budget. Sisa ${rp(budget-total)}`,time:'Bulan ini'});
        else notifications.push({type:'ok',ico:'✅',title:`${kat} Aman`,msg:`${pct}% dari budget. Sisa ${rp(budget-total)}`,time:'Bulan ini'});
      }
    });
    const tk=rows.reduce((s,r)=>s+r.nominal,0),days=[...new Set(rows.map(r=>r.tanggal))].length;
    if(days>0)notifications.unshift({type:'info',ico:'📊',title:`Rata-rata Harian ${b}`,msg:`${rp(Math.round(tk/days))}/hari dari ${days} hari aktif`,time:'Update terbaru'});
    const{startDate,endDate}=getActivePeriodResolved();
    const sisa=getSisaHari(endDate);
    notifications.unshift({type:'info',ico:'📅',title:`Periode Aktif`,msg:`${fmtDateShort(startDate)} – ${fmtDateShort(endDate)} · Sisa ${sisa.total} hari`,time:'Real-time'});
    renderNotif();
    const badge=document.getElementById('notifBadge');
    if(badge)badge.style.display=notifications.some(n=>n.type==='warn')?'inline':'none';
  }catch(e){toast('❌ Gagal load notifikasi','err')}
}

function renderNotif(){
  const el=document.getElementById('notifList');
  if(!notifications.length){el.innerHTML='<div class="empty"><div class="ei">🔔</div><p>Belum ada notifikasi.<br>Set anggaran di Pengaturan.</p></div>';return}
  el.innerHTML=`<div class="notif-list">${notifications.map((n,i)=>`<div class="notif-item ${n.type}" style="animation-delay:${i*0.06}s"><div class="notif-ico">${n.ico}</div><div class="notif-body"><div class="notif-title">${n.title}</div><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div></div>`).join('')}</div>`;
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
  if(!tgl||!jenis||!kat||!nom){toast('⚠️ Lengkapi field wajib','err');return}
  document.getElementById('inLoad').style.display='flex';document.getElementById('btnSimpan').disabled=true;
  try{
    await sheetsAppend([[tgl,bulan,kat,Number(nom),metode,ket,bank,jenis]]);
    saveRecentKat(kat,jenis);toast('✅ Data tersimpan!','ok');closeOv(null,'ovInput');allRows=[];
    if(document.getElementById('pg-data').classList.contains('on'))loadData();
    if(document.getElementById('pg-dashboard').classList.contains('on'))loadDashboard();
  }catch(e){toast('❌ Gagal simpan: '+e.message,'err')}
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
    const btn=document.getElementById('editModeBtn');if(btn){btn.textContent='✏️ Edit';btn.classList.remove('on')}
    toast('🔒 Edit mode nonaktif','ok');renderCards(allRows);
  }
}

function doAdminLogin(){
  const pass=document.getElementById('adminPass').value;
  if(pass===adminPassword){
    isAdmin=true;editMode=true;closeOv(null,'ovAdmin');setTheme('ocean');
    const btn=document.getElementById('editModeBtn');if(btn){btn.textContent='✏️ Selesai';btn.classList.add('on')}
    toast('🔓 Edit mode aktif','ok');renderCards(allRows);
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
  if(!tgl||!j||!k||!n){toast('⚠️ Lengkapi field','err');return}
  document.getElementById('eLoad').style.display='flex';
  try{await sheetsUpdate(ri,[tgl,bln,k,Number(n),m,d,b,j]);toast('✅ Diupdate!','ok');closeOv(null,'ovEdit');allRows=[];loadData()}
  catch(e){toast('❌ Gagal update','err')}
  finally{document.getElementById('eLoad').style.display='none'}
}

async function doDelete(){
  showConfirm('🗑️ Hapus Transaksi','Yakin ingin menghapus data ini?',async()=>{
    const ri=Number(document.getElementById('editRow').value);
    document.getElementById('eLoad').style.display='flex';
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=delete`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:ri})});
      if(!res.ok){const e=await res.json();throw new Error(e.error||'Gagal hapus')}
      toast('🗑️ Dihapus','ok');closeOv(null,'ovEdit');allRows=[];loadData()
    }
    catch(e){toast('❌ Gagal hapus','err')}
    finally{document.getElementById('eLoad').style.display='none'}
  });
}

// ═══ PENGATURAN ═══
function loadSettings(){
  const s=JSON.parse(localStorage.getItem('mm_settings')||'{}');
  if(s.username){['settUsername','drawerUsername'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=s.username})}
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
  if(type==='nama'){title.textContent='✏️ Ubah Nama';const cur=document.getElementById('settUsername').textContent;body.innerHTML=`<div class="fr"><label>Nama Baru</label><input class="fi" type="text" id="settNamaInput" value="${cur}" placeholder="Nama kamu"></div>`}
  else if(type==='anggaran'){
    title.textContent='💰 Anggaran per Kategori';
    body.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
    document.getElementById('ovSett').classList.add('open');
    const renderAnggaran=()=>{
      const budgets=JSON.parse(localStorage.getItem('mm_budgets')||'{}');
      const kats=(dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income'));
      if(!kats.length){body.innerHTML='<div class="empty"><div class="ei">🏷️</div><p>Belum ada kategori.<br>Tambahkan transaksi pengeluaran dulu.</p></div>';return}
      body.innerHTML=`
        <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Set batas anggaran bulanan per kategori. Kosongkan untuk tidak ada limit.</p>
        ${kats.map((k,i)=>{
          const id='bgt_'+i;
          const val=budgets[k]||'';
          return`<div class="fr"><label>${k}</label><input class="fi" type="number" id="${id}" placeholder="Rp — tidak ada limit" value="${val}" min="0"></div>`;
        }).join('')}
        <div style="padding:8px 10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);border-radius:8px;font-size:0.7rem;color:var(--grn);margin-top:4px">
          💡 Budget akan muncul di notifikasi jika pengeluaran melebihi batas.
        </div>`;
    };
    // Pastikan data & kategori ter-load sebelum render
    (async()=>{
      try{
        if(!allRows.length)allRows=await fetchAllData();
        await fetchDBOptions();
        renderAnggaran();
      }catch(e){
        body.innerHTML='<div class="empty"><div class="ei">⚠️</div><p>Gagal memuat data.<br>Coba refresh dulu.</p></div>';
        console.error('anggaran modal error:',e);
      }
    })();
    return;
  }
    else if(type==='rekening'){
    title.textContent='🏦 Kelola Rekening';
    renderRekeningModal();
  }
  else if(type==='kategori'){
    title.textContent='🏷️ Kelola Kategori';
    renderKategoriModal();
  }
  else if(type==='katrata'){
    title.textContent='📊 Kategori Rata-rata';
    renderKatRataModal();
  }
  else if(type==='alertpct'){
    title.textContent='🔔 Batas Peringatan';
    body.innerHTML=`<div class="fr"><label>Persentase Peringatan (%)</label><input class="fi" type="number" id="alertPctInput" value="${alertPct}" min="50" max="100" placeholder="80"></div><p style="font-size:0.7rem;color:var(--tx3);margin-top:6px">Notifikasi muncul saat pengeluaran mencapai persentase ini dari budget.</p>`;
  }
  else if(type==='periode'){
    title.textContent='📅 Atur Periode';
    const{startDate,endDate}=getActivePeriodResolved();
    const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    body.innerHTML=`
      <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Atur periode kustom atau reset ke otomatis (tanggal 24/25 tiap bulan).</p>
      <div class="fr"><label>Dari Tanggal</label><input class="fi" type="date" id="periodeFrom" value="${fmt(startDate)}" onchange="autoFriday('periodeFrom')"></div>
      <div class="fr"><label>Sampai Tanggal</label><input class="fi" type="date" id="periodeTo" value="${fmt(endDate)}" onchange="autoFriday('periodeTo')"></div>
      <button class="btn-cx" style="width:100%;margin-top:8px" onclick="resetPeriode()">🔄 Reset ke Otomatis</button>`;
  }
  else if(type==='password'){
    title.textContent='🔒 Ganti Password';
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
      ${customBanks.map(b=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid var(--bdr2);border-radius:50px;font-size:0.75rem;color:var(--tx2)">${b}<button onclick="removeCustomBank('${b}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:0.8rem;padding:0 0 0 4px">✕</button></div>`).join('')}
    </div>`;
}

function renderKategoriModal(){
  const body=document.getElementById('settModalBody');
  const customKats=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px">Tambah kategori pengeluaran kustom.</p>
    <div class="fr"><label>Nama Kategori</label><input class="fi" type="text" id="newKatInput" placeholder="Contoh: Hobi, Olahraga"></div>
    <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
      ${customKats.map(k=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--glass);border:1px solid var(--bdr2);border-radius:50px;font-size:0.75rem;color:var(--tx2)">${k}<button onclick="removeCustomKat('${k}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:0.8rem;padding:0 0 0 4px">✕</button></div>`).join('')}
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
    if(!rows.length){toast('⚠️ Tidak ada data','err');return}
    const header='Tanggal,Bulan,Kategori,Nominal,Pembayaran,Detail,Metode,Jenis';
    const csv=rows.map(r=>`${r.tanggal},${r.bulan},"${r.kategori}",${r.nominal},"${r.pembayaran}","${r.detail||''}","${r.metode}",${r.jenis}`).join('\n');
    const blob=new Blob([header+'\n'+csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`transaksi_${from||'all'}_${to||'all'}.csv`;a.click();
    URL.revokeObjectURL(url);toast('✅ CSV diunduh!','ok');closeOv(null,'ovSett');return;
  }
  if(settModalType==='nama'){const val=document.getElementById('settNamaInput').value.trim();if(val){['settUsername','drawerUsername'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=val});const s=JSON.parse(localStorage.getItem('mm_settings')||'{}');s.username=val;localStorage.setItem('mm_settings',JSON.stringify(s));toast('✅ Nama diperbarui','ok')}}
  else if(settModalType==='anggaran'){
    (dbOpts.kategoris||[]).filter(k=>!k.toLowerCase().includes('income')).forEach((k,i)=>{const el=document.getElementById('bgt_'+i);if(el&&el.value)budgets[k]=Number(el.value);else if(el&&!el.value)delete budgets[k]});localStorage.setItem('mm_budgets',JSON.stringify(budgets));toast('✅ Anggaran disimpan','ok')}
  else if(settModalType==='alertpct'){const val=Number(document.getElementById('alertPctInput').value);if(val>=50&&val<=100){alertPct=val;document.getElementById('alertPctLabel').textContent=`${alertPct}% dari anggaran`;saveSettingsStorage();toast('✅ Batas diperbarui','ok')}}
  else if(settModalType==='periode'){
    const from=document.getElementById('periodeFrom')?.value;
    const to=document.getElementById('periodeTo')?.value;
    if(from&&to){localStorage.setItem('mm_periode',JSON.stringify({startDate:from,endDate:to}));updatePeriodUI();loadDashboard();toast('✅ Periode disimpan','ok')}
  }
  else if(settModalType==='katrata'){
    const checks=document.querySelectorAll('#settModalBody input[type=checkbox]');
    const excl=[];checks.forEach(c=>{if(c.checked)excl.push(c.value)});
    localStorage.setItem('mm_fixed_cats',JSON.stringify(excl));updateKatRataLabel();toast('✅ Kategori disimpan','ok');
  }
  else if(settModalType==='rekening'){
    const val=document.getElementById('newBankInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_banks')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_banks',JSON.stringify(a));fetchDBOptions();toast('✅ Rekening ditambah','ok')}else toast('⚠️ Sudah ada','err')}
  }
  else if(settModalType==='kategori'){
    const val=document.getElementById('newKatInput')?.value.trim();
    if(val){const a=JSON.parse(localStorage.getItem('mm_custom_kats')||'[]');if(!a.includes(val)){a.push(val);localStorage.setItem('mm_custom_kats',JSON.stringify(a));fetchDBOptions();toast('✅ Kategori ditambah','ok')}else toast('⚠️ Sudah ada','err')}
  }
  else if(settModalType==='password'){const old=document.getElementById('passOld').value,nw=document.getElementById('passNew').value,cf=document.getElementById('passConf').value;if(old!==adminPassword){toast('❌ Password lama salah','err');return}if(nw!==cf){toast('❌ Konfirmasi tidak cocok','err');return}if(nw.length<4){toast('❌ Min 4 karakter','err');return}adminPassword=nw;saveSettingsStorage();toast('✅ Password diperbarui','ok')}
  closeOv(null,'ovSett');
}

function exportCSV(){
  if(!allRows.length){toast('⚠️ Load data dulu','err');return}
  const body=document.getElementById('settModalBody');
  const title=document.getElementById('settModalTitle');
  settModalType='export';
  title.textContent='📊 Export Data CSV';
  const now=new Date();
  body.innerHTML=`
    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:10px">Pilih rentang tanggal export:</p>
    <div class="fr"><label>Dari Tanggal</label><input class="fi" type="date" id="expFrom" value="${now.getFullYear()}-01-01"></div>
    <div class="fr"><label>Sampai Tanggal</label><input class="fi" type="date" id="expTo" value="${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}"></div>
    <div class="fr"><label>Filter Bulan (opsional)</label>
      <select class="fs" id="expBulan"><option value="">Semua Bulan</option>${MOS.map(m=>`<option>${m}</option>`).join('')}</select>
    </div>
    <div style="margin-top:8px;padding:8px 10px;background:var(--glass);border-radius:8px;font-size:0.7rem;color:var(--tx2)">
      Total data tersedia: <strong style="color:#fff">${allRows.length} transaksi</strong>
    </div>`;
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
function toggleNotif(){notifEnabled=!notifEnabled;const nt=document.getElementById('notifToggle');if(nt)nt.classList.toggle('on',notifEnabled);saveSettingsStorage();toast(notifEnabled?'🔔 Notifikasi aktif':'🔕 Nonaktif','ok')}
function resetPeriode(){localStorage.removeItem('mm_periode');updatePeriodUI();closeOv(null,'ovSett');loadDashboard();toast('🔄 Periode direset ke otomatis','ok')}

// ═══ THEME ═══
function loadTheme(){setTheme(localStorage.getItem('mm_t')||'cosmic',false)}
function setTheme(t,save=true){
  document.documentElement.setAttribute('data-theme',t==='ocean'?'ocean':'cosmic');
  if(save)localStorage.setItem('mm_t',t);
  const isOcean=t==='ocean';
  ['themeToggle','drawerThemeToggle'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',isOcean)});
  const tl=document.getElementById('themeLabel');if(tl)tl.textContent=isOcean?'Ocean (Edit Mode)':'Cosmic (Default)';
  const dl=document.getElementById('drawerThemeLbl');if(dl)dl.textContent=`🎨 Tema: ${isOcean?'Ocean':'Cosmic'}`;
}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');setTheme(cur==='ocean'?'cosmic':'ocean')}

// ═══ AVG DETAIL ═══
function openAvgDetail(){
  document.getElementById('bsOverlay').classList.add('open');
  const body=document.getElementById('bsBody');
  if(!avgDetailData||!avgDetailData.byKategori.length){body.innerHTML='<div class="empty"><div class="ei">📊</div><p>Load dashboard dulu</p></div>';return}
  const d=avgDetailData,total=d.totalFleksibel,days=d.totalDays,maxN=Math.max(...d.byKategori.map(k=>k.nominal),1);
  body.innerHTML=`<div class="bs-sum"><div class="bs-sum-lbl">Total Pengeluaran Fleksibel</div><div class="bs-sum-val">${rp(total)}</div><div class="bs-sum-avg">Rata-rata ${rp(d.avgHarian)}/hari · ${days} hari aktif</div></div><div class="bs-kat-list">${d.byKategori.map(k=>{const avg=Math.round(k.nominal/days),pct=Math.round(k.nominal/maxN*100),share=total>0?Math.round(k.nominal/total*100):0;return`<div class="bs-kat"><div class="bs-kat-top"><span class="bs-kat-name">${k.kategori}</span><span class="bs-kat-total">${rp(k.nominal)}</span></div><div class="bs-kat-avg">Rata-rata ${rp(avg)}/hari · ${share}% dari total</div><div class="bs-kat-bar"><div class="bs-kat-fill" style="width:0%" data-w="${pct}"></div></div></div>`}).join('')}</div>`;
  setTimeout(()=>{body.querySelectorAll('.bs-kat-fill').forEach(e=>e.style.width=e.dataset.w+'%')},100);
}
function closeBs(){document.getElementById('bsOverlay').classList.remove('open')}

// ═══ MODAL ═══
function closeOv(e,id){if(!e||e.target.id===id)document.getElementById(id).classList.remove('open')}
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
function rpShort(v){v=Number(v)||0;if(v>=1e9)return(v/1e9).toFixed(1).replace(/\.0$/,'')+'M';if(v>=1e6)return(v/1e6).toFixed(1).replace(/\.0$/,'')+'jt';if(v>=1e3)return(v/1e3).toFixed(0)+'rb';return String(v)}
function formatTgl(s){if(!s)return'—';const p=s.split('-');if(p.length!==3||Number(p[0])<1990)return'—';return`${p[2]}/${p[1]}/${p[0]}`}
function pad(n){return String(n).padStart(2,'0')}
function getLocalDate(){const d=new Date();return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function groupBy(arr,key){return arr.reduce((g,r)=>{(g[r[key]]=g[r[key]]||[]).push(r);return g},{})}
function countUp(id,target,prefix=''){
  const el=document.getElementById(id);if(!el)return;
  const steps=40,step=900/steps;let cur=0;
  const timer=setInterval(()=>{cur+=target/steps;if(cur>=target){cur=target;clearInterval(timer)}el.textContent=prefix+rp(Math.round(cur))},step);
}
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className='toast show '+type;
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


