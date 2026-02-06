import React, { useMemo, useRef, useState } from "react";

type ApiOk = { ok: true; id?: string };
type ApiErr = { ok: false; error?: string };

const SERVICE_OPTIONS = ["Website", "Brand + UI", "E-commerce", "Ongoing"] as const;
const BUDGET_OPTIONS = ["Under £2k", "£2k–£5k", "£5k+"] as const;

const API_ENDPOINT = "/api/lead"; // ✅ bez końcowego slasha

const MAX_FILES = 5;
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB per image
const MAX_TOTAL_BYTES = 8 * 1024 * 1024; // ~8MB total (base64 urośnie)

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function fileToBase64(file: File): Promise<string> {
  // base64 bez "data:mime;base64,"
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function filesKey(f: File) {
  return `${f.name}|${f.size}|${f.lastModified}`;
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

  const [files, setFiles] = useState<File[]>([]);
  const [isDrag, setIsDrag] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  function clearSentOnEdit() {
    if (sent) setSent(false);
  }

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!name.trim()) return false;
    if (!email.trim() || !isEmail(email.trim())) return false;
    if (message.trim().length < 10) return false;
    return true;
  }, [loading, name, email, message]);

  function validateFiles(next: File[]) {
    if (next.length > MAX_FILES) {
      throw new Error(`Max ${MAX_FILES} images.`);
    }

    let total = 0;

    for (const f of next) {
      if (!f.type.startsWith("image/")) {
        throw new Error("Only image files are allowed (PNG/JPG/WebP).");
      }
      if (f.size > MAX_FILE_BYTES) {
        throw new Error("One of the images is too large. Keep each under 3MB.");
      }
      total += f.size;
    }

    if (total > MAX_TOTAL_BYTES) {
      throw new Error("Total attachments size is too large. Try fewer/smaller images.");
    }
  }

  function addFiles(incoming: File[]) {
    if (sent) setSent(false);
    setError("");

    const merged = [...files];
    const seen = new Set(merged.map(filesKey));

    for (const f of incoming) {
      const k = filesKey(f);
      if (seen.has(k)) continue;
      merged.push(f);
      seen.add(k);
    }

    const sliced = merged.slice(0, MAX_FILES);

    try {
      validateFiles(sliced);
      setFiles(sliced);
    } catch (e: any) {
      setError(e?.message || "Invalid files.");
    }
  }

  function removeFile(idx: number) {
    if (sent) setSent(false);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearAllFiles() {
    setFiles([]);
  }

  function calcTimeoutMs(totalBytes: number) {
    const base = 20000;
    const mb = totalBytes / (1024 * 1024);
    const extra = Math.ceil(mb * 1500);
    return Math.min(45000, base + extra);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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

    if (files.length) {
      try {
        validateFiles(files);
      } catch (e: any) {
        setError(e?.message || "Invalid files.");
        inFlightRef.current = false;
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const timeoutMs = calcTimeoutMs(totalBytes);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const attachments =
        files.length
          ? await Promise.all(
              files.map(async (f) => ({
                filename: f.name,
                contentType: f.type,
                size: f.size,
                base64: await fileToBase64(f),
              }))
            )
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
          attachments,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;

      if (!res.ok || !data || (data as ApiErr).ok === false) {
        const msg2 =
          (data as ApiErr | null)?.error || `Request failed (${res.status}). Please try again.`;
        throw new Error(msg2);
      }

      setSent(true);

      clearAllFiles();
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

  const submitLabel = sent
    ? { title: "Message received.", sub: "We’ll reply within 24 hours." }
    : loading
      ? { title: "Sending…", sub: "One moment — delivering your message." }
      : { title: "Submit inquiry", sub: "We reply fast — usually same day." };

  return (
    <form className="k-cform" onSubmit={onSubmit} noValidate>
      <div className="k-cform__group">
        <div className="k-cform__label">Service</div>
        <div className="k-cform__chips" role="list" aria-label="Service selection">
          {SERVICE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cx("k-cchip", service === opt && "is-on")}
              onClick={() => {
                clearSentOnEdit();
                setService(opt);
              }}
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
              onClick={() => {
                clearSentOnEdit();
                setBudget(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

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
            onChange={(e) => {
              clearSentOnEdit();
              setName(e.target.value);
            }}
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
            onChange={(e) => {
              clearSentOnEdit();
              setEmail(e.target.value);
            }}
            required
          />
        </div>
      </div>

      <div className="k-uline">
        <label className="k-uline__hint" htmlFor="details">
          Project details <span aria-hidden="true">*</span>
        </label>
<textarea
  id="details"
  name="message"
  value={message}
  placeholder="Briefly describe your project — what you need, your business goals, and any inspirations/links."
  onChange={(e) => {
    clearSentOnEdit();
    setMessage(e.target.value);
  }}
  required
  minLength={10}
/>

      </div>

      <div className="k-cform__group">
        <div className="k-cform__label">Attach files (optional)</div>

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
            addFiles(Array.from(e.dataTransfer.files ?? []));
          }}
        >
          <input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />

          <div style={{ textAlign: "center", display: "grid", gap: 6 }}>
            <div style={{ color: "rgba(255,255,255,.88)", fontWeight: 650 }}>
              {files.length
                ? `${files.length} file(s) selected`
                : "Choose up to 5 images or drag and drop here"}
            </div>
            <div style={{ color: "rgba(255,255,255,.58)" }}>
              Tip: include screenshots or reference images. (max 3MB each)
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 6, textAlign: "left" }}>
                {files.map((f, idx) => (
                  <div
                    key={filesKey(f)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(255,255,255,.03)",
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(255,255,255,.84)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={f.name}
                    >
                      {f.name}
                    </div>

                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault();
                        removeFile(idx);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(190,145,255,.92)",
                        fontWeight: 650,
                        cursor: "pointer",
                        flex: "0 0 auto",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (sent) setSent(false);
                    clearAllFiles();
                  }}
                  style={{
                    marginTop: 4,
                    background: "transparent",
                    border: "none",
                    color: "rgba(190,145,255,.92)",
                    fontWeight: 650,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  Remove all
                </button>
              </div>
            )}
          </div>
        </label>
      </div>

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

      <button
        className={cx("k-submit", sent && "is-sent", loading && "is-loading")}
        type="submit"
        disabled={loading || sent || !canSubmit}
        aria-live="polite"
      >
        <span className="k-submit__content">
          <span className="k-submit__row">
            {sent && (
              <span className="k-submit__icon" aria-hidden="true">
                ✓
              </span>
            )}
            <span className="k-submit__title">{submitLabel.title}</span>
          </span>
          <span className="k-submit__sub">{submitLabel.sub}</span>
        </span>
      </button>

      {error && <div className="k-cform__notice k-cform__notice--err">{error}</div>}

      <div className="k-cform__foot">
        No spam. Just a clean reply. If you prefer: email us directly at{" "}
        <a
          href="mailto:hello@kersivo.co.uk"
          style={{
            color: "rgba(255,255,255,.86)",
            borderBottom: "1px solid rgba(255,255,255,.22)",
          }}
        >
          hello@kersivo.co.uk
        </a>
        .
      </div>
    </form>
  );
}
