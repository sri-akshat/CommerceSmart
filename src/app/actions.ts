"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCategoryConfig } from "@/lib/data/categories";
import { distanceMeters } from "@/lib/places/distance";
import { inferBrandName, normalizeCompetitorType } from "@/lib/places/normalize";
import { fetchGooglePlacesCompetitors } from "@/lib/places/googlePlaces";
import { calculateProjectScore } from "@/lib/scoring";
import { simulateFinancials } from "@/lib/financials/simulator";
import { buildProjectContext } from "@/lib/reports/buildProjectContext";
import { generateReportMarkdown } from "@/lib/reports/generateReport";

const optionalNumber = z.preprocess((value) => value === "" || value === null ? undefined : Number(value), z.number().optional());

async function syncFinancialModelRent(projectId: string, monthlyRent?: number) {
  if (monthlyRent === undefined) return;

  const financialModel = await prisma.financialModel.findUnique({ where: { projectId } });
  if (!financialModel || financialModel.monthlyRent === monthlyRent) return;

  const expectedSales = Array.isArray(financialModel.expectedSalesJson)
    ? financialModel.expectedSalesJson.filter((value): value is number => typeof value === "number")
    : undefined;
  const input = {
    capex: financialModel.capex,
    monthlyRent,
    staffCost: financialModel.staffCost,
    utilities: financialModel.utilities,
    marketing: financialModel.marketing,
    grossMarginPct: financialModel.grossMarginPct,
    franchiseFee: financialModel.franchiseFee,
    monthlySalesBase: expectedSales?.length ? expectedSales : undefined,
  };
  const simulation = simulateFinancials(input);

  await prisma.financialModel.update({
    where: { projectId },
    data: {
      monthlyRent,
      expectedSalesJson: simulation.expectedSales,
      pnlJson: simulation.pnl,
      breakEvenMonth: simulation.breakEvenMonth,
      paybackMonth: simulation.paybackMonth,
      scenarioJson: simulation.scenarios,
    },
  });
}

export async function createProject(formData: FormData) {
  const data = z.object({
    name: z.string().min(2),
    city: z.string().optional(),
    objective: z.string().min(1),
    category: z.string().min(1),
    brandName: z.string().optional(),
  }).parse(Object.fromEntries(formData));
  const project = await prisma.project.create({ data });
  redirect(`/projects/${project.id}`);
}

