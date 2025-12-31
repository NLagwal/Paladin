import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  user_id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
        const token = localStorage.getItem("paladin:token");
        if (token) {
            try {
                const response = await fetch(`${API_BASE}/auth/verify`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const { user } = await response.json();
                    setUser(user);
                } else {
                    localStorage.removeItem("paladin:token");
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem("paladin:token");
            }
        }
        setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Login failed:", errorData?.message ?? response.statusText);
        return false;
      }

      const { token } = await response.json();
      localStorage.setItem("paladin:token", token);
      const { user: userData } = await fetch(`${API_BASE}/auth/verify`, {
          headers: {
              "Authorization": `Bearer ${token}`,
          },
      }).then(res => res.json());
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Network error during login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Signup failed:", errorData?.message ?? response.statusText);
            return false;
        }

        const { token, user } = await response.json();
        localStorage.setItem("paladin:token", token);
        setUser(user);
        return true;
    } catch (error) {
        console.error("Network error during signup:", error);
        return false;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("paladin:token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
