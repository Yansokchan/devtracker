import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";

export default function Tasks() {
  const { filteredTasks } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tasks</h1>
          <p className="text-gray-600">
            Manage and track all your tasks in one place.
          </p>
        </div>
        <Button
          onClick={handleNewTask}
          className="gradient-primary text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters />

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
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
