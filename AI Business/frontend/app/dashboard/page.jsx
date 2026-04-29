"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { DashboardShell } from "../../components/DashboardShell";
import { api } from "../../lib/api";

export default function DashboardHome() {
  const [usage, setUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getUsage().catch(() => null),
      api.getAnalytics().catch(() => null)
    ]).then(([usageData, analyticsData]) => {
      setUsage(usageData);
      setAnalytics(analyticsData);
      setIsLoading(false);
    });
  }, []);

  return (
    <DashboardShell title="InstantSite AI Dashboard" subtitle="Generate and manage your business websites.">
      {usage != null ? (
        <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <span className="font-semibold text-indigo-100">Free plan:</span> {usage.pointsLeft} / {usage.pointsLimit} points left this month (resets monthly).
        </div>
      ) : null}

      {/* Analytics Metrics Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40 p-6 shadow-sm backdrop-blur transition-all hover:border-slate-600 hover:shadow-md">
          <div className="text-sm font-medium text-slate-400">Total Projects</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-white">
              {isLoading ? "-" : analytics?.totalProjects || 0}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl"></div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40 p-6 shadow-sm backdrop-blur transition-all hover:border-slate-600 hover:shadow-md">
          <div className="text-sm font-medium text-slate-400">Total Page Views</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-white">
              {isLoading ? "-" : analytics?.totalPageViews || 0}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl"></div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40 p-6 shadow-sm backdrop-blur transition-all hover:border-slate-600 hover:shadow-md">
          <div className="text-sm font-medium text-slate-400">Unique Visitors</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-white">
               {isLoading ? "-" : analytics?.totalVisits || 0}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl"></div>
        </div>
      </div>

      <div className="mb-4 text-lg font-semibold text-white">Quick Actions</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="group relative overflow-hidden p-6 transition-all hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <div className="relative z-10">
            <div className="text-sm font-semibold text-white">Create a new product</div>
            <div className="mt-2 text-sm text-slate-300/80">Generate a website or a mobile app instantly using our AI engine.</div>
            <div className="mt-5">
              <Link href="/build">
                <Button className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">Open Generator</Button>
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
        </Card>
        
        <Card className="group p-6 transition-all hover:border-slate-600">
          <div className="text-sm font-semibold text-white">View saved projects</div>
          <div className="mt-2 text-sm text-slate-300/80">See all websites and apps you’ve generated and saved.</div>
          <div className="mt-5">
            <Link href="/dashboard/my-websites">
              <Button variant="secondary" className="w-full sm:w-auto hover:bg-slate-800 text-slate-200">My Projects</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="group p-6 transition-all hover:border-slate-600">
          <div className="text-sm font-semibold text-white">Prompt-based builder</div>
          <div className="mt-2 text-sm text-slate-300/80">No templates. Describe what you want and build instantly.</div>
          <div className="mt-5">
            <Link href="/build">
              <Button variant="secondary" className="w-full sm:w-auto hover:bg-slate-800 text-slate-200">Open Builder</Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

