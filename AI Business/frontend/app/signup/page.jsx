"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="container-page py-10">Loading…</div>
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.signup({ name, email, password });
      auth.loginWithToken(res.token);
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md p-6">
          <div className="text-lg font-semibold">Create your account</div>
          <div className="mt-1 text-sm text-slate-300/80">Generate a complete business website with AI.</div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="Password (min 8 chars)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {error ? <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">{error}</div> : null}
            <Button className="w-full py-2.5" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </Button>
          </form>
          <div className="mt-5 text-sm text-slate-300/80">
            Already have an account?{" "}
            <Link href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`} className="text-indigo-300 hover:text-indigo-200">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

