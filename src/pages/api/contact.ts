// src/pages/api/contact.ts
export const prerender = false;

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
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
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return btoa(bin);
}

export async function POST({ request }: { request: Request }) {
  try {
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || "";
    const CONTACT_TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || "hello@kersivo.co.uk";

    if (!RESEND_API_KEY) {
      return json(500, { ok: false, error: "Missing RESEND_API_KEY" });
    }

    const ct = (request.headers.get("content-type") || "").toLowerCase();

    let service = "";
    let budget = "";
    let name = "";
    let email = "";
    let message = "";
    let file: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await request.formData();
      service = String(fd.get("service") || "");
      budget = String(fd.get("budget") || "");
      name = String(fd.get("name") || "");
      email = String(fd.get("email") || "");
      message = String(fd.get("message") || "");
      const f = fd.get("file");
      if (f && typeof f === "object") file = f as File;
    } else {
      const body = await request.json().catch(() => ({} as any));
      service = String(body.service || "");
      budget = String(body.budget || "");
      name = String(body.name || "");
      email = String(body.email || "");
      message = String(body.message || "");
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      return json(400, { ok: false, error: "Missing required fields" });
    }
    if (!isValidEmail(email.trim())) {
      return json(400, { ok: false, error: "Invalid email" });
    }

    const attachments: Array<{ filename: string; content: string }> = [];
    if (file) {
      const maxBytes = 8 * 1024 * 1024;
      if (file.size > maxBytes) return json(413, { ok: false, error: "File too large (max 8MB)" });

      const ab = await file.arrayBuffer();
      const base64 = toBase64(new Uint8Array(ab));
      attachments.push({ filename: file.name || "attachment", content: base64 });
    }

    const payload: any = {
      from: "Kersivo <hello@kersivo.co.uk>",
      to: CONTACT_TO_EMAIL,
      subject: `New lead — ${name.trim()}`,
      reply_to: email.trim(),
      html: `
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
        </div>
      `.trim(),
      text: `Name: ${name}\nEmail: ${email}\nService: ${service}\nBudget: ${budget}\n\n${message}\n`,
      ...(attachments.length ? { attachments } : {}),
    };

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));

    const out = await r.json().catch(() => null);

    if (!r.ok) {
      return json(500, { ok: false, error: out?.message || out?.error || `Resend failed (${r.status})` });
    }

    return json(200, { ok: true, id: out?.id });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Email send timed out." : e?.message || "Server error";
    return json(500, { ok: false, error: msg });
  }
}
