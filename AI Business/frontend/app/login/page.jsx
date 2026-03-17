"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="container-page py-10">Loading…</div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      auth.loginWithToken(res.token);
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md p-6">
          <div className="text-lg font-semibold">Welcome back</div>
          <div className="mt-1 text-sm text-slate-300/80">Log in to generate and manage websites.</div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">{error}</div> : null}
            <Button className="w-full py-2.5" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <div className="mt-5 text-sm text-slate-300/80">
            Don&apos;t have an account?{" "}
            <Link href={`/signup${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`} className="text-indigo-300 hover:text-indigo-200">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

