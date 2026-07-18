/* ===== متجر مجودة — تفاعلات الواجهة (قالب سلة) ===== */
/*
  ملاحظة: البطاقات تُرسَم من القالب (Twig) وليس من هذا الملف، لذا تقرأ السلة
  التجريبية بيانات المنتج من خصائص data-* على البطاقة. عند الربط بمنتجات سلة
  الحقيقية، استخدم مكوّن <salla-product-card> وسلة سلة الرسمية (salla.cart)
  بدل هذه السلة التجريبية — انظر README.
*/
(function () {
  "use strict";

  const SAR = (n) => Number(n).toLocaleString("ar-EG") + " ر.س";

  /* ---------- Cart (تجريبية) ---------- */
  const cart = [];
  const cartCountEl = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const drawer = document.getElementById("cartDrawer");

  function productFromCard(id) {
    const card = document.querySelector('.card[data-id="' + id + '"]');
    if (!card) return null;
    return {
      id: Number(card.dataset.id),
      title: card.dataset.title,
      price: Number(card.dataset.price),
      color: card.dataset.color || "#0e7c6b",
    };
  }

  function renderCart() {
    if (!cartItemsEl) return;
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (cartCountEl) {
      cartCountEl.textContent = count;
      cartCountEl.style.display = count ? "grid" : "none";
    }

    if (!cart.length) {
      cartItemsEl.innerHTML = `<p class="drawer__empty">سلتك فارغة حاليًا 🛒</p>`;
    } else {
      cartItemsEl.innerHTML = cart.map((i) => `
        <div class="cart-line">
          <div class="cart-line__thumb" style="background:linear-gradient(135deg, ${i.color}, ${i.color}99)"></div>
          <div class="cart-line__info"><strong>${i.title}</strong><span>${i.qty} × ${SAR(i.price)}</span></div>
          <button class="cart-line__rm" data-rm="${i.id}" aria-label="حذف">✕</button>
        </div>`).join("");
    }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartTotalEl) cartTotalEl.textContent = SAR(total);
  }

  function addToCart(id) {
    const p = productFromCard(id);
    if (!p) return;
    const existing = cart.find((i) => i.id === p.id);
    if (existing) existing.qty++;
    else cart.push({ id: p.id, title: p.title, price: p.price, color: p.color, qty: 1 });
    renderCart();
  }

  function openDrawer() { if (drawer) { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); } }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      add.textContent = "✓ تمت الإضافة";
      add.classList.add("added");
      setTimeout(() => { add.textContent = "أضف للسلة"; add.classList.remove("added"); }, 1300);
    }
    const rm = e.target.closest("[data-rm]");
    if (rm) {
      const idx = cart.findIndex((i) => i.id === Number(rm.dataset.rm));
      if (idx > -1) cart.splice(idx, 1);
      renderCart();
    }
    if (e.target.closest("[data-close]")) closeDrawer();
  });

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", openDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  renderCart();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primary-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- Search filter (تصفية البطاقات التجريبية) ---------- */
  const searchInput = document.getElementById("search-input");
  const noResults = document.getElementById("noResults");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll(".card").forEach((card) => {
        const hay = ((card.dataset.title || "") + " " + (card.dataset.cat || "")).toLowerCase();
        const match = !q || hay.includes(q);
        card.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (noResults) noResults.hidden = !(q && visible === 0);
    });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll(".stat strong[data-count]");
  const animate = (el) => {
    const target = +el.dataset.count;
    const dur = 1400, start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("ar-EG") + "+";
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = (+c.dataset.count).toLocaleString("ar-EG") + "+"));
  }

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
