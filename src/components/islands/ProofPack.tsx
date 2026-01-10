import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

type Item = { title: string; desc: string };
type Track = {
  key: string;
  label: string;
  icon: "build" | "seo" | "conversion";
  title: string;
  lead: string;
  items: Item[];
  receipts: string[];
};

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPulse = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 12h4l2-6 4 12 2-6h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TabIcon = ({ type }: { type: Track["icon"] }) => {
  if (type === "build") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14 7l3 3-8 8H6v-3l8-8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M13 8l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "seo") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M10 4h4l1 2h5v14H4V6h5l1-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l6 6L20 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function ProofPack() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // cursor glow (safe, behind everything)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const glow = useMotionTemplate`radial-gradient(560px 380px at ${mx}px ${my}px,
    rgba(190,145,255,.28),
    rgba(255,200,235,.12) 36%,
    rgba(0,0,0,0) 70%)`;

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return;
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const tracks: Track[] = useMemo(
    () => [
      {
        key: "build",
        label: "Build quality",
        icon: "build",
        title: "Studio-grade build. Quietly ruthless.",
        lead: "No inflated case studies. We show the standard: clean build, QA, and delivery that feels premium.",
        items: [
          { title: "Astro-first rendering", desc: "Fast by default — minimal hydration only where it pays." },
          { title: "Accessibility basics", desc: "Focus, contrast, semantics — baked in." },
          { title: "Cross-device polish", desc: "Mobile-first rhythm, crisp typography, consistent spacing." },
        ],
        receipts: ["Build checklist (shared)", "Key screens preview", "Pre-launch QA pass"],
      },
      {
        key: "seo",
        label: "SEO foundations",
        icon: "seo",
        title: "Search-ready structure — without gimmicks.",
        lead: "We don’t promise rankings. We ship the foundations Google can crawl and humans can understand.",
        items: [
          { title: "Semantic headings", desc: "Real hierarchy — not random bold text." },
          { title: "Meta + OG + sitemap", desc: "Sharing + indexing essentials, done properly." },
          { title: "Schema where it helps", desc: "Only meaningful structured data — no spam." },
        ],
        receipts: ["SEO checklist (ticked)", "Indexing essentials", "On-page structure audit"],
      },
      {
        key: "conversion",
        label: "Conversion flow",
        icon: "conversion",
        title: "Less friction. More action.",
        lead: "Clear promise → proof → action. One primary CTA per screen. No clutter. No confusion.",
        items: [
          { title: "Message hierarchy", desc: "Offer → proof → action, tuned for UK small business buyers." },
          { title: "Thumb-zone UI", desc: "Mobile flows that feel effortless (because they are)." },
          { title: "Trust cues", desc: "Subtle proof: clarity, process, and real-world detail." },
        ],
        receipts: ["CTA map (per section)", "Friction cleanup", "Lead capture plan"],
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const t = tracks[active];

  // Tab indicator measurement (makes “clickable” obvious)
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [rail, setRail] = useState({ x: 0, w: 0 });

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const syncRail = () => {
    const bar = tabBarRef.current;
    const btn = tabRefs.current[active];
    if (!bar || !btn) return;

    // ✅ stable coordinates (no layout surprises)
    const x = Math.round(btn.offsetLeft - bar.scrollLeft);
    const w = Math.round(btn.offsetWidth);
    setRail({ x, w });
  };

  const keepActiveVisibleX = () => {
    const bar = tabBarRef.current;
    const btn = tabRefs.current[active];
    if (!bar || !btn) return;

    // ✅ iOS-safe: ONLY horizontal scroll on the tab bar (no scrollIntoView)
    const target =
      btn.offsetLeft - (bar.clientWidth / 2 - btn.offsetWidth / 2);

    const nextLeft = clamp(Math.round(target), 0, Math.max(0, bar.scrollWidth - bar.clientWidth));

    if (Math.abs(nextLeft - bar.scrollLeft) > 1) {
      bar.scrollTo({ left: nextLeft, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const measure = () => {
    keepActiveVisibleX();
    // update rail now + after scroll kicks in
    syncRail();
    requestAnimationFrame(syncRail);
  };

  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });

    const bar = tabBarRef.current;
    if (bar) {
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(syncRail);
      };
      bar.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        bar.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(raf);
      };
    }

    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((p) => (p + 1) % tracks.length);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((p) => (p - 1 + tracks.length) % tracks.length);
    }
  };

  const wrap = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.9, 0.2, 1] } },
  };

  return (
    <motion.div
      ref={rootRef}
      className="k-proof2"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      variants={wrap}
      onPointerMove={onMove}
    >
      <motion.div
        className="k-proof2__glow"
        aria-hidden="true"
        style={{ backgroundImage: reduced ? undefined : glow }}
      />

      <div className="k-proof2__grid">
        {/* LEFT */}
        <div className="k-proof2__left">
          <div className="k-proof2__kickerRow">
            <span className="k-proof2__kicker">PROOF CONSOLE</span>
            <span className="k-proof2__badge">demo-safe</span>
          </div>

          <h2 className="k-proof2__title">
            Proof that feels real.
            <br />
            <span className="k-proof2__grad">Because it is.</span>
          </h2>

          <p className="k-proof2__lead">
            We’re early — so we don’t flex imaginary results. Instead, you get a “Proof Pack” during delivery:
            checklists, snapshots, and visible progress.
          </p>

          <div className="k-proof2__hint" aria-hidden="true">
            Click a tab to switch view
          </div>

          {/* TABS */}
          <div
            ref={tabBarRef}
            className="k-proof2__tabs"
            role="tablist"
            aria-label="Proof tracks"
            onKeyDown={onKeyDown}
            tabIndex={0}
          >
            <motion.span
              className="k-proof2__rail"
              aria-hidden="true"
              animate={{ x: rail.x, width: rail.w }}
              transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
            />

            {tracks.map((x, i) => (
              <button
                key={x.key}
                ref={(el) => (tabRefs.current[i] = el)}
                type="button"
                role="tab"
                className={"k-proof2__tab" + (i === active ? " is-active" : "")}
                aria-selected={i === active}
                onClick={() => setActive(i)}
              >
                <span className="k-proof2__tabIcon" aria-hidden="true">
                  <TabIcon type={x.icon} />
                </span>
                <span className="k-proof2__tabText">{x.label}</span>
                <span className="k-proof2__tabChevron" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>

          <div className="k-proof2__ctaRow">
            <a className="k-btn k-btn--primary" href="#contact" data-magnetic>
              <span className="k-btn__label">Get a quote</span>
              <span className="k-btn__shine" aria-hidden="true"></span>
              <span className="k-btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a className="k-btn k-btn--ghost" href="#work">
              <span className="k-btn__label">View work</span>
              <span className="k-btn__arrow2" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="k-proof2__right">
          <div className="k-proof2__console">
            <div className="k-proof2__consoleTop">
              <div className="k-proof2__consoleTitle">
                <span className="k-proof2__consoleIcon">
                  <IconPulse />
                </span>
                <span>Proof Pack</span>
              </div>
              <div className="k-proof2__consoleHint">
                <span className="k-proof2__hintDot" aria-hidden="true" />
                Updates during delivery
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={t.key}
                className="k-proof2__panel"
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
                transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
              >
                <div className="k-proof2__panelHead">
                  <div className="k-proof2__panelKicker">{t.label}</div>
                  <h3 className="k-proof2__panelTitle">{t.title}</h3>
                  <p className="k-proof2__panelLead">{t.lead}</p>
                </div>

                <div className="k-proof2__items">
                  {t.items.map((it) => (
                    <div className="k-proof2__item" key={it.title}>
                      <span className="k-proof2__check">
                        <IconCheck />
                      </span>
                      <div>
                        <div className="k-proof2__itemTitle">{it.title}</div>
                        <div className="k-proof2__itemDesc">{it.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="k-proof2__receipts">
                  <div className="k-proof2__receiptsTitle">Receipts you’ll get</div>
                  <div className="k-proof2__receiptRow">
                    {t.receipts.map((r) => (
                      <span className="k-proof2__pill" key={r}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="k-proof2__minis" aria-label="Mini highlights">
            <div className="k-proof2__mini">
              <div className="k-proof2__miniTop">Performance discipline</div>
              <div className="k-proof2__miniText">A budget we respect — so pages stay fast.</div>
            </div>
            <div className="k-proof2__mini">
              <div className="k-proof2__miniTop">Clean delivery</div>
              <div className="k-proof2__miniText">Visible progress — no “trust me bro” builds.</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
