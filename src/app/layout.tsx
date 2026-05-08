import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocaLynx MVP",
  description: "Franchise and commercial real estate location intelligence",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-slate-950">LocaLynx</Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/projects">Projects</Link>
              <Link href="/projects/new">New analysis</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
