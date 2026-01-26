import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

type Receipt =
  | {
      kind: "checklist";
      title: string;
      meta: string;
      progress: { done: number; total: number };
      lines: Array<{ label: string; done?: boolean }>;
    }
  | {
      kind: "log";
      title: string;
      meta: string;
      lines: string[];
    }
  | {
      kind: "screens";
      title: string;
      meta: string;
      labels: string[];
    }
  | {
      kind: "badges";
      title: string;
      meta: string;
      badges: string[];
    }
  | {
      kind: "map";
      title: string;
      meta: string;
      lines: Array<{ k: string; v: string }>;
    };

type Track = {
  key: string;
  label: string;
  icon: "build" | "seo" | "conversion";
  headline: string; // short
  sub: string; // one-liner max
  bullets: string[]; // only titles
  kpis: Array<{ k: string; v: string }>;
  receipts: Receipt[]; // shown one at a time (pager)
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.7,
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

function ReceiptBody({ r }: { r: Receipt }) {
  if (r.kind === "checklist") {
    const pct = Math.round((r.progress.done / Math.max(1, r.progress.total)) * 100);
    return (
      <div className="k-proof2__receiptBody">
        <div className="k-proof2__bar" aria-label="Checklist progress">
          <div className="k-proof2__barFill" style={{ width: `${pct}%` }} />
        </div>

        <ul className="k-proof2__miniList" aria-label="Checklist preview">
          {r.lines.slice(0, 3).map((x, i) => (
            <li key={i} className={cn("k-proof2__miniLine", x.done && "is-done")}>
              <span className="k-proof2__tinyTick" aria-hidden="true">
                <IconCheck />
              </span>
              <span>{x.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (r.kind === "log") {
    return (
      <div className="k-proof2__receiptBody">
        <div className="k-proof2__logMini" aria-label="QA log preview">
          {r.lines.slice(0, 3).map((x, i) => (
            <div key={i} className="k-proof2__logLine">
              <span className="k-proof2__logDot" aria-hidden="true" />
              <span>{x}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (r.kind === "screens") {
    return (
      <div className="k-proof2__receiptBody">
        <div className="k-proof2__thumbs" aria-label="Key screens preview">
          {r.labels.slice(0, 3).map((lab, i) => (
            <div className="k-proof2__thumb" key={i} aria-label={lab}>
              <div className="k-proof2__thumbTop">
                <span className="k-proof2__thumbDot" aria-hidden="true" />
                <span className="k-proof2__thumbDot" aria-hidden="true" />
                <span className="k-proof2__thumbDot" aria-hidden="true" />
              </div>
              <div className="k-proof2__thumbBody">
                <div className="k-proof2__thumbLabel">{lab}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (r.kind === "badges") {
    return (
      <div className="k-proof2__receiptBody">
        <div className="k-proof2__badgeRow" aria-label="Shipped badges">
          {r.badges.slice(0, 6).map((b) => (
            <span className="k-proof2__badgePill" key={b}>
              {b}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // map
  return (
    <div className="k-proof2__receiptBody">
      <div className="k-proof2__map" aria-label="CTA map preview">
        {r.lines.slice(0, 3).map((x) => (
          <div className="k-proof2__mapLine" key={x.k}>
            <span className="k-proof2__mapK">{x.k}</span>
            <span className="k-proof2__mapV">{x.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProofPack() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // cursor glow
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
        headline: "Studio-grade build. Quietly ruthless.",
        sub: "Delivery receipts as we ship: progress, QA, screenshots.",
        bullets: ["Astro-first rendering", "Cross-device polish"],
        kpis: [
          { k: "Perf", v: "Budgeted" },
          { k: "QA", v: "23 checks" },
          { k: "A11y", v: "Baseline" },
        ],
        receipts: [
          {
            kind: "checklist",
            title: "Build checklist",
            meta: "Shared link • updated during delivery",
            progress: { done: 8, total: 23 },
            lines: [
              { label: "Layout + spacing tokens", done: true },
              { label: "Hero + primary CTA pass", done: true },
              { label: "Responsive QA (iOS/Android)", done: false },
              { label: "Image optimisation (WebP/AVIF)", done: false },
            ],
          },
          {
            kind: "log",
            title: "Pre-launch QA",
            meta: "Short, ruthless, timestamped",
            lines: [
              "Nav: focus rings verified (keyboard)",
              "CLS check: stable layout on load",
              "iOS: no horizontal drift",
              "Forms: validation + error states",
            ],
          },
          {
            kind: "screens",
            title: "Key screens",
            meta: "3–5 screens shared during delivery",
            labels: ["Home", "Service detail", "Contact"],
          },
        ],
      },
      {
        key: "seo",
        label: "SEO foundations",
        icon: "seo",
        headline: "Search-ready structure. No gimmicks.",
        sub: "Clean crawl signals + share metadata done properly.",
        bullets: ["Semantic headings", "Canonical + sitemap"],
        kpis: [
          { k: "Index", v: "Ready" },
          { k: "Meta", v: "OG set" },
          { k: "Schema", v: "Minimal" },
        ],
        receipts: [
          {
            kind: "badges",
            title: "Indexing essentials",
            meta: "The boring stuff done right",
            badges: ["Canonical", "Sitemap", "Robots", "OG/Twitter", "Alt text", "Schema"],
          },
          {
            kind: "checklist",
            title: "SEO checklist",
            meta: "Ticked during delivery",
            progress: { done: 6, total: 14 },
            lines: [
              { label: "Canonical (non-www) verified", done: true },
              { label: "Open Graph image wired", done: true },
              { label: "Sitemap generated + checked", done: false },
              { label: "Internal link intent pass", done: false },
            ],
          },
          {
            kind: "log",
            title: "Audit notes",
            meta: "What we fixed • and why",
            lines: [
              "Heading ladder aligned (H1→H2)",
              "Meta descriptions unique per page",
              "Image alt descriptive (not spammy)",
              "Schema only where it helps",
            ],
          },
        ],
      },
      {
        key: "conversion",
        label: "Conversion flow",
        icon: "conversion",
        headline: "Less friction. More action.",
        sub: "Clear promise → proof → one primary CTA.",
        bullets: ["Message hierarchy", "Thumb-zone UI"],
        kpis: [
          { k: "CTA", v: "Mapped" },
          { k: "Flow", v: "Clean" },
          { k: "Forms", v: "Light" },
        ],
        receipts: [
          {
            kind: "map",
            title: "CTA map",
            meta: "Primary action per section",
            lines: [
              { k: "Hero", v: "Get a quote" },
              { k: "Work", v: "Load live preview" },
              { k: "Contact", v: "Send brief" },
              { k: "Packages", v: "Pick a package" },
            ],
          },
          {
            kind: "log",
            title: "Friction cleanup",
            meta: "Tiny cuts that add up",
            lines: [
              "Reduced choice overload (one primary CTA)",
              "Improved scannability (shorter copy)",
              "Better mobile spacing (thumb-zone taps)",
              "Form: fewer fields, clearer intent",
            ],
          },
          {
            kind: "screens",
            title: "Lead capture",
            meta: "What happens after the click",
            labels: ["Contact", "Confirmation", "Follow-up"],
          },
        ],
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [receiptIdx, setReceiptIdx] = useState(0);

  const t = tracks[active];
  const r = t.receipts[receiptIdx];

  useEffect(() => {
    setReceiptIdx(0);
  }, [active]);

  // Tab indicator measurement
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [rail, setRail] = useState({ x: 0, w: 0 });

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const syncRail = () => {
    const bar = tabBarRef.current;
    const btn = tabRefs.current[active];
    if (!bar || !btn) return;
    const x = Math.round(btn.offsetLeft - bar.scrollLeft);
    const w = Math.round(btn.offsetWidth);
    setRail({ x, w });
  };

  const keepActiveVisibleX = () => {
    const bar = tabBarRef.current;
    const btn = tabRefs.current[active];
    if (!bar || !btn) return;

    const target = btn.offsetLeft - (bar.clientWidth / 2 - btn.offsetWidth / 2);
    const nextLeft = clamp(Math.round(target), 0, Math.max(0, bar.scrollWidth - bar.clientWidth));

    if (Math.abs(nextLeft - bar.scrollLeft) > 1) {
      bar.scrollTo({ left: nextLeft, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const measure = () => {
    keepActiveVisibleX();
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

  const prevReceipt = () => setReceiptIdx((p) => (p - 1 + t.receipts.length) % t.receipts.length);
  const nextReceipt = () => setReceiptIdx((p) => (p + 1) % t.receipts.length);

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
            Delivery receipts — checklists, snapshots, visible progress — while we build.
          </p>

          <div className="k-proof2__hint" aria-hidden="true">
            Switch track to preview your Proof Pack
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
                className={cn("k-proof2__tab", i === active && "is-active")}
                aria-selected={i === active}
                onClick={() => setActive(i)}
              >
                <span className="k-proof2__tabIcon" aria-hidden="true">
                  <TabIcon type={x.icon} />
                </span>
                <span className="k-proof2__tabText">{x.label}</span>
              </button>
            ))}
          </div>

          <div className="k-proof2__ctaRow">
            <a className="k-btn k-btn--primary" href="/contact/#contact" data-magnetic="true">
              <span className="k-btn__label">Get a quote</span>
              <span className="k-btn__shine" aria-hidden="true" />
              <span className="k-btn__arrow" aria-hidden="true">
                →
              </span>
            </a>

            <a className="k-proof2__textLink" href="#work">
              View work <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="k-proof2__right">
          <div className="k-proof2__console">
            {/* Top bar */}
            <div className="k-proof2__consoleTop">
              <div className="k-proof2__consoleTitle">
                <span className="k-proof2__consoleIcon" aria-hidden="true">
                  <IconPulse />
                </span>
                <span>Delivery receipts</span>
              </div>

              <div className="k-proof2__consoleHint">
                <span className="k-proof2__hintDot" aria-hidden="true" />
                Live during delivery
              </div>
            </div>

            {/* Track meta + KPIs */}
            <div className="k-proof2__dash">
              <div className="k-proof2__consoleMeta">
                <div className="k-proof2__metaLeft">
                  <span className="k-proof2__metaK">Track</span>
                  <span className="k-proof2__metaV">
                    {String(active + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="k-proof2__metaRight">{t.label}</div>
              </div>

              <div className="k-proof2__kpis" aria-label="Key metrics">
                {t.kpis.map((x) => (
                  <div className="k-proof2__kpi" key={x.k}>
                    <div className="k-proof2__kpiK">{x.k}</div>
                    <div className="k-proof2__kpiV">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Headline + micro bullets */}
            <div className="k-proof2__micro">
              <div className="k-proof2__panelTitle">{t.headline}</div>
              <div className="k-proof2__panelLead">{t.sub}</div>
              <div className="k-proof2__microBullets" aria-label="Highlights">
                {t.bullets.slice(0, 2).map((b) => (
                  <span className="k-proof2__microPill" key={b}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Single receipt card with pager */}
            <div className="k-proof2__receiptWrap">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${t.key}-${receiptIdx}`}
                  className="k-proof2__receiptCard"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
                  transition={reduced ? { duration: 0 } : spring}
                >
                  <div className="k-proof2__receiptHead">
                    <div>
                      <div className="k-proof2__receiptTitle">{r.title}</div>
                      <div className="k-proof2__receiptMeta">{r.meta}</div>
                    </div>

                    <div className="k-proof2__receiptChip">
                      {String(receiptIdx + 1).padStart(2, "0")} / {String(t.receipts.length).padStart(2, "0")}
                    </div>
                  </div>

                  <ReceiptBody r={r} />

                  <div className="k-proof2__pager" aria-label="Receipt navigation">
                    <button
                      type="button"
                      className="k-proof2__pagerBtn"
                      onClick={prevReceipt}
                      aria-label="Previous receipt"
                    >
                      ←
                    </button>

                    <div className="k-proof2__dots" aria-label="Receipt position">
                      {t.receipts.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={cn("k-proof2__dot", i === receiptIdx && "is-active")}
                          onClick={() => setReceiptIdx(i)}
                          aria-label={`Go to receipt ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="k-proof2__pagerBtn"
                      onClick={nextReceipt}
                      aria-label="Next receipt"
                    >
                      →
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="k-proof2__footerLine">
                <span className="k-proof2__footerPill">Performance budget</span>
                <span className="k-proof2__footerPill">Clean handoff</span>
                <span className="k-proof2__footerPill">Accessibility basics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
