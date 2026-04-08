export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const {
    event,
    event_id,
    fbclid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ad_id,
    adset_id,
    campaign_id,
  } = body;

  if (!event || !event_id) {
    return res.status(400).json({ error: "missing event or event_id" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "";
  const ua = req.headers["user-agent"] || "";
  const referer = req.headers.referer || `https://${req.headers.host || ""}`;

  const userData = {
    client_ip_address: ip,
    client_user_agent: ua,
  };
  if (fbclid) userData.fbc = `fb.1.${timestamp}.${fbclid}`;

  const payload = {
    data: [
      {
        event_name: event,
        event_time: timestamp,
        event_id: event_id,
        action_source: "website",
        event_source_url: referer,
        user_data: userData,
        custom_data: {
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          utm_term,
          ad_id,
          adset_id,
          campaign_id,
        },
      },
    ],
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const capiUrl = `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`;
    const r = await fetch(capiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error("CAPI error:", err?.message || String(err));
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
