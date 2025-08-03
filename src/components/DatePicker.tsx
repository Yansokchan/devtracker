import { useId } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label = "Date picker",
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const id = useId();

  return (
    <div className={className}>
      <div className="*:not-first:mt-2 flex flex-col gap-3">
        <Label htmlFor={id}>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className="group border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <span
                className={cn("truncate", !value && "text-muted-foreground")}
              >
                {value ? format(value, "PPP") : placeholder}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 text-[#B45309] group-hover:text-[#e78e4a] shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-[#fdf7f7]" align="start">
            <Calendar mode="single" selected={value} onSelect={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
