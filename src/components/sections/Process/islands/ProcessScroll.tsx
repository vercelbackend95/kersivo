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

function useMedia(query: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const set = () => setOn(!!m.matches);
    set();
    const onChange = () => set();
    if (m.addEventListener) m.addEventListener("change", onChange);
    else m.addListener(onChange);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange);
      else m.removeListener(onChange);
    };
  }, [query]);
  return on;
}

function reducedMotion() {
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const desktopMQ = useMedia("(min-width: 981px)");
  const isDesktop = mounted && desktopMQ;

  const n = steps.length;
  const BAND_VH = 92;

  const [active, setActive] = useState(0);

  // latest active for handlers (no stale closure)
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // gate: true only when #process section is in view
  const inProcessRef = useRef(false);
  const [inProcess, setInProcess] = useState(false);

  // one-shot sweep on active change (desktop only)
  const [sweepIdx, setSweepIdx] = useState<number | null>(null);
  useEffect(() => {
    if (!mounted || !isDesktop) return;
    if (reducedMotion()) return;
    setSweepIdx(active);
    const t = window.setTimeout(() => setSweepIdx(null), 760);
    return () => window.clearTimeout(t);
  }, [active, mounted, isDesktop]);

  // =========================
  // MOBILE: snap rail
  // =========================
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (isDesktop) return;

    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-step-card]"));
        if (!cards.length) return;

        const r = rail.getBoundingClientRect();
        const mid = r.left + r.width / 2;

        let bestIdx = 0;
        let bestDist = Infinity;

        cards.forEach((c, idx) => {
          const cr = c.getBoundingClientRect();
          const cmid = cr.left + cr.width / 2;
          const d = Math.abs(cmid - mid);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });

        setActive(bestIdx);
      });
    };

    onScroll();
    rail.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted, isDesktop]);

  const scrollToCard = (idx: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(`[data-step-card="${idx}"]`);
    if (!card) return;
    card.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  // =========================
  // DESKTOP: sticky rig
  // =========================
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [prog, setProg] = useState(0);
  const [local, setLocal] = useState(0);
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);
  const [enterTick, setEnterTick] = useState(0);

  const pulseTRef = useRef<number | null>(null);
  const sweepTRef = useRef<number | null>(null);

  // WHEEL-LOCK state
  const wheelLockOn = useRef(false);
  const wheelAcc = useRef(0);
  const wheelCooldown = useRef<number | null>(null);

  const fireStepFx = (idx: number) => {
    if (reducedMotion()) return;

    setPulseIdx(idx);
    if (pulseTRef.current) window.clearTimeout(pulseTRef.current);
    pulseTRef.current = window.setTimeout(() => setPulseIdx(null), 520);

    setSweepIdx(idx);
    if (sweepTRef.current) window.clearTimeout(sweepTRef.current);
    sweepTRef.current = window.setTimeout(() => setSweepIdx(null), 760);
  };

  useEffect(() => {
    return () => {
      if (pulseTRef.current) window.clearTimeout(pulseTRef.current);
      if (sweepTRef.current) window.clearTimeout(sweepTRef.current);
    };
  }, []);

  // Observe SECTION #process (wrapper in Process.astro)
  useEffect(() => {
    if (!mounted) return;

    const section = document.getElementById("process");
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const on = !!entry?.isIntersecting && (entry.intersectionRatio ?? 0) > 0.01;

        inProcessRef.current = on;
        setInProcess(on);

        // leaving: reset lock so normal page scroll returns
        if (!on) {
          wheelLockOn.current = false;
          wheelAcc.current = 0;
        }
      },
      {
        // activate early; the "stop" should feel immediate
        root: null,
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0, 0.01, 0.05, 0.15, 0.35],
      }
    );

    io.observe(section);
    return () => io.disconnect();
  }, [mounted]);

  const scrollToStepCenter = (idx: number, behavior: ScrollBehavior) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const scrollable = Math.max(1, rect.height - vh);
    const rootTop = rect.top + window.scrollY;

    const targetP = (idx + 0.5) / n;
    const targetY = rootTop + targetP * scrollable;

    window.scrollTo({ top: targetY, behavior });
  };

  const nearestStepFromScroll = () => {
    const root = rootRef.current;
    if (!root) return 0;

    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const scrollable = Math.max(1, rect.height - vh);
    const progressed = clamp(-rect.top, 0, scrollable);
    const p = progressed / scrollable;

    return clamp(Math.round(p * n - 0.5), 0, n - 1);
  };

  // Desktop scroll progress (only when NOT locked)
  useEffect(() => {
    if (!mounted) return;
    if (!isDesktop) return;

    const root = rootRef.current;
    if (!root) return;

    const reduced = reducedMotion();
    let pulseT: number | null = null;

    // ensure rig has scroll length
    try {
      const min = Math.max(1, n * BAND_VH + 30);
      root.style.setProperty("min-height", `${min}vh`, "important");

      const spacer = root.querySelector<HTMLElement>(".k-proc__spacer");
      if (spacer) {
        spacer.style.setProperty("display", "block", "important");
        spacer.style.setProperty("position", "static", "important");
        spacer.style.setProperty("height", `${Math.max(1, n * BAND_VH)}vh`, "important");
      }
    } catch {}

    const update = () => {
      rafRef.current = null;

      // if we are locked, don't let normal scroll update override the step
      if (wheelLockOn.current) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      const scrollable = Math.max(1, rect.height - vh);
      const progressed = clamp(-rect.top, 0, scrollable);
      const p = progressed / scrollable;

      setProg(p);

      const bandFloat = p * n;
      const idx = clamp(Math.floor(bandFloat + 1e-6), 0, n - 1);
      const bandT = clamp(bandFloat - idx, 0, 1);

      setLocal(bandT);

      setActive((prev) => {
        if (prev !== idx) {
          if (!reduced) setEnterTick((t) => t + 1);
          setPulseIdx(idx);
          if (pulseT) window.clearTimeout(pulseT);
          pulseT = window.setTimeout(() => setPulseIdx(null), 520);
        }
        return idx;
      });
    };

    const onScroll = () => {
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pulseT) window.clearTimeout(pulseT);

      if (wheelCooldown.current) window.clearTimeout(wheelCooldown.current);
      wheelCooldown.current = null;
    };
  }, [mounted, isDesktop, n, BAND_VH]);

  // ✅ GLOBAL wheel handler on desktop; it activates ONLY inside #process
  useEffect(() => {
    if (!mounted || !isDesktop) return;
    if (reducedMotion()) return;

    const root = rootRef.current;
    if (!root) return;

    const setStepNoScroll = (idx: number) => {
      const next = clamp(idx, 0, n - 1);
      activeRef.current = next;
      setActive(next);

      // keep UI indicators in sync even without scrolling the page
      setProg((next + 0.5) / n);
      setLocal(0.5);
    };

    const onWheel = (e: WheelEvent) => {
      // outside process: do nothing, normal page scroll
      if (!inProcessRef.current) return;

      // inside process: we own the wheel
      e.preventDefault();

      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // first touch: engage lock + align once (small correction inside process)
      if (!wheelLockOn.current) {
        wheelLockOn.current = true;
        wheelAcc.current = 0;

        const near = nearestStepFromScroll();
        setStepNoScroll(near);

        // tiny align so the sticky matches the “photo pose”
        scrollToStepCenter(near, "auto");
      }

      wheelAcc.current += e.deltaY;

      const threshold = Math.max(60, vh * 0.06);
      if (Math.abs(wheelAcc.current) < threshold) return;

      const dir = wheelAcc.current > 0 ? 1 : -1;
      wheelAcc.current = 0;

      if (wheelCooldown.current) return;
      wheelCooldown.current = window.setTimeout(() => {
        wheelCooldown.current = null;
      }, 220);

      const cur = activeRef.current;
      const atFirst = cur === 0;
      const atLast = cur === n - 1;

      // edges: release lock and allow page to continue
      if (dir < 0 && atFirst) {
        wheelLockOn.current = false;
        // nudge up a hair so you clearly exit the section
        window.scrollTo({ top: window.scrollY - 24, behavior: "auto" });
        return;
      }
      if (dir > 0 && atLast) {
        wheelLockOn.current = false;
        window.scrollTo({ top: window.scrollY + vh * 0.45, behavior: "auto" });
        return;
      }

      const next = clamp(cur + dir, 0, n - 1);
      fireStepFx(next);
      setStepNoScroll(next);
    };

    // optional: block “Space / PageDown” while locked (prevents bypass)
    const onKey = (e: KeyboardEvent) => {
      if (!inProcessRef.current) return;
      if (!wheelLockOn.current) return;

      const keys = [" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"];
      if (keys.includes(e.key)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKey, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, true as any);
      window.removeEventListener("keydown", onKey, true as any);
      if (wheelCooldown.current) window.clearTimeout(wheelCooldown.current);
      wheelCooldown.current = null;
    };
  }, [mounted, isDesktop, n]);

  const setStepFromClickNoScroll = (idx: number) => {
    const next = clamp(idx, 0, n - 1);
    fireStepFx(next);

    // engage lock (so next wheel scroll continues inside Process)
    wheelLockOn.current = true;
    wheelAcc.current = 0;

    activeRef.current = next;
    setActive(next);
    setProg((next + 0.5) / n);
    setLocal(0.5);

    // IMPORTANT: no window.scrollTo here. zero teleport.
  };

  const onStepKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setStepFromClickNoScroll(idx + 1);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setStepFromClickNoScroll(idx - 1);
    }
    if (e.key === "Home") {
      e.preventDefault();
      setStepFromClickNoScroll(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      setStepFromClickNoScroll(n - 1);
    }
  };

  const s = steps[active];
  const cur = String(active + 1).padStart(2, "0");
  const tot = String(n).padStart(2, "0");

  const timelineNote = "Typical timeline: 2–4 weeks (varies by scope)";

  // parallax driver for desktop scene
  const t = (local - 0.5) * 2;
  const planeY = t * -6;
  const spotDriftX = t * 2.2;
  const spotDriftY = t * -1.6;
  const depth = [1.2, 0.85, 1.05, 0.7];

  return (
    <>
      {/* =========================
          MOBILE DOM
         ========================= */}
      <div className="k-procM" aria-label="Process (mobile)">
        <div className="k-procM__top">
          <div className="k-procM__label">FOR CLIENTS</div>

          <div className="k-procM__progress" aria-label={`Step ${active + 1} of ${n}`}>
            <span className="k-procM__num">{cur}</span>
            <span className="k-procM__slash">/</span>
            <span className="k-procM__tot">{tot}</span>
            <span className="k-procM__time">{timelineNote}</span>
          </div>
        </div>

        <div className="k-procM__dots" role="tablist" aria-label="Steps">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={"k-procM__dot" + (i === active ? " is-on" : "")}
              onClick={() => {
                fireStepFx(i);
                scrollToCard(i);
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="k-procM__nav" aria-label="Step navigation">
          <button
            type="button"
            className="k-procM__navBtn"
            onClick={() => {
              const next = Math.max(0, active - 1);
              fireStepFx(next);
              scrollToCard(next);
            }}
            disabled={active === 0}
          >
            ←
          </button>

          <button
            type="button"
            className="k-procM__navBtn is-next"
            onClick={() => {
              const next = Math.min(n - 1, active + 1);
              fireStepFx(next);
              scrollToCard(next);
            }}
            disabled={active === n - 1}
          >
            Next step →
          </button>
        </div>

        <div ref={railRef} className="k-procM__rail" aria-label="Process steps">
          {steps.map((step, idx) => {
            const on = idx === active;

            return (
              <article key={step.id} data-step-card={idx} className={"k-procM__card" + (on ? " is-active" : "")}>
                <button
                  type="button"
                  className="k-procM__cardBtn"
                  onClick={() => {
                    fireStepFx(idx);
                    scrollToCard(idx);
                  }}
                >
                  <div className="k-procM__cardHead">
                    <div className="k-procM__badge">{idx + 1}</div>
                    <div className="k-procM__titles">
                      <div className="k-procM__title">{step.title}</div>
                      <div className="k-procM__sub">{step.subtitle}</div>
                    </div>
                  </div>

                  <div className="k-procM__chips" aria-label="This step covers">
                    {step.chips.map((c) => (
                      <span key={c} className="k-procM__chip">
                        <span className="k-procM__chipDot" aria-hidden="true" />
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="k-procM__thumb" aria-hidden="true">
                    <span
                      className="k-procM__thumbSpot"
                      style={{
                        ["--sx" as any]: `${step.spot.x}%`,
                        ["--sy" as any]: `${step.spot.y}%`,
                      }}
                    />
                    {step.cards.slice(0, 3).map((c, i) => (
                      <span
                        key={c.key}
                        className={"k-procM__miniCard k-procM__miniCard--" + (i + 1)}
                        style={{
                          left: `${40 + i * 18}%`,
                          top: `${48 - i * 10}%`,
                          transform: `translate(-50%,-50%) rotate(${c.r ?? 0}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* =========================
          DESKTOP DOM
         ========================= */}
      <div
        ref={rootRef}
        className="k-proc"
        style={{
          ["--steps" as any]: n,
          ["--prog" as any]: prog,
        }}
        aria-label="Process (desktop)"
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
                <span className="k-proc__time">{timelineNote}</span>
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
                    sweepIdx === idx ? "is-sweep" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className="k-proc__stepBtn"
                    onClick={() => setStepFromClickNoScroll(idx)} // ✅ NO SCROLL
                    onKeyDown={(e) => onStepKeyDown(idx, e)}
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
                  transform: reducedMotion() ? undefined : `translate3d(0, ${planeY}px, 0)`,
                }}
                aria-hidden="true"
              />

              <span className="k-proc__px k-proc__px--1" aria-hidden="true" />
              <span className="k-proc__px k-proc__px--2" aria-hidden="true" />
              <span className="k-proc__px k-proc__px--3" aria-hidden="true" />
              <span className="k-proc__px k-proc__px--4" aria-hidden="true" />
              <span className="k-proc__px k-proc__px--5" aria-hidden="true" />

              <div className="k-proc__cards is-enter" key={`${s.id}-${enterTick}`}>
                {s.cards.map((c, i) => {
                  const d = depth[i] ?? 0.85;
                  const py = reducedMotion() ? 0 : t * -10 * d;
                  const px = reducedMotion() ? 0 : t * 6 * (0.6 + d * 0.25);

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

              <div className="k-proc__detail">
                <div className="k-proc__detailTitle">{s.title}</div>
                <div className="k-proc__chips" aria-label="This step covers">
                  {s.chips.map((tt) => (
                    <span className="k-proc__chip" key={tt}>
                      <span className="k-proc__chipDot" aria-hidden="true" />
                      {tt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="k-proc__spacer" aria-hidden="true" />
      </div>
    </>
  );
}
