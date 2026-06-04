export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, prompt, systemPrompt } = req.body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key tidak ditemukan' });
    }

    const parts = [];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
      parts.push({ text: 'Baca struk/nota ini dan ekstrak data transaksinya. ' + systemPrompt });
    } else {
      parts.push({ text: systemPrompt + '\n\n' + prompt });
    }

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: parts }] })
      }
    );

    const data = await geminiRes.json();
    const text = (((data.candidates || [])[0] || {}).content || {}).parts
      ? data.candidates[0].content.parts[0].text
      : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch (e) {
    console.error('parse-image error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
