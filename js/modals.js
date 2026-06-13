window.onerror = function(msg, src, line) {
  alert('ERROR: ' + msg + '\nFile: ' + src + '\nLine: ' + line);
};
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
