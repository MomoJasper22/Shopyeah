# SHOPYEAH — Codebase Agent Reference

> **Project**: SHOPYEAH Philippines — E-Commerce Gadgets & Electronics Storefront
> **Stack**: Static HTML5 + Vanilla JavaScript + CSS3 (no frameworks, no build tools)
> **Last Updated**: November 2026

---

## Table of Contents

- [SHOPYEAH — Codebase Agent Reference](#shopyeah--codebase-agent-reference)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Team Members](#team-members)
  - [Architecture Diagram](#architecture-diagram)
  - [File Inventory](#file-inventory)
  - [Page-by-Page Breakdown](#page-by-page-breakdown)
    - [1. `index.html` — Home / Storefront](#1-indexhtml--home--storefront)
    - [2. `product.html` — Product Catalog](#2-producthtml--product-catalog)
    - [3. `cart.html` — Shopping Cart](#3-carthtml--shopping-cart)
    - [4. `login.html` — Authentication](#4-loginhtml--authentication)
    - [5. `aboutus.html` — About Us](#5-aboutushtml--about-us)
    - [6. `contact.html` — Contact / Customer Care](#6-contacthtml--contact--customer-care)
  - [JavaScript Module Map (app.js)](#javascript-module-map-appjs)
    - [Key Function Reference](#key-function-reference)
  - [CSS Architecture (style.css)](#css-architecture-stylecss)
  - [Data Layer \& Product Catalog](#data-layer--product-catalog)
    - [Product Schema (`products.json`)](#product-schema-productsjson)
    - [Product Categories (7)](#product-categories-7)
    - [Product Options System (`PRODUCT_OPTIONS` in app.js)](#product-options-system-product_options-in-appjs)
  - [Feature Catalog](#feature-catalog)
  - [State Management](#state-management)
    - [Custom Events](#custom-events)
  - [Design Tokens \& Brand Identity](#design-tokens--brand-identity)
    - [Color Palette](#color-palette)
    - [Typography](#typography)
    - [Logo](#logo)
  - [Conventions \& Patterns](#conventions--patterns)
    - [HTML Patterns](#html-patterns)
    - [JavaScript Patterns](#javascript-patterns)
    - [CSS Patterns](#css-patterns)
  - [Known Limitations \& Caveats](#known-limitations--caveats)

---

## Project Overview

**SHOPYEAH** is a fully client-side e-commerce storefront targeting Filipino consumers. It sells 25 curated products across 7 categories: Smartphones, Laptops, Audio, Tablets, Wearables, Accessories, and Gaming. The site is designed to work entirely from static files—no server, no database, no build step—using `localStorage` and `sessionStorage` for all persistence.

**Key characteristics**:
- 🚫 **Zero dependencies** — no npm, no bundler, no framework
- 📁 **Flat file structure** — all files in root directory
- 💾 **Client-only state** — cart, auth, promo codes all use `localStorage`/`sessionStorage`
- 🇵🇭 **Philippines market** — pricing in ₱ (Philippine Peso), COD/GCash/Maya payment options
- ♿ **Accessibility-aware** — ARIA labels, roles, keyboard navigation, focus management

---

## Team Members

| Name                | Role      |
|---------------------|-----------|
| Kate Alliet         | Developer |
| Angel Lohr Mallorca | Developer |
| Mary Joy Equibal    | Developer |
| Momo, Jasper E.     | Developer |
| Flores, Dewi Sri    | Developer |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                                │
│                                                               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │index.html│  │product.  │  │ cart.html │  │  login.html  │  │
│  │  (Home)  │  │  html    │  │ (Cart)   │  │   (Auth)     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │             │                │          │
│  ┌────┴──────┐  ┌────┴─────┐  ┌───┴────┐  ┌───────┴──────┐  │
│  │aboutus.   │  │contact.  │  │        │  │              │  │
│  │  html     │  │  html    │  │        │  │              │  │
│  └────┬──────┘  └────┬─────┘  │        │  │              │  │
│       │              │        │        │  │              │  │
│  ─────┴──────────────┴────────┴────────┴──┴──────────────┘  │
│                         │                                     │
│                    ┌────┴────┐                                │
│                    │ app.js  │  ← Single shared script         │
│                    └────┬────┘                                │
│                         │                                     │
│              ┌──────────┼──────────┐                         │
│              │          │          │                          │
│         ┌────┴───┐ ┌────┴───┐ ┌───┴─────┐                  │
│         │style.  │ │products│ │logo.svg │                   │
│         │  css   │ │ .json  │ │favicon  │                   │
│         └────────┘ └────────┘ └─────────┘                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    localStorage                          │  │
│  │  shopyeah_cart_v1  │ shopyeah_users_v1  │ session_v1   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## File Inventory

| File              | Size    | Purpose                                                             |
|-------------------|---------|---------------------------------------------------------------------|
| `index.html`      | 22 KB   | Home page — hero banner, categories, featured products, CTA         |
| `product.html`    | 14.6 KB | Product catalog — filterable grid with category pills, search, sort |
| `cart.html`       | 11.7 KB | Shopping cart — item list, order summary, checkout flow              |
| `login.html`      | 18.4 KB | Authentication — sign in / create account / signed-in dashboard     |
| `aboutus.html`    | 16.9 KB | About Us — mission, vision, stats, value props                      |
| `contact.html`    | 16.3 KB | Contact page — support info cards + "Send Us a Message" form        |
| `app.js`          | 85.6 KB | **All application logic** — cart, catalog, auth, modals, forms      |
| `style.css`       | 70 KB   | **All styles** — design tokens, layout, components, responsive      |
| `products.json`   | 12 KB   | 25-product catalog data (JSON array)                                |
| `logo.svg`        | 1.4 KB  | SVG brand "S" monogram mark                                        |
| `favicon.ico`     | 15.4 KB | Browser tab icon                                                    |
| `README.md`       | 113 B   | Team member list                                                    |

**Total**: 12 files, ~285 KB (no `node_modules`, no build artifacts)

---

## Page-by-Page Breakdown

### 1. `index.html` — Home / Storefront

| Section             | Description                                                       |
|---------------------|-------------------------------------------------------------------|
| Announcement Bar    | Flash sale promo with `SHOPYEAH100` code, free shipping threshold |
| Sticky Header       | Logo, search bar, desktop nav, account/cart buttons, hamburger    |
| Hero Banner         | Gradient hero with iPhone 15 Pro Max featured card                |
| Trust Strip         | 4 guarantee badges (Authentic, Shipping, Checkout, Support)       |
| Category Grid       | 7 clickable category cards linking to `product.html?category=X`   |
| Featured Products   | 8 best-seller cards dynamically rendered from `products.json`     |
| Brand Discovery CTA | "Shop Now" / "Reach Us" / "Know More About Us" buttons            |
| Footer              | Navigation, categories, contact info, payment badges              |

**JS entry point**: `initHomePage()` — fetches products, renders top 8 featured items.

### 2. `product.html` — Product Catalog

| Section           | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| Page Header       | "Famous Gadgets in the Philippines" title                          |
| Category Pills    | 8 filter buttons (All + 7 categories) using `role="tablist"`      |
| Toolbar           | Live keyword search + product count + sort dropdown                |
| Product Grid      | Dynamically rendered cards from `products.json`                    |
| Product Detail    | Modal overlay with options (color/storage/memory), qty, Buy Now   |

**JS entry point**: `initCatalogPage()` — parses URL params (`?category=`, `?search=`), wires filters/sort.

**Sort options**: Featured, Price Low→High, Price High→Low, Name A→Z, Highest Rated.

### 3. `cart.html` — Shopping Cart

| Section               | Description                                               |
|-----------------------|-----------------------------------------------------------|
| Cart Items Panel      | Item rows with image, variant label, qty controls, remove |
| Order Summary Card    | Subtotal, shipping progress bar, promo code, grand total  |
| Checkout Modal        | Name, phone, address, payment method form                 |
| Order Success Modal   | Tracking ID, payment method, estimated delivery           |

**JS entry point**: `initCartPage()` — supports both normal cart and "Buy Now" mode (`?buynow=1`).

**Business logic**:
- Free shipping threshold: **₱1,500**
- Standard shipping fee: **₱120**
- Promo code `SHOPYEAH100`: **₱100 off**
- Max quantity per item: **10**

### 4. `login.html` — Authentication

| Section           | Description                                                   |
|-------------------|---------------------------------------------------------------|
| Auth Aside        | Benefits list (autofill, payments, free shipping)             |
| Login Form        | Email + password with "Keep me signed in" checkbox            |
| Register Form     | Name, email, phone, password, confirm password                |
| Signed-In View    | Account details + Continue Shopping / View Cart / Log Out     |

**JS entry point**: `initAuthPage()` — localStorage-based user accounts with SHA-256 password hashing.

> ⚠️ **Demo only**: Auth is client-side localStorage. Not secure for production.

### 5. `aboutus.html` — About Us

| Section          | Description                                          |
|------------------|------------------------------------------------------|
| Hero Intro       | "Welcome to SHOPYEAH" story                         |
| Mission & Vision | Side-by-side cards with icon + description           |
| Stats Strip      | 25,000+ shoppers, 100% authentic, 99.4% on-time     |
| Why Shop Grid    | 4 value proposition cards                            |
| CTA Banner       | "Ready to Upgrade Your Daily Tech?" call to action   |

### 6. `contact.html` — Contact / Customer Care

| Section           | Description                                           |
|-------------------|-------------------------------------------------------|
| Contact Cards     | Email, mobile, telephone, operating hours             |
| Contact Form      | Name, email, order number (optional), message         |
| Success State     | "Message Received!" confirmation replaces form        |

**JS entry point**: `initContactPage()` — form validation + success state rendering.

---

## JavaScript Module Map (app.js)

The entire application is wrapped in a single **IIFE** (Immediately Invoked Function Expression) with `'use strict'`. It is organized into these logical sections:

```
app.js (2,138 lines)
│
├── Constants & Storage Keys (L1–18)
│   ├── CART_STORAGE_KEY = 'shopyeah_cart_v1'
│   ├── FREE_SHIPPING_THRESHOLD = 1500
│   ├── STANDARD_SHIPPING_FEE = 120
│   ├── VALID_PROMO_CODE = 'SHOPYEAH100'
│   └── MAX_QTY = 10
│
├── Product Options Config (L20–162)
│   └── PRODUCT_OPTIONS{} — color, storage, memory, size, add-ons per product ID
│       ├── Helper factories: COLOR(), OPT(), colors(), choices()
│       └── 22 products with configurable variants (3 have no options)
│
├── Cart State Management (L175–330)
│   ├── getCart() / saveCart()
│   ├── getBuyNowItem() / setBuyNowItem()  (sessionStorage)
│   ├── addToCart() — with button feedback animation
│   ├── buyNow() — redirects to cart.html?buynow=1
│   ├── updateCartQuantity() / removeFromCart() / clearCart()
│   └── updateCartBadge()
│
├── Toast Notifications (L332–366)
│   └── showToast(message, type) — success / error / info
│
├── Helpers & Formatters (L368–397)
│   ├── formatPeso() — ₱ currency formatting
│   ├── escapeHtml() — XSS prevention
│   └── renderStars() — 5-star SVG rating
│
├── Navigation & Header (L399–443)
│   └── initHeader() — hamburger menu, search form redirect
│
├── Product Catalog (L445–1320)
│   ├── EMBEDDED_PRODUCTS[] — 25-product fallback (for file:// protocol)
│   ├── fetchProducts() — loads products.json with embedded fallback
│   ├── createProductCardHTML() — product card template
│   ├── attachProductGridEventListeners()
│   ├── Product Detail Modal (L855–1143)
│   │   ├── getProductConfig() / productHasOptions()
│   │   ├── defaultSelections() / computeVariant()
│   │   ├── ensureDetailModal() — lazy DOM creation
│   │   ├── buildDetailHTML() — modal content template
│   │   ├── updateDetailDynamic() — live price/option updates
│   │   ├── openProductDetail() / closeProductDetail()
│   │   └── Keyboard trap (Tab/Escape) for accessibility
│   ├── initCatalogPage() — URL param parsing, filter/sort wiring
│   ├── handleCatalogSearch() / renderFilteredCatalog()
│   └── initHomePage() — featured products grid (top 8)
│
├── Shopping Cart Page (L1322–1754)
│   ├── initCartPage() — Buy Now mode detection
│   ├── renderCartView() — full cart page HTML generation
│   │   ├── Shipping progress bar
│   │   ├── Promo code application
│   │   ├── Checkout modal HTML
│   │   └── Order success modal HTML
│   └── attachCartEventListeners()
│       ├── Quantity increment/decrement
│       ├── Remove / Clear cart
│       ├── Promo code validation
│       ├── Checkout modal open/close
│       └── Order submission (simulated)
│
├── Contact Page (L1756–1795)
│   └── initContactPage() — form validation + success state
│
├── Auth System (L1797–2116)
│   ├── User CRUD: getUsers() / saveUsers()
│   ├── Password hashing: hashPassword() (SHA-256 via Web Crypto)
│   ├── Session management: getSession() / setSession() / clearSession()
│   ├── UI updates: updateAccountUI() — header name display
│   ├── initAuthPage()
│   │   ├── Tab switching (Login ↔ Register)
│   │   ├── Password show/hide toggle
│   │   ├── Field-level validation with error messages
│   │   ├── Login flow (email + password match)
│   │   ├── Registration flow (duplicate email check)
│   │   ├── Signed-in view rendering
│   │   └── Log out
│   └── getSafeNextUrl() — redirect validation (open redirect prevention)
│
└── Bootstrapper (L2118–2138)
    └── initApp() — calls all page initializers on DOMContentLoaded
```

### Key Function Reference

| Function                    | Line  | What it does                                           |
|-----------------------------|-------|--------------------------------------------------------|
| `addToCart()`               | 256   | Adds item to localStorage cart, shows toast + button feedback |
| `buyNow()`                  | 288   | Stores single item in sessionStorage, redirects to cart |
| `computeVariant()`          | 878   | Calculates price/key from product + selected options   |
| `fetchProducts()`           | 752   | Loads `products.json` with embedded fallback           |
| `renderFilteredCatalog()`   | 1231  | Applies category/search/sort filters, renders grid     |
| `openProductDetail()`       | 1118  | Opens product detail modal with options                |
| `renderCartView()`          | 1341  | Renders full cart page with order summary               |
| `hashPassword()`            | 1822  | SHA-256 password hashing with salt                     |
| `initApp()`                 | 2122  | Master bootstrapper                                    |

---

## CSS Architecture (style.css)

**3,614 lines** of hand-written CSS organized into these major sections:

| Section                             | Lines        | Description                              |
|-------------------------------------|--------------|------------------------------------------|
| Design Tokens & CSS Variables       | 1–61         | Colors, shadows, radii, layout, transitions |
| Reset & Base Standards              | 63–110       | Box-sizing, font smoothing, focus styles |
| Announcement Bar                    | 112–155      | Top promo bar gradient                   |
| Sticky Header                       | 156–448      | Logo, search, nav, cart button, hamburger, mobile nav |
| Main Container & Buttons            | 450–557      | Layout, `.btn` variants (primary, secondary, accent, outline) |
| Hero Section                        | 558–675      | Gradient banner, hero card, CTA buttons  |
| Trust Strip                         | 677–736      | 4-column guarantee badges                |
| Category Grid                       | 738–838      | 7-column category cards                  |
| Product Grid & Cards                | 839–977      | Responsive product cards with badges     |
| Catalog Toolbar                     | 978–1190     | Filter pills, search box, sort dropdown  |
| Empty State                         | 1191–1238    | No-results placeholder                   |
| Cart Page                           | 1239–1552    | Cart layout, item rows, order summary, shipping progress |
| Checkout & Success Modals           | 1553–1691    | Modal overlay, form styles, success icon |
| Contact Page                        | 1692–1782    | Contact cards, form panel layout         |
| About Us Page                       | 1783–1957    | Hero, mission/vision cards, stats strip, why-shop grid |
| Auth / Login Page                   | 1958–2013    | Auth card, tabs, benefits aside          |
| Footer                              | 2014–2115    | 4-column footer, payment badges          |
| Toast Notifications                 | 2116–2152    | Toast container, success/error/info variants |
| Product Detail Modal                | 2153–3500+   | Full-page detail modal with options, swatches, chips |
| Responsive Breakpoints              | Various      | `@media` queries at 1100px, 900px, 768px, 600px, 480px |

---

## Data Layer & Product Catalog

### Product Schema (`products.json`)

Each product object:

```json
{
  "id": 1,
  "name": "Apple iPhone 15 Pro Max (256GB)",
  "category": "Smartphones",
  "price": 74990,
  "originalPrice": 84990,
  "badge": "Best Seller",
  "rating": 4.9,
  "reviews": 482,
  "image": "https://images.unsplash.com/...",
  "description": "Aerospace-grade titanium design..."
}
```

### Product Categories (7)

| Category     | Count | Price Range (₱)         |
|--------------|-------|-------------------------|
| Smartphones  | 4     | 17,999 – 79,990         |
| Laptops      | 4     | 32,995 – 59,995         |
| Audio        | 4     | 6,499 – 18,999          |
| Tablets      | 3     | 16,999 – 24,990         |
| Wearables    | 4     | 1,190 – 24,990          |
| Accessories  | 3     | 1,499 – 6,995           |
| Gaming       | 3     | 2,395 – 27,990          |
| **Total**    | **25**|                         |

### Product Options System (`PRODUCT_OPTIONS` in app.js)

22 of 25 products have configurable variants. Options include:

- **Color swatches** — rendered as colored circles (hex values)
- **Chip selectors** — storage (256GB/512GB/1TB), memory (8GB/16GB/32GB), size (41mm/45mm), add-ons
- **Price deltas** — each option can add/subtract from the base price (e.g., `OPT('512GB', 9000)`)

The variant system generates a unique cart key: `productId|option1|option2|...`

---

## Feature Catalog

| Feature                        | Status | Description                                          |
|--------------------------------|--------|------------------------------------------------------|
| Product browsing & search      | ✅     | Category filter pills + keyword search + sort        |
| Product detail modal           | ✅     | Color/storage/memory options, quantity, price calc    |
| Add to Cart                    | ✅     | With button animation feedback + toast               |
| Buy Now                        | ✅     | Single-item express checkout via sessionStorage      |
| Shopping cart                   | ✅     | Qty controls, remove, clear, variant labels          |
| Free shipping progress         | ✅     | Visual progress bar toward ₱1,500 threshold          |
| Promo codes                    | ✅     | `SHOPYEAH100` = ₱100 off, persisted in localStorage |
| Checkout modal                 | ✅     | Name, phone, address, payment method form            |
| Order confirmation              | ✅     | Simulated tracking ID, success modal                 |
| User registration              | ✅     | Name, email, phone, password (SHA-256 hashed)        |
| User login                     | ✅     | Email + password with "remember me"                  |
| Session persistence             | ✅     | Header shows first name when logged in               |
| Contact form                   | ✅     | Validation + success state                           |
| Mobile responsive              | ✅     | Hamburger menu, stacked layouts, touch targets       |
| Keyboard accessibility         | ✅     | Focus trapping in modals, Tab/Escape handling        |
| Image fallbacks                | ✅     | `onerror` handler loads generic gadget image         |
| Embedded product fallback      | ✅     | `EMBEDDED_PRODUCTS[]` for `file://` protocol         |

---

## State Management

All state is client-side using the Web Storage API:

| Storage Key               | Engine          | Contents                              |
|---------------------------|-----------------|---------------------------------------|
| `shopyeah_cart_v1`        | `localStorage`  | Cart items array (id, key, name, qty, price, options, image) |
| `shopyeah_applied_promo`  | `localStorage`  | Applied promo code string             |
| `shopyeah_users_v1`       | `localStorage`  | Registered user accounts array (name, email, phone, salt, hash) |
| `shopyeah_session_v1`     | `localStorage` or `sessionStorage` | Current session (name, email, phone) |
| `shopyeah_buy_now_item`   | `sessionStorage`| Single Buy Now item (clears on tab close) |

### Custom Events

| Event          | Dispatched on | Payload        | Purpose                    |
|----------------|---------------|----------------|----------------------------|
| `cart-updated` | `window`      | `{ cart: [] }` | Triggers cart page re-render |

---

## Design Tokens & Brand Identity

### Color Palette

| Token                    | Value       | Usage                              |
|--------------------------|-------------|-------------------------------------|
| `--color-primary`        | `#1e56cf`   | Primary brand blue                  |
| `--color-primary-dark`   | `#123e9c`   | Headings, hover states              |
| `--color-primary-light`  | `#eff4fe`   | Active nav bg, light surfaces       |
| `--color-secondary`      | `#3b82f6`   | Logo gradient end, links            |
| `--color-tertiary`       | `#6dd1f4`   | Footer "YEAH" text                  |
| `--color-accent`         | `#f5f874`   | Yellow highlight, hero SHOPYEAH     |
| `--color-sale`           | `#ef4444`   | Discount badges, cart badge         |
| `--color-success`        | `#10b981`   | Free shipping, success toasts       |
| `--color-star`           | `#f59e0b`   | Star ratings                        |

### Typography

- **Font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Base size**: 16px
- **Hero title**: 3rem / 800 weight
- **Section titles**: 1.625rem / 800 weight
- **Body**: 1rem / 400 weight

### Logo

The logo is an SVG "S" monogram inside a rounded-rectangle with a gradient background (`#3b82f6 → #1e56cf`) and a yellow accent dot. The wordmark is **SHOP** (primary color) + **YEAH** (secondary/tertiary color).

---

## Conventions & Patterns

### HTML Patterns
- **Shared layout**: Every page includes the same header, footer, and announcement bar (copy-pasted, not templated)
- **Semantic HTML**: `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<nav>`
- **ARIA attributes**: `role`, `aria-label`, `aria-expanded`, `aria-controls`, `aria-live`, `aria-modal`
- **SVG icons**: Inline SVG throughout (no icon font, no external icon library)

### JavaScript Patterns
- **Single IIFE**: All code in one self-executing closure — no globals leak
- **Page detection**: Each `init*()` function checks for a page-specific DOM element before executing
- **DOM-first rendering**: HTML pages contain initial static structure; JS progressively enhances
- **Template literals**: Product cards, cart rows, modals are all generated via tagged template strings
- **Event delegation**: Modal events use delegation on the overlay container
- **Defensive coding**: `try/catch` around all localStorage operations

### CSS Patterns
- **CSS Custom Properties**: All colors, shadows, radii, and transitions are tokenized
- **No preprocessor**: Plain CSS with no Sass/Less/PostCSS
- **BEM-lite naming**: `.product-card`, `.cart-item-row`, `.auth-form-error` (not strict BEM)
- **Mobile-first responsive**: Breakpoints at 1100px, 900px, 768px, 600px, 480px

---

## Known Limitations & Caveats

| Area            | Limitation                                                              |
|-----------------|-------------------------------------------------------------------------|
| **Auth**        | Client-side only — passwords stored in localStorage (hashed but not secure for production) |
| **Cart**        | No server persistence — clearing browser data loses everything          |
| **Checkout**    | Simulated — no real payment processing or order fulfillment             |
| **Header/Footer** | Duplicated across all 6 HTML files — changes require updating every page |
| **Images**      | All hosted on Unsplash CDN — no local image assets                     |
| **Search**      | Client-side substring matching only — no full-text search or fuzzy matching |
| **SEO**         | Product pages are dynamically rendered — not crawlable by basic bots    |
| **i18n**        | English only, hardcoded ₱ currency — no localization support            |
| **Tests**       | None — no unit tests, integration tests, or E2E tests exist            |
| **Promo codes** | Single hardcoded code (`SHOPYEAH100`) — no admin panel or API          |
| **Contact form**| No email delivery — form submission only shows a success state          |
| **Products**    | Static JSON — no CMS or admin interface to add/edit products            |

---

