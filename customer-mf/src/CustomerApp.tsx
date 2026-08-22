import CustomerPage from "./pages/CustomerPage";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

interface Props {
  user?: AuthUser | null;
}

const CustomerApp = ({ user }: Props) => {
  return <CustomerPage user={user} />;
};

export default CustomerApp;
