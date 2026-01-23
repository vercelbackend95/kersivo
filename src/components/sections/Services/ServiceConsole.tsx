import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Card = {
  key: string;
  tone: "violet" | "rose" | "mint" | "amber" | "sunset" | "sky";
  media: "customization" | "scheduling" | "wallet" | "inbox" | "gifts" | "reminders";
  tag: string;
  title: string;
  desc: string;
  meta: string;
  bullets?: string[];
};

const ICONS: Record<string, React.ReactNode> = {
  build: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17l6-6 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  scheduling: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 12h4M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16l-2 7h-4l-2 2h-4l-2-2H6L4 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 12v7h16v-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  gifts: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 8h16v4H4V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8c-2.5 0-4-1-4-2.5S9 3 10.5 3C12 3 12 5 12 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8c2.5 0 4-1 4-2.5S15 3 13.5 3C12 3 12 5 12 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  reminders: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2z" fill="currentColor" opacity=".55" />
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function ServiceConsole({ cards }: { cards: Card[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const [sweep, setSweep] = React.useState(0);

  const total = Math.max(1, cards.length);
  const a = clamp(active, 0, total - 1);
  const card = cards[a];

  const pct = total === 1 ? 1 : (a + 1) / total;

  const setActiveSafe = React.useCallback(
    (i: number) => {
      const next = clamp(i, 0, total - 1);
      setActive(next);
      setSweep((x) => x + 1);
    },
    [total]
  );

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setActiveSafe(a - 1);
    if (e.key === "ArrowRight") setActiveSafe(a + 1);
  };

  return (
    <section className={`k-svcConsole k-svcConsole--tone-${card.tone}`} aria-label="Service Console">
      <div className="k-svcConsole__bg" aria-hidden="true" />
      <div className="k-svcConsole__paper" aria-hidden="true" />

      {/* Top rail */}
      <div className="k-svcConsole__top">
        <div className="k-svcConsole__rail" role="tablist" aria-label="Service modules" onKeyDown={onKeyNav}>
          {cards.map((c, i) => {
            const isActive = i === a;
            return (
              <button
                key={c.key}
                type="button"
                className={`k-svcTab ${isActive ? "is-active" : ""}`}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveSafe(i)}
                data-sweep={isActive ? sweep : undefined}
              >
                <span className="k-svcTab__icon" aria-hidden="true">
                  {ICONS[c.key]}
                </span>
                <span className="k-svcTab__label">
                  {c.tag}
                  <span className="k-svcTab__sub">0{i + 1}</span>
                </span>

                {/* sweep layer */}
                {isActive && <span key={sweep} className="k-svcTab__sweep" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Meter */}
        <div className="k-svcMeter" aria-label="Progress">
          <div className="k-svcMeter__track" aria-hidden="true" />
          <motion.div
            className="k-svcMeter__fill"
            aria-hidden="true"
            animate={{ scaleX: pct }}
            initial={false}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 30, mass: 0.7 }}
            style={{ transformOrigin: "0% 50%" }}
          />
          <motion.div
            className="k-svcMeter__head"
            aria-hidden="true"
            animate={{ left: `${pct * 100}%` }}
            initial={false}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28, mass: 0.7 }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="k-svcConsole__body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={card.key}
            className="k-svcPanel"
            role="tabpanel"
            aria-label={card.tag}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {/* Visual */}
            <motion.div
              className={`k-svcPanel__media k-tile__media k-tile__media--${card.media}`}
              aria-hidden="true"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (reduced) return;
                const dx = info.offset.x;
                const vx = info.velocity.x;
                if (dx < -55 || vx < -420) setActiveSafe(a + 1);
                else if (dx > 55 || vx > 420) setActiveSafe(a - 1);
              }}
              whileTap={reduced ? undefined : { scale: 0.995 }}
            >
              <div className="k-m__a" />
              <div className="k-m__b" />
              <div className="k-m__c" />
              <div className="k-m__d" />
              <div className="k-m__e" />
              <div className="k-svcPanel__mediaHint" aria-hidden="true">Swipe</div>
            </motion.div>

            {/* Copy */}
            <div className="k-svcPanel__copy">
              <div className="k-svcPanel__kicker">
                <span className="k-svcPanel__tag">{card.tag}</span>
                <span className="k-svcPanel__count">
                  {String(a + 1).padStart(2, "0")}<span className="k-svcPanel__slash">/</span>{String(total).padStart(2, "0")}
                </span>
              </div>

              <h3 className="k-svcPanel__title">{card.title}</h3>
              <p className="k-svcPanel__desc">{card.desc}</p>

              {card.bullets?.length ? (
                <ul className="k-svcPanel__bullets" aria-label="Highlights">
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}

              <div className="k-svcPanel__meta">{card.meta}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
