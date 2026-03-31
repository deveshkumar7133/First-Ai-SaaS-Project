"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

const OTP_STORAGE = "abw_signup_otp";
const OTP_MAX_AGE_MS = 12 * 60 * 1000;

function readPendingOtp() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OTP_STORAGE);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.email || !data?.at || Date.now() - data.at > OTP_MAX_AGE_MS) {
      sessionStorage.removeItem(OTP_STORAGE);
      return null;
    }
    return data;
  } catch {
    sessionStorage.removeItem(OTP_STORAGE);
    return null;
  }
}

function setPendingOtp(email) {
  sessionStorage.setItem(OTP_STORAGE, JSON.stringify({ email, at: Date.now() }));
}

function clearPendingOtp() {
  sessionStorage.removeItem(OTP_STORAGE);
}

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
  const [code, setCode] = useState("");
  const [step, setStep] = useState("credentials");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const p = readPendingOtp();
    if (!p?.email) return;
    setEmail(p.email);
    setStep("verify");
    setInfoMessage("Enter the 6-digit code we sent (check email or backend terminal).");
  }, []);

  async function onSubmitCredentials(e) {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const res = await api.signup({ name, email, password });
      const needsOtp =
        res.requiresVerification === true ||
        res.requiresVerification === "true" ||
        res.requiresVerification === 1;
      if (needsOtp) {
        setPendingOtp(email.trim().toLowerCase());
        setInfoMessage(res.message || "Check your email for a verification code.");
        setStep("verify");
        setCode("");
        return;
      }
      setError(
        "Server did not send a verification step. Restart the backend (latest code) and confirm API URL in .env.local."
      );
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyLogin({ email, code: code.replace(/\D/g, "").slice(0, 6) });
      clearPendingOtp();
      auth.loginWithToken(res.token);
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const res = await api.resendLoginOtp({ email, password });
      setInfoMessage(res.message || "New code sent.");
    } catch (err) {
      setError(err.message || "Could not resend");
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

          {step === "credentials" ? (
            <form onSubmit={onSubmitCredentials} className="mt-6 space-y-4">
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
              <Button type="submit" className="w-full py-2.5" disabled={loading}>
                {loading ? "Creating..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmitVerify} className="mt-6 space-y-4">
              <p className="text-sm text-slate-300/90">{infoMessage}</p>
              <Input
                label="6-digit code from email"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
              {error ? <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">{error}</div> : null}
              <Button type="submit" className="w-full py-2.5" disabled={loading || code.length !== 6}>
                {loading ? "Verifying..." : "Verify and continue"}
              </Button>
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  className="text-indigo-300 hover:text-indigo-200 disabled:opacity-50"
                  onClick={onResend}
                  disabled={loading}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-300"
                  onClick={() => {
                    clearPendingOtp();
                    setStep("credentials");
                    setCode("");
                    setError("");
                    setInfoMessage("");
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {step === "credentials" ? (
            <div className="mt-5 text-sm text-slate-300/80">
              Already have an account?{" "}
              <Link
                href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`}
                className="text-indigo-300 hover:text-indigo-200"
              >
                Log in
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
