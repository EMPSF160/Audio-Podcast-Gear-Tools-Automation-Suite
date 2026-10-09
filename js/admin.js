/**
 * RØDE International - Admin Management Suite & Analytics Engine
 */

class RodeAdminConsole {
  constructor() {
    this.revenueChart = null;
    this.categoryChart = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAll();

    // Subscribe to store updates
    store.subscribe("products_updated", () => {
      this.renderProductsTable();
      this.renderInventory();
      this.updateKPIs();
    });
    store.subscribe("orders_updated", () => {
      this.renderOrdersTable();
      this.updateKPIs();
      this.renderCharts();
    });
    store.subscribe("warranties_updated", () => {
      this.renderWarrantiesTable();
      this.updateKPIs();
    });
    store.subscribe("reviews_updated", () => {
      this.renderReviewsTable();
    });
  }

  bindEvents() {
    // Admin Pane Switcher
    document.querySelectorAll(".admin-nav-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const pane = e.currentTarget.dataset.adminPane;
        this.switchPane(pane);
      });
    });

    // Refresh Realtime Stats Button
    const refreshBtn = document.getElementById("refresh-admin-stats-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.updateKPIs();
        this.renderCharts();
        window.showToast("Realtime admin analytics refreshed!");
      });
    }

    // Add Product Modal Trigger
    const addProdBtn = document.getElementById("admin-add-product-btn");
    if (addProdBtn) {
      addProdBtn.addEventListener("click", () => this.openProductModal());
    }

    // Close Modal Buttons
    const closeModalBtn = document.getElementById("admin-close-modal-btn");
    const cancelModalBtn = document.getElementById("admin-cancel-modal-btn");
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => this.closeProductModal());
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", () => this.closeProductModal());

    // Product Form Save
    const prodForm = document.getElementById("admin-product-form");
    if (prodForm) {
      prodForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleProductSave();
      });
    }

    // Export Buttons
    const expProdCsv = document.getElementById("export-products-csv-btn");
    if (expProdCsv) {
      expProdCsv.addEventListener("click", () => this.exportProductsCSV());
    }
    const expOrdersJson = document.getElementById("export-orders-json-btn");
    if (expOrdersJson) {
      expOrdersJson.addEventListener("click", () => this.exportOrdersJSON());
    }
    const expWarrCsv = document.getElementById("export-warranties-csv-btn");
    if (expWarrCsv) {
      expWarrCsv.addEventListener("click", () => this.exportWarrantiesCSV());
    }

    // Admin Settings Form
    const settingsForm = document.getElementById("admin-settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const settings = store.getSettings();
        settings.currency = document.getElementById("admin-set-currency").value;
        settings.freeShippingThreshold = parseFloat(document.getElementById("admin-set-shipping").value) || 150;
        settings.taxRate = (parseFloat(document.getElementById("admin-set-tax").value) || 8.5) / 100;
        store.updateSettings(settings);
        window.showToast("Store configuration saved successfully!");
      });
    }
  }

  switchPane(paneId) {
    document.querySelectorAll(".admin-pane").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".admin-nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.adminPane === paneId);
    });

    const target = document.getElementById(`admin-pane-${paneId}`);
    if (target) {
      target.classList.add("active");
    }

    if (paneId === "overview") this.renderCharts();
    if (paneId === "products") this.renderProductsTable();
    if (paneId === "orders") this.renderOrdersTable();
    if (paneId === "warranties") this.renderWarrantiesTable();
    if (paneId === "inventory") this.renderInventory();
    if (paneId === "reviews") this.renderReviewsTable();
  }

  renderAll() {
    this.updateKPIs();
    this.renderCharts();
    this.renderProductsTable();
    this.renderOrdersTable();
    this.renderWarrantiesTable();
    this.renderInventory();
    this.renderReviewsTable();
  }

  updateKPIs() {
    const orders = store.getOrders();
    const warranties = store.getWarranties();
    const prods = store.getProducts();

    const grossRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 148000;
    const kpiRevenue = document.getElementById("kpi-revenue");
    const kpiOrders = document.getElementById("kpi-orders");
    const kpiWarranties = document.getElementById("kpi-warranties");

    if (kpiRevenue) kpiRevenue.textContent = `$${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (kpiOrders) kpiOrders.textContent = (orders.length + 380).toString();
    if (kpiWarranties) kpiWarranties.textContent = (warranties.length + 1840).toString();

    // Counter badges on sidebar
    const adminProdCount = document.getElementById("admin-prod-count");
    const adminOrdersCount = document.getElementById("admin-orders-count");
    const adminWarrCount = document.getElementById("admin-warranties-count");

    if (adminProdCount) adminProdCount.textContent = prods.length;
    if (adminOrdersCount) adminOrdersCount.textContent = orders.length;
    if (adminWarrCount) adminWarrCount.textContent = warranties.length;
  }

  renderCharts() {
    if (typeof Chart === "undefined") return;

    // 1. Revenue Chart
    const revCanvas = document.getElementById("admin-revenue-chart");
    if (revCanvas) {
      if (this.revenueChart) this.revenueChart.destroy();
      const ctx = revCanvas.getContext("2d");
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 240);
      gradient.addColorStop(0, "rgba(212, 175, 55, 0.4)");
      gradient.addColorStop(1, "rgba(212, 175, 55, 0.0)");

      this.revenueChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct 2026"],
          datasets: [{
            label: "Monthly Revenue ($ USD)",
            data: [18400, 22600, 28900, 34200, 41500, 52800],
            borderColor: "#d4af37",
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#d4af37",
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } },
            y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } }
          }
        }
      });
    }

    // 2. Category Share Chart
    const catCanvas = document.getElementById("admin-category-chart");
    if (catCanvas) {
      if (this.categoryChart) this.categoryChart.destroy();
      const ctx = catCanvas.getContext("2d");
      this.categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Microphones", "Consoles", "Wireless Audio", "Headphones", "Accessories"],
          datasets: [{
            data: [42, 28, 16, 9, 5],
            backgroundColor: ["#d4af37", "#38bdf8", "#a855f7", "#10b981", "#64748b"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: "#cbd5e1", font: { size: 11 } } }
          }
        }
      });
    }
  }

  renderProductsTable() {
    const prods = store.getProducts();
    const tbody = document.getElementById("admin-products-tbody");
    if (!tbody) return;

    tbody.innerHTML = prods.map(p => `
      <tr>
        <td>
          <div class="flex items-center">
            <img src="${p.images[0]}" class="admin-prod-thumb" alt="${p.name}">
            <div>
              <strong class="text-slate-100 block">${p.name}</strong>
              <span class="text-xs text-slate-400 font-mono">${p.sku}</span>
            </div>
          </div>
        </td>
        <td><span class="badge-gold text-xs">${p.category}</span></td>
        <td class="font-mono font-bold">$${p.price.toFixed(2)}</td>
        <td>
          <span class="${p.stock < 10 ? 'text-amber-400 font-bold' : 'text-slate-300'}">
            ${p.stock} units ${p.stock < 10 ? '⚠️ Low' : ''}
          </span>
        </td>
        <td><span class="text-gold font-bold">★ ${p.rating}</span> (${p.reviewsCount})</td>
        <td>
          <div class="flex gap-2">
            <button class="admin-action-btn" onclick="window.adminConsole.openProductModal('${p.id}')" title="Edit Gear"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="admin-action-btn text-red-400" onclick="window.adminConsole.deleteProduct('${p.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  openProductModal(prodId = null) {
    const modal = document.getElementById("admin-product-modal");
    const title = document.getElementById("admin-modal-title");
    const form = document.getElementById("admin-product-form");
    if (!modal || !form) return;

    if (prodId) {
      const p = store.getProductById(prodId);
      if (p) {
        title.textContent = `Edit Gear: ${p.name}`;
        document.getElementById("admin-form-product-id").value = p.id;
        document.getElementById("admin-form-name").value = p.name;
        document.getElementById("admin-form-category").value = p.category;
        document.getElementById("admin-form-price").value = p.price;
        document.getElementById("admin-form-stock").value = p.stock;
        document.getElementById("admin-form-connectivity").value = p.connectivity;
        document.getElementById("admin-form-image").value = p.images[0];
        document.getElementById("admin-form-tagline").value = p.tagline;
        document.getElementById("admin-form-desc").value = p.desc;
      }
    } else {
      title.textContent = "Add New Studio Gear";
      form.reset();
      document.getElementById("admin-form-product-id").value = "";
    }

    modal.classList.remove("hidden");
  }

  closeProductModal() {
    const modal = document.getElementById("admin-product-modal");
    if (modal) modal.classList.add("hidden");
  }

  handleProductSave() {
    const prodId = document.getElementById("admin-form-product-id").value;
    const name = document.getElementById("admin-form-name").value;
    const category = document.getElementById("admin-form-category").value;
    const price = parseFloat(document.getElementById("admin-form-price").value);
    const stock = parseInt(document.getElementById("admin-form-stock").value);
    const connectivity = document.getElementById("admin-form-connectivity").value;
    const image = document.getElementById("admin-form-image").value;
    const tagline = document.getElementById("admin-form-tagline").value;
    const desc = document.getElementById("admin-form-desc").value;

    if (prodId) {
      store.updateProduct(prodId, {
        name,
        category,
        price,
        stock,
        connectivity,
        images: [image],
        tagline,
        desc
      });
      window.showToast(`Updated ${name}`);
    } else {
      const newId = `rode-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const newProd = {
        id: newId,
        name,
        sku: `RD-${Math.floor(100 + Math.random() * 900)}-PRO`,
        category,
        connectivity,
        archetypes: ["podcaster", "streamer"],
        price,
        rating: 5.0,
        reviewsCount: 1,
        stock,
        badge: "New Release",
        tagline,
        desc,
        images: [image],
        features: ["dsp"],
        audioSampleType: "nt1",
        specs: { "Capsule": "Studio Grade", "Directivity": "Cardioid", "Warranty": "10 Years" },
        inBox: ["1x Hardware Unit", "1x USB Cable", "1x Studio Mount"]
      };
      store.addProduct(newProd);
      window.showToast(`Added ${name} to store catalog!`);
    }

    this.closeProductModal();
  }

  deleteProduct(id) {
    if (confirm("Are you sure you want to remove this product from the store catalog?")) {
      store.deleteProduct(id);
      window.showToast("Product deleted");
    }
  }

  renderOrdersTable() {
    const orders = store.getOrders();
    const tbody = document.getElementById("admin-orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong class="font-mono text-gold">${o.id}</strong></td>
        <td>
          <strong class="block text-slate-100">${o.customerName}</strong>
          <span class="text-xs text-slate-400">${o.customerEmail}</span>
        </td>
        <td>${o.date}</td>
        <td class="font-mono font-bold">$${o.total.toFixed(2)}</td>
        <td>
          <select class="form-input text-xs" style="padding:0.2rem 0.4rem; width:120px;" onchange="store.updateOrderStatus('${o.id}', this.value); window.showToast('Order status updated!');">
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>
          <button class="admin-action-btn" onclick="window.customerPortal.openInvoiceModal('${o.id}')" title="Print Invoice">
            <i class="fa-solid fa-file-invoice"></i> Invoice
          </button>
        </td>
      </tr>
    `).join("");
  }

  renderWarrantiesTable() {
    const warrs = store.getWarranties();
    const tbody = document.getElementById("admin-warranties-tbody");
    if (!tbody) return;

    tbody.innerHTML = warrs.map(w => `
      <tr>
        <td class="font-mono text-gold text-xs">${w.id}</td>
        <td><strong>${w.productName}</strong></td>
        <td class="font-mono text-xs">${w.serialNumber}</td>
        <td>${w.ownerName}</td>
        <td>${w.purchaseDate}</td>
        <td><span class="order-status-badge Delivered">${w.status}</span></td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-xs" onclick="store.updateWarrantyStatus('${w.id}', 'Approved & Certified'); window.showToast('Warranty Approved!');">Approve</button>
            <button class="btn btn-ghost btn-xs text-red-400" onclick="store.updateWarrantyStatus('${w.id}', 'Under Audit'); window.showToast('Warranty Flagged');">Flag</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  renderInventory() {
    const prods = store.getProducts();
    const container = document.getElementById("admin-inventory-list");
    if (!container) return;

    container.innerHTML = `
      <div class="products-grid">
        ${prods.map(p => `
          <div class="glassmorphism p-4 flex-between" style="padding:1rem;">
            <div class="flex items-center gap-3">
              <img src="${p.images[0]}" class="admin-prod-thumb" alt="${p.name}">
              <div>
                <h4 class="text-sm font-bold text-slate-100">${p.name}</h4>
                <span class="text-xs text-slate-400">Stock: <strong class="${p.stock < 10 ? 'text-amber-400 font-bold' : 'text-emerald-400'}">${p.stock} units</strong></span>
              </div>
            </div>
            <button class="btn btn-outline btn-xs" onclick="store.updateProduct('${p.id}', { stock: ${p.stock + 10} }); window.showToast('Restocked +10 units!');">
              <i class="fa-solid fa-plus"></i> Restock +10
            </button>
          </div>
        `).join("")}
      </div>
    `;
  }

  renderReviewsTable() {
    const reviews = store.getReviews();
    const tbody = document.getElementById("admin-reviews-tbody");
    if (!tbody) return;

    tbody.innerHTML = reviews.map(r => {
      const prod = store.getProductById(r.productId);
      return `
        <tr>
          <td><strong>${prod ? prod.name : r.productId}</strong></td>
          <td>${r.author}</td>
          <td><span class="text-gold">★ ${r.rating}</span></td>
          <td>
            <strong class="block text-slate-200">${r.title}</strong>
            <span class="text-xs text-slate-400">${r.text.substring(0, 70)}...</span>
          </td>
          <td><span class="badge-role customer">${r.status || 'approved'}</span></td>
          <td>
            <button class="btn btn-outline btn-xs" onclick="store.moderateReview('${r.id}', 'approved'); window.showToast('Review approved!');">Approve</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Export Utilities
  exportProductsCSV() {
    const prods = store.getProducts();
    let csv = "ID,Name,SKU,Category,Price,Stock,Rating\n";
    prods.forEach(p => {
      csv += `"${p.id}","${p.name}","${p.sku}","${p.category}",${p.price},${p.stock},${p.rating}\n`;
    });
    this.downloadFile("rode-products-catalog-2026.csv", csv, "text/csv");
  }

  exportOrdersJSON() {
    const orders = store.getOrders();
    const json = JSON.stringify(orders, null, 2);
    this.downloadFile("rode-orders-ledger-2026.json", json, "application/json");
  }

  exportWarrantiesCSV() {
    const warrs = store.getWarranties();
    let csv = "RegistrationID,ProductName,SerialNumber,OwnerName,PurchaseDate,Status\n";
    warrs.forEach(w => {
      csv += `"${w.id}","${w.productName}","${w.serialNumber}","${w.ownerName}","${w.purchaseDate}","${w.status}"\n`;
    });
    this.downloadFile("rode-10yr-warranties-registry.csv", csv, "text/csv");
  }

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast(`Exported ${filename}`);
  }
}

// Global instance
window.adminConsole = new RodeAdminConsole();
