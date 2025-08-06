// utils/cacheManager.js - Optimized for React Project

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_EXPIRY: 5 * 60 * 1000, // 5 minutes
  CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutes
  MAX_CACHE_SIZE: 50, // Maximum number of cache entries
  COMPRESSION_THRESHOLD: 1024, // Compress data larger than 1KB
};

// Cache keys registry for better organization
export const CACHE_KEYS = {
  // User Management
  USER_MANAGEMENT: "user_management_cache",
  USER_STATS: "user_stats_cache",
  USER_LIST: "user_list_cache",
  USER_PROFILE: "user_profile_cache",

  // Admin
  ADMIN_DASHBOARD: "admin_dashboard_cache",
  ADMIN_PROFILE: "admin_profile_cache",
  ADMIN_STATS: "admin_stats_cache",

  // Site Settings
  SITE_SETTINGS: "site_settings_cache",
  SITE_SETTINGS_HISTORY: "site_settings_history_cache",

  // General
  API_RESPONSES: "api_responses_cache",
  UI_STATE: "ui_state_cache",
  NAVIGATION_DATA: "navigation_data_cache",
};

/**
 * Encryption utilities for secure cache storage
 */
const CacheEncryption = {
  encrypt: (data) => {
    try {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (error) {
      console.warn("Cache encryption failed:", error);
      return null;
    }
  },

  decrypt: (encrypted) => {
    try {
      return JSON.parse(decodeURIComponent(atob(encrypted)));
    } catch (error) {
      console.warn("Cache decryption failed:", error);
      return null;
    }
  },
};

/**
 * Compression utilities for large data
 */
const CacheCompression = {
  compress: (data) => {
    try {
      const jsonString = JSON.stringify(data);
      if (jsonString.length > CACHE_CONFIG.COMPRESSION_THRESHOLD) {
        // Simple compression using repetition removal
        return {
          compressed: true,
          data: jsonString.replace(/(\{[^}]+\})/g, (match, p1) => {
            return p1.length > 50 ? btoa(p1) : p1;
          }),
        };
      }
      return { compressed: false, data: jsonString };
    } catch (error) {
      console.warn("Cache compression failed:", error);
      return { compressed: false, data: JSON.stringify(data) };
    }
  },

  decompress: (compressedData) => {
    try {
      if (compressedData.compressed) {
        const decompressed = compressedData.data.replace(
          /[A-Za-z0-9+/=]+/g,
          (match) => {
            try {
              const decoded = atob(match);
              return decoded.startsWith("{") ? decoded : match;
            } catch {
              return match;
            }
          }
        );
        return JSON.parse(decompressed);
      }
      return JSON.parse(compressedData.data);
    } catch (error) {
      console.warn("Cache decompression failed:", error);
      return null;
    }
  },
};

/**
 * Core Cache Manager Class
 */
class CacheManager {
  constructor() {
    this.isClient = typeof window !== "undefined";
    this.memoryCache = new Map();
    this.initializeCleanup();
  }

  /**
   * Initialize automatic cache cleanup
   */
  initializeCleanup() {
    if (this.isClient) {
      // Clean expired cache entries periodically
      setInterval(() => {
        this.cleanupExpired();
      }, CACHE_CONFIG.CLEANUP_INTERVAL);

      // Clean up memory cache when page is about to unload
      window.addEventListener("beforeunload", () => {
        this.clearMemoryCache();
      });
    }
  }

  /**
   * Generate cache entry with metadata
   */
  createCacheEntry(data, expiry = CACHE_CONFIG.DEFAULT_EXPIRY) {
    return {
      data,
      timestamp: Date.now(),
      expiry,
      expiresAt: Date.now() + expiry,
      version: "1.0",
      size: JSON.stringify(data).length,
    };
  }

  /**
   * Check if cache entry is valid
   */
  isValidEntry(entry) {
    if (!entry || !entry.timestamp || !entry.expiresAt) {
      return false;
    }
    return Date.now() < entry.expiresAt;
  }

