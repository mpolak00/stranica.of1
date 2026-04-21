import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function loadPage(fileName) {
  const filePath = path.join(process.cwd(), 'public', fileName);
  return readFile(filePath, 'utf8');
}

export default async function handler(req, res) {
  try {
    const html = await loadPage('access.html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Failed to render /access', error);
    return res.status(500).send('Unable to load page');
  }
}
