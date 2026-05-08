import { createProject } from "@/app/actions";
import { categories } from "@/lib/data/categories";
import { Card, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">New analysis</h1>
      <p className="mt-2 text-slate-600">Start with basic project metadata. Site, competitors, scoring, financials, and report are handled in the workspace.</p>
      <Card className="mt-6">
        <form action={createProject} className="grid gap-4">
          <label className={labelClass}>Project name<input name="name" required className={inputClass} placeholder="Mullur Diagnostics Feasibility" /></label>
          <label className={labelClass}>City<input name="city" className={inputClass} placeholder="Bengaluru" /></label>
          <label className={labelClass}>Objective
            <select name="objective" className={inputClass} defaultValue="OPEN_FRANCHISE">
              <option value="OPEN_FRANCHISE">Open franchise</option>
              <option value="LEASE_TO_TENANT">Lease shop to tenant</option>
              <option value="BUY_COMMERCIAL_PROPERTY">Buy commercial property</option>
              <option value="BUILD_SMALL_COMPLEX">Build small commercial complex</option>
            </select>
          </label>
          <label className={labelClass}>Category
            <select name="category" className={inputClass} defaultValue="diagnostics">
              {categories.map((category) => <option key={category.key} value={category.key}>{category.displayName}</option>)}
            </select>
          </label>
          <label className={labelClass}>Brand name, optional<input name="brandName" className={inputClass} placeholder="Dr Lal PathLabs" /></label>
          <SubmitButton type="submit">Create project</SubmitButton>
        </form>
      </Card>
    </main>
  );
}
