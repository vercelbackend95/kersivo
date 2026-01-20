// /public/scripts/reviews.js
function initOne(root) {
  if (!root) return;
  if (root.dataset.reviewsInit === "1") return;
  root.dataset.reviewsInit = "1";

  const track = root.querySelector("[data-track]");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll("[data-slide]"));
  if (!slides.length) return;

  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const curEl = root.querySelector("[data-cur]");
  const totalEl = root.querySelector("[data-total]");
  if (totalEl) totalEl.textContent = String(slides.length).padStart(2, "0");

  const mod = (n, m) => ((n % m) + m) % m;
  let index = 0;

  const syncUI = () => {
    slides.forEach((s, i) => (s.tabIndex = i === index ? 0 : -1));
    if (curEl) curEl.textContent = String(index + 1).padStart(2, "0");
  };

  const go = (next) => {
    index = mod(next, slides.length);
    const left = slides[index].offsetLeft;

    // Hard-set (some snap configs fight smooth scroll)
    track.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    syncUI();
  };

  root.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target : null;
    if (!el) return;

    const prev = el.closest("[data-prev]");
    const next = el.closest("[data-next]");
    if (!prev && !next) return;

    e.preventDefault();
    go(index + (next ? 1 : -1));
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  // Keep counter in sync on swipe
  let raf = 0;
  const updateFromScroll = () => {
    raf = 0;
    const x = track.scrollLeft;

    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const d = Math.abs(slides[i].offsetLeft - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best !== index) {
      index = best;
      syncUI();
    }
  };

  track.addEventListener(
    "scroll",
    () => {
      if (raf) return;
      raf = requestAnimationFrame(updateFromScroll);
    },
    { passive: true }
  );

  syncUI();

  // Debug proof-of-life:
  console.log("[reviews] init OK", root.getAttribute("data-build") || "");
}

// Astro view transitions compatible:
function initAll() {
  document.querySelectorAll("#reviews.k-reviews[data-reviews]").forEach(initOne);
}

document.addEventListener("astro:page-load", initAll);
if (document.readyState !== "loading") initAll();
else document.addEventListener("DOMContentLoaded", initAll, { once: true });
