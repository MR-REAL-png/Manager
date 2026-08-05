async function submitInput(){
  const tgl=document.getElementById('inTgl').value,jenis=document.getElementById('inJenis').value;
  const kat=document.getElementById('inKat').value,nom=getNomVal('inNom');
  const metode=document.getElementById('inMetode').value,bank=document.getElementById('inBank').value;
  const ket=document.getElementById('inKet').value,bulan=document.getElementById('inBulan').value;
  if(!tgl||!jenis||!kat||!nom){toast('Lengkapi field wajib','err');return}
  document.getElementById('inLoad').style.display='flex';document.getElementById('btnSimpan').disabled=true;
  try{
    await sheetsAppend([[tgl,bulan,kat,nom,bank,ket,metode,jenis]]);
    saveRecentKat(kat,jenis);toast('Data tersimpan!','ok');closeOv(null,'ovInput');allRows=[];
    if(document.getElementById('pg-data').classList.contains('on'))loadData();
    if(document.getElementById('pg-dashboard').classList.contains('on'))loadDashboard();
  }catch(e){
    if(isNetworkFail(e)){
      queuePendingTx([tgl,bulan,kat,nom,bank,ket,metode,jenis]);
      saveRecentKat(kat,jenis);
      toast('Offline — transaksi disimpan, akan disinkron otomatis','warn');
      closeOv(null,'ovInput');allRows=[];
      if(document.getElementById('pg-data').classList.contains('on'))loadData();
      if(document.getElementById('pg-dashboard').classList.contains('on'))loadDashboard();
      updateSyncBadge();
    }else{
      toast('Gagal simpan: '+e.message,'err');
    }
  }
  finally{document.getElementById('inLoad').style.display='none';document.getElementById('btnSimpan').disabled=false}
}

// ═══ EDIT/DELETE ═══
function openEdit(rowIdx){
  const r=allRows.find(x=>x.rowIndex===rowIdx);if(!r)return;
  document.getElementById('editRow').value=rowIdx;
  document.getElementById('eTgl').value=r.tanggal;syncBulan('e');
  document.getElementById('eJenis').value=r.jenis;onJenisChange('e');
  setTimeout(()=>{
    document.getElementById('eKat').value=r.kategori;
    document.getElementById('eMetode').value=r.metode;
    fillBank('eBank',r.metode);
    setTimeout(()=>{document.getElementById('eBank').value=r.pembayaran},80);
  },80);
  document.getElementById('eNom').value=Number(r.nominal).toLocaleString('id-ID');document.getElementById('eKet').value=r.detail||'';
  document.getElementById('ovEdit').classList.add('open');
}

