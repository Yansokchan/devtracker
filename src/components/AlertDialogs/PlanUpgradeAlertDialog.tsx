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
import { useNavigate } from "react-router-dom";

interface PlanUpgradeAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlanUpgradeAlertDialog: React.FC<PlanUpgradeAlertDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>AI Generate Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached your daily AI generation limit. Upgrade your plan
            to get more AI generations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="border-l-2 border-b-2 border-[#FFFFFF] shadow-lg shadow-[#f2daba]"
            onClick={() => {
              navigate("/profile");
              onOpenChange(false);
            }}
          >
            Upgrade Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PlanUpgradeAlertDialog;
