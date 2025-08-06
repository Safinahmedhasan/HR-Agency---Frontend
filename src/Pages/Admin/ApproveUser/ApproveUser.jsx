// Pages/Admin/ApproveUser/ApproveUser.jsx - Updated with httpOnly cookie auth & optimized cache
import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Trash2,
  UserX,
  CheckCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simple cache system - exactly like other components
const CACHE_KEY = "approve_user_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Active users cache saved successfully:", CACHE_KEY);
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log("📭 No active users cache found");
      return null;
    }

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      console.log("⏰ Active users cache expired, removed");
      return null;
    }

    console.log("✅ Active users cache found and valid");
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
    console.log("🗑️ Active users cache cleared");
  } catch (error) {
    console.error("❌ Cache clear failed:", error);
  }
};

const ApproveUser = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveUsers = useCallback(
    async (page = 1, search = "", forceRefresh = false) => {
      // Smart loading logic
      if (!forceRefresh && page === 1 && !search) {
        const cachedData = getCache();
        if (cachedData) {
          console.log("📦 Using cached active users data, skipping API call");
          return;
        }
      }

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching active users from API...");
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "15",
          status: "active", // Only fetch active users
          ...(search && { search }),
        });

        // ✅ Fixed: Use credentials: "include" instead of Authorization header
        const response = await fetch(
          `${API_BASE_URL}/admin/users?${queryParams}`,
          {
            method: "GET",
            credentials: "include", // ✅ This is the key fix for httpOnly cookies
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          // Handle 401 unauthorized
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to fetch active users");
        }

        const data = await response.json();

        if (data.success) {
          const newData = {
            users: data.data.users,
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
          };

          setUsers(newData.users);
          setCurrentPage(newData.currentPage);
          setTotalPages(newData.totalPages);

          // Cache only default view (page 1, no search)
          if (!search && page === 1) {
            console.log("💾 Saving active users to cache...");
            setCache(newData);
          }

          console.log("✅ Active users data fetched and updated");
        }
      } catch (error) {
        console.error("❌ Fetch active users error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    fetchActiveUsers(currentPage, searchTerm, true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchActiveUsers, currentPage, searchTerm]);

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setIsLoading(true);
      fetchActiveUsers(newPage, searchTerm);
    },
    [searchTerm, fetchActiveUsers]
  );

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setUsers(cachedData.users);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
        } else {
          setIsLoading(true);
          fetchActiveUsers(1, "");
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(() => fetchActiveUsers(1, value), 300);
      }
    },
    [fetchActiveUsers]
  );

  const deactivateUser = useCallback(
    async (userId) => {
      if (!confirm("Are you sure you want to deactivate this user?")) return;

      setActionLoading(userId);
      try {
        // ✅ Fixed: Use credentials: "include" instead of Authorization header
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${userId}/status`,
          {
            method: "PUT",
            credentials: "include", // ✅ This is the key fix
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isActive: false }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to deactivate user");
        }

        const data = await response.json();
        if (data.success) {
          // Remove user from list since they're no longer active
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);

          if (!searchTerm && currentPage === 1) {
            setCache({
              users: updatedUsers,
              currentPage,
              totalPages,
            });
          }
        }
      } catch (error) {
        console.error("Error deactivating user:", error);
        fetchActiveUsers(currentPage, searchTerm, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      users,
      searchTerm,
      currentPage,
      totalPages,
      fetchActiveUsers,
    ]
  );

  const deleteUser = useCallback(
    async (userId) => {
      if (!confirm("Are you sure you want to permanently delete this user?"))
        return;

      setActionLoading(userId);
      try {
        // ✅ Fixed: Use credentials: "include" instead of Authorization header
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: "DELETE",
          credentials: "include", // ✅ This is the key fix
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
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);

          if (!searchTerm && currentPage === 1) {
            setCache({
              users: updatedUsers,
              currentPage,
              totalPages,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        fetchActiveUsers(currentPage, searchTerm, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      users,
      searchTerm,
      currentPage,
      totalPages,
      fetchActiveUsers,
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
    console.log("🚀 ApproveUser initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading active users from cache instantly");
      setUsers(cachedData.users);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setIsLoading(false);

      // Background refresh after 500ms
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchActiveUsers(1, "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh active users data");
      setIsLoading(true);
      fetchActiveUsers();
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
        {/* Loading Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading Active Users
                </h3>
                <p className="text-gray-500">Fetching approved user data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Users</h1>
          <p className="text-gray-600 mt-1">Manage approved and active users</p>
        </div>
        <div className="mt-4 sm:mt-0">
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
      </div>

      {/* Active Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                Active Users
              </h2>
              <p className="text-sm text-gray-600">
                {users.length} active users found
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search active users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-emerald-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
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
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">
                        No active users found
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "No users are currently active"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-emerald-50/30 transition-colors duration-150"
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                        {user.role || "User"}
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
                          onClick={() => deactivateUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="text-orange-600 hover:text-orange-800 transition-colors p-2 rounded-lg hover:bg-orange-50"
                          title="Deactivate User"
                        >
                          {actionLoading === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <UserX className="h-4 w-4" />
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
          <div className="bg-emerald-50/30 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  Active User Details
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
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <div className="w-2 h-2 rounded-full mr-2 bg-emerald-500"></div>
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
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

                  {/* Quick Actions in Modal */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        deactivateUser(selectedUser._id);
                        setIsModalOpen(false);
                      }}
                      disabled={actionLoading === selectedUser._id}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed"
                    >
                      {actionLoading === selectedUser._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <UserX className="h-4 w-4 mr-2" />
                      )}
                      Deactivate
                    </button>
                    <button
                      onClick={() => {
                        deleteUser(selectedUser._id);
                        setIsModalOpen(false);
                      }}
                      disabled={actionLoading === selectedUser._id}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                      {actionLoading === selectedUser._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
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

export default ApproveUser;
