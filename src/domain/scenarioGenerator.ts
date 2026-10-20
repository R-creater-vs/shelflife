import type { SKU, Batch, DailyDemand, PurchaseOrder, ScenarioConfig } from './types.ts';

export const CATALOG_SKUS: SKU[] = [
  {
    id: 'sku-sourdough',
    name: 'Artisan Sourdough Loaf',
    category: 'Fresh Bakery',
    unitCostPaise: 4000,          // ₹40.00
    sellingPricePaise: 9000,       // ₹90.00
    holdingCostPaisePerDay: 150,  // ₹1.50/day
    disposalCostPaise: 500,       // ₹5.00
    lostUnitPenaltyPaise: 2000,   // ₹20.00
    defaultShelfLifeDays: 3,
    defaultDailyDemand: 15
  },
  {
    id: 'sku-yogurt',
    name: 'Organic Greek Yogurt Cup',
    category: 'Dairy Counter',
    unitCostPaise: 2500,          // ₹25.00
    sellingPricePaise: 5500,       // ₹55.00
    holdingCostPaisePerDay: 80,   // ₹0.80/day
    disposalCostPaise: 300,       // ₹3.00
    lostUnitPenaltyPaise: 1200,   // ₹12.00
    defaultShelfLifeDays: 7,
    defaultDailyDemand: 25
  },
  {
    id: 'sku-salad',
    name: 'Crisp Garden Mezze Bowl',
    category: 'Fresh Produce',
    unitCostPaise: 5000,          // ₹50.00
    sellingPricePaise: 11000,      // ₹110.00
    holdingCostPaisePerDay: 200,  // ₹2.00/day
    disposalCostPaise: 600,       // ₹6.00
    lostUnitPenaltyPaise: 2500,   // ₹25.00
    defaultShelfLifeDays: 4,
    defaultDailyDemand: 20
  }
];

// Deterministic PRNG
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hand-Checkable Distinguishing Fixture from Section 5 of Specification:
 *
 * At Day 0:
 * - Batch A: 5 units, received day -2, expiryDayExclusive = 4
 * - Batch B: 5 units, received day -1, expiryDayExclusive = 1
 * No deliveries.
 * Demand: Day 0 = 5, Day 1 = 5.
 *
 * Under FIFO:
 * - Day 0: sells A (rec -2). Remaining: B (5 units).
 * - Day 1: morning purge expires B (exp 1 <= 1). 5 waste. Demand 5 is lost!
 * - FIFO Result: 5 sold, 5 waste, 5 lost.
 *
 * Under FEFO:
 * - Day 0: sells B (exp 1). Remaining: A (5 units).
 * - Day 1: A is valid (exp 4 > 1). Demand 5 is fulfilled from A.
 * - FEFO Result: 10 sold, 0 waste, 0 lost.
 */
export function getHandCheckableFixture(): ScenarioConfig {
  const sku = CATALOG_SKUS[0]; // Sourdough

  const openingBatches: Batch[] = [
    {
      id: 'batch-A-old-long',
      skuId: sku.id,
      receivedDay: -2,
      expiryDayExclusive: 4,
      initialUnits: 5,
      remainingUnits: 5
    },
    {
      id: 'batch-B-new-short',
      skuId: sku.id,
      receivedDay: -1,
      expiryDayExclusive: 1,
      initialUnits: 5,
      remainingUnits: 5
    }
  ];

  const dailyDemands: DailyDemand[] = [
    { day: 0, skuId: sku.id, requestedUnits: 5 },
    { day: 1, skuId: sku.id, requestedUnits: 5 }
  ];

  return {
    seed: 42,
    horizonDays: 2,
    sku,
    openingBatches,
    dailyDemands,
    scheduledDeliveries: [],
    fixedOrderQuantity: 0,
    baseStockTarget: 0,
    packSizeMultiple: 5,
    leadTimeDays: 1,
    shelfLifeOnArrivalDays: 3,
    safetyUnits: 0
  };
}

/**
 * Feasibility Check Interaction Probe Scenario (Section 6 & feasibility-checks.mjs):
 * Recreates the exact W00/W10/W01/W11 interaction of -5 units:
 * - Batches: A (rec -2, exp 4, 5 units), B (rec -1, exp 1, 5 units)
 * - Fixed delivery: 5 units arriving on Day 1 (exp 3)
 * - Demands: Day 0 = 5, Day 1 = 5, Days 2, 3, 4 = 0
 * - W00 (FIFO + Fixed): sold 10, waste 5, lost 0
 * - W10 (FEFO + Fixed): sold 10, waste 5, lost 0
 * - W01 (FIFO + Base-Stock): sold 5, waste 5, lost 5
 * - W11 (FEFO + Base-Stock): sold 10, waste 0, lost 0
 * Interaction: 0 - 5 - 5 + 5 = -5!
 */
