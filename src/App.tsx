import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskProvider } from "@/context/TaskContext";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ActivityHistory from "./pages/ActivityHistory";
import PlanCards from "./components/PlanCards";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

// Custom Animated Hamburger Icon Component
const AnimatedHamburgerIcon = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="relative w-6 h-6 flex flex-col justify-center items-center">
      <span
        className={`absolute w-6 h-0.5 bg-[#B45309] rounded-full transition-all duration-300 ease-in-out ${
          isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
        }`}
      />
      <span
        className={`absolute w-6 h-0.5 bg-[#B45309] rounded-full transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute w-6 h-0.5 bg-[#B45309] rounded-full transition-all duration-300 ease-in-out ${
          isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
        }`}
      />
    </div>
  );
};

// Custom Sidebar Trigger Component
const CustomSidebarTrigger = () => {
  const { openMobile, setOpenMobile, isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpenMobile(!openMobile)}
      className="h-10 w-10 p-0 hover:bg-[#fdf7f7] transition-colors duration-200 md:hidden"
      aria-label={openMobile ? "Close sidebar" : "Open sidebar"}
    >
      <AnimatedHamburgerIcon isOpen={openMobile} />
    </Button>
  );
};

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
        task_limit: 1, // Example default
        ai_generate_limit: 2, // Example default
        last_reset_date: new Date().toISOString().split("T")[0],
      },
    ]);
    if (insertError) {
      console.error("Error inserting user:", insertError);
    }
  }
}

// Frontend daily reset logic
async function frontendDailyReset(userId) {
  if (!userId) return;
  try {
    // Get user's current limits and last reset date
    const { data: user, error } = await supabase
      .from("users")
      .select(
        "task_limit, ai_generate_limit, subscription_plan, last_reset_date"
      )
      .eq("id", userId)
      .single();
    if (error || !user) return;
    const today = new Date().toISOString().split("T")[0];
    if (user.last_reset_date !== today) {
      let newTaskLimit = 1;
      let newAiLimit = 2;
      if (user.subscription_plan === "premium") {
        newTaskLimit = 5;
        newAiLimit = 15;
      } else if (user.subscription_plan === "elite") {
        newTaskLimit = -1;
        newAiLimit = -1;
      }
      const { error: updateError } = await supabase
        .from("users")
        .update({
          task_limit: newTaskLimit,
          ai_generate_limit: newAiLimit,
          last_reset_date: today,
        })
        .eq("id", userId);
      if (!updateError) {
        console.log("Frontend: Daily limits reset for user", userId);
      } else {
        console.error("Frontend: Failed to reset daily limits:", updateError);
      }
    }
  } catch (err) {
    console.error("Frontend: Error checking daily limits:", err);
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
          frontendDailyReset(session.user.id); // Call frontend daily reset
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
        frontendDailyReset(session.user.id); // Call frontend daily reset
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
                  <header className="fixed top-0 left-0 right-0 h-16 w-full bg-[#FFFFFF] border-b-2 border-[#dcd5c4] flex items-center px-4 md:px-6 z-40 md:ml-64">
                    <CustomSidebarTrigger />
                    <div className="flex flex-1 flex-row items-center justify-between w-full">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900 ml-1">
                          DevTracker <span className="text-[#B45309]">PRO</span>
                        </h2>
                      </div>
                      {/* Plan label and upgrade button */}
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                          Current Plan:{" "}
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* Main Content */}
                  <main className="flex-1 min-h-0 p-2 sm:p-6 overflow-auto mt-16">
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
