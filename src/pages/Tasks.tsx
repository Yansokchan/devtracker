import { useState, useEffect } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

export default function Tasks() {
  useEffect(() => {
    document.title = "DevTracker Pro | Manage Tasks";
  }, []);

  const { tasks, filteredTasks, loading, setFilters } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<number[] | null>(null);

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  // Helper to get today in YYYY-MM-DD
  function getToday() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  async function handleAISmartFilter(option: string) {
    if (option === "finish_this_week") {
      setAiLoading(true);
      setAiFilteredIds(null);
      try {
        // Internal logic for tasks due this week and not completed
        function getToday() {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return d;
        }
        function getEndOfWeek(today: Date) {
          const end = new Date(today);
          end.setDate(today.getDate() + (6 - today.getDay()));
          end.setHours(23, 59, 59, 999);
          return end;
        }
        function isDueThisWeek(task: Task, today: Date, endOfWeek: Date) {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          return due <= endOfWeek && task.status !== "Completed";
        }
        const today = getToday();
        const endOfWeek = getEndOfWeek(today);
        const ids = tasks
          .filter((task) => isDueThisWeek(task, today, endOfWeek))
          .map((task) => task.id);
        setAiFilteredIds(ids);
      } catch (err) {
        alert("Failed to filter tasks for this week. Please try again.");
      } finally {
        setAiLoading(false);
      }
    } else if (option === "finish_this_month") {
      setAiLoading(true);
      setAiFilteredIds(null);
      try {
        // Internal logic for tasks due this month and not completed
        function getToday() {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return d;
        }
        function getEndOfMonth(today: Date) {
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          return end;
        }
        function isDueThisMonth(task: Task, today: Date, endOfMonth: Date) {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          return due <= endOfMonth && task.status !== "Completed";
        }
        const today = getToday();
        const endOfMonth = getEndOfMonth(today);
        const ids = tasks
          .filter((task) => isDueThisMonth(task, today, endOfMonth))
          .map((task) => task.id);
        setAiFilteredIds(ids);
      } catch (err) {
        alert("Failed to filter tasks for this month. Please try again.");
      } finally {
        setAiLoading(false);
      }
    } else {
      alert(`AI Assistance: ${option} (not implemented yet)`);
    }
  }

  // Filter tasks based on AI result if present
  const tasksToShow = aiFilteredIds
    ? tasks.filter((t) => aiFilteredIds.includes(t.id))
    : filteredTasks;

  // Sort so incomplete tasks come first
  const sortedTasksToShow = [...tasksToShow].sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") return 1;
    if (a.status !== "Completed" && b.status === "Completed") return -1;
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">All Tasks</h1>
          <p className="text-gray-600">
            Manage and track all your tasks in one place.
          </p>
        </div>
        <div className="flex sm:items-center items-end flex-col sm:flex-row sm:gap-4 gap-2">
          <Button
            onClick={handleNewTask}
            className="gradient-primary px-6 text-white hover:opacity-90 border-l-2 border-r-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex text-[#B45309] border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] items-center gap-2 hover:bg-[#ffffff]"
              >
                <Sparkles className="w-4 h-4 -mt-[2px] text-[#b46309]" />
                Attention
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#fdf7f7] border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
            >
              <DropdownMenuItem
                className="cursor-pointer border-b hover:text-[#b46309] rounded-b-none"
                onClick={() => handleAISmartFilter("finish_this_week")}
              >
                Show me the tasks I need to finish this week
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:text-[#b46309]"
                onClick={() => handleAISmartFilter("finish_this_month")}
              >
                Show me the tasks I need to finish this month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters + AI Assistance */}
      {!aiFilteredIds && (
        <div className="flex-1 items-center w-full gap-4">
          <SearchAndFilters />
        </div>
      )}

      {/* AI Filter Label and Back Button */}
      {aiFilteredIds && (
        <div className="mb-2 flex-1 justify-between items-center gap-2">
          <button
            className="px-4 py-2 rounded border bg-[#fdf7f7] transition text-sm hover:bg-[#ffffff] hover:text-[#b46309]"
            onClick={() => setAiFilteredIds(null)}
          >
            Back to All Tasks
          </button>
          <div className="p-3 rounded text-[#b46309] font-medium text-center">
            {(() => {
              if (aiFilteredIds.length === 0) return null;
              // Determine which filter is active by checking the last used option
              // We'll track the last AI filter option in state
              // For now, infer from the label by checking which tasks are shown
              // (In a more robust version, store the last filter type in state)
              // We'll use the label based on the number of tasks and their due dates
              // But for now, let's use a simple approach:
              // If all filtered tasks are due this week, show week label; if this month, show month label
              // (Assume only one AI filter is active at a time)
              // We'll check the due dates of the filtered tasks
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const endOfWeek = new Date(today);
              endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
              endOfWeek.setHours(23, 59, 59, 999);
              const endOfMonth = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
              );
              endOfMonth.setHours(23, 59, 59, 999);
              const filtered = tasks.filter((t) =>
                aiFilteredIds.includes(t.id)
              );
              if (
                filtered.every(
                  (t) => t.due_date && new Date(t.due_date) <= endOfWeek
                )
              ) {
                return "Here are the tasks you need to finish this week.";
              } else if (
                filtered.every(
                  (t) => t.due_date && new Date(t.due_date) <= endOfMonth
                )
              ) {
                return "Here are the tasks you need to finish this month.";
              } else {
                return "Here are your filtered tasks.";
              }
            })()}
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading || aiLoading
          ? Array.from({ length: tasksToShow.length || 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          : sortedTasksToShow.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
            ))}
      </div>

      {tasksToShow.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first task to get started.
          </p>
          <Button
            onClick={handleNewTask}
            className="gradient-primary text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}

      {/* Task Dialog */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        task={selectedTask}
      />
    </div>
  );
}
