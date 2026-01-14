import React, { useEffect, useMemo, useRef, useState } from "react";

type Step = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  // “cards” are just visual mock screens; positions are % inside the stage
  cards: Array<{
    key: string;
    x: number; // %
    y: number; // %
    w: number; // px
    h: number; // px
    tone?: "light" | "light2";
    label?: string;
    accent?: "green" | "blue";
  }>;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ProcessScroll() {
  const steps: Step[] = useMemo(
    () => [
      {
        id: "discovery",
        title: "Discovery",
        subtitle: "A 15–30 min call to get the truth on goals + constraints.",
        bullets: ["What you sell", "Who you sell to", "What success looks like"],
        cards: [
          { key: "c1", x: 56, y: 18, w: 260, h: 170, tone: "light", label: "Quick brief", accent: "green" },
          { key: "c2", x: 44, y: 42, w: 360, h: 210, tone: "light2", label: "Site map", accent: "blue" },
          { key: "c3", x: 68, y: 54, w: 280, h: 190, tone: "light", label: "Content needs", accent: "green" },
        ],
      },
      {
        id: "scope",
        title: "Scope & plan",
        subtitle: "We lock what’s in / out. No fog, no surprise invoices.",
        bullets: ["Pages + sections", "Lead capture", "Local SEO setup"],
        cards: [
          { key: "c1", x: 60, y: 14, w: 260, h: 180, tone: "light", label: "Scope doc", accent: "green" },
          { key: "c2", x: 46, y: 40, w: 380, h: 220, tone: "light2", label: "Timeline", accent: "blue" },
          { key: "c3", x: 72, y: 56, w: 260, h: 190, tone: "light", label: "Deliverables", accent: "green" },
        ],
      },
      {
        id: "design",
        title: "Design direction",
        subtitle: "Premium-minimal look. Clear hierarchy. Clean CTA flow.",
        bullets: ["Hero + key sections", "Typography + spacing", "Mobile-first"],
        cards: [
          { key: "c1", x: 62, y: 14, w: 250, h: 180, tone: "light2", label: "Hero draft", accent: "blue" },
          { key: "c2", x: 44, y: 40, w: 390, h: 240, tone: "light", label: "Section system", accent: "green" },
          { key: "c3", x: 70, y: 58, w: 270, h: 170, tone: "light2", label: "UI components", accent: "blue" },
        ],
      },
      {
        id: "build",
        title: "Build",
        subtitle: "Astro-first. Minimal JS. Fast loads. Smooth, controlled motion.",
        bullets: ["Performance baseline", "Accessible components", "Tracking-ready"],
        cards: [
          { key: "c1", x: 58, y: 16, w: 280, h: 180, tone: "light", label: "Build checks", accent: "green" },
          { key: "c2", x: 44, y: 42, w: 400, h: 220, tone: "light2", label: "Pages wired", accent: "blue" },
          { key: "c3", x: 72, y: 58, w: 270, h: 190, tone: "light", label: "Lead flow", accent: "green" },
        ],
      },
      {
        id: "polish",
        title: "QA & polish",
        subtitle: "We tighten everything: copy rhythm, spacing, speed, edge cases.",
        bullets: ["Device testing", "SEO foundations", "Speed pass"],
        cards: [
          { key: "c1", x: 60, y: 14, w: 280, h: 185, tone: "light2", label: "QA list", accent: "blue" },
          { key: "c2", x: 44, y: 40, w: 390, h: 235, tone: "light", label: "Perf report", accent: "green" },
          { key: "c3", x: 72, y: 56, w: 270, h: 190, tone: "light2", label: "SEO pass", accent: "blue" },
        ],
      },
      {
        id: "launch",
        title: "Launch & aftercare",
        subtitle: "We deploy, verify, and support the first tweaks post-launch.",
        bullets: ["Domain + redirects", "Analytics sanity check", "Aftercare window"],
        cards: [
          { key: "c1", x: 62, y: 14, w: 260, h: 180, tone: "light", label: "Deploy", accent: "green" },
          { key: "c2", x: 44, y: 40, w: 400, h: 220, tone: "light2", label: "Go-live checks", accent: "blue" },
          { key: "c3", x: 72, y: 58, w: 270, h: 190, tone: "light", label: "Aftercare", accent: "green" },
        ],
      },
    ],
    []
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [hasPointer, setHasPointer] = useState(false);

  const n = steps.length;

  // scroll -> active step
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("#process .k-proc");
    sectionRef.current = el || null;
    if (!sectionRef.current) return;

    const reduced = prefersReducedMotion();

    const update = () => {
      rafRef.current = null;
      const root = sectionRef.current!;
      const rect = root.getBoundingClientRect();

      // root height is steps * 100vh, we use progress across (height - vh)
      const vh = window.innerHeight || 1;
      const scrollable = Math.max(1, rect.height - vh);
      const progressed = clamp(-rect.top, 0, scrollable);
      const p = progressed / scrollable; // 0..1

      // Each step occupies ~1/n of progress
      const idx = clamp(Math.floor(p * n + 1e-6), 0, n - 1);
      setActive(idx);

      // pointer detection for hover styles
      if (!reduced && !hasPointer) setHasPointer(true);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const jumpTo = (idx: number) => {
    const root = sectionRef.current;
    if (!root) return;

    const top = root.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight || 1;
    const stepTop = top + idx * vh;

    window.scrollTo({
      top: stepTop,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const s = steps[active];

  return (
    <div className="k-proc" style={{ ["--steps" as any]: n }}>
      <div className="k-proc__sticky">
        {/* Left column */}
        <div className="k-proc__left">
          <div className="k-proc__label">FOR CLIENTS</div>

          <ol className="k-proc__steps" aria-label="Process steps">
            {steps.map((step, idx) => (
              <li
                key={step.id}
                className={[
                  "k-proc__step",
                  idx === active ? "is-active" : "",
                  hasPointer ? "has-pointer" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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
                    <span className="k-proc__stepTitle">{step.title}</span>
                    <span className="k-proc__stepSub">{step.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Right column */}
        <div className="k-proc__right" aria-label="Step details">
          <div className="k-proc__stage">
            {/* subtle floating pixels like the reference */}
            <span className="k-proc__px k-proc__px--1" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--2" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--3" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--4" aria-hidden="true" />

            {/* Active content */}
            <div className="k-proc__cards" key={s.id}>
              {s.cards.map((c) => (
                <div
                  key={c.key}
                  className={[
                    "k-proc__card",
                    c.tone === "light2" ? "is-soft" : "",
                    c.accent === "blue" ? "is-blue" : "is-green",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
                    <span className="k-proc__cardTitle">{c.label || "Screen"}</span>
                  </div>

                  <div className="k-proc__cardBody">
                    <div className="k-proc__row" />
                    <div className="k-proc__row" />
                    <div className="k-proc__row k-proc__row--short" />
                    <div className="k-proc__cta" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom content note (matches “right side changes per step”) */}
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

      {/* Spacer that creates the scroll “steps” */}
      <div className="k-proc__spacer" aria-hidden="true" />
    </div>
  );
}
