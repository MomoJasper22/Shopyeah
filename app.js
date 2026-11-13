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

  const BUY_NOW_STORAGE_KEY = 'shopyeah_buy_now_item';
  const MAX_QTY = 10;

  /* ==========================================================================
     Product Options (color, storage, memory, size, add-ons)
     --------------------------------------------------------------------------
     Keyed by product id. The value flagged `default` (or the first value) is
     pre-selected and priced at +0. `delta` is the peso change vs. the listed
     price. Products with no entry here simply have no options.
     To edit prices/colors, change this table only.
     ========================================================================== */
  const COLOR = (label, hex) => ({ label, hex });
  const OPT = (label, delta = 0, isDefault = false) => ({ label, delta, default: isDefault });
  const colors = (name, values) => ({ name, kind: 'color', values });
  const choices = (name, values) => ({ name, kind: 'chip', values });

  const PRODUCT_OPTIONS = {
    // Smartphones
    1: {
      title: 'Apple iPhone 15 Pro Max',
      groups: [
        colors('Color', [COLOR('Natural Titanium', '#b9b3a8'), COLOR('Blue Titanium', '#3f4a5a'), COLOR('White Titanium', '#e8e6e1'), COLOR('Black Titanium', '#2b2c2e')]),
        choices('Storage', [OPT('256GB'), OPT('512GB', 9000), OPT('1TB', 20000)]),
      ],
    },
    2: {
      title: 'Samsung Galaxy S24 Ultra 5G',
      groups: [
        colors('Color', [COLOR('Titanium Black', '#2a2a2c'), COLOR('Titanium Gray', '#8d8f92'), COLOR('Titanium Violet', '#8f84a8'), COLOR('Titanium Yellow', '#e3d38a')]),
        choices('Storage', [OPT('256GB', -5000), OPT('512GB', 0, true), OPT('1TB', 10000)]),
      ],
    },
    3: {
      title: 'POCO X6 Pro 5G',
      groups: [
        colors('Color', [COLOR('Black', '#1f1f22'), COLOR('Gray', '#8b8e94'), COLOR('Yellow', '#f2d12e')]),
        choices('Memory + Storage', [OPT('8GB + 256GB', -2000), OPT('12GB + 512GB', 0, true)]),
      ],
    },
    4: {
      groups: [
        colors('Color', [COLOR('Midnight Black', '#222428'), COLOR('Aurora Purple', '#a995d6'), COLOR('Moonlight White', '#eef0f2')]),
        choices('Memory + Storage', [OPT('8GB + 256GB'), OPT('12GB + 512GB', 3000)]),
      ],
    },
    // Laptops
    5: {
      title: 'Apple MacBook Air 13.6" M2 Chip',
      groups: [
        colors('Color', [COLOR('Midnight', '#2e3642'), COLOR('Starlight', '#efe6d8'), COLOR('Space Gray', '#7d7e80'), COLOR('Silver', '#d9dadc')]),
        choices('Memory', [OPT('8GB'), OPT('16GB', 9000)]),
        choices('Storage', [OPT('256GB'), OPT('512GB', 10000), OPT('1TB', 22000)]),
      ],
    },
    6: {
      groups: [
        choices('Memory', [OPT('16GB'), OPT('32GB', 4500)]),
        choices('Storage', [OPT('512GB'), OPT('1TB', 3500)]),
      ],
    },
    7: {
      groups: [
        choices('Memory', [OPT('8GB'), OPT('16GB', 2500)]),
        choices('Storage', [OPT('512GB'), OPT('1TB', 3000)]),
      ],
    },
    8: {
      groups: [
        colors('Color', [COLOR('Arctic Grey', '#b8bcc2'), COLOR('Abyss Blue', '#2f4a73')]),
        choices('Storage', [OPT('512GB'), OPT('1TB', 2500)]),
      ],
    },
    // Audio
    9: {
      groups: [choices('Ear tip size', [OPT('XS'), OPT('S'), OPT('M', 0, true), OPT('L')])],
    },
    10: {
      groups: [colors('Color', [COLOR('Black', '#1e1e20'), COLOR('Silver', '#d6d6d6'), COLOR('Midnight Blue', '#1f2f4f')])],
    },
    11: {
      groups: [colors('Color', [COLOR('Black & Brass', '#1c1c1c'), COLOR('Cream', '#efe4cc')])],
    },
    12: {
      groups: [colors('Color', [COLOR('Black', '#1c1c1c'), COLOR('Blue', '#2a6ad6'), COLOR('Red', '#d62f2f'), COLOR('Teal', '#1ea39a')])],
    },
    // Tablets
    13: {
      title: 'Apple iPad 10th Gen 10.9" Wi-Fi',
      groups: [
        colors('Color', [COLOR('Blue', '#6fa0d6'), COLOR('Pink', '#eba4b8'), COLOR('Yellow', '#f0d56c'), COLOR('Silver', '#d9dadc')]),
        choices('Storage', [OPT('64GB'), OPT('256GB', 10000)]),
      ],
    },
    14: {
      title: 'Xiaomi Pad 6',
      groups: [
        colors('Color', [COLOR('Gravity Gray', '#6d7076'), COLOR('Mist Blue', '#9fb7cf')]),
        choices('Memory + Storage', [OPT('6GB + 128GB', -3000), OPT('8GB + 256GB', 0, true)]),
      ],
    },
    15: {
      title: 'Samsung Galaxy Tab S9 FE 10.9" with S-Pen',
      groups: [
        colors('Color', [COLOR('Gray', '#7c7f85'), COLOR('Mint', '#b5dccb'), COLOR('Lavender', '#c3b7e0')]),
        choices('Storage', [OPT('128GB'), OPT('256GB', 3500)]),
      ],
    },
    // Wearables
    16: {
      title: 'Apple Watch Series 9 GPS',
      groups: [
        colors('Color', [COLOR('Midnight', '#232a35'), COLOR('Starlight', '#eee6d8'), COLOR('Pink', '#f1c9c9'), COLOR('Silver', '#d9dadc')]),
        choices('Case size', [OPT('41mm'), OPT('45mm', 2000)]),
      ],
    },
    17: {
      title: 'Samsung Galaxy Watch 6 Bluetooth',
      groups: [
        colors('Color', [COLOR('Graphite', '#3a3b3f'), COLOR('Silver', '#d3d3d6')]),
        choices('Case size', [OPT('40mm', -1000), OPT('44mm', 0, true)]),
      ],
    },
    18: {
      groups: [colors('Strap color', [COLOR('Black', '#1c1c1c'), COLOR('Pink', '#f2a1b8'), COLOR('Blue', '#3b82f6')])],
    },
    19: {
      groups: [colors('Strap', [COLOR('Black', '#202022'), COLOR('Brown', '#7a5238'), COLOR('Green', '#5b7a5a')])],
    },
    // Accessories
    21: {
      groups: [colors('Color', [COLOR('White', '#f2f2f2'), COLOR('Black', '#1d1d1f')])],
    },
    22: {
      groups: [colors('Color', [COLOR('Space Gray', '#6b6d72'), COLOR('Silver', '#d4d6d9')])],
    },
    // Gaming
    23: {
      groups: [
        colors('Joy-Con color', [COLOR('White', '#eeeeee'), COLOR('Neon Blue / Neon Red', 'linear-gradient(90deg,#00c3e3 50%,#ff4554 50%)')]),
        choices('Add-on', [OPT('None'), OPT('128GB microSD card', 1200), OPT('256GB microSD card', 2000)]),
      ],
    },
    24: {
      groups: [choices('Add-on', [OPT('None'), OPT('Extra DualSense controller', 4000)])],
    },
  };

  let buyNowMode = false;
  let buyNowModalShown = false;
  let detailState = null;
  let detailLastFocus = null;

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

  /* A cart line is unique per product + chosen options (e.g. "1|Blue Titanium|512GB").
     Older saved carts have no key, so fall back to the product id. */
  function itemKey(item) {
    return item.key || String(item.id);
  }

  function getBuyNowItem() {
    try {
      const data = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setBuyNowItem(item) {
    try {
      if (item) sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(item));
      else sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
    } catch (e) {
      console.error('Error saving Buy Now item', e);
    }
  }

  /* On the cart page the visible items are either the saved cart or the single Buy Now item. */
  function getCartItems() {
    if (buyNowMode) {
      const item = getBuyNowItem();
      return item ? [item] : [];
    }
    return getCart();
  }

  function setCartItems(items) {
    if (buyNowMode) {
      setBuyNowItem(items[0] || null);
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: items } }));
    } else {
      saveCart(items);
    }
  }

  function buildCartItem(product, variant, quantity) {
    return {
      id: product.id,
      key: variant.key,
      name: variant.title,
      category: product.category,
      price: variant.price,
      originalPrice: variant.originalPrice,
      image: product.image,
      quantity: quantity,
      variantLabel: variant.label,
      options: variant.options,
    };
  }

  function addToCart(product, quantity = 1, triggerBtn = null, variant = null) {
    const v = variant || computeVariant(product, defaultSelections(getProductConfig(product)));
    const cart = getCart();
    const existingIndex = cart.findIndex((item) => itemKey(item) === v.key);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(buildCartItem(product, v, quantity));
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

    showToast(`Added "${v.title}"${v.label ? ` (${v.label})` : ''} to cart!`, 'success');
  }

  function buyNow(product, quantity, variant) {
    const item = buildCartItem(product, variant, quantity);
    setBuyNowItem(item);
    const session = getSession();
    if (!session) {
      showToast('Please sign in or create an account to proceed to checkout', 'info');
      setTimeout(() => {
        window.location.href = 'auth.html?next=' + encodeURIComponent('cart.html?buynow=1');
      }, 700);
      return;
    }
    window.location.href = 'cart.html?buynow=1';
  }

  function updateCartQuantity(key, newQty) {
    let cart = getCartItems();
    if (newQty <= 0) {
      cart = cart.filter((item) => itemKey(item) !== key);
      showToast('Item removed from cart', 'info');
    } else {
      const item = cart.find((i) => itemKey(i) === key);
      if (item) item.quantity = newQty;
    }
    setCartItems(cart);
  }

  function removeFromCart(key) {
    const cart = getCartItems().filter((item) => itemKey(item) !== key);
    setCartItems(cart);
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
    const hasOptions = productHasOptions(product);
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
        
        <div class="product-image-container" data-open-product="${product.id}">
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
        <h3 class="product-title" title="${escapeHtml(product.name)}"><button type="button" class="product-open-btn" data-open-product="${product.id}">${escapeHtml(product.name)}</button></h3>

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
          aria-label="${hasOptions ? 'Check' : 'Add'} ${escapeHtml(product.name)}${hasOptions ? '' : ' to cart'}"
        >
          ${hasOptions ? `Check` : `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Add to Cart`}
        </button>
      </article>
    `;
  }

  function attachProductGridEventListeners(container) {
    container.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.getAttribute('data-product-id'), 10);
        const product = allProducts.find((p) => p.id === productId);
        if (!product) return;
        if (productHasOptions(product)) {
          openProductDetail(product.id, btn);
        } else {
          addToCart(product, 1, btn);
        }
      });
    });

    container.querySelectorAll('[data-open-product]').forEach((el) => {
      el.addEventListener('click', () => {
        openProductDetail(parseInt(el.getAttribute('data-open-product'), 10), el.matches('button') ? el : null);
      });
    });
  }

  /* ==========================================================================
     Product Detail Modal (choose options, then Add to Cart or Buy Now)
     ========================================================================== */

  function getProductConfig(product) {
    return PRODUCT_OPTIONS[product.id] || null;
  }

  function productHasOptions(product) {
    const config = getProductConfig(product);
    return !!(config && config.groups && config.groups.length);
  }

  function defaultSelections(config) {
    const selections = {};
    ((config && config.groups) || []).forEach((group) => {
      const pick = group.values.find((v) => v.default) || group.values[0];
      selections[group.name] = pick.label;
    });
    return selections;
  }

  /* Turns the chosen options into the price, name and key used by the cart. */
  function computeVariant(product, selections) {
    const config = getProductConfig(product);
    const options = {};
    const labels = [];
    let delta = 0;

    ((config && config.groups) || []).forEach((group) => {
      const value = group.values.find((v) => v.label === selections[group.name]) || group.values[0];
      options[group.name] = value.label;
      labels.push(value.label);
      delta += value.delta || 0;
    });

    const originalBase = product.originalPrice || product.price;
    return {
      key: [product.id, ...labels].join('|'),
      title: (config && config.title) || product.name,
      options: options,
      label: labels.join(', '),
      price: product.price + delta,
      originalPrice: originalBase + delta,
    };
  }

  function formatDelta(delta) {
    if (!delta) return '';
    return (delta > 0 ? '+' : '−') + formatPeso(Math.abs(delta));
  }

  function ensureDetailModal() {
    let overlay = document.getElementById('product-detail-modal');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'product-detail-modal';
    overlay.className = 'modal-overlay pd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pd-title');
    overlay.innerHTML = `
      <div class="modal-content pd-content">
        <button type="button" class="modal-close-btn pd-close" id="pd-close" aria-label="Close product details">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div id="pd-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeProductDetail();
    });
    overlay.querySelector('#pd-close').addEventListener('click', closeProductDetail);

    overlay.addEventListener('change', (e) => {
      const input = e.target;
      if (!detailState) return;
      if (input.matches('input[data-group]')) {
        detailState.selections[input.getAttribute('data-group')] = input.value;
        updateDetailDynamic();
      } else if (input.id === 'pd-qty-input') {
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 1) {
          val = 1;
        } else if (val > MAX_QTY) {
          val = MAX_QTY;
          showToast(`Maximum quantity of ${MAX_QTY} per item`, 'info');
        }
        detailState.qty = val;
        input.value = val;
        updateDetailDynamic();
      }
    });

    overlay.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'pd-qty-input' && detailState) {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1) {
          if (val > MAX_QTY) {
            val = MAX_QTY;
            e.target.value = MAX_QTY;
            showToast(`Maximum quantity of ${MAX_QTY} per item`, 'info');
          }
          detailState.qty = val;
          const v = computeVariant(detailState.product, detailState.selections);
          const totalEl = document.getElementById('pd-total');
          if (totalEl) totalEl.textContent = formatPeso(v.price * val);
          const decBtn = document.getElementById('pd-qty-dec');
          const incBtn = document.getElementById('pd-qty-inc');
          if (decBtn) decBtn.disabled = val <= 1;
          if (incBtn) incBtn.disabled = val >= MAX_QTY;
        }
      }
    });

    overlay.addEventListener('keydown', (e) => {
      if (e.target && e.target.id === 'pd-qty-input' && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (!detailState) return;
      const qtyBtn = e.target.closest('[data-pd-qty]');
      if (qtyBtn) {
        const step = qtyBtn.getAttribute('data-pd-qty') === 'inc' ? 1 : -1;
        detailState.qty = Math.min(MAX_QTY, Math.max(1, detailState.qty + step));
        const qtyInput = document.getElementById('pd-qty-input');
        if (qtyInput) qtyInput.value = detailState.qty;
        updateDetailDynamic();
        return;
      }
      const addBtn = e.target.closest('#pd-add');
      if (addBtn) {
        const qtyInput = document.getElementById('pd-qty-input');
        if (qtyInput) {
          const val = parseInt(qtyInput.value, 10);
          if (!isNaN(val) && val >= 1) {
            detailState.qty = Math.min(MAX_QTY, Math.max(1, val));
          }
        }
        const { product, selections, qty } = detailState;
        addToCart(product, qty, addBtn, computeVariant(product, selections));
        return;
      }
      if (e.target.closest('#pd-buy')) {
        const qtyInput = document.getElementById('pd-qty-input');
        if (qtyInput) {
          const val = parseInt(qtyInput.value, 10);
          if (!isNaN(val) && val >= 1) {
            detailState.qty = Math.min(MAX_QTY, Math.max(1, val));
          }
        }
        const { product, selections, qty } = detailState;
        buyNow(product, qty, computeVariant(product, selections));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-active')) return;
      if (e.key === 'Escape') {
        closeProductDetail();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    return overlay;
  }

  function buildDetailHTML(state) {
    const { product, config } = state;
    const title = (config && config.title) || product.name;

    const groupsHtml = ((config && config.groups) || [])
      .map((group, gi) => {
        const selected = state.selections[group.name];
        const items = group.values
          .map((v) => {
            const checked = v.label === selected ? 'checked' : '';
            const common = `type="radio" name="pd-opt-${gi}" value="${escapeHtml(v.label)}" data-group="${escapeHtml(group.name)}" ${checked}`;
            if (group.kind === 'color') {
              return `
                <label class="pd-swatch" title="${escapeHtml(v.label)}">
                  <input ${common} aria-label="${escapeHtml(v.label)}">
                  <span class="pd-swatch-face" style="background:${escapeHtml(v.hex)}"></span>
                </label>`;
            }
            const delta = formatDelta(v.delta);
            return `
              <label class="pd-chip">
                <input ${common}>
                <span class="pd-chip-face">
                  <span class="pd-chip-label">${escapeHtml(v.label)}</span>
                  ${delta ? `<span class="pd-chip-delta">${delta}</span>` : ''}
                </span>
              </label>`;
          })
          .join('');

        return `
          <div class="pd-group" role="radiogroup" aria-labelledby="pd-group-${gi}">
            <div class="pd-group-head">
              <span class="pd-group-name" id="pd-group-${gi}">${escapeHtml(group.name)}</span>
              <span class="pd-group-value" data-selected-for="${escapeHtml(group.name)}">${escapeHtml(selected)}</span>
            </div>
            <div class="pd-options ${group.kind === 'color' ? 'pd-options-color' : 'pd-options-chip'}">${items}</div>
          </div>`;
      })
      .join('');

    return `
      <div class="pd-layout">
        <div class="pd-media">
          <div class="pd-badges">
            ${product.badge ? `<span class="badge-tag badge-promo">${escapeHtml(product.badge)}</span>` : ''}
          </div>
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(title)}" class="pd-image"
               onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'" />
        </div>

        <div class="pd-info">
          <div class="product-category-text">${escapeHtml(product.category)}</div>
          <h2 class="pd-title" id="pd-title">${escapeHtml(title)}</h2>

          <div class="product-rating" aria-label="Rated ${product.rating} out of 5 stars with ${product.reviews} reviews">
            <div class="stars-wrapper" aria-hidden="true">${renderStars(product.rating)}</div>
            <span class="rating-score">${product.rating.toFixed(1)}</span>
            <span class="rating-count">(${product.reviews} reviews)</span>
          </div>

          <div class="pd-price-row" aria-live="polite">
            <span class="pd-price" id="pd-price"></span>
            <span class="original-price" id="pd-original"></span>
            <span class="discount-pill" id="pd-discount"></span>
          </div>

          <p class="pd-desc">${escapeHtml(product.description || '')}</p>

          ${groupsHtml ? `<div class="pd-groups">${groupsHtml}</div>` : ''}

          <div class="pd-qty-row">
            <span class="pd-group-name" id="pd-qty-label">Quantity</span>
            <div class="pd-qty" role="group" aria-labelledby="pd-qty-label">
              <button type="button" class="pd-qty-btn" data-pd-qty="dec" id="pd-qty-dec" aria-label="Decrease quantity">−</button>
              <input type="number" class="pd-qty-input" id="pd-qty-input" min="1" max="${MAX_QTY}" value="${state.qty || 1}" aria-label="Quantity">
              <button type="button" class="pd-qty-btn" data-pd-qty="inc" id="pd-qty-inc" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="pd-actions">
            <div class="pd-total-row">
              <span>Total</span>
              <strong id="pd-total"></strong>
            </div>
            <div class="pd-buttons">
              <button type="button" class="btn btn-secondary btn-lg pd-btn" id="pd-add">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add to Cart</span>
              </button>
              <button type="button" class="btn btn-lg pd-btn" id="pd-buy">Buy Now</button>
            </div>
            <p class="pd-perks">Official warranty. Free shipping on orders over ${formatPeso(FREE_SHIPPING_THRESHOLD)}. Pay by COD, GCash, Maya or card.</p>
          </div>
        </div>
      </div>
    `;
  }

  /* Updates only the parts that change with the options, so keyboard focus is never lost. */
  function updateDetailDynamic() {
    if (!detailState) return;
    const { product, selections, qty } = detailState;
    const v = computeVariant(product, selections);
    const byId = (id) => document.getElementById(id);

    byId('pd-price').textContent = formatPeso(v.price);

    const hasDiscount = v.originalPrice > v.price;
    const original = byId('pd-original');
    const pill = byId('pd-discount');
    original.hidden = !hasDiscount;
    pill.hidden = !hasDiscount;
    if (hasDiscount) {
      original.textContent = formatPeso(v.originalPrice);
      pill.textContent = '-' + Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100) + '%';
    }

    byId('pd-total').textContent = formatPeso(v.price * qty);
    const qtyInput = byId('pd-qty-input');
    if (qtyInput && document.activeElement !== qtyInput) {
      qtyInput.value = qty;
    }
    const qtyVal = byId('pd-qty-value');
    if (qtyVal) qtyVal.textContent = qty;
    byId('pd-qty-dec').disabled = qty <= 1;
    byId('pd-qty-inc').disabled = qty >= MAX_QTY;

    document.querySelectorAll('#product-detail-modal [data-selected-for]').forEach((el) => {
      el.textContent = selections[el.getAttribute('data-selected-for')] || '';
    });
  }

  function openProductDetail(productId, triggerEl) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    const overlay = ensureDetailModal();
    const config = getProductConfig(product);
    detailState = { product, config, selections: defaultSelections(config), qty: 1 };
    detailLastFocus = triggerEl || document.activeElement;

    document.getElementById('pd-body').innerHTML = buildDetailHTML(detailState);
    updateDetailDynamic();

    overlay.querySelector('.pd-content').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('is-active');
    overlay.querySelector('#pd-close').focus();
  }

  function closeProductDetail() {
    const overlay = document.getElementById('product-detail-modal');
    if (!overlay) return;
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
    detailState = null;
    if (detailLastFocus && typeof detailLastFocus.focus === 'function') detailLastFocus.focus();
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

    buyNowMode = new URLSearchParams(window.location.search).get('buynow') === '1' && !!getBuyNowItem();
    if (!buyNowMode) setBuyNowItem(null);

    renderCartView();

    // Re-render when cart updates
    window.addEventListener('cart-updated', () => {
      renderCartView();
    });
  }

  function renderCartView() {
    const cartRoot = document.getElementById('cart-page-root');
    if (!cartRoot) return;

    const cart = getCartItems();
    const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

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
            <h2 class="cart-panel-title">${buyNowMode ? 'Buy Now' : 'Your Items'} (${itemCount})</h2>
            ${buyNowMode ? '' : '<button type="button" class="cart-clear-btn" id="btn-clear-cart">Clear Cart</button>'}
          </div>

          ${buyNowMode ? `
          <div class="buynow-banner">
            <span>You're checking out this item only. Your saved cart is unchanged.</span>
            <a href="cart.html">View full cart</a>
          </div>` : ''}

          <div class="cart-items-list">
            ${cart
              .map(
                (item) => `
              <div class="cart-item-row" data-key="${escapeHtml(itemKey(item))}">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" loading="lazy" />
                
                <div class="cart-item-details">
                  <span class="cart-item-category">${escapeHtml(item.category)}</span>
                  <h3 class="cart-item-title">${escapeHtml(item.name)}</h3>
                  ${item.variantLabel ? `<span class="cart-item-variant">${escapeHtml(item.variantLabel)}</span>` : ''}
                  <span class="cart-item-unit-price">${formatPeso(item.price)} each</span>
                </div>

                <div class="qty-controller">
                  <button type="button" class="qty-btn btn-qty-dec" data-key="${escapeHtml(itemKey(item))}" aria-label="Decrease quantity for ${escapeHtml(item.name)}">−</button>
                  <input type="number" min="1" max="${MAX_QTY}" class="qty-input" value="${item.quantity}" data-key="${escapeHtml(itemKey(item))}" aria-label="Quantity for ${escapeHtml(item.name)}">
                  <button type="button" class="qty-btn btn-qty-inc" data-key="${escapeHtml(itemKey(item))}" aria-label="Increase quantity for ${escapeHtml(item.name)}">+</button>
                </div>

                <div class="cart-item-subtotal">
                  ${formatPeso(item.price * item.quantity)}
                </div>

                <button type="button" class="cart-item-remove" data-key="${escapeHtml(itemKey(item))}" aria-label="Remove ${escapeHtml(item.name)} from cart">
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
              <input type="text" id="checkout-name" class="form-input" required placeholder="e.g. Juan Dela Cruz" value="${escapeHtml((getSession() || {}).name || '')}">
            </div>

            <div class="form-group">
              <label class="form-label" for="checkout-phone">Mobile Phone Number *</label>
              <input type="tel" id="checkout-phone" class="form-input" required placeholder="e.g. 09171234567" value="${escapeHtml((getSession() || {}).phone || '')}">
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
        const key = btn.getAttribute('data-key');
        const item = getCartItems().find((i) => itemKey(i) === key);
        if (item) {
          updateCartQuantity(key, item.quantity - 1);
        }
      });
    });

    // Quantity Increment
    document.querySelectorAll('.btn-qty-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const item = getCartItems().find((i) => itemKey(i) === key);
        if (item) {
          if (item.quantity >= MAX_QTY) {
            showToast(`Maximum quantity of ${MAX_QTY} allowed per item`, 'info');
            return;
          }
          updateCartQuantity(key, item.quantity + 1);
        }
      });
    });

    // Quantity Direct Typing (number input)
    document.querySelectorAll('.qty-input').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.getAttribute('data-key');
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 1) {
          val = 1;
        } else if (val > MAX_QTY) {
          val = MAX_QTY;
          showToast(`Maximum quantity of ${MAX_QTY} allowed per item`, 'info');
        }
        input.value = val;
        updateCartQuantity(key, val);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          input.blur();
        }
      });
    });

    // Remove item
    document.querySelectorAll('.cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.getAttribute('data-key'));
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
        const session = getSession();
        if (!session) {
          showToast('Please sign in or create an account to proceed with checkout', 'info');
          setTimeout(() => {
            window.location.href = 'auth.html?next=cart.html';
          }, 700);
          return;
        }

        // Auto-fill address if available and field is empty
        const savedAddr = getAddress();
        const addrField = document.getElementById('checkout-address');
        if (savedAddr && addrField && !addrField.value.trim()) {
          addrField.value = [savedAddr.street, savedAddr.barangay, savedAddr.city, savedAddr.province, savedAddr.zip].filter(Boolean).join(', ');
        }

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

    // Buy Now goes straight to the checkout form
    if (buyNowMode && !buyNowModalShown && checkoutModal) {
      const session = getSession();
      if (!session) {
        showToast('Please sign in or create an account to complete your purchase', 'info');
        setTimeout(() => {
          window.location.href = 'auth.html?next=' + encodeURIComponent('cart.html?buynow=1');
        }, 700);
        return;
      }
      buyNowModalShown = true;
      setTimeout(() => checkoutModal.classList.add('is-active'), 120);
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

        // Record order in order history
        const purchasedItems = buyNowMode 
          ? (getBuyNowItem() ? [getBuyNowItem()] : [])
          : getCart();

        recordOrder({
          id: simulatedTrackingId,
          trackingId: simulatedTrackingId,
          recipient: name,
          phone: phone,
          address: address,
          payment: paymentText,
          date: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
          items: purchasedItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: i.image
          })),
          total: grandTotal,
          status: 'Processing'
        });

        // Hide checkout modal
        if (checkoutModal) checkoutModal.classList.remove('is-active');

        // Clear what was just ordered (Buy Now orders leave the saved cart alone)
        if (buyNowMode) {
          setBuyNowItem(null);
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
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
     Accounts & Auth (auth.html & profile.html)
     --------------------------------------------------------------------------
     FRONT-END DEMO ONLY: accounts live in this browser's localStorage, so they
     are not shared across devices and are not secure. Replace the functions in
     this section with calls to a real backend before accepting real customers.
     ========================================================================== */

  const USERS_STORAGE_KEY = 'shopyeah_users_v1';
  const SESSION_STORAGE_KEY = 'shopyeah_session_v1';
  const ADDRESS_STORAGE_KEY = 'shopyeah_address_v1';
  const ORDERS_STORAGE_KEY = 'shopyeah_orders_v1';
  const MIN_PASSWORD_LENGTH = 8;

  function getAddress() {
    try {
      const data = localStorage.getItem(ADDRESS_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveAddress(addr) {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr));
    } catch (e) {
      console.error('Could not save address', e);
    }
  }

  function getOrders() {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function recordOrder(order) {
    try {
      const orders = getOrders();
      orders.unshift(order);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Could not record order', e);
    }
  }

  function getUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  async function hashPassword(password, salt) {
    const text = salt + ':' + password;
    if (window.crypto && window.crypto.subtle) {
      const bytes = new TextEncoder().encode(text);
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for browsers without Web Crypto (e.g. some file:// setups)
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  }

  function makeSalt() {
    if (window.crypto && window.crypto.getRandomValues) {
      return Array.from(window.crypto.getRandomValues(new Uint8Array(8))).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function getSession() {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user, remember) {
    const session = { name: user.name, email: user.email, phone: user.phone || '' };
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      (remember ? localStorage : sessionStorage).setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Could not save session', e);
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  /* Header "Login" / "My Profile" links */
  function updateAccountUI() {
    const session = getSession();
    const label = document.getElementById('account-label');
    const link = document.getElementById('account-link');
    const mobileLink = document.getElementById('mobile-account-link');
    const firstName = session && session.name ? session.name.split(' ')[0] : '';

    if (label) label.textContent = session ? firstName : 'Login';
    if (link) {
      link.setAttribute('aria-label', session ? `My Profile (${session.name})` : 'Log in or create an account');
      link.href = session ? 'profile.html' : 'auth.html';
    }
    if (mobileLink) {
      mobileLink.textContent = session ? `My Profile (${firstName})` : 'Login';
      mobileLink.href = session ? 'profile.html' : 'auth.html';
    }
  }

  /* Only allow redirecting back to our own pages, never to another site. */
  function getSafeNextUrl(fallback = 'index.html') {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    return /^[a-z0-9_-]+\.html(\?[^#\s]*)?$/i.test(next) ? next : fallback;
  }

  function initAuthPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (!loginForm || !registerForm) return;

    const session = getSession();
    const nextParam = new URLSearchParams(window.location.search).get('next');

    // If user is already logged in and navigates to auth.html:
    if (session) {
      if (nextParam && /^[a-z0-9_-]+\.html(\?[^#\s]*)?$/i.test(nextParam)) {
        window.location.href = nextParam;
        return;
      }
      // Redirect to profile page
      window.location.href = 'profile.html';
      return;
    }

    const formsWrap = document.getElementById('auth-forms');
    const signedInWrap = document.getElementById('auth-signed-in');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const tabs = {
      login: document.getElementById('tab-login'),
      register: document.getElementById('tab-register'),
    };
    const copy = {
      login: { title: 'Welcome back', subtitle: 'Sign in to check out faster and keep track of your orders.' },
      register: { title: 'Create your account', subtitle: 'It takes a minute. Your details are saved on this device.' },
    };

    function switchTab(which, moveFocus) {
      const isLogin = which === 'login';
      loginForm.hidden = !isLogin;
      registerForm.hidden = isLogin;
      Object.keys(tabs).forEach((key) => {
        const active = key === which;
        tabs[key].setAttribute('aria-selected', String(active));
        tabs[key].tabIndex = active ? 0 : -1;
      });
      title.textContent = copy[which].title;
      subtitle.textContent = copy[which].subtitle;
      if (moveFocus) tabs[which].focus();
    }

    Object.keys(tabs).forEach((key) => {
      tabs[key].addEventListener('click', () => switchTab(key, false));
      tabs[key].addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          switchTab(key === 'login' ? 'register' : 'login', true);
        }
      });
    });

    document.querySelectorAll('[data-auth-switch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-auth-switch');
        switchTab(targetTab, false);
        const first = (targetTab === 'login' ? loginForm : registerForm).querySelector('input');
        if (first) first.focus();
      });
    });

    /* ---- Show / hide password ---- */
    document.querySelectorAll('.password-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.getAttribute('data-target'));
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
        btn.setAttribute('aria-pressed', String(show));
      });
    });

    /* ---- Field errors ---- */
    function setFieldError(input, message) {
      const err = document.getElementById(input.id + '-error');
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (err) err.textContent = message || '';
    }

    function setFormError(form, message) {
      const box = form.querySelector('.auth-form-error');
      if (box) {
        box.textContent = message || '';
        box.hidden = !message;
      }
    }

    function clearErrors(form) {
      form.querySelectorAll('input').forEach((i) => setFieldError(i, ''));
      setFormError(form, '');
    }

    function focusFirstInvalid(form) {
      const bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
    }

    function setBusy(btn, busy, busyText) {
      if (busy) {
        btn.dataset.label = btn.textContent;
        btn.textContent = busyText;
      } else if (btn.dataset.label) {
        btn.textContent = btn.dataset.label;
      }
      btn.disabled = busy;
    }

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const phoneOk = (v) => /^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g, ''));

    /* ---- Sign in ---- */
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(loginForm);
      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');
      const remember = document.getElementById('login-remember').checked;

      if (!email.value.trim()) setFieldError(email, 'Enter your email address.');
      else if (!emailOk(email.value.trim())) setFieldError(email, 'Enter a valid email, like name@example.com.');
      if (!password.value) setFieldError(password, 'Enter your password.');
      if (loginForm.querySelector('[aria-invalid="true"]')) {
        focusFirstInvalid(loginForm);
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      setBusy(submitBtn, true, 'Signing in…');
      const user = getUsers().find((u) => u.email === email.value.trim().toLowerCase());
      const hash = user ? await hashPassword(password.value, user.salt) : null;

      if (!user || hash !== user.hash) {
        setBusy(submitBtn, false);
        setFormError(loginForm, 'Incorrect email or password. Check them and try again, or create an account.');
        return;
      }

      setSession(user, remember);
      updateAccountUI();
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => { window.location.href = getSafeNextUrl('profile.html'); }, 600);
    });

    document.getElementById('forgot-password-btn').addEventListener('click', () => {
      showToast('Password reset is not available yet. Email shopyeah@gmail.com for help.', 'info');
    });

    /* ---- Create account ---- */
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(registerForm);
      const name = document.getElementById('register-name');
      const email = document.getElementById('register-email');
      const phone = document.getElementById('register-phone');
      const password = document.getElementById('register-password');
      const confirm = document.getElementById('register-confirm');

      if (name.value.trim().length < 2) setFieldError(name, 'Enter your full name.');
      if (!email.value.trim()) setFieldError(email, 'Enter your email address.');
      else if (!emailOk(email.value.trim())) setFieldError(email, 'Enter a valid email, like name@example.com.');
      if (!phone.value.trim()) setFieldError(phone, 'Enter your mobile number.');
      else if (!phoneOk(phone.value.trim())) setFieldError(phone, 'Use a Philippine mobile number, like 09171234567.');
      if (password.value.length < MIN_PASSWORD_LENGTH) setFieldError(password, `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      if (!confirm.value) setFieldError(confirm, 'Re-enter your password.');
      else if (confirm.value !== password.value) setFieldError(confirm, 'Passwords do not match.');

      const users = getUsers();
      const normalizedEmail = email.value.trim().toLowerCase();
      if (!email.getAttribute('aria-invalid') || email.getAttribute('aria-invalid') === 'false') {
        if (users.some((u) => u.email === normalizedEmail)) {
          setFieldError(email, 'An account with this email already exists. Try signing in instead.');
        }
      }

      if (registerForm.querySelector('[aria-invalid="true"]')) {
        focusFirstInvalid(registerForm);
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      setBusy(submitBtn, true, 'Creating account…');
      const salt = makeSalt();
      const user = {
        name: name.value.trim(),
        email: normalizedEmail,
        phone: phone.value.replace(/[\s-]/g, ''),
        salt: salt,
        hash: await hashPassword(password.value, salt),
        createdAt: new Date().toISOString(),
      };

      try {
        users.push(user);
        saveUsers(users);
      } catch (err) {
        setBusy(submitBtn, false);
        setFormError(registerForm, 'We could not save your account because browser storage is unavailable.');
        return;
      }

      setSession(user, true);
      updateAccountUI();
      showToast('Account created. Welcome to SHOPYEAH!', 'success');
      setTimeout(() => { window.location.href = getSafeNextUrl('profile.html'); }, 700);
    });

    switchTab(new URLSearchParams(window.location.search).get('tab') === 'register' ? 'register' : 'login', false);
  }

  /* ==========================================================================
     Profile Page Controller (profile.html)
     ========================================================================== */

  function initProfilePage() {
    const profileRoot = document.getElementById('profile-page-root');
    if (!profileRoot) return;

    const session = getSession();
    if (!session) {
      window.location.href = 'auth.html?next=profile.html';
      return;
    }

    // Populate Sidebar Summary
    const nameEl = document.getElementById('sidebar-user-name');
    const emailEl = document.getElementById('sidebar-user-email');
    const initialsEl = document.getElementById('profile-initials');

    if (nameEl) nameEl.textContent = session.name;
    if (emailEl) emailEl.textContent = session.email;
    if (initialsEl) {
      const parts = session.name.trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : (parts[0].slice(0, 2));
      initialsEl.textContent = initials.toUpperCase();
    }

    // Populate Personal Details Form
    const nameInput = document.getElementById('profile-name');
    const phoneInput = document.getElementById('profile-phone');
    const emailInput = document.getElementById('profile-email');

    if (nameInput) nameInput.value = session.name || '';
    if (phoneInput) phoneInput.value = session.phone || '';
    if (emailInput) emailInput.value = session.email || '';

    // Populate Address Form
    const savedAddress = getAddress();
    if (savedAddress) {
      const street = document.getElementById('address-street');
      const barangay = document.getElementById('address-barangay');
      const city = document.getElementById('address-city');
      const province = document.getElementById('address-province');
      const zip = document.getElementById('address-zip');

      if (street && savedAddress.street) street.value = savedAddress.street;
      if (barangay && savedAddress.barangay) barangay.value = savedAddress.barangay;
      if (city && savedAddress.city) city.value = savedAddress.city;
      if (province && savedAddress.province) province.value = savedAddress.province;
      if (zip && savedAddress.zip) zip.value = savedAddress.zip;
    }

    // Tab Navigation
    const navButtons = document.querySelectorAll('.profile-nav-btn');
    const tabPanels = document.querySelectorAll('.profile-tab-content');

    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        navButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanels.forEach((panel) => {
          if (panel.id === `tab-panel-${targetTab}`) {
            panel.hidden = false;
            panel.classList.add('active');
          } else {
            panel.hidden = true;
            panel.classList.remove('active');
          }
        });
      });
    });

    // Save Personal Details
    const personalForm = document.getElementById('profile-personal-form');
    if (personalForm) {
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = nameInput ? nameInput.value.trim() : '';
        const newPhone = phoneInput ? phoneInput.value.trim() : '';

        if (!newName) {
          showToast('Please enter your full name', 'error');
          return;
        }

        // Update session
        session.name = newName;
        session.phone = newPhone;
        const remember = !!localStorage.getItem(SESSION_STORAGE_KEY);
        setSession(session, remember);

        // Update stored users record
        const users = getUsers();
        const userIdx = users.findIndex((u) => u.email === session.email.toLowerCase());
        if (userIdx > -1) {
          users[userIdx].name = newName;
          users[userIdx].phone = newPhone;
          saveUsers(users);
        }

        // Update UI
        if (nameEl) nameEl.textContent = newName;
        if (initialsEl) {
          const parts = newName.trim().split(/\s+/);
          initialsEl.textContent = (parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : (parts[0].slice(0, 2))).toUpperCase();
        }
        updateAccountUI();

        showToast('Personal details updated successfully!', 'success');
      });
    }

    // Save Address
    const addressForm = document.getElementById('profile-address-form');
    if (addressForm) {
      addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const street = document.getElementById('address-street').value.trim();
        const barangay = document.getElementById('address-barangay').value.trim();
        const city = document.getElementById('address-city').value.trim();
        const province = document.getElementById('address-province').value.trim();
        const zip = document.getElementById('address-zip').value.trim();

        if (!street || !barangay || !city || !province) {
          showToast('Please fill out all required address fields', 'error');
          return;
        }

        const addressData = { street, barangay, city, province, zip };
        saveAddress(addressData);
        showToast('Delivery address saved successfully!', 'success');
      });
    }

    // Render Order History
    const ordersContainer = document.getElementById('profile-orders-list');
    if (ordersContainer) {
      const orders = getOrders();
      if (orders.length === 0) {
        // Sample baseline orders for demonstration
        const sampleOrders = [
          {
            trackingId: '#SY-849201',
            date: 'Oct 28, 2026',
            status: 'Delivered',
            total: 13490,
            payment: 'GCash E-Wallet',
            items: [{ name: 'Apple AirPods Pro (2nd Gen) with USB-C', quantity: 1, price: 13490 }]
          },
          {
            trackingId: '#SY-720184',
            date: 'Sep 14, 2026',
            status: 'Delivered',
            total: 6995,
            payment: 'Cash on Delivery',
            items: [{ name: 'Anker 737 Power Bank (PowerCore 24K 140W)', quantity: 1, price: 6995 }]
          }
        ];

        ordersContainer.innerHTML = sampleOrders.map(renderOrderCardHTML).join('');
      } else {
        ordersContainer.innerHTML = orders.map(renderOrderCardHTML).join('');
      }
    }

    function renderOrderCardHTML(order) {
      const statusClass = order.status === 'Delivered' ? 'order-status-delivered' : 'order-status-processing';
      const itemsHtml = (order.items || []).map((item) => `
        <div class="order-item-snippet">
          <span class="order-item-name">${escapeHtml(item.name)}</span>
          <span class="order-item-qty">x${item.quantity}</span>
          <span class="order-item-price">${formatPeso(item.price * item.quantity)}</span>
        </div>
      `).join('');

      return `
        <article class="order-history-card">
          <div class="order-card-header">
            <div>
              <span class="order-card-id">${escapeHtml(order.trackingId)}</span>
              <span class="order-card-date">• Placed on ${escapeHtml(order.date)}</span>
            </div>
            <span class="order-status-badge ${statusClass}">${escapeHtml(order.status)}</span>
          </div>

          <div class="order-card-body">
            <div class="order-items-list">${itemsHtml}</div>
          </div>

          <div class="order-card-footer">
            <div class="order-card-payment">Payment: <strong>${escapeHtml(order.payment || 'Cash on Delivery')}</strong></div>
            <div class="order-card-total">Order Total: <strong>${formatPeso(order.total)}</strong></div>
          </div>
        </article>
      `;
    }

    // Change Password Form
    const pwdForm = document.getElementById('profile-password-form');
    if (pwdForm) {
      pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const current = document.getElementById('change-pwd-current').value;
        const newPwd = document.getElementById('change-pwd-new').value;

        if (!current || !newPwd) {
          showToast('Please enter both your current and new password', 'error');
          return;
        }

        if (newPwd.length < MIN_PASSWORD_LENGTH) {
          showToast(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`, 'error');
          return;
        }

        const users = getUsers();
        const userIdx = users.findIndex((u) => u.email === session.email.toLowerCase());
        if (userIdx === -1) {
          showToast('User record not found', 'error');
          return;
        }

        const currentHash = await hashPassword(current, users[userIdx].salt);
        if (currentHash !== users[userIdx].hash) {
          showToast('Current password does not match', 'error');
          return;
        }

        users[userIdx].hash = await hashPassword(newPwd, users[userIdx].salt);
        saveUsers(users);
        document.getElementById('change-pwd-current').value = '';
        document.getElementById('change-pwd-new').value = '';
        showToast('Password updated successfully!', 'success');
      });
    }

    // Profile Logout Button
    const logoutBtn = document.getElementById('profile-btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearSession();
        updateAccountUI();
        showToast('You have been logged out', 'info');
        setTimeout(() => {
          window.location.href = 'auth.html';
        }, 500);
      });
    }
  }

  /* ==========================================================================
     Application Bootstrapper
     ========================================================================== */

  function initApp() {
    initHeader();
    updateAccountUI();
    initAuthPage();
    initProfilePage();
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