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
    const targetScroll=cur*carousel.offsetWidth;
    if(animate){
      carousel.style.scrollBehavior='smooth';
      carousel.scrollLeft=targetScroll;
      setTimeout(()=>{carousel.style.scrollBehavior='auto';},400);
    }else{
      carousel.style.scrollBehavior='auto';
      carousel.scrollLeft=targetScroll;
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
  // Tutup ovSett dulu agar ovConfirm bisa muncul di atas
  closeOv(null,'ovSett');
  setTimeout(()=>{
    showConfirm('Hapus Transfer','Yakin ingin menghapus transfer ini?',async()=>{
      try{
        const uid=getUserUID();
        const r=await fetch(`${API_URL}/api/sheets?action=delete-transfer`,{
          method:'DELETE',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({uid,id:t.id})
        });
        const j=await r.json();
        if(j.success){toast('Transfer dihapus','ok');loadDompet();}
        else toast(j.error||'Gagal hapus','err');
      }catch(e){toast('Gagal terhubung','err');}
    });
  },200);
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
    rows.forEach(r=>{bm[r.metode]=(bm[r.metode]||0)+r.nominal;const bank=r.pembayaran||r.metode;bb[bank]=(bb[bank]||0)+r.nominal});
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

