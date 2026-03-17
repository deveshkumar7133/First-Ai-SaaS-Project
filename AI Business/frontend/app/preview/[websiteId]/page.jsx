"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
import { SectionRenderer } from "../../../components/dynamic/SectionRenderer";
import { Button } from "../../../components/Button";
import { MonacoCodeViewer } from "../../../components/MonacoCodeViewer";

export default function PreviewPage() {
  const { websiteId } = useParams();
  const router = useRouter();
  const auth = useAuth();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState("preview"); // preview | code
  const [exportHtml, setExportHtml] = useState("");
  const [exportJson, setExportJson] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    if (!auth.token) router.push("/login");
  }, [auth.token, router]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.getWebsite(websiteId);
        if (mounted) setWebsite(res.website);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load website");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (websiteId) load();
    return () => {
      mounted = false;
    };
  }, [websiteId]);

  async function loadCode(id) {
    setLoadingCode(true);
    setError("");
    try {
      const [html, json] = await Promise.all([api.exportWebsiteHtml(id), api.exportWebsiteJson(id)]);
      setExportHtml(html || "");
      setExportJson(JSON.stringify(json?.website || json, null, 2));
    } catch (err) {
      setError(err.message || "Failed to load code");
    } finally {
      setLoadingCode(false);
    }
  }

  function copy(text) {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bolt-bg text-slate-100">
        <div className="container-page py-10">Loading preview…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bolt-bg text-slate-100">
        <div className="container-page py-10">
          <div className="rounded-2xl border border-rose-900/50 bg-rose-950/40 p-4">{error}</div>
          <div className="mt-5">
            <Link href="/dashboard/my-websites">
              <Button variant="secondary">Back to My Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!website) return null;

  async function onExport() {
    setExporting(true);
    try {
      const { blob, filename } = await api.exportWebsite(website._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/40 backdrop-blur">
        <div className="container-page flex items-center justify-between py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{website.siteName}</div>
            <div className="truncate text-xs text-slate-300/80">
              Preview • Prompt-based • {website.sections?.length || 0} sections
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-xl border border-slate-800/70 bg-slate-950/40 p-1 md:flex">
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  tab === "preview" ? "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/20" : "text-slate-300 hover:bg-slate-900/40"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTab("code");
                  if (website?._id && !exportHtml && !exportJson) await loadCode(website._id);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  tab === "code" ? "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/20" : "text-slate-300 hover:bg-slate-900/40"
                }`}
              >
                Code
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(window.location.href);
                } catch {
                  // ignore
                }
              }}
            >
              Copy link
            </Button>
            <Button variant="secondary" onClick={onExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export"}
            </Button>
            <Link href="/build">
              <Button variant="secondary">New</Button>
            </Link>
            <Link href="/dashboard/my-websites">
              <Button variant="secondary">My Projects</Button>
            </Link>
          </div>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="bolt-bg">
          <div className="container-page py-10">
            <SectionRenderer website={website} />
          </div>
        </div>
      ) : (
        <div className="bolt-bg">
          <div className="container-page py-8">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">index.html</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" type="button" onClick={() => copy(exportHtml)} disabled={!exportHtml || loadingCode}>
                      Copy
                    </Button>
                    <Button variant="secondary" type="button" onClick={onExport} disabled={exporting}>
                      {exporting ? "Exporting..." : "Download ZIP"}
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <MonacoCodeViewer value={loadingCode ? "Loading HTML…" : exportHtml || "No HTML yet."} language="html" height="62vh" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">website.json</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" type="button" onClick={() => copy(exportJson)} disabled={!exportJson || loadingCode}>
                      Copy
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        if (website?._id) loadCode(website._id);
                      }}
                      disabled={loadingCode}
                    >
                      {loadingCode ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <MonacoCodeViewer value={loadingCode ? "Loading JSON…" : exportJson || "No JSON yet."} language="json" height="62vh" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

