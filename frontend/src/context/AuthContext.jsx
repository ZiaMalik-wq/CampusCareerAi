import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Start loading as true to prevent flash of content
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user details from Backend
  const fetchCurrentUser = async (token) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Success: Set the full user object
      setUser(response.data);
    } catch (error) {
      console.error("Token invalid or expired", error);
      // If token is bad, clear it out
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      // STOP LOADING irrespective of success or failure
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token);
    } else {
      // If no token exists, we aren't loading anymore
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      await fetchCurrentUser(access_token);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    // Pass 'loading' to the rest of the app
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};