/** Max length for lead attribution path (email + storage). */
const MAX_LEAD_SOURCE_LEN = 120;

/**
 * True for internal site paths safe to store (no scheme, no traversal).
 * Allows nested routes e.g. /work/barber-website-system.
 */
export function isValidLeadSourcePath(s: string): boolean {
  const t = (s || "").trim();
  if (!t || t.length > MAX_LEAD_SOURCE_LEN) return false;
  if (!t.startsWith("/")) return false;
  if (t.includes("..") || t.includes("\\") || t.includes("<") || t.includes(">")) return false;
  if (t.includes("//")) return false;
  return /^\/[a-zA-Z0-9/_-]*$/.test(t);
}

function canonicalLeadPath(s: string): string {
  const t = s.trim();
  if (t === "/") return "/";
  return t.replace(/\/+$/, "") || "/";
}

/** Normalise `_source` from JSON for API + email (invalid → "—"). */
export function normalizeLeadSourceForApi(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return "/";
  if (!isValidLeadSourcePath(s)) return "—";
  return canonicalLeadPath(s);
}

/**
 * Read `source` or `_source` from a query string (e.g. location.search).
 * Returns null if missing or invalid.
 */
export function parseLeadSourceFromSearch(search: string): string | null {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const raw = params.get("source") ?? params.get("_source");
  if (raw == null || raw === "") return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  if (!isValidLeadSourcePath(decoded)) return null;
  return canonicalLeadPath(decoded);
}

/**
 * Href to contact: home and packages keep in-page `#contact`; other routes use `/contact/?source=` (same form, no jump to home).
 */
export function homeContactHrefFromPagePath(pagePath: string): string {
  const p = (pagePath || "/").replace(/\/+$/, "") || "/";
  if (p === "/packages") return "/packages/#contact";
  if (p === "/") return "/#contact";
  if (p === "/contact") return "/contact/#contact";
  return `/contact/?source=${encodeURIComponent(p)}#contact`;
}
