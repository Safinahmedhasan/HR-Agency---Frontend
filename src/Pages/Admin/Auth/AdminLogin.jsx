// AdminLogin.jsx - সরাসরি Component এ FIXED
import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // Memoized validation for better performance
  const isFormValid = useMemo(() => {
    return formData.email.includes("@") && formData.password.length > 0;
  }, [formData.email, formData.password]);

  // Optimized change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors immediately for better UX
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  // Fast validation
  const validateForm = () => {
    if (!formData.email) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!formData.email.includes("@")) {
      setErrors({ email: "Invalid email format" });
      return false;
    }
    if (!formData.password) {
      setErrors({ password: "Password is required" });
      return false;
    }
    return true;
  };

  // ✅ FIXED: API call with proper cookie handling
  const loginAdmin = async (userData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log(
        "🔑 Attempting admin login to:",
        `${API_BASE_URL}/admin/login`
      );

      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        credentials: "include", // ✅ CRITICAL: Include cookies for cross-origin
        headers: {
          "Content-Type": "application/json",
          // ✅ Additional headers for better CORS support
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(
        "📡 Response received:",
        response.status,
        response.statusText
      );

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Connection timeout - please try again");
      }

      console.error("❌ Login API Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log("🚀 Starting admin login process...");

      const result = await loginAdmin(formData);
      console.log("✅ Login successful:", result);

      // Store admin data in localStorage
      if (result.data?.admin) {
        localStorage.setItem("adminData", JSON.stringify(result.data.admin));
        localStorage.setItem("adminType", "admin");

        // Clear any old data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("tokenType");

        console.log("💾 Admin data stored successfully");
      }

      // Success message
      console.log("🎉 Admin login completed, redirecting to dashboard...");

      // Immediate navigation
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("❌ Login failed:", error);

      const message = error.message.toLowerCase();

      // Handle specific error cases
      if (message.includes("invalid") || message.includes("401")) {
        setErrors({ general: "Invalid email or password" });
      } else if (message.includes("deactivated") || message.includes("403")) {
        setErrors({ general: "Admin account is deactivated" });
      } else if (message.includes("timeout") || message.includes("abort")) {
        setErrors({ general: "Connection timeout - please try again" });
      } else if (message.includes("network") || message.includes("fetch")) {
        setErrors({ general: "Network error - check your connection" });
      } else if (message.includes("cors")) {
        setErrors({ general: "Connection error - please contact support" });
      } else {
        setErrors({ general: "Login failed - please try again" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-300">
            Secure administrator access only
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-2xl">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6 backdrop-blur-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-white/10 border backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                    errors.email
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Enter admin email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 bg-white/10 border backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                    errors.password
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Enter admin password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-300">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Sign In
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            🔒 This is a secure admin portal. All activities are logged and
            monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
