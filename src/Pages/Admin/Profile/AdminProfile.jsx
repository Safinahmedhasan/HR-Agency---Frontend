// Pages/Admin/Profile/Profile.jsx - Fixed Version
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  Lock,
  Save,
  RefreshCw,
  X,
  Check,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Settings,
  Crown,
} from "lucide-react";

const CACHE_KEY = "admin_profile_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Admin profile cache saved");
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      console.log("⏰ Admin profile cache expired");
      return null;
    }

    console.log("✅ Admin profile cache found and valid");
    return parsed.data;
  } catch (error) {
    console.error("❌ Cache read failed:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log("🗑️ Admin profile cache cleared");
  } catch (error) {
    console.error("❌ Cache clear failed:", error);
  }
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    profileImage: { url: "" },
    role: "",
    isSuperAdmin: false,
    loginCount: 0,
    lastLogin: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ Updated: Fetch profile using httpOnly cookies
  const fetchProfile = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching admin profile from API...");

        // ✅ Fixed: Use credentials: "include" instead of Authorization header
        const response = await fetch(`${API_BASE_URL}/admin/me`, {
          method: "GET",
          credentials: "include", // ✅ This is the key fix for httpOnly cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Handle 401 unauthorized
          if (response.status === 401) {
            console.log("❌ Admin not authenticated, redirecting to login");
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCache();
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        if (data.success) {
          console.log("✅ Admin profile fetched successfully");
          const admin = data.data.admin;

          setAdminData(admin);
          setFormData({
            name: admin.name || "",
            email: admin.email || "",
          });

          // Update localStorage for persistence
          localStorage.setItem("adminData", JSON.stringify(admin));
          localStorage.setItem("adminType", "admin");

          // Cache the data
          setCache(admin);

          // Notify other components about profile update
          window.dispatchEvent(
            new CustomEvent("adminProfileUpdated", {
              detail: { adminData: admin },
            })
          );
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);

        // Fallback to cached data
        const cachedData = getCache();
        if (cachedData) {
          console.log("📦 Using cached admin data as fallback");
          setAdminData(cachedData);
          setFormData({
            name: cachedData.name || "",
            email: cachedData.email || "",
          });
          return;
        }

        // Final fallback to localStorage
        const localAdmin = JSON.parse(
          localStorage.getItem("adminData") || "{}"
        );
        if (localAdmin.name) {
          console.log("💾 Using localStorage admin data as fallback");
          setAdminData(localAdmin);
          setFormData({
            name: localAdmin.name || "",
            email: localAdmin.email || "",
          });
          return;
        }

        setMessage({
          type: "error",
          text: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    fetchProfile(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchProfile]);

  // ✅ Updated: Update profile using httpOnly cookies
  const handleUpdateProfile = useCallback(async () => {
    setIsUpdating(true);

    try {
      console.log("🔄 Updating admin profile...");

      // ✅ Fixed: Use credentials: "include" instead of Authorization header
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: "PUT",
        credentials: "include", // ✅ This is the key fix
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }
        throw new Error("Failed to update profile");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Profile updated successfully");
        const updatedAdmin = data.data.admin;

        setAdminData(updatedAdmin);
        setFormData({
          name: updatedAdmin.name || "",
          email: updatedAdmin.email || "",
        });

        // Update localStorage and cache
        localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
        clearCache();
        setCache(updatedAdmin);

        // Notify other components
        window.dispatchEvent(
          new CustomEvent("adminProfileUpdated", {
            detail: { adminData: updatedAdmin },
          })
        );

        setMessage({
          type: "success",
          text: "Profile updated successfully",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Update failed",
        });
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [API_BASE_URL, navigate, formData]);

  // ✅ Updated: Image upload using httpOnly cookies
  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size must be less than 5MB",
        });
        return;
      }

      setIsUploadingImage(true);

      try {
        console.log("📸 Uploading profile image...");
        const formDataImage = new FormData();
        formDataImage.append("profileImage", file);

        // ✅ Fixed: Use credentials: "include" instead of Authorization header
        const response = await fetch(`${API_BASE_URL}/admin/profile/image`, {
          method: "POST",
          credentials: "include", // ✅ This is the key fix
          body: formDataImage,
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCache();
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to upload image");
        }

        const data = await response.json();

        if (data.success) {
          console.log("✅ Profile image uploaded successfully");
          const updatedAdmin = {
            ...adminData,
            profileImage: data.data.profileImage,
          };

          setAdminData(updatedAdmin);

          // Update localStorage and cache
          localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
          clearCache();
          setCache(updatedAdmin);

          // Notify other components
          window.dispatchEvent(
            new CustomEvent("adminProfileUpdated", {
              detail: { adminData: updatedAdmin },
            })
          );

          setMessage({
            type: "success",
            text: "Profile image updated successfully",
          });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } else {
          setMessage({
            type: "error",
            text: data.message || "Image upload failed",
          });
        }
      } catch (error) {
        console.error("❌ Image upload error:", error);
        setMessage({
          type: "error",
          text: "Failed to upload image",
        });
      } finally {
        setIsUploadingImage(false);
      }
    },
    [API_BASE_URL, navigate, adminData]
  );

  // ✅ Updated: Delete image using httpOnly cookies
  const handleDeleteImage = useCallback(async () => {
    setIsDeletingImage(true);

    try {
      console.log("🗑️ Deleting profile image...");

      // ✅ Fixed: Use credentials: "include" instead of Authorization header
      const response = await fetch(`${API_BASE_URL}/admin/profile/image`, {
        method: "DELETE",
        credentials: "include", // ✅ This is the key fix
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeIntent("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }
        throw new Error("Failed to delete image");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Profile image deleted successfully");
        const updatedAdmin = { ...adminData, profileImage: { url: "" } };

        setAdminData(updatedAdmin);

        // Update localStorage and cache
        localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
        clearCache();
        setCache(updatedAdmin);

        // Notify other components
        window.dispatchEvent(
          new CustomEvent("adminProfileUpdated", {
            detail: { adminData: updatedAdmin },
          })
        );

        setMessage({
          type: "success",
          text: "Profile image deleted successfully",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Image deletion failed",
        });
      }
    } catch (error) {
      console.error("❌ Image delete error:", error);
      setMessage({
        type: "error",
        text: "Failed to delete image",
      });
    } finally {
      setIsDeletingImage(false);
    }
  }, [API_BASE_URL, navigate, adminData]);

  // ✅ Updated: Change password using httpOnly cookies
  const handleChangePassword = useCallback(async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log("🔐 Changing admin password...");

      // ✅ Fixed: Use credentials: "include" instead of Authorization header
      const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
        method: "PUT",
        credentials: "include", // ✅ This is the key fix
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }
        throw new Error("Failed to change password");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });
        setMessage({
          type: "success",
          text: "Password changed successfully",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Password change failed",
        });
      }
    } catch (error) {
      console.error("❌ Password change error:", error);
      setMessage({
        type: "error",
        text: "Failed to change password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }, [API_BASE_URL, navigate, passwordData]);

  // Initialize component
  useEffect(() => {
    console.log("🚀 AdminProfile initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading admin profile from cache instantly");
      setAdminData(cachedData);
      setFormData({
        name: cachedData.name || "",
        email: cachedData.email || "",
      });
      setIsLoading(false);

      // Background refresh after 500ms
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchProfile(true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      // Fallback to localStorage for immediate display
      const localAdmin = JSON.parse(localStorage.getItem("adminData") || "{}");
      if (localAdmin.name) {
        console.log("💾 Loading admin profile from localStorage");
        setAdminData(localAdmin);
        setFormData({
          name: localAdmin.name || "",
          email: localAdmin.email || "",
        });
        setIsLoading(false);
      }

      // Fetch fresh data from API
      fetchProfile();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchProfile]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "adminData") {
        const updatedAdmin = JSON.parse(e.newValue || "{}");
        setAdminData(updatedAdmin);
        setFormData({
          name: updatedAdmin.name || "",
          email: updatedAdmin.email || "",
        });
        setCache(updatedAdmin);
      }
    };

    const handleProfileUpdate = (e) => {
      if (e.detail && e.detail.adminData) {
        console.log("🔄 Profile updated from other component");
        setAdminData(e.detail.adminData);
        setFormData({
          name: e.detail.adminData.name || "",
          email: e.detail.adminData.email || "",
        });
        setCache(e.detail.adminData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = () => {
    if (adminData.isSuperAdmin) return "Super Admin";
    return adminData.role || "Admin";
  };

  const formatLastLogin = () => {
    if (!adminData.lastLogin) return "Never";

    const lastLogin = new Date(adminData.lastLogin);
    const now = new Date();
    const diffMs = now - lastLogin;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return lastLogin.toLocaleDateString();
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    const checks = [
      password.length >= 6,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
    ];
    return checks.filter(Boolean).length;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 4:
        return "Strong 💪";
      case 3:
      case 2:
        return "Medium 👍";
      default:
        return "Weak 👎";
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 4:
        return "text-emerald-600";
      case 3:
      case 2:
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const getPasswordStrengthBarColor = (strength) => {
    switch (strength) {
      case 4:
        return "bg-emerald-500 w-full";
      case 3:
      case 2:
        return "bg-yellow-500 w-2/3";
      default:
        return "bg-red-500 w-1/3";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Loading Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>

        {/* Loading Form Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`
            p-4 rounded-lg border-l-4 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "bg-red-50 border-red-500 text-red-700"
            }
          `}
        >
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-gray-50">
              {adminData.profileImage?.url ? (
                <img
                  src={adminData.profileImage.url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`${
                  adminData.profileImage?.url ? "hidden" : "flex"
                } w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center`}
              >
                <span className="text-white text-xl font-bold">
                  {getInitials(adminData.name)}
                </span>
              </div>
            </div>

            {/* Image Action Buttons */}
            <div className="absolute -bottom-1 -right-1 flex space-x-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <div className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                  {isUploadingImage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
              </label>

              {adminData.profileImage?.url && (
                <button
                  onClick={handleDeleteImage}
                  disabled={isDeletingImage}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  {isDeletingImage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {adminData.name}
              </h1>
              {adminData.isSuperAdmin && (
                <Crown className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <p className="text-gray-600 mt-1">{adminData.email}</p>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium ${
                    adminData.isSuperAdmin
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }
                `}
              >
                <Shield className="h-3 w-3 inline mr-1" />
                {getRoleDisplay()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <Activity className="h-3 w-3 inline mr-1" />
                Active
              </span>
            </div>

            {/* Additional Stats */}
            <div className="mt-3 flex justify-center md:justify-start space-x-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Login Count:</span>
                <span className="ml-1">{adminData.loginCount || 0}</span>
              </div>
              <div>
                <span className="font-medium">Last Login:</span>
                <span className="ml-1">{formatLastLogin()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 text-emerald-600 mr-2" />
              Personal Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your profile information
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isUpdating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Lock className="h-5 w-5 text-emerald-600 mr-2" />
              Security Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account security
            </p>
          </div>

          <div className="p-6">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                {/* Password Fields */}
                {[
                  {
                    key: "currentPassword",
                    label: "Current Password",
                    placeholder: "Enter current password",
                    showKey: "current",
                  },
                  {
                    key: "newPassword",
                    label: "New Password",
                    placeholder: "Enter new password",
                    showKey: "new",
                  },
                  {
                    key: "confirmPassword",
                    label: "Confirm New Password",
                    placeholder: "Confirm new password",
                    showKey: "confirm",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={
                          showPasswords[field.showKey] ? "text" : "password"
                        }
                        value={passwordData[field.key]}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder={field.placeholder}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            [field.showKey]: !prev[field.showKey],
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[field.showKey] ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        Password Strength:
                      </span>
                      <span
                        className={`text-xs font-semibold ${getPasswordStrengthColor(
                          getPasswordStrength(passwordData.newPassword)
                        )}`}
                      >
                        {getPasswordStrengthText(
                          getPasswordStrength(passwordData.newPassword)
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarColor(
                          getPasswordStrength(passwordData.newPassword)
                        )}`}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-600" />
                    Password Requirements
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        check: passwordData.newPassword.length >= 6,
                        text: "At least 6 characters",
                        icon: "📝",
                      },
                      {
                        check: /[A-Z]/.test(passwordData.newPassword),
                        text: "One uppercase letter (A-Z)",
                        icon: "🔤",
                      },
                      {
                        check: /[a-z]/.test(passwordData.newPassword),
                        text: "One lowercase letter (a-z)",
                        icon: "🔡",
                      },
                      {
                        check: /\d/.test(passwordData.newPassword),
                        text: "One number (0-9)",
                        icon: "🔢",
                      },
                    ].map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-2 rounded-md transition-all duration-200 ${
                          req.check
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 ${
                            req.check
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-300 text-gray-500"
                          }`}
                        >
                          {req.check ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-sm mr-2">{req.icon}</span>
                        <span
                          className={`text-sm font-medium ${
                            req.check ? "text-emerald-700" : "text-gray-600"
                          }`}
                        >
                          {req.text}
                        </span>
                        {req.check && (
                          <span className="ml-auto text-xs text-emerald-600 font-semibold">
                            ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      isChangingPassword ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword ||
                      passwordData.newPassword !==
                        passwordData.confirmPassword ||
                      getPasswordStrength(passwordData.newPassword) < 2
                    }
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {isChangingPassword ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setShowPasswords({
                        current: false,
                        new: false,
                        confirm: false,
                      });
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
