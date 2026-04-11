import { readFile } from "node:fs/promises";
import path from "node:path";

const metaBotPatterns = [
  "facebookexternalhit",
  "facebookbot",
  "meta-externalagent",
  "meta-externalads",
  "meta-externalfetcher",
  "FacebookBot",
  "Meta-External",
];

function isMetaCrawler(userAgent = "") {
  const normalizedUserAgent = String(userAgent).toLowerCase();
  return metaBotPatterns.some((pattern) =>
    normalizedUserAgent.includes(pattern.toLowerCase())
  );
}

async function loadPage(fileName) {
  const filePath = path.join(process.cwd(), "public", fileName);
  return readFile(filePath, "utf8");
}

export default async function handler(req, res) {
  const userAgent = req.headers["user-agent"] || "";
  const fileName = isMetaCrawler(userAgent) ? "clean.html" : "access.html";

  try {
    const html = await loadPage(fileName);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Failed to render /access", error);
    return res.status(500).send("Unable to load page");
  }
}
