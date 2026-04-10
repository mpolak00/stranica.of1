export default async function handler(req, res) {
  const query = req.query || {};
  const fallbackDestinationUrl = "https://onlyfans.com/magzi/c41";
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
  let redirectUrl;

  try {
    redirectUrl = new URL(
      process.env.DESTINATION_URL || fallbackDestinationUrl,
    );
  } catch {
    redirectUrl = new URL(fallbackDestinationUrl);
  }

  for (const key of passthroughParams) {
    const value = query[key];
    if (value !== undefined && value !== null && value !== "") {
      redirectUrl.searchParams.set(key, String(value));
    }
  }

  if (!redirectUrl.searchParams.get("event_id")) {
    redirectUrl.searchParams.set(
      "event_id",
      "click_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    );
  }

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, redirectUrl.toString());
}
