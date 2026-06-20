"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

type FeedbackType = "BUG" | "SUGGESTION";

export default function ReportIssuePage() {
  const [type, setType] = useState<FeedbackType>("BUG");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (message.trim().length < 5) {
      setError("Please add a little more detail.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Could not send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="sm" />
        </div>

        {sent ? (
          <div className="rounded-xl border border-brand-200 bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-3 text-brand-500" size={40} />
            <h1 className="text-xl font-bold text-brand-900">Thank you</h1>
            <p className="mt-2 text-sm text-earth-600">
              Your message has reached the MaizAI team. We appreciate it.
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button className="bg-brand-500 hover:bg-brand-600 text-white">Back to home</Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-brand-900">Report an issue or suggestion</h1>
            <p className="mt-1 text-sm text-earth-600">
              Tell us what went wrong or what would make MaizAI better.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setType("BUG")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  type === "BUG"
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-earth-200 text-earth-600"
                }`}
              >
                Report an issue
              </button>
              <button
                onClick={() => setType("SUGGESTION")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  type === "SUGGESTION"
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-earth-200 text-earth-600"
                }`}
              >
                Suggestion
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <Label>Details</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={
                  type === "BUG"
                    ? "Describe what went wrong and what you expected…"
                    : "Tell us what would make MaizAI more useful…"
                }
                className="w-full rounded-lg border border-earth-200 p-3 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div className="mt-4 space-y-1">
              <Label>Email (optional, so we can follow up)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="mt-3 text-sm text-alert-high">{error}</p>}

            <Button
              onClick={submit}
              disabled={loading || !message.trim()}
              className="mt-5 w-full bg-brand-500 hover:bg-brand-600 text-white gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Send
            </Button>
            <Link href="/" className="mt-3 block text-center text-sm text-earth-500 hover:text-brand-600">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
