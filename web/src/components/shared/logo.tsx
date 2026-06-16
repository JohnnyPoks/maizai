import { Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 18, text: "text-base" },
  md: { icon: 22, text: "text-xl" },
  lg: { icon: 28, text: "text-2xl" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wheat size={s.icon} className="text-brand-500" />
      {showText && (
        <span className={cn("font-bold tracking-tight text-brand-800", s.text)}>MaizAI</span>
      )}
    </div>
  );
}
