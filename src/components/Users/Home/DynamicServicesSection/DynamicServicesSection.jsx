// components/Users/Home/DynamicServicesSection.jsx - FIXED VERSION
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Users,
  FileText,
  BarChart3,
  GraduationCap,
  Heart,
  Shield,
  UserCheck,
  Database,
  Award,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  Globe,
  Settings,
  Clock,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Simple cache implementation
const SERVICES_CACHE_KEY = "hr_services_public";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const setServicesCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Services cache saved");
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getServicesCache = () => {
  try {
    const cached = localStorage.getItem(SERVICES_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(SERVICES_CACHE_KEY);
      return null;
    }

    console.log("✅ Services cache found");
    return parsed.data;
  } catch (error) {
    localStorage.removeItem(SERVICES_CACHE_KEY);
    return null;
  }
};

const clearServicesCache = () => {
  try {
    localStorage.removeItem(SERVICES_CACHE_KEY);
    console.log("🗑️ Services cache cleared");
  } catch (error) {
    console.error("Cache clear failed:", error);
  }
};

// Icon mapping for dynamic icons
const ICON_MAP = {
  Search,
  Users,
  FileText,
  BarChart3,
  GraduationCap,
  Heart,
  Shield,
  UserCheck,
  Database,
  Award,
  Zap,
  Star,
  CheckCircle,
  TrendingUp,
  Globe,
  Settings,
  Clock,
  Mail,
  Phone,
  Calendar,
};

const DynamicServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold: 0.1 });

  // ✅ Fixed API URL handling
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // ✅ Fixed fetch function with better error handling
  const fetchServices = useCallback(
    async (forceRefresh = false) => {
      console.log("🔄 Fetching services...", { forceRefresh, API_BASE_URL });

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        // Try cache first (only if not forcing refresh)
        if (!forceRefresh) {
          const cachedServices = getServicesCache();
          if (cachedServices && cachedServices.length > 0) {
            console.log("📦 Using cached services:", cachedServices.length);
            setServices(cachedServices);
            setIsLoading(false);
            setError(null);

            // Background refresh after showing cached data
            setTimeout(() => {
              fetchServices(true);
            }, 1000);
            return;
          }
        }

        // ✅ Fixed API endpoint - removed /api from here since it's in base URL
        const apiUrl = `${API_BASE_URL}/services/active`;
        console.log("🌐 Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          // ✅ Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Response data:", data);

        if (data.success && data.data && data.data.services) {
          console.log("✅ Services loaded:", data.data.services.length);
          setServices(data.data.services);
          setError(null);

          // Cache the data
          setServicesCache(data.data.services);
        } else {
          console.error("❌ Invalid response structure:", data);
          throw new Error(data.message || "Invalid response structure");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error.message);

        // Try to use cached data as fallback
        const cachedServices = getServicesCache();
        if (cachedServices && cachedServices.length > 0) {
          console.log("🔄 Using cached data as fallback");
          setServices(cachedServices);
          setError(null);
        } else {
          setServices([]);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [API_BASE_URL]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearServicesCache();
    fetchServices(true);
  }, [fetchServices]);

  // Get icon component from string
  const getIconComponent = (iconName) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? (
      <IconComponent className="w-8 h-8" />
    ) : (
      <Star className="w-8 h-8" />
    );
  };

  // ✅ Fixed initialization
  useEffect(() => {
    console.log("🚀 DynamicServicesSection initializing...");

    // Check if we have cached data first
    const cachedServices = getServicesCache();
    if (cachedServices && cachedServices.length > 0) {
      console.log("⚡ Loading from cache immediately");
      setServices(cachedServices);
      setIsLoading(false);
      setError(null);

      // Still fetch fresh data in background
      setTimeout(() => fetchServices(true), 500);
    } else {
      console.log("📡 No cache, fetching fresh data");
      fetchServices();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearServicesCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchServices]);

  // ✅ Debug: Force re-render when services change
  useEffect(() => {
    if (services.length > 0) {
      console.log(
        "🎯 Services state updated, forcing re-render:",
        services.length
      );
    }
  }, [services]);

  // ✅ Better loading state
  if (isLoading && services.length === 0) {
    console.log("⏳ Showing loading state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-6 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-3 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500">Loading HR Services...</p>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Better error state
  if (error && services.length === 0) {
    console.log("⚠️ Showing error state:", error);
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-red-100">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Services
              </h3>
              <p className="text-gray-600 mb-6">
                {error || "Something went wrong while loading our HR services."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span>{isRefreshing ? "Retrying..." : "Try Again"}</span>
                </button>
                <p className="text-xs text-gray-500">
                  API URL: {API_BASE_URL}/services/active
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Better empty state
  if (services.length === 0) {
    console.log("📭 Showing empty state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Services Available
              </h3>
              <p className="text-gray-600 mb-6">
                Our HR services are being updated. Please check back soon!
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Force render check
  if (!services || services.length === 0) {
    console.log("❌ Services array is empty or null:", services);
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-yellow-100">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Services Not Rendering
              </h3>
              <p className="text-gray-600 mb-6">
                Data is loaded but not displaying. Check console logs.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Force Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" // ✅ Force visible instead of conditional
          className="text-center mb-16 lg:mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6"
          >
            <Star className="w-4 h-4 text-blue-500 fill-current" />
            <span>{services.length}+ Comprehensive HR Services</span>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin ml-2" />
            )}
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="text-gray-800">Complete</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Remote HR Solutions
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            From talent acquisition to performance management — we provide
            end-to-end HR services designed for modern remote and hybrid
            organizations.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" // ✅ Force visible instead of conditional
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          key={`services-${services.length}`} // ✅ Force re-render with key
        >
          {services && services.length > 0 ? (
            services.map((service, index) => {
              console.log(`🎨 Rendering service ${index + 1}:`, service.title);
              return (
                <motion.div
                  key={`service-${service._id}-${index}`}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  className={`group relative bg-gradient-to-br ${
                    service.bgGradient || "from-blue-50 to-blue-100"
                  } border-2 ${
                    service.borderColor || "border-blue-200"
                  } rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-2xl ${
                    service.hoverShadow || "hover:shadow-blue-200/50"
                  } transition-all duration-500 cursor-pointer overflow-hidden`}
                >
                  {/* Hover Effect Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`${
                      service.iconBg || "bg-blue-500"
                    } text-white p-3 rounded-xl mb-6 w-fit shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    {getIconComponent(service.icon)}
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3
                      className={`text-xl lg:text-2xl font-bold ${
                        service.accent || "text-blue-600"
                      } mb-4 group-hover:text-gray-900 transition-colors duration-300`}
                    >
                      {service.title || "Untitled Service"}
                    </h3>

                    <p className="text-gray-700 mb-6 leading-relaxed text-sm lg:text-base">
                      {service.description || "No description available"}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {(service.features && Array.isArray(service.features)
                        ? service.features
                        : []
                      ).map((feature, featureIndex) => (
                        <motion.li
                          key={`feature-${index}-${featureIndex}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.1 + featureIndex * 0.05,
                          }}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Service Status Indicators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {service.isHighlighted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-current opacity-20 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full"></div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No services to display</p>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 1, y: 0 }} // ✅ Remove animation delay
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-16 lg:mt-24"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 left-4 w-12 h-12 border border-white/10 rounded-full"
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your HR Operations?
              </h3>
              <p className="text-lg lg:text-xl text-blue-100 mb-8">
                Get a free consultation and discover how our remote HR solutions
                can streamline your business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Get Free Consultation</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>View Pricing</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DynamicServicesSection;
