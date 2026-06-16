import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, delta, deltaPositive, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card className="border-brand-100 shadow-sm">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-earth-500">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-brand-900">{value}</p>
            {delta && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  deltaPositive ? "text-brand-600" : "text-alert-high"
                )}
              >
                {delta}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconColor ?? "bg-brand-100"
            )}
          >
            <Icon size={18} className="text-brand-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
