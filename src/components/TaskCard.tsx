import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/task";
import { Edit, Trash2, Calendar, Tag, CheckCircle } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  hideActions?: boolean;
}

export function TaskCard({ task, onEdit, hideActions = false }: TaskCardProps) {
  const { deleteTask, getTaskProgress } = useTaskContext();
  const progress = getTaskProgress(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "priority-critical";
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "status-todo";
      case "In Progress":
        return "status-progress";
      case "Review":
        return "status-review";
      case "Completed":
        return "status-completed";
      default:
        return "status-todo";
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "Completed";

  const handleDelete = async () => {
    await deleteTask(task.id);
    toast({
      title: "Task deleted",
      description: `Task '${task.title}' was deleted successfully.`,
    });
  };

  return (
    <Card className="card-hover bg-[#f6f4f0]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          </div>
          {!hideActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(task)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <Badge
            className={`text-xs font-light ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </Badge>
          <Badge
            className={`text-xs font-light ${getStatusColor(task.status)}`}
          >
            {task.status}
          </Badge>
          {isOverdue && (
            <Badge className="text-xs font-light bg-red-100 text-red-800">
              Overdue
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        {task.steps.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {task.steps.filter((s) => s.completed).length} of{" "}
              {task.steps.length} steps completed
            </p>

            {/* Step Status Summary */}
            <div className="mt-2 space-y-1">
              {task.steps.slice(0, 3).map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`w-3 h-3 ${
                        step.completed ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={`truncate max-w-32 ${
                        step.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <Badge
                    className={`text-xs font-light ${getStepStatusColor(
                      step.status
                    )}`}
                  >
                    {step.status}
                  </Badge>
                </div>
              ))}
              {task.steps.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{task.steps.length - 3} more steps
                </p>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span
              className={`text-sm ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              Due {new Date(task.due_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
