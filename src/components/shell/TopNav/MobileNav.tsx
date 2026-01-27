import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
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

  const panelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // tie into existing burger button in TopNav.astro
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

  // mount flag to avoid SSR mismatch vibes
  useEffect(() => {
    setMounted(true);
  }, []);

  // burger click wiring
  useEffect(() => {
    if (!mounted) return;

    const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
    if (!btn) return;

    const onClick = () => {
      open ? doClose() : doOpen();
    };

    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, open]);

  // a11y + scroll lock + focus on open/close
  useEffect(() => {
    if (!mounted) return;

    setBurgerA11y(open);
    lockScroll(open);

    if (open) {
      // focus first focusable inside sheet
      requestAnimationFrame(() => {
        const focusables = getFocusable(sheetRef.current);
        (focusables[0] ?? sheetRef.current)?.focus?.();
      });
    } else {
      // restore focus to burger
      const btn = document.getElementById(burgerId) as HTMLButtonElement | null;
      (btn ?? lastActiveElRef.current)?.focus?.();
    }

    return () => {
      // safety unlock
      if (!open) lockScroll(false);
    };
  }, [open, mounted]);

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
    // “soft drop, hard stop” → szybki sprężynowy zjazd, bez galarety
    return { type: "spring", stiffness: 520, damping: 46, mass: 0.9 };
  }, [reduced]);

  const backdropTransition = useMemo(() => {
    if (reduced) return { duration: 0.12 };
    return { duration: 0.18, ease: [0.22, 0.9, 0.22, 1] };
  }, [reduced]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="sync">
      {open && (
        <motion.div
          className="k-mobileNav"
          ref={panelRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          {/* Backdrop */}
          <motion.button
            className="k-mobileNav__backdrop"
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={doClose}
          />

          {/* Sheet */}
          <motion.div
            className="k-mobileNav__sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            initial={{
              y: "-100%",
              opacity: 0.98,
              scaleY: reduced ? 1 : 0.985,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scaleY: 1,
            }}
            exit={{
              y: "-100%",
              opacity: 0.98,
              scaleY: reduced ? 1 : 0.985,
            }}
            transition={sheetTransition}
            drag={reduced ? false : "y"}
            dragConstraints={{ top: -140, bottom: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              // swipe up to close (kulturalnie)
              const shouldClose = info.offset.y < -70 || info.velocity.y < -700;
              if (shouldClose) doClose();
            }}
          >
            <div className="k-mobileNav__top">
              <div className="k-mobileNav__chip" aria-label="Status">
                <span className="k-mobileNav__dot" aria-hidden="true" />
                Now booking: <strong>2 project slots</strong>
              </div>

              <a className="k-mobileNav__cta" href="/contact/#contact" onClick={doClose}>
                Get a quote <span aria-hidden="true">→</span>
              </a>
            </div>

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
                      staggerChildren: reduced ? 0 : 0.045,
                      delayChildren: reduced ? 0 : 0.03,
                    },
                  },
                }}
              >
                {LINKS.map((l) => (
                  <motion.li
                    key={l.href}
                    className="k-mobileNav__item"
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
                    <a className="k-mobileNav__link" href={l.href} onClick={doClose}>
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            <div className="k-mobileNav__footer">
              <p className="k-mobileNav__philo">
                Order. Tempo. Certainty.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
