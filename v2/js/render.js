// ═══════════════════════════════════════════════════════════
// v2/js/render.js — logic RENDER khusus tampilan baru.
// Semua pengambilan/penyimpanan data (fetch, simpan, PIN login,
// antrian offline) TETAP pakai config.js/helpers.js/auth.js yang
// sama dengan tampilan lama — file ini cuma urusan "gambar ke layar".
//
// Kontrak dengan file bersama (JANGAN diubah tanpa cek helpers.js/auth.js):
//   - loadDashboard() dan loadData() harus ada sebagai fungsi global
//   - #pg-dashboard dan #pg-data harus ada sebagai id container halaman,
//     dengan class "on" saat aktif (dicek oleh syncPendingTx())
//   - toast(msg,type) dan fillBank(id,cur) dipakai oleh helpers.js
// ═══════════════════════════════════════════════════════════

function toDateStrV2(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}

// ═══ NAV & SHEETS ═══
function goPageV2(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('on'));
  document.getElementById('pg-'+p).classList.add('on');
  document.querySelectorAll('.nav-btn').forEach(el=>el.classList.toggle('on',el.dataset.nav===p));
  if(p==='data')loadData();
  else if(p==='dompet')loadDompetV2();
  else if(p==='rekapkat')loadRekapKategoriV2();
  else if(p==='dashboard')loadDashboard();
}
function openSheetV2(id){document.getElementById(id).classList.add('on')}
function closeSheetV2(id){document.getElementById(id).classList.remove('on')}

let saldoHiddenV2=false;
function toggleSaldoV2(){
  saldoHiddenV2=!saldoHiddenV2;
  document.getElementById('heroVal').classList.toggle('hide',saldoHiddenV2);
  document.getElementById('eyeBtn').textContent=saldoHiddenV2?'🙈':'👁️';
}

// ═══ DROPDOWN HELPERS (dipanggil helpers.js:fetchDBOptions & form Tambah) ═══
function fillBank(id,cur){
  const sel=document.getElementById(id); if(!sel)return;
  const banks=(dbOpts&&dbOpts.banks&&dbOpts.banks.length)?dbOpts.banks:['Jago','BCA'];
  const opts=['Cash',...banks.filter(b=>b!=='Cash')];
  sel.innerHTML=opts.map(b=>`<option ${b===cur?'selected':''}>${b}</option>`).join('');
}
function fillKategoriV2(id){
  const sel=document.getElementById(id); if(!sel)return;
  const cats=(dbOpts&&dbOpts.kategoris&&dbOpts.kategoris.length)?dbOpts.kategoris:['🍜 Makanan','⚡ Listrik Rumah','🏠 Kos','💸 Tabungan'];
  sel.innerHTML=cats.map(k=>`<option>${k}</option>`).join('');
}

// ═══ TX ROW (baris sederhana, dipakai di beberapa halaman) ═══
function txRowHtmlV2(r){
  const pendingBadge=r._pending?' ⏳':'';
  const isIn=r.jenis==='Pemasukan';
  return `<div class="tx">
    <div class="tx-top">
      <div class="tx-kat">${r.kategori}${pendingBadge}</div>
      <div class="tx-nom ${isIn?'in':'out'}">${isIn?'+':'−'}${rp(r.nominal)}</div>
    </div>
    <div class="tx-meta">${[r.pembayaran,r.metode,r.detail].filter(Boolean).join(' · ')}</div>
  </div>`;
}

// ═══════════════════════════════════════════
// DASHBOARD — kontrak wajib: loadDashboard()
// ═══════════════════════════════════════════
let chartDashKat=null, chartDashTren=null;
async function loadDashboard(){
  try{ if(!allRows.length) allRows=await fetchAllData(); }
  catch(e){ toast('Gagal memuat data','err'); return; }

  document.getElementById('helloName').textContent=getUserUID();

  const {startDate,endDate}=getActivePeriodResolved();
  const s=toDateStrV2(startDate), e=toDateStrV2(endDate);
  const rows=allRows.filter(r=>r.tanggal>=s&&r.tanggal<=e);
  const masuk=rows.filter(r=>r.jenis==='Pemasukan').reduce((a,r)=>a+r.nominal,0);
  const keluar=rows.filter(r=>r.jenis==='Pengeluaran').reduce((a,r)=>a+r.nominal,0);

  document.getElementById('heroVal').textContent=rp(masuk-keluar);
  document.getElementById('heroIn').textContent=rpShort(masuk);
  document.getElementById('heroOut').textContent=rpShort(keluar);

  renderDashKatChart(rows);
  renderDashTrenChart();
}

