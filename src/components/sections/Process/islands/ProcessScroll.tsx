import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Step = {
  n: number;
  title: string;
  sub: string;
  chips: string[];
  detailTitle: string;
  detailChips: string[];
  scene: {
    spot: { x: string; y: string };
    minis: Array<{ x: string; y: string; variant?: 1 | 2 | 3 }>;
    cards: Array<{
      x: string;
      y: string;
      w: string;
      h: string;
      title: string;
      cta?: "mint" | "blue";
    }>;
  };
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function ProcessScroll() {
  const reduced = useReducedMotion();

  const steps: Step[] = useMemo(
    () => [
      {
        n: 1,
        title: "Discovery & goals",
        sub: "Scope, audience, offer, and what success actually means.",
        chips: ["Goals", "Audience", "Offer"],
        detailTitle: "Output",
        detailChips: ["Clear scope", "KPIs", "Content map"],
        scene: {
          spot: { x: "62%", y: "40%" },
          minis: [
            { x: "28%", y: "40%", variant: 1 },
            { x: "40%", y: "46%", variant: 2 },
            { x: "34%", y: "56%", variant: 3 },
          ],
          cards: [
            { x: "52%", y: "34%", w: "280px", h: "180px", title: "Brief" },
            { x: "70%", y: "54%", w: "320px", h: "200px", title: "Offer" },
            { x: "55%", y: "64%", w: "240px", h: "170px", title: "Notes", cta: "blue" },
          ],
        },
      },
      {
        n: 2,
        title: "Structure & UX",
        sub: "We design the journey: sections, hierarchy, conversion flow.",
        chips: ["Wireframe", "Flow", "CTA"],
        detailTitle: "Output",
        detailChips: ["Wireframe", "CTA hierarchy", "Mobile-first layout"],
        scene: {
          spot: { x: "58%", y: "44%" },
          minis: [
            { x: "30%", y: "42%", variant: 1 },
            { x: "42%", y: "52%", variant: 2 },
            { x: "36%", y: "62%", variant: 3 },
          ],
          cards: [
            { x: "56%", y: "36%", w: "300px", h: "190px", title: "Wireframe" },
            { x: "73%", y: "56%", w: "330px", h: "210px", title: "Sections" },
            { x: "56%", y: "68%", w: "250px", h: "170px", title: "CTA flow", cta: "mint" },
          ],
        },
      },
      {
        n: 3,
        title: "Visual system",
        sub: "Premium minimal UI: type, spacing, components, vibe.",
        chips: ["Type", "Tokens", "Components"],
        detailTitle: "Output",
        detailChips: ["Design system", "Component library", "Polish pass"],
        scene: {
          spot: { x: "66%", y: "40%" },
          minis: [
            { x: "32%", y: "44%", variant: 1 },
            { x: "44%", y: "52%", variant: 2 },
            { x: "38%", y: "62%", variant: 3 },
          ],
          cards: [
            { x: "54%", y: "36%", w: "290px", h: "190px", title: "Typography" },
            { x: "74%", y: "54%", w: "340px", h: "220px", title: "Components" },
            { x: "56%", y: "70%", w: "260px", h: "170px", title: "Tokens", cta: "blue" },
          ],
        },
      },
      {
        n: 4,
        title: "Build (Astro-first)",
        sub: "Fast, clean code. Lighthouse-ready. No bloat, no drama.",
        chips: ["Astro", "Perf", "SEO"],
        detailTitle: "Output",
        detailChips: ["Optimised assets", "Clean HTML", "Score targets"],
        scene: {
          spot: { x: "60%", y: "46%" },
          minis: [
            { x: "30%", y: "44%", variant: 1 },
            { x: "42%", y: "54%", variant: 2 },
            { x: "36%", y: "64%", variant: 3 },
          ],
          cards: [
            { x: "54%", y: "36%", w: "310px", h: "200px", title: "Build" },
            { x: "74%", y: "56%", w: "340px", h: "210px", title: "Performance" },
            { x: "56%", y: "70%", w: "260px", h: "170px", title: "SEO checks", cta: "mint" },
          ],
        },
      },
      {
        n: 5,
        title: "QA & conversion pass",
        sub: "We test the flow, copy clarity, and friction points.",
        chips: ["QA", "Copy", "Friction"],
        detailTitle: "Output",
        detailChips: ["Bug-free", "Clear messaging", "Tighter conversion"],
        scene: {
          spot: { x: "64%", y: "42%" },
          minis: [
            { x: "30%", y: "42%", variant: 1 },
            { x: "44%", y: "52%", variant: 2 },
            { x: "36%", y: "62%", variant: 3 },
          ],
          cards: [
            { x: "54%", y: "36%", w: "300px", h: "190px", title: "QA checklist" },
            { x: "74%", y: "56%", w: "340px", h: "220px", title: "Conversion pass" },
            { x: "56%", y: "70%", w: "260px", h: "170px", title: "Fixes", cta: "blue" },
          ],
        },
      },
      {
        n: 6,
        title: "Launch & handover",
        sub: "Deploy, track, and hand you a site you can actually use.",
        chips: ["Deploy", "Analytics", "Handover"],
        detailTitle: "Output",
        detailChips: ["Live launch", "Tracking", "Support window"],
        scene: {
          spot: { x: "62%", y: "40%" },
          minis: [
            { x: "30%", y: "42%", variant: 1 },
            { x: "44%", y: "52%", variant: 2 },
            { x: "36%", y: "62%", variant: 3 },
          ],
          cards: [
            { x: "54%", y: "36%", w: "290px", h: "190px", title: "Deploy" },
            { x: "74%", y: "56%", w: "340px", h: "220px", title: "Tracking" },
            { x: "56%", y: "70%", w: "260px", h: "170px", title: "Handover", cta: "mint" },
          ],
        },
      },
    ],
    []
  );

  const total = steps.length;
  const [active, setActive] = useState(0);

  // ===== MOBILE: rail scroll spy
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        const r = rail.getBoundingClientRect();
        const center = r.left + r.width / 2;

        let best = 0;
        let bestDist = Infinity;

        cardRefs.current.forEach((el, idx) => {
          if (!el) return;
          const cr = el.getBoundingClientRect();
          const c = cr.left + cr.width / 2;
          const d = Math.abs(c - center);
          if (d < bestDist) {
            bestDist = d;
            best = idx;
          }
        });

        setActive((a) => (a === best ? a : best));
      });
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToCard = (idx: number) => {
    const rail = railRef.current;
    const el = cardRefs.current[idx];
    if (!rail || !el) return;

    const left = el.offsetLeft - (rail.clientWidth - el.clientWidth) / 2;
    rail.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  };

  // ===== DESKTOP: scroll-driven active step + progress
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [prog, setProg] = useState(0); // 0..1
  const [enterKey, setEnterKey] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let raf = 0;

    const read = () => {
      raf = 0;

      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // progress through wrapper (0..1)
      const totalH = rect.height - vh;
      const raw = totalH <= 0 ? 0 : clamp((-rect.top) / totalH, 0, 1);
      setProg(raw);

      // active step based on segment height 0.92vh
      const seg = 0.92 * vh;
      const traveled = clamp(-rect.top, 0, rect.height);
      const idx = clamp(Math.floor(traveled / seg + 0.15), 0, total - 1);
      setActive((a) => (a === idx ? a : idx));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    read();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total]);

  useEffect(() => {
    // trigger card entrance animation on desktop when step changes
    setEnterKey((k) => k + 1);
  }, [active]);

  const jumpTo = (idx: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const vh = window.innerHeight || 1;
    const seg = 0.92 * vh;

    const top = window.scrollY + wrap.getBoundingClientRect().top;
    const navOffset = 96; // topnav + air
    const target = top + idx * seg - navOffset;

    window.scrollTo({ top: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });
  };

  const step = steps[active];

  return (
    <>
      {/* =========================
          MOBILE: step cards deck
         ========================= */}
      <div className="k-procM" aria-label="Process steps (mobile)">
        <div className="k-procM__top">
          <div className="k-procM__label">Steps</div>
          <div className="k-procM__progress" aria-live="polite">
            <span className="k-procM__num">{String(active + 1).padStart(2, "0")}</span>
            <span className="k-procM__slash">/</span>
            <span className="k-procM__tot">{String(total).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="k-procM__dots" role="tablist" aria-label="Jump to step">
          {steps.map((s, i) => (
            <button
              key={s.n}
              type="button"
              className={"k-procM__dot" + (i === active ? " is-on" : "")}
              aria-label={`Go to step ${s.n}`}
              aria-selected={i === active}
              onClick={() => scrollToCard(i)}
            />
          ))}
        </div>

        <div ref={railRef} className="k-procM__rail">
          {steps.map((s, i) => (
            <div
              key={s.n}
              ref={(el) => (cardRefs.current[i] = el)}
              className={"k-procM__card" + (i === active ? " is-active" : "")}
            >
              <button type="button" className="k-procM__cardBtn" onClick={() => scrollToCard(i)}>
                <div className="k-procM__cardHead">
                  <div className="k-procM__badge">{String(s.n).padStart(2, "0")}</div>
                  <div className="k-procM__titles">
                    <div className="k-procM__title">{s.title}</div>
                    <div className="k-procM__sub">{s.sub}</div>
                  </div>
                </div>

                <div className="k-procM__chips">
                  {s.chips.map((c) => (
                    <div key={c} className="k-procM__chip">
                      <span className="k-procM__chipDot" aria-hidden="true" />
                      {c}
                    </div>
                  ))}
                </div>

                <div
                  className="k-procM__thumb"
                  style={
                    {
                      ["--sx" as any]: s.scene.spot.x,
                      ["--sy" as any]: s.scene.spot.y,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  <div className="k-procM__thumbSpot" />

                  {s.scene.minis.map((m, mi) => (
                    <div
                      key={mi}
                      className={
                        "k-procM__miniCard" +
                        (m.variant === 2 ? " k-procM__miniCard--2" : "") +
                        (m.variant === 3 ? " k-procM__miniCard--3" : "")
                      }
                      style={{ left: m.x, top: m.y }}
                    />
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =========================
          DESKTOP: sticky stepper + scene
         ========================= */}
      <div
        ref={wrapRef}
        className="k-proc"
        style={
          {
            ["--steps" as any]: total,
            ["--prog" as any]: prog,
            ["--sx" as any]: step.scene.spot.x,
            ["--sy" as any]: step.scene.spot.y,
          } as React.CSSProperties
        }
        aria-label="Process steps (desktop)"
      >
        <div className="k-proc__sticky">
          <div className="k-proc__left">
            <div className="k-proc__labelRow">
              <div className="k-proc__label">Steps</div>
              <div className="k-proc__progress" aria-live="polite">
                <span className="k-proc__progressNum">{String(active + 1).padStart(2, "0")}</span>
                <span aria-hidden="true">/</span>
                <span>{String(total).padStart(2, "0")}</span>
              </div>
            </div>

            <div className="k-proc__track" aria-hidden="true">
              <div className="k-proc__trackFill" />
            </div>

            <ol className="k-proc__steps">
              {steps.map((s, i) => (
                <li
                  key={s.n}
                  className={"k-proc__step" + (i === active ? " is-active is-pulse" : "")}
                >
                  <button type="button" className="k-proc__stepBtn" onClick={() => jumpTo(i)}>
                    <div className="k-proc__num">{String(s.n).padStart(2, "0")}</div>
                    <div className="k-proc__text">
                      <div className="k-proc__stepTitle">{s.title}</div>
                      <div className="k-proc__stepSub">{s.sub}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="k-proc__right">
            <div className="k-proc__stage" aria-hidden="true">
              <div className="k-proc__spot" />
              <div className="k-proc__plane" />

              <span className="k-proc__px k-proc__px--1" />
              <span className="k-proc__px k-proc__px--2" />
              <span className="k-proc__px k-proc__px--3" />
              <span className="k-proc__px k-proc__px--4" />
              <span className="k-proc__px k-proc__px--5" />

              <div key={enterKey} className="k-proc__cards is-enter">
                {step.scene.cards.map((c, idx) => (
                  <div
                    key={idx}
                    className="k-proc__card"
                    style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
                  >
                    <div className="k-proc__cardTop">
                      <span className="k-proc__dot" />
                      <span className="k-proc__dot" />
                      <span className="k-proc__dot" />
                      <span className="k-proc__cardTitle">{c.title}</span>
                    </div>

                    <div className="k-proc__cardBody">
                      <div className="k-proc__row" />
                      <div className="k-proc__row k-proc__row--short" />
                      <div className="k-proc__row k-proc__row--micro" />

                      <div
                        className={
                          "k-proc__cta" +
                          (c.cta === "blue" ? " is-blue" : "")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="k-proc__detail">
              <div className="k-proc__detailTitle">{step.detailTitle}</div>
              <div className="k-proc__chips">
                {step.detailChips.map((c) => (
                  <div key={c} className="k-proc__chip">
                    <span className="k-proc__chipDot" aria-hidden="true" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="k-proc__spacer" aria-hidden="true" />
      </div>
    </>
  );
}
