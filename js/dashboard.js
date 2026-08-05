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
  if(p==='dashboard'){
    // Chart di dashboard sempat display:none saat halaman ini disembunyikan,
    // jadi Chart.js bisa salah baca dimensi & animasinya glitch pas balik kesini.
    // Paksa resize dulu biar layout-nya kebaca ulang dengan benar.
    setTimeout(()=>{
      if(chartKat)try{chartKat.resize()}catch(e){}
      if(chartHarian)try{chartHarian.resize()}catch(e){}
    },50);
  }
  else if(p==='data'){
    loadData();
  }
  else if(p==='tabungan'&&document.getElementById('tabContent').style.display!=='none')loadTabungan();
  else if(p==='dompet')loadDompet();
  else if(p==='rekap')loadRekap();
  else if(p==='rekapkat')loadRekapKategori();
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
    // ═══ ARUS KAS KUMULATIF (semua waktu) — ini yang ditampilkan sbg angka besar ═══
    // Dihitung ulang dari NOL setiap kali dashboard dibuka (bukan state tersimpan),
    // jadi selalu akurat & otomatis "sembuh" sendiri kalau totalnya balik surplus.
    const totalMasukAllTime=allRows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0);
    const totalKeluarAllTime=allRows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0);
    const kasKumulatif=totalMasukAllTime-totalKeluarAllTime;
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
    document.getElementById('hk-periode-lbl').textContent='Semua Waktu';
    // Angka besar = kumulatif (semua waktu). Pills Masuk/Keluar di bawahnya tetap per-periode.
    countUp('d-kas',Math.abs(kasKumulatif),kasKumulatif<0?'−':'');
    document.getElementById('d-masuk').textContent=rpShort(masuk);
    document.getElementById('d-keluar').textContent=rpShort(keluar);
    document.getElementById('d-avg').textContent=rpShort(avgHarian);
    document.getElementById('d-active-days').textContent=`${days} hari`;
    document.getElementById('d-total-days-val').textContent=`${tdim} hari`;
    // Rata² Budget = kas sisa PERIODE INI ÷ sisa hari periode (sengaja tetap per-periode)
    const sisaHariNow=getSisaHari(endDate).total;
    const avgBudget=sisaHariNow>0?Math.round(kas/sisaHariNow):0;
    const elAvgBudget=document.getElementById('d-avg-budget');
    if(elAvgBudget){elAvgBudget.textContent=kas<=0?'—':rpShort(avgBudget);elAvgBudget.style.color=kas<=0?'var(--red)':'#fbbf24';}
    avgDetailData={totalFleksibel:totalFleks,totalDays:totalDaysPeriode,avgHarian,byKategori:byKatFleksArr,kas,masuk,keluar,sisaHari:sisaHariNow,avgBudget,startDate,endDate,kasKumulatif};
    const _defAlert=document.getElementById('defisitAlert');
    const _defText=document.getElementById('defisitAlertText');
    if(_defAlert&&_defText){
      if(kasKumulatif<0){
        _defAlert.style.display='flex';
        _defText.textContent=`Masih defisit ${rp(Math.abs(kasKumulatif))} dari periode-periode sebelumnya`;
      } else {
        _defAlert.style.display='none';
      }
    }
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
    // Kasih jeda kecil biar skeleton sempat ke-render ke layar dulu —
    // tanpa ini, kalau allRows udah ke-cache, renderCards() jalan instan
    // di tick yang sama dan skeleton-nya ketimpa sebelum sempat kelihatan.
    await new Promise(r=>setTimeout(r,220));
    if(!allRows.length)allRows=await fetchAllData();
    renderCards(allRows);
    syncFilterBulan();
    syncFilterKatBank();
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
      const kat=r.kategori||'';
      const pendingBadge=r._pending?'<span style="font-size:0.62rem;margin-left:4px;color:#f59e0b" title="Menunggu sinkron">⏳</span>':'';
      const tapHandler=r._pending?"toast('Menunggu sinkron dulu, belum bisa diedit','warn')":`openStrukDetail(${r.rowIndex})`;
      const tags=[r.pembayaran,r.metode].filter(Boolean).map(t=>`<span class="dtag">${t}</span>`).join('');
      const ketHtml=r.detail?`<span class="dc-ket-inline">${r.detail}</span>`:'';
      return`<div class="dc ${cls}" style="animation-delay:${Math.min((gi*0.03)+(ri*0.02),0.3)}s" onclick="event.stopPropagation();${tapHandler}"><div class="dc-row1"><div class="dc-left"><span class="dc-kat">${kat}${pendingBadge}</span></div><div class="dc-right"><span class="dc-nom ${cls}">${arr} ${rp(r.nominal)}</span></div></div><div class="dc-divider"></div><div class="dc-tags"><div class="dc-tags-left">${tags}</div>${ketHtml}</div></div>`;
    }).join('');
    return`<div class="date-group"><div class="dg-header"><div class="dg-dot ${dotCls}"></div><span class="dg-date">${IC.cal} ${formatTgl(tgl)}</span><span class="dg-kas ${dk>=0?'g':'r'}">${dk>=0?'+':'−'}${rp(Math.abs(dk))}</span></div><div class="dg-cards">${cards}</div></div>`;
  }).join('');
  el.innerHTML=strip+html;
}

function filterData(){
  const s=document.getElementById('srch').value.toLowerCase();
  const b=document.getElementById('fBulan').value;
  const j=document.getElementById('fJenis').value;
  const k=document.getElementById('fKat')?.value||'';
  const bk=document.getElementById('fBank')?.value||'';
  renderCards(allRows.filter(r=>
    (!s||[r.kategori,r.detail,r.metode,r.pembayaran,r.bulan].join(' ').toLowerCase().includes(s))&&
    (!b||r.bulan===b)&&
    (!j||r.jenis===j)&&
    (!k||r.kategori===k)&&
    (!bk||r.pembayaran===bk)
  ));
}

function syncFilterKatBank(){
  const BUKAN_BANK=['cash','transfer','qris'];
  // Populate kategori
  const selKat=document.getElementById('fKat');
  if(selKat){
    const curKat=selKat.value;
    const kats=[...new Set(allRows.map(r=>r.kategori).filter(Boolean))].sort();
    selKat.innerHTML='<option value="">Semua Kategori</option>'+kats.map(k=>`<option value="${k}">${k}</option>`).join('');
    if(curKat)selKat.value=curKat;
  }
  // Populate bank
  const selBank=document.getElementById('fBank');
  if(selBank){
    const curBank=selBank.value;
    const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean).filter(b=>!BUKAN_BANK.includes(b.trim().toLowerCase())))].sort();
    selBank.innerHTML='<option value="">Semua Bank</option>'+banks.map(b=>`<option value="${b}">${b}</option>`).join('');
    if(curBank)selBank.value=curBank;
  }
}

// ═══ DOMPET ═══
