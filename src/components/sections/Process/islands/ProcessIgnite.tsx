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
      "You’ll know exactly what we’re building, who it's for, and what it should achieve. This keeps everything fast and sharp.",
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
    copy: "We build a small design system so everything feels intentional — like a product, not a template.",
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
    copy: "Performance, SEO, accessibility — handled from day one. No last-minute duct tape.",
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

    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });

    const wraps = wrapRefs.current.filter(Boolean);
    if (!wraps.length) return;

    const reduced = reducedMotion();
    const html = document.documentElement;

    ScrollTrigger.getAll().forEach((t) => {
      const id = (t.vars as any)?.id;
      if (typeof id === "string" && id.startsWith("procEvt-")) t.kill();
    });

    const heatSetters = wraps.map((w) => {
      w.style.setProperty("--heat", "0");
      return gsap.quickSetter(w, "--heat", "");
    });

    const triggers: ScrollTrigger[] = [];

    const setHeat = (i: number, v: number, dir: "up" | "down") => {
      html.dataset.scrollDir = dir;
      if (reduced) {
        heatSetters[i](v);
        return;
      }
      gsap.to(wraps[i], {
        ["--heat" as any]: v,
        duration: v > 0 ? 0.55 : 0.38,
        ease: v > 0 ? "power2.out" : "power2.in",
        overwrite: true,
      });
    };

    let active = -1;
    const setActive = (idx: number) => {
      if (idx === active) return;
      active = idx;
      wraps.forEach((w, i) => w.classList.toggle("is-active", i === idx));
    };

    wraps.forEach((el, i) => {
      const st = ScrollTrigger.create({
        id: `procEvt-${i}`,
        trigger: el,
        start: "top 78%",
        end: "bottom 22%",
        invalidateOnRefresh: true,
        onEnter: (self) => {
          setActive(i);
          setHeat(i, 1, self.direction < 0 ? "up" : "down");
        },
        onLeave: (self) => setHeat(i, 0, self.direction < 0 ? "up" : "down"),
        onEnterBack: (self) => {
          setActive(i);
          setHeat(i, 1, self.direction < 0 ? "up" : "down");
        },
        onLeaveBack: (self) => setHeat(i, 0, self.direction < 0 ? "up" : "down"),
      });
      triggers.push(st);
    });

    // ---- Pinch-zoom guard (hard mode)
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    let zoomed = false;
    let raf = 0;

    const applyZoom = (z: boolean) => {
      if (z === zoomed) return;
      zoomed = z;

      if (zoomed) {
        html.dataset.zoomed = "1";
        triggers.forEach((t) => t.disable(false));
        wraps.forEach((_, idx) => heatSetters);
        gsap.killTweensOf(wraps);
      } else {
        delete html.dataset.zoomed;
        triggers.forEach((t) => t.enable(false));
        ScrollTrigger.refresh();
      }
    };

    const onVV = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const scale = vv?.scale ?? 1;
        // aggressive threshold (iOS can crash even on tiny zoom)
        applyZoom(scale > 1.001);
      });
    };

    const onGestureStart = () => applyZoom(true);
    const onGestureEnd = () => onVV();

    if (vv) {
      vv.addEventListener("resize", onVV);
      vv.addEventListener("scroll", onVV);
    }

    // gesture events (Safari)
    window.addEventListener("gesturestart", onGestureStart as any, { passive: true } as any);
    window.addEventListener("gestureend", onGestureEnd as any, { passive: true } as any);

    setActive(0);
    if (!reduced) {
      gsap.to(wraps[0], { ["--heat" as any]: 0.55, duration: 0.55, ease: "power2.out", overwrite: true });
    } else {
      heatSetters[0](0.55);
    }

    ScrollTrigger.refresh();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", onVV);
        vv.removeEventListener("scroll", onVV);
      }
      window.removeEventListener("gesturestart", onGestureStart as any);
      window.removeEventListener("gestureend", onGestureEnd as any);

      if (raf) window.cancelAnimationFrame(raf);

      ScrollTrigger.getAll().forEach((t) => {
        const id = (t.vars as any)?.id;
        if (typeof id === "string" && id.startsWith("procEvt-")) t.kill();
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
                <p>Clear scope. Clean build. The kind of website that looks expensive — and loads like it.</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
