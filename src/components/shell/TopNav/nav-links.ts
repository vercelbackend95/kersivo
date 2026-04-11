export type NavLink = {
  href: string;
  label: string;
  description: string;
};

/** Normalised pathname: no trailing slash except root is "/". */
export function normalisePathname(pathname: string): string {
  const p = (pathname || "/").trim();
  return p.replace(/\/+$/, "") || "/";
}

/**
 * True when this nav href is the current page. `/work/*` child routes highlight "Product Lab".
 */
export function isNavLinkActive(href: string, pathname: string): boolean {
  const hasHash = href.includes("#");
  if (hasHash) return false;
  const linkPath = normalisePathname(href.split("#")[0] || "/");
  const path = normalisePathname(pathname);
  if (linkPath === path) return true;
  if (linkPath === "/work" && path.startsWith("/work/")) return true;
  return false;
}

// Sales-focused IA for the landing flow:
// orient -> proof -> process -> objections.
export const NAV_LINKS: NavLink[] = [
  {
    href: "/#services",
    label: "Services",
    description: "What we can build for your business",
  },
  {
    href: "/work/",
    label: "Product Lab",
    description: "Client projects and studio products",
  },
  {
    href: "/packages/",
    label: "Packages",
    description: "Scope, pricing, and delivery",
  },
  {
    href: "/#process-overview",
    label: "Process",
    description: "How we move from brief to launch",
  },
  {
    href: "/studio/",
    label: "Studio",
    description: "The person and principles behind Kersivo",
  },
  {
    href: "/#faq",
    label: "FAQ",
    description: "Answers before you enquire",
  },
];
