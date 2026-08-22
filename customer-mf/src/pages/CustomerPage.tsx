import CustomerList from "../components/CustomerList";
import { customers } from "../data/customerData";

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
      <CustomerList customers={customers} />
    </section>
  );
};

export default CustomerPage;
