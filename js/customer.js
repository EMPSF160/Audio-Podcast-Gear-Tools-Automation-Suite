/**
 * RØDE International - Customer Portal, Cart & Checkout Engine
 */

class RodeCustomerPortal {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAll();
    
    // Subscribe to store changes
    store.subscribe("cart_updated", () => this.renderCart());
    store.subscribe("wishlist_updated", () => this.renderWishlist());
    store.subscribe("orders_updated", () => {
      this.renderOrders();
      this.renderInvoices();
    });
    store.subscribe("warranties_updated", () => this.renderWarranties());
  }

  bindEvents() {
    // Account Subview Navigation
    document.querySelectorAll(".acc-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const subview = e.currentTarget.dataset.subview;
        this.switchSubview(subview);
      });
    });

    // Cart Actions
    const clearCartBtn = document.getElementById("cart-clear-all-btn");
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        store.clearCart();
        window.showToast("Shopping bag cleared");
      });
    }

    // Promo code apply
    const applyPromoBtn = document.getElementById("apply-promo-btn");
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener("click", () => {
        const codeInput = document.getElementById("promo-code-input");
        if (!codeInput || !codeInput.value) return;
        const res = store.applyPromoCode(codeInput.value);
        const statusMsg = document.getElementById("promo-status-msg");
        if (res.success) {
          window.showToast(res.message);
          if (statusMsg) {
            statusMsg.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check"></i> ${res.message}</span>`;
          }
          this.renderCart();
        } else {
          window.showToast(res.message, "error");
          if (statusMsg) {
            statusMsg.innerHTML = `<span class="text-red-400"><i class="fa-solid fa-xmark"></i> ${res.message}</span>`;
          }
        }
      });
    }

    // Checkout Flow Navigation
    const proceedCheckoutBtn = document.getElementById("proceed-to-checkout-btn");
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener("click", () => {
        if (store.getCartCount() === 0) {
          window.showToast("Your cart is empty! Add gear before checkout.", "error");
          return;
        }
        this.switchSubview("checkout-view");
      });
    }

    const backToCartBtn = document.querySelector("[data-subview-target='cart-view']");
    if (backToCartBtn) {
      backToCartBtn.addEventListener("click", () => this.switchSubview("cart-view"));
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleOrderPlacement();
      });
    }

    // Warranty Registration Form
    const warrantyForm = document.getElementById("warranty-reg-form");
    if (warrantyForm) {
      warrantyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleWarrantyRegistration();
      });
    }

    // Wishlist Move All to Cart
    const moveAllWishlistBtn = document.getElementById("move-all-wishlist-cart-btn");
    if (moveAllWishlistBtn) {
      moveAllWishlistBtn.addEventListener("click", () => {
        store.moveWishlistToCart();
        window.showToast("All wishlist gear moved to cart!");
        this.switchSubview("cart-view");
      });
    }

    // Profile Settings Form
    const profileForm = document.getElementById("profile-settings-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = store.getUser() || {};
        user.name = document.getElementById("prof-name").value;
        user.email = document.getElementById("prof-email").value;
        user.daw = document.getElementById("prof-daw").value;
        user.archetype = document.getElementById("prof-archetype").value;
        store.setUser(user);
        window.showToast("Studio profile settings updated successfully!");
      });
    }

    // Order Filter Chips
    document.querySelectorAll("[data-order-filter]").forEach(chip => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll("[data-order-filter]").forEach(c => c.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.renderOrders(e.currentTarget.dataset.orderFilter);
      });
    });

    // Invoice Print & Close
    const printInvBtn = document.getElementById("print-invoice-btn");
    if (printInvBtn) {
      printInvBtn.addEventListener("click", () => window.print());
    }
    const closeInvBtn = document.getElementById("close-invoice-modal-btn");
    if (closeInvBtn) {
      closeInvBtn.addEventListener("click", () => {
        document.getElementById("invoice-modal").classList.add("hidden");
      });
    }
  }

  switchSubview(subviewId) {
    document.querySelectorAll(".account-subview").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".acc-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.subview === subviewId);
    });

    const target = document.getElementById(`subview-${subviewId}`);
    if (target) {
      target.classList.add("active");
    }

    if (subviewId === "cart-view") this.renderCart();
    if (subviewId === "checkout-view") this.renderCheckout();
    if (subviewId === "orders-view") this.renderOrders();
    if (subviewId === "warranty-view") this.renderWarranties();
    if (subviewId === "wishlist-view") this.renderWishlist();
    if (subviewId === "invoices-view") this.renderInvoices();
  }

  renderAll() {
    this.renderCart();
    this.renderOrders();
    this.renderWarranties();
    this.renderWishlist();
    this.renderInvoices();
    this.populateWarrantyProductsDropdown();
  }

  renderCart() {
    const calc = store.getCartCalculations();
    const count = store.getCartCount();

    // Badges in Header & Tabs
    const cartBadge = document.getElementById("cart-badge");
    const accCartCount = document.getElementById("acc-cart-count");
    const drawerCartCount = document.getElementById("drawer-cart-count");

    if (cartBadge) cartBadge.textContent = count;
    if (accCartCount) accCartCount.textContent = count;
    if (drawerCartCount) drawerCartCount.textContent = count;

    // Cart Items Container
    const cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) return;

    if (calc.items.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state py-8">
          <i class="fa-solid fa-bag-shopping empty-icon"></i>
          <h3 class="text-base font-bold text-slate-200">Your studio bag is empty</h3>
          <p class="text-xs text-slate-400 mt-1">Discover world-class microphones and podcast consoles.</p>
          <a href="#shop" class="btn btn-gold btn-sm mt-4" data-nav="shop">Explore Gear Catalog</a>
        </div>
      `;
    } else {
      cartContainer.innerHTML = calc.items.map(item => `
        <div class="cart-item-row">
          <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-img">
          <div class="cart-item-details">
            <span class="badge-gold text-xs">${item.product.badge}</span>
            <h4>${item.product.name}</h4>
            <p class="cart-item-meta">Color: <strong>${item.color}</strong> | 10-Yr Warranty Included</p>
          </div>
          
          <div class="quantity-picker">
            <button class="qty-btn" onclick="store.updateCartQty('${item.id}', ${item.qty - 1}, '${item.color}')"><i class="fa-solid fa-minus"></i></button>
            <input type="number" readonly value="${item.qty}" class="qty-input">
            <button class="qty-btn" onclick="store.updateCartQty('${item.id}', ${item.qty + 1}, '${item.color}')"><i class="fa-solid fa-plus"></i></button>
          </div>

          <div class="cart-item-price">$${item.lineTotal.toFixed(2)}</div>

          <button class="cart-item-remove-btn" title="Remove gear" onclick="store.removeFromCart('${item.id}', '${item.color}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `).join("");
    }

    // Summary calculations
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryShipping = document.getElementById("summary-shipping");
    const summaryTax = document.getElementById("summary-tax");
    const summaryTotal = document.getElementById("summary-total");
    const drawerSubtotal = document.getElementById("drawer-cart-subtotal");

    if (summarySubtotal) summarySubtotal.textContent = `$${calc.subtotal.toFixed(2)}`;
    if (drawerSubtotal) drawerSubtotal.textContent = `$${calc.subtotal.toFixed(2)}`;
    if (summaryShipping) summaryShipping.textContent = calc.shipping === 0 ? "FREE" : `$${calc.shipping.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${calc.tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${calc.grandTotal.toFixed(2)}`;

    // Promo code discount row
    const discountRow = document.getElementById("summary-discount-row");
    const discountVal = document.getElementById("summary-discount-val");
    if (discountRow && discountVal) {
      if (calc.discountAmount > 0) {
        discountRow.classList.remove("hidden");
        discountVal.textContent = `-$${calc.discountAmount.toFixed(2)}`;
      } else {
        discountRow.classList.add("hidden");
      }
    }

    // Shipping progress bar
    const trackerText = document.getElementById("shipping-tracker-text");
    const trackerPct = document.getElementById("shipping-tracker-pct");
    const trackerFill = document.getElementById("shipping-tracker-fill");

    if (trackerFill && trackerText && trackerPct) {
      trackerFill.style.width = `${calc.progressToFreeShipping}%`;
      trackerPct.textContent = `${calc.progressToFreeShipping}%`;
      if (calc.progressToFreeShipping >= 100) {
        trackerText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> You've unlocked <strong>Free Global Express Shipping!</strong>`;
      } else {
        const remaining = (calc.freeShippingThreshold - calc.subtotal).toFixed(2);
        trackerText.innerHTML = `<i class="fa-solid fa-truck-fast text-gold"></i> Add $${remaining} more for Free Global Priority Shipping`;
      }
    }

    // Drawer items list
    const drawerList = document.getElementById("drawer-cart-items");
    if (drawerList) {
      if (calc.items.length === 0) {
        drawerList.innerHTML = `<p class="text-center text-xs text-slate-400 py-6">Your cart is empty.</p>`;
      } else {
        drawerList.innerHTML = calc.items.map(item => `
          <div class="drawer-cart-row flex-between">
            <div class="flex items-center gap-3">
              <img src="${item.product.images[0]}" class="drawer-item-img" alt="${item.product.name}">
              <div>
                <h5 class="text-xs font-bold text-slate-100">${item.product.name}</h5>
                <span class="text-xs text-slate-400">Qty: ${item.qty} × $${item.product.price}</span>
              </div>
            </div>
            <span class="text-xs font-bold text-gold">$${item.lineTotal.toFixed(2)}</span>
          </div>
        `).join("");
      }
    }
  }

  renderCheckout() {
    const calc = store.getCartCalculations();
    const miniItemsContainer = document.getElementById("checkout-mini-items");
    if (miniItemsContainer) {
      miniItemsContainer.innerHTML = calc.items.map(item => `
        <div class="flex-between text-xs py-1 border-b border-slate-800/60">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gold">${item.qty}x</span>
            <span class="text-slate-200">${item.product.name}</span>
          </div>
          <span class="font-mono text-slate-300">$${item.lineTotal.toFixed(2)}</span>
        </div>
      `).join("");
    }

    const chkSubtotal = document.getElementById("chk-subtotal");
    const chkTax = document.getElementById("chk-tax");
    const chkTotalSum = document.getElementById("chk-total-sum");
    const chkBtnTotal = document.getElementById("chk-btn-total");

    if (chkSubtotal) chkSubtotal.textContent = `$${calc.subtotal.toFixed(2)}`;
    if (chkTax) chkTax.textContent = `$${calc.tax.toFixed(2)}`;
    if (chkTotalSum) chkTotalSum.textContent = `$${calc.grandTotal.toFixed(2)}`;
    if (chkBtnTotal) chkBtnTotal.textContent = `$${calc.grandTotal.toFixed(2)}`;
  }

  handleOrderPlacement() {
    const calc = store.getCartCalculations();
    if (calc.items.length === 0) {
      window.showToast("Your cart is empty!", "error");
      return;
    }

    const orderData = {
      customerName: `${document.getElementById("chk-fname").value} ${document.getElementById("chk-lname").value}`,
      customerEmail: document.getElementById("chk-email").value,
      shippingAddress: `${document.getElementById("chk-address").value}, ${document.getElementById("chk-city").value}, ${document.getElementById("chk-state").value} ${document.getElementById("chk-zip").value}`,
      total: calc.grandTotal,
      items: calc.items.map(i => ({
        id: i.id,
        name: i.product.name,
        price: i.product.price,
        qty: i.qty,
        image: i.product.images[0]
      }))
    };

    const newOrder = store.createOrder(orderData);
    window.showToast(`Order ${newOrder.id} authorized & placed successfully!`);
    
    // Switch to Orders view and open official invoice
    this.switchSubview("orders-view");
    this.openInvoiceModal(newOrder.id);
  }

  renderOrders(filter = "all") {
    let orders = store.getOrders();
    if (filter !== "all") {
      orders = orders.filter(o => o.status === filter);
    }

    const container = document.getElementById("customer-orders-list");
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-8">
          <i class="fa-solid fa-box-open empty-icon"></i>
          <h3>No order records found</h3>
          <p class="text-xs text-slate-400">Your placed gear orders will appear here with live tracking.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-record-card">
        <div class="order-header-row">
          <div>
            <span class="order-num">${order.id}</span>
            <span class="text-xs text-slate-400 ml-2">Ordered on ${order.date}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="order-status-badge ${order.status}">${order.status}</span>
            <button class="btn btn-outline btn-xs" onclick="window.customerPortal.openInvoiceModal('${order.id}')">
              <i class="fa-solid fa-file-invoice"></i> View Invoice
            </button>
          </div>
        </div>

        <div class="order-items-mini-row">
          ${order.items.map(item => `
            <div class="order-mini-item">
              <img src="${item.image}" class="order-mini-img" alt="${item.name}">
              <div>
                <span class="font-bold text-slate-200 block text-xs">${item.name}</span>
                <span class="text-xs text-slate-400">Qty: ${item.qty} × $${item.price}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="flex-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span class="text-slate-400"><i class="fa-solid fa-truck-fast text-gold"></i> Tracking: <strong class="font-mono text-slate-200">${order.trackingNumber}</strong></span>
          <span class="font-bold text-slate-100">Total: <strong class="text-gold font-mono text-sm">$${order.total.toFixed(2)}</strong></span>
        </div>
      </div>
    `).join("");
  }

  populateWarrantyProductsDropdown() {
    const select = document.getElementById("warranty-product-select");
    if (!select) return;
    const prods = store.getProducts();
    select.innerHTML = prods.map(p => `
      <option value="${p.id}">${p.name} (SKU: ${p.sku})</option>
    `).join("");
  }

  handleWarrantyRegistration() {
    const select = document.getElementById("warranty-product-select");
    const prodId = select.value;
    const prod = store.getProductById(prodId);
    const user = store.getUser() || {};

    const data = {
      productId: prodId,
      productName: prod ? prod.name : "RØDE Studio Gear",
      serialNumber: document.getElementById("warranty-serial-input").value.toUpperCase(),
      purchaseDate: document.getElementById("warranty-date-input").value,
      dealer: document.getElementById("warranty-dealer-input").value,
      invoiceNumber: document.getElementById("warranty-invoice-input").value,
      ownerName: user.name || "Alex Vance",
      ownerEmail: user.email || "alex.vance@studio.audio"
    };

    const newWarr = store.registerWarranty(data);
    window.showToast(`10-Year Warranty for ${data.productName} activated!`);
    document.getElementById("warranty-reg-form").reset();
    this.renderWarranties();
  }

  renderWarranties() {
    const warranties = store.getWarranties();
    const container = document.getElementById("registered-warranties-list");
    if (!container) return;

    if (warranties.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400">No active hardware warranty registrations.</p>`;
      return;
    }

    container.innerHTML = warranties.map(warr => `
      <div class="warranty-certificate-card">
        <i class="fa-solid fa-certificate cert-watermark"></i>
        <div class="cert-head">
          <div>
            <span class="badge-gold text-xs"><i class="fa-solid fa-shield-check"></i> 10-YEAR CERTIFIED</span>
            <h4 class="cert-title mt-1">${warr.productName}</h4>
          </div>
          <span class="cert-serial font-mono">${warr.serialNumber}</span>
        </div>
        <div class="text-xs text-slate-300 mb-2">
          <span>Registered to: <strong>${warr.ownerName}</strong></span> | 
          <span>Certificate ID: <strong class="text-gold font-mono">${warr.certCode}</strong></span>
        </div>
        <div class="flex-between text-xs pt-2 border-t border-slate-700/50">
          <span class="cert-expiry"><i class="fa-solid fa-calendar-check text-gold"></i> Valid Until: ${warr.coverageEnd}</span>
          <span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Active</span>
        </div>
      </div>
    `).join("");
  }

  renderWishlist() {
    const wishlistIds = store.getWishlist();
    const countBadge = document.getElementById("wishlist-badge");
    const accWishCount = document.getElementById("acc-wishlist-count");

    if (countBadge) {
      countBadge.textContent = wishlistIds.length;
      countBadge.classList.toggle("hidden", wishlistIds.length === 0);
    }
    if (accWishCount) accWishCount.textContent = wishlistIds.length;

    const container = document.getElementById("customer-wishlist-grid");
    if (!container) return;

    if (wishlistIds.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-8">
          <i class="fa-regular fa-heart empty-icon"></i>
          <h3>Your wishlist is empty</h3>
          <p class="text-xs text-slate-400">Bookmark audio gear you want to inspect or buy later.</p>
        </div>
      `;
      return;
    }

    const prods = wishlistIds.map(id => store.getProductById(id)).filter(Boolean);
    container.innerHTML = prods.map(p => `
      <div class="product-card">
        <div class="product-card-badge">${p.badge}</div>
        <div class="product-img-wrapper" onclick="window.router.navigate('product-details?id=${p.id}')">
          <img src="${p.images[0]}" alt="${p.name}" class="product-thumbnail">
        </div>
        <a href="#product-details?id=${p.id}" class="product-name-link">${p.name}</a>
        <div class="product-specs-summary">${p.tagline}</div>
        <div class="product-card-footer">
          <span class="product-price-val">$${p.price.toFixed(2)}</span>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-xs" onclick="store.toggleWishlist('${p.id}')">Remove</button>
            <button class="btn btn-gold btn-xs" onclick="store.addToCart('${p.id}', 1); window.showToast('Added to Cart!');">Add to Bag</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  renderInvoices() {
    const orders = store.getOrders();
    const container = document.getElementById("customer-invoices-list");
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400">No invoices generated yet.</p>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Invoice / Order</th>
            <th>Issue Date</th>
            <th>Billed To</th>
            <th>Amount</th>
            <th>Tax Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong class="font-mono text-gold">${o.id}</strong></td>
              <td>${o.date}</td>
              <td>${o.customerName}</td>
              <td class="font-mono font-bold">$${o.total.toFixed(2)}</td>
              <td><span class="badge-role customer"><i class="fa-solid fa-check"></i> Paid (8.5% GST)</span></td>
              <td>
                <button class="btn btn-outline btn-xs" onclick="window.customerPortal.openInvoiceModal('${o.id}')">
                  <i class="fa-solid fa-print"></i> View / Print
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  openInvoiceModal(orderId) {
    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId) || orders[0];
    if (!order) return;

    const modal = document.getElementById("invoice-modal");
    const content = document.getElementById("invoice-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="invoice-sheet-header">
        <div>
          <div class="flex items-center gap-2">
            <div class="logo-circle-gold-sm" style="background:#d4af37;"></div>
            <span class="invoice-brand-title font-bold text-slate-900">RØDE MICROPHONES</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Freedman Electronics Pty Ltd | ABN: 91 000 576 483</p>
          <p class="text-xs text-slate-500">107 Carnarvon St, Silverwater, Sydney NSW 2128 Australia</p>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-bold text-slate-900">TAX INVOICE</h2>
          <p class="font-mono text-xs font-bold text-slate-700 mt-1">${order.id}</p>
          <p class="text-xs text-slate-500">Date: ${order.date}</p>
        </div>
      </div>

      <div class="flex-between my-4 text-xs">
        <div>
          <h4 class="font-bold text-slate-800">BILLED TO:</h4>
          <p class="text-slate-600 font-bold">${order.customerName}</p>
          <p class="text-slate-600">${order.customerEmail}</p>
          <p class="text-slate-600">${order.shippingAddress}</p>
        </div>
        <div class="text-right">
          <h4 class="font-bold text-slate-800">SHIPPING METHOD:</h4>
          <p class="text-slate-600 font-bold">RØDE Global Priority Express</p>
          <p class="font-mono text-slate-500">Tracking: ${order.trackingNumber}</p>
          <p class="text-emerald-600 font-bold mt-1">10-Year Warranty Protected</p>
        </div>
      </div>

      <table class="invoice-meta-table">
        <thead>
          <tr>
            <th>Description & SKU</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td><strong>${item.name}</strong><br><span class="text-slate-400 text-xs">Official Australian Hardware</span></td>
              <td>${item.qty}</td>
              <td class="font-mono">$${item.price.toFixed(2)}</td>
              <td class="font-mono font-bold">$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="flex-between mt-6 pt-4 border-t-2 border-slate-200 text-slate-800">
        <div class="text-xs text-slate-500 max-w-xs">
          Thank you for choosing RØDE. Keep this invoice for official 10-Year warranty verification at any authorized Sydney service center.
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-500">Subtotal: $${(order.total / 1.085).toFixed(2)}</p>
          <p class="text-xs text-slate-500">GST / Tax (8.5%): $${(order.total - (order.total / 1.085)).toFixed(2)}</p>
          <h3 class="text-lg font-bold text-slate-900 mt-1">Total Paid: $${order.total.toFixed(2)} USD</h3>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }
}

// Global instance
window.customerPortal = new RodeCustomerPortal();
