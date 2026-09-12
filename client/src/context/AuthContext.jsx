import { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken as setApiToken } from "../api/axios.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await api.post("/auth/refresh");
        setAccessToken(res.data.accessToken);
      } catch (error) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    tryRefresh();
  }, []);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};