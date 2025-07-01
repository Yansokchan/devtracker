export interface TaskStep {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  due_date?: string;
  tags: string[];
  steps: TaskStep[];
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status: string[];
  priority: string[];
  search: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags: string[];
}
