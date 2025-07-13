import { useTaskContext } from "@/context/TaskContext";
import { StatCard } from "@/components/StatCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskAnalytics } from "@/components/TaskAnalytics";
import {
  ListTodo,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { tasks, getOverallStats, loading } = useTaskContext();
  const stats = getOverallStats();

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0];
  const todaysTasks = tasks.filter(
    (task) =>
      task.due_date === today ||
      (task.status === "Completed" && task.updated_at.split("T")[0] === today)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Tasks"
              value={stats.total}
              change={`${stats.completionRate}% completion rate`}
              changeType="neutral"
              icon={ListTodo}
              gradient="red"
              textColor="text-[#B45309]"
            />
            <StatCard
              title="Completed Today"
              value={todaysTasks.filter((t) => t.status === "Completed").length}
              change="Today's achievements"
              changeType="positive"
              icon={Target}
              gradient="green"
              textColor="text-green-700"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              change="Active tasks"
              changeType="neutral"
              icon={Clock}
              gradient="blue"
              textColor="text-blue-700"
            />
            <StatCard
              title="Overdue"
              value={stats.overdue}
              change="Needs attention"
              changeType={stats.overdue > 0 ? "negative" : "positive"}
              icon={AlertTriangle}
              textColor="text-red-700"
            />
          </>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#fcfbf8]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Analytics Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : <TaskAnalytics />}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Today's Tasks */}
          <Card className="bg-[#fcfbf8]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Today's Focus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : todaysTasks.length > 0 ? (
                <div className="space-y-3">
                  {todaysTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-3 bg-[#f6f4f0] rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {task.status}
                      </p>
                    </div>
                  ))}
                  {todaysTasks.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{todaysTasks.length - 3} more tasks today
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tasks due today</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#fcfbf8]">
            <CardHeader>
              <CardTitle className="font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-[#f6f4f0] rounded text-sm">
                    + Create new task
                  </button>
                  <button className="w-full text-left p-2 hover:bg-[#f6f4f0] rounded text-sm">
                    📊 View all analytics
                  </button>
                  <button className="w-full text-left p-2 hover:bg-[#f6f4f0] rounded text-sm">
                    📅 Check due dates
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks */}
      <Card className="bg-[#fcfbf8]">
        <CardHeader>
          <CardTitle className="font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              : recentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} hideActions={true} />
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
