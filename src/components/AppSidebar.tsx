import { useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  User,
  BarChart3,
  Settings,
  Plus,
  Target,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTaskContext } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/TaskDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "../lib/supabaseClient";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Tasks", url: "/tasks", icon: ListTodo },
  // { title: "My Tasks", url: "/my-tasks", icon: User },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  // { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ user }: { user: any }) {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const { getOverallStats } = useTaskContext();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const stats = getOverallStats();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-[#B45309] font-medium border-r-1 border-b-1 border-l-1 border-t-1 border-[#E4C090] transition-colors duration-300"
      : "transition-colors duration-300";

  const handleNavClick = (url: string) => {
    navigate(url);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <Sidebar className={open ? "w-64" : "w-20"} collapsible="icon">
        <SidebarContent className="bg-[#FFFFFF] border-r border-[#dcd5c4] flex flex-col h-full">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#92582b]" />
              </div>
              {open && (
                <div>
                  <h1 className="font-bold text-lg text-gray-900">
                    DevTracker
                  </h1>
                  <p className="text-xs text-gray-600">
                    <span className="text-[#B45309]">Pro </span>Dashboard
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          {open && (
            <div className="p-4 border-t-2 border-[#dcd5c4]">
              <Button
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                    setTimeout(() => setIsTaskDialogOpen(true), 300);
                  } else {
                    setIsTaskDialogOpen(true);
                  }
                }}
                className="w-full gradient-primary text-white hover:opacity-90 transition-opacity border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
              </Button>
            </div>
          )}

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <button
                        className={getNavCls({ isActive: isActive(item.url) })}
                        onClick={() => handleNavClick(item.url)}
                      >
                        <item.icon className="w-4 h-4" />
                        {open && <span>{item.title}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Quick Stats */}
          {open && (
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-3 px-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <ListTodo className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Total Tasks</span>
                    </div>
                    <span className="font-semibold text-[#453c38]">
                      {stats.total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Completed</span>
                    </div>
                    <span className="font-semibold text-[#453c38]">
                      {stats.completed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">In Progress</span>
                    </div>
                    <span className="font-semibold text-[#453c38]">
                      {stats.inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">Overdue</span>
                    </div>
                    <span className="font-semibold text-[#453c38]">
                      {stats.overdue}
                    </span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <div className="flex-1" />
          {/* User Info at the bottom */}
          {open && (
            <div className="p-4 border-t-2 border-[#dcd5c4] flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.full_name || user?.email}
                />
                <AvatarFallback>
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || "No Name"}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.email}
                </span>
                <div className="flex mt-2 gap-2">
                  <button
                    className="px-3 py-1 rounded bg-[#B45309] text-white hover:bg-[#a05a13] transition text-xs font-medium border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                        setTimeout(() => navigate("/profile"), 300);
                      } else {
                        navigate("/profile");
                      }
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-[#E4D9BC] text-gray-800 hover:bg-gray-300 transition text-xs font-medium border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                    onClick={() => supabase.auth.signOut()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        task={null}
      />
    </>
  );
}
