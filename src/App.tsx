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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TaskProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gray-50">
              <AppSidebar />

              <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 w-full bg-[#FFFFFF] border-b-2 border-[#dcd5c4] flex items-center px-6 fixed top-0 z-10">
                  <SidebarTrigger className="mr-4 text-[#B45309]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          TaskFlow <span className="text-[#B45309]">Pro</span>
                        </h2>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-auto mt-16">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />

                    <Route path="/analytics" element={<Analytics />} />
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

export default App;
