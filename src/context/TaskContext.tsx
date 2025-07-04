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

  // Fetch tasks and steps from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }
      // Fetch tasks for the current user only
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
      // Fetch all steps
      const { data: stepsData, error: stepsError } = await supabase
        .from("task_steps")
        .select("*");
      if (stepsError) {
        console.error("Error fetching steps:", stepsError);
      }
      // Combine steps into tasks
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
  }, [user]);

  // Filter tasks based on current filters
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

  // Add a new task and its steps
  const addTask = async (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    if (!user) {
      console.error("No user found for adding task");
      return;
    }
    // Insert task
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
    // Insert steps
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
  };

  // Update a task and its steps
  const updateTask = async (id: number, updates: Partial<Task>) => {
    // Update task
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
    // Update steps: delete all and re-insert (simple approach)
    if (updates.steps) {
      // Delete old steps
      const { error: delError } = await supabase
        .from("task_steps")
        .delete()
        .eq("task_id", id);
      if (delError) {
        console.error("Error deleting old steps:", delError);
      }
      // Insert new steps
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
    }
    // Refetch all tasks (for current user only)
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

  // Delete a task and its steps
  const deleteTask = async (id: number) => {
    // Delete task (steps will cascade)
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== id));
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
