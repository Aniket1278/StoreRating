# StoreRate — Full Stack Rating App

MERN-style stack (React + Express + Node), using **MySQL** as the database, for submitting and managing store ratings.

---

## Tech Stack

| Layer    | Technology                          |
|----------|--------------------------------------|
| Backend  | Node.js, Express.js                 |
| Database | MySQL + Sequelize ORM               |
| Frontend | React 18 + Vite                     |
| Auth     | JWT (JSON Web Tokens)               |
| Styling  | Pure CSS, custom design system      |

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── config/
│   │   └── database.js      ← Sequelize connection to MySQL
│   ├── models/
│   │   ├── User.js          ← User table (name, email, role, password hash)
│   │   ├── Store.js         ← Store table (name, email, averageRating)
│   │   ├── Rating.js        ← Rating table (userId, storeId, value 1–5)
│   │   └── index.js         ← Associations between models
│   ├── routes/
│   │   ├── auth.js          ← POST /signup, POST /login, PUT /password
│   │   ├── admin.js         ← GET/POST users & stores (admin only)
│   │   ├── stores.js        ← GET stores (users see their own rating too)
│   │   ├── ratings.js       ← POST/PUT ratings (users only)
│   │   └── owner.js         ← GET dashboard (store_owner only)
│   ├── middleware/
│   │   └── auth.js          ← protect() + authorize(...roles)
│   ├── seed-admin.js        ← Creates the first admin account
│   └── server.js            ← Express app entry point
└── frontend/
    └── src/
        ├── api/axios.js     ← Axios instance with JWT interceptor
        ├── context/
        │   ├── AuthContext  ← Global user state, login/signup/logout
        │   └── ThemeContext ← Dark/light mode toggle
        ├── components/
        │   ├── Navbar       ← Top bar with theme toggle
        │   ├── SortableTable← Reusable table with client-side sort
        │   ├── StarRating   ← StarPicker (interactive) + StarDisplay (read-only)
        │   ├── Modal        ← Backdrop modal with Escape key support
        │   └── ProtectedRoute← Role-based route guard
        └── pages/
            ├── LoginPage    ← Email + password sign in
            ├── SignupPage   ← Registration with full validation
            ├── AdminPage    ← Dashboard + Users + Stores tabs
            ├── StoresPage   ← Browse, search, and rate stores
            └── OwnerPage    ← Store owner's customer ratings view
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL Server (local install, XAMPP/WAMP, or a cloud instance like PlanetScale/RDS)

### 1. Create the database

Log into MySQL and run:

```sql
CREATE DATABASE store_rating_db;
```

That's it — Sequelize will create all the tables automatically on first run.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set DB_HOST, DB_NAME, DB_USER, DB_PASS, JWT_SECRET
node seed-admin.js   # Creates tables + first admin account
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## User Roles

### System Administrator
- Login at `/login`
- Access dashboard at `/admin`
- Can add users (any role) and stores
- Can filter/sort all user and store listings

### Normal User
- Sign up at `/signup` or login at `/login`
- Access store listings at `/stores`
- Can search stores by name and address
- Can submit or edit ratings (1–5 stars)
- Can change their password

### Store Owner
- Created by an Admin (no self-registration)
- Login at `/login`
- Dashboard at `/owner` shows customer ratings and store average

---

## API Endpoints

### Auth
| Method | Endpoint            | Description           | Auth |
|--------|----------------------|------------------------|------|
| POST   | /api/auth/signup    | Register (user only)  | ✗    |
| POST   | /api/auth/login     | Login all roles       | ✗    |
| PUT    | /api/auth/password  | Change password       | ✓    |
| GET    | /api/auth/me         | Get current user      | ✓    |

### Admin
| Method | Endpoint              | Description           |
|--------|-------------------------|-------------------------|
| GET    | /api/admin/dashboard  | Stats summary          |
| GET    | /api/admin/users      | List users (filters)   |
| POST   | /api/admin/users      | Create any user        |
| GET    | /api/admin/stores     | List stores (filters)  |
| POST   | /api/admin/stores     | Create store            |

### Stores (normal user)
| Method | Endpoint      | Description                       |
|--------|----------------|-------------------------------------|
| GET    | /api/stores   | All stores + user's own ratings    |

### Ratings (normal user)
| Method | Endpoint              | Description       |
|--------|-------------------------|---------------------|
| POST   | /api/ratings           | Submit new rating  |
| PUT    | /api/ratings/:storeId  | Update rating       |

### Owner
| Method | Endpoint              | Description                |
|--------|-------------------------|-------------------------------|
| GET    | /api/owner/dashboard  | Store stats + rater list   |

---

## Validation Rules (enforced frontend + backend)

| Field    | Rule                                              |
|----------|-----------------------------------------------------|
| Name     | 20–60 characters                                   |
| Address  | Max 400 characters                                 |
| Email    | Standard email format                              |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character     |
| Rating   | Integer 1–5                                        |

---

## Database Schema (MySQL)

Three tables, created automatically by Sequelize on `sequelize.sync()`:

**users** — `id, name, email (unique), password (hashed), address, role (enum: admin/user/store_owner), storeId (FK, nullable), createdAt, updatedAt`

**stores** — `id, name, email (unique), address, averageRating (decimal), totalRatings (int), ownerId (FK to users, nullable), createdAt, updatedAt`

**ratings** — `id, userId (FK), storeId (FK), value (int 1–5), createdAt, updatedAt` — with a unique composite index on `(userId, storeId)` so a user can only rate a store once.

Relationships: a `User` (store_owner) has one `Store`; a `Store` has many `Ratings`; a `User` (normal) has many `Ratings`.

---

## Design System

- **Dark / light mode** — auto-detects OS preference, persists via localStorage
- **Typography** — Inter (UI) + JetBrains Mono (code/data)
- **Colors** — neutral monochromatic palette, no neon; amber accent for stars only
- **No external UI library** — all components hand-coded

---

## First Admin Setup

Run once from the `backend/` folder — this also creates all tables:

```bash
node seed-admin.js
```

This logs in with:
- Email: `admin@storerate.com`
- Password: `Admin@123`

Change this password immediately after first login in production.
