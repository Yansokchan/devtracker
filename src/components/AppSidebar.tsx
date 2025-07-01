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
import { NavLink, useLocation } from "react-router-dom";
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Tasks", url: "/tasks", icon: ListTodo },
  // { title: "My Tasks", url: "/my-tasks", icon: User },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  // { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { getOverallStats } = useTaskContext();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const stats = getOverallStats();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? " text-primary font-medium border-r-2 border-primary transition-colors duration-300"
      : "bg-[#B45309] transition-colors duration-300";

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent className="bg-[#FFFFFF] border-r border-[#dcd5c4]">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-[#92582b]" />
            </div>
            {open && (
              <div>
                <h1 className="font-bold text-lg text-gray-900">TaskFlow</h1>
                <p className="text-xs text-gray-600">Pro Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Button */}
        {open && (
          <div className="p-4 border-t-2 border-[#dcd5c4]">
            <Button
              onClick={() => setIsTaskDialogOpen(true)}
              className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
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
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
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
      </SidebarContent>

      {/* Task Dialog */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        task={null}
      />
    </Sidebar>
  );
}
