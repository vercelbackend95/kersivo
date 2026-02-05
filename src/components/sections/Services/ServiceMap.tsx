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
  proof?: string; // ✅ micro-proof
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

export default function ServiceMap({ cards }: { cards: Card[] }) {
  const reduced = useReducedMotion();

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = React.useRef<HTMLElement | null>(null);

  const card = cards[Math.max(0, Math.min(active, cards.length - 1))];

  const openSheet = (i: number) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setActive(i);
    setOpen(true);
  };

  const closeSheet = () => setOpen(false);

  // ESC to close + focus restore
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };

    window.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 40);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // lock body scroll (iOS-friendly)
  React.useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      lastFocusRef.current?.focus?.();
    };
  }, [open]);

  const overlayMotion = reduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 } };

  const sheetMotion = reduced
    ? { initial: { y: 0 }, animate: { y: 0 }, exit: { y: 0 }, transition: { duration: 0 } }
    : { initial: { y: 22 }, animate: { y: 0 }, exit: { y: 28 }, transition: { type: "spring", stiffness: 280, damping: 28, mass: 0.7 } };

  return (
    <div className="k-svcMap" aria-label="Service map">
      <div className="k-svcMiniGrid" role="list" aria-label="Services">
        {cards.map((c, i) => (
          <button
            key={c.key}
            type="button"
            className={`k-svcMini k-tile--tone-${c.tone}`}
            onClick={() => openSheet(i)}
            role="listitem"
            aria-label={`${c.tag}: ${c.title}`}
          >
            <span className="k-svcMini__bg k-tile__bg" aria-hidden="true" />
            <span className="k-svcMini__paper k-tile__paper" aria-hidden="true" />

            <span className="k-svcMini__top">
              <span className="k-svcMini__icon" aria-hidden="true">
                {ICONS[c.key]}
              </span>
              <span className="k-svcMini__tag">{c.tag}</span>
            </span>

            <span className="k-svcMini__title">{c.title}</span>

            {/* micro-proof */}
            {c.proof ? <span className="k-svcMini__proof">{c.proof}</span> : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="k-svcOverlay" {...overlayMotion} onClick={closeSheet} aria-hidden="true" />

            <motion.div
              className={`k-svcSheet k-tile--tone-${card.tone}`}
              role="dialog"
              aria-modal="true"
              aria-label={card.title}
              {...sheetMotion}
              drag={reduced ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (reduced) return;
                if (info.offset.y > 90 || info.velocity.y > 900) closeSheet();
              }}
            >
              <span className="k-svcSheet__bg k-tile__bg" aria-hidden="true" />
              <span className="k-svcSheet__paper k-tile__paper" aria-hidden="true" />

              <div className="k-svcSheet__handle" aria-hidden="true" />

              <div className="k-svcSheet__head">
                <div className="k-svcSheet__kicker">
                  <span className="k-svcSheet__pill">{card.tag}</span>
                  <span className="k-svcSheet__meta">{card.meta}</span>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  className="k-svcSheet__close"
                  onClick={closeSheet}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="k-svcSheet__content">
                <div className={`k-svcSheet__media k-tile__media k-tile__media--${card.media}`} aria-hidden="true">
                  <div className="k-m__a" />
                  <div className="k-m__b" />
                  <div className="k-m__c" />
                  <div className="k-m__d" />
                  <div className="k-m__e" />
                </div>

                <h3 className="k-svcSheet__title">{card.title}</h3>
                <p className="k-svcSheet__desc">{card.desc}</p>

                {card.proof ? <p className="k-svcSheet__proof">{card.proof}</p> : null}

                <ul className="k-svcSheet__bullets" aria-label="Highlights">
                  {(card.bullets?.length ? card.bullets.slice(0, 2) : ["Clear scope", "Conversion-ready build"]).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>

                <a href="/contact/#contact" className="k-btn k-btn--primary k-svcSheet__cta" data-magnetic="false">
                  <span className="k-btn__label">Get a quote</span>
                  <span className="k-btn__shine" aria-hidden="true"></span>
                  <span className="k-btn__arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
