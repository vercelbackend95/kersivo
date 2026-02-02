import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * --- Anti-bot / anti-spam knobs ---
 */
const ALLOWED_ORIGINS = new Set([
  "https://kersivo.co.uk",
  "https://www.kersivo.co.uk",
  // opcjonalnie zostaw, jeśli testujesz na vercel preview:
  "https://kersivo.vercel.app",
]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MAX_IN_WINDOW = 6; // max 6 requestów / 10 min / IP

// prościutki in-memory limiter (działa per instancja serverless)
const ipHits = new Map<string, number[]>();

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getIp(req: VercelRequest) {
  const xf = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  const first = xf.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

function isAllowedOrigin(req: VercelRequest) {
  const origin = (req.headers.origin as string | undefined) ?? "";
  if (origin && ALLOWED_ORIGINS.has(origin)) return true;

  // fallback: czasem brak Origin, więc sprawdzamy Referer
  const referer = (req.headers.referer as string | undefined) ?? "";
  if (!referer) return false;

  try {
    const refOrigin = new URL(referer).origin;
    return ALLOWED_ORIGINS.has(refOrigin);
  } catch {
    return false;
  }
}

function rateLimitOk(ip: string) {
  const now = Date.now();
  const arr = ipHits.get(ip) ?? [];
  const fresh = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  ipHits.set(ip, fresh);

  // sprzątanie mapy (żeby nie puchła)
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits.entries()) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) ipHits.delete(k);
    }
  }

  return fresh.length <= RATE_LIMIT_MAX_IN_WINDOW;
}

function looksSpammy(message: string) {
  const msg = message.toLowerCase();

  // za dużo linków = często spam
  const urlCount = (msg.match(/https?:\/\/|www\./g) || []).length;
  if (urlCount >= 2) return true;

  // klasyczne spam-frazy
  const bad = [
    "seo",
    "backlinks",
    "guest post",
    "casino",
    "crypto",
    "forex",
    "viagra",
    "loan",
    "we can rank your website",
    "traffic to your site",
    "whatsapp",
    "telegram",
  ];
  if (bad.some((k) => msg.includes(k))) return true;

  return false;
}

function isValidEmail(email: string) {
  // prosty, praktyczny regex (nie “RFC full”, ale działa)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "https://kersivo.co.uk");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // blokada requestów spoza strony
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  // content-type check (boty często walą byle czym)
  const ct = (req.headers["content-type"] as string | undefined) ?? "";
  if (!ct.includes("application/json")) {
    return res.status(415).json({ ok: false, error: "Unsupported content type" });
  }

  const ip = getIp(req);
  if (!rateLimitOk(ip)) {
    return res.status(429).json({ ok: false, error: "Too many requests" });
  }

  try {
    const { name, email, message, company, website, budget, company_size, hp } = (req.body ?? {}) as Record<
      string,
      any
    >;

    // Honeypot: jeśli uzupełnione → bot. Udaj sukces.
    if (typeof hp === "string" && hp.trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    // Walidacja twarda
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ ok: false, error: "Name is invalid" });
    }

    if (typeof email !== "string" || !isValidEmail(email.trim()) || email.trim().length > 120) {
      return res.status(400).json({ ok: false, error: "Email is invalid" });
    }

    if (typeof message !== "string") {
      return res.status(400).json({ ok: false, error: "Message is required" });
    }

    const msg = message.trim();
    if (msg.length < 10 || msg.length > 2000) {
      return res.status(400).json({ ok: false, error: "Message length is invalid" });
    }

    if (looksSpammy(msg)) {
      // nie zdradzaj botom, że zostały złapane
      return res.status(200).json({ ok: true });
    }

    // Sanitizacja
    const safe = {
      name: escapeHtml(name.trim()),
      email: escapeHtml(email.trim()),
      message: escapeHtml(msg),
      company: typeof company === "string" ? escapeHtml(company.trim()).slice(0, 120) : "",
      website: typeof website === "string" ? escapeHtml(website.trim()).slice(0, 200) : "",
      budget: typeof budget === "string" ? escapeHtml(budget.trim()).slice(0, 80) : "",
      company_size: typeof company_size === "string" ? escapeHtml(company_size.trim()).slice(0, 80) : "",
      ip: escapeHtml(String(ip)),
    };

    // Resend config
    const to = process.env.CONTACT_TO || "hello@kersivo.co.uk";
    const from = process.env.CONTACT_FROM || "Kersivo <hello@kersivo.co.uk>";

    const subject = `New lead — ${safe.name}${safe.company ? ` (${safe.company})` : ""}`;

    const html = `
      <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.55">
        <h2 style="margin:0 0 12px 0;">New contact form lead</h2>

        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${safe.name}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${safe.email}</p>
        ${safe.company ? `<p style="margin:0 0 8px 0;"><strong>Company:</strong> ${safe.company}</p>` : ""}
        ${safe.website ? `<p style="margin:0 0 8px 0;"><strong>Website:</strong> ${safe.website}</p>` : ""}
        ${safe.budget ? `<p style="margin:0 0 8px 0;"><strong>Budget:</strong> ${safe.budget}</p>` : ""}
        ${safe.company_size ? `<p style="margin:0 0 8px 0;"><strong>Company size:</strong> ${safe.company_size}</p>` : ""}

        <hr style="border:none;border-top:1px solid #e7e7e7;margin:16px 0;" />

        <p style="white-space:pre-wrap;margin:0;"><strong>Message:</strong><br/>${safe.message}</p>

        <hr style="border:none;border-top:1px dashed #eee;margin:16px 0;" />
        <p style="margin:0;color:#777;font-size:12px;">IP: ${safe.ip}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: safe.email, // odpisujesz bezpośrednio do leada
    });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
