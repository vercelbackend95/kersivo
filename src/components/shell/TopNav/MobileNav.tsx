import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useDragControls,
} from "framer-motion";
import "./mobile-nav.css";

type LinkItem = { href: string; label: string };

const LINKS: LinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/work/", label: "Work" },
  { href: "/services/", label: "Services" },
  { href: "/process/", label: "Process" },
  { href: "/packages/", label: "Packages" },
  { href: "/contact/", label: "Contact" },
];

function normPath(p: string) {
  const s = (p || "/").trim();
  const base = s.split("#")[0];
  const noTrail = base.replace(/\/+$/, "");
  return noTrail === "" ? "/" : noTrail;
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
  const dragControls = useDragControls();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("/");
  const [sweepOn, setSweepOn] = useState(false);
  const [vh, setVh] = useState(900);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // Burger in TopNav.astro
  const burgerId = "kNavToggle";

  const setBurgerA11y = (isOpen: boolean) => {
    const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
    if (!btn) return;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  const lockScroll = (isLocked: boolean) => {
    document.documentElement.classList.toggle("k-navOpen", isLocked);
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
    const update = () => setVh(Math.max(520, window.innerHeight || 900));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const here = normPath(window.location.pathname || "/");
      const best =
        LINKS.find((l) => normPath(l.href) === here)?.href ||
        (here === "/" ? "/" : "/");
      setActiveHref(best);
    } catch {
      setActiveHref("/");
    }
  }, [mounted]);

  // Wire burger click
  useEffect(() => {
    if (!mounted) return;
    const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
    if (!btn) return;

    const onClick = () => (open ? doClose() : doOpen());
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, open]);

  // A11y + scroll lock + focus + sweep
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

    if (open && !reduced) {
      setSweepOn(false);
      const t1 = window.setTimeout(() => setSweepOn(true), 340);
      const t2 = window.setTimeout(() => setSweepOn(false), 980);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    return () => {
      if (!open) lockScroll(false);
    };
  }, [open, mounted, reduced]);

  // ESC + focus trap
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

  const sheetTransition = useMemo(() => {
    if (reduced) return { duration: 0.18 };
    return { type: "spring", stiffness: 560, damping: 48, mass: 0.9 };
  }, [reduced]);

  const backdropTransition = useMemo(() => {
    if (reduced) return { duration: 0.12 };
    return { duration: 0.18, ease: [0.22, 0.9, 0.22, 1] };
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

          <motion.div
            className="k-mobileNav__sheet"
            data-sweep={sweepOn ? "1" : "0"}
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            initial={{ y: -vh, opacity: 0.98, scaleY: reduced ? 1 : 0.985 }}
            animate={{ y: 0, opacity: 1, scaleY: 1 }}
            exit={{ y: -vh, opacity: 0.98, scaleY: reduced ? 1 : 0.985 }}
            transition={sheetTransition}
            drag={reduced ? false : "y"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: -Math.max(240, vh * 0.35), bottom: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              const shouldClose = info.offset.y < -70 || info.velocity.y < -700;
              if (shouldClose) doClose();
            }}
          >
            {/* Close (pure icon, no border, no ring) */}
            <button
              className="k-mobileNav__close"
              type="button"
              aria-label="Close menu"
              onClick={doClose}
              onTouchEnd={doClose}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* menu-close.svg (inline) */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {/* Layout: nav scrolls, bottom bar always visible */}
            <div className="k-mobileNav__content">
              <nav className="k-mobileNav__nav" aria-label="Mobile">
                <motion.ul
                  className="k-mobileNav__list"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: reduced ? 0 : 0.05,
                        delayChildren: reduced ? 0 : 0.05,
                      },
                    },
                  }}
                >
                  {LINKS.map((l) => {
                    const isActive = normPath(l.href) === normPath(activeHref);
                    return (
                      <motion.li
                        key={l.href}
                        className="k-mobileNav__item"
                        data-active={isActive ? "1" : "0"}
                        variants={{
                          hidden: { opacity: 0, y: -6 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={
                          reduced
                            ? { duration: 0.01 }
                            : { duration: 0.22, ease: [0.22, 0.9, 0.22, 1] }
                        }
                      >
                        <motion.a
                          className="k-mobileNav__row"
                          href={l.href}
                          onClick={doClose}
                          aria-current={isActive ? "page" : undefined}
                          whileTap={reduced ? undefined : { scale: 0.985 }}
                        >
                          <span className="k-mobileNav__label">{l.label}</span>
                        </motion.a>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              <div className="k-mobileNav__bottom">
                <div className="k-mobileNav__status">
                  <div className="k-mobileNav__chip" aria-label="Status">
                    <span className="k-mobileNav__dot" aria-hidden="true" />
                    Now booking: <strong>2 project slots</strong>
                  </div>
                </div>

                <div className="k-mobileNav__ctaWrap">
                  <a
                    className="k-btn k-btn--primary k-mobileNav__ctaBtn"
                    href="/contact/#contact"
                    data-magnetic="false"
                    onClick={doClose}
                  >
                    <span className="k-btn__label">Get a quote</span>
                    <span className="k-btn__shine" aria-hidden="true"></span>
                    <span className="k-btn__arrow" aria-hidden="true">→</span>
                  </a>
                </div>

                <button
                  className="k-mobileNav__handle"
                  type="button"
                  aria-label="Drag to close"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <span className="k-mobileNav__handleBar" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Critical: portal to body so fullscreen is real fullscreen (iOS-safe)
  return createPortal(ui, document.body);
}
