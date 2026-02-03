export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify({ ok: true, route: "contact-v2", ts: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function POST({ request }: { request: Request }) {
  // Na razie tylko echo, żeby potwierdzić, że POST działa i nie wisi
  const ct = request.headers.get("content-type") || "";
  const payload =
    ct.includes("application/json") ? await request.json().catch(() => ({})) : { note: "non-json" };

  return new Response(JSON.stringify({ ok: true, route: "contact-v2", payload }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
