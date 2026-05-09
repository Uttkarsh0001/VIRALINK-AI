"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";

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

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Generate", href: "/generate" },
  { label: "Vault", href: "/vault" },
  { label: "History", href: "/history", active: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Profile", href: "/profile" },
];

const toolLabelMap: Record<string, string> = {
  hooks: "Hooks",
  titles: "Titles",
  ctas: "CTAs",
  captions: "Captions",
  hook_to_script: "Scripts",
  hook_analyzer: "Analyzer",
  content_pack: "Content Packs",
};

const toolRouteMap: Record<string, string> = {
  hooks: "/generate?tool=hooks",
  titles: "/generate?tool=titles",
  ctas: "/generate?tool=ctas",
  captions: "/generate?tool=captions",
  hook_to_script: "/generate?tool=hook_to_script",
  hook_analyzer: "/generate?tool=hook_analyzer",
  content_pack: "/generate?tool=content_pack",
};

function formatDate(date?: string) {
  if (!date) return "Recently";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function formatDateTime(date?: string) {
  if (!date) return "Recently";
  try {
    return new Date(date).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

function getRelativeTime(date?: string) {
  if (!date) return "Recently";

  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;
  return formatDate(date);
}

function getToolBadge(tool: string) {
  const styles: Record<string, string> = {
    hooks: "from-cyan-500/20 to-blue-500/10 text-cyan-200 border-cyan-400/20",
    titles: "from-fuchsia-500/20 to-pink-500/10 text-fuchsia-200 border-fuchsia-400/20",
    ctas: "from-emerald-500/20 to-green-500/10 text-emerald-200 border-emerald-400/20",
    captions: "from-orange-500/20 to-amber-500/10 text-orange-200 border-orange-400/20",
    hook_to_script: "from-violet-500/20 to-purple-500/10 text-violet-200 border-violet-400/20",
    hook_analyzer: "from-rose-500/20 to-red-500/10 text-rose-200 border-rose-400/20",
    content_pack: "from-sky-500/20 to-cyan-500/10 text-sky-200 border-sky-400/20",
  };

  return (
    styles[tool] ||
    "from-white/10 to-white/5 text-white/80 border-white/10"
  );
}

export default function HistoryPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<GenerationRow[]>([]);
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setHistoryItems((data as GenerationRow[]) || []);
      }

      setLoading(false);
    };

    loadHistory();
  }, [supabase]);

  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch =
        item.preview?.toLowerCase().includes(search.toLowerCase()) ||
        item.topic?.toLowerCase().includes(search.toLowerCase()) ||
        item.niche?.toLowerCase().includes(search.toLowerCase()) ||
        item.platform?.toLowerCase().includes(search.toLowerCase()) ||
        item.style?.toLowerCase().includes(search.toLowerCase());

      const matchesTool = toolFilter === "all" || item.tool === toolFilter;
      const matchesPlatform =
        platformFilter === "all" ||
        (item.platform || "").toLowerCase() === platformFilter.toLowerCase();

      return matchesSearch && matchesTool && matchesPlatform;
    });
  }, [historyItems, search, toolFilter, platformFilter]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, GenerationRow[]> = {};

    filteredItems.forEach((item) => {
      const dateKey = formatDate(item.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return groups;
  }, [filteredItems]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this history item?");
    if (!confirmed) return;

    const { error } = await supabase.from("generations").delete().eq("id", id);

    if (!error) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      alert("Copy failed.");
    }
  }

  const totalItems = historyItems.length;
  const todayCount = historyItems.filter((item) => {
    if (!item.created_at) return false;
    const today = new Date();
    const created = new Date(item.created_at);
    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  }).length;

  const thisWeekCount = historyItems.filter((item) => {
    if (!item.created_at) return false;
    const now = new Date();
    const created = new Date(item.created_at);
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const uniqueTools = new Set(historyItems.map((item) => item.tool)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex">
        <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] p-6 flex-col">
          <div className="h-12 w-44 rounded-2xl bg-white/10 animate-pulse mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="space-y-6">
            <div className="h-36 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col sticky top-0 h-screen">
        <BrandLogo />

        <nav className="space-y-2 mt-8">
          {navItems.map((item) => (
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
            <p className="text-sm font-medium">Track your creator momentum.</p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Review what you generated, what you tested, and what you can improve next.
            </p>
            <Link
              href="/generate"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium hover:scale-[1.02] transition"
            >
              Generate Again
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-5 md:p-8 xl:p-10">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm text-cyan-300/80">History</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            Your full creator activity timeline
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/55 max-w-2xl">
            Review every hook, title, script, caption and content pack you’ve generated.
          </p>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#09111d] to-[#060b16] p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.95fr] gap-8 items-start">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Generation Timeline
              </span>

              <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-tight">
                See your content creation streak and output flow.
              </h2>

              <p className="mt-3 max-w-2xl text-sm md:text-base text-white/60 leading-relaxed">
                Your history helps you spot patterns, revisit past ideas, and build better creator instincts over time.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/generate"
                  className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium hover:scale-[1.02] transition"
                >
                  Create New Output
                </Link>
                <Link
                  href="/vault"
                  className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/8 transition"
                >
                  Open Vault
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/55">Total Activity</p>
                <p className="mt-3 text-3xl font-semibold">{totalItems}</p>
                <p className="mt-2 text-xs text-cyan-300/70">All generations tracked</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/55">Today</p>
                <p className="mt-3 text-3xl font-semibold">{todayCount}</p>
                <p className="mt-2 text-xs text-white/45">Fresh creator activity</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/55">This Week</p>
                <p className="mt-3 text-3xl font-semibold">{thisWeekCount}</p>
                <p className="mt-2 text-xs text-white/45">
                  Across {uniqueTools} tool{uniqueTools !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-8 grid grid-cols-1 xl:grid-cols-[1.2fr_0.55fr_0.55fr_auto] gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-2">
            <input
              type="text"
              placeholder="Search topic, niche, style, platform or output..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl bg-transparent px-4 py-4 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-2">
            <select
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              className="w-full rounded-2xl bg-[#0b1220] px-4 py-4 text-white outline-none border border-white/10"
            >
              <option value="all">All Tools</option>
              <option value="hooks">Hooks</option>
              <option value="titles">Titles</option>
              <option value="ctas">CTAs</option>
              <option value="captions">Captions</option>
              <option value="hook_to_script">Scripts</option>
              <option value="hook_analyzer">Analyzer</option>
              <option value="content_pack">Content Packs</option>
            </select>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full rounded-2xl bg-[#0b1220] px-4 py-4 text-white outline-none border border-white/10"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center justify-center text-sm text-white/60">
            {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
          </div>
        </section>

        {/* TIMELINE */}
        {filteredItems.length ? (
          <section className="space-y-8">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45 whitespace-nowrap">
                    {date}
                  </p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <div
                              className={`inline-flex items-center rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-medium ${getToolBadge(
                                item.tool
                              )}`}
                            >
                              {toolLabelMap[item.tool] || item.tool}
                            </div>

                            <span className="text-xs text-white/40">
                              {getRelativeTime(item.created_at)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-xl font-semibold leading-tight">
                            {item.topic || "Untitled generation"}
                          </h3>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {item.niche && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                                Niche: {item.niche}
                              </span>
                            )}
                            {item.platform && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                                Platform: {item.platform}
                              </span>
                            )}
                            {item.style && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                                Style: {item.style}
                              </span>
                            )}
                          </div>

                          <div className="mt-5 rounded-3xl border border-white/10 bg-[#09111d]/80 p-5">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                              Output Preview
                            </p>
                            <p className="mt-3 text-sm leading-7 text-white/75 whitespace-pre-wrap">
                              {item.preview || "No preview available."}
                            </p>
                          </div>
                        </div>

                        <div className="lg:w-[220px] shrink-0">
                          <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 p-5">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                              Generated
                            </p>
                            <p className="mt-3 text-sm text-white/75 leading-relaxed">
                              {formatDateTime(item.created_at)}
                            </p>

                            <div className="mt-5 flex flex-col gap-3">
                              <button
                                onClick={() =>
                                  handleCopy(item.preview || item.topic || "", item.id)
                                }
                                className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-medium hover:scale-[1.02] transition"
                              >
                                {copiedId === item.id ? "Copied" : "Copy Output"}
                              </button>

                              <Link
                                href={toolRouteMap[item.tool] || "/generate"}
                                className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/8 transition text-center"
                              >
                                Reopen Tool
                              </Link>

                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/15 transition"
                              >
                                Delete Entry
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-10 md:p-14 text-center">
            <div className="mx-auto max-w-2xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">
                No History Yet
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold">
                Your generation timeline is still empty.
              </h2>
              <p className="mt-4 text-white/55 leading-relaxed">
                Once you start generating hooks, captions, scripts and content packs, every action will appear here automatically.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
          </section>
        )}
      </main>
    </div>
  );
}