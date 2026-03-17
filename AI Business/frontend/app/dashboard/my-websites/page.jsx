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
    <DashboardShell title="My Projects" subtitle="All websites you’ve generated and saved.">
      {error ? <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm">{error}</div> : null}

      {loading ? (
        <Card className="p-6">Loading...</Card>
      ) : websites.length === 0 ? (
        <Card className="p-8">
          <div className="text-base font-semibold">No projects yet</div>
          <div className="mt-2 text-sm text-slate-300/80">Generate your first website in minutes.</div>
          <div className="mt-6">
            <Link href="/build">
              <Button>Open Builder</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {websites.map((w) => (
            <Card key={w._id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">{w.siteName}</div>
                  <div className="mt-1 text-sm text-slate-300/80">{w.sections?.length || 0} sections</div>
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

