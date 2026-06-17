"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Wheat,
} from "lucide-react";

type Step =
  | { name: "email" }
  | { name: "password" }
  | { name: "approved"; tempPassword: string }
  | { name: "pending" }
  | { name: "denied"; reason: string | null }
  | { name: "not_found" };

// Two-panel layout used for the active sign-in flow (email, password, approved).
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex w-[420px] xl:w-[460px] shrink-0 bg-brand-800 flex-col p-10">
        <Logo size="md" variant="white" />
        <div className="flex-1 flex flex-col justify-center">
          <div className="h-12 w-12 rounded-xl bg-brand-700 flex items-center justify-center mb-6">
            <Wheat size={24} className="text-brand-300" />
          </div>
          <h2 className="text-[22px] font-bold text-white leading-snug">
            Protecting maize<br />harvests in Cameroon.
          </h2>
          <p className="mt-4 text-sm text-brand-300 leading-relaxed">
            Early detection of leaf disease saves the crop. MaizAI gives
            smallholder farmers timely, actionable guidance before yield loss
            becomes irreversible.
          </p>
        </div>
        <p className="text-xs text-brand-500">© 2025 MaizAI</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <Logo size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600"
          >
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Centred content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Simple centred shell used for status-only screens (pending / denied / not_found).
function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center px-6 py-4 border-b border-brand-100">
        <Logo size="sm" />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

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
        setError("Sign-in failed after activation. Try signing in with your temporary password.");
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

  // ── Pending ──────────────────────────────────────────────────────────────

  if (step.name === "pending") {
    return (
      <StatusShell>
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-7 w-7 text-alert-medium" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-brand-900">Still under review</h1>
            <p className="text-sm text-earth-500 leading-relaxed">
              The request for{" "}
              <span className="font-medium text-brand-800">{email}</span> is still
              being reviewed. Please check back in 24–48 hours.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <Button variant="outline" className="w-full" onClick={resetToEmail}>
              Try a different email
            </Button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600"
            >
              <ArrowLeft size={12} /> Back to home
            </Link>
          </div>
        </div>
      </StatusShell>
    );
  }

  // ── Denied ───────────────────────────────────────────────────────────────

  if (step.name === "denied") {
    return (
      <StatusShell>
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-alert-high" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-brand-900">Request not approved</h1>
            <p className="text-sm text-earth-500">
              The access request for{" "}
              <span className="font-medium text-brand-800">{email}</span> was not
              approved.
            </p>
            {step.reason && (
              <p className="text-sm bg-red-50 text-alert-high rounded-lg px-4 py-3 text-left leading-relaxed">
                {step.reason}
              </p>
            )}
            <p className="text-xs text-earth-400">
              You may submit a new request if your circumstances change.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <Link href="/request-access" className="block">
              <Button variant="outline" className="w-full">
                Submit a new request
              </Button>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600"
            >
              <ArrowLeft size={12} /> Back to home
            </Link>
          </div>
        </div>
      </StatusShell>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────

  if (step.name === "not_found") {
    return (
      <StatusShell>
        <div className="text-center space-y-5">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-brand-900">No account found</h1>
            <p className="text-sm text-earth-500">
              There is no account or access request for{" "}
              <span className="font-medium text-brand-800">{email}</span>.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <Link href="/request-access" className="block">
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                Request access
              </Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={resetToEmail}>
              Try a different email
            </Button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-brand-600"
            >
              <ArrowLeft size={12} /> Back to home
            </Link>
          </div>
        </div>
      </StatusShell>
    );
  }

  // ── Approved — account activation ────────────────────────────────────────

  if (step.name === "approved") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={20} className="text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-900">Your account is ready</h1>
              <p className="text-sm text-earth-500 mt-0.5">Approved for {email}</p>
            </div>
          </div>

          <p className="text-sm text-earth-600 leading-relaxed">
            Copy your temporary password and click the button below to sign in.
            You will be asked to set a permanent password immediately after.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-earth-500 uppercase tracking-wide">
              Temporary password
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={step.tempPassword}
                className="font-mono text-sm bg-brand-50 border-brand-200 select-all"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(step.tempPassword)}
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle2 size={15} className="text-brand-500" />
                ) : (
                  <Copy size={15} />
                )}
              </Button>
            </div>
            <p className="text-xs text-earth-400">Not shown again after you sign in.</p>
          </div>

          {error && <p className="text-sm text-alert-high">{error}</p>}

          <Button
            className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-medium"
            disabled={loading}
            onClick={handleActivate}
          >
            {loading && <Loader2 size={15} className="animate-spin mr-2" />}
            I have saved this password — sign me in
          </Button>
        </div>
      </AuthShell>
    );
  }

  // ── Email step + Password step ────────────────────────────────────────────

  return (
    <AuthShell>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">
          {step.name === "email" ? "Sign in" : "Enter your password"}
        </h1>
        <p className="mt-1.5 text-sm text-earth-500">
          {step.name === "email"
            ? "Administrator and agronomist access only."
            : `Signing in as ${email}`}
        </p>
      </div>

      {/* Email step */}
      {step.name === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-brand-800">
              E-mail address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
          </div>
          {error && <p className="text-sm text-alert-high">{error}</p>}
          <Button
            type="submit"
            className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-medium"
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="animate-spin mr-2" />}
            Continue
          </Button>
          <p className="text-center text-sm text-earth-500">
            No account?{" "}
            <Link href="/request-access" className="text-brand-600 hover:underline font-medium">
              Request access
            </Link>
          </p>
        </form>
      ) : (
        /* Password step */
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-brand-800">E-mail address</Label>
            <div className="flex gap-2">
              <Input
                value={email}
                readOnly
                className="bg-brand-50 text-earth-600 h-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetToEmail}
                className="shrink-0 text-earth-500 hover:text-brand-600"
              >
                Change
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-brand-800">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="h-10"
            />
          </div>
          {error && <p className="text-sm text-alert-high">{error}</p>}
          <Button
            type="submit"
            className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-medium"
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="animate-spin mr-2" />}
            Sign in
          </Button>
        </form>
      )}

      {/* Footer links */}
      <div className="mt-8 pt-6 border-t border-earth-100 flex items-center justify-between text-xs text-earth-400">
        <Link
          href="/"
          className="hidden lg:inline-flex items-center gap-1 hover:text-brand-600"
        >
          <ArrowLeft size={12} /> Home
        </Link>
        <Link href="/request-access" className="hover:text-brand-600 lg:ml-auto">
          Request access →
        </Link>
      </div>
    </AuthShell>
  );
}
