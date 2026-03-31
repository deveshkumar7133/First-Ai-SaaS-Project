"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="container-page py-10">Loading…</div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const next = params.get("next");
  const nextSafe = useMemo(() => (next && next.startsWith("/") ? next : "/login"), [next]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const tokenMissing = !token || token.length < 20;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (tokenMissing) {
      setError("Reset link is missing or invalid. Please request a new reset email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword({ token, password });
      setDone(true);
      setMessage(res.message || "Password reset successfully.");
      setTimeout(() => router.push(nextSafe), 800);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md p-6">
          <div className="text-lg font-semibold">Choose a new password</div>
          <div className="mt-1 text-sm text-slate-300/80">
            Set a new password for your account.
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading || done}
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              disabled={loading || done}
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
            <Button type="submit" className="w-full py-2.5" disabled={loading || done}>
              {loading ? "Resetting..." : done ? "Done" : "Reset password"}
            </Button>
          </form>

          <div className="mt-5 text-sm text-slate-300/80">
            <Link href="/forgot-password" className="text-indigo-300 hover:text-indigo-200">
              Request a new reset link
            </Link>
            <Link href="/login" className="ml-4 text-slate-400 hover:text-slate-200">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

