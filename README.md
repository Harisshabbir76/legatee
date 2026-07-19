# Legatee — Fragrance E-Commerce Platform

A full-stack e-commerce web application for **LEGATEE**, a premium fragrance brand. Built with Next.js on the frontend and Node.js/Express on the backend, featuring a custom CMS admin panel for managing all page content.

---

## Project Structure

```
legatee/
├── frontend/                        # Next.js 16 application
│   ├── app/
│   │   ├── page.tsx                 # Homepage
│   │   ├── shop/                    # All products shop
│   │   ├── perfumes/                # Perfumes category page
│   │   ├── body-hair-mist/          # Body & Hair Mist category page
│   │   ├── product/[slug]/          # Dynamic product detail page
│   │   ├── our-story/               # About us / brand story
│   │   ├── faq/                     # FAQ page
│   │   ├── legal/                   # Legal (Privacy, Terms, Returns)
│   │   ├── contact-us/              # Contact page + Instagram section
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout with Tabby & Tamara
│   │   ├── wishlist/                # Wishlist page
│   │   ├── components/              # Shared UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CartContext.tsx
│   │   │   ├── WishlistContext.tsx
│   │   │   ├── TabbyPromoWidget.tsx
│   │   │   ├── TamaraPromoWidget.tsx
│   │   │   ├── home/                # Homepage sections
│   │   │   ├── shop/                # Shop sections
│   │   │   ├── our-story/           # About page sections
│   │   │   ├── Faq/                 # FAQ sections
│   │   │   ├── legal/               # Legal sections
│   │   │   ├── contact-us/          # Contact + Instagram sections
│   │   │   └── product-description/ # Product detail sections
│   │   └── zafira/admin/panel/      # CMS Admin Panel
│   │       ├── page.tsx             # Admin dashboard
│   │       ├── homepage/            # Homepage content editor
│   │       ├── shop/                # Shop page editor
│   │       ├── about-us/            # About Us editor
│   │       ├── faq/                 # FAQ editor
│   │       ├── legal/               # Legal page editor
│   │       ├── contact-us/          # Contact Us editor
│   │       ├── perfumes/            # Perfumes page editor
│   │       ├── body-hair-mist/      # Body & Hair Mist editor
│   │       ├── products/            # Product catalog (add/edit/delete)
│   │       ├── categories/          # Category manager
│   │       └── orders/              # Order management
│   ├── lib/
│   │   ├── api.ts                   # API types & fetch functions
│   │   └── api-client.ts            # API base URL config
│   └── package.json
│
└── backend/                         # Node.js / Express API
    ├── server.js                    # Entry point
    ├── models/
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Category.js
    │   ├── HomepageContent.js
    │   ├── ShopPageContent.js
    │   ├── AboutPageContent.js
    │   ├── FaqPageContent.js
    │   ├── LegalPageContent.js
    │   └── ContactPageContent.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── categoryController.js
    │   ├── insightsController.js
    │   ├── homepageController.js
    │   ├── homepageImageController.js
    │   ├── shopPageController.js
    │   ├── aboutPageController.js
    │   ├── faqPageController.js
    │   ├── legalPageController.js
    │   ├── contactPageController.js
    │   ├── tabbyController.js
    │   ├── tamaraController.js
    │   └── dhlController.js
    ├── routes/                      # All API route files
    ├── middleware/                  # Auth middleware
    ├── config/                      # MongoDB connection
    └── package.json
```

---

## Features

### Storefront
- **Homepage** — Hero, heritage story, collection showcase, why choose us section
- **Shop** — Browse all products with category filtering
- **Perfumes & Body Hair Mist** — Dedicated category landing pages
- **Product Detail** — Image gallery, fragrance notes, size, add to cart, buy now
- **Cart** — Persistent cart with quantity management
- **Checkout** — Order placement with Tabby & Tamara BNPL integrations
- **Wishlist** — Save favourite products
- **Our Story** — Brand heritage, scrolling marquee, palm tree story
- **FAQ** — Accordion with 15 questions, fully CMS-editable
- **Legal** — Tabbed Privacy Policy, Terms & Conditions, Returns Policy
- **Contact Us** — Contact form + editable Instagram grid section

### Admin CMS Panel (`/zafira/admin/panel`)
- **Visual page editors** for every public page — click any text or image on a live preview canvas to edit it in place
- **Rich typography controls** — font family, size, weight, color, letter spacing, alignment, margin, padding, line height, HTML tag selector
- **Image replacement** — upload custom images per field, revert to default
- **Full page editors:** Homepage, Shop, About Us, FAQ, Legal, Contact Us, Perfumes, Body & Hair Mist
- **Product catalog** — add, edit, delete products with image upload
- **Category manager**
- **Order management** — view and update order statuses
- **Sales insights dashboard**

### Payments & Logistics
- **Tabby** — 4 interest-free instalment promo widget + checkout card
- **Tamara** — 3 interest-free instalment promo widget + checkout integration
- **DHL** — Shipping rate calculator

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), HTTP-only cookies |
| Image Upload | Cloudinary + Multer |
| Payments | Tabby, Tamara |
| Shipping | DHL API |
| Database | MongoDB (hosted on MongoDB Atlas) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Tabby & Tamara merchant accounts

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

TABBY_SECRET_KEY=your_tabby_secret
TABBY_MERCHANT_CODE=your_merchant_code

TAMARA_API_URL=https://api.tamara.co
TAMARA_API_TOKEN=your_tamara_token
TAMARA_NOTIFICATION_KEY=your_notification_key
TAMARA_PUBLIC_KEY=your_public_key

DHL_API_KEY=your_dhl_api_key
DHL_API_SECRET=your_dhl_api_secret

DASHBOARD_EMAIL=your_admin_email
DASHBOARD_PASSWORD=your_admin_password
```

```bash
npm run dev      # development (nodemon)
npm start        # production
```

Backend runs on `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_TABBY_PUBLIC_KEY=your_tabby_public_key
NEXT_PUBLIC_TABBY_MERCHANT_CODE=your_merchant_code
```

```bash
npm run dev      # development
npm run build    # production build
npm start        # production server
```

Frontend runs on `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Place new order |
| PUT | `/api/orders/:id` | Update order status |

### CMS Pages
| Method | Endpoint | Description |
|---|---|---|
| GET/PUT | `/api/homepage` | Homepage content |
| GET/PUT | `/api/shoppage` | Shop page content |
| GET/PUT | `/api/aboutpage` | About Us content |
| GET/PUT | `/api/faqpage` | FAQ content |
| GET/PUT | `/api/legalpage` | Legal page content |
| GET/PUT | `/api/contactpage` | Contact Us content |
| POST | `/api/*/upload-image` | Image upload (per page) |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/categories` | Category management |
| GET | `/api/insights` | Sales dashboard data |
| POST | `/api/tabby/*` | Tabby payment session |
| POST | `/api/tamara/*` | Tamara payment session |
| POST | `/api/dhl/*` | DHL shipping rates |

---

## Admin Access

Navigate to `/zafira/admin/panel` and log in with your admin credentials created via the backend.

---

## License

All rights reserved © ZAFIRA