function renderDashKatChart(rows){
  const card=document.getElementById('chartDashKat')?.parentElement; if(!card)return;
  const exp=rows.filter(r=>r.jenis==='Pengeluaran');
  if(chartDashKat){try{chartDashKat.destroy()}catch(e){} chartDashKat=null}
  if(!exp.length){
    card.innerHTML='<div class="empty-state"><div class="ei">📊</div><p>Belum ada pengeluaran periode ini</p></div>';
    return;
  }
  if(!document.getElementById('chartDashKat')){card.innerHTML='<canvas id="chartDashKat" height="200"></canvas>';}
  const ctx=document.getElementById('chartDashKat').getContext('2d');
  const byKat=groupBy(exp,'kategori');
  const labels=Object.keys(byKat);
  const data=labels.map(k=>byKat[k].reduce((s,r)=>s+r.nominal,0));
  chartDashKat=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:CHART_COLORS,borderWidth:0}]},
    options:{responsive:true,cutout:'62%',plugins:{legend:{position:'bottom',labels:{boxWidth:9,font:{size:9},color:'#6B7280'}}}}});
}

function renderDashTrenChart(){
  const ctx=document.getElementById('chartDashTren')?.getContext('2d'); if(!ctx)return;
  if(chartDashTren){try{chartDashTren.destroy()}catch(e){} chartDashTren=null}
  const now=new Date();
  const months=[];
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push(`${d.getFullYear()}-${pad(d.getMonth()+1)}`);}
  const inData=months.map(mk=>allRows.filter(r=>r.jenis==='Pemasukan'&&r.tanggal.startsWith(mk)).reduce((s,r)=>s+r.nominal,0));
  const outData=months.map(mk=>allRows.filter(r=>r.jenis==='Pengeluaran'&&r.tanggal.startsWith(mk)).reduce((s,r)=>s+r.nominal,0));
  const labels=months.map(mk=>{const[,m]=mk.split('-');return MOS[Number(m)-1].slice(0,3)});
  chartDashTren=new Chart(ctx,{type:'bar',data:{labels,datasets:[
    {label:'Masuk',data:inData,backgroundColor:'#16A97A',borderRadius:6},
    {label:'Keluar',data:outData,backgroundColor:'#E5484D',borderRadius:6}
  ]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:9,font:{size:9},color:'#6B7280'}}},
    scales:{y:{ticks:{callback:v=>rpShort(v),font:{size:9},color:'#A6A8B8'},grid:{color:'#ECEBF3'}},x:{ticks:{font:{size:9},color:'#A6A8B8'},grid:{display:false}}}}});
}

