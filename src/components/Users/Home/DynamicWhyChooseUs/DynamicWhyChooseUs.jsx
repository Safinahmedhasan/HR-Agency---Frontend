// components/Users/Home/DynamicWhyChooseUs.jsx - Dynamic WhyChooseUs Component
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  Clock,
  Users,
  Heart,
  Target,
  Zap,
  Star,
  CheckCircle,
  Database,
  Settings,
  BarChart3,
  Crown,
  Rocket,
  Trophy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Simple cache implementation
const REASONS_CACHE_KEY = "why_choose_us_public";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const setReasonsCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(REASONS_CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ WhyChooseUs cache saved");
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getReasonsCache = () => {
  try {
    const cached = localStorage.getItem(REASONS_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(REASONS_CACHE_KEY);
      return null;
    }

    console.log("✅ WhyChooseUs cache found");
    return parsed.data;
  } catch (error) {
    localStorage.removeItem(REASONS_CACHE_KEY);
    return null;
  }
};

const clearReasonsCache = () => {
  try {
    localStorage.removeItem(REASONS_CACHE_KEY);
    console.log("🗑️ WhyChooseUs cache cleared");
  } catch (error) {
    console.error("Cache clear failed:", error);
  }
};

// Icon mapping for dynamic icons
const ICON_MAP = {
  Shield,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  Clock,
  Users,
  Heart,
  Target,
  Zap,
  Star,
  CheckCircle,
  Database,
  Settings,
  BarChart3,
  Crown,
  Rocket,
  Trophy,
};

// Color schemes mapping
const COLOR_SCHEMES = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    icon: "bg-blue-500",
    text: "text-blue-600",
    border: "border-blue-200",
    shadow: "shadow-blue-200/30",
    highlight: "bg-blue-500/10 text-blue-700 border-blue-300",
  },
  green: {
    bg: "from-green-50 to-green-100",
    icon: "bg-green-500",
    text: "text-green-600",
    border: "border-green-200",
    shadow: "shadow-green-200/30",
    highlight: "bg-green-500/10 text-green-700 border-green-300",
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    icon: "bg-purple-500",
    text: "text-purple-600",
    border: "border-purple-200",
    shadow: "shadow-purple-200/30",
    highlight: "bg-purple-500/10 text-purple-700 border-purple-300",
  },
  orange: {
    bg: "from-orange-50 to-orange-100",
    icon: "bg-orange-500",
    text: "text-orange-600",
    border: "border-orange-200",
    shadow: "shadow-orange-200/30",
    highlight: "bg-orange-500/10 text-orange-700 border-orange-300",
  },
  cyan: {
    bg: "from-cyan-50 to-cyan-100",
    icon: "bg-cyan-500",
    text: "text-cyan-600",
    border: "border-cyan-200",
    shadow: "shadow-cyan-200/30",
    highlight: "bg-cyan-500/10 text-cyan-700 border-cyan-300",
  },
  red: {
    bg: "from-red-50 to-red-100",
    icon: "bg-red-500",
    text: "text-red-600",
    border: "border-red-200",
    shadow: "shadow-red-200/30",
    highlight: "bg-red-500/10 text-red-700 border-red-300",
  },
  pink: {
    bg: "from-pink-50 to-pink-100",
    icon: "bg-pink-500",
    text: "text-pink-600",
    border: "border-pink-200",
    shadow: "shadow-pink-200/30",
    highlight: "bg-pink-500/10 text-pink-700 border-pink-300",
  },
  indigo: {
    bg: "from-indigo-50 to-indigo-100",
    icon: "bg-indigo-500",
    text: "text-indigo-600",
    border: "border-indigo-200",
    shadow: "shadow-indigo-200/30",
    highlight: "bg-indigo-500/10 text-indigo-700 border-indigo-300",
  },
  yellow: {
    bg: "from-yellow-50 to-yellow-100",
    icon: "bg-yellow-500",
    text: "text-yellow-600",
    border: "border-yellow-200",
    shadow: "shadow-yellow-200/30",
    highlight: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
  },
  emerald: {
    bg: "from-emerald-50 to-emerald-100",
    icon: "bg-emerald-500",
    text: "text-emerald-600",
    border: "border-emerald-200",
    shadow: "shadow-emerald-200/30",
    highlight: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
  },
};

const DynamicWhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold: 0.1 });

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [reasons, setReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      scale: 1.03,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Fetch reasons function
  const fetchReasons = useCallback(
    async (forceRefresh = false) => {
      console.log("🔄 Fetching WhyChooseUs reasons...", {
        forceRefresh,
        API_BASE_URL,
      });

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        // Try cache first (only if not forcing refresh)
        if (!forceRefresh) {
          const cachedReasons = getReasonsCache();
          if (cachedReasons && cachedReasons.length > 0) {
            console.log("📦 Using cached reasons:", cachedReasons.length);
            setReasons(cachedReasons);
            setIsLoading(false);
            setError(null);

            // Background refresh after showing cached data
            setTimeout(() => {
              fetchReasons(true);
            }, 1000);
            return;
          }
        }

        // Fetch from API
        const apiUrl = `${API_BASE_URL}/why-choose-us/active`;
        console.log("🌐 Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Response data:", data);

        if (data.success && data.data && data.data.reasons) {
          console.log("✅ Reasons loaded:", data.data.reasons.length);
          setReasons(data.data.reasons);
          setError(null);

          // Cache the data
          setReasonsCache(data.data.reasons);
        } else {
          console.error("❌ Invalid response structure:", data);
          throw new Error(data.message || "Invalid response structure");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error.message);

        // Try to use cached data as fallback
        const cachedReasons = getReasonsCache();
        if (cachedReasons && cachedReasons.length > 0) {
          console.log("🔄 Using cached data as fallback");
          setReasons(cachedReasons);
          setError(null);
        } else {
          setReasons([]);
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
    clearReasonsCache();
    fetchReasons(true);
  }, [fetchReasons]);

  // Get icon component from string
  const getIconComponent = (iconName) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? (
      <IconComponent className="w-8 h-8" />
    ) : (
      <Star className="w-8 h-8" />
    );
  };

  // Get color scheme
  const getColorScheme = (colorName) => {
    return COLOR_SCHEMES[colorName] || COLOR_SCHEMES.blue;
  };

  // Initialize component
  useEffect(() => {
    console.log("🚀 DynamicWhyChooseUs initializing...");

    // Check if we have cached data first
    const cachedReasons = getReasonsCache();
    if (cachedReasons && cachedReasons.length > 0) {
      console.log("⚡ Loading from cache immediately");
      setReasons(cachedReasons);
      setIsLoading(false);
      setError(null);

      // Still fetch fresh data in background
      setTimeout(() => fetchReasons(true), 500);
    } else {
      console.log("📡 No cache, fetching fresh data");
      fetchReasons();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearReasonsCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchReasons]);

  // Loading state
  if (isLoading && reasons.length === 0) {
    console.log("⏳ Showing loading state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200/20 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200/20 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200/20 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-sm"
              >
                <div className="w-14 h-14 bg-gray-200/20 rounded-xl mb-6 animate-pulse"></div>
                <div className="h-6 bg-gray-200/20 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200/20 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200/20 rounded mb-6 animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-300">Loading reasons to choose us...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && reasons.length === 0) {
    console.log("⚠️ Showing error state:", error);
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-500/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Unable to Load Content
              </h3>
              <p className="text-gray-300 mb-6">
                {error ||
                  "Something went wrong while loading why choose us reasons."}
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
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (reasons.length === 0) {
    console.log("📭 Showing empty state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-500/20">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Content Available
              </h3>
              <p className="text-gray-300 mb-6">
                Our reasons are being updated. Please check back soon!
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

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 lg:mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
            <span>Why Leading Companies Choose Us</span>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin ml-2" />
            )}
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">Why Choose</span>
            <br />
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "300% 300%",
              }}
            >
              Alam HR Agency?
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            We combine cutting-edge technology with human expertise to deliver
            exceptional HR solutions that drive business growth and employee
            satisfaction.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
          key={`reasons-${reasons.length}`}
        >
          {reasons && reasons.length > 0 ? (
            reasons.map((reason, index) => {
              console.log(`🎨 Rendering reason ${index + 1}:`, reason.title);
              const scheme = getColorScheme(reason.color);

              return (
                <motion.div
                  key={`reason-${reason._id}-${index}`}
                  variants={itemVariants}
                  whileHover={cardHoverVariants.hover}
                  className="group relative"
                >
                  <div
                    className={`h-full bg-gradient-to-br ${scheme.bg} border-2 ${scheme.border} rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-2xl ${scheme.shadow} transition-all duration-500 overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <motion.div
                      className="absolute inset-0 opacity-5"
                      animate={{
                        backgroundPosition: ["0px 0px", "60px 60px"],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Icon with Animation */}
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        rotate: 360,
                        transition: { duration: 0.6 },
                      }}
                      className={`${scheme.icon} text-white p-4 rounded-2xl mb-6 w-fit shadow-lg relative z-10`}
                    >
                      {getIconComponent(reason.icon)}
                    </motion.div>

                    {/* Highlight Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                      className={`inline-flex items-center gap-1 px-3 py-1 ${scheme.highlight} border rounded-full text-xs font-semibold mb-4`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>{reason.highlight}</span>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3
                        className={`text-xl lg:text-2xl font-bold ${scheme.text} mb-4 group-hover:text-gray-900 transition-colors duration-300`}
                      >
                        {reason.title}
                      </h3>

                      <p className="text-gray-700 mb-6 leading-relaxed text-sm lg:text-base">
                        {reason.description}
                      </p>

                      {/* Stats and Rating */}
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-semibold ${scheme.text}`}>
                          {reason.stats}
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-1"
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-yellow-400 fill-current"
                            />
                          ))}
                        </motion.div>
                      </div>

                      {/* Highlighted Badge */}
                      {reason.isHighlighted && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-300">No reasons to display</p>
            </div>
          )}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl lg:rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 text-center">
                Trusted by Industry Leaders
              </h3>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {[
                  {
                    number: "500+",
                    label: "Successful Projects",
                    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
                  },
                  {
                    number: "150+",
                    label: "Global Clients",
                    icon: <Users className="w-6 h-6 text-blue-400" />,
                  },
                  {
                    number: "50+",
                    label: "Countries Served",
                    icon: <Globe className="w-6 h-6 text-purple-400" />,
                  },
                  {
                    number: "99%",
                    label: "Client Retention",
                    icon: <Heart className="w-6 h-6 text-pink-400" />,
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group cursor-default"
                  >
                    <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial Quote */}
              <motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="text-lg lg:text-xl text-slate-300 italic text-center max-w-2xl mx-auto"
              >
                "Alam HR Agency transformed our remote workforce management
                completely. Their expertise and dedication to our success is
                unmatched."
                <footer className="mt-4 text-sm text-slate-400">
                  — Sarah Johnson, CEO at TechGlobal Inc.
                </footer>
              </motion.blockquote>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DynamicWhyChooseUs;
