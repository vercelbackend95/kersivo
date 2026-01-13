import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ModeKey = "website" | "seo" | "launch";
type TierKey = "starter" | "growth" | "scale";

type Row = {
  label: string;
  hint?: string;
  values: Record<TierKey, string>;
};

type Tier = {
  key: TierKey;
  name: string;
  price: string;
  cta: string;
  ctaHref: string;
};

type Mode = {
  key: ModeKey;
  tiers: Tier[];
  rows: Row[];
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

const spring = { type: "spring" as const, stiffness: 520, damping: 40, mass: 0.9 };

export default function PackagesTable() {
  const reduced = useReducedMotion();

  const modes: Mode[] = useMemo(
    () => [
      {
        key: "website",
        tiers: [
          { key: "starter", name: "Starter", price: "From £750", cta: "Get a quote", ctaHref: "#contact" },
          { key: "growth", name: "Growth", price: "From £1,350", cta: "Get a quote", ctaHref: "#contact" },
          { key: "scale", name: "Scale", price: "From £2,450", cta: "Get a quote", ctaHref: "#contact" },
        ],
        rows: [
          { label: "Best for", values: { starter: "Single service", growth: "Local business", scale: "Multi-service" } },
          { label: "Pages/sections", values: { starter: "Up to 5", growth: "Up to 10", scale: "Up to 18" } },
          { label: "Design", values: { starter: "Premium base + tweaks", growth: "Tailored system", scale: "Bespoke" } },
          { label: "Copy support", values: { starter: "Light polish", growth: "Key sections", scale: "Full polish" } },
          { label: "Forms", values: { starter: "1 lead form", growth: "2–3 forms", scale: "Multi-step" } },
          { label: "Delivery", values: { starter: "5–7 days", growth: "7–12 days", scale: "12–20 days" } },
          { label: "Revisions", values: { starter: "1 round", growth: "2 rounds", scale: "3 rounds" } },
          { label: "Support", values: { starter: "7 days", growth: "14 days", scale: "30 days" } },
        ],
      },
      {
        key: "seo",
        tiers: [
          { key: "starter", name: "Starter", price: "From £350", cta: "Get a quote", ctaHref: "#contact" },
          { key: "growth", name: "Growth", price: "From £650", cta: "Get a quote", ctaHref: "#contact" },
          { key: "scale", name: "Scale", price: "From £1,150", cta: "Get a quote", ctaHref: "#contact" },
        ],
        rows: [
          { label: "Best for", values: { starter: "New site", growth: "Competitive area", scale: "Multi-location" } },
          { label: "On-page setup", values: { starter: "Core pages", growth: "Core + intent", scale: "Full map" } },
          { label: "Metadata", values: { starter: "Basics", growth: "Full set", scale: "Templates" } },
          { label: "Schema", values: { starter: "Basic", growth: "Local + FAQ", scale: "Richer set" } },
          { label: "Sitemap/robots", values: { starter: "Yes", growth: "Yes", scale: "Yes + audit" } },
          { label: "Internal links", values: { starter: "Light", growth: "Structured", scale: "Strategy" } },
          { label: "Delivery", values: { starter: "2–3 days", growth: "4–6 days", scale: "7–10 days" } },
          { label: "Notes", values: { starter: "Clean baseline", growth: "Intent focus", scale: "Scale-ready" } },
        ],
      },
      {
        key: "launch",
        tiers: [
          { key: "starter", name: "Starter", price: "From £550", cta: "Get a quote", ctaHref: "#contact" },
          { key: "growth", name: "Growth", price: "From £950", cta: "Get a quote", ctaHref: "#contact" },
          { key: "scale", name: "Scale", price: "From £1,650", cta: "Get a quote", ctaHref: "#contact" },
        ],
        rows: [
          { label: "Best for", values: { starter: "Simple offer", growth: "Most businesses", scale: "Harder sell" } },
          { label: "Hero + CTA", values: { starter: "Yes", growth: "Yes + variants", scale: "Yes + testing" } },
          { label: "Sections", values: { starter: "3–4", growth: "5–7", scale: "8–10" } },
          { label: "Trust cues", values: { starter: "Basic", growth: "Stronger", scale: "Full set" } },
          { label: "Contact flow", values: { starter: "Simple", growth: "Guided", scale: "Multi-step" } },
          { label: "Delivery", values: { starter: "48–72h", growth: "3–5 days", scale: "5–8 days" } },
          { label: "Handover", values: { starter: "Clean", growth: "Checklist", scale: "Extras" } },
          { label: "Aftercare", values: { starter: "7 days", growth: "14 days", scale: "30 days" } },
        ],
      },
    ],
    []
  );

  const [modeKey, setModeKey] = useState<ModeKey>("website");
  const [lockedTier, setLockedTier] = useState<TierKey>("growth");
  const [hoverTier, setHoverTier] = useState<TierKey | null>(null);

  // hover wins, lock is fallback
  const activeTier: TierKey = (hoverTier ?? lockedTier) as TierKey;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<Record<TierKey, HTMLDivElement | null>>({ starter: null, growth: null, scale: null });

  const rafRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const mode = modes.find((m) => m.key === modeKey) || modes[0];

  useEffect(() => {
    const onMode = (e: Event) => {
      const ce = e as CustomEvent<{ modeKey?: ModeKey }>;
      const next = ce?.detail?.modeKey;
      if (!next) return;
      setModeKey(next);
    };
    window.addEventListener("k-pack-mode", onMode);
    return () => window.removeEventListener("k-pack-mode", onMode);
  }, []);

  const measure = (tier: TierKey) => {
    const stage = stageRef.current;
    const el = colRefs.current[tier];
    if (!stage || !el) return;

    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    setRect({
      x: r.left - s.left,
      y: r.top - s.top,
      w: r.width,
      h: r.height,
    });
  };

  // glue overlay on scroll/resize + when active changes
  useEffect(() => {
    measure(activeTier);

    const onResize = () => measure(activeTier);
    const onScroll = () => measure(activeTier);

    window.addEventListener("resize", onResize);
    scrollRef.current?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      scrollRef.current?.removeEventListener("scroll", onScroll as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTier, modeKey]);

  // pointer spotlight for overlay surface (no rerenders)
  const onOverlayMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    });
  };

  return (
    <div className="k-packCard">
      <div
        className="k-packStage"
        ref={stageRef}
        aria-label="Packages comparison"
        data-active={activeTier}
        data-hover={hoverTier ? "1" : "0"}
      >
        {/* OVERLAY: only surface (no text) to avoid “reset” + double rendering */}
        <div className="k-packOverlayLayer" aria-hidden="true">
          <motion.div
            ref={overlayRef}
            className={cn("k-packOverlayCol", activeTier === "scale" && "is-mint")}
            style={
              {
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                // animated intensity (CSS reads --p)
                ["--p" as any]: hoverTier ? 1 : 0.75,
              } as React.CSSProperties
            }
            onPointerMove={onOverlayMove}
            initial={false}
            animate={
              reduced
                ? { opacity: 1, scale: 1, y: 0 }
                : {
                    opacity: 1,
                    // “approach” feeling: hover bigger, lock slightly smaller
                    scale: hoverTier ? 1.12 : 1.08,
                    y: hoverTier ? -18 : -12,
                  }
            }
            transition={reduced ? { duration: 0 } : spring}
          />
        </div>

        {/* SCROLL AREA */}
        <div className="k-packScroll" ref={scrollRef}>
          <div className="k-packTable" role="group" aria-label="Packages grid">
            {/* Labels */}
            <div className="k-packCol k-packCol--labels" aria-hidden="true">
              <div className="k-packTopCell k-packTopCell--labels">What you get</div>
              {mode.rows.map((r) => (
                <div className="k-packCell k-packCell--label" key={r.label}>
                  {r.label}
                  {r.hint ? <span className="k-packCellHint">{r.hint}</span> : null}
                </div>
              ))}
            </div>

            {/* Tiers */}
            {mode.tiers.map((t) => (
              <div
                key={t.key}
                ref={(el) => {
                  colRefs.current[t.key] = el;
                }}
                className={cn("k-packCol", "k-packCol--tier", t.key === "scale" && "is-mint")}
                data-tier={t.key}
                onPointerEnter={() => {
                  setHoverTier(t.key);
                  measure(t.key);
                }}
                onPointerLeave={() => setHoverTier(null)}
                onClick={() => {
                  setLockedTier(t.key);
                  setHoverTier(null);
                  measure(t.key);
                }}
                tabIndex={0}
              >
                <div className="k-packTopCell">
                  <div className="k-packTierName">{t.name}</div>
                  <div className="k-packTierPrice">{t.price}</div>

                  <a className="k-packBuy" href={t.ctaHref}>
                    <span className="k-packBuyText">{t.cta}</span>
                    <span className="k-packBuyArrow" aria-hidden="true">
                      →
                    </span>
                    <span className="k-packBuyShine" aria-hidden="true" />
                  </a>
                </div>

                <div className="k-packCells">
                  {mode.rows.map((r) => (
                    <div className="k-packCell" key={r.label}>
                      {r.values[t.key]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="k-packDust" aria-hidden="true" />
    </div>
  );
}
