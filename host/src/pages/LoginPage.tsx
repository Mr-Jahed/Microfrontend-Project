import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate("/customers", { replace: true });
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1>Enterprise</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enterprise.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <div className="login-hint">
          <p>Demo credentials:</p>
          <code>admin@enterprise.com / admin123</code>
          <br />
          <code>viewer@enterprise.com / viewer123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
