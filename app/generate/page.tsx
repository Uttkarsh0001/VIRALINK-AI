"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { saveGeneration } from "@/lib/saveGeneration";
import BrandLogo from "@/components/BrandLogo";
import { saveToVault } from "@/lib/saveToVault";

type ToolType =
  | "hooks"
  | "titles"
  | "ctas"
  | "captions"
  | "hook_to_script"
  | "hook_analyzer"
  | "content_pack";

type AnalyzerResult = {
  score: number;
  verdict: string;
  whyWorks: string[];
  whyFails: string[];
  improvements: string[];
  rewrittenHooks: string[];
};

type ContentPackItem = {
  angle: string;
  title: string;
  script: string;
  caption: string;
  cta: string;
};

type GenericResult = {
  results: string[];
  recommendation?: string;
};

type ApiResponse = {
  type: ToolType;
  analyzer?: AnalyzerResult;
  contentPacks?: ContentPackItem[];
  generic?: GenericResult;
};

type Profile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  email: string;
  credits: number;
  plan: string;
};

type GenerationItem = {
  id: string;
  user_id?: string;
  tool: string;
  niche?: string;
  topic: string;
  style?: string;
  platform?: string;
  preview: string;
  output_json?: ApiResponse | null;
  created_at: string;
};

const toolTabs: {
  key: ToolType;
  label: string;
  creditCost: number;
  description: string;
}[] = [
  {
    key: "hooks",
    label: "HOOKS",
    creditCost: 1,
    description: "Generate high-retention opening lines for short-form content.",
  },
  {
    key: "titles",
    label: "TITLES",
    creditCost: 1,
    description: "Create stronger clickable titles for reels, shorts, and videos.",
  },
  {
    key: "ctas",
    label: "CTAS",
    creditCost: 1,
    description:
      "Generate conversion-focused call-to-actions that drive comments, follows, and saves.",
  },
  {
    key: "captions",
    label: "CAPTIONS",
    creditCost: 1,
    description: "Write platform-ready captions with punch, flow, and retention.",
  },
  {
    key: "hook_to_script",
    label: "HOOK → SCRIPT",
    creditCost: 2,
    description: "Turn a content idea into a creator-ready short-form video script.",
  },
  {
    key: "hook_analyzer",
    label: "HOOK ANALYZER",
    creditCost: 1,
    description: "Score your hook out of 100 and improve weak openings instantly.",
  },
  {
    key: "content_pack",
    label: "CONTENT PACK",
    creditCost: 3,
    description: "Generate 2 complete viral-ready content packs for one idea.",
  },
];

const styles = [
  "Curiosity",
  "Bold",
  "Authority",
  "Emotional",
  "Contrarian",
  "Story",
  "Aggressive",
  "Minimal",
  "Dark Psychology",
  "Educational",
];

const platforms = ["Instagram", "YouTube", "LinkedIn", "X / Twitter"];

const toolLabelMap: Record<string, string> = {
  hooks: "Hooks",
  titles: "Titles",
  ctas: "CTAs",
  captions: "Captions",
  hook_to_script: "Scripts",
  hook_analyzer: "Analyzer",
  content_pack: "Content Packs",
};

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeText(value: unknown) {
  return safeText(value).replace(/\r\n/g, "\n").replace(/\\n/g, "\n").trim();
}

function getToolActionLabel(tool: ToolType) {
  if (tool === "hook_analyzer") return "Analyse";
  if (tool === "content_pack") return "Build Pack";
  return "Generate";
}

function getToolPlaceholder(tool: ToolType) {
  if (tool === "hook_analyzer") {
    return `Paste your hook here...

Example: Stop teaching like a textbook if you want people to actually watch your content.`;
  }

  return `Describe the main topic or idea of the content you want to create.

Example: How to make boring educational topics feel addictive`;
}

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

