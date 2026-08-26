import { useState, useEffect } from "react";
import CustomerList from "../components/CustomerList";
import { customerService } from "../services/customerService";
import type { Customer } from "../types/customer";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

interface Props {
  user?: AuthUser | null;
}

const CustomerPage = ({ user }: Props) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerService
      .getAll()
      .then(setCustomers)
      .catch(() => setError("Failed to load customers. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer information.</p>
        </div>
        <div className="customer-page-header-right">
          {user && (
            <span className="customer-user-badge">
              {user.name} &mdash; {user.role}
            </span>
          )}
          {user?.role === "admin" && (
            <button type="button">Add Customer</button>
          )}
        </div>
      </div>

      {loading && <p className="customer-status">Loading customers...</p>}
      {error && <p className="customer-error">{error}</p>}
      {!loading && !error && <CustomerList customers={customers} />}
    </section>
  );
};

export default CustomerPage;
