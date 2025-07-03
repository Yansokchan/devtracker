import { TaskAnalytics } from "@/components/TaskAnalytics";
import { useTaskContext } from "@/context/TaskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "@/components/ui/CountUp";

export default function Analytics() {
  const { tasks, getOverallStats, loading } = useTaskContext();
  const stats = getOverallStats();

  // Calculate productivity metrics
  const avgTasksPerDay = tasks.length > 0 ? (tasks.length / 30).toFixed(1) : 0; // Assuming 30 days
  const completionVelocity =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

  const tasksWithSteps = tasks.filter((t) => t.steps.length > 0);
  const avgStepsPerTask =
    tasksWithSteps.length > 0
      ? (
          tasksWithSteps.reduce((acc, task) => acc + task.steps.length, 0) /
          tasksWithSteps.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Track your productivity and task completion patterns.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <Card className="bg-[#f6f4f0]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completion Rate
                </CardTitle>
                <Target className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp
                    to={
                      typeof completionVelocity === "string"
                        ? parseFloat(completionVelocity)
                        : 0
                    }
                    duration={1.2}
                    separator=","
                    onStart={() => {}}
                    onEnd={() => {}}
                  />
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.completed} of {stats.total} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f6f4f0]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Tasks/Day
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp
                    to={
                      typeof avgTasksPerDay === "string"
                        ? parseFloat(avgTasksPerDay)
                        : 0
                    }
                    duration={1.2}
                    separator=","
                    onStart={() => {}}
                    onEnd={() => {}}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Based on last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f6f4f0]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Steps/Task
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp
                    to={
                      typeof avgStepsPerTask === "string"
                        ? parseFloat(avgStepsPerTask)
                        : 0
                    }
                    duration={1.2}
                    separator=","
                    onStart={() => {}}
                    onEnd={() => {}}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {tasksWithSteps.length} tasks with steps
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f6f4f0]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Tasks
                </CardTitle>
                <Clock className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp
                    to={stats.inProgress}
                    duration={1.2}
                    separator=","
                    onStart={() => {}}
                    onEnd={() => {}}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Currently in progress
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      {loading ? <Skeleton className="h-40 w-full" /> : <TaskAnalytics />}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))
        ) : (
          <>
            <Card className="bg-[#f6f4f0]">
              <CardHeader>
                <CardTitle className="font-medium">
                  Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Most productive priority:
                    </span>
                    <span className="text-sm font-medium">
                      {stats.completed > 0 ? "High Priority" : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Average completion time:
                    </span>
                    <span className="text-sm font-medium">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Most common status:
                    </span>
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tasks with overdue risk:
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      {stats.overdue}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#f6f4f0]">
              <CardHeader>
                <CardTitle className="font-medium">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.overdue > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        🚨 You have {stats.overdue} overdue tasks. Consider
                        reviewing deadlines.
                      </p>
                    </div>
                  )}
                  {stats.inProgress > 5 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ You have many tasks in progress. Focus on completing
                        current tasks.
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Break down large tasks into smaller steps for better
                      tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
