import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexcrm_token");
    if (token) {
      authService.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("nexcrm_token");
          localStorage.removeItem("nexcrm_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    localStorage.setItem("nexcrm_token", res.data.token);
    localStorage.setItem("nexcrm_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("nexcrm_token");
    localStorage.removeItem("nexcrm_user");
    setUser(null);
  };

  const isOwner = () => user?.role === "PLATFORM_OWNER";
  const isAdmin = () => user?.role === "COMPANY_ADMIN";
  const isDirecteur = () => user?.role === "DIRECTEUR";
  const isCommercial = () => user?.role === "COMMERCIAL";
  const isCompta = () => user?.role === "COMPTABILITE";
  const canEdit = () => !isDirecteur();
  const canDelete = () => isOwner() || isAdmin();

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isOwner, isAdmin, isDirecteur, isCommercial, isCompta,
      canEdit, canDelete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
