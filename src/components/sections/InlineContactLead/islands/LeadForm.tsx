import React, { useRef, useState } from "react";

const API_ENDPOINT = "/api/lead";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type LeadFormProps = {
  /** Page path for CRM/email attribution (e.g. /packages). */
  source?: string;
};

export default function LeadForm({ source = "/" }: LeadFormProps) {
  const startedAtRef = useRef<number>(Date.now());
  const inFlightRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [hpField, setHpField] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim().length > 0 && isEmail(email) && message.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading || sent || inFlightRef.current) return;
    if (hpField) return; // honeypot

    const elapsed = Date.now() - startedAtRef.current;
    if (elapsed < 1400) return; // bot guard

    inFlightRef.current = true;
    setLoading(true);
    setError("");

    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        website: website.trim(),
        message: message.trim(),
        service: "Website",
        budget: "",
        _hp: hpField,
        _source: source,
      };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `Error ${res.status}`);
      }

      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  if (sent) {
    return (
      <div className="ks-lead__form" aria-live="polite">
        <p className="ks-lead__notice ks-lead__notice--ok">
          <strong>Message received.</strong> We will reply within 12 hours with a clear view on fit, scope, and next steps.
        </p>
      </div>
    );
  }

  return (
    <form className="ks-lead__form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {/* Honeypot */}
      <div className="ks-lead__hp" aria-hidden="true">
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          value={hpField}
          onChange={(e) => setHpField(e.target.value)}
        />
      </div>

      <div className="ks-lead__row ks-lead__row--split">
        <div className="ks-lead__field">
          <label className="ks-lead__label" htmlFor="lead-name">Your name</label>
          <input
            id="lead-name"
            className="ks-lead__input"
            type="text"
            name="name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            data-first-field
          />
        </div>
        <div className="ks-lead__field">
          <label className="ks-lead__label" htmlFor="lead-email">Email address</label>
          <input
            id="lead-email"
            className="ks-lead__input"
            type="email"
            name="email"
            placeholder="jane@business.co.uk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="ks-lead__field">
        <label className="ks-lead__label" htmlFor="lead-website">
          Current website URL <span style={{ color: "rgba(255,255,255,0.34)", fontWeight: 450 }}>(optional)</span>
        </label>
        <input
          id="lead-website"
          className="ks-lead__input"
          type="url"
          name="website"
          placeholder="https://yourbusiness.co.uk"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          autoComplete="url"
        />
      </div>

      <div className="ks-lead__field">
        <label className="ks-lead__label" htmlFor="lead-message">What do you need help with?</label>
        <textarea
          id="lead-message"
          className="ks-lead__textarea"
          name="message"
          placeholder="Briefly describe your project."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="ks-lead__notice ks-lead__notice--err" role="alert">{error}</p>
      )}

      <button
        type="submit"
        className={cx("ks-lead__submit", "k-btn", "k-btn--primary", sent && "ks-lead__submit--sent")}
        disabled={!valid || loading}
        aria-busy={loading}
      >
        <span className="k-btn__label">{loading ? "Sending..." : "Get a clear next step"}</span>
        {!loading && (
          <>
            <span className="k-btn__shine" aria-hidden="true" />
            <span className="k-btn__arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </>
        )}
      </button>

      <p className="ks-lead__formNote">
        No pressure. No spam. Just a direct, useful reply within 12 hours.
      </p>
    </form>
  );
}
