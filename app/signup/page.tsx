"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user) {
      const profileRow = {
        id: user.id,
        email: user.email,
        username,
        full_name: username,
        plan: "free",
        credits: 10,
        creator_score: 12,
        role: "user",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([profileRow as any]);

      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
    }

    setMessage("Account created successfully. You can now log in.");
    setUsername("");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.10),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.01))]" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* LEFT SIDE BRAND PANEL */}
        <section className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 xl:p-14">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 p-[1px] shadow-[0_0_35px_rgba(59,130,246,0.25)]">
                <div className="h-full w-full rounded-2xl bg-[#081120] flex items-center justify-center text-lg font-black">
                  V
                </div>
              </div>
              <div>
                <p className="text-xl font-black tracking-wide">VIRALINK AI</p>
                <p className="text-sm text-white/45">Creator Growth OS</p>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <span className="inline-flex items-center rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-200">
                Build Your Creator Engine
              </span>

              <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
                Create your
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                  premium creator workspace.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-white/60">
                Start with hooks, scripts, captions, titles and full content
                systems designed to help creators grow faster.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Instant</p>
                  <p className="mt-2 text-xl font-semibold">Hooks</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Full</p>
                  <p className="mt-2 text-xl font-semibold">Scripts</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">High-retention</p>
                  <p className="mt-2 text-xl font-semibold">Content Packs</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Built for</p>
                  <p className="mt-2 text-xl font-semibold">Growth</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/35">
            VIRALINK AI • Your creator operating system.
          </p>
        </section>

        {/* RIGHT SIDE FORM */}
        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-7 md:p-9 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

              <div className="relative z-10">
                <div className="mb-8">
                  <p className="text-sm text-fuchsia-300/80">Get started</p>
                  <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
                    Create your account
                  </h2>
                  <p className="mt-3 text-sm text-white/55">
                    Set up your VIRALINK AI creator workspace in minutes.
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/75">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 transition focus:border-cyan-400/40 focus:bg-[#10182a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/75">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 transition focus:border-cyan-400/40 focus:bg-[#10182a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/75">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0D1220] px-4 py-4 text-white outline-none placeholder:text-white/30 transition focus:border-cyan-400/40 focus:bg-[#10182a]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-6 py-4 text-lg font-black text-black transition hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                {message && (
                  <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                    {message}
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/60">
                    Already have an account?
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-cyan-300 transition hover:bg-white/10 hover:text-cyan-200"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>

            {/* MOBILE BRAND */}
            <div className="lg:hidden mt-8 text-center">
              <p className="text-sm text-white/35">
                VIRALINK AI • Creator Growth OS
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}