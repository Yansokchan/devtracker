import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "red" | "yellow" | "blue" | "green";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "red",
}: StatCardProps) {
  const gradientClasses = {
    red: "text-[#A16207]",
    yellow: "text-red-600",
    blue: "text-blue-500",
    green: "text-green-500",
  };

  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className="card-hover bg-[#f6f4f0]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div
          className={`w-10 h-10 rounded-lg bg-[#F1E9DA] flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${gradientClasses[gradient]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]} mt-1`}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}
