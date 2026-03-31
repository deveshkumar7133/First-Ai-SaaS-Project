"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="container-page py-10">Loading…</div>
        </div>
      }
    >
      <ForgotPasswordInner />
    </Suspense>
  );
}

function ForgotPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email });
      setSent(true);
      setMessage(res.message || "If that email exists, we sent a reset link.");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md p-6">
          <div className="text-lg font-semibold">Reset your password</div>
          <div className="mt-1 text-sm text-slate-300/80">
            Enter your email and we’ll send a reset link.
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || sent}
            />
            {error ? (
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 text-sm text-slate-200/90">
                {message}
              </div>
            ) : null}
            <Button type="submit" className="w-full py-2.5" disabled={loading || sent}>
              {loading ? "Sending..." : sent ? "Sent" : "Send reset link"}
            </Button>
          </form>

          <div className="mt-5 text-sm text-slate-300/80">
            <Link
              href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`}
              className="text-indigo-300 hover:text-indigo-200"
            >
              Back to login
            </Link>
            <button
              type="button"
              className="ml-4 text-slate-400 hover:text-slate-200"
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

