import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-slate-950 p-10 text-white shadow-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">LocaLynx MVP</p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight">Franchise & commercial real estate location intelligence.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">Analyze one map pin, category, brand, property economics, competitors, and field notes to produce a structured go/no-go report.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/projects/new" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Analyze a location</Link>
          <Link href="/projects" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">View projects</Link>
        </div>
      </section>
      <section className="grid gap-4 py-10 md:grid-cols-3">
        {[
          ["Deterministic scoring", "Transparent catchment, category-fit, competition, real-estate, financial, and cannibalisation scores."],
          ["Manual-first competitors", "Works without a paid Places key; Google Places can be enabled later behind cost controls."],
          ["Markdown reports", "Investor-oriented report output with missing data marked as needs field validation."],
        ].map(([title, body]) => <div key={title} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm text-slate-600">{body}</p></div>)}
      </section>
    </main>
  );
}
