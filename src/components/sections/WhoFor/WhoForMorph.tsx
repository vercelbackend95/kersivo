import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";

type Card = {
  id: "development" | "speed" | "craft";
  title: string;
  visualLabel: string;
  modalTitle: string;
  body: string[];
  quote: { text: string; by: string };
  stats: Array<{ big: string; small: string }>;
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

export default function WhoForMorph() {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = useState<Card["id"] | null>(null);

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
        visualLabel: "Latency arcs + rails",
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

  // Lock scroll while modal is open
  useEffect(() => {
    if (!openId) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [openId]);

  const trans = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 40, mass: 0.8 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="k-whoL__grid" aria-label="Capabilities">
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

      {/* Overlay + Morph modal */}
      <AnimatePresence>
        {active ? (
          <motion.div
            className="k-whoL__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.18 }}
            onMouseDown={(e) => {
              // click outside closes (only if backdrop)
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
                    <span className="k-whoL__visualLabel">{active.visualLabel}</span>
                  </motion.div>

                  <button className="k-whoL__close" type="button" onClick={() => setOpenId(null)} aria-label="Close">
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
