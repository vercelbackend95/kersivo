import { Resend } from "resend";

type AttachmentPayload = {
  name: string;
  type: string;
  size: number;
  base64: string; // raw base64 (no "data:...base64," prefix)
};

type BodyPayload = {
  service?: string;
  budget?: string;
  name?: string;
  email?: string;
  message?: string;

  // Anti-bot
  hp?: string; // honeypot
  startedAt?: number; // timestamp when user started interacting

  // Optional
  website?: string;
  company?: string;
  company_size?: string;

  attachment?: AttachmentPayload | null;
};

const resend = new Resend(process.env.RESEND_API_KEY);

// --- tiny in-memory rate limiter (best-effort; serverless-safe enough as a first shield)
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || now > current.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }

  if (current.count >= limit) {
    const retryInSec = Math.ceil((current.resetAt - now) / 1000);
    return { ok: false as const, retryInSec };
  }

  current.count += 1;
  buckets.set(ip, current);
  return { ok: true as const };
}

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  // allow your domains + local dev
  const allowed = [
    "https://kersivo.co.uk",
    "https://www.kersivo.co.uk",
    "http://localhost:4321",
    "http://localhost:3000",
  ];
  return allowed.some((a) => origin.startsWith(a) || referer.startsWith(a));
}

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") {
      return json(405, { ok: false, error: "Method not allowed" });
    }

    if (!process.env.RESEND_API_KEY) {
      return json(500, { ok: false, error: "Missing RESEND_API_KEY" });
    }

    // basic origin guard (not perfect, but cuts random bot spam)
    if (!isAllowedOrigin(req)) {
      return json(403, { ok: false, error: "Forbidden origin" });
    }

    const ip = getClientIp(req);

    const rl = rateLimit(ip);
    if (!rl.ok) {
      return json(429, {
        ok: false,
        error: `Too many requests. Try again in ${rl.retryInSec}s.`,
      });
    }

    const body = (await req.json()) as BodyPayload;

    // honeypot: if filled -> bot
    if (body.hp && body.hp.trim().length > 0) {
      return json(200, { ok: true }); // pretend success
    }

    // time-to-submit trap: submissions under ~900ms are usually bots
    if (typeof body.startedAt === "number") {
      const delta = Date.now() - body.startedAt;
      if (delta < 900) return json(200, { ok: true }); // pretend success
    }

    const service = (body.service || "").trim();
    const budget = (body.budget || "").trim();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    if (!name || name.length < 2) {
      return json(400, { ok: false, error: "Name is required." });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return json(400, { ok: false, error: "Valid email is required." });
    }
    if (!message || message.length < 10) {
      return json(400, {
        ok: false,
        error: "Project details must be at least 10 characters.",
      });
    }
    if (message.length > 5000) {
      return json(400, { ok: false, error: "Message is too long." });
    }

    // Attachment validation (max 4MB raw file; base64 will be larger)
    let attachments:
      | Array<{ filename: string; content: string }>
      | undefined = undefined;

    if (body.attachment && body.attachment.base64) {
      const a = body.attachment;

      const maxBytes = 4 * 1024 * 1024;
      if (typeof a.size !== "number" || a.size <= 0) {
        return json(400, { ok: false, error: "Invalid attachment size." });
      }
      if (a.size > maxBytes) {
        return json(400, {
          ok: false,
          error: "Attachment too large (max 4MB).",
        });
      }

      const allowedTypes = new Set([
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
      ]);

      const type = (a.type || "").toLowerCase();
      if (type && !allowedTypes.has(type)) {
        return json(400, {
          ok: false,
          error: "Unsupported attachment type. Use PNG/JPG/WebP/PDF.",
        });
      }

      // basic sanity: base64 length must match something meaningful
      if (a.base64.length < 200) {
        return json(400, { ok: false, error: "Attachment data is invalid." });
      }

      attachments = [
        {
          filename: a.name || "attachment",
          content: a.base64, // Resend accepts Base64 string content for attachments
        },
      ];
    }

    const subject = `New lead — ${name}`;
    const to = ["hello@kersivo.co.uk"];

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; line-height:1.5;">
        <h2 style="margin:0 0 12px;">New contact form lead</h2>
        <p><b>Name:</b> ${escapeHtml(name)}<br/>
        <b>Email:</b> ${escapeHtml(email)}<br/>
        ${service ? `<b>Service:</b> ${escapeHtml(service)}<br/>` : ""}
        ${budget ? `<b>Budget:</b> ${escapeHtml(budget)}<br/>` : ""}</p>

        <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>

        ${
          attachments
            ? `<p><b>Attachment:</b> included (${escapeHtml(
                body.attachment?.name || "file"
              )})</p>`
            : ""
        }

        <hr style="border:none;border-top:1px solid rgba(0,0,0,.08);margin:16px 0;" />
        <p style="color:rgba(0,0,0,.6);font-size:12px;margin:0;">IP: ${escapeHtml(
          ip
        )}</p>
      </div>
    `.trim();

    const text = [
      "New contact form lead",
      `Name: ${name}`,
      `Email: ${email}`,
      service ? `Service: ${service}` : "",
      budget ? `Budget: ${budget}` : "",
      "",
      "Message:",
      message,
      "",
      attachments ? `Attachment: included (${body.attachment?.name})` : "",
      `IP: ${ip}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await resend.emails.send({
      from: "Kersivo <hello@kersivo.co.uk>",
      to,
      subject,
      replyTo: email,
      html,
      text,
      attachments,
    });

    if (error) {
      return json(500, { ok: false, error: error.message });
    }

    return json(200, { ok: true, id: data?.id });
  } catch (err: any) {
    return json(500, {
      ok: false,
      error: err?.message || "Unknown server error",
    });
  }
}

function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
