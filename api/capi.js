export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body || {};
  const {
    event,
    event_id,
    fbclid,
    ttclid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ad_id,
    adset_id,
    campaign_id
  } = body;

  if (!event || !event_id) return res.status(400).json({ error: 'missing event or event_id' });

  if (!process.env.META_PIXEL_ID || !process.env.META_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'missing META_PIXEL_ID or META_ACCESS_TOKEN' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '';
  const ua = req.headers['user-agent'] || '';
  const referer = req.headers.referer || `https://${req.headers.host || ''}`;

  const userData = { client_ip_address: ip, client_user_agent: ua };
  if (fbclid) userData.fbc = `fb.1.${timestamp}.${fbclid}`;

  const payload = {
    data: [
      {
        event_name: event,
        event_time: timestamp,
        event_id,
        action_source: 'website',
        event_source_url: referer,
        user_data: userData,
        custom_data: {
          fbclid: fbclid || '',
          ttclid: ttclid || '',
          utm_source: utm_source || '',
          utm_medium: utm_medium || '',
          utm_campaign: utm_campaign || '',
          utm_content: utm_content || '',
          utm_term: utm_term || '',
          ad_id: ad_id || '',
          adset_id: adset_id || '',
          campaign_id: campaign_id || ''
        }
      }
    ]
  };

  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const capiUrl = `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`;
    const response = await fetch(capiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('CAPI error:', err?.message || String(err));
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
