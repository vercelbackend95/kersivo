import React, { useEffect, useMemo, useRef, useState } from "react";

type ApiOk = { ok: true; id?: string };
type ApiErr = { ok: false; error?: string };

const SERVICE_OPTIONS = ["Website", "Brand + UI", "E-commerce", "Ongoing"] as const;
const BUDGET_OPTIONS = ["Under £2k", "£2k–£5k", "£5k+"] as const;

const API_ENDPOINT = "/api/lead"; // ✅ bez slasha

// max 3MB (base64 rośnie, ale jesteśmy bezpieczni)
const MAX_FILE_BYTES = 3 * 1024 * 1024;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function fileToBase64(file: File): Promise<string> {
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
  const inFlightRef = useRef(false);

  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]>("Website");
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]>("Under £2k");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // honeypot
  const [hpWebsite, setHpWebsite] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [isDrag, setIsDrag] = useState(false);

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
    const base = 20000;
    if (!f) return base;
    const mb = f.size / (1024 * 1024);
    const extra = Math.ceil(mb * 1500);
    return Math.min(45000, base + extra);
  }

  function validateFile(f: File) {
    if (!f.type.startsWith("image/")) {
      throw new Error("Only image files are allowed (PNG/JPG/WebP).");
    }
    if (f.size > MAX_FILE_BYTES) {
      throw new Error("Image is too large. Please keep it under 3MB.");
    }
  }

  function onPickFile(f: File | null) {
    setError("");
    if (!f) {
      setFile(null);
      return;
    }
    try {
      validateFile(f);
      setFile(f);
    } catch (e: any) {
      setFile(null);
      setError(e?.message || "Invalid file.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!n || !em || msg.length < 10) {
      setError("Please fill in all required fields (message min. 10 characters).");
      inFlightRef.current = false;
      return;
    }
    if (!isEmail(em)) {
      setError("Please enter a valid email address.");
      inFlightRef.current = false;
      return;
    }

    if (file) {
      try {
        validateFile(file);
      } catch (e: any) {
        setError(e?.message || "Invalid file.");
        inFlightRef.current = false;
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
          attachment,
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
      inFlightRef.current = false;
    }
  }

  return (
    <form className="k-cform" onSubmit={onSubmit} noValidate>
      {/* TOP: service + budget */}
      <div className="k-cform__group">
        <div className="k-cform__label">Service</div>
        <div className="k-cform__chips" role="list" aria-label="Service selection">
          {SERVICE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cx("k-cchip", service === opt && "is-on")}
              onClick={() => setService(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="k-cform__group">
        <div className="k-cform__label">Budget</div>
        <div className="k-cform__chips" role="list" aria-label="Budget selection">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cx("k-cchip", budget === opt && "is-on")}
              onClick={() => setBudget(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* NAME + EMAIL */}
      <div className="k-cform__row">
        <div className="k-uline">
          <label className="k-uline__hint" htmlFor="fullName">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id="fullName"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="k-uline">
          <label className="k-uline__hint" htmlFor="email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
          />
        </div>
      </div>

      {/* MESSAGE */}
      <div className="k-uline">
        <label className="k-uline__hint" htmlFor="details">
          Project details <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="details"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder=""
          required
          minLength={10}
        />
      </div>

      {/* UPLOAD */}
      <div className="k-cform__group">
        <div className="k-cform__label">Attach a file (optional)</div>

        <label
          className={cx("k-upload", isDrag && "is-drag")}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDrag(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDrag(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDrag(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDrag(false);
            const f = e.dataTransfer.files?.[0] ?? null;
            onPickFile(f);
          }}
        >
          <input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />

          <div style={{ textAlign: "center", display: "grid", gap: 6 }}>
            <div style={{ color: "rgba(255,255,255,.88)", fontWeight: 650 }}>
              {file ? file.name : "Choose a file or drag and drop here"}
            </div>
            <div style={{ color: "rgba(255,255,255,.58)" }}>
              Tip: include a screenshot or reference image. (max 3MB)
            </div>

            {file && (
              <button
                type="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  onPickFile(null);
                }}
                style={{
                  marginTop: 2,
                  background: "transparent",
                  border: "none",
                  color: "rgba(190,145,255,.92)",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                Remove file
              </button>
            )}
          </div>
        </label>
      </div>

      {/* honeypot */}
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

      {/* ACTIONS */}
      <button className="k-submit" type="submit" disabled={!canSubmit}>
        {loading ? "Sending..." : "Submit inquiry"}
      </button>

      {sent && <div className="k-cform__notice k-cform__notice--ok">Sent. We’ll reply shortly.</div>}
      {error && <div className="k-cform__notice k-cform__notice--err">{error}</div>}

      <div className="k-cform__foot">
        No spam. Just a clean reply. If you prefer: email us directly at{" "}
        <a href="mailto:hello@kersivo.co.uk" style={{ color: "rgba(255,255,255,.86)", borderBottom: "1px solid rgba(255,255,255,.22)" }}>
          hello@kersivo.co.uk
        </a>.
      </div>
    </form>
  );
}
