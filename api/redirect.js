export default function handler(req, res) {
  const ua = String(req.headers["user-agent"] || "");
  const host = req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";

  // Detekcija in-app browsera
  const isMeta = /FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isTelegram = /Telegram/i.test(ua);
  const isInApp = isMeta || isInstagram || isTelegram;

  // Tvoj OnlyFans link iz Vercel env
  const destination = process.env.OF_URL || "https://onlyfans.com/magzi/c41";
  const url = new URL(destination);

  // Proslijedi sve parametre (fbclid, utm, event_id...)
  const incoming = req.query || {};
  Object.entries(incoming).forEach(([key, value]) => {
    if (key === "open_external") return;
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  // Ako je in-app browser → pošalji na fallback stranicu
  if (isInApp && !("open_external" in incoming)) {
    const fallback = new URL(`${proto}://${host}/open-in-browser.html`);
    Object.entries(incoming).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => fallback.searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        fallback.searchParams.set(key, String(value));
      }
    });
    return res.redirect(302, fallback.toString());
  }

  // Normalni browser → direktno na OnlyFans
  return res.redirect(302, url.toString());
}