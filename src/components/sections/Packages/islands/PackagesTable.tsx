import React, { useMemo } from "react";
import { CTA_PRIMARY_CONTACT } from "../../../../site/cta";

type TierKey = "base" | "plus" | "bespoke";

type Row = {
  label: string;
  hint?: string;
  group: "Strategy & Fit" | "Build & UX" | "Delivery & Support";
  values: Record<TierKey, string>;
};

type Tier = {
  key: TierKey;
  name: string;
  price: string;
  note: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
};

function cn(...x: Array<string | false | undefined | null>) {
  return x.filter(Boolean).join(" ");
}

function QuoteCta({ href, label, compact }: { href: string; label: string; compact?: boolean }) {
  return (
    <a
      className={cn("k-btn k-btn--primary k-packCta", compact && "k-packCta--compact")}
      href={href}
    >
      <span className="k-btn__label">{label}</span>
      <span className="k-btn__shine" aria-hidden="true" />
      <span className="k-btn__arrow" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 7H11M8 4L11 7L8 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

type PackagesTableProps = {
  /** Section title is h1 on /packages → groups should be h2; on landing, section is h2 → groups as h3. */
  groupHeadingLevel?: 2 | 3;
  /** Contact form anchor; on /packages use same-path hash so tier context is not lost. */
  contactCtaHref?: string;
};

export default function PackagesTable({
  groupHeadingLevel = 3,
  contactCtaHref = "/#contact",
}: PackagesTableProps) {
  const GroupHeadingTag: "h2" | "h3" = groupHeadingLevel === 2 ? "h2" : "h3";
  const tiers: Tier[] = useMemo(
    () => [
      {
        key: "base",
        name: "Base",
        price: "From £750",
        note: "Professional starter package",
        cta: CTA_PRIMARY_CONTACT,
        ctaHref: contactCtaHref,
      },
      {
        key: "plus",
        name: "Plus",
        price: "From £1,350",
        note: "Most chosen for growth",
        cta: CTA_PRIMARY_CONTACT,
        ctaHref: contactCtaHref,
        featured: true,
      },
      {
        key: "bespoke",
        name: "Bespoke",
        price: "From £2,450",
        note: "Tailored for advanced scope",
        cta: CTA_PRIMARY_CONTACT,
        ctaHref: contactCtaHref,
      },
    ],
    [contactCtaHref]
  );

  const rows: Row[] = useMemo(
    () => [
      {
        label: "Best for",
        group: "Strategy & Fit",
        values: {
          base: "Single-location service business",
          plus: "Growing local business",
          bespoke: "Multi-location / advanced flows",
        },
      },
      {
        label: "Pages/sections",
        group: "Strategy & Fit",
        values: {
          base: "Up to 5",
          plus: "Up to 10",
          bespoke: "Up to 18 (or sitemap-based)",
        },
      },
      {
        label: "Design",
        group: "Build & UX",
        values: {
          base: "Premium base, customised to your brand",
          plus: "Tailored layout system + stronger hierarchy",
          bespoke: "Bespoke design + custom sections",
        },
      },
      {
        label: "Copy support",
        group: "Build & UX",
        values: {
          base: "Structure + light polish",
          plus: "Key sections rewritten for clarity",
          bespoke: "Full polish + messaging pass",
        },
      },
      {
        label: "Lead capture",
        hint: "Client understands this instantly. Includes booking in a simple variant.",
        group: "Build & UX",
        values: {
          base: "1 form + basic booking request",
          plus: "Multi-step enquiry + booking integration",
          bespoke: "Advanced flows + automation-ready handoff",
        },
      },
      {
        label: "Local SEO setup",
        hint: "Setup and foundations — not “rank #1” fairy tales.",
        group: "Build & UX",
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
        group: "Build & UX",
        values: {
          base: "Not included",
          plus: "Included (Stripe setup)",
          bespoke: "Included (Stripe setup)",
        },
      },

      {
        label: "Performance",
        group: "Build & UX",
        values: {
          base: "Fast build + image optimisation",
          plus: "Performance budget + tighter assets",
          bespoke: "Perf budget + monitoring-ready setup",
        },
      },
      {
        label: "Delivery",
        group: "Delivery & Support",
        values: {
          base: "7–10 working days",
          plus: "10–15 working days",
          bespoke: "3–6 weeks (scope-based)",
        },
      },
      {
        label: "Revisions",
        group: "Delivery & Support",
        values: {
          base: "1 round",
          plus: "2 rounds",
          bespoke: "3 rounds",
        },
      },
      {
        label: "Aftercare",
        group: "Delivery & Support",
        values: {
          base: "14 days",
          plus: "30 days",
          bespoke: "60 days",
        },
      },
    ],
    []
  );

  const groups = useMemo(
    () => ["Strategy & Fit", "Build & UX", "Delivery & Support"] as const,
    []
  );

  return (
    <div className="k-packCard" aria-label="Packages comparison">
      {/* Wide screens: matrix */}
      <div className="k-packStage k-packStage--matrix">
        <p className="k-packMatrixHint" aria-hidden="true">
          Scroll to compare all tiers
        </p>
        <div
          className="k-packScroll"
          role="region"
          aria-label="Package comparison table. Scroll horizontally if the full table is not visible."
          tabIndex={0}
        >
          <div className="k-packMatrix" role="table" aria-label="Packages comparison table">
            <div className="k-packHeadCell k-packHeadCell--label" role="columnheader">
              What you get
            </div>

            {tiers.map((t) => (
              <div
                key={t.key}
                className={cn(
                  "k-packHeadCell",
                  t.key === "bespoke" && "k-packColEnd",
                  t.featured && "k-packHeadCell--featured"
                )}
                role="columnheader"
              >
                {t.featured ? <div className="k-packBadge">Most chosen</div> : null}
                <div className="k-packTierName">{t.name}</div>
                <div className="k-packTierPrice">{t.price}</div>
                <div className="k-packTierNote">{t.note}</div>

                <div className="k-packCtaWrap">
                  <QuoteCta href={t.ctaHref} label={t.cta} />
                </div>
              </div>
            ))}

            {groups.map((group, groupIndex) => (
              <React.Fragment key={group}>
                <div
                  className={cn("k-packGroupBand", groupIndex === 0 && "k-packGroupBand--first")}
                  role="presentation"
                >
                  <GroupHeadingTag className="k-packGroupBand__title">
                    <span className="k-packGroupBand__rule" aria-hidden="true" />
                    <span className="k-packGroupBand__label">{group}</span>
                    <span className="k-packGroupBand__rule" aria-hidden="true" />
                  </GroupHeadingTag>
                </div>
                {rows
                  .filter((r) => r.group === group)
                  .map((r) => (
                    <React.Fragment key={r.label}>
                      <div className="k-packCell k-packCell--label k-packStickyCell" role="rowheader">
                        <span className="k-packLabelText">{r.label}</span>
                        {r.hint ? <span className="k-packCellHint">{r.hint}</span> : null}
                      </div>

                      {tiers.map((t) => (
                        <div
                          key={t.key}
                          className={cn(
                            "k-packCell",
                            t.key === "bespoke" && "k-packColEnd",
                            t.featured && "k-packCell--featured"
                          )}
                          role="cell"
                        >
                          {r.values[t.key]}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Narrow screens: one card per tier */}
      <div className="k-packStage k-packStage--cards" aria-label="Packages by tier">
        {tiers.map((t) => (
          <article
            key={t.key}
            className={cn("k-packMobCard", t.featured && "k-packMobCard--featured")}
            aria-label={`${t.name} package`}
          >
            <header className="k-packMobCard__head">
              {t.featured ? (
                <div className="k-packBadge k-packBadge--mob">Most chosen</div>
              ) : (
                <div className="k-packMobCard__spacerBadge" aria-hidden="true" />
              )}
              <h3 className="k-packMobCard__title">{t.name}</h3>
              <p className="k-packMobCard__price">{t.price}</p>
              <p className="k-packMobCard__note">{t.note}</p>
              <div className="k-packMobCard__cta">
                <QuoteCta href={t.ctaHref} label={t.cta} compact />
              </div>
            </header>

            <div className="k-packMobCard__body">
              {groups.map((group) => (
                <section key={group} className="k-packMobCard__group" aria-label={group}>
                  <h4 className="k-packMobCard__groupTitle">{group}</h4>
                  <dl className="k-packMobDl">
                    {rows
                      .filter((r) => r.group === group)
                      .map((r) => (
                        <div key={r.label} className="k-packMobDl__row">
                          <dt className="k-packMobDl__dt">
                            {r.label}
                            {r.hint ? <span className="k-packMobDl__hint">{r.hint}</span> : null}
                          </dt>
                          <dd className="k-packMobDl__dd">{r.values[t.key]}</dd>
                        </div>
                      ))}
                  </dl>
                </section>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
