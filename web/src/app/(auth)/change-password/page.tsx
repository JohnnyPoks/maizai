"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/users/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error?.message ?? "Failed to update password. Please try again.");
      setLoading(false);
      return;
    }

    // Patch the JWT session cookie so AdminLayout no longer sees mustChangePassword: true.
    // Without this, router.push("/dashboard") triggers a redirect back here.
    setDone(true);
    await update({ mustChangePassword: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center px-6 py-4 border-b border-brand-100">
        <Logo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {done ? (
            /* Brief success flash while awaiting JWT update + redirect */
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2 size={28} className="text-brand-500" />
              </div>
              <h1 className="text-xl font-bold text-brand-900 mb-1">Password set</h1>
              <p className="text-sm text-earth-500">Taking you to the dashboard…</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 mb-4">
                  <KeyRound size={20} className="text-brand-600" />
                </div>
                <h1 className="text-2xl font-bold text-brand-900 leading-snug">
                  Set your password
                </h1>
                <p className="mt-1.5 text-sm text-earth-500">
                  Choose a secure password to activate your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-brand-900">
                    New password
                  </Label>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-brand-900">
                    Confirm password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    minLength={8}
                    required
                    className="h-10"
                  />
                </div>

                {error && (
                  <p className="text-sm text-alert-high">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-medium mt-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin mr-2" />
                  ) : null}
                  Set password and continue
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-earth-100 text-center">
                <p className="text-xs text-earth-400">
                  Wrong account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Sign out
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
