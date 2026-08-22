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
```

Each team:
- Deploys independently
- Uses their own tech stack if needed
- Cannot break other teams

---

## Phase 1 — Microfrontend Foundation ✅

### What we built

- `customer-mf` as a standalone React app showing a customer table
- `CustomerApp.tsx` as the federated entry point (the "public door")
- Module Federation configured on `customer-mf` — generates `remoteEntry.js`
- Host configured to consume `customer-mf` at runtime via `React.lazy`

### The two lives of a Microfrontend

```
customer-mf
├── App.tsx         ← standalone mode on :3001
└── CustomerApp.tsx ← federated mode consumed by Host
```

### remoteEntry.js — the catalogue

```
"Hello, I am customer_mf.
 I have CustomerApp available.
 Come fetch it from me."
```

---

## Phase 2 — Routing & Navigation ✅

### What we built

- React Router added to Host with real URL-based routing
- `order-mf` and `report-mf` configured as Module Federation remotes
- `OrderApp.tsx` and `ReportApp.tsx` created as federated entry points
- Nav bar uses `NavLink` with active route highlighting

### Routes

```
/           → redirects to /customers
/customers  → loads CustomerApp from customer-mf (:3001)
/orders     → loads OrderApp   from order-mf    (:3002)
/reports    → loads ReportApp  from report-mf   (:3003)
```

Each MF is loaded **lazily** — only fetched when that route is visited.

---

## Phase 3 — Shared Auth Context ✅

### The problem Phase 3 solves

```
Before Phase 3:
  Host has no concept of a logged-in user
  Each MF is completely isolated
  No way to know who is using the app
  No protected routes

After Phase 3:
  Host owns authentication
  User logs in once → all MFs know who they are
  Protected routes → redirect to /login if not authenticated
  User info passed as prop into each MF
  Role-based UI (admin sees Add Customer, viewer does not)
```

### What we built

#### AuthContext (`host/src/context/AuthContext.tsx`)

The single source of truth for authentication. Lives in the Host.

```
AuthContext provides:
  user          → the logged-in user object (or null)
  login()       → validates credentials, sets user
  logout()      → clears user
  isAuthenticated → boolean shortcut
```

Mock credentials (will be replaced by Django API in Phase 4):
```
admin@enterprise.com  / admin123   → role: admin
viewer@enterprise.com / viewer123  → role: viewer
```

#### LoginPage (`host/src/pages/LoginPage.tsx`)

A clean login form at `/login`. On success navigates to `/customers`. Shows error message on wrong credentials.

#### ProtectedRoute (`host/src/components/ProtectedRoute.tsx`)

Wraps any route that requires authentication. If not logged in, redirects to `/login`.

```tsx
<ProtectedRoute>
  <CustomerApp user={user} />
</ProtectedRoute>
```

#### Token passing — user prop

The Host passes the logged-in user down into each MF as a prop:

```
Host (owns AuthContext)
  │
  │  user prop
  ▼
CustomerApp / OrderApp / ReportApp
```

This is the correct Microfrontend pattern. The MFs do NOT have their own auth — they receive identity from the Host.

#### Role-based UI in customer-mf

```
Admin  → sees "Add Customer" button
Viewer → button is hidden
Both   → see their name and role in the header
```

### How the full auth flow works

```
User opens localhost:3000
        │
        ▼
ProtectedRoute checks isAuthenticated
        │
        ▼ (not logged in)
Redirects to /login
        │
        ▼
User enters admin@enterprise.com / admin123
        │
        ▼
AuthContext.login() validates → sets user in state
        │
        ▼
Navigates to /customers
        │
        ▼
CustomerApp receives { user } prop from Host
        │
        ▼
Shows "Admin User — admin" badge
Shows "Add Customer" button (admin only)
```

### Bug fixed — remotes.d.ts

The original `remotes.d.ts` used a top-level `import` statement which TypeScript does not allow in ambient declaration files. Fixed by inlining the `RemoteAuthUser` interface directly in the file.

---

## What Actually Happens in the Browser (Full Flow)

```
You open localhost:3000
        │
        ▼
ProtectedRoute → not authenticated → redirect to /login
        │
        ▼
User logs in → AuthContext sets user state
        │
        ▼
Navigate to /customers
        │
        ▼
Host fetches localhost:3001/remoteEntry.js
        │
        ▼
CustomerApp renders with user prop
        │
        ▼
Shows customer table + user badge + role-based button
```

---

## The Key Thing Microfrontend Gave Us

| Without MF | With MF |
|---|---|
| One repo, everyone fights | Each team has their own repo |
| Deploy everything together | Deploy each app independently |
| One team's bug breaks all | Isolated failures |
| React loaded once but shared by accident | React explicitly shared as singleton |
| Host must know all code at build time | Host fetches code at runtime |
| All routes in one app | Each route owned by a separate team |
| Auth duplicated in every page | Auth owned by Host, passed to MFs |

---

## Current Status

```
✅ Phase 1 — Microfrontend Foundation
   ✅ customer-mf standalone app on :3001
   ✅ customer-mf Module Federation Remote
   ✅ host Module Federation Host

✅ Phase 2 — Routing & Navigation
   ✅ React Router in Host
   ✅ /customers → customer-mf
   ✅ /orders    → order-mf
   ✅ /reports   → report-mf
   ✅ order-mf and report-mf as federated remotes
   ✅ Active nav link highlighting

✅ Phase 3 — Shared Auth Context
   ✅ AuthContext in Host
   ✅ LoginPage with mock credentials
   ✅ ProtectedRoute — redirects if not authenticated
   ✅ User prop passed into all MFs
   ✅ Role-based UI in customer-mf
   ✅ Logout button in nav
   ✅ remotes.d.ts bug fixed

🔜 Phase 4 — Django + PostgreSQL API
🔜 Phase 5 — Docker + Nginx + CI/CD
```

---

## What It Looks Like Now

```
localhost:3000/login

┌──────────────────────────────┐
│         Enterprise           │
│    Sign in to your account   │
│                              │
│  Email: [________________]   │
│  Password: [_____________]   │
│                              │
│       [ Sign In ]            │
│                              │
│  Demo: admin@enterprise.com  │
│        admin123              │
└──────────────────────────────┘

localhost:3000/customers (logged in as admin)

┌────────────────────────────────────────────────────┐
│ Enterprise  Customers  Orders  Reports              │
│                              Admin User  admin  [Logout] │
├────────────────────────────────────────────────────┤
│  Customers                    Admin User — admin    │
│                               [Add Customer]        │
│  ID │ Name  │ Email │ Company │ Status              │
│  1  │ Rahul │ ...   │ ABC     │ Active              │
└────────────────────────────────────────────────────┘
```

The nav bar and auth are owned by the **Host team**.
The customer table and role-based UI are owned by the **Customer team**.
Auth flows from Host → MF via props. No shared state library needed.

**That is enterprise Microfrontend with authentication.**
