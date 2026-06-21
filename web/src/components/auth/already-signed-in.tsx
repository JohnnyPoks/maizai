"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function AlreadySignedIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-6 text-center">
      <Logo size="sm" />
      <h1 className="mt-10 text-2xl font-bold text-brand-900">You are already signed in</h1>
      <p className="mt-2 max-w-sm text-earth-600">
        There is no need to sign in again. Head straight to your dashboard.
      </p>
      <Link href="/dashboard" className="mt-8">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
          <LayoutDashboard size={16} />
          Go to dashboard
        </Button>
      </Link>
      <Link href="/" className="mt-3 text-sm text-earth-500 hover:text-brand-600">
        Back to home
      </Link>
    </div>
  );
}