// ═══════════════════════════════════════════
// DATA — kontrak wajib: loadData()
// ═══════════════════════════════════════════
async function loadData(){
  const list=document.getElementById('dataList'); if(!list)return;
  try{ if(!allRows.length) allRows=await fetchAllData(); }
  catch(e){ list.innerHTML='<div class="empty-state"><div class="ei">📴</div><p>Gagal memuat data</p></div>'; return; }
  if(!allRows.length){ list.innerHTML='<div class="empty-state"><div class="ei">🧾</div><p>Belum ada transaksi</p></div>'; return; }
  const grouped=groupBy(allRows,'tanggal');
  const keys=Object.keys(grouped).sort((a,b)=>b.localeCompare(a));
  const today=getLocalDate();
  const yd=new Date();yd.setDate(yd.getDate()-1);
  const yestStr=toDateStrV2(yd);
  list.innerHTML=keys.map(tgl=>{
    const lbl=tgl===today?'Hari Ini':tgl===yestStr?'Kemarin':fmtDateShort(new Date(tgl+'T00:00:00'));
    const rows=grouped[tgl].map(r=>txRowHtmlV2(r)).join('');
    return `<div class="day-lbl">${lbl}</div><div class="card">${rows}</div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// DOMPET
// ═══════════════════════════════════════════
async function loadDompetV2(){
  try{ if(!allRows.length) allRows=await fetchAllData(); }catch(e){}
  const{banks,saldoMap}=hitungSaldoDompet(allRows,[]); // catatan: transfer antar dompet belum ikut dihitung di v2
  const grads=['linear-gradient(135deg,#F0B85C,#E8A94C)','linear-gradient(135deg,#4F3CC9,#7C6AE8)','linear-gradient(135deg,#16A97A,#2CB598)','linear-gradient(135deg,#5B8DEF,#3A5FC7)','linear-gradient(135deg,#E5748B,#E5484D)'];
  const scroll=document.getElementById('walletScroll'), dots=document.getElementById('walletDots'), list=document.getElementById('walletList');
  if(!banks.length){
    scroll.innerHTML='<div class="empty-state" style="width:100%"><div class="ei">👛</div><p>Belum ada rekening tercatat</p></div>';
    dots.innerHTML='';list.innerHTML='';return;
  }
  scroll.innerHTML=banks.map((b,i)=>`
    <div class="wcard" style="background:${grads[i%grads.length]}">
      <div class="wcard-top"><div class="wcard-bank">${b}</div><div class="wcard-tag">Rekening</div></div>
      <div class="wcard-val">${rp(saldoMap[b])}</div>
      <div class="wcard-sub">Saldo tersedia</div>
    </div>`).join('');
  dots.innerHTML=banks.map((b,i)=>`<span class="${i===0?'on':''}"></span>`).join('');
  list.innerHTML=banks.map(b=>`<div class="tx"><div class="tx-top"><div class="tx-kat">${b}</div><div class="tx-nom" style="color:var(--ink)">${rp(saldoMap[b])}</div></div></div>`).join('');
}

// ═══════════════════════════════════════════
// REKAP PERKATEGORI
// ═══════════════════════════════════════════
let rekapKatTypeV2='Pengeluaran', chartRekapKatV2=null;
function rkSetTypeV2(type){
  rekapKatTypeV2=type;
  document.getElementById('segOut').classList.toggle('on',type==='Pengeluaran');
  document.getElementById('segIn').classList.toggle('on',type==='Pemasukan');
  loadRekapKategoriV2();
}
function rkPresetV2(key,el){
  document.querySelectorAll('#pg-rekapkat .chips .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  const fromEl=document.getElementById('rkFromV2'),toEl=document.getElementById('rkToV2');
  const today=new Date();
  if(key==='bulan'){fromEl.value=`${today.getFullYear()}-${pad(today.getMonth()+1)}-01`;toEl.value=getLocalDate();}
  else if(key==='tahun'){fromEl.value=`${today.getFullYear()}-01-01`;toEl.value=getLocalDate();}
  else if(key==='all'){fromEl.value='';toEl.value='';}
  fromEl.dataset.touched='1';toEl.dataset.touched='1';
  loadRekapKategoriV2();
}
async function loadRekapKategoriV2(){
  const list=document.getElementById('rkListV2'); if(!list)return;
  try{ if(!allRows.length) allRows=await fetchAllData(); }catch(e){}
  const fromEl=document.getElementById('rkFromV2'),toEl=document.getElementById('rkToV2');
  if(fromEl&&toEl&&!fromEl.value&&!toEl.value&&!fromEl.dataset.touched){
    const today=new Date();
    fromEl.value=`${today.getFullYear()}-${pad(today.getMonth()+1)}-01`;
    toEl.value=getLocalDate();
  }
  const from=fromEl?.value||'0000-01-01', to=toEl?.value||'9999-12-31';
  const rows=allRows.filter(r=>r.jenis===rekapKatTypeV2&&r.tanggal>=from&&r.tanggal<=to);
  const byKat=groupBy(rows,'kategori');
  const ranked=Object.keys(byKat).map(k=>({kategori:k,nominal:byKat[k].reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nominal-a.nominal);
  const total=ranked.reduce((s,k)=>s+k.nominal,0);
  document.getElementById('rkLblV2').textContent='Total '+rekapKatTypeV2;
  document.getElementById('rkValV2').textContent=rp(total);
  list.innerHTML=ranked.length?ranked.map((k,i)=>{
    const pct=total>0?Math.round(k.nominal/total*100):0;
    return `<div class="rk-item" onclick="openRekapKatDetailV2('${k.kategori.replace(/'/g,"\\'")}')">
      <div class="rk-rank">${i+1}</div>
      <div class="rk-body"><div class="rk-name">${k.kategori}</div><div class="rk-bar-bg"><div class="rk-bar-fill" style="width:${pct}%"></div></div></div>
      <div class="rk-right"><div class="rk-nom">${rpShort(k.nominal)}</div><div class="rk-pct">${pct}%</div></div>
    </div>`;
  }).join(''):`<div class="empty-state"><div class="ei">🏷️</div><p>Belum ada transaksi ${rekapKatTypeV2.toLowerCase()} di rentang ini</p></div>`;
  renderChartRekapKatV2(ranked.slice(0,5).map(k=>k.kategori),rows,from,to);
}
function renderChartRekapKatV2(topKats,rows,from,to){
  const ctx=document.getElementById('chartRekapKatV2')?.getContext('2d'); if(!ctx)return;
  if(chartRekapKatV2){try{chartRekapKatV2.destroy()}catch(e){} chartRekapKatV2=null}
  if(!topKats.length)return;
  const fromD=from&&from!=='0000-01-01'?new Date(from):new Date((rows[0]&&rows[0].tanggal)||getLocalDate());
  const toD=to&&to!=='9999-12-31'?new Date(to):new Date();
  const months=[];
  const cur=new Date(fromD.getFullYear(),fromD.getMonth(),1);
  const end=new Date(toD.getFullYear(),toD.getMonth(),1);
  while(cur<=end&&months.length<36){months.push(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}`);cur.setMonth(cur.getMonth()+1);}
  const datasets=topKats.map((k,i)=>({
    label:k,data:months.map(mk=>rows.filter(r=>r.kategori===k&&r.tanggal.startsWith(mk)).reduce((s,r)=>s+r.nominal,0)),
    borderColor:CHART_COLORS[i%CHART_COLORS.length],backgroundColor:CHART_COLORS[i%CHART_COLORS.length],borderWidth:2,pointRadius:2,tension:0.3,fill:false
  }));
  chartRekapKatV2=new Chart(ctx,{type:'line',data:{labels:months.map(mk=>{const[y,m]=mk.split('-');return MOS[Number(m)-1].slice(0,3)+' '+y.slice(2)}),datasets},
    options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:9,font:{size:9},color:'#6B7280'}}},
      scales:{y:{ticks:{callback:v=>rpShort(v),font:{size:9},color:'#A6A8B8'},grid:{color:'#ECEBF3'}},x:{ticks:{font:{size:9},color:'#A6A8B8'},grid:{display:false}}}}});
}
function openRekapKatDetailV2(kat){
  document.getElementById('detailTitleV2').textContent='Detail Kategori';
  const from=document.getElementById('rkFromV2')?.value||'0000-01-01',to=document.getElementById('rkToV2')?.value||'9999-12-31';
  const isIn=rekapKatTypeV2==='Pemasukan';
  const txs=allRows.filter(r=>r.jenis===rekapKatTypeV2&&r.kategori===kat&&r.tanggal>=from&&r.tanggal<=to).sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  const total=txs.reduce((s,r)=>s+r.nominal,0);
  const avg=txs.length?Math.round(total/txs.length):0;
  const days=new Set(txs.map(r=>r.tanggal)).size;
  const emojiMatch=kat.match(/^(\p{Extended_Pictographic}\uFE0F?)/u);
  const emoji=emojiMatch?emojiMatch[0]:(isIn?'💰':'🏷️');
  const name=emojiMatch?kat.slice(emojiMatch[0].length).trim():kat;
  document.getElementById('detailBodyV2').innerHTML=`
    <div class="dh" style="background:${isIn?'linear-gradient(135deg,#0F7A5C,#16A97A)':'linear-gradient(135deg,var(--brand-deep),var(--brand))'}">
      <div class="dh-row"><div class="dh-ico">${emoji}</div><div><div class="dh-name">${name}</div><div class="dh-sub">${isIn?'Pemasukan':'Pengeluaran'}</div></div></div>
      <div class="dh-val">${rp(total)}</div>
    </div>
    <div class="stat3">
      <div class="card"><div class="stat3-lbl">Transaksi</div><div class="stat3-val">${txs.length}×</div></div>
      <div class="card"><div class="stat3-lbl">Rata-rata</div><div class="stat3-val">${rpShort(avg)}</div></div>
      <div class="card"><div class="stat3-lbl">Hari Aktif</div><div class="stat3-val">${days}h</div></div>
    </div>
    <div class="sec-title" style="margin-bottom:10px;font-size:0.8rem">Riwayat</div>
    <div class="card">${txs.length?txs.map(r=>txRowHtmlV2(r)).join(''):'<div class="empty-state"><div class="ei">🏷️</div><p>Belum ada transaksi</p></div>'}</div>
  `;
  openSheetV2('ovDetail');
}

