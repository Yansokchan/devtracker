import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskProvider } from "@/context/TaskContext";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./components/Login";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ActivityHistory from "./pages/ActivityHistory";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TaskProvider user={user}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar user={user} />

                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <header className="h-16 w-full bg-[#FFFFFF] border-b-2 border-[#dcd5c4] flex items-center px-6 fixed top-0 z-10">
                    <SidebarTrigger className="h-6 text-[#B45309] md:hidden inline-block" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-lg font-semibold text-gray-900">
                            DevTracker{" "}
                            <span className="text-[#B45309]">PRO</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Main Content */}
                  <main className="flex-1 p-6 overflow-auto mt-16">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/tasks"
                        element={
                          <ProtectedRoute user={user}>
                            <Tasks />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute user={user}>
                            <Analytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute user={user}>
                            <Profile user={user} />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/activity-history"
                        element={
                          <ProtectedRoute user={user}>
                            <ActivityHistory />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={<div>Settings Coming Soon</div>}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TaskProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
