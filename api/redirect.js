export default async function handler(req, res) {
  const query = req.query || {};
  const redirectParams = new URLSearchParams();
  const destinationUrl =
    process.env.DESTINATION_URL || "https://onlyfans.com/magzi/c41";
  const passthroughParams = [
    "fbclid",
    "ttclid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "ad_id",
    "adset_id",
    "campaign_id",
    "event_id",
  ];

  redirectParams.set("dest", encodeURIComponent(destinationUrl));

  for (const key of passthroughParams) {
    const value = query[key];
    if (value !== undefined && value !== null && value !== "") {
      redirectParams.set(key, String(value));
    }
  }

  if (!redirectParams.get("event_id")) {
    redirectParams.set(
      "event_id",
      "click_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    );
  }

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, `/goodbye?${redirectParams.toString()}`);
}
