import type {
  ScenarioConfig,
  IssuingPolicy,
  OrderingPolicy,
  Batch,
  PurchaseOrder,
  DailyStepReceipt,
  SimulationResult,
  FourWorldAnalysis,
  BatchIssueRecord,
  BatchPurgeRecord
} from '../domain/types.ts';

/**
 * Simulates a single world under declared issuing and ordering policies
 */
export function simulateWorld(
  scenario: ScenarioConfig,
  issuingPolicy: IssuingPolicy,
  orderingPolicy: OrderingPolicy,
  worldId: 'W00' | 'W10' | 'W01' | 'W11' | 'CUSTOM' = 'CUSTOM',
  worldLabel = 'Custom Policy Run'
): SimulationResult {
  const { sku, horizonDays, packSizeMultiple, leadTimeDays, shelfLifeOnArrivalDays } = scenario;

  // Deep clone initial opening batches
  const allBatches: Batch[] = scenario.openingBatches.map(b => ({ ...b }));
  let activeBatches: Batch[] = allBatches.filter(b => b.remainingUnits > 0);

  // Pipeline orders: pre-scheduled plus newly placed
  const pipelineOrders: PurchaseOrder[] = scenario.scheduledDeliveries
    .filter(po => !po.id.startsWith('fixed-only') || orderingPolicy === 'FIXED')
    .map(po => ({ ...po }));

  const dailyReceipts: DailyStepReceipt[] = [];
  const initialOpeningUnits = activeBatches.reduce((acc, b) => acc + b.remainingUnits, 0);

  let totalSoldUnits = 0;
  let totalWasteUnits = 0;
  let totalLostUnits = 0;
  let totalRequestedUnits = 0;
  let totalAcceptedUnits = 0;
  let totalRejectedUnits = 0;
  let totalRevenuePaise = 0;
  let totalProcurementPaise = 0;
  let totalHoldingPaise = 0;
  let totalDisposalPaise = 0;
  let totalLostPenaltyPaise = 0;

  for (let day = 0; day < horizonDays; day++) {
    const openingUnits = activeBatches.reduce((acc, b) => acc + b.remainingUnits, 0);

    // 1. Morning Expiry Purge: batches with expiryDayExclusive <= day expire
    let expiredUnitsPurged = 0;
    const batchesPurged: BatchPurgeRecord[] = [];

    for (const b of activeBatches) {
      if (b.expiryDayExclusive <= day && b.remainingUnits > 0) {
        expiredUnitsPurged += b.remainingUnits;
        batchesPurged.push({
          batchId: b.id,
          expiredUnits: b.remainingUnits,
          expiryDayExclusive: b.expiryDayExclusive
        });
        b.remainingUnits = 0;
      }
    }
    totalWasteUnits += expiredUnitsPurged;

    // Remove empty batches from active pool
    activeBatches = activeBatches.filter(b => b.remainingUnits > 0);

    // 2. Scheduled Deliveries Arrival for today
    let deliveredUnitsAccepted = 0;
    let deliveredUnitsRejected = 0;

    const arrivingOrders = pipelineOrders.filter(po => po.arrivalDay === day);
    for (const po of arrivingOrders) {
      if (po.shelfLifeOnArrivalDays <= 0 || po.arrivalDay + po.shelfLifeOnArrivalDays <= day) {
        // Already expired or invalid shelf life on receipt
        deliveredUnitsRejected += po.quantity;
      } else {
        deliveredUnitsAccepted += po.quantity;
        const newBatch: Batch = {
          id: `batch-${worldId}-d${day}-${po.id}`,
          skuId: sku.id,
          receivedDay: day,
          expiryDayExclusive: day + po.shelfLifeOnArrivalDays,
          initialUnits: po.quantity,
          remainingUnits: po.quantity
        };
        allBatches.push(newBatch);
        activeBatches.push(newBatch);
      }
    }
    totalAcceptedUnits += deliveredUnitsAccepted;
    totalRejectedUnits += deliveredUnitsRejected;

    // 3. Observe Demand & Fulfill
    const demandRecord = scenario.dailyDemands.find(d => d.day === day);
    const demandRequested = demandRecord ? demandRecord.requestedUnits : 0;
    totalRequestedUnits += demandRequested;

    let demandFulfilled = 0;
    let demandLost = 0;
    let remainingDemandToFulfill = demandRequested;
    const batchesIssued: BatchIssueRecord[] = [];

    // Sort active batches according to issuing policy
    if (issuingPolicy === 'FIFO') {
      activeBatches.sort((a, b) => {
        if (a.receivedDay !== b.receivedDay) return a.receivedDay - b.receivedDay;
        return a.id.localeCompare(b.id);
      });
    } else {
      // FEFO
      activeBatches.sort((a, b) => {
        if (a.expiryDayExclusive !== b.expiryDayExclusive) return a.expiryDayExclusive - b.expiryDayExclusive;
        return a.id.localeCompare(b.id);
      });
    }

    for (const batch of activeBatches) {
      if (remainingDemandToFulfill <= 0) break;
      if (batch.remainingUnits <= 0) continue;

      const issueQty = Math.min(remainingDemandToFulfill, batch.remainingUnits);
      batch.remainingUnits -= issueQty;
      remainingDemandToFulfill -= issueQty;
      demandFulfilled += issueQty;

      batchesIssued.push({
        batchId: batch.id,
        unitsIssued: issueQty,
        expiryDayExclusive: batch.expiryDayExclusive
      });
    }

    demandLost = remainingDemandToFulfill;
    totalSoldUnits += demandFulfilled;
    totalLostUnits += demandLost;

    // Prune active batches that reached 0
    activeBatches = activeBatches.filter(b => b.remainingUnits > 0);

    // 4. Closing Inventory & Cost Accruals
    const closingUnits = activeBatches.reduce((acc, b) => acc + b.remainingUnits, 0);

    const procurementPaise = deliveredUnitsAccepted * sku.unitCostPaise;
    const holdingPaise = closingUnits * sku.holdingCostPaisePerDay;
    const disposalPaise = expiredUnitsPurged * sku.disposalCostPaise;
    const lostPenaltyPaise = demandLost * sku.lostUnitPenaltyPaise;
    const revenuePaise = demandFulfilled * sku.sellingPricePaise;
    const dailyTotalCostPaise = procurementPaise + holdingPaise + disposalPaise + lostPenaltyPaise;

    totalProcurementPaise += procurementPaise;
    totalHoldingPaise += holdingPaise;
    totalDisposalPaise += disposalPaise;
    totalLostPenaltyPaise += lostPenaltyPaise;
    totalRevenuePaise += revenuePaise;

    // 5. Replenishment Ordering Decision
    let orderPlaced: PurchaseOrder | null = null;
    let pipelineOnOrderUnits = 0;

    // Pipeline inventory: on hand + currently in-flight orders arriving after today
    const inFlightOrders = pipelineOrders.filter(po => po.arrivalDay > day);
    pipelineOnOrderUnits = inFlightOrders.reduce((acc, po) => acc + po.quantity, 0);

    if (day + leadTimeDays < horizonDays) {
      if (orderingPolicy === 'FIXED') {
        if (scenario.fixedOrderQuantity > 0) {
          orderPlaced = {
            id: `po-${worldId}-d${day}`,
            placedDay: day,
            arrivalDay: day + leadTimeDays,
            quantity: scenario.fixedOrderQuantity,
            shelfLifeOnArrivalDays
          };
          pipelineOrders.push(orderPlaced);
        }
      } else {
        // BASE_STOCK
        // Trailing 7-day observed demand up to today
        const startDay = Math.max(0, day - 6);
        let trailingDemandSum = 0;
        let trailingDaysCount = 0;
        for (let k = startDay; k <= day; k++) {
          const rec = scenario.dailyDemands.find(d => d.day === k);
          trailingDemandSum += rec ? rec.requestedUnits : 0;
          trailingDaysCount++;
        }
        const trailingDailyDemandEstimate = trailingDaysCount > 0 ? (trailingDemandSum / trailingDaysCount) : sku.defaultDailyDemand;

        const targetUnits = Math.round(trailingDailyDemandEstimate * (leadTimeDays + 1)) + scenario.safetyUnits;
        const netDeficit = targetUnits - (closingUnits + pipelineOnOrderUnits);

        if (netDeficit > 0) {
          const orderQty = Math.ceil(netDeficit / packSizeMultiple) * packSizeMultiple;
          orderPlaced = {
            id: `po-${worldId}-d${day}`,
            placedDay: day,
            arrivalDay: day + leadTimeDays,
            quantity: orderQty,
            shelfLifeOnArrivalDays
          };
          pipelineOrders.push(orderPlaced);
        }
      }
    }

    // Daily receipt record
    dailyReceipts.push({
      day,
      openingUnits,
      expiredUnitsPurged,
      deliveredUnitsAccepted,
      deliveredUnitsRejected,
      demandRequested,
      demandFulfilled,
      demandLost,
      closingUnits,
      batchesActive: activeBatches.map(b => ({
        batchId: b.id,
        remainingUnits: b.remainingUnits,
        expiryDayExclusive: b.expiryDayExclusive
      })),
      batchesPurged,
      batchesIssued,
      orderPlaced,
      pipelineOnOrderUnits,
      dailyCosts: {
        procurementPaise,
        holdingPaise,
        disposalPaise,
        lostPenaltyPaise,
        totalCostPaise: dailyTotalCostPaise,
        revenuePaise
      }
    });

    // Invariant Check at end of each day
    const dayBeginning = openingUnits + deliveredUnitsAccepted;
    const dayEnding = demandFulfilled + expiredUnitsPurged + closingUnits;
    if (dayBeginning !== dayEnding) {
      throw new Error(`Conservation violated on day ${day}: beginning ${dayBeginning} != ending ${dayEnding}`);
    }
  }

  const finalClosingUnits = activeBatches.reduce((acc, b) => acc + b.remainingUnits, 0);
  const totalCostPaise = totalProcurementPaise + totalHoldingPaise + totalDisposalPaise + totalLostPenaltyPaise;
  const netProfitPaise = totalRevenuePaise - totalCostPaise;

  const unitFillRate = totalRequestedUnits > 0 ? (totalSoldUnits / totalRequestedUnits) : 1;
  const totalInflow = initialOpeningUnits + totalAcceptedUnits;
  const wasteFraction = totalInflow > 0 ? (totalWasteUnits / totalInflow) : 0;

  return {
    worldId,
    worldLabel,
    issuingPolicy,
    orderingPolicy,
    totalSoldUnits,
    totalWasteUnits,
    totalLostUnits,
    totalRequestedUnits,
    totalAcceptedUnits,
    totalRejectedUnits,
    openingUnits: initialOpeningUnits,
    closingUnits: finalClosingUnits,
    totalRevenuePaise,
    totalCostPaise,
    netProfitPaise,
    unitFillRate: Number(unitFillRate.toFixed(4)),
    wasteFraction: Number(wasteFraction.toFixed(4)),
    dailyReceipts,
    allBatches
  };
}

