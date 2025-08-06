// main.jsx - Optimized version with instant loading
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { router } from "./Routes/Route";

const CACHE_KEY = "site_settings_cache";
const CACHE_EXPIRY = 10 * 60 * 1000;

const setCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
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
};

const updateBrowserTitle = (title) => {
  if (title && title !== document.title) {
    document.title = title;
  }
};

const updateFavicon = (imageUrl) => {
  try {
    const currentFavicon = document.querySelector('link[rel="icon"]');
    if (currentFavicon && currentFavicon.href === imageUrl) {
      return;
    }

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
      if (link.href !== "/vited.svg") {
        link.href = "/vited.svg";
        link.type = "image/svg+xml";
      }
    };

    document.head.appendChild(link);
  } catch (error) {
    console.error("Failed to update favicon:", error);
  }
};

const applyCachedSettings = () => {
  const cachedSettings = getCache();
  if (cachedSettings) {
    const title =
      cachedSettings.browserTitle || cachedSettings.siteName || "Site";
    updateBrowserTitle(title);

    if (cachedSettings.faviconImage?.url) {
      updateFavicon(cachedSettings.faviconImage.url);
    }

    return true;
  }
  return false;
};

const fetchSiteSettingsInBackground = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DataHost}/site-settings/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.settings) {
        const settings = data.data.settings;

        setCache(settings);

        const title = settings.browserTitle || settings.siteName || "Site";
        updateBrowserTitle(title);

        if (settings.faviconImage?.url) {
          updateFavicon(settings.faviconImage.url);
        }
      }
    }
  } catch (error) {
    console.log("Background fetch failed, using cached/default settings");
  }
};

const initializeSiteSettings = async () => {
  const hasCachedSettings = applyCachedSettings();

  if (!hasCachedSettings) {
    document.title = "Site";
    updateFavicon("/vited.svg");
  }

  setTimeout(() => {
    fetchSiteSettingsInBackground();
  }, 100);
};

initializeSiteSettings();

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    setTimeout(fetchSiteSettingsInBackground, 500);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="custom-toast"
      bodyClassName="custom-toast-body"
      progressClassName="custom-toast-progress"
    />
  </React.StrictMode>
);