async function doEdit(){
  const ri=Number(document.getElementById('editRow').value);
  const tgl=document.getElementById('eTgl').value,j=document.getElementById('eJenis').value;
  const k=document.getElementById('eKat').value,n=getNomVal('eNom');
  const m=document.getElementById('eMetode').value,b=document.getElementById('eBank').value;
  const d=document.getElementById('eKet').value,bln=document.getElementById('eBulan').value;
  if(!tgl||!j||!k||!n){toast('Lengkapi field','err');return}
  document.getElementById('eLoad').style.display='flex';
  try{await sheetsUpdate(ri,[tgl,bln,k,n,b,d,m,j]);toast('Diupdate!','ok');closeOv(null,'ovEdit');allRows=[];loadData()}
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
          return`<div class="fr"><label>${k}</label><input class="fi" type="text" id="${id}" data-kat="${k}" placeholder="Rp — tidak ada limit" value="${val?Number(val).toLocaleString('id-ID'):''}" inputmode="numeric" oninput="fmtNom(this);updateAnggaranTotal()"></div>`;
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
  else if(type==='cektanggal'){
    title.innerHTML=`${IC.cal.replace('width:13px;height:13px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Cek Salah Tanggal`;
    body.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
    document.getElementById('ovSett').classList.add('open');
    (async()=>{
      try{
        allRows=await fetchAllData();
        renderCekTanggalModal();
      }catch(e){
        body.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Gagal memuat data.</p><p style="font-size:0.65rem;color:var(--tx3);margin-top:6px;word-break:break-word">${e.message||e}</p><button class="btn-cx" style="margin-top:10px" onclick="openSettModal('cektanggal')">${IC.reload} Coba Lagi</button></div>`;
        console.error('cektanggal modal error:',e);
      }
    })();
    return;
  }
  else if(type==='saldoawal'){
    title.innerHTML=`${IC.card.replace('width:13px;height:13px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Saldo Awal Dompet`;
    body.innerHTML='<div class="ldrow"><div class="spin"></div>Memuat...</div>';
    document.getElementById('ovSett').classList.add('open');
    (async()=>{
      try{
        allRows=await fetchAllData();
        renderSaldoAwalModal();
      }catch(e){
        body.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Gagal memuat data.<br>Coba refresh dulu.</p></div>`;
        console.error('saldoawal modal error:',e);
      }
    })();
    return;
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
    <div style="display:flex;align-items:center;gap:4px;padding:4px 6px 4px 10px;background:var(--glass);border:1px solid ${isCustom?'rgba(168,85,247,0.4)':'var(--bdr2)'};border-radius:50px;font-size:0.75rem;color:${isCustom?'#c084fc':'var(--tx2)'}">
      ${b}
      <button onclick="openBankThemeEditor('${b.replace(/'/g,"\\'")}')" title="Atur warna & logo" style="background:none;border:none;color:var(--tx3);cursor:pointer;padding:2px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg></button>
      ${isCustom?`<button onclick="removeCustomBank('${b}')" style="background:none;border:none;color:var(--red);cursor:pointer;padding:2px;display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>`:''}
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
    <div style="margin-top:8px;font-size:0.65rem;color:var(--tx3)">💡 Rekening ungu = kustom (bisa dihapus) · tap ikon 🖌️ buat atur warna & logo kartu</div>`;
}

function openBankThemeEditor(bankName){
  const title=document.getElementById('settModalTitle'),body=document.getElementById('settModalBody');
  title.innerHTML=`${IC.edit.replace('width:12px;height:12px','width:14px;height:14px;vertical-align:-2px;margin-right:3px')} Tema: ${bankName}`;
  const custom=getCustomBankThemes()[bankName]||{};
  const theme=getBankTheme(bankName);
  // Ambil warna dasar dari gradient yang aktif sekarang buat isi awal color picker
  const baseColorMatch=(theme.grad||'').match(/#[0-9a-fA-F]{6}/);
  let baseColor=baseColorMatch?baseColorMatch[0]:'#7c3aed';
  if(!custom.grad&&bankName.toLowerCase().includes('superbank'))baseColor='#c7e634'; // sesuai warna brand Superbank
  body.innerHTML=`
    <div class="fr"><label>Warna Kartu</label>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="color" id="bankColorInput" value="${baseColor}" style="width:44px;height:38px;border-radius:8px;border:1.5px solid var(--bdr2);background:none;cursor:pointer">
        <div id="bankColorPreview" style="flex:1;height:38px;border-radius:10px;background:${theme.grad}"></div>
      </div>
    </div>
    <div class="fr"><label>Logo Kartu (opsional)</label>
      <input type="file" id="bankLogoInput" accept="image/*" style="display:none" onchange="onBankLogoPicked(event)">
      <div id="bankLogoPreviewWrap" style="display:flex;align-items:center;gap:10px">
        <div id="bankLogoPreview" style="width:56px;height:38px;border-radius:8px;background:${theme.grad};display:flex;align-items:center;justify-content:center;overflow:hidden">${custom.logoDataUrl?`<img src="${custom.logoDataUrl}" style="max-width:100%;max-height:100%;object-fit:contain">`:`<span style="font-size:0.6rem;color:rgba(255,255,255,0.7)">${bankName.slice(0,2).toUpperCase()}</span>`}</div>
        <button class="btn-cx" onclick="document.getElementById('bankLogoInput').click()">${IC.upload} Upload Logo</button>
        ${custom.logoDataUrl?`<button onclick="clearBankLogo()" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:0.68rem">Hapus</button>`:''}
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn-cx" style="flex:1" onclick="renderRekeningModal()">${IC.reload} Kembali</button>
      <button class="btn-ok" style="flex:1" onclick="saveBankTheme('${bankName.replace(/'/g,"\\'")}')">${IC.save} Simpan</button>
    </div>`;
  document.getElementById('bankColorInput').oninput=(e)=>{
    const c1=e.target.value,c2=shadeColor(c1,-15);
    document.getElementById('bankColorPreview').style.background=`linear-gradient(135deg,${c1},${c2})`;
    const logoBg=document.getElementById('bankLogoPreview');if(logoBg)logoBg.style.background=`linear-gradient(135deg,${c1},${c2})`;
  };
}
let _bankLogoDataUrl=null;
function onBankLogoPicked(e){
  const file=e.target.files[0];if(!file)return;
  if(file.size>1024*1024){toast('Logo maks 1MB ya','err');return}
  const reader=new FileReader();
  reader.onload=()=>{
    _bankLogoDataUrl=reader.result;
    const wrap=document.getElementById('bankLogoPreview');
    wrap.innerHTML=`<img src="${_bankLogoDataUrl}" style="max-width:100%;max-height:100%;object-fit:contain">`;
  };
  reader.readAsDataURL(file);
}
function clearBankLogo(){
  _bankLogoDataUrl='';
  const wrap=document.getElementById('bankLogoPreview');
  if(wrap)wrap.innerHTML=`<span style="font-size:0.6rem;color:rgba(255,255,255,0.7)">••</span>`;
}
function saveBankTheme(bankName){
  const color=document.getElementById('bankColorInput').value;
  const grad=`linear-gradient(135deg,${color},${shadeColor(color,-15)})`;
  const themeUpdate={grad};
  if(_bankLogoDataUrl==='')themeUpdate.logoDataUrl=null; // sengaja dihapus
  else if(_bankLogoDataUrl)themeUpdate.logoDataUrl=_bankLogoDataUrl;
  setCustomBankTheme(bankName,themeUpdate);
  _bankLogoDataUrl=null;
  pushSettings();
  toast('Tema rekening disimpan','ok');
  renderRekeningModal();
}

function renderSaldoAwalModal(){
  const body=document.getElementById('settModalBody');
  const BUKAN_BANK=['cash','transfer','qris'];
  const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean).filter(b=>!BUKAN_BANK.includes(b.trim().toLowerCase())))].sort();
  const saldoAwalMap=getSaldoAwalMap();
  if(!banks.length){
    body.innerHTML=`<div class="empty"><div class="ei">${IC.card}</div><p>Belum ada rekening.<br>Tambahkan transaksi dengan pilih rekening dulu.</p></div>`;
    return;
  }
  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:6px;line-height:1.4">Isi saldo <b style="color:#c084fc">modal awal</b> tiap dompet, yaitu saldo <b>sebelum</b> transaksi pertama tercatat di app ini. Bukan saldo aktual sekarang.</p>
    <p style="font-size:0.68rem;color:var(--tx3);margin-bottom:14px;line-height:1.4">💡 Rumus: Saldo Awal = Saldo Aktual Sekarang − Saldo yang tampil saat ini di dompet.</p>
    ${banks.map((b,i)=>`<div class="fr"><label>${b}</label><input class="fi" type="text" id="saldoawal_${i}" data-bank="${b}" inputmode="numeric" placeholder="Rp 0" value="${saldoAwalMap[b]?Number(saldoAwalMap[b]).toLocaleString('id-ID'):''}" oninput="fmtTransferNom(this)"></div>`).join('')}`;
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

function renderCekTanggalModal(){
  const body=document.getElementById('settModalBody');
  const hasil=cekTransaksiSalahTanggal(true); // true = jangan console.log, cuma return data
  if(!hasil){body.innerHTML=`<div class="empty"><div class="ei">${IC.warn}</div><p>Data belum ke-load.<br>Buka Dashboard dulu.</p></div>`;return;}
  const{perPeriode,kandidatBatasPeriode,kandidatTimezone}=hasil;

  const periodeRows=Object.values(perPeriode).sort((a,b)=>b.start-a.start).map(v=>{
    return`<div class="bs-kas-row"><div class="bs-kas-row-lbl">${v.label}</div><div class="bs-kas-row-val" style="font-size:0.72rem;color:var(--tx2)">${v.count}x · ${IC.in} ${rpShort(v.masuk)} · ${IC.out} ${rpShort(v.keluar)}</div></div>`;
  }).join('');

  const renderKandidat=(list,emptyMsg,showPeriode)=>{
    if(!list.length)return`<p style="font-size:0.72rem;color:var(--tx3);padding:8px 0">${emptyMsg}</p>`;
    return list.map(r=>`
      <div class="bs-kas-row" style="cursor:pointer" onclick="closeOv(null,'ovSett');openEdit(${r.id})">
        <div>
          <div class="bs-kas-row-lbl" style="color:#fff">${formatTgl(r.tanggal)} · ${r.kategori||r.jenis}</div>
          <div style="font-size:0.65rem;color:var(--tx3)">${r.pembayaran||'-'}${showPeriode&&r._periodeLabel?' · periode '+r._periodeLabel:''}${r.detail?' · '+r.detail:''}</div>
        </div>
        <div class="bs-kas-row-val" style="color:${r.jenis==='Pemasukan'?'var(--grn)':'var(--red)'}">${rp(r.nominal)} ›</div>
      </div>`).join('');
  };

  body.innerHTML=`
    <p style="font-size:0.72rem;color:var(--tx2);margin-bottom:10px;line-height:1.4">Cek transaksi yang kemungkinan salah tanggal / nyasar ke periode lain. Dikelompokkan pakai siklus periode kamu (bukan bulan kalender). Tap salah satu baris buat langsung edit.</p>

    <div style="font-size:0.6rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px">Ringkasan per Periode</div>
    <div class="bs-kas-rows" style="margin-bottom:6px">${periodeRows}</div>

    <div style="font-size:0.6rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px">Dekat Batas Periode ±2 Hari (${kandidatBatasPeriode.length})</div>
    <div class="bs-kas-rows" style="margin-bottom:6px">${renderKandidat(kandidatBatasPeriode,'Tidak ada kandidat 👍',true)}</div>

    <div style="font-size:0.6rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px">Mismatch Timezone (${kandidatTimezone.length})</div>
    <div class="bs-kas-rows">${renderKandidat(kandidatTimezone,'Tidak ada kandidat 👍',false)}</div>`;
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


// ═══ TOTAL ANGGARAN (live update) ═══
function updateAnggaranTotal(){
  const inputs=document.querySelectorAll('#settModalBody input[data-kat]');
  let total=0;
  inputs.forEach(inp=>{const v=Number((inp.value||'').replace(/\./g,''));if(v>0)total+=v;});
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
      return`<div class="fr"><label>${k}</label><input class="fi" type="text" id="${id}" data-kat="${k}" placeholder="Rp — tidak ada limit" value="${val?Number(val).toLocaleString('id-ID'):''}" inputmode="numeric" oninput="fmtNom(this);updateAnggaranTotal()"></div>`;
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
    const csv=rows.map(r=>`${r.tanggal},${r.bulan},"${r.kategori}",${r.nominal},"${r.metode}","${r.detail||''}","${r.pembayaran}",${r.jenis}`).join('\n');
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
      if(el&&el.value)budgets[k]=Number(el.value.replace(/\./g,''));
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
  else if(settModalType==='saldoawal'){
    const BUKAN_BANK=['cash','transfer','qris'];
    const banks=[...new Set(allRows.map(r=>r.pembayaran).filter(Boolean).filter(b=>!BUKAN_BANK.includes(b.trim().toLowerCase())))].sort();
    banks.forEach((b,i)=>{
      const el=document.getElementById('saldoawal_'+i);
      if(el)setSaldoAwal(b,el.value.replace(/\./g,'').replace(/[^0-9]/g,''));
    });
    pushSettings();
    toast('Saldo awal disimpan','ok');
    if(document.getElementById('pg-dompet')?.classList.contains('on'))loadDompet();
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
    return[tgl,r.bulan,r.kategori,r.nominal,r.metode,r.detail||'',r.pembayaran,r.jenis];
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
    // PENTING: Google Apps Script web app sering throw error CORS pas browser
    // coba baca response-nya (karena redirect internal script.google.com →
    // script.googleusercontent.com kadang gak sertakan header CORS). Tapi
    // doPost() di server-nya SUDAH selesai eksekusi & insert data SEBELUM
    // redirect itu kejadian — jadi error di sini SERING BUKAN berarti gagal
    // beneran, cuma browser gagal BACA konfirmasinya. Makanya pesannya jujur
    // soal ketidakpastian ini, bukan klaim "Gagal" yang bisa keliru.
    bar.style.width='100%';
    bar.style.background='linear-gradient(90deg,#f59e0b,#f97316)';
    lbl.textContent='Terkirim?';
    await new Promise(r=>setTimeout(r,600));
    toast('Kemungkinan besar sudah terkirim — cek Google Sheets buat mastiin (browser gagal baca respons, ini keterbatasan umum GAS, bukan berarti pasti gagal)','warn');
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
  const tl=document.getElementById('themeLabel');if(tl)tl.textContent=isOcean?'Ocean':'Cosmic';
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
  setTimeout(()=>{setTheme(next);pushSettings();},260);
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
  // Filter nilai metode bayar agar tidak muncul di dropdown Bank
  const BUKAN_BANK=['cash','transfer','qris'];
  const banks=(dbOpts.banks||[]).filter(b=>!BUKAN_BANK.includes(b.replace(/[^a-zA-Z]/g,'').toLowerCase()));
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

