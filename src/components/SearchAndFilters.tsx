
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

export function SearchAndFilters() {
  const { filters, setFilters, tasks } = useTaskContext();
  const [showFilters, setShowFilters] = useState(false);

  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));
  
  const handleStatusFilter = (status: string) => {
    if (filters.status.includes(status)) {
      setFilters(prev => ({
        ...prev,
        status: prev.status.filter(s => s !== status)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        status: [...prev.status, status]
      }));
    }
  };

  const handlePriorityFilter = (priority: string) => {
    if (filters.priority.includes(priority)) {
      setFilters(prev => ({
        ...prev,
        priority: prev.priority.filter(p => p !== priority)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        priority: [...prev.priority, priority]
      }));
    }
  };

  const handleTagFilter = (tag: string) => {
    if (filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      search: '',
      tags: []
    });
  };

  const activeFiltersCount = filters.status.length + filters.priority.length + filters.tags.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`${activeFiltersCount > 0 ? 'bg-primary/10 border-primary' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-white">{activeFiltersCount}</Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Status Filters */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {['To Do', 'In Progress', 'Review', 'Completed'].map(status => (
                <Badge
                  key={status}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
            <div className="flex flex-wrap gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map(priority => (
                <Badge
                  key={priority}
                  variant={filters.priority.includes(priority) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePriorityFilter(priority)}
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map(status => (
            <Badge key={status} className="bg-blue-100 text-blue-800">
              Status: {status}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handleStatusFilter(status)}
              />
            </Badge>
          ))}
          {filters.priority.map(priority => (
            <Badge key={priority} className="bg-orange-100 text-orange-800">
              Priority: {priority}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handlePriorityFilter(priority)}
              />
            </Badge>
          ))}
          {filters.tags.map(tag => (
            <Badge key={tag} className="bg-green-100 text-green-800">
              Tag: {tag}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handleTagFilter(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
