"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";

type UserProfile = {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  credits?: number;
  plan?: string;
};

type GenerationRow = {
  id: string;
  tool: string;
  niche: string;
  topic: string;
  style: string;
  platform: string;
  preview: string;
  created_at?: string;
};

type DashboardStats = {
  totalGenerations: number;
  activeDays: number;
  mostUsedTool: string;
  creatorJourneyScore: number;
};

const tools = [
  {
    title: "Hook Generator",
    desc: "Create scroll-stopping hooks instantly.",
    href: "/generate?tool=hooks",
    glow: "from-cyan-500/25 to-blue-500/10",
  },
  {
    title: "Title Generator",
    desc: "Generate clickable viral titles.",
    href: "/generate?tool=titles",
    glow: "from-fuchsia-500/25 to-pink-500/10",
  },
  {
    title: "CTA Generator",
    desc: "Drive more comments, saves and DMs.",
    href: "/generate?tool=ctas",
    glow: "from-emerald-500/25 to-green-500/10",
  },
  {
    title: "Caption Generator",
    desc: "Write platform-native captions fast.",
    href: "/generate?tool=captions",
    glow: "from-orange-500/25 to-amber-500/10",
  },
  {
    title: "Hook to Script",
    desc: "Turn an idea into a reel-ready script.",
    href: "/generate?tool=hook_to_script",
    glow: "from-violet-500/25 to-purple-500/10",
  },
  {
    title: "Content Pack",
    desc: "Get angle, title, script, caption and CTA.",
    href: "/generate?tool=content_pack",
    glow: "from-rose-500/25 to-red-500/10",
  },
];

const toolPointsMap: Record<string, number> = {
  hooks: 6,
  titles: 5,
  ctas: 4,
  captions: 5,
  hook_to_script: 9,
  hook_analyzer: 7,
  content_pack: 12,
};

const toolLabelMap: Record<string, string> = {
  hooks: "Hooks",
  titles: "Titles",
  ctas: "CTAs",
  captions: "Captions",
  hook_to_script: "Scripts",
  hook_analyzer: "Analyzer",
  content_pack: "Content Packs",
};

function getInitials(name?: string, email?: string) {
  const source = name || email || "U";
  return source
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Late night grind";
}

function formatDate(date?: string) {
  if (!date) return "Recently";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Recently";
  }
}

function calculateCreatorJourneyScore(
  allGenerations: GenerationRow[],
  credits: number
) {
  if (!allGenerations.length) return Math.min(100, Math.round((credits || 0) * 0.6));

  const generationPoints = allGenerations.reduce(
    (acc, item) => acc + (toolPointsMap[item.tool] || 4),
    0
  );

  const uniqueToolsUsed = new Set(allGenerations.map((item) => item.tool)).size;
  const uniqueDays = new Set(
    allGenerations
      .map((item) =>
        item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : null
      )
      .filter(Boolean)
  ).size;

  const score =
    generationPoints * 0.8 +
    uniqueToolsUsed * 6 +
    uniqueDays * 2 +
    Math.min((credits || 0) * 0.6, 20);

  return Math.min(100, Math.round(score));
}

function getMostUsedTool(allGenerations: GenerationRow[]) {
  if (!allGenerations.length) return "Hooks";

  const counts: Record<string, number> = {};

  allGenerations.forEach((item) => {
    counts[item.tool] = (counts[item.tool] || 0) + 1;
  });

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return toolLabelMap[winner] || "Hooks";
}

