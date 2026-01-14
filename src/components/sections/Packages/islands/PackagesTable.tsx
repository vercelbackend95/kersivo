import React, { useMemo } from "react";

type TierKey = "base" | "plus" | "bespoke";

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

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

function QuoteCta({ href, label }: { href: string; label: string }) {
  // Uses your global .k-btn system (same purple CTA vibe as TopNav/Hero)
  return (
    <a className="k-btn k-btn--primary k-packCta" href={href}>
      <span className="k-btn__label">{label}</span>
      <span className="k-btn__shine" aria-hidden="true" />
      <span className="k-btn__arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export default function PackagesTable() {
  const tiers: Tier[] = useMemo(
    () => [
      { key: "base", name: "Base", price: "From £750", cta: "Get a quote", ctaHref: "#contact" },
      { key: "plus", name: "Plus", price: "From £1,350", cta: "Get a quote", ctaHref: "#contact" },
      { key: "bespoke", name: "Bespoke", price: "From £2,450", cta: "Get a quote", ctaHref: "#contact" },
    ],
    []
  );

  const rows: Row[] = useMemo(
    () => [
      {
        label: "Best for",
        values: {
          base: "Single-location service business",
          plus: "Growing local business",
          bespoke: "Multi-location / advanced flows",
        },
      },
      {
        label: "Pages/sections",
        values: {
          base: "Up to 5",
          plus: "Up to 10",
          bespoke: "Up to 18 (or sitemap-based)",
        },
      },
      {
        label: "Design",
        values: {
          base: "Premium base, customised to your brand",
          plus: "Tailored layout system + stronger hierarchy",
          bespoke: "Bespoke design + custom sections",
        },
      },
      {
        label: "Copy support",
        values: {
          base: "Structure + light polish",
          plus: "Key sections rewritten for clarity",
          bespoke: "Full polish + messaging pass",
        },
      },
      {
        label: "Lead capture",
        hint: "Client understands this instantly. Includes booking in a simple variant.",
        values: {
          base: "1 form + basic booking request",
          plus: "Multi-step enquiry + booking integration",
          bespoke: "Advanced flows + automation-ready handoff",
        },
      },
      {
        label: "Local SEO setup",
        hint: "Setup and foundations — not “rank #1” fairy tales.",
        values: {
          base: "On-page basics + local intent guidance",
          plus: "Local schema + clearer intent mapping",
          bespoke: "Multi-location structure + templates",
        },
      },

      /* ✅ NEW ROW: Payments & deposits (under Local SEO setup) */
      {
        label: "Payments & deposits",
        hint: "Stripe setup for deposits / pay-in-full where it makes sense.",
        values: {
          base: "Not included",
          plus: "Included (Stripe setup)",
          bespoke: "Included (Stripe setup)",
        },
      },

      {
        label: "Performance",
        values: {
          base: "Fast build + image optimisation",
          plus: "Performance budget + tighter assets",
          bespoke: "Perf budget + monitoring-ready setup",
        },
      },
      {
        label: "Delivery",
        values: {
          base: "7–10 working days",
          plus: "10–15 working days",
          bespoke: "3–6 weeks (scope-based)",
        },
      },
      {
        label: "Revisions",
        values: {
          base: "1 round",
          plus: "2 rounds",
          bespoke: "3 rounds",
        },
      },
      {
        label: "Aftercare",
        values: {
          base: "14 days",
          plus: "30 days",
          bespoke: "60 days",
        },
      },
    ],
    []
  );

  return (
    <div className="k-packCard" aria-label="Packages comparison">
      <div className="k-packStage">
        <div className="k-packScroll">
          <div className="k-packMatrix" role="table" aria-label="Packages table">
            {/* Header row */}
            <div className="k-packHeadCell k-packHeadCell--label" role="columnheader">
              What you get
            </div>

            {tiers.map((t) => (
              <div key={t.key} className={cn("k-packHeadCell")} role="columnheader">
                <div className="k-packTierName">{t.name}</div>
                <div className="k-packTierPrice">{t.price}</div>

                <div className="k-packCtaWrap">
                  <QuoteCta href={t.ctaHref} label={t.cta} />
                </div>
              </div>
            ))}

            {/* Data rows */}
            {rows.map((r) => (
              <React.Fragment key={r.label}>
                <div className="k-packCell k-packCell--label k-packStickyCell" role="rowheader">
                  <span className="k-packLabelText">{r.label}</span>
                  {r.hint ? <span className="k-packCellHint">{r.hint}</span> : null}
                </div>

                {tiers.map((t) => (
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
