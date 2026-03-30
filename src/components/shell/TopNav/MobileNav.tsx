import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./mobile-nav.css";
import { NAV_LINKS } from "./nav-links";

function normPath(p: string) {
  const s = (p || "/").trim();
  const base = s.split("#")[0];
  const noTrail = base.replace(/\/+$/, "") || "/";
  return noTrail;
}

function normHash(h: string) {
  const raw = (h || "").trim();
  if (!raw) return "";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

export default function MobileNav() {
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("");

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);

  const burgerId = "kNavToggle";

  const setBurgerA11y = (isOpen: boolean) => {
    const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
    if (!btn) return;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  const lockScroll = (isLocked: boolean) => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.toggle("k-navOpen", isLocked);

    if (isLocked) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      return;
    }

    const top = body.style.top || "0";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, Math.abs(parseInt(top, 10)) || scrollYRef.current || 0);
  };

  const doOpen = () => {
    if (open) return;
    lastActiveElRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  };

  const doClose = () => {
    if (!open) return;
    setOpen(false);
  };

  useEffect(() => {
    setMounted(true);
    return undefined;
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const onHome = normPath(window.location.pathname) === "/";
      const raw = (window.location.hash || "").replace(/^#/, "").trim();
      setActiveHash(onHome && raw ? normHash(raw) : "");
    } catch {
      setActiveHash("");
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (normPath(window.location.pathname) !== "/") return;

    const syncFromLocation = () => {
      const raw = (window.location.hash || "").replace(/^#/, "").trim();
      setActiveHash(raw ? normHash(raw) : "");
    };

    const onScrollSpy = (event: Event) => {
      const customEvent = event as CustomEvent<{ hash?: string }>;
      const next = (customEvent.detail?.hash ?? "").trim();
      if (!next) {
        setActiveHash("");
        return;
      }
      setActiveHash(normHash(next));
    };

    window.addEventListener("kersivo:active-section-change", onScrollSpy as EventListener);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("kersivo:active-section-change", onScrollSpy as EventListener);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
    if (!btn) return;

    const onClick = () => (open ? doClose() : doOpen());
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted) return;

    setBurgerA11y(open);
    lockScroll(open);

    if (open) {
      requestAnimationFrame(() => {
        const focusables = getFocusable(sheetRef.current);
        (focusables[0] ?? sheetRef.current)?.focus?.();
      });
    } else {
      const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
      (btn ?? lastActiveElRef.current)?.focus?.();
    }

    return () => {
      if (!open) lockScroll(false);
    };
  }, [open, mounted, reduced]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        doClose();
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusable(sheetRef.current);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const panelTransition = useMemo(() => {
    if (reduced) return { duration: 0.15 };
    return { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };
  }, [reduced]);

  const backdropTransition = useMemo(() => {
    if (reduced) return { duration: 0.12 };
    return { duration: 0.24, ease: [0.22, 0.9, 0.22, 1] as const };
  }, [reduced]);

  if (!mounted) return null;

  const ui = (
    <AnimatePresence mode="sync">
      {open && (
        <motion.div
          className="k-mobileNav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          {/* Backdrop scrim (tap to close) */}
          <motion.button
            className="k-mobileNav__backdrop"
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={doClose}
            onTouchEnd={doClose}
          />

          {/* Panel */}
          <motion.div
            className="k-mobileNav__sheet"
            id="kMobileNavDialog"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            initial={{
              opacity: 0,
              y: reduced ? 0 : -24,
              scale: reduced ? 1 : 0.97,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -10,
              scale: reduced ? 1 : 0.99,
            }}
            transition={panelTransition}
          >
            {/* ─── Header: brand + close ─── */}
            <div className="k-mn__header">
              <a
                href="/"
                className="k-mn__brand"
                onClick={doClose}
                aria-label="Kersivo home"
              >
                <span className="k-mn__mark" aria-hidden="true">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3.2 13.1 7.6 17.8 8.5 14.2 10.5 12 14.2 9.8 10.5 6.2 8.5 10.9 7.6 12 3.2Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="k-mn__name">Kersivo</span>
              </a>

              <button
                className="k-mn__close"
                type="button"
                aria-label="Close menu"
                onClick={doClose}
                onTouchEnd={doClose}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12.5 3.5 3.5 12.5M3.5 3.5l9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* ─── Navigation ─── */}
            <div className="k-mn__body">
              <nav className="k-mn__nav" aria-label="Mobile navigation">
                <motion.ul
                  className="k-mn__list"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: reduced ? 0 : 0.048,
                        delayChildren: reduced ? 0 : 0.08,
                      },
                    },
                  }}
                >
                  {NAV_LINKS.map((l, i) => {
                    const sectionHash = normHash(l.href.split("#")[1] || "");
                    const pathHere = normPath(window.location.pathname);
                    const linkPath = normPath(l.href);
                    const isActive = sectionHash
                      ? pathHere === "/" && sectionHash === activeHash
                      : linkPath === pathHere;
                    return (
                      <motion.li
                        key={l.href}
                        className="k-mn__item"
                        data-active={isActive ? "1" : "0"}
                        variants={{
                          hidden: { opacity: 0, y: reduced ? 0 : 14 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={
                          reduced
                            ? { duration: 0.01 }
                            : { duration: 0.26, ease: [0.22, 0.9, 0.22, 1] }
                        }
                      >
                        <motion.a
                          className="k-mn__row"
                          href={l.href}
                          onClick={() => {
                            if (sectionHash) setActiveHash(sectionHash);
                            doClose();
                          }}
                          aria-current={isActive ? "page" : undefined}
                          whileTap={reduced ? undefined : { opacity: 0.82 }}
                        >
                          <span className="k-mn__num" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          <span className="k-mn__copy">
                            <span className="k-mn__label">{l.label}</span>
                            <span className="k-mn__meta">{l.description}</span>
                          </span>

                          <span className="k-mn__arrow" aria-hidden="true">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 8h10M9 4l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </motion.a>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>
            </div>

            {/* ─── Footer CTA ─── */}
            <div className="k-mn__foot">
              <p className="k-mn__footLine">Start your project</p>
              <a
                href="/#contact"
                className="k-mn__quote"
                onClick={doClose}
              >
                <span className="k-mn__quoteText">Get a quote</span>
                <span className="k-mn__quoteArrow" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}
