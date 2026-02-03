import type { APIRoute } from "astro";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tooFast(startedAt?: number) {
  if (!startedAt) return false;
  const ms = Date.now() - startedAt;
  return ms < 1200; // boty często wysyłają “instant”
}

const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  // JSON only (prościej + stabilniej)
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const key = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || "hello@kersivo.co.uk";
  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const service = String(body?.service ?? "");
  const budget = String(body?.budget ?? "");
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  // honeypot: jeśli wypełnione, udajemy sukces (nie karmimy botów)
  const hp = String(body?.website ?? "").trim();
  if (hp) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // “too fast”: też udajemy sukces (soft shield)
  const startedAt = Number(body?.startedAt ?? 0) || undefined;
  if (tooFast(startedAt)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  if (!name || !email || message.length < 10) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Optional attachment (image only)
  const att = body?.attachment ?? null;
  let attachments: Array<{ filename: string; content: string }> | undefined;

  if (att?.base64 && att?.filename) {
    const filename = String(att.filename);
    const contentType = String(att.contentType || "");
    const size = Number(att.size || 0);

    if (!contentType.startsWith("image/")) {
      return new Response(JSON.stringify({ ok: false, error: "Only image attachments are allowed" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (!size || size > MAX_ATTACHMENT_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "Attachment too large (max 3MB)" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Resend expects base64 content + filename :contentReference[oaicite:1]{index=1}
    attachments = [{ filename, content: String(att.base64) }];
  }

  // Timeout dla Resend
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
        from: "Kersivo <hello@kersivo.co.uk>",
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
      return new Response(
        JSON.stringify({ ok: false, error: out?.message || out?.error || `Resend failed (${r.status})` }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: out?.id }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Email send timed out" : e?.message || "Server error";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
