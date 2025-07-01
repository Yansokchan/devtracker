
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
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { tasks, getOverallStats } = useTaskContext();
  const stats = getOverallStats();

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => 
    task.due_date === today || 
    (task.status === 'Completed' && task.updated_at === today)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          change={`${stats.completionRate}% completion rate`}
          changeType="neutral"
          icon={ListTodo}
          gradient="red"
        />
        <StatCard
          title="Completed Today"
          value={todaysTasks.filter(t => t.status === 'Completed').length}
          change="Today's achievements"
          changeType="positive"
          icon={Target}
          gradient="green"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          change="Active tasks"
          changeType="neutral"
          icon={Clock}
          gradient="blue"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          change="Needs attention"
          changeType={stats.overdue > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          gradient="yellow"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskAnalytics />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Today's Focus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysTasks.length > 0 ? (
                <div className="space-y-3">
                  {todaysTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{task.status}</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                  + Create new task
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                  📊 View all analytics
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                  📅 Check due dates
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
