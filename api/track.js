export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code' });

  const { createClient } = require('@supabase/supabase-js');
  const SB = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Increment clicks counter
  const { data: aff } = await SB
    .from('affiliates')
    .select('id, clicks')
    .eq('referral_code', code)
    .single();

  if (aff) {
    await SB.from('affiliates')
      .update({ clicks: (aff.clicks || 0) + 1 })
      .eq('id', aff.id);
  }

  res.status(200).json({ ok: true });
}
