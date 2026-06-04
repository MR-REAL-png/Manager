export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, systemPrompt } = req.body;

    // Kumpulkan semua key yang tersedia
    const KEYS = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (!KEYS.length) return res.status(500).json({ error: 'API key tidak ditemukan' });

    const instruction = 'Ekstrak data transaksi dari gambar struk/nota ini. Kembalikan HANYA JSON valid, tanpa teks lain, tanpa backtick, tanpa penjelasan. ' + systemPrompt;

    const parts = [
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: instruction }
    ];

    let data;
    let lastError = '';

    // Coba satu per satu key, kalau 429 langsung ganti key berikutnya
    for (let i = 0; i < KEYS.length; i++) {
      console.log(`Mencoba API key ke-${i + 1}...`);

      const geminiRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + KEYS[i],
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
          })
        }
      );

      data = await geminiRes.json();
      console.log(`Key ke-${i + 1} response:`, JSON.stringify(data).slice(0, 200));

      // Kalau 429, langsung coba key berikutnya tanpa delay
      if (data.error?.code === 429) {
        lastError = `Key ke-${i + 1} rate limited`;
        console.log(lastError + ', mencoba key berikutnya...');
        continue;
      }

      // Error lain selain 429, langsung return
      if (data.error) {
        return res.status(500).json({ error: data.error.message });
      }

      // Sukses, keluar dari loop
      console.log(`Berhasil dengan key ke-${i + 1}`);
      break;
    }

    // Kalau semua key kena 429
    if (data?.error?.code === 429) {
      return res.status(429).json({ error: 'Semua key sedang sibuk, coba beberapa saat lagi.' });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) return res.status(500).json({ error: 'Gemini tidak menghasilkan teks' });

    // Cari JSON di dalam teks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Tidak ditemukan JSON: ' + rawText.slice(0, 100) });

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (e) {
    console.error('parse-image error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
