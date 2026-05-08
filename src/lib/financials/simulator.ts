export type FinancialInputs = {
  capex: number;
  monthlyRent: number;
  staffCost: number;
  utilities: number;
  marketing: number;
  grossMarginPct: number;
  franchiseFee?: number | null;
  monthlySalesBase?: number[];
};

export type MonthlyPnl = {
  month: number;
  revenue: number;
  grossProfit: number;
  fixedCost: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
};

export type Scenario = {
  name: "worst" | "base" | "best";
  revenueMultiplier: number;
  pnl: MonthlyPnl[];
  breakEvenMonth: number | null;
  paybackMonth: number | null;
};

export function defaultSalesRamp(months = 24) {
  const firstSix = [80000, 100000, 125000, 150000, 175000, 200000];
  return Array.from({ length: months }, (_, index) => firstSix[index] ?? 220000 + Math.min(index - 6, 12) * 5000);
}

export function simulateFinancials(input: FinancialInputs) {
  const baseSales = input.monthlySalesBase?.length ? input.monthlySalesBase : defaultSalesRamp();
  const scenarios: Scenario[] = [
    buildScenario("worst", 0.75, input, baseSales),
    buildScenario("base", 1, input, baseSales),
    buildScenario("best", 1.25, input, baseSales),
  ];
  const base = scenarios[1];
  return {
    inputs: input,
    monthlyFixedCost: input.monthlyRent + input.staffCost + input.utilities + input.marketing,
    expectedSales: baseSales,
    pnl: base.pnl,
    breakEvenMonth: base.breakEvenMonth,
    paybackMonth: base.paybackMonth,
    scenarios,
  };
}

function buildScenario(name: Scenario["name"], revenueMultiplier: number, input: FinancialInputs, baseSales: number[]): Scenario {
  const initialOutflow = input.capex + (input.franchiseFee ?? 0);
  let cumulative = -initialOutflow;
  const fixedCost = input.monthlyRent + input.staffCost + input.utilities + input.marketing;
  const pnl = Array.from({ length: 24 }, (_, index) => {
    const revenue = Math.round((baseSales[index] ?? baseSales.at(-1) ?? 0) * revenueMultiplier);
    const grossProfit = Math.round(revenue * (input.grossMarginPct / 100));
    const netCashFlow = grossProfit - fixedCost;
    cumulative += netCashFlow;
    return { month: index + 1, revenue, grossProfit, fixedCost, netCashFlow, cumulativeCashFlow: cumulative };
  });
  return {
    name,
    revenueMultiplier,
    pnl,
    breakEvenMonth: pnl.find((row) => row.netCashFlow >= 0)?.month ?? null,
    paybackMonth: pnl.find((row) => row.cumulativeCashFlow >= 0)?.month ?? null,
  };
}
