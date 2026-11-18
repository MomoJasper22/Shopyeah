# SHOPYEAH — Philippine Tech & Gadgets E-Commerce Storefront

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern_Tokens-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Storage](https://img.shields.io/badge/Storage-Web_Storage_API-0284c7?style=for-the-badge)](#state-management)
[![Philippines](https://img.shields.io/badge/Market-Philippines_₱-0038A8?style=for-the-badge)](#key-features)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=for-the-badge)](#technology-stack)

> **SHOPYEAH** is a fast, responsive, zero-dependency e-commerce storefront crafted for tech enthusiasts in the Philippines. Browse top-rated smartphones, laptops, audio gear, tablets, wearables, accessories, and gaming consoles with genuine Philippine Peso pricing, nationwide delivery estimates, secure client-side authentication, account management, and checkout simulation.

---

## Table of Contents

- [SHOPYEAH — Philippine Tech \& Gadgets E-Commerce Storefront](#shopyeah--philippine-tech--gadgets-e-commerce-storefront)
  - [Table of Contents](#table-of-contents)
  - [Live Pages Overview](#live-pages-overview)
  - [Key Features](#key-features)
  - [Architecture \& Design](#architecture--design)
  - [Getting Started / Local Setup](#getting-started--local-setup)
    - [Option 1: VS Code Live Server (Recommended)](#option-1-vs-code-live-server-recommended)
    - [Option 2: Python Local HTTP Server](#option-2-python-local-http-server)
    - [Option 3: Direct File Execution](#option-3-direct-file-execution)
  - [State Management](#state-management)
  - [Project File Structure](#project-file-structure)
  - [Team Contributors](#team-contributors)
  - [License \& Copyright](#license--copyright)

---

## Live Pages Overview

| Page | File | Description |
|---|---|---|
| **Home Storefront** | [`index.html`](index.html) | Hero announcement, value guarantee strip, 7 curated categories, and top 8 best sellers. |
| **Products Catalog** | [`product.html`](product.html) | Interactive 25-item catalog with live category filtering, real-time search, sorting, and detail modal. |
| **Shopping Cart** | [`cart.html`](cart.html) | Line item management, direct quantity typing & `+`/`−` steppers, free shipping progress tracker (₱1,500 threshold), promo code (`SHOPYEAH100`), and checkout modal. |
| **Authentication Gateway** | [`auth.html`](auth.html) | Streamlined, distraction-free Sign In and Create Account portal with tab switching and SHA-256 client hashing (no nav links or search distractions). |
| **User Profile & Settings** | [`profile.html`](profile.html) | Authenticated dashboard with editable personal details, saved shipping addresses, order tracking history, and security settings. |
| **About Us** | [`aboutus.html`](aboutus.html) | Company background, mission, vision, milestone statistics, and value pillars. |
| **Customer Support** | [`contact.html`](contact.html) | Support hotline numbers, service email, operating hours, and interactive inquiry form. |

---

## Key Features

- 🛒 **Intuitive Cart Experience**: Direct quantity typing in addition to `+`/`−` stepper buttons, item deletion, clear cart option, and real-time badge counters across all pages.
- 🚚 **Dynamic Free Shipping Meter**: Visual progress bar indicating how close the subtotal is to unlocking free nationwide shipping (₱1,500 threshold).
- 🏷️ **Promo Code System**: Built-in coupon code `SHOPYEAH100` applies an instant ₱100 discount to the order.
- ⚡ **"Check" Variant Modal**: Products with multiple colors, storage sizes, or add-ons feature a clean **"Check"** button that launches a full variant customizer with live price recalculation and direct typed quantity support.
- 🔒 **Mandatory Sign-In Checkout Gate**: Shoppers must be signed in before completing checkout, preventing incomplete customer profiles and auto-filling saved shipping details upon login.
- 👤 **Comprehensive Profile Management**:
  - **Personal Details**: Update your name and phone number with instant session sync.
  - **Delivery Address**: Save default street, barangay, city, and province for automated checkout population.
  - **Order History & Tracking**: Real-time record of all placed orders with generated `#SY-XXXXXX` tracking IDs and live item breakdowns.
  - **Security & Preferences**: Password update simulation and notification toggles.
- 📱 **Maximized White Space & Responsive Layout**: Clean, breathable 1460px layout max-width, modern card proportions, touch targets, and mobile navigation drawer.

---

## Architecture & Design

```
┌──────────────────────────────────────────────────────────────────┐
│                          SHOPYEAH STORE                           │
├───────────────┬─────────────────┬────────────────┬───────────────┤
│  index.html   │  product.html   │   cart.html    │  aboutus.html │
│  (Storefront) │    (Catalog)    │  (Checkout)    │   & contact   │
└───────┬───────┴────────┬────────┴────────┬───────┴───────┬───────┘
        │                │                 │               │
        └────────────────┼─────────────────┼───────────────┘
                         │                 │
             ┌───────────▼─────────────────▼────────────┐
             │               app.js                     │
             │   - Catalog Filter & Search Engine       │
             │   - Variant Pricing ("Check" modal)      │
             │   - Cart State & Shipping Calculation    │
             │   - Auth Guard & Session Management      │
             │   - Profile & Order History Controller   │
             └───────────┬─────────────────┬────────────┘
                         │                 │
             ┌───────────▼─────────┐ ┌─────▼────────────────────┐
             │      style.css      │ │       Web Storage        │
             │  - Design Tokens    │ │ - shopyeah_cart_v1       │
             │  - Responsive Grid  │ │ - shopyeah_users_v1      │
             │  - 1460px Max-Width │ │ - shopyeah_session_v1    │
             │  - Airy Whitespace  │ │ - shopyeah_address_v1    │
             └─────────────────────┘ │ - shopyeah_orders_v1     │
                                     └──────────────────────────┘
```

---

## Getting Started / Local Setup

Because SHOPYEAH is built with standard web technologies, **no build tools or Node.js installations are required**.

### Option 1: VS Code Live Server (Recommended)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/ShopyeahPH.git
   ```
2. Open the project folder in **Visual Studio Code**.
3. Install the **Live Server** extension (`ritwickdey.LiveServer`).
4. Right-click `index.html` and select **"Open with Live Server"**.

### Option 2: Python Local HTTP Server
Run from the repository root:
```bash
# Python 3.x
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

### Option 3: Direct File Execution
Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari. The script includes built-in fallbacks (`EMBEDDED_PRODUCTS`) should local file protocol restrictions block `fetch('products.json')`.

---

## State Management

All application state is preserved locally in the browser:

| Key | Storage | Description |
|---|---|---|
| `shopyeah_cart_v1` | `localStorage` | Active shopping cart items with selected variant specifications and quantities. |
| `shopyeah_users_v1` | `localStorage` | Registered customer records with unique salt and SHA-256 hashed passwords. |
| `shopyeah_session_v1` | `localStorage` / `sessionStorage` | Active authenticated customer session (Name, Email, Phone). |
| `shopyeah_address_v1` | `localStorage` | Customer's default saved delivery address for 1-click checkout. |
| `shopyeah_orders_v1` | `localStorage` | Customer order history with tracking numbers, item snapshots, dates, and statuses. |
| `shopyeah_applied_promo` | `localStorage` | Active discount code (`SHOPYEAH100`). |
| `shopyeah_buy_now_item` | `sessionStorage` | Temporary line-item for single-product direct checkout. |

---

## Project File Structure

```
ShopyeahPH/
├── index.html        # Main storefront homepage
├── product.html      # 25-item gadget catalog with filter/sort
├── cart.html         # Cart view, promo applicator & checkout modal
├── auth.html         # Streamlined distraction-free login & registration
├── profile.html      # User profile, shipping address & order history
├── aboutus.html      # Company background & core values
├── contact.html      # Customer service hotlines & inquiry form
├── login.html        # Compatibility redirect to auth.html
├── app.js            # Unified core application logic (2,300+ lines)
├── style.css         # Complete stylesheet & responsive design tokens (3,900+ lines)
├── products.json     # Curated 25-product gadget catalog dataset
├── logo.svg          # High-resolution theme "S" monogram vector
├── favicon.ico       # Web browser tab icon
├── README.md         # Repository documentation for GitHub
└── Agents.md         # Comprehensive AI agent reference & architecture contract

```

---

## Team Contributors

This project is created and maintained by:

- **Alliet, Kate**
- **Equibal, Mary Joy**
- **Flores, Dewi Sri A.**
- **Mallorca, Angel Lohr**
- **Momo, Jasper E.**


---

## License & Copyright

© 2026 **SHOPYEAH Philippines**. All rights reserved.
Built for education and demonstration purposes.
