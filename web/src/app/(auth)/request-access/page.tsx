"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function RequestAccessPage() {
  const [state, setState] = useState<"form" | "success" | "pending">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      affiliation: formData.get("affiliation") || undefined,
      reason: formData.get("reason"),
    };

    const res = await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.status === 409) {
      setState("pending");
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-md shadow-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-14 w-14 text-brand-500" />
            </div>
            <h2 className="text-xl font-semibold text-brand-900">Request submitted</h2>
            <p className="text-sm text-earth-600 max-w-xs mx-auto">
              Your request has been submitted. Return to the sign-in page in 24 to 48 hours and enter
              your email to see your status.
            </p>
            <Link href="/sign-in">
              <Button variant="outline" className="mt-4">
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-md shadow-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <h2 className="text-xl font-semibold text-brand-900">Request already submitted</h2>
            <p className="text-sm text-earth-600 max-w-xs mx-auto">
              You already have a pending request for this email address. Please wait for it to be reviewed.
            </p>
            <Link href="/sign-in">
              <Button variant="outline" className="mt-4">
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size="lg" />
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-brand-600">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-brand-900">Request access to the MaizAI dashboard</CardTitle>
            <CardDescription>
              Fill in the form below. We will review your request within 24 to 48 hours. Return to
              the sign-in page and enter your email to check your status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full name <span className="text-alert-high">*</span></Label>
                <Input id="fullName" name="fullName" type="text" required minLength={2} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail address <span className="text-alert-high">*</span></Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
                <p className="text-xs text-earth-500 mt-0.5">
                  Use this same email when checking your request status at the sign-in page.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="affiliation">Affiliation <span className="text-earth-400 font-normal">(optional)</span></Label>
                <Input
                  id="affiliation"
                  name="affiliation"
                  type="text"
                  placeholder="Organisation, institution, or research group"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason">
                  Reason for access <span className="text-alert-high">*</span>
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  required
                  minLength={30}
                  maxLength={500}
                  rows={4}
                  placeholder="Please describe why you are requesting access to the MaizAI dashboard (min. 30 characters)."
                  className="resize-none"
                />
              </div>
              {error && <p className="text-sm text-alert-high">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Submit request
              </Button>
              <p className="text-center text-sm text-earth-500">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-brand-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
