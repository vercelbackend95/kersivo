export const prerender = false;

import type { APIRoute } from "astro";

type CallbackPayload = {
  phone?: string;
  website?: string; // honeypot
  startedAt?: number;
  source?: string;
};

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isPhoneLike(v: string) {
  const s = (v || "").trim();
  if (s.length < 7 || s.length > 22) return false;
  return /^[+0-9][0-9\s().-]+$/.test(s);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return json(415, { ok: false, error: "Expected JSON." });
    }

    const raw = (await request.json().catch(() => null)) as CallbackPayload | null;
    if (!raw) return json(400, { ok: false, error: "Invalid JSON." });

    const phone = (raw.phone || "").trim();
    const hp = (raw.website || "").trim();
    const startedAt = typeof raw.startedAt === "number" ? raw.startedAt : undefined;

    // Honeypot: bot? udaj sukces i milcz.
    if (hp) return json(200, { ok: true });

    // Zbyt szybkie wysłanie (bot)? udaj sukces.
    if (startedAt && Date.now() - startedAt < 900) return json(200, { ok: true });

    if (!isPhoneLike(phone)) {
      return json(400, { ok: false, error: "Invalid phone number." });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    if (!RESEND_API_KEY) {
      return json(500, {
        ok: false,
        error: "Server email is not configured (missing RESEND_API_KEY).",
      });
    }

    const to = process.env.CONTACT_TO || "hello@kersivo.co.uk";
    const from = process.env.CONTACT_FROM || "Kersivo <onboarding@resend.dev>";

    const subject = `Callback request — ${phone}`;

    const html = `
      <div style="font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">Callback request</h2>
        <p style="margin:0 0 10px">
          <b>Phone:</b> ${esc(phone)}<br/>
          <b>Source:</b> ${esc(raw.source || "unknown")}<br/>
          <b>Time:</b> ${esc(new Date().toISOString())}
        </p>
        <p style="margin:14px 0 0;color:#666;font-size:12px">
          Source: kersivo.co.uk contact (morph CTA)
        </p>
      </div>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const out = await r.json().catch(() => null);

    if (!r.ok) {
      const msg =
        (out && (out.message || out.error?.message || out.error)) ||
        `Resend failed (${r.status})`;
      return json(502, { ok: false, error: msg });
    }

    return json(200, { ok: true, id: out?.id });
  } catch (e: any) {
    return json(500, { ok: false, error: e?.message || "Server error." });
  }
};
