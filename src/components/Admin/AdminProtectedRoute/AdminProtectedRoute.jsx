// AdminProtectedRoute.jsx
import React, { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  const adminData = localStorage.getItem("adminData");
  const adminType = localStorage.getItem("adminType");
  const isAuthenticated = adminData && adminType === "admin";

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin", { replace: true });
      return;
    }

    const verifyInBackground = async () => {
      try {
        console.log("🔍 Background auth verification starting...");

        const response = await fetch(
          `${import.meta.env.VITE_DataHost}/admin/auth-status`,
          {
            method: "GET",
            credentials: "include", // ✅ CRITICAL: Include cookies
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json", // ✅ Better CORS support
            },
          }
        );

        console.log(
          "📡 Auth verification response:",
          response.status,
          response.statusText
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Auth verification successful:", data);

          if (data.success && data.data?.admin) {
            localStorage.setItem("adminData", JSON.stringify(data.data.admin));
            console.log("💾 Admin data updated from auth verification");
          }
        } else if (response.status === 401) {
          console.log(
            "❌ Auth verification failed - 401, redirecting to login"
          );
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
        }
      } catch (error) {
        console.warn("⚠️ Background auth check failed:", error.message);
        // Don't redirect on network errors, just log the warning
        // User can still use the app if they have valid localStorage data
      }
    };

    // Start background verification after 100ms
    setTimeout(verifyInBackground, 100);
  }, [navigate, isAuthenticated]);

  return isAuthenticated ? children : null;
};

export default AdminProtectedRoute;
