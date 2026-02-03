import React, { useEffect, useMemo, useRef, useState } from "react";

type ApiOk = { ok: true; id?: string };
type ApiErr = { ok: false; error?: string };

const SERVICE_OPTIONS = ["Website", "Brand + UI", "E-commerce", "Ongoing"] as const;
const BUDGET_OPTIONS = ["Under £2k", "£2k–£5k", "£5k+"] as const;

const API_ENDPOINT = "/api/lead"; // ✅ bez slasha 
// max 3MB na obrazek (bezpiecznie dla body limitów + base64 rośnie)
const MAX_FILE_BYTES = 3 * 1024 * 1024;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function fileToBase64(file: File): Promise<string> {
  // returns base64 (bez "data:mime;base64,")
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export default function ContactForm() {
  const startedAtRef = useRef<number>(Date.now());
  const abortRef = useRef<AbortController | null>(null);

  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]>("Website");
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]>("Under £2k");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // honeypot
  const [hpWebsite, setHpWebsite] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!name.trim()) return false;
    if (!email.trim() || !isEmail(email.trim())) return false;
    if (message.trim().length < 10) return false;
    return true;
  }, [loading, name, email, message]);

  useEffect(() => {
    if (sent && (name || email || message || file)) setSent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, message, file]);

  function calcTimeoutMs(f: File | null) {
    // base 20s, +1.5s per MB, cap 45s
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

    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!n || !em || msg.length < 10) {
      setError("Please fill in all required fields (message min. 10 characters).");
      return;
    }
    if (!isEmail(em)) {
      setError("Please enter a valid email address.");
      return;
    }

    // file checks (opcjonalny obrazek)
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed (PNG/JPG/WebP).");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("Image is too large. Please keep it under 3MB.");
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const timeoutMs = calcTimeoutMs(file);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const attachment =
        file
          ? {
              filename: file.name,
              contentType: file.type,
              size: file.size,
              base64: await fileToBase64(file),
            }
          : null;

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          service,
          budget,
          name: n,
          email: em,
          message: msg,
          website: hpWebsite,
          startedAt: startedAtRef.current,
          attachment, // optional
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;

      if (!res.ok || !data || (data as ApiErr).ok === false) {
        const msg2 =
          (data as ApiErr | null)?.error ||
          `Request failed (${res.status}). Please try again.`;
        throw new Error(msg2);
      }

      setSent(true);
      setFile(null);
      setMessage("");
    } catch (err: any) {
      const msg2 =
        err?.name === "AbortError"
          ? "Timed out. Please try again."
          : err?.message || "Something went wrong. Please try again.";
      setError(msg2);
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
          />
        </div>

        <div className="k-cform__field k-cform__field--wide">
          <label className="k-cform__label" htmlFor="file">
            OPTIONAL IMAGE (max 3MB)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* honeypot (ukryte) */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            value={hpWebsite}
            onChange={(e) => setHpWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="k-cform__actions">
        <button className="k-cform__submit" type="submit" disabled={!canSubmit}>
          {loading ? "Sending..." : "Submit inquiry"}
        </button>

        {sent && <div className="k-cform__success">Sent. We’ll reply shortly.</div>}
        {error && <div className="k-cform__error">{error}</div>}
      </div>
    </form>
  );
}
