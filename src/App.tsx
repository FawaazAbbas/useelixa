import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Marketplace from "./pages/Marketplace";
import AgentDetail from "./pages/AgentDetail";
import Workspace from "./pages/Workspace";
import Auth from "./pages/Auth";
import Publish from "./pages/Publish";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Logs from "./pages/Logs";
import Connections from "./pages/Connections";
import KnowledgeBase from "./pages/KnowledgeBase";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { MainNavSidebar } from "./components/MainNavSidebar";
import { MobileRedirect } from "./components/MobileRedirect";
import { MobileBottomNav } from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MobileRedirect />
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          
          {/* App routes with main navigation */}
          <Route path="/workspace" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <Workspace />
              <MobileBottomNav />
            </div>
          } />
          <Route path="/tasks" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <Tasks />
              <MobileBottomNav />
            </div>
          } />
          <Route path="/calendar" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <Calendar />
              <MobileBottomNav />
            </div>
          } />
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
          <Route path="/knowledge-base" element={
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:block">
                <MainNavSidebar />
              </div>
              <KnowledgeBase />
              <MobileBottomNav />
            </div>
          } />
          <Route path="/settings" element={<Settings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
