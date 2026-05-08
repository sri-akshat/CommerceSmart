# LocaLynx MVP

Franchise & Commercial Real Estate Location Intelligence.

LocaLynx takes a location, category, optional brand, property details, competitor data, and financial assumptions, then generates deterministic scores, a 24-month financial simulator, and a professional markdown viability report.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite locally via `DATABASE_URL="file:./dev.db"`
- Optional Google Places API integration behind `GOOGLE_MAPS_API_KEY`
- Optional OpenAI report generation behind `OPENAI_API_KEY`

## Quick start

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Open <http://localhost:3000/projects> and use the seeded `Mullur Diagnostics Feasibility` project.

## MVP acceptance coverage

- Create projects at `/projects/new`
- Add/edit site data in `/projects/[id]`
- Add manual competitors without Google API dependency
- Fetch competitors from Google Places when an API key exists
- Generate deterministic scores and transparent breakdowns
- Generate 24-month financial scenarios
- Generate markdown reports with missing data marked as `needs field validation`
