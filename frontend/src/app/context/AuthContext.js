"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true); // State to track the loading status of authentication check
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token){
        setIsAuthenticated(true); // Explicit check
    }else {
      setIsAuthenticated(false); // Set unauthenticated if no token
    }
    setLoading(false); // Stop loading once the authentication check is done
  }, []);
  
  const login = (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem('refreshToken');
    localStorage.removeItem("access_token");

    setIsAuthenticated(false);

    // Redirect to login page
    router.push('/pages/login');
    window.location.reload()
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {!loading ? children : <div>Loading...</div>} {/* Show loading state while authentication status is being checked */}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
