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
  avatar_url?: string;
  plan?: string;
  credits?: number;
  creator_score?: number;
  role?: string;
  created_at?: string;
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

function formatDate(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
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

      const mergedProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        username:
          profileData?.username ||
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "Creator",
        full_name: profileData?.full_name || "",
        avatar_url: profileData?.avatar_url || "",
        plan: profileData?.plan || "free",
        credits: profileData?.credits ?? 0,
        creator_score: profileData?.creator_score ?? 12,
        role: profileData?.role || "user",
        created_at: profileData?.created_at || user.created_at,
      };

      setProfile(mergedProfile);
      setUsername(mergedProfile.username || "");
      setFullName(mergedProfile.full_name || "");
      setAvatarUrl(mergedProfile.avatar_url || "");
      setLoading(false);
    };

    loadProfile();
  }, [supabase]);

  async function handleAvatarUpload(file: File) {
    if (!profile) return;

    try {
      setUploading(true);
      setMessage("");

      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setAvatarUrl(publicUrl);

      const { error: dbError } = await supabase.from("profiles").upsert({
        id: profile.id,
        email: profile.email,
        username,
        full_name: fullName,
        avatar_url: publicUrl,
        plan: profile.plan || "free",
        credits: profile.credits ?? 0,
        creator_score: profile.creator_score ?? 12,
        role: profile.role || "user",
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        setMessage(dbError.message);
        setUploading(false);
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              avatar_url: publicUrl,
            }
          : prev
      );

      setMessage("Avatar uploaded successfully.");
    } catch (err) {
      setMessage("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      username,
      full_name: fullName,
      avatar_url: avatarUrl,
      plan: profile.plan || "free",
      credits: profile.credits ?? 0,
      creator_score: profile.creator_score ?? 12,
      role: profile.role || "user",
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            username,
            full_name: fullName,
            avatar_url: avatarUrl,
          }
        : prev
    );

    setMessage("Profile updated successfully.");
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const displayName =
    profile?.full_name ||
    profile?.username ||
    profile?.email?.split("@")[0] ||
    "Creator";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex">
        <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col">
          <div className="h-10 w-40 rounded-xl bg-white/10 animate-pulse mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-8 xl:p-10">
          <div className="space-y-6">
            <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 h-[520px] rounded-3xl bg-white/5 animate-pulse" />
              <div className="h-[520px] rounded-3xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col sticky top-0 h-screen">
        <BrandLogo />

        <nav className="space-y-2 mt-8">
          {[
            { label: "Dashboard", href: "/dashboard", active: false },
            { label: "Generate", href: "/generate", active: false },
            { label: "Vault", href: "/vault", active: false },
            { label: "History", href: "/history", active: false },
            { label: "Pricing", href: "/pricing", active: false },
            { label: "Profile", href: "/profile", active: true },
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
            <p className="text-sm font-medium">Your creator account</p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Manage your profile, plan details and creator identity here.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium hover:scale-[1.02] transition"
            >
              View Plans
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 xl:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm text-cyan-300/80">Your account</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Profile Settings
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Update your creator identity and account information.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/85 hover:bg-white/10 transition"
          >
            Log Out
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#09111d] to-[#060b16] p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_24%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 p-[1px] shadow-[0_0_30px_rgba(59,130,246,0.25)]">
                <div className="h-full w-full rounded-3xl bg-[#081120] flex items-center justify-center overflow-hidden text-2xl font-semibold">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile Avatar"
                      className="h-full w-full object-cover rounded-3xl"
                    />
                  ) : (
                    getInitials(profile?.username || profile?.full_name, profile?.email)
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-cyan-300/80">Creator Identity</p>
                <h2 className="mt-1 text-2xl md:text-3xl font-semibold">{displayName}</h2>
                <p className="mt-2 text-sm text-white/60">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs text-white/45">Plan</p>
                <p className="mt-2 text-lg font-semibold capitalize">{profile?.plan}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs text-white/45">Credits</p>
                <p className="mt-2 text-lg font-semibold">{profile?.credits}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center col-span-2 md:col-span-1">
                <p className="text-xs text-white/45">Score</p>
                <p className="mt-2 text-lg font-semibold">{profile?.creator_score}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold">Edit Profile</h3>
              <p className="mt-2 text-sm text-white/55">
                Keep your creator account updated without changing your internal app logic.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  Upload Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:opacity-90"
                />
                <p className="mt-2 text-xs text-white/40">
                  Uploading here will automatically save your avatar.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/75">
                  Avatar URL (optional)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-6 py-4 text-base font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading Avatar..." : saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                {message}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Account Info</h3>
              <p className="text-sm text-white/50 mt-1">
                Snapshot of your creator account.
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Email</p>
                  <p className="mt-2 text-sm font-medium break-all">{profile?.email}</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Role</p>
                  <p className="mt-2 text-sm font-medium capitalize">{profile?.role}</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Joined</p>
                  <p className="mt-2 text-sm font-medium">{formatDate(profile?.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold">Creator System</h3>
              <p className="text-sm text-white/50 mt-1">
                Your current creator setup status.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 flex items-center justify-between">
                  <span className="text-sm text-white/70">Plan</span>
                  <span className="text-sm font-semibold capitalize">{profile?.plan}</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 flex items-center justify-between">
                  <span className="text-sm text-white/70">Credits</span>
                  <span className="text-sm font-semibold">{profile?.credits}</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 flex items-center justify-between">
                  <span className="text-sm text-white/70">Creator Score</span>
                  <span className="text-sm font-semibold">{profile?.creator_score}</span>
                </div>
              </div>

              <Link
                href="/pricing"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 transition"
              >
                Upgrade Later
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}