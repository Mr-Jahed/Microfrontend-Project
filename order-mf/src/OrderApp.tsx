interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

interface Props {
  user?: AuthUser | null;
}

const OrderApp = ({ user }: Props) => {
  return (
    <section className="mf-page">
      <div className="mf-page-header">
        <div>
          <h1>Orders</h1>
          <p>Manage order information.</p>
        </div>
        {user && (
          <span className="mf-user-badge">
            {user.name} &mdash; {user.role}
          </span>
        )}
      </div>
      <div className="mf-placeholder">
        <span>Order MF — coming soon</span>
      </div>
    </section>
  );
};

export default OrderApp;
