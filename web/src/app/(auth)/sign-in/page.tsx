"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";

type Step =
  | { name: "email" }
  | { name: "password" }
  | { name: "approved"; tempPassword: string }
  | { name: "pending" }
  | { name: "denied"; reason: string | null }
  | { name: "not_found" };

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>({ name: "email" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sign-in/status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      switch (data.step) {
        case "password":
          setStep({ name: "password" });
          break;
        case "approved":
          setStep({ name: "approved", tempPassword: data.tempPassword as string });
          break;
        case "pending":
          setStep({ name: "pending" });
          break;
        case "denied":
          setStep({ name: "denied", reason: (data.reason as string | null) ?? null });
          break;
        default:
          setStep({ name: "not_found" });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid e-mail address or password.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleActivate() {
    if (step.name !== "approved") return;
    const tempPassword = step.tempPassword;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sign-in/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("Activation failed. Please try again or contact the administrator.");
        return;
      }
      const result = await signIn("credentials", { email, password: tempPassword, redirect: false });
      if (result?.error) {
        setError("Sign-in failed. Please try signing in manually using your temporary password.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetToEmail() {
    setStep({ name: "email" });
    setError(null);
  }

  // --- Status screens ---

  if (step.name === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-sm shadow-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <Clock className="h-12 w-12 text-earth-400 mx-auto" />
            <h2 className="text-lg font-semibold text-brand-900">Still under review</h2>
            <p className="text-sm text-earth-600">
              The request for <span className="font-medium">{email}</span> is still being reviewed.
              Please check back in 24–48 hours.
            </p>
            <Button variant="outline" className="w-full" onClick={resetToEmail}>
              Try a different email
            </Button>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600">
              <ArrowLeft size={12} /> Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step.name === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-sm shadow-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <XCircle className="h-12 w-12 text-alert-high mx-auto" />
            <h2 className="text-lg font-semibold text-brand-900">Request not approved</h2>
            <p className="text-sm text-earth-600">
              The access request for <span className="font-medium">{email}</span> was not approved.
            </p>
            {step.reason && (
              <p className="text-sm bg-red-50 text-alert-high rounded-md px-3 py-2">{step.reason}</p>
            )}
            <p className="text-xs text-earth-500">
              You may submit a new request if your circumstances change.
            </p>
            <Link href="/request-access">
              <Button variant="outline" className="w-full mt-2">
                Submit a new request
              </Button>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600">
              <ArrowLeft size={12} /> Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step.name === "not_found") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-sm shadow-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <h2 className="text-lg font-semibold text-brand-900">No account found</h2>
            <p className="text-sm text-earth-600">
              There is no account or access request for{" "}
              <span className="font-medium">{email}</span>.
            </p>
            <Link href="/request-access">
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                Request access
              </Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={resetToEmail}>
              Try a different email
            </Button>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600">
              <ArrowLeft size={12} /> Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step.name === "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <Card className="w-full max-w-sm shadow-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <CheckCircle2 className="h-10 w-10 text-brand-500 mx-auto" />
            <CardTitle className="text-xl">Your account is ready</CardTitle>
            <CardDescription>
              Your access request was approved. Copy your temporary password, then click the button
              below to sign in. You will be asked to set a permanent password immediately after.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Temporary password</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={step.tempPassword}
                  className="font-mono text-sm bg-brand-50 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(step.tempPassword)}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle2 size={16} className="text-brand-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
              <p className="text-xs text-earth-500">
                This password will not be shown again after you sign in.
              </p>
            </div>
            {error && <p className="text-sm text-alert-high">{error}</p>}
            <Button
              className="w-full bg-brand-500 hover:bg-brand-600 text-white"
              disabled={loading}
              onClick={handleActivate}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              I have saved this password — sign me in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Email step + Password step share the same card ---

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription>Administrator access only</CardDescription>
          <div className="flex justify-center gap-4 pt-1">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600">
              <ArrowLeft size={12} /> Home
            </Link>
            <Link href="/request-access" className="text-xs text-brand-600 hover:underline">
              Request access
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {step.name === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">E-mail address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-alert-high">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Continue
              </Button>
              <p className="text-center text-sm text-earth-500">
                No account?{" "}
                <Link href="/request-access" className="text-brand-600 hover:underline">
                  Request access
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>E-mail address</Label>
                <div className="flex items-center gap-2">
                  <Input value={email} readOnly className="bg-earth-50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetToEmail}
                    className="shrink-0"
                  >
                    Change
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-alert-high">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
