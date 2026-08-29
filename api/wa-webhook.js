// api/wa-webhook.js
// Webhook untuk integrasi WhatsApp Business API <-> SE_REAL
//
// ENV VARS yang perlu ditambahkan di Vercel (Settings > Environment Variables):
//   WA_VERIFY_TOKEN     = string bebas buatan sendiri, misal "serealtoken123"
//   WA_ACCESS_TOKEN     = token dari System User "Sereal" (yang baru didapat)
//   WA_PHONE_NUMBER_ID  = 1284728964721151
//   SUPABASE_URL        = url project supabase (sudah ada, dipakai sheets.js juga)
//   SUPABASE_SERVICE_KEY= service role key supabase (JANGAN pakai anon key di sini)
//
// Setelah deploy, daftarkan URL ini di Meta:
//   https://<domain-vercel-kamu>/api/wa-webhook
// dengan Verify Token = nilai WA_VERIFY_TOKEN di atas

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const WA_TOKEN = process.env.WA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const GRAPH_URL = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

export default async function handler(req, res) {
  // ── 1. VERIFIKASI WEBHOOK (dipanggil Meta sekali saat setup) ──────────
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification failed');
  }

  // ── 2. TERIMA PESAN MASUK ──────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Selalu balas 200 secepatnya ke Meta, proses di background
      res.status(200).send('EVENT_RECEIVED');

      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message) return; // bukan pesan (misal status update), abaikan

      const fromNumber = message.from; // nomor pengirim, format: 62812xxxx
      const msgType = message.type;    // 'text', 'image', dll

      // ── Cek apakah nomor ini sudah terhubung ke akun SE_REAL ──────────
      const { data: waUser, error: waUserErr } = await supabase
        .from('wa_users')
        .select('user_id, pin_verified')
        .eq('wa_number', fromNumber)
        .single();

      if (waUserErr || !waUser) {
        await sendText(fromNumber,
          'Nomor kamu belum terhubung ke akun SE_REAL.\n' +
          'Kirim PIN 6 digit kamu untuk menghubungkan akun.'
        );
        return;
      }

      // ── Proses berdasarkan tipe pesan ──────────────────────────────────
      if (msgType === 'text') {
        const text = message.text.body.trim();
        await handleTextMessage(fromNumber, waUser.user_id, text);
      } else if (msgType === 'image') {
        await sendText(fromNumber, 'Fitur baca struk dari foto akan segera hadir 📸');
        // TODO: reuse logic AI receipt scanning (Claude Vision) yang sudah ada di app
      } else {
        await sendText(fromNumber, 'Maaf, tipe pesan ini belum didukung.');
      }

    } catch (err) {
      console.error('Webhook error:', err);
      // res sudah dikirim di atas, jadi cukup log saja
    }
    return;
  }

  return res.status(405).send('Method not allowed');
}

// ─────────────────────────────────────────────────────────────────────────
// Handler untuk pesan teks — parsing sederhana dulu, bisa diganti ke
// Claude API untuk natural language parsing yang lebih baik nanti.
// ─────────────────────────────────────────────────────────────────────────
async function handleTextMessage(fromNumber, userId, text) {
  // Contoh format yang dikenali: "keluar 50000 makan siang"
  //                              "masuk 500000 gaji"
  const match = text.match(/^(keluar|masuk)\s+([\d.]+)\s*(.*)$/i);

  if (!match) {
    await sendText(fromNumber,
      'Format tidak dikenali. Contoh:\n' +
      '"keluar 50000 makan siang"\n' +
      '"masuk 500000 gaji"'
    );
    return;
  }

  const jenis = match[1].toLowerCase() === 'keluar' ? 'Pengeluaran' : 'Pemasukan';
  const nominal = parseInt(match[2].replace(/\./g, ''), 10);
  const catatan = match[3] || '';

  const { error } = await supabase.from('transaksi').insert({
    user_id: userId,
    jenis,
    nominal,
    catatan,
    kategori: null,
    metode: null,
    rekening: null,
    tanggal: new Date().toISOString().slice(0, 10),
    input_by: 'whatsapp-bot',
  });

  if (error) {
    console.error('Insert error:', error);
    await sendText(fromNumber, 'Gagal menyimpan transaksi. Coba lagi ya.');
    return;
  }

  const emoji = jenis === 'Pengeluaran' ? '💸' : '💰';
  await sendText(fromNumber,
    `${emoji} Tercatat: ${jenis} Rp${nominal.toLocaleString('id-ID')}` +
    (catatan ? ` - ${catatan}` : '')
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Kirim pesan teks balik via WhatsApp Cloud API
// ─────────────────────────────────────────────────────────────────────────
async function sendText(to, body) {
  await fetch(GRAPH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
}
