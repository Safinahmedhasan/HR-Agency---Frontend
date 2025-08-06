// components/Users/Shared/Navbar.jsx - HR Agency Version
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  ChevronDown,
  Bell,
  Shield,
  Briefcase,
  Phone,
  Info,
  Award,
  Clock,
} from "lucide-react";
import cacheManager, { CACHE_KEYS } from "../../../utils/acheManager";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(() => {
    // Only show loading if no cache exists
    try {
      const cachedUserData = localStorage.getItem("userData");
      const cachedUserType = localStorage.getItem("userType");
      return !(cachedUserData && cachedUserType === "user");
    } catch (error) {
      return true; // Show loading if cache check fails
    }
  });

  // Site settings state - HR Agency defaults
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Alam HR Agency",
    siteTitle: "Your Complete Remote HR Partner",
    siteImage: { url: "" },
    footerName: "Alam HR Agency",
    browserTitle: "Professional HR Solutions",
  });

  // User state with smarter initialization
  const [user, setUser] = useState(() => {
    // Initialize from cache if available
    try {
      const cachedUserData = localStorage.getItem("userData");
      const cachedUserType = localStorage.getItem("userType");
      if (cachedUserData && cachedUserType === "user") {
        return JSON.parse(cachedUserData);
      }
    } catch (error) {
      console.error("Initial cache parse error:", error);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from cache if available
    try {
      const cachedUserData = localStorage.getItem("userData");
      const cachedUserType = localStorage.getItem("userType");
      return !!(cachedUserData && cachedUserType === "user");
    } catch (error) {
      console.error("Initial login state error:", error);
    }
    return false;
  });

  // Check authentication status with intelligent caching
  const checkAuthStatus = useCallback(async () => {
    try {
      // First check localStorage for immediate UI update
      const cachedUserData = localStorage.getItem("userData");
      const cachedUserType = localStorage.getItem("userType");

      if (cachedUserData && cachedUserType === "user") {
        try {
          const parsed = JSON.parse(cachedUserData);
          setUser(parsed);
          setIsLoggedIn(true);
          setIsAuthChecking(false); // Stop loading immediately

          console.log("✅ Using cached user data:", parsed.name);
        } catch (parseError) {
          console.error("Error parsing cached user data:", parseError);
        }
      } else {
        // No cache found, user is likely not logged in
        setUser(null);
        setIsLoggedIn(false);
        setIsAuthChecking(false);
        return; // Don't make API call if no cache
      }

      // Background verification (silent)
      const response = await fetch(`${API_BASE_URL}/auth/auth-status`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.authenticated) {
          // Update with fresh data if different
          const freshUser = data.data.user;
          if (JSON.stringify(freshUser) !== cachedUserData) {
            setUser(freshUser);
            localStorage.setItem("userData", JSON.stringify(freshUser));
            console.log("🔄 Updated user data from server");
          }
        } else {
          // Server says not authenticated, clear everything
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem("userData");
          localStorage.removeItem("userType");
          console.log("❌ Server authentication failed, cleared cache");
        }
      } else {
        // API call failed, but we already have cache data showing
        console.log("⚠️ Auth API failed, using cached data");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Keep using cached data even if API fails
    }
  }, [API_BASE_URL]);

  // Fetch site settings with cache
  const fetchSiteSettings = useCallback(async () => {
    try {
      // Try to get from cache first
      const cachedSettings = cacheManager.get(CACHE_KEYS.SITE_SETTINGS, {
        storage: "localStorage",
      });

      if (cachedSettings) {
        setSiteSettings({
          siteName: cachedSettings.siteName || "Alam HR Agency",
          siteTitle:
            cachedSettings.siteTitle || "Your Complete Remote HR Partner",
          siteImage: cachedSettings.siteImage || { url: "" },
          footerName: cachedSettings.footerName || "Alam HR Agency",
          browserTitle:
            cachedSettings.browserTitle || "Professional HR Solutions",
        });
        setIsLoading(false);
      }

      // Fetch fresh data
      const response = await fetch(`${API_BASE_URL}/site-settings/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const settings = data.data.settings;
          setSiteSettings({
            siteName: settings.siteName || "Alam HR Agency",
            siteTitle: settings.siteTitle || "Your Complete Remote HR Partner",
            siteImage: settings.siteImage || { url: "" },
            footerName: settings.footerName || "Alam HR Agency",
            browserTitle: settings.browserTitle || "Professional HR Solutions",
          });

          // Cache the settings
          cacheManager.set(CACHE_KEYS.SITE_SETTINGS, settings, {
            storage: "localStorage",
            expiry: 10 * 60 * 1000, // 10 minutes
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      // Use default values if fetch fails
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Handle logout with immediate UI update
  const handleLogout = useCallback(async () => {
    try {
      setIsUserMenuOpen(false);

      // Immediately clear UI state for instant feedback
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");

      // Clear cache
      cacheManager.clear({ storage: "all" });

      toast.success(
        "Logged out successfully! Thank you for using our HR services."
      );

      // Background API call to clear server session
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        console.error("Logout API error:", error);
        // Don't show error to user since UI is already updated
      });

      // Redirect to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    }
  }, [API_BASE_URL, navigate]);

  // Close menus when clicking outside or on escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
      if (
        isMobileMenuOpen &&
        !event.target.closest(".mobile-menu-container") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  // Initialize data with cache-first approach
  useEffect(() => {
    // Start with cache data for instant UI
    const initializeAuth = () => {
      const cachedUserData = localStorage.getItem("userData");
      const cachedUserType = localStorage.getItem("userType");

      if (cachedUserData && cachedUserType === "user") {
        try {
          const parsed = JSON.parse(cachedUserData);
          setUser(parsed);
          setIsLoggedIn(true);
          setIsAuthChecking(false);
          console.log("⚡ Instant load from cache:", parsed.name);
        } catch (error) {
          console.error("Cache parse error:", error);
          setIsAuthChecking(false);
        }
      } else {
        setIsAuthChecking(false);
      }
    };

    // Initialize immediately
    initializeAuth();

    // Load site settings
    fetchSiteSettings();

    // Background auth verification after initial load
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
  }, [fetchSiteSettings, checkAuthStatus]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // HR Agency Navigation links
  const navigationLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/about", icon: Info },
    { name: "HR Services", href: "/services", icon: Briefcase },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-lg border-b border-blue-200/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Site Logo */}
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-105 transform">
                {siteSettings.siteImage?.url ? (
                  <img
                    src={siteSettings.siteImage.url}
                    alt={siteSettings.siteName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-white" />
                )}
              </div>

              {/* Site Name */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors duration-300">
                  {isLoading ? (
                    <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                  ) : (
                    siteSettings.siteName
                  )}
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  {siteSettings.siteTitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md border border-blue-200/50"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 hover:text-blue-700"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-600"
                      } transition-colors duration-300`}
                    />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Auth Status Indicator - Show while checking */}
            {isAuthChecking && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm hidden sm:block">Verifying...</span>
              </div>
            )}

            {/* Notifications - Only show for logged in users */}
            {!isAuthChecking && isLoggedIn && (
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 relative group">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-[10px] text-white font-bold">3</span>
                  </span>
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-400 rounded-full animate-ping"></span>
                </button>
              </div>
            )}

            {/* User Menu or Auth Links */}
            {!isAuthChecking && (
              <>
                {isLoggedIn ? (
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200/50"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.name || "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 backdrop-blur-sm">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-medium text-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <div className="flex items-center">
                                  <Shield className="h-3 w-3 text-green-500 mr-1" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Verified Client
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 text-blue-500 mr-1" />
                                  <span className="text-xs text-blue-600 font-medium">
                                    Active
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          >
                            <User className="h-4 w-4 group-hover:text-blue-600" />
                            <div>
                              <span className="font-medium">My Profile</span>
                              <p className="text-xs text-gray-500">
                                Manage account details
                              </p>
                            </div>
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          >
                            <Settings className="h-4 w-4 group-hover:text-blue-600" />
                            <div>
                              <span className="font-medium">
                                Account Settings
                              </span>
                              <p className="text-xs text-gray-500">
                                Preferences & privacy
                              </p>
                            </div>
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                          >
                            <LogOut className="h-4 w-4 group-hover:text-red-700" />
                            <div className="text-left">
                              <span className="font-medium">Sign Out</span>
                              <p className="text-xs text-red-500">
                                End your session
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-700 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Get HR Services
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 mobile-menu-button"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden mobile-menu-container transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="border-t border-blue-200/30 py-4 bg-gradient-to-r from-slate-50 to-white">
            {/* Mobile Navigation Links */}
            <div className="space-y-1 px-4 mb-4">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200/50"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Menu - For Logged In Users */}
            {!isAuthChecking && isLoggedIn && (
              <div className="border-t border-blue-200/30 pt-4 px-4">
                <div className="flex items-center space-x-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-medium text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Shield className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        Verified HR Client
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Auth Links - For Non-Logged In Users */}
            {!isAuthChecking && !isLoggedIn && (
              <div className="border-t border-blue-200/30 pt-4 px-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-700 bg-blue-50 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-colors border border-blue-200/50"
                >
                  Sign In to Your Account
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transition-all duration-300 shadow-lg"
                >
                  Get HR Services Now
                </Link>
              </div>
            )}

            {/* Loading state for mobile */}
            {isAuthChecking && (
              <div className="border-t border-blue-200/30 pt-4 px-4">
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">
                    Verifying account...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
