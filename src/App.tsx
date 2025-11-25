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
import { MainNavSidebar } from "./components/MainNavSidebar";
import { MobileRedirect } from "./components/MobileRedirect";

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
            </div>
          } />
          <Route path="/tasks" element={
            <div className="flex h-screen overflow-hidden">
              <MainNavSidebar />
              <Tasks />
            </div>
          } />
          <Route path="/calendar" element={
            <div className="flex h-screen overflow-hidden">
              <MainNavSidebar />
              <Calendar />
            </div>
          } />
          <Route path="/logs" element={
            <div className="flex h-screen overflow-hidden">
              <MainNavSidebar />
              <Logs />
            </div>
          } />
          <Route path="/connections" element={
            <div className="flex h-screen overflow-hidden">
              <MainNavSidebar />
              <Connections />
            </div>
          } />
          <Route path="/knowledge-base" element={
            <div className="flex h-screen overflow-hidden">
              <MainNavSidebar />
              <KnowledgeBase />
            </div>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
