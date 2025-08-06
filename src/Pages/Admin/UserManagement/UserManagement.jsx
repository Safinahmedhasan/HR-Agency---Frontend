// Pages/Admin/UserManagement/UserManagement.jsx - Complete Fixed Component
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simple cache system - exactly like AdminDashboard
const CACHE_KEY = "user_management_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Cache saved successfully:", CACHE_KEY);
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log("📭 No cache found");
      return null;
    }

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      console.log("⏰ Cache expired, removed");
      return null;
    }

    console.log("✅ Cache found and valid");
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
    console.log("🗑️ Cache cleared");
  } catch (error) {
    console.error("❌ Cache clear failed:", error);
  }
};

const UserManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    todayRegistrations: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(
    async (page = 1, search = "", status = "", forceRefresh = false) => {
      // Smart loading logic
      if (!forceRefresh && page === 1 && !search && !status) {
        const cachedData = getCache();
        if (cachedData) {
          console.log("📦 Using cached data, skipping API call");
          return;
        }
      }

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching from API...");
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "15",
          ...(search && { search }),
          ...(status && { status }),
        });

        const response = await fetch(
          `${API_BASE_URL}/admin/users?${queryParams}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        if (data.success) {
          const newData = {
            users: data.data.users,
            stats: data.data.stats,
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
          };

          setUsers(newData.users);
          setStats(newData.stats);
          setCurrentPage(newData.currentPage);
          setTotalPages(newData.totalPages);

          // Cache only default view (page 1, no search/filter)
          if (!search && !status && page === 1) {
            console.log("💾 Saving to cache...");
            setCache(newData);
          }

          console.log("✅ Data fetched and updated");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    fetchUsers(currentPage, searchTerm, statusFilter, true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchUsers, currentPage, searchTerm, statusFilter]);

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setIsLoading(true);
      fetchUsers(newPage, searchTerm, statusFilter);
    },
    [searchTerm, statusFilter, fetchUsers]
  );

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setUsers(cachedData.users);
          setStats(cachedData.stats);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
        } else {
          setIsLoading(true);
          fetchUsers(1, "", statusFilter);
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(() => fetchUsers(1, value, statusFilter), 300);
      }
    },
    [statusFilter, fetchUsers]
  );

  const handleStatusFilter = useCallback(
    (status) => {
      setStatusFilter(status);
      setCurrentPage(1);

      if (!status && !searchTerm) {
        const cachedData = getCache();
        if (cachedData) {
          setUsers(cachedData.users);
          setStats(cachedData.stats);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          return;
        }
      }
      setIsLoading(true);
      fetchUsers(1, searchTerm, status);
    },
    [searchTerm, fetchUsers]
  );

  const updateUserStatus = useCallback(
    async (userId, isActive) => {
      setActionLoading(userId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${userId}/status`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isActive }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to update user status");
        }

        const data = await response.json();
        if (data.success) {
          const updatedUsers = users.map((user) =>
            user._id === userId ? { ...user, isActive } : user
          );
          setUsers(updatedUsers);

          const updatedStats = {
            ...stats,
            activeUsers: isActive
              ? stats.activeUsers + 1
              : stats.activeUsers - 1,
            inactiveUsers: isActive
              ? stats.inactiveUsers - 1
              : stats.inactiveUsers + 1,
          };
          setStats(updatedStats);

          // Update cache if in default view
          if (!searchTerm && !statusFilter && currentPage === 1) {
            const updatedCacheData = {
              users: updatedUsers,
              stats: updatedStats,
              currentPage,
              totalPages,
            };
            setCache(updatedCacheData);
          }
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        fetchUsers(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      users,
      stats,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      fetchUsers,
    ]
  );

  const deleteUser = useCallback(
    async (userId) => {
      if (
        !confirm(
          "Are you sure you want to delete this user? This action cannot be undone."
        )
      ) {
        return;
      }

      setActionLoading(userId);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to delete user");
        }

        const data = await response.json();
        if (data.success) {
          const deletedUser = users.find((u) => u._id === userId);
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);

          const updatedStats = {
            ...stats,
            totalUsers: stats.totalUsers - 1,
            activeUsers: deletedUser?.isActive
              ? stats.activeUsers - 1
              : stats.activeUsers,
            inactiveUsers: deletedUser?.isActive
              ? stats.inactiveUsers
              : stats.inactiveUsers - 1,
          };
          setStats(updatedStats);

          // Update cache if in default view
          if (!searchTerm && !statusFilter && currentPage === 1) {
            const updatedCacheData = {
              users: updatedUsers,
              stats: updatedStats,
              currentPage,
              totalPages,
            };
            setCache(updatedCacheData);
          }
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        fetchUsers(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      users,
      stats,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      fetchUsers,
    ]
  );

  const viewUserDetails = useCallback(
    (userId) => {
      const user = users.find((u) => u._id === userId);
      if (user) {
        setSelectedUser(user);
        setIsModalOpen(true);
      }
    },
    [users]
  );

  // Initialize component
  useEffect(() => {
    console.log("🚀 UserManagement initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading from cache instantly");
      setUsers(cachedData.users);
      setStats(cachedData.stats);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setIsLoading(false);

      // Background refresh after 500ms
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchUsers(1, "", "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh data");
      setIsLoading(true);
      fetchUsers();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Loading Stats Cards */}
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

        {/* Loading Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading Users
                </h3>
                <p className="text-gray-500">
                  Fetching user data from server...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stats Cards Data
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
    },
  ];

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

      {/* Stats Cards */}
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
            >
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-emerald-600 mr-2" />
                Users List
              </h2>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        {searchTerm || statusFilter
                          ? "Try adjusting your search criteria"
                          : "No users have registered yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-sm font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            user.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        ></div>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewUserDetails(user._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            updateUserStatus(user._id, !user.isActive)
                          }
                          disabled={actionLoading === user._id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                              : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          }`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {actionLoading === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete User"
                        >
                          {actionLoading === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-emerald-600 mr-2" />
                  User Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedUser.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedUser.isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              selectedUser.isActive
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Role
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900 capitalize">
                        {selectedUser.role || "User"}
                      </p>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Joined Date
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Last Updated
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        updateUserStatus(
                          selectedUser._id,
                          !selectedUser.isActive
                        );
                        setIsModalOpen(false);
                      }}
                      disabled={actionLoading === selectedUser._id}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedUser.isActive
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {selectedUser.isActive
                        ? "Deactivate User"
                        : "Activate User"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
