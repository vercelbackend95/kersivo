import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Card = {
  id: "development" | "speed" | "craft";
  title: string;
  visualLabel: string;
  modalTitle: string;
  body: string[];
  quote: { text: string; by: string };
  stats: Array<{ big: string; small: string }>;
  lottieSrc?: string;
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

const ROCKET_LOTTIE =
  "https://lottie.host/dede5b9d-8e0b-41b6-b51a-7671cb5935ae/xHXT5QqJrp.lottie";

/** super proste, premium, czytelne svg — zamiast “smutnych mydeł” */
function IconDocsChecklist({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 92" className={className} fill="none" aria-hidden="true">
      <rect x="22" y="10" width="92" height="62" rx="14" stroke="rgba(255,255,255,.40)" />
      <rect x="14" y="18" width="92" height="62" rx="14" stroke="rgba(255,255,255,.22)" />
      <rect x="30" y="22" width="92" height="62" rx="14" stroke="rgba(255,255,255,.55)" />
      <path d="M46 42l6 6 12-14" stroke="rgba(167,139,250,.95)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 44h26" stroke="rgba(255,255,255,.46)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M46 56l6 6 12-14" stroke="rgba(167,139,250,.75)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 58h22" stroke="rgba(255,255,255,.36)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconGridPlus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 92" className={className} fill="none" aria-hidden="true">
      <rect x="22" y="12" width="96" height="68" rx="18" stroke="rgba(255,255,255,.38)" />
      <g opacity="0.65">
        <path d="M54 24v44" stroke="rgba(255,255,255,.20)" />
        <path d="M86 24v44" stroke="rgba(255,255,255,.20)" />
        <path d="M34 46h72" stroke="rgba(255,255,255,.20)" />
      </g>

      {/* lifted tile */}
      <rect x="78" y="30" width="32" height="32" rx="12" fill="rgba(255,255,255,.06)" stroke="rgba(125,211,252,.55)" />
      <path d="M94 40v12M88 46h12" stroke="rgba(125,211,252,.95)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function LottieRocket({
  reduced,
  className = "",
}: {
  reduced: boolean;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <DotLottieReact
        src={ROCKET_LOTTIE}
        autoplay={!reduced}
        loop={!reduced}
        // speed: spokojnie, premium. Nie “3f” turbo-dzida.
        speed={reduced ? 1 : 1.15}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.92,
          // delikatnie “szkło” — nie neon-arcade
          filter: "drop-shadow(0 18px 40px rgba(0,0,0,.35))",
        }}
      />
    </div>
  );
}

