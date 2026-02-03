// api/contact.ts
type Bucket = { count: number; resetAt: number };

const RL_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RL_MAX = 8; // 8 tries / 10 min / IP
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

function withTimeout<T>(p: Promise<T>, ms: number, msg: string) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);

  // jeśli promise potrafi przyjąć signal – użyjemy go w fetch poniżej,
  // tutaj timeout łapie też “wiszące” rzeczy przez Promise.race
  return Promise.race<T>([
    p.finally(() => clearTimeout(t)),
    new Promise<T>((_, rej) => {
      const tt = setTimeout(() => rej(new Error(msg)), ms);
      // double safety
      void tt;
    }),
  ]);
}

function getIP(req: Request) {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimit(ip: string) {
  const now = Date.now();
  const cur = rlMap.get(ip);

  if (!cur || now > cur.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { ok: true };
  }

  if (cur.count >= RL_MAX) return { ok: false };

  cur.count += 1;
  rlMap.set(ip, cur);
  return { ok: true };
}

function isValidEmail(email: string) {
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
  // Edge ma btoa
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return btoa(bin);
}

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });

    const ip = getIP(req);
    const rl = rateLimit(ip);
    if (!rl.ok) return json(429, { ok: false, error: "Too many requests. Try again later." });

    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    if (!RESEND_API_KEY) {
      return json(500, { ok: false, error: "Missing RESEND_API_KEY in environment." });
    }

    const ct = (req.headers.get("content-type") || "").toLowerCase();

    let service = "";
    let budget = "";
    let name = "";
    let email = "";
    let message = "";
    let website = ""; // honeypot
    let startedAt = 0;
    let file: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await withTimeout(req.formData(), 7000, "Form parsing timed out");
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
      const body = await withTimeout(req.json().catch(() => ({} as any)), 4000, "JSON parsing timed out");
      service = String(body.service || "");
      budget = String(body.budget || "");
      name = String(body.name || "");
      email = String(body.email || "");
      message = String(body.message || "");
      website = String(body.website || "");
      startedAt = Number(body.startedAt || 0);
    }

    // honeypot
    if (website && website.trim().length > 0) {
      return json(200, { ok: true, id: "ignored-bot" });
    }

    // time trap
    const tookMs = Date.now() - (startedAt || Date.now());
    if (tookMs < 1800) {
      return json(200, { ok: true, id: "ignored-too-fast" });
    }

    // validate
    if (!name.trim() || !email.trim() || !message.trim()) {
      return json(400, { ok: false, error: "Missing required fields." });
    }
    if (!isValidEmail(email.trim())) {
      return json(400, { ok: false, error: "Invalid email." });
    }
    if (message.trim().length < 10) {
      return json(400, { ok: false, error: "Message too short." });
    }

    // attachment (optional)
    const attachments: Array<{ filename: string; content: string }> = [];
    if (file) {
      const maxBytes = 8 * 1024 * 1024; // 8MB
      if (file.size > maxBytes) {
        return json(413, { ok: false, error: "File too large (max 8MB)." });
      }
      const ab = await withTimeout(file.arrayBuffer(), 7000, "Reading file timed out");
      const base64 = toBase64(new Uint8Array(ab));
      attachments.push({ filename: file.name || "attachment", content: base64 });
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

    const payload: any = {
      from: "Kersivo <hello@kersivo.co.uk>",
      to,
      subject,
      reply_to: email.trim(),
      html,
      text: `Name: ${name}\nEmail: ${email}\nService: ${service}\nBudget: ${budget}\n\n${message}\n`,
      ...(attachments.length ? { attachments } : {}),
    };

    // send via Resend REST (Edge-safe)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 9000);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(t));

    const resendJson = await resendRes.json().catch(() => null);

    if (!resendRes.ok) {
      const msg =
        resendJson?.message ||
        resendJson?.error ||
        `Resend failed (${resendRes.status})`;
      return json(500, { ok: false, error: msg });
    }

    return json(200, { ok: true, id: resendJson?.id });
  } catch (err: any) {
    const msg =
      err?.name === "AbortError"
        ? "Email send timed out."
        : err?.message || "Unknown server error";
    return json(500, { ok: false, error: msg });
  }
}
