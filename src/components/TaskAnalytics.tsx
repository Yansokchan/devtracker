import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskContext } from "@/context/TaskContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const COLORS = {
  "To Do": "#8884d8",
  "In Progress": "#82ca9d",
  Review: "#ffc658",
  Completed: "#00C49F",
};

const PRIORITY_COLORS = {
  Low: "#00C49F",
  Medium: "#FFBB28",
  High: "#FF8042",
  Critical: "#FF0000",
};

export function TaskAnalytics() {
  const { tasks } = useTaskContext();

  // Status distribution data
  const statusData = Object.entries(
    tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  // Priority distribution data
  const priorityData = Object.entries(
    tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([priority, count]) => ({ priority, count }));

  // Tasks completed over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  // Two-letter weekday abbreviations
  const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const completionTrendData = last7Days.map((date) => {
    const completed = tasks.filter(
      (task) =>
        task.status === "Completed" &&
        task.updated_at &&
        task.updated_at.split("T")[0] === date
    ).length;
    return {
      date: WEEKDAYS[new Date(date).getDay()],
      completed,
    };
  });

  // Task creation vs completion
  const creationVsCompletionData = last7Days.map((date) => {
    const created = tasks.filter(
      (task) => task.created_at && task.created_at.split("T")[0] === date
    ).length;
    const completed = tasks.filter(
      (task) =>
        task.status === "Completed" &&
        task.updated_at &&
        task.updated_at.split("T")[0] === date
    ).length;
    return {
      date: WEEKDAYS[new Date(date).getDay()],
      created,
      completed,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Status Distribution Pie Chart */}
      <Card className="bg-[#f6f4f0]">
        <CardHeader>
          <CardTitle className="font-medium">Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart className="text-[12px]">
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count, percent }) =>
                  `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution Bar Chart */}
      <Card className="bg-[#f6f4f0]">
        <CardHeader>
          <CardTitle className="font-medium">Tasks by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="90%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {priorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      PRIORITY_COLORS[
                        entry.priority as keyof typeof PRIORITY_COLORS
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion Trend Line Chart */}
      <Card className="bg-[#f6f4f0]">
        <CardHeader>
          <CardTitle className="font-medium">
            Tasks Completed Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#ff3333"
                strokeWidth={2}
                dot={{ fill: "#ff3333" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Creation vs Completion Area Chart */}
      <Card className="bg-[#f6f4f0]">
        <CardHeader>
          <CardTitle className="font-medium">
            Task Creation vs Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={creationVsCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="created"
                stackId="1"
                stroke="#ffff00"
                fill="#ffff00"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="#ff3333"
                fill="#ff3333"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