// ═══════════════════════════════════════════
// LAINNYA: Tabungan, Rekap Total, Metode Bayar, Kalender
// ═══════════════════════════════════════════
function openTabunganV2(){
  document.getElementById('detailTitleV2').textContent='Tabungan';
  const rows=allRows.filter(r=>r.jenis==='Pengeluaran'&&r.kategori.toLowerCase().includes('tabungan'));
  const total=rows.reduce((s,r)=>s+r.nominal,0);
  document.getElementById('detailBodyV2').innerHTML=`
    <div class="dh" style="background:linear-gradient(135deg,#B8873A,var(--gold))">
      <div class="dh-row"><div class="dh-ico">💰</div><div><div class="dh-name">Total Tersimpan</div><div class="dh-sub">Dari kategori bertanda "Tabungan"</div></div></div>
      <div class="dh-val">${rp(total)}</div>
    </div>
    <div class="card" style="margin-bottom:14px;font-size:0.74rem;color:var(--ink-soft);line-height:1.5">
      ⚠️ Target & tenggat tabungan masih di tampilan lama — di sini baru menjumlahkan transaksi kategori Tabungan.
    </div>
    <div class="sec-title" style="margin-bottom:10px;font-size:0.8rem">Riwayat Nabung</div>
    <div class="card">${rows.length?rows.sort((a,b)=>b.tanggal.localeCompare(a.tanggal)).map(r=>txRowHtmlV2(r)).join(''):'<div class="empty-state"><div class="ei">💰</div><p>Belum ada catatan tabungan</p></div>'}</div>
  `;
  openSheetV2('ovDetail');
}