/**
 * Runs the mandatory 4-World Factorial Policy Attribution analysis
 */
export function runFourWorldAnalysis(scenario: ScenarioConfig): FourWorldAnalysis {
  // World 00: FIFO + Fixed (Baseline)
  const W00 = simulateWorld(scenario, 'FIFO', 'FIXED', 'W00', 'World 00 (FIFO + Fixed Order)');

  // World 10: FEFO + Fixed
  const W10 = simulateWorld(scenario, 'FEFO', 'FIXED', 'W10', 'World 10 (FEFO + Fixed Order)');

  // World 01: FIFO + Base-Stock
  const W01 = simulateWorld(scenario, 'FIFO', 'BASE_STOCK', 'W01', 'World 01 (FIFO + Base-Stock Order)');

  // World 11: FEFO + Base-Stock
  const W11 = simulateWorld(scenario, 'FEFO', 'BASE_STOCK', 'W11', 'World 11 (FEFO + Base-Stock Order)');

  // Factorial calculations on Waste Units
  const issuingContrast = W10.totalWasteUnits - W00.totalWasteUnits;
  const orderingContrast = W01.totalWasteUnits - W00.totalWasteUnits;
  const interaction = W11.totalWasteUnits - W10.totalWasteUnits - W01.totalWasteUnits + W00.totalWasteUnits;
  const jointDifference = W11.totalWasteUnits - W00.totalWasteUnits;
  const issuingUnderChangedOrdering = W11.totalWasteUnits - W01.totalWasteUnits;

  // Invariant verification: issuingContrast + orderingContrast + interaction == jointDifference
  const balancePreserved = (issuingContrast + orderingContrast + interaction) === jointDifference;

  return {
    W00,
    W10,
    W01,
    W11,
    issuingContrast,
    orderingContrast,
    interaction,
    jointDifference,
    issuingUnderChangedOrdering,
    balancePreserved
  };
}
