"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axiosPrivate from "utils/axiosPrivate";

export const withRoleAuth = (allowedRoles) => {
  return (WrappedComponent) => {
    return function ProtectedComponent(props) {
      const [isAuthorized, setIsAuthorized] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      const router = useRouter();

      useEffect(() => {
        const verifyAuth = async () => {
          const token = localStorage.getItem("accessToken");

          if (!token) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/pages/login?redirectTo=${encodeURIComponent(currentPath)}`);
            return;
          }
          

          try {
            // Decode the token first
            const decoded = jwtDecode(token);
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp < now) {
              console.log("Token expired");
              router.push("/pages/login");
            }


            // Then make API call to check user role
            const response = await axiosPrivate.get("/auth/check-role/");
            const { role } = response.data;

            if (allowedRoles.includes(role)) {
              setIsAuthorized(true);
            } else {
              router.push("/pages/forbidden");
            }
          } catch (error) {
            console.error("Auth verification failed:", error);
            localStorage.removeItem("accessToken");
            router.replace("/login");
          } finally {
            setIsLoading(false);
          }
        };

        verifyAuth();
      }, [router]);

      if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
      }

      return isAuthorized ? <WrappedComponent {...props} /> : null;
    };
  };
};