function openRekapTotalV2(){
  document.getElementById('detailTitleV2').textContent='Rekap Total';
  const now=new Date();
  const months=[];
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({key:`${d.getFullYear()}-${pad(d.getMonth()+1)}`,label:MOS[d.getMonth()]+' '+d.getFullYear()});}
  const perMonth=months.map(m=>{
    const rows=allRows.filter(r=>r.tanggal.startsWith(m.key));
    return{...m,in:rows.filter(r=>r.jenis==='Pemasukan').reduce((s,r)=>s+r.nominal,0),out:rows.filter(r=>r.jenis==='Pengeluaran').reduce((s,r)=>s+r.nominal,0)};
  });
  const totalIn=perMonth.reduce((s,m)=>s+m.in,0), totalOut=perMonth.reduce((s,m)=>s+m.out,0);
  const maxVal=Math.max(1,...perMonth.map(m=>Math.max(m.in,m.out)));
  document.getElementById('detailBodyV2').innerHTML=`
    <div class="dh" style="background:linear-gradient(135deg,#3A5FC7,#5B8DEF)">
      <div class="dh-row"><div class="dh-ico">📅</div><div><div class="dh-name">Ringkasan 6 Bulan</div><div class="dh-sub">${perMonth[0].label} – ${perMonth[perMonth.length-1].label}</div></div></div>
      <div class="dh-val">${rp(totalIn-totalOut)}</div>
    </div>
    <div class="stat3" style="grid-template-columns:1fr 1fr">
      <div class="card"><div class="stat3-lbl">Total Masuk</div><div class="stat3-val" style="color:var(--green)">${rpShort(totalIn)}</div></div>
      <div class="card"><div class="stat3-lbl">Total Keluar</div><div class="stat3-val" style="color:var(--red)">${rpShort(totalOut)}</div></div>
    </div>
    <div class="sec-title" style="margin-bottom:10px;font-size:0.8rem">Per Bulan</div>
    <div class="card">
      ${perMonth.map(m=>`<div style="padding:10px 2px">
        <div style="display:flex;justify-content:space-between;font-size:0.76rem;font-weight:600;margin-bottom:5px"><span>${m.label}</span><span style="color:var(--ink-soft);font-weight:500">${rpShort(m.in-m.out)} bersih</span></div>
        <div style="display:flex;gap:3px;height:7px">
          <div style="width:${(m.in/maxVal*100)}%;background:var(--green);border-radius:4px"></div>
          <div style="width:${(m.out/maxVal*100)}%;background:var(--red);border-radius:4px"></div>
        </div>
      </div>`).join('')}
    </div>
  `;
  openSheetV2('ovDetail');
}

