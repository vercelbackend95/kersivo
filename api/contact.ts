import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, email, message, company, website, budget, hp } = req.body ?? {};

    // Honeypot (bot trap)
    if (typeof hp === "string" && hp.trim().length > 0) {
      return res.status(200).json({ ok: true }); // udajemy sukces, żeby bot nie próbował dalej
    }

    // Walidacja
    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ ok: false, error: "Name is required" });
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }
    if (typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({ ok: false, error: "Message is too short" });
    }

    const safe = {
      name: escapeHtml(name.trim()),
      email: escapeHtml(email.trim()),
      message: escapeHtml(message.trim()),
      company: typeof company === "string" ? escapeHtml(company.trim()) : "",
      website: typeof website === "string" ? escapeHtml(website.trim()) : "",
      budget: typeof budget === "string" ? escapeHtml(budget.trim()) : "",
    };

    const to = process.env.CONTACT_TO || "hello@kersivo.co.uk";
    const from = process.env.CONTACT_FROM || "Kersivo <hello@kersivo.co.uk>";

    const subject = `New lead — ${safe.name}${safe.company ? " (" + safe.company + ")" : ""}`;

    const html = `
      <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px 0;">New contact form lead</h2>
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${safe.name}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${safe.email}</p>
        ${safe.company ? `<p style="margin:0 0 8px 0;"><strong>Company:</strong> ${safe.company}</p>` : ""}
        ${safe.website ? `<p style="margin:0 0 8px 0;"><strong>Website:</strong> ${safe.website}</p>` : ""}
        ${safe.budget ? `<p style="margin:0 0 8px 0;"><strong>Budget:</strong> ${safe.budget}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e7e7e7;margin:16px 0;" />
        <p style="white-space:pre-wrap;margin:0;"><strong>Message:</strong><br/>${safe.message}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: safe.email, // mega ważne: odpisujesz bezpośrednio klientowi
    });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
