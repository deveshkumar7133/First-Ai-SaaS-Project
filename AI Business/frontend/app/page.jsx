import Link from "next/link";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="py-16">
      <div className="container-page">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h2>
          {subtitle ? <p className="mt-2 text-slate-300/80">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bolt-bg">
      <header className="border-b border-slate-800/70 bg-slate-950/40 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-8 items-center rounded-lg border border-slate-800/70 bg-slate-950/40 px-2 text-sm">
              InstantSite AI
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-slate-100">
              Features
            </a>
            <a href="#how" className="hover:text-slate-100">
              How it Works
            </a>
            <a href="#footer" className="hover:text-slate-100">
              Deploy
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-slate-300 hover:text-slate-100">
              Log in
            </Link>
            <Link href="/build">
              <Button>Generate Website</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Create stunning websites by chatting with AI
                </div>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                  What will you <span className="text-indigo-300">build</span> today?
                </h1>
                <p className="mt-4 text-lg text-slate-300/90">
                  Prompt → Generate → Preview → Auto-fix → Export. A clean, modern workflow powered entirely by AI.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/build">
                    <Button className="px-6 py-3">Build now</Button>
                  </Link>
                  <Link href="/build">
                    <Button variant="secondary" className="px-6 py-3">
                      Try the Builder
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { t: "Prompt-driven build", d: "One input turns into a structured, previewable website." },
                    { t: "Live preview + code", d: "Preview side-by-side and view/export code anytime." },
                    { t: "Auto-fix loop", d: "Ask for changes and regenerate with 1 click." }
                  ].map((x) => (
                    <Card key={x.t} className="p-5">
                      <div className="text-sm font-semibold">{x.t}</div>
                      <div className="mt-2 text-sm text-slate-300/80">{x.d}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-4">
                <div className="text-sm font-semibold">Quick build</div>
                <div className="mt-1 text-sm text-slate-300/80">Jump straight into the builder.</div>
                <div className="mt-4 space-y-3">
                  <div className="bolt-surface p-4">
                    <div className="text-xs text-slate-400">Try:</div>
                    <div className="mt-2 text-sm text-slate-200">
                      "Build a modern restaurant website with online reservations and a menu section."
                    </div>
                  </div>
                  <Link href="/build" className="inline-flex w-full">
                    <Button className="w-full py-2.5">Open Builder</Button>
                  </Link>
                  <div className="text-xs text-slate-400">
                    Login required for generation and export.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <Section
          id="features"
          title="Features"
          subtitle="Everything you need to generate, preview, and ship business websites."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["AI Website Generator", "Turn a short business brief into a full website in seconds."],
              ["Unique Every Time", "AI generates a different layout, theme, and copy on every prompt."],
              ["Live Website Preview", "Preview changes instantly while you build."],
              ["Code Export", "Export HTML/CSS/React code and deploy anywhere."],
              ["Custom Sections", "Compose your site like blocks: add, remove, reorder."]
            ].map(([t, d]) => (
              <Card key={t} className="p-6">
                <div className="text-base font-semibold">{t}</div>
                <div className="mt-2 text-sm text-slate-300/80">{d}</div>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="how" title="How It Works" subtitle="From prompt to a publish-ready site in three steps.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ["Step 1: Describe your idea", "Type a short prompt — business name, type, vibe, features."],
              ["Step 2: AI generates your website", "InstantSite AI creates unique sections, copy, and theme automatically."],
              ["Step 3: Preview and publish", "Preview, tweak, export code, and deploy."]
            ].map(([t, d]) => (
              <Card key={t} className="p-6">
                <div className="text-base font-semibold">{t}</div>
                <div className="mt-2 text-sm text-slate-300/80">{d}</div>
              </Card>
            ))}
          </div>
        </Section>
      </main>

      <footer id="footer" className="border-t border-slate-800/70 py-10">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-300/80">© {new Date().getFullYear()} InstantSite AI</div>
          <div className="text-sm text-slate-300/80">
            InstantSite AI • instantsite.cc • Built with Next.js, Express, MongoDB, and OpenAI
          </div>
        </div>
      </footer>
    </div>
  );
}
