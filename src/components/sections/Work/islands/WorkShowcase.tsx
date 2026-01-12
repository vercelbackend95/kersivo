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
    const map: Record<Focus, { title: string; desc: string; highlight: string }> = {
      conversion: {
        title: "Conversion-first flow",
        desc: "Clear CTA rhythm, friction-free sections, and mobile thumb-zone decisions.",
        highlight: "conversion",
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

        <div className="k-work__tags" aria-label="Work tags">
          <span className="k-work__tag">Proof Pack</span>
          <span className="k-work__tag">Fast builds</span>
          <span className="k-work__tag">No bloat</span>
          <span className="k-work__tag">Astro-first</span>
          <span className="k-work__tag">60fps motion</span>
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
              <span className="k-stage__dots"></span>
              <span className="k-stage__url">kersivo.co.uk/demo</span>
              <span className="k-stage__pill">Preview</span>
            </div>

            <div
              className={cn("k-stage__viewport", device === "mobile" && "is-mobile")}
              aria-label="Demo preview"
            >
              {/* WOW: subtle scanline + glare only for Work */}
              <span className="k-stage__scan" aria-hidden="true" />
              <span className="k-stage__glare" aria-hidden="true" />

              {/* placeholder area (we’ll swap to real screenshot / iframe later) */}
              <div className="k-stage__placeholder">
                <div className="k-stage__phLabel">Demo preview</div>
              </div>
            </div>

            <div className="k-stage__controls" aria-label="Demo controls">
              <div className="k-toggle" role="group" aria-label="Device">
                <button
                  type="button"
                  className={cn(device === "desktop" && "is-on")}
                  onClick={() => setDevice("desktop")}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={cn(device === "mobile" && "is-on")}
                  onClick={() => setDevice("mobile")}
                >
                  Mobile
                </button>
              </div>

              <div className="k-toggle k-toggle--focus" role="group" aria-label="Focus">
                <button
                  type="button"
                  className={cn(focus === "conversion" && "is-on")}
                  onClick={() => setFocus("conversion")}
                >
                  Conversion
                </button>
                <button
                  type="button"
                  className={cn(focus === "seo" && "is-on")}
                  onClick={() => setFocus("seo")}
                >
                  SEO
                </button>
                <button
                  type="button"
                  className={cn(focus === "speed" && "is-on")}
                  onClick={() => setFocus("speed")}
                >
                  Speed
                </button>
              </div>
            </div>

            <div className="k-stage__focus">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={focus}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={spring}
                >
                  <div className="k-stage__focusTitle">{focusMeta.title}</div>
                  <div className="k-stage__focusDesc">{focusMeta.desc}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="k-specStrip" aria-label="Build specs">
              <span>Build: Astro + Islands</span>
              <span className="k-specStrip__dot">•</span>
              <span>Motion: Framer (light)</span>
              <span className="k-specStrip__dot">•</span>
              <span>SEO: Schema + OG</span>
              <span className="k-specStrip__dot">•</span>
              <span>Delivery: Proof Pack</span>
            </div>

            <div className="k-stage__ctaRow">
              <a className="k-workBtn k-workBtn--primary" href="#" aria-label="View live demo">
                View live demo <span aria-hidden="true">→</span>
              </a>
              <a className="k-workBtn k-workBtn--ghost" href="#contact">
                Get a quote <span aria-hidden="true">→</span>
              </a>
              <div className="k-stage__tip">
                Tip: switch “Focus” to see what we optimise first — conversion, SEO, or speed.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: BUYING + PIPELINE */}
        <div className="k-work__side">
          <div className="k-buy">
            <div className="k-buy__top">
              <div className="k-buy__title">What you’re buying</div>
              <div className="k-buy__hint">clear scope • visible progress</div>
            </div>

            <div className="k-buy__list" role="list">
              <div className="k-buy__item k-buy__item--conversion" role="listitem">
                <div className="k-buy__icon">✓</div>
                <div>
                  <div className="k-buy__line">
                    <strong>Quote in 24h</strong> with a clean scope + budget range.
                  </div>
                </div>
              </div>

              <div className="k-buy__item k-buy__item--proof" role="listitem">
                <div className="k-buy__icon">⧉</div>
                <div>
                  <div className="k-buy__line">
                    <strong>Proof Pack</strong> during delivery — checklists, snapshots, visible progress.
                  </div>
                </div>
              </div>

              <div className="k-buy__item k-buy__item--speed" role="listitem">
                <div className="k-buy__icon">⚡</div>
                <div>
                  <div className="k-buy__line">
                    <strong>Performance budget</strong> mindset — fast by default, no bloat.
                  </div>
                </div>
              </div>

              <div className="k-buy__item k-buy__item--seo" role="listitem">
                <div className="k-buy__icon">⌁</div>
                <div>
                  <div className="k-buy__line">
                    <strong>SEO foundations</strong> — schema, Open Graph, clean structure.
                  </div>
                </div>
              </div>
            </div>

            <div className="k-buy__cta">
              <a className="k-workBtn k-workBtn--primary" href="#contact">
                Get a quote <span aria-hidden="true">→</span>
              </a>
              <a className="k-workBtn k-workBtn--link" href="#">
                View demo
              </a>
            </div>
          </div>

          <div className="k-pipe">
            <div className="k-pipe__top">
              <div className="k-pipe__title">Next demos</div>
              <div className="k-pipe__badge">IN PRODUCTION</div>
            </div>

            {/* timeline (not cards) */}
            <ol className="k-timeline" aria-label="Demo pipeline">
              <li className="k-timeline__item">
                <span className="k-timeline__dot" aria-hidden="true" />
                <div className="k-timeline__body">
                  <div className="k-timeline__row">
                    <div className="k-timeline__name">Clinic intake + booking</div>
                    <span className="k-timeline__status is-live">IN PRODUCTION</span>
                  </div>
                  <div className="k-timeline__sub">Trust stack • intake-first flow</div>
                  <button type="button" className="k-timeline__btn">Notify me <span aria-hidden="true">→</span></button>
                </div>
              </li>

              <li className="k-timeline__item">
                <span className="k-timeline__dot is-dim" aria-hidden="true" />
                <div className="k-timeline__body">
                  <div className="k-timeline__row">
                    <div className="k-timeline__name">Electrician local lead gen</div>
                    <span className="k-timeline__status is-queued">QUEUED</span>
                  </div>
                  <div className="k-timeline__sub">Call-first UX • local SEO framing</div>
                  <button type="button" className="k-timeline__btn">Notify me <span aria-hidden="true">→</span></button>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
