export type IssuingPolicy = 'FIFO' | 'FEFO';

export type OrderingPolicy = 'FIXED' | 'BASE_STOCK';

export interface SKU {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly unitCostPaise: number;          // e.g. ₹40.00 = 4000 paise
  readonly sellingPricePaise: number;       // e.g. ₹75.00 = 7500 paise
  readonly holdingCostPaisePerDay: number; // e.g. ₹1.00 = 100 paise
  readonly disposalCostPaise: number;      // e.g. ₹5.00 = 500 paise
  readonly lostUnitPenaltyPaise: number;   // e.g. ₹15.00 = 1500 paise
  readonly defaultShelfLifeDays: number;
  readonly defaultDailyDemand: number;
}

export interface Batch {
  readonly id: string;
  readonly skuId: string;
  readonly receivedDay: number;
  readonly expiryDayExclusive: number;
  readonly initialUnits: number;
  remainingUnits: number;
}

export interface PurchaseOrder {
  readonly id: string;
  readonly placedDay: number;
  readonly arrivalDay: number;
  readonly quantity: number;
  readonly shelfLifeOnArrivalDays: number;
}

export interface DailyDemand {
  readonly day: number;
  readonly skuId: string;
  readonly requestedUnits: number;
}

export interface BatchIssueRecord {
  readonly batchId: string;
  readonly unitsIssued: number;
  readonly expiryDayExclusive: number;
}

export interface BatchPurgeRecord {
  readonly batchId: string;
  readonly expiredUnits: number;
  readonly expiryDayExclusive: number;
}

export interface DailyStepReceipt {
  readonly day: number;
  readonly openingUnits: number;
  readonly expiredUnitsPurged: number;
  readonly deliveredUnitsAccepted: number;
  readonly deliveredUnitsRejected: number;
  readonly demandRequested: number;
  readonly demandFulfilled: number;
  readonly demandLost: number;
  readonly closingUnits: number;
  readonly batchesActive: { batchId: string; remainingUnits: number; expiryDayExclusive: number }[];
  readonly batchesPurged: BatchPurgeRecord[];
  readonly batchesIssued: BatchIssueRecord[];
  readonly orderPlaced: PurchaseOrder | null;
  readonly pipelineOnOrderUnits: number;
  readonly dailyCosts: {
    readonly procurementPaise: number;
    readonly holdingPaise: number;
    readonly disposalPaise: number;
    readonly lostPenaltyPaise: number;
    readonly totalCostPaise: number;
    readonly revenuePaise: number;
  };
}

export interface SimulationResult {
  readonly worldId: 'W00' | 'W10' | 'W01' | 'W11' | 'CUSTOM';
  readonly worldLabel: string;
  readonly issuingPolicy: IssuingPolicy;
  readonly orderingPolicy: OrderingPolicy;
  readonly totalSoldUnits: number;
  readonly totalWasteUnits: number;
  readonly totalLostUnits: number;
  readonly totalRequestedUnits: number;
  readonly totalAcceptedUnits: number;
  readonly totalRejectedUnits: number;
  readonly openingUnits: number;
  readonly closingUnits: number;
  readonly totalRevenuePaise: number;
  readonly totalCostPaise: number;
  readonly netProfitPaise: number;
  readonly unitFillRate: number;    // fulfilled / requested
  readonly wasteFraction: number;   // waste / (opening + accepted)
  readonly dailyReceipts: DailyStepReceipt[];
  readonly allBatches: Batch[];
}

export interface FourWorldAnalysis {
  readonly W00: SimulationResult; // FIFO + Fixed
  readonly W10: SimulationResult; // FEFO + Fixed
  readonly W01: SimulationResult; // FIFO + Base-Stock
  readonly W11: SimulationResult; // FEFO + Base-Stock
  readonly issuingContrast: number;              // W10 - W00
  readonly orderingContrast: number;             // W01 - W00
  readonly interaction: number;                  // W11 - W10 - W01 + W00
  readonly jointDifference: number;              // W11 - W00
  readonly issuingUnderChangedOrdering: number;  // W11 - W01
  readonly balancePreserved: boolean;
}

export interface ScenarioConfig {
  readonly seed: number;
  readonly horizonDays: number;
  readonly sku: SKU;
  readonly openingBatches: Batch[];
  readonly dailyDemands: DailyDemand[];
  readonly scheduledDeliveries: PurchaseOrder[];
  readonly fixedOrderQuantity: number;
  readonly baseStockTarget: number;
  readonly packSizeMultiple: number;
  readonly leadTimeDays: number;
  readonly shelfLifeOnArrivalDays: number;
  readonly safetyUnits: number;
}
