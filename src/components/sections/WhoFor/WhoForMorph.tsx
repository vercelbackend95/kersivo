// src/components/sections/WhoFor/WhoForMorph.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";

type Card = {
  id: "development" | "speed" | "craft";
  title: string;
  modalTitle: string;
  body: string[];
  quote: { text: string; by: string };
  stats: Array<{ big: string; small: string }>;
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

/** SVG wrzucone do: /public/astro-icon-light-gradient.svg */
const ASTRO_ICON_SRC = "/astro-icon-light-gradient.svg";

/** Clean icon: checklist + lines, NO rectangles */
function IconChecklist({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 92" className={className} fill="none" aria-hidden="true">
      {/* checks */}
      <path
        d="M38 30l6 6 12-14"
        stroke="rgba(167,139,250,.95)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 48l6 6 12-14"
        stroke="rgba(167,139,250,.78)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 66l6 6 12-14"
        stroke="rgba(167,139,250,.62)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* lines */}
      <path d="M68 32h44" stroke="rgba(255,255,255,.44)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M68 50h38" stroke="rgba(255,255,255,.34)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M68 68h30" stroke="rgba(255,255,255,.26)" strokeWidth="2.4" strokeLinecap="round" />

      {/* subtle dot cluster for “search signals” vibe */}
      <g opacity="0.55">
        <circle cx="104" cy="22" r="2.2" fill="rgba(125,211,252,.85)" />
        <circle cx="114" cy="28" r="1.8" fill="rgba(255,255,255,.45)" />
        <circle cx="98" cy="18" r="1.6" fill="rgba(255,255,255,.35)" />
      </g>
    </svg>
  );
}

/** Clean icon: grid lines + plus, NO rectangles */
function IconPlusGrid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 92" className={className} fill="none" aria-hidden="true">
      {/* grid */}
      <g opacity="0.55">
        <path d="M34 26h72" stroke="rgba(255,255,255,.20)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M34 46h72" stroke="rgba(255,255,255,.20)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M34 66h72" stroke="rgba(255,255,255,.20)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M54 22v52" stroke="rgba(255,255,255,.18)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M86 22v52" stroke="rgba(255,255,255,.18)" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* plus */}
      <path
        d="M104 38v20M94 48h20"
        stroke="rgba(125,211,252,.95)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* tiny halo */}
      <circle cx="104" cy="48" r="18" stroke="rgba(125,211,252,.24)" />
    </svg>
  );
}

/**
 * Astro icon jako obraz (SVG).
 * Premium, bez blend-mode. Lekki “engine glow”.
 */
function AstroIconVisual({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <img
        src={ASTRO_ICON_SRC}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: 0.98,
          filter:
            "contrast(1.06) saturate(1.06) drop-shadow(0 18px 40px rgba(0,0,0,.45)) drop-shadow(0 0 22px rgba(167,139,250,.18))",
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
        title: "Fast by default",
        modalTitle: "Fast by default",
        body: [
          "Speed isn’t a Lighthouse trophy — it’s fewer drop-offs and more enquiries. We build with performance budgets, not vibes.",
          "Astro-first rendering, image hygiene (WebP/AVIF), clean typography, and minimal JS. Smooth, not heavy.",
          "The result: your site feels instant on mobile — and people trust it more because it behaves like it should.",
        ],
        quote: {
          text: "It loads before you even think about leaving.",
          by: "Performance principle",
        },
        stats: [
          { big: "90+", small: "Lighthouse focus" },
          { big: "↓", small: "Lower bounce risk" },
        ],
      },
      {
        id: "speed",
        title: "SEO that compounds",
        modalTitle: "SEO that compounds",
        body: [
          "SEO starts with structure: clean headings, semantic sections, and pages that map to what people actually search for.",
          "We keep everything indexable and future-proof: sitemap, robots, canonical URL, and metadata that makes sense.",
          "Over time, small wins stack: better crawl, clearer relevance, and more qualified traffic.",
        ],
        quote: {
          text: "SEO is boring — and that’s why it works.",
          by: "Search reality",
        },
        stats: [
          { big: "3x", small: "More entry points" },
          { big: "↑", small: "Qualified traffic" },
        ],
      },
      {
        id: "craft",
        title: "Built to bring enquiries",
        modalTitle: "Built to bring enquiries",
        body: [
          "Pretty doesn’t pay — clarity does. We design the page flow to answer questions fast and guide people to the next step.",
          "CTAs are placed where intent peaks, forms are friction-free, and every page has a clear conversion path.",
          "You get fewer time-wasters and more messages from people who actually want to buy.",
        ],
        quote: {
          text: "A site should guide, not just glow.",
          by: "Conversion principle",
        },
        stats: [
          { big: "↑", small: "Enquiry rate" },
          { big: "↓", small: "Dead clicks" },
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
                  {c.id === "development" ? (
                    <AstroIconVisual className="k-whoL__imgVisual k-whoL__imgVisual--astro" />
                  ) : c.id === "speed" ? (
                    <IconChecklist className="k-whoL__svgIcon" />
                  ) : (
                    <IconPlusGrid className="k-whoL__svgIcon" />
                  )}
                </div>

                {/* visualLabel removed */}
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
                      {active.id === "development" ? (
                        <AstroIconVisual className="k-whoL__imgVisual k-whoL__imgVisual--astro" />
                      ) : active.id === "speed" ? (
                        <IconChecklist className="k-whoL__svgIcon" />
                      ) : (
                        <IconPlusGrid className="k-whoL__svgIcon" />
                      )}
                    </div>

                    {/* visualLabel removed */}
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
                    <a className="k-whoL__footLink" href="/contact/#contact" onClick={() => setOpenId(null)}>
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
