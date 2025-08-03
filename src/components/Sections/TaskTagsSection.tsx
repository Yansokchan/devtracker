import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface TaskTagsSectionProps {
  tags: string[];
  newTag: string;
  setNewTag: (v: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const TaskTagsSection: React.FC<TaskTagsSectionProps> = ({
  tags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  handleKeyPress,
}) => (
  <div className="space-y-3 text-[14px]">
    <label className="font-medium">Tags</label>
    <div className="flex space-x-2">
      <Input
        placeholder="Add a tag"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button type="button" onClick={addTag} size="icon" variant="outline">
        <Plus className="w-4 h-4 text-[#B45309]" />
      </Button>
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
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
);

export default TaskTagsSection;
