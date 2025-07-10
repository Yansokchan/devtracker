import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "@/components/ui/CountUp";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "red" | "yellow" | "blue" | "green";
  textColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "red",
  textColor = "text-gray-900",
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
        <CardTitle className={`text-sm ${textColor} font-medium`}>
          {title}
        </CardTitle>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${gradientClasses[gradient]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${textColor} transition-transform duration-700 ease-out will-change-transform animate-slide-top`}
          style={{ display: "inline-block" }}
        >
          {typeof value === "number" ? (
            <CountUp
              to={value}
              duration={1.2}
              separator=","
              onStart={() => {}}
              onEnd={() => {}}
            />
          ) : (
            <span>{value}</span>
          )}
        </div>
        {change && (
          <p
            className={`text-xs ${textColor} ${changeColors[changeType]} mt-1`}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