function openMetodeBayarV2(){
  document.getElementById('detailTitleV2').textContent='Metode Bayar';
  const rows=allRows.filter(r=>r.jenis==='Pengeluaran');
  const byMetode=groupBy(rows,'metode');
  const ranked=Object.keys(byMetode).filter(Boolean).map(k=>({m:k,nom:byMetode[k].reduce((s,r)=>s+r.nominal,0)})).sort((a,b)=>b.nom-a.nom);
  const total=ranked.reduce((s,r)=>s+r.nom,0);
  document.getElementById('detailBodyV2').innerHTML=`
    <div class="rk-total"><div class="rk-total-lbl">Total Pengeluaran</div><div class="rk-total-val">${rp(total)}</div></div>
    <div class="card">
      ${ranked.length?ranked.map((r,i)=>{
        const pct=total>0?Math.round(r.nom/total*100):0;
        return `<div class="rk-item"><div class="rk-rank">${i+1}</div><div class="rk-body"><div class="rk-name">${r.m}</div><div class="rk-bar-bg"><div class="rk-bar-fill" style="width:${pct}%"></div></div></div><div class="rk-right"><div class="rk-nom">${rpShort(r.nom)}</div><div class="rk-pct">${pct}%</div></div></div>`;
      }).join(''):'<div class="empty-state"><div class="ei">💳</div><p>Belum ada data</p></div>'}
    </div>
  `;
  openSheetV2('ovDetail');
}

