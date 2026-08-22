import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

const CustomerApp = lazy(() => import("customer_mf/CustomerApp"));
const OrderApp = lazy(() => import("order_mf/OrderApp"));
const ReportApp = lazy(() => import("report_mf/ReportApp"));

const Loading = () => <div className="host-loading">Loading...</div>;

const Shell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
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
        <div className="host-nav-user">
          <span className="host-nav-username">{user?.name}</span>
          <span className="host-nav-role">{user?.role}</span>
          <button className="host-nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="host-main">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomerApp user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderApp user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportApp user={user} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<Shell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
