import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Settings,
  Save,
  RefreshCw,
  Camera,
  X,
  Globe,
  Type,
  Shield,
  User,
  Activity,
  Monitor,
  Image,
} from "lucide-react";

const CACHE_KEY = "site_settings_cache";
const CACHE_EXPIRY = 5 * 60 * 1000;

const updateBrowserTitle = (title) => {
  if (title) {
    document.title = title;
  }
};

const updateFavicon = (imageUrl) => {
  try {
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach((link) => link.remove());

    const link = document.createElement("link");

    if (imageUrl && imageUrl.trim()) {
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = imageUrl;
    } else {
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = "/vited.svg";
    }

    link.onerror = () => {
      link.href = "/vited.svg";
      link.type = "image/svg+xml";
    };

    document.head.appendChild(link);
  } catch (error) {
    console.error("Failed to update favicon:", error);
  }
};

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // Silent fail
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
    // Silent fail
  }
};

const SiteSettings = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isDeletingFavicon, setIsDeletingFavicon] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentSettings, setCurrentSettings] = useState({
    siteName: "",
    siteTitle: "",
    siteDescription: "",
    footerName: "",
    browserTitle: "",
    faviconImage: { url: "" },
    siteImage: { url: "" },
    version: 1,
    lastUpdatedBy: null,
    createdAt: "",
    updatedAt: "",
  });

  const [formData, setFormData] = useState({
    siteName: "",
    siteTitle: "",
    siteDescription: "",
    footerName: "",
    browserTitle: "",
  });

  const showMessage = useCallback((type, text) => {
    if (type === "success") {
      toast.success(text);
    } else if (type === "error") {
      toast.error(text);
    }
  }, []);

  const fetchSiteSettings = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/site-settings/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            showMessage(
              "error",
              "Too many requests. Please wait a few minutes and try again."
            );
            return;
          }

          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCache();
            navigate("/admin", { replace: true });
            return;
          }

          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${
              errorText ? ` - ${errorText}` : ""
            }`
          );
        }

        const data = await response.json();

        if (data.success) {
          const settings = data.data.settings;
          setCurrentSettings(settings);
          setFormData({
            siteName: settings.siteName || "",
            siteTitle: settings.siteTitle || "",
            siteDescription: settings.siteDescription || "",
            footerName: settings.footerName || "",
            browserTitle: settings.browserTitle || "",
          });

          setCache(settings);
        }
      } catch (error) {
        const cachedData = getCache();
        if (cachedData) {
          setCurrentSettings(cachedData);
          setFormData({
            siteName: cachedData.siteName || "",
            siteTitle: cachedData.siteTitle || "",
            siteDescription: cachedData.siteDescription || "",
            footerName: cachedData.footerName || "",
            browserTitle: cachedData.browserTitle || "",
          });
        } else {
          if (error.name === "TypeError" && error.message.includes("fetch")) {
            showMessage(
              "error",
              "Network error. Please check your connection and try again."
            );
          } else if (error.message.includes("CORS")) {
            showMessage(
              "error",
              "Server configuration error. Please contact administrator."
            );
          } else {
            showMessage(
              "error",
              `Failed to load site settings: ${error.message}`
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, navigate, showMessage]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    fetchSiteSettings(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchSiteSettings]);

  const handleUpdateSettings = useCallback(async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/site-settings/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 429) {
          showMessage(
            "error",
            "Too many requests. Please wait a few minutes and try again."
          );
          return;
        }

        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${
            errorText ? ` - ${errorText}` : ""
          }`
        );
      }

      const data = await response.json();

      if (data.success) {
        const updatedSettings = data.data.settings;
        setCurrentSettings(updatedSettings);
        setFormData({
          siteName: updatedSettings.siteName || "",
          siteTitle: updatedSettings.siteTitle || "",
          siteDescription: updatedSettings.siteDescription || "",
          footerName: updatedSettings.footerName || "",
          browserTitle: updatedSettings.browserTitle || "",
        });
        clearCache();
        setCache(updatedSettings);

        updateBrowserTitle(
          updatedSettings.browserTitle || updatedSettings.siteName
        );

        showMessage("success", "Site settings updated successfully");
      } else {
        showMessage("error", data.message || "Update failed");
      }
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showMessage(
          "error",
          "Network error. Please check your connection and try again."
        );
      } else if (error.message.includes("CORS")) {
        showMessage(
          "error",
          "Server configuration error. Please contact administrator."
        );
      } else {
        showMessage("error", `Failed to update settings: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [API_BASE_URL, navigate, formData, showMessage]);

  const handleFaviconUpload = useCallback(
    async (file) => {
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showMessage("error", "Favicon size must be less than 5MB");
        return;
      }

      setIsUploadingFavicon(true);

      try {
        const formDataFavicon = new FormData();
        formDataFavicon.append("faviconImage", file);

        const response = await fetch(`${API_BASE_URL}/site-settings/favicon`, {
          method: "POST",
          credentials: "include",
          body: formDataFavicon,
        });

        if (!response.ok) {
          if (response.status === 429) {
            showMessage(
              "error",
              "Too many requests. Please wait a few minutes and try again."
            );
            return;
          }

          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCache();
            navigate("/admin", { replace: true });
            return;
          }

          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${
              errorText ? ` - ${errorText}` : ""
            }`
          );
        }

        const data = await response.json();

        if (data.success) {
          const updatedSettings = data.data.settings;
          setCurrentSettings(updatedSettings);
          clearCache();
          setCache(updatedSettings);

          updateFavicon(updatedSettings.faviconImage?.url);

          showMessage("success", "Favicon updated successfully");
        } else {
          showMessage("error", data.message || "Favicon upload failed");
        }
      } catch (error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          showMessage(
            "error",
            "Network error. Please check your connection and try again."
          );
        } else if (error.message.includes("CORS")) {
          showMessage(
            "error",
            "Server configuration error. Please contact administrator."
          );
        } else {
          showMessage("error", `Failed to upload favicon: ${error.message}`);
        }
      } finally {
        setIsUploadingFavicon(false);
      }
    },
    [API_BASE_URL, navigate, showMessage]
  );

  const handleDeleteFavicon = useCallback(async () => {
    if (!confirm("Are you sure you want to delete the favicon?")) {
      return;
    }

    setIsDeletingFavicon(true);

    try {
      const response = await fetch(`${API_BASE_URL}/site-settings/favicon`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          showMessage(
            "error",
            "Too many requests. Please wait a few minutes and try again."
          );
          return;
        }

        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${
            errorText ? ` - ${errorText}` : ""
          }`
        );
      }

      const data = await response.json();

      if (data.success) {
        const updatedSettings = data.data.settings;
        setCurrentSettings(updatedSettings);
        clearCache();
        setCache(updatedSettings);

        updateFavicon("/vited.svg");

        showMessage("success", "Favicon deleted successfully");
      } else {
        showMessage("error", data.message || "Favicon deletion failed");
      }
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showMessage(
          "error",
          "Network error. Please check your connection and try again."
        );
      } else if (error.message.includes("CORS")) {
        showMessage(
          "error",
          "Server configuration error. Please contact administrator."
        );
      } else {
        showMessage("error", `Failed to delete favicon: ${error.message}`);
      }
    } finally {
      setIsDeletingFavicon(false);
    }
  }, [API_BASE_URL, navigate, showMessage]);

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        showMessage("error", "Image size must be less than 10MB");
        return;
      }

      setIsUploadingImage(true);

      try {
        const formDataImage = new FormData();
        formDataImage.append("siteImage", file);

        const response = await fetch(`${API_BASE_URL}/site-settings/image`, {
          method: "POST",
          credentials: "include",
          body: formDataImage,
        });

        if (!response.ok) {
          if (response.status === 429) {
            showMessage(
              "error",
              "Too many requests. Please wait a few minutes and try again."
            );
            return;
          }

          if (response.status === 401) {
            localStorage.removeItem("adminData");
            localStorage.removeItem("adminType");
            clearCache();
            navigate("/admin", { replace: true });
            return;
          }

          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${
              errorText ? ` - ${errorText}` : ""
            }`
          );
        }

        const data = await response.json();

        if (data.success) {
          const updatedSettings = data.data.settings;
          setCurrentSettings(updatedSettings);
          clearCache();
          setCache(updatedSettings);
          showMessage("success", "Site image updated successfully");
        } else {
          showMessage("error", data.message || "Image upload failed");
        }
      } catch (error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          showMessage(
            "error",
            "Network error. Please check your connection and try again."
          );
        } else if (error.message.includes("CORS")) {
          showMessage(
            "error",
            "Server configuration error. Please contact administrator."
          );
        } else {
          showMessage("error", `Failed to upload image: ${error.message}`);
        }
      } finally {
        setIsUploadingImage(false);
      }
    },
    [API_BASE_URL, navigate, showMessage]
  );

  const handleDeleteImage = useCallback(async () => {
    if (!confirm("Are you sure you want to delete the site image?")) {
      return;
    }

    setIsDeletingImage(true);

    try {
      const response = await fetch(`${API_BASE_URL}/site-settings/image`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          showMessage(
            "error",
            "Too many requests. Please wait a few minutes and try again."
          );
          return;
        }

        if (response.status === 401) {
          localStorage.removeItem("adminData");
          localStorage.removeItem("adminType");
          clearCache();
          navigate("/admin", { replace: true });
          return;
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${
            errorText ? ` - ${errorText}` : ""
          }`
        );
      }

      const data = await response.json();

      if (data.success) {
        const updatedSettings = data.data.settings;
        setCurrentSettings(updatedSettings);
        clearCache();
        setCache(updatedSettings);
        showMessage("success", "Site image deleted successfully");
      } else {
        showMessage("error", data.message || "Image deletion failed");
      }
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showMessage(
          "error",
          "Network error. Please check your connection and try again."
        );
      } else if (error.message.includes("CORS")) {
        showMessage(
          "error",
          "Server configuration error. Please contact administrator."
        );
      } else {
        showMessage("error", `Failed to delete image: ${error.message}`);
      }
    } finally {
      setIsDeletingImage(false);
    }
  }, [API_BASE_URL, navigate, showMessage]);

  useEffect(() => {
    const cachedData = getCache();

    if (cachedData) {
      setCurrentSettings(cachedData);
      setFormData({
        siteName: cachedData.siteName || "",
        siteTitle: cachedData.siteTitle || "",
        siteDescription: cachedData.siteDescription || "",
        footerName: cachedData.footerName || "",
        browserTitle: cachedData.browserTitle || "",
      });
      setIsLoading(false);

      const backgroundRefresh = setTimeout(() => {
        fetchSiteSettings(true);
      }, 500);

      return () => clearTimeout(backgroundRefresh);
    } else {
      fetchSiteSettings();
    }

    const cleanupTimeout = setTimeout(() => {
      clearCache();
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [fetchSiteSettings]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "browserTitle") {
      updateBrowserTitle(value || currentSettings.siteName);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-32 sm:w-48 mx-auto sm:mx-0"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-24 sm:w-32 mx-auto sm:mx-0"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="h-48 sm:h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
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

      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-gray-50">
              {currentSettings.siteImage?.url ? (
                <img
                  src={currentSettings.siteImage.url}
                  alt="Site"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <Globe className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-600" />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1 -right-1 flex space-x-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                  {isUploadingImage ? (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
              </label>

              {currentSettings.siteImage?.url && (
                <button
                  onClick={handleDeleteImage}
                  disabled={isDeletingImage}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  {isDeletingImage ? (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {currentSettings.siteName || "Site Settings"}
              </h1>
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {currentSettings.siteTitle || "Manage your website settings"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <Shield className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" />
                Version {currentSettings.version}
              </span>
              {currentSettings.lastUpdatedBy && (
                <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <User className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" />
                  By {currentSettings.lastUpdatedBy.name}
                </span>
              )}
              <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Activity className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" />
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
            <Type className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mr-2" />
            Website Configuration
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your website's essential details and browser settings
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Monitor className="h-4 w-4 text-blue-600 mr-2" />
              Browser Tab Title
            </label>
            <input
              type="text"
              value={formData.browserTitle}
              onChange={(e) =>
                handleInputChange("browserTitle", e.target.value)
              }
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              placeholder="Enter browser tab title (e.g., My Awesome Website)"
              maxLength={100}
            />
          </div>

          {/* 🔥 NEW: Favicon Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Image className="h-4 w-4 text-purple-600 mr-2" />
              Website Favicon
            </label>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Favicon Preview */}
              <div className="relative">
                <div className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden bg-white">
                  {currentSettings.faviconImage?.url ? (
                    <img
                      src={currentSettings.faviconImage.url}
                      alt="Favicon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                      <Image className="h-6 w-6 text-purple-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon Upload Controls */}
              <div className="flex-1">
                <div className="flex space-x-2 mb-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFaviconUpload(e.target.files[0])}
                      className="hidden"
                      disabled={isUploadingFavicon}
                    />
                    <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-50">
                      {isUploadingFavicon ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <span>
                        {isUploadingFavicon ? "Uploading..." : "Upload Favicon"}
                      </span>
                    </div>
                  </label>

                  {currentSettings.faviconImage?.url && (
                    <button
                      onClick={handleDeleteFavicon}
                      disabled={isDeletingFavicon}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isDeletingFavicon ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span>
                        {isDeletingFavicon ? "Deleting..." : "Remove"}
                      </span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: 32x32px or 16x16px ICO/PNG format, Max size: 5MB
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  💡 This will appear as your website icon in browser tabs and
                  bookmarks
                </p>
              </div>
            </div>
          </div>

          {/* Existing Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => handleInputChange("siteName", e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base"
              placeholder="Enter your site name"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.siteName?.length || 0}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Title
            </label>
            <input
              type="text"
              value={formData.siteTitle}
              onChange={(e) => handleInputChange("siteTitle", e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base"
              placeholder="Enter your site title"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.siteTitle?.length || 0}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              value={formData.siteDescription}
              onChange={(e) =>
                handleInputChange("siteDescription", e.target.value)
              }
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-sm sm:text-base"
              placeholder="Describe your website..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.siteDescription?.length || 0}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Name
            </label>
            <input
              type="text"
              value={formData.footerName}
              onChange={(e) => handleInputChange("footerName", e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base"
              placeholder="Enter footer text (e.g., © 2024 Your Company)"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.footerName?.length || 0}/100 characters
            </p>
          </div>

          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
          >
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
