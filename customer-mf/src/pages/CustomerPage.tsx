import CustomerList from "../components/CustomerList";
import { customers } from "../data/customerData";

const CustomerPage = () => {
  return (
    <section className="customer-page">
      <div className="customer-page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer information.</p>
        </div>
        <button type="button">Add Customer</button>
      </div>
      <CustomerList customers={customers} />
    </section>
  );
};

export default CustomerPage;
