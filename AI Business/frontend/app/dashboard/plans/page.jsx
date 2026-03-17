"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/DashboardShell";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { api } from "../../../lib/api";

const PLANS = [
  {
    id: "free",
    name: "Free",
    points: 5,
    period: "per month",
    price: "₹0",
    description: "5 content generations per month. Great to try out.",
    features: ["5 points/month", "All templates", "Save & preview"],
    cta: "Current plan",
    currentKey: "free"
  },
  {
    id: "pro",
    name: "Pro",
    points: 50,
    period: "per month",
    price: "₹299",
    description: "More generations for growing businesses.",
    features: ["50 points/month", "All templates", "Priority support", "Export options"],
    cta: "Purchase subscription",
    currentKey: "pro"
  }
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

export default function PlansPage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.getUsage().then(setUsage).catch(() => setUsage(null));
  }, []);

  const isPro = usage?.pointsLimit === 50;

  async function handlePurchasePro() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        setError("Payment script failed to load. Please refresh and try again.");
        setLoading(false);
        return;
      }
      const { orderId, amount, currency, keyId } = await api.createOrder({ planId: "pro" });
      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "InstantSite AI",
        description: "Pro plan — 50 points/month",
        handler: async (response) => {
          try {
            await api.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            setSuccess("Pro plan activated! You now have 50 points this month.");
            setUsage((u) => (u ? { ...u, pointsLimit: 50, pointsLeft: 50 - u.pointsUsed } : null));
          } catch (err) {
            setError(err.message || "Payment verification failed.");
          }
        },
        prefill: {},
        theme: { color: "#6366f1" }
      };
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed or was cancelled.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell title="Plans" subtitle="Choose a plan. Upgrade anytime to get more generations.">
      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-950/40 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {PLANS.map((plan) => {
          const isCurrent = (plan.currentKey === "pro" && isPro) || (plan.currentKey === "free" && !isPro);
          return (
            <Card key={plan.id} className={`p-6 ${isCurrent ? "ring-2 ring-indigo-500/50" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{plan.name}</div>
                {isCurrent ? (
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-200">
                    Current
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-100">{plan.price}</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <div className="mt-1 text-sm text-slate-300/80">
                {plan.points} content generations {plan.period}
              </div>
              <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.id === "pro" ? (
                  isPro ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handlePurchasePro} disabled={loading}>
                      {loading ? "Opening…" : plan.cta}
                    </Button>
                  )
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {isPro ? "Downgrade later" : "Current plan"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 max-w-4xl text-sm text-slate-400">
        Need a custom plan or bulk points? Contact us for enterprise or one-time top-ups.
      </p>
    </DashboardShell>
  );
}
