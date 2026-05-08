import { describe, expect, it } from "vitest";
import { defaultSalesRamp, simulateFinancials } from "./simulator";

describe("defaultSalesRamp", () => {
  it("creates a 24-month ramp that starts conservative and then grows", () => {
    const ramp = defaultSalesRamp();
    expect(ramp).toHaveLength(24);
    expect(ramp.slice(0, 6)).toEqual([80000, 100000, 125000, 150000, 175000, 200000]);
    expect(ramp[23]).toBeGreaterThan(ramp[6]);
  });
});

describe("simulateFinancials", () => {
  it("creates a 24-month P&L for base, best, and worst scenarios", () => {
    const result = simulateFinancials({ capex: 550000, monthlyRent: 45000, staffCost: 35000, utilities: 8000, marketing: 15000, grossMarginPct: 25 });
    expect(result.pnl).toHaveLength(24);
    expect(result.scenarios).toHaveLength(3);
    expect(result.monthlyFixedCost).toBe(103000);
  });

  it("subtracts capex before calculating cumulative cash flow", () => {
    const result = simulateFinancials({ capex: 100000, monthlyRent: 10000, staffCost: 10000, utilities: 5000, marketing: 5000, grossMarginPct: 50, monthlySalesBase: [100000] });
    expect(result.pnl[0]).toMatchObject({ revenue: 100000, grossProfit: 50000, fixedCost: 30000, netCashFlow: 20000, cumulativeCashFlow: -80000 });
  });

  it("orders scenario revenue from worst to best", () => {
    const result = simulateFinancials({ capex: 100000, monthlyRent: 10000, staffCost: 10000, utilities: 5000, marketing: 5000, grossMarginPct: 50, monthlySalesBase: [100000] });
    const [worst, base, best] = result.scenarios;
    expect(worst.name).toBe("worst");
    expect(base.name).toBe("base");
    expect(best.name).toBe("best");
    expect(worst.pnl[0].revenue).toBeLessThan(base.pnl[0].revenue);
    expect(best.pnl[0].revenue).toBeGreaterThan(base.pnl[0].revenue);
  });
});
