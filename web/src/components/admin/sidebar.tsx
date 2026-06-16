"use client";

import { useState, useEffect } from "react";
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
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaf-images", label: "Leaf Images", icon: Image },
  { href: "/classifications", label: "Classifications", icon: Microscope },
  { href: "/sensor-readings", label: "Sensor Readings", icon: Cpu },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/thresholds", label: "Thresholds", icon: Sliders },
  { href: "/access-requests", label: "Access Requests", icon: ClipboardList, superAdminOnly: true },
  { href: "/users", label: "Users", icon: Users, superAdminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ collapsed, role, onClose }: { collapsed: boolean; role: string; onClose?: () => void }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {navItems
        .filter((item) => !item.superAdminOnly || isSuperAdmin)
        .map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                collapsed ? "justify-center px-2" : "",
                active
                  ? "bg-brand-100 text-brand-800 font-medium"
                  : "text-earth-600 hover:bg-brand-50 hover:text-brand-700"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
    </nav>
  );
}

interface SidebarProps {
  role: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("maizai.sidebar.collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("maizai.sidebar.collapsed", String(next));
      return next;
    });
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen shrink-0 flex-col border-r border-brand-100 bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="flex h-14 items-center border-b border-brand-100 px-3 justify-between">
          {!collapsed && <Logo size="sm" />}
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-earth-400 hover:bg-brand-50 hover:text-brand-600 transition-colors",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <NavLinks collapsed={collapsed} role={role} />
      </aside>

      {/* Mobile drawer trigger — exposed via context/prop */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0 border-r border-brand-100">
          <div className="flex h-14 items-center border-b border-brand-100 px-4">
            <Logo size="sm" />
          </div>
          <NavLinks collapsed={false} role={role} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function MobileSidebarTrigger({ role }: { role: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-earth-500 hover:bg-brand-50 hover:text-brand-700"
        aria-label="Open navigation menu"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0 border-r border-brand-100">
          <div className="flex h-14 items-center border-b border-brand-100 px-4">
            <Logo size="sm" />
          </div>
          <NavLinks collapsed={false} role={role} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
