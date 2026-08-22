import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock credentials — will be replaced by Django API in Phase 4
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@enterprise.com": {
    password: "admin123",
    user: { id: 1, name: "Admin User", email: "admin@enterprise.com", role: "admin" },
  },
  "viewer@enterprise.com": {
    password: "viewer123",
    user: { id: 2, name: "Viewer User", email: "viewer@enterprise.com", role: "viewer" },
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string): boolean => {
    const match = MOCK_USERS[email];
    if (match && match.password === password) {
      setUser(match.user);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
