import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Focus = "conversion" | "seo" | "speed";

const spring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.75,
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

export default function WorkShowcase() {
  const [focus, setFocus] = useState<Focus>("conversion");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const focusMeta = useMemo(() => {
    const map: Record<
      Focus,
      { title: string; desc: string; highlight: "quote" | "seo" | "speed" }
    > = {
      conversion: {
        title: "Conversion-first flow",
        desc: "Clear CTA rhythm, friction-free sections, and mobile thumb-zone decisions.",
        highlight: "quote",
      },
      seo: {
        title: "SEO-first foundation",
        desc: "Clean structure, semantic headings, and share-ready metadata from day one.",
        highlight: "seo",
      },
      speed: {
        title: "Speed budget mindset",
        desc: "Fast by default — minimal JS, smart rendering, and tight assets discipline.",
        highlight: "speed",
      },
    };
    return map[focus];
  }, [focus]);

  const buying = useMemo(
    () => [
      {
        id: "quote" as const,
        icon: "✓",
        title: "Quote in 24h",
        desc: "with a clean scope + budget range.",
      },
      {
        id: "proof" as const,
        icon: "▦",
        title: "Proof Pack",
        desc: "during delivery — checklists, snapshots, visible progress.",
      },
      {
        id: "speed" as const,
        icon: "⚡",
        title: "Performance budget mindset",
        desc: "fast by default, no bloat.",
      },
      {
        id: "seo" as const,
        icon: "⌁",
        title: "SEO foundations",
        desc: "schema, Open Graph, clean structure.",
      },
    ],
    []
  );

  return (
    <div className="k-workCard" data-focus={focus}>
      <div className="k-work__head">
        <div>
          <div className="k-work__eyebrow">WORK</div>

          <h2 className="k-work__title">
            One live demo. <span className="k-work__grad">Real build</span> quality.
          </h2>

          <p className="k-work__lead">
            No fake case studies. You get a clean system + a tailored skin — then we ship it fast.
          </p>
        </div>

        {/* tags: ONLY 3, reszta w tooltip + spec strip */}
        <div className="k-work__tags" aria-label="Work tags">
          <span className="k-work__tag">Proof Pack</span>
          <span className="k-work__tag">Fast builds</span>
          <span className="k-work__tag">Astro-first</span>

          <span className="k-work__moreWrap">
            <button className="k-work__moreBtn" type="button" aria-label="More details">
              i
            </button>
            <span className="k-work__tooltip" role="tooltip">
              No bloat • 60fps motion
            </span>
          </span>
        </div>
      </div>

      <div className="k-work__grid">
        {/* LEFT: STAGE */}
        <div className="k-stage">
          <div className="k-stage__top">
            <div className="k-stage__title">
              <div className="k-stage__nameRow">
                <span className="k-stage__name">Neo Gentleman — Barber Demo</span>
                <span className="k-stage__live">LIVE</span>
              </div>

              <div className="k-stage__sub">
                Premium dark vibe, sharp conversion flow, app-like motion. Frontend-only — fast by design.
              </div>
            </div>
          </div>

          <div className="k-stage__frame">
            <div className="k-stage__chrome" aria-hidden="true">
              <span className="k-stage__dots" />
              <span className="k-stage__url">kersivo.co.uk/demo</span>
              <span className="k-stage__pill">Preview</span>
            </div>

            <div className={cn("k-stage__viewport", device === "mobile" && "is-mobile")} aria-label="Demo preview">
              {/* WOW: subtle scanline + glare only for Work */}
              <span className="k-stage__scan" aria-hidden="true" />
              <span className="k-stage__glare" aria-hidden="true" />

              {/* placeholder (swap to screenshot/iframe later) */}
              <div className="k-stage__placeholder">
                <div className="k-stage__phLabel">Demo preview</div>
              </div>
            </div>

            <div className="k-stage__controls" aria-label="Demo controls">
              <div className="k-toggle" role="tablist" aria-label="Device toggle">
                <button
                  type="button"
                  className={cn("k-toggle__btn", device === "desktop" && "is-active")}
                  onClick={() => setDevice("desktop")}
                  aria-selected={device === "desktop"}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={cn("k-toggle__btn", device === "mobile" && "is-active")}
                  onClick={() => setDevice("mobile")}
                  aria-selected={device === "mobile"}
                >
                  Mobile
                </button>
              </div>

              <div className="k-focus" role="tablist" aria-label="Focus switch">
                <button
                  type="button"
                  className={cn("k-focus__btn", focus === "conversion" && "is-active")}
                  onClick={() => setFocus("conversion")}
                  aria-selected={focus === "conversion"}
                >
                  Conversion
                </button>
                <button
                  type="button"
                  className={cn("k-focus__btn", focus === "seo" && "is-active")}
                  onClick={() => setFocus("seo")}
                  aria-selected={focus === "seo"}
                >
                  SEO
                </button>
                <button
                  type="button"
                  className={cn("k-focus__btn", focus === "speed" && "is-active")}
                  onClick={() => setFocus("speed")}
                  aria-selected={focus === "speed"}
                >
                  Speed
                </button>
              </div>
            </div>

            <div className="k-focusMeta" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={focus}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: spring }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                >
                  <div className="k-focusMeta__title">{focusMeta.title}</div>
                  <div className="k-focusMeta__desc">{focusMeta.desc}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="k-specStrip" aria-label="Specs">
              <span>Build: Astro + Islands</span>
              <span className="k-specStrip__sep">•</span>
              <span>Motion: Framer (light)</span>
              <span className="k-specStrip__sep">•</span>
              <span>SEO: Schema + OG</span>
              <span className="k-specStrip__sep">•</span>
              <span>Delivery: Proof Pack</span>
              <span className="k-specStrip__sep">•</span>
              <span>JS: Minimal</span>
            </div>

            <div className="k-stage__ctaRow">
              {/* primary only ONCE per section */}
              <a className="k-workBtn k-workBtn--primary" href="https://bourneweb-demos.vercel.app/projects/local-barber-neo-gentleman-site" target="_blank" rel="noreferrer">
                View live demo <span aria-hidden="true">→</span>
              </a>

              {/* “Get a quote” = ghost/link, bo globalny cel */}
              <a className="k-workBtn k-workBtn--ghost" href="#contact">
                Get a quote <span aria-hidden="true">→</span>
              </a>

              <div className="k-stage__tip">Switch focus to see what we optimise first.</div>
            </div>
          </div>
        </div>

        {/* RIGHT: BUYING + TIMELINE */}
        <div className="k-side">
          <div className="k-buy">
            <div className="k-buy__head">
              <div className="k-buy__title">What you’re buying</div>
              <div className="k-buy__meta">clear scope • visible progress</div>
            </div>

            <div className="k-buy__list" role="list">
              {buying.map((x) => {
                const active =
                  (focusMeta.highlight === "quote" && x.id === "quote") ||
                  (focusMeta.highlight === "seo" && x.id === "seo") ||
                  (focusMeta.highlight === "speed" && x.id === "speed");

                return (
                  <div key={x.id} className={cn("k-buy__item", active && "is-active")} role="listitem">
                    <div className="k-buy__icon" aria-hidden="true">
                      {x.icon}
                    </div>
                    <div>
                      <div className="k-buy__line">
                        <span className="k-buy__strong">{x.title}</span> {x.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="k-buy__cta">
              {/* No more primary here */}
              <a className="k-workBtn k-workBtn--ghost" href="https://bourneweb-demos.vercel.app/projects/local-barber-neo-gentleman-site" target="_blank" rel="noreferrer">
                View demo <span aria-hidden="true">→</span>
              </a>
              <a className="k-workBtn k-workBtn--link" href="#contact">
                Get a quote <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="k-timeline" aria-label="Next demos timeline">
            <div className="k-timeline__head">
              <div className="k-timeline__title">Next demos</div>
              <span className="k-timeline__badge">IN PRODUCTION</span>
            </div>

            <div className="k-timeline__track">
              <div className="k-tlItem">
                <div className="k-tlDot" aria-hidden="true" />
                <div className="k-tlBody">
                  <div className="k-tlTop">
                    <div className="k-tlName">Clinic intake + booking</div>
                    <span className="k-tlStatus is-live">IN PRODUCTION</span>
                  </div>
                  <div className="k-tlSub">Trust stack • intake-first flow</div>
                  <button type="button" className="k-workBtn k-workBtn--ghost k-workBtn--wide">
                    Notify me <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>

              <div className="k-tlLine" aria-hidden="true" />

              <div className="k-tlItem">
                <div className="k-tlDot is-dim" aria-hidden="true" />
                <div className="k-tlBody">
                  <div className="k-tlTop">
                    <div className="k-tlName">Electrician local lead gen</div>
                    <span className="k-tlStatus">QUEUED</span>
                  </div>
                  <div className="k-tlSub">Call-first UX • local SEO framing</div>
                  <button type="button" className="k-workBtn k-workBtn--ghost k-workBtn--wide">
                    Notify me <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}
