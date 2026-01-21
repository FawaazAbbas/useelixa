import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { ElixaLogo } from "./ElixaLogo";

// Workspace routes that require larger screens
const WORKSPACE_ROUTES = ["/workspace", "/logs", "/connections", "/settings"];

export const MobileRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const isWorkspaceRoute = WORKSPACE_ROUTES.some((route) => location.pathname.startsWith(route));
    const isTooSmall = windowWidth < 850;

    setShowOverlay(isWorkspaceRoute && isTooSmall);
  }, [location.pathname, windowWidth]);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <ElixaLogo size={64} color="#fff" />
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">View on Laptop</h1>
          <p className="text-white leading-relaxed">
            The Elixa Workspace is designed for larger screens to give you the best experience managing your connected tools.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/tool-library")}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 hover:from-rose-600 hover:via-purple-600 hover:to-cyan-600 text-white rounded-xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40"
          >
            <Monitor className="w-5 h-5 mr-2" />
            Browse Tool Library
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};
