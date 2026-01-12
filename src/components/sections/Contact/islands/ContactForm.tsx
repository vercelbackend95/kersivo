import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Step = "basics" | "project";
type Channel = "email" | "whatsapp" | "call";

type Toast = {
  id: number;
  title: string;
  message: string;
};

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

export default function ContactForm() {
  const [step, setStep] = useState<Step>("basics");
  const [channel, setChannel] = useState<Channel>("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [website, setWebsite] = useState("");

  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState<"" | "Under £1k" | "£1–2k" | "£2–4k" | "£4–8k" | "£8k+">("");
  const [timeline, setTimeline] = useState<"" | "ASAP" | "2–4 weeks" | "1–2 months" | "Flexible">("");

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [toast?.id]);

  const brief = useMemo(() => {
    const lines = [
      "KERSIVO — QUOTE BRIEF",
      "",
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Business: ${business || "-"}`,
      `Website: ${website || "-"}`,
      `Preferred contact: ${channel}`,
      "",
      "PROJECT",
      `Goal: ${goal || "-"}`,
      `Budget: ${budget || "-"}`,
      `Timeline: ${timeline || "-"}`,
    ];
    return lines.join("\n");
  }, [name, email, business, website, channel, goal, budget, timeline]);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setToast({
        id: Date.now(),
        title: "Copied",
        message: "Brief is in your clipboard. Paste it into Email / WhatsApp.",
      });
    } catch {
      setToast({
        id: Date.now(),
        title: "Copy failed",
        message: "Your browser blocked clipboard. Select text manually.",
      });
    }
  };

  const progress = step === "basics" ? 56 : 100;

  return (
    <div className="k-contact2__grid">
      {/* LEFT */}
      <div className="k-contact2__left">
        <div className="k-contact2__kickerRow">
          <div className="k-contact2__kicker">CONTACT</div>
          <div className="k-contact2__badge">REPLY WITHIN 24H</div>
        </div>

        <h2 className="k-contact2__title">
          Get a quote—<span className="k-contact2__grad">fast</span>, clean.
          <br />
          No friction.
        </h2>

        <p className="k-contact2__lead">
          Send a sharp brief in under a minute. Prefer a call? Tick it — we’ll ring you.
        </p>

        <div className="k-contact2__bullets">
          <div className="k-contact2__bullet">
            <div className="k-contact2__bulletIcon">✓</div>
            <div>
              <div className="k-contact2__bulletTitle">Quote-first</div>
              <div className="k-contact2__bulletDesc">
                We start with scope + budget range, then lock the plan.
              </div>
            </div>
          </div>

          <div className="k-contact2__bullet">
            <div className="k-contact2__bulletIcon">⧉</div>
            <div>
              <div className="k-contact2__bulletTitle">Copy-ready brief</div>
              <div className="k-contact2__bulletDesc">
                One tap copies the brief — paste into Email / WhatsApp.
              </div>
            </div>
          </div>

          <div className="k-contact2__bullet">
            <div className="k-contact2__bulletIcon">☎</div>
            <div>
              <div className="k-contact2__bulletTitle">Prefer a call</div>
              <div className="k-contact2__bulletDesc">Add a number — we call you. Simple.</div>
            </div>
          </div>
        </div>

        <p className="k-contact2__micro">No pressure. Just clarity.</p>
      </div>

      {/* RIGHT / CONSOLE */}
      <div className="k-contact2__right">
        <div className="k-contact2__console">
          <div className="k-contact2__consoleTop">
            <div className="k-contact2__consoleTitle">
              <span className="k-contact2__consoleIcon" aria-hidden="true">✦</span>
              Quote Intake
            </div>

            <div className="k-contact2__steps" role="tablist" aria-label="Contact steps">
              <button
                type="button"
                className={cn("k-contact2__step", step === "basics" && "is-active")}
                onClick={() => setStep("basics")}
              >
                1) Basics
              </button>
              <button
                type="button"
                className={cn("k-contact2__step", step === "project" && "is-active")}
                onClick={() => setStep("project")}
              >
                2) Project
              </button>
            </div>
          </div>

          <div className="k-progress">
            <div className="k-progress__left">
              <span className="k-dot" aria-hidden="true"></span>
              Reply within 24h
            </div>
            <div className="k-meter" aria-label="Progress">
              <div className="k-meter__bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* STEP SWITCH (Framer) */}
          <AnimatePresence mode="wait" initial={false}>
            {step === "basics" ? (
              <motion.div
                key="basics"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={spring}
                className="k-fields"
              >
                <div className="k-row">
                  <label className="k-field">
                    <span className="k-label">NAME</span>
                    <input
                      ref={(el) => {
                        nameRef.current = el;
                      }}
                      data-first-field
                      className="k-input"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>

                  <label className="k-field">
                    <span className="k-label">EMAIL</span>
                    <input
                      className="k-input"
                      placeholder="you@business.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                </div>

                <label className="k-field">
                  <span className="k-label">BUSINESS</span>
                  <input
                    className="k-input"
                    placeholder="Business name"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                  />
                </label>

                <label className="k-field">
                  <span className="k-label">WEBSITE (OPTIONAL)</span>
                  <input
                    className="k-input"
                    placeholder="https://"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>

                <div className="k-field">
                  <span className="k-label">PREFERRED CONTACT</span>
                  <div className="k-seg" role="group" aria-label="Preferred contact channel">
                    <button
                      type="button"
                      className={cn(channel === "email" && "is-on")}
                      onClick={() => setChannel("email")}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      className={cn(channel === "whatsapp" && "is-on")}
                      onClick={() => setChannel("whatsapp")}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      className={cn(channel === "call" && "is-on")}
                      onClick={() => setChannel("call")}
                    >
                      I prefer a call
                    </button>
                  </div>
                </div>

                <div className="k-actions">
                  <button
                    type="button"
                    className="k-act k-act--primary"
                    onClick={() => setStep("project")}
                    data-primary
                  >
                    Continue <span aria-hidden="true">→</span>
                  </button>

                  <button type="button" className="k-act k-act--ghost" onClick={copyBrief}>
                    Copy brief <span aria-hidden="true">→</span>
                  </button>
                </div>

                <div className="k-note">No backend yet — copy brief + open channel.</div>
              </motion.div>
            ) : (
              <motion.div
                key="project"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={spring}
                className="k-fields"
              >
                <label className="k-field">
                  <span className="k-label">GOAL</span>
                  <textarea
                    className="k-textarea"
                    placeholder="What do you want the site to achieve?"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </label>

                <div className="k-field">
                  <span className="k-label">BUDGET RANGE</span>
                  <div className="k-chips">
                    {(["Under £1k", "£1–2k", "£2–4k", "£4–8k", "£8k+"] as const).map((x) => (
                      <button
                        key={x}
                        type="button"
                        className={cn("k-chip", budget === x && "is-on")}
                        onClick={() => setBudget(x)}
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="k-field">
                  <span className="k-label">TIMELINE</span>
                  <div className="k-chips">
                    {(["ASAP", "2–4 weeks", "1–2 months", "Flexible"] as const).map((x) => (
                      <button
                        key={x}
                        type="button"
                        className={cn("k-chip", timeline === x && "is-on")}
                        onClick={() => setTimeline(x)}
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="k-actions">
                  <button type="button" className="k-act k-act--ghost" onClick={() => setStep("basics")}>
                    Back <span aria-hidden="true">←</span>
                  </button>

                  <button type="button" className="k-act k-act--primary" onClick={copyBrief} data-primary>
                    Copy brief <span aria-hidden="true">→</span>
                  </button>
                </div>

                <div className="k-note">Copying creates a clean brief — paste into Email/WhatsApp.</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOAST (Framer: bottom + blur, auto 3s) */}
          <div className="k-toastWrap" aria-live="polite" aria-atomic="true">
            <AnimatePresence>
              {toast ? (
                <motion.div
                  key={toast.id}
                  className="k-toast"
                  initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
                  transition={spring}
                >
                  <div>
                    <div className="k-toastTitle">{toast.title}</div>
                    <div className="k-toastMsg">{toast.message}</div>
                  </div>

                  <button className="k-x" onClick={() => setToast(null)} aria-label="Close toast">
                    ✕
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
