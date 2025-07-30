import { TaskStep } from "@/types/task";

export function addStep(
  steps: TaskStep[],
  newStepTitle: string,
  newStepDescription: string,
  newStepStatus: "To Do" | "In Progress" | "Completed"
): TaskStep[] {
  if (newStepTitle.trim()) {
    const newStep: TaskStep = {
      id: Math.max(...steps.map((s) => s.id || 0), 0) + 1,
      title: newStepTitle.trim(),
      description: newStepDescription.trim() || undefined,
      completed: newStepStatus === "Completed",
      status: newStepStatus,
    };
    return [...steps, newStep];
  }
  return steps;
}

export function removeStep(steps: TaskStep[], stepId: number): TaskStep[] {
  return steps.filter((step) => step.id !== stepId);
}

export function toggleStepCompletion(
  steps: TaskStep[],
  stepId: number
): TaskStep[] {
  return steps.map((step) => {
    if (step.id === stepId) {
      const newCompleted = !step.completed;
      return {
        ...step,
        completed: newCompleted,
        status: (newCompleted ? "Completed" : "To Do") as
          | "To Do"
          | "In Progress"
          | "Completed",
      };
    }
    return step;
  });
}

export function updateStepStatus(
  steps: TaskStep[],
  stepId: number,
  status: "To Do" | "In Progress" | "Completed"
): TaskStep[] {
  return steps.map((step) => {
    if (step.id === stepId) {
      return {
        ...step,
        status: status,
        completed: status === "Completed",
      };
    }
    return step;
  });
}

export function getStepProgress(steps: TaskStep[]): number {
  if (steps.length === 0) return 0;
  const completedSteps = steps.filter((step) => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
}

export function getStepStatusColor(
  status: "To Do" | "In Progress" | "Completed"
): string {
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
}
