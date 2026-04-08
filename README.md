# glow-landing (v2)

Static Vercel landing in `public/` + serverless functions in `api/`.

## Local structure

- `public/index.html` — single-file landing page (dark mode, marquee, plans, preview, sticky bar, popup)
- `api/redirect.js` — server-side Meta CAPI event + redirect
- `api/capi.js` — server-side Meta CAPI endpoint (generic event sender)
- `vercel.json` — routes `/api/*` + static `public/*`

## Create a new repo `glow-landing-v2` and push

From the project folder:

```powershell
cd "C:\Users\Administrator\Documents\New project\glow-landing"
git init
git add -A
git commit -m "glow landing v2"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/glow-landing-v2.git
git push -u origin main
```

## Deploy to Vercel

1) In Vercel, click **New Project** and import the GitHub repo.
2) Set Environment Variables (Project Settings → Environment Variables):

- `META_PIXEL_ID`
- `META_ACCESS_TOKEN`
- `OF_URL`
- (optional) `META_TEST_EVENT_CODE`

3) Deploy. The landing is `/` and redirects go through `/api/redirect`.

