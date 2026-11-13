# SHOPYEAH — Codebase Agent Reference

> **Project**: SHOPYEAH Philippines — E-Commerce Gadgets & Electronics Storefront  
> **Stack**: Static HTML5 + Vanilla JavaScript + CSS3 Design Tokens (no frameworks, zero dependencies)  
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
    - [3. `cart.html` — Shopping Cart \& Checkout](#3-carthtml--shopping-cart--checkout)
    - [4. `auth.html` — Authentication Gateway](#4-authhtml--authentication-gateway)
    - [5. `profile.html` — Customer Profile \& Settings](#5-profilehtml--customer-profile--settings)
    - [6. `aboutus.html` — About Us](#6-aboutushtml--about-us)
    - [7. `contact.html` — Contact / Customer Care](#7-contacthtml--contact--customer-care)
  - [JavaScript Module Map (app.js)](#javascript-module-map-appjs)
    - [Key Function Reference](#key-function-reference)
  - [CSS Architecture (style.css)](#css-architecture-stylecss)
  - [Data Layer \& Product Catalog](#data-layer--product-catalog)
  - [Feature Catalog](#feature-catalog)
  - [State Management](#state-management)
  - [Design Tokens \& Brand Identity](#design-tokens--brand-identity)
  - [Conventions \& Patterns](#conventions--patterns)
  - [Known Limitations \& Caveats](#known-limitations--caveats)

---

## Project Overview

**SHOPYEAH** is a fully client-side e-commerce storefront specifically designed for Filipino tech consumers. It catalogs 25 famous gadgets across 7 departments: Smartphones, Laptops, Audio, Tablets, Wearables, Accessories, and Gaming. The site requires no server, no runtime bundler, and no database, operating entirely in modern browsers using HTML5, Vanilla JavaScript, CSS3 Design Tokens, and the Web Storage API (`localStorage` & `sessionStorage`).

**Key characteristics**:
- 🚫 **Zero dependencies** — no npm, webpack, vite, or frontend frameworks.
- 📁 **Flat file structure** — zero configuration, fully portable.
- 🇵🇭 **Philippines market focus** — prices in ₱ (PHP), payment options include Cash on Delivery, GCash, Maya, and cards.
- 🛒 **Swapped Action Layout & Clean Cart Button** — Cart button is placed first in header actions, featuring the cart icon and "Cart" label without an outer circle container, followed by the Account/Profile button.
- 🔍 **Clean Header & Prominent Catalog Search** — Search bar removed from all site headers for an uncluttered navigation experience; catalog search is enlarged and placed at the top of filter buttons on `product.html`.
- ⚡ **"Check" & Hero "View Deal" Modal CTAs** — Multi-variant products and the home hero "View Deal" button trigger the interactive product detail modal (swatches, storage chips, quantity stepper, Add to Cart / Buy Now).
- 🔒 **Mandatory Sign-In Checkout** — customers must be authenticated before checking out, enabling seamless 1-click address autofill.
- 👤 **Dedicated Profile & Settings** — separate `profile.html` for managing personal details, saved delivery addresses, genuine order history (with zero demo data), and password security.
- 🌌 **Maximized White Space** — expansive 1460px max-width layout on main storefront pages for an uncluttered, modern browsing experience.

---

## Team Members

| Name | Role |
|---|---|
| Kate Alliet | Developer |
| Angel Lohr Mallorca | Developer |
| Mary Joy Equibal | Developer |
| Momo, Jasper E. | Developer |
| Flores, Dewi Sri | Developer |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                                BROWSER                                 │
│                                                                        │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │index.html │  │product.html│  │ cart.html  │  │     auth.html     │  │
│  │  (Home)   │  │ (Catalog)  │  │(Cart/Gate) │  │  (Distraction-    │  │
│  └─────┬─────┘  └─────┬──────┘  └─────┬──────┘  │   free Login)     │  │
│        │              │               │         └─────────┬─────────┘  │
│        │              │               │                   │            │
│  ┌─────┴─────┐  ┌─────┴──────┐        │         ┌─────────┴─────────┐  │
│  │aboutus.   │  │contact.    │        │         │   profile.html    │  │
│  │  html     │  │  html      │        │         │ (User & Settings) │  │
│  └─────┬─────┘  └─────┬──────┘        │         └─────────┬─────────┘  │
│        │              │               │                   │            │
│  ──────┴──────────────┴───────────────┴───────────────────┴──────────  │
│                                │                                       │
│                       ┌────────▼────────┐                              │
│                       │     app.js      │  ← Single application brain  │
│                       └────────┬────────┘                              │
│                                │                                       │
│                ┌───────────────┼───────────────┐                       │
│                │               │               │                       │
│          ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐                 │
│          │ style.css │   │ products. │   │ logo.svg  │                 │
│          │ (Tokens & │   │   json    │   │  favicon  │                 │
│          │ 1460px UI)│   └───────────┘   └───────────┘                 │
│          └───────────┘                                                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       Web Storage API                            │  │
│  │  shopyeah_cart_v1        │ shopyeah_users_v1   │ session_v1      │  │
│  │  shopyeah_address_v1     │ shopyeah_orders_v1  │ applied_promo   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## File Inventory

| File | Size | Purpose |
|---|---|---|
| `index.html` | ~22 KB | Home page — hero announcement, value guarantees, 7 categories, and 8 best sellers. |
| `product.html` | ~15 KB | Product catalog — live keyword search, 7 category tabs, sorting, "Check" buttons. |
| `cart.html` | ~12 KB | Cart page — line items, free shipping progress bar, discount code, authenticated checkout. |
| `auth.html` | ~14 KB | Authentication page — streamlined header (no search, no home/about/contact), login & registration. |
| `profile.html` | ~17 KB | Profile portal — personal details, delivery address settings, order history, password management. |
| `login.html` | <1 KB | Backward-compatibility redirect pointing to `auth.html`. |
| `aboutus.html` | ~17 KB | About Us — mission, vision, stats counter, and value propositions. |
| `contact.html` | ~16 KB | Contact page — support cards, store hours, and interactive message form. |
| `app.js` | ~92 KB | **Core application logic** — state, routing, variant pricing, auth, profile, and cart. |
| `style.css` | ~80 KB | **Global stylesheet** — CSS tokens, 1460px layout, profile layout, component styles. |
| `products.json` | ~12 KB | 25-item curated gadget catalog data array. |
| `logo.svg` | ~1.4 KB | SVG vector mark featuring gradient background and stylized "S" monogram. |
| `favicon.ico` | ~15 KB | Browser tab favicon. |
| `README.md` | ~4 KB | GitHub project overview, setup instructions, and team member recognition. |
| `Agents.md` | Reference | Comprehensive system documentation for developers and AI agents. |

---

## Page-by-Page Breakdown

### 1. `index.html` — Home / Storefront
- **Announcement Bar**: Nationwide shipping promotion with `SHOPYEAH100` discount code.
- **Header Actions**: Cart button first (`.cart-btn`, icon + text without outer circle), Login/Profile button second (`.account-btn`). (Header search removed for a clean navigation layout).
- **Hero Banner**: Expansive gradient banner featuring best-seller showcase with interactive "View Deal" button opening the configuration modal.
- **Trust Strip**: 4-column value proposition cards with generous gaps.
- **Category Grid**: 7 interactive department pills linking directly to `product.html?category=X`.
- **PH Best Sellers Grid**: Top 8 curated products rendered dynamically via `initHomePage()`.
- **White Space**: Maximized with widened margins and breathable grid layouts.

### 2. `product.html` — Product Catalog
- **Catalog Controls Header**: Balanced 3-part top controls row featuring "Sort by:" on the left, an ergonomically bounded keyword search bar (`max-width: 540px`) in the center, and "Showing X of Y products" counter on the right.
- **Category Filter Pills**: 8 filter tabs (`All Products` + 7 categories) arranged directly below the search and controls row.
- **Product Cards**: Multi-variant products display **"Check"** (no icon); single-variant products display "Add to Cart" with icon.
- **Product Detail Modal**: Color swatches, storage/memory chip pickers, editable quantity input (supporting both direct typing and `+`/`−` stepper buttons), dynamic price computation, and "Add to Cart" / "Buy Now".

### 3. `cart.html` — Shopping Cart & Checkout
- **Cart Panel**: Line items with thumbnails, variant badges, quantity adjusters (supporting direct typing and `+`/`−` stepper buttons), and deletion.
- **Shipping Tracker**: Visual progress bar indicating progress toward the ₱1,500 free shipping threshold.
- **Promo Form**: Applies `SHOPYEAH100` code for an instant ₱100 reduction.
- **Checkout Auth Gate & Order Placement**:
  - Clicking "Proceed to Checkout" verifies `getSession()`.
  - Unauthenticated users are notified and redirected to `auth.html?next=cart.html`.
  - Authenticated users automatically receive pre-filled Name, Mobile Phone, and default saved Shipping Address.
  - Submitting "Confirm & Place Order" creates an order record in `shopyeah_orders_v1`, clears the cart, updates cart badges, and opens the order confirmation modal with direct links to continue shopping or view order history.

### 4. `auth.html` — Authentication Gateway
- **Streamlined Distraction-Free Header**:
  - Removed: Header search bar, `Home`, `About Us`, `Contact`, and `Products Catalog` navigation links.
  - Retained: Brand logo linking home, and Cart button.
- **Form Panels**: Tabbed interface switching between "Sign in" and "Create account".
- **Security**: Passwords salted and hashed via Web Crypto SHA-256 (`window.crypto.subtle.digest`).
- **Session Sync**: Creates persistent session (`localStorage` or `sessionStorage`), updates header, and returns user to `next` URL or `profile.html`.

### 5. `profile.html` — Customer Profile & Settings
- **Access Guard**: Automatically redirects unauthenticated visitors to `auth.html?next=profile.html`.
- **Sidebar**: User avatar initials, name, email, verified tier badge, and tab navigation.
- **Tabs**:
  1. **Personal Details**: Edit Full Name and Mobile Phone with instant session/user updates.
  2. **Delivery Addresses**: Save default street, barangay, city, province, and postal code for 1-click checkout autofill.
  3. **Order History**: Pure real-time rendering of placed orders from `shopyeah_orders_v1`, with a clean empty state when no orders have been placed (zero hardcoded mock data).
  4. **Security & Password**: Password change management with credential checks (notification preferences removed).
- **Logout Action**: Securely clears session and navigates to `auth.html`.

### 6. `aboutus.html` — About Us
- High-level company narrative, mission, vision, 25,000+ customer milestone statistics, and 4 value cards with maximized white space.

### 7. `contact.html` — Contact / Customer Care
- 4 support cards (email, mobile phone, telephone hotline, operating hours) and "Send Us a Message" inquiry form with confirmation feedback.

---

## JavaScript Module Map (app.js)

`app.js` runs as a strictly scoped IIFE (Immediately Invoked Function Expression):

```
app.js
├── Storage Keys & Constants (CART_STORAGE_KEY, SESSION_STORAGE_KEY, ADDRESS_STORAGE_KEY, ORDERS_STORAGE_KEY)
├── Product Options Definition (PRODUCT_OPTIONS table with color/chip definitions)
├── State Management
│   ├── Cart CRUD (getCart, saveCart, addToCart, buyNow, updateCartQuantity, removeFromCart)
│   ├── Address CRUD (getAddress, saveAddress)
│   └── Order History (getOrders, recordOrder)
├── Helpers (formatPeso, escapeHtml, renderStars, showToast)
├── Header Interactions (initHeader, updateAccountUI)
├── Product Catalog & Filter Controller (fetchProducts, initCatalogPage, renderFilteredCatalog)
├── Product Detail Modal (openProductDetail, computeVariant, updateDetailDynamic)
├── Shopping Cart Page Controller (initCartPage, renderCartView, Checkout Modal & Auth Gate)
├── Contact Form Controller (initContactPage)
├── Auth Page Controller (initAuthPage, hashPassword, setSession, clearSession)
├── Profile Page Controller (initProfilePage, tab switching, address/order rendering)
└── Bootstrapper (initApp)
```

### Key Function Reference

| Function | What it does |
|---|---|
| `updateAccountUI()` | Dynamically updates `.header-actions`: points to `profile.html` if signed in, `auth.html` if signed out. |
| `buyNow(product, qty, variant)` | Gated: checks session before redirecting to `cart.html?buynow=1` or `auth.html`. |
| `getAddress()` / `saveAddress()` | Persists customer's default delivery address in `localStorage`. |
| `getOrders()` / `recordOrder()` | Records confirmed orders and feeds the profile order tracking list. |
| `initProfilePage()` | Route-guards `profile.html`, handles profile updates, address saving, and order history. |
| `initAuthPage()` | Handles login/register, redirects authenticated users to `profile.html`. |
| `computeVariant()` | Calculates price delta and cart line-item keys for configured products. |

---

## CSS Architecture (style.css)

- **Max-Width Design Token**: `--max-width: 1460px;` (expanded to maximize white space across all storefront pages).
- **Page-Specific Constraints**: `.auth-section` (1040px) and `.profile-layout` (1100px) remain comfortably bounded for ergonomic form input.
- **Expanded White Space**:
  - `main`: `padding: 3rem 2.25rem 5.5rem;`
  - `.hero-banner`: `padding: 4.5rem 3.5rem; margin-bottom: 4rem;`
  - `.trust-strip`: `gap: 1.75rem; margin-bottom: 4.5rem;`
  - `.category-grid`: `gap: 1.25rem; margin-bottom: 4.5rem;`
  - `.product-grid`: `gap: 2rem; margin-bottom: 4.5rem;`
  - `.cart-layout`: `gap: 2.75rem;`
  - `.contact-layout`: `gap: 3.5rem;`
- **Component Sections**: Buttons, Header, Product Cards, Cart, Modals, Profile Dashboard, Orders, Toasts, Responsive Media Queries.

---

## Data Layer & Product Catalog

- **File**: `products.json`
- **Fallback**: Built-in `EMBEDDED_PRODUCTS[]` in `app.js` ensures graceful degradation when running on restrictive `file://` protocols.
- **Total Products**: 25 curated items.
- **Product Options**: 22 items feature configurable color swatches, storage variants, or accessories.

---

## Feature Catalog

| Feature | Status | Description |
|---|:---:|---|
| Swapped Header Buttons | ✅ | Cart button first (icon + text without outer circle), Login/Profile second across all page headers. |
| Header Search Removed | ✅ | All page headers have search bars removed for a clean, balanced 3-part navigation layout. |
| Prominent Catalog Search | ✅ | Enlarged search bar positioned at the top of the filter buttons on `product.html`. |
| Hero "View Deal" Modal | ✅ | Hero banner "View Deal" button triggers the interactive product detail modal like "Check". |
| Dedicated Profile Page | ✅ | `profile.html` with editable details, address storage, and order history (notification preferences removed). |
| Genuine Order History | ✅ | Order history displays actual placed orders with an empty state when zero orders exist (demo mock data removed). |
| Mandatory Checkout Sign-In | ✅ | Cart checkout and Buy Now require authentication before launching order forms. |
| Direct Quantity Typing | ✅ | Both shopping cart line items and the product detail modal support direct quantity typing in addition to `+`/`−` steppers. |
| "Check" Product CTA | ✅ | Multi-variant cards display "Check" without icons; single-variant display "Add to Cart". |
| Robust Checkout Order Placement | ✅ | "Confirm & Place Order" creates tracking IDs, stores orders in `shopyeah_orders_v1`, clears cart, and opens confirmation modal. |
| Maximized White Space | ✅ | 1460px container, airy grid gaps, and generous vertical margins. |
| Promo Code Discount | ✅ | `SHOPYEAH100` applies ₱100 off when subtotal is valid. |
| Free Shipping Meter | ✅ | Live progress bar calculating distance to the ₱1,500 threshold. |
| Client-Side SHA-256 Auth | ✅ | Salted password hashing via Web Crypto API. |
| Order History Tracking | ✅ | Successful checkouts create records viewable in `profile.html`. |

---

## State Management

| Key | Storage | Description |
|---|---|---|
| `shopyeah_cart_v1` | `localStorage` | Cart items array with variant details and quantities. |
| `shopyeah_users_v1` | `localStorage` | User directory with names, emails, phones, salts, and password hashes. |
| `shopyeah_session_v1` | `localStorage` / `sessionStorage` | Active session metadata (name, email, phone). |
| `shopyeah_address_v1` | `localStorage` | Default shipping address (street, barangay, city, province, zip). |
| `shopyeah_orders_v1` | `localStorage` | Placed order records with tracking numbers and line-item details. |
| `shopyeah_applied_promo` | `localStorage` | String code of currently applied promo discount. |
| `shopyeah_buy_now_item` | `sessionStorage` | Single-item direct purchase payload. |

---

## Design Tokens & Brand Identity

- `--color-primary`: `#1e56cf` (Brand Blue)
- `--color-primary-dark`: `#123e9c` (Headings & Accents)
- `--color-primary-light`: `#eff4fe` (Surface tint & highlights)
- `--color-secondary`: `#3b82f6` (Vibrant Blue)
- `--color-accent`: `#f5f874` (Electric Yellow highlight)
- `--color-sale`: `#ef4444` (Badge red)
- `--color-success`: `#10b981` (Success green)
- `--max-width`: `1460px` (Maximized layout width)

---

## Conventions & Patterns

- **Semantic HTML5**: Native tags `<header>`, `<main>`, `<aside>`, `<nav>`, `<article>`, `<footer>`.
- **Progressive Enhancement**: All core forms and actions function reliably without external CDN dependencies.
- **Defensive Storage Calls**: Every `localStorage` and `sessionStorage` operation is wrapped in `try/catch`.
- **Open Redirect Guard**: `getSafeNextUrl()` permits only internal `.html` destinations.

---

## Known Limitations & Caveats

- **Client-Side Auth**: Accounts and hashed credentials reside in browser storage; suitable for frontend demonstrations, requiring a server backend (e.g. Firebase or Node API) for production deployments.
- **Local Orders Only**: Order history is recorded within the active browser environment.
- **Unsplash Imagery**: Product graphics load from Unsplash CDNs with built-in SVG fallbacks in case of offline browsing.

