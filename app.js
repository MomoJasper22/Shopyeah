/**
 * SHOPYEAH - Core Application Logic
 * Shared Vanilla JavaScript for Cart State, Catalog Filtering, Search, and Mobile Nav
 */

(function () {
  'use strict';

  // Constants & Storage Keys
  const CART_STORAGE_KEY = 'shopyeah_cart_v1';
  const PROMO_CODE_STORAGE_KEY = 'shopyeah_applied_promo';
  const FREE_SHIPPING_THRESHOLD = 1500;
  const STANDARD_SHIPPING_FEE = 120;
  const VALID_PROMO_CODE = 'SHOPYEAH100';
  const PROMO_DISCOUNT_AMOUNT = 100;

  // Cached product catalog
  let allProducts = [];
  let activeCategory = 'All';
  let activeSearchQuery = '';
  let activeSortOption = 'featured';

  /* ==========================================================================
     Cart State Management (localStorage)
     ========================================================================== */

  function getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      updateCartBadge();
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }

  function addToCart(product, quantity = 1, triggerBtn = null) {
    const cart = getCart();
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image,
        quantity: quantity,
      });
    }

    saveCart(cart);

    // Button feedback
    if (triggerBtn) {
      const originalText = triggerBtn.innerHTML;
      triggerBtn.classList.add('added');
      triggerBtn.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Added</span>
      `;
      setTimeout(() => {
        triggerBtn.classList.remove('added');
        triggerBtn.innerHTML = originalText;
      }, 1400);
    }

    showToast(`Added "${product.name}" to cart!`, 'success');
  }

  function updateCartQuantity(productId, newQty) {
    let cart = getCart();
    if (newQty <= 0) {
      cart = cart.filter((item) => item.id !== productId);
      showToast('Item removed from cart', 'info');
    } else {
      const item = cart.find((i) => i.id === productId);
      if (item) item.quantity = newQty;
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    saveCart(cart);
    showToast('Item removed from cart', 'info');
  }

  function clearCart() {
    saveCart([]);
    localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
    showToast('Your cart has been cleared', 'info');
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }

  function updateCartBadge() {
    const badgeElements = document.querySelectorAll('.cart-badge, #cart-badge');
    const count = getCartCount();
    badgeElements.forEach((badge) => {
      badge.textContent = count;
      badge.setAttribute('aria-label', `${count} items in cart`);
    });
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  /* ==========================================================================
     Helpers & Formatters
     ========================================================================== */

  function formatPeso(amount) {
    return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      } else {
        starsHtml += `<svg viewBox="0 0 24 24" style="opacity:0.3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      }
    }
    return starsHtml;
  }

  /* ==========================================================================
     Navigation & Header Interactions
     ========================================================================== */

  function initHeader() {
    updateCartBadge();

    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener('click', () => {
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        mobileNav.classList.toggle('is-open', !isExpanded);
      });

      // Close mobile menu on resize to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('is-open')) {
          mobileNav.classList.remove('is-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Integrated Search Bars (Desktop & Mobile)
    const searchForms = document.querySelectorAll('.header-search-form, .mobile-search-form');
    searchForms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="search"], input[name="q"], .search-input');
        const query = input ? input.value.trim() : '';

        // If on product page, filter in place
        if (window.location.pathname.endsWith('product.html') || document.getElementById('product-catalog-root')) {
          handleCatalogSearch(query);
        } else {
          // Redirect to product catalog with query parameter
          window.location.href = `product.html?search=${encodeURIComponent(query)}`;
        }
      });
    });
  }

  /* ==========================================================================
     Product Catalog Component & Filtering (product.html & index.html)
     ========================================================================== */

  const EMBEDDED_PRODUCTS = [
    {
      id: 1,
      name: "Apple iPhone 15 Pro Max (256GB)",
      category: "Smartphones",
      price: 74990,
      originalPrice: 84990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 482,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
      description: "Aerospace-grade titanium design with A17 Pro chip, 48MP main camera system with 5x telephoto optical zoom, and Action button."
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra 5G (512GB)",
      category: "Smartphones",
      price: 79990,
      originalPrice: 89990,
      badge: "Flash Deal",
      rating: 4.9,
      reviews: 340,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
      description: "Galaxy AI-powered flagship featuring Titanium frame, 200MP camera with Quad Telephoto, Snapdragon 8 Gen 3 for Galaxy, and built-in S-Pen."
    },
    {
      id: 3,
      name: "POCO X6 Pro 5G (12GB + 512GB)",
      category: "Smartphones",
      price: 17999,
      originalPrice: 20999,
      badge: "Hot Deal",
      rating: 4.8,
      reviews: 620,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
      description: "Flagship MediaTek Dimensity 8300-Ultra processor, 120Hz CrystalRes Flow AMOLED display, 64MP OIS triple camera, and 67W turbo charging."
    },
    {
      id: 4,
      name: "Xiaomi Redmi Note 13 Pro+ 5G",
      category: "Smartphones",
      price: 21999,
      originalPrice: 24999,
      badge: "Popular",
      rating: 4.8,
      reviews: 295,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80",
      description: "200MP ultra-clear camera with OIS, 1.5K 120Hz curved AMOLED display, IP68 water and dust resistance, and 120W HyperCharge."
    },
    {
      id: 5,
      name: "Apple MacBook Air 13.6\" M2 Chip (256GB)",
      category: "Laptops",
      price: 54990,
      originalPrice: 64990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 510,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      description: "Strikingly thin design with blazing-fast Apple M2 chip, 13.6-inch Liquid Retina display, 1080p FaceTime HD camera, and up to 18 hours battery life."
    },
    {
      id: 6,
      name: "ASUS TUF Gaming A15 (RTX 4060, Ryzen 7)",
      category: "Laptops",
      price: 59995,
      originalPrice: 67995,
      badge: "Hot Deal",
      rating: 4.8,
      reviews: 215,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
      description: "Military-grade durability with NVIDIA GeForce RTX 4060 GPU, AMD Ryzen 7 7735HS, 144Hz FHD IPS display, and 16GB DDR5 memory."
    },
    {
      id: 7,
      name: "Acer Nitro V 15 Gaming Laptop (RTX 4050)",
      category: "Laptops",
      price: 45999,
      originalPrice: 52999,
      badge: "Flash Deal",
      rating: 4.7,
      reviews: 380,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
      description: "13th Gen Intel Core i5-13420H with RTX 4050 6GB GDDR6, 15.6-inch 144Hz display, dual fan cooling, and Thunderbolt 4 connectivity."
    },
    {
      id: 8,
      name: "Lenovo IdeaPad Slim 3 15.6\" (Intel Core i5)",
      category: "Laptops",
      price: 32995,
      originalPrice: 37995,
      badge: "Essential",
      rating: 4.7,
      reviews: 190,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
      description: "Lightweight student and office laptop powered by 13th Gen Intel Core i5, 16GB RAM, 512GB NVMe SSD, and Rapid Charge Boost."
    },
    {
      id: 9,
      name: "Apple AirPods Pro (2nd Gen) with USB-C",
      category: "Audio",
      price: 13490,
      originalPrice: 14990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 850,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
      description: "Next-level active noise cancellation with Adaptive Audio, Transparency mode, Personalized Spatial Audio, and USB-C MagSafe charging case."
    },
    {
      id: 10,
      name: "Sony WH-1000XM5 Wireless ANC Headphones",
      category: "Audio",
      price: 18999,
      originalPrice: 21999,
      badge: "Hot Deal",
      rating: 4.9,
      reviews: 410,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      description: "Industry-leading noise cancellation with Auto NC Optimizer, 8 microphones, 30-hour battery life, and crystal clear hands-free calling."
    },
    {
      id: 11,
      name: "Marshall Emberton II Portable Bluetooth Speaker",
      category: "Audio",
      price: 9490,
      originalPrice: 10990,
      badge: "Popular",
      rating: 4.8,
      reviews: 320,
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
      description: "Iconic vintage Marshall design with 360° True Stereophonic sound, 30+ hours of portable playtime, and IP67 dust and water resistance."
    },
    {
      id: 12,
      name: "JBL Flip 6 Waterproof Portable Bluetooth Speaker",
      category: "Audio",
      price: 6499,
      originalPrice: 7499,
      badge: "Best Seller",
      rating: 4.8,
      reviews: 580,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
      description: "Bold JBL Original Pro Sound with 2-way speaker system, racetrack-shaped woofer, IP67 waterproof and dustproof, and 12 hours playtime."
    },
    {
      id: 13,
      name: "Apple iPad 10th Gen 10.9\" Wi-Fi (64GB)",
      category: "Tablets",
      price: 22990,
      originalPrice: 25990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 670,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
      description: "All-screen design with 10.9-inch Liquid Retina display, A14 Bionic chip, landscape 12MP Ultra Wide front camera, and USB-C connectivity."
    },
    {
      id: 14,
      name: "Xiaomi Pad 6 (8GB + 256GB)",
      category: "Tablets",
      price: 16999,
      originalPrice: 19999,
      badge: "Flash Deal",
      rating: 4.8,
      reviews: 430,
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=80",
      description: "11-inch 144Hz WQHD+ eye-care display powered by Snapdragon 870, quad stereo speakers with Dolby Atmos, and massive 8840mAh battery."
    },
    {
      id: 15,
      name: "Samsung Galaxy Tab S9 FE 10.9\" (128GB with S-Pen)",
      category: "Tablets",
      price: 24990,
      originalPrice: 29990,
      badge: "Sale",
      rating: 4.8,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=600&q=80",
      description: "Crisp 90Hz display with included water-resistant IP68 S-Pen, Exynos 1380 processor, dual AKG speakers, and Samsung DeX productivity."
    },
    {
      id: 16,
      name: "Apple Watch Series 9 GPS 41mm",
      category: "Wearables",
      price: 24990,
      originalPrice: 27990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 390,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
      description: "Powerful S9 SiP chip featuring magical Double Tap gesture control, brighter Always-On display, Precision Finding for iPhone, and ECG tracking."
    },
    {
      id: 17,
      name: "Samsung Galaxy Watch 6 44mm Bluetooth",
      category: "Wearables",
      price: 14990,
      originalPrice: 17990,
      badge: "Sale",
      rating: 4.7,
      reviews: 240,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      description: "20% larger sapphire crystal display with 30% slimmer bezel, personalized sleep coaching, heart health monitoring, and One UI 5 Watch."
    },
    {
      id: 18,
      name: "Xiaomi Smart Band 8 Active Fitness Tracker",
      category: "Wearables",
      price: 1190,
      originalPrice: 1490,
      badge: "Best Seller",
      rating: 4.8,
      reviews: 940,
      image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80",
      description: "1.47-inch vibrant color display, all-day SpO2 & heart rate monitoring, 50+ workout modes, 5ATM water resistance, and 14 days battery life."
    },
    {
      id: 19,
      name: "Huawei Watch GT 4 46mm Smartwatch",
      category: "Wearables",
      price: 10999,
      originalPrice: 12999,
      badge: "Popular",
      rating: 4.8,
      reviews: 185,
      image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=600&q=80",
      description: "Geometric octagonal stainless steel aesthetics, up to 14 days ultra-long battery life, TruSeen 5.5+ vital sign monitoring, and iOS/Android compatibility."
    },
    {
      id: 20,
      name: "Anker 737 Power Bank (PowerCore 24K 140W)",
      category: "Accessories",
      price: 6995,
      originalPrice: 8995,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 460,
      image: "https://images.unsplash.com/photo-1609592426868-b7a66fbc04a9?auto=format&fit=crop&w=600&q=80",
      description: "Ultra-powerful two-way fast charging with 140W output and 24,000mAh capacity. Features a smart digital display showing output wattage and recharge time."
    },
    {
      id: 21,
      name: "UGREEN Nexode 65W GaN Fast Charger 3-Port",
      category: "Accessories",
      price: 1499,
      originalPrice: 1999,
      badge: "Essential",
      rating: 4.9,
      reviews: 720,
      image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80",
      description: "Compact GaN III fast charger with 2x USB-C and 1x USB-A ports. Charges MacBook Air, iPhone 15, and Samsung phones simultaneously."
    },
    {
      id: 22,
      name: "UGREEN 9-in-1 USB-C Hub with 4K HDMI & Ethernet",
      category: "Accessories",
      price: 1899,
      originalPrice: 2499,
      badge: "Popular",
      rating: 4.8,
      reviews: 350,
      image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
      description: "Full aluminum expansion hub with 4K@60Hz HDMI, 100W PD charging, Gigabit RJ45 Ethernet, SD/TF card reader, and 3x USB 3.0 ports."
    },
    {
      id: 23,
      name: "Nintendo Switch OLED Model (White Joy-Con)",
      category: "Gaming",
      price: 14490,
      originalPrice: 16990,
      badge: "Best Seller",
      rating: 4.9,
      reviews: 820,
      image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=600&q=80",
      description: "7-inch vibrant OLED screen with deep blacks and rich colors, wide adjustable kickstand, wired LAN dock, and 64GB internal storage."
    },
    {
      id: 24,
      name: "Sony PlayStation 5 Slim Disc Edition",
      category: "Gaming",
      price: 27990,
      originalPrice: 30790,
      badge: "Hot Deal",
      rating: 4.9,
      reviews: 450,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
      description: "Slimmer PS5 console design with 1TB ultra-high speed SSD, ray tracing, 4K-TV gaming at up to 120fps, and DualSense haptic wireless controller."
    },
    {
      id: 25,
      name: "Logitech G502 HERO High Performance Gaming Mouse",
      category: "Gaming",
      price: 2395,
      originalPrice: 3295,
      badge: "Best Seller",
      rating: 4.8,
      reviews: 960,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
      description: "HERO 25K optical sensor with sub-micron tracking, 11 programmable buttons, adjustable weights, and customizable LIGHTSYNC RGB lighting."
    }
  ];

  async function fetchProducts() {
    if (allProducts.length > 0) return allProducts;
    try {
      const res = await fetch('products.json');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      allProducts = await res.json();
      return allProducts;
    } catch (err) {
      console.warn('Could not fetch products.json (e.g. file:// protocol restriction). Using embedded fallback products.', err);
      allProducts = [...EMBEDDED_PRODUCTS];
      return allProducts;
    }
  }

  function createProductCardHTML(product) {
    const discountPercent =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return `
      <article class="product-card" data-id="${product.id}" data-category="${escapeHtml(product.category)}">
        <div class="card-badges">
          <span class="badge-tag badge-category">${escapeHtml(product.category)}</span>
          ${product.badge ? `<span class="badge-tag badge-promo">${escapeHtml(product.badge)}</span>` : ''}
        </div>
        
        <div class="product-image-container">
          <img 
            src="${escapeHtml(product.image)}" 
            alt="${escapeHtml(product.name)}" 
            class="product-image" 
            loading="lazy" 
            width="300" 
            height="300"
            onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'"
          />
        </div>

        <div class="product-category-text">${escapeHtml(product.category)}</div>
        <h3 class="product-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>

        <div class="product-rating" aria-label="Rated ${product.rating} out of 5 stars with ${product.reviews} reviews">
          <div class="stars-wrapper" aria-hidden="true">${renderStars(product.rating)}</div>
          <span class="rating-score">${product.rating.toFixed(1)}</span>
          <span class="rating-count">(${product.reviews})</span>
        </div>

        <div class="product-price-row">
          <span class="current-price">${formatPeso(product.price)}</span>
          ${product.originalPrice && product.originalPrice > product.price ? `
            <span class="original-price">${formatPeso(product.originalPrice)}</span>
            <span class="discount-pill">-${discountPercent}%</span>
          ` : ''}
        </div>

        <button 
          type="button" 
          class="btn-add-cart" 
          data-product-id="${product.id}" 
          aria-label="Add ${escapeHtml(product.name)} to cart"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Add to Cart
        </button>
      </article>
    `;
  }

  function attachProductGridEventListeners(container) {
    container.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(btn.getAttribute('data-product-id'), 10);
        const product = allProducts.find((p) => p.id === productId);
        if (product) {
          addToCart(product, 1, btn);
        }
      });
    });
  }

  /* Catalog Page Controller (product.html) */
  async function initCatalogPage() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    await fetchProducts();

    // Check URL parameters for ?category=... or ?search=...
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (catParam) activeCategory = catParam;
    if (searchParam) activeSearchQuery = searchParam;

    // Setup Category Filter Pills
    const pillsContainer = document.getElementById('category-filter-pills');
    if (pillsContainer) {
      const pills = pillsContainer.querySelectorAll('.filter-pill');
      pills.forEach((pill) => {
        const cat = pill.getAttribute('data-category');
        if (cat === activeCategory) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }

        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          activeCategory = cat;
          renderFilteredCatalog();
        });
      });
    }

    // Setup Live Search Input on catalog page
    const catalogSearchInput = document.getElementById('catalog-search-input');
    const catalogSearchClear = document.getElementById('catalog-search-clear');

    if (catalogSearchInput) {
      if (activeSearchQuery) {
        catalogSearchInput.value = activeSearchQuery;
        if (catalogSearchClear) catalogSearchClear.classList.add('visible');
      }

      catalogSearchInput.addEventListener('input', (e) => {
        activeSearchQuery = e.target.value.trim();
        if (catalogSearchClear) {
          catalogSearchClear.classList.toggle('visible', activeSearchQuery.length > 0);
        }
        renderFilteredCatalog();
      });

      if (catalogSearchClear) {
        catalogSearchClear.addEventListener('click', () => {
          catalogSearchInput.value = '';
          activeSearchQuery = '';
          catalogSearchClear.classList.remove('visible');
          renderFilteredCatalog();
          catalogSearchInput.focus();
        });
      }
    }

    // Setup Sort Select
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        activeSortOption = e.target.value;
        renderFilteredCatalog();
      });
    }

    renderFilteredCatalog();
  }

  function handleCatalogSearch(query) {
    activeSearchQuery = query;
    const input = document.getElementById('catalog-search-input');
    const clearBtn = document.getElementById('catalog-search-clear');
    if (input) input.value = query;
    if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);
    renderFilteredCatalog();
  }

  function renderFilteredCatalog() {
    const grid = document.getElementById('product-grid');
    const countMeta = document.getElementById('product-count-meta');
    if (!grid) return;

    let filtered = [...allProducts];

    // Filter by category
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (activeSortOption === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSortOption === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (activeSortOption === 'name-az') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeSortOption === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Update count indicator
    if (countMeta) {
      countMeta.textContent = `Showing ${filtered.length} of ${allProducts.length} products`;
    }

    // Render items or empty state
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>No products found</h3>
          <p>We couldn't find any items matching "${escapeHtml(activeSearchQuery)}" in ${escapeHtml(activeCategory)}. Try clearing filters or using different keywords.</p>
          <button type="button" class="btn btn-secondary" id="reset-catalog-filters-btn">Reset Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('reset-catalog-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'All';
          activeSearchQuery = '';
          const pills = document.querySelectorAll('.filter-pill');
          pills.forEach((p) => p.classList.toggle('active', p.getAttribute('data-category') === 'All'));
          const searchInput = document.getElementById('catalog-search-input');
          if (searchInput) searchInput.value = '';
          const clearBtn = document.getElementById('catalog-search-clear');
          if (clearBtn) clearBtn.classList.remove('visible');
          renderFilteredCatalog();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(createProductCardHTML).join('');
    attachProductGridEventListeners(grid);
  }

  /* Home Storefront Page Controller (index.html) */
  async function initHomePage() {
    const featuredGrid = document.getElementById('featured-product-grid');
    if (!featuredGrid) return;

    await fetchProducts();

    // Render 8 featured products (products marked as Best Seller, Flash Deal, or high rating)
    const featured = allProducts
      .filter((p) => p.badge || p.rating >= 4.8)
      .slice(0, 8);

    featuredGrid.innerHTML = featured.map(createProductCardHTML).join('');
    attachProductGridEventListeners(featuredGrid);
  }

  /* ==========================================================================
     Shopping Cart Page Controller (cart.html)
     ========================================================================== */

  function initCartPage() {
    const cartRoot = document.getElementById('cart-page-root');
    if (!cartRoot) return;

    renderCartView();

    // Re-render when cart updates
    window.addEventListener('cart-updated', () => {
      renderCartView();
    });
  }

  function renderCartView() {
    const cartRoot = document.getElementById('cart-page-root');
    if (!cartRoot) return;

    const cart = getCart();

    if (cart.length === 0) {
      cartRoot.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3>No products in your cart yet</h3>
          <p>Explore our best-selling smartphones, laptops, audio gear, and gaming tech to fill your cart.</p>
          <a href="product.html" class="btn btn-lg">Go to Products</a>
        </div>
      `;
      return;
    }

    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    // Free shipping threshold
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const shippingProgressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    // Promo code discount
    const appliedPromo = localStorage.getItem(PROMO_CODE_STORAGE_KEY);
    let promoDiscount = 0;
    if (appliedPromo === VALID_PROMO_CODE) {
      promoDiscount = Math.min(subtotal, PROMO_DISCOUNT_AMOUNT);
    }

    const grandTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

    cartRoot.innerHTML = `
      <div class="cart-layout">
        <!-- Cart Items List -->
        <section class="cart-items-panel" aria-label="Cart Items">
          <div class="cart-panel-header">
            <h2 class="cart-panel-title">Your Items (${getCartCount()})</h2>
            <button type="button" class="cart-clear-btn" id="btn-clear-cart">Clear Cart</button>
          </div>

          <div class="cart-items-list">
            ${cart
              .map(
                (item) => `
              <div class="cart-item-row" data-id="${item.id}">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" loading="lazy" />
                
                <div class="cart-item-details">
                  <span class="cart-item-category">${escapeHtml(item.category)}</span>
                  <h3 class="cart-item-title">${escapeHtml(item.name)}</h3>
                  <span class="cart-item-unit-price">${formatPeso(item.price)} each</span>
                </div>

                <div class="qty-controller">
                  <button type="button" class="qty-btn btn-qty-dec" data-id="${item.id}" aria-label="Decrease quantity for ${escapeHtml(item.name)}">−</button>
                  <input type="text" readonly class="qty-input" value="${item.quantity}" aria-label="Quantity">
                  <button type="button" class="qty-btn btn-qty-inc" data-id="${item.id}" aria-label="Increase quantity for ${escapeHtml(item.name)}">+</button>
                </div>

                <div class="cart-item-subtotal">
                  ${formatPeso(item.price * item.quantity)}
                </div>

                <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)} from cart">
                  <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </section>

        <!-- Order Summary Card -->
        <aside class="order-summary-card" aria-label="Order Summary">
          <h2 class="summary-title">Order Summary</h2>

          <!-- Free Shipping Progress Indicator -->
          <div class="shipping-progress-wrapper">
            <div class="shipping-progress-text">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              ${
                isFreeShipping
                  ? `<span class="shipping-unlocked-msg">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="celebration-icon" aria-hidden="true">
                        <polygon points="2 22 8 20 20 8 16 4 4 16 2 22"></polygon>
                        <circle cx="18" cy="4" r="1.5" fill="currentColor"></circle>
                        <circle cx="21" cy="9" r="1.2" fill="currentColor"></circle>
                        <circle cx="14" cy="2" r="1.2" fill="currentColor"></circle>
                        <line x1="8" y1="12" x2="12" y2="16"></line>
                        <path d="M19 13l2 2"></path>
                        <path d="M15 17l1.5 2.5"></path>
                      </svg>
                      You've unlocked <strong>FREE Shipping!</strong>
                    </span>`
                  : `<span>Add <strong>${formatPeso(remainingForFreeShipping)}</strong> more for FREE Shipping!</span>`
              }
            </div>
            <div class="shipping-progress-bar-bg">
              <div class="shipping-progress-bar-fill" style="width: ${shippingProgressPercent}%"></div>
            </div>
          </div>

          <div class="summary-row">
            <span>Items Subtotal</span>
            <span>${formatPeso(subtotal)}</span>
          </div>

          <div class="summary-row">
            <span>Estimated Shipping</span>
            <span>${isFreeShipping ? '<strong style="color:var(--color-success)">FREE</strong>' : formatPeso(shippingFee)}</span>
          </div>

          ${
            promoDiscount > 0
              ? `
            <div class="summary-row" style="color:var(--color-success)">
              <span>Promo Code (${escapeHtml(appliedPromo)})</span>
              <span>-${formatPeso(promoDiscount)}</span>
            </div>
          `
              : ''
          }

          <!-- Promo Code Box -->
          <form class="promo-box" id="promo-code-form">
            <input 
              type="text" 
              class="promo-input" 
              id="promo-code-input" 
              placeholder="Promo code (SHOPYEAH100)" 
              value="${appliedPromo ? escapeHtml(appliedPromo) : ''}"
              aria-label="Promo Code"
            />
            <button type="submit" class="btn btn-secondary btn-sm" id="btn-apply-promo">
              ${appliedPromo ? 'Applied' : 'Apply'}
            </button>
          </form>
          <div id="promo-feedback-msg" class="promo-message"></div>

          <div class="summary-row total-row">
            <span>Grand Total</span>
            <span class="total-amount">${formatPeso(grandTotal)}</span>
          </div>

          <button type="button" class="btn btn-block btn-lg" id="btn-proceed-checkout">
            Proceed to Checkout
          </button>

          <div class="checkout-trust-badges">
            <span class="checkout-trust-pill">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lock-icon" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secure Checkout
            </span>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>GCash / Maya</span>
          </div>
        </aside>
      </div>

      <!-- Checkout Confirmation Modal -->
      <div class="modal-overlay" id="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
        <div class="modal-content">
          <button type="button" class="modal-close-btn" id="modal-close-x" aria-label="Close checkout modal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="modal-header">
            <h2 class="modal-title" id="checkout-modal-title">Complete Your Order</h2>
            <p class="modal-subtitle">Review your shipping details to place your SHOPYEAH order.</p>
          </div>

          <form id="checkout-form">
            <div class="form-group">
              <label class="form-label" for="checkout-name">Full Name *</label>
              <input type="text" id="checkout-name" class="form-input" required placeholder="e.g. Juan Dela Cruz">
            </div>

            <div class="form-group">
              <label class="form-label" for="checkout-phone">Mobile Phone Number *</label>
              <input type="tel" id="checkout-phone" class="form-input" required placeholder="e.g. 09171234567">
            </div>

            <div class="form-group">
              <label class="form-label" for="checkout-address">Complete Delivery Address *</label>
              <textarea id="checkout-address" class="form-textarea" required rows="3" placeholder="House/Unit No., Street, Barangay, City, Province"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="checkout-payment">Payment Method *</label>
              <select id="checkout-payment" class="form-select" required>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="gcash">GCash E-Wallet</option>
                <option value="maya">Maya / Online Banking</option>
                <option value="card">Credit / Debit Card</option>
              </select>
            </div>

            <div style="background-color:var(--color-bg); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.5rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                <span style="font-size:0.875rem; color:var(--color-text-muted);">Amount to Pay:</span>
                <span style="font-size:1.125rem; font-weight:800; color:var(--color-primary);">${formatPeso(grandTotal)}</span>
              </div>
              <p style="font-size:0.75rem; color:var(--color-text-light); margin:0;">Includes standard delivery & applicable promos.</p>
            </div>

            <button type="submit" class="btn btn-block btn-lg" id="btn-submit-order">
              Confirm & Place Order
            </button>
          </form>
        </div>
      </div>

      <!-- Order Success Modal -->
      <div class="modal-overlay" id="order-success-modal" role="dialog" aria-modal="true">
        <div class="modal-content" style="text-align:center;">
          <div class="modal-icon-success">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 class="modal-title">Salamat! Order Confirmed</h2>
          <p class="modal-subtitle" style="margin-bottom:1.25rem;">
            Your gadget order <strong id="success-tracking-id">#SY-72819</strong> has been received and is being prepared for fast nationwide dispatch.
          </p>
          <div style="background:var(--color-bg); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.75rem; font-size:0.875rem; text-align:left;">
            <p style="margin-bottom:0.4rem;"><strong>Payment:</strong> <span id="success-payment-method">Cash on Delivery</span></p>
            <p style="margin-bottom:0.4rem;"><strong>Delivery To:</strong> <span id="success-recipient">Juan Dela Cruz</span></p>
            <p style="margin:0;"><strong>Estimated Arrival:</strong> 2–4 Business Days</p>
          </div>
          <a href="product.html" class="btn btn-block btn-lg">Continue Shopping</a>
        </div>
      </div>
    `;

    // Attach Cart Action Listeners
    attachCartEventListeners();
  }

  function attachCartEventListeners() {
    // Quantity Decrement
    document.querySelectorAll('.btn-qty-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          updateCartQuantity(id, item.quantity - 1);
        }
      });
    });

    // Quantity Increment
    document.querySelectorAll('.btn-qty-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          updateCartQuantity(id, item.quantity + 1);
        }
      });
    });

    // Remove item
    document.querySelectorAll('.cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        removeFromCart(id);
      });
    });

    // Clear cart button
    const clearBtn = document.getElementById('btn-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.confirm('Are you sure you want to clear all items in your cart?')) {
          clearCart();
        }
      });
    }

    // Promo Code Application Form
    const promoForm = document.getElementById('promo-code-form');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('promo-code-input');
        const feedback = document.getElementById('promo-feedback-msg');
        const code = input ? input.value.trim().toUpperCase() : '';

        if (!code) {
          localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
          renderCartView();
          return;
        }

        if (code === VALID_PROMO_CODE) {
          localStorage.setItem(PROMO_CODE_STORAGE_KEY, VALID_PROMO_CODE);
          renderCartView();
          showToast('Promo code applied: ₱100 OFF!', 'success');
        } else {
          if (feedback) {
            feedback.className = 'promo-message error';
            feedback.textContent = 'Invalid promo code. Try SHOPYEAH100';
          }
        }
      });
    }

    // Checkout Modal Triggers
    const checkoutBtn = document.getElementById('btn-proceed-checkout');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseX = document.getElementById('modal-close-x');
    const checkoutForm = document.getElementById('checkout-form');
    const successModal = document.getElementById('order-success-modal');

    if (checkoutBtn && checkoutModal) {
      checkoutBtn.addEventListener('click', () => {
        checkoutModal.classList.add('is-active');
      });

      if (modalCloseX) {
        modalCloseX.addEventListener('click', () => {
          checkoutModal.classList.remove('is-active');
        });
      }

      checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
          checkoutModal.classList.remove('is-active');
        }
      });
    }

    // Checkout Form Submission
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('checkout-name').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const payment = document.getElementById('checkout-payment');
        const paymentText = payment ? payment.options[payment.selectedIndex].text : 'Cash on Delivery';

        if (!name || !phone || !address) {
          showToast('Please complete all required shipping fields', 'error');
          return;
        }

        const simulatedTrackingId = '#SY-' + Math.floor(100000 + Math.random() * 900000);

        // Hide checkout modal
        if (checkoutModal) checkoutModal.classList.remove('is-active');

        // Clear cart
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
        updateCartBadge();

        // Populate and show success modal
        if (successModal) {
          const trackSpan = document.getElementById('success-tracking-id');
          const paySpan = document.getElementById('success-payment-method');
          const recSpan = document.getElementById('success-recipient');

          if (trackSpan) trackSpan.textContent = simulatedTrackingId;
          if (paySpan) paySpan.textContent = paymentText;
          if (recSpan) recSpan.textContent = name;

          successModal.classList.add('is-active');
        }

        showToast('Order confirmed successfully!', 'success');
      });
    }
  }

  /* ==========================================================================
     Contact Page Form Controller (contact.html)
     ========================================================================== */

  function initContactPage() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields', 'error');
        return;
      }

      const formPanel = document.querySelector('.contact-form-panel');
      if (formPanel) {
        formPanel.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem;">
            <div class="modal-icon-success">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary-dark); margin-bottom: 0.5rem;">
              Message Received!
            </h2>
            <p style="color: var(--color-text-muted); font-size: 0.9375rem; margin-bottom: 1.5rem;">
              Thank you, <strong>${escapeHtml(name)}</strong>. Our customer care representative will respond to <strong>${escapeHtml(email)}</strong> within 24 business hours.
            </p>
            <a href="product.html" class="btn btn-secondary">Explore Our Catalog</a>
          </div>
        `;
      }

      showToast('Your message has been sent successfully!', 'success');
    });
  }

  /* ==========================================================================
     Application Bootstrapper
     ========================================================================== */

  function initApp() {
    initHeader();
    initHomePage();
    initCatalogPage();
    initCartPage();
    initContactPage();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
