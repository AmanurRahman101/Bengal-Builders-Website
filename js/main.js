/**
 * Bengal Builders & Construction Ltd. (BBCL)
 * Shared UI + motion layer
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");
  if (prefersReducedMotion) document.documentElement.classList.add("no-motion");

  /* --------------------------------------------------------------------------
   * Sticky nav + mobile menu
   * ------------------------------------------------------------------------ */
  function initNav() {
    const nav = document.getElementById("site-nav");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (nav) {
      const onScroll = () => {
        nav.classList.toggle("nav-scrolled", window.scrollY > 16);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (menuBtn && mobileMenu) {
      mobileMenu.classList.remove("hidden");

      const iconSvg = menuBtn.querySelector("svg");
      const setOpen = (open) => {
        mobileMenu.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
        menuBtn.setAttribute("aria-expanded", String(open));

        if (iconSvg) {
          if (open) {
            iconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
          } else {
            iconSvg.innerHTML = '<path stroke-linecap="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16"/>';
          }
        }
      };

      menuBtn.addEventListener("click", () => {
        setOpen(!mobileMenu.classList.contains("is-open"));
      });

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
          setOpen(false);
        }
      });
    }

    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("text-teal", "font-bold", "is-active");
        link.classList.remove("text-slate-muted");
      }
    });
  }

  /* --------------------------------------------------------------------------
   * GSAP: hero, scroll reveals, subtle parallax
   * Content stays visible by default — motion is progressive enhancement only.
   * ------------------------------------------------------------------------ */
  function initMotion() {
    const heroMedia = document.querySelector(".hero-media");
    if (heroMedia && !prefersReducedMotion) {
      heroMedia.classList.add("is-ready");
    }

    if (prefersReducedMotion || typeof gsap === "undefined") return;

    try {
      if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
      }

      const heroBits = document.querySelectorAll("[data-hero]");
      if (heroBits.length) {
        gsap.from(heroBits, {
          autoAlpha: 0,
          y: 28,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.05,
          clearProps: "all",
        });
      }

      if (heroMedia && typeof ScrollTrigger !== "undefined") {
        gsap.to(heroMedia, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: heroMedia.closest("section") || heroMedia,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (typeof ScrollTrigger === "undefined") return;

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 24,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
            toggleActions: "play none none none",
          },
        });
      });

      document.querySelectorAll("[data-stagger]").forEach((group) => {
        const items = group.querySelectorAll("[data-stagger-item]");
        if (!items.length) return;

        gsap.from(items, {
          autoAlpha: 0,
          y: 22,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.07,
          clearProps: "all",
          scrollTrigger: {
            trigger: group,
            start: "top 88%",
            once: true,
            toggleActions: "play none none none",
          },
        });
      });
    } catch (err) {
      // Never leave the page blank if motion setup fails
      console.warn("Motion init skipped:", err);
    }
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
      else {
        el.textContent = isFloat
          ? target.toLocaleString()
          : Math.round(target).toLocaleString();
      }
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
              if (prefersReducedMotion) {
                el.textContent = Math.round(target).toLocaleString();
              } else {
                animateCount(el, target, duration);
              }
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
      "pointer-events-auto max-w-sm w-full border border-teal/40 bg-white/95 backdrop-blur-md px-5 py-4 shadow-xl translate-x-8 opacity-0 transition-all duration-300";
    toast.innerHTML =
      '<p class="text-sm font-semibold tracking-wide text-slate">' +
      message +
      "</p>" +
      (detail
        ? '<p class="mt-1 text-xs text-slate-muted leading-relaxed">' + detail + "</p>"
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
        const show = typeMatch && textMatch;
        card.classList.toggle("hidden", !show);
        if (show) card.classList.add("is-shown");
      });

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeType = tab.getAttribute("data-material-tab");
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle("bg-teal", on);
          t.classList.toggle("text-white", on);
          t.classList.toggle("text-slate-muted", !on);
          t.classList.toggle("border-teal", on);
          t.classList.toggle("border-border", !on);
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
        if (rate > 0) {
          const estimate = (volume * rate).toLocaleString("en-BD");
          showToast(
            "Added to Quote Request",
            name + " — " + volume + " " + unit + " · Est. volume calc: BDT " + estimate + " (indicative)"
          );
        } else {
          showToast(
            "Quote Request Submitted",
            name + " — " + volume + " " + unit + " · Pricing available on request"
          );
        }
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
          b.classList.toggle("bg-teal", on);
          b.classList.toggle("text-white", on);
          b.classList.toggle("text-slate-muted", !on);
          b.classList.toggle("border-teal", on);
          b.classList.toggle("border-border", !on);
          b.setAttribute("aria-selected", String(on));
        });

        panels.forEach((panel) => {
          const match = panel.getAttribute("data-project-panel") === target;
          panel.classList.toggle("hidden", !match);
        });

        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
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

  /* --------------------------------------------------------------------------
   * Contact form submission (FormSubmit POST to info@bengalbuildersbd.com)
   * ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = form.querySelector("#contact-name").value.trim();
      const email = form.querySelector("#contact-email").value.trim();
      const phone = form.querySelector("#contact-phone") ? form.querySelector("#contact-phone").value.trim() : "";
      const subjectSelect = form.querySelector("#contact-subject");
      const subjectText = subjectSelect && subjectSelect.selectedIndex >= 0 ? subjectSelect.options[subjectSelect.selectedIndex].text : "General Inquiry";
      const message = form.querySelector("#contact-message").value.trim();

      if (!name || !email || !message) {
        showToast("Please fill all required fields", "Name, email, and message are required.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<span class="inline-flex items-center">Submitting<span class="ml-2 animate-pulse">...</span></span>';
      submitBtn.disabled = true;

      const formData = {
        name: name,
        email: email,
        phone: phone || "N/A",
        subject: subjectText,
        message: message,
        _subject: "New Website Inquiry from " + name + " — BBCL",
        _template: "table"
      };

      fetch("https://formsubmit.co/ajax/info@bengalbuildersbd.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      })
      .then((response) => response.json())
      .then((data) => {
        form.innerHTML =
          '<div class="form-success text-center py-12">' +
          '<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">' +
          '<svg class="h-8 w-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />' +
          '</svg></div>' +
          '<h3 class="mt-6 text-xl font-bold text-slate">Message Sent to info@bengalbuildersbd.com</h3>' +
          '<p class="mt-3 text-sm text-slate-muted leading-relaxed max-w-md mx-auto">Thank you, <strong>' +
          name +
          '</strong>. Your message regarding "<em>' + subjectText + '</em>" has been submitted to Bengal Builders & Construction Ltd. Our office team will get back to you shortly.</p>' +
          '<a href="index.html" class="btn-primary mt-6 inline-flex items-center bg-teal px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">Back to Home</a>' +
          '</div>';
        showToast("Message Delivered", "Submitted to info@bengalbuildersbd.com");
      })
      .catch((err) => {
        console.warn("FormSubmit fetch fallback:", err);
        form.innerHTML =
          '<div class="form-success text-center py-12">' +
          '<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">' +
          '<svg class="h-8 w-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />' +
          '</svg></div>' +
          '<h3 class="mt-6 text-xl font-bold text-slate">Inquiry Logged</h3>' +
          '<p class="mt-3 text-sm text-slate-muted leading-relaxed max-w-md mx-auto">Thank you, <strong>' +
          name +
          '</strong>. Your message has been prepared for <strong>info@bengalbuildersbd.com</strong>.</p>' +
          '<a href="mailto:info@bengalbuildersbd.com?subject=' + encodeURIComponent("Inquiry: " + subjectText) + '&body=' + encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ", " + phone + ")") + '" class="btn-primary mt-6 inline-flex items-center bg-teal px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">Email Directly</a>' +
          '</div>';
        showToast("Inquiry Received", "Thank you for contacting Bengal Builders.");
      });
    });
  }

  /* Boot */
  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    initNav();
    initMotion();
    initCounters();
    initModals();
    initMaterials();
    initProjectTabs();
    initActivityCards();
    initContactForm();
  });
})();
