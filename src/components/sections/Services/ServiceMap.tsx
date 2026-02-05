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
  proof?: string;
};

const ICONS: Record<string, React.ReactNode> = {
  build: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 17l6-6 4 4 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  scheduling: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 12h4M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16l-2 7h-4l-2 2h-4l-2-2H6L4 5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M4 12v7h16v-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  gifts: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M4 8h16v4H4V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 8c-2.5 0-4-1-4-2.5S9 3 10.5 3C12 3 12 5 12 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8c2.5 0 4-1 4-2.5S15 3 13.5 3C12 3 12 5 12 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  reminders: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2z" fill="currentColor" opacity=".55" />
      <path
        d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ServiceMap({ cards }: { cards: Card[] }) {
  const reduced = useReducedMotion();

  const [active, setActive] = React.useState<number | null>(null);
  const lastFocusRef = React.useRef<HTMLElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  const open = active !== null;
  const card = open ? cards[clamp(active!, 0, cards.length - 1)] : null;

  const openDetail = (i: number) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setActive(i);
  };

  const closeDetail = () => setActive(null);

  // ESC close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // lock scroll + restore focus
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
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.18 },
      };

  const panelMotion = reduced
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      };

  return (
    <div className="k-svcMap" aria-label="Service map">
      <div className="k-svcMiniGrid" role="list" aria-label="Services">
        {cards.map((c, i) => {
          const id = `svc-${c.key}`;

          return (
            <motion.button
              key={c.key}
              type="button"
              className={`k-svcMini k-tile--tone-${c.tone}`}
              onClick={() => openDetail(i)}
              role="listitem"
              aria-label={`${c.tag}: ${c.title}`}
              aria-haspopup="dialog"
              layout
              layoutId={`${id}-card`}
              whileTap={reduced ? undefined : { scale: 0.992 }}
            >
              <span className="k-svcMini__bg k-tile__bg" aria-hidden="true" />
              <span className="k-svcMini__paper k-tile__paper" aria-hidden="true" />

              <div className="k-svcMini__top">
                <motion.span className="k-svcMini__icon" aria-hidden="true" layoutId={`${id}-icon`}>
                  {ICONS[c.key]}
                </motion.span>

                <motion.span className="k-svcMini__tag" layoutId={`${id}-tag`}>
                  {c.tag}
                </motion.span>
              </div>

              <motion.span className="k-svcMini__title" layoutId={`${id}-title`}>
                {c.title}
              </motion.span>

              {c.proof ? (
                <motion.span className="k-svcMini__proof" layoutId={`${id}-proof`}>
                  {c.proof}
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && card && (
          <>
            <motion.div className="k-svcXOverlay" {...overlayMotion} onClick={closeDetail} aria-hidden="true" />

            <motion.div
              className={`k-svcX k-tile--tone-${card.tone}`}
              role="dialog"
              aria-modal="true"
              aria-label={card.title}
              {...panelMotion}
            >
              <motion.div className="k-svcX__card" layoutId={`svc-${card.key}-card`}>
                <span className="k-svcX__bg k-tile__bg" aria-hidden="true" />
                <span className="k-svcX__paper k-tile__paper" aria-hidden="true" />

                <div className="k-svcX__head">
                  <div className="k-svcX__left">
                    <motion.span className="k-svcX__icon" aria-hidden="true" layoutId={`svc-${card.key}-icon`}>
                      {ICONS[card.key]}
                    </motion.span>

                    <motion.span className="k-svcX__tag" layoutId={`svc-${card.key}-tag`}>
                      {card.tag}
                    </motion.span>
                  </div>

                  <button
                    ref={closeBtnRef}
                    type="button"
                    className="k-svcX__close"
                    onClick={closeDetail}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="k-svcX__body">
                  <motion.h3 className="k-svcX__title" layoutId={`svc-${card.key}-title`}>
                    {card.title}
                  </motion.h3>

                  {card.proof ? (
                    <motion.p className="k-svcX__proof" layoutId={`svc-${card.key}-proof`}>
                      {card.proof}
                    </motion.p>
                  ) : null}

                  <p className="k-svcX__desc">{card.desc}</p>

                  <div className={`k-svcX__media k-tile__media k-tile__media--${card.media}`} aria-hidden="true">
                    <div className="k-m__a" />
                    <div className="k-m__b" />
                    <div className="k-m__c" />
                    <div className="k-m__d" />
                    <div className="k-m__e" />
                  </div>

                  <div className="k-svcX__meta">{card.meta}</div>

                  <ul className="k-svcX__bullets" aria-label="Highlights">
                    {(card.bullets?.length ? card.bullets : ["Clear scope", "Conversion-ready build"])
                      .slice(0, 3)
                      .map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                  </ul>

                  <a href="/contact/#contact" className="k-btn k-btn--primary k-svcX__cta" data-magnetic="false">
                    <span className="k-btn__label">Get a quote</span>
                    <span className="k-btn__shine" aria-hidden="true"></span>
                    <span className="k-btn__arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
