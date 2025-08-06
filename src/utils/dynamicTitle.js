// utils/dynamicTitle.js - শুধু একটা utility file
const SITE_SETTINGS_CACHE = "site_settings_title_cache";

// Update title function
export const updatePageTitle = (title) => {
  if (title) {
    document.title = title;
  }
};

// Update favicon function
export const updateFavicon = (imageUrl) => {
  try {
    // Remove existing favicons
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach((link) => link.remove());

    // Create new favicon
    const link = document.createElement("link");

    if (imageUrl && imageUrl.trim() && imageUrl !== "/vited.svg") {
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = imageUrl;
    } else {
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = "/vited.svg";
    }

    // Handle errors
    link.onerror = () => {
      link.href = "/vited.svg";
      link.type = "image/svg+xml";
    };

    document.head.appendChild(link);
  } catch (error) {
    console.error("Failed to update favicon:", error);
  }
};

// Get site settings and update title/favicon
export const updateSiteSettings = async () => {
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

        // Update title
        updatePageTitle(settings.siteName);

        // Update favicon
        updateFavicon(settings.siteImage?.url);

        // Cache the settings
        localStorage.setItem(
          SITE_SETTINGS_CACHE,
          JSON.stringify({
            siteName: settings.siteName,
            siteImage: settings.siteImage,
            timestamp: Date.now(),
          })
        );

        return settings;
      }
    }
  } catch (error) {
    // Try cached data if API fails
    try {
      const cached = localStorage.getItem(SITE_SETTINGS_CACHE);
      if (cached) {
        const settings = JSON.parse(cached);
        updatePageTitle(settings.siteName);
        updateFavicon(settings.siteImage?.url);
      }
    } catch {
      // Use defaults
      updatePageTitle("Site");
      updateFavicon("/vited.svg");
    }
  }
};