function buildPreview(tool: ToolType, responseData: ApiResponse, fallbackTopic: string) {
  if (tool === "hook_analyzer" && responseData.analyzer) {
    return `Score ${responseData.analyzer.score}/100 • ${responseData.analyzer.verdict}`;
  }

  if (tool === "content_pack" && responseData.contentPacks?.length) {
    return responseData.contentPacks[0]?.title || fallbackTopic;
  }

  if (responseData.generic?.recommendation) {
    return responseData.generic.recommendation;
  }

  if (responseData.generic?.results?.length) {
    return responseData.generic.results[0];
  }

  return fallbackTopic;
}

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [tool, setTool] = useState<ToolType>("hooks");
  const [platform, setPlatform] = useState("Instagram");
  const [style, setStyle] = useState("Curiosity");
  const [niche, setNiche] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<GenerationItem[]>([]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [lastSavedGenerationId, setLastSavedGenerationId] = useState<string | null>(null);
  const [savingToVault, setSavingToVault] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);

  const selectedTool = useMemo(
    () => toolTabs.find((t) => t.key === tool)!,
    [tool]
  );

  useEffect(() => {
    const queryTool = searchParams.get("tool") as ToolType | null;
    if (queryTool && toolTabs.some((t) => t.key === queryTool)) {
      setTool(queryTool);
    }
  }, [searchParams]);

  async function loadUserData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: historyData } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    const finalProfile: Profile = {
      id: user.id,
      email: user.email || "",
      username:
        profileData?.username ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Creator",
      full_name: profileData?.full_name || "",
      credits: profileData?.credits ?? 0,
      plan: profileData?.plan || "Free",
    };

    setProfile(finalProfile);
    setCredits(finalProfile.credits ?? 0);
    setHistory((historyData as GenerationItem[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUserData();
  }, [supabase]);

  async function handleGenerate() {
    setError("");
    setResponse(null);
    setVaultSaved(false);
    setLastSavedGenerationId(null);

    if (!niche.trim()) {
      setError("Please enter your niche.");
      return;
    }

    if (!topic.trim()) {
      setError(
        tool === "hook_analyzer"
          ? "Please paste a hook to analyse."
          : "Please enter your main topic."
      );
      return;
    }

    if (credits < selectedTool.creditCost) {
      setShowUpgrade(true);
      return;
    }

    try {
      setGenerating(true);

      const prompt = {
        tool,
        platform,
        style,
        niche,
        topic,
      };

      const res = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prompt),
      });

      const data = await res.json();

      if (res.status === 402) {
        setShowUpgrade(true);
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      const finalResponse: ApiResponse = {
        type: data?.type || tool,
        analyzer: data?.analyzer,
        contentPacks: Array.isArray(data?.contentPacks) ? data.contentPacks : [],
        generic: {
          results: Array.isArray(data?.generic?.results)
            ? data.generic.results
            : [],
          recommendation: safeText(data?.generic?.recommendation),
        },
      };

      setResponse(finalResponse);

      const previewText = buildPreview(tool, finalResponse, topic);

      const savedGeneration = await saveGeneration({
        tool,
        niche,
        topic,
        style,
        platform,
        preview: previewText,
        output_json: finalResponse,
      });

      if (savedGeneration?.id) {
        setLastSavedGenerationId(savedGeneration.id);
      }

      await loadUserData();
    } catch (err: any) {
      setError(err?.message || "Failed to generate.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveToVault() {
    if (!lastSavedGenerationId) {
      setError("No generation found to save.");
      return;
    }

    try {
      setSavingToVault(true);
      setError("");
      await saveToVault(lastSavedGenerationId);
      setVaultSaved(true);
    } catch (err: any) {
      setError(err?.message || "Failed to save to vault.");
    } finally {
      setSavingToVault(false);
    }
  }

  async function regenerateWithDirection(direction: string) {
    if (!response?.generic?.results?.length) return;

    if (credits < selectedTool.creditCost) {
      setShowUpgrade(true);
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool,
          platform,
          style: `${style} + ${direction}`,
          niche,
          topic,
        }),
      });

      const data = await res.json();

      if (res.status === 402) {
        setShowUpgrade(true);
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to regenerate.");
      }

      const finalResponse: ApiResponse = {
        type: data?.type || tool,
        analyzer: data?.analyzer,
        contentPacks: Array.isArray(data?.contentPacks) ? data.contentPacks : [],
        generic: {
          results: Array.isArray(data?.generic?.results)
            ? data.generic.results
            : [],
          recommendation: safeText(data?.generic?.recommendation),
        },
      };

      setResponse(finalResponse);
      setVaultSaved(false);
      setLastSavedGenerationId(null);

      const savedGeneration = await saveGeneration({
        tool,
        niche,
        topic,
        style: `${style} + ${direction}`,
        platform,
        preview: buildPreview(tool, finalResponse, topic),
        output_json: finalResponse,
      });

      if (savedGeneration?.id) {
        setLastSavedGenerationId(savedGeneration.id);
      }

      await loadUserData();
    } catch (err: any) {
      setError(err?.message || "Failed to regenerate.");
    } finally {
      setGenerating(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  const username =
    profile?.username || profile?.full_name || profile?.email?.split("@")[0] || "Creator";

  const creditsLeft = profile?.credits ?? 0;
  const activePlan = profile?.plan || "Free";
  const totalGenerations = history.length;

  const recentTopics = history.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex">
        <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex-col">
          <div className="h-10 w-36 rounded-xl bg-white/10 animate-pulse mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="space-y-6">
            <div className="h-36 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 h-[520px] rounded-3xl bg-white/5 animate-pulse" />
              <div className="h-[520px] rounded-3xl bg-white/5 animate-pulse" />
            </div>
            <div className="h-72 rounded-3xl bg-white/5 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col sticky top-0 h-screen">
        <BrandLogo />

        <nav className="space-y-2">
          {[
            { label: "Dashboard", href: "/dashboard", active: false },
            { label: "Generate", href: "/generate", active: true },
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

      <main className="flex-1 p-5 md:p-8 xl:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm text-cyan-300/80">{getGreeting()}</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Generate with precision, {username}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Build hooks, scripts, titles and creator assets in one premium workflow.
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
                {getInitials(profile?.username || profile?.full_name || "", profile?.email)}
              </div>
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#09111d] to-[#060b16] p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_24%)]" />
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6 items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                VIRALINK AI Generator
              </span>

              <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-tight">
                Turn one content idea into a complete creator output stack.
              </h2>

              <p className="mt-3 max-w-2xl text-sm md:text-base text-white/60 leading-relaxed">
                Generate viral hooks, stronger titles, conversion CTAs, scripts, captions
                and full content packs with the same premium flow as your dashboard.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium hover:scale-[1.02] transition disabled:opacity-60"
                >
                  {generating ? "Generating..." : getToolActionLabel(tool)}
                </button>

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
                <p className="text-sm text-white/65">Current Tool</p>
                <p className="text-2xl font-semibold">{selectedTool.label}</p>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                  style={{ width: `${Math.min((creditsLeft / 20) * 100, 100)}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Cost</p>
                  <p className="mt-2 text-xl font-semibold">{selectedTool.creditCost}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Plan</p>
                  <p className="mt-2 text-base font-semibold">{activePlan}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">History</p>
                  <p className="mt-2 text-xl font-semibold">{totalGenerations}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {toolTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setTool(tab.key);
                  setResponse(null);
                  setError("");
                  setVaultSaved(false);
                  setLastSavedGenerationId(null);
                }}
                className={`cursor-pointer rounded-2xl border px-4 py-4 text-left transition ${
                  tool === tab.key
                    ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-extrabold tracking-wide">{tab.label}</div>
                <div className="mt-2 text-xs text-white/55">
                  {tab.creditCost} credit{tab.creditCost > 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold">Generator Workspace</h3>
                <p className="text-sm text-white/50 mt-1">{selectedTool.description}</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                  Credits Left
                </p>
                <p className="text-xl font-semibold text-cyan-300">{creditsLeft}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-white/75">Platform</p>
              <div className="flex flex-wrap gap-3">
                {platforms.map((item) => (
                  <button
                    key={item}
                    onClick={() => setPlatform(item)}
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                      platform === item
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {tool !== "hook_analyzer" && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-white/75">Style</p>
                <div className="flex flex-wrap gap-3">
                  {styles.map((item) => (
                    <button
                      key={item}
                      onClick={() => setStyle(item)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                        style === item
                          ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  Niche
                </label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Education Creator, Fitness Coach, Startup Founder"
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  {tool === "hook_analyzer" ? "Hook to Analyse" : "Main Topic"}
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={getToolPlaceholder(tool)}
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-6 py-4 text-lg font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "Working..." : getToolActionLabel(tool)}
            </button>
          </div>

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

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 mb-8">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-semibold">
                {tool === "hook_analyzer"
                  ? "Analysis Report"
                  : tool === "content_pack"
                  ? "Premium Content Packs"
                  : "Generated Results"}
              </h3>
              <p className="text-sm text-white/50 mt-1">
                Your output appears here in a clean creator-ready format.
              </p>
            </div>

            {response && (
              <button
                onClick={handleSaveToVault}
                disabled={savingToVault || vaultSaved || !lastSavedGenerationId}
                className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-bold shadow-lg disabled:opacity-60"
              >
                {vaultSaved ? "Saved to Vault" : savingToVault ? "Saving..." : "Save to Vault"}
              </button>
            )}
          </div>

          {!response && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0D1220]/70 p-8 text-white/45">
              Your generated output will appear here.
            </div>
          )}

          {response?.type === "hook_analyzer" && response?.analyzer && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0D1220] p-6">
                <div className="mb-4 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
                    Hook Score
                  </p>
                  <div className="mt-4 text-6xl font-black text-cyan-300">
                    {response.analyzer.score}
                    <span className="text-2xl text-white/50">/100</span>
                  </div>
                  <p className="mt-3 text-white/65">
                    {safeText(response.analyzer.verdict)}
                  </p>
                </div>
              </div>

              <InfoBlock title="Why This Works" items={response.analyzer.whyWorks} />
              <InfoBlock title="Why This Fails" items={response.analyzer.whyFails} />
              <InfoBlock title="How To Improve It" items={response.analyzer.improvements} />

              <div className="rounded-3xl border border-white/10 bg-[#0D1220] p-5">
                <p className="mb-4 text-lg font-bold">Improved Hook Options</p>
                <div className="space-y-3">
                  {response.analyzer.rewrittenHooks.map((hook, i) => (
                    <button
                      key={i}
                      onClick={() => copyText(hook)}
                      className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white/85 transition hover:bg-white/10"
                    >
                      {normalizeText(hook)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {response?.type === "content_pack" &&
            Array.isArray(response.contentPacks) &&
            response.contentPacks.length > 0 && (
              <div className="space-y-6">
                {response.contentPacks.map((pack, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-white/10 bg-[#0D1220] p-6"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-xl font-black">Content Pack {idx + 1}</h4>
                      <button
                        onClick={() =>
                          copyText(
                            `ANGLE:\n${pack.angle}\n\nTITLE:\n${pack.title}\n\nSCRIPT:\n${pack.script}\n\nCAPTION:\n${pack.caption}\n\nCTA:\n${pack.cta}`
                          )
                        }
                        className="cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                      >
                        Copy Pack
                      </button>
                    </div>

                    <PackField title="ANGLE" value={pack.angle} />
                    <PackField title="TITLE" value={pack.title} />
                    <PackField title="SCRIPT" value={pack.script} large />
                    <PackField title="CAPTION" value={pack.caption} large />
                    <PackField title="CTA" value={pack.cta} />
                  </div>
                ))}
              </div>
            )}

          {response?.type !== "hook_analyzer" &&
            response?.type !== "content_pack" &&
            response?.generic && (
              <div className="space-y-4">
                {response.generic.results.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => copyText(item)}
                    className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-[#0D1220] p-5 text-left transition hover:bg-white/10"
                  >
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">
                      Option {i + 1}
                    </p>
                    <p className="whitespace-pre-wrap text-white/90">
                      {normalizeText(item)}
                    </p>
                  </button>
                ))}

                {response.generic.recommendation && (
                  <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">
                      Recommended Best Pick
                    </p>
                    <p className="whitespace-pre-wrap text-white/90">
                      {normalizeText(response.generic.recommendation)}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 pt-2 md:grid-cols-3">
                  {["More Curious", "More Viral", "More Aggressive"].map((variant) => (
                    <button
                      key={variant}
                      onClick={() => regenerateWithDirection(variant)}
                      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </section>

        <div className="pb-6 text-center text-xs tracking-[0.2em] text-white/25">
          VIRALINK AI • BUILT FOR SERIOUS CREATORS
        </div>
      </main>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0D1220] p-8 text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-300/70">
              Upgrade Required
            </p>
            <h2 className="mt-3 text-3xl font-black">
              You’ve used your free credits
            </h2>

            <p className="mt-4 text-white/60">
              Upgrade to continue generating hooks, scripts, titles, captions,
              content packs and creator assets.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-bold">Starter</p>
                <p className="text-sm text-white/60">60 credits / month</p>
                <p className="mt-1 text-lg font-black">₹199</p>
              </div>

              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
                <p className="font-bold">Pro</p>
                <p className="text-sm text-white/60">200 credits / month</p>
                <p className="mt-1 text-lg font-black">₹399</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Link
                href="/pricing"
                className="rounded-2xl bg-white px-4 py-3 text-center font-black text-black transition hover:scale-[1.02]"
              >
                View Plans
              </Link>

              <button
                onClick={() => setShowUpgrade(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1220] p-5">
      <p className="mb-4 text-lg font-bold">{title}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/85"
          >
            {normalizeText(item)}
          </div>
        ))}
      </div>
    </div>
  );
}


function PackField({
  title,
  value,
  large = false,
}: {
  title: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/70">
        {title}
      </p>
      <p className={`whitespace-pre-wrap text-white/90 ${large ? "leading-7" : ""}`}>
        {normalizeText(value)}
      </p>
    </div>
  );
}