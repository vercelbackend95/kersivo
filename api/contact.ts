import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// prościutki rate-limit (best effort w serverless)
type Bucket = { count: number; resetAt: number };
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RL_MAX = 8; // 8 prób / 10 min / IP
const rlMap: Map<string, Bucket> =
  (globalThis as any).__kersivo_rl_map || new Map();
(globalThis as any).__kersivo_rl_map = rlMap;

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function getIP(req: Request) {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isValidEmail(email: string) {
  // wystarczająco dobrze na lead form
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toBase64(bytes: Uint8Array) {
  // Node -> Buffer, Edge -> btoa fallback
  // @ts-ignore
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return btoa(bin);
}

function originAllowed(req: Request) {
  const origin = req.headers.get("origin") || "";
  const host = req.headers.get("host") || "";
  const allow =
    origin.includes("http://localhost") ||
    origin.includes("http://127.0.0.1") ||
    origin.includes("https://kersivo.co.uk") ||
    origin.includes("https://www.kersivo.co.uk") ||
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("kersivo.co.uk");
  return allow;
}

function rateLimit(ip: string) {
  const now = Date.now();
  const cur = rlMap.get(ip);

  if (!cur || now > cur.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { ok: true };
  }

  if (cur.count >= RL_MAX) {
    return { ok: false, retryAfterMs: cur.resetAt - now };
  }

  cur.count += 1;
  rlMap.set(ip, cur);
  return { ok: true };
}

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });

    if (!originAllowed(req)) {
      return json(403, { ok: false, error: "Forbidden origin" });
    }

    const ip = getIP(req);
    const rl = rateLimit(ip);
    if (!rl.ok) {
      return json(429, { ok: false, error: "Too many requests. Try again later." });
    }

    const ct = (req.headers.get("content-type") || "").toLowerCase();

    // dane wejściowe
    let service = "";
    let budget = "";
    let name = "";
    let email = "";
    let message = "";
    let website = ""; // honeypot
    let startedAt = 0;
    let file: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      service = String(fd.get("service") || "");
      budget = String(fd.get("budget") || "");
      name = String(fd.get("name") || "");
      email = String(fd.get("email") || "");
      message = String(fd.get("message") || "");
      website = String(fd.get("website") || "");
      startedAt = Number(fd.get("startedAt") || 0);

      const f = fd.get("file");
      if (f && typeof f === "object") file = f as File;
    } else {
      const body = await req.json().catch(() => ({} as any));
      service = String(body.service || "");
      budget = String(body.budget || "");
      name = String(body.name || "");
      email = String(body.email || "");
      message = String(body.message || "");
      website = String(body.website || "");
      startedAt = Number(body.startedAt || 0);
      // (JSON fallback – bez pliku)
    }

    // honeypot: jak coś tu jest -> bot. Udajemy sukces, żeby bot nie “uczył się” błędu.
    if (website && website.trim().length > 0) {
      return json(200, { ok: true, id: "ignored-bot" });
    }

    // time trap: człowiek nie klika w 50ms
    const tookMs = Date.now() - (startedAt || Date.now());
    if (tookMs < 1800) {
      return json(200, { ok: true, id: "ignored-too-fast" });
    }

    // walidacja
    if (!name.trim() || !email.trim() || !message.trim()) {
      return json(400, { ok: false, error: "Missing required fields" });
    }
    if (!isValidEmail(email.trim())) {
      return json(400, { ok: false, error: "Invalid email" });
    }
    if (message.trim().length < 10) {
      return json(400, { ok: false, error: "Message too short" });
    }

    // attachment (prawdziwy)
    const attachments: Array<{ filename: string; content: string }> = [];
    if (file) {
      const maxBytes = 8 * 1024 * 1024; // 8MB (bezpiecznie)
      if (file.size > maxBytes) {
        return json(413, { ok: false, error: "File too large (max 8MB)." });
      }

      const ab = await file.arrayBuffer();
      const base64 = toBase64(new Uint8Array(ab));
      attachments.push({
        filename: file.name || "attachment",
        content: base64,
      });
    }

    const to = process.env.CONTACT_TO_EMAIL || "hello@kersivo.co.uk";
    const subject = `New lead — ${name.trim()}`;

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">New contact form lead</h2>
        <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 8px"><strong>Service:</strong> ${escapeHtml(service || "—")}</p>
        <p style="margin:0 0 16px"><strong>Budget:</strong> ${escapeHtml(budget || "—")}</p>
        <div style="padding:12px 14px;border:1px solid rgba(0,0,0,.08);border-radius:12px">
          <div style="font-weight:600;margin-bottom:6px">Message</div>
          <div style="white-space:pre-wrap">${escapeHtml(message)}</div>
        </div>
        <p style="margin:14px 0 0;color:rgba(0,0,0,.55);font-size:12px">IP: ${escapeHtml(ip)}</p>
      </div>
    `.trim();

    const text = [
      "New contact form lead",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Service: ${service || "—"}`,
      `Budget: ${budget || "—"}`,
      "",
      "Message:",
      message,
      "",
      attachments.length ? `Attachment: included (${attachments[0].filename})` : "",
      `IP: ${ip}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await resend.emails.send({
      from: "Kersivo <hello@kersivo.co.uk>",
      to,
      subject,
      replyTo: email.trim(),
      html,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) return json(500, { ok: false, error: error.message });

    return json(200, { ok: true, id: data?.id });
  } catch (err: any) {
    return json(500, { ok: false, error: err?.message || "Unknown server error" });
  }
}
