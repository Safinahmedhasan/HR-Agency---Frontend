// Pages/Admin/PendingUser/PendingUser.jsx - Updated with httpOnly cookie auth & optimized cache
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Eye,
  Trash2,
  UserCheck,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simple cache system - exactly like UserManagement
const CACHE_KEY = "pending_user_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Pending users cache saved successfully:", CACHE_KEY);
  } catch (error) {
    console.error("❌ Cache save failed:", error);
  }
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log("📭 No pending users cache found");
      return null;
    }

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      console.log("⏰ Pending users cache expired, removed");
      return null;
    }

    console.log("✅ Pending users cache found and valid");
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
    console.log("🗑️ Pending users cache cleared");
  } catch (error) {
    console.error("❌ Cache clear failed:", error);
  }
};

const PendingUser = () => {
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
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchPendingUsers = useCallback(
    async (page = 1, search = "", forceRefresh = false) => {
      // Smart loading logic
      if (!forceRefresh && page === 1 && !search) {
        const cachedData = getCache();
        if (cachedData) {
          console.log("📦 Using cached pending users data, skipping API call");
          return;
        }
      }

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        console.log("🌐 Fetching pending users from API...");
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "15",
          status: "inactive", // Only fetch inactive users
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
          throw new Error("Failed to fetch pending users");
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
            console.log("💾 Saving pending users to cache...");
            setCache(newData);
          }

          console.log("✅ Pending users data fetched and updated");
        }
      } catch (error) {
        console.error("❌ Fetch pending users error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    setSelectedUsers([]);
    fetchPendingUsers(currentPage, searchTerm, true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchPendingUsers, currentPage, searchTerm]);

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setSelectedUsers([]);
      setIsLoading(true);
      fetchPendingUsers(newPage, searchTerm);
    },
    [searchTerm, fetchPendingUsers]
  );

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setSelectedUsers([]);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setUsers(cachedData.users);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
        } else {
          setIsLoading(true);
          fetchPendingUsers(1, "");
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(() => fetchPendingUsers(1, value), 300);
      }
    },
    [fetchPendingUsers]
  );

  const approveUser = useCallback(
    async (userId) => {
      if (!confirm("Are you sure you want to approve this user?")) return;

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
            body: JSON.stringify({ isActive: true }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to approve user");
        }

        const data = await response.json();
        if (data.success) {
          // Remove user from pending list since they're now approved
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);
          setSelectedUsers((prev) => prev.filter((id) => id !== userId));

          if (!searchTerm && currentPage === 1) {
            setCache({
              users: updatedUsers,
              currentPage,
              totalPages,
            });
          }
        }
      } catch (error) {
        console.error("Error approving user:", error);
        fetchPendingUsers(currentPage, searchTerm, true);
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
      fetchPendingUsers,
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
          setSelectedUsers((prev) => prev.filter((id) => id !== userId));

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
        fetchPendingUsers(currentPage, searchTerm, true);
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
      fetchPendingUsers,
    ]
  );

  const bulkApproveUsers = useCallback(async () => {
    if (selectedUsers.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to approve ${selectedUsers.length} users?`
      )
    )
      return;

    setBulkApproveLoading(true);
    try {
      const promises = selectedUsers.map((userId) =>
        fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
          method: "PUT",
          credentials: "include", // ✅ Fixed authentication
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: true }),
        })
      );

      await Promise.all(promises);

      // Remove approved users from the list
      const updatedUsers = users.filter(
        (user) => !selectedUsers.includes(user._id)
      );
      setUsers(updatedUsers);
      setSelectedUsers([]);

      if (!searchTerm && currentPage === 1) {
        setCache({
          users: updatedUsers,
          currentPage,
          totalPages,
        });
      }
    } catch (error) {
      console.error("Error bulk approving users:", error);
      fetchPendingUsers(currentPage, searchTerm, true);
    } finally {
      setBulkApproveLoading(false);
    }
  }, [
    selectedUsers,
    API_BASE_URL,
    users,
    searchTerm,
    currentPage,
    totalPages,
    fetchPendingUsers,
  ]);

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

  const exportPendingUsers = useCallback(() => {
    if (users.length === 0) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Role,Joined\n" +
      users
        .map(
          (user) =>
            `"${user.name}","${user.email}","${
              user.role || "User"
            }","${new Date(user.createdAt).toLocaleDateString()}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `pending_users_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [users]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  // Initialize component
  useEffect(() => {
    console.log("🚀 PendingUser initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading pending users from cache instantly");
      setUsers(cachedData.users);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setIsLoading(false);

      // Background refresh after 500ms
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchPendingUsers(1, "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh pending users data");
      setIsLoading(true);
      fetchPendingUsers();
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading Pending Users
                </h3>
                <p className="text-gray-500">
                  Fetching users awaiting approval...
                </p>
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
          <h1 className="text-2xl font-bold text-gray-900">Pending Users</h1>
          <p className="text-gray-600 mt-1">
            Review and approve user registrations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedUsers.length > 0 && (
            <button
              onClick={bulkApproveUsers}
              disabled={bulkApproveLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <UserCheck
                className={`h-4 w-4 ${
                  bulkApproveLoading ? "animate-spin" : ""
                }`}
              />
              <span>
                {bulkApproveLoading
                  ? "Approving..."
                  : `Approve ${selectedUsers.length} Users`}
              </span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* Pending Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                Pending Users
              </h2>
              <p className="text-sm text-gray-600">
                {users.length} users awaiting approval
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pending users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-orange-50/50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">
                        No pending users found
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "All users have been processed"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-orange-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
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
                          onClick={() => approveUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                          title="Approve User"
                        >
                          {actionLoading === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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
          <div className="bg-orange-50/30 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  Pending User Details
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
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
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
                    <div className="bg-orange-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <div className="w-2 h-2 rounded-full mr-2 bg-orange-500"></div>
                          Pending
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
                  </div>

                  {/* Quick Actions in Modal */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        approveUser(selectedUser._id);
                        setIsModalOpen(false);
                      }}
                      disabled={actionLoading === selectedUser._id}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 disabled:cursor-not-allowed"
                    >
                      {actionLoading === selectedUser._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <UserCheck className="h-4 w-4 mr-2" />
                      )}
                      Approve
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

export default PendingUser;
