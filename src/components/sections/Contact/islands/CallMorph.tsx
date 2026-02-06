import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ApiOk = { ok: true; id?: string };
type ApiErr = { ok: false; error?: string };

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isPhoneLike(v: string) {
  // UK-friendly: +, digits, spaces, (), -, .
  const s = v.trim();
  if (s.length < 7 || s.length > 22) return false;
  return /^[+0-9][0-9\s().-]+$/.test(s);
}

export default function CallMorph(props: { endpoint?: string }) {
  const endpoint = props.endpoint || "/api/callback";
  const startedAtRef = useRef<number>(Date.now());

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);

  const [phone, setPhone] = useState("");
  const [hpWebsite, setHpWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (open && !reducedMotion) {
      // let layout settle, then focus
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    if (open && reducedMotion) {
      inputRef.current?.focus();
    }
  }, [open, reducedMotion]);

  const canSend = useMemo(() => {
    if (loading || sent) return false;
    return isPhoneLike(phone);
  }, [loading, sent, phone]);

  async function submit() {
    setError("");
    if (loading || sent) return;

    const p = phone.trim();
    if (!isPhoneLike(p)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: p,
          website: hpWebsite,
          startedAt: startedAtRef.current,
          source: "contact-call-morph",
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;

      if (!res.ok || !data || (data as ApiErr).ok === false) {
        const msg =
          (data as ApiErr | null)?.error || `Request failed (${res.status}). Please try again.`;
        throw new Error(msg);
      }

      setSent(true);
      setTimeout(() => {
        // keep it calm; user can close or type again
      }, 200);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSent(false);
    setError("");
    setPhone("");
    setOpen(false);
    startedAtRef.current = Date.now();
  }

  return (
    <motion.div
      className={cx("k-callMorph", open && "is-open", sent && "is-sent")}
      layout
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
    >
      {!open && (
        <motion.button
          type="button"
          className="k-callMorph__btn"
          onClick={() => {
            setError("");
            setSent(false);
            setOpen(true);
          }}
          layout
          whileTap={reducedMotion ? undefined : { scale: 0.99 }}
        >
          <span className="k-callMorph__ico" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.6 3.9l2.6-.6c.7-.2 1.5.2 1.8.9l1.1 2.7c.3.7.1 1.5-.5 2l-1.6 1.2c1 2 2.6 3.6 4.6 4.6l1.2-1.6c.5-.6 1.3-.8 2-.5l2.7 1.1c.7.3 1.1 1.1.9 1.8l-.6 2.6c-.2.8-.9 1.3-1.7 1.3C10 21.4 2.6 14 2.6 5.6c0-.8.5-1.5 1.3-1.7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".95"
              />
            </svg>
          </span>

          <span className="k-callMorph__label">Book a free call</span>
          <span className="k-callMorph__chev" aria-hidden="true">→</span>
        </motion.button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="k-callMorph__panel"
            layout
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
          >
            <div className="k-callMorph__row">
              <div className="k-callMorph__field">
                <label className="k-callMorph__hint" htmlFor="callPhone">
                  Your phone number
                </label>
                <input
                  ref={inputRef}
                  id="callPhone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+44 7xxx xxx xxx"
                  value={phone}
                  onChange={(e) => {
                    setSent(false);
                    setError("");
                    setPhone(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (canSend) submit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      reset();
                    }
                  }}
                />
                {/* honeypot */}
                <div className="k-callMorph__hp" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpWebsite}
                    onChange={(e) => setHpWebsite(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className={cx("k-callMorph__send", sent && "is-sent")}
                onClick={submit}
                disabled={!canSend}
              >
                {sent ? "Sent ✓" : loading ? "Sending…" : "Send"}
              </button>

              <button type="button" className="k-callMorph__close" onClick={reset} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="k-callMorph__fine">
              {sent
                ? "Got it. We’ll call you ASAP."
                : "Drop your number — we’ll confirm a time by SMS or email."}
            </div>

            {error && <div className="k-callMorph__error">{error}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
