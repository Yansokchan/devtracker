import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../components/ui/table";
import { useTaskContext } from "../context/TaskContext";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { X, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "../components/ui/skeleton";

interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string;
  action: string;
  details: string | null;
  created_at: string;
  task_title?: string;
}

interface TaskTitleMap {
  [taskId: string]: string;
}

export default function ActivityHistory() {
  const [taskTitles, setTaskTitles] = useState<TaskTitleMap>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const { activityLogs, loadingActivityLogs, tasks } = useTaskContext();

  const getTaskTitle = (log: ActivityLog): string => {
    // Prefer the denormalized task_title if present
    if (log.task_title) return log.task_title;
    // Fallback to fetched title map
    return taskTitles[log.task_id] || "Unknown Task";
  };

  const formatAction = (log: ActivityLog): string => {
    const taskTitle = getTaskTitle(log);

    switch (log.action) {
      case "create":
        return `Create: ${taskTitle}`;
      case "edit":
        if (log.details) {
          // Steps added: - → step1, step2, ...
          if (log.details.includes("Steps added:")) {
            const match = log.details.match(/Steps added: - → (.+)/);
            if (match) {
              // Clean up the step titles (remove dashes/arrows, trim spaces)
              const steps = match[1]
                .split(",")
                .map((s) => s.replace(/[-→]/g, "").trim())
                .filter(Boolean)
                .join(", ");
              return `Steps added to ${taskTitle}: ${steps}`;
            }
          }
          // Try to parse the details for more specific formatting
          if (log.details.includes("Status:")) {
            const match = log.details.match(/Status: (.+?) → (.+)/);
            if (match) {
              return `Update Status: ${taskTitle} (${match[1]} → ${match[2]})`;
            }
          }
          if (log.details.includes("Priority:")) {
            const match = log.details.match(/Priority: (.+?) → (.+)/);
            if (match) {
              return `Update Priority: ${taskTitle} (${match[1]} → ${match[2]})`;
            }
          }
          if (log.details.includes("Due date:")) {
            const match = log.details.match(/Due date: (.+?) → (.+)/);
            if (match) {
              return `Update Due date: ${taskTitle} (${match[1]} → ${match[2]})`;
            }
          }
          if (log.details.includes("Step status:")) {
            const match = log.details.match(
              /Step status: (.+?) \((\d+) completed → (\d+) completed\)/
            );
            if (match) {
              const stepTitle = match[1];
              const from = match[2];
              const to = match[3];
              // Map 0 to 'not completed', 1 to 'completed'
              const statusMap = { "0": "not completed", "1": "completed" };
              const fromStatus = statusMap[from] || from;
              const toStatus = statusMap[to] || to;
              return `Step "${stepTitle}" status updated: ${fromStatus} → ${toStatus}`;
            }
          }
          if (log.details.includes("Title:")) {
            const match = log.details.match(/Title: (.+?) → (.+)/);
            if (match) {
              return `Update Title: ${match[1]} → ${match[2]}`;
            }
          }
          if (log.details.includes("Tags:")) {
            const match = log.details.match(/Tags: (.+?) → (.+)/);
            if (match) {
              return `Update Tags: ${taskTitle} (${match[1]} → ${match[2]})`;
            }
          }
          // Fallback for other edit operations
          return `Update: ${taskTitle} - ${log.details}`;
        }
        return `Update: ${taskTitle}`;
      case "delete":
        // For delete actions, try to extract task title from details if available
        if (log.details && log.details.includes("Deleted task:")) {
          const match = log.details.match(/Deleted task: (.+)/);
          if (match) {
            return `Delete: ${match[1]}`;
          }
        }
        return `Delete: ${taskTitle}`;
      default:
        return `${log.action}: ${taskTitle}`;
    }
  };

  // Filter activity logs by selected date
  const filteredLogs = selectedDate
    ? activityLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return (
          logDate.getFullYear() === selectedDate.getFullYear() &&
          logDate.getMonth() === selectedDate.getMonth() &&
          logDate.getDate() === selectedDate.getDate()
        );
      })
    : activityLogs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Activity History</h1>
        {/* Date Filter Button and Popover */}

        <div className="flex items-center gap-4 mb-4">
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setDatePopoverOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {selectedDate
                  ? `Date: ${format(selectedDate, "PPP")}`
                  : "Filter"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-auto">
              <Calendar
                className="bg-[#fdf7f7]"
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setDatePopoverOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button variant="ghost" onClick={() => setSelectedDate(null)}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500">{error}</div>}
      <Table>
        <TableHeader className="bg-[#fdf7f7]">
          <TableRow>
            <TableHead className="font-semibold text-base">Action</TableHead>
            <TableHead className="font-semibold text-base">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingActivityLogs
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            : filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {formatAction(log)}
                  </TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!loadingActivityLogs && filteredLogs.length === 0 && (
        <div className="mt-4 text-gray-500 text-center">No activity found.</div>
      )}
    </div>
  );
}
