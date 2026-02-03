import React, { useLayoutEffect, useMemo, useRef } from "react";

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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

export default function ProcessIgnite() {
  const wrapRefs = useRef<HTMLDivElement[]>([]);
  const data = useMemo(() => blocks, []);

  useLayoutEffect(() => {
    // ✅ PRO: zero SSR-crash — GSAP is loaded only in the browser
    if (typeof window === "undefined") return;

    let isMounted = true;
    let triggers: any[] = [];
    let gsap: any;
    let ScrollTrigger: any;

    const html = document.documentElement;
    const wraps = wrapRefs.current.filter(Boolean);
    if (!wraps.length) return;

    const reduced = prefersReducedMotion();

    // init base
    wraps.forEach((w) => w.style.setProperty("--heat", "0"));

    const setActive = (idx: number) => {
      wraps.forEach((w, i) => w.classList.toggle("is-active", i === idx));
    };

    const run = async () => {
      try {
        const gsapMod: any = await import("gsap");
        const stMod: any = await import("gsap/ScrollTrigger");

        gsap = gsapMod.gsap ?? gsapMod.default ?? gsapMod;
        ScrollTrigger = stMod.ScrollTrigger ?? stMod.default ?? stMod;

        if (!isMounted) return;

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.config({
          ignoreMobileResize: true,
          limitCallbacks: true,
        });

        // kill old triggers (HMR / client navigations safe)
        ScrollTrigger.getAll().forEach((t: any) => {
          const id = t?.vars?.id;
          if (typeof id === "string" && id.startsWith("procEvt-")) t.kill();
        });

        const setHeat = (el: HTMLElement, v: number) => {
          if (reduced) {
            el.style.setProperty("--heat", String(v));
            return;
          }
          gsap.to(el, {
            ["--heat" as any]: v,
            duration: v > 0 ? 0.55 : 0.38,
            ease: v > 0 ? "power2.out" : "power2.in",
            overwrite: true,
          });
        };

        wraps.forEach((el, i) => {
          const st = ScrollTrigger.create({
            id: `procEvt-${i}`,
            trigger: el,
            start: "top 78%",
            end: "bottom 22%",
            invalidateOnRefresh: true,

            onEnter: (self: any) => {
              html.dataset.scrollDir = self.direction < 0 ? "up" : "down";
              setActive(i);
              setHeat(el, 1);
            },
            onLeave: (self: any) => {
              html.dataset.scrollDir = self.direction < 0 ? "up" : "down";
              setHeat(el, 0);
            },
            onEnterBack: (self: any) => {
              html.dataset.scrollDir = self.direction < 0 ? "up" : "down";
              setActive(i);
              setHeat(el, 1);
            },
            onLeaveBack: (self: any) => {
              html.dataset.scrollDir = self.direction < 0 ? "up" : "down";
              setHeat(el, 0);
            },
          });

          triggers.push(st);
        });

        // initial state
        setActive(0);
        wraps[0]?.style.setProperty("--heat", reduced ? "0.55" : "0.55");

        ScrollTrigger.refresh();
      } catch (err) {
        // If GSAP fails to load for any reason, we still keep the UI.
        // No hard crash, no 500, just no animation.
        // eslint-disable-next-line no-console
        console.error("[ProcessIgnite] GSAP init failed:", err);
      }
    };

    run();

    return () => {
      isMounted = false;

      try {
        triggers.forEach((t) => t?.kill?.());
        triggers = [];

        if (gsap && wraps.length) {
          gsap.killTweensOf(wraps);
        }
      } catch {
        // silent cleanup
      }
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
