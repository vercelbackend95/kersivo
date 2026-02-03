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

const MAX_FILES = 5;
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB each
const MAX_TOTAL_BYTES = 8 * 1024 * 1024; // ~8MB total (safe)

export const GET: APIRoute = async () => {
  // handy ping in browser
  return json(200, { ok: true, route: "lead", ts: Date.now() });
};

export const POST: APIRoute = async ({ request }) => {
  // 1) Parse JSON
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  // 2) Anti-bot (honeypot + too-fast)
  const hp = String(body?.website ?? "").trim();
  if (hp) return json(200, { ok: true });

  const startedAt = Number(body?.startedAt ?? 0);
  if (startedAt && Date.now() - startedAt < 1200) return json(200, { ok: true });

  // 3) Env (support old + new names)
  const key = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

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

  // 4) Validate fields
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

  // 5) Attachments (array) — images only
  const atts = Array.isArray(body?.attachments) ? body.attachments : [];
  let attachments: Array<{ filename: string; content: string }> | undefined;

  if (atts.length) {
    if (atts.length > MAX_FILES) {
      return json(400, { ok: false, error: `Max ${MAX_FILES} attachments.` });
    }

    const mapped: Array<{ filename: string; content: string }> = [];
    let total = 0;

    for (const a of atts) {
      const filename = String(a?.filename || "");
      const contentType = String(a?.contentType || "");
      const size = Number(a?.size || 0);
      const base64 = String(a?.base64 || "");

      if (!filename || !base64) {
        return json(400, { ok: false, error: "Invalid attachment." });
      }
      if (!contentType.startsWith("image/")) {
        return json(400, { ok: false, error: "Only image attachments are allowed." });
      }
      if (!size || size > MAX_FILE_BYTES) {
        return json(400, { ok: false, error: "One of the attachments is too large (max 3MB)." });
      }

      total += size;
      if (total > MAX_TOTAL_BYTES) {
        return json(400, { ok: false, error: "Total attachments size too large." });
      }

      // Resend expects base64 without data-url prefix
      mapped.push({ filename, content: base64 });
    }

    attachments = mapped;
  }

  // 6) Send via Resend REST API
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
