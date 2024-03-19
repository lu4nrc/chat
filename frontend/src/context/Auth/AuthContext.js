import React, { createContext, useContext } from "react";
import useAuth from "../../hooks/useAuth.js";


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { loading, user, isAuth, handleLogin, handleLogout, refreshUser } = useAuth();

  return (
    <AuthContext.Provider
      value={{ loading, user, isAuth, handleLogin, handleLogout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuthContext };