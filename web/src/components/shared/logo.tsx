import { Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
}

const sizeMap = {
  sm: { icon: 18, text: "text-base" },
  md: { icon: 22, text: "text-xl" },
  lg: { icon: 28, text: "text-2xl" },
};

export function Logo({ className, showText = true, size = "md", variant = "default" }: LogoProps) {
  const s = sizeMap[size];
  const white = variant === "white";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wheat size={s.icon} className={white ? "text-white" : "text-brand-500"} />
      {showText && (
        <span className={cn("font-bold tracking-tight", s.text, white ? "text-white" : "text-brand-800")}>
          MaizAI
        </span>
      )}
    </div>
  );
}
