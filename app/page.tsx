import Link from "next/link";

const features = [
  {
    title: "Hooks that stop the scroll",
    desc: "Generate creator-grade hooks built for retention, curiosity and watch-time — not generic AI filler.",
  },
  {
    title: "Titles, CTAs & captions too",
    desc: "Turn one content idea into a complete posting asset pack for Instagram, YouTube and short-form content.",
  },
  {
    title: "Built for creators, not coders",
    desc: "Made for coaches, personal brands, agencies and creators who need speed, clarity and consistency.",
  },
];

const useCases = [
  "Instagram Reels hooks",
  "YouTube titles",
  "CTA lines that convert",
  "Captions that sound human",
  "Content idea expansion",
  "Creator content packs",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_30%)]" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-3xl font-black tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
              VIRALINK AI
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/generate" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Generate
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Pricing
            </Link>
            <Link
              href="/generate"
              className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.03]"
            >
              Start Generating
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-16 md:pb-24 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Creator Messaging Operating System
            </p>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] md:text-7xl">
              Write content that feels{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                instantly more clickable
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              VIRALINK AI helps creators generate stronger hooks, titles, CTAs and captions
              that are designed to hold attention and improve content performance.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/generate"
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-7 py-4 text-base font-black text-black transition hover:scale-[1.02]"
              >
                Launch App
              </Link>
              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-bold text-white transition hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                "Hooks, Titles, CTAs & Captions",
                "Creator-style rewrite presets",
                "Credit persistence + history",
                "Made for IG, YouTube & personal brands",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE PREVIEW */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Sample Outputs
                </p>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  Creator-grade
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Nobody talks about why most creators stay stuck under 10k followers...",
                  "If your content looks good but still doesn’t grow, this is probably why.",
                  "The real reason your reels aren’t converting viewers into followers:",
                  "You don’t need better editing. You need better positioning.",
                  "This one change can make your content feel instantly more bingeable.",
                ].map((hook, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-[#0d1728] p-4 text-base font-semibold text-white"
                  >
                    {hook}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["HOOKS", "TITLES", "CTAS", "CAPTIONS", "POST PACK"].map((tag) => (
                  <div
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-wide text-slate-200"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-10">
          <p className="mb-3 inline-block rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300">
            Why it sells
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            More than a random AI generator
          </h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            This is positioned like a creator growth tool — not just a “write text” toy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((card) => (
            <div
              key={card.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-black">{card.title}</h3>
              <p className="mt-4 leading-8 text-slate-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 inline-block rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Use Cases
              </p>
              <h2 className="text-4xl font-black md:text-5xl">
                Built for content that needs to perform
              </h2>
            </div>
            <Link
              href="/generate"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
            >
              Try It Now
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {useCases.map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/10 bg-[#0d1728] px-5 py-3 text-sm font-semibold text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 p-10 text-center shadow-[0_0_80px_rgba(34,211,238,0.08)]">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">
            Ready to use it?
          </p>
          <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Turn rough ideas into content people actually want to click
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Start with hooks. Scale into a full creator writing workflow.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/generate"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-8 py-4 text-base font-black text-black transition hover:scale-[1.02]"
            >
              Start Generating
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
            >
              See Plans
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-white/30">
            VIRALINK AI — built for creators, consultants, agencies & personal brands
          </p>
        </div>
      </section>
    </main>
  );
}