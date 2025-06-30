
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskFilters } from '@/types/task';
import { sampleTasks } from '@/data/sampleTasks';

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filteredTasks: Task[];
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  getTaskProgress: (task: Task) => number;
  getOverallStats: () => {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow-tasks');
    return saved ? JSON.parse(saved) : sampleTasks;
  });

  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    search: '',
    tags: []
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  const addTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updated_at: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTaskProgress = (task: Task): number => {
    if (task.steps.length === 0) {
      return task.status === 'Completed' ? 100 : 0;
    }
    const completedSteps = task.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / task.steps.length) * 100);
  };

  const getOverallStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'Completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate
    };
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      filteredTasks,
      filters,
      setFilters,
      addTask,
      updateTask,
      deleteTask,
      getTaskProgress,
      getOverallStats
    }}>
      {children}
    </TaskContext.Provider>
  );
};