function openKalenderV2(){
  const now=new Date();
  const year=now.getFullYear(),month=now.getMonth();
  document.getElementById('detailTitleV2').textContent='Kalender '+MOS[month]+' '+year;
  const firstDow=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const mk=`${year}-${pad(month+1)}`;
  const byDate={};
  allRows.forEach(r=>{if(r.tanggal.startsWith(mk))(byDate[r.tanggal]=byDate[r.tanggal]||[]).push(r);});
  let cells='';
  for(let i=0;i<firstDow;i++)cells+='<div></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${pad(month+1)}-${pad(d)}`;
    const dayTx=byDate[dateStr]||[];
    const hasIn=dayTx.some(t=>t.jenis==='Pemasukan'), hasOut=dayTx.some(t=>t.jenis==='Pengeluaran');
    let dot='';
    if(hasIn&&hasOut)dot='<div style="display:flex;gap:2px;justify-content:center;margin-top:2px"><span style="width:4px;height:4px;border-radius:50%;background:var(--green)"></span><span style="width:4px;height:4px;border-radius:50%;background:var(--red)"></span></div>';
    else if(hasIn)dot='<div style="width:4px;height:4px;border-radius:50%;background:var(--green);margin:2px auto 0"></div>';
    else if(hasOut)dot='<div style="width:4px;height:4px;border-radius:50%;background:var(--red);margin:2px auto 0"></div>';
    cells+=`<div style="text-align:center;padding:7px 0;border-radius:10px;${dayTx.length?'background:var(--bg)':''}" ${dayTx.length?`onclick="toast('${dayTx.length} transaksi di ${d} ${MOS[month]}')"`:''}>
      <div style="font-size:0.72rem;font-weight:${dayTx.length?'700':'500'};color:${dayTx.length?'var(--ink)':'var(--ink-faint)'}">${d}</div>${dot}
    </div>`;
  }
  const monthTx=allRows.filter(r=>r.tanggal.startsWith(mk)).sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  document.getElementById('detailBodyV2').innerHTML=`
    <div class="card" style="margin-bottom:14px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;margin-bottom:8px">
        ${['M','S','S','R','K','J','S'].map(d=>`<div style="font-size:0.62rem;font-weight:700;color:var(--ink-faint)">${d}</div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">${cells}</div>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;font-size:0.68rem;color:var(--ink-soft);margin-bottom:14px">
      <span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);margin-right:4px"></span>Pemasukan</span>
      <span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--red);margin-right:4px"></span>Pengeluaran</span>
    </div>
    <div class="sec-title" style="margin-bottom:10px;font-size:0.8rem">Transaksi Bulan Ini</div>
    <div class="card">${monthTx.length?monthTx.map(r=>txRowHtmlV2(r)).join(''):'<div class="empty-state"><div class="ei">🗓️</div><p>Belum ada transaksi</p></div>'}</div>
  `;
  openSheetV2('ovDetail');
}

// ═══════════════════════════════════════════
// TAMBAH TRANSAKSI
// ═══════════════════════════════════════════
let addTypeV2='Pengeluaran';
function openAddSheet(){
  document.getElementById('addTgl').value=getLocalDate();
  fillKategoriV2('addKat');
  fillBank('addBank','');
  document.getElementById('addNom').value='';
  document.getElementById('addKet').value='';
  setAddTypeV2('Pengeluaran');
  openSheetV2('ovAdd');
}
function setAddTypeV2(t){
  addTypeV2=t;
  document.getElementById('addTypeOut').classList.toggle('on',t==='Pengeluaran');
  document.getElementById('addTypeIn').classList.toggle('on',t==='Pemasukan');
}
function fmtAddNomV2(el){
  const raw=el.value.replace(/\D/g,'');
  el.value=raw?Number(raw).toLocaleString('id-ID'):'';
}
async function submitInputV2(){
  const tgl=document.getElementById('addTgl').value;
  const nomRaw=document.getElementById('addNom').value.replace(/\D/g,'');
  const kat=document.getElementById('addKat').value;
  const bank=document.getElementById('addBank').value;
  const metode=document.getElementById('addMetode').value;
  const ket=document.getElementById('addKet').value;
  if(!tgl||!nomRaw||!kat){toast('Lengkapi tanggal, nominal, dan kategori','err');return}
  const d=new Date(tgl+'T00:00:00');
  const bulan=MOS[d.getMonth()];
  const values=[tgl,bulan,kat,Number(nomRaw),bank,ket,metode,addTypeV2];
  try{
    await sheetsAppend([values]);
    toast('Transaksi tersimpan!','ok');
    closeSheetV2('ovAdd');allRows=[];
    loadDashboard();
    if(document.getElementById('pg-data').classList.contains('on'))loadData();
    if(document.getElementById('pg-dompet').classList.contains('on'))loadDompetV2();
  }catch(e){
    if(isNetworkFail(e)){
      queuePendingTx(values);
      toast('Offline — tersimpan, akan disinkron otomatis','warn');
      closeSheetV2('ovAdd');allRows=[];
      loadDashboard();
      if(document.getElementById('pg-data').classList.contains('on'))loadData();
      updateSyncBadge();
    }else{
      toast('Gagal simpan: '+e.message,'err');
    }
  }
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async()=>{
  updateSyncBadge();
  window.addEventListener('online',()=>{updateSyncBadge();syncPendingTx();});
  window.addEventListener('offline',updateSyncBadge);
  setInterval(()=>{if(navigator.onLine)syncPendingTx()},20000);

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
        syncPendingTx();
        return;
      }
    }catch(e){}
  }
  showPinOverlay();
});