  /**
   * Set cache data with various storage options
   */
  set(key, data, options = {}) {
    const {
      expiry = CACHE_CONFIG.DEFAULT_EXPIRY,
      storage = "localStorage", // 'localStorage', 'sessionStorage', 'memory'
      encrypt = true,
      compress = true,
    } = options;

    try {
      const entry = this.createCacheEntry(data, expiry);

      // Compress data if needed
      const processedData = compress ? CacheCompression.compress(entry) : entry;

      // Encrypt data if needed
      const finalData = encrypt
        ? CacheEncryption.encrypt(processedData)
        : processedData;

      // Store based on storage type
      switch (storage) {
        case "localStorage":
          if (this.isClient && window.localStorage) {
            localStorage.setItem(
              key,
              encrypt ? finalData : JSON.stringify(finalData)
            );
          }
          break;
        case "sessionStorage":
          if (this.isClient && window.sessionStorage) {
            sessionStorage.setItem(
              key,
              encrypt ? finalData : JSON.stringify(finalData)
            );
          }
          break;
        case "memory":
          this.memoryCache.set(key, entry);
          break;
        default:
          throw new Error(`Unsupported storage type: ${storage}`);
      }

      // Also store in memory for faster access
      if (storage !== "memory") {
        this.memoryCache.set(`${key}_meta`, {
          storage,
          encrypted: encrypt,
          compressed: compress,
          timestamp: entry.timestamp,
        });
      }

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Get cache data with automatic validation
   */
  get(key, options = {}) {
    const {
      storage = "localStorage",
      decrypt = true,
      decompress = true,
      fallbackToMemory = true,
    } = options;

    try {
      let rawData = null;
      let entry = null;

      // Try to get from memory first for performance
      if (fallbackToMemory && this.memoryCache.has(key)) {
        entry = this.memoryCache.get(key);
        if (this.isValidEntry(entry)) {
          return entry.data;
        } else {
          this.memoryCache.delete(key);
        }
      }

      // Get from specified storage
      switch (storage) {
        case "localStorage":
          if (this.isClient && window.localStorage) {
            rawData = localStorage.getItem(key);
          }
          break;
        case "sessionStorage":
          if (this.isClient && window.sessionStorage) {
            rawData = sessionStorage.getItem(key);
          }
          break;
        case "memory":
          entry = this.memoryCache.get(key);
          break;
        default:
          throw new Error(`Unsupported storage type: ${storage}`);
      }

      if (!rawData && !entry) {
        return null;
      }

      // Process the data
      if (storage !== "memory") {
        // Decrypt data
        const decryptedData = decrypt
          ? CacheEncryption.decrypt(rawData)
          : JSON.parse(rawData);
        if (!decryptedData) return null;

        // Decompress data
        entry = decompress
          ? CacheCompression.decompress(decryptedData)
          : decryptedData;
      }

      // Validate entry
      if (!this.isValidEntry(entry)) {
        this.remove(key, { storage });
        return null;
      }

      // Update memory cache for faster future access
      if (storage !== "memory") {
        this.memoryCache.set(key, entry);
      }

      return entry.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Remove cache entry
   */
  remove(key, options = {}) {
    const { storage = "localStorage" } = options;

    try {
      // Remove from specified storage
      switch (storage) {
        case "localStorage":
          if (this.isClient && window.localStorage) {
            localStorage.removeItem(key);
          }
          break;
        case "sessionStorage":
          if (this.isClient && window.sessionStorage) {
            sessionStorage.removeItem(key);
          }
          break;
        case "memory":
          this.memoryCache.delete(key);
          break;
      }

      // Also remove from memory cache
      this.memoryCache.delete(key);
      this.memoryCache.delete(`${key}_meta`);

      return true;
    } catch (error) {
      console.error("Cache remove error:", error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(options = {}) {
    const { storage = "all" } = options;

    try {
      if (storage === "all" || storage === "localStorage") {
        if (this.isClient && window.localStorage) {
          // Clear only our cache keys
          Object.values(CACHE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
          });
        }
      }

      if (storage === "all" || storage === "sessionStorage") {
        if (this.isClient && window.sessionStorage) {
          Object.values(CACHE_KEYS).forEach((key) => {
            sessionStorage.removeItem(key);
          });
        }
      }

      if (storage === "all" || storage === "memory") {
        this.memoryCache.clear();
      }

      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      memoryEntries: this.memoryCache.size,
      localStorageEntries: 0,
      sessionStorageEntries: 0,
      totalSize: 0,
      expiredEntries: 0,
    };

    if (this.isClient) {
      // Count localStorage entries
      try {
        Object.values(CACHE_KEYS).forEach((key) => {
          if (window.localStorage && localStorage.getItem(key)) {
            stats.localStorageEntries++;
            stats.totalSize += localStorage.getItem(key).length;
          }
        });

        // Count sessionStorage entries
        Object.values(CACHE_KEYS).forEach((key) => {
          if (window.sessionStorage && sessionStorage.getItem(key)) {
            stats.sessionStorageEntries++;
            stats.totalSize += sessionStorage.getItem(key).length;
          }
        });
      } catch (error) {
        console.warn("Error calculating cache stats:", error);
      }
    }

    // Count expired entries in memory
    this.memoryCache.forEach((entry) => {
      if (!this.isValidEntry(entry)) {
        stats.expiredEntries++;
      }
    });

    return stats;
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpired() {
    try {
      // Clean memory cache
      const expiredKeys = [];
      this.memoryCache.forEach((entry, key) => {
        if (!this.isValidEntry(entry)) {
          expiredKeys.push(key);
        }
      });
      expiredKeys.forEach((key) => this.memoryCache.delete(key));

      // Clean localStorage
      if (this.isClient && window.localStorage) {
        Object.values(CACHE_KEYS).forEach((key) => {
          const data = this.get(key, { storage: "localStorage" });
          if (!data) {
            localStorage.removeItem(key);
          }
        });
      }

      console.log(
        `Cache cleanup: Removed ${expiredKeys.length} expired entries`
      );
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  /**
   * Clear memory cache
   */
  clearMemoryCache() {
    this.memoryCache.clear();
  }

  /**
   * Check if cache key exists and is valid
   */
  has(key, options = {}) {
    const data = this.get(key, options);
    return data !== null;
  }

  /**
   * Update cache data if it exists
   */
  update(key, updateFn, options = {}) {
    const currentData = this.get(key, options);
    if (currentData !== null) {
      const updatedData = updateFn(currentData);
      return this.set(key, updatedData, options);
    }
    return false;
  }

  /**
   * Get or set cache data (fetch if not exists)
   */
  async getOrSet(key, fetchFn, options = {}) {
    const cachedData = this.get(key, options);
    if (cachedData !== null) {
      return cachedData;
    }

    try {
      const freshData = await fetchFn();
      this.set(key, freshData, options);
      return freshData;
    } catch (error) {
      console.error("Cache getOrSet error:", error);
      return null;
    }
  }

  /**
   * Batch operations for multiple cache entries
   */
  batchSet(entries, options = {}) {
    const results = [];
    entries.forEach(({ key, data, individualOptions = {} }) => {
      const mergedOptions = { ...options, ...individualOptions };
      results.push(this.set(key, data, mergedOptions));
    });
    return results;
  }

  /**
   * Batch get multiple cache entries
   */
  batchGet(keys, options = {}) {
    const results = {};
    keys.forEach((key) => {
      results[key] = this.get(key, options);
    });
    return results;
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize(storage = "localStorage") {
    let totalSize = 0;

    try {
      if (storage === "localStorage" && this.isClient && window.localStorage) {
        Object.values(CACHE_KEYS).forEach((key) => {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += new Blob([item]).size;
          }
        });
      } else if (
        storage === "sessionStorage" &&
        this.isClient &&
        window.sessionStorage
      ) {
        Object.values(CACHE_KEYS).forEach((key) => {
          const item = sessionStorage.getItem(key);
          if (item) {
            totalSize += new Blob([item]).size;
          }
        });
      } else if (storage === "memory") {
        this.memoryCache.forEach((entry) => {
          totalSize += new Blob([JSON.stringify(entry)]).size;
        });
      }
    } catch (error) {
      console.error("Error calculating cache size:", error);
    }

    return totalSize;
  }

  /**
   * Check if storage quota is available
   */
  async checkStorageQuota() {
    if (!this.isClient || !navigator.storage || !navigator.storage.estimate) {
      return { available: false, quota: 0, usage: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        available: true,
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        percentage: estimate.quota
          ? (estimate.usage / estimate.quota) * 100
          : 0,
      };
    } catch (error) {
      console.error("Storage quota check failed:", error);
      return { available: false, quota: 0, usage: 0 };
    }
  }
}

// Create and export singleton instance
const cacheManager = new CacheManager();

/**
 * Utility functions for common cache operations
 */
export const CacheUtils = {
  // User management cache helpers
  userManagement: {
    get: () => cacheManager.get(CACHE_KEYS.USER_MANAGEMENT),
    set: (data) => cacheManager.set(CACHE_KEYS.USER_MANAGEMENT, data),
    clear: () => cacheManager.remove(CACHE_KEYS.USER_MANAGEMENT),
  },

  // User profile cache helpers
  userProfile: {
    get: () => cacheManager.get(CACHE_KEYS.USER_PROFILE),
    set: (data) => cacheManager.set(CACHE_KEYS.USER_PROFILE, data),
    clear: () => cacheManager.remove(CACHE_KEYS.USER_PROFILE),
  },

  // Admin cache helpers
  adminDashboard: {
    get: () => cacheManager.get(CACHE_KEYS.ADMIN_DASHBOARD),
    set: (data) => cacheManager.set(CACHE_KEYS.ADMIN_DASHBOARD, data),
    clear: () => cacheManager.remove(CACHE_KEYS.ADMIN_DASHBOARD),
  },

  // Site settings cache helpers
  siteSettings: {
    get: () => cacheManager.get(CACHE_KEYS.SITE_SETTINGS),
    set: (data) =>
      cacheManager.set(CACHE_KEYS.SITE_SETTINGS, data, {
        expiry: 10 * 60 * 1000, // 10 minutes for site settings
      }),
    clear: () => cacheManager.remove(CACHE_KEYS.SITE_SETTINGS),
  },

  // Navigation data helpers
  navigationData: {
    get: () => cacheManager.get(CACHE_KEYS.NAVIGATION_DATA),
    set: (data) =>
      cacheManager.set(CACHE_KEYS.NAVIGATION_DATA, data, {
        expiry: 15 * 60 * 1000, // 15 minutes for navigation
      }),
    clear: () => cacheManager.remove(CACHE_KEYS.NAVIGATION_DATA),
  },

  // API responses cache helpers
  apiResponses: {
    get: (endpoint) =>
      cacheManager.get(`${CACHE_KEYS.API_RESPONSES}_${endpoint}`),
    set: (endpoint, data, expiry = 5 * 60 * 1000) =>
      cacheManager.set(`${CACHE_KEYS.API_RESPONSES}_${endpoint}`, data, {
        expiry,
      }),
    clear: (endpoint) =>
      cacheManager.remove(`${CACHE_KEYS.API_RESPONSES}_${endpoint}`),
    clearAll: () => {
      // Clear all API response caches
      if (typeof window !== "undefined" && window.localStorage) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(CACHE_KEYS.API_RESPONSES)) {
            localStorage.removeItem(key);
          }
        });
      }
    },
  },

  // UI state cache helpers
  uiState: {
    get: (component) => cacheManager.get(`${CACHE_KEYS.UI_STATE}_${component}`),
    set: (component, data) =>
      cacheManager.set(`${CACHE_KEYS.UI_STATE}_${component}`, data, {
        storage: "sessionStorage", // UI state should only persist for session
        expiry: 60 * 60 * 1000, // 1 hour
      }),
    clear: (component) =>
      cacheManager.remove(`${CACHE_KEYS.UI_STATE}_${component}`, {
        storage: "sessionStorage",
      }),
  },

  // Generic helpers
  clearAll: () => cacheManager.clear(),
  getStats: () => cacheManager.getStats(),
  cleanup: () => cacheManager.cleanupExpired(),
  getCacheSize: (storage) => cacheManager.getCacheSize(storage),
  checkQuota: () => cacheManager.checkStorageQuota(),

  // Batch operations
  batchSet: (entries, options) => cacheManager.batchSet(entries, options),
  batchGet: (keys, options) => cacheManager.batchGet(keys, options),

  // Advanced helpers
  getOrSet: (key, fetchFn, options) =>
    cacheManager.getOrSet(key, fetchFn, options),
  update: (key, updateFn, options) =>
    cacheManager.update(key, updateFn, options),
  has: (key, options) => cacheManager.has(key, options),
};

/**
 * React Hook for cache management
 */
export const useCacheManager = () => {
  return {
    cache: cacheManager,
    utils: CacheUtils,
    keys: CACHE_KEYS,
  };
};

/**
 * Cache decorator for functions
 */
export const withCache = (key, options = {}) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = typeof key === "function" ? key(...args) : key;
      const cached = cacheManager.get(cacheKey, options);

      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      cacheManager.set(cacheKey, result, options);
      return result;
    };

    return descriptor;
  };
};

// Export the main cache manager
export default cacheManager;
