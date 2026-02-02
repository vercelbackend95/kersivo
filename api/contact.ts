import { Resend } from "resend";

type Json = Record<string, any>;

function json(status: number, body: Json) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return "unknown";
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

// ultra-prosty rate limit (best-effort, serverless = nie gwarantuje 100% trwałości)
const bucket = new Map<string, { c: number; reset: number }>();
function rateLimit(ip: string, limit = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const cur = bucket.get(ip);
  if (!cur || now > cur.reset) {
    bucket.set(ip, { c: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (cur.c >= limit) return { ok: false };
  cur.c += 1;
  bucket.set(ip, cur);
  return { ok: true };
}

function base64FromArrayBuffer(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // btoa jest dostępne w runtime (Vercel)
  return btoa(binary);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  const ip = getIp(req);

  // rate limit
  const rl = rateLimit(ip);
  if (!rl.ok) return json(429, { ok: false, error: "Too many requests. Try again later." });

  // origin sanity-check (nie jest kuloodporne, ale tnie śmieci)
  const origin = req.headers.get("origin") || "";
  if (origin && !origin.includes("kersivo.co.uk") && !origin.includes("vercel.app")) {
    return json(403, { ok: false, error: "Forbidden origin" });
  }

  const ct = (req.headers.get("content-type") || "").toLowerCase();

  let name = "";
  let email = "";
  let service = "";
  let budget = "";
  let details = "";
  let hp = "";
  let startedAt = "";

  let attachment: { filename: string; content: string; content_type?: string } | null = null;

  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();

      name = String(fd.get("name") || "");
      email = String(fd.get("email") || "");
      service = String(fd.get("service") || "");
      budget = String(fd.get("budget") || "");
      details = String(fd.get("details") || "");
      hp = String(fd.get("hp") || "");
      startedAt = String(fd.get("startedAt") || "");

      const f = fd.get("attachment");
      if (f && typeof f !== "string") {
        const file = f as File;

        if (file.size > MAX_FILE_BYTES) {
          return json(400, { ok: false, error: "Attachment too large (max 5MB)." });
        }
        if (file.type && !ALLOWED_MIME.has(file.type)) {
          return json(400, { ok: false, error: "Unsupported attachment type." });
        }

        const buf = await file.arrayBuffer();
        const b64 = base64FromArrayBuffer(buf);
        attachment = {
          filename: file.name || "attachment",
          content: b64,
          content_type: file.type || undefined,
        };
      }
    } else {
      // fallback JSON (jakbyś testował curl/json)
      const body = (await req.json().catch(() => ({}))) as Json;

      name = String(body.name || "");
      email = String(body.email || "");
      service = String(body.service || "");
      budget = String(body.budget || "");
      details = String(body.details || body.message || "");
      hp = String(body.hp || "");
      startedAt = String(body.startedAt || "");
    }
  } catch {
    return json(400, { ok: false, error: "Invalid request body." });
  }

  // honeypot
  if (hp && hp.trim().length > 0) {
    // udajemy sukces — bot idzie dalej spać
    return json(200, { ok: true, id: "ok" });
  }

  // timing sanity-check
  if (startedAt) {
    const t = Number(startedAt);
    if (Number.isFinite(t)) {
      const elapsed = Date.now() - t;
      if (elapsed < 900) return json(200, { ok: true, id: "ok" });
    }
  }

  name = name.trim();
  email = email.trim();
  details = details.trim();

  if (name.length < 2) return json(400, { ok: false, error: "Name is required." });
  if (!isEmail(email)) return json(400, { ok: false, error: "Valid email is required." });
  if (details.length < 10) return json(400, { ok: false, error: "Message is too short." });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return json(500, { ok: false, error: "Missing RESEND_API_KEY." });

  const to = process.env.CONTACT_TO || "hello@kersivo.co.uk";
  const from = process.env.CONTACT_FROM || "Kersivo <hello@kersivo.co.uk>";

  const subject = `New lead — ${name}`;

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    service ? `Service: ${service}` : "",
    budget ? `Budget: ${budget}` : "",
    "",
    "Message:",
    details,
    "",
    `IP: ${ip}`,
  ].filter(Boolean);

  const text = lines.join("\n");

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; line-height:1.5;">
      <h2 style="margin:0 0 14px;">New contact form lead</h2>
      <p style="margin:0 0 6px;"><b>Name:</b> ${escapeHtml(name)}</p>
      <p style="margin:0 0 6px;"><b>Email:</b> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${budget ? `<p style="margin:0 0 6px;"><b>Budget:</b> ${escapeHtml(budget)}</p>` : ""}
      <div style="margin-top:14px;">
        <b>Message:</b>
        <pre style="white-space:pre-wrap; background:rgba(0,0,0,.04); padding:12px; border-radius:10px;">${escapeHtml(
          service ? `Service: ${service}\nBudget: ${budget || "-"}\n\n${details}` : details
        )}</pre>
      </div>
      <p style="margin:10px 0 0; opacity:.7; font-size:12px;">IP: ${escapeHtml(ip)}</p>
    </div>
  `;

  const resend = new Resend(resendKey);

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      reply_to: email,
      text,
      html,
      ...(attachment
        ? {
            attachments: [
              {
                filename: attachment.filename,
                content: attachment.content, // base64
                content_type: attachment.content_type,
              },
            ],
          }
        : {}),
    });

    return json(200, { ok: true, id: (result as any)?.data?.id || (result as any)?.id || "ok" });
  } catch (e: any) {
    return json(500, { ok: false, error: e?.message || "Email send failed." });
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
