import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};

export default function ReviewsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const items = useMemo(() => (testimonials || []).slice(0, 3), [testimonials]);
  const total = Math.max(1, items.length);

  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const go = useCallback(
    (next: number, direction: 1 | -1) => {
      setDir(direction);
      setIndex(mod(next, total));
    },
    [total]
  );

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  // Keyboard: left/right
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const cur = items[index] ?? items[0];

  const variants = {
    enter: (direction: 1 | -1) => ({
      x: prefersReduced ? 0 : direction * 36,
      opacity: 0,
      filter: prefersReduced ? "none" : "blur(6px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: 1 | -1) => ({
      x: prefersReduced ? 0 : direction * -28,
      opacity: 0,
      filter: prefersReduced ? "none" : "blur(6px)",
    }),
  } as const;

  return (
    <div
      className="k-reviewsCar"
      data-reviews-carousel
      aria-roledescription="carousel"
    >
      <div className="k-reviewsCar__stage">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            className="k-reviewsCar__slide"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              prefersReduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 520, damping: 48, mass: 0.9 }
            }
          >
            <blockquote className="k-reviewsCar__quote">
              <span className="k-reviewsCar__quoteMark" aria-hidden="true">
                “
              </span>
              {cur?.quote}
              <span
                className="k-reviewsCar__quoteMark k-reviewsCar__quoteMark--end"
                aria-hidden="true"
              >
                ”
              </span>
            </blockquote>
          </motion.div>
        </AnimatePresence>

        {/* ✅ ONE wide pill: who (left) + arrows (right) — STALE, no remount flicker */}
        <div className="k-reviewsCar__whoPill" aria-label="Testimonial and controls">
          <div className="k-reviewsCar__whoLeft">
            <span className="k-reviewsCar__name">{cur?.name}</span>
            <span className="k-reviewsCar__role">{cur?.role}</span>
          </div>

          <div className="k-reviewsCar__arrows" aria-label="Carousel controls">
            <button
              type="button"
              className="k-reviewsCar__arrow"
              onClick={prev}
              aria-label="Previous testimonial"
            >
              <span aria-hidden="true">←</span>
            </button>

            <button
              type="button"
              className="k-reviewsCar__arrow"
              onClick={next}
              aria-label="Next testimonial"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="k-reviewsCar__glow" aria-hidden="true" />
        <div className="k-reviewsCar__grain" aria-hidden="true" />
      </div>
    </div>
  );
}
