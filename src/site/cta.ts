/**
 * Global CTA copy — keep labels identical everywhere so analytics and behaviour
 * learning see one primary intent (contact / quote) and one portfolio path.
 */
export const CTA_PRIMARY_CONTACT = "Get a quote" as const;
export const CTA_SECONDARY_WORK = "View work" as const;
export const CTA_SECONDARY_PACKAGES = "Packages & pricing" as const;

/** Same rules as `CtaButton.astro` — used for `data-cta` / analytics consistency. */
export function isContactCtaHref(href: string): boolean {
  const h = (href || "").trim();
  if (h === "#contact" || h.endsWith("/#contact")) return true;
  if (/[?&](?:source|_source)=/.test(h) && h.includes("#contact")) return true;
  try {
    const u = new URL(h, "https://kersivo.co.uk");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (path === "/contact") return true;
  } catch {
    return false;
  }
  return false;
}
