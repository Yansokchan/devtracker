import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface TaskLimitAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

const TaskLimitAlertDialog: React.FC<TaskLimitAlertDialogProps> = ({
  open,
  onOpenChange,
  onUpgrade,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="p-6">
      <AlertDialogHeader>
        <AlertDialogTitle>Task Limit Reached</AlertDialogTitle>
        <AlertDialogDescription>
          You have reached your daily task limit. Upgrade your plan to create
          more tasks.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onUpgrade}
          className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
        >
          Upgrade Plan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default TaskLimitAlertDialog;
