
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/task";
import { Edit, Trash2, Calendar, Tag } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask, getTaskProgress } = useTaskContext();
  const progress = getTaskProgress(task);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'status-todo';
      case 'In Progress': return 'status-progress';
      case 'Review': return 'status-review';
      case 'Completed': return 'status-completed';
      default: return 'status-todo';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed';

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            
            <div className="flex items-center space-x-2 mb-3">
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
              {isOverdue && (
                <Badge className="text-xs bg-red-100 text-red-800">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
              {task.steps.filter(s => s.completed).length} of {task.steps.length} steps completed
            </p>
          </div>
        )}
        
        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
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
