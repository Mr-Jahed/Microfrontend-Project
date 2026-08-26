# Microfrontend Enterprise Platform

A production-grade **Microfrontend architecture** built with React, TypeScript, Vite, and Module Federation — designed to simulate how large enterprise teams independently develop, deploy, and compose frontend applications into a single seamless shell.

---

## Architecture Overview

```
                        ┌─────────────────────────┐
                        │         HOST            │
                        │     Shell / Gateway     │
                        │       :3000             │
                        └────────────┬────────────┘
                                     │
                    Module Federation │ (runtime composition)
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   customer-mf   │       │    order-mf     │       │   report-mf     │
│  Customer Team  │       │   Order Team    │       │ Analytics Team  │
│     :3001       │       │     :3002       │       │     :3003       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

Each Microfrontend is an **independently deployable React application** that can run standalone or be composed into the Host shell at runtime — without rebuilding any other application.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Module Federation | @module-federation/vite |
| Styling | Plain CSS (component-scoped) |
| Package Manager | npm |
| Backend | Django + Django REST Framework |
| Database | SQLite *(dev)* / PostgreSQL *(planned)* |
| Containerization *(planned)* | Docker + Docker Compose |
| Reverse Proxy *(planned)* | Nginx |
| CI/CD *(planned)* | GitHub Actions |

---

## Project Structure

```
microfrontend-enterprise/
│
├── host/                   # Shell application — composes all MFs
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth state — user, login, logout
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── App.tsx              # Routes + Shell layout
│   │   ├── remotes.d.ts         # TypeScript declarations for remotes
│   │   └── main.tsx
│   └── vite.config.ts           # Federation Host config
│
├── customer-mf/            # Customer Microfrontend (Remote)
│   ├── src/
│   │   ├── components/
│   │   │   └── CustomerList.tsx
│   │   ├── pages/
│   │   │   └── CustomerPage.tsx
│   │   ├── services/
│   │   │   └── customerService.ts  # Axios → Django API
│   │   ├── types/
│   │   │   └── customer.ts
│   │   ├── CustomerApp.tsx      # Federated entry point (exposed)
│   │   └── App.tsx              # Standalone entry point
│   └── vite.config.ts           # Federation Remote config
│
├── order-mf/               # Order Microfrontend (Remote)
├── report-mf/              # Report Microfrontend (Remote)
│
├── backend/                # Django REST API
│   ├── core/               # Django project settings
│   ├── customers/          # Customer app — model, views, serializer
│   ├── .env                # DB credentials (not committed)
│   ├── requirements.txt
│   └── manage.py
│
├── .gitignore
└── README.md
```

---

## Port Allocation

| Application | Port | Role |
|---|---|---|
| host | 3000 | Shell / Host |
| customer-mf | 3001 | Remote — Customer domain |
| order-mf | 3002 | Remote — Order domain |
| report-mf | 3003 | Remote — Report domain |
| Django API | 8000 | Backend REST API |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+

### Install dependencies for all apps

```bash
cd host && npm install
cd ../customer-mf && npm install
cd ../order-mf && npm install
cd ../report-mf && npm install
```

### Run in development

Open a separate terminal for each app:

```bash
# Terminal 1 — Backend (start first)
cd backend
venv\Scripts\activate
python manage.py migrate
python manage.py seed_customers
python manage.py runserver

# Terminal 2 — Customer MF
cd customer-mf
npm run dev

# Terminal 3 — Host
cd host
npm run dev
```

Then open `http://localhost:3000`

### Build for production

```bash
# Build each remote first, then the host
cd customer-mf && npm run build
cd ../order-mf && npm run build
cd ../report-mf && npm run build
cd ../host && npm run build
```

---

## Module Federation — How It Works

### Remote (customer-mf)

The remote exposes a component through `vite.config.ts`:

```ts
federation({
  name: "customer_mf",
  filename: "remoteEntry.js",
  exposes: {
    "./CustomerApp": "./src/CustomerApp.tsx",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
})
```

This generates `remoteEntry.js` — a manifest that tells any consumer what this app exposes.

### Host

The host declares which remotes it knows about:

```ts
federation({
  name: "host",
  remotes: {
    customer_mf: "http://localhost:3001/remoteEntry.js",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
})
```

### Consuming a Remote in the Host

```tsx
const CustomerApp = lazy(() => import("customer_mf/CustomerApp"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerApp />
    </Suspense>
  );
}
```

The Host fetches `CustomerApp` from `customer-mf` **at runtime in the browser** — not at build time. This is the core of Microfrontend architecture.

---

## Key Concepts

### Two Lives of a Microfrontend

Every MF in this project has two modes:

| Mode | How | URL |
|---|---|---|
| Standalone | `npm run dev` inside the MF folder | `localhost:3001` |
| Federated | Loaded by Host at runtime | `localhost:3000` |

This allows each team to develop and test their MF independently without running the entire platform.

### Shared React Singleton

Both Host and all remotes declare `react` and `react-dom` as `singleton: true`. This ensures only one copy of React runs in the browser — preventing hook identity issues that occur when multiple React instances exist on the same page.

### remoteEntry.js

The federation manifest generated at build time (and served in dev mode). It acts as the public API catalogue of a Microfrontend:

```
"I am customer_mf.
 I expose: CustomerApp
 I share: react, react-dom"
```

---

## Development Roadmap

### Phase 1 — Microfrontend Foundation ✅
- [x] Host shell application
- [x] customer-mf standalone app
- [x] Module Federation configuration (Remote + Host)
- [x] CustomerApp exposed and consumed by Host

### Phase 2 — Routing & Navigation ✅
- [x] React Router in Host (shell-level routing)
- [x] `/customers` → loads customer-mf
- [x] `/orders` → loads order-mf
- [x] `/reports` → loads report-mf
- [x] order-mf and report-mf as federated remotes

### Phase 3 — Shared State & Auth ✅
- [x] Shared authentication context (AuthContext in Host)
- [x] Token passing between Host and remotes (user prop)
- [x] Protected routes (ProtectedRoute component)
- [x] Login page with mock credentials
- [x] Role-based UI (admin vs viewer)
- [x] Logout button in nav

### Phase 4 — API Layer ✅
- [x] Django REST Framework backend
- [x] SQLite database (dev) — PostgreSQL planned for Phase 5
- [x] `USE_POSTGRES` flag in settings for easy PostgreSQL switch
- [x] Axios service layer in customer-mf
- [x] Replace local mock data with real API calls
- [x] CORS configured for all MF dev servers
- [x] Seed data management command
- [x] Loading and error states in CustomerPage

### Phase 5 — Infrastructure
- [ ] Docker + Docker Compose
- [ ] Nginx reverse proxy
- [ ] GitHub Actions CI/CD pipeline
- [ ] Production build and deployment

---

## Why Microfrontend?

| Problem (Monolith) | Solution (Microfrontend) |
|---|---|
| One team's change requires full redeploy | Each MF deploys independently |
| All teams blocked by one broken build | Isolated failures per MF |
| Codebase grows unmanageable | Each team owns a bounded domain |
| Shared React causes version conflicts | Singleton shared modules |
| Cannot scale teams independently | Teams work in parallel |

---

## Contributing

This is a learning and reference project. Each folder (`host`, `customer-mf`, `order-mf`, `report-mf`) represents an independently owned application. Treat each one as if it belongs to a separate team with its own deployment pipeline.

---

## License

Owned by Mr-Jahed Inamdar
