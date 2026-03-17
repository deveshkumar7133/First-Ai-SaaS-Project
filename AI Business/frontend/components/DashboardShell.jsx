"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./Button";
import { useAuth } from "./AuthProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Projects", href: "/dashboard/my-websites" },
  { label: "Builder", href: "/build" },
  { label: "Credits", href: "/dashboard/plans" },
  { label: "Settings", href: "/dashboard/settings" }
];

export function DashboardShell({ children, title, subtitle }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.token) router.push("/login");
  }, [auth.token, router]);

  return (
    <div className="min-h-screen bolt-bg">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800/70 bg-slate-950/30 p-4 md:flex">
          <Link href="/" className="bolt-surface rounded-xl px-3 py-2 text-sm font-semibold">
            InstantSite AI
          </Link>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm ${
                    active
                      ? "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/20"
                      : "text-slate-300 hover:bg-slate-900/40"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                auth.logout();
                router.push("/");
              }}
            >
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-800/70 bg-slate-950/40 backdrop-blur">
            <div className="container-page flex items-center justify-between py-4">
              <div>
                <div className="text-base font-semibold">{title || "InstantSite AI Dashboard"}</div>
                {subtitle ? <div className="mt-0.5 text-sm text-slate-300/80">{subtitle}</div> : null}
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Link href="/dashboard/create-website">
                  <Button>Generate</Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 py-8">
            <div className="container-page">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

