export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center px-6 py-16 text-white md:px-10 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Support creators with one-time tips and recurring memberships
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
              Make it easy for fans to buy you a chai.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              GetMeAChai is a simple crowdfunding landing page for creators. Share your page,
              collect support, and keep building with your community.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#support"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Start your page
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <div className="text-2xl font-bold">Fast</div>
              <p className="mt-2 text-sm text-white/65">Set up a creator page in minutes.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <div className="text-2xl font-bold">Direct</div>
              <p className="mt-2 text-sm text-white/65">Support goes straight to you.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <div className="text-2xl font-bold">Flexible</div>
              <p className="mt-2 text-sm text-white/65">Tips, memberships, and shout-outs.</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="rounded-2xl bg-slate-950/70 p-5 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Live preview</p>
            <div className="mt-4 space-y-3">
              <h2 className="text-2xl font-bold">Creator profile</h2>
              <p className="text-sm leading-6 text-white/70">
                Tell supporters what you make, why it matters, and how their chai helps the next
                release.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-white/60">Monthly support</p>
                <p className="text-xl font-semibold">124 supporters</p>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                Growing
              </div>
            </div>
          </div>

          <div id="how-it-works" className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Step 1</p>
              <p className="mt-2 font-semibold">Create your creator page</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Step 2</p>
              <p className="mt-2 font-semibold">Share it with your audience</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Step 3</p>
              <p className="mt-2 font-semibold">Receive support instantly</p>
            </div>
            <div id="support" className="rounded-2xl border border-white/10 bg-amber-300 p-4 text-slate-950">
              <p className="text-sm font-medium">Best part</p>
              <p className="mt-2 font-semibold">Your fans can support you with one click.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}