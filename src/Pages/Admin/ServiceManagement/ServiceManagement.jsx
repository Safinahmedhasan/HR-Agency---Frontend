// Pages/Admin/ServiceManagement/ServiceManagement.jsx - FIXED VERSION
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceFormModal from "../../../components/Admin/ServiceFormModal/ServiceFormModal";

// Color schemes
const COLOR_SCHEMES = [
  {
    name: "Blue",
    bgGradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-200",
    hoverShadow: "hover:shadow-blue-200/50",
    accent: "text-blue-600",
  },
  {
    name: "Green",
    bgGradient: "from-green-50 to-green-100",
    iconBg: "bg-green-500",
    borderColor: "border-green-200",
    hoverShadow: "hover:shadow-green-200/50",
    accent: "text-green-600",
  },
  {
    name: "Purple",
    bgGradient: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-500",
    borderColor: "border-purple-200",
    hoverShadow: "hover:shadow-purple-200/50",
    accent: "text-purple-600",
  },
  {
    name: "Orange",
    bgGradient: "from-orange-50 to-orange-100",
    iconBg: "bg-orange-500",
    borderColor: "border-orange-200",
    hoverShadow: "hover:shadow-orange-200/50",
    accent: "text-orange-600",
  },
  {
    name: "Red",
    bgGradient: "from-red-50 to-red-100",
    iconBg: "bg-red-500",
    borderColor: "border-red-200",
    hoverShadow: "hover:shadow-red-200/50",
    accent: "text-red-600",
  },
  {
    name: "Indigo",
    bgGradient: "from-indigo-50 to-indigo-100",
    iconBg: "bg-indigo-500",
    borderColor: "border-indigo-200",
    hoverShadow: "hover:shadow-indigo-200/50",
    accent: "text-indigo-600",
  },
];

// Simple cache management
const CACHE_KEY = "admin_services_cache";
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

const ServiceManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  // State management
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    highlightedServices: 0,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch services with smart caching
  const fetchServices = useCallback(
    async (page = 1, search = "", status = "", forceRefresh = false) => {
      if (!forceRefresh && page === 1 && !search && !status) {
        const cachedData = getCache();
        if (cachedData) {
          setServices(cachedData.services);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
          setIsLoading(false);
          console.log("📦 Using cached services data");

          // Background refresh
          setTimeout(() => fetchServices(page, search, status, true), 1000);
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
          `${API_BASE_URL}/services?${queryParams}`,
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
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();

        if (data.success) {
          const newData = {
            services: data.data.services,
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
            stats: data.data.stats,
          };

          setServices(newData.services);
          setCurrentPage(newData.currentPage);
          setTotalPages(newData.totalPages);
          setStats(newData.stats);

          // Cache only default view
          if (!search && !status && page === 1) {
            setCache(newData);
          }

          console.log("✅ Services data fetched successfully");
        }
      } catch (error) {
        console.error("❌ Fetch services error:", error);
        toast.error("Failed to load services");
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
    setSelectedServices([]);
    fetchServices(currentPage, searchTerm, statusFilter, true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchServices, currentPage, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setSelectedServices([]);

      if (value.length === 0) {
        const cachedData = getCache();
        if (cachedData) {
          setServices(cachedData.services);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setStats(cachedData.stats);
        } else {
          setIsLoading(true);
          fetchServices(1, "", statusFilter);
        }
      } else if (value.length >= 2) {
        setIsLoading(true);
        setTimeout(() => fetchServices(1, value, statusFilter), 300);
      }
    },
    [fetchServices, statusFilter]
  );

  // Handle status filter
  const handleStatusFilter = useCallback(
    (status) => {
      setStatusFilter(status);
      setSelectedServices([]);
      setIsLoading(true);
      fetchServices(1, searchTerm, status);
    },
    [fetchServices, searchTerm]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      setSelectedServices([]);
      setIsLoading(true);
      fetchServices(newPage, searchTerm, statusFilter);
    },
    [searchTerm, statusFilter, fetchServices]
  );

  // Create service
  const handleCreateService = async (serviceData) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          navigate("/admin", { replace: true });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create service");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Service created successfully!");
        setIsCreateModalOpen(false);
        clearCache();
        fetchServices(currentPage, searchTerm, statusFilter, true);
      }
    } catch (error) {
      console.error("Create service error:", error);
      toast.error(error.message || "Failed to create service");
    } finally {
      setModalLoading(false);
    }
  };

  // Update service
  const handleUpdateService = async (serviceData) => {
    if (!selectedService) return;

    setModalLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/services/${selectedService._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceData),
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
        throw new Error(errorData.message || "Failed to update service");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Service updated successfully!");
        setIsEditModalOpen(false);
        setSelectedService(null);
        clearCache();
        fetchServices(currentPage, searchTerm, statusFilter, true);
      }
    } catch (error) {
      console.error("Update service error:", error);
      toast.error(error.message || "Failed to update service");
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle service status
  const toggleServiceStatus = useCallback(
    async (serviceId, currentStatus) => {
      if (
        !confirm(
          `Are you sure you want to ${
            currentStatus ? "deactivate" : "activate"
          } this service?`
        )
      ) {
        return;
      }

      setActionLoading(serviceId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/services/${serviceId}/status`,
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
          throw new Error("Failed to update service status");
        }

        const data = await response.json();
        if (data.success) {
          const updatedServices = services.map((service) =>
            service._id === serviceId
              ? { ...service, isActive: !currentStatus }
              : service
          );
          setServices(updatedServices);
          setSelectedServices((prev) => prev.filter((id) => id !== serviceId));

          if (!searchTerm && !statusFilter && currentPage === 1) {
            setCache({
              services: updatedServices,
              currentPage,
              totalPages,
              stats,
            });
          }

          toast.success(
            `Service ${
              !currentStatus ? "activated" : "deactivated"
            } successfully!`
          );
        }
      } catch (error) {
        console.error("Toggle service status error:", error);
        toast.error("Failed to update service status");
        fetchServices(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      services,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      stats,
      fetchServices,
    ]
  );

  // Delete service
  const deleteService = useCallback(
    async (serviceId) => {
      if (
        !confirm("Are you sure you want to permanently delete this service?")
      ) {
        return;
      }

      setActionLoading(serviceId);
      try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
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
          throw new Error("Failed to delete service");
        }

        const data = await response.json();
        if (data.success) {
          const updatedServices = services.filter(
            (service) => service._id !== serviceId
          );
          setServices(updatedServices);
          setSelectedServices((prev) => prev.filter((id) => id !== serviceId));

          if (!searchTerm && !statusFilter && currentPage === 1) {
            setCache({
              services: updatedServices,
              currentPage,
              totalPages,
              stats,
            });
          }

          toast.success("Service deleted successfully!");
        }
      } catch (error) {
        console.error("Delete service error:", error);
        toast.error("Failed to delete service");
        fetchServices(currentPage, searchTerm, statusFilter, true);
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_BASE_URL,
      navigate,
      services,
      searchTerm,
      statusFilter,
      currentPage,
      totalPages,
      stats,
      fetchServices,
    ]
  );

  // Bulk operations
  const handleBulkOperation = useCallback(
    async (action) => {
      if (selectedServices.length === 0) return;

      const actionNames = {
        activate: "activate",
        deactivate: "deactivate",
        highlight: "highlight",
        unhighlight: "unhighlight",
        delete: "delete",
      };

      if (
        !confirm(
          `Are you sure you want to ${actionNames[action]} ${selectedServices.length} services?`
        )
      ) {
        return;
      }

      setBulkActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/services/bulk`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            serviceIds: selectedServices,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            navigate("/admin", { replace: true });
            return;
          }
          throw new Error(`Failed to ${action} services`);
        }

        const data = await response.json();
        if (data.success) {
          setSelectedServices([]);
          clearCache();
          fetchServices(currentPage, searchTerm, statusFilter, true);
          toast.success(`Services ${actionNames[action]}d successfully!`);
        }
      } catch (error) {
        console.error("Bulk operation error:", error);
        toast.error(`Failed to ${action} services`);
      } finally {
        setBulkActionLoading(false);
      }
    },
    [
      selectedServices,
      API_BASE_URL,
      navigate,
      currentPage,
      searchTerm,
      statusFilter,
      fetchServices,
    ]
  );

  // Handle service selection
  const handleSelectService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map((service) => service._id));
    }
  };

  // View service details
  const viewServiceDetails = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  // Edit service
  const editService = (service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  // Initialize component
  useEffect(() => {
    console.log("🚀 ServiceManagement initializing...");
    const cachedData = getCache();

    if (cachedData) {
      console.log("⚡ Loading services from cache instantly");
      setServices(cachedData.services);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setStats(cachedData.stats);
      setIsLoading(false);

      // Background refresh
      const backgroundRefresh = setTimeout(() => {
        console.log("🔄 Background refresh starting...");
        fetchServices(1, "", "", true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      console.log("📡 No cache, fetching fresh services data");
      fetchServices();
    }

    // Cleanup cache after 30 minutes
    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchServices]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading HR Services
                </h3>
                <p className="text-gray-500">
                  Fetching services management data...
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
            HR Services Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your HR services displayed on the website
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
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
                Total Services
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalServices}
              </p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Active Services
              </p>
              <p className="text-3xl font-bold text-green-900">
                {stats.activeServices}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">
                Inactive Services
              </p>
              <p className="text-3xl font-bold text-red-900">
                {stats.inactiveServices}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Featured Services
              </p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.highlightedServices}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                HR Services
              </h2>
              <p className="text-sm text-gray-600">
                {services.length} services found
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
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  {selectedServices.length} services selected
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
                      selectedServices.length === services.length &&
                      services.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Features
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
              {services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No services found</p>
                      <p className="text-sm">
                        {searchTerm || statusFilter
                          ? "Try adjusting your search criteria"
                          : "Create your first HR service to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleSelectService(service._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 ${service.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {service.icon?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {service.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {service.description}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            {service.isHighlighted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Featured
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              v{service.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.isActive ? (
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
                        {service.features?.length || 0} features
                      </div>
                      <div className="text-xs text-gray-400">
                        {service.features?.slice(0, 2).join(", ")}
                        {service.features?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{service.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewServiceDetails(service)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => editService(service)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                          title="Edit Service"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            toggleServiceStatus(service._id, service.isActive)
                          }
                          disabled={actionLoading === service._id}
                          className={`${
                            service.isActive
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          } transition-colors p-2 rounded-lg`}
                          title={service.isActive ? "Deactivate" : "Activate"}
                        >
                          {actionLoading === service._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : service.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteService(service._id)}
                          disabled={actionLoading === service._id}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete Service"
                        >
                          {actionLoading === service._id ? (
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

      {/* Service Form Modal - Create */}
      <ServiceFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateService}
        isEditing={false}
        isLoading={modalLoading}
      />

      {/* Service Form Modal - Edit */}
      <ServiceFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedService(null);
        }}
        onSubmit={handleUpdateService}
        initialData={selectedService}
        isEditing={true}
        isLoading={modalLoading}
      />

      {/* Service View Modal */}
      {isViewModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Service Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
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
                {/* Service Preview */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 ${selectedService.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-white text-xl font-bold">
                      {selectedService.icon?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedService.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedService.description}
                    </p>
                  </div>
                </div>

                {/* Service Info Grid */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        {selectedService.isActive ? (
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
                        #{selectedService.sortOrder}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Icon
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {selectedService.icon}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Version
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        v{selectedService.version}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Features
                    </span>
                    <ul className="mt-3 space-y-2">
                      {selectedService.features?.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata */}
                  {selectedService.lastUpdatedBy && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Last updated by{" "}
                        <span className="font-medium">
                          {selectedService.lastUpdatedBy.name}
                        </span>
                        {selectedService.updatedAt && (
                          <span>
                            {" "}
                            on{" "}
                            {new Date(
                              selectedService.updatedAt
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

export default ServiceManagement;
