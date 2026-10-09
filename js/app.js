/**
 * RØDE International - Main Application Controller & Router
 */

class RodeApp {
  constructor() {
    this.currentView = "home";
    this.activePdpProduct = null;
    this.pdpAngleIndex = 0;
    this.isDragging360 = false;
    this.dragStartX = 0;
    
    // Shop Filters State
    this.shopFilters = {
      search: "",
      categories: ["all"],
      connectivity: [],
      archetypes: [],
      maxPrice: 1000,
      features: [],
      sort: "popular",
      viewMode: "grid"
    };

    this.init();
  }

  init() {
    this.bindGlobalEvents();
    this.bindHeaderAndAuth();
    this.bindShopEvents();
    this.bindPdpEvents();
    this.bindGuidesEvents();
    this.bindAudioStudioDrawer();
    this.bindSearchModal();
    this.handleRoute();

    // Subscribe to product / store updates
    store.subscribe("user_updated", (user) => this.updateUserDisplay(user));
    store.subscribe("products_updated", () => {
      this.renderHomeBestsellers();
      this.renderShopProducts();
    });
    store.subscribe("compare_updated", () => {
      this.renderComparisonDrawer();
      this.renderGuidesComparison();
    });

    // Initial renders
    this.renderHomeCategories();
    this.renderHomeBestsellers();
    this.renderHomeTestimonials();
    this.renderKitMatcher("solo-podcast");
    this.renderShopProducts();
    this.renderGuidesComparison();
    this.renderTutorialGuides();
    this.renderComparisonDrawer();
  }

  // ================= ROUTER =================
  bindGlobalEvents() {
    window.addEventListener("hashchange", () => this.handleRoute());

    // Navigation links
    document.querySelectorAll("[data-nav]").forEach(link => {
      link.addEventListener("click", (e) => {
        const route = e.currentTarget.dataset.nav;
        const id = e.currentTarget.dataset.id;
        if (route) {
          e.preventDefault();
          this.navigate(id ? `${route}?id=${id}` : route);
        }
      });
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        const nav = document.querySelector(".nav-links");
        if (nav) nav.classList.toggle("mobile-open");
      });
    }
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  handleRoute() {
    const rawHash = window.location.hash.slice(1) || "home";
    const [path, queryString] = rawHash.split("?");
    const params = new URLSearchParams(queryString);

    this.currentView = path;

    // Handle Subviews under Cart / Account
    if (path.startsWith("customer-")) {
      const subview = path.replace("customer-", "") + "-view";
      this.showPage("page-cart-account");
      if (window.customerPortal) {
        window.customerPortal.switchSubview(subview);
      }
    } else if (path === "admin-dashboard") {
      this.showPage("page-admin");
    } else if (path === "product-details") {
      const prodId = params.get("id") || "rode-nt1-5th";
      this.showPage("page-product-details");
      this.loadProductDetails(prodId);
    } else if (path === "compare") {
      this.showPage("page-guides");
      const compSec = document.getElementById("comparison-section");
      if (compSec) compSec.scrollIntoView({ behavior: "smooth" });
    } else {
      this.showPage(`page-${path}`);
    }

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      const navTarget = link.dataset.nav;
      link.classList.toggle("active", navTarget === path || (path.startsWith("customer-") && navTarget === "cart"));
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showPage(pageId) {
    document.querySelectorAll(".page-view").forEach(page => {
      page.classList.remove("active");
    });
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add("active");
    }
  }

  // ================= HEADER & AUTHENTICATION =================
  bindHeaderAndAuth() {
    // Role Switcher Button
    const roleBtn = document.getElementById("role-switch-btn");
    if (roleBtn) {
      roleBtn.addEventListener("click", () => {
        const user = store.getUser() || { role: "customer" };
        const nextRole = user.role === "customer" ? "admin" : (user.role === "admin" ? "guest" : "customer");
        store.switchRole(nextRole);
        window.showToast(`Switched active role to: ${nextRole.toUpperCase()}`);
      });
    }

    // User Account Dropdown
    const userBtn = document.getElementById("user-account-btn");
    const userMenuContainer = document.getElementById("user-menu-container");
    const userDropdown = document.getElementById("user-dropdown-menu");

    if (userBtn && userDropdown) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const user = store.getUser();
        if (user && user.role === "guest") {
          this.openAuthModal();
        } else {
          userDropdown.classList.toggle("hidden");
        }
      });

      document.addEventListener("click", (e) => {
        if (!userMenuContainer.contains(e.target)) {
          userDropdown.classList.add("hidden");
        }
      });
    }

    // Cart Drawer Toggle
    const cartDrawerBtn = document.getElementById("cart-drawer-btn");
    const cartOverlay = document.getElementById("cart-drawer-overlay");
    const closeCartDrawer = document.getElementById("close-cart-drawer-btn");

    if (cartDrawerBtn && cartOverlay) {
      cartDrawerBtn.addEventListener("click", () => cartOverlay.classList.remove("hidden"));
    }
    if (closeCartDrawer && cartOverlay) {
      closeCartDrawer.addEventListener("click", () => cartOverlay.classList.add("hidden"));
    }

    // Auth Modal Triggers & Tabs
    const authModal = document.getElementById("auth-modal");
    const closeAuthBtn = document.getElementById("close-auth-modal-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (closeAuthBtn && authModal) {
      closeAuthBtn.addEventListener("click", () => authModal.classList.add("hidden"));
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        store.logout();
        window.showToast("Signed out. Switched to Guest Creator.");
        if (userDropdown) userDropdown.classList.add("hidden");
      });
    }

    // Auth tabs
    document.querySelectorAll(".auth-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.authTab;
        document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        document.querySelectorAll(".auth-form-pane").forEach(p => p.classList.remove("active"));
        const target = document.getElementById(`auth-${tab}-form`);
        if (target) target.classList.add("active");
      });
    });

    // Quick Login Roles
    document.querySelectorAll(".quick-login-role").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const role = e.currentTarget.dataset.role;
        store.switchRole(role);
        window.showToast(`Logged in as ${role === 'admin' ? 'Sydney Admin HQ' : 'Alex Vance (Creator)'}`);
        authModal.classList.add("hidden");
      });
    });

    // Auth Forms Submission
    const loginForm = document.getElementById("auth-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        store.login(email);
        window.showToast(`Welcome back, ${email}!`);
        authModal.classList.add("hidden");
      });
    }

    const regForm = document.getElementById("auth-register-form");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        store.setUser({ name, email, role: "customer" });
        window.showToast(`Account created for ${name}!`);
        authModal.classList.add("hidden");
      });
    }

    const forgotForm = document.getElementById("auth-forgot-form");
    if (forgotForm) {
      forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        window.showToast("Password reset instructions dispatched to your email!");
        authModal.classList.add("hidden");
      });
    }

    this.updateUserDisplay(store.getUser());
  }

  openAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("hidden");
  }

  updateUserDisplay(user) {
    if (!user) return;

    const roleBadge = document.getElementById("current-role-badge");
    const menuUserName = document.getElementById("menu-user-name");
    const menuUserEmail = document.getElementById("menu-user-email");
    const menuUserRole = document.getElementById("menu-user-role");
    const headerUserName = document.getElementById("header-user-name");

    if (roleBadge) {
      roleBadge.className = `badge-role ${user.role}`;
      roleBadge.innerHTML = user.role === "admin"
        ? `<i class="fa-solid fa-shield text-gold"></i> Admin HQ`
        : (user.role === "customer" ? `<i class="fa-solid fa-user-check"></i> Creator (${user.name})` : `<i class="fa-solid fa-user"></i> Guest`);
    }

    if (menuUserName) menuUserName.textContent = user.name;
    if (menuUserEmail) menuUserEmail.textContent = user.email;
    if (menuUserRole) menuUserRole.textContent = user.role.toUpperCase();
    if (headerUserName) headerUserName.textContent = user.name.split(" ")[0];

    // Show/hide admin links in dropdown
    document.querySelectorAll(".admin-only-item").forEach(item => {
      item.style.display = user.role === "admin" ? "block" : "none";
    });
  }

  // ================= HOME PAGE =================
  renderHomeCategories() {
    const grid = document.getElementById("home-categories-grid");
    if (!grid) return;

    grid.innerHTML = INITIAL_CATEGORIES.map(cat => `
      <div class="category-card" onclick="window.router.filterByCategory('${cat.id}')">
        <div class="cat-icon-wrap"><i class="fa-solid ${cat.icon}"></i></div>
        <h3 class="cat-title">${cat.name}</h3>
        <span class="cat-count">${cat.count}</span>
        <p class="text-xs text-slate-400 mt-2">${cat.desc}</p>
      </div>
    `).join("");
  }

  renderHomeBestsellers(category = "all") {
    const grid = document.getElementById("home-bestsellers-grid");
    if (!grid) return;

    let prods = store.getProducts();
    if (category !== "all") {
      prods = prods.filter(p => p.category === category);
    }

    grid.innerHTML = prods.slice(0, 6).map(p => this.renderProductCardHtml(p)).join("");
    this.bindCardActions();
  }

  renderProductCardHtml(p) {
    const isInWish = store.isInWishlist(p.id);
    const isInComp = store.isInCompare(p.id);

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card-badge">${p.badge}</div>
        
        <div class="product-card-actions-float">
          <button class="card-action-btn ${isInWish ? 'active' : ''}" onclick="window.router.toggleWishlist('${p.id}')" title="Save to Wishlist">
            <i class="${isInWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
          <button class="card-action-btn ${isInComp ? 'active' : ''}" onclick="window.router.toggleCompare('${p.id}')" title="Compare Gear">
            <i class="fa-solid fa-code-compare"></i>
          </button>
        </div>

        <div class="product-img-wrapper" onclick="window.router.navigate('product-details?id=${p.id}')">
          <img src="${p.images[0]}" alt="${p.name}" class="product-thumbnail">
          <button class="audio-preview-pill-btn" onclick="event.stopPropagation(); window.audioEngine.playMicTone('${p.audioSampleType}');">
            <i class="fa-solid fa-volume-high"></i> Acoustic Test
          </button>
        </div>

        <span class="product-category-tag">${p.category}</span>
        <a href="#product-details?id=${p.id}" class="product-name-link">${p.name}</a>
        <p class="product-specs-summary">${p.tagline}</p>

        <div class="product-rating-row">
          <div class="stars-gold">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          </div>
          <span class="rating-count">(${p.reviewsCount} reviews)</span>
        </div>

        <div class="product-card-footer">
          <span class="product-price-val">$${p.price.toFixed(2)}</span>
          <button class="btn btn-gold btn-sm quick-add-btn" onclick="store.addToCart('${p.id}', 1); window.showToast('Added ${p.name} to bag!');">
            <i class="fa-solid fa-cart-plus"></i> Add to Bag
          </button>
        </div>
      </div>
    `;
  }

  bindCardActions() {
    // Bestseller category tabs
    document.querySelectorAll("#bestsellers-category-tabs .cat-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll("#bestsellers-category-tabs .cat-tab-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.renderHomeBestsellers(e.currentTarget.dataset.cat);
      });
    });

    // Studio Builder Kit Chips
    document.querySelectorAll(".kit-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll(".kit-chip").forEach(c => c.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.renderKitMatcher(e.currentTarget.dataset.kit);
      });
    });
  }

  renderKitMatcher(kitType) {
    const box = document.getElementById("kit-matcher-result");
    if (!box) return;

    const kitPresets = {
      "solo-podcast": {
        title: "Pro Solo Podcaster Bundle",
        gear: ["NT1 5th Generation (32-bit)", "PSA1+ Silent Boom Arm", "NTH-100 Studio Headphones"],
        regularPrice: 527.00,
        bundlePrice: 469.00,
        ids: ["rode-nt1-5th", "rode-psa1-plus", "rode-nth-100"]
      },
      "multi-podcast": {
        title: "4-Host Roundtable Broadcast Studio",
        gear: ["RØDECaster Pro II Console", "2x PodMic USB Dynamics", "2x NTH-100 Headphones"],
        regularPrice: 1395.00,
        bundlePrice: 1199.00,
        ids: ["rodecaster-pro-ii", "rode-podmic-usb", "rode-nth-100"]
      },
      "streamer": {
        title: "Streamer X 4K Gaming Audio-Video Suite",
        gear: ["Streamer X Interface", "PodMic USB Dynamic", "PSA1+ Boom Arm"],
        regularPrice: 727.00,
        bundlePrice: 639.00,
        ids: ["rode-streamer-x", "rode-podmic-usb", "rode-psa1-plus"]
      },
      "field-filmmaker": {
        title: "Cinematic Run-and-Gun Wireless Rig",
        gear: ["Wireless PRO System (Dual Channel)", "2x Lavalier II Broadcast Mics", "NTH-100 Monitoring"],
        regularPrice: 548.00,
        bundlePrice: 489.00,
        ids: ["rode-wireless-pro", "rode-nth-100"]
      }
    };

    const kit = kitPresets[kitType] || kitPresets["solo-podcast"];

    box.innerHTML = `
      <div class="flex-between mb-2">
        <h4 class="font-bold text-slate-100 text-sm"><i class="fa-solid fa-box-check text-gold"></i> ${kit.title}</h4>
        <span class="badge-gold text-xs">SAVE $${(kit.regularPrice - kit.bundlePrice).toFixed(2)}</span>
      </div>
      <ul class="text-xs text-slate-300 space-y-1 mb-3" style="list-style:disc; padding-left:1.2rem;">
        ${kit.gear.map(g => `<li>${g}</li>`).join("")}
      </ul>
      <div class="flex-between pt-2 border-t border-slate-800">
        <div>
          <span class="text-xs text-slate-400 line-through mr-2">$${kit.regularPrice.toFixed(2)}</span>
          <span class="text-base font-bold text-gold font-mono">$${kit.bundlePrice.toFixed(2)}</span>
        </div>
        <button class="btn btn-gold btn-xs" onclick="window.router.addKitToCart(${JSON.stringify(kit.ids).replace(/"/g, '&quot;')})">
          <i class="fa-solid fa-cart-plus"></i> Add Complete Bundle
        </button>
      </div>
    `;
  }

  renderHomeTestimonials() {
    const grid = document.getElementById("testimonials-grid");
    if (!grid) return;

    grid.innerHTML = INITIAL_TESTIMONIALS.map(t => `
      <div class="testimonial-card">
        <div class="stars-gold mb-3">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
        </div>
        <p class="test-quote">"${t.quote}"</p>
        <div class="test-author">
          <img src="${t.avatar}" class="test-avatar" alt="${t.author}">
          <div>
            <h4 class="test-name">${t.author}</h4>
            <span class="test-role">${t.role}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  // ================= SHOP / CATALOG PAGE =================
  bindShopEvents() {
    // Search input
    const searchInput = document.getElementById("shop-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.shopFilters.search = e.target.value.toLowerCase();
        this.renderShopProducts();
      });
    }

    // Category checkboxes
    document.querySelectorAll(".category-filter-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.value === "all") {
          if (cb.checked) {
            document.querySelectorAll(".category-filter-checkbox").forEach(c => {
              if (c.value !== "all") c.checked = false;
            });
            this.shopFilters.categories = ["all"];
          }
        } else {
          document.getElementById("cat-all").checked = false;
          const checked = Array.from(document.querySelectorAll(".category-filter-checkbox:checked")).map(c => c.value);
          this.shopFilters.categories = checked.length ? checked : ["all"];
        }
        this.renderShopProducts();
      });
    });

    // Connectivity checkboxes
    document.querySelectorAll(".conn-filter-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        this.shopFilters.connectivity = Array.from(document.querySelectorAll(".conn-filter-checkbox:checked")).map(c => c.value);
        this.renderShopProducts();
      });
    });

    // Archetype pills
    document.querySelectorAll(".archetype-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const arch = e.currentTarget.dataset.archetype;
        e.currentTarget.classList.toggle("active");
        if (this.shopFilters.archetypes.includes(arch)) {
          this.shopFilters.archetypes = this.shopFilters.archetypes.filter(a => a !== arch);
        } else {
          this.shopFilters.archetypes.push(arch);
        }
        this.renderShopProducts();
      });
    });

    // Price Slider
    const priceSlider = document.getElementById("price-slider");
    const priceVal = document.getElementById("price-range-val");
    if (priceSlider && priceVal) {
      priceSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        priceVal.textContent = `$${val}`;
        this.shopFilters.maxPrice = val;
        this.renderShopProducts();
      });
    }

    // Key Features
    document.querySelectorAll(".feature-filter-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        this.shopFilters.features = Array.from(document.querySelectorAll(".feature-filter-checkbox:checked")).map(c => c.value);
        this.renderShopProducts();
      });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.shopFilters.sort = e.target.value;
        this.renderShopProducts();
      });
    }

    // View toggles
    const viewGrid = document.getElementById("view-grid-btn");
    const viewList = document.getElementById("view-list-btn");
    if (viewGrid && viewList) {
      viewGrid.addEventListener("click", () => {
        viewGrid.classList.add("active");
        viewList.classList.remove("active");
        this.shopFilters.viewMode = "grid";
        document.getElementById("shop-products-grid").classList.remove("list-view");
      });
      viewList.addEventListener("click", () => {
        viewList.classList.add("active");
        viewGrid.classList.remove("active");
        this.shopFilters.viewMode = "list";
        document.getElementById("shop-products-grid").classList.add("list-view");
      });
    }

    // Reset buttons
    const resetBtn = document.getElementById("reset-filters-btn");
    const clearAllBtn = document.getElementById("clear-all-filters-btn");
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetShopFilters());
    if (clearAllBtn) clearAllBtn.addEventListener("click", () => this.resetShopFilters());
  }

  resetShopFilters() {
    this.shopFilters = {
      search: "",
      categories: ["all"],
      connectivity: [],
      archetypes: [],
      maxPrice: 1000,
      features: [],
      sort: "popular",
      viewMode: "grid"
    };

    const searchInput = document.getElementById("shop-search-input");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".category-filter-checkbox").forEach(c => c.checked = c.value === "all");
    document.querySelectorAll(".conn-filter-checkbox, .feature-filter-checkbox").forEach(c => c.checked = false);
    document.querySelectorAll(".archetype-pill").forEach(p => p.classList.remove("active"));
    const priceSlider = document.getElementById("price-slider");
    if (priceSlider) priceSlider.value = 1000;
    const priceVal = document.getElementById("price-range-val");
    if (priceVal) priceVal.textContent = "$1,000";

    this.renderShopProducts();
    window.showToast("Catalog filters reset");
  }

  filterByCategory(catId) {
    this.resetShopFilters();
    this.shopFilters.categories = [catId];
    this.navigate("shop");
    document.querySelectorAll(".category-filter-checkbox").forEach(c => {
      c.checked = c.value === catId;
    });
    this.renderShopProducts();
  }

  renderShopProducts() {
    let prods = store.getProducts();
    const f = this.shopFilters;

    // Filter by search
    if (f.search) {
      prods = prods.filter(p => p.name.toLowerCase().includes(f.search) || p.tagline.toLowerCase().includes(f.search) || p.desc.toLowerCase().includes(f.search));
    }

    // Filter by category
    if (!f.categories.includes("all")) {
      prods = prods.filter(p => f.categories.includes(p.category));
    }

    // Filter by connectivity
    if (f.connectivity.length) {
      prods = prods.filter(p => f.connectivity.includes(p.connectivity));
    }

    // Filter by archetype
    if (f.archetypes.length) {
      prods = prods.filter(p => p.archetypes && p.archetypes.some(a => f.archetypes.includes(a)));
    }

    // Filter by max price
    prods = prods.filter(p => p.price <= f.maxPrice);

    // Filter by features
    if (f.features.length) {
      prods = prods.filter(p => p.features && f.features.every(feat => p.features.includes(feat)));
    }

    // Sorting
    if (f.sort === "price-asc") prods.sort((a, b) => a.price - b.price);
    else if (f.sort === "price-desc") prods.sort((a, b) => b.price - a.price);
    else if (f.sort === "rating") prods.sort((a, b) => b.rating - a.rating);
    else if (f.sort === "name") prods.sort((a, b) => a.name.localeCompare(b.name));

    // Render Count
    const countLabel = document.getElementById("products-count-label");
    if (countLabel) countLabel.innerHTML = `Showing <strong>${prods.length}</strong> gear systems`;

    // Render Grid
    const grid = document.getElementById("shop-products-grid");
    const emptyState = document.getElementById("shop-empty-state");

    if (prods.length === 0) {
      if (grid) grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      if (grid) grid.innerHTML = prods.map(p => this.renderProductCardHtml(p)).join("");
    }
  }

  // ================= PRODUCT DETAILS PAGE (PAGE 03) =================
  loadProductDetails(productId) {
    const p = store.getProductById(productId) || store.getProducts()[0];
    if (!p) return;

    this.activePdpProduct = p;

    // Breadcrumb & Headings
    document.getElementById("pdp-breadcrumb-name").textContent = p.name;
    document.getElementById("pdp-title").textContent = p.name;
    document.getElementById("pdp-sku").textContent = `SKU: ${p.sku}`;
    document.getElementById("pdp-tagline").textContent = p.tagline;
    document.getElementById("pdp-price").textContent = `$${p.price.toFixed(2)}`;
    document.getElementById("pdp-category-badge").textContent = p.badge;

    // Main Image
    const mainImg = document.getElementById("pdp-main-image");
    if (mainImg) mainImg.src = p.images[0];

    // Thumbnails
    const thumbsContainer = document.getElementById("pdp-thumbs-container");
    if (thumbsContainer) {
      thumbsContainer.innerHTML = p.images.map((img, idx) => `
        <div class="pdp-thumb-item ${idx === 0 ? 'active' : ''}" onclick="window.router.switchPdpImage(${idx})">
          <img src="${img}" alt="${p.name}">
        </div>
      `).join("");
    }

    // In The Box List
    const inBoxList = document.getElementById("pdp-in-box-list");
    if (inBoxList && p.inBox) {
      inBoxList.innerHTML = p.inBox.map(item => `
        <li><i class="fa-solid fa-check text-gold"></i> ${item}</li>
      `).join("");
    }

    // Deep Technical Specs Table
    const specsTable = document.getElementById("pdp-specs-table");
    if (specsTable && p.specs) {
      specsTable.innerHTML = Object.entries(p.specs).map(([key, val]) => `
        <tr>
          <th>${key}</th>
          <td>${val}</td>
        </tr>
      `).join("");
    }

    // Comparisons Table
    const compTable = document.getElementById("pdp-compare-matrix-table");
    if (compTable) {
      const allProds = store.getProducts().slice(0, 3);
      compTable.innerHTML = `
        <thead>
          <tr>
            <th>Specification</th>
            ${allProds.map(prod => `<th>${prod.name} ${prod.id === p.id ? '(Viewing)' : ''}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Acoustic Output</td>
            ${allProds.map(prod => `<td>${prod.connectivity.toUpperCase()}</td>`).join("")}
          </tr>
          <tr>
            <td>Price</td>
            ${allProds.map(prod => `<td class="font-bold text-gold">$${prod.price}</td>`).join("")}
          </tr>
          <tr>
            <td>Warranty</td>
            ${allProds.map(() => `<td>10-Year Global</td>`).join("")}
          </tr>
        </tbody>
      `;
    }

    // Reviews Section
    this.renderPdpReviews(p.id);
  }

  switchPdpImage(index) {
    if (!this.activePdpProduct || !this.activePdpProduct.images[index]) return;
    this.pdpAngleIndex = index;
    const mainImg = document.getElementById("pdp-main-image");
    if (mainImg) mainImg.src = this.activePdpProduct.images[index];

    document.querySelectorAll(".pdp-thumb-item").forEach((thumb, idx) => {
      thumb.classList.toggle("active", idx === index);
    });
  }

  bindPdpEvents() {
    // 360 Drag Interaction
    const stage = document.getElementById("pdp-360-viewport");
    if (stage) {
      stage.addEventListener("mousedown", (e) => {
        this.isDragging360 = true;
        this.dragStartX = e.clientX;
      });

      window.addEventListener("mouseup", () => {
        this.isDragging360 = false;
      });

      stage.addEventListener("mousemove", (e) => {
        if (!this.isDragging360 || !this.activePdpProduct) return;
        const diff = e.clientX - this.dragStartX;
        if (Math.abs(diff) > 40) {
          const totalAngles = this.activePdpProduct.images.length;
          if (diff > 0) {
            this.pdpAngleIndex = (this.pdpAngleIndex + 1) % totalAngles;
          } else {
            this.pdpAngleIndex = (this.pdpAngleIndex - 1 + totalAngles) % totalAngles;
          }
          this.switchPdpImage(this.pdpAngleIndex);
          this.dragStartX = e.clientX;
        }
      });
    }

    // PDP Quantity Buttons
    const qtyMinus = document.getElementById("pdp-qty-minus");
    const qtyPlus = document.getElementById("pdp-qty-plus");
    const qtyInput = document.getElementById("pdp-qty-input");

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener("click", () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
      qtyPlus.addEventListener("click", () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
      });
    }

    // PDP Add to Cart
    const pdpAddBtn = document.getElementById("pdp-add-to-cart-btn");
    if (pdpAddBtn) {
      pdpAddBtn.addEventListener("click", () => {
        if (!this.activePdpProduct) return;
        const qty = parseInt(document.getElementById("pdp-qty-input").value) || 1;
        const activeColor = document.querySelector(".color-chip.active")?.dataset.color || "Black";
        store.addToCart(this.activePdpProduct.id, qty, activeColor);
        window.showToast(`Added ${qty}x ${this.activePdpProduct.name} to Cart!`);
      });
    }

    // PDP Wishlist toggle
    const pdpWishBtn = document.getElementById("pdp-wishlist-toggle-btn");
    if (pdpWishBtn) {
      pdpWishBtn.addEventListener("click", () => {
        if (!this.activePdpProduct) return;
        const added = store.toggleWishlist(this.activePdpProduct.id);
        window.showToast(added ? "Saved to your Studio Wishlist" : "Removed from Wishlist");
      });
    }

    // PDP Compare add
    const pdpCompBtn = document.getElementById("pdp-compare-add-btn");
    if (pdpCompBtn) {
      pdpCompBtn.addEventListener("click", () => {
        if (!this.activePdpProduct) return;
        const res = store.toggleCompare(this.activePdpProduct.id);
        window.showToast(res.added ? "Added to Shootout Studio Comparison" : "Removed from Shootout");
      });
    }

    // PDP Tabs
    document.querySelectorAll(".pdp-nav-tab").forEach(tabBtn => {
      tabBtn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        document.querySelectorAll(".pdp-nav-tab").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        document.querySelectorAll(".pdp-pane").forEach(p => p.classList.remove("active"));
        const target = document.getElementById(`tab-pane-${tab}`);
        if (target) target.classList.add("active");
      });
    });

    // Color variant selectors
    document.querySelectorAll(".color-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll(".color-chip").forEach(c => c.classList.remove("active"));
        e.currentTarget.classList.add("active");
      });
    });

    // Audio sample tester bar
    const samplePlayBtn = document.getElementById("pdp-sample-play-trigger");
    if (samplePlayBtn) {
      samplePlayBtn.addEventListener("click", () => {
        const activeMic = this.activePdpProduct ? this.activePdpProduct.audioSampleType : "nt1";
        const isPlaying = window.audioEngine.playMicTone(activeMic);
        samplePlayBtn.innerHTML = isPlaying ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play"></i>`;
      });
    }

    // Review Submit Form
    const openReviewBtn = document.getElementById("write-review-open-btn");
    const reviewFormCard = document.getElementById("new-review-form-card");
    const cancelReviewBtn = document.getElementById("cancel-review-btn");

    if (openReviewBtn && reviewFormCard) {
      openReviewBtn.addEventListener("click", () => reviewFormCard.classList.remove("hidden"));
    }
    if (cancelReviewBtn && reviewFormCard) {
      cancelReviewBtn.addEventListener("click", () => reviewFormCard.classList.add("hidden"));
    }

    const reviewForm = document.getElementById("submit-review-form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!this.activePdpProduct) return;

        const newRev = {
          productId: this.activePdpProduct.id,
          author: document.getElementById("review-author-input").value,
          rating: parseInt(document.getElementById("review-rating-input").value),
          title: document.getElementById("review-title-input").value,
          text: document.getElementById("review-body-input").value
        };

        store.addReview(newRev);
        window.showToast("Review submitted and published!");
        reviewForm.reset();
        reviewFormCard.classList.add("hidden");
        this.renderPdpReviews(this.activePdpProduct.id);
      });
    }
  }

  renderPdpReviews(productId) {
    const reviews = store.getReviews(productId);
    const feed = document.getElementById("pdp-reviews-feed");
    const countBadge = document.getElementById("tab-reviews-count");
    if (countBadge) countBadge.textContent = reviews.length;

    if (!feed) return;
    if (reviews.length === 0) {
      feed.innerHTML = `<p class="text-xs text-slate-400 py-4">No reviews yet. Be the first to review this gear!</p>`;
      return;
    }

    feed.innerHTML = reviews.map(r => `
      <div class="review-item-card">
        <div class="review-item-header">
          <div>
            <span class="review-author">${r.author}</span>
            <span class="review-verified-badge"><i class="fa-solid fa-circle-check"></i> Verified Studio Creator</span>
          </div>
          <div class="stars-gold text-xs">
            ${Array(r.rating).fill('<i class="fa-solid fa-star"></i>').join("")}
          </div>
        </div>
        <h4 class="review-headline">${r.title}</h4>
        <p class="review-text">${r.text}</p>
        <span class="text-xs text-slate-500 mt-2 block">Reviewed on ${r.date}</span>
      </div>
    `).join("");
  }

  // ================= AUDIO GUIDES & COMPARISONS (PAGE 04) =================
  bindGuidesEvents() {
    // Room Selector buttons in Acoustic Lab
    document.querySelectorAll(".room-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".room-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.updateAcousticLab();
      });
    });

    // DSP switches
    document.querySelectorAll(".dsp-switch input").forEach(input => {
      input.addEventListener("change", () => this.updateAcousticLab());
    });

    // Live acoustic audio start trigger
    const startAcousticBtn = document.getElementById("toggle-acoustic-sim-btn");
    if (startAcousticBtn) {
      startAcousticBtn.addEventListener("click", () => {
        const isPlaying = window.audioEngine.playMicTone("nt1", "clarity");
        startAcousticBtn.innerHTML = isPlaying 
          ? `<i class="fa-solid fa-stop"></i> Stop Acoustic Simulation Tone`
          : `<i class="fa-solid fa-volume-high"></i> Start Live Acoustic Audio Test`;
      });
    }
  }

  updateAcousticLab() {
    const activeRoom = document.querySelector(".room-btn.active")?.dataset.room || "treated";
    const dsp = {
      noiseGate: document.getElementById("dsp-noisegate")?.checked || false,
      exciter: document.getElementById("dsp-exciter")?.checked || false,
      bigBottom: document.getElementById("dsp-bigbottom")?.checked || false,
      highPass: document.getElementById("dsp-highpass")?.checked || false
    };

    window.audioEngine.simulateAcousticRoom(activeRoom, dsp);
    const statusText = document.getElementById("acoustic-dsp-status");
    if (statusText) {
      statusText.textContent = `Active Room: ${activeRoom.toUpperCase()} | DSP Active`;
    }
  }

  renderGuidesComparison() {
    const compareIds = store.getCompareList();
    const pillsContainer = document.getElementById("quick-compare-pills");
    const table = document.getElementById("guides-compare-table");

    // Render quick pills
    if (pillsContainer) {
      const allProds = store.getProducts();
      pillsContainer.innerHTML = allProds.map(p => `
        <button class="compare-pill ${compareIds.includes(p.id) ? 'selected' : ''}" onclick="window.router.toggleCompare('${p.id}')">
          <i class="${compareIds.includes(p.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i> ${p.name}
        </button>
      `).join("");
    }

    if (!table) return;

    if (compareIds.length === 0) {
      table.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400">Select at least 2 microphones to view the shootout comparison.</td></tr>`;
      return;
    }

    const comparedProds = compareIds.map(id => store.getProductById(id)).filter(Boolean);

    table.innerHTML = `
      <thead>
        <tr>
          <th>Acoustic Metric</th>
          ${comparedProds.map(p => `
            <th>
              <img src="${p.images[0]}" class="w-16 h-16 object-contain mx-auto mb-2" alt="${p.name}">
              <strong class="text-slate-100 block">${p.name}</strong>
              <span class="text-gold font-bold font-mono">$${p.price.toFixed(2)}</span>
            </th>
          `).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Connectivity</td>
          ${comparedProds.map(p => `<td><span class="badge-gold text-xs">${p.connectivity.toUpperCase()}</span></td>`).join("")}
        </tr>
        <tr>
          <td>Acoustic Principle</td>
          ${comparedProds.map(p => `<td>${p.specs['Acoustic Principle'] || 'Studio Dynamic'}</td>`).join("")}
        </tr>
        <tr>
          <td>Self Noise Floor</td>
          ${comparedProds.map(p => `<td><strong class="text-emerald-400">${p.specs['Equivalent Noise (A-weighted)'] || 'Ultra-Low'}</strong></td>`).join("")}
        </tr>
        <tr>
          <td>Digital Resolution</td>
          ${comparedProds.map(p => `<td>${p.specs['Digital Audio Resolution'] || '24-bit/48kHz'}</td>`).join("")}
        </tr>
        <tr>
          <td>Action</td>
          ${comparedProds.map(p => `
            <td>
              <button class="btn btn-gold btn-xs" onclick="store.addToCart('${p.id}', 1); window.showToast('Added ${p.name} to Cart!');">Add to Bag</button>
            </td>
          `).join("")}
        </tr>
      </tbody>
    `;
  }

  renderTutorialGuides() {
    const grid = document.getElementById("audio-guides-grid");
    if (!grid) return;

    grid.innerHTML = INITIAL_GUIDES.map(g => `
      <div class="guide-card">
        <img src="${g.img}" class="guide-card-img" alt="${g.title}">
        <div class="guide-card-body">
          <div class="flex-between mb-2">
            <span class="guide-badge">${g.badge}</span>
            <span class="text-xs text-slate-400">${g.readTime}</span>
          </div>
          <h3 class="guide-title">${g.title}</h3>
          <p class="guide-text">${g.desc}</p>
          <ul class="text-xs text-slate-300 space-y-1 mb-4" style="list-style:check; padding-left:1rem;">
            ${g.checklist.map(c => `<li><i class="fa-solid fa-check text-gold mr-1"></i> ${c}</li>`).join("")}
          </ul>
          <button class="btn btn-outline btn-sm w-full" onclick="window.showToast('Full masterclass guide opened in studio reader!')">
            <i class="fa-solid fa-book-open"></i> Read Full Tutorial
          </button>
        </div>
      </div>
    `).join("");
  }

  // ================= AUDIO STUDIO MONITOR DRAWER =================
  bindAudioStudioDrawer() {
    const toggleBtn = document.getElementById("global-audio-toggle");
    const drawer = document.getElementById("audio-studio-drawer");
    const closeBtn = document.getElementById("close-studio-drawer");
    const playBtn = document.getElementById("play-sample-btn");

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener("click", () => drawer.classList.toggle("collapsed"));
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => drawer.classList.add("collapsed"));
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const isPlaying = window.audioEngine.playMicTone("nt1");
        playBtn.innerHTML = isPlaying ? `<i class="fa-solid fa-pause"></i> Pause Audio Tone` : `<i class="fa-solid fa-play"></i> Test Audio Tone`;
      });
    }

    const filterSelect = document.getElementById("studio-filter-select");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        if (window.audioEngine.isPlaying) {
          window.audioEngine.stop();
          window.audioEngine.playMicTone("nt1", e.target.value);
        }
      });
    }
  }

  // ================= COMPARISON FLOAT DRAWER =================
  renderComparisonDrawer() {
    const list = store.getCompareList();
    const countBadge = document.getElementById("compare-badge");
    const floatCount = document.getElementById("float-compare-count");
    const floatDrawer = document.getElementById("comparison-drawer");
    const floatItems = document.getElementById("float-compare-items");

    if (countBadge) {
      countBadge.textContent = list.length;
      countBadge.classList.toggle("hidden", list.length === 0);
    }
    if (floatCount) floatCount.textContent = list.length;

    if (floatDrawer) {
      floatDrawer.classList.toggle("collapsed", list.length === 0);
    }

    if (floatItems) {
      const prods = list.map(id => store.getProductById(id)).filter(Boolean);
      floatItems.innerHTML = prods.map(p => `
        <img src="${p.images[0]}" class="float-item-thumb" title="${p.name}" alt="${p.name}" onclick="window.router.toggleCompare('${p.id}')">
      `).join("");
    }
  }

  // ================= SEARCH MODAL =================
  bindSearchModal() {
    const trigger = document.getElementById("search-trigger-btn");
    const modal = document.getElementById("search-modal");
    const closeBtn = document.getElementById("close-search-btn");
    const input = document.getElementById("global-search-input");
    const results = document.getElementById("search-results-container");

    if (trigger && modal) {
      trigger.addEventListener("click", () => {
        modal.classList.remove("hidden");
        if (input) input.focus();
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }

    // Quick tags
    document.querySelectorAll(".quick-tag").forEach(tag => {
      tag.addEventListener("click", (e) => {
        if (input) {
          input.value = e.currentTarget.dataset.tag;
          this.executeGlobalSearch(input.value, results);
        }
      });
    });

    if (input && results) {
      input.addEventListener("input", (e) => {
        this.executeGlobalSearch(e.target.value, results);
      });
    }
  }

  executeGlobalSearch(query, container) {
    if (!container) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      container.innerHTML = "";
      return;
    }

    const prods = store.getProducts().filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.tagline.toLowerCase().includes(q)
    );

    if (prods.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-3">No matching audio gear found for "${query}"</p>`;
      return;
    }

    container.innerHTML = prods.map(p => `
      <div class="search-result-item flex-between" onclick="window.router.navigate('product-details?id=${p.id}'); document.getElementById('search-modal').classList.add('hidden');">
        <div class="flex items-center gap-3">
          <img src="${p.images[0]}" class="search-item-thumb" alt="${p.name}">
          <div>
            <h4 class="text-xs font-bold text-slate-100">${p.name}</h4>
            <span class="text-xs text-slate-400">${p.tagline.substring(0, 50)}...</span>
          </div>
        </div>
        <span class="text-gold font-bold font-mono text-xs">$${p.price.toFixed(2)}</span>
      </div>
    `).join("");
  }

  // Helper methods accessible from HTML
  toggleWishlist(prodId) {
    const added = store.toggleWishlist(prodId);
    window.showToast(added ? "Added to Wishlist" : "Removed from Wishlist");
    this.renderHomeBestsellers();
    this.renderShopProducts();
  }

  toggleCompare(prodId) {
    const res = store.toggleCompare(prodId);
    if (!res.success) {
      window.showToast(res.message, "error");
    } else {
      window.showToast(res.added ? "Added to Shootout Comparison" : "Removed from Shootout");
    }
  }

  addKitToCart(ids) {
    ids.forEach(id => store.addToCart(id, 1));
    window.showToast("All items from Studio Kit added to your bag!");
    this.navigate("customer-cart");
  }
}

// Global Toast System
window.showToast = function(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.innerHTML = `
    <i class="${type === 'error' ? 'fa-solid fa-circle-exclamation text-red-400' : 'fa-solid fa-circle-check text-gold'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  window.router = new RodeApp();
});
