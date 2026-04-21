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

  res.setHeader('Cache-Control', 'no-store, no-cache');
  return res.redirect(302, url.toString());
}
