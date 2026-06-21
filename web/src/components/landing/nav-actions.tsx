"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function NavActions() {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <Link href="/dashboard">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white text-sm h-9">
          Go to Dashboard
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/sign-in">
        <Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-50 text-sm h-9">
          Sign In
        </Button>
      </Link>
      <Link href="/request-access">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white text-sm h-9">
          Get Started
        </Button>
      </Link>
    </div>
  );
}
