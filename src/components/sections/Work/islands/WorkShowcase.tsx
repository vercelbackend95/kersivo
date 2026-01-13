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

type CtaVariant = "primary" | "secondary" | "ghost";

function CtaLink({
  href,
  label,
  variant = "primary",
  arrow = true,
  magnetic,
  className,
  ariaLabel,
  target,
  rel,
}: {
  href: string;
  label: string;
  variant?: CtaVariant;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}) {
  const isMagnetic = typeof magnetic === "boolean" ? magnetic : variant === "primary";
  const isContact = (href || "").trim() === "#contact";
  const arrowClass = variant === "primary" ? "k-btn__arrow" : "k-btn__arrow2";

  return (
    <a
      href={href}
      className={cn("k-btn", `k-btn--${variant}`, isMagnetic && "k-btn--magnetic", className)}
      data-magnetic={isMagnetic ? "true" : "false"}
      data-cta={isContact ? "contact" : undefined}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
    >
      <span className="k-btn__label">{label}</span>
      {variant === "primary" && <span className="k-btn__shine" aria-hidden="true"></span>}
      {arrow && (
        <span className={arrowClass} aria-hidden="true">
          →
        </span>
      )}
    </a>
  );
}

const DEMO_HREF = "/demo";

const focusCopy: Record<Focus, { title: string; lines: string[] }> = {
  conversion: {
    title: "Conversion flow",
    lines: [
      "Clear CTAs + one primary action per section.",
      "Frictionless contact — no forms that feel like tax.",
      "Proof console + micro-feedback on interaction.",
    ],
  },
  seo: {
    title: "SEO foundations",
    lines: [
      "Fast, indexable pages with clean metadata.",
      "Local intent pages — built for UK small businesses.",
      "Schema basics + page structure that reads well.",
    ],
  },
  speed: {
    title: "Speed & quality",
    lines: [
      "Instant preview — loads fast on mobile.",
      "Minimal JS: islands only where it matters.",
      "60fps motion, respects reduced motion preferences.",
    ],
  },
};

