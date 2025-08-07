// Pages/Admin/WhyChooseUsManagement/WhyChooseUsManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Star,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  Lightbulb,
  X, // ✅ Added missing X import
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WhyChooseUsFormModal from "./WhyChooseUsFormModal";

// Simple cache management
const CACHE_KEY = "admin_why_choose_us_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Cache save failed:", error);
  }
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > parsed.expiry;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Cache clear failed:", error);
  }
};

const WhyChooseUsManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [reasons, setReasons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    totalReasons: 0,
    activeReasons: 0,
    inactiveReasons: 0,
    highlightedReasons: 0,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch reasons with smart caching
  const fetchReasons = useCallback(
    async (page = 1, search = "", status = "", forceRefresh = false) => {
      if (!forceRefresh && page === 1 && !search && !status) {
        const cachedData = getCache();
        if (cachedData) {
          setReasons(cachedData.reasons);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
          setIsLoading(false);
          console.log("📦 Using cached reasons data");

          // Background refresh
          setTimeout(() => fetchReasons(page, search, status, true), 1000);
          return;
        }
      }

      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "15",
          ...(search && { search }),
          ...(status && { status }),
        });

        const response = await fetch(
          `${API_BASE_URL}/why-choose-us?${queryParams}`,
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
          throw new Error("Failed to fetch reasons");
        }

        const data = await response.json();

        if (data.success) {
          const newData = {
            reasons: data.data.reasons,
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
            stats: data.data.stats,
          };

          setReasons(newData.reasons);
          setCurrentPage(newData.currentPage);
          setTotalPages(newData.totalPages);
          setStats(newData.stats);

          // Cache only default view
          if (!search && !status && page === 1) {
            setCache(newData);
          }

          console.log("✅ Reasons data fetched successfully");
        }
      } catch (error) {
        console.error("❌ Fetch reasons error:", error);
        toast.error("Failed to load reasons");
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    setSelectedReasons([]);
    fetchReasons(currentPage, searchTerm, statusFilter, true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchReasons, currentPage, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setSelectedReasons([]);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setReasons(cachedData.reasons);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
        } else {
          setIsLoading(true);
          fetchReasons(1, "", statusFilter);
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(() => fetchReasons(1, value, statusFilter), 300);
      }
    },
    [fetchReasons, statusFilter]
  );

  // Handle status filter
  const handleStatusFilter = useCallback(
    (status) => {
      setStatusFilter(status);
      setSelectedReasons([]);
      setIsLoading(true);
      fetchReasons(1, searchTerm, status);
    },
    [fetchReasons, searchTerm]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setSelectedReasons([]);
      setIsLoading(true);
      fetchReasons(newPage, searchTerm, statusFilter);
    },
    [searchTerm, statusFilter, fetchReasons]
  );

  // Create reason
  const handleCreateReason = async (reasonData) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/why-choose-us`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reasonData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create reason");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Reason created successfully!");
        setIsCreateModalOpen(false);
        clearCache();
        fetchReasons(currentPage, searchTerm, statusFilter, true);
      }
    } catch (error) {
      console.error("Create reason error:", error);
      toast.error(error.message || "Failed to create reason");
    } finally {
      setModalLoading(false);
    }
  };

  // Update reason
  const handleUpdateReason = async (reasonData) => {
    if (!selectedReason) return;

    console.log("🔄 Updating reason:", {
      id: selectedReason._id,
      data: reasonData
    });

    setModalLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/why-choose-us/${selectedReason._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reasonData),
        }
      );

      console.log("📡 Update response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
          return;
        }
        
        // Get detailed error message
        const errorData = await response.json();
        console.error("❌ Update error response:", errorData);
        
        if (errorData.error && Array.isArray(errorData.error)) {
          // Validation errors
          const validationMessages = errorData.error.map(err => err.msg || err.message).join(", ");
          throw new Error(`Validation Error: ${validationMessages}`);
        } else {
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to update reason`);
        }
      }

      const data = await response.json();
      console.log("✅ Update successful:", data);
      
      if (data.success) {
        toast.success("Reason updated successfully!");
        setIsEditModalOpen(false);
        setSelectedReason(null);
        clearCache();
        fetchReasons(currentPage, searchTerm, statusFilter, true);
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update reason error:", error);
      
      // More specific error messages
      if (error.message.includes("Validation Error")) {
        toast.error(error.message);
      } else if (error.message.includes("already exists")) {
        toast.error("A reason with this title already exists");
      } else if (error.message.includes("not found")) {
        toast.error("Reason not found");
      } else {
        toast.error(error.message || "Failed to update reason");
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle reason status
  const toggleReasonStatus = useCallback(
    async (reasonId, currentStatus) => {
      if (
        !confirm(
          `Are you sure you want to ${
            currentStatus ? "deactivate" : "activate"
          } this reason?`
        )
      ) {
        return;
      }

      setActionLoading(reasonId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/why-choose-us/${reasonId}/status`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isActive: !currentStatus }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error("Failed to update reason status");
        }

        const data = await response.json();
        if (data.success) {
          const updatedReasons = reasons.map((reason) =>
            reason._id === reasonId
              ? { ...reason, isActive: !currentStatus }
              : reason
          );
          setReasons(updatedReasons);
          setSelectedReasons((prev) => prev.filter((id) => id !== reasonId));

          if (!searchTerm && !statusFilter && currentPage === 1) {
            setCache({
              reasons: updatedReasons,
              currentPage,
              totalPages,
              stats,
            });
          }

          toast.success(
            `Reason ${
              !currentStatus ? "activated" : "deactivated"
            } successfully!`
          );
        }
      } catch (error) {
        console.error("Toggle reason status error:", error);
        toast.error("Failed to update reason status");
        fetchReasons(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      reasons,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      stats,
      fetchReasons,
    ]
  );

  // Delete reason
  const deleteReason = useCallback(
    async (reasonId) => {
      if (
        !confirm("Are you sure you want to permanently delete this reason?")
      ) {
        return;
      }

      setActionLoading(reasonId);
      try {
        const response = await fetch(`${API_BASE_URL}/why-choose-us/${reasonId}`, {
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
          throw new Error("Failed to delete reason");
        }

        const data = await response.json();
        if (data.success) {
          const updatedReasons = reasons.filter(
            (reason) => reason._id !== reasonId
          );
          setReasons(updatedReasons);
          setSelectedReasons((prev) => prev.filter((id) => id !== reasonId));

          if (!searchTerm && !statusFilter && currentPage === 1) {
            setCache({
              reasons: updatedReasons,
              currentPage,
              totalPages,
              stats,
            });
          }

          toast.success("Reason deleted successfully!");
        }
      } catch (error) {
        console.error("Delete reason error:", error);
        toast.error("Failed to delete reason");
        fetchReasons(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      reasons,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      stats,
      fetchReasons,
    ]
  );

  // Bulk operations
  const handleBulkOperation = useCallback(
    async (action) => {
      if (selectedReasons.length === 0) return;

      const actionNames = {
        activate: "activate",
        deactivate: "deactivate",
        highlight: "highlight",
        unhighlight: "unhighlight",
        delete: "delete",
      };

      if (
        !confirm(
          `Are you sure you want to ${actionNames[action]} ${selectedReasons.length} reasons?`
        )
      ) {
        return;
      }

      setBulkActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/why-choose-us/bulk`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            reasonIds: selectedReasons,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error(`Failed to ${action} reasons`);
        }

        const data = await response.json();
        if (data.success) {
          setSelectedReasons([]);
          clearCache();
          fetchReasons(currentPage, searchTerm, statusFilter, true);
          toast.success(`Reasons ${actionNames[action]}d successfully!`);
        }
      } catch (error) {
        console.error("Bulk operation error:", error);
        toast.error(`Failed to ${action} reasons`);
      } finally {
        setBulkActionLoading(false);
      }
    },
    [
      selectedReasons,
      API_BASE_URL,
      navigate,
      currentPage,
      searchTerm,
      statusFilter,
      fetchReasons,
    ]
  );

  // Handle reason selection
  const handleSelectReason = (reasonId) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReasons.length === reasons.length) {
      setSelectedReasons([]);
    } else {
      setSelectedReasons(reasons.map((reason) => reason._id));
    }
  };

  // View reason details
  const viewReasonDetails = (reason) => {
    setSelectedReason(reason);
    setIsViewModalOpen(true);
  };

  // Edit reason
  const editReason = (reason) => {
    setSelectedReason(reason);
    setIsEditModalOpen(true);
  };

  // Initialize component
  useEffect(() => {
    console.log("🚀 WhyChooseUsManagement initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading reasons from cache instantly");
      setReasons(cachedData.reasons);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setStats(cachedData.stats);
      setIsLoading(false);

      // Background refresh
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchReasons(1, "", "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh reasons data");
      fetchReasons();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchReasons]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading Why Choose Us
                </h3>
                <p className="text-gray-500">
                  Fetching reasons management data...
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
          <h1 className="text-2xl font-bold text-gray-900">
            Why Choose Us Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage reasons displayed on the website
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Reason</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Reasons
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalReasons}
              </p>
            </div>
            <Lightbulb className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Active Reasons
              </p>
              <p className="text-3xl font-bold text-green-900">
                {stats.activeReasons}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">
                Inactive Reasons
              </p>
              <p className="text-3xl font-bold text-red-900">
                {stats.inactiveReasons}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Featured Reasons
              </p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.highlightedReasons}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Reasons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                Why Choose Us Reasons
              </h2>
              <p className="text-sm text-gray-600">
                {reasons.length} reasons found
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reasons..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReasons.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  {selectedReasons.length} reasons selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkOperation("activate")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkOperation("deactivate")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkOperation("highlight")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
                  >
                    Highlight
                  </button>
                  <button
                    onClick={() => handleBulkOperation("delete")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedReasons.length === reasons.length &&
                      reasons.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {reasons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No reasons found</p>
                      <p className="text-sm">
                        {searchTerm || statusFilter
                          ? "Try adjusting your search criteria"
                          : "Create your first reason to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reasons.map((reason) => (
                  <tr
                    key={reason._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason._id)}
                        onChange={() => handleSelectReason(reason._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 bg-${reason.color}-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {reason.icon?.charAt(0) || "R"}
                          </span>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {reason.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {reason.description}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            {reason.isHighlighted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Featured
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              v{reason.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reason.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {reason.stats}
                      </div>
                      <div className="text-xs text-gray-400">
                        {reason.highlight}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{reason.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewReasonDetails(reason)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => editReason(reason)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                          title="Edit Reason"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            toggleReasonStatus(reason._id, reason.isActive)
                          }
                          disabled={actionLoading === reason._id}
                          className={`${
                            reason.isActive
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          } transition-colors p-2 rounded-lg`}
                          title={reason.isActive ? "Deactivate" : "Activate"}
                        >
                          {actionLoading === reason._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : reason.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteReason(reason._id)}
                          disabled={actionLoading === reason._id}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete Reason"
                        >
                          {actionLoading === reason._id ? (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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

      {/* Reason Form Modal - Create */}
      <WhyChooseUsFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReason}
        isEditing={false}
        isLoading={modalLoading}
      />

      {/* Reason Form Modal - Edit */}
      <WhyChooseUsFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReason(null);
        }}
        onSubmit={handleUpdateReason}
        initialData={selectedReason}
        isEditing={true}
        isLoading={modalLoading}
      />

      {/* Reason View Modal */}
      {isViewModalOpen && selectedReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Reason Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Reason Preview */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 bg-${selectedReason.color}-500 rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-white text-xl font-bold">
                      {selectedReason.icon?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedReason.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedReason.description}
                    </p>
                  </div>
                </div>

                {/* Reason Info Grid */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        {selectedReason.isActive ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-4 h-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Display Order
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        #{selectedReason.sortOrder}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Icon & Color
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {selectedReason.icon} - {selectedReason.color}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Version
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        v{selectedReason.version}
                      </p>
                    </div>
                  </div>

                  {/* Highlight & Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Highlight
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {selectedReason.highlight}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Stats
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {selectedReason.stats}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  {selectedReason.lastUpdatedBy && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Last updated by{" "}
                        <span className="font-medium">
                          {selectedReason.lastUpdatedBy.name}
                        </span>
                        {selectedReason.updatedAt && (
                          <span>
                            {" "}
                            on{" "}
                            {new Date(
                              selectedReason.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyChooseUsManagement;