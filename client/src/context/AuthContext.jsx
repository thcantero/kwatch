import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode"; 
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 1. Check for token on app mount
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded); // Or fetch full user profile via API if needed
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  // 2. Login Action
  const login = async (credentials) => {
    try {
      const result = await loginUser(credentials);
      // Assuming backend returns: { success: true, data: { token: "..." } }
      const newToken = result.data.token; 
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(jwtDecode(newToken));
      return { success: true };
    } catch (err) {
      console.error("Login failed", err);
      // Return error message from backend if available
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  // 3. Register Action
  const register = async (userData) => {
    try {
      const result = await registerUser(userData);
      // If your register endpoint logs them in automatically:
      const newToken = result.data.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(jwtDecode(newToken));
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  // 4. Logout Action
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);