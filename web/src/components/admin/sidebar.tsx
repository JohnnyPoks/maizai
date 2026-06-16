"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  Microscope,
  Cpu,
  Lightbulb,
  Sliders,
  Users,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaf-images", label: "Leaf Images", icon: Image },
  { href: "/classifications", label: "Classifications", icon: Microscope },
  { href: "/sensor-readings", label: "Sensor Readings", icon: Cpu },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/thresholds", label: "Thresholds", icon: Sliders },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-56 shrink-0 flex-col border-r border-brand-100 bg-white">
      <div className="flex h-14 items-center border-b border-brand-100 px-4">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-100 text-brand-800 font-medium"
                  : "text-earth-600 hover:bg-brand-50 hover:text-brand-700"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
