import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { addManualCompetitor, fetchCompetitors, generateFinancialModel, generateReport, generateScore, upsertSite } from "@/app/actions";
import { Card, SubmitButton, inputClass, labelClass } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { getCategoryConfig } from "@/lib/data/categories";
import { formatInr } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProjectWorkspace({ params }: PageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { site: true, competitors: { orderBy: { distanceMeters: "asc" } }, score: true, financialModel: true, reports: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!project) notFound();
  const category = getCategoryConfig(project.category);
  const latestReport = project.reports[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{project.status}</p>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-600">{project.city ?? "needs field validation"} · {category.displayName} · {project.brandName ?? "No brand selected"}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-6 py-4 text-white">
          <p className="text-xs uppercase text-slate-300">Final score</p>
          <p className="text-3xl font-bold">{project.score?.finalScore ?? "—"}</p>
          <p className="text-sm text-cyan-200">{project.score?.verdict ?? "Not scored"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">Site Details</h2>
          <form action={upsertSite.bind(null, project.id)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={`${labelClass} md:col-span-2`}>Address<input name="address" defaultValue={project.site?.address} required className={inputClass} /></label>
            <label className={labelClass}>Latitude<input name="latitude" type="number" step="any" defaultValue={project.site?.latitude ?? 12.899} required className={inputClass} /></label>
            <label className={labelClass}>Longitude<input name="longitude" type="number" step="any" defaultValue={project.site?.longitude ?? 77.75} required className={inputClass} /></label>
            <label className={labelClass}>Property type<input name="propertyType" defaultValue={project.site?.propertyType ?? "shop"} className={inputClass} /></label>
            <label className={labelClass}>Ownership mode<input name="ownershipMode" defaultValue={project.site?.ownershipMode ?? "rent"} className={inputClass} /></label>
            <label className={labelClass}>Shop size sq ft<input name="shopSizeSqft" type="number" defaultValue={project.site?.shopSizeSqft ?? ""} className={inputClass} /></label>
            <label className={labelClass}>Monthly rent<input name="monthlyRent" type="number" defaultValue={project.site?.monthlyRent ?? ""} className={inputClass} /></label>
            <label className={labelClass}>Deposit months<input name="depositMonths" type="number" defaultValue={project.site?.depositMonths ?? ""} className={inputClass} /></label>
            <label className={labelClass}>Frontage feet<input name="frontageFeet" type="number" step="any" defaultValue={project.site?.frontageFeet ?? ""} className={inputClass} /></label>
            <label className={labelClass}>Floor<select name="floor" defaultValue={project.site?.floor ?? "ground"} className={inputClass}><option value="ground">Ground</option><option value="first">First</option><option value="upper">Upper</option></select></label>
            <label className={labelClass}>Parking<select name="parking" defaultValue={project.site?.parking ?? "limited"} className={inputClass}><option value="none">None</option><option value="limited">Limited</option><option value="good">Good</option></select></label>
            <label className={labelClass}>Toilet<select name="toilet" defaultValue={project.site?.toilet ?? "common"} className={inputClass}><option value="no">No</option><option value="common">Common</option><option value="yes">Yes</option></select></label>
            <label className={labelClass}>Visibility<select name="visibility" defaultValue={project.site?.visibility ?? "medium"} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label className={`${labelClass} md:col-span-2`}>Notes<textarea name="notes" defaultValue={project.site?.notes ?? ""} className={inputClass} rows={3} /></label>
            <SubmitButton type="submit" className="md:col-span-2">Save site details</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Financials</h2>
          <form action={generateFinancialModel.bind(null, project.id)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={labelClass}>Capex<input name="capex" type="number" defaultValue={project.financialModel?.capex ?? Math.round((category.baseFinancials.capexMin + category.baseFinancials.capexMax) / 2)} className={inputClass} /></label>
            <label className={labelClass}>Monthly rent<input name="monthlyRent" type="number" defaultValue={project.financialModel?.monthlyRent ?? project.site?.monthlyRent ?? ""} className={inputClass} /></label>
            <label className={labelClass}>Staff cost<input name="staffCost" type="number" defaultValue={project.financialModel?.staffCost ?? category.baseFinancials.monthlyStaffCost} className={inputClass} /></label>
            <label className={labelClass}>Utilities<input name="utilities" type="number" defaultValue={project.financialModel?.utilities ?? category.baseFinancials.monthlyUtilities} className={inputClass} /></label>
            <label className={labelClass}>Marketing<input name="marketing" type="number" defaultValue={project.financialModel?.marketing ?? category.baseFinancials.monthlyMarketing} className={inputClass} /></label>
            <label className={labelClass}>Gross margin %<input name="grossMarginPct" type="number" defaultValue={project.financialModel?.grossMarginPct ?? category.baseFinancials.grossMarginPct} className={inputClass} /></label>
            <label className={labelClass}>Franchise fee<input name="franchiseFee" type="number" defaultValue={project.financialModel?.franchiseFee ?? ""} className={inputClass} /></label>
            <SubmitButton type="submit">Generate financial model</SubmitButton>
          </form>
          {project.financialModel && <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label="Fixed cost" value={formatInr(project.financialModel.monthlyRent + project.financialModel.staffCost + project.financialModel.utilities + project.financialModel.marketing)} /><Metric label="Break-even" value={String(project.financialModel.breakEvenMonth ?? "needs field validation")} /><Metric label="Payback" value={String(project.financialModel.paybackMonth ?? "needs field validation")} /><Metric label="Gross margin" value={`${project.financialModel.grossMarginPct}%`} /></div>}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Competitors</h2><p className="text-sm text-slate-600">Manual entry works without Google API key. Fetch uses cost-controlled Text Search when configured.</p></div>
          <form action={fetchCompetitors.bind(null, project.id)}><SubmitButton type="submit">Fetch from Places</SubmitButton></form>
        </div>
        <form action={addManualCompetitor.bind(null, project.id)} className="mt-4 grid gap-3 md:grid-cols-8">
          <input name="name" required placeholder="Competitor name" className={`${inputClass} md:col-span-2`} />
          <input name="distanceMeters" type="number" placeholder="Distance m" className={inputClass} />
          <input name="rating" type="number" step="0.1" placeholder="Rating" className={inputClass} />
          <input name="reviewCount" type="number" placeholder="Reviews" className={inputClass} />
          <select name="competitorType" className={inputClass}><option value="DIRECT_COMPETITOR">Direct</option><option value="SAME_BRAND">Same brand</option><option value="INDIRECT_COMPETITOR">Indirect</option><option value="IRRELEVANT">Irrelevant</option></select>
          <input name="address" placeholder="Address" className={`${inputClass} md:col-span-2`} />
          <SubmitButton type="submit" className="md:col-span-8">Add manual competitor</SubmitButton>
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Name</th><th>Distance</th><th>Rating</th><th>Reviews</th><th>Type</th><th>Source</th></tr></thead><tbody>{project.competitors.map((competitor) => <tr key={competitor.id} className="border-b"><td className="py-2 font-medium">{competitor.name}</td><td>{competitor.distanceMeters ?? "—"}m</td><td>{competitor.rating ?? "—"}</td><td>{competitor.reviewCount ?? "—"}</td><td>{competitor.competitorType ?? "—"}</td><td>{competitor.source}</td></tr>)}</tbody></table>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Scores</h2><form action={generateScore.bind(null, project.id)}><SubmitButton type="submit">Generate scores</SubmitButton></form></div>
          {project.score ? <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Location" value={`${project.score.locationOpportunityScore}/100`} />
            <Metric label="Category fit" value={`${project.score.categoryFitScore}/100`} />
            <Metric label="Competition opportunity" value={`${project.score.competitionOpportunityScore}/100`} />
            <Metric label="Cannibalisation risk" value={`${project.score.cannibalisationRiskScore}/100`} />
            <Metric label="Real estate" value={`${project.score.realEstateLeaseabilityScore}/100`} />
            <Metric label="Financial" value={`${project.score.financialViabilityScore}/100`} />
            <Metric label="Confidence" value={`${project.score.confidenceScore}/100`} />
            <Metric label="Verdict" value={project.score.verdict} />
          </div> : <p className="mt-4 text-sm text-slate-600">Scores pending.</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Report</h2><form action={generateReport.bind(null, project.id)}><SubmitButton type="submit">Generate report</SubmitButton></form></div>
          {latestReport ? <>
            <div className="prose prose-sm mt-4 max-h-[520px] overflow-auto rounded-xl bg-slate-50 p-4"><ReactMarkdown>{latestReport.markdown}</ReactMarkdown></div>
            <a download={`${project.name}.md`} href={`data:text/markdown;charset=utf-8,${encodeURIComponent(latestReport.markdown)}`} className="mt-3 inline-flex text-sm font-semibold text-cyan-700">Download markdown</a>
          </> : <p className="mt-4 text-sm text-slate-600">Generate a deterministic markdown report, or OpenAI-enhanced report when API key exists.</p>}
        </Card>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>;
}
