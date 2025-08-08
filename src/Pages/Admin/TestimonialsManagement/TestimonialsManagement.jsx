// Pages/Admin/TestimonialsManagement/TestimonialsManagement.jsx
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
  MessageSquare,
  X,
  Award,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TestimonialFormModal from "./TestimonialFormModal";

// Simple cache management
const CACHE_KEY = "admin_testimonials_cache";
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

const TestimonialsManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [testimonials, setTestimonials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [stats, setStats] = useState({
    totalTestimonials: 0,
    activeTestimonials: 0,
    inactiveTestimonials: 0,
    featuredTestimonials: 0,
    averageRating: 0,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Available industries
  const AVAILABLE_INDUSTRIES = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Startup",
    "Consulting",
    "Real Estate",
    "Marketing",
    "Non-profit",
    "Government",
    "Other",
  ];

  // Fetch testimonials with smart caching
  const fetchTestimonials = useCallback(
    async (
      page = 1,
      search = "",
      status = "",
      industry = "",
      forceRefresh = false
    ) => {
      if (!forceRefresh && page === 1 && !search && !status && !industry) {
        const cachedData = getCache();
        if (cachedData) {
          setTestimonials(cachedData.testimonials);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
          setIsLoading(false);
          console.log("📦 Using cached testimonials data");

          // Background refresh
          setTimeout(
            () => fetchTestimonials(page, search, status, industry, true),
            1000
          );
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
          ...(industry && { industry }),
        });

        const response = await fetch(
          `${API_BASE_URL}/testimonials?${queryParams}`,
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
          throw new Error("Failed to fetch testimonials");
        }

        const data = await response.json();

        if (data.success) {
          const newData = {
            testimonials: data.data.testimonials,
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
            stats: data.data.stats,
          };

          setTestimonials(newData.testimonials);
          setCurrentPage(newData.currentPage);
          setTotalPages(newData.totalPages);
          setStats(newData.stats);

          // Cache only default view
          if (!search && !status && !industry && page === 1) {
            setCache(newData);
          }

          console.log("✅ Testimonials data fetched successfully");
        }
      } catch (error) {
        console.error("❌ Fetch testimonials error:", error);
        toast.error("Failed to load testimonials");
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
    setSelectedTestimonials([]);
    fetchTestimonials(
      currentPage,
      searchTerm,
      statusFilter,
      industryFilter,
      true
    ).finally(() => {
      setIsRefreshing(false);
    });
  }, [
    fetchTestimonials,
    currentPage,
    searchTerm,
    statusFilter,
    industryFilter,
  ]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setSelectedTestimonials([]);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setTestimonials(cachedData.testimonials);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
        } else {
          setIsLoading(true);
          fetchTestimonials(1, "", statusFilter, industryFilter);
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(
          () => fetchTestimonials(1, value, statusFilter, industryFilter),
          300
        );
      }
    },
    [fetchTestimonials, statusFilter, industryFilter]
  );

  // Handle status filter
  const handleStatusFilter = useCallback(
    (status) => {
      setStatusFilter(status);
      setSelectedTestimonials([]);
      setIsLoading(true);
      fetchTestimonials(1, searchTerm, status, industryFilter);
    },
    [fetchTestimonials, searchTerm, industryFilter]
  );

  // Handle industry filter
  const handleIndustryFilter = useCallback(
    (industry) => {
      setIndustryFilter(industry);
      setSelectedTestimonials([]);
      setIsLoading(true);
      fetchTestimonials(1, searchTerm, statusFilter, industry);
    },
    [fetchTestimonials, searchTerm, statusFilter]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setSelectedTestimonials([]);
      setIsLoading(true);
      fetchTestimonials(newPage, searchTerm, statusFilter, industryFilter);
    },
    [searchTerm, statusFilter, industryFilter, fetchTestimonials]
  );

  // Create testimonial
  // TestimonialsManagement.jsx - Fixed Error Handling
  // Replace the handleCreateTestimonial function in your TestimonialsManagement.jsx:

  const handleCreateTestimonial = async (testimonialData) => {
    console.log("🔄 Creating testimonial with data:", testimonialData); // Debug log

    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testimonialData),
      });

      console.log("📡 Response status:", response.status); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
          return;
        }

        // Get detailed error response
        const errorData = await response.json();
        console.error("❌ Server error response:", errorData); // Debug log

        // Handle validation errors specifically
        if (errorData.error && Array.isArray(errorData.error)) {
          const validationMessages = errorData.error
            .map((err) => err.msg || err.message)
            .join(", ");
          throw new Error(`Validation Error: ${validationMessages}`);
        } else {
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: Failed to create testimonial`
          );
        }
      }

      const data = await response.json();
      console.log("✅ Success response:", data); // Debug log

      if (data.success) {
        toast.success("Testimonial created successfully!");
        setIsCreateModalOpen(false);
        clearCache();
        fetchTestimonials(
          currentPage,
          searchTerm,
          statusFilter,
          industryFilter,
          true
        );
      } else {
        throw new Error(data.message || "Create failed");
      }
    } catch (error) {
      console.error("❌ Create testimonial error:", error);

      // More specific error messages
      if (error.message.includes("Validation Error")) {
        toast.error(error.message);
      } else if (error.message.includes("already exists")) {
        toast.error(
          "A testimonial from this client and company already exists"
        );
      } else if (error.message.includes("Failed to fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error(error.message || "Failed to create testimonial");
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Update testimonial
  const handleUpdateTestimonial = async (testimonialData) => {
    if (!selectedTestimonial) return;

    setModalLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/testimonials/${selectedTestimonial._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testimonialData),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update testimonial");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Testimonial updated successfully!");
        setIsEditModalOpen(false);
        setSelectedTestimonial(null);
        clearCache();
        fetchTestimonials(
          currentPage,
          searchTerm,
          statusFilter,
          industryFilter,
          true
        );
      }
    } catch (error) {
      console.error("Update testimonial error:", error);
      toast.error(error.message || "Failed to update testimonial");
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle testimonial status
  const toggleTestimonialStatus = useCallback(
    async (testimonialId, currentStatus) => {
      if (
        !confirm(
          `Are you sure you want to ${
            currentStatus ? "deactivate" : "activate"
          } this testimonial?`
        )
      ) {
        return;
      }

      setActionLoading(testimonialId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/testimonials/${testimonialId}/status`,
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
          throw new Error("Failed to update testimonial status");
        }

        const data = await response.json();
        if (data.success) {
          const updatedTestimonials = testimonials.map((testimonial) =>
            testimonial._id === testimonialId
              ? { ...testimonial, isActive: !currentStatus }
              : testimonial
          );
          setTestimonials(updatedTestimonials);
          setSelectedTestimonials((prev) =>
            prev.filter((id) => id !== testimonialId)
          );

          toast.success(
            `Testimonial ${
              !currentStatus ? "activated" : "deactivated"
            } successfully!`
          );
        }
      } catch (error) {
        console.error("Toggle testimonial status error:", error);
        toast.error("Failed to update testimonial status");
        fetchTestimonials(
          currentPage,
          searchTerm,
          statusFilter,
          industryFilter,
          true
        );
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      testimonials,
      currentPage,
      searchTerm,
      statusFilter,
      industryFilter,
      fetchTestimonials,
    ]
  );

  // Delete testimonial
  const deleteTestimonial = useCallback(
    async (testimonialId) => {
      if (
        !confirm(
          "Are you sure you want to permanently delete this testimonial?"
        )
      ) {
        return;
      }

      setActionLoading(testimonialId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/testimonials/${testimonialId}`,
          {
            method: "DELETE",
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
          throw new Error("Failed to delete testimonial");
        }

        const data = await response.json();
        if (data.success) {
          const updatedTestimonials = testimonials.filter(
            (testimonial) => testimonial._id !== testimonialId
          );
          setTestimonials(updatedTestimonials);
          setSelectedTestimonials((prev) =>
            prev.filter((id) => id !== testimonialId)
          );

          toast.success("Testimonial deleted successfully!");
        }
      } catch (error) {
        console.error("Delete testimonial error:", error);
        toast.error("Failed to delete testimonial");
        fetchTestimonials(
          currentPage,
          searchTerm,
          statusFilter,
          industryFilter,
          true
        );
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      testimonials,
      currentPage,
      searchTerm,
      statusFilter,
      industryFilter,
      fetchTestimonials,
    ]
  );

  // Bulk operations
  const handleBulkOperation = useCallback(
    async (action) => {
      if (selectedTestimonials.length === 0) return;

      const actionNames = {
        activate: "activate",
        deactivate: "deactivate",
        feature: "feature",
        unfeature: "unfeature",
        highlight: "highlight",
        unhighlight: "unhighlight",
        approve: "approve",
        reject: "reject",
        delete: "delete",
      };

      if (
        !confirm(
          `Are you sure you want to ${actionNames[action]} ${selectedTestimonials.length} testimonials?`
        )
      ) {
        return;
      }

      setBulkActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/testimonials/bulk`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            testimonialIds: selectedTestimonials,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error(`Failed to ${action} testimonials`);
        }

        const data = await response.json();
        if (data.success) {
          setSelectedTestimonials([]);
          clearCache();
          fetchTestimonials(
            currentPage,
            searchTerm,
            statusFilter,
            industryFilter,
            true
          );
          toast.success(`Testimonials ${actionNames[action]}d successfully!`);
        }
      } catch (error) {
        console.error("Bulk operation error:", error);
        toast.error(`Failed to ${action} testimonials`);
      } finally {
        setBulkActionLoading(false);
      }
    },
    [
      selectedTestimonials,
      API_BASE_URL,
      navigate,
      currentPage,
      searchTerm,
      statusFilter,
      industryFilter,
      fetchTestimonials,
    ]
  );

  // Handle testimonial selection
  const handleSelectTestimonial = (testimonialId) => {
    setSelectedTestimonials((prev) =>
      prev.includes(testimonialId)
        ? prev.filter((id) => id !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTestimonials.length === testimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(
        testimonials.map((testimonial) => testimonial._id)
      );
    }
  };

  // View testimonial details
  const viewTestimonialDetails = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsViewModalOpen(true);
  };

  // Edit testimonial
  const editTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsEditModalOpen(true);
  };

  // Initialize component
  useEffect(() => {
    console.log("🚀 TestimonialsManagement initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading testimonials from cache instantly");
      setTestimonials(cachedData.testimonials);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setStats(cachedData.stats);
      setIsLoading(false);

      // Background refresh
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchTestimonials(1, "", "", "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh testimonials data");
      fetchTestimonials();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchTestimonials]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading Testimonials
                </h3>
                <p className="text-gray-500">
                  Fetching testimonials management data...
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
            Testimonials Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage client testimonials displayed on the website
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Testimonial</span>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Testimonials
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalTestimonials}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.activeTestimonials}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Inactive</p>
              <p className="text-3xl font-bold text-red-900">
                {stats.inactiveTestimonials}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Featured</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.featuredTestimonials}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Rating</p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.averageRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                Client Testimonials
              </h2>
              <p className="text-sm text-gray-600">
                {testimonials.length} testimonials found
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

              {/* Industry Filter */}
              <select
                value={industryFilter}
                onChange={(e) => handleIndustryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Industries</option>
                {AVAILABLE_INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTestimonials.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  {selectedTestimonials.length} testimonials selected
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
                    onClick={() => handleBulkOperation("feature")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => handleBulkOperation("approve")}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    Approve
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
                      selectedTestimonials.length === testimonials.length &&
                      testimonials.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">
                        No testimonials found
                      </p>
                      <p className="text-sm">
                        {searchTerm || statusFilter || industryFilter
                          ? "Try adjusting your search criteria"
                          : "Create your first testimonial to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr
                    key={testimonial._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(testimonial._id)}
                        onChange={() =>
                          handleSelectTestimonial(testimonial._id)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                          <img
                            src={
                              testimonial.profileImage?.url ||
                              `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`
                            }
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`;
                            }}
                          />
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {testimonial.position} at {testimonial.company}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {testimonial.email}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            {testimonial.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Featured
                              </span>
                            )}
                            {testimonial.isHighlighted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Highlighted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {testimonial.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {testimonial.isActive ? (
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
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              testimonial.approvalStatus === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : testimonial.approvalStatus === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {testimonial.approvalStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {testimonial.industry}
                      </div>
                      {testimonial.location && (
                        <div className="text-xs text-gray-500">
                          📍 {testimonial.location}
                        </div>
                      )}
                      {testimonial.results && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          ✨ {testimonial.results}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewTestimonialDetails(testimonial)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => editTestimonial(testimonial)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                          title="Edit Testimonial"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            toggleTestimonialStatus(
                              testimonial._id,
                              testimonial.isActive
                            )
                          }
                          disabled={actionLoading === testimonial._id}
                          className={`${
                            testimonial.isActive
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          } transition-colors p-2 rounded-lg`}
                          title={
                            testimonial.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          {actionLoading === testimonial._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : testimonial.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteTestimonial(testimonial._id)}
                          disabled={actionLoading === testimonial._id}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete Testimonial"
                        >
                          {actionLoading === testimonial._id ? (
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

      {/* Testimonial Form Modal - Create */}
      <TestimonialFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTestimonial}
        isEditing={false}
        isLoading={modalLoading}
      />

      {/* Testimonial Form Modal - Edit */}
      <TestimonialFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTestimonial(null);
        }}
        onSubmit={handleUpdateTestimonial}
        initialData={selectedTestimonial}
        isEditing={true}
        isLoading={modalLoading}
      />

      {/* Testimonial View Modal */}
      {isViewModalOpen && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Testimonial Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Client Info */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        selectedTestimonial.profileImage?.url ||
                        `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`
                      }
                      alt={selectedTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`;
                      }}
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {selectedTestimonial.name}
                      </h4>
                      <p className="text-gray-600">
                        {selectedTestimonial.position}
                      </p>
                      <p className="text-blue-600 font-medium">
                        {selectedTestimonial.company}
                      </p>
                      {selectedTestimonial.email && (
                        <p className="text-sm text-gray-500">
                          📧 {selectedTestimonial.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </h5>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < selectedTestimonial.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedTestimonial.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Testimonial
                    </h5>
                    <blockquote className="text-gray-800 text-lg leading-relaxed italic border-l-4 border-blue-500 pl-4">
                      "{selectedTestimonial.testimonialText}"
                    </blockquote>
                  </div>

                  {/* Results */}
                  {selectedTestimonial.results && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Results Achieved
                      </h5>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 font-medium">
                          ✨ {selectedTestimonial.results}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Project Type */}
                  {selectedTestimonial.projectType && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Project Type
                      </h5>
                      <p className="text-gray-900">
                        {selectedTestimonial.projectType}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  {/* Status */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Status
                    </h5>
                    <div className="space-y-2">
                      {selectedTestimonial.isActive ? (
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

                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            selectedTestimonial.approvalStatus === "approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : selectedTestimonial.approvalStatus ===
                                "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {selectedTestimonial.approvalStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Company Details
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Industry
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTestimonial.industry}
                        </p>
                      </div>
                      {selectedTestimonial.location && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Location
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            📍 {selectedTestimonial.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Features
                    </h5>
                    <div className="space-y-2">
                      {selectedTestimonial.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </span>
                      )}
                      {selectedTestimonial.isHighlighted && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Highlighted
                        </span>
                      )}
                      {!selectedTestimonial.isFeatured &&
                        !selectedTestimonial.isHighlighted && (
                          <p className="text-sm text-gray-500">
                            No special features
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Metadata
                    </h5>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div>Version: v{selectedTestimonial.version}</div>
                      <div>Sort Order: #{selectedTestimonial.sortOrder}</div>
                      {selectedTestimonial.dateGiven && (
                        <div>
                          Date Given:{" "}
                          {new Date(
                            selectedTestimonial.dateGiven
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {selectedTestimonial.createdAt && (
                        <div>
                          Created:{" "}
                          {new Date(
                            selectedTestimonial.createdAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {selectedTestimonial.lastUpdatedBy && (
                        <div>
                          Last updated by:{" "}
                          {selectedTestimonial.lastUpdatedBy.name}
                        </div>
                      )}
                    </div>
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

export default TestimonialsManagement;
