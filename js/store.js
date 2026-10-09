/**
 * RØDE International - Reactive State Store with LocalStorage Persistence
 */

class RodeStore {
  constructor() {
    this.listeners = {};
    this.init();
  }

  init() {
    // Initialize LocalStorage with mock data if not present
    if (!localStorage.getItem("rode_products")) {
      localStorage.setItem("rode_products", JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem("rode_cart")) {
      // Default with NT1 5th Gen for a warm demo experience
      localStorage.setItem("rode_cart", JSON.stringify([
        { id: "rode-nt1-5th", qty: 1, color: "Black" }
      ]));
    }
    if (!localStorage.getItem("rode_wishlist")) {
      localStorage.setItem("rode_wishlist", JSON.stringify(["rodecaster-pro-ii", "rode-nth-100"]));
    }
    if (!localStorage.getItem("rode_compare")) {
      localStorage.setItem("rode_compare", JSON.stringify(["rode-nt1-5th", "rode-podmic-usb"]));
    }
    if (!localStorage.getItem("rode_orders")) {
      localStorage.setItem("rode_orders", JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem("rode_warranties")) {
      localStorage.setItem("rode_warranties", JSON.stringify(INITIAL_WARRANTIES));
    }
    if (!localStorage.getItem("rode_reviews")) {
      localStorage.setItem("rode_reviews", JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem("rode_user")) {
      localStorage.setItem("rode_user", JSON.stringify({
        name: "Alex Vance",
        email: "alex.vance@studio.audio",
        role: "customer", // customer | admin | guest
        phone: "+1 (555) 382-9012",
        address: "404 Acoustic Way, Sound Studio 8",
        city: "Los Angeles",
        state: "California",
        zip: "90210",
        country: "US",
        daw: "rode-connect",
        archetype: "podcasting"
      }));
    }
    if (!localStorage.getItem("rode_settings")) {
      localStorage.setItem("rode_settings", JSON.stringify({
        currency: "USD",
        currencySymbol: "$",
        exchangeRate: 1.0,
        freeShippingThreshold: 150,
        taxRate: 0.085,
        discountCode: null,
        discountPercent: 0
      }));
    }
  }

  // Pub/Sub Event System
  subscribe(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // ================= PRODUCTS =================
  getProducts() {
    return JSON.parse(localStorage.getItem("rode_products")) || [];
  }

  getProductById(id) {
    const prods = this.getProducts();
    return prods.find(p => p.id === id) || null;
  }

  saveProducts(prods) {
    localStorage.setItem("rode_products", JSON.stringify(prods));
    this.emit("products_updated", prods);
  }

  addProduct(newProd) {
    const prods = this.getProducts();
    prods.unshift(newProd);
    this.saveProducts(prods);
  }

  updateProduct(id, updates) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], ...updates };
      this.saveProducts(prods);
    }
  }

  deleteProduct(id) {
    let prods = this.getProducts();
    prods = prods.filter(p => p.id !== id);
    this.saveProducts(prods);
  }

  // ================= CART =================
  getCart() {
    return JSON.parse(localStorage.getItem("rode_cart")) || [];
  }

  saveCart(cart) {
    localStorage.setItem("rode_cart", JSON.stringify(cart));
    this.emit("cart_updated", cart);
  }

  addToCart(productId, qty = 1, color = "Black") {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === productId && i.color === color);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: productId, qty, color });
    }
    this.saveCart(cart);
  }

  updateCartQty(productId, qty, color = "Black") {
    let cart = this.getCart();
    if (qty <= 0) {
      cart = cart.filter(i => !(i.id === productId && i.color === color));
    } else {
      const item = cart.find(i => i.id === productId && i.color === color);
      if (item) item.qty = qty;
    }
    this.saveCart(cart);
  }

  removeFromCart(productId, color) {
    let cart = this.getCart();
    cart = cart.filter(i => !(i.id === productId && (!color || i.color === color)));
    this.saveCart(cart);
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.qty, 0);
  }

  getCartCalculations() {
    const cart = this.getCart();
    const settings = this.getSettings();
    let subtotal = 0;

    const populatedItems = cart.map(item => {
      const prod = this.getProductById(item.id);
      if (!prod) return null;
      const lineTotal = prod.price * item.qty;
      subtotal += lineTotal;
      return {
        ...item,
        product: prod,
        lineTotal
      };
    }).filter(Boolean);

    const discountAmount = settings.discountPercent > 0 ? (subtotal * settings.discountPercent) : 0;
    const shipping = (subtotal - discountAmount >= settings.freeShippingThreshold || subtotal === 0) ? 0 : 25;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * settings.taxRate;
    const grandTotal = taxableAmount + shipping + tax;

    return {
      items: populatedItems,
      subtotal,
      discountAmount,
      discountCode: settings.discountCode,
      shipping,
      tax,
      grandTotal,
      freeShippingThreshold: settings.freeShippingThreshold,
      progressToFreeShipping: Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100))
    };
  }

  applyPromoCode(code) {
    const upper = code.trim().toUpperCase();
    const settings = this.getSettings();
    if (upper === "RODE2026" || upper === "STUDIO10") {
      settings.discountCode = upper;
      settings.discountPercent = 0.10; // 10%
      this.updateSettings(settings);
      return { success: true, message: "10% Creator Discount Applied!" };
    } else if (upper === "VIP20") {
      settings.discountCode = upper;
      settings.discountPercent = 0.20; // 20%
      this.updateSettings(settings);
      return { success: true, message: "20% Pro VIP Discount Applied!" };
    }
    return { success: false, message: "Invalid promotional code" };
  }

  // ================= WISHLIST =================
  getWishlist() {
    return JSON.parse(localStorage.getItem("rode_wishlist")) || [];
  }

  saveWishlist(list) {
    localStorage.setItem("rode_wishlist", JSON.stringify(list));
    this.emit("wishlist_updated", list);
  }

  toggleWishlist(productId) {
    let list = this.getWishlist();
    const exists = list.includes(productId);
    if (exists) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    this.saveWishlist(list);
    return !exists; // true if added, false if removed
  }

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  }

  moveWishlistToCart() {
    const list = this.getWishlist();
    list.forEach(id => this.addToCart(id, 1));
    this.saveWishlist([]);
  }

  // ================= COMPARISON =================
  getCompareList() {
    return JSON.parse(localStorage.getItem("rode_compare")) || [];
  }

  saveCompare(list) {
    localStorage.setItem("rode_compare", JSON.stringify(list));
    this.emit("compare_updated", list);
  }

  toggleCompare(productId) {
    let list = this.getCompareList();
    const exists = list.includes(productId);
    if (exists) {
      list = list.filter(id => id !== productId);
    } else {
      if (list.length >= 4) {
        return { success: false, message: "Max 4 products can be compared at once" };
      }
      list.push(productId);
    }
    this.saveCompare(list);
    return { success: true, added: !exists };
  }

  isInCompare(productId) {
    return this.getCompareList().includes(productId);
  }

  clearCompare() {
    this.saveCompare([]);
  }

  // ================= USER AUTH & ROLES =================
  getUser() {
    return JSON.parse(localStorage.getItem("rode_user")) || null;
  }

  setUser(user) {
    localStorage.setItem("rode_user", JSON.stringify(user));
    this.emit("user_updated", user);
  }

  login(email, role = "customer") {
    const user = {
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      phone: "+1 (555) 382-9012",
      address: "404 Acoustic Way, Sound Studio 8",
      city: "Los Angeles",
      state: "California",
      zip: "90210",
      country: "US"
    };
    this.setUser(user);
    return user;
  }

  logout() {
    const guestUser = {
      name: "Guest Creator",
      email: "guest@rode.com",
      role: "guest"
    };
    this.setUser(guestUser);
  }

  switchRole(role) {
    const current = this.getUser() || {};
    current.role = role;
    if (role === "admin") {
      current.name = "Sydney Admin HQ";
      current.email = "admin@rode.com";
    } else if (role === "customer") {
      current.name = "Alex Vance";
      current.email = "alex.vance@studio.audio";
    } else {
      current.name = "Guest Creator";
      current.email = "guest@rode.com";
    }
    this.setUser(current);
  }

  // ================= ORDERS =================
  getOrders() {
    return JSON.parse(localStorage.getItem("rode_orders")) || [];
  }

  saveOrders(orders) {
    localStorage.setItem("rode_orders", JSON.stringify(orders));
    this.emit("orders_updated", orders);
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      trackingNumber: `RODE-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      ...orderData
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.clearCart();
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders(orders);
    }
  }

  // ================= WARRANTIES =================
  getWarranties() {
    return JSON.parse(localStorage.getItem("rode_warranties")) || [];
  }

  saveWarranties(warrs) {
    localStorage.setItem("rode_warranties", JSON.stringify(warrs));
    this.emit("warranties_updated", warrs);
  }

  registerWarranty(data) {
    const warrs = this.getWarranties();
    const newWarr = {
      id: `WARR-AU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Approved & Certified",
      certCode: `CERT-RODE-GOLD-${Math.floor(1000 + Math.random() * 9000)}`,
      coverageEnd: `${new Date().getFullYear() + 10}-${new Date().toISOString().slice(5, 10)} (10-Year Active Guarantee)`,
      ...data
    };
    warrs.unshift(newWarr);
    this.saveWarranties(warrs);
    return newWarr;
  }

  updateWarrantyStatus(warrId, status) {
    const warrs = this.getWarranties();
    const item = warrs.find(w => w.id === warrId);
    if (item) {
      item.status = status;
      this.saveWarranties(warrs);
    }
  }

  // ================= REVIEWS =================
  getReviews(productId = null) {
    const all = JSON.parse(localStorage.getItem("rode_reviews")) || [];
    if (!productId) return all;
    return all.filter(r => r.productId === productId);
  }

  saveReviews(reviews) {
    localStorage.setItem("rode_reviews", JSON.stringify(reviews));
    this.emit("reviews_updated", reviews);
  }

  addReview(review) {
    const reviews = this.getReviews();
    const newRev = {
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      verified: true,
      status: "approved",
      ...review
    };
    reviews.unshift(newRev);
    this.saveReviews(reviews);
    return newRev;
  }

  moderateReview(reviewId, status) {
    const reviews = this.getReviews();
    const item = reviews.find(r => r.id === reviewId);
    if (item) {
      item.status = status;
      this.saveReviews(reviews);
    }
  }

  // ================= SETTINGS =================
  getSettings() {
    return JSON.parse(localStorage.getItem("rode_settings")) || {};
  }

  updateSettings(newSettings) {
    localStorage.setItem("rode_settings", JSON.stringify(newSettings));
    this.emit("settings_updated", newSettings);
  }
}

// Instantiate global singleton store
window.store = new RodeStore();
