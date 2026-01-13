import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ModeKey = "website" | "seo" | "launch";

const MODES: Array<{ key: ModeKey; label: string }> = [
  { key: "website", label: "Website" },
  { key: "seo", label: "Local SEO" },
  { key: "launch", label: "Fast Launch" },
];

export default function ModePills() {
  const reduced = useReducedMotion();
  const [modeKey, setModeKey] = useState<ModeKey>("website");

  const barRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [rail, setRail] = useState({ x: 0, w: 0 });

  const measure = () => {
    const bar = barRef.current;
    if (!bar) return;
    const idx = MODES.findIndex((m) => m.key === modeKey);
    const btn = btnRefs.current[idx];
    if (!btn) return;
    setRail({ x: Math.round(btn.offsetLeft), w: Math.round(btn.offsetWidth) });
  };

  const broadcast = (next: ModeKey) => {
    window.dispatchEvent(new CustomEvent("k-pack-mode", { detail: { modeKey: next } }));
  };

  useEffect(() => {
    measure();
    broadcast(modeKey);

    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKey]);

  useEffect(() => {
    // If table changes mode elsewhere in future, we can sync back:
    const onSync = (e: Event) => {
      const ce = e as CustomEvent<{ modeKey?: ModeKey }>;
      const next = ce?.detail?.modeKey;
      if (next && next !== modeKey) setModeKey(next);
    };
    window.addEventListener("k-pack-mode-sync", onSync);
    return () => window.removeEventListener("k-pack-mode-sync", onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="k-packPillsWrap k-packPillsWrap--center" aria-label="Package mode">
      <div ref={barRef} className="k-packPills" role="tablist" aria-label="Package modes">
        <motion.span
          className="k-packPillsRail"
          aria-hidden="true"
          animate={{ x: rail.x, width: rail.w }}
          transition={reduced ? { duration: 0 } : { duration: 0.26, ease: [0.2, 0.9, 0.2, 1] }}
        />

        {MODES.map((m, i) => {
          const on = m.key === modeKey;
          return (
            <button
              key={m.key}
              ref={(el) => (btnRefs.current[i] = el)}
              type="button"
              role="tab"
              aria-selected={on}
              className={"k-packPill" + (on ? " is-on" : "")}
              onClick={() => setModeKey(m.key)}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="k-packHint k-packHint--center">Hover a column to spotlight it. Click to lock.</div>
    </div>
  );
}
