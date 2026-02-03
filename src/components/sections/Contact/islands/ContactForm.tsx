import React, { useEffect, useMemo, useRef, useState } from "react";

type ApiOk = { ok: true; id?: string };
type ApiErr = { ok: false; error?: string };

const SERVICE_OPTIONS = ["Website", "Brand + UI", "E-commerce", "Ongoing"] as const;
const BUDGET_OPTIONS = ["Under £2k", "£2k–£5k", "£5k+"] as const;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ContactForm() {
  const startedAtRef = useRef<number>(Date.now());
  const abortRef = useRef<AbortController | null>(null);

  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]>("Website");
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]>("Under £2k");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // honeypot – boty kochają wypełniać ukryte pola
  const [hpWebsite, setHpWebsite] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (message.trim().length < 10) return false;
    return true;
  }, [loading, name, email, message]);

  useEffect(() => {
    if (sent && (name || email || message || file)) setSent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, message, file]);

  function calcTimeoutMs(f: File | null) {
    // base 20s, +1.5s per MB, cap 45s (żeby Vercel/Resend miały oddech)
    const base = 20000;
    if (!f) return base;
    const mb = f.size / (1024 * 1024);
    const extra = Math.ceil(mb * 1500);
    return Math.min(45000, base + extra);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setError("Please fill in all required fields (message min. 10 characters).");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const timeoutMs = calcTimeoutMs(file);
    const timeout = setTimeout(() => controller.abort(), 25000);


    try {
      const hasFile = Boolean(file);

      const res = await fetch("/api/contact", {
        method: "POST",
        signal: controller.signal,
        ...(hasFile
          ? {
              body: (() => {
                const fd = new FormData();
                fd.append("service", service);
                fd.append("budget", budget);
                fd.append("name", name.trim());
                fd.append("email", email.trim());
                fd.append("message", message.trim());
                fd.append("website", hpWebsite);
                fd.append("startedAt", String(startedAtRef.current));
                if (file) fd.append("file", file, file.name);
                return fd;
              })(),
            }
          : {
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                service,
                budget,
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                website: hpWebsite,
                startedAt: startedAtRef.current,
              }),
            }),
      });

      const data = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;

      if (!res.ok || !data || (data as ApiErr).ok === false) {
        const msg =
          (data as ApiErr | null)?.error ||
          `Request failed (${res.status}). Please try again.`;
        throw new Error(msg);
      }

      setSent(true);
      setFile(null);
      setMessage("");
    } catch (err: any) {
      const msg =
        err?.name === "AbortError"
          ? "Timed out. Please try again."
          : err?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <form className="k-cform" onSubmit={onSubmit} noValidate>
      <div className="k-cform__top">
        <div className="k-cform__group">
          <div className="k-cform__label">SERVICE</div>
          <div className="k-cform__chips" role="list" aria-label="Service selection">
            {SERVICE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cx("k-chip", service === opt && "is-active")}
                onClick={() => setService(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="k-cform__group">
          <div className="k-cform__label">BUDGET</div>
          <div className="k-cform__chips" role="list" aria-label="Budget selection">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cx("k-chip", budget === opt && "is-active")}
                onClick={() => setBudget(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="k-cform__grid">
        <div className="k-cform__field">
          <label className="k-cform__label" htmlFor="fullName">
            FULL NAME <span aria-hidden="true">*</span>
          </label>
          <input
            id="fullName"
            name="name"
            type="text"
            autoComplete="name"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="k-cform__field">
          <label className="k-cform__label" htmlFor="email">
            EMAIL <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="k-cform__field k-cform__field--wide">
          <label className="k-cform__label" htmlFor="details">
            PROJECT DETAILS <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="details"
            name="message"
            placeholder=""
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
          />
        </div>

        {/* honeypot (ukryte) */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={hpWebsite}
            onChange={(e) => setHpWebsite(e.target.value)}
          />
        </div>

        <div className="k-cform__upload k-cform__field--wide">
          <div className="k-cform__uploadInner">
            <div className="k-cform__uploadTitle">Choose a file or drag and drop here</div>
            <div className="k-cform__uploadHint">Tip: include a PDF brief, screenshots, or a sitemap.</div>

            <input
              className="k-cform__file"
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.zip"
            />

            {file ? (
              <div className="k-cform__uploadMeta" aria-live="polite">
                Selected: <strong>{file.name}</strong>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <button className="k-cform__cta" type="submit" disabled={!canSubmit}>
        {loading ? "Sending…" : "Submit inquiry"}
      </button>

      <div className="k-cform__foot" aria-live="polite">
        {sent ? (
          <span>Sent. Clean and simple — we’ll reply soon.</span>
        ) : error ? (
          <span style={{ color: "rgba(255,90,90,.95)" }}>{error}</span>
        ) : (
          <span>
            No spam. Just a clean reply. If you prefer: email us directly at{" "}
            <a href="mailto:hello@kersivo.co.uk">hello@kersivo.co.uk</a>.
          </span>
        )}
      </div>
    </form>
  );
}
