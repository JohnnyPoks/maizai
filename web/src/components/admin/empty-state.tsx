import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-24 text-center px-4", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 mb-4">
        <Icon className="h-8 w-8 text-brand-400" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-sm text-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild variant="outline" className="border-brand-200 text-brand-700 hover:bg-brand-50">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-brand-200 text-brand-700 hover:bg-brand-50"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
