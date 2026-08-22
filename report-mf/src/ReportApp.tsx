interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

interface Props {
  user?: AuthUser | null;
}

const ReportApp = ({ user }: Props) => {
  return (
    <section className="mf-page">
      <div className="mf-page-header">
        <div>
          <h1>Reports</h1>
          <p>View analytics and reports.</p>
        </div>
        {user && (
          <span className="mf-user-badge">
            {user.name} &mdash; {user.role}
          </span>
        )}
      </div>
      <div className="mf-placeholder">
        <span>Report MF — coming soon</span>
      </div>
    </section>
  );
};

export default ReportApp;
