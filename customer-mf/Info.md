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

## What We Built — Phase 1

### Step 1 — Customer MF as a Standalone App

We built a normal React app that shows a customer table:

```
customer-mf running on :3001

┌─────────────────────────────────┐
│  Customers        [Add Customer]│
│                                 │
│  ID │ Name  │ Email │ Company   │
│  1  │ Rahul │ ...   │ ABC       │
│  2  │ Priya │ ...   │ XYZ       │
│  3  │ Amit  │ ...   │ TechWorld │
└─────────────────────────────────┘
```

### Step 2 — Giving Customer MF a "Public Door"

We created `CustomerApp.tsx`. This is the component we decided to share with the outside world.

```
customer-mf
├── App.tsx         ← used when running standalone on :3001
└── CustomerApp.tsx ← used when Host wants to load it
```

> Think of it like a restaurant that also does delivery.
> The dine-in experience is `App.tsx`.
> The delivery menu is `CustomerApp.tsx`.
> Same food, two ways to access it.

### Step 3 — Module Federation on Customer MF

We configured `vite.config.ts` in customer-mf:

```
name: "customer_mf"       ← "My name is customer_mf"

exposes:
  "./CustomerApp"          ← "I am willing to share this component"

shared:
  react, react-dom         ← "Let's not load React twice"
```

This generated a file called `remoteEntry.js`. Think of it as a catalogue:

```
remoteEntry.js

"Hello, I am customer_mf.
 I have CustomerApp available.
 Come fetch it from me."
```

### Step 4 — Host Configured to Consume Customer MF

We configured the Host to know about Customer MF:

```
remotes:
  customer_mf → http://localhost:3001/remoteEntry.js
```

And in `App.tsx` of the Host:

```tsx
const CustomerApp = lazy(() => import("customer_mf/CustomerApp"))
```

This is the magic line. The Host is saying:

```
"I don't have CustomerApp in my own code.
 Go to customer_mf and get it at runtime."
```

---

## What We Built — Phase 2

### React Router added to Host

The Host now has real URL-based routing using React Router:

```
/           → redirects to /customers
/customers  → loads CustomerApp from customer-mf (:3001)
/orders     → loads OrderApp from order-mf (:3002)
/reports    → loads ReportApp from report-mf (:3003)
```

Each route loads its MF **lazily** — meaning the code is only fetched from the remote when that route is visited. If you never visit `/reports`, the report-mf code is never downloaded.

### order-mf and report-mf configured as Remotes

Both apps now have:
- `OrderApp.tsx` / `ReportApp.tsx` — their federated entry points
- `vite.config.ts` — configured with Module Federation
- `remoteEntry.js` — generated and served on their ports

### Nav bar is now clickable

The Host nav bar uses `NavLink` from React Router. The active route is highlighted with a blue underline so the user always knows where they are.

### What the browser does now

```
User clicks "Orders" in nav
        │
        ▼
URL changes to /orders
        │
        ▼
React Router renders <OrderApp />
        │
        ▼
Suspense triggers — shows "Loading..."
        │
        │  HTTP request (only happens once)
        ▼
Fetches localhost:3002/remoteEntry.js
        │
        ▼
Fetches OrderApp chunk from :3002
        │
        ▼
OrderApp renders inside Host
```

---

## What Actually Happens in the Browser (Full Flow)

```
You open localhost:3000
        │
        ▼
Host loads its own HTML, CSS, JS
        │
        ▼
React Router reads the URL
        │
        ▼
/ → redirects to /customers
        │
        ▼
Host sees: "I need customer_mf/CustomerApp"
        │
        │  HTTP request
        ▼
Fetches localhost:3001/remoteEntry.js
        │
        ▼
remoteEntry says: "CustomerApp is in this chunk"
        │
        │  HTTP request
        ▼
Fetches that chunk from :3001
        │
        ▼
CustomerApp renders inside Host's <main>
```

Two completely separate servers. Two completely separate codebases. One seamless UI.

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

---

## Current Status

```
✅ Phase 1 — Microfrontend Foundation
   ✅ customer-mf  → standalone app on :3001
   ✅ customer-mf  → Module Federation Remote configured
   ✅ host         → Module Federation Host configured

✅ Phase 2 — Routing & Navigation
   ✅ React Router in Host
   ✅ /customers → customer-mf
   ✅ /orders    → order-mf
   ✅ /reports   → report-mf
   ✅ order-mf   → Module Federation Remote configured
   ✅ report-mf  → Module Federation Remote configured
   ✅ Active nav link highlighting

🔄 Phase 3 — Shared State & Auth (next)
🔜 Phase 4 — Django + PostgreSQL API
🔜 Phase 5 — Docker + Nginx + CI/CD
```

---

## What It Looks Like Now

```
localhost:3000/customers

┌──────────────────────────────────────────┐
│ Enterprise   Customers  Orders  Reports  │  ← Host nav
├──────────────────────────────────────────┤
│  Customers              [Add Customer]   │  ← customer-mf
│                                          │
│  ID │ Name  │ Email │ Company │ Status   │
│  1  │ Rahul │ ...   │ ABC     │ Active   │
└──────────────────────────────────────────┘

localhost:3000/orders

┌──────────────────────────────────────────┐
│ Enterprise   Customers  Orders  Reports  │
├──────────────────────────────────────────┤
│  Orders                                  │  ← order-mf
│  Manage order information.               │
│                                          │
│  [ Order MF — coming soon ]              │
└──────────────────────────────────────────┘
```

The nav bar is owned by the **Host team**.
Each section is owned by its **own team**.
They run on different ports, built separately, deployed separately — but look like one app to the user.

**That is Microfrontend.**
