import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    userId: localStorage.getItem("userId") || null,
  });
  const login = (token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setAuth({ token, userId });
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuth({ token: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
