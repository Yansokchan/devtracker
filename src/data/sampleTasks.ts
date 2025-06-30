
import { Task } from '@/types/task';

export const sampleTasks: Task[] = [
  {
    id: 1,
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new product landing page",
    priority: "High",
    status: "In Progress",
    due_date: "2024-07-15",
    tags: ["design", "website", "ui/ux"],
    steps: [
      { id: 1, title: "Research competitor pages", completed: true },
      { id: 2, title: "Create wireframes", completed: true },
      { id: 3, title: "Design mockups", completed: false },
      { id: 4, title: "Get stakeholder approval", completed: false }
    ],
    created_at: "2024-07-01",
    updated_at: "2024-07-10"
  },
  {
    id: 2,
    title: "Write API documentation",
    description: "Document all REST API endpoints with examples",
    priority: "Medium",
    status: "To Do",
    due_date: "2024-07-20",
    tags: ["documentation", "api", "backend"],
    steps: [],
    created_at: "2024-07-05",
    updated_at: "2024-07-05"
  },
  {
    id: 3,
    title: "Fix authentication bug",
    description: "Users getting logged out unexpectedly on mobile devices",
    priority: "Critical",
    status: "Review",
    due_date: "2024-07-12",
    tags: ["bug", "authentication", "mobile"],
    steps: [
      { id: 1, title: "Reproduce the issue", completed: true },
      { id: 2, title: "Identify root cause", completed: true },
      { id: 3, title: "Implement fix", completed: true },
      { id: 4, title: "Test on multiple devices", completed: false },
      { id: 5, title: "Deploy to production", completed: false }
    ],
    created_at: "2024-07-08",
    updated_at: "2024-07-11"
  },
  {
    id: 4,
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment pipeline",
    priority: "Medium",
    status: "Completed",
    due_date: "2024-07-10",
    tags: ["devops", "automation", "deployment"],
    steps: [
      { id: 1, title: "Setup GitHub Actions", completed: true },
      { id: 2, title: "Configure testing", completed: true },
      { id: 3, title: "Setup deployment", completed: true }
    ],
    created_at: "2024-06-28",
    updated_at: "2024-07-09"
  },
  {
    id: 5,
    title: "User research interviews",
    description: "Conduct interviews with 10 users to gather feedback",
    priority: "High",
    status: "In Progress",
    due_date: "2024-07-25",
    tags: ["research", "ux", "interviews"],
    steps: [
      { id: 1, title: "Recruit participants", completed: true },
      { id: 2, title: "Prepare interview questions", completed: true },
      { id: 3, title: "Conduct interviews", completed: false },
      { id: 4, title: "Analyze findings", completed: false },
      { id: 5, title: "Create summary report", completed: false }
    ],
    created_at: "2024-07-03",
    updated_at: "2024-07-12"
  }
];
