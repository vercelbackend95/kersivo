import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

type Vibe = {
  key: string;
  label: string;
  line: string;
  tags: string[];
};

function MiniIcon({ k }: { k: string }) {
  const common = {
    stroke: "currentColor",
    strokeWidth: 2,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (k) {
    case "local":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
          <path {...common} d="M12 10.5a1.6 1.6 0 1 0 0-.01Z" />
        </svg>
      );
    case "startup":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7Z" />
        </svg>
      );
    case "grow":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 16l6-6 4 4 6-6" />
          <path {...common} d="M20 8v6h-6" />
        </svg>
      );
    case "premium":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 7h16l-2 13H6L4 7Z" />
          <path {...common} d="M9 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "rebuild":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M20 12a8 8 0 1 1-2.3-5.6" />
          <path {...common} d="M20 4v6h-6" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
  }
}

export default function WhoForVibes({ vibes }: { vibes: Vibe[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  // cursor glow (mouse only)
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const glow = useMotionTemplate`
    radial-gradient(560px 420px at ${mx}px ${my}px,
      rgba(190,145,255,.18),
      rgba(255,255,255,.07) 34%,
      rgba(0,0,0,0) 72%)
  `;

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return;
    if (e.pointerType !== "mouse") return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const pillsRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [spot, setSpot] = useState({ x: 0, y: 0, w: 0, h: 0, o: 0 });

  const measureSpot = () => {
    const wrap = pillsRef.current;
    const btn = pillRefs.current[active];
    if (!wrap || !btn) return;

    const wr = wrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();

    setSpot({
      x: br.left - wr.left,
      y: br.top - wr.top,
      w: br.width,
      h: br.height,
      o: 1,
    });
  };

  // Premium carousel behavior on mobile:
  // - center active pill inside the rail
  // - NEVER use scrollIntoView (it can drag the page horizontally in some browsers)
  const scrollRailToActive = () => {
    const wrap = pillsRef.current;
    const btn = pillRefs.current[active];
    if (!wrap || !btn) return;

    const isScrollable = wrap.scrollWidth > wrap.clientWidth + 2;
    if (!isScrollable) {
      // desktop wrap mode: always keep rail at 0 (clean, predictable)
      if (wrap.scrollLeft !== 0) wrap.scrollLeft = 0;
      return;
    }

    const isMobileLike = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    const wr = wrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();

    const current = wrap.scrollLeft;
    const max = wrap.scrollWidth - wrap.clientWidth;

    // target = center on mobile, otherwise minimal scroll to keep fully visible
    let next = current;

    if (isMobileLike) {
      const btnCenter = (br.left - wr.left) + br.width / 2;
      next = current + (btnCenter - wr.width / 2);
    } else {
      const pad = 10;
      const leftEdge = br.left - wr.left;
      const rightEdge = br.right - wr.left;
      if (leftEdge < pad) next = current + (leftEdge - pad);
      else if (rightEdge > wr.width - pad) next = current + (rightEdge - (wr.width - pad));
      else return; // already nicely visible
    }

    next = Math.max(0, Math.min(max, next));
    wrap.scrollTo({ left: next, behavior: reduced ? "auto" : "smooth" });
  };

  useEffect(() => {
    // measure after layout settles
    const raf = requestAnimationFrame(() => {
      scrollRailToActive();
      requestAnimationFrame(measureSpot);
    });

    const onResize = () => {
      scrollRailToActive();
      requestAnimationFrame(measureSpot);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const v = vibes[active];
  const progress = (active + 1) / Math.max(1, vibes.length);

  const containerVariants = useMemo(
    () => ({
      hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0 },
    }),
    [reduced]
  );

  return (
    <motion.div
      ref={wrapRef}
      className="k-whoLite__card k-whoLite__card--console"
      onPointerMove={onMove}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      variants={containerVariants}
    >
      {!reduced ? <motion.div className="k-whoLite__glow" style={{ backgroundImage: glow as any }} /> : null}

      <div className="k-whoLite__top">
        <div className="k-whoLite__topLeft">
          <h5>It’s for you if you’re…</h5>
          <small>Choose one. We’ll match the build to it.</small>
        </div>

        <div className="k-whoLite__meter" aria-label="Selection">
          <span className="k-whoLite__meterDot" aria-hidden="true"></span>
          <span className="k-whoLite__meterWord">Vibe</span>
          <span className="k-whoLite__meterNum">{String(active + 1).padStart(2, "0")}</span>
          <span className="k-whoLite__meterSlash">of</span>
          <span className="k-whoLite__meterTotal">{String(vibes.length).padStart(2, "0")}</span>
          <span className="k-whoLite__meterBar" aria-hidden="true">
            <span className="k-whoLite__meterFill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        </div>
      </div>

      <div className="k-whoLite__pillsWrap">
        <div ref={pillsRef} className="k-whoLite__pills" role="tablist" aria-label="Who it's for selector">
          {/* Spotlight under active pill */}
          <AnimatePresence initial={false}>
            {spot.o > 0 && !reduced && (
              <motion.div
                className="k-whoLite__spot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: spot.x, y: spot.y, width: spot.w, height: spot.h }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
              />
            )}
          </AnimatePresence>

          {vibes.map((it, i) => {
            const isActive = i === active;
            return (
              <button
                key={it.key}
                ref={(el) => (pillRefs.current[i] = el)}
                type="button"
                className={`k-whoLite__pill ${isActive ? "is-active" : ""}`}
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={isActive}
              >
                <span className="k-whoLite__pillIcon" aria-hidden="true">
                  <MiniIcon k={it.key} />
                </span>
                <span className="k-whoLite__pillText">{it.label}</span>

                <AnimatePresence initial={false}>
                  {isActive && !reduced && (
                    <motion.span
                      className="k-whoLite__pillSweep"
                      initial={{ x: "-70%", opacity: 0 }}
                      animate={{ x: "140%", opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      <div className="k-whoLite__promise" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={v.key}
            className="k-whoLite__promiseInner k-whoLite__promiseInner--soft"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Micro proof — quiet confidence, not a billboard */}
            <div className="k-whoLite__microProof" aria-label="Typical uplift note">
              <span className="k-whoLite__microProofTop">Typical uplift</span>
              <span className="k-whoLite__microProofValue">+20–40% enquiries*</span>
              <span className="k-whoLite__microProofFoot">*varies by offer &amp; traffic</span>
            </div>

            <div className="k-whoLite__promiseLabel">
              <span className="k-whoLite__spark" aria-hidden="true"></span>
              <span>Promise</span>
            </div>

            <h3 className="k-whoLite__promiseTitle">{v.line}</h3>

            <div className="k-whoLite__wins" aria-label="Outcomes">
              {v.tags.slice(0, 3).map((t) => (
                <span className="k-whoLite__win" key={t}>
                  <span className="k-whoLite__winDot" aria-hidden="true" />
                  <span>{t}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
