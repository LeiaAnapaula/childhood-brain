// Vercel serverless function. POST {prompt} -> {text}. The page's httpSampler() calls this when claude.use('sample') is unavailable.
// Needs ANTHROPIC_API_KEY in the Vercel project env. The key never reaches the browser.
const MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ code: 'no_key', error: 'ANTHROPIC_API_KEY is not set in the Vercel project env' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const prompt = body && typeof body.prompt === 'string' ? body.prompt.slice(0, 20000) : '';
  if (!prompt) return res.status(400).json({ code: 'bad_request', error: 'prompt (string) is required' });
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    });
  } catch (e) {
    return res.status(502).json({ code: 'upstream', error: String(e && e.message || e) });
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(502).json({ code: r.status === 429 ? 'rate_limited' : 'upstream', error: (j.error && j.error.message) || 'anthropic ' + r.status });
  const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  return res.status(200).json({ text });
}
