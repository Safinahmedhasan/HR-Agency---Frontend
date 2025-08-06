// AdminDashboard.jsx - সরাসরি Component এ FIXED
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  RefreshCw,
  ArrowUpRight,
  Activity,
  BarChart3,
  PieChart,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    todayRegistrations: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simple cache management
  const CACHE_KEY = "admin_dashboard_stats";
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  const getCachedStats = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsed.data;
    } catch (error) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedStats = useCallback((data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to cache stats:", error);
    }
  }, []);

  const clearCachedStats = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Failed to clear cached stats:", error);
    }
  }, []);

  // ✅ FIXED: Fetch stats using httpOnly cookies
  const fetchStats = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching dashboard stats from API...");

        const response = await fetch(
          `${API_BASE_URL}/admin/users?page=1&limit=1`,
          {
            method: "GET",
            credentials: "include", // ✅ CRITICAL: Include cookies
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json", // ✅ Better CORS support
            },
          }
        );

        console.log("📡 Stats response:", response.status, response.statusText);

        if (!response.ok) {
          // Handle 401 unauthorized
          if (response.status === 401) {
            console.log("❌ Admin not authenticated, redirecting to login");
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCachedStats();
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error(`Stats fetch failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Stats data received:", data);

        if (data.success && data.data.stats) {
          console.log("✅ Dashboard stats fetched successfully");
          setStats(data.data.stats);
          setCachedStats(data.data.stats);
        }
      } catch (error) {
        console.error("❌ Error fetching stats:", error);

        // Try to use cached data as fallback
        const cachedData = getCachedStats();
        if (cachedData) {
          console.log("📦 Using cached stats as fallback");
          setStats(cachedData);
        }

        // If it's a 401 error, redirect to login
        if (error.message.includes("401")) {
          console.log("🔒 Session expired, redirecting to login");
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCachedStats();
          navigate("/admin", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate, setCachedStats, getCachedStats, clearCachedStats]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCachedStats();
    fetchStats(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchStats, clearCachedStats]);

  useEffect(() => {
    console.log("🚀 AdminDashboard initializing...");

    const cachedData = getCachedStats();

    if (cachedData) {
      console.log("⚡ Loading stats from cache instantly");
      setStats(cachedData);
      setIsLoading(false);
      // Fetch fresh data in background after 1 second
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchStats(true);
      }, 1000);
      return () => clearTimeout(backgroundRefresh);
    } else {
      // No cache, fetch immediately
      fetchStats();
    }

    // Cleanup: Clear cache after 30 minutes of inactivity
    const cleanupTimeout = setTimeout(() => {
      clearCachedStats();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchStats, getCachedStats, clearCachedStats]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Professional Stats Cards Data
  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      change: "+12%",
      changeType: "positive",
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      change: "+8%",
      changeType: "positive",
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      icon: UserX,
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
      change: "-3%",
      changeType: "negative",
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Today's Signups",
      value: stats.todayRegistrations,
      icon: TrendingUp,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      change: "+24%",
      changeType: "positive",
      onClick: () => navigate("/admin/users"),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your application's key metrics
          </p>
        </div>

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

      {/* Professional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`
                ${card.bgColor} ${card.borderColor}
                rounded-2xl p-6 border shadow-sm 
                hover:shadow-lg hover:scale-105 
                transition-all duration-300 cursor-pointer
                group relative overflow-hidden
              `}
              onClick={card.onClick}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className="w-full h-full rounded-full bg-white transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`
                    p-3 rounded-xl bg-white/60 backdrop-blur-sm
                    group-hover:bg-white/80 transition-colors duration-300
                  `}
                  >
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight
                      className={`h-4 w-4 ${
                        card.changeType === "positive"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        card.changeType === "positive"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 text-emerald-600 mr-2" />
              User Activity
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Daily user registrations this week
            </p>
          </div>

          <div className="p-6">
            <div className="h-64 flex items-end justify-between space-x-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => {
                  const height = Math.random() * 80 + 20; // Random height for demo
                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center flex-1"
                    >
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-700 hover:from-emerald-600 hover:to-emerald-500"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="mt-2 text-xs font-medium text-gray-600">
                          {day}
                        </div>
                        <div className="text-xs text-emerald-600 font-semibold">
                          {Math.floor(Math.random() * 50) + 10}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total registrations this week:{" "}
                  <span className="font-semibold text-gray-900">245</span>
                </div>
                <div className="text-sm text-emerald-600 font-semibold">
                  ↗ +18% from last week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-emerald-600 mr-2" />
              Revenue Overview
            </h2>
            <p className="text-sm text-gray-600 mt-1">Monthly revenue trend</p>
          </div>

          <div className="p-6">
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[40, 80, 120, 160].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}

                {/* Revenue curve */}
                <path
                  d="M0,160 Q100,120 200,100 T400,80"
                  stroke="#10b981"
                  strokeWidth="3"
                  fill="none"
                  className="drop-shadow-sm"
                />

                {/* Area under curve */}
                <path
                  d="M0,160 Q100,120 200,100 T400,80 L400,200 L0,200 Z"
                  fill="url(#revenueGradient)"
                />

                {/* Data points */}
                {[
                  { x: 0, y: 160 },
                  { x: 100, y: 120 },
                  { x: 200, y: 100 },
                  { x: 300, y: 90 },
                  { x: 400, y: 80 },
                ].map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#10b981"
                    className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
                  />
                ))}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                <span>$50k</span>
                <span>$40k</span>
                <span>$30k</span>
                <span>$20k</span>
                <span>$10k</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Average monthly growth:{" "}
                  <span className="font-semibold text-gray-900">+12.5%</span>
                </div>
                <div className="text-sm text-emerald-600 font-semibold">
                  ↗ $45,230 this month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 text-emerald-600 mr-2" />
            Performance Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Key performance indicators and metrics
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversion Rate */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="75, 100"
                    className="animate-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">75%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
              <p className="text-sm text-gray-600">User engagement</p>
            </div>

            {/* Retention Rate */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="68, 100"
                    className="animate-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">68%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Retention Rate</h3>
              <p className="text-sm text-gray-600">User loyalty</p>
            </div>

            {/* Satisfaction */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray="92, 100"
                    className="animate-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">92%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Satisfaction</h3>
              <p className="text-sm text-gray-600">User feedback</p>
            </div>
          </div>

          {/* Real Stats Summary */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {stats.totalUsers}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.activeUsers}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.inactiveUsers}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Inactive Users
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.todayRegistrations}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Today's Signups
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
