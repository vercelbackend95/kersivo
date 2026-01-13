import React, { useEffect, useMemo, useState } from "react";

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

export default function PackagesTable() {
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

  const mode = modes.find((m) => m.key === modeKey) || modes[0];

  return (
    <div className="k-packCard" aria-label="Packages comparison">
      <div className="k-packStage">
        <div className="k-packScroll">
          {/* ONE GRID. One row = one truth. */}
          <div className="k-packMatrix" role="table" aria-label="Packages table">
            {/* Header row */}
            <div className="k-packHeadCell k-packHeadCell--label" role="columnheader">
              What you get
            </div>

            {mode.tiers.map((t) => (
              <div
                key={t.key}
                className={cn("k-packHeadCell", t.key === "scale" && "is-mint")}
                role="columnheader"
              >
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
            ))}

            {/* Data rows */}
            {mode.rows.map((r) => (
              <React.Fragment key={r.label}>
                <div className="k-packCell k-packCell--label k-packStickyCell" role="rowheader">
                  <span className="k-packLabelText">{r.label}</span>
                  {r.hint ? <span className="k-packCellHint">{r.hint}</span> : null}
                </div>

                {mode.tiers.map((t) => (
                  <div key={t.key} className="k-packCell" role="cell">
                    {r.values[t.key]}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="k-packDust" aria-hidden="true" />
    </div>
  );
}
