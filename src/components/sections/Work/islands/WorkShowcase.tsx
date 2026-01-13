import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Focus = "conversion" | "seo" | "speed";
type Device = "desktop" | "mobile";

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
  // Single source of truth for the live demo link.
  // Change this once, and the whole section stays consistent.
  const DEMO_HREF = "/demo";

  const [focus, setFocus] = useState<Focus>("conversion");
  const [device, setDevice] = useState<Device>("desktop");

  // Hybrid preview: lightweight screenshot first, iframe only when requested.
  const [isLivePreview, setIsLivePreview] = useState(false);

  // Tags tooltip
  const [tipOpen, setTipOpen] = useState(false);

  // “snap magic” pulse (re-triggers even if you click the same focus again)
  const [pulseOn, setPulseOn] = useState(false);
  const pulseTimer = useRef<number | null>(null);

  const focusMeta = useMemo(() => {
    const map: Record<Focus, { title: string; desc: string; highlight: Focus }> = {
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

  const triggerPulse = () => {
    // restart animation reliably
    setPulseOn(false);
    requestAnimationFrame(() => setPulseOn(true));

    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseOn(false), 780);
  };

  const setFocusSnap = (next: Focus) => {
    setFocus(next);
    triggerPulse();
  };

  const stepMotion = {
    initial: { opacity: 0, y: 6, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
    exit: { opacity: 0, y: -6, filter: "blur(6px)", transition: { duration: 0.18 } },
  };

  const active = focusMeta.highlight;

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

        {/* only 3 tags + tooltip for the rest */}
        <div className="k-work__tags" aria-label="Work tags">
          <span className="k-work__tag">Proof Pack</span>
          <span className="k-work__tag">Fast builds</span>
          <span className="k-work__tag">Astro-first</span>

          <span
            className={cn("k-work__tagMore", tipOpen && "is-open")}
            onPointerEnter={() => setTipOpen(true)}
            onPointerLeave={() => setTipOpen(false)}
          >
            <button
              className="k-work__info"
              type="button"
              aria-label="More details"
              aria-expanded={tipOpen}
              aria-describedby="k-work-tip"
              onClick={() => setTipOpen((v) => !v)}
              onBlur={() => setTipOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setTipOpen(false);
              }}
            >
              i
            </button>
            <span id="k-work-tip" className="k-work__tip" role="tooltip">
              No bloat • 60fps motion
            </span>
          </span>
        </div>
      </div>

      <div className="k-work__grid">
        {/* LEFT: STAGE (top card) */}
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

            <div className={cn("k-stage__viewport", device === "mobile" && "is-mobile")} aria-label="Demo preview">
              {/* WOW: subtle scanline + glare only for Work */}
              <span className="k-stage__scan" aria-hidden="true" />
              <span className="k-stage__glare" aria-hidden="true" />

              {/* Hybrid preview: screenshot by default, live iframe on demand */}
              {!isLivePreview ? (
                <div className="k-stage__shot" aria-label="Screenshot preview">
                  {/* If you add a real asset later, just replace the src below */}
                  <img
                    className="k-stage__shotImg"
                    src="/work/neo-gentleman.webp"
                    alt="Neo Gentleman demo screenshot"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // hide broken image icon, keep the styled fallback surface
                      (e.currentTarget as HTMLImageElement).style.opacity = "0";
                    }}
                  />

                  <div className="k-stage__overlay" aria-hidden="true" />

                  <button
                    type="button"
                    className="k-stage__loadBtn"
                    onClick={() => setIsLivePreview(true)}
                  >
                    Load live preview <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <div className="k-stage__liveWrap" aria-label="Live preview">
                  <iframe
                    className="k-stage__iframe"
                    title="Neo Gentleman live demo preview"
                    src={DEMO_HREF}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  <div className="k-stage__liveHint">
                    If the preview is blocked by iframe policy, open the demo in a new tab.
                    <a className="k-stage__open" href={DEMO_HREF} target="_blank" rel="noreferrer">
                      Open demo →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="k-stage__controls" aria-label="Demo controls">
              <div className="k-toggle" role="tablist" aria-label="Device">
                <button type="button" className={cn(device === "desktop" && "is-on")} onClick={() => setDevice("desktop")}>
                  Desktop
                </button>
                <button type="button" className={cn(device === "mobile" && "is-on")} onClick={() => setDevice("mobile")}>
                  Mobile
                </button>
              </div>

              <div className="k-toggle k-toggle--focus" role="tablist" aria-label="Focus">
                <button type="button" className={cn(focus === "conversion" && "is-on")} onClick={() => setFocusSnap("conversion")}>
                  Conversion
                </button>
                <button type="button" className={cn(focus === "seo" && "is-on")} onClick={() => setFocusSnap("seo")}>
                  SEO
                </button>
                <button type="button" className={cn(focus === "speed" && "is-on")} onClick={() => setFocusSnap("speed")}>
                  Speed
                </button>
              </div>
            </div>

            <div className="k-stage__focus">
              <div className="k-stage__focusTitle">{focusMeta.title}</div>

              <AnimatePresence mode="popLayout">
                <motion.div key={focus} {...stepMotion} className="k-stage__focusDesc">
                  {focusMeta.desc}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT TOP: BUYING */}
        <div className="k-buy">
          <div className="k-buy__top">
            <div className="k-buy__title">What you’re buying</div>
            <div className="k-buy__hint">clear scope • visible progress</div>
          </div>

          <div className="k-buy__list" role="list">
            <div
              className={cn(
                "k-buy__item k-buy__item--conversion",
                active === "conversion" && "is-active",
                active === "conversion" && pulseOn && "is-pulse"
              )}
              role="listitem"
            >
              <div className="k-buy__icon">✓</div>
              <div className="k-buy__line">
                <strong>Quote in 24h</strong> with a clean scope + budget range.
              </div>
            </div>

            <div className={cn("k-buy__item k-buy__item--proof")} role="listitem">
              <div className="k-buy__icon">⧉</div>
              <div className="k-buy__line">
                <strong>Proof Pack</strong> during delivery — checklists, snapshots, visible progress.
              </div>
            </div>

            <div
              className={cn(
                "k-buy__item k-buy__item--speed",
                active === "speed" && "is-active",
                active === "speed" && pulseOn && "is-pulse"
              )}
              role="listitem"
            >
              <div className="k-buy__icon">⚡</div>
              <div className="k-buy__line">
                <strong>Performance budget</strong> mindset — fast by default, no bloat.
              </div>
            </div>

            <div
              className={cn(
                "k-buy__item k-buy__item--seo",
                active === "seo" && "is-active",
                active === "seo" && pulseOn && "is-pulse"
              )}
              role="listitem"
            >
              <div className="k-buy__icon">⌁</div>
              <div className="k-buy__line">
                <strong>SEO foundations</strong> — schema, Open Graph, clean structure.
              </div>
            </div>
          </div>

          {/* CTA hierarchy: no “second primary vibe” here */}
          <div className="k-buy__cta">
            <a className="k-workBtn k-workBtn--link" href={DEMO_HREF} aria-label="View demo">
              View demo <span aria-hidden="true">→</span>
            </a>
            <a className="k-workBtn k-workBtn--link" href="#contact">
              Get a quote <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* LEFT: SPECS + CTA (moved here so mobile order is perfect) */}
        <div className="k-stageFoot" aria-label="Work actions">
          <div className="k-specStrip" aria-label="Build specs">
            <span className="k-specStrip__k">Build:</span>
            <span className="k-specStrip__v">Astro + Islands</span>

            <span className="k-specStrip__dot">•</span>

            <span className="k-specStrip__k">Motion:</span>
            <span className="k-specStrip__v">Framer (light)</span>

            <span className="k-specStrip__dot">•</span>

            <span className="k-specStrip__k">SEO:</span>
            <span className="k-specStrip__v">Schema + OG</span>

            <span className="k-specStrip__dot">•</span>

            <span className="k-specStrip__k">Delivery:</span>
            <span className="k-specStrip__v">Proof Pack</span>

            <span className="k-specStrip__dot">•</span>

            <span className="k-specStrip__k">JS:</span>
            <span className="k-specStrip__v">Minimal</span>
          </div>

          <div className="k-stage__ctaRow">
            <a className="k-workBtn k-workBtn--primary" href={DEMO_HREF} aria-label="View live demo">
              View live demo <span aria-hidden="true">→</span>
            </a>

            <a className="k-workBtn k-workBtn--ghost" href="#contact">
              Get a quote <span aria-hidden="true">→</span>
            </a>

            <div className="k-stage__tip">Switch focus to see what we optimise first.</div>
          </div>
        </div>

        {/* RIGHT BOTTOM: TIMELINE */}
        <div className="k-pipe">
          <div className="k-pipe__top">
            <div className="k-pipe__title">Next demos</div>
            <div className="k-pipe__badge">IN PRODUCTION</div>
          </div>

          <ul className="k-timeline" aria-label="Demo pipeline">
            <li className="k-timeline__item is-live">
              <span className="k-timeline__dot" aria-hidden="true" />
              <div className="k-timeline__content">
                <div className="k-timeline__row">
                  <div className="k-timeline__name">Clinic intake + booking</div>
                  <span className="k-timeline__status is-live">IN PRODUCTION</span>
                </div>
                <div className="k-timeline__meta">Trust stack • intake-first flow</div>
                <a className="k-timeline__btn" href="#contact">
                  Notify me <span aria-hidden="true">→</span>
                </a>
              </div>
            </li>

            <li className="k-timeline__item is-queued">
              <span className="k-timeline__dot" aria-hidden="true" />
              <div className="k-timeline__content">
                <div className="k-timeline__row">
                  <div className="k-timeline__name">Electrician local lead gen</div>
                  <span className="k-timeline__status is-queued">QUEUED</span>
                </div>
                <div className="k-timeline__meta">Call-first UX • local SEO framing</div>
                <a className="k-timeline__btn" href="#contact">
                  Notify me <span aria-hidden="true">→</span>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
