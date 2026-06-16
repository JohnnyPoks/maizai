"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarTrigger } from "@/components/admin/sidebar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TopbarProps {
  title: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  pendingAccessRequests?: number;
}

export function Topbar({ title, userEmail, userName, userRole, pendingAccessRequests = 0 }: TopbarProps) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-brand-100 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebarTrigger role={userRole ?? "ADMIN"} />
        <h1 className="text-base font-semibold text-brand-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {isSuperAdmin && (
          <Link href="/access-requests">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              {pendingAccessRequests > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-alert-high text-white border-0 flex items-center justify-center">
                  {pendingAccessRequests > 9 ? "9+" : pendingAccessRequests}
                </Badge>
              )}
            </Button>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-brand-800 truncate">{userName}</p>
              <p className="text-xs text-earth-500 truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer flex items-center gap-2">
                <User size={14} className="text-earth-400" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=password" className="cursor-pointer flex items-center gap-2">
                <KeyRound size={14} className="text-earth-400" />
                Change password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-alert-high cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut size={14} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
