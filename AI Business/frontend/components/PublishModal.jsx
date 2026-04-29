import { useState } from "react";
import { Button } from "./Button";
import { api } from "../lib/api";

export function PublishModal({ website, onClose, onPublishSuccess }) {
  const [subdomain, setSubdomain] = useState(website?.subdomain || "");
  const [customDomain, setCustomDomain] = useState(website?.customDomain || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handlePublish(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {};
      if (subdomain.trim() !== (website?.subdomain || "")) {
        payload.subdomain = subdomain.trim() || null;
      }
      if (customDomain.trim() !== (website?.customDomain || "")) {
        payload.customDomain = customDomain.trim() || null;
      }

      // Always call publish to ensure isPublished is set to true
      const res = await api.publishWebsite(website._id, payload);
      setSuccess(true);
      if (onPublishSuccess) {
        onPublishSuccess(res.website);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  const defaultUrl = `${window.location.origin}/site/${website?._id}`;
  const generatedSubdomainUrl = subdomain ? `https://${subdomain}.instantsite.ai` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-slate-800/80 px-6 py-5">
          <h2 className="text-xl font-semibold tracking-tight text-white">Publish your site</h2>
          <p className="mt-1 text-sm text-slate-400">Make your website live to the world instantly.</p>
        </div>

        <form onSubmit={handlePublish} className="p-6">
          <div className="space-y-5">

            {/* Default Public URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Default Public Link</label>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-sm text-slate-400">
                Your site will instantly be available at:<br />
                <a href={`/site/${website?._id}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline mt-1 inline-block font-medium">
                  {defaultUrl}
                </a>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800/80"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500 font-semibold uppercase tracking-wider">optional upgrades</span>
              </div>
            </div>
            
            {/* Subdomain Settings */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Free Subdomain</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/50 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <input
                  type="text"
                  placeholder="my-awesome-site"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 outline-none"
                />
                <span className="bg-slate-900/50 px-4 py-3 text-sm text-slate-400 border-l border-slate-800/80 select-none">
                  .instantsite.ai
                </span>
              </div>
              {generatedSubdomainUrl && (
                <div className="mt-2 text-xs text-slate-400 font-medium">
                  Your site will be live at: <a href={generatedSubdomainUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{generatedSubdomainUrl}</a>
                </div>
              )}
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800/80"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500 font-semibold uppercase tracking-wider">or</span>
              </div>
            </div>

            {/* Custom Domain Settings */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Custom Domain <span className="ml-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-indigo-300">Pro</span></label>
              <input
                type="text"
                placeholder="www.mybusiness.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                className="w-full rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              />
              
              {customDomain && (
                <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                  <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">DNS Configuration</h4>
                  <p className="mt-1 text-sm text-slate-300 mb-3">To connect your domain, log in to your DNS provider and add this CNAME record:</p>
                  <div className="rounded-lg bg-slate-950/80 p-3 font-mono text-sm shadow-inner border border-slate-800/50">
                    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
                      <span className="text-slate-500">Type</span>
                      <span className="text-indigo-300 font-semibold">CNAME</span>
                      <span className="text-slate-500">Name</span>
                      <span className="text-slate-200">www</span>
                      <span className="text-slate-500">Value</span>
                      <span className="text-slate-200 break-all">instantsite.ai</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-200 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/30">
                  <div className="h-full bg-emerald-500 animate-[progress_1.5s_ease-out]" style={{width: "100%"}}></div>
                </div>
                🎉 Published successfully! Your settings have been saved.
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-800/80 pt-5">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading || success}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? "Publishing..." : "Publish Site"}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Progress animation keyframes for inline style */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}} />
    </div>
  );
}
