// components/Users/Home/DynamicTestimonialsSection.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Star, Quote, ArrowLeft, ArrowRight, Users, Award, 
  RefreshCw, AlertCircle, Database 
} from 'lucide-react';

// Simple cache implementation
const TESTIMONIALS_CACHE_KEY = "testimonials_public";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const setTestimonialsCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(TESTIMONIALS_CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Testimonials cache saved");
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getTestimonialsCache = () => {
  try {
    const cached = localStorage.getItem(TESTIMONIALS_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(TESTIMONIALS_CACHE_KEY);
      return null;
    }

    console.log("✅ Testimonials cache found");
    return parsed.data;
  } catch (error) {
    localStorage.removeItem(TESTIMONIALS_CACHE_KEY);
    return null;
  }
};

const clearTestimonialsCache = () => {
  try {
    localStorage.removeItem(TESTIMONIALS_CACHE_KEY);
    console.log("🗑️ Testimonials cache cleared");
  } catch (error) {
    console.error("Cache clear failed:", error);
  }
};

const DynamicTestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold: 0.1 });
  const [currentSlide, setCurrentSlide] = useState(0);

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [testimonials, setTestimonials] = useState([]);
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
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Fetch testimonials function
  const fetchTestimonials = useCallback(
    async (forceRefresh = false) => {
      console.log("🔄 Fetching testimonials...", {
        forceRefresh,
        API_BASE_URL,
      });

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        // Try cache first (only if not forcing refresh)
        if (!forceRefresh) {
          const cachedTestimonials = getTestimonialsCache();
          if (cachedTestimonials && cachedTestimonials.length > 0) {
            console.log("📦 Using cached testimonials:", cachedTestimonials.length);
            setTestimonials(cachedTestimonials);
            setIsLoading(false);
            setError(null);

            // Background refresh after showing cached data
            setTimeout(() => {
              fetchTestimonials(true);
            }, 1000);
            return;
          }
        }

        // Fetch from API
        const apiUrl = `${API_BASE_URL}/testimonials/active`;
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

        if (data.success && data.data && data.data.testimonials) {
          console.log("✅ Testimonials loaded:", data.data.testimonials.length);
          setTestimonials(data.data.testimonials);
          setError(null);

          // Cache the data
          setTestimonialsCache(data.data.testimonials);
        } else {
          console.error("❌ Invalid response structure:", data);
          throw new Error(data.message || "Invalid response structure");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error.message);

        // Try to use cached data as fallback
        const cachedTestimonials = getTestimonialsCache();
        if (cachedTestimonials && cachedTestimonials.length > 0) {
          console.log("🔄 Using cached data as fallback");
          setTestimonials(cachedTestimonials);
          setError(null);
        } else {
          setTestimonials([]);
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
    clearTestimonialsCache();
    fetchTestimonials(true);
  }, [fetchTestimonials]);

  // Slider controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play slider
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Initialize component
  useEffect(() => {
    console.log("🚀 DynamicTestimonialsSection initializing...");

    // Check if we have cached data first
    const cachedTestimonials = getTestimonialsCache();
    if (cachedTestimonials && cachedTestimonials.length > 0) {
      console.log("⚡ Loading from cache immediately");
      setTestimonials(cachedTestimonials);
      setIsLoading(false);
      setError(null);

      // Still fetch fresh data in background
      setTimeout(() => fetchTestimonials(true), 500);
    } else {
      console.log("📡 No cache, fetching fresh data");
      fetchTestimonials();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearTestimonialsCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchTestimonials]);

  // Loading state
  if (isLoading && testimonials.length === 0) {
    console.log("⏳ Showing loading state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 animate-pulse"></div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse w-32"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-2xl p-6 lg:p-8">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500">Loading client testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && testimonials.length === 0) {
    console.log("⚠️ Showing error state:", error);
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-red-100">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Testimonials
              </h3>
              <p className="text-gray-600 mb-6">
                {error || "Something went wrong while loading client testimonials."}
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
  if (testimonials.length === 0) {
    console.log("📭 Showing empty state");
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Testimonials Available
              </h3>
              <p className="text-gray-600 mb-6">
                Client testimonials are being updated. Please check back soon!
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
    <section ref={ref} className="py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '6s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-8"
          >
            <Star className="w-4 h-4 text-blue-500 fill-current" />
            <span>What Our Clients Say</span>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin ml-2" />
            )}
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="text-gray-800">Success Stories from</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Industry Leaders
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Discover how we've helped companies transform their HR operations and achieve remarkable growth.
          </motion.p>
        </motion.div>

        {/* Testimonials Slider */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-6xl mx-auto"
          key={`testimonials-${testimonials.length}`}
        >
          {/* Main Testimonial Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="p-8 lg:p-12"
            >
              {/* Quote Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg"
              >
                <Quote className="w-8 h-8 text-white" />
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8 items-center">
                {/* Testimonial Content */}
                <div className="lg:col-span-2">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonials[currentSlide]?.rating || 5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-xl lg:text-2xl text-gray-800 mb-8 leading-relaxed font-medium">
                    "{testimonials[currentSlide]?.testimonialText || 'No testimonial text available'}"
                  </blockquote>

                  {/* Results Badge */}
                  {testimonials[currentSlide]?.results && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200 rounded-full text-sm font-semibold text-green-700 mb-6">
                      <Award className="w-4 h-4 text-green-500" />
                      <span>Result: {testimonials[currentSlide].results}</span>
                    </div>
                  )}

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={testimonials[currentSlide]?.profileImage?.url || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`}
                      alt={testimonials[currentSlide]?.name || 'Client'}
                      className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`;
                      }}
                    />
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {testimonials[currentSlide]?.name || 'Anonymous'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {testimonials[currentSlide]?.position || 'Position'}
                      </div>
                      <div className="text-blue-600 text-sm font-medium">
                        {testimonials[currentSlide]?.company || 'Company'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company/Industry Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 lg:p-8 border border-blue-200">
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <Users className="w-10 h-10 text-white" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {testimonials[currentSlide]?.company || 'Company Name'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {testimonials[currentSlide]?.industry || 'Technology'} Industry
                    </p>
                    {testimonials[currentSlide]?.location && (
                      <p className="text-sm text-gray-500 mb-4">
                        📍 {testimonials[currentSlide].location}
                      </p>
                    )}
                    <div className="text-sm text-gray-500">
                      "Working with Alam HR Agency has been a transformative experience for our organization."
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            {/* Previous/Next Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-blue-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-blue-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </motion.button>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="text-sm font-medium text-gray-500">
              {currentSlide + 1} / {testimonials.length}
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 lg:mt-24"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-white text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Join Our Community of Success
              </h3>
              <p className="text-lg lg:text-xl text-blue-100 mb-8">
                Be part of the next success story. Let's transform your HR operations together.
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {[
                  { number: "4.9/5", label: "Average Rating" },
                  { number: `${testimonials.length}+`, label: "Happy Clients" },
                  { number: "99%", label: "Retention Rate" },
                  { number: "24/7", label: "Support Available" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DynamicTestimonialsSection;