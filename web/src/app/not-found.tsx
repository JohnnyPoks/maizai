import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-6 text-center">
      <Logo size="sm" />
      <p className="mt-10 text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-3 text-2xl font-bold text-brand-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-earth-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="mt-8">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
          <Home size={16} />
          Back to home
        </Button>
      </Link>
    </div>
  );
}
