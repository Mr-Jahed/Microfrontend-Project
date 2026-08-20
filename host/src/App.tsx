import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";

const CustomerApp = lazy(() => import("customer_mf/CustomerApp"));
const OrderApp = lazy(() => import("order_mf/OrderApp"));
const ReportApp = lazy(() => import("report_mf/ReportApp"));

const Loading = () => <div className="host-loading">Loading...</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="host-shell">
        <nav className="host-nav">
          <span className="host-logo">Enterprise</span>
          <ul>
            <li>
              <NavLink to="/customers" className={({ isActive }) => isActive ? "active" : ""}>
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
                Reports
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="host-main">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/customers" replace />} />
              <Route path="/customers" element={<CustomerApp />} />
              <Route path="/orders" element={<OrderApp />} />
              <Route path="/reports" element={<ReportApp />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
