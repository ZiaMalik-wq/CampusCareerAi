import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user details from Backend
  const fetchCurrentUser = async (token) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Success: Set the full user object (id, email, role, etc.)
      setUser(response.data);
    } catch (error) {
      console.error("Token invalid or expired", error);
      // If token is bad, clear it out
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 1. Check if user is already logged in when app loads (The "Persist" logic)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      // A. Create Form Data (Standard FastAPI requirement for OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append("username", email); // Backend expects 'username' key
      formData.append("password", password);

      // B. Send Request to get Token
      const response = await api.post("/auth/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // C. Save Token
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      // D. IMPORTANT: Fetch the user details immediately after getting the token
      // This ensures the UI updates (e.g., shows "Welcome, Student") without a refresh
      await fetchCurrentUser(access_token);

      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Throw error so the UI can show an alert
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Optional: window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
