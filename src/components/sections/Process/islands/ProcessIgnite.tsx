import React, { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Block = {
  kicker: string;
  heading: string;
  lead: string;
  title: string;
  copy: string;
  list: { b: string; t: string }[];
  micro: string;
};

const blocks: Block[] = [
  {
    kicker: "Process",
    heading: "A calm build. A sharp result.",
    lead: "No chaos. Just a clean, high-end flow that gets your site live, fast — and built to earn.",
    title: "What happens (without the drama)",
    copy:
      "We work in tight, confident iterations. You always know what’s next, what you’re getting, and why it matters for conversions.",
    list: [
      { b: "Clarity first:", t: "goals, audience, offer, pages." },
      { b: "Premium design:", t: "typography, spacing, UI polish." },
      { b: "Performance by default:", t: "fast, SEO-ready, clean code." },
    ],
    micro: "7–14 days",
  },
  {
    kicker: "Step 01",
    heading: "Discovery & direction",
    lead: "We align on goals, audience, and the offer. Clear scope — no fog, no fluff.",
    title: "We define the win",
    copy:
      "You’ll know exactly what we’re building, who it’s for, and what it should achieve. This keeps everything fast and sharp.",
    list: [
      { b: "Scope:", t: "pages, sections, priority content." },
      { b: "Message:", t: "headline, proof, CTA strategy." },
      { b: "Plan:", t: "timeline, assets, delivery." },
    ],
    micro: "1–2 days",
  },
  {
    kicker: "Step 02",
    heading: "Design system & layout",
    lead: "High-end UI decisions early: spacing, type, components — then the page flows.",
    title: "Premium minimal, not sterile",
    copy:
      "We build a small design system so everything feels intentional — like a product, not a template.",
    list: [
      { b: "Type & rhythm:", t: "clean hierarchy, readable density." },
      { b: "Components:", t: "cards, pills, CTAs, micro-proof." },
      { b: "Layout:", t: "conversion-first structure." },
    ],
    micro: "2–4 days",
  },
  {
    kicker: "Step 03",
    heading: "Build, polish, ship",
    lead: "Astro-first. Fast by default. Then we polish the edges until it feels expensive.",
    title: "Shipping quality",
    copy:
      "Performance, SEO, accessibility — handled from day one. No last-minute duct tape.",
    list: [
      { b: "Speed:", t: "tight CSS, minimal JS, 60fps." },
      { b: "SEO:", t: "clean markup, metadata, structure." },
      { b: "QA:", t: "mobile-first, cross-browser checks." },
    ],
    micro: "3–6 days",
  },
  {
    kicker: "After",
    heading: "Launch support",
    lead: "We don’t vanish. You get a stable handover and optional ongoing tweaks.",
    title: "The site keeps earning",
    copy:
      "Once live, we can iterate: new sections, landing pages, experiments, and conversion upgrades — without ripping things apart.",
    list: [
      { b: "Handover:", t: "docs + simple edit workflow." },
      { b: "Iterate:", t: "new offers, seasonal promos." },
      { b: "Refine:", t: "A/B ideas, CRO improvements." },
    ],
    micro: "Ongoing",
  },
];

function reducedMotion(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    : false;
}

export default function ProcessIgnite() {
  const wrapRefs = useRef<HTMLDivElement[]>([]);
  const data = useMemo(() => blocks, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const wraps = wrapRefs.current.filter(Boolean);
    if (!wraps.length) return;

    const reduced = reducedMotion();

    // ---- Kill old triggers (HMR-safe)
    ScrollTrigger.getAll().forEach((t) => {
      const id = (t.vars as any)?.id;
      if (typeof id === "string" && id.startsWith("procHeat-")) t.kill();
    });

    // ---- Init vars / perf hints
    wraps.forEach((w) => {
      w.style.setProperty("--heat", "0");
      const main = w.querySelector(".k-processPill__main") as HTMLElement | null;
      if (main) {
        main.style.willChange = "transform, opacity";
        main.style.transform = "translateZ(0)";
      }
    });

    // ---- Scroll direction → html[data-scroll-dir="up|down"]
    const html = document.documentElement;
    html.dataset.scrollDir = "down";

    let lastY = window.scrollY || 0;
    let raf = 0;

    const setDir = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const dir = y > lastY ? "down" : y < lastY ? "up" : (html.dataset.scrollDir || "down");
      lastY = y;
      html.dataset.scrollDir = dir;
    };

    const onScrollDir = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(setDir);
    };

    window.addEventListener("scroll", onScrollDir, { passive: true });

    // ---- Heat per card (scrub) : 0 -> 1 -> 0 through center band
    wraps.forEach((el, i) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: `procHeat-${i}`,
          trigger: el,
          start: "top 78%",
          end: "bottom 22%",
          scrub: reduced ? false : 0.55,
        },
      });

      tl.to(el, { ["--heat" as any]: 1, duration: 0.5, ease: "none" }, 0);
      tl.to(el, { ["--heat" as any]: 0, duration: 0.5, ease: "none" }, 0.5);
    });

    // ---- Active class (for typography emphasis only; no state, no re-render)
    let activeIdx = -1;

    const setActive = (idx: number) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      for (let i = 0; i < wraps.length; i++) {
        wraps[i].classList.toggle("is-active", i === idx);
      }
    };

    const pickActive = () => {
      const vh = window.innerHeight || 1;
      const eye = vh * 0.58;

      let best = 0;
      let bestDist = Infinity;

      for (let i = 0; i < wraps.length; i++) {
        const main = wraps[i].querySelector(".k-processPill__main") as HTMLElement | null;
        if (!main) continue;
        const r = main.getBoundingClientRect();
        const c = (r.top + r.bottom) / 2;
        const d = Math.abs(c - eye);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setActive(best);
    };

    gsap.ticker.add(pickActive);

    pickActive();
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(pickActive);
      window.removeEventListener("scroll", onScrollDir);
      if (raf) window.cancelAnimationFrame(raf);

      ScrollTrigger.getAll().forEach((t) => {
        const id = (t.vars as any)?.id;
        if (typeof id === "string" && id.startsWith("procHeat-")) t.kill();
      });
    };
  }, []);

  return (
    <div className="k-processPill__stack">
      {data.map((b, i) => (
        <div
          className="k-processPill__wrap"
          key={i}
          ref={(el) => {
            if (!el) return;
            wrapRefs.current[i] = el;
          }}
          style={{ ["--heat" as any]: 0 }}
        >
          <div className="k-processPill__main">
            {/* FRAME (directional wipe) */}
            <span className="k-processPill__frame" aria-hidden="true" />

            <div className="k-processPill__left" aria-hidden="true">
              <div className="k-processPill__leftInner">
                <div className="k-processPill__miniKicker">{b.kicker}</div>

                <ol className="k-processPill__steps">
                  <li className="k-processPill__step">
                    <span className="k-processPill__dot" />
                    <span className="k-processPill__stepText">{b.heading}</span>
                  </li>
                  <li className="k-processPill__step">
                    <span className="k-processPill__dot" />
                    <span className="k-processPill__stepText">{b.lead}</span>
                  </li>
                  <li className="k-processPill__step">
                    <span className="k-processPill__dot" />
                    <span className="k-processPill__stepText">Keep it lean. Keep it premium.</span>
                  </li>
                </ol>

                <div className="k-processPill__meter" role="presentation">
                  <span className="k-processPill__meterFill" />
                </div>

                <div className="k-processPill__micro">
                  <span className="k-processPill__microLabel">Typical timeline</span>
                  <span className="k-processPill__microValue">{b.micro}</span>
                </div>
              </div>
            </div>

            <div className="k-processPill__right">
              <h3 className="k-processPill__title">{b.title}</h3>
              <p className="k-processPill__copy">{b.copy}</p>

              <ul className="k-processPill__list">
                {b.list.map((x, j) => (
                  <li key={j}>
                    <strong>{x.b}</strong> {x.t}
                  </li>
                ))}
              </ul>

              <div className="k-processPill__note">
                <h6>Built for UK small businesses</h6>
                <p>
                  Clear scope. Clean build. The kind of website that looks expensive — and loads like it.
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
