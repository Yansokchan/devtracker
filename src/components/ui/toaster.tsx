import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircle, Edit as EditIcon, Trash2, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        let Icon = Info;
        if (typeof title === "string") {
          if (title.toLowerCase().includes("create")) Icon = CheckCircle;
          else if (
            title.toLowerCase().includes("edit") ||
            title.toLowerCase().includes("update")
          )
            Icon = EditIcon;
          else if (title.toLowerCase().includes("delete")) Icon = Trash2;
        }
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f2daba] p-2 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#B45309]" />
              </span>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
