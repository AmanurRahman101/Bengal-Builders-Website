/**
 * Bengal Builders & Construction Ltd. (BBCL)
 * Shared UI interaction layer — vanilla JS, no dependencies
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
   * Sticky nav glassmorphism
   * ------------------------------------------------------------------------ */
  function initNav() {
    const nav = document.getElementById("site-nav");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (nav) {
      const onScroll = () => {
        if (window.scrollY > 24) {
          nav.classList.add("nav-scrolled");
        } else {
          nav.classList.remove("nav-scrolled");
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        const open = mobileMenu.classList.toggle("hidden") === false;
        menuBtn.setAttribute("aria-expanded", String(open));
      });

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileMenu.classList.add("hidden");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Highlight active nav link
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("text-amber-400");
        link.classList.remove("text-steel");
      }
    });
  }

  /* --------------------------------------------------------------------------
   * Live number counting animations (Equipment Tracker)
   * ------------------------------------------------------------------------ */
  function animateCount(el, target, duration) {
    const start = performance.now();
    const from = 0;
    const isFloat = !Number.isInteger(target);

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      el.textContent = isFloat ? value.toFixed(0) : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = isFloat
        ? target.toLocaleString()
        : Math.round(target).toLocaleString();
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    const section = document.getElementById("equipment-tracker");
    if (!section) return;

    const counters = section.querySelectorAll("[data-count]");
    let played = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played) {
            played = true;
            counters.forEach((el) => {
              const target = Number(el.getAttribute("data-count"));
              const duration = Number(el.getAttribute("data-duration") || 1600);
              animateCount(el, target, duration);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  }

  /* --------------------------------------------------------------------------
   * Toast notifications
   * ------------------------------------------------------------------------ */
  function ensureToastHost() {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className =
        "fixed bottom-6 right-6 z-[80] flex flex-col gap-3 pointer-events-none";
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }

  function showToast(message, detail) {
    const host = ensureToastHost();
    const toast = document.createElement("div");
    toast.className =
      "pointer-events-auto max-w-sm w-full border border-amber-500/40 bg-[#1A1A1A]/95 backdrop-blur-md px-5 py-4 shadow-xl translate-x-8 opacity-0 transition-all duration-300";
    toast.innerHTML =
      '<p class="text-sm font-semibold tracking-wide text-white">' +
      message +
      "</p>" +
      (detail
        ? '<p class="mt-1 text-xs text-steel leading-relaxed">' + detail + "</p>"
        : "");
    host.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-8", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-x-8", "opacity-0");
      setTimeout(() => toast.remove(), 320);
    }, 3200);
  }

  /* --------------------------------------------------------------------------
   * Legal Vault modals (about.html)
   * ------------------------------------------------------------------------ */
  function initModals() {
    const modal = document.getElementById("legal-modal");
    if (!modal) return;

    const titleEl = document.getElementById("legal-modal-title");
    const metaEl = document.getElementById("legal-modal-meta");
    const bodyEl = document.getElementById("legal-modal-body");
    const closeBtn = document.getElementById("legal-modal-close");
    const backdrop = document.getElementById("legal-modal-backdrop");

    function openModal(card) {
      titleEl.textContent = card.getAttribute("data-title") || "";
      metaEl.textContent = card.getAttribute("data-meta") || "";
      bodyEl.textContent = card.getAttribute("data-body") || "";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-legal-card]").forEach((card) => {
      card.addEventListener("click", () => openModal(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });
  }

  /* --------------------------------------------------------------------------
   * Materials catalogue — filter, search, quote counters
   * ------------------------------------------------------------------------ */
  function initMaterials() {
    const grid = document.getElementById("materials-grid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll("[data-material]"));
    const searchInput = document.getElementById("material-search");
    const tabs = document.querySelectorAll("[data-material-tab]");
    let activeType = "all";

    function applyFilter() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      cards.forEach((card) => {
        const type = card.getAttribute("data-type");
        const name = (card.getAttribute("data-name") || "").toLowerCase();
        const desc = (card.getAttribute("data-desc") || "").toLowerCase();
        const typeMatch = activeType === "all" || type === activeType;
        const textMatch = !query || name.includes(query) || desc.includes(query);
        card.classList.toggle("hidden", !(typeMatch && textMatch));
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeType = tab.getAttribute("data-material-tab");
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle("bg-amber-500", on);
          t.classList.toggle("text-obsidian", on);
          t.classList.toggle("text-steel", !on);
          t.classList.toggle("border-amber-500", on);
          t.classList.toggle("border-white/10", !on);
          t.setAttribute("aria-selected", String(on));
        });
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    cards.forEach((card) => {
      const minus = card.querySelector("[data-qty-minus]");
      const plus = card.querySelector("[data-qty-plus]");
      const qtyEl = card.querySelector("[data-qty]");
      const addBtn = card.querySelector("[data-add-quote]");
      let qty = 1;

      function syncQty() {
        qtyEl.textContent = String(qty);
      }

      minus?.addEventListener("click", () => {
        qty = Math.max(1, qty - 1);
        syncQty();
      });

      plus?.addEventListener("click", () => {
        qty = Math.min(999, qty + 1);
        syncQty();
      });

      addBtn?.addEventListener("click", () => {
        const name = card.getAttribute("data-name");
        const unit = card.getAttribute("data-unit") || "MT";
        const rate = Number(card.getAttribute("data-rate") || 0);
        const volume = qty;
        const estimate = (volume * rate).toLocaleString("en-BD");
        showToast(
          "Added to Quote Request",
          name +
            " — " +
            volume +
            " " +
            unit +
            " · Est. volume calc: BDT " +
            estimate +
            " (mock)"
        );
      });
    });
  }

  /* --------------------------------------------------------------------------
   * Projects page tab switching
   * ------------------------------------------------------------------------ */
  function initProjectTabs() {
    const tabBtns = document.querySelectorAll("[data-project-tab]");
    const panels = document.querySelectorAll("[data-project-panel]");
    if (!tabBtns.length || !panels.length) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-project-tab");

        tabBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("bg-amber-500", on);
          b.classList.toggle("text-obsidian", on);
          b.classList.toggle("text-steel", !on);
          b.classList.toggle("border-amber-500", on);
          b.classList.toggle("border-white/10", !on);
          b.setAttribute("aria-selected", String(on));
        });

        panels.forEach((panel) => {
          const match = panel.getAttribute("data-project-panel") === target;
          panel.classList.toggle("hidden", !match);
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
   * Value matrix micro-interaction (homepage)
   * ------------------------------------------------------------------------ */
  function initValueCards() {
    document.querySelectorAll("[data-value-card]").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.classList.add("border-amber-500/50");
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("border-amber-500/50");
      });
    });
  }

  /* --------------------------------------------------------------------------
   * Activity discipline hover accents
   * ------------------------------------------------------------------------ */
  function initActivityCards() {
    document.querySelectorAll("[data-activity]").forEach((card) => {
      const bar = card.querySelector("[data-activity-bar]");
      card.addEventListener("mouseenter", () => {
        if (bar) bar.style.transform = "scaleX(1)";
      });
      card.addEventListener("mouseleave", () => {
        if (bar) bar.style.transform = "scaleX(0)";
      });
    });
  }

  /* Boot */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initCounters();
    initModals();
    initMaterials();
    initProjectTabs();
    initValueCards();
    initActivityCards();
  });
})();
