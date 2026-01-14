import React, { useEffect, useMemo, useRef, useState } from "react";

type Card = {
  key: string;
  x: number; // %
  y: number; // %
  w: number; // px
  h: number; // px
  r?: number; // deg
  title: string;
  ctaTone?: "green" | "blue";
};

type Step = {
  id: string;
  title: string;
  subtitle: string;
  chips: string[];
  spot: { x: number; y: number };
  cards: Card[];
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

/**
 * ProcessScroll (premium):
 * - Scroll-driven active step
 * - Mini progress + vertical track fill (CSS var --prog)
 * - Subtle parallax in right scene (cards + plane + spotlight micro-drift)
 * - Soft snap: on scroll stop, gently snaps to the nearest step midpoint
 */
export default function ProcessScroll() {
  const steps: Step[] = useMemo(
    () => [
      {
        id: "discovery",
        title: "Discovery",
        subtitle: "Goals, audience, constraints. We cut fluff fast.",
        chips: ["Offer clarity", "Audience", "Primary CTA"],
        spot: { x: 70, y: 38 },
        cards: [
          { key: "a", x: 72, y: 20, w: 260, h: 170, r: -2, title: "Call notes", ctaTone: "green" },
          { key: "b", x: 54, y: 48, w: 460, h: 240, r: 1, title: "Brief → clarity", ctaTone: "blue" },
          { key: "c", x: 78, y: 64, w: 280, h: 190, r: 2, title: "Constraints", ctaTone: "green" },
          { key: "d", x: 40, y: 30, w: 220, h: 150, r: -1, title: "Inputs", ctaTone: "blue" },
        ],
      },
      {
        id: "scope",
        title: "Scope & plan",
        subtitle: "Deliverables locked. Clean scope. Crisp timeline.",
        chips: ["Pages/sections", "In/Out list", "Timeline"],
        spot: { x: 64, y: 44 },
        cards: [
          { key: "a", x: 72, y: 20, w: 300, h: 180, r: -1, title: "Scope doc", ctaTone: "green" },
          { key: "b", x: 54, y: 50, w: 480, h: 250, r: 1, title: "Timeline", ctaTone: "blue" },
          { key: "c", x: 80, y: 66, w: 260, h: 185, r: 2, title: "Deliverables", ctaTone: "green" },
          { key: "d", x: 40, y: 34, w: 240, h: 155, r: -2, title: "In / Out", ctaTone: "blue" },
        ],
      },
      {
        id: "design",
        title: "Design direction",
        subtitle: "Premium-minimal. Hierarchy that sells. Mobile-first.",
        chips: ["Hero direction", "Component system", "CTA flow"],
        spot: { x: 74, y: 40 },
        cards: [
          { key: "a", x: 74, y: 20, w: 280, h: 180, r: 1, title: "Hero draft", ctaTone: "blue" },
          { key: "b", x: 54, y: 52, w: 500, h: 260, r: -1, title: "Sections", ctaTone: "green" },
          { key: "c", x: 80, y: 66, w: 280, h: 175, r: 2, title: "UI kit", ctaTone: "blue" },
          { key: "d", x: 40, y: 34, w: 240, h: 155, r: -2, title: "Type scale", ctaTone: "green" },
        ],
      },
      {
        id: "build",
        title: "Build",
        subtitle: "Astro-first. Minimal JS. Fast, stable, extendable.",
        chips: ["Components wired", "Lead capture", "Perf baseline"],
        spot: { x: 66, y: 46 },
        cards: [
          { key: "a", x: 72, y: 20, w: 300, h: 180, r: -1, title: "Build checks", ctaTone: "green" },
          { key: "b", x: 54, y: 52, w: 520, h: 260, r: 1, title: "Pages wired", ctaTone: "blue" },
          { key: "c", x: 80, y: 66, w: 280, h: 190, r: 2, title: "Lead flow", ctaTone: "green" },
          { key: "d", x: 40, y: 34, w: 240, h: 155, r: -2, title: "Perf budget", ctaTone: "blue" },
        ],
      },
      {
        id: "qa",
        title: "QA & polish",
        subtitle: "Spacing, speed, a11y, edge cases. Tight finish.",
        chips: ["Device testing", "SEO foundations", "Speed pass"],
        spot: { x: 72, y: 44 },
        cards: [
          { key: "a", x: 74, y: 20, w: 320, h: 185, r: 1, title: "QA list", ctaTone: "blue" },
          { key: "b", x: 54, y: 52, w: 520, h: 260, r: -1, title: "Perf report", ctaTone: "green" },
          { key: "c", x: 82, y: 66, w: 270, h: 190, r: 2, title: "SEO pass", ctaTone: "blue" },
          { key: "d", x: 40, y: 34, w: 240, h: 155, r: -2, title: "Edge cases", ctaTone: "green" },
        ],
      },
      {
        id: "launch",
        title: "Launch & aftercare",
        subtitle: "Deploy, verify, and support early tweaks post-launch.",
        chips: ["Redirects", "Analytics check", "Aftercare window"],
        spot: { x: 64, y: 42 },
        cards: [
          { key: "a", x: 72, y: 20, w: 300, h: 180, r: -1, title: "Deploy", ctaTone: "green" },
          { key: "b", x: 54, y: 52, w: 530, h: 260, r: 1, title: "Go-live checks", ctaTone: "blue" },
          { key: "c", x: 80, y: 66, w: 300, h: 190, r: 2, title: "Aftercare", ctaTone: "green" },
          { key: "d", x: 40, y: 34, w: 240, h: 155, r: -2, title: "DNS ready", ctaTone: "blue" },
        ],
      },
    ],
    []
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // soft-snap controls
  const scrollStopT = useRef<number | null>(null);
  const snappingRef = useRef(false);

  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0); // 0..1 overall section progress
  const [local, setLocal] = useState(0); // 0..1 within active band (parallax driver)
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);
  const [enterTick, setEnterTick] = useState(0);

  const n = steps.length;

  // soft snap helper
  const maybeSnap = () => {
    if (prefersReducedMotion()) return;
    if (snappingRef.current) return;

    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // Only snap if section is actually “engaged”
    if (rect.bottom < vh * 0.25 || rect.top > vh * 0.65) return;

    const scrollable = Math.max(1, rect.height - vh);
    const progressed = clamp(-rect.top, 0, scrollable);
    const p = progressed / scrollable;

    // nearest step midpoint
    const nearest = clamp(Math.round(p * n - 0.5), 0, n - 1);
    const targetP = (nearest + 0.5) / n;

    const rootTop = rect.top + window.scrollY;
    const targetY = rootTop + targetP * scrollable;

    const dist = Math.abs(window.scrollY - targetY);

    // Threshold: only if you're already close (soft, not forced)
    const threshold = vh * 0.12; // ~12% viewport
    if (dist > threshold) return;

    snappingRef.current = true;
    window.scrollTo({ top: targetY, behavior: "smooth" });

    // release lock shortly after (so user can continue scrolling without fight)
    window.setTimeout(() => {
      snappingRef.current = false;
    }, 520);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();
    let pulseT: number | null = null;

    const update = () => {
      rafRef.current = null;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      const scrollable = Math.max(1, rect.height - vh);
      const progressed = clamp(-rect.top, 0, scrollable);
      const p = progressed / scrollable;

      setProg(p);

      // which band (step) + local progress inside it
      const bandFloat = p * n; // 0..n
      const idx = clamp(Math.floor(bandFloat + 1e-6), 0, n - 1);
      const bandT = clamp(bandFloat - idx, 0, 1); // 0..1 within current step

      setLocal(bandT);

      setActive((prev) => {
        if (prev !== idx) {
          if (!reduced) setEnterTick((t) => t + 1);

          // micro pulse on newly active step
          setPulseIdx(idx);
          if (pulseT) window.clearTimeout(pulseT);
          pulseT = window.setTimeout(() => setPulseIdx(null), 520);
        }
        return idx;
      });
    };

    const onScroll = () => {
      // cancel snapping as soon as user scrolls again (no fight)
      snappingRef.current = false;

      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(update);

      // detect scroll stop -> soft snap
      if (scrollStopT.current) window.clearTimeout(scrollStopT.current);
      scrollStopT.current = window.setTimeout(() => {
        maybeSnap();
      }, 140);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollStopT.current) window.clearTimeout(scrollStopT.current);
      if (pulseT) window.clearTimeout(pulseT);
    };
  }, [n]);

  const jumpTo = (idx: number) => {
    const root = rootRef.current;
    if (!root) return;

    const top = root.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight || 1;
    const band = 0.92 * vh;
    const target = top + idx * band;

    window.scrollTo({
      top: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const s = steps[active];
  const cur = String(active + 1).padStart(2, "0");
  const tot = String(n).padStart(2, "0");

  // ---- subtle parallax driver (local progress) ----
  // map local (0..1) -> centered (-1..1)
  const t = (local - 0.5) * 2;
  // small movement ranges (Apple-ish)
  const planeY = t * -6; // px
  const spotDriftX = t * 2.2; // %
  const spotDriftY = t * -1.6; // %

  // depth per card index (front cards move more, back cards less)
  const depth = [1.2, 0.85, 1.05, 0.7];

  return (
    <div
      ref={rootRef}
      className="k-proc"
      style={{
        ["--steps" as any]: n,
        ["--prog" as any]: prog,
      }}
    >
      <div className="k-proc__sticky">
        {/* LEFT */}
        <div className="k-proc__left">
          <div className="k-proc__labelRow">
            <div className="k-proc__label">FOR CLIENTS</div>
            <div className="k-proc__progress" aria-label={`Step ${active + 1} of ${n}`}>
              <span className="k-proc__progressNum">{cur}</span>
              <span style={{ opacity: 0.65 }}>/</span>
              <span style={{ opacity: 0.7 }}>{tot}</span>
            </div>
          </div>

          <div className="k-proc__track" aria-hidden="true">
            <div className="k-proc__trackFill" />
          </div>

          <ol className="k-proc__steps" aria-label="Process steps">
            {steps.map((step, idx) => (
              <li
                key={step.id}
                className={[
                  "k-proc__step",
                  idx === active ? "is-active" : "",
                  pulseIdx === idx ? "is-pulse" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button type="button" className="k-proc__stepBtn" onClick={() => jumpTo(idx)}>
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

        {/* RIGHT */}
        <div className="k-proc__right" aria-label="Step scene">
          <div className="k-proc__stage">
            <div
              className="k-proc__spot"
              style={{
                ["--sx" as any]: `${s.spot.x + spotDriftX}%`,
                ["--sy" as any]: `${s.spot.y + spotDriftY}%`,
              }}
              aria-hidden="true"
            />

            <div
              className="k-proc__plane"
              style={{
                transform: prefersReducedMotion() ? undefined : `translate3d(0, ${planeY}px, 0)`,
              }}
              aria-hidden="true"
            />

            <span className="k-proc__px k-proc__px--1" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--2" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--3" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--4" aria-hidden="true" />
            <span className="k-proc__px k-proc__px--5" aria-hidden="true" />

            {/* CARDS */}
            <div className="k-proc__cards is-enter" key={`${s.id}-${enterTick}`}>
              {s.cards.map((c, i) => {
                const d = depth[i] ?? 0.85;

                // Subtle parallax offsets (px)
                const py = prefersReducedMotion() ? 0 : t * -10 * d;
                const px = prefersReducedMotion() ? 0 : t * 6 * (0.6 + d * 0.25);

                // Keep base transform intact + add parallax translate
                const base = `translate(-50%, -50%) rotate(${c.r ?? 0}deg)`;
                const extra = ` translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;

                return (
                  <div
                    key={c.key}
                    className="k-proc__card"
                    style={{
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      width: `${c.w}px`,
                      height: `${c.h}px`,
                      transform: `${base}${extra}`,
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
                );
              })}
            </div>

            {/* Tiny info chips */}
            <div className="k-proc__detail">
              <div className="k-proc__detailTitle">{s.title}</div>
              <div className="k-proc__chips" aria-label="This step covers">
                {s.chips.map((t) => (
                  <span className="k-proc__chip" key={t}>
                    <span className="k-proc__chipDot" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="k-proc__spacer" aria-hidden="true" />
    </div>
  );
}
