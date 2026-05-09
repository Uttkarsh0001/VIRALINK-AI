"use client";

import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  currentPage: "dashboard" | "generate";
  profile?: {
    username?: string | null;
    full_name?: string | null;
    email?: string | null;
    plan?: string | null;
    credits?: number | null;
  } | null;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/generate", label: "Generate", key: "generate" },
];

const premiumItems = [
  { label: "Vault", badge: "Soon" },
  { label: "Daily Brainstormer", badge: "Pro" },
  { label: "30-Day Planner", badge: "Pro" },
  { label: "Offer Positioning", badge: "Max" },
];

export default function AppShell({
  children,
  currentPage,
  profile,
}: AppShellProps) {
  const displayName =
    profile?.username ||
    profile?.full_name ||
    profile?.email ||
    "Creator";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 md:px-6 md:py-6">
        {/* SIDEBAR */}
        <aside className="hidden w-[290px] shrink-0 xl:block">
          <div className="sticky top-6 space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <Link href="/" className="block">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
                  Creator OS
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                    VIRALINK AI
                  </span>
                </h1>
              </Link>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Your creator messaging workspace for hooks, scripts, captions,
                content packs and future planning tools.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.24em] text-white/35">
                Workspace
              </p>

              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = currentPage === item.key;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-400/15 via-blue-500/15 to-fuchsia-500/15 text-white shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                          : "text-white/70 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                          Live
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.24em] text-white/35">
                Premium Stack
              </p>

              <div className="space-y-2">
                {premiumItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#0D1220] px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-white/75">
                      {item.label}
                    </span>
                    <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/12 via-blue-500/10 to-fuchsia-500/10 p-5 shadow-[0_0_50px_rgba(34,211,238,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/75">
                Upgrade Path
              </p>
              <h3 className="mt-3 text-2xl font-black">
                Unlock your creator system
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Get more credits, deeper outputs, premium planning tools, and
                future workflow modules.
              </p>

              <Link
                href="/pricing"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
              >
                Upgrade Now
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 text-xl font-black text-black">
                  {avatarLetter}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-white/45">
                    {profile?.email || "Logged in creator"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#0D1220] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
                    Plan
                  </p>
                  <p className="mt-2 text-lg font-black capitalize">
                    {profile?.plan || "free"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0D1220] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-300/70">
                    Credits
                  </p>
                  <p className="mt-2 text-lg font-black">
                    {profile?.credits ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1">
          {children}
        </section>
      </div>
    </main>
  );
}