export async function upsertSite(projectId: string, formData: FormData) {
  const data = z.object({
    address: z.string().min(2),
    latitude: z.preprocess(Number, z.number()),
    longitude: z.preprocess(Number, z.number()),
    propertyType: z.string().optional(),
    ownershipMode: z.string().optional(),
    shopSizeSqft: optionalNumber,
    monthlyRent: optionalNumber,
    depositMonths: optionalNumber,
    floor: z.string().optional(),
    frontageFeet: optionalNumber,
    parking: z.string().optional(),
    toilet: z.string().optional(),
    visibility: z.string().optional(),
    notes: z.string().optional(),
  }).parse(Object.fromEntries(formData));
  await prisma.site.upsert({ where: { projectId }, create: { ...data, projectId }, update: data });
  await syncFinancialModelRent(projectId, data.monthlyRent);
  await prisma.project.update({ where: { id: projectId }, data: { status: "SITE_ADDED" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function addManualCompetitor(projectId: string, formData: FormData) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true } });
  const parsed = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    latitude: optionalNumber,
    longitude: optionalNumber,
    distanceMeters: optionalNumber,
    rating: optionalNumber,
    reviewCount: optionalNumber,
    competitorType: z.string().optional(),
  }).parse(Object.fromEntries(formData));
  const config = getCategoryConfig(project.category);
  const computedDistance = project.site && parsed.latitude && parsed.longitude
    ? distanceMeters({ latitude: project.site.latitude, longitude: project.site.longitude }, { latitude: parsed.latitude, longitude: parsed.longitude })
    : parsed.distanceMeters;
  const brandName = inferBrandName(parsed.name, config);
  const competitorType = normalizeCompetitorType({ ...parsed, brandName, distanceMeters: computedDistance }, project.brandName, config);
  await prisma.competitor.create({
    data: { ...parsed, distanceMeters: computedDistance, brandName, competitorType, source: "MANUAL", projectId },
  });
  await prisma.project.update({ where: { id: projectId }, data: { status: "COMPETITORS_FETCHED" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function fetchCompetitors(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true } });
  if (!project.site) throw new Error("Add site details before fetching competitors.");
  const result = await fetchGooglePlacesCompetitors({ category: project.category, address: project.site.address, latitude: project.site.latitude, longitude: project.site.longitude });
  if (!result.skipped) {
    const config = getCategoryConfig(project.category);
    for (const place of result.places) {
      const competitorId = `${projectId}:${place.externalPlaceId ?? place.name}`;
      const competitorDistance = place.latitude && place.longitude ? distanceMeters(project.site, { latitude: place.latitude, longitude: place.longitude }) : null;
      const brandName = inferBrandName(place.name, config);
      await prisma.competitor.upsert({
        where: { id: competitorId },
        create: {
          id: competitorId,
          projectId,
          source: "GOOGLE_PLACES",
          externalPlaceId: place.externalPlaceId,
          name: place.name,
          brandName,
          competitorType: normalizeCompetitorType({ name: place.name, brandName, distanceMeters: competitorDistance }, project.brandName, config),
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          distanceMeters: competitorDistance,
          rating: place.rating,
          reviewCount: place.reviewCount,
          businessStatus: place.businessStatus,
          rawJson: place.rawJson as object,
        },
        update: {},
      }).catch(async () => {
        await prisma.competitor.create({ data: { projectId, source: "GOOGLE_PLACES", externalPlaceId: place.externalPlaceId, name: place.name, address: place.address, latitude: place.latitude, longitude: place.longitude, distanceMeters: competitorDistance, rating: place.rating, reviewCount: place.reviewCount, brandName } });
      });
    }
  }
  await prisma.project.update({ where: { id: projectId }, data: { status: "COMPETITORS_FETCHED" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateScore(projectId: string) {
  const initialProject = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true } });
  await syncFinancialModelRent(projectId, initialProject.site?.monthlyRent ?? undefined);
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true, competitors: true, financialModel: true } });
  const score = calculateProjectScore({
    category: project.category,
    brandName: project.brandName,
    site: project.site,
    competitors: project.competitors,
    financials: project.financialModel ?? undefined,
  });
  await prisma.score.upsert({ where: { projectId }, create: { ...score, projectId }, update: score });
  await prisma.project.update({ where: { id: projectId }, data: { status: "SCORED" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateFinancialModel(projectId: string, formData: FormData) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true } });
  const config = getCategoryConfig(project.category);
  const parsed = z.object({
    capex: optionalNumber,
    monthlyRent: optionalNumber,
    staffCost: optionalNumber,
    utilities: optionalNumber,
    marketing: optionalNumber,
    grossMarginPct: optionalNumber,
    franchiseFee: optionalNumber,
  }).parse(Object.fromEntries(formData));
  const input = {
    capex: parsed.capex ?? Math.round((config.baseFinancials.capexMin + config.baseFinancials.capexMax) / 2),
    monthlyRent: parsed.monthlyRent ?? project.site?.monthlyRent ?? 0,
    staffCost: parsed.staffCost ?? config.baseFinancials.monthlyStaffCost,
    utilities: parsed.utilities ?? config.baseFinancials.monthlyUtilities,
    marketing: parsed.marketing ?? config.baseFinancials.monthlyMarketing,
    grossMarginPct: parsed.grossMarginPct ?? config.baseFinancials.grossMarginPct,
    franchiseFee: parsed.franchiseFee,
  };
  const simulation = simulateFinancials(input);
  await prisma.financialModel.upsert({
    where: { projectId },
    create: { ...input, projectId, expectedSalesJson: simulation.expectedSales, pnlJson: simulation.pnl, breakEvenMonth: simulation.breakEvenMonth, paybackMonth: simulation.paybackMonth, scenarioJson: simulation.scenarios },
    update: { ...input, expectedSalesJson: simulation.expectedSales, pnlJson: simulation.pnl, breakEvenMonth: simulation.breakEvenMonth, paybackMonth: simulation.paybackMonth, scenarioJson: simulation.scenarios },
  });
  await prisma.project.update({ where: { id: projectId }, data: { status: "FINANCIALS_GENERATED" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateReport(projectId: string) {
  const initialProject = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true } });
  await syncFinancialModelRent(projectId, initialProject.site?.monthlyRent ?? undefined);
  const projectForScore = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true, competitors: true, financialModel: true } });
  const score = calculateProjectScore({
    category: projectForScore.category,
    brandName: projectForScore.brandName,
    site: projectForScore.site,
    competitors: projectForScore.competitors,
    financials: projectForScore.financialModel ?? undefined,
  });
  await prisma.score.upsert({ where: { projectId }, create: { ...score, projectId }, update: score });
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { site: true, competitors: true, score: true, financialModel: true } });
  const context = buildProjectContext(project);
  const markdown = await generateReportMarkdown(context);
  await prisma.report.create({ data: { projectId, reportType: "FRANCHISE_VIABILITY", title: `${project.name} Viability Report`, markdown, structuredJson: context } });
  await prisma.project.update({ where: { id: projectId }, data: { status: "REPORT_GENERATED" } });
  revalidatePath(`/projects/${projectId}`);
}
