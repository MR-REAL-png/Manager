window.onerror=function(msg,src,line){alert('ERR: '+msg+'\n'+src.split('/').pop()+':'+line);return false};
const API_URL='https://manager-khaki-ten.vercel.app';
const GSHEET_URL='https://script.google.com/macros/s/AKfycbwHu6HvVRXHXNsNwtY2-DTRYY7AUAKcB9eEENTRxHulRiVHq3kJCNb_Cnt-6sycb4rDzw/exec';
const LOGO_URL='https://raw.githubusercontent.com/MR-REAL-png/Manager/main/logo.png';
const MOS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const CHART_COLORS=['#a78bfa','#f472b6','#60a5fa','#fb923c','#34d399','#818cf8','#fbbf24','#4ade80','#f87171','#e879f9','#38bdf8','#a3e635'];
const MONTH_COLORS=['#818cf8','#c084fc','#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#4ade80','#fbbf24','#e879f9','#38bdf8','#f87171'];

// Warna per anggota group (untuk badge di kartu transaksi)
const MEMBER_COLORS=['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'];

// ═══ SUPABASE REALTIME ═══
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

  setInterval(async()=>{
    try{
      const res=await fetch(`${API_URL}/api/sheets?action=get-settings&uid=${uid}`);
      if(!res.ok)return;
      const json=await res.json();
      if(!json.success||!json.data)return;
      if(json.updated_at&&json.updated_at!==lastUpdatedAt){
        if(lastUpdatedAt!==null){
          applySettings(json.data);
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
  edit:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:12px;height:12px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>',
  warn:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',
  ok:  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px;height:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
  save:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>',
  upload:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',
  down: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>',
  reload:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
};

const ADMIN_PASS_DEFAULT='sheril';

// ═══ GLOBAL STATE ═══
let allRows=[],dbOpts={banks:[],kategoris:[],metodes:[],jenis:[]};
let isAdmin=false,editMode=false;
let chartKat=null,chartTab=null,chartRekap=null,chartMetode=null,chartKal=null,chartHarian=null;
let toastT,avgDetailData=null;
let kalYear=new Date().getFullYear(),kalMonth=new Date().getMonth();
let settModalType='';
let notifEnabled=true,alertPct=80,adminPassword=ADMIN_PASS_DEFAULT,komposisiRingkas=true;
let notifications=[];
let bmonRingkas=true;
let anggaranModalYear = new Date().getFullYear();
let anggaranModalMonth = new Date().getMonth();
let aiScanAbort = false;
let aiScanCooldown = 0;
let aiScanCooldownTimer = null;

// ═══ MULTI USER STATE ═══
// Cache anggota group untuk badge warna di kartu transaksi
let groupMembers=[];
let memberColorMap={};

// Ambil dan cache anggota group (dipanggil setelah login)
async function loadGroupMembers(){
  const group_id=getUserGroupId();
  if(!group_id)return;
  try{
    const res=await fetch(`${API_URL}/api/sheets?action=get-group-members&group_id=${group_id}`);
    const json=await res.json();
    if(json.success&&json.data){
      groupMembers=json.data;
      // Assign warna per anggota
      groupMembers.forEach((m,i)=>{
        memberColorMap[m.username]=MEMBER_COLORS[i%MEMBER_COLORS.length];
      });
    }
  }catch(e){console.warn('loadGroupMembers gagal:',e);}
}

// Helper: dapatkan warna badge untuk user tertentu
function getMemberColor(username){
  return memberColorMap[username]||'#6B7280';
}
