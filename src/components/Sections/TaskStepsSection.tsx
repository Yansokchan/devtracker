import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { TaskStep } from "@/types/task";

interface TaskStepsSectionProps {
  steps: TaskStep[];
  newStepTitle: string;
  setNewStepTitle: (v: string) => void;
  newStepDescription: string;
  setNewStepDescription: (v: string) => void;
  newStepStatus: "To Do" | "In Progress" | "Completed";
  setNewStepStatus: (v: "To Do" | "In Progress" | "Completed") => void;
  editingStep: number | null;
  editStepTitle: string;
  setEditStepTitle: (v: string) => void;
  editStepDescription: string;
  setEditStepDescription: (v: string) => void;
  editStepStatus: "To Do" | "In Progress" | "Completed";
  setEditStepStatus: (v: "To Do" | "In Progress" | "Completed") => void;
  handleAddStep: () => void;
  handleRemoveStep: (id: number) => void;
  handleToggleStepCompletion: (id: number) => void;
  handleUpdateStepStatus: (
    id: number,
    status: "To Do" | "In Progress" | "Completed"
  ) => void;
  startEditingStep: (step: TaskStep) => void;
  saveStepEdit: () => void;
  cancelStepEdit: () => void;
  handleStepKeyPress: (e: React.KeyboardEvent) => void;
  getStepProgress: () => number;
  getStepStatusColor: (status: string) => string;
}

const TaskStepsSection: React.FC<TaskStepsSectionProps> = ({
  steps,
  newStepTitle,
  setNewStepTitle,
  newStepDescription,
  setNewStepDescription,
  newStepStatus,
  setNewStepStatus,
  editingStep,
  editStepTitle,
  setEditStepTitle,
  editStepDescription,
  setEditStepDescription,
  editStepStatus,
  setEditStepStatus,
  handleAddStep,
  handleRemoveStep,
  handleToggleStepCompletion,
  handleUpdateStepStatus,
  startEditingStep,
  saveStepEdit,
  cancelStepEdit,
  handleStepKeyPress,
  getStepProgress,
  getStepStatusColor,
}) => (
  <div className="space-y-3">
    <label className="font-medium">Steps</label>
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
          {steps.filter((s) => s.completed).length} of {steps.length} steps
          completed
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
        <Select value={newStepStatus} onValueChange={setNewStepStatus}>
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
          onClick={handleAddStep}
          size="icon"
          variant="outline"
          className="col-span-1"
        >
          +
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
            onCheckedChange={() => handleToggleStepCompletion(step.id)}
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
                <Select
                  value={editStepStatus}
                  onValueChange={setEditStepStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#fdf7f7]">
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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
                      step.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {step.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`text-xs ${getStepStatusColor(step.status)}`}
                    >
                      {step.status}
                    </Badge>
                    <Select
                      value={step.status}
                      onValueChange={(value) =>
                        handleUpdateStepStatus(
                          step.id,
                          value as "To Do" | "In Progress" | "Completed"
                        )
                      }
                    >
                      <SelectTrigger className="h-6 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#fdf7f7]">
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
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
              onClick={() => handleRemoveStep(step.id)}
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
);

export default TaskStepsSection;
