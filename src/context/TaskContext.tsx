import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskFilters, TaskStep } from "@/types/task";
import { supabase } from "@/lib/supabaseClient";

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filteredTasks: Task[];
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  addTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTaskProgress: (task: Task) => number;
  getOverallStats: () => {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  loading: boolean;
  activityLogs: any[];
  setActivityLogs: React.Dispatch<React.SetStateAction<any[]>>;
  loadingActivityLogs: boolean;
  fetchActivityLogs: (limit?: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{
  children: React.ReactNode;
  user?: any;
}> = ({ children, user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    search: "",
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);

  const fetchActivityLogs = async (limit = 50) => {
    if (!user) {
      setActivityLogs([]);
      return;
    }
    setLoadingActivityLogs(true);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("Error fetching activity logs:", error);
      setActivityLogs([]);
    } else {
      setActivityLogs(data || []);
    }
    setLoadingActivityLogs(false);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        setTasks([]);
        setLoading(false);
        return;
      }
      const { data: stepsData, error: stepsError } = await supabase
        .from("task_steps")
        .select("*");
      if (stepsError) {
        console.error("Error fetching steps:", stepsError);
      }
      const tasksWithSteps: Task[] = (tasksData || []).map((task: any) => ({
        ...task,
        steps: (stepsData || [])
          .filter((step: any) => step.task_id === task.id)
          .map((step: any) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            completed: step.completed,
            status: step.status,
          })),
        tags: task.tags || [],
      }));
      setTasks(tasksWithSteps);
      setLoading(false);
    };
    fetchTasks();
    fetchActivityLogs();
  }, [user]);

  // --- Real-time subscription for activity_logs ---
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime-activity-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setActivityLogs((prev) => {
              // Prevent duplicates
              if (prev.find((log) => log.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  // --- End real-time subscription ---

  const filteredTasks = tasks.filter((task) => {
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (
      filters.priority.length > 0 &&
      !filters.priority.includes(task.priority)
    ) {
      return false;
    }
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.tags.length > 0 &&
      !filters.tags.some((tag) => task.tags.includes(tag))
    ) {
      return false;
    }
    return true;
  });

  const addTask = async (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    if (!user) {
      console.error("No user found for adding task");
      return;
    }
    const { data: insertedTask, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        due_date: taskData.due_date || null,
        tags: taskData.tags,
        user_id: user.id,
      })
      .select()
      .single();
    if (taskError || !insertedTask) {
      console.error("Error adding task:", taskError);
      return;
    }
    let steps: TaskStep[] = [];
    if (taskData.steps && taskData.steps.length > 0) {
      const { data: insertedSteps, error: stepsError } = await supabase
        .from("task_steps")
        .insert(
          taskData.steps.map((step, idx) => ({
            task_id: insertedTask.id,
            title: step.title,
            description: step.description,
            completed: step.completed,
            status: step.status,
            position: idx,
          }))
        )
        .select();
      if (stepsError) {
        console.error("Error adding steps:", stepsError);
      }
      steps = (insertedSteps || []).map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        completed: step.completed,
        status: step.status,
      }));
    }
    setTasks((prev) => [
      {
        ...insertedTask,
        steps,
        tags: insertedTask.tags || [],
      },
      ...prev,
    ]);
    try {
      await logActivity(
        "create",
        insertedTask.id.toString(),
        `Created task: ${insertedTask.title}`,
        insertedTask.title
      );
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    // Get the current task to compare changes
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) {
      console.error("Task not found for update");
      return;
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        status: updates.status,
        due_date: updates.due_date || null,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (taskError) {
      console.error("Error updating task:", taskError);
      return;
    }

    // Log specific field changes
    try {
      if (updates.status && updates.status !== currentTask.status) {
        await logTaskUpdate(
          id,
          "Status",
          currentTask.status,
          updates.status,
          currentTask.title
        );
      }
      if (updates.priority && updates.priority !== currentTask.priority) {
        await logTaskUpdate(
          id,
          "Priority",
          currentTask.priority,
          updates.priority,
          currentTask.title
        );
      }
      if (
        updates.due_date !== undefined &&
        updates.due_date !== currentTask.due_date
      ) {
        const oldDate = currentTask.due_date || "No due date";
        const newDate = updates.due_date || "No due date";
        await logTaskUpdate(
          id,
          "Due date",
          oldDate,
          newDate,
          currentTask.title
        );
      }
      if (updates.title && updates.title !== currentTask.title) {
        await logTaskUpdate(
          id,
          "Title",
          currentTask.title,
          updates.title,
          currentTask.title
        );
      }
      if (
        updates.description &&
        updates.description !== currentTask.description
      ) {
        await logTaskUpdate(
          id,
          "Description",
          "Previous description",
          "Updated description",
          currentTask.title
        );
      }
      if (
        updates.tags &&
        JSON.stringify(updates.tags) !== JSON.stringify(currentTask.tags)
      ) {
        await logTaskUpdate(
          id,
          "Tags",
          currentTask.tags.join(", ") || "No tags",
          updates.tags.join(", ") || "No tags",
          currentTask.title
        );
      }
    } catch (e) {
      console.error("Failed to log specific changes:", e);
    }

    if (updates.steps) {
      const { error: delError } = await supabase
        .from("task_steps")
        .delete()
        .eq("task_id", id);
      if (delError) {
        console.error("Error deleting old steps:", delError);
      }
      if (updates.steps.length > 0) {
        const { error: insError } = await supabase.from("task_steps").insert(
          updates.steps.map((step, idx) => ({
            task_id: id,
            title: step.title,
            description: step.description,
            completed: step.completed,
            status: step.status,
            position: idx,
          }))
        );
        if (insError) {
          console.error("Error inserting new steps:", insError);
        }
      }

      // Log step changes
      try {
        // Log added steps
        const oldStepTitles = currentTask.steps.map((s) => s.title);
        const newStepTitles = updates.steps.map((s) => s.title);
        const addedSteps = newStepTitles.filter(
          (title) => !oldStepTitles.includes(title)
        );
        if (addedSteps.length > 0) {
          await logTaskUpdate(
            id,
            "Steps added",
            "-",
            addedSteps.join(", "),
            currentTask.title
          );
        }

        // Log completed step count change
        const oldCompletedSteps = currentTask.steps.filter(
          (step) => step.completed
        ).length;
        const newCompletedSteps = updates.steps.filter(
          (step) => step.completed
        ).length;
        if (oldCompletedSteps !== newCompletedSteps) {
          await logTaskUpdate(
            id,
            "Step status",
            `${oldCompletedSteps} completed`,
            `${newCompletedSteps} completed`,
            currentTask.title
          );
        }
      } catch (e) {
        console.error("Failed to log step changes:", e);
      }
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const { data: stepsData } = await supabase.from("task_steps").select("*");
    const tasksWithSteps: Task[] = (tasksData || []).map((task: any) => ({
      ...task,
      steps: (stepsData || [])
        .filter((step: any) => step.task_id === task.id)
        .map((step: any) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          completed: step.completed,
          status: step.status,
        })),
      tags: task.tags || [],
    }));
    setTasks(tasksWithSteps);
  };

  const deleteTask = async (id: number) => {
    // Get task title before deletion for logging
    const taskToDelete = tasks.find((task) => task.id === id);
    const taskTitle = taskToDelete?.title || `Task ${id}`;

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== id));
    try {
      await logActivity(
        "delete",
        id.toString(),
        `Deleted task: ${taskTitle}`,
        taskTitle
      );
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  const getTaskProgress = (task: Task): number => {
    if (task.steps.length === 0) {
      return task.status === "Completed" ? 100 : 0;
    }
    const completedSteps = task.steps.filter((step) => step.completed).length;
    return Math.round((completedSteps / task.steps.length) * 100);
  };

  const getOverallStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== "Completed"
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate,
    };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        filteredTasks,
        filters,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        getTaskProgress,
        getOverallStats,
        loading,
        activityLogs,
        setActivityLogs,
        loadingActivityLogs,
        fetchActivityLogs,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

async function logActivity(
  action: string,
  taskId: string,
  details?: string,
  taskTitle?: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  await supabase.from("activity_logs").insert([
    {
      user_id: user.id,
      task_id: taskId,
      action,
      details,
      task_title: taskTitle,
    },
  ]);
}

async function logTaskUpdate(
  taskId: number,
  field: string,
  oldValue: any,
  newValue: any,
  taskTitle?: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const details = `${field}: ${oldValue} → ${newValue}`;
  await supabase.from("activity_logs").insert([
    {
      user_id: user.id,
      task_id: taskId.toString(),
      action: "edit",
      details,
      task_title: taskTitle,
    },
  ]);
}
