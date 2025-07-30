import React from "react";
import { Slider } from "@/components/ui/slider";

interface TaskAISettingsSectionProps {
  tagCount: number;
  setTagCount: (v: number) => void;
  stepCount: number;
  setStepCount: (v: number) => void;
  aiLimitLoading: boolean;
  aiGenerateLimit: number | null;
  taskLimitLoading: boolean;
  taskLimit: number | null;
}

const TaskAISettingsSection: React.FC<TaskAISettingsSectionProps> = ({
  tagCount,
  setTagCount,
  stepCount,
  setStepCount,
  aiLimitLoading,
  aiGenerateLimit,
  taskLimitLoading,
  taskLimit,
}) => (
  <div className="space-y-3">
    <label className="font-medium">AI Generation Settings</label>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">Number of Tags</span>
          <span className="text-xs text-gray-900 font-medium">{tagCount}</span>
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
          <span className="text-xs text-gray-600">Number of Steps</span>
          <span className="text-xs text-gray-900 font-medium">{stepCount}</span>
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
);

export default TaskAISettingsSection;
