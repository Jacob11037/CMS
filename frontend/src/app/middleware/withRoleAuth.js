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
            router.push("/pages/login");
            return;
          }

          try {
            // Decode the token first
            const decoded = jwtDecode(token);

            // Then make API call to check user role
            const response = await axiosPrivate.get("/auth/check-role/"); // ✅ Base URL already set
            const { role } = response.data;

            if (allowedRoles.includes(role)) {
              setIsAuthorized(true);
            } else {
              router.push("/pages/forbidden");
            }
          } catch (error) {
            console.error("Auth verification failed:", error);
            router.push("/pages/login");
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
