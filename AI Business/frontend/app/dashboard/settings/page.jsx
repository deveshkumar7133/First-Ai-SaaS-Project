"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/DashboardShell";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { api } from "../../../lib/api";

export default function SettingsPage() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api.getUsage().then(setUsage).catch(() => setUsage(null));
  }, []);

  return (
    <DashboardShell title="Settings" subtitle="Account and subscription.">
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Subscription</div>
              <div className="mt-2 text-sm text-slate-300/80">
                Free plan: 5 content generations per month. Points reset at the start of each month.
              </div>
              {usage != null ? (
                <div className="mt-3 rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                  This month: {usage.pointsUsed} / {usage.pointsLimit} points used · {usage.pointsLeft} left
                </div>
              ) : null}
            </div>
            <Link href="/dashboard/plans">
              <Button>Upgrade plan</Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Account</div>
          <div className="mt-2 text-sm text-slate-300/80">
            JWT auth. Add profile editing, password reset, or paid plans as needed.
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

