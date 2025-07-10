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
import PlanCards from "./components/PlanCards";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const queryClient = new QueryClient();

// Add syncUser function
async function syncUser(user) {
  if (!user) return;
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();
  if (selectError) {
    console.error("Error selecting user:", selectError);
  }
  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: user.id,
        email: user.email,
        subscription_plan: "free",
        subscription_status: "active",
        task_limit: 10, // Example default
        ai_generate_limit: 3, // Example default
      },
    ]);
    if (insertError) {
      console.error("Error inserting user:", insertError);
    }
  }
}

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [plan, setPlan] = useState("free"); // Add plan state

  // Fetch user's plan from DB
  async function fetchUserPlan(userId) {
    if (!userId) return;
    const { data, error } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Error fetching user plan:", error);
      setPlan("free");
    } else if (data?.subscription_plan) {
      setPlan(data.subscription_plan);
    } else {
      setPlan("free");
    }
  }

  useEffect(() => {
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          syncUser(session.user); // Don't await!
          fetchUserPlan(session.user.id); // Fetch plan
        } else {
          setPlan("free");
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        syncUser(session.user); // Don't await!
        fetchUserPlan(session.user.id); // Fetch plan
      } else {
        setPlan("free");
      }
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

                <div className="flex-1 flex flex-col min-h-0">
                  {/* Header */}
                  <header className="h-16 w-full bg-[#FFFFFF] border-b-2 border-[#dcd5c4] flex items-center px-4 md:px-6 z-30">
                    <SidebarTrigger className="h-6 text-[#B45309] md:hidden inline-block" />
                    <div className="flex flex-1 flex-row items-center justify-between w-full">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          DevTracker <span className="text-[#B45309]">PRO</span>
                        </h2>
                      </div>
                      {/* Plan label and upgrade button */}
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                          Current Plan:{" "}
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </span>
                        <Dialog
                          open={openPlanDialog}
                          onOpenChange={setOpenPlanDialog}
                        >
                          <DialogTrigger asChild>
                            <button
                              className="px-4 py-1.5 rounded-lg border-l-2 text-white bg-[#b46309] border-r-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                              onClick={() => setOpenPlanDialog(true)}
                            >
                              Upgrade
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-full bg-transparent border-none shadow-none z-[100] flex items-center justify-center min-h-screen h-screen overflow-y-hidden">
                            <PlanCards user={user} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </header>

                  {/* Main Content */}
                  <main className="flex-1 min-h-0 p-2 sm:p-6 overflow-auto">
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
