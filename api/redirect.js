export default function handler(req, res) {
  const dest = process.env.DESTINATION_URL || process.env.OF_URL;

  if (!dest) {
    return res.status(500).send('No destination configured');
  }

  const url = new URL(dest);
  const trackingKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
    'ttclid',
    'ad_id',
    'adset_id',
    'campaign_id'
  ];
  const inbound = new URL(req.url, 'https://x');

  trackingKeys.forEach(key => {
    const value = inbound.searchParams.get(key);
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  if (process.env.META_PIXEL_ID && process.env.META_ACCESS_TOKEN) {
    const fbclid = inbound.searchParams.get('fbclid') || '';
    const ts = Math.floor(Date.now() / 1000);
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '';
    const ua = req.headers['user-agent'] || '';
    const capiPayload = {
      data: [{
        event_name: 'InitiateCheckout',
        event_time: ts,
        event_id: 'ic_' + ts + '_' + Math.random().toString(36).slice(2, 8),
        action_source: 'website',
        event_source_url: req.headers.referer || '',
        user_data: {
          client_ip_address: ip,
          client_user_agent: ua,
          ...(fbclid ? { fbc: 'fb.1.' + ts + '.' + fbclid } : {})
        }
      }]
    };

    if (process.env.META_TEST_EVENT_CODE) {
      capiPayload.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    fetch(
      'https://graph.facebook.com/v19.0/' + process.env.META_PIXEL_ID + '/events?access_token=' + process.env.META_ACCESS_TOKEN,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload)
      }
    ).catch(function(err) {
      console.error('CAPI InitiateCheckout error:', err.message);
    });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache');
  return res.redirect(302, url.toString());
}
