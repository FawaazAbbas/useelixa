import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/utils/analytics";

// Map routes to page titles for better analytics
const routeTitles: Record<string, string> = {
  "/": "AI Talent Pool",
  "/talent-pool": "AI Talent Pool",
  "/talent-pool/charts": "Top Charts",
  "/workspace": "Workspace",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/logs": "Activity Logs",
  "/connections": "Connections",
  "/knowledge-base": "Knowledge Base",
  "/settings": "Settings",
  "/about": "About Us",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/contact": "Contact",
  "/developers": "Developers",
  "/pitch-deck": "Pitch Deck",
  "/auth": "Authentication",
};

export const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Get the base path for dynamic routes
    const basePath = location.pathname.split("/").slice(0, 3).join("/");
    let pageTitle = routeTitles[location.pathname] || routeTitles[basePath];

    // Handle dynamic routes
    if (location.pathname.startsWith("/agent/")) {
      pageTitle = "Agent Details";
    } else if (location.pathname.startsWith("/talent-pool/category/")) {
      pageTitle = "Category";
    }

    // Default title if not found
    if (!pageTitle) {
      pageTitle = document.title || "Elixa";
    }

    trackPageView(location.pathname, pageTitle);
  }, [location.pathname]);

  return null;
};
