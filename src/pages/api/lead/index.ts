export const prerender = false;

import type { APIRoute } from "astro";

type AttachmentIn = {
  filename: string;
  contentType: string;
  size: number;
  base64: string; // bez "data:mime;base64,"
};

type LeadPayload = {
  service?: string;
  budget?: string;
  name?: string;
  email?: string;
  message?: string;
  website?: string; // honeypot
  startedAt?: number;
  attachments?: AttachmentIn[] | null;
};

const MAX_FILES = 5;
const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateAttachments(att: AttachmentIn[]) {
  if (att.length > MAX_FILES) throw new Error(`Max ${MAX_FILES} images.`);
  let total = 0;

  for (const a of att) {
    if (!a?.contentType?.startsWith("image/")) {
      throw new Error("Only image attachments are allowed.");
    }
    if (typeof a.size !== "number" || a.size <= 0) {
      throw new Error("Invalid attachment size.");
    }
    if (a.size > MAX_FILE_BYTES) throw new Error("One of the images is too large (max 3MB each).");
    total += a.size;

    if (!a.filename || !a.base64) throw new Error("Invalid attachment payload.");
  }

  if (total > MAX_TOTAL_BYTES) throw new Error("Total attachments size is too large.");
}

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return json(415, { ok: false, error: "Expected JSON." });
    }

    const raw = (await request.json().catch(() => null)) as LeadPayload | null;
    if (!raw) return json(400, { ok: false, error: "Invalid JSON." });

    const service = (raw.service || "").trim();
    const budget = (raw.budget || "").trim();
    const name = (raw.name || "").trim();
    const email = (raw.email || "").trim();
    const message = (raw.message || "").trim();
    const hp = (raw.website || "").trim();
    const startedAt = typeof raw.startedAt === "number" ? raw.startedAt : undefined;

    // Honeypot: bot? udaj sukces i milcz.
    if (hp) return json(200, { ok: true });

    // Zbyt szybkie wysłanie (bot)? udaj sukces.
    if (startedAt && Date.now() - startedAt < 1200) return json(200, { ok: true });

    if (!name || !email || message.length < 10) {
      return json(400, { ok: false, error: "Missing fields (message min. 10 chars)." });
    }
    if (!isEmail(email)) {
      return json(400, { ok: false, error: "Invalid email." });
    }

    const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];
    if (attachments.length) validateAttachments(attachments);

    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    if (!RESEND_API_KEY) {
      // To jest najczęstszy powód “nic nie dochodzi”
      return json(500, { ok: false, error: "Server email is not configured (missing RESEND_API_KEY)." });
    }

    const to = process.env.CONTACT_TO || "hello@kersivo.co.uk";

    // Jeśli masz zweryfikowaną domenę w Resend, ustaw FROM na np. "Kersivo <hello@kersivo.co.uk>"
    // Jeśli nie — użyj onboarding@resend.dev (działa zawsze, ale mniej premium).
    const from = process.env.CONTACT_FROM || "Kersivo <onboarding@resend.dev>";

    const subject = `New inquiry — ${name} (${service || "Service"})`;

    const html = `
      <div style="font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">New inquiry</h2>
        <p style="margin:0 0 10px"><b>Name:</b> ${esc(name)}<br/>
        <b>Email:</b> ${esc(email)}<br/>
        <b>Service:</b> ${esc(service || "-")}<br/>
        <b>Budget:</b> ${esc(budget || "-")}</p>

        <p style="margin:14px 0 6px"><b>Message:</b></p>
        <pre style="white-space:pre-wrap;margin:0;padding:12px;border-radius:10px;background:#f6f6f7;border:1px solid #e6e6ea">${esc(
          message
        )}</pre>

        <p style="margin:14px 0 0;color:#666;font-size:12px">
          Source: kersivo.co.uk contact form
        </p>
      </div>
    `;

    const resendPayload: any = {
      from,
      to: [to],
      subject,
      html,
      reply_to: email,
    };

    if (attachments.length) {
      resendPayload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.base64, // Resend API: base64 string
        content_type: a.contentType,
      }));
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(resendPayload),
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
