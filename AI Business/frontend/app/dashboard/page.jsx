"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { DashboardShell } from "../../components/DashboardShell";
import { api } from "../../lib/api";

export default function DashboardHome() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api.getUsage().then(setUsage).catch(() => setUsage(null));
  }, []);

  return (
    <DashboardShell title="InstantSite AI Dashboard" subtitle="Generate and manage your business websites.">
      {usage != null ? (
        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
          <span className="font-medium text-slate-100">Free plan:</span> {usage.pointsLeft} / {usage.pointsLimit} points left this month (resets monthly).
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm font-semibold">Create a new website</div>
          <div className="mt-2 text-sm text-slate-300/80">Generate content and preview instantly.</div>
          <div className="mt-5">
            <Link href="/build">
              <Button>Generate Website</Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">View saved projects</div>
          <div className="mt-2 text-sm text-slate-300/80">See all websites you’ve generated and saved.</div>
          <div className="mt-5">
            <Link href="/dashboard/my-websites">
              <Button variant="secondary">My Projects</Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Prompt-based builder</div>
          <div className="mt-2 text-sm text-slate-300/80">No templates. Describe what you want and build instantly.</div>
          <div className="mt-5">
            <Link href="/build">
              <Button variant="secondary">Open Builder</Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

