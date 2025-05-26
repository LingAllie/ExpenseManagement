import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

// Tạo Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const storedUser = tokenMethod.get();
    if (storedUser && storedUser.token && storedUser.user) {
      setUser(storedUser.user); // Chỉ lưu thông tin user
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // ✅ Đăng nhập
  const login = async (phoneNumber, password, rememberMe) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const authData = await authService.login(phoneNumber, password, rememberMe);

      if (!authData || !authData.token || !authData.user) {
        throw new Error("Invalid response from server!");
      }

      setUser(authData.user);
      setIsAuthenticated(true);
      navigate(PATHS.homepage);
      return authData;
    } catch (error) {
      throw error;
    }
  };


  // ✅ Đăng xuất
  const logout = () => {
    tokenMethod.remove();
    setUser(null);
    setIsAuthenticated(false);
    navigate(PATHS.login);
  };

  // ✅ Đăng ký
  const register = async (payload) => {
    try {
      const response = await authService.register(payload);
      return response;
    } catch (error) {
      if (error.message.includes("Account has been registered")) {
        throw error;
      }
      throw new Error(
        error.response?.data?.message || "Something went wrong during registration."
      );
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook để dùng Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;