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
import DatePicker from "@/components/DatePicker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Loader2 } from "lucide-react";

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

import { supabase } from "@/lib/supabaseClient";
import { aiGenerate } from "@/lib/aiGenerate";
import {
  addStep,
  removeStep,
  toggleStepCompletion,
  updateStepStatus,
  getStepProgress,
  getStepStatusColor,
} from "@/lib/stepUtils";
import {
  addTag as addTagUtil,
  removeTag as removeTagUtil,
  handleTagKeyPress,
} from "@/lib/tagUtils";
import {
  updateAiGenerateLimit as updateAiGenerateLimitUtil,
  updateTaskLimit as updateTaskLimitUtil,
  fetchLimits,
} from "@/lib/limitUtils";
import TaskStepsSection from "./Sections/TaskStepsSection";
import TaskTagsSection from "./Sections/TaskTagsSection";
import TaskAISettingsSection from "./Sections/TaskAISettingsSection";
import PlanUpgradeAlertDialog from "./AlertDialogs/PlanUpgradeAlertDialog";
import TaskLimitAlertDialog from "./AlertDialogs/TaskLimitAlertDialog";

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
  "AIzaSyByQNKlr_7KtALagsF_Y2W3iyhX83n81Kk"; // Place your Gemini API key in .env as VITE_GEMINI_API_KEY

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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
      // Set selected date for date picker
      setSelectedDate(task.due_date ? new Date(task.due_date) : undefined);
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
      setSelectedDate(undefined);
    }
    setShowUpdateConfirm(false);
  }, [isOpen, task, form]);

  // Remove in-component step/tag/limit functions and replace with wrappers using the utilities

  // Tag management
  const addTag = () => {
    const updated = addTagUtil(form.getValues("tags"), newTag);
    form.setValue("tags", updated);
    setNewTag("");
  };
  const removeTag = (tagToRemove: string) => {
    const updated = removeTagUtil(form.getValues("tags"), tagToRemove);
    form.setValue("tags", updated);
  };
  const handleKeyPress = (e: React.KeyboardEvent) =>
    handleTagKeyPress(e, addTag);

  // Step management
  const handleAddStep = () => {
    setSteps((prev) =>
      addStep(prev, newStepTitle, newStepDescription, newStepStatus)
    );
    setNewStepTitle("");
    setNewStepDescription("");
    setNewStepStatus("To Do");
  };
  const handleRemoveStep = (stepId: number) =>
    setSteps((prev) => removeStep(prev, stepId));
  const handleToggleStepCompletion = (stepId: number) =>
    setSteps((prev) => toggleStepCompletion(prev, stepId));
  const handleUpdateStepStatus = (
    stepId: number,
    status: "To Do" | "In Progress" | "Completed"
  ) => setSteps((prev) => updateStepStatus(prev, stepId, status));
  const handleGetStepProgress = () => getStepProgress(steps);
  const handleGetStepStatusColor = (status: string) =>
    getStepStatusColor(status as "To Do" | "In Progress" | "Completed");

  // Limit management
  const updateAiGenerateLimit = (newLimit: number) =>
    updateAiGenerateLimitUtil(newLimit, setAiGenerateLimit);
  const updateTaskLimit = (newLimit: number) =>
    updateTaskLimitUtil(newLimit, setTaskLimit);

  // Fetch limits on dialog open
  useEffect(() => {
    if (isOpen) {
      fetchLimits(
        setAiGenerateLimit,
        setTaskLimit,
        setAiLimitLoading,
        setTaskLimitLoading
      );
    }
  }, [isOpen]);

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

  const handleStepKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingStep !== null) {
        saveStepEdit();
      } else {
        handleAddStep();
      }
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    // Update form value in YYYY-MM-DD format for database
    const dateString = date ? date.toISOString().split("T")[0] : "";
    form.setValue("due_date", dateString);
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
      const suggestions = await aiGenerate({
        title,
        description,
        tagCount,
        stepCount,
        apiKey: GEMINI_API_KEY,
      });
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

              <div>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  label="Due Date"
                  placeholder="Pick a date"
                />
              </div>

              <TaskTagsSection
                tags={form.watch("tags")}
                newTag={newTag}
                setNewTag={setNewTag}
                addTag={addTag}
                removeTag={removeTag}
                handleKeyPress={handleKeyPress}
              />

              <TaskStepsSection
                steps={steps}
                newStepTitle={newStepTitle}
                setNewStepTitle={setNewStepTitle}
                newStepDescription={newStepDescription}
                setNewStepDescription={setNewStepDescription}
                newStepStatus={newStepStatus}
                setNewStepStatus={setNewStepStatus}
                editingStep={editingStep}
                editStepTitle={editStepTitle}
                setEditStepTitle={setEditStepTitle}
                editStepDescription={editStepDescription}
                setEditStepDescription={setEditStepDescription}
                editStepStatus={editStepStatus}
                setEditStepStatus={setEditStepStatus}
                handleAddStep={handleAddStep}
                handleRemoveStep={handleRemoveStep}
                handleToggleStepCompletion={handleToggleStepCompletion}
                handleUpdateStepStatus={handleUpdateStepStatus}
                startEditingStep={startEditingStep}
                saveStepEdit={saveStepEdit}
                cancelStepEdit={cancelStepEdit}
                handleStepKeyPress={handleStepKeyPress}
                getStepProgress={handleGetStepProgress}
                getStepStatusColor={handleGetStepStatusColor}
              />

              <TaskAISettingsSection
                tagCount={tagCount}
                setTagCount={setTagCount}
                stepCount={stepCount}
                setStepCount={setStepCount}
                aiLimitLoading={aiLimitLoading}
                aiGenerateLimit={aiGenerateLimit}
                taskLimitLoading={taskLimitLoading}
                taskLimit={taskLimit}
              />
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
            <PlanUpgradeAlertDialog
              open={showPlanAlert}
              onOpenChange={setShowPlanAlert}
            />

            {/* Task Limit Alert Dialog */}
            <TaskLimitAlertDialog
              open={showTaskLimitAlert}
              onOpenChange={setShowTaskLimitAlert}
              onUpgrade={async () => {
                setShowTaskLimitAlert(false);
                await openPlanCardsDialog();
              }}
            />

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
