# Microfrontend Enterprise Platform — Project Notes

---

## What is this project?

Imagine a big company like Amazon or Flipkart. Their website has many sections:

- Customers section
- Orders section
- Reports section
- Navigation / Shell

In a normal React app, one team builds everything in one giant project. That becomes a problem when the company grows.

---

## The Problem with One Big App

```
ONE GIANT REACT APP
├── CustomerPage
├── OrderPage
├── ReportPage
└── Navigation
```

- Customer team changes something → entire app needs to be rebuilt and redeployed
- Order team is blocked waiting for Customer team
- One bug anywhere can break everything
- 50 developers working in the same codebase = chaos

---

## What Microfrontend Solves

Instead of one giant app, each team owns their own independent app:

```
Customer Team → customer-mf   (runs on :3001)
Order Team    → order-mf      (runs on :3002)
Report Team   → report-mf     (runs on :3003)
Shell Team    → host          (runs on :3000)
Backend Team  → Django API    (runs on :8000)
```

---

## Phase 1 — Microfrontend Foundation ✅

- `customer-mf` as a standalone React app showing a customer table
- `CustomerApp.tsx` as the federated entry point
- Module Federation configured — generates `remoteEntry.js`
- Host configured to consume `customer-mf` at runtime via `React.lazy`

---

## Phase 2 — Routing & Navigation ✅

- React Router in Host with real URL-based routing
- `order-mf` and `report-mf` configured as Module Federation remotes
- Nav bar uses `NavLink` with active route highlighting

```
/           → redirects to /customers
/customers  → loads CustomerApp from customer-mf (:3001)
/orders     → loads OrderApp   from order-mf    (:3002)
/reports    → loads ReportApp  from report-mf   (:3003)
```

---

## Phase 3 — Shared Auth Context ✅

- `AuthContext` in Host — single source of truth for authentication
- `LoginPage` at `/login` with mock credentials
- `ProtectedRoute` — redirects to `/login` if not authenticated
- User passed as prop into every MF
- Role-based UI — admin sees Add Customer button, viewer does not
- Logout button in nav

```
Mock credentials:
  admin@enterprise.com  / admin123   → role: admin
  viewer@enterprise.com / viewer123  → role: viewer
```

---

## Phase 4 — Django + SQLite API ✅

### What we built

The entire backend for the Customer domain. This replaces the hardcoded
`customerData.ts` with a real database-backed REST API.

> **Database note:** Using SQLite for local development (`backend/db.sqlite3`).
> PostgreSQL is planned for Phase 5 (Docker + production setup).
> The settings.py has a `USE_POSTGRES` flag — set it to `True` in `.env` when PostgreSQL is available.

### Backend structure

```
backend/
├── core/                   ← Django project config
│   ├── settings.py         ← SQLite/PostgreSQL toggle, CORS, REST framework
│   └── urls.py             ← Root URL routing
├── customers/              ← Customer Django app
│   ├── models.py           ← Customer database model
│   ├── serializers.py      ← DRF serializer (model → JSON)
│   ├── views.py            ← API views (GET, POST, PUT, DELETE)
│   ├── urls.py             ← /api/customers/ routes
│   ├── admin.py            ← Django admin registration
│   └── management/
│       └── commands/
│           └── seed_customers.py  ← Seed command
├── db.sqlite3              ← SQLite database (not committed)
├── .env                    ← DB credentials (not committed)
├── requirements.txt        ← Python dependencies
└── manage.py
```

### API endpoints

| Method | URL | What it does |
|---|---|---|
| GET | `/api/customers/` | List all customers |
| POST | `/api/customers/` | Create a new customer |
| GET | `/api/customers/:id/` | Get one customer |
| PUT | `/api/customers/:id/` | Update a customer |
| DELETE | `/api/customers/:id/` | Delete a customer |

### Customer model

```python
class Customer(models.Model):
    name     = CharField
    email    = EmailField (unique)
    phone    = CharField
    company  = CharField
    status   = CharField  (Active / Inactive)
    created_at = DateTimeField (auto)
```

This matches the TypeScript `Customer` interface exactly — same fields, same values.

### Django settings — key decisions

- **SQLite** by default — zero setup, works immediately
- **PostgreSQL** opt-in via `USE_POSTGRES=True` in `.env` (Phase 5)
- **CORS** allows all 4 MF dev servers (`:3000` to `:3003`)
- **REST Framework** with JSON renderer
- **python-dotenv** loads `.env` — DB credentials never hardcoded

### customerService.ts — the Axios layer

```
customer-mf
└── src/services/customerService.ts

Provides:
  customerService.getAll()        → GET  /api/customers/
  customerService.getById(id)     → GET  /api/customers/:id/
  customerService.create(data)    → POST /api/customers/
  customerService.update(id,data) → PUT  /api/customers/:id/
  customerService.remove(id)      → DELETE /api/customers/:id/
```

### CustomerPage — now fetches from API

```
Before Phase 4:
  CustomerPage reads from customerData.ts (hardcoded array)

After Phase 4:
  CustomerPage calls customerService.getAll()
  Shows "Loading customers..." while fetching
  Shows error message if API is not running
  Renders real data from PostgreSQL
```

### How the full data flow works

```
User opens /customers
        │
        ▼
CustomerPage mounts → useEffect fires
        │
        │  HTTP GET
        ▼
customerService.getAll()
        │
        │  http://localhost:8000/api/customers/
        ▼
Django REST Framework
        │
        │  ORM query
        ▼
PostgreSQL → returns rows
        │
        ▼
DRF serializes → JSON response
        │
        ▼
Axios receives data → setCustomers(data)
        │
        ▼
CustomerList renders the real data
```

### How to run the backend

**Prerequisites:** Python 3.10+ only. No database setup needed (SQLite is built-in).

```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# 3. Run migrations (creates db.sqlite3 automatically)
python manage.py migrate

# 4. Seed sample data
python manage.py seed_customers

# 5. Start the server
python manage.py runserver
```

API will be available at `http://localhost:8000/api/customers/`

---

## Current Status

```
✅ Phase 1 — Microfrontend Foundation
✅ Phase 2 — Routing & Navigation
✅ Phase 3 — Shared Auth Context
✅ Phase 4 — Django + SQLite API
   ✅ Django project created (backend/)
   ✅ Customer model + migrations
   ✅ REST API — GET, POST, PUT, DELETE
   ✅ CORS configured for all MF ports
   ✅ Seed data management command
   ✅ customerService.ts with Axios
   ✅ CustomerPage fetches from real API
   ✅ Loading and error states
   ✅ SQLite for local dev (USE_POSTGRES flag for future PostgreSQL)

🔜 Phase 5 — Docker + Nginx + CI/CD
```

---

## Full Architecture (Current)

```
Browser
  │
  ▼
localhost:3000 (Host — React)
  │
  ├── /customers → localhost:3001 (customer-mf)
  │                     │
  │                     │ HTTP GET /api/customers/
  │                     ▼
  │               localhost:8000 (Django API)
  │                     │
  │                     ▼
  │               SQLite / PostgreSQL (enterprise_db)
  │
  ├── /orders  → localhost:3002 (order-mf)
  └── /reports → localhost:3003 (report-mf)
```

**That is a real enterprise full-stack Microfrontend system.**
