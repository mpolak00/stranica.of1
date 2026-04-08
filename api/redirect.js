export default async function handler(req, res) {
  const ua = req.headers["user-agent"] || "";
  const q = req.query || {};

  const {
    fbclid,
    ttclid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ad_id,
    adset_id,
    campaign_id,
    event_id,
  } = q;

  const timestamp = Math.floor(Date.now() / 1000);
  const clickId =
    event_id ||
    "click_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8);

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "";

  const userData = {
    client_ip_address: ip,
    client_user_agent: ua,
  };
  if (fbclid) userData.fbc = `fb.1.${timestamp}.${fbclid}`;

  const capiPayload = {
    data: [
      {
        event_name: "OutboundClick",
        event_time: timestamp,
        event_id: clickId,
        action_source: "website",
        event_source_url: `https://${req.headers.host || ""}`,
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
    capiPayload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const capiUrl = `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`;
    const r = await fetch(capiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiPayload),
    });
    if (!r.ok) console.error("CAPI redirect error:", await r.text());
  } catch (err) {
    console.error("CAPI redirect error:", err?.message || String(err));
  }

  console.log(
    JSON.stringify({
      _type: "click",
      click_id: clickId,
      ts: timestamp,
      ip,
      ua,
      fbclid: fbclid || "",
      ttclid: ttclid || "",
      utm_source: utm_source || "",
      utm_medium: utm_medium || "",
      utm_campaign: utm_campaign || "",
      utm_content: utm_content || "",
      ad_id: ad_id || "",
      adset_id: adset_id || "",
      campaign_id: campaign_id || "",
    }),
  );

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, process.env.OF_URL || "https://onlyfans.com");
}
