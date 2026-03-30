type NavTarget = {
  hash: string;
  section: HTMLElement;
};

type ScrollSpyOptions = {
  links: Array<{ href: string }>;
  topnavRoot: HTMLElement | null;
  onActiveChange: (hash: string) => void;
};

/** Document Y of element top (stable vs offsetTop / offsetParent quirks). */
function getElementDocumentY(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

function normalizeHash(rawHash: string): string {
  const hash = (rawHash || "").trim().replace(/^#/, "");
  return hash ? `#${hash}` : "";
}

function dedupeByHash(targets: NavTarget[]): NavTarget[] {
  const seen = new Set<string>();
  const unique: NavTarget[] = [];
  for (const target of targets) {
    if (seen.has(target.hash)) continue;
    seen.add(target.hash);
    unique.push(target);
  }
  return unique;
}

function collectTargets(links: Array<{ href: string }>): NavTarget[] {
  const targets = links
    .map((link) => normalizeHash(link.href.split("#")[1] || ""))
    .filter(Boolean)
    .map((hash) => {
      const section = document.getElementById(hash.replace(/^#/, ""));
      if (!section) return null;
      return { hash, section };
    })
    .filter(Boolean) as NavTarget[];

  return dedupeByHash(targets).sort(
    (a, b) => getElementDocumentY(a.section) - getElementDocumentY(b.section)
  );
}

/**
 * Probe line just below the sticky nav, aligned with scroll-padding intent:
 * nav height + small breathing room (matches visual "section entered").
 */
function getScrollProbeLine(topnavRoot: HTMLElement | null): number {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const navHeight = topnavRoot?.getBoundingClientRect().height ?? 0;
  return scrollY + navHeight + 10;
}

function pickActiveHash(targets: NavTarget[], topnavRoot: HTMLElement | null): string {
  if (targets.length === 0) return "";

  const probeLine = getScrollProbeLine(topnavRoot);
  const firstTop = getElementDocumentY(targets[0].section);

  if (probeLine < firstTop) {
    return "";
  }

  const contactEl = document.getElementById("contact");
  if (contactEl && probeLine >= getElementDocumentY(contactEl)) {
    return "";
  }

  for (let i = 0; i < targets.length; i += 1) {
    const current = targets[i];
    const next = targets[i + 1];
    const start = getElementDocumentY(current.section);
    const end = next ? getElementDocumentY(next.section) : Number.POSITIVE_INFINITY;
    if (probeLine >= start && probeLine < end) {
      return current.hash;
    }
  }

  return targets[targets.length - 1]?.hash ?? "";
}

export function createActiveSectionScrollSpy({
  links,
  topnavRoot,
  onActiveChange,
}: ScrollSpyOptions) {
  const targets = collectTargets(links);
  let currentHash = "";
  let rafId = 0;

  const evaluate = () => {
    rafId = 0;
    const next = pickActiveHash(targets, topnavRoot);
    if (next === currentHash) return;
    currentHash = next;
    onActiveChange(next);
  };

  const scheduleEvaluate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(evaluate);
  };

  const onScroll = () => scheduleEvaluate();
  const onResize = () => scheduleEvaluate();
  const onHashChange = () => scheduleEvaluate();

  const start = () => {
    if (targets.length === 0) return;
    scheduleEvaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("load", scheduleEvaluate);
  };

  const stop = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("load", scheduleEvaluate);
  };

  return {
    start,
    stop,
    evaluateNow: scheduleEvaluate,
    getCurrentHash: () => currentHash,
  };
}
