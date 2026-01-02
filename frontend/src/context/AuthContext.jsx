import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Auth bootstrap loading (NOT form loading)
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Token invalid or expired", error);
      localStorage.removeItem("token");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token).catch(() => {});
    } else {
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

      const userData = await fetchCurrentUser(access_token);
      return userData; //explicit success signal
    } catch (error) {
      console.error("Login failed", error);
      throw error; // UI can reliably catch
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
