import React, { useEffect, useMemo, useRef, useState } from "react";

type Card = {
  key: string;
  x: number; // %
  y: number; // %
  w: number; // px
  h: number; // px
  title: string;
  ctaTone?: "green" | "blue";
};

type Step = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  spot: { x: number; y: number }; // spotlight position %
  cards: Card[];
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll-driven sticky stepper:
 * - Section creates scroll distance (steps * ~92vh)
 * - Active step is derived from progress inside the section
 * - Right scene re-renders per step with a clean “enter” animation
 */
export default function ProcessScroll() {
  const steps: Step[] = useMemo(
    () => [
      {
        id: "discovery",
        title: "Discovery",
        subtitle: "Goals, audience, constraints. We cut fluff fast.",
        bullets: ["What you sell", "Who it’s for", "Primary enquiry action"],
        spot: { x: 70, y: 38 },
        cards: [
          { key: "a", x: 72, y: 22, w: 260, h: 170, title: "Quick brief", ctaTone: "green" },
          { key: "b", x: 56, y: 48, w: 420, h: 220, title: "Notes → clarity", ctaTone: "blue" },
          { key: "c", x: 78, y: 62, w: 280, h: 190, title: "Constraints", ctaTone: "green" },
        ],
      },
      {
        id: "scope",
        title: "Scope & plan",
        subtitle: "We lock deliverables. Clean scope. Crisp timeline.",
        bullets: ["Pages + sections", "Lead capture plan", "What’s in / out"],
        spot: { x: 64, y: 44 },
        cards: [
          { key: "a", x: 70, y: 20, w: 280, h: 180, title: "Scope doc", ctaTone: "green" },
          { key: "b", x: 54, y: 48, w: 430, h: 230, title: "Timeline", ctaTone: "blue" },
          { key: "c", x: 78, y: 64, w: 270, h: 185, title: "Deliverables", ctaTone: "green" },
        ],
      },
      {
        id: "design",
        title: "Design direction",
        subtitle: "Premium-minimal. Clear hierarchy. Mobile-first.",
        bullets: ["Hero + key sections", "Type & spacing system", "CTA flow"],
        spot: { x: 74, y: 40 },
        cards: [
          { key: "a", x: 74, y: 20, w: 270, h: 180, title: "Hero draft", ctaTone: "blue" },
          { key: "b", x: 54, y: 50, w: 450, h: 240, title: "Section system", ctaTone: "green" },
          { key: "c", x: 78, y: 64, w: 280, h: 175, title: "UI components", ctaTone: "blue" },
        ],
      },
      {
        id: "build",
        title: "Build",
        subtitle: "Astro-first. Minimal JS. Fast, stable, extendable.",
        bullets: ["Components wired", "Tracking-ready", "Performance baseline"],
        spot: { x: 66, y: 46 },
        cards: [
          { key: "a", x: 70, y: 22, w: 280, h: 180, title: "Build checks", ctaTone: "green" },
          { key: "b", x: 54, y: 50, w: 460, h: 240, title: "Pages wired", ctaTone: "blue" },
          { key: "c", x: 78, y: 64, w: 280, h: 190, title: "Lead flow", ctaTone: "green" },
        ],
      },
      {
        id: "qa",
        title: "QA & polish",
        subtitle: "Spacing, speed, a11y, edge cases. Tight finish.",
        bullets: ["Device testing", "SEO foundations", "Speed pass"],
        spot: { x: 72, y: 44 },
        cards: [
          { key: "a", x: 72, y: 20, w: 300, h: 185, title: "QA list", ctaTone: "blue" },
          { key: "b", x: 54, y: 50, w: 460, h: 240, title: "Perf report", ctaTone: "green" },
          { key: "c", x: 80, y: 64, w: 270, h: 190, title: "SEO pass", ctaTone: "blue" },
        ],
      },
      {
        id: "launch",
        title: "Launch & aftercare",
        subtitle: "Deploy, verify, and support early tweaks post-launch.",
        bullets: ["Domain + redirects", "Analytics sanity check", "Aftercare window"],
        spot: { x: 64, y: 42 },
        cards: [
          { key: "a", x: 70, y: 20, w: 280, h: 180, title: "Deploy", ctaTone: "green" },
          { key: "b", x: 54, y: 50, w: 470, h: 240, title: "Go-live checks", ctaTone: "blue" },
          { key: "c", x: 78, y: 64, w: 290, h: 190, title: "Aftercare", ctaTone: "green" },
        ],
      },
    ],
    []
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [enterTick, setEnterTick] = useState(0);

  const n = steps.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();

    const update = () => {
      rafRef.current = null;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // how far user has progressed through the sticky section
      const scrollable = Math.max(1, rect.height - vh);
      const progressed = clamp(-rect.top, 0, scrollable);
      const p = progressed / scrollable;

      // Use n “bands”
      const idx = clamp(Math.floor(p * n + 1e-6), 0, n - 1);
      setActive((prev) => {
        if (prev !== idx) {
          // trigger enter animation class re-apply
          if (!reduced) setEnterTick((t) => t + 1);
        }
        return idx;
      });
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [n]);

  const jumpTo = (idx: number) => {
    const root = rootRef.current;
    if (!root) return;

    const top = root.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight || 1;
    const target = top + idx * (0.92 * vh); // match section height “band”

    window.scrollTo({
      top: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const s = steps[active];

  return (
    <div
      ref={rootRef}
      className="k-proc"
      style={{ ["--steps" as any]: n }}
    >
      <div className="k-proc__sticky">
        {/* LEFT */}
        <div className="k-proc__left">
          <div className="k-proc__label">FOR CLIENTS</div>

          <ol className="k-proc__steps" aria-label="Process steps">
            {steps.map((step, idx) => (
              <li
                key={step.id}
                className={`k-proc__step ${idx === active ? "is-active" : ""}`}
              >
                <button
                  type="button"
                  className="k-proc__stepBtn"
                  onClick={() => jumpTo(idx)}
                >
                  <span className="k-proc__num" aria-hidden="true">
                    {idx + 1}
                  </span>

                  <span className="k-proc__text">
                    <span className="k-proc__titleLine">
                      <span className="k-proc__stepTitle">{step.title}</span>
                    </span>
                    <span className="k-proc__stepSub">{step.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="k-proc__rail" aria-hidden="true" />
        </div>

        {/* RIGHT */}
        <div className="k-proc__right" aria-label="Step scene">
          <div className="k-proc__stage">
            <div
              className="k-proc__spot"
              style={{
                ["--sx" as any]: `${s.spot.x}%`,
                ["--sy" as any]: `${s.spot.y}%`,
              }}
              aria-hidden="true"
            />

            <span className="k-proc__px k-proc__px--1" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--2" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--3" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--4" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--5" aria-hidden="true" />

            {/* CARDS (re-rendered per step for crisp switch) */}
            <div className={`k-proc__cards is-enter`} key={`${s.id}-${enterTick}`}>
              {s.cards.map((c) => (
                <div
                  key={c.key}
                  className="k-proc__card"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: `${c.w}px`,
                    height: `${c.h}px`,
                  }}
                >
                  <div className="k-proc__cardTop">
                    <span className="k-proc__dot" />
                    <span className="k-proc__dot" />
                    <span className="k-proc__dot" />
                    <span className="k-proc__cardTitle">{c.title}</span>
                  </div>

                  <div className="k-proc__cardBody">
                    <div className="k-proc__row" />
                    <div className="k-proc__row" />
                    <div className="k-proc__row k-proc__row--short" />
                    <div className="k-proc__row k-proc__row--micro" />
                    <div className={`k-proc__cta ${c.ctaTone === "blue" ? "is-blue" : ""}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="k-proc__detail">
              <div className="k-proc__detailTitle">{s.title}</div>
              <ul className="k-proc__bullets">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* scroll distance */}
      <div className="k-proc__spacer" aria-hidden="true" />
    </div>
  );
}
