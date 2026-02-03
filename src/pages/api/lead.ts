import type { APIRoute } from "astro";

export const prerender = false;

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const GET: APIRoute = async () => {
  // pozwala testować w przeglądarce /api/lead oraz /api/lead/
  return json(200, { ok: true, route: "lead", ts: Date.now() });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  // honeypot + too-fast (anti-bot)
  const hp = String(body?.website ?? "").trim();
  if (hp) return json(200, { ok: true });

  const startedAt = Number(body?.startedAt ?? 0);
  if (startedAt && Date.now() - startedAt < 1200) return json(200, { ok: true });

  // ENV: obsługujemy stare i nowe nazwy (żebyś nie musiał teraz latać po Vercel)
  const key =
    import.meta.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY;

  const to =
    import.meta.env.CONTACT_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    import.meta.env.CONTACT_TO ||
    process.env.CONTACT_TO ||
    "hello@kersivo.co.uk";

  const from =
    import.meta.env.RESEND_FROM ||
    process.env.RESEND_FROM ||
    import.meta.env.CONTACT_FROM ||
    process.env.CONTACT_FROM ||
    "Kersivo <hello@kersivo.co.uk>";

  if (!key) return json(500, { ok: false, error: "Missing RESEND_API_KEY" });

  const service = String(body?.service ?? "");
  const budget = String(body?.budget ?? "");
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || !email || message.length < 10) {
    return json(400, { ok: false, error: "Missing required fields" });
  }
  if (!isValidEmail(email)) {
    return json(400, { ok: false, error: "Invalid email" });
  }

  // optional image attachment (base64)
  const att = body?.attachment ?? null;
  let attachments: Array<{ filename: string; content: string }> | undefined;

  if (att?.base64 && att?.filename) {
    const filename = String(att.filename);
    const contentType = String(att.contentType || "");
    const size = Number(att.size || 0);

    if (!contentType.startsWith("image/")) {
      return json(400, { ok: false, error: "Only image attachments are allowed" });
    }
    if (!size || size > 3 * 1024 * 1024) {
      return json(400, { ok: false, error: "Attachment too large (max 3MB)" });
    }

    attachments = [{ filename, content: String(att.base64) }];
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        from,
        to,
        subject: `New lead — ${name}`,
        reply_to: email,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Service: ${service}\n` +
          `Budget: ${budget}\n\n` +
          `${message}\n`,
        ...(attachments ? { attachments } : {}),
      }),
    }).finally(() => clearTimeout(t));

    const out = await r.json().catch(() => null);

    if (!r.ok) {
      return json(500, {
        ok: false,
        error: out?.message || out?.error || `Resend failed (${r.status})`,
      });
    }

    return json(200, { ok: true, id: out?.id });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Email send timed out" : e?.message || "Server error";
    return json(500, { ok: false, error: msg });
  }
};
