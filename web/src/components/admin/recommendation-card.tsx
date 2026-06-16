import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UrgencyLevel } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RecommendationCardProps {
  adviceType: string;
  adviceText: string;
  urgencyLevel: UrgencyLevel;
  issuedAt: Date;
  diseaseClass?: string;
}

const urgencyConfig = {
  [UrgencyLevel.HIGH]: {
    icon: AlertTriangle,
    label: "Urgent",
    badgeClass: "bg-alert-high/10 text-alert-high border-alert-high/20",
    borderClass: "border-l-alert-high",
  },
  [UrgencyLevel.MEDIUM]: {
    icon: AlertCircle,
    label: "Moderate",
    badgeClass: "bg-alert-medium/10 text-alert-medium border-alert-medium/20",
    borderClass: "border-l-alert-medium",
  },
  [UrgencyLevel.LOW]: {
    icon: Info,
    label: "Monitor",
    badgeClass: "bg-alert-low/10 text-alert-low border-alert-low/20",
    borderClass: "border-l-alert-low",
  },
};

export function RecommendationCard({
  adviceType,
  adviceText,
  urgencyLevel,
  issuedAt,
  diseaseClass,
}: RecommendationCardProps) {
  const config = urgencyConfig[urgencyLevel];
  const Icon = config.icon;

  return (
    <Card className={cn("border-l-4 shadow-sm", config.borderClass)}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <Icon size={18} className="mt-0.5 shrink-0" style={{ color: "currentColor" }} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
                {config.label}
              </Badge>
              {diseaseClass && (
                <span className="text-xs text-earth-400">
                  {diseaseClass.replace(/_/g, " ")}
                </span>
              )}
              <span className="ml-auto text-xs text-earth-400 shrink-0">
                {formatDistanceToNow(new Date(issuedAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-earth-700 leading-relaxed">{adviceText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
