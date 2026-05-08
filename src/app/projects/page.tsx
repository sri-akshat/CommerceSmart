import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink, Card } from "@/components/ui";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, include: { site: true, score: true } });
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-slate-600">Create and compare LocaLynx site cards.</p>
        </div>
        <ButtonLink href="/projects/new">New analysis</ButtonLink>
      </div>
      <div className="grid gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="transition hover:border-slate-400">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{project.name}</h2>
                  <p className="text-sm text-slate-600">{project.city ?? "needs field validation"} · {project.category} · {project.brandName ?? "No brand"}</p>
                  <p className="mt-2 text-sm text-slate-500">{project.site?.address ?? "Site details pending"}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{project.status}</span>
                  <p className="mt-2 text-2xl font-bold">{project.score?.finalScore ?? "—"}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {!projects.length && <Card><p>No projects yet. Seed data or create your first analysis.</p></Card>}
      </div>
    </main>
  );
}
