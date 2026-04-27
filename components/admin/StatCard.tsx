import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "red";
}

const borderColors = {
  blue: "border-l-blue-500",
  yellow: "border-l-yellow-500",
  green: "border-l-green-500",
  red: "border-l-red-500",
};

const iconColors = {
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  red: "text-red-500",
};

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className={cn("border-l-4", borderColors[color])}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>
        <div className={cn("h-10 w-10 flex-shrink-0", iconColors[color])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
