import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  X,
  Database,
  LogOut,
  ChevronRight,
  UserCheck,
  Clock,
  Crown,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

const SIDEBAR_ADMIN_CACHE_KEY = "sidebar_admin_profile_cache";
const CACHE_EXPIRY = 10 * 60 * 1000;

const setSidebarAdminCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(SIDEBAR_ADMIN_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // Silent fail
  }
};

const getSidebarAdminCache = () => {
  try {
    const cached = localStorage.getItem(SIDEBAR_ADMIN_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(SIDEBAR_ADMIN_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    localStorage.removeItem(SIDEBAR_ADMIN_CACHE_KEY);
    return null;
  }
};

const clearSidebarAdminCache = () => {
  try {
    localStorage.removeItem(SIDEBAR_ADMIN_CACHE_KEY);
  } catch (error) {
    // Silent fail
  }
};

const AdminSidebar = ({ isSidebarOpen, isMobileMenuOpen, closeMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    profileImage: { url: "" },
    role: "",
    isSuperAdmin: false,
    loginCount: 0,
    lastLogin: null,
  });

  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const fetchAdminProfile = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearSidebarAdminCache();
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to fetch admin profile");
        }

        const data = await response.json();

        if (data.success) {
          const profileData = data.data.admin;
          setAdminData(profileData);
          localStorage.setItem("adminData", JSON.stringify(profileData));
          localStorage.setItem("adminType", "admin");
          setSidebarAdminCache(profileData);

          window.dispatchEvent(
            new CustomEvent("adminProfileUpdated", {
              detail: { adminData: profileData },
            })
          );

          return profileData;
        }
      } catch (error) {
        const cachedData = getSidebarAdminCache();
        if (cachedData) {
          setAdminData(cachedData);
          return cachedData;
        }

        const localAdmin = JSON.parse(
          localStorage.getItem("adminData") || "{}"
        );
        if (localAdmin.name) {
          setAdminData(localAdmin);
          return localAdmin;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Silent fail
    } finally {
      localStorage.removeItem("adminData");
      localStorage.removeItem("adminType");
      clearSidebarAdminCache();

      if (isMobileMenuOpen) {
        closeMobileMenu();
      }

      navigate("/admin", { replace: true });
    }
  }, [API_BASE_URL, isMobileMenuOpen, closeMobileMenu, navigate]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearSidebarAdminCache();
    fetchAdminProfile(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchAdminProfile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isUserPathActive && isSidebarOpen) {
      setIsUserDropdownOpen(true);
    }
  }, [location.pathname, isSidebarOpen]);

  useEffect(() => {
    const cachedData = getSidebarAdminCache();
    if (cachedData) {
      setAdminData(cachedData);
      setIsLoading(false);

      const backgroundRefresh = setTimeout(() => {
        fetchAdminProfile(true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      const localAdmin = JSON.parse(localStorage.getItem("adminData") || "{}");
      if (localAdmin.name) {
        setAdminData(localAdmin);
        setIsLoading(false);
      }

      fetchAdminProfile();
    }

    const cleanupTimeout = setTimeout(() => {
      clearSidebarAdminCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchAdminProfile]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "adminData") {
        const updatedAdmin = JSON.parse(e.newValue || "{}");
        setAdminData(updatedAdmin);
        setSidebarAdminCache(updatedAdmin);
      }
    };

    const handleProfileUpdate = (e) => {
      if (e.detail && e.detail.adminData) {
        setAdminData(e.detail.adminData);
        setSidebarAdminCache(e.detail.adminData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
    };
  }, []);

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

  const isUserPathActive =
    location.pathname.includes("/admin/users") ||
    location.pathname.includes("/admin/PendingUser") ||
    location.pathname.includes("/admin/ApproveUser") ||
    location.pathname.includes("/admin/approve-users");

  const sidebarItems = [
    {
      path: "/admin/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      type: "dropdown",
      name: "User Management",
      icon: Users,
      description: "Manage All Users",
      isOpen: isUserDropdownOpen,
      setIsOpen: setIsUserDropdownOpen,
      isActive: isUserPathActive,
      subItems: [
        {
          path: "/admin/users",
          name: "All Users",
          icon: Users,
          description: "View & manage all users",
        },
        {
          path: "/admin/approve-users",
          name: "Active Users",
          icon: UserCheck,
          description: "Manage active users",
        },
        {
          path: "/admin/PendingUser",
          name: "Pending Users",
          icon: Clock,
          description: "Users awaiting approval",
        },
      ],
    },
    {
      path: "/admin/services",
      name: "HR Services",
      icon: Database,
      description: "Manage HR Services",
    },
    {
      path: "/admin/why-choose-us",
      name: "Why Choose Us",
      icon: Lightbulb,
      description: "Manage Why Choose Us",
    },
    {
      path: "/admin/reports",
      name: "Reports",
      icon: BarChart3,
      description: "Analytics & Reports",
    },
    {
      path: "/admin/SiteSetting",
      name: "Settings",
      icon: Settings,
      description: "System Settings",
    },
  ];

  const handleDropdownToggle = (item) => {
    if (item.type === "dropdown") {
      item.setIsOpen(!item.isOpen);
    }
  };

  const dropdownVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
  };

  const subItemVariants = {
    closed: {
      x: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
    open: (index) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: index * 0.1,
        ease: "easeOut",
      },
    }),
  };

  const chevronVariants = {
    closed: {
      rotate: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    open: {
      rotate: 90,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const parentItemVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1, ease: "easeInOut" },
    },
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isSidebarOpen ? "w-64" : "w-20"} 
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
        bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl transition-all duration-300 ease-in-out border-r border-emerald-500/20 flex flex-col
      `}
    >
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-800 to-teal-800 border-b border-emerald-600/30 flex-shrink-0">
        <div
          className={`flex items-center ${
            !isSidebarOpen && "lg:justify-center"
          }`}
        >
          <Shield className="h-8 w-8 text-emerald-400" />
          {isSidebarOpen && (
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-emerald-200">Management Hub</p>
            </div>
          )}
        </div>
        <button
          onClick={closeMobileMenu}
          className="lg:hidden text-emerald-200 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-b border-slate-600/30 flex-shrink-0">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full shadow-lg overflow-hidden flex-shrink-0 ring-2 ring-emerald-400/30">
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
                adminData.profileImage?.url && !isLoading ? "hidden" : "flex"
              } w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 items-center justify-center`}
            >
              <span className="text-white text-sm font-medium">
                {getInitials(adminData.name)}
              </span>
            </div>

            {adminData.isSuperAdmin && (
              <div className="absolute -top-1 -right-1">
                <Crown className="h-3 w-3 text-yellow-400 drop-shadow-sm" />
              </div>
            )}
          </div>

          {isSidebarOpen && (
            <div className="ml-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-white truncate">
                    {isLoading ? "Loading..." : adminData.name || "Admin"}
                  </p>
                  {adminData.isSuperAdmin && (
                    <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-300 truncate">
                  {isLoading
                    ? "Loading..."
                    : adminData.email || "admin@example.com"}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Shield className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-emerald-300 font-medium">
                    {getRoleDisplay()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="mt-6 px-3 pb-6">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;

              if (item.type !== "dropdown") {
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path || index}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NavLink
                        to={item.path}
                        className={`
                          flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                          ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transform scale-105"
                              : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          }
                          ${!isSidebarOpen && "lg:justify-center lg:px-3"}
                          ${isMobile ? "active:bg-slate-600/50" : ""}
                        `}
                        onClick={closeMobileMenu}
                      >
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                              isActive
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />
                        </motion.div>
                        {isSidebarOpen && (
                          <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p
                              className={`text-xs truncate transition-colors duration-200 ${
                                isActive
                                  ? "text-emerald-100"
                                  : "text-slate-400 group-hover:text-slate-300"
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        )}

                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="w-2 h-2 bg-white rounded-full shadow-lg ml-2"
                          />
                        )}
                      </NavLink>
                    </motion.div>
                  </li>
                );
              }

              return (
                <li key={index} className="relative">
                  <motion.div
                    variants={parentItemVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className={`
                      flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${
                        item.isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }
                      ${!isSidebarOpen && "lg:justify-center lg:px-3"}
                      ${isMobile ? "active:bg-slate-600/50" : ""}
                    `}
                    onClick={() => handleDropdownToggle(item)}
                  >
                    <div className="flex items-center min-w-0">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            item.isActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                      </motion.div>
                      {isSidebarOpen && (
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.name}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              item.isActive
                                ? "text-emerald-100"
                                : "text-slate-400"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {isSidebarOpen && (
                      <motion.div
                        variants={chevronVariants}
                        animate={item.isOpen ? "open" : "closed"}
                        className="flex-shrink-0 ml-2"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {isSidebarOpen && (
                    <AnimatePresence>
                      {item.isOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="overflow-hidden"
                        >
                          <ul className="mt-2 ml-4 space-y-1 border-l-2 border-slate-600/30 pl-4">
                            {item.subItems.map((subItem, subIndex) => {
                              const SubIcon = subItem.icon;
                              const isSubActive =
                                location.pathname === subItem.path;

                              return (
                                <motion.li
                                  key={subItem.path}
                                  variants={subItemVariants}
                                  initial="closed"
                                  animate="open"
                                  exit="closed"
                                  custom={subIndex}
                                >
                                  <NavLink
                                    to={subItem.path}
                                    className={`
                                      flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm group
                                      ${
                                        isSubActive
                                          ? "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400 shadow-lg shadow-emerald-500/10"
                                          : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 hover:border-l-2 hover:border-slate-500/50"
                                      }
                                      ${
                                        isMobile ? "active:bg-slate-600/30" : ""
                                      }
                                    `}
                                    onClick={closeMobileMenu}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      whileTap={{ scale: 0.9 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <SubIcon
                                        className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
                                          isSubActive
                                            ? "text-emerald-400"
                                            : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                      />
                                    </motion.div>
                                    <div className="ml-3 min-w-0 flex-1">
                                      <p className="font-medium truncate">
                                        {subItem.name}
                                      </p>
                                      <p
                                        className={`text-xs truncate transition-colors duration-200 ${
                                          isSubActive
                                            ? "text-emerald-200"
                                            : "text-slate-500 group-hover:text-slate-400"
                                        }`}
                                      >
                                        {subItem.description}
                                      </p>
                                    </div>

                                    {isSubActive && (
                                      <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                          duration: 0.2,
                                          delay: 0.1,
                                        }}
                                        className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                                      />
                                    )}
                                  </NavLink>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900/80 to-transparent flex-shrink-0">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center w-full px-3 py-2 text-sm text-red-400 
            hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors border border-red-500/20
            ${!isSidebarOpen && "lg:justify-center"}
          `}
        >
          <LogOut className="h-5 w-5" />
          {isSidebarOpen && <span className="ml-3">Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
