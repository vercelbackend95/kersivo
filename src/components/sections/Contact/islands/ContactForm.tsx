import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = { email: string; whatsapp: string };
type Step = 1 | 2;
type Pref = "email" | "whatsapp" | "call";
type Toast = null | { title: string; msg: string };

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const needChips = ["New website", "Redesign", "Landing page", "SEO foundations", "More leads"];
const budgetChips = ["Under £800", "£800–£1,500", "£1,500–£3,000", "£3,000+", "Not sure yet"];
const timelineChips = ["ASAP", "2–4 weeks", "1–2 months", "Flexible"];
const industryChips = ["Trades", "Clinic", "Barber/Beauty", "Hospitality", "Professional", "Other"];

function nowStamp() {
  try { return new Date().toISOString(); } catch { return ""; }
}

function makeId() {
  const rnd = () => Math.random().toString(16).slice(2, 6);
  const time = Date.now().toString(16).slice(-6);
  // @ts-ignore
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `kv-${time}-${rnd()}${rnd()}`;
}

async function tryCopy(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  return false;
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

function ChipGroup({
  label,
  value,
  onPick,
  items,
  touched,
  bad,
  reduced,
}: {
  label: string;
  value: string;
  onPick: (v: string) => void;
  items: string[];
  touched: boolean;
  bad: boolean;
  reduced: boolean;
}) {
  return (
    <div className="k-field">
      <span className="k-label">{label}</span>
      <div className="k-chips" role="listbox" aria-label={label}>
        {items.map((c) => (
          <motion.button
            key={c}
            type="button"
            className={"k-chip" + (value === c ? " is-on" : "") + (touched && bad ? " k-bad" : "")}
            onClick={() => onPick(c)}
            whileHover={reduced ? undefined : { y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
          >
            {c}
          </motion.button>
        ))}
      </div>
      {touched && bad && <div className="k-err">Required.</div>}
    </div>
  );
}

export default function ContactForm({ email, whatsapp }: Props) {
  const reduced = useReducedMotion();
  const shellRef = useRef<HTMLDivElement | null>(null);

  const waDigits = useMemo(() => (whatsapp || "").replace(/\D/g, ""), [whatsapp]);
  const waLink = useMemo(() => `https://wa.me/${waDigits}`, [waDigits]);

  const [step, setStep] = useState<Step>(1);
  const [toast, setToast] = useState<Toast>(null);

  const [leadId] = useState(() => makeId());
  const [createdAt] = useState(() => nowStamp());

  const [data, setData] = useState({
    name: "",
    email: "",
    business: "",
    website: "",
    need: "",
    industry: "",
    budget: "",
    timeline: "",
    prefer: "email" as Pref,
    phone: "",
    notes: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const requiredKeys: (keyof typeof data)[] = ["name", "email", "business", "need", "budget", "timeline"];

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    for (const k of requiredKeys) if (!String(data[k] || "").trim()) e[k] = "Required";
    if (data.email.trim() && !emailOk(data.email)) e.email = "Invalid email";
    if (data.prefer === "call" && !data.phone.trim()) e.phone = "Phone required for call";
    return e;
  }, [data]);

  const fieldBad = (k: keyof typeof data) => !!touched[k] && !!errors[k];

  const progress = useMemo(() => {
    let ok = 0;
    for (const k of requiredKeys) if (String(data[k] || "").trim()) ok++;
    if (data.email.trim() && !emailOk(data.email)) ok = Math.max(0, ok - 1);
    if (data.prefer === "call" && !data.phone.trim()) ok = Math.max(0, ok - 1);
    const denom = requiredKeys.length + (data.prefer === "call" ? 1 : 0);
    return denom ? ok / denom : 0;
  }, [data]);

  const pageUrl = useMemo(() => {
    try { return window.location.href; } catch { return ""; }
  }, []);

  const brief = useMemo(() => {
    const lines = [
      `Kersivo Quote Request`,
      `—`,
      `Lead ID: ${leadId}`,
      `Created: ${createdAt || "-"}`,
      `Page: ${pageUrl || "-"}`,
      ``,
      `Name: ${data.name.trim() || "-"}`,
      `Email: ${data.email.trim() || "-"}`,
      `Business: ${data.business.trim() || "-"}`,
      `Website: ${data.website.trim() || "-"}`,
      ``,
      `Need: ${data.need || "-"}`,
      `Industry: ${data.industry || "-"}`,
      `Budget: ${data.budget || "-"}`,
      `Timeline: ${data.timeline || "-"}`,
      `Preferred contact: ${data.prefer}${data.prefer === "call" ? " (please call me)" : ""}`,
      `Phone: ${data.phone.trim() || "-"}`,
      ``,
      `Notes: ${data.notes.trim() || "-"}`,
    ];
    return lines.join("\n");
  }, [data, leadId, createdAt, pageUrl]);

  const setGlowVars = (e: React.PointerEvent) => {
    if (reduced) return;
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  const markTouched = (keys: (keyof typeof data)[]) => {
    setTouched((s) => {
      const n = { ...s };
      keys.forEach((k) => (n[k] = true));
      return n;
    });
  };

  const validate = () => {
    markTouched(requiredKeys.concat(data.prefer === "call" ? (["phone"] as any) : []));
    return Object.keys(errors).length === 0;
  };

  const openMail = () => {
    const subject = `Kersivo quote — ${data.business || "New project"} (${leadId.slice(0, 8)})`;
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    window.location.href = url;
  };

  const openWhatsApp = () => {
    const text = `Kersivo quote — ${data.business || "New project"} (${leadId.slice(0, 8)})\n\n${brief}`;
    window.open(`${waLink}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const primaryChannel = () => {
    if (data.prefer === "whatsapp") return openWhatsApp();
    return openMail();
  };

  const submit = async () => {
    const ok = validate();
    if (!ok) {
      setToast({ title: "Almost.", msg: "Fill required fields — then we’ll copy your brief and open your channel." });
      return;
    }
    const copied = (await tryCopy(brief)) || fallbackCopy(brief);
    setToast(
      copied
        ? { title: "Copied.", msg: "Brief is ready. Open Email/WhatsApp — or request a call." }
        : { title: "Copy blocked.", msg: "Your browser blocked clipboard — use Email/WhatsApp buttons." }
    );
  };

  const ease = [0.2, 0.9, 0.2, 1] as const;

  return (
    <motion.div
      ref={shellRef}
      className="k-contact2"
      onPointerMove={setGlowVars}
      initial={reduced ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduced ? undefined : { duration: 0.65, ease }}
    >
      <div className="k-contact2__frame">
        <span className="k-contact2__glow" aria-hidden="true" />

        <div className="k-contact2__grid">
          {/* LEFT COPY (Proof Console style) */}
          <div className="k-contact2__left">
            <div className="k-contact2__kickerRow">
              <span className="k-contact2__kicker">CONTACT</span>
              <span className="k-contact2__badge">Reply within 24h</span>
            </div>

            <h2 className="k-contact2__title">
              Get a quote — <span className="k-contact2__grad">fast, clean</span>.
              <br />
              No friction.
            </h2>

            <p className="k-contact2__lead">
              Send a sharp brief in under a minute. Prefer a call? Tick it — we’ll ring you.
            </p>

            <div className="k-contact2__bullets">
              <div className="k-contact2__bullet">
                <div className="k-contact2__bulletIcon" aria-hidden="true">✓</div>
                <div>
                  <div className="k-contact2__bulletTitle">Quote-first</div>
                  <div className="k-contact2__bulletDesc">We start with scope + budget range, then lock the plan.</div>
                </div>
              </div>

              <div className="k-contact2__bullet">
                <div className="k-contact2__bulletIcon" aria-hidden="true">⧉</div>
                <div>
                  <div className="k-contact2__bulletTitle">Copy-ready brief</div>
                  <div className="k-contact2__bulletDesc">One tap copies the brief + opens Email/WhatsApp.</div>
                </div>
              </div>

              <div className="k-contact2__bullet">
                <div className="k-contact2__bulletIcon" aria-hidden="true">☎</div>
                <div>
                  <div className="k-contact2__bulletTitle">Prefer a call</div>
                  <div className="k-contact2__bulletDesc">Add a number — we call you. Simple.</div>
                </div>
              </div>
            </div>

            <p className="k-contact2__micro">No pressure. Just clarity.</p>
          </div>

          {/* RIGHT CONSOLE (the form) */}
          <div className="k-contact2__right">
            <div className="k-contact2__console">
              <div className="k-contact2__consoleTop">
                <div className="k-contact2__consoleTitle">
                  <span className="k-contact2__consoleIcon" aria-hidden="true">✦</span>
                  Quote Intake
                </div>

                <div className="k-contact2__steps" aria-label="Steps">
                  <button
                    type="button"
                    className={"k-contact2__step" + (step === 1 ? " is-active" : "")}
                    onClick={() => setStep(1)}
                  >
                    1) Basics
                  </button>
                  <button
                    type="button"
                    className={"k-contact2__step" + (step === 2 ? " is-active" : "")}
                    onClick={() => setStep(2)}
                  >
                    2) Project
                  </button>
                </div>
              </div>

              <div className="k-progress">
                <div className="k-progress__left">
                  <span className="k-dot" aria-hidden="true" />
                  Reply within 24h
                </div>

                <div className="k-meter" aria-label="Completion">
                  <motion.div
                    className="k-meter__bar"
                    initial={false}
                    animate={{ width: `${Math.round(progress * 100)}%` }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="s1"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.22, ease }}
                  >
                    <div className="k-fields">
                      <div className="k-row">
                        <label className="k-field">
                          <span className="k-label">Name</span>
                          <input
                            className={"k-input" + (fieldBad("name") ? " k-bad" : "")}
                            value={data.name}
                            onChange={(e) => setData((s) => ({ ...s, name: e.target.value }))}
                            onBlur={() => markTouched(["name"])}
                            placeholder="Your name"
                            autoComplete="name"
                          />
                          {fieldBad("name") && <div className="k-err">Required.</div>}
                        </label>

                        <label className="k-field">
                          <span className="k-label">Email</span>
                          <input
                            className={"k-input" + (fieldBad("email") ? " k-bad" : "")}
                            value={data.email}
                            onChange={(e) => setData((s) => ({ ...s, email: e.target.value }))}
                            onBlur={() => markTouched(["email"])}
                            placeholder="you@business.co.uk"
                            autoComplete="email"
                            inputMode="email"
                          />
                          {fieldBad("email") && (
                            <div className="k-err">{errors.email === "Invalid email" ? "Invalid email." : "Required."}</div>
                          )}
                        </label>
                      </div>

                      <label className="k-field">
                        <span className="k-label">Business</span>
                        <input
                          className={"k-input" + (fieldBad("business") ? " k-bad" : "")}
                          value={data.business}
                          onChange={(e) => setData((s) => ({ ...s, business: e.target.value }))}
                          onBlur={() => markTouched(["business"])}
                          placeholder="Business name"
                          autoComplete="organization"
                        />
                        {fieldBad("business") && <div className="k-err">Required.</div>}
                      </label>

                      <label className="k-field">
                        <span className="k-label">Website (optional)</span>
                        <input
                          className="k-input"
                          value={data.website}
                          onChange={(e) => setData((s) => ({ ...s, website: e.target.value }))}
                          placeholder="https://"
                          inputMode="url"
                        />
                      </label>

                      <div className="k-field">
                        <span className="k-label">Preferred contact</span>
                        <div className="k-seg" role="group" aria-label="Preferred contact method">
                          <button type="button" className={data.prefer === "email" ? "is-on" : ""} onClick={() => setData((s) => ({ ...s, prefer: "email" }))}>
                            Email
                          </button>
                          <button type="button" className={data.prefer === "whatsapp" ? "is-on" : ""} onClick={() => setData((s) => ({ ...s, prefer: "whatsapp" }))}>
                            WhatsApp
                          </button>
                          <button type="button" className={data.prefer === "call" ? "is-on" : ""} onClick={() => setData((s) => ({ ...s, prefer: "call" }))}>
                            I prefer a call
                          </button>
                        </div>
                      </div>

                      {data.prefer === "call" && (
                        <label className="k-field">
                          <span className="k-label">Phone number</span>
                          <input
                            className={"k-input" + (fieldBad("phone") ? " k-bad" : "")}
                            value={data.phone}
                            onChange={(e) => setData((s) => ({ ...s, phone: e.target.value }))}
                            onBlur={() => markTouched(["phone"])}
                            placeholder="+44..."
                            inputMode="tel"
                          />
                          {fieldBad("phone") && <div className="k-err">Required for call preference.</div>}
                        </label>
                      )}

                      <div className="k-actions">
                        <button
                          type="button"
                          className="k-btn k-btn--secondary"
                          onClick={() => {
                            markTouched(["name", "email", "business"]);
                            const ok =
                              !!data.name.trim() &&
                              !!data.email.trim() &&
                              emailOk(data.email) &&
                              !!data.business.trim() &&
                              (data.prefer !== "call" || !!data.phone.trim());

                            if (!ok) {
                              setToast({ title: "Quick fix.", msg: "Fill name, email, business (and phone if call) — then continue." });
                              return;
                            }
                            setStep(2);
                          }}
                        >
                          <span className="k-btn__label">Continue</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>

                        <button type="button" className="k-btn k-btn--ghost" onClick={submit}>
                          <span className="k-btn__label">Copy brief</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>
                      </div>

                      <div className="k-note">No backend yet — copy brief + open channel.</div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="s2"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.22, ease }}
                  >
                    <div className="k-fields">
                      <ChipGroup
                        label="What do you need?"
                        value={data.need}
                        onPick={(v) => { setData((s) => ({ ...s, need: v })); markTouched(["need"]); }}
                        items={needChips}
                        touched={!!touched.need}
                        bad={!!errors.need}
                        reduced={!!reduced}
                      />

                      <ChipGroup
                        label="Industry"
                        value={data.industry}
                        onPick={(v) => { setData((s) => ({ ...s, industry: v })); markTouched(["industry"]); }}
                        items={industryChips}
                        touched={!!touched.industry}
                        bad={false}
                        reduced={!!reduced}
                      />

                      <ChipGroup
                        label="Budget"
                        value={data.budget}
                        onPick={(v) => { setData((s) => ({ ...s, budget: v })); markTouched(["budget"]); }}
                        items={budgetChips}
                        touched={!!touched.budget}
                        bad={!!errors.budget}
                        reduced={!!reduced}
                      />

                      <ChipGroup
                        label="Timeline"
                        value={data.timeline}
                        onPick={(v) => { setData((s) => ({ ...s, timeline: v })); markTouched(["timeline"]); }}
                        items={timelineChips}
                        touched={!!touched.timeline}
                        bad={!!errors.timeline}
                        reduced={!!reduced}
                      />

                      <label className="k-field">
                        <span className="k-label">Notes (optional)</span>
                        <textarea
                          className="k-textarea"
                          value={data.notes}
                          onChange={(e) => setData((s) => ({ ...s, notes: e.target.value }))}
                          placeholder="Goal in one sentence. Example sites you like. Deadline."
                        />
                      </label>

                      <div className="k-actions">
                        <button type="button" className="k-btn k-btn--ghost" onClick={() => setStep(1)}>
                          <span className="k-btn__label">Back</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>

                        <button type="button" className="k-btn k-btn--primary" onClick={submit}>
                          <span className="k-btn__shine" aria-hidden="true"></span>
                          <span className="k-btn__label">Get quote</span>
                          <span className="k-btn__arrow" aria-hidden="true">→</span>
                        </button>

                        <button type="button" className="k-btn k-btn--secondary" onClick={primaryChannel}>
                          <span className="k-btn__label">Open {data.prefer === "whatsapp" ? "WhatsApp" : "email"}</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>
                      </div>

                      <div className="k-note">
                        Lead ID: <strong style={{ color: "rgba(255,255,255,.88)" }}>{leadId.slice(0, 8)}</strong>
                        {" · "}Included in the message for clean tracking.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toast */}
            <div className="k-toastWrap">
              <AnimatePresence>
                {toast && (
                  <motion.div
                    className="k-toast"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.22 }}
                  >
                    <div>
                      <div className="k-toastTitle">{toast.title}</div>
                      <div className="k-toastMsg">{toast.msg}</div>
                      <div className="k-toastBtns">
                        <button type="button" className="k-btn k-btn--secondary" onClick={openMail}>
                          <span className="k-btn__label">Email</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>
                        <button type="button" className="k-btn k-btn--ghost" onClick={openWhatsApp}>
                          <span className="k-btn__label">WhatsApp</span>
                          <span className="k-btn__arrow2" aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                    <button className="k-x" onClick={() => setToast(null)} aria-label="Close toast">×</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
