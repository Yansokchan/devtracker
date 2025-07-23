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
  DialogDescription,
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
import { X, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
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
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabaseClient";
import PlanCards from "./PlanCards";
import {
  Dialog as PlanDialog,
  DialogContent as PlanDialogContent,
} from "@/components/ui/dialog";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
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

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyCnI5o3lH6wxynyJuMlO50j60g1kgDdHUY"; // Place your Gemini API key in .env as VITE_GEMINI_API_KEY

export function TaskDialog({ isOpen, onClose, task }: TaskDialogProps) {
  const { addTask, updateTask } = useTaskContext();
  const [newTag, setNewTag] = useState("");
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepStatus, setNewStepStatus] = useState<
    "To Do" | "In Progress" | "Completed"
  >("To Do");
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepDescription, setEditStepDescription] = useState("");
  const [editStepStatus, setEditStepStatus] = useState<
    "To Do" | "In Progress" | "Completed"
  >("To Do");
  const isEdit = !!task;
  const [loading, setLoading] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagCount, setTagCount] = useState(3); // default 3 tags
  const [stepCount, setStepCount] = useState(5); // default 5 steps
  const [aiGenerateLimit, setAiGenerateLimit] = useState<number | null>(null);
  const [aiLimitLoading, setAiLimitLoading] = useState(false);
  const [showPlanAlert, setShowPlanAlert] = useState(false);
  const [taskLimit, setTaskLimit] = useState<number | null>(null);
  const [taskLimitLoading, setTaskLimitLoading] = useState(false);
  const [showTaskLimitAlert, setShowTaskLimitAlert] = useState(false);
  const [showPlanCardsDialog, setShowPlanCardsDialog] = useState(false);
  const [planCardsUser, setPlanCardsUser] = useState<any>(null);

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
    setShowUpdateConfirm(false);
  }, [isOpen, task, form]);

  // Fetch ai_generate_limit on dialog open
  useEffect(() => {
    async function fetchLimits() {
      setAiLimitLoading(true);
      setTaskLimitLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("Failed to get user:", userError);
          setAiGenerateLimit(null);
          setTaskLimit(null);
          setAiLimitLoading(false);
          setTaskLimitLoading(false);
          return;
        }

        console.log("Fetching limits for user:", user.id);

        const { data, error } = await supabase
          .from("users")
          .select("ai_generate_limit, task_limit")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Failed to fetch limits:", error);
          setAiGenerateLimit(null);
          setTaskLimit(null);
        } else if (data) {
          console.log("Current AI generate limit:", data.ai_generate_limit);
          console.log("Current task limit:", data.task_limit);
          setAiGenerateLimit(data.ai_generate_limit);
          setTaskLimit(data.task_limit);
        } else {
          console.warn("No limits data found");
          setAiGenerateLimit(null);
          setTaskLimit(null);
        }
      } catch (err) {
        console.error("Error in fetchLimits:", err);
        setAiGenerateLimit(null);
        setTaskLimit(null);
      } finally {
        setAiLimitLoading(false);
        setTaskLimitLoading(false);
      }
    }

    if (isOpen) {
      fetchLimits();
    }
  }, [isOpen]);

  // Function to update AI generate limit
  const updateAiGenerateLimit = async (newLimit: number) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Failed to get user for AI limit update:", userError);
        return false;
      }

      console.log(
        `Attempting to update AI limit to ${newLimit} for user ${user.id}`
      );

      // Update the ai_generate_limit field
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          ai_generate_limit: newLimit,
        })
        .eq("id", user.id)
        .select("ai_generate_limit");

      if (updateError) {
        console.error("Supabase update error:", updateError);
        console.error("Error details:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        return false;
      }

      if (data && data.length > 0) {
        console.log(
          "AI limit updated successfully:",
          data[0].ai_generate_limit
        );
        setAiGenerateLimit(data[0].ai_generate_limit);
        return true;
      } else {
        console.warn("Update succeeded but no data returned");
        setAiGenerateLimit(newLimit);
        return true;
      }
    } catch (err) {
      console.error("Exception in updateAiGenerateLimit:", err);
      return false;
    }
  };

  // Function to update task limit
  const updateTaskLimit = async (newLimit: number) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Failed to get user for task limit update:", userError);
        return false;
      }

      console.log(
        `Attempting to update task limit to ${newLimit} for user ${user.id}`
      );

      // Update the task_limit field
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          task_limit: newLimit,
        })
        .eq("id", user.id)
        .select("task_limit");

      if (updateError) {
        console.error("Supabase update error:", updateError);
        console.error("Error details:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        return false;
      }

      if (data && data.length > 0) {
        console.log("Task limit updated successfully:", data[0].task_limit);
        setTaskLimit(data[0].task_limit);
        return true;
      } else {
        console.warn("Update succeeded but no data returned");
        setTaskLimit(newLimit);
        return true;
      }
    } catch (err) {
      console.error("Exception in updateTaskLimit:", err);
      return false;
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    // Validation: If task has steps, all must be completed before marking as Completed
    if (
      steps.length > 0 &&
      data.status === "Completed" &&
      steps.some((step) => !step.completed)
    ) {
      toast({
        title: "Cannot complete task",
        description:
          "All steps must be completed before marking the task as completed.",
      });
      setLoading(false);
      return;
    }
    try {
      if (isEdit && task) {
        await updateTask(task.id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date || undefined,
          tags: data.tags,
          steps: steps,
        });
        toast({
          title: "Task updated",
          description: `Task '${data.title}' was updated successfully.`,
        });
      } else {
        // Check task limit before adding a new task (skip if unlimited)
        if (taskLimit !== null && taskLimit !== -1 && taskLimit <= 0) {
          setShowTaskLimitAlert(true);
          setLoading(false);
          return;
        }
        await addTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date || undefined,
          tags: data.tags,
          steps: steps,
        });
        toast({
          title: "Task created",
          description: `Task '${data.title}' was created successfully.`,
        });

        // Decrement task limit after successful creation (skip if unlimited)
        if (taskLimit !== null && taskLimit !== -1) {
          const newLimit = taskLimit - 1;
          console.log(`Updating task limit: ${taskLimit} → ${newLimit}`);
          const updateSuccess = await updateTaskLimit(newLimit);
          if (!updateSuccess) {
            toast({
              title: "Failed to update task limit",
              description: "Could not update your task limit. Please refresh.",
              variant: "destructive",
              className: "bg-[#f8f4ee] shadow-lg",
            });
          }
        } else if (taskLimit === -1) {
          console.log("Task limit is unlimited (-1), no update needed");
        }
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (data: TaskFormData) => {
    setShowUpdateConfirm(true);
    // on confirmation, call onSubmit(data)
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
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addStep = () => {
    if (newStepTitle.trim()) {
      const newStep: TaskStep = {
        id: Math.max(...steps.map((s) => s.id || 0), 0) + 1,
        title: newStepTitle.trim(),
        description: newStepDescription.trim() || undefined,
        completed: newStepStatus === "Completed",
        status: newStepStatus,
      };
      setSteps([...steps, newStep]);
      setNewStepTitle("");
      setNewStepDescription("");
      setNewStepStatus("To Do");
    }
  };

  const removeStep = (stepId: number) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const toggleStepCompletion = (stepId: number) => {
    setSteps(
      steps.map((step) => {
        if (step.id === stepId) {
          const newCompleted = !step.completed;
          return {
            ...step,
            completed: newCompleted,
            status: newCompleted ? "Completed" : "To Do",
          };
        }
        return step;
      })
    );
  };

  const updateStepStatus = (
    stepId: number,
    status: "To Do" | "In Progress" | "Completed"
  ) => {
    setSteps(
      steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            status,
            completed: status === "Completed",
          };
        }
        return step;
      })
    );
  };

  const startEditingStep = (step: TaskStep) => {
    setEditingStep(step.id);
    setEditStepTitle(step.title);
    setEditStepDescription(step.description || "");
    setEditStepStatus(step.status);
  };

  const saveStepEdit = () => {
    if (editingStep !== null && editStepTitle.trim()) {
      setSteps(
        steps.map((step) =>
          step.id === editingStep
            ? {
                ...step,
                title: editStepTitle.trim(),
                description: editStepDescription.trim() || undefined,
                status: editStepStatus,
                completed: editStepStatus === "Completed",
              }
            : step
        )
      );
      setEditingStep(null);
      setEditStepTitle("");
      setEditStepDescription("");
      setEditStepStatus("To Do");
    }
  };

  const cancelStepEdit = () => {
    setEditingStep(null);
    setEditStepTitle("");
    setEditStepDescription("");
    setEditStepStatus("To Do");
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
    const completedSteps = steps.filter((step) => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
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

  const handleAIGenerate = async () => {
    console.log("AI Generate clicked. Current limit:", aiGenerateLimit);

    // Check AI limit before proceeding (skip if unlimited)
    if (
      !aiLimitLoading &&
      aiGenerateLimit !== null &&
      aiGenerateLimit !== -1 &&
      aiGenerateLimit <= 0
    ) {
      console.log("AI limit reached (0), showing upgrade dialog");
      setShowPlanAlert(true);
      return;
    }

    const { title, description } = form.getValues();
    if (!title || !description) {
      toast({
        title: "Please enter a title and description first.",
        variant: "destructive",
        className: "bg-[#f8f4ee] shadow-lg",
      });
      return;
    }

    setAiLoading(true);
    try {
      console.log("Starting AI generation with limit:", aiGenerateLimit);

      const prompt = `Given the following task title and description, generate:\n1. A list of exactly ${tagCount} relevant tags (as a JSON array of strings).\n2. A list of exactly ${stepCount} step objects (as a JSON array), each with \"title\" and \"description\".\n\nTask Title: ${title}\nTask Description: ${description}\n\nRespond with only valid JSON, no explanation, no markdown, and no code block.\n{\n  \"tags\": [...],\n  \"steps\": [{\"title\": \"...\", \"description\": \"...\"}, ...]\n}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch AI suggestions");
      const data = await response.json();
      console.log("Gemini API raw response:", data);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Gemini API text:", text);

      // Extract JSON from markdown code block if present
      let jsonText = text;
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }
      let suggestions;
      try {
        suggestions = JSON.parse(jsonText);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", jsonText);
        throw new Error("AI response was not valid JSON");
      }

      if (Array.isArray(suggestions.tags)) {
        form.setValue("tags", suggestions.tags);
      }
      if (Array.isArray(suggestions.steps)) {
        setSteps(
          suggestions.steps.map((step: any, idx: number) => ({
            id: Date.now() + idx,
            title: step.title,
            description: step.description,
            completed: false,
            status: "To Do",
          }))
        );
      }

      console.log(
        "AI generation successful, updating limit from",
        aiGenerateLimit
      );

      // Decrement AI limit if not unlimited
      if (aiGenerateLimit !== null && aiGenerateLimit !== -1) {
        const newLimit = aiGenerateLimit - 1;
        console.log(`Updating AI limit: ${aiGenerateLimit} → ${newLimit}`);

        const updateSuccess = await updateAiGenerateLimit(newLimit);

        if (!updateSuccess) {
          toast({
            title: "Failed to update AI limit",
            description:
              "Could not update your AI generate limit. Please refresh.",
            variant: "destructive",
            className: "bg-[#f8f4ee] shadow-lg",
          });
        }
      } else if (aiGenerateLimit === -1) {
        console.log("AI limit is unlimited (-1), no update needed");
      }

      toast({
        title: "AI Suggestions Applied",
        description: "Tags and steps have been generated.",
        className: "bg-[#f8f4ee] shadow-lg",
      });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
        className: "bg-[#f8f4ee] shadow-lg",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // When opening PlanCards dialog, fetch user
  const openPlanCardsDialog = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setPlanCardsUser(user);
    setShowPlanCardsDialog(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of your task below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={
              isEdit
                ? form.handleSubmit(handleUpdate)
                : form.handleSubmit(onSubmit)
            }
            className="space-y-6"
          >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#fdf7f7]">
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#fdf7f7]">
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
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
                  <Button
                    type="button"
                    onClick={addTag}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 text-[#B45309]" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags").map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
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
                      <span className="text-gray-900 font-medium">
                        {getStepProgress()}%
                      </span>
                    </div>
                    <Progress value={getStepProgress()} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {steps.filter((s) => s.completed).length} of{" "}
                      {steps.length} steps completed
                    </p>
                  </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Step title"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      onKeyPress={handleStepKeyPress}
                      className="col-span-4 outline-none"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newStepDescription}
                      onChange={(e) => setNewStepDescription(e.target.value)}
                      onKeyPress={handleStepKeyPress}
                      className="col-span-4 outline-none"
                    />
                    <Select
                      value={newStepStatus}
                      onValueChange={(
                        value: "To Do" | "In Progress" | "Completed"
                      ) => setNewStepStatus(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#fdf7f7]">
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addStep}
                      size="icon"
                      variant="outline"
                      className="col-span-1"
                    >
                      <Plus className="w-4 h-4 text-[#B45309]" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start space-x-2 p-3 border rounded-lg"
                    >
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
                              onChange={(e) =>
                                setEditStepDescription(e.target.value)
                              }
                              onKeyPress={handleStepKeyPress}
                              placeholder="Step description (optional)"
                            />
                            <Select
                              value={editStepStatus}
                              onValueChange={(
                                value: "To Do" | "In Progress" | "Completed"
                              ) => setEditStepStatus(value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#fdf7f7]">
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Completed">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                onClick={saveStepEdit}
                                size="sm"
                                variant="outline"
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                onClick={cancelStepEdit}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`font-medium ${
                                  step.completed
                                    ? "line-through text-gray-500"
                                    : ""
                                }`}
                              >
                                {step.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={`text-xs ${getStepStatusColor(
                                    step.status
                                  )}`}
                                >
                                  {step.status}
                                </Badge>
                                <Select
                                  value={step.status}
                                  onValueChange={(
                                    value: "To Do" | "In Progress" | "Completed"
                                  ) => updateStepStatus(step.id, value)}
                                >
                                  <SelectTrigger className="h-6 w-20 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#fdf7f7]">
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="Completed">
                                      Completed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {step.description && (
                              <p
                                className={`text-sm text-gray-600 ${
                                  step.completed ? "line-through" : ""
                                }`}
                              >
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

              <div className="space-y-3">
                <FormLabel>AI Generation Settings</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Number of Tags
                      </span>
                      <span className="text-xs text-gray-900 font-medium">
                        {tagCount}
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[tagCount]}
                      onValueChange={([val]) => setTagCount(val)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Number of Steps
                      </span>
                      <span className="text-xs text-gray-900 font-medium">
                        {stepCount}
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[stepCount]}
                      onValueChange={([val]) => setStepCount(val)}
                      className="w-full"
                    />
                  </div>
                </div>
                {/* Show AI limit info */}
                <div className="mt-2 text-xs text-gray-500">
                  {aiLimitLoading ? (
                    <span>Loading AI generate limit...</span>
                  ) : aiGenerateLimit === -1 ? (
                    <span>
                      AI Generate Limit: <b>Unlimited</b>
                    </span>
                  ) : aiGenerateLimit !== null ? (
                    <span>
                      AI Generate Limit left: <b>{aiGenerateLimit}</b>
                    </span>
                  ) : (
                    <span>
                      AI Generate Limit: <b>?</b>
                    </span>
                  )}
                </div>
                {/* Show Task limit info */}
                <div className="mt-1 text-xs text-gray-500">
                  {taskLimitLoading ? (
                    <span>Loading task limit...</span>
                  ) : taskLimit === -1 ? (
                    <span>
                      Task Limit: <b>Unlimited</b>
                    </span>
                  ) : taskLimit !== null ? (
                    <span>
                      Task Limit left: <b>{taskLimit}</b>
                    </span>
                  ) : (
                    <span>
                      Task Limit: <b>?</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="mb-4 border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>

            {/* Plan Upgrade Alert Dialog */}
            <AlertDialog open={showPlanAlert} onOpenChange={setShowPlanAlert}>
              <AlertDialogContent className="p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle>AI Generate Limit Reached</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have reached your daily AI generation limit. Upgrade
                    your plan to get more AI generations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowPlanAlert(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setShowPlanAlert(false);
                      await openPlanCardsDialog();
                    }}
                    className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                  >
                    Upgrade Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* PlanCards Dialog */}
            <PlanDialog
              open={showPlanCardsDialog}
              onOpenChange={setShowPlanCardsDialog}
            >
              <PlanDialogContent className="max-w-full bg-transparent border-none shadow-none z-[100] flex items-center justify-center min-h-screen h-screen overflow-y-hidden">
                {planCardsUser && <PlanCards user={planCardsUser} />}
              </PlanDialogContent>
            </PlanDialog>

            {/* Task Limit Alert Dialog */}
            <AlertDialog
              open={showTaskLimitAlert}
              onOpenChange={setShowTaskLimitAlert}
            >
              <AlertDialogContent className="p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle>Task Limit Reached</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have reached your daily task limit. Upgrade your plan to
                    create more tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowPlanAlert(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setShowPlanAlert(false);
                      await openPlanCardsDialog();
                    }}
                    className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                  >
                    Upgrade Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                className="text-[#B45309] border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              {isEdit ? (
                <AlertDialog
                  open={showUpdateConfirm}
                  onOpenChange={setShowUpdateConfirm}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      type="submit"
                      className="gradient-primary border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] text-white flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Task"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="p-6">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update this task? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={form.handleSubmit(onSubmit)}
                        className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Yes, update"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  type="submit"
                  className="gradient-primary text-white border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba] flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
