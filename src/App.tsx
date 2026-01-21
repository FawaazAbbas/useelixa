import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TalentPool from "./pages/TalentPool";
import Workspace from "./pages/Workspace";
import Auth from "./pages/Auth";
import Logs from "./pages/Logs";
import Connections from "./pages/Connections";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { MainNavSidebar } from "./components/MainNavSidebar";
import { MobileRedirect } from "./components/MobileRedirect";
import { MobileBottomNav } from "./components/MobileBottomNav";

import { ScrollToTop } from "./components/ScrollToTop";
import { RouteTracker } from "./components/RouteTracker";
import { useGlobalButtonTracking } from "./hooks/useGlobalButtonTracking";

const queryClient = new QueryClient();

const AppContent = () => {
  useGlobalButtonTracking();
  
  return (
    <>
      <ScrollToTop />
      <RouteTracker />
      <MobileRedirect />
      
        <Routes>
          {/* Tool Library (main landing) */}
          <Route path="/" element={<TalentPool />} />
          <Route path="/tool-library" element={<TalentPool />} />
          
          {/* Legacy redirects */}
          <Route path="/talent-pool" element={<Navigate to="/tool-library" replace />} />
          <Route path="/talent-pool/*" element={<Navigate to="/tool-library" replace />} />
          <Route path="/agent/*" element={<Navigate to="/tool-library" replace />} />
          <Route path="/publish" element={<Navigate to="/tool-library" replace />} />
          <Route path="/developers" element={<Navigate to="/tool-library" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/waitlist" element={<Navigate to="/auth" replace />} />
          <Route path="/referral" element={<Navigate to="/tool-library" replace />} />
          <Route path="/pitch-deck" element={<Navigate to="/tool-library" replace />} />
          <Route path="/tasks" element={<Navigate to="/workspace" replace />} />
          <Route path="/calendar" element={<Navigate to="/workspace" replace />} />
          <Route path="/knowledge-base" element={<Navigate to="/workspace" replace />} />
          
          <Route path="/auth" element={<Auth />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Back-compat: old demo link */}
          <Route path="/workspace/demo" element={<Navigate to="/workspace" replace />} />

          {/* App routes with main navigation */}
          <Route
            path="/workspace"
            element={
              <div className="flex h-screen overflow-hidden">
                <div className="hidden md:block">
                  <MainNavSidebar />
                </div>
                <Workspace />
                <MobileBottomNav />
              </div>
            }
          />
          <Route path="/logs" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <Logs />
              <MobileBottomNav />
            </div>
          } />
          <Route path="/connections" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <Connections />
              <MobileBottomNav />
            </div>
          } />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
