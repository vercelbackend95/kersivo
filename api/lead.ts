import type { VercelRequest, VercelResponse } from "@vercel/node";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "hello@kersivo.co.uk";
  if (!key) return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });

  const { service = "", budget = "", name = "", email = "", message = "" } = (req.body || {}) as any;

  if (!name?.trim() || !email?.trim() || !message?.trim())
    return res.status(400).json({ ok: false, error: "Missing required fields" });

  if (!isValidEmail(email.trim()))
    return res.status(400).json({ ok: false, error: "Invalid email" });

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kersivo <hello@kersivo.co.uk>",
        to,
        subject: `New lead — ${name.trim()}`,
        reply_to: email.trim(),
        text: `Name: ${name}\nEmail: ${email}\nService: ${service}\nBudget: ${budget}\n\n${message}\n`,
      }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));

    const out = await r.json().catch(() => null);

    if (!r.ok) {
      return res.status(500).json({ ok: false, error: out?.message || out?.error || `Resend failed (${r.status})` });
    }

    return res.status(200).json({ ok: true, id: out?.id });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Email send timed out" : e?.message || "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
