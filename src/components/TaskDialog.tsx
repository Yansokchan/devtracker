import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Task, TaskStep } from "@/types/task";
import { useTaskContext } from "@/context/TaskContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Edit, Trash2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  status: z.enum(["To Do", "In Progress", "Review", "Completed"]),
  due_date: z.string().optional(),
  tags: z.array(z.string()),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskDialog({ isOpen, onClose, task }: TaskDialogProps) {
  const { addTask, updateTask } = useTaskContext();
  const [newTag, setNewTag] = useState("");
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepStatus, setNewStepStatus] = useState<'To Do' | 'In Progress' | 'Completed'>('To Do');
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepDescription, setEditStepDescription] = useState("");
  const [editStepStatus, setEditStepStatus] = useState<'To Do' | 'In Progress' | 'Completed'>('To Do');
  const isEdit = !!task;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "To Do",
      due_date: "",
      tags: [],
    },
  });

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (isOpen && task) {
      form.reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
        tags: task.tags,
      });
      setSteps(task.steps || []);
    } else if (isOpen && !task) {
      form.reset({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        due_date: "",
        tags: [],
      });
      setSteps([]);
    }
  }, [isOpen, task, form]);

  const onSubmit = (data: TaskFormData) => {
    if (isEdit && task) {
      updateTask(task.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || undefined,
        tags: data.tags,
        steps: steps,
      });
    } else {
      addTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || undefined,
        tags: data.tags,
        steps: steps,
      });
    }
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addStep = () => {
    if (newStepTitle.trim()) {
      const newStep: TaskStep = {
        id: Math.max(...steps.map(s => s.id || 0), 0) + 1,
        title: newStepTitle.trim(),
        description: newStepDescription.trim() || undefined,
        completed: newStepStatus === 'Completed',
        status: newStepStatus,
      };
      setSteps([...steps, newStep]);
      setNewStepTitle("");
      setNewStepDescription("");
      setNewStepStatus('To Do');
    }
  };

  const removeStep = (stepId: number) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const toggleStepCompletion = (stepId: number) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newCompleted = !step.completed;
        return { 
          ...step, 
          completed: newCompleted,
          status: newCompleted ? 'Completed' : 'To Do'
        };
      }
      return step;
    }));
  };

  const updateStepStatus = (stepId: number, status: 'To Do' | 'In Progress' | 'Completed') => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return { 
          ...step, 
          status,
          completed: status === 'Completed'
        };
      }
      return step;
    }));
  };

  const startEditingStep = (step: TaskStep) => {
    setEditingStep(step.id);
    setEditStepTitle(step.title);
    setEditStepDescription(step.description || "");
    setEditStepStatus(step.status);
  };

  const saveStepEdit = () => {
    if (editingStep !== null && editStepTitle.trim()) {
      setSteps(steps.map(step =>
        step.id === editingStep
          ? { 
              ...step, 
              title: editStepTitle.trim(), 
              description: editStepDescription.trim() || undefined,
              status: editStepStatus,
              completed: editStepStatus === 'Completed'
            }
          : step
      ));
      setEditingStep(null);
      setEditStepTitle("");
      setEditStepDescription("");
      setEditStepStatus('To Do');
    }
  };

  const cancelStepEdit = () => {
    setEditingStep(null);
    setEditStepTitle("");
    setEditStepDescription("");
    setEditStepStatus('To Do');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleStepKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingStep !== null) {
        saveStepEdit();
      } else {
        addStep();
      }
    }
  };

  const getStepProgress = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Tags</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" onClick={addTag} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags").map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <FormLabel>Steps</FormLabel>
                
                {/* Steps Progress Summary */}
                {steps.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="text-gray-900 font-medium">{getStepProgress()}%</span>
                    </div>
                    <Progress value={getStepProgress()} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {steps.filter(s => s.completed).length} of {steps.length} steps completed
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Step title"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      onKeyPress={handleStepKeyPress}
                      className="col-span-4"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newStepDescription}
                      onChange={(e) => setNewStepDescription(e.target.value)}
                      onKeyPress={handleStepKeyPress}
                      className="col-span-4"
                    />
                    <Select value={newStepStatus} onValueChange={(value: 'To Do' | 'In Progress' | 'Completed') => setNewStepStatus(value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addStep} size="icon" variant="outline" className="col-span-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStepCompletion(step.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        {editingStep === step.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editStepTitle}
                              onChange={(e) => setEditStepTitle(e.target.value)}
                              onKeyPress={handleStepKeyPress}
                              placeholder="Step title"
                            />
                            <Input
                              value={editStepDescription}
                              onChange={(e) => setEditStepDescription(e.target.value)}
                              onKeyPress={handleStepKeyPress}
                              placeholder="Step description (optional)"
                            />
                            <Select value={editStepStatus} onValueChange={(value: 'To Do' | 'In Progress' | 'Completed') => setEditStepStatus(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex space-x-2">
                              <Button type="button" onClick={saveStepEdit} size="sm" variant="outline">
                                Save
                              </Button>
                              <Button type="button" onClick={cancelStepEdit} size="sm" variant="outline">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-medium ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                {step.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getStepStatusColor(step.status)}`}>
                                  {step.status}
                                </Badge>
                                <Select 
                                  value={step.status} 
                                  onValueChange={(value: 'To Do' | 'In Progress' | 'Completed') => updateStepStatus(step.id, value)}
                                >
                                  <SelectTrigger className="h-6 w-20 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {step.description && (
                              <p className={`text-sm text-gray-600 ${step.completed ? 'line-through' : ''}`}>
                                {step.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          onClick={() => startEditingStep(step)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                {isEdit ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