export default function WorkShowcase() {
  const [focus, setFocus] = useState<Focus>("conversion");
  const [device, setDevice] = useState<Device>("desktop");

  // A11y: refs for keyboard navigation on tabs
  const deviceTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const deviceTabs: Array<{ key: Device; label: string }> = useMemo(
    () => [
      { key: "desktop", label: "Desktop" },
      { key: "mobile", label: "Mobile" },
    ],
    []
  );

  const focusTabs: Array<{ key: Focus; label: string }> = useMemo(
    () => [
      { key: "conversion", label: "Conversion" },
      { key: "seo", label: "SEO" },
      { key: "speed", label: "Speed" },
    ],
    []
  );

  const [tipOpen, setTipOpen] = useState(false);

  const pulseRef = useRef(0);
  const [pulseKey, setPulseKey] = useState(0);

  const triggerPulse = () => {
    pulseRef.current += 1;
    setPulseKey(pulseRef.current);
  };

  const setFocusSnap = (next: Focus) => {
    setFocus(next);
    triggerPulse();
  };

  const moveTab = <T extends string>(opts: {
    e: React.KeyboardEvent;
    keys: T[];
    current: T;
    onChange: (next: T) => void;
    refs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  }) => {
    const { e, keys, current, onChange, refs } = opts;
    const idx = keys.indexOf(current);
    if (idx < 0) return;

    const isPrev = e.key === "ArrowLeft";
    const isNext = e.key === "ArrowRight";
    const isHome = e.key === "Home";
    const isEnd = e.key === "End";
    if (!isPrev && !isNext && !isHome && !isEnd) return;

    e.preventDefault();

    let nextIdx = idx;
    if (isHome) nextIdx = 0;
    else if (isEnd) nextIdx = keys.length - 1;
    else if (isPrev) nextIdx = (idx - 1 + keys.length) % keys.length;
    else if (isNext) nextIdx = (idx + 1) % keys.length;

    const nextKey = keys[nextIdx];
    onChange(nextKey);
    requestAnimationFrame(() => refs.current[nextIdx]?.focus());
  };

  const active = focusCopy[focus];
  const frameClass = cn("k-frame", device === "mobile" && "is-mobile");

  return (
    <div className="k-workCard" data-focus={focus}>
      <div className="k-work__grid">
        {/* HEADER */}
        <div className="k-work__head">
          <div className="k-work__kicker">WORK</div>
          <h2 className="k-work__h2">
            One live demo. <span className="k-work__grad">Real build</span> quality.
          </h2>
          <p className="k-work__lead">
            A live demo you can actually click. Clean system + tailored skin — shipped fast.
          </p>
        </div>

        {/* tags */}
        <div className="k-work__tags" aria-label="Work tags">
          <span className="k-work__tag">Proof Pack</span>
          <span className="k-work__tag">Fast builds</span>
          <span className="k-work__tag">Hybrid preview</span>

          {/* “More +” pill with tooltip */}
          <span
            className={cn("k-work__tag k-work__tag--more", tipOpen && "is-open")}
            onMouseLeave={() => setTipOpen(false)}
          >
            <button
              className="k-work__moreBtn"
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
              More <span aria-hidden="true">+</span>
            </button>

            <span id="k-work-tip" className="k-work__tip" role="tooltip">
              Includes: conversion flow, SEO foundations, performance-first delivery, and reusable UI system.
            </span>
          </span>
        </div>

        {/* MAIN */}
        <div className="k-work__main">
          {/* LEFT: STAGE */}
          <div className="k-stage">
            <div className="k-stage__top">
              <div className="k-stage__title">Neo Gentleman Barber</div>
            </div>

            <div
              className={cn("k-stage__viewport", device === "mobile" && "is-mobile")}
              role="tabpanel"
              id="k-work-device-panel"
              aria-labelledby={`k-work-device-tab-${device}`}
              aria-label="Demo preview"
            >
              <div className="k-stage__shot">
                <img
                  className={frameClass}
                  src="/work/neo-gentleman.webp"
                  alt="Neo Gentleman demo preview"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "1";
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />

                <div className="k-stage__overlay" aria-hidden="true" />

                {/* ACTIONS: device toggle + open demo */}
                <div className="k-stage__shotActions">
                  <div
                    className="k-toggle k-toggle--shot k-toggle--compact"
                    role="tablist"
                    aria-label="Device"
                    onKeyDown={(e) =>
                      moveTab<Device>({
                        e,
                        keys: deviceTabs.map((t) => t.key),
                        current: device,
                        onChange: (next) => setDevice(next),
                        refs: deviceTabRefs,
                      })
                    }
                  >
                    {deviceTabs.map((t, i) => (
                      <button
                        key={t.key}
                        ref={(el) => {
                          deviceTabRefs.current[i] = el;
                        }}
                        id={`k-work-device-tab-${t.key}`}
                        role="tab"
                        type="button"
                        aria-selected={device === t.key}
                        aria-controls="k-work-device-panel"
                        tabIndex={device === t.key ? 0 : -1}
                        className={cn(device === t.key && "is-on")}
                        onClick={() => setDevice(t.key)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <a className="k-stage__openShot" href={DEMO_HREF} aria-label="Open demo">
                    Open demo <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="k-work__rightCol">
            {/* NEXT DEMOS */}
            <div className="k-pipe">
              <div className="k-pipe__top">
                <div className="k-pipe__title">Next demos</div>
                <div className="k-pipe__badge">IN PRODUCTION</div>
              </div>

              <ul className="k-timeline" aria-label="Demo pipeline">
                <li className="k-timeline__item">
                  <div className="k-timeline__dot is-on" aria-hidden="true" />
                  <div className="k-timeline__content">
                    <div className="k-timeline__row">
                      <span className="k-timeline__name">Electrician</span>
                    </div>
                    <div className="k-timeline__meta">Service pages • quote flow • reviews</div>
                  </div>
                </li>

                <li className="k-timeline__item">
                  <div className="k-timeline__dot is-queued" aria-hidden="true" />
                  <div className="k-timeline__content">
                    <div className="k-timeline__row">
                      <span className="k-timeline__name">Clinic intake</span>
                    </div>
                    <div className="k-timeline__meta">Call-first UX • local SEO framing</div>

                    <CtaLink
                      href="#contact"
                      label="Notify me"
                      variant="ghost"
                      className="k-timeline__btn"
                      ariaLabel="Notify me when Clinic intake demo is live"
                    />
                  </div>
                </li>
              </ul>
            </div>

            {/* FOCUS (soft panel) */}
            <div className="k-sideFocus" aria-label="Priorities">
              <div
                className="k-toggle k-toggle--focus"
                role="tablist"
                aria-label="Focus"
                onKeyDown={(e) =>
                  moveTab<Focus>({
                    e,
                    keys: focusTabs.map((t) => t.key),
                    current: focus,
                    onChange: (next) => setFocusSnap(next),
                    refs: focusTabRefs,
                  })
                }
              >
                {focusTabs.map((t, i) => (
                  <button
                    key={t.key}
                    ref={(el) => {
                      focusTabRefs.current[i] = el;
                    }}
                    id={`k-work-focus-tab-${t.key}`}
                    role="tab"
                    type="button"
                    aria-selected={focus === t.key}
                    aria-controls="k-work-focus-panel"
                    tabIndex={focus === t.key ? 0 : -1}
                    className={cn(focus === t.key && "is-on")}
                    onClick={() => setFocusSnap(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div
                className="k-sideFocus__body"
                role="tabpanel"
                id="k-work-focus-panel"
                aria-labelledby={`k-work-focus-tab-${focus}`}
              >
                <div className="k-sideFocus__title">{active.title}</div>

                <AnimatePresence mode="wait">
                  <motion.ul
                    key={focus}
                    className="k-sideFocus__list"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    {active.lines.map((ln) => (
                      <li key={ln}>{ln}</li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* CTA STRIP (no frame) */}
        <div className="k-ctaStrip" aria-label="Actions">
          <div className="k-stage__ctaRow k-stage__ctaRow--right">
            <div className="k-stage__ctaBtns">
              <CtaLink href={DEMO_HREF} label="View live demo" variant="primary" ariaLabel="View live demo" />
              <CtaLink href="#contact" label="Get a quote" variant="ghost" />
            </div>
          </div>
        </div>

        {/* subtle bg pulse */}
        <AnimatePresence>
          <motion.div
            key={pulseKey}
            className="k-work__pulse"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ ...spring, duration: 0.6 }}
            aria-hidden="true"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
