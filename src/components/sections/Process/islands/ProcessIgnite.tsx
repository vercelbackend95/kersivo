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

const heatTriangle = (p: number) => {
  // p: 0..1 -> heat: 0..1..0 (triangle)
  const t = 1 - Math.abs(2 * p - 1);
  return Math.max(0, Math.min(1, t));
};

export default function ProcessIgnite() {
  const wrapRefs = useRef<HTMLDivElement[]>([]);
  const data = useMemo(() => blocks, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // iOS Safari: address-bar resize & refresh storms
    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });

    const wraps = wrapRefs.current.filter(Boolean);
    if (!wraps.length) return;

    const reduced = reducedMotion();
    const html = document.documentElement;

    // ---- Kill old triggers (HMR-safe)
    ScrollTrigger.getAll().forEach((t) => {
      const id = (t.vars as any)?.id;
      if (typeof id === "string" && id.startsWith("procHeat-")) t.kill();
    });

    // ---- init heat + perf hints
    const setters = wraps.map((w) => {
      w.style.setProperty("--heat", "0");
      const main = w.querySelector(".k-processPill__main") as HTMLElement | null;
      if (main) {
        main.style.willChange = "transform, opacity";
        main.style.transform = "translateZ(0)";
      }
      return gsap.quickSetter(w, "--heat", "");
    });

    // ---- active class: event-driven (no ticker, no layout scans)
    let activeIdx = -1;
    const setActive = (idx: number) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      for (let i = 0; i < wraps.length; i++) {
        wraps[i].classList.toggle("is-active", i === idx);
      }
    };

    // ---- triggers
    wraps.forEach((el, i) => {
      ScrollTrigger.create({
        id: `procHeat-${i}`,
        trigger: el,
        start: "top 85%",
        end: "bottom 15%",
        scrub: reduced ? false : 0.65,
        invalidateOnRefresh: true,

        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),

        onUpdate: (self) => {
          // direction for frame wipe
          html.dataset.scrollDir = self.direction < 0 ? "up" : "down";

          // heat
          const p = self.progress;
          const h = reduced ? 1 : heatTriangle(p);
          setters[i](h);
        },
      });
    });

    // initial
    setActive(0);
    ScrollTrigger.refresh();

    return () => {
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
                    <span className="k-processPill__stepText">
                      Keep it lean. Keep it premium.
                    </span>
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
