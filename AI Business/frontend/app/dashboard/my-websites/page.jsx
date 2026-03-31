"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/DashboardShell";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { api } from "../../../lib/api";

export default function MyWebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | website | mobile

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError("");
      setLoading(true);
      try {
        const res = await api.listWebsites();
        if (mounted) setWebsites(res.websites || []);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load websites");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardShell title="My Projects" subtitle="Websites and mobile apps you’ve generated and saved.">
      {error ? <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">{error}</div> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl border px-3 py-1.5 text-sm ${filter === "all" ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-100" : "border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-900/40"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("website")}
          className={`rounded-xl border px-3 py-1.5 text-sm ${filter === "website" ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-100" : "border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-900/40"}`}
        >
          Websites
        </button>
        <button
          type="button"
          onClick={() => setFilter("mobile")}
          className={`rounded-xl border px-3 py-1.5 text-sm ${filter === "mobile" ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-100" : "border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-900/40"}`}
        >
          Apps
        </button>
      </div>

      {loading ? (
        <Card className="p-6">Loading...</Card>
      ) : (filter === "all" ? websites : websites.filter((w) => w.type === filter)).length === 0 ? (
        <Card className="p-8">
          <div className="text-base font-semibold">No projects yet</div>
          <div className="mt-2 text-sm text-slate-300/80">Generate your first project in minutes.</div>
          <div className="mt-6">
            <Link href="/build">
              <Button>Open Builder</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(filter === "all" ? websites : websites.filter((w) => w.type === filter)).map((w) => (
            <Card key={w._id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">{w.siteName}</div>
                  <div className="mt-1 text-sm text-slate-300/80">
                    {w.type === "mobile" ? `${(w.mobileSpec?.screens || []).length} screens` : `${w.sections?.length || 0} sections`}
                  </div>
                  {w.prompt ? (
                    <div className="mt-2 text-xs text-slate-400 line-clamp-2">Prompt: {w.prompt}</div>
                  ) : null}
                  <div className="mt-2 text-xs text-slate-400">
                    Created: {w.createdAt ? new Date(w.createdAt).toLocaleString() : "-"}
                  </div>
                </div>
                <Link href={`/preview/${w._id}`}>
                  <Button variant="secondary">Preview</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

