export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    metaPixelId: process.env.META_PIXEL_ID || '',
    tiktokPixelId: process.env.TIKTOK_PIXEL_ID || ''
  });
}
