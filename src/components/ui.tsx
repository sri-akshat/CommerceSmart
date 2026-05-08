import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border bg-white p-6 shadow-sm", className)} {...props} />;
}

export function ButtonLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn("inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800", className)} {...props} />;
}

export function SubmitButton({ className, ...props }: ComponentProps<"button">) {
  return <button className={cn("rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800", className)} {...props} />;
}

export const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900";
export const labelClass = "text-sm font-medium text-slate-700";
