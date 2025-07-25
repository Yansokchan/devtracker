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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  hideActions?: boolean;
}

export function TaskCard({ task, onEdit, hideActions = false }: TaskCardProps) {
  const { deleteTask, getTaskProgress } = useTaskContext();
  const progress = getTaskProgress(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

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
    console.log("Deleting task:", task.id, task.title);
    try {
      await deleteTask(task.id);
      toast({
        title: "Task deleted",
        description: `Task '${task.title}' was deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
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
              <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="View details"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-6">
                  <DialogHeader className="gap-4">
                    <DialogTitle className="font-medium">
                      {task.title}
                    </DialogTitle>
                    <DialogDescription>{task.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`text-xs font-light ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        className={`text-xs font-light ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </Badge>
                      {isOverdue && (
                        <Badge className="text-xs font-light bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {task.due_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span
                          className={`text-sm ${
                            isOverdue
                              ? "text-red-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
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
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900 font-medium">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {task.steps.filter((s) => s.completed).length} of{" "}
                        {task.steps.length} steps completed
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Steps</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {task.steps.length === 0 && (
                          <p className="text-xs text-gray-500">No steps.</p>
                        )}
                        {task.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start justify-between text-xs"
                          >
                            <div className="flex items-start space-x-2 flex-1">
                              <CheckCircle
                                className={`w-3 h-3 mt-0.5 ${
                                  step.completed
                                    ? "text-green-500"
                                    : "text-gray-300"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`block ${
                                    step.completed
                                      ? "line-through text-gray-500"
                                      : "text-gray-950"
                                  }`}
                                >
                                  {step.title}
                                </span>
                                {step.description && (
                                  <p
                                    className={`text-xs mt-1 text-gray-600 ${
                                      step.completed ? "line-through" : ""
                                    }`}
                                  >
                                    {step.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={`text-xs font-light ml-2 flex-shrink-0 ${getStepStatusColor(
                                step.status
                              )}`}
                            >
                              {step.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="text-[#B45309] border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                      >
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <AlertDialogContent className="p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                    >
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
