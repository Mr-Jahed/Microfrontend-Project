import { lazy, Suspense } from "react";

const CustomerApp = lazy(() => import("customer_mf/CustomerApp"));

function App() {
  return (
    <div className="host-shell">
      <nav className="host-nav">
        <span className="host-logo">Enterprise</span>
        <ul>
          <li>Customers</li>
        </ul>
      </nav>

      <main className="host-main">
        <Suspense fallback={<div className="host-loading">Loading...</div>}>
          <CustomerApp />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
