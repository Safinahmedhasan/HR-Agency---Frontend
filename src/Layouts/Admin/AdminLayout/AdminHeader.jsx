// AdminHeader.jsx - সরাসরি Component এ FIXED
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  X,
  Crown,
  Shield,
  RefreshCw,
} from "lucide-react";

// Simple cache system for admin profile
const ADMIN_PROFILE_CACHE_KEY = "admin_profile_cache";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const setAdminCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(ADMIN_PROFILE_CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Admin profile cache saved");
  } catch (error) {
    console.error("❌ Admin profile cache save failed:", error);
  }
};

const getAdminCache = () => {
  try {
    const cached = localStorage.getItem(ADMIN_PROFILE_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("❌ Admin profile cache read failed:", error);
    localStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
    return null;
  }
};

const clearAdminCache = () => {
  try {
    localStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
    console.log("🗑️ Admin profile cache cleared");
  } catch (error) {
    console.error("❌ Admin profile cache clear failed:", error);
  }
};

const AdminHeader = ({ toggleSidebar, toggleMobileMenu, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileNotificationOpen, setIsMobileNotificationOpen] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    profileImage: { url: "" },
    role: "",
    isSuperAdmin: false,
    loginCount: 0,
    lastLogin: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // ✅ FIXED: Fetch admin profile using httpOnly cookies
  const fetchAdminProfile = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching admin profile from API...");

        const response = await fetch(`${API_BASE_URL}/admin/me`, {
          method: "GET",
          credentials: "include", // ✅ CRITICAL: Include cookies
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // ✅ Better CORS support
          },
        });

        console.log(
          "📡 Profile response:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          // Handle 401 unauthorized
          if (response.status === 401) {
            console.log("❌ Admin not authenticated, redirecting to login");
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearAdminCache();
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error(`Profile fetch failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Profile data received:", data);

        if (data.success) {
          console.log("✅ Admin profile fetched successfully");
          const profileData = data.data.admin;

          setAdminData(profileData);

          // Update localStorage for persistence
          localStorage.setItem("adminData", JSON.stringify(profileData));
          localStorage.setItem("adminType", "admin");

          // Cache the data
          setAdminCache(profileData);

          return profileData;
        }
      } catch (error) {
        console.error("❌ Error fetching admin profile:", error);

        // Fallback to cached data
        const cachedData = getAdminCache();
        if (cachedData) {
          console.log("📦 Using cached admin data as fallback");
          setAdminData(cachedData);
          return cachedData;
        }

        // Final fallback to localStorage
        const localAdmin = JSON.parse(
          localStorage.getItem("adminData") || "{}"
        );
        if (localAdmin.name) {
          console.log("💾 Using localStorage admin data as fallback");
          setAdminData(localAdmin);
          return localAdmin;
        }

        // If all fails and it's a 401, redirect to login
        if (error.message.includes("401")) {
          console.log("🔒 Session expired, redirecting to login");
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearAdminCache();
          navigate("/admin", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  // ✅ FIXED: Logout using httpOnly cookies
  const handleLogout = useCallback(async () => {
    try {
      console.log("🚪 Logging out admin...");

      // Call logout endpoint to clear httpOnly cookie
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include", // ✅ Include cookies for logout
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("✅ Logout API call completed");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // Clear all local data regardless of API call success
      localStorage.removeItem("adminData");
      localStorage.removeItem("adminType");
      clearAdminCache();

      console.log("🧹 Local data cleared, redirecting to login");

      // Redirect to login
      navigate("/admin", { replace: true });
    }
  }, [API_BASE_URL, navigate]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearAdminCache();
    fetchAdminProfile(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchAdminProfile]);

  // Load data on component mount
  useEffect(() => {
    console.log("🚀 AdminHeader initializing...");

    // First try to load from cache for instant display
    const cachedData = getAdminCache();
    if (cachedData) {
      console.log("⚡ Loading admin profile from cache instantly");
      setAdminData(cachedData);
      setIsLoading(false);

      // Background refresh after 500ms
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchAdminProfile(true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      // Fallback to localStorage for immediate display
      const localAdmin = JSON.parse(localStorage.getItem("adminData") || "{}");
      if (localAdmin.name) {
        console.log("💾 Loading admin profile from localStorage");
        setAdminData(localAdmin);
        setIsLoading(false);
      }

      // Fetch fresh data from API
      fetchAdminProfile();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearAdminCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchAdminProfile]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "adminData") {
        const updatedAdmin = JSON.parse(e.newValue || "{}");
        setAdminData(updatedAdmin);
        // Update cache as well
        setAdminCache(updatedAdmin);
      }
    };

    // Listen for custom events from profile updates
    const handleProfileUpdate = (e) => {
      if (e.detail && e.detail.adminData) {
        console.log("🔄 Profile updated from other component");
        setAdminData(e.detail.adminData);
        setAdminCache(e.detail.adminData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin/dashboard":
        return "Dashboard";
      case "/admin/users":
        return "User Management";
      case "/admin/approve-users":
        return "Active Users";
      case "/admin/reports":
        return "Reports & Analytics";
      case "/admin/settings":
        return "Settings";
      case "/admin/profile":
        return "Profile";
      case "/admin/AdminProfile":
        return "Admin Profile";
      case "/admin/SiteSetting":
      case "/admin/SiteSettings":
      case "/admin/site-settings":
        return "Site Settings";
      default:
        return "Admin Panel";
    }
  };

  const getPageDescription = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin/dashboard":
        return "Overview of system statistics and recent activities";
      case "/admin/users":
        return "Manage and monitor all registered users";
      case "/admin/approve-users":
        return "Manage and monitor active users";
      case "/admin/reports":
        return "View detailed analytics and generate reports";
      case "/admin/settings":
        return "Configure system settings and preferences";
      case "/admin/profile":
      case "/admin/AdminProfile":
        return "Manage your admin profile and account settings";
      case "/admin/SiteSetting":
      case "/admin/SiteSettings":
      case "/admin/site-settings":
        return "Configure website settings, branding, and content";
      default:
        return "Welcome to the admin management system";
    }
  };

  const getMobilePageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin/dashboard":
        return "Dashboard";
      case "/admin/users":
        return "Users";
      case "/admin/approve-users":
        return "Active Users";
      case "/admin/reports":
        return "Reports";
      case "/admin/settings":
        return "Settings";
      case "/admin/profile":
      case "/admin/AdminProfile":
        return "Profile";
      case "/admin/SiteSetting":
      case "/admin/SiteSettings":
      case "/admin/site-settings":
        return "Site Settings";
      default:
        return "Admin";
    }
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate("/admin/AdminProfile");
  };

  const handleSiteSettingsClick = () => {
    setIsProfileDropdownOpen(false);
    navigate("/admin/SiteSetting");
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

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  const mobileDropdownVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const chevronVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-xl border-b border-emerald-500/20 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            {/* Sidebar Toggle - Desktop */}
            <motion.button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-600/30 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="h-5 w-5" />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-600/30 rounded-xl flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="h-5 w-5" />
            </motion.button>

            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-w-0 flex-1"
              key={location.pathname} // Add key to trigger re-animation on route change
            >
              {/* Desktop Title */}
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
                <span className="hidden sm:inline">{getPageTitle()}</span>
                <span className="sm:hidden">{getMobilePageTitle()}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 hidden md:block truncate">
                {getPageDescription()}
              </p>
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hidden sm:block p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-600/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh Profile Data"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </motion.button>

            {/* Notifications - Desktop */}
            <motion.button
              className="hidden sm:block relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-600/30 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5" />
              <motion.span
                className="absolute top-0 right-0 h-2 w-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Notifications - Mobile */}
            <motion.button
              onClick={() =>
                setIsMobileNotificationOpen(!isMobileNotificationOpen)
              }
              className="sm:hidden relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-600/30 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-4 w-4" />
              <motion.span
                className="absolute top-0 right-0 h-2 w-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-xl hover:bg-slate-600/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Dynamic Profile Image */}
                <motion.div
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-lg overflow-hidden"
                  whileHover={{ rotate: 5 }}
                >
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-600 animate-pulse rounded-full"></div>
                  ) : adminData.profileImage?.url ? (
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
                      adminData.profileImage?.url && !isLoading
                        ? "hidden"
                        : "flex"
                    } w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 items-center justify-center`}
                  >
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {getInitials(adminData.name)}
                    </span>
                  </div>

                  {/* Super Admin Crown */}
                  {adminData.isSuperAdmin && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="h-3 w-3 text-yellow-400" />
                    </div>
                  )}
                </motion.div>

                {/* Desktop Profile Info */}
                <div className="hidden md:block text-left">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-white truncate max-w-24 lg:max-w-none">
                      {isLoading ? "Loading..." : adminData.name || "Admin"}
                    </p>
                    {adminData.isSuperAdmin && (
                      <Crown className="h-3 w-3 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-300 truncate max-w-24 lg:max-w-none">
                      {getRoleDisplay()}
                    </p>
                  </div>
                </div>

                {/* Tablet Profile Info */}
                <div className="hidden sm:block md:hidden">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-white">
                      {isLoading
                        ? "..."
                        : (adminData.name || "Admin").split(" ")[0]}
                    </p>
                    {adminData.isSuperAdmin && (
                      <Crown className="h-3 w-3 text-yellow-400" />
                    )}
                  </div>
                </div>

                <motion.div
                  variants={chevronVariants}
                  animate={isProfileDropdownOpen ? "open" : "closed"}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:block"
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
              </motion.button>

              {/* Desktop Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="hidden sm:block absolute right-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-600/30 py-2 z-50 overflow-hidden"
                  >
                    {/* Profile Info */}
                    <motion.div
                      className="px-4 py-3 border-b border-slate-600/30"
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-full shadow-lg overflow-hidden flex-shrink-0">
                          {isLoading ? (
                            <div className="w-full h-full bg-slate-600 animate-pulse rounded-full"></div>
                          ) : adminData.profileImage?.url ? (
                            <img
                              src={adminData.profileImage.url}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`${
                              adminData.profileImage?.url && !isLoading
                                ? "hidden"
                                : "flex"
                            } w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 items-center justify-center`}
                          >
                            <span className="text-white text-sm font-medium">
                              {getInitials(adminData.name)}
                            </span>
                          </div>

                          {adminData.isSuperAdmin && (
                            <div className="absolute -top-1 -right-1">
                              <Crown className="h-3 w-3 text-yellow-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-medium text-white truncate">
                              {isLoading
                                ? "Loading..."
                                : adminData.name || "Admin"}
                            </p>
                            {adminData.isSuperAdmin && (
                              <Crown className="h-3 w-3 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-xs text-slate-300 truncate">
                            {isLoading
                              ? "Loading..."
                              : adminData.email || "admin@example.com"}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Shield className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400">
                              {getRoleDisplay()}
                            </span>
                          </div>
                        </div>

                        {/* Refresh button in dropdown */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefresh();
                          }}
                          disabled={isRefreshing}
                          className="p-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                          title="Refresh Profile"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${
                              isRefreshing ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Additional Stats */}
                      {!isLoading && (
                        <div className="mt-3 pt-3 border-t border-slate-600/30">
                          <div className="flex justify-between text-xs">
                            <div>
                              <span className="text-slate-400">
                                Login Count:
                              </span>
                              <span className="text-white ml-1 font-medium">
                                {adminData.loginCount || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">
                                Last Login:
                              </span>
                              <span className="text-white ml-1 font-medium">
                                {formatLastLogin()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Menu Items */}
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.button
                        variants={menuItemVariants}
                        onClick={handleProfileClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile Settings
                      </motion.button>

                      <motion.button
                        variants={menuItemVariants}
                        onClick={handleSiteSettingsClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Site Settings
                      </motion.button>

                      <motion.hr
                        variants={menuItemVariants}
                        className="my-2 border-slate-600/30"
                      />

                      <motion.button
                        variants={menuItemVariants}
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Profile Dropdown */}
      <AnimatePresence>
        {isProfileDropdownOpen && (
          <motion.div
            variants={mobileDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="sm:hidden bg-slate-800/95 backdrop-blur-md border-b border-slate-600/30 z-40"
          >
            <div className="px-4 py-3">
              {/* Profile Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-600/30">
                <div className="relative w-12 h-12 rounded-full shadow-lg overflow-hidden flex-shrink-0">
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-600 animate-pulse rounded-full"></div>
                  ) : adminData.profileImage?.url ? (
                    <img
                      src={adminData.profileImage.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      adminData.profileImage?.url && !isLoading
                        ? "hidden"
                        : "flex"
                    } w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 items-center justify-center`}
                  >
                    <span className="text-white text-sm font-medium">
                      {getInitials(adminData.name)}
                    </span>
                  </div>

                  {adminData.isSuperAdmin && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="h-4 w-4 text-yellow-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-white truncate">
                      {isLoading ? "Loading..." : adminData.name || "Admin"}
                    </p>
                    {adminData.isSuperAdmin && (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    {isLoading
                      ? "Loading..."
                      : adminData.email || "admin@example.com"}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Shield className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {getRoleDisplay()}
                    </span>
                  </div>

                  {/* Mobile Stats */}
                  {!isLoading && (
                    <div className="mt-2 flex space-x-4 text-xs">
                      <div>
                        <span className="text-slate-400">Logins:</span>
                        <span className="text-white ml-1 font-medium">
                          {adminData.loginCount || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Last:</span>
                        <span className="text-white ml-1 font-medium">
                          {formatLastLogin()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  {/* Refresh button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefresh();
                    }}
                    disabled={isRefreshing}
                    className="p-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh Profile"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>

                  {/* Close button */}
                  <button
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="pt-3 space-y-1">
                <motion.button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors rounded-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile Settings
                </motion.button>

                <motion.button
                  onClick={handleSiteSettingsClick}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors rounded-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Site Settings
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Notification Dropdown */}
      <AnimatePresence>
        {isMobileNotificationOpen && (
          <motion.div
            variants={mobileDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="sm:hidden bg-slate-800/95 backdrop-blur-md border-b border-slate-600/30 z-40"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-600/30">
                <h3 className="text-sm font-medium text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsMobileNotificationOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-3">
                <div className="text-center py-6">
                  <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No new notifications</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Stay tuned for updates!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminHeader;
