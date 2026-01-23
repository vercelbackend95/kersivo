import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  emailTo?: string;
};

type Service = "Website" | "Brand + UI" | "E-commerce" | "Ongoing";
type Budget = "Under £2k" | "£2k–£5k" | "£5k+";

const SERVICES: Service[] = ["Website", "Brand + UI", "E-commerce", "Ongoing"];
const BUDGETS: Budget[] = ["Under £2k", "£2k–£5k", "£5k+"];

function encodeMailto(str: string) {
  // keep it compatible with mail clients (space -> %20 etc.)
  return encodeURIComponent(str).replace(/%0A/g, "%0D%0A");
}

function nowTag() {
  // tiny stamp for subject
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yy}`;
}

export default function ContactForm({ emailTo = "hello@kersivo.co.uk" }: Props) {
  const [service, setService] = useState<Service>("Website");
  const [budget, setBudget] = useState<Budget>("Under £2k");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const [fileName, setFileName] = useState<string>("");
  const [isDrag, setIsDrag] = useState(false);

  const [toast, setToast] = useState<{ title: string; note?: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const requiredOk = fullName.trim().length > 1 && email.trim().includes("@") && details.trim().length > 10;

  function pingHighlightSweep() {
    const frame = document.querySelector("[data-contact-frame]");
    if (!frame) return;
    frame.classList.remove("is-highlight");
    // force reflow so animation can retrigger
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (frame as HTMLElement).offsetHeight;
    frame.classList.add("is-highlight");
    window.setTimeout(() => frame.classList.remove("is-highlight"), 980);
  }

  function showToast(title: string, note?: string) {
    setToast({ title, note });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }

  function buildBrief() {
    const lines = [
      "New inquiry — Kersivo",
      "---------------------",
      `Service: ${service}`,
      `Budget: ${budget}`,
      "",
      `Full name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
      "",
      "Project details:",
      details.trim(),
      "",
      `Attachment (optional): ${fileName || "—"}`,
      "",
      "—",
      "Sent from kersivo.co.uk contact form",
    ];
    return lines.join("\n");
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredOk) {
      showToast("Missing details", "Please complete the required fields.");
      return;
    }

    const brief = buildBrief();
    const subject = `Kersivo inquiry — ${service} — ${nowTag()}`;
    const href = `mailto:${emailTo}?subject=${encodeMailto(subject)}&body=${encodeMailto(brief)}`;

    // premium flourish (matches CSS sweep)
    if (!reducedMotion) pingHighlightSweep();

    // copy brief so the user can paste it even if their mail client is weird
    const copied = await copyToClipboard(brief);

    // open mail client
    window.location.href = href;

    showToast("Opening your email client…", copied ? "Brief copied to clipboard." : "Copy blocked — you can still send via email.");
  }

  function onFilePicked(files: FileList | null | undefined) {
    const f = files?.[0];
    if (!f) {
      setFileName("");
      return;
    }
    setFileName(f.name);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDrag(false);
    const files = e.dataTransfer.files;
    if (fileInputRef.current) {
      fileInputRef.current.files = files;
    }
    onFilePicked(files);
  }

  return (
    <form className="k-cform" onSubmit={onSubmit} noValidate>
      {/* Service */}
      <div className="k-cform__group">
        <div className="k-cform__label">Service</div>
        <div className="k-cform__chips" role="radiogroup" aria-label="Service">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              className={`k-cchip ${service === s ? "is-on" : ""}`}
              role="radio"
              aria-checked={service === s}
              onClick={() => setService(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="k-cform__group">
        <div className="k-cform__label">Budget</div>
        <div className="k-cform__chips" role="radiogroup" aria-label="Budget">
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              className={`k-cchip ${budget === b ? "is-on" : ""}`}
              role="radio"
              aria-checked={budget === b}
              onClick={() => setBudget(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Name / Email */}
      <div className="k-cform__row">
        <label className="k-uline">
          <span className="k-uline__hint">Full name *</span>
          <input
            type="text"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder=""
            required
          />
        </label>

        <label className="k-uline">
          <span className="k-uline__hint">Email *</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
          />
        </label>
      </div>

      {/* Details */}
      <label className="k-uline">
        <span className="k-uline__hint">Project details *</span>
        <textarea
          name="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder=""
          required
        />
      </label>

      {/* Upload */}
      <div className="k-cform__group">
        <div className="k-cform__label">Attach a file <span style={{ opacity: 0.7, fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>(optional)</span></div>

        <div
          className={`k-upload ${isDrag ? "is-drag" : ""}`}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDrag(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDrag(true);
          }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={onDrop}
          aria-label="File upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            onChange={(e) => onFilePicked(e.target.files)}
            aria-label="Choose a file"
          />
          <div style={{ textAlign: "center", lineHeight: 1.25 }}>
            <div style={{ fontWeight: 650, color: "rgba(255,255,255,.78)" }}>
              {fileName ? fileName : "Choose a file or drag and drop here"}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,.55)" }}>
              {fileName ? "Note: files aren’t sent automatically — we’ll request it if needed." : "Tip: include a PDF brief, screenshots, or a sitemap."}
            </div>
          </div>
        </div>
      </div>

      <button className="k-submit" type="submit" disabled={!requiredOk}>
        Submit inquiry
      </button>

      <div className="k-cform__foot">
        No spam. Just a clean reply. If you prefer: email us directly at{" "}
        <a href={`mailto:${emailTo}`} style={{ color: "rgba(255,255,255,.82)", textDecoration: "underline", textUnderlineOffset: 3 }}>
          {emailTo}
        </a>
        .
      </div>

      {/* tiny toast (inline styles so you don't need another CSS file) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            maxWidth: 360,
            padding: "12px 12px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(10, 12, 18, .72)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 26px 120px rgba(0,0,0,.45)",
          }}
        >
          <div style={{ fontWeight: 780, letterSpacing: "-0.01em", color: "rgba(255,255,255,.92)" }}>
            {toast.title}
          </div>
          {toast.note && (
            <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.35, color: "rgba(255,255,255,.64)" }}>
              {toast.note}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
