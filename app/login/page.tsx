"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 500);
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
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Premium Creator Workspace
              </span>

              <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
                Build viral content
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                  with creator precision.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-white/60">
                Generate hooks, scripts, titles, captions and complete content
                packs built for reach, retention and growth.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Built for</p>
                  <p className="mt-2 text-xl font-semibold">Creators</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Optimized for</p>
                  <p className="mt-2 text-xl font-semibold">Retention</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">Output</p>
                  <p className="mt-2 text-xl font-semibold">Fast + Premium</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/50">System</p>
                  <p className="mt-2 text-xl font-semibold">AI-Powered</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/35">
            VIRALINK AI • Build content that earns attention.
          </p>
        </section>

        {/* RIGHT SIDE FORM */}
        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-7 md:p-9 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

              <div className="relative z-10">
                <div className="mb-8">
                  <p className="text-sm text-cyan-300/80">Welcome back</p>
                  <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
                    Log in to your workspace
                  </h2>
                  <p className="mt-3 text-sm text-white/55">
                    Access your VIRALINK AI dashboard and creator tools.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
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
                      placeholder="Enter your password"
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
                    {loading ? "Logging in..." : "Log In"}
                  </button>
                </form>

                {message && (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {message}
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/60">
                    Don’t have an account?
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-cyan-300 transition hover:bg-white/10 hover:text-cyan-200"
                  >
                    Create Account
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