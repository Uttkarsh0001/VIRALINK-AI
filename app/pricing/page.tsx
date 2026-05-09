"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const plans = [
  {
    name: "Starter",
    price: "₹249",
    subtitle: "For beginner creators",
    description:
      "Perfect if you're building consistency and want a lightweight content engine without overcommitting.",
    cta: "Claim Starter",
    features: [
      "40 monthly credits",
      "Generate hooks, titles, CTAs & captions",
      "Swipe Vault access",
      "Generation history",
      "Built for Instagram + YouTube creators",
    ],
  },
  {
    name: "Creator",
    price: "₹499",
    subtitle: "Best for serious growth",
    description:
      "Built for creators who want repeatable output, faster posting, and stronger audience-facing positioning.",
    popular: true,
    cta: "Claim Creator",
    features: [
      "120 monthly credits",
      "Generate full creator content packs",
      "Use rewrite styles like Viral, Curiosity, Authority",
      "Save, copy & export outputs",
      "Best value for consistent content creators",
      "Fastest way to turn ideas into post-ready assets",
    ],
  },
  {
    name: "Pro",
    price: "₹799",
    subtitle: "For agencies & power users",
    description:
      "For operators, client work, aggressive output, and future premium workflow expansion.",
    cta: "Claim Pro",
    features: [
      "300 monthly credits",
      "Everything in Creator plan",
      "Best for clients, brands & high-volume output",
      "Future premium tools access",
      "Priority founder updates",
      "Built for serious content operators",
    ],
  },
];

const faqs = [
  {
    q: "Do credits reset every month?",
    a: "Yes. Monthly credits refresh every billing cycle based on your active plan.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. You can start small and move up whenever you need more output or credits.",
  },
  {
    q: "Will more premium tools be included later?",
    a: "Yes. Higher plans are designed to unlock more advanced creator workflow tools over time.",
  },
  {
    q: "Do I need technical knowledge to use VIRALINK AI?",
    a: "No. The platform is designed to help creators generate better content assets quickly, without complexity.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-col sticky top-0 h-screen">
        <BrandLogo />

        <nav className="space-y-2 mt-10">
          {[
            { label: "Dashboard", href: "/dashboard", active: false },
            { label: "Generate", href: "/generate", active: false },
            { label: "Vault", href: "/vault", active: false },
            { label: "History", href: "/history", active: false },
            { label: "Pricing", href: "/pricing", active: true },
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
            <p className="text-sm font-medium">Premium unlocks more speed</p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              More credits, stronger output, and a smoother creator workflow.
            </p>
            <div className="mt-4 rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium text-center">
              Upgrade Ready
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 md:p-8 xl:p-10 relative overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-[-10%] top-[12%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[20%] h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />
        </div>

        <div className="relative z-10">
          {/* TOP BAR */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <p className="text-sm text-cyan-300/80">Upgrade your creator stack</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Pricing & Plans
              </h1>
              <p className="mt-2 text-sm text-white/55">
                Choose the plan that matches your output, posting frequency and creator goals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/generate"
                className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium hover:scale-[1.02] transition"
              >
                Start Generating
              </Link>
            </div>
          </div>

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#09111d] to-[#060b16] p-6 md:p-8 mb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_24%)]" />
            <div className="relative z-10 max-w-4xl">
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Pricing
              </span>

              <h2 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight">
                Choose the plan that turns
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                  ideas into creator output
                </span>
              </h2>

              <p className="mt-4 max-w-3xl text-sm md:text-base text-white/60 leading-relaxed">
                VIRALINK AI helps you stop overthinking and start publishing faster — with
                hooks, angles, rewrites, and creator assets designed to perform.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/65">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Activation-ready setup
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Flexible onboarding flow
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Built for creators first
                </span>
              </div>
            </div>
          </section>

          {/* PRICING CARDS */}
          <section className="mb-10">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                  Plans
                </p>
                <h2 className="mt-3 text-3xl md:text-4xl font-black">
                  Pick your creator workflow level
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white/55">
                Whether you're testing consistency or scaling serious output, each plan is
                designed to reduce friction and help you publish faster.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative flex min-h-[710px] flex-col overflow-hidden rounded-[28px] border p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${
                    plan.popular
                      ? "border-cyan-300/35 bg-gradient-to-b from-cyan-400/12 via-blue-500/10 to-fuchsia-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100 ${
                      plan.popular ? "bg-cyan-400/10" : "bg-white/5"
                    }`}
                  />

                  {plan.popular && (
                    <div className="absolute right-6 top-6 rounded-full border border-cyan-200/30 bg-cyan-300 px-3 py-1 text-[11px] font-black tracking-[0.18em] text-black shadow-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="relative z-10">
                    <p
                      className={`text-sm font-bold uppercase tracking-[0.24em] ${
                        plan.popular ? "text-cyan-300" : "text-white/70"
                      }`}
                    >
                      {plan.name}
                    </p>

                    <div className="mt-5 flex items-end gap-2">
                      <h2 className="text-5xl font-black md:text-6xl">{plan.price}</h2>
                      <span className="pb-2 text-base text-slate-400">/ month</span>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-white/90">
                      {plan.subtitle}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {plan.description}
                    </p>

                    <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-slate-200">
                          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
                          <span className="leading-7">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 mt-auto pt-10">
                    <button
                      className={`w-full rounded-2xl px-5 py-4 text-base font-black transition duration-300 hover:scale-[1.02] ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-black shadow-[0_10px_40px_rgba(34,211,238,0.25)]"
                          : "border border-white/10 bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      {plan.cta}
                    </button>

                    <p className="mt-4 text-center text-xs text-white/40">
                      Founder-assisted activation flow currently enabled.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TRUST STRIP */}
          <section className="mb-10">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <p className="text-lg font-black">Faster Creation</p>
                <p className="mt-3 leading-7 text-slate-300">
                  Reduce idea friction and turn rough thoughts into usable content assets quickly.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <p className="text-lg font-black">Cleaner Positioning</p>
                <p className="mt-3 leading-7 text-slate-300">
                  Better hooks, stronger framing, and sharper communication for audience retention.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <p className="text-lg font-black">Built to Scale</p>
                <p className="mt-3 leading-7 text-slate-300">
                  Start small, post consistently, and upgrade when your output system grows.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl font-black">
                Questions before you upgrade?
              </h2>
            </div>

            <div className="space-y-5">
              {faqs.map((item) => (
                <div
                  key={item.q}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
                >
                  <h3 className="text-lg font-black text-white">{item.q}</h3>
                  <p className="mt-3 leading-8 text-slate-300">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}