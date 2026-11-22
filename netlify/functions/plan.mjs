// Shared storage for the zoning app. Anyone with the link can read the plan;
// only requests carrying the manager PIN (env var MANAGER_PIN) can change it.
import { getStore } from "@netlify/blobs";

const DOC = /^(plan\/config|weeks\/\d{4}-\d{2}-\d{2})$/;
const MAX_BYTES = 250_000;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pinOk(req) {
  const expected = Netlify.env.get("MANAGER_PIN") || "";
  const given = req.headers.get("x-manager-pin") || "";
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

export default async (req) => {
  const url = new URL(req.url);
  const store = getStore({ name: "zoning", consistency: "strong" });

  if (req.method === "GET") {
    if (url.searchParams.has("check")) {
      if (!pinOk(req)) { await sleep(600); return json({ ok: false }, 401); }
      return json({ ok: true });
    }
    const docs = (url.searchParams.get("docs") || "").split(",").filter(Boolean).slice(0, 8);
    if (!docs.length || !docs.every((d) => DOC.test(d))) return json({ error: "bad docs" }, 400);
    const out = {};
    await Promise.all(docs.map(async (d) => { out[d] = await store.get(d, { type: "json" }); }));
    return json({ docs: out });
  }

  if (req.method === "PUT") {
    if (!pinOk(req)) { await sleep(600); return json({ error: "pin" }, 401); }
    const doc = url.searchParams.get("doc") || "";
    if (!DOC.test(doc)) return json({ error: "bad doc" }, 400);
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: "too large" }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: "bad json" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "bad body" }, 400);
    await store.setJSON(doc, body);
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
};

export const config = { path: "/api/plan" };
