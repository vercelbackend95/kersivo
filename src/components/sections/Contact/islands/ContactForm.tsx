import React, { useMemo, useRef, useState } from "react";

type Props = {
  emailTo?: string; // kompatybilność z Contact.astro
};

const SERVICES = ["Website", "Brand + UI", "E-commerce", "Ongoing"] as const;
const BUDGETS = ["Under £2k", "£2k–£5k", "£5k+"] as const;

const MAX_FILE_MB = 5;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export default function ContactForm(_props: Props) {
  const startedAtRef = useRef<number>(Date.now());

  const [service, setService] = useState<(typeof SERVICES)[number]>("Website");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]>("Under £2k");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Bot trap
  const [hp, setHp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = email.trim().includes("@");
    const okDetails = details.trim().length >= 10;
    return okName && okEmail && okDetails && !isSubmitting;
  }, [name, email, details, isSubmitting]);

  function validateFile(f: File | null) {
    if (!f) return { ok: true, msg: "" };

    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_MB) {
      return { ok: false, msg: `File too big. Max ${MAX_FILE_MB}MB.` };
    }
    if (f.type && !ALLOWED_MIME.has(f.type)) {
      return { ok: false, msg: "Unsupported file type. Use PDF / PNG / JPG / WebP." };
    }
    return { ok: true, msg: "" };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setStatus("idle");
    setErrorMsg("");

    // Timing bait — boty klikają “instant”
    const elapsed = Date.now() - startedAtRef.current;
    if (elapsed < 900) {
      setStatus("ok");
      return;
    }

    const vf = validateFile(file);
    if (!vf.ok) {
      setStatus("error");
      setErrorMsg(vf.msg);
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.set("name", name.trim());
      fd.set("email", email.trim());
      fd.set("service", service);
      fd.set("budget", budget);
      fd.set("details", details.trim());
      fd.set("hp", hp); // musi być puste
      fd.set("startedAt", String(startedAtRef.current)); // backend zrobi sanity-check
      if (file) fd.set("attachment", file, file.name);

      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd, // UWAGA: nie ustawiamy Content-Type ręcznie
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("ok");
      setName("");
      setEmail("");
      setDetails("");
      setFile(null);
      setFileName("");
      setHp("");
      startedAtRef.current = Date.now();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="k-cform" onSubmit={onSubmit} noValidate>
      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Do not fill this field
          <input
            type="text"
            name="hp"
            autoComplete="off"
            tabIndex={-1}
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </label>
      </div>

      {/* SERVICE */}
      <div className="k-cform__group">
        <div className="k-cform__label">SERVICE</div>
        <div className="k-cform__chips" role="tablist" aria-label="Service">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              className={`k-cchip ${service === s ? "is-active" : ""}`}
              onClick={() => setService(s)}
              aria-pressed={service === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* BUDGET */}
      <div className="k-cform__group">
        <div className="k-cform__label">BUDGET</div>
        <div className="k-cform__chips" role="tablist" aria-label="Budget">
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              className={`k-cchip ${budget === b ? "is-active" : ""}`}
              onClick={() => setBudget(b)}
              aria-pressed={budget === b}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* ROW */}
      <div className="k-cform__row">
        <div className="k-uline">
          <label className="k-uline__label" htmlFor="fullName">
            FULL NAME <span aria-hidden="true">*</span>
          </label>
          <input
            id="fullName"
            className="k-uline__input"
            type="text"
            placeholder=""
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div className="k-uline">
          <label className="k-uline__label" htmlFor="email">
            EMAIL <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            className="k-uline__input"
            type="email"
            placeholder=""
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* DETAILS */}
      <div className="k-cform__group">
        <div className="k-uline">
          <label className="k-uline__label" htmlFor="details">
            PROJECT DETAILS <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="details"
            className="k-uline__textarea"
            placeholder=""
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            minLength={10}
          />
        </div>
      </div>

      {/* UPLOAD */}
      <div className="k-cform__group">
        <div className="k-cform__label">
          ATTACH A FILE <span style={{ opacity: 0.7 }}>(optional)</span>
        </div>

        <label className="k-upload">
          <input
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              setFileName(f?.name || "");
            }}
          />
          <div className="k-upload__box">
            <div className="k-upload__title">
              {fileName ? `Selected: ${fileName}` : "Choose a file or drag and drop here"}
            </div>
            <div className="k-upload__hint">
              Tip: include a PDF brief, screenshots, or a sitemap. (Max {MAX_FILE_MB}MB)
            </div>
          </div>
        </label>
      </div>

      {/* SUBMIT */}
      <button className="k-submit" type="submit" disabled={!canSubmit} aria-busy={isSubmitting}>
        <span className="k-submit__text">{isSubmitting ? "Sending…" : "Submit inquiry"}</span>
        <span className="k-submit__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M4.5 10h9.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M11.2 6.8 14.5 10l-3.3 3.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* FOOT */}
      <div className="k-cform__foot">
        {status === "ok" ? (
          <span>Sent. Clean and simple — we’ll reply soon.</span>
        ) : status === "error" ? (
          <span style={{ color: "rgba(255,120,120,.95)" }}>
            {errorMsg || "Couldn’t send. Try again."}
          </span>
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
