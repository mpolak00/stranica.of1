function genId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

export default async function handler(req, res) {
  const query = req.query || {};
  const timestamp = Math.floor(Date.now() / 1000);
  const ua = req.headers['user-agent'] || '';
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '';
  const clickId = query.event_id || genId('click');

  if (!process.env.DESTINATION_URL) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Missing DESTINATION_URL');
  }

  const nextParams = new URLSearchParams();
  nextParams.set('dest', encodeURIComponent(process.env.DESTINATION_URL));
  nextParams.set('event_id', clickId);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'dest' || key === 'event_id') continue;
    nextParams.set(key, String(value));
  }

  console.log(
    JSON.stringify({
      _type: 'redirect_to_goodbye',
      ts: timestamp,
      click_id: clickId,
      ip,
      ua,
      query
    })
  );

  res.setHeader('Cache-Control', 'no-store');
  return res.redirect(302, '/goodbye?' + nextParams.toString());
}