export default function WhoForMorph() {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = useState<Card["id"] | null>(null);

  // mobile carousel state
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const cards: Card[] = useMemo(
    () => [
      {
        id: "development",
        title: "Purpose-built for\nproduct development",
        visualLabel: "Stacked docs + checklist",
        modalTitle: "Purpose-built for product development",
        body: [
          "Built for teams who want a site that behaves like a product: clean structure, predictable components, and a UI system that scales.",
          "We design the content flow first (what people need, in what order), then build a fast, accessible front end that stays stable when you add pages.",
          "The result: fewer ‘nice site’ compliments — more enquiries that actually fit your offer.",
        ],
        quote: {
          text: "We finally have a site that looks premium and feels effortless to use — on every device.",
          by: "Client feedback (anonymised)",
        },
        stats: [
          { big: "2x", small: "More qualified enquiries" },
          { big: "1.6x", small: "Faster time-to-contact" },
        ],
      },
      {
        id: "speed",
        title: "Designed to move fast",
        visualLabel: "Launch speed + smooth flow",
        modalTitle: "Designed to move fast",
        body: [
          "Speed isn’t a Lighthouse trophy — it’s fewer drop-offs and more form submits. We build with performance budgets, not vibes.",
          "Astro-first rendering, image hygiene (WebP/AVIF), clean typography, and zero bloat scripts. Smooth, not heavy.",
          "When you iterate (new service, new offer), the system doesn’t crack — it adapts.",
        ],
        quote: {
          text: "Even as we grew, we moved faster — because the site stayed simple.",
          by: "Ops note (anonymised)",
        },
        stats: [
          { big: "2x", small: "Increase in form starts" },
          { big: "1.6x", small: "Faster issue resolution" },
        ],
        lottieSrc: ROCKET_LOTTIE,
      },
      {
        id: "craft",
        title: "Crafted to perfection",
        visualLabel: "Grid + create tile",
        modalTitle: "Crafted to perfection",
        body: [
          "This is the part you feel before you can explain it: spacing, rhythm, type weight, hover depth, and motion that’s controlled — not clowny.",
          "We keep it minimal, Apple-ish, and honest. Premium by restraint. No neon confetti. No noisy gradients.",
          "Everything is tuned for mobile-first reading and thumb-zone actions.",
        ],
        quote: {
          text: "It looks expensive because it’s calm — not because it screams.",
          by: "Design principle",
        },
        stats: [
          { big: "2x", small: "Higher perceived trust" },
          { big: "1.6x", small: "Better scroll depth" },
        ],
      },
    ],
    []
  );

  const active = openId ? cards.find((c) => c.id === openId) : null;

  // ESC to close
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  // Focus close button on open
  useEffect(() => {
    if (!openId) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [openId]);

  // LOCK SCROLL (iOS-safe)
  useEffect(() => {
    if (!openId) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollY = window.scrollY || 0;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyPos: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarGap = window.innerWidth - html.clientWidth;
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    html.style.overflow = "hidden";
    html.style.height = "100%";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;

      body.style.position = prev.bodyPos;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;

      window.scrollTo(0, scrollY);
    };
  }, [openId]);

  // Mobile carousel active dot
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1;
        const idx = Math.round(el.scrollLeft / w);
        setActiveIndex(Math.max(0, Math.min(cards.length - 1, idx)));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [cards.length]);

  const scrollToIndex = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth || 0;
    el.scrollTo({
      left: idx * w,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const trans = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 40, mass: 0.8 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="k-whoL__grid" aria-label="Capabilities" ref={trackRef} data-carousel>
        {cards.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            className={cn("k-whoL__card", `k-whoL__card--${c.id}`)}
            onClick={() => setOpenId(c.id)}
            layoutId={`card-${c.id}`}
            transition={trans}
            whileHover={reduced ? undefined : { y: -2 }}
            whileTap={reduced ? undefined : { scale: 0.99 }}
            aria-haspopup="dialog"
            aria-expanded={openId === c.id}
          >
            <div className="k-whoL__cardInner">
              <motion.div
                className={cn("k-whoL__visual", `k-whoL__visual--${c.id}`)}
                layoutId={`visual-${c.id}`}
                transition={trans}
                aria-hidden="true"
              >
                {/* VISUAL CONTENT */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: 10,
                    display: "grid",
                    placeItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  {/* speed gets Lottie rocket, others get clean SVG */}
                  {c.id === "speed" ? (
                    <LottieRocket reduced={!!reduced} className="k-whoL__lottie" />
                  ) : c.id === "development" ? (
                    <IconDocsChecklist className="k-whoL__svgIcon" />
                  ) : (
                    <IconGridPlus className="k-whoL__svgIcon" />
                  )}
                </div>

                <span className="k-whoL__visualLabel">{c.visualLabel}</span>
              </motion.div>

              <motion.div className="k-whoL__cardBottom" layoutId={`bottom-${c.id}`} transition={trans}>
                <div className="k-whoL__cardTitle">{c.title}</div>

                <span className="k-whoL__plus" aria-hidden="true">
                  <span className="k-whoL__plusI">+</span>
                </span>
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="k-whoL__dots" aria-label="Carousel pagination">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={cn("k-whoL__dot", i === activeIndex && "is-active")}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to card ${i + 1}`}
            aria-current={i === activeIndex ? "true" : undefined}
          />
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="k-whoL__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.18 }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setOpenId(null);
            }}
            role="presentation"
          >
            <motion.div
              className="k-whoL__modalWrap"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
              transition={trans}
            >
              <motion.div
                className={cn("k-whoL__modal", `k-whoL__modal--${active.id}`)}
                layoutId={`card-${active.id}`}
                transition={trans}
                role="dialog"
                aria-modal="true"
                aria-label={active.modalTitle}
              >
                <div className="k-whoL__modalTop">
                  <motion.div
                    className={cn("k-whoL__visual", `k-whoL__visual--${active.id}`, "k-whoL__visual--modal")}
                    layoutId={`visual-${active.id}`}
                    transition={trans}
                    aria-hidden="true"
                  >
                    {/* same visual in modal */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        padding: 12,
                        display: "grid",
                        placeItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      {active.id === "speed" ? (
                        <LottieRocket reduced={!!reduced} className="k-whoL__lottie" />
                      ) : active.id === "development" ? (
                        <IconDocsChecklist className="k-whoL__svgIcon" />
                      ) : (
                        <IconGridPlus className="k-whoL__svgIcon" />
                      )}
                    </div>

                    <span className="k-whoL__visualLabel">{active.visualLabel}</span>
                  </motion.div>

                  <button
                    ref={closeBtnRef}
                    className="k-whoL__close"
                    type="button"
                    onClick={() => setOpenId(null)}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <motion.div className="k-whoL__modalBody" layoutId={`bottom-${active.id}`} transition={trans}>
                  <h3 className="k-whoL__modalTitle">{active.modalTitle}</h3>

                  <div className="k-whoL__modalCopy">
                    {active.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  <div className="k-whoL__quote">
                    <div className="k-whoL__quoteLine" aria-hidden="true" />
                    <p className="k-whoL__quoteText">“{active.quote.text}”</p>
                    <div className="k-whoL__quoteBy">{active.quote.by}</div>
                  </div>

                  <div className="k-whoL__stats">
                    {active.stats.slice(0, 2).map((s) => (
                      <div className="k-whoL__stat" key={s.big}>
                        <div className="k-whoL__statBig">{s.big}</div>
                        <div className="k-whoL__statSmall">{s.small}</div>
                      </div>
                    ))}
                  </div>

                  <div className="k-whoL__modalFoot">
                    <span className="k-whoL__footDot" aria-hidden="true" />
                    <span>Want this energy on your site?</span>
                    <a className="k-whoL__footLink" href="#contact" onClick={() => setOpenId(null)}>
                      Get a quote →
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