function getActiveDays(allGenerations: GenerationRow[]) {
  if (!allGenerations.length) return 0;

  const uniqueDays = new Set(
    allGenerations
      .map((item) =>
        item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : null
      )
      .filter(Boolean)
  );

  return uniqueDays.size;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<GenerationRow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalGenerations: 0,
    activeDays: 0,
    mostUsedTool: "Hooks",
    creatorJourneyScore: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [{ data: profileData }, { data: recentGenerations }, { data: allGenerations }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),

          supabase
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(8),

          supabase
            .from("generations")
            .select("id, tool, topic, created_at, niche, style, platform, preview")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      const credits = profileData?.credits ?? 0;

      setProfile({
        id: user.id,
        email: user.email || "",
        username:
          profileData?.username ||
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "Creator",
        full_name: profileData?.full_name || "",
        credits,
        plan: profileData?.plan || "Free",
      });

      setHistory((recentGenerations as GenerationRow[]) || []);

      const allRows = (allGenerations as GenerationRow[]) || [];

      setStats({
        totalGenerations: allRows.length,
        activeDays: getActiveDays(allRows),
        mostUsedTool: getMostUsedTool(allRows),
        creatorJourneyScore: calculateCreatorJourneyScore(allRows, credits),
      });

      setLoading(false);
    };

    loadDashboard();
  }, [supabase]);

  const username =
    profile?.username || profile?.full_name || profile?.email?.split("@")[0] || "Creator";

  const totalGenerations = stats.totalGenerations;
  const creatorJourneyScore = stats.creatorJourneyScore;
  const activeDays = stats.activeDays;
  const activePlan = profile?.plan || "Free";
  const creditsLeft = profile?.credits ?? 0;
  const mostUsedTool = stats.mostUsedTool;

  const recentTopics = useMemo(() => {
    const uniqueTopics = new Set<string>();
    const result: GenerationRow[] = [];

    for (const item of history) {
      if (!item.topic) continue;
      const normalized = item.topic.trim().toLowerCase();
      if (!uniqueTopics.has(normalized)) {
        uniqueTopics.add(normalized);
        result.push(item);
      }
      if (result.length >= 3) break;
    }

    return result;
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex-col">
          <div className="h-10 w-36 rounded-xl bg-white/10 animate-pulse mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          <div className="space-y-6">
            <div className="h-36 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 h-80 rounded-3xl bg-white/5 animate-pulse" />
              <div className="h-80 rounded-3xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col sticky top-0 h-screen">

          <BrandLogo />


        <nav className="space-y-2">
          {[
            { label: "Dashboard", href: "/dashboard", active: true },
            { label: "Generate", href: "/generate", active: false },
            { label: "Vault", href: "/vault", active: false },
            { label: "History", href: "/history", active: false },
            { label: "Pricing", href: "/pricing", active: false },
            { label: "Profile", href: "/profile", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all ${
                item.active
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-400/20 text-white"
                  : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  item.active ? "bg-cyan-400" : "bg-white/10 group-hover:bg-white/30"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5">
            <p className="text-sm font-medium">Need more credits?</p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Unlock more generations, content packs and faster creation flow.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium hover:scale-[1.02] transition"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 md:p-8 xl:p-10">
        {/* TOP BAR */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm text-cyan-300/80">{getGreeting()}</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Your creator engine is ready. Let’s build something that hooks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Credits Left
              </p>
              <p className="text-xl font-semibold">{creditsLeft}</p>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 p-[1px] shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              <div className="h-full w-full rounded-2xl bg-[#081120] flex items-center justify-center text-sm font-semibold">
                {getInitials(profile?.username || profile?.full_name, profile?.email)}
              </div>
            </div>
          </div>
        </div>

        {/* HERO / SCORE PANEL */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#09111d] to-[#060b16] p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_24%)]" />
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6 items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Creator Dashboard
              </span>

              <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-tight">
                Turn ideas into scroll-stopping content faster.
              </h2>

              <p className="mt-3 max-w-2xl text-sm md:text-base text-white/60 leading-relaxed">
                Use your AI tool stack to generate hooks, scripts, captions and complete
                content packs built to improve retention and response.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/generate"
                  className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium hover:scale-[1.02] transition"
                >
                  Start Generating
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/8 transition"
                >
                  View Plans
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/65">Creator Journey Score</p>
                <p className="text-3xl font-semibold">{creatorJourneyScore}</p>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                  style={{ width: `${creatorJourneyScore}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Generations</p>
                  <p className="mt-2 text-xl font-semibold">{totalGenerations}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Best Tool</p>
                  <p className="mt-2 text-base font-semibold">{mostUsedTool}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Active Days</p>
                  <p className="mt-2 text-xl font-semibold">{activeDays}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/55">Credits Left</p>
            <p className="mt-3 text-3xl font-semibold">{creditsLeft}</p>
            <p className="mt-2 text-xs text-cyan-300/70">Use them strategically</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/55">Active Plan</p>
            <p className="mt-3 text-3xl font-semibold">{activePlan}</p>
            <p className="mt-2 text-xs text-white/45">Upgrade for more output</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/55">Total Generations</p>
            <p className="mt-3 text-3xl font-semibold">{totalGenerations}</p>
            <p className="mt-2 text-xs text-white/45">Your content momentum</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/55">Creator Rank</p>
            <p className="mt-3 text-3xl font-semibold">
              {creatorJourneyScore >= 80
                ? "Elite"
                : creatorJourneyScore >= 55
                ? "Rising"
                : "Starter"}
            </p>
            <p className="mt-2 text-xs text-white/45">Based on your activity</p>
          </div>
        </section>

        {/* TOOL GRID + RECENT ACTIVITY */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* TOOLS */}
          <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold">AI Tools</h3>
                <p className="text-sm text-white/50 mt-1">
                  Your creator weapons. Pick one and generate fast.
                </p>
              </div>
              <Link
                href="/generate"
                className="text-sm text-cyan-300 hover:text-cyan-200 transition"
              >
                Open Generator →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${tool.glow} p-[1px] transition hover:scale-[1.015]`}
                >
                  <div className="h-full rounded-[22px] bg-[#09111d]/95 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">{tool.title}</h4>
                        <p className="mt-2 text-sm text-white/55 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white transition">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Recent Creator Activity</h3>
              <p className="text-sm text-white/50 mt-1">
                Your latest generations and experiments.
              </p>

              <div className="mt-5 space-y-3">
                {history.length ? (
                  history.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {toolLabelMap[item.tool] || item.tool}
                        </p>
                        <span className="text-[11px] text-white/40">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/55 line-clamp-2">
                        {item.preview || item.topic}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
                    No generations yet. Start with hooks or content packs.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Recent Topics</h3>
              <p className="text-sm text-white/50 mt-1">
                What you’ve been creating around.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {recentTopics.length ? (
                  recentTopics.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75"
                    >
                      {item.topic.length > 36 ? item.topic.slice(0, 36) + "..." : item.topic}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/45">No topics yet.</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}