export function getInteractionProbeScenario(): ScenarioConfig {
  const sku = CATALOG_SKUS[0];

  const openingBatches: Batch[] = [
    {
      id: 'A',
      skuId: sku.id,
      receivedDay: -2,
      expiryDayExclusive: 4,
      initialUnits: 5,
      remainingUnits: 5
    },
    {
      id: 'B',
      skuId: sku.id,
      receivedDay: -1,
      expiryDayExclusive: 1,
      initialUnits: 5,
      remainingUnits: 5
    }
  ];

  const dailyDemands: DailyDemand[] = [
    { day: 0, skuId: sku.id, requestedUnits: 5 },
    { day: 1, skuId: sku.id, requestedUnits: 5 },
    { day: 2, skuId: sku.id, requestedUnits: 0 },
    { day: 3, skuId: sku.id, requestedUnits: 0 },
    { day: 4, skuId: sku.id, requestedUnits: 0 }
  ];

  // In fixed world: delivery arrives Day 1 with 5 units, shelf life 2 (expires day 3)
  const scheduledDeliveries: PurchaseOrder[] = [
    {
      id: 'fixed-only-C',
      placedDay: 0,
      arrivalDay: 1,
      quantity: 5,
      shelfLifeOnArrivalDays: 2 // arrives day 1, expires day 3
    }
  ];

  return {
    seed: 101,
    horizonDays: 5,
    sku,
    openingBatches,
    dailyDemands,
    scheduledDeliveries,
    fixedOrderQuantity: 0, // Scheduled delivery already in scheduledDeliveries
    baseStockTarget: 5,    // Models day-0 base-stock decision when onHand equals target 5
    packSizeMultiple: 5,
    leadTimeDays: 10,      // Orders placed during horizon arrive after horizon end
    shelfLifeOnArrivalDays: 2,
    safetyUnits: 0
  };
}

/**
 * Generates a realistic 60-day synthetic scenario with exogenous demand and lead times
 */
export function generateScenario(
  skuId: string = 'sku-sourdough',
  seed: number = 101,
  horizonDays: number = 60
): ScenarioConfig {
  const sku = CATALOG_SKUS.find(s => s.id === skuId) || CATALOG_SKUS[0];
  const prng = createPRNG(seed);

  // 1. Opening Batches on Day 0
  const openingBatches: Batch[] = [
    {
      id: `batch-open-1`,
      skuId: sku.id,
      receivedDay: -2,
      expiryDayExclusive: Math.max(1, sku.defaultShelfLifeDays - 1),
      initialUnits: Math.floor(sku.defaultDailyDemand * 0.8),
      remainingUnits: Math.floor(sku.defaultDailyDemand * 0.8)
    },
    {
      id: `batch-open-2`,
      skuId: sku.id,
      receivedDay: -1,
      expiryDayExclusive: sku.defaultShelfLifeDays,
      initialUnits: Math.floor(sku.defaultDailyDemand * 1.2),
      remainingUnits: Math.floor(sku.defaultDailyDemand * 1.2)
    }
  ];

  // 2. Generate Exogenous Daily Demands (60 days)
  const dailyDemands: DailyDemand[] = [];
  for (let day = 0; day < horizonDays; day++) {
    // Day of week seasonality: day 5 & 6 (weekend) are 30% lower in a campus food counter
    const dayOfWeek = day % 7;
    const seasonality = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.7 : 1.1;

    // Normal-ish variance around default demand
    const noise = (prng() + prng() + prng() - 1.5) * 0.4; // [-0.6, +0.6]
    const mean = sku.defaultDailyDemand * seasonality;
    const requestedUnits = Math.max(0, Math.round(mean * (1 + noise)));

    dailyDemands.push({
      day,
      skuId: sku.id,
      requestedUnits
    });
  }

  // Pack size multiple: e.g. 5 units
  const packSizeMultiple = 5;
  const leadTimeDays = 1;
  const shelfLifeOnArrivalDays = sku.defaultShelfLifeDays;
  const fixedOrderQuantity = Math.round(sku.defaultDailyDemand / packSizeMultiple) * packSizeMultiple;
  const baseStockTarget = Math.round((sku.defaultDailyDemand * (leadTimeDays + 1) + 5) / packSizeMultiple) * packSizeMultiple;

  return {
    seed,
    horizonDays,
    sku,
    openingBatches,
    dailyDemands,
    scheduledDeliveries: [],
    fixedOrderQuantity,
    baseStockTarget,
    packSizeMultiple,
    leadTimeDays,
    shelfLifeOnArrivalDays,
    safetyUnits: 5
  };
